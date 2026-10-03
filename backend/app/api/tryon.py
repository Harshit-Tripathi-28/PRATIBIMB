import time
import os
import cv2
import numpy as np
from typing import List
from fastapi import APIRouter, HTTPException
from app.config import settings
from app.models.schemas import TryOnRequest, TryOnResponse, SelectedLayerItem
from app.services.image_processor import decode_base64_to_cv2, encode_cv2_to_base64
from app.services.face_mesh_service import face_mesh_service
from app.services.pose_service import pose_service
from app.services.segmentation_service import segmentation_service
from app.services.biometric_service import biometric_service
from app.services.catalog_service import catalog_service
from app.services.layer_compositor import layer_compositor

router = APIRouter(prefix="/tryon", tags=["Try-On Engine"])

def _normalize_request_items(request: TryOnRequest) -> List[SelectedLayerItem]:
    """
    Normalizes multi-layer items and backward-compatible legacy fields into unified SelectedLayerItem list.
    """
    items: List[SelectedLayerItem] = []

    if request.items and len(request.items) > 0:
        return list(request.items)

    # Backward compatibility: Garment
    if request.custom_garment_base64:
        items.append(SelectedLayerItem(
            id="custom-garment",
            layer_type="base_top",
            custom_base64=request.custom_garment_base64,
            adjust_scale=request.adjust_scale,
            adjust_offset_x=request.adjust_offset_x,
            adjust_offset_y=request.adjust_offset_y
        ))
    elif request.garment_id and request.garment_id != "none":
        cat_item = catalog_service.get_item(request.garment_id)
        layer_type = cat_item.layer_type if cat_item else "base_top"
        items.append(SelectedLayerItem(
            id=request.garment_id,
            layer_type=layer_type,
            adjust_scale=request.adjust_scale,
            adjust_offset_x=request.adjust_offset_x,
            adjust_offset_y=request.adjust_offset_y
        ))

    # Backward compatibility: Glasses
    if request.custom_glasses_base64:
        items.append(SelectedLayerItem(
            id="custom-glasses",
            layer_type="eyewear",
            custom_base64=request.custom_glasses_base64,
            adjust_scale=request.adjust_scale,
            adjust_offset_x=request.adjust_offset_x,
            adjust_offset_y=request.adjust_offset_y
        ))
    elif request.glasses_id and request.glasses_id != "none":
        items.append(SelectedLayerItem(
            id=request.glasses_id,
            layer_type="eyewear",
            adjust_scale=request.adjust_scale,
            adjust_offset_x=request.adjust_offset_x,
            adjust_offset_y=request.adjust_offset_y
        ))

    return items

@router.post("/process", response_model=TryOnResponse)
async def process_tryon(request: TryOnRequest):
    start_time = time.time()
    try:
        # 1. Load User Image
        if request.user_image_base64:
            user_image = decode_base64_to_cv2(request.user_image_base64)
        elif request.sample_id:
            sample_path = os.path.join(settings.SAMPLES_DIR, f"{request.sample_id}.jpeg")
            if not os.path.exists(sample_path):
                sample_path = os.path.join(settings.SAMPLES_DIR, f"{request.sample_id}.jpg")
            if not os.path.exists(sample_path):
                sample_path = os.path.join(settings.SAMPLES_DIR, f"{request.sample_id}.png")
            if not os.path.exists(sample_path):
                raise HTTPException(status_code=404, detail=f"Sample '{request.sample_id}' not found")
            user_image = cv2.imread(sample_path)
        else:
            samples = catalog_service.get_sample_images()
            if samples:
                user_image = cv2.imread(samples[0]["file_path"])
            else:
                raise HTTPException(status_code=400, detail="No user image or sample provided")

        if user_image is None:
            raise HTTPException(status_code=400, detail="Failed to load input image")

        # Normalize channel dimensions
        if user_image.ndim == 2:
            user_image = cv2.cvtColor(user_image, cv2.COLOR_GRAY2BGR)
        elif user_image.shape[2] == 4:
            user_image = cv2.cvtColor(user_image, cv2.COLOR_BGRA2BGR)

        # Scale down large images for responsive inference while preserving high resolution
        max_dim = 1280
        h, w = user_image.shape[:2]
        if max(h, w) > max_dim:
            scale = max_dim / float(max(h, w))
            user_image = cv2.resize(user_image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        result_image = user_image.copy()

        # 2. Extract Landmarks (Static mode for high accuracy)
        face_landmarks = face_mesh_service.extract_landmarks(result_image, is_static=True)
        pose_landmarks = pose_service.extract_landmarks(result_image, is_static=True)
        
        face_detected = face_landmarks is not None
        pose_detected = pose_landmarks is not None

        # 3. Apply Background Replacement if requested
        if request.background_id and request.background_id != "none":
            bg_img = catalog_service.load_background_image(request.background_id)
            if bg_img is not None:
                result_image = segmentation_service.replace_background(result_image, bg_img)

        # 4. Multi-Layer Validation & Ordering
        items_to_apply = _normalize_request_items(request)
        try:
            sorted_layer_items, validation_warnings = layer_compositor.validate_and_sort_layers(items_to_apply)
        except ValueError as val_err:
            raise HTTPException(status_code=400, detail=str(val_err))

        # 5. Composite All Layers in Priority Order
        result_image, applied_layers = layer_compositor.composite_layers(
            base_image=result_image,
            layer_items=sorted_layer_items,
            face_landmarks=face_landmarks,
            pose_landmarks=pose_landmarks,
            global_scale=request.adjust_scale,
            global_offset_x=request.adjust_offset_x,
            global_offset_y=request.adjust_offset_y
        )

        # 6. Optional Landmark Visualizer
        if request.draw_landmarks:
            if face_detected:
                result_image = face_mesh_service.draw_face_landmarks(result_image, face_landmarks)
            if pose_detected:
                result_image = pose_service.draw_pose_landmarks(result_image, pose_landmarks)

        # 7. Biometric Analysis
        biometrics = biometric_service.analyze(user_image, face_landmarks, pose_landmarks)

        # 8. Encode Result
        output_base64 = encode_cv2_to_base64(result_image, format=".jpg", quality=92)
        processing_time = (time.time() - start_time) * 1000.0

        applied_dict = {layer.layer_type: layer.id for layer in applied_layers}
        if request.background_id and request.background_id != "none":
            applied_dict["background"] = request.background_id

        return TryOnResponse(
            success=True,
            result_image_base64=output_base64,
            face_mesh_detected=face_detected,
            pose_detected=pose_detected,
            processing_time_ms=round(processing_time, 2),
            biometrics=biometrics,
            applied_items=applied_dict,
            applied_layers=applied_layers,
            validation_warnings=validation_warnings
        )

    except HTTPException:
        raise
    except Exception as e:
        processing_time = (time.time() - start_time) * 1000.0
        return TryOnResponse(
            success=False,
            result_image_base64="",
            processing_time_ms=round(processing_time, 2),
            error=str(e)
        )
