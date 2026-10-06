import os
import json
import sqlite3
from typing import Optional, Dict, Any, List
from contextlib import contextmanager
from app.config import settings

class DatabaseManager:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or settings.DB_PATH
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()
        self._migrate_legacy_json()

    @contextmanager
    def get_connection(self):
        """Thread-safe SQLite connection context with WAL mode and row factory."""
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def _init_db(self):
        with self.get_connection() as conn:
            # Users & Auth Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    has_onboarded INTEGER DEFAULT 0
                );
            """)

            # Digital Twins Table (per-user state, goals, habits, memories, insights, focus)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS twins (
                    user_id TEXT PRIMARY KEY,
                    data_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                );
            """)

            # Temporal State History Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS state_history (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    snapshot_json TEXT NOT NULL,
                    entropy REAL DEFAULT 0.0,
                    timestamp TEXT NOT NULL,
                    event_trigger TEXT DEFAULT 'Auto',
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_state_history_user ON state_history (user_id, timestamp);")

            # World Model Knowledge Graph Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS world_model (
                    user_id TEXT PRIMARY KEY,
                    graph_json TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                );
            """)

            # World Model History / Propagation Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS world_history (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    record_json TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_world_history_user ON world_history (user_id, timestamp);")

            # Recommendation Decisions Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS recommendations (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    decision_json TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                );
            """)

    def _migrate_legacy_json(self):
        """Migrate legacy JSON flat-files to SQLite once if database is fresh."""
        try:
            data_dir = settings.DATA_DIR
            users_file = os.path.join(data_dir, "users.json")
            twins_dir = os.path.join(data_dir, "twins")
            state_history_dir = os.path.join(data_dir, "state_history")
            world_history_dir = os.path.join(data_dir, "world_history")

            with self.get_connection() as conn:
                # Check if users table already populated
                user_count = conn.execute("SELECT COUNT(*) as count FROM users").fetchone()["count"]
                if user_count == 0 and os.path.exists(users_file):
                    with open(users_file, "r", encoding="utf-8") as f:
                        users_data = json.load(f)
                    for uid, u in users_data.items():
                        conn.execute("""
                            INSERT OR IGNORE INTO users (id, email, name, password_hash, salt, created_at, has_onboarded)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        """, (
                            u.get("id", uid),
                            u.get("email", "").lower().strip(),
                            u.get("name", "User"),
                            u.get("password_hash", ""),
                            u.get("salt", ""),
                            u.get("created_at", ""),
                            1 if u.get("has_onboarded", False) else 0
                        ))

                # Migrate twins
                if os.path.exists(twins_dir):
                    for filename in os.listdir(twins_dir):
                        if filename.endswith(".json"):
                            user_id = filename[:-5]
                            filepath = os.path.join(twins_dir, filename)
                            with open(filepath, "r", encoding="utf-8") as f:
                                twin_json_str = f.read()
                            conn.execute("""
                                INSERT OR IGNORE INTO users (id, email, name, password_hash, salt, created_at, has_onboarded)
                                VALUES (?, ?, ?, '', '', datetime('now'), 1)
                            """, (user_id, f"{user_id}@pratibimb.ai", user_id.replace("_", " ").title()))
                            conn.execute("""
                                INSERT OR REPLACE INTO twins (user_id, data_json, updated_at)
                                VALUES (?, ?, datetime('now'))
                            """, (user_id, twin_json_str))

                # Migrate state history
                if os.path.exists(state_history_dir):
                    for filename in os.listdir(state_history_dir):
                        if filename.endswith(".json"):
                            user_id = filename[:-5]
                            filepath = os.path.join(state_history_dir, filename)
                            with open(filepath, "r", encoding="utf-8") as f:
                                history_list = json.load(f)
                            conn.execute("""
                                INSERT OR IGNORE INTO users (id, email, name, password_hash, salt, created_at, has_onboarded)
                                VALUES (?, ?, ?, '', '', datetime('now'), 1)
                            """, (user_id, f"{user_id}@pratibimb.ai", user_id.replace("_", " ").title()))
                            for snap in history_list:
                                sid = snap.get("id", f"snap-{snap.get('timestamp', '')}")
                                entropy = snap.get("entropy", 0.0)
                                ts = snap.get("timestamp", "")
                                trigger = snap.get("event_trigger", "Migration")
                                conn.execute("""
                                    INSERT OR REPLACE INTO state_history (id, user_id, snapshot_json, entropy, timestamp, event_trigger)
                                    VALUES (?, ?, ?, ?, ?, ?)
                                """, (sid, user_id, json.dumps(snap), entropy, ts, trigger))

                # Migrate world history
                if os.path.exists(world_history_dir):
                    for filename in os.listdir(world_history_dir):
                        if filename.endswith(".json"):
                            user_id = filename[:-5]
                            filepath = os.path.join(world_history_dir, filename)
                            with open(filepath, "r", encoding="utf-8") as f:
                                wh_list = json.load(f)
                            conn.execute("""
                                INSERT OR IGNORE INTO users (id, email, name, password_hash, salt, created_at, has_onboarded)
                                VALUES (?, ?, ?, '', '', datetime('now'), 1)
                            """, (user_id, f"{user_id}@pratibimb.ai", user_id.replace("_", " ").title()))
                            for rec in wh_list:
                                rid = rec.get("id", f"wh-{rec.get('timestamp', '')}")
                                ts = rec.get("timestamp", "")
                                conn.execute("""
                                    INSERT OR REPLACE INTO world_history (id, user_id, record_json, timestamp)
                                    VALUES (?, ?, ?, ?)
                                """, (rid, user_id, json.dumps(rec), ts))

        except Exception as e:
            # Migration is non-fatal for startup
            print("Notice during JSON-to-SQLite migration:", e)

    # -------------------------------------------------------------
    # User / Auth CRUD
    # -------------------------------------------------------------
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if row:
                d = dict(row)
                d["has_onboarded"] = bool(d["has_onboarded"])
                return d
            return None

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            row = conn.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),)).fetchone()
            if row:
                d = dict(row)
                d["has_onboarded"] = bool(d["has_onboarded"])
                return d
            return None

    def create_user(self, user_dict: Dict[str, Any]) -> Dict[str, Any]:
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO users (id, email, name, password_hash, salt, created_at, has_onboarded)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                user_dict["id"],
                user_dict["email"].lower().strip(),
                user_dict["name"].strip(),
                user_dict["password_hash"],
                user_dict["salt"],
                user_dict["created_at"],
                1 if user_dict.get("has_onboarded", False) else 0
            ))
            return user_dict

    def update_user_onboarded(self, user_id: str, name: Optional[str] = None):
        with self.get_connection() as conn:
            if name:
                conn.execute("UPDATE users SET has_onboarded = 1, name = ? WHERE id = ?", (name.strip(), user_id))
            else:
                conn.execute("UPDATE users SET has_onboarded = 1 WHERE id = ?", (user_id,))

    def list_all_users(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("SELECT * FROM users").fetchall()
            return [{**dict(r), "has_onboarded": bool(r["has_onboarded"])} for r in rows]

    # -------------------------------------------------------------
    # Digital Twin CRUD
    # -------------------------------------------------------------
    def get_twin(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            row = conn.execute("SELECT data_json FROM twins WHERE user_id = ?", (user_id,)).fetchone()
            if row:
                return json.loads(row["data_json"])
            return None

    def save_twin(self, user_id: str, twin_data: Dict[str, Any]):
        with self.get_connection() as conn:
            # Ensure user exists to satisfy foreign key
            conn.execute("""
                INSERT OR IGNORE INTO users (id, email, name, password_hash, salt, created_at, has_onboarded)
                VALUES (?, ?, ?, '', '', datetime('now'), 1)
            """, (user_id, f"{user_id}@pratibimb.ai", user_id.replace("_", " ").title()))

            conn.execute("""
                INSERT OR REPLACE INTO twins (user_id, data_json, updated_at)
                VALUES (?, ?, datetime('now'))
            """, (user_id, json.dumps(twin_data)))

    # -------------------------------------------------------------
    # State History CRUD
    # -------------------------------------------------------------
    def get_state_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("""
                SELECT snapshot_json FROM state_history 
                WHERE user_id = ? 
                ORDER BY timestamp DESC 
                LIMIT ?
            """, (user_id, limit)).fetchall()
            return [json.loads(r["snapshot_json"]) for r in rows]

    def add_state_snapshot(self, user_id: str, snapshot: Dict[str, Any]):
        sid = snapshot.get("id", f"snap-{snapshot.get('timestamp', '')}")
        entropy = float(snapshot.get("entropy", 0.0))
        ts = snapshot.get("timestamp", "")
        trigger = snapshot.get("event_trigger", "Manual")
        with self.get_connection() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO users (id, email, name, password_hash, salt, created_at, has_onboarded)
                VALUES (?, ?, ?, '', '', datetime('now'), 1)
            """, (user_id, f"{user_id}@pratibimb.ai", user_id.replace("_", " ").title()))
            conn.execute("""
                INSERT OR REPLACE INTO state_history (id, user_id, snapshot_json, entropy, timestamp, event_trigger)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (sid, user_id, json.dumps(snapshot), entropy, ts, trigger))

    # -------------------------------------------------------------
    # World Model CRUD
    # -------------------------------------------------------------
    def get_world_model(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            row = conn.execute("SELECT graph_json FROM world_model WHERE user_id = ?", (user_id,)).fetchone()
            if row:
                return json.loads(row["graph_json"])
            return None

    def save_world_model(self, user_id: str, graph_data: Dict[str, Any]):
        with self.get_connection() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO users (id, email, name, password_hash, salt, created_at, has_onboarded)
                VALUES (?, ?, ?, '', '', datetime('now'), 1)
            """, (user_id, f"{user_id}@pratibimb.ai", user_id.replace("_", " ").title()))
            conn.execute("""
                INSERT OR REPLACE INTO world_model (user_id, graph_json, updated_at)
                VALUES (?, ?, datetime('now'))
            """, (user_id, json.dumps(graph_data)))

    def get_world_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            rows = conn.execute("""
                SELECT record_json FROM world_history 
                WHERE user_id = ? 
                ORDER BY timestamp DESC 
                LIMIT ?
            """, (user_id, limit)).fetchall()
            return [json.loads(r["record_json"]) for r in rows]

    def add_world_history_record(self, user_id: str, record: Dict[str, Any]):
        rid = record.get("id", f"wh-{record.get('timestamp', '')}")
        ts = record.get("timestamp", "")
        with self.get_connection() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO users (id, email, name, password_hash, salt, created_at, has_onboarded)
                VALUES (?, ?, ?, '', '', datetime('now'), 1)
            """, (user_id, f"{user_id}@pratibimb.ai", user_id.replace("_", " ").title()))
            conn.execute("""
                INSERT OR REPLACE INTO world_history (id, user_id, record_json, timestamp)
                VALUES (?, ?, ?, ?)
            """, (rid, user_id, json.dumps(record), ts))

    # -------------------------------------------------------------
    # Recommendation Decisions CRUD
    # -------------------------------------------------------------
    def add_recommendation_decision(self, user_id: str, decision: Dict[str, Any]):
        did = decision.get("decision_id", f"dec-{decision.get('timestamp', '')}")
        ts = decision.get("timestamp", "")
        with self.get_connection() as conn:
            conn.execute("""
                INSERT OR IGNORE INTO users (id, email, name, password_hash, salt, created_at, has_onboarded)
                VALUES (?, ?, ?, '', '', datetime('now'), 1)
            """, (user_id, f"{user_id}@pratibimb.ai", user_id.replace("_", " ").title()))
            conn.execute("""
                INSERT OR REPLACE INTO recommendations (id, user_id, decision_json, timestamp)
                VALUES (?, ?, ?, ?)
            """, (did, user_id, json.dumps(decision), ts))

db = DatabaseManager()
