import cv2
import numpy as np
import math
import os
from app.services.image_processor import rotate_image, overlay_transparent

class FaceMeshService:
    def __init__(self):
        # Initialize OpenCV Haar Cascades for high-speed robust face and eye detection
        face_cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
        eye_cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_eye.xml")
        
        self.face_cascade = cv2.CascadeClassifier(face_cascade_path)
        self.eye_cascade = cv2.CascadeClassifier(eye_cascade_path)

    def extract_landmarks(self, image: np.ndarray, is_static: bool = False):
        """
        Detects face landmarks (eyes, nose bridge, chin, forehead, temples)
        using computer vision geometric feature extraction.
        Returns a dictionary or indexed list of landmark points compatible with face mesh indexing.
        """
        if image is None:
            return None
            
        h, w = image.shape[:2]
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.ndim == 3 else image
        
        # Multi-scale face detection
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(int(w * 0.1), int(h * 0.1))
        )
        
        if len(faces) == 0:
            # Fallback: try with lower minNeighbors
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.15, minNeighbors=3)
            if len(faces) == 0:
                return None
                
        # Take the most prominent face
        fx, fy, fw, fh = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]
        
        # Face ROI for eye detection
        face_gray_roi = gray[fy:fy + int(fh * 0.6), fx:fx + fw]
        eyes = self.eye_cascade.detectMultiScale(
            face_gray_roi,
            scaleFactor=1.1,
            minNeighbors=4,
            minSize=(int(fw * 0.12), int(fh * 0.12))
        )
        
        # Estimate or detect eye centers
        if len(eyes) >= 2:
            # Sort by x coordinate (left eye vs right eye in image coordinates)
            eyes = sorted(eyes, key=lambda e: e[0])
            left_eye_center = (fx + eyes[0][0] + eyes[0][2] / 2.0, fy + eyes[0][1] + eyes[0][3] / 2.0)
            right_eye_center = (fx + eyes[-1][0] + eyes[-1][2] / 2.0, fy + eyes[-1][1] + eyes[-1][3] / 2.0)
        else:
            # Anthropometric geometric approximation
            left_eye_center = (fx + fw * 0.32, fy + fh * 0.38)
            right_eye_center = (fx + fw * 0.68, fy + fh * 0.38)
            
        # Nose bridge center
        nose_bridge = (
            (left_eye_center[0] + right_eye_center[0]) / 2.0,
            (left_eye_center[1] + right_eye_center[1]) / 2.0 + (fh * 0.04)
        )
        
        # Construct dense landmark dictionary matching key mesh indices (0-478)
        # 33: Left eye outer, 263: Right eye outer
        # 168: Nose bridge top, 6: Mid nose, 1: Nose tip
        # 234: Left temple, 454: Right temple
        # 10: Forehead top, 152: Chin bottom
        # 172: Left jaw, 397: Right jaw
        # 117: Left cheek sample, 346: Right cheek sample
        # 54: Left upper temple, 284: Right upper temple
        
        landmarks = {}
        landmarks[33] = {"x": left_eye_center[0] - fw * 0.14, "y": left_eye_center[1], "z": 0.0}
        landmarks[263] = {"x": right_eye_center[0] + fw * 0.14, "y": right_eye_center[1], "z": 0.0}
        landmarks[168] = {"x": nose_bridge[0], "y": nose_bridge[1], "z": 0.0}
        landmarks[6] = {"x": nose_bridge[0], "y": fy + fh * 0.52, "z": 0.0}
        landmarks[1] = {"x": nose_bridge[0], "y": fy + fh * 0.62, "z": 0.0}
        landmarks[234] = {"x": fx + fw * 0.05, "y": left_eye_center[1], "z": 0.0}
        landmarks[454] = {"x": fx + fw * 0.95, "y": right_eye_center[1], "z": 0.0}
        landmarks[10] = {"x": fx + fw * 0.5, "y": fy, "z": 0.0}
        landmarks[152] = {"x": fx + fw * 0.5, "y": fy + fh, "z": 0.0}
        landmarks[172] = {"x": fx + fw * 0.15, "y": fy + fh * 0.82, "z": 0.0}
        landmarks[397] = {"x": fx + fw * 0.85, "y": fy + fh * 0.82, "z": 0.0}
        landmarks[117] = {"x": fx + fw * 0.3, "y": fy + fh * 0.55, "z": 0.0}
        landmarks[346] = {"x": fx + fw * 0.7, "y": fy + fh * 0.55, "z": 0.0}
        landmarks[54] = {"x": fx + fw * 0.2, "y": fy + fh * 0.25, "z": 0.0}
        landmarks[284] = {"x": fx + fw * 0.8, "y": fy + fh * 0.25, "z": 0.0}
        
        # Fill standard indices with mapped coordinates
        points = [landmarks.get(i, {"x": fx + fw*0.5, "y": fy + fh*0.5, "z": 0.0}) for i in range(478)]
        for k, v in landmarks.items():
            points[k] = v
            
        return points

    def apply_glasses(
        self,
        image: np.ndarray,
        glasses_png: np.ndarray,
        landmarks: list,
        scale_factor: float = 1.0,
        offset_x: float = 0.0,
        offset_y: float = 0.0
    ) -> np.ndarray:
        """
        Calculates position, scale, and roll angle to accurately place glasses over the face landmarks.
        """
        if landmarks is None or len(landmarks) < 468 or glasses_png is None:
            return image
        
        p_left_temple = landmarks[234]
        p_right_temple = landmarks[454]
        p_nose_bridge = landmarks[168]
        
        temple_dx = p_right_temple["x"] - p_left_temple["x"]
        temple_dy = p_right_temple["y"] - p_left_temple["y"]
        
        # Roll angle in degrees
        angle_rad = math.atan2(temple_dy, temple_dx)
        angle_deg = math.degrees(angle_rad)
        
        # Face width calculation
        face_width = math.hypot(temple_dx, temple_dy)
        
        # Target glasses width: 1.05x face width
        target_width = max(10, int(face_width * 1.05 * scale_factor))
        gh, gw = glasses_png.shape[:2]
        aspect_ratio = gh / float(gw)
        target_height = max(5, int(target_width * aspect_ratio))
        
        # Resize glasses image
        resized_glasses = cv2.resize(
            glasses_png,
            (target_width, target_height),
            interpolation=cv2.INTER_AREA if target_width < gw else cv2.INTER_CUBIC
        )
        
        # Rotate glasses matching head roll tilt
        rotated_glasses = rotate_image(resized_glasses, -angle_deg)
        
        # Center of glasses sits on the nose bridge
        center_x = p_nose_bridge["x"] + offset_x
        center_y = p_nose_bridge["y"] + offset_y
        
        rot_h, rot_w = rotated_glasses.shape[:2]
        top_left_x = int(center_x - (rot_w / 2.0))
        top_left_y = int(center_y - (rot_h / 2.0))
        
        return overlay_transparent(image, rotated_glasses, top_left_x, top_left_y)

    def draw_face_landmarks(self, image: np.ndarray, landmarks: list) -> np.ndarray:
        annotated = image.copy()
        if not landmarks:
            return annotated
            
        for idx in [33, 263, 168, 6, 1, 234, 454, 10, 152]:
            p = landmarks[idx]
            cv2.circle(annotated, (int(p["x"]), int(p["y"])), 4, (0, 255, 255), -1)
            
        cv2.line(
            annotated,
            (int(landmarks[33]["x"]), int(landmarks[33]["y"])),
            (int(landmarks[263]["x"]), int(landmarks[263]["y"])),
            (0, 200, 255),
            2
        )
        return annotated

face_mesh_service = FaceMeshService()
