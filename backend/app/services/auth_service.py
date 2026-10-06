import os
import uuid
import hmac
import hashlib
import time
from typing import Optional, Dict, List
from app.config import settings
from app.models.twin_schemas import UserAccount, SignUpRequest, LoginRequest, AuthResponse
from app.db.database import db

class AuthService:
    def __init__(self):
        self.db = db

    def _hash_password(self, password: str, salt: str) -> str:
        return hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()

    def _create_token(self, user_id: str) -> str:
        timestamp = int(time.time())
        payload = f"{user_id}:{timestamp}"
        sig = hmac.new(settings.SECRET_KEY.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()
        return f"{payload}:{sig}"

    def verify_token(self, token: str) -> Optional[str]:
        if not token:
            return None
        parts = token.split(":")
        if len(parts) != 3:
            return None
        user_id, timestamp_str, sig = parts
        payload = f"{user_id}:{timestamp_str}"
        expected_sig = hmac.new(settings.SECRET_KEY.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        
        # Verify user exists in database or is a valid standard session
        user_data = self.db.get_user_by_id(user_id)
        if user_data:
            return user_id
        if user_id.startswith("user_") or user_id.startswith("harshit_") or user_id == "demo_user":
            return user_id
        return None

    def signup(self, req: SignUpRequest) -> AuthResponse:
        email_clean = req.email.strip().lower()
        # Check if user already exists
        existing = self.db.get_user_by_email(email_clean)
        if existing:
            raise ValueError("An account with this email already exists.")

        user_id = f"user_{uuid.uuid4().hex[:8]}"
        salt = uuid.uuid4().hex
        password_hash = self._hash_password(req.password, salt)
        now_str = time.strftime("%b %d, %Y - %I:%M %p")

        user_dict = {
            "id": user_id,
            "email": email_clean,
            "name": req.name.strip(),
            "password_hash": password_hash,
            "salt": salt,
            "created_at": now_str,
            "has_onboarded": False
        }
        self.db.create_user(user_dict)

        token = self._create_token(user_id)
        return AuthResponse(
            token=token,
            user_id=user_id,
            email=user_dict["email"],
            name=user_dict["name"],
            has_onboarded=False
        )

    def login(self, req: LoginRequest) -> AuthResponse:
        email_clean = req.email.strip().lower()
        found_user = self.db.get_user_by_email(email_clean)

        if not found_user:
            raise ValueError("Invalid email or password.")

        check_hash = self._hash_password(req.password, found_user["salt"])
        if not hmac.compare_digest(check_hash, found_user["password_hash"]):
            raise ValueError("Invalid email or password.")

        token = self._create_token(found_user["id"])
        return AuthResponse(
            token=token,
            user_id=found_user["id"],
            email=found_user["email"],
            name=found_user["name"],
            has_onboarded=bool(found_user["has_onboarded"])
        )

    def mark_onboarded(self, user_id: str, name: Optional[str] = None):
        self.db.update_user_onboarded(user_id, name)

    def get_user(self, user_id: str) -> Optional[UserAccount]:
        u = self.db.get_user_by_id(user_id)
        if u:
            return UserAccount(**u)
        return None

auth_service = AuthService()
