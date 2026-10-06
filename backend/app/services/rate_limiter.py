"""
PRATIBIMB AI Endpoint Rate Limiter:
Lightweight sliding-window token bucket / timestamp deque limiter per user/IP.
Protects LLM cognitive reasoning and simulation endpoints from exhaustion.
"""

import time
from collections import defaultdict, deque
from fastapi import HTTPException, Request, Depends
from app.config import settings

class SlidingWindowRateLimiter:
    def __init__(self, requests_per_minute: int = 30, window_seconds: int = 60):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = window_seconds
        self.history = defaultdict(deque)

    def is_rate_limited(self, key: str) -> bool:
        now = time.time()
        deq = self.history[key]

        # Purge timestamps older than the window
        while deq and deq[0] <= now - self.window_seconds:
            deq.popleft()

        if len(deq) >= self.requests_per_minute:
            return True

        deq.append(now)
        return False

ai_rate_limiter = SlidingWindowRateLimiter(
    requests_per_minute=settings.AI_RATE_LIMIT_PER_MINUTE,
    window_seconds=60
)

def check_ai_rate_limit(request: Request):
    """FastAPI dependency to rate limit expensive AI endpoints."""
    # Identify client by user_id header or client host
    client_ip = request.client.host if request.client else "127.0.0.1"
    auth_header = request.headers.get("Authorization", "")
    key = auth_header if auth_header else client_ip

    if ai_rate_limiter.is_rate_limited(key):
        raise HTTPException(
            status_code=429,
            detail="AI Core rate limit exceeded. Please wait a moment before sending another request."
        )
