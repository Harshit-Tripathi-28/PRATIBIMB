import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_twin_state():
    res = client.get("/api/twin")
    assert res.status_code == 200
    data = res.json()
    assert "user_profile" in data
    assert "behavior_metrics" in data
    assert "twin_state" in data
    assert len(data["goals"]) >= 1
    assert len(data["tasks"]) >= 1
    assert len(data["habits"]) >= 1

def test_ai_chat_and_action():
    # Ask AI core for task assistance
    res = client.post("/api/ai/chat", json={"message": "I need to schedule a focus sprint for deep work"})
    assert res.status_code == 200
    msg = res.json()
    assert msg["sender"] == "twin"
    assert "actions" in msg
    assert len(msg["actions"]) > 0

    action = msg["actions"][0]
    action_id = action["id"]

    # Execute action
    exec_res = client.post("/api/ai/execute-action", json={"action_id": action_id})
    assert exec_res.status_code == 200
    exec_data = exec_res.json()
    assert exec_data["success"] is True

def test_ml_recommendations():
    res = client.get("/api/ai/recommendations")
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0

def test_twin_graph():
    res = client.get("/api/twin/graph")
    assert res.status_code == 200
    graph = res.json()
    assert "nodes" in graph
    assert "links" in graph
    assert len(graph["nodes"]) > 0
    assert len(graph["links"]) > 0

def test_semantic_memory_search():
    res = client.get("/api/memory/search?query=focus%20morning")
    assert res.status_code == 200
    data = res.json()
    assert "memories" in data
    assert len(data["memories"]) > 0

def test_tasks_and_goals():
    # Create task
    task_res = client.post("/api/tasks", json={
        "title": "Master Reinforcement Learning",
        "priority": "high",
        "estimated_minutes": 60,
        "energy_required": "high",
        "tags": ["AI", "RL"]
    })
    assert task_res.status_code == 200
    task_id = task_res.json()["id"]

    # Update task status
    patch_res = client.patch(f"/api/tasks/{task_id}/status", json={"status": "completed"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "completed"

def test_habit_logging():
    habits = client.get("/api/habits").json()
    assert len(habits) > 0
    first_habit = habits[0]
    
    log_res = client.post(f"/api/habits/{first_habit['id']}/log")
    assert log_res.status_code == 200
    assert log_res.json()["current_streak"] >= first_habit["current_streak"]

def test_insights():
    res = client.get("/api/insights")
    assert res.status_code == 200
    assert len(res.json()) > 0
