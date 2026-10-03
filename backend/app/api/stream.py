import json
import time
import cv2
import numpy as np
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.models.schemas import LiveFrameRequest, SelectedLayerItem
from app.services.image_processor import decode_base64_to_cv2, encode_cv2_to_base64
from app.services.face_mesh_service import face_mesh_service
from app.services.pose_service import pose_service
from app.services.segmentation_service import segmentation_service
from app.services.catalog_service import catalog_service
from app.services.layer_compositor import layer_compositor

router = APIRouter(prefix="/stream", tags=["Live Mirror Stream"])

def _normalize_stream_items(request: LiveFrameRequest) -> List[SelectedLayerItem]:
    if request.items and len(request.items) > 0:
        return list(request.items)

    items: List[SelectedLayerItem] = []
    if request.garment_id and request.garment_id != "none":
        cat_item = catalog_service.get_item(request.garment_id)
        layer_type = cat_item.layer_type if cat_item else "base_top"
        items.append(SelectedLayerItem(
            id=request.garment_id,
            layer_type=layer_type,
            adjust_scale=request.adjust_scale,
            adjust_offset_x=request.adjust_offset_x,
            adjust_offset_y=request.adjust_offset_y
        ))

    if request.glasses_id and request.glasses_id != "none":
        items.append(SelectedLayerItem(
            id=request.glasses_id,
            layer_type="eyewear",
            adjust_scale=request.adjust_scale,
            adjust_offset_x=request.adjust_offset_x,
            adjust_offset_y=request.adjust_offset_y
        ))

    return items

@router.post("/frame")
async def process_live_frame(request: LiveFrameRequest):
    """HTTP endpoint for live video processing with multi-layer stack support."""
    start_time = time.time()
    try:
        frame = decode_base64_to_cv2(request.frame_base64)
        if frame.ndim == 2:
            frame = cv2.cvtColor(frame, cv2.COLOR_GRAY2BGR)
        elif frame.shape[2] == 4:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
            
        result_frame = frame.copy()
        
        # 1. Background replacement if requested
        if request.background_id and request.background_id != "none":
            bg_img = catalog_service.load_background_image(request.background_id)
            if bg_img is not None:
                result_frame = segmentation_service.replace_background(result_frame, bg_img)

        # 2. Extract fast landmarks (streaming mode)
        face_landmarks = face_mesh_service.extract_landmarks(result_frame, is_static=False)
        pose_landmarks = pose_service.extract_landmarks(result_frame, is_static=False)
        
        # 3. Layer stacking
        items = _normalize_stream_items(request)
        if items:
            try:
                sorted_layer_items, _ = layer_compositor.validate_and_sort_layers(items)
                result_frame, _ = layer_compositor.composite_layers(
                    base_image=result_frame,
                    layer_items=sorted_layer_items,
                    face_landmarks=face_landmarks,
                    pose_landmarks=pose_landmarks,
                    global_scale=request.adjust_scale,
                    global_offset_x=request.adjust_offset_x,
                    global_offset_y=request.adjust_offset_y
                )
            except Exception:
                pass

        output_b64 = encode_cv2_to_base64(result_frame, format=".jpg", quality=80)
        proc_time = (time.time() - start_time) * 1000.0
        
        return {
            "success": True,
            "frame_base64": output_b64,
            "face_detected": face_landmarks is not None,
            "pose_detected": pose_landmarks is not None,
            "latency_ms": round(proc_time, 1)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.websocket("/ws")
async def websocket_live_mirror(websocket: WebSocket):
    """High-throughput WebSocket connection for continuous real-time video stream."""
    await websocket.accept()
    try:
        while True:
            data_text = await websocket.receive_text()
            data = json.loads(data_text)
            
            frame_b64 = data.get("frame_base64")
            if not frame_b64:
                continue
                
            items_raw = data.get("items", [])
            glasses_id = data.get("glasses_id")
            garment_id = data.get("garment_id")
            bg_id = data.get("background_id")
            scale = float(data.get("adjust_scale", 1.0))
            offset_x = float(data.get("adjust_offset_x", 0.0))
            offset_y = float(data.get("adjust_offset_y", 0.0))
            
            start_t = time.time()
            frame = decode_base64_to_cv2(frame_b64)
            if frame.shape[2] == 4:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
                
            result_frame = frame.copy()
            
            if bg_id and bg_id != "none":
                bg_img = catalog_service.load_background_image(bg_id)
                if bg_img is not None:
                    result_frame = segmentation_service.replace_background(result_frame, bg_img)

            face_landmarks = face_mesh_service.extract_landmarks(result_frame, is_static=False)
            pose_landmarks = pose_service.extract_landmarks(result_frame, is_static=False)
            
            # Form items list
            items: List[SelectedLayerItem] = []
            if items_raw and len(items_raw) > 0:
                for it in items_raw:
                    items.append(SelectedLayerItem(**it))
            else:
                if garment_id and garment_id != "none":
                    cat_item = catalog_service.get_item(garment_id)
                    ltype = cat_item.layer_type if cat_item else "base_top"
                    items.append(SelectedLayerItem(id=garment_id, layer_type=ltype, adjust_scale=scale, adjust_offset_x=offset_x, adjust_offset_y=offset_y))
                if glasses_id and glasses_id != "none":
                    items.append(SelectedLayerItem(id=glasses_id, layer_type="eyewear", adjust_scale=scale, adjust_offset_x=offset_x, adjust_offset_y=offset_y))

            if items:
                try:
                    sorted_layer_items, _ = layer_compositor.validate_and_sort_layers(items)
                    result_frame, _ = layer_compositor.composite_layers(
                        base_image=result_frame,
                        layer_items=sorted_layer_items,
                        face_landmarks=face_landmarks,
                        pose_landmarks=pose_landmarks,
                        global_scale=scale,
                        global_offset_x=offset_x,
                        global_offset_y=offset_y
                    )
                except Exception:
                    pass

            out_b64 = encode_cv2_to_base64(result_frame, format=".jpg", quality=75)
            dt_ms = (time.time() - start_t) * 1000.0
            
            await websocket.send_text(json.dumps({
                "frame_base64": out_b64,
                "face_detected": face_landmarks is not None,
                "pose_detected": pose_landmarks is not None,
                "latency_ms": round(dt_ms, 1)
            }))
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_text(json.dumps({"error": str(e)}))
        except Exception:
            pass
