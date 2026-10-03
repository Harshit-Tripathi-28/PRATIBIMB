import cv2
import numpy as np
import math
import os
from app.services.image_processor import rotate_image, overlay_transparent

class PoseService:
    def __init__(self):
        upperbody_path = os.path.join(cv2.data.haarcascades, "haarcascade_upperbody.xml")
        fullbody_path = os.path.join(cv2.data.haarcascades, "haarcascade_fullbody.xml")
        face_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
        
        self.upper_cascade = cv2.CascadeClassifier(upperbody_path)
        self.full_cascade = cv2.CascadeClassifier(fullbody_path)
        self.face_cascade = cv2.CascadeClassifier(face_path)

    def extract_landmarks(self, image: np.ndarray, is_static: bool = False):
        """
        Extracts 33 pose landmarks representing shoulders, neck, torso, elbows and hips.
        """
        if image is None:
            return None
            
        h, w = image.shape[:2]
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if image.ndim == 3 else image
        
        # 1. Try detecting upper body
        uppers = self.upper_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(int(w*0.2), int(h*0.2)))
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(int(w*0.08), int(h*0.08)))
        
        sh_left_x, sh_left_y = 0.0, 0.0
        sh_right_x, sh_right_y = 0.0, 0.0
        hip_left_x, hip_left_y = 0.0, 0.0
        hip_right_x, hip_right_y = 0.0, 0.0
        
        if len(uppers) > 0:
            ux, uy, uw, uh = sorted(uppers, key=lambda u: u[2]*u[3], reverse=True)[0]
            sh_left_x = ux + uw * 0.15
            sh_left_y = uy + uh * 0.28
            sh_right_x = ux + uw * 0.85
            sh_right_y = uy + uh * 0.28
            hip_left_x = ux + uw * 0.22
            hip_left_y = uy + uh * 0.88
            hip_right_x = ux + uw * 0.78
            hip_right_y = uy + uh * 0.88
        elif len(faces) > 0:
            fx, fy, fw, fh = sorted(faces, key=lambda f: f[2]*f[3], reverse=True)[0]
            # Synthesize torso geometry from face anchor
            shoulder_span = fw * 2.3
            torso_len = fh * 2.8
            center_x = fx + fw * 0.5
            sh_top_y = fy + fh * 1.05
            
            sh_left_x = max(0, center_x - shoulder_span * 0.5)
            sh_left_y = sh_top_y
            sh_right_x = min(w, center_x + shoulder_span * 0.5)
            sh_right_y = sh_top_y
            hip_left_x = center_x - shoulder_span * 0.4
            hip_left_y = min(h, sh_top_y + torso_len)
            hip_right_x = center_x + shoulder_span * 0.4
            hip_right_y = min(h, sh_top_y + torso_len)
        else:
            return None
            
        landmarks = [{} for _ in range(33)]
        # 11: Left Shoulder, 12: Right Shoulder
        # 13: Left Elbow, 14: Right Elbow
        # 23: Left Hip, 24: Right Hip
        landmarks[11] = {"x": sh_left_x, "y": sh_left_y, "visibility": 0.95}
        landmarks[12] = {"x": sh_right_x, "y": sh_right_y, "visibility": 0.95}
        landmarks[13] = {"x": sh_left_x - (sh_right_x - sh_left_x)*0.2, "y": sh_left_y + (hip_left_y - sh_left_y)*0.5, "visibility": 0.8}
        landmarks[14] = {"x": sh_right_x + (sh_right_x - sh_left_x)*0.2, "y": sh_right_y + (hip_right_y - sh_right_y)*0.5, "visibility": 0.8}
        landmarks[23] = {"x": hip_left_x, "y": hip_left_y, "visibility": 0.85}
        landmarks[24] = {"x": hip_right_x, "y": hip_right_y, "visibility": 0.85}
        
        return landmarks

    def apply_garment(
        self,
        image: np.ndarray,
        garment_png: np.ndarray,
        landmarks: list,
        scale_factor: float = 1.0,
        offset_x: float = 0.0,
        offset_y: float = 0.0
    ) -> np.ndarray:
        if landmarks is None or len(landmarks) < 25 or garment_png is None:
            return image
            
        p_l_sh = landmarks[11]
        p_r_sh = landmarks[12]
        
        sh_center_x = (p_l_sh["x"] + p_r_sh["x"]) / 2.0
        sh_center_y = (p_l_sh["y"] + p_r_sh["y"]) / 2.0
        
        sh_dx = p_r_sh["x"] - p_l_sh["x"]
        sh_dy = p_r_sh["y"] - p_l_sh["y"]
        shoulder_width = math.hypot(sh_dx, sh_dy)
        
        if shoulder_width < 10:
            return image
            
        angle_rad = math.atan2(sh_dy, sh_dx)
        angle_deg = math.degrees(angle_rad)
        
        gh, gw = garment_png.shape[:2]
        garment_aspect = gh / float(gw)
        
        # Target garment width
        target_width = max(20, int(shoulder_width * 1.55 * scale_factor))
        target_height = max(20, int(target_width * garment_aspect))
        
        resized_garment = cv2.resize(
            garment_png,
            (target_width, target_height),
            interpolation=cv2.INTER_AREA if target_width < gw else cv2.INTER_CUBIC
        )
        
        rotated_garment = rotate_image(resized_garment, -angle_deg)
        
        collar_offset_ratio = 0.12
        rot_h, rot_w = rotated_garment.shape[:2]
        
        target_center_x = sh_center_x + offset_x
        top_left_x = int(target_center_x - (rot_w / 2.0))
        top_left_y = int(sh_center_y - (rot_h * collar_offset_ratio) + offset_y)
        
        return overlay_transparent(image, rotated_garment, top_left_x, top_left_y)

    def draw_pose_landmarks(self, image: np.ndarray, landmarks: list) -> np.ndarray:
        annotated = image.copy()
        if not landmarks:
            return annotated
            
        connections = [(11, 12), (11, 13), (12, 14), (11, 23), (12, 24), (23, 24)]
        for p1_idx, p2_idx in connections:
            if p1_idx < len(landmarks) and p2_idx < len(landmarks):
                p1 = landmarks[p1_idx]
                p2 = landmarks[p2_idx]
                if "x" in p1 and "x" in p2:
                    cv2.line(annotated, (int(p1["x"]), int(p1["y"])), (int(p2["x"]), int(p2["y"])), (0, 255, 128), 2)
                    
        for idx in [11, 12, 13, 14, 23, 24]:
            if idx < len(landmarks) and "x" in landmarks[idx]:
                p = landmarks[idx]
                cv2.circle(annotated, (int(p["x"]), int(p["y"])), 5, (255, 255, 0), -1)
                
        return annotated

pose_service = PoseService()
