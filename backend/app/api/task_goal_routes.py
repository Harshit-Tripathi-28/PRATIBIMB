from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from app.models.twin_schemas import (
    Task, Goal, Habit, MemoryItem, Insight, FocusSession
)
from app.services.twin_service import twin_service
from app.services.ml_intelligence_service import ml_service

router = APIRouter(tags=["Operations & Second Brain"])

# ---------------- Task Endpoints ----------------
@router.get("/tasks", response_model=List[Task])
async def get_tasks():
    return twin_service.get_tasks()

@router.post("/tasks", response_model=Task)
async def create_task(task: Task):
    return twin_service.add_task(task)

@router.post("/tasks/{task_id}/toggle", response_model=Task)
async def toggle_task(task_id: str):
    updated = twin_service.toggle_task(task_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    success = twin_service.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True}

# ---------------- Goal Endpoints ----------------
@router.get("/goals", response_model=List[Goal])
async def get_goals():
    return twin_service.get_goals()

@router.post("/goals", response_model=Goal)
async def create_goal(goal: Goal):
    return twin_service.add_goal(goal)

class ProgressUpdate(BaseModel):
    progress: int

@router.put("/goals/{goal_id}/progress", response_model=Goal)
async def update_goal_progress(goal_id: str, body: ProgressUpdate):
    updated = twin_service.update_goal_progress(goal_id, body.progress)
    if not updated:
        raise HTTPException(status_code=404, detail="Goal not found")
    return updated

@router.post("/goals/{goal_id}/milestones/{milestone_id}/toggle", response_model=Goal)
async def toggle_goal_milestone(goal_id: str, milestone_id: str):
    updated = twin_service.toggle_goal_milestone(goal_id, milestone_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Goal or milestone not found")
    return updated

# ---------------- Habit Endpoints ----------------
@router.get("/habits", response_model=List[Habit])
async def get_habits():
    return twin_service.get_habits()

@router.post("/habits", response_model=Habit)
async def create_habit(habit: Habit):
    return twin_service.add_habit(habit)

@router.post("/habits/{habit_id}/toggle", response_model=Habit)
async def toggle_habit(habit_id: str):
    updated = twin_service.toggle_habit(habit_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Habit not found")
    return updated

@router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: str):
    success = twin_service.delete_habit(habit_id)
    if not success:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"success": True}

# ---------------- Second Brain / Memory Endpoints ----------------
@router.get("/memory/list", response_model=List[MemoryItem])
async def list_memories():
    return twin_service.get_memories()

@router.get("/memory/search")
async def search_memories(q: str = Query(..., min_length=1)):
    twin = twin_service.get_twin()
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
async def add_memory_item(memory: MemoryItem):
    return twin_service.add_memory(memory)

@router.delete("/memory/{memory_id}")
async def delete_memory_item(memory_id: str):
    success = twin_service.delete_memory(memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"success": True}

# ---------------- Focus Session Endpoint ----------------
@router.post("/focus/log", response_model=FocusSession)
async def log_focus_session(session: FocusSession):
    return twin_service.record_focus_session(session)

# ---------------- Insights Endpoint ----------------
@router.get("/insights", response_model=List[Insight])
async def get_insights():
    return twin_service.get_twin().insights
