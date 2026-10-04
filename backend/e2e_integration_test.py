import sys
import os
from fastapi.testclient import TestClient
from app.main import app

# Set utf-8 encoding for stdout
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

client = TestClient(app)

def run_integration_suite():
    print("==================================================")
    print("   PRATIBIMB AI OPERATING SYSTEM - E2E TEST SUITE")
    print("==================================================")
    
    passed = 0
    failed = 0

    def check(name, fn):
        nonlocal passed, failed
        try:
            fn()
            print(f"[PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"[FAIL] {name} -> {e}")
            failed += 1

    # 1. Digital Twin Core State
    def t1():
        res = client.get("/api/twin")
        assert res.status_code == 200
        d = res.json()
        assert d["profile"]["name"] == "Harshit Tripathi"
        assert d["state"]["energy_level"] > 0
        assert len(d["goals"]) > 0
        assert len(d["tasks"]) > 0
        assert len(d["habits"]) > 0
    check("1. Digital Twin Core State & Cognitive Profile", t1)

    # 2. AI Living Core Conversation & Action Generation
    def t2():
        res = client.post("/api/ai/chat", json={"message": "Please schedule a deep focus sprint for model validation."})
        assert res.status_code == 200
        d = res.json()
        assert "response" in d
        assert len(d["actions"]) > 0
        assert len(d["suggested_prompts"]) > 0
    check("2. AI Living Core Reasoning & Action Synthesis", t2)

    # 3. AI Action Execution
    def t3():
        # Generate an action via chat
        chat_res = client.post("/api/ai/chat", json={"message": "Create task to finish unit tests"})
        actions = chat_res.json().get("actions", [])
        assert len(actions) > 0
        target_action = actions[0]
        
        exec_res = client.post("/api/ai/execute-action", json=target_action)
        assert exec_res.status_code == 200
        assert exec_res.json()["success"] is True
    check("3. AI Action Execution & Twin State Mutation", t3)

    # 4. ML Recommendations Engine (Multi-objective optimization)
    def t4():
        res = client.get("/api/ai/recommendations")
        assert res.status_code == 200
        d = res.json()
        assert len(d["recommendations"]) > 0
        assert "task" in d["recommendations"][0]
        assert "score" in d["recommendations"][0]
    check("4. ML Multi-Objective Recommendation Engine", t4)

    # 5. Neural Constellation Graph
    def t5():
        res = client.get("/api/twin/graph")
        assert res.status_code == 200
        g = res.json()
        assert len(g["nodes"]) >= 5
        assert len(g["links"]) >= 4
        # Verify node groups
        groups = {n["group"] for n in g["nodes"]}
        assert "user" in groups
        assert "goal" in groups
    check("5. Neural Constellation Knowledge Graph", t5)

    # 6. TF-IDF Semantic Memory Search
    def t6():
        res = client.get("/api/memory/search?q=deep%20work")
        assert res.status_code == 200
        d = res.json()
        assert d["count"] > 0
        assert len(d["results"]) > 0
        assert d["results"][0]["similarity_score"] > 0
    check("6. Vector TF-IDF Semantic Memory Retrieval", t6)

    # 7. Memory Ingestion
    def t7():
        new_mem = {
            "id": "mem-test-1",
            "type": "episodic",
            "content": "Completed full PRATIBIMB AI Operating System implementation today with perfect fidelity.",
            "importance": 10,
            "created_at": "Today",
            "tags": ["milestone", "ai", "twin"],
            "source": "automated_test"
        }
        res = client.post("/api/memory/add", json=new_mem)
        assert res.status_code == 200
        assert res.json()["id"] == "mem-test-1"
    check("7. Second Brain Memory Ingestion", t7)

    # 8. Task Management & Toggle
    def t8():
        tasks = client.get("/api/tasks").json()
        assert len(tasks) > 0
        first_id = tasks[0]["id"]
        toggle_res = client.post(f"/api/tasks/{first_id}/toggle")
        assert toggle_res.status_code == 200
    check("8. Task Execution Lifecycle & State Toggling", t8)

    # 9. Habit Tracking
    def t9():
        habits = client.get("/api/habits").json()
        assert len(habits) > 0
        first_id = habits[0]["id"]
        toggle_res = client.post(f"/api/habits/{first_id}/toggle")
        assert toggle_res.status_code == 200
    check("9. Habit Ritual Protocol & Streak Tracker", t9)

    # 10. Focus Session Logging
    def t10():
        session = {
            "id": "fs-test-99",
            "duration_minutes": 45,
            "energy_before": 8,
            "energy_after": 9,
            "notes": "Focused deep engineering block",
            "timestamp": "12:00 PM"
        }
        res = client.post("/api/focus/log", json=session)
        assert res.status_code == 200
    check("10. Cognitive Flow & Focus Session Logging", t10)

    # 11. ML Pattern Diagnostics / Insights
    def t11():
        res = client.get("/api/insights")
        assert res.status_code == 200
        assert len(res.json()) > 0
    check("11. ML Pattern Diagnostics & Anomaly Detection", t11)

    # 12. Virtual Dressing Room Try-On Pipeline
    def t12():
        res = client.post("/api/tryon/process", json={
            "sample_id": "sample-fullbody",
            "garment_id": "shirt-navy-formal"
        })
        assert res.status_code == 200
        assert res.json()["success"] is True
        assert len(res.json()["result_image_base64"]) > 100
    check("12. Virtual Dressing Room / Multi-Layer Geometric Fitting", t12)

    # 13. Multi-Layer Garment Fitting Stack
    def t13():
        res = client.post("/api/tryon/process", json={
            "sample_id": "sample-fullbody",
            "items": [
                {"id": "shirt-navy-formal", "layer_type": "base_top"},
                {"id": "jacket-emerald-bomber", "layer_type": "outerwear"},
                {"id": "glasses-classic-black", "layer_type": "eyewear"}
            ]
        })
        assert res.status_code == 200
        d = res.json()
        assert d["success"] is True
        assert len(d["applied_layers"]) >= 3
    check("13. Multi-Layer Stack (Navy Shirt + Bomber + Eyewear)", t13)

    print("==================================================")
    print(f"   TOTAL: {passed} PASSED, {failed} FAILED")
    print("==================================================")
    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_integration_suite()
