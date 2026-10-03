import cv2
import numpy as np
import base64
import io
from PIL import Image

def decode_base64_to_cv2(base64_string: str) -> np.ndarray:
    """Decodes a base64 encoded image string (with or without data URL prefix) to an OpenCV BGR/BGRA image."""
    if not base64_string:
        raise ValueError("Empty image string provided")
    
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    
    image_bytes = base64.b64decode(base64_string)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_UNCHANGED)
    if image is None:
        raise ValueError("Could not decode image from base64 data")
    return image

def encode_cv2_to_base64(image: np.ndarray, format: str = ".jpg", quality: int = 90) -> str:
    """Encodes an OpenCV image to base64 jpeg/png data URL."""
    if format.lower() in [".jpg", ".jpeg"]:
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        success, buffer = cv2.imencode(".jpg", image, encode_param)
        mime = "image/jpeg"
    else:
        encode_param = [int(cv2.IMWRITE_PNG_COMPRESSION), 3]
        success, buffer = cv2.imencode(".png", image, encode_param)
        mime = "image/png"
        
    if not success:
        raise ValueError("Failed to encode image to base64")
    
    encoded = base64.b64encode(buffer).decode("utf-8")
    return f"data:{mime};base64,{encoded}"

def overlay_transparent(background: np.ndarray, overlay: np.ndarray, x: int, y: int, overlay_size=None) -> np.ndarray:
    """
    Overlays a 4-channel BGRA image onto a 3-channel BGR background at (x, y) coordinates with alpha blending.
    x, y is the top-left coordinate of the overlay.
    """
    bg = background.copy()
    bg_h, bg_w = bg.shape[:2]
    
    if overlay is None or overlay.size == 0:
        return bg
        
    if overlay_size is not None:
        new_w, new_h = max(1, int(overlay_size[0])), max(1, int(overlay_size[1]))
        overlay = cv2.resize(overlay, (new_w, new_h), interpolation=cv2.INTER_AREA if new_w < overlay.shape[1] else cv2.INTER_CUBIC)
        
    ov_h, ov_w = overlay.shape[:2]
    
    # Boundary clipping
    x1, y1 = max(0, x), max(0, y)
    x2, y2 = min(bg_w, x + ov_w), min(bg_h, y + ov_h)
    
    if x1 >= x2 or y1 >= y2:
        return bg
        
    # Corresponding overlay coordinates
    ov_x1 = x1 - x
    ov_y1 = y1 - y
    ov_x2 = ov_x1 + (x2 - x1)
    ov_y2 = ov_y1 + (y2 - y1)
    
    overlay_crop = overlay[ov_y1:ov_y2, ov_x1:ov_x2]
    
    if overlay_crop.shape[2] == 4:
        alpha = (overlay_crop[:, :, 3] / 255.0)[:, :, np.newaxis]
        overlay_rgb = overlay_crop[:, :, :3]
        bg_crop = bg[y1:y2, x1:x2]
        
        # Smooth alpha blending
        blended = (alpha * overlay_rgb + (1.0 - alpha) * bg_crop).astype(np.uint8)
        bg[y1:y2, x1:x2] = blended
    else:
        bg[y1:y2, x1:x2] = overlay_crop[:, :, :3]
        
    return bg

def rotate_image(image: np.ndarray, angle_degrees: float) -> np.ndarray:
    """Rotates a BGRA/BGR image around its center without clipping."""
    h, w = image.shape[:2]
    center = (w / 2.0, h / 2.0)
    
    matrix = cv2.getRotationMatrix2D(center, angle_degrees, 1.0)
    cos = np.abs(matrix[0, 0])
    sin = np.abs(matrix[0, 1])
    
    new_w = int((h * sin) + (w * cos))
    new_h = int((h * cos) + (w * sin))
    
    matrix[0, 2] += (new_w / 2.0) - center[0]
    matrix[1, 2] += (new_h / 2.0) - center[1]
    
    border_mode = cv2.BORDER_CONSTANT
    border_val = (0, 0, 0, 0) if (image.ndim > 2 and image.shape[2] == 4) else (0, 0, 0)
    
    rotated = cv2.warpAffine(image, matrix, (new_w, new_h), flags=cv2.INTER_LINEAR, borderMode=border_mode, borderValue=border_val)
    return rotated

def warp_garment_to_points(garment_img: np.ndarray, src_points: np.ndarray, dst_points: np.ndarray, target_shape: tuple) -> np.ndarray:
    """
    Warps a garment using perspective or affine transformation to fit user torso anchor landmarks.
    """
    h_bg, w_bg = target_shape[:2]
    if len(src_points) == 4 and len(dst_points) == 4:
        M = cv2.getPerspectiveTransform(src_points.astype(np.float32), dst_points.astype(np.float32))
        warped = cv2.warpPerspective(garment_img, M, (w_bg, h_bg), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    else:
        M = cv2.getAffineTransform(src_points[:3].astype(np.float32), dst_points[:3].astype(np.float32))
        warped = cv2.warpAffine(garment_img, M, (w_bg, h_bg), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    return warped
