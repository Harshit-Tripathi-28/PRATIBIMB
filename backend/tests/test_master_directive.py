import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_twin_state():
    res = client.get("/api/twin")
    assert res.status_code == 200
    data = res.json()
    assert "profile" in data
    assert "state" in data
    assert len(data["goals"]) >= 1
    assert len(data["tasks"]) >= 1
    assert len(data["habits"]) >= 1

def test_ai_chat_and_action():
    # Ask AI core for task assistance
    res = client.post("/api/ai/chat", json={"message": "I need to schedule a focus sprint for deep work"})
    assert res.status_code == 200
    msg = res.json()
    assert "response" in msg
    assert "actions" in msg
    assert len(msg["actions"]) > 0

    action = msg["actions"][0]

    # Execute action
    exec_res = client.post("/api/ai/execute-action", json=action)
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
    res = client.get("/api/memory/search?q=deep%20work")
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
    assert len(data["results"]) > 0

def test_tasks_and_goals():
    import uuid
    t_id = f"test-task-{uuid.uuid4().hex[:6]}"
    # Create task
    task_res = client.post("/api/tasks", json={
        "id": t_id,
        "title": "Master Reinforcement Learning",
        "priority": "high",
        "estimated_minutes": 60,
        "status": "todo",
        "category": "AI"
    })
    assert task_res.status_code == 200
    task_id = task_res.json()["id"]

    # Toggle task status
    patch_res = client.post(f"/api/tasks/{task_id}/toggle")
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "completed"

def test_habit_logging():
    habits = client.get("/api/habits").json()
    assert len(habits) > 0
    first_habit = habits[0]
    
    log_res = client.post(f"/api/habits/{first_habit['id']}/toggle")
    assert log_res.status_code == 200

def test_insights():
    res = client.get("/api/insights")
    assert res.status_code == 200
    assert len(res.json()) > 0

if __name__ == "__main__":
    test_twin_state()
    test_ai_chat_and_action()
    test_ml_recommendations()
    test_twin_graph()
    test_semantic_memory_search()
    test_tasks_and_goals()
    test_habit_logging()
    test_insights()
    print("Master directive tests passed successfully!")
