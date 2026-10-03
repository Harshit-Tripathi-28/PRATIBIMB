import cv2
import numpy as np
import math
from typing import List, Tuple, Dict, Any, Optional
from app.models.schemas import SelectedLayerItem, AppliedLayerInfo, CatalogItem
from app.services.catalog_service import catalog_service
from app.services.image_processor import rotate_image, overlay_transparent

class LayerCompositor:
    def __init__(self):
        # Strict layer ordering
        self.LAYER_PRIORITIES = {
            'base_top': 10,
            'outerwear': 20,
            'accessory': 30,
            'eyewear': 40,
            'headwear': 50,
        }

    def validate_and_sort_layers(self, items: List[SelectedLayerItem]) -> Tuple[List[Dict[str, Any]], List[str]]:
        """
        Validates layer compatibility rules:
        - Prevents multiple items of the same exclusive layer (e.g. multiple base tops or multiple eyewear).
        - Sorts items in ascending render priority (10 -> 50).
        """
        seen_layers: Dict[str, str] = {}
        validated_items: List[Dict[str, Any]] = []
        warnings: List[str] = []

        for sel in items:
            item_id = sel.id
            cat_item = catalog_service.get_item(item_id)
            
            # Determine layer type and order
            layer_type = sel.layer_type or (cat_item.layer_type if cat_item else 'base_top')
            layer_order = cat_item.layer_order if cat_item else self.LAYER_PRIORITIES.get(layer_type, 10)
            anchor_type = cat_item.anchor_type if cat_item else ('face_eyes' if layer_type == 'eyewear' else 'torso')
            scale_mult = cat_item.scale_multiplier if cat_item else 1.0
            collar_ratio = cat_item.collar_offset_ratio if cat_item else 0.12
            name = cat_item.name if cat_item else item_id

            # Rule: Only one item per layer slot (base_top, outerwear, eyewear, headwear, accessory)
            if layer_type in seen_layers:
                existing_id = seen_layers[layer_type]
                raise ValueError(
                    f"Conflict detected in layer '{layer_type}': Cannot stack '{item_id}' with already selected '{existing_id}'. "
                    f"Only one item per layer slot is supported at a time."
                )

            seen_layers[layer_type] = item_id
            validated_items.append({
                "selection": sel,
                "catalog_item": cat_item,
                "layer_type": layer_type,
                "layer_order": layer_order,
                "anchor_type": anchor_type,
                "scale_multiplier": scale_mult,
                "collar_offset_ratio": collar_ratio,
                "name": name,
            })

        # Sort strictly ascending by layer order (10 -> 20 -> 30 -> 40 -> 50)
        sorted_items = sorted(validated_items, key=lambda x: x["layer_order"])
        return sorted_items, warnings

    def composite_layers(
        self,
        base_image: np.ndarray,
        layer_items: List[Dict[str, Any]],
        face_landmarks: Optional[list],
        pose_landmarks: Optional[list],
        global_scale: float = 1.0,
        global_offset_x: float = 0.0,
        global_offset_y: float = 0.0
    ) -> Tuple[np.ndarray, List[AppliedLayerInfo]]:
        """
        Sequentially composites each layer with alpha transparency and geometric alignment.
        """
        result_img = base_image.copy()
        applied_layers: List[AppliedLayerInfo] = []

        for item_data in layer_items:
            sel: SelectedLayerItem = item_data["selection"]
            cat_item: Optional[CatalogItem] = item_data["catalog_item"]
            layer_type = item_data["layer_type"]
            layer_order = item_data["layer_order"]
            anchor_type = item_data["anchor_type"]
            name = item_data["name"]

            # Load garment / overlay image
            overlay_png = None
            if sel.custom_base64:
                from app.services.image_processor import decode_base64_to_cv2
                overlay_png = decode_base64_to_cv2(sel.custom_base64)
            elif cat_item:
                overlay_png = catalog_service.load_item_image(cat_item.id)

            if overlay_png is None:
                continue

            # Item-specific or global adjustments
            scale = (sel.adjust_scale or global_scale) * item_data["scale_multiplier"]
            off_x = (sel.adjust_offset_x if sel.adjust_offset_x is not None else global_offset_x)
            off_y = (sel.adjust_offset_y if sel.adjust_offset_y is not None else global_offset_y)

            # Route to anchor compositing strategy
            if anchor_type == "torso" or layer_type in ["base_top", "outerwear"]:
                result_img = self._apply_torso_layer(
                    result_img, overlay_png, pose_landmarks, face_landmarks,
                    scale_factor=scale,
                    offset_x=off_x,
                    offset_y=off_y,
                    collar_offset_ratio=item_data["collar_offset_ratio"]
                )
            elif anchor_type == "torso_neck" or layer_type == "accessory":
                result_img = self._apply_neck_accessory_layer(
                    result_img, overlay_png, pose_landmarks, face_landmarks,
                    scale_factor=scale,
                    offset_x=off_x,
                    offset_y=off_y,
                    collar_offset_ratio=item_data["collar_offset_ratio"]
                )
            elif anchor_type == "face_eyes" or layer_type == "eyewear":
                result_img = self._apply_eyewear_layer(
                    result_img, overlay_png, face_landmarks,
                    scale_factor=scale,
                    offset_x=off_x,
                    offset_y=off_y
                )
            elif anchor_type == "head_top" or layer_type == "headwear":
                result_img = self._apply_headwear_layer(
                    result_img, overlay_png, face_landmarks,
                    scale_factor=scale,
                    offset_x=off_x,
                    offset_y=off_y
                )

            applied_layers.append(AppliedLayerInfo(
                id=sel.id,
                name=name,
                layer_type=layer_type,
                layer_order=layer_order,
                anchor=anchor_type
            ))

        return result_img, applied_layers

    def _apply_torso_layer(
        self,
        image: np.ndarray,
        garment_png: np.ndarray,
        pose_landmarks: Optional[list],
        face_landmarks: Optional[list],
        scale_factor: float,
        offset_x: float,
        offset_y: float,
        collar_offset_ratio: float
    ) -> np.ndarray:
        """Applies base top or outerwear onto upper body landmarks with roll tilt."""
        h_img, w_img = image.shape[:2]

        if pose_landmarks and len(pose_landmarks) >= 25 and "x" in pose_landmarks[11] and "x" in pose_landmarks[12]:
            p_l_sh = pose_landmarks[11]
            p_r_sh = pose_landmarks[12]
            sh_center_x = (p_l_sh["x"] + p_r_sh["x"]) / 2.0
            sh_center_y = (p_l_sh["y"] + p_r_sh["y"]) / 2.0
            sh_dx = p_r_sh["x"] - p_l_sh["x"]
            sh_dy = p_r_sh["y"] - p_l_sh["y"]
            shoulder_width = math.hypot(sh_dx, sh_dy)
            angle_deg = math.degrees(math.atan2(sh_dy, sh_dx))
        elif face_landmarks and len(face_landmarks) >= 468:
            chin = face_landmarks[152]
            forehead = face_landmarks[10]
            face_h = abs(chin["y"] - forehead["y"])
            sh_center_x = chin["x"]
            sh_center_y = chin["y"] + (face_h * 0.35)
            shoulder_width = face_h * 2.2
            angle_deg = 0.0
        else:
            sh_center_x = w_img / 2.0
            sh_center_y = h_img * 0.45
            shoulder_width = w_img * 0.5
            angle_deg = 0.0

        if shoulder_width < 10:
            return image

        gh, gw = garment_png.shape[:2]
        garment_aspect = gh / float(gw)
        target_width = max(20, int(shoulder_width * scale_factor))
        target_height = max(20, int(target_width * garment_aspect))

        resized = cv2.resize(garment_png, (target_width, target_height), interpolation=cv2.INTER_AREA if target_width < gw else cv2.INTER_CUBIC)
        rotated = rotate_image(resized, -angle_deg)

        rot_h, rot_w = rotated.shape[:2]
        top_left_x = int(sh_center_x - (rot_w / 2.0) + offset_x)
        top_left_y = int(sh_center_y - (rot_h * collar_offset_ratio) + offset_y)

        return overlay_transparent(image, rotated, top_left_x, top_left_y)

    def _apply_neck_accessory_layer(
        self,
        image: np.ndarray,
        accessory_png: np.ndarray,
        pose_landmarks: Optional[list],
        face_landmarks: Optional[list],
        scale_factor: float,
        offset_x: float,
        offset_y: float,
        collar_offset_ratio: float
    ) -> np.ndarray:
        """Applies tie, necklace, or scarf draped directly from neck/collar knot."""
        h_img, w_img = image.shape[:2]

        if pose_landmarks and len(pose_landmarks) >= 25 and "x" in pose_landmarks[11] and "x" in pose_landmarks[12]:
            p_l_sh = pose_landmarks[11]
            p_r_sh = pose_landmarks[12]
            sh_center_x = (p_l_sh["x"] + p_r_sh["x"]) / 2.0
            sh_center_y = (p_l_sh["y"] + p_r_sh["y"]) / 2.0
            sh_dx = p_r_sh["x"] - p_l_sh["x"]
            sh_dy = p_r_sh["y"] - p_l_sh["y"]
            shoulder_width = math.hypot(sh_dx, sh_dy)
            angle_deg = math.degrees(math.atan2(sh_dy, sh_dx))
            anchor_x = sh_center_x
            anchor_y = sh_center_y - (shoulder_width * 0.04)
        elif face_landmarks and len(face_landmarks) >= 468:
            chin = face_landmarks[152]
            forehead = face_landmarks[10]
            face_h = abs(chin["y"] - forehead["y"])
            anchor_x = chin["x"]
            anchor_y = chin["y"] + (face_h * 0.15)
            shoulder_width = face_h * 2.2
            angle_deg = 0.0
        else:
            anchor_x = w_img / 2.0
            anchor_y = h_img * 0.40
            shoulder_width = w_img * 0.4
            angle_deg = 0.0

        gh, gw = accessory_png.shape[:2]
        aspect_ratio = gh / float(gw)
        target_width = max(10, int(shoulder_width * scale_factor))
        target_height = max(10, int(target_width * aspect_ratio))

        resized = cv2.resize(accessory_png, (target_width, target_height), interpolation=cv2.INTER_AREA if target_width < gw else cv2.INTER_CUBIC)
        rotated = rotate_image(resized, -angle_deg)

        rot_h, rot_w = rotated.shape[:2]
        top_left_x = int(anchor_x - (rot_w / 2.0) + offset_x)
        top_left_y = int(anchor_y + offset_y)

        return overlay_transparent(image, rotated, top_left_x, top_left_y)

    def _apply_eyewear_layer(
        self,
        image: np.ndarray,
        glasses_png: np.ndarray,
        face_landmarks: Optional[list],
        scale_factor: float,
        offset_x: float,
        offset_y: float
    ) -> np.ndarray:
        """Applies eyewear positioned on nose bridge and rotated to eye roll angle."""
        if not face_landmarks or len(face_landmarks) < 468:
            return image

        p_left_temple = face_landmarks[234]
        p_right_temple = face_landmarks[454]
        p_nose_bridge = face_landmarks[168]

        temple_dx = p_right_temple["x"] - p_left_temple["x"]
        temple_dy = p_right_temple["y"] - p_left_temple["y"]
        angle_deg = math.degrees(math.atan2(temple_dy, temple_dx))
        face_width = math.hypot(temple_dx, temple_dy)

        target_width = max(10, int(face_width * scale_factor))
        gh, gw = glasses_png.shape[:2]
        aspect_ratio = gh / float(gw)
        target_height = max(5, int(target_width * aspect_ratio))

        resized = cv2.resize(glasses_png, (target_width, target_height), interpolation=cv2.INTER_AREA if target_width < gw else cv2.INTER_CUBIC)
        rotated = rotate_image(resized, -angle_deg)

        center_x = p_nose_bridge["x"] + offset_x
        center_y = p_nose_bridge["y"] + offset_y
        rot_h, rot_w = rotated.shape[:2]
        top_left_x = int(center_x - (rot_w / 2.0))
        top_left_y = int(center_y - (rot_h / 2.0))

        return overlay_transparent(image, rotated, top_left_x, top_left_y)

    def _apply_headwear_layer(
        self,
        image: np.ndarray,
        headwear_png: np.ndarray,
        face_landmarks: Optional[list],
        scale_factor: float,
        offset_x: float,
        offset_y: float
    ) -> np.ndarray:
        """Applies hat or headwear anchored at forehead / crown top."""
        if not face_landmarks or len(face_landmarks) < 468:
            return image

        p_forehead = face_landmarks[10]
        p_chin = face_landmarks[152]
        p_left_temple = face_landmarks[234]
        p_right_temple = face_landmarks[454]

        temple_dx = p_right_temple["x"] - p_left_temple["x"]
        temple_dy = p_right_temple["y"] - p_left_temple["y"]
        angle_deg = math.degrees(math.atan2(temple_dy, temple_dx))
        face_width = math.hypot(temple_dx, temple_dy)

        target_width = max(15, int(face_width * scale_factor * 1.35))
        gh, gw = headwear_png.shape[:2]
        aspect_ratio = gh / float(gw)
        target_height = max(10, int(target_width * aspect_ratio))

        resized = cv2.resize(headwear_png, (target_width, target_height), interpolation=cv2.INTER_AREA if target_width < gw else cv2.INTER_CUBIC)
        rotated = rotate_image(resized, -angle_deg)

        rot_h, rot_w = rotated.shape[:2]
        # Hat brim sits right at the forehead top (landmark 10)
        center_x = p_forehead["x"] + offset_x
        anchor_y = p_forehead["y"] + offset_y
        top_left_x = int(center_x - (rot_w / 2.0))
        top_left_y = int(anchor_y - (rot_h * 0.70))

        return overlay_transparent(image, rotated, top_left_x, top_left_y)

layer_compositor = LayerCompositor()
