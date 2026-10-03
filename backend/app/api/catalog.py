import os
import uuid
import cv2
import numpy as np
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.config import settings
from app.models.schemas import CatalogItem
from app.services.catalog_service import catalog_service

router = APIRouter(prefix="/catalog", tags=["Apparel & Eyewear Catalog"])

@router.get("/items", response_model=List[CatalogItem])
async def get_items(category: Optional[str] = None):
    return catalog_service.get_all_items(category)

@router.get("/items/{item_id}", response_model=CatalogItem)
async def get_item_detail(item_id: str):
    item = catalog_service.get_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.get("/backgrounds")
async def get_backgrounds():
    return catalog_service.get_backgrounds()

@router.get("/samples")
async def get_samples():
    return catalog_service.get_sample_images()

@router.post("/upload-item")
async def upload_custom_item(
    name: str = Form(...),
    category: str = Form(...),  # glasses or tops
    sub_category: Optional[str] = Form(None),
    price: Optional[float] = Form(99.0),
    file: UploadFile = File(...)
):
    """Allows uploading custom PNG garments or glasses with alpha transparency."""
    item_id = f"custom-{uuid.uuid4().hex[:8]}"
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
    
    file_bytes = await file.read()
    np_arr = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_UNCHANGED)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file format")
        
    save_filename = f"{item_id}.png"
    save_path = os.path.join(settings.UPLOADS_DIR, save_filename)
    
    # Save as PNG
    cv2.imwrite(save_path, image)
    
    item = CatalogItem(
        id=item_id,
        name=name,
        category=category,
        sub_category=sub_category or ("Custom Upload"),
        brand="User Custom Wardrobe",
        price=price,
        style_tags=["Custom", "User Upload"],
        image_url=f"/static/uploads/{save_filename}",
        overlay_url=save_path,
        description=f"User-uploaded custom garment ({name})"
    )
    
    catalog_service.register_item(item)
    return item
