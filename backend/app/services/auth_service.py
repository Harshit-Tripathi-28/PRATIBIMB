import os
import json
import uuid
import hmac
import hashlib
import time
from typing import Optional, Dict, List
from app.config import settings
from app.models.twin_schemas import UserAccount, SignUpRequest, LoginRequest, AuthResponse

DATA_DIR = os.path.join(settings.BASE_DIR, "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "pratibimb_digital_twin_super_secret_signing_key_2026")

class AuthService:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self.users: Dict[str, UserAccount] = self._load_users()

    def _load_users(self) -> Dict[str, UserAccount]:
        if os.path.exists(USERS_FILE):
            try:
                with open(USERS_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return {uid: UserAccount(**u) for uid, u in data.items()}
            except Exception as e:
                print("Notice: Initializing users storage:", e)
        return {}

    def _save_users(self):
        try:
            with open(USERS_FILE, 'w', encoding='utf-8') as f:
                json.dump({uid: u.model_dump() for uid, u in self.users.items()}, f, indent=2)
        except Exception as e:
            print("Failed to save users store:", e)

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
        sig = hmac.new(SECRET_KEY.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()
        return f"{payload}:{sig}"

    def verify_token(self, token: str) -> Optional[str]:
        if not token:
            return None
        parts = token.split(":")
        if len(parts) != 3:
            return None
        user_id, timestamp_str, sig = parts
        payload = f"{user_id}:{timestamp_str}"
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), payload.encode('utf-8'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        # Valid token
        if user_id in self.users or user_id.startswith("user_") or user_id.startswith("harshit_") or user_id == "demo_user":
            return user_id
        return None

    def signup(self, req: SignUpRequest) -> AuthResponse:
        email_clean = req.email.strip().lower()
        # Check if user already exists
        for u in self.users.values():
            if u.email.lower() == email_clean:
                raise ValueError("An account with this email already exists.")

        user_id = f"user_{uuid.uuid4().hex[:8]}"
        salt = uuid.uuid4().hex
        password_hash = self._hash_password(req.password, salt)
        now_str = time.strftime("%b %d, %Y - %I:%M %p")

        user = UserAccount(
            id=user_id,
            email=email_clean,
            name=req.name.strip(),
            password_hash=password_hash,
            salt=salt,
            created_at=now_str,
            has_onboarded=False
        )
        self.users[user_id] = user
        self._save_users()

        token = self._create_token(user_id)
        return AuthResponse(
            token=token,
            user_id=user_id,
            email=user.email,
            name=user.name,
            has_onboarded=False
        )

    def login(self, req: LoginRequest) -> AuthResponse:
        email_clean = req.email.strip().lower()
        found_user: Optional[UserAccount] = None
        for u in self.users.values():
            if u.email.lower() == email_clean:
                found_user = u
                break

        if not found_user:
            raise ValueError("Invalid email or password.")

        check_hash = self._hash_password(req.password, found_user.salt)
        if not hmac.compare_digest(check_hash, found_user.password_hash):
            raise ValueError("Invalid email or password.")

        token = self._create_token(found_user.id)
        return AuthResponse(
            token=token,
            user_id=found_user.id,
            email=found_user.email,
            name=found_user.name,
            has_onboarded=found_user.has_onboarded
        )

    def mark_onboarded(self, user_id: str, name: Optional[str] = None):
        if user_id in self.users:
            self.users[user_id].has_onboarded = True
            if name:
                self.users[user_id].name = name
            self._save_users()

    def get_user(self, user_id: str) -> Optional[UserAccount]:
        return self.users.get(user_id)

auth_service = AuthService()
