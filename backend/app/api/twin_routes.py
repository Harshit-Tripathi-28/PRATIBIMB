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

@router.get("/export")
async def export_twin_data(user_id: str = Depends(get_current_user_id)):
    """Exports a structured JSON archive of all user-owned Digital Twin state and history."""
    from datetime import datetime
    from app.deep_learning.state_engine.state_engine_service import state_engine_service
    from app.deep_learning.world_model.world_model_service import world_model_service

    twin = twin_service.get_twin(user_id)
    snapshots = state_engine_service.load_snapshots(user_id)
    world_history = world_model_service.load_world_history(user_id, limit=50)

    return {
        "export_metadata": {
            "schema_version": "2.0.0",
            "exported_at": datetime.now().isoformat(),
            "user_id": user_id,
            "product": "PRATIBIMB Personal AI Operating Layer"
        },
        "digital_twin": twin.model_dump(),
        "state_history_snapshots": [s.model_dump() for s in snapshots],
        "world_history_records": world_history
    }

