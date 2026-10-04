from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from pydantic import BaseModel
from app.models.twin_schemas import (
    Task, Goal, Habit, MemoryItem, Insight, FocusSession
)
from app.services.twin_service import twin_service
from app.services.ml_intelligence_service import ml_service
from app.api.auth_routes import get_current_user_id

router = APIRouter(tags=["Operations & Second Brain"])

# ---------------- Task Endpoints ----------------
@router.get("/tasks", response_model=List[Task])
async def get_tasks(user_id: str = Depends(get_current_user_id)):
    return twin_service.get_tasks(user_id)

@router.post("/tasks", response_model=Task)
async def create_task(task: Task, user_id: str = Depends(get_current_user_id)):
    return twin_service.add_task(task, user_id)

@router.post("/tasks/{task_id}/toggle", response_model=Task)
async def toggle_task(task_id: str, user_id: str = Depends(get_current_user_id)):
    updated = twin_service.toggle_task(task_id, user_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user_id: str = Depends(get_current_user_id)):
    success = twin_service.delete_task(task_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True}

# ---------------- Goal Endpoints ----------------
@router.get("/goals", response_model=List[Goal])
async def get_goals(user_id: str = Depends(get_current_user_id)):
    return twin_service.get_goals(user_id)

@router.post("/goals", response_model=Goal)
async def create_goal(goal: Goal, user_id: str = Depends(get_current_user_id)):
    return twin_service.add_goal(goal, user_id)

class ProgressUpdate(BaseModel):
    progress: int

@router.put("/goals/{goal_id}/progress", response_model=Goal)
async def update_goal_progress(goal_id: str, body: ProgressUpdate, user_id: str = Depends(get_current_user_id)):
    updated = twin_service.update_goal_progress(goal_id, body.progress, user_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Goal not found")
    return updated

@router.post("/goals/{goal_id}/milestones/{milestone_id}/toggle", response_model=Goal)
async def toggle_goal_milestone(goal_id: str, milestone_id: str, user_id: str = Depends(get_current_user_id)):
    updated = twin_service.toggle_goal_milestone(goal_id, milestone_id, user_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Goal or milestone not found")
    return updated

# ---------------- Habit Endpoints ----------------
@router.get("/habits", response_model=List[Habit])
async def get_habits(user_id: str = Depends(get_current_user_id)):
    return twin_service.get_habits(user_id)

@router.post("/habits", response_model=Habit)
async def create_habit(habit: Habit, user_id: str = Depends(get_current_user_id)):
    return twin_service.add_habit(habit, user_id)

@router.post("/habits/{habit_id}/toggle", response_model=Habit)
async def toggle_habit(habit_id: str, user_id: str = Depends(get_current_user_id)):
    updated = twin_service.toggle_habit(habit_id, user_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Habit not found")
    return updated

@router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str, user_id: str = Depends(get_current_user_id)):
    success = twin_service.delete_habit(habit_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"success": True}

# ---------------- Second Brain / Memory Endpoints ----------------
@router.get("/memory/list", response_model=List[MemoryItem])
async def list_memories(user_id: str = Depends(get_current_user_id)):
    return twin_service.get_memories(user_id)

@router.get("/memory/search")
async def search_memories(q: str = Query(..., min_length=1), user_id: str = Depends(get_current_user_id)):
    twin = twin_service.get_twin(user_id)
    results = ml_service.semantic_memory_search(q, twin.memories, top_k=6)
    formatted = []
    for mem, score in results:
        m_dict = mem.model_dump()
        m_dict["similarity_score"] = round(score, 3)
        formatted.append(m_dict)
    return {
        "query": q,
        "results": formatted,
        "count": len(formatted)
    }

@router.post("/memory/add", response_model=MemoryItem)
async def add_memory(memory: MemoryItem, user_id: str = Depends(get_current_user_id)):
    return twin_service.add_memory(memory, user_id)

@router.delete("/memory/{memory_id}")
async def delete_memory(memory_id: str, user_id: str = Depends(get_current_user_id)):
    success = twin_service.delete_memory(memory_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory item not found")
    return {"success": True}

# ---------------- Insights & Focus Endpoints ----------------
@router.get("/insights", response_model=List[Insight])
async def get_insights(user_id: str = Depends(get_current_user_id)):
    twin = twin_service.get_twin(user_id)
    return twin.insights

@router.post("/focus/log", response_model=FocusSession)
async def log_focus_session(session: FocusSession, user_id: str = Depends(get_current_user_id)):
    return twin_service.record_focus_session(session, user_id)
