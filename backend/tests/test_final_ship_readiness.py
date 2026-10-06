import unittest
import json
import os
import time
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import db
from app.services.auth_service import auth_service
from app.services.twin_service import twin_service
from app.services.background_service import background_intelligence

class TestFinalShipReadiness(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.test_email_a = f"test_a_{int(time.time()*1000)}@pratibimb.ai"
        self.test_email_b = f"test_b_{int(time.time()*1000)}@pratibimb.ai"

    def test_01_health_and_diagnostics(self):
        """Verify /health and /api/health return valid system status."""
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "PRATIBIMB AI Digital Twin & Neural Engine")

        resp2 = self.client.get("/api/health")
        self.assertEqual(resp2.status_code, 200)

    def test_02_auth_and_user_isolation(self):
        """Verify signup, login, session tokens, and multi-user state isolation."""
        # 1. Signup User A
        resp_a = self.client.post("/api/auth/signup", json={
            "email": self.test_email_a,
            "password": "SecurePassword123!",
            "name": "Architect Alpha"
        })
        self.assertEqual(resp_a.status_code, 200)
        data_a = resp_a.json()
        token_a = data_a["token"]
        user_id_a = data_a["user_id"]
        self.assertTrue(token_a)

        # 2. Signup User B
        resp_b = self.client.post("/api/auth/signup", json={
            "email": self.test_email_b,
            "password": "SecurePassword456!",
            "name": "Architect Beta"
        })
        self.assertEqual(resp_b.status_code, 200)
        data_b = resp_b.json()
        token_b = data_b["token"]
        user_id_b = data_b["user_id"]

        self.assertNotEqual(user_id_a, user_id_b)

        # 3. User A adds a unique goal
        headers_a = {"Authorization": f"Bearer {token_a}"}
        resp_goal = self.client.post("/api/goals", headers=headers_a, json={
            "id": "goal-alpha-unique",
            "title": "Alpha Confidential Strategic Goal",
            "description": "User A proprietary project",
            "category": "Engineering",
            "priority": "urgent",
            "progress": 30,
            "deadline": "Q4",
            "milestones": []
        })
        self.assertEqual(resp_goal.status_code, 200)

        # 4. User B checks goals -> Must NOT see User A's goal
        headers_b = {"Authorization": f"Bearer {token_b}"}
        resp_twin_b = self.client.get("/api/twin", headers=headers_b)
        self.assertEqual(resp_twin_b.status_code, 200)
        twin_b_data = resp_twin_b.json()
        user_b_goal_titles = [g["title"] for g in twin_b_data.get("goals", [])]
        self.assertNotIn("Alpha Confidential Strategic Goal", user_b_goal_titles)

    def test_03_memory_vault_semantic_search(self):
        """Verify semantic memory search and cosine retrieval."""
        resp = self.client.post("/api/auth/signup", json={
            "email": f"mem_user_{int(time.time()*1000)}@pratibimb.ai",
            "password": "Password123!",
            "name": "Memory Explorer"
        })
        token = resp.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Add 2 distinct memories
        self.client.post("/api/memory/add", headers=headers, json={
            "id": "mem-torch-1",
            "type": "semantic",
            "content": "Deep learning architectures rely on PyTorch tensor backpropagation and CUDA acceleration.",
            "summary": "Neural tensor computation",
            "tags": ["deep learning", "pytorch", "neural"],
            "importance": 9
        })

        self.client.post("/api/memory/add", headers=headers, json={
            "id": "mem-cooking-2",
            "type": "episodic",
            "content": "Cooked a delicious vegetarian pasta recipe with basil and olive oil.",
            "summary": "Culinary recipe notes",
            "tags": ["cooking", "food", "recipe"],
            "importance": 4
        })

        # Search for AI / neural network
        search_resp = self.client.get("/api/memory/search?q=neural+network+tensor", headers=headers)
        self.assertEqual(search_resp.status_code, 200)
        search_data = search_resp.json()
        self.assertGreater(len(search_data["results"]), 0)
        top_result = search_data["results"][0]
        self.assertEqual(top_result["id"], "mem-torch-1")

    def test_04_state_timeline_and_export(self):
        """Verify State Engine triad, snapshot capture, and complete JSON export archive."""
        resp = self.client.post("/api/auth/signup", json={
            "email": f"timeline_user_{int(time.time()*1000)}@pratibimb.ai",
            "password": "Password123!",
            "name": "Timeline Master"
        })
        token = resp.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Trigger snapshot
        snap_resp = self.client.post("/api/dl/state/snapshot?event_trigger=Manual_Test_Anchor", headers=headers)
        self.assertEqual(snap_resp.status_code, 200)

        # 2. Get history
        hist_resp = self.client.get("/api/dl/state/history", headers=headers)
        self.assertEqual(hist_resp.status_code, 200)
        hist_data = hist_resp.json()
        self.assertGreaterEqual(len(hist_data["history"]), 1)

        # 3. Export full archive
        export_resp = self.client.get("/api/twin/export", headers=headers)
        self.assertEqual(export_resp.status_code, 200)
        export_data = export_resp.json()
        self.assertIn("export_metadata", export_data)
        self.assertIn("digital_twin", export_data)
        self.assertIn("state_history_snapshots", export_data)
        self.assertEqual(export_data["export_metadata"]["schema_version"], "2.0.0")

    def test_05_background_daemon_cycle(self):
        """Verify background intelligence worker executes without error."""
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(background_intelligence.process_cycle())
        finally:
            loop.close()

if __name__ == "__main__":
    unittest.main()
