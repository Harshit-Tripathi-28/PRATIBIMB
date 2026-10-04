import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from app.main import app

import uuid
client = TestClient(app)

def test_auth_and_user_isolation():
    uid = uuid.uuid4().hex[:6]
    alice_email = f"alice_{uid}@example.com"
    bob_email = f"bob_{uid}@example.com"

    # 1. User Alice registers
    alice_res = client.post("/api/auth/signup", json={
        "email": alice_email,
        "password": "SecurePassword123!",
        "name": "Alice Wonderland"
    })
    assert alice_res.status_code == 200
    alice_data = alice_res.json()
    alice_token = alice_data["token"]
    alice_headers = {"Authorization": f"Bearer {alice_token}"}
    assert alice_data["name"] == "Alice Wonderland"
    assert alice_data["has_onboarded"] is False

    # 2. Alice views her fresh Digital Twin - Must be clean empty state
    alice_twin_res = client.get("/api/twin", headers=alice_headers)
    assert alice_twin_res.status_code == 200
    alice_twin = alice_twin_res.json()
    assert alice_twin["profile"]["name"] == "Alice Wonderland"
    assert len(alice_twin["tasks"]) == 0
    assert len(alice_twin["goals"]) == 0
    assert len(alice_twin["habits"]) == 0
    assert len(alice_twin["memories"]) == 0

    # 3. Alice completes Onboarding & Twin Calibration
    onboard_res = client.post("/api/auth/onboarding", headers=alice_headers, json={
        "name": "Alice Wonderland",
        "title": "Quantum Computing Researcher",
        "bio": "Exploring fault-tolerant qubit topologies.",
        "skills": ["Qiskit", "Python", "Linear Algebra"],
        "interests": ["Quantum Algorithms", "Error Correction"],
        "preferred_work_style": "Deep Morning Sprints",
        "energy_level": 85,
        "initial_goals": [
            {
                "title": "Publish Quantum Benchmark Study",
                "category": "Research",
                "priority": "high",
                "deadline": "2026-11-30"
            }
        ],
        "initial_habits": [
            {
                "title": "Morning Hamiltonian derivation",
                "category": "Math",
                "frequency": "Daily",
                "target_days": 7
            }
        ],
        "avatar_config": {
            "skin_tone": "#F5D0C5",
            "hair_style": "long_wavy",
            "hair_color": "#4A2E18",
            "outfit_style": "tech_minimal",
            "outfit_color": "#3B82F6",
            "glasses": "classic",
            "mood": "focused",
            "aura_color": "violet"
        }
    })
    assert onboard_res.status_code == 200
    alice_calibrated = onboard_res.json()
    assert alice_calibrated["profile"]["title"] == "Quantum Computing Researcher"
    assert len(alice_calibrated["goals"]) == 1
    assert len(alice_calibrated["habits"]) == 1
    assert alice_calibrated["profile"]["avatar_config"]["glasses"] == "classic"

    # 4. User Bob registers
    bob_res = client.post("/api/auth/signup", json={
        "email": bob_email,
        "password": "BobPassword456!",
        "name": "Bob Builder"
    })
    assert bob_res.status_code == 200
    bob_token = bob_res.json()["token"]
    bob_headers = {"Authorization": f"Bearer {bob_token}"}

    # 5. Bob views his fresh Digital Twin - Must NOT see Alice's data!
    bob_twin_res = client.get("/api/twin", headers=bob_headers)
    assert bob_twin_res.status_code == 200
    bob_twin = bob_twin_res.json()
    assert bob_twin["profile"]["name"] == "Bob Builder"
    assert len(bob_twin["goals"]) == 0
    assert len(bob_twin["habits"]) == 0

    # 6. Alice creates a task
    new_task_res = client.post("/api/tasks", headers=alice_headers, json={
        "id": "alice-task-1",
        "title": "Simulate Surface-17 Qubit Lattice",
        "priority": "urgent",
        "category": "Research",
        "estimated_minutes": 90,
        "status": "todo"
    })
    assert new_task_res.status_code == 200

    # 7. Bob checks tasks - Must NOT see Alice's task!
    bob_tasks_res = client.get("/api/tasks", headers=bob_headers)
    assert bob_tasks_res.status_code == 200
    assert len(bob_tasks_res.json()) == 0

    # 8. Alice logs out and logs back in
    login_res = client.post("/api/auth/login", json={
        "email": alice_email,
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    assert login_res.json()["has_onboarded"] is True

    # 9. Invalid login rejected
    bad_login = client.post("/api/auth/login", json={
        "email": alice_email,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401
    print("Multi-user isolation and auth tests passed successfully!")

if __name__ == "__main__":
    test_auth_and_user_isolation()
