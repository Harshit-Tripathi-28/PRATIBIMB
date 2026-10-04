from fastapi import APIRouter, HTTPException
from app.models.twin_schemas import DigitalTwin, UserProfile, DigitalTwinGraph
from app.services.twin_service import twin_service

router = APIRouter(prefix="/twin", tags=["AI Digital Twin"])

@router.get("", response_model=DigitalTwin)
async def get_digital_twin():
    return twin_service.get_twin()

@router.put("/profile", response_model=DigitalTwin)
async def update_twin_profile(profile: UserProfile):
    twin = twin_service.get_twin()
    twin.profile = profile
    twin_service.save_twin(twin)
    return twin

@router.put("/energy")
async def update_energy_level(body: dict):
    level = int(body.get("energy_level", 80))
    updated_level = twin_service.update_energy_level(level)
    return {"success": True, "energy_level": updated_level}

@router.put("/avatar")
async def update_avatar_config(body: dict):
    avatar_config = body.get("avatar_config", {})
    updated = twin_service.update_avatar_config(avatar_config)
    return {"success": True, "avatar_config": updated}

@router.get("/graph", response_model=DigitalTwinGraph)
async def get_twin_neural_graph():
    return twin_service.get_digital_twin_graph()

@router.post("/reset-demo", response_model=DigitalTwin)
async def reset_demo_state():
    return twin_service.reset_to_demo()
