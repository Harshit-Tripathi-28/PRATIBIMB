from fastapi import APIRouter, HTTPException, Depends
from app.models.twin_schemas import DigitalTwin, UserProfile, DigitalTwinGraph
from app.services.twin_service import twin_service
from app.api.auth_routes import get_current_user_id

router = APIRouter(prefix="/twin", tags=["AI Digital Twin"])

@router.get("", response_model=DigitalTwin)
async def get_digital_twin(user_id: str = Depends(get_current_user_id)):
    return twin_service.get_twin(user_id)

@router.put("/profile", response_model=DigitalTwin)
async def update_twin_profile(profile: UserProfile, user_id: str = Depends(get_current_user_id)):
    twin = twin_service.get_twin(user_id)
    twin.profile = profile
    twin_service.save_twin(twin, user_id)
    return twin

@router.put("/energy")
async def update_energy_level(body: dict, user_id: str = Depends(get_current_user_id)):
    level = int(body.get("energy_level", 80))
    updated_level = twin_service.update_energy_level(level, user_id)
    return {"success": True, "energy_level": updated_level}

@router.put("/avatar")
async def update_avatar_config(body: dict, user_id: str = Depends(get_current_user_id)):
    avatar_config = body.get("avatar_config", {})
    updated = twin_service.update_avatar_config(avatar_config, user_id)
    return {"success": True, "avatar_config": updated}

@router.get("/graph", response_model=DigitalTwinGraph)
async def get_twin_neural_graph(user_id: str = Depends(get_current_user_id)):
    return twin_service.get_digital_twin_graph(user_id)

@router.post("/reset-demo", response_model=DigitalTwin)
async def reset_demo_state(user_id: str = Depends(get_current_user_id)):
    return twin_service.reset_to_demo(user_id)
