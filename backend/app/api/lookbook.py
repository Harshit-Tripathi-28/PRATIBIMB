import uuid
import datetime
from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import SavedLook

router = APIRouter(prefix="/lookbook", tags=["Lookbook & Wardrobe"])

# In-memory lookbook store (persists across session)
_saved_looks: dict[str, SavedLook] = {}

@router.get("/list", response_model=List[SavedLook])
async def get_saved_looks():
    return list(_saved_looks.values())

@router.post("/save", response_model=SavedLook)
async def save_look(look: SavedLook):
    look_id = look.id or str(uuid.uuid4())
    look.id = look_id
    if not look.created_at:
        look.created_at = datetime.datetime.now().strftime("%b %d, %Y - %I:%M %p")
    _saved_looks[look_id] = look
    return look

@router.delete("/delete/{look_id}")
async def delete_look(look_id: str):
    if look_id in _saved_looks:
        del _saved_looks[look_id]
        return {"success": True, "message": "Look removed"}
    raise HTTPException(status_code=404, detail="Look not found")
