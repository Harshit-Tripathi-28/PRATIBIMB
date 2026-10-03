import os
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.models.schemas import BiometricAnalysisResult
from app.services.image_processor import decode_base64_to_cv2
from app.services.face_mesh_service import face_mesh_service
from app.services.pose_service import pose_service
from app.services.biometric_service import biometric_service
from app.services.catalog_service import catalog_service
from app.config import settings

router = APIRouter(prefix="/analysis", tags=["Biometric Analysis & AI Styling"])

class AnalysisRequest(BaseModel):
    user_image_base64: Optional[str] = None
    sample_id: Optional[str] = None

@router.post("/biometrics", response_model=BiometricAnalysisResult)
async def analyze_biometrics(request: AnalysisRequest):
    if request.user_image_base64:
        image = decode_base64_to_cv2(request.user_image_base64)
    elif request.sample_id:
        sample_path = os.path.join(settings.SAMPLES_DIR, f"{request.sample_id}.jpeg")
        if not os.path.exists(sample_path):
            sample_path = os.path.join(settings.SAMPLES_DIR, f"{request.sample_id}.jpg")
        if not os.path.exists(sample_path):
            sample_path = os.path.join(settings.SAMPLES_DIR, f"{request.sample_id}.png")
        if not os.path.exists(sample_path):
            raise HTTPException(status_code=404, detail="Sample not found")
        image = cv2.imread(sample_path)
    else:
        samples = catalog_service.get_sample_images()
        if samples:
            image = cv2.imread(samples[0]["file_path"])
        else:
            raise HTTPException(status_code=400, detail="No image provided for analysis")
            
    if image is None:
        raise HTTPException(status_code=400, detail="Failed to decode image")
        
    face_landmarks = face_mesh_service.extract_landmarks(image, is_static=True)
    pose_landmarks = pose_service.extract_landmarks(image, is_static=True)
    
    return biometric_service.analyze(image, face_landmarks, pose_landmarks)
