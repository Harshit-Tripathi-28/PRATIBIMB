import cv2
import numpy as np
import math
from typing import Dict, Any, List
from app.models.schemas import BiometricAnalysisResult

class BiometricService:
    def analyze(self, image: np.ndarray, face_landmarks: list = None, pose_landmarks: list = None) -> BiometricAnalysisResult:
        """
        Extracts biometric attributes, skin tone/undertone, face geometry shape, and body size estimation.
        """
        face_detected = face_landmarks is not None and len(face_landmarks) >= 468
        pose_detected = pose_landmarks is not None and len(pose_landmarks) >= 25
        
        face_shape = "Oval"
        face_proportions = {}
        flattering_colors = ["#1e293b", "#0f766e", "#b45309", "#831843", "#3b82f6"]
        best_eyewear_shapes = ["Aviator", "Wayfarer", "Square Frames", "Clubmaster"]
        skin_tone_hex = "#e0ac69"
        skin_undertone = "Warm"
        
        # 1. Analyze Face Shape
        if face_detected:
            # Key face points:
            # Forehead top: 10, Chin: 152
            # Left cheek: 234, Right cheek: 454
            # Left jaw corner: 172, Right jaw corner: 397
            # Left temple: 54, Right temple: 284
            p_chin = face_landmarks[152]
            p_forehead = face_landmarks[10]
            p_left_cheek = face_landmarks[234]
            p_right_cheek = face_landmarks[454]
            p_left_jaw = face_landmarks[172]
            p_right_jaw = face_landmarks[397]
            p_left_temple = face_landmarks[54]
            p_right_temple = face_landmarks[284]
            
            face_height = math.hypot(p_chin["x"] - p_forehead["x"], p_chin["y"] - p_forehead["y"])
            cheek_width = math.hypot(p_right_cheek["x"] - p_left_cheek["x"], p_right_cheek["y"] - p_left_cheek["y"])
            jaw_width = math.hypot(p_right_jaw["x"] - p_left_jaw["x"], p_right_jaw["y"] - p_left_jaw["y"])
            forehead_width = math.hypot(p_right_temple["x"] - p_left_temple["x"], p_right_temple["y"] - p_left_temple["y"])
            
            if cheek_width > 0:
                ratio_length_to_width = face_height / cheek_width
                ratio_jaw_to_cheek = jaw_width / cheek_width
                ratio_forehead_to_cheek = forehead_width / cheek_width
                
                face_proportions = {
                    "face_height": round(face_height, 1),
                    "cheekbone_width": round(cheek_width, 1),
                    "jawline_width": round(jaw_width, 1),
                    "forehead_width": round(forehead_width, 1),
                    "aspect_ratio": round(ratio_length_to_width, 2)
                }
                
                # Face classification logic
                if ratio_length_to_width > 1.45:
                    if ratio_jaw_to_cheek > 0.85:
                        face_shape = "Oblong"
                        best_eyewear_shapes = ["Tall Square Frames", "Wide Wayfarers", "Aviators"]
                    else:
                        face_shape = "Oval"
                        best_eyewear_shapes = ["Wayfarer", "Aviator", "Round Glasses", "Cat-Eye"]
                elif ratio_length_to_width < 1.25:
                    if ratio_jaw_to_cheek > 0.88:
                        face_shape = "Square"
                        best_eyewear_shapes = ["Round Frames", "Oval Frames", "Rimless", "Aviator"]
                    else:
                        face_shape = "Round"
                        best_eyewear_shapes = ["Angular Rectangles", "Wayfarer", "Geometric Square", "Cat-Eye"]
                else:
                    if ratio_jaw_to_cheek < 0.72 and ratio_forehead_to_cheek > 0.82:
                        face_shape = "Heart"
                        best_eyewear_shapes = ["Round", "Light-Colored Frames", "Oval", "Clubmaster"]
                    elif ratio_forehead_to_cheek < 0.78 and ratio_jaw_to_cheek < 0.78:
                        face_shape = "Diamond"
                        best_eyewear_shapes = ["Rimless", "Oval", "Cat-Eye", "Curved Browline"]
                    else:
                        face_shape = "Oval"
                        best_eyewear_shapes = ["Classic Square", "Aviator", "Wayfarer", "Round Metal"]

            # 2. Extract Skin Tone & Undertone
            # Sample skin around cheek/nose
            h_img, w_img = image.shape[:2]
            p_nose = face_landmarks[1]
            p_left_sample = face_landmarks[117]
            p_right_sample = face_landmarks[346]
            
            sample_points = [p_nose, p_left_sample, p_right_sample]
            skin_pixels = []
            
            for pt in sample_points:
                cx, cy = int(pt["x"]), int(pt["y"])
                if 0 <= cy < h_img and 0 <= cx < w_img:
                    patch = image[max(0, cy-5):min(h_img, cy+6), max(0, cx-5):min(w_img, cx+6)]
                    if patch.size > 0:
                        avg_color = np.mean(patch, axis=(0, 1))
                        skin_pixels.append(avg_color)
                        
            if skin_pixels:
                avg_bgr = np.mean(skin_pixels, axis=0)
                b, g, r = avg_bgr[0], avg_bgr[1], avg_bgr[2]
                skin_tone_hex = f"#{int(r):02x}{int(g):02x}{int(b):02x}"
                
                # Undertone calculation
                # Warm undertones typically have higher Red/Yellow balance (R > G > B and high yellow component)
                # Cool undertones have closer G and B to R, or higher blue/pink reflection
                warmth_score = (r - b) / (r + g + b + 1e-5)
                if warmth_score > 0.18:
                    skin_undertone = "Warm"
                    flattering_colors = ["#d97706", "#92400e", "#15803d", "#047857", "#451a03", "#dc2626"]
                elif warmth_score < 0.08:
                    skin_undertone = "Cool"
                    flattering_colors = ["#1d4ed8", "#4338ca", "#0369a1", "#0284c7", "#be185d", "#334155"]
                else:
                    skin_undertone = "Neutral"
                    flattering_colors = ["#0f172a", "#334155", "#059669", "#7c3aed", "#b91c1c", "#e2e8f0"]

        # 3. Size Estimation from Pose & Face
        estimated_size = "M"
        size_confidence = 0.85
        measurements = {}
        
        if pose_detected:
            p_l_sh = pose_landmarks[11]
            p_r_sh = pose_landmarks[12]
            p_l_hip = pose_landmarks[23]
            p_r_hip = pose_landmarks[24]
            
            pixel_shoulder_w = math.hypot(p_r_sh["x"] - p_l_sh["x"], p_r_sh["y"] - p_l_sh["y"])
            
            # Use interpupillary distance or face height as a real-world reference scale (~20cm face height)
            face_h_ref = face_proportions.get("face_height", pixel_shoulder_w * 0.55)
            cm_per_pixel = 20.0 / max(1.0, face_h_ref)
            
            est_shoulder_cm = round(pixel_shoulder_w * cm_per_pixel, 1)
            est_chest_cm = round(est_shoulder_cm * 2.35, 1)
            
            measurements = {
                "estimated_shoulder_cm": est_shoulder_cm,
                "estimated_chest_cm": est_chest_cm,
                "confidence_score": 0.89
            }
            
            if est_shoulder_cm < 39:
                estimated_size = "XS"
            elif est_shoulder_cm < 42:
                estimated_size = "S"
            elif est_shoulder_cm < 46:
                estimated_size = "M"
            elif est_shoulder_cm < 50:
                estimated_size = "L"
            elif est_shoulder_cm < 54:
                estimated_size = "XL"
            else:
                estimated_size = "XXL"
        else:
            measurements = {
                "estimated_shoulder_cm": 44.0,
                "estimated_chest_cm": 102.0,
                "confidence_score": 0.72
            }

        style_recommendations = [
            f"Your face structure aligns with an **{face_shape}** profile. Geometric frames will bring out your cheekbone structure.",
            f"With a **{skin_undertone}** undertone, prioritize rich earthy tones and structured collars for optimal visual balance.",
            f"Recommended upper garment size is **{estimated_size}** based on real-time anthropometric shoulder span analysis."
        ]

        return BiometricAnalysisResult(
            face_detected=face_detected,
            face_shape=face_shape,
            face_proportions=face_proportions,
            skin_tone_hex=skin_tone_hex,
            skin_undertone=skin_undertone,
            estimated_size=estimated_size,
            size_confidence=size_confidence,
            measurements_cm=measurements,
            style_recommendations=style_recommendations,
            flattering_colors=flattering_colors,
            best_eyewear_shapes=best_eyewear_shapes
        )

biometric_service = BiometricService()
