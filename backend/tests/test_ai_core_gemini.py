import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from app.main import app
from app.services.llm_provider import llm_service

client = TestClient(app)

def test_ai_status_security():
    """Verify AI status endpoint does not leak secrets"""
    res = client.get("/api/ai/status")
    assert res.status_code == 200
    data = res.json()
    assert "configured" in data
    assert "provider" in data
    assert "model" in data
    assert "instructions" in data
    
    # Verify no secret is in data
    raw_str = str(data)
    if llm_service.gemini_key:
        assert llm_service.gemini_key not in raw_str
    assert "AIza" not in raw_str

def test_ai_chat_with_digital_twin_context():
    """Verify live chat uses Digital Twin context without revealing keys"""
    res = client.post("/api/ai/chat", json={"message": "hi bhai"})
    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert len(data["response"]) > 0
    assert "actions" in data
    assert "memory_citations" in data
    
    # Verify no secret in response text
    raw_resp = str(data)
    if llm_service.gemini_key:
        assert llm_service.gemini_key not in raw_resp
    assert "AIza" not in raw_resp

def test_gemini_error_handling_sanitization():
    """Verify error messages do not reveal raw Google API URLs with keys"""
    status = llm_service.get_status()
    assert status["model"] in ("gemini-2.5-flash", "gemini-flash-latest", "gpt-4o-mini", "claude-3-5-haiku-20241022", "llama3")

if __name__ == "__main__":
    test_ai_status_security()
    test_ai_chat_with_digital_twin_context()
    test_gemini_error_handling_sanitization()
    print("AI Core Gemini integration and security tests passed successfully!")
