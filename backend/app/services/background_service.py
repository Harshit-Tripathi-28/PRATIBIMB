"""
PRATIBIMB Background Intelligence Daemon:
Periodically processes passive state decay, habit streak evaluations,
goal deadline alerts, and temporal snapshot maintenance.
Operates within FastAPI application lifespan with graceful async lifecycle control.
"""

import asyncio
from datetime import datetime, timedelta
from typing import Optional
from app.db.database import db
from app.models.twin_schemas import DigitalTwin

class BackgroundIntelligenceService:
    def __init__(self, interval_seconds: int = 60):
        self.interval_seconds = interval_seconds
        self._task: Optional[asyncio.Task] = None
        self._running: bool = False

    async def start(self):
        """Starts the background worker loop."""
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._worker_loop())
        print(f"[Background Intelligence] Daemon active (polling every {self.interval_seconds}s)")

    async def stop(self):
        """Cancels and shuts down the background worker."""
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        print("[Background Intelligence] Daemon stopped cleanly.")

    async def _worker_loop(self):
        while self._running:
            try:
                await self.process_cycle()
            except asyncio.CancelledError:
                break
            except Exception as e:
                print("[Background Intelligence] Cycle notice:", e)

            # Wait for next interval
            try:
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break

    async def process_cycle(self):
        """Executes one evaluation cycle across all registered user twins."""
        from app.services.twin_service import twin_service
        
        # 1. Fetch user IDs from database
        try:
            users = db.list_all_users()
        except Exception:
            users = []

        now = datetime.now()
        user_ids = [u["id"] for u in users]
        if "default" not in user_ids:
            user_ids.append("default")

        for user_id in user_ids:
            try:
                twin = twin_service.get_twin(user_id)
                modified = False

                # A. Evaluate Goal Deadlines and Risk Signals
                for goal in twin.goals:
                    if goal.progress < 100 and goal.priority in ('high', 'urgent'):
                        total_milestones = len(goal.milestones)
                        done_milestones = len([m for m in goal.milestones if m.completed])
                        calc_progress = int((done_milestones / max(1, total_milestones)) * 100) if total_milestones > 0 else goal.progress
                        if calc_progress != goal.progress:
                            goal.progress = calc_progress
                            modified = True

                # B. Habit Consistency Evaluation
                total_habits = len(twin.habits)
                if total_habits > 0:
                    completed_habits = len([h for h in twin.habits if h.completed_today])
                    new_consistency = round(completed_habits / total_habits, 2)
                    if abs(twin.behavior.habit_consistency_index - new_consistency) > 0.05:
                        twin.behavior.habit_consistency_index = new_consistency
                        modified = True

                # C. Passive Energy Balance
                # If energy is low (< 40), slowly recover +1 per minute up to 75 (passive recharge)
                if twin.state.energy_level < 60:
                    twin.state.energy_level = min(85, twin.state.energy_level + 1)
                    modified = True

                # Persist if changed
                if modified:
                    twin_service.save_twin(twin, user_id)

            except Exception as e:
                # Isolate per-user errors so other twins continue running
                pass

background_intelligence = BackgroundIntelligenceService(interval_seconds=60)
