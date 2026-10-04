from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.twin_schemas import ChatRequest, ChatResponse, AIAction
from app.services.ai_orchestrator import ai_orchestrator
from app.services.ml_intelligence_service import ml_service
from app.services.twin_service import twin_service

router = APIRouter(prefix="/ai", tags=["PRATIBIMB AI Core"])

@router.get("/status")
async def get_ai_status():
    from app.services.llm_provider import llm_service
    return llm_service.get_status()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_twin(request: ChatRequest):
    return await ai_orchestrator.process_chat(request)

@router.post("/execute-action")
async def execute_ai_action(action: AIAction):
    result = ai_orchestrator.execute_action(action)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@router.get("/recommendations")
async def get_ml_recommendations():
    twin = twin_service.get_twin()
    ranked = ml_service.rank_task_recommendations(twin.tasks, twin.state.energy_level, twin.goals)
    return {
        "energy_level": twin.state.energy_level,
        "recommendations": ranked,
        "count": len(ranked)
    }
