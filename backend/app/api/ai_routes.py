from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.models.twin_schemas import ChatRequest, ChatResponse, AIAction
from app.services.ai_orchestrator import ai_orchestrator
from app.services.ml_intelligence_service import ml_service
from app.services.twin_service import twin_service
from app.api.auth_routes import get_current_user_id
from app.services.rate_limiter import check_ai_rate_limit

router = APIRouter(prefix="/ai", tags=["PRATIBIMB AI Core"])

@router.get("/status")
async def get_ai_status():
    from app.services.llm_provider import llm_service
    return llm_service.get_status()

@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(check_ai_rate_limit)])
async def chat_with_twin(request: ChatRequest, user_id: str = Depends(get_current_user_id)):
    return await ai_orchestrator.process_chat(request, user_id=user_id)

@router.post("/execute-action")
async def execute_ai_action(action: AIAction, user_id: str = Depends(get_current_user_id)):
    result = ai_orchestrator.execute_action(action, user_id=user_id)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@router.get("/recommendations", dependencies=[Depends(check_ai_rate_limit)])
async def get_ml_recommendations(user_id: str = Depends(get_current_user_id)):
    twin = twin_service.get_twin(user_id)
    ranked = ml_service.rank_task_recommendations(twin.tasks, twin.state.energy_level, twin.goals)
    return {
        "energy_level": twin.state.energy_level,
        "recommendations": ranked,
        "count": len(ranked)
    }
