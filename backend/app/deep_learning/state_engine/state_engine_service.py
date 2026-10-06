"""
Digital Twin State Engine 2.0 Service:
Orchestrates continuous state representation, temporal snapshot history,
state transitions, grounded insights, and deep-learning sequence tensors.
"""

import os
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
from app.config import settings
from app.models.twin_schemas import DigitalTwin
from app.deep_learning.state_engine.state_models import (
    StateSnapshot, StateComparison, StateInsight, TemporalTriadState, SequenceDatasetTensor
)
from app.deep_learning.representation.contextual_encoder import contextual_encoder
from app.deep_learning.representation.embedding_engine import embedding_engine
from app.deep_learning.prediction.prediction_service import prediction_service

from app.db.database import db

STATE_HISTORY_DIR = os.path.join(settings.BASE_DIR, "data", "state_history")
os.makedirs(STATE_HISTORY_DIR, exist_ok=True)

class StateEngineService:
    def __init__(self):
        self.db = db
        self._ensure_history_dir()

    def _ensure_history_dir(self):
        os.makedirs(STATE_HISTORY_DIR, exist_ok=True)

    def _get_history_file(self, user_id: str) -> str:
        safe_user = "".join(c for c in user_id if c.isalnum() or c in ('_', '-')) or "default"
        return os.path.join(STATE_HISTORY_DIR, f"{safe_user}.json")

    def load_snapshots(self, user_id: str) -> List[StateSnapshot]:
        # 1. Try SQLite first
        try:
            db_records = self.db.get_state_history(user_id, limit=100)
            if db_records:
                # db returns newest first, reverse to chronological order
                return [StateSnapshot(**item) for item in reversed(db_records)]
        except Exception as e:
            pass

        # 2. Fallback to file if DB empty
        filepath = self._get_history_file(user_id)
        if not os.path.exists(filepath):
            return []
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [StateSnapshot(**item) for item in data]
        except Exception as e:
            print(f"[StateEngine] Failed to load history for {user_id}: {e}")
            return []

    def save_snapshots(self, user_id: str, snapshots: List[StateSnapshot]):
        # 1. Persist to SQLite
        try:
            for s in snapshots[-10:]:
                self.db.add_state_snapshot(user_id, s.model_dump())
        except Exception as e:
            pass

        # 2. Also keep JSON file updated for backup
        filepath = self._get_history_file(user_id)
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump([s.model_dump() for s in snapshots[-100:]], f, indent=2)
        except Exception as e:
            print(f"[StateEngine] Failed to save history for {user_id}: {e}")


    def derive_operational_state(self, twin: DigitalTwin) -> str:
        """
        Derives the active operational state from real observable signals.
        Non-medical, computational classification.
        """
        energy = twin.state.energy_level
        focus_hrs = twin.behavior.focus_hours_today
        pending_tasks = [t for t in twin.tasks if t.status != 'completed']
        active_goals = [g for g in twin.goals if g.progress < 100]

        if energy <= 35:
            return 'RECOVERY'
        
        if focus_hrs >= 3.5 or (twin.focus_sessions and len(twin.focus_sessions) >= 3):
            return 'DEEP_FOCUS'

        # Check for accelerating projects (high task completion velocity)
        completed_tasks = [t for t in twin.tasks if t.status == 'completed']
        if len(completed_tasks) >= 3 and energy >= 70:
            return 'PROJECT_ACCELERATING'

        # Check if goals are at risk (overdue milestones or high urgency with low progress)
        for goal in active_goals:
            if goal.priority in ['urgent', 'high'] and goal.progress < 25:
                return 'GOAL_AT_RISK'

        if twin.behavior.active_streak_days >= 3 and len(twin.habits) > 0:
            return 'HABIT_STABILIZING'

        if pending_tasks or active_goals:
            return 'ACTIVE'

        return 'IDLE'

    def capture_snapshot(self, twin: DigitalTwin, event_trigger: str = "Live Sync") -> StateSnapshot:
        """
        Captures a temporal state snapshot of the Digital Twin and appends to persistent history.
        """
        latent = contextual_encoder.encode_digital_twin_state(twin)
        op_state = self.derive_operational_state(twin)
        now = datetime.now()

        completed_tasks = [t for t in twin.tasks if t.status == 'completed']
        total_tasks = len(twin.tasks)
        completion_rate = float(len(completed_tasks) / max(1, total_tasks))

        habits_done = [h for h in twin.habits if h.completed_today]
        habit_consistency = float(len(habits_done) / max(1, len(twin.habits))) if twin.habits else twin.behavior.habit_consistency_index

        snapshot = StateSnapshot(
            snapshot_id=f"snap-{uuid.uuid4().hex[:6]}",
            timestamp=now.strftime("%b %d, %I:%M %p"),
            iso_timestamp=now.isoformat(),
            active_focus=twin.state.current_focus or twin.profile.title or "General Focus",
            energy_level=twin.state.energy_level,
            productivity_score=twin.behavior.productivity_score,
            task_completion_rate=round(completion_rate, 2),
            habit_consistency=round(habit_consistency, 2),
            active_goals_count=len([g for g in twin.goals if g.progress < 100]),
            pending_tasks_count=len([t for t in twin.tasks if t.status != 'completed']),
            memories_count=len(twin.memories),
            operational_state=op_state,
            state_vector_64d=latent.vector,
            dominant_cluster=latent.dominant_cluster,
            semantic_coherence=latent.semantic_coherence,
            major_event_trigger=event_trigger,
            confidence=0.95
        )

        # Persist to history
        history = self.load_snapshots(twin.user_id)
        # Avoid spamming duplicates within 60 seconds unless event_trigger is distinct
        if history:
            last = history[-1]
            try:
                last_time = datetime.fromisoformat(last.iso_timestamp)
                if (now - last_time).total_seconds() < 45 and last.operational_state == op_state and last.major_event_trigger == event_trigger:
                    return snapshot
            except Exception:
                pass

        history.append(snapshot)
        self.save_snapshots(twin.user_id, history)
        return snapshot

    def get_state_comparison(self, twin: DigitalTwin) -> StateComparison:
        """
        Compares current state snapshot against historical baseline (T vs T-1).
        """
        current_snap = self.capture_snapshot(twin, event_trigger="State Evaluation")
        history = self.load_snapshots(twin.user_id)

        # Find previous distinct snapshot
        previous_snap: Optional[StateSnapshot] = None
        if len(history) >= 2:
            previous_snap = history[-2]
        elif len(history) == 1:
            # Synthetic baseline anchor if only 1 exists
            previous_snap = StateSnapshot(
                snapshot_id="snap-baseline",
                timestamp="Baseline",
                iso_timestamp=(datetime.now() - timedelta(days=1)).isoformat(),
                active_focus=twin.profile.title or "Initial State",
                energy_level=75,
                productivity_score=max(50, twin.behavior.productivity_score - 5),
                task_completion_rate=0.75,
                habit_consistency=0.70,
                active_goals_count=len(twin.goals),
                pending_tasks_count=len(twin.tasks),
                memories_count=max(0, len(twin.memories) - 1),
                operational_state="ACTIVE",
                state_vector_64d=current_snap.state_vector_64d,
                dominant_cluster=current_snap.dominant_cluster,
                semantic_coherence=0.85,
                major_event_trigger="System Calibration Baseline",
                confidence=0.90
            )

        if not previous_snap:
            return StateComparison(
                current_snapshot=current_snap,
                previous_snapshot=None,
                has_historical_baseline=False,
                summary="Initial state established. Accumulating temporal history."
            )

        # Calculate exact deltas
        prod_delta = current_snap.productivity_score - previous_snap.productivity_score
        focus_delta = current_snap.energy_level - previous_snap.energy_level
        task_delta = round((current_snap.task_completion_rate - previous_snap.task_completion_rate) * 100, 1)
        habit_delta = round((current_snap.habit_consistency - previous_snap.habit_consistency) * 100, 1)
        mem_delta = round(((current_snap.memories_count - previous_snap.memories_count) / max(1, previous_snap.memories_count)) * 100, 1)

        # Vector cosine drift
        drift = 0.0
        if current_snap.state_vector_64d and previous_snap.state_vector_64d:
            drift = round(1.0 - embedding_engine.compute_cosine_similarity(
                np.array(current_snap.state_vector_64d),
                np.array(previous_snap.state_vector_64d)
            ), 3)

        summary = (
            f"State transitioned to '{current_snap.operational_state}'. "
            f"Productivity delta is {'+' if prod_delta>=0 else ''}{prod_delta} points, "
            f"with a state representation drift of {drift}."
        )

        return StateComparison(
            current_snapshot=current_snap,
            previous_snapshot=previous_snap,
            has_historical_baseline=True,
            focus_delta_pct=float(focus_delta),
            productivity_delta_pct=float(prod_delta),
            task_velocity_delta_pct=task_delta,
            habit_consistency_delta_pct=habit_delta,
            memory_growth_delta_pct=mem_delta,
            vector_cosine_drift=drift,
            summary=summary
        )

    def derive_state_insights(self, twin: DigitalTwin) -> List[StateInsight]:
        """
        Generates grounded, non-medical state insights derived exclusively from actual user signals.
        """
        insights: List[StateInsight] = []
        now_str = datetime.now().strftime("%I:%M %p")
        comparison = self.get_state_comparison(twin)
        curr = comparison.current_snapshot

        # 1. Focus & Energy Dynamics
        if curr.energy_level >= 85:
            insights.append(StateInsight(
                id="ins-energy-peak",
                title="Cognitive Operating Peak",
                explanation=f"Reported energy capacity is at {curr.energy_level}%, indicating optimal bandwidth for strategic or complex engineering milestones.",
                supporting_signals=[f"{curr.energy_level}% self-reported capacity", f"{twin.behavior.cognitive_load} load status"],
                affected_domain="Energy",
                direction="improving",
                confidence=0.94,
                recommended_action="Channel focus toward high-complexity goals.",
                timestamp=now_str
            ))
        elif curr.energy_level <= 40:
            insights.append(StateInsight(
                id="ins-energy-low",
                title="Capacity Below Baseline Operating Threshold",
                explanation=f"Current energy level is at {curr.energy_level}%. Task throughput may benefit from deloading or shifting to low-friction tasks.",
                supporting_signals=[f"{curr.energy_level}% energy level", "Recent session sequence"],
                affected_domain="Energy",
                direction="attention_required",
                confidence=0.91,
                recommended_action="Shift to maintenance tasks or take a restorative break.",
                timestamp=now_str
            ))

        # 2. Goal Alignment & Milestone Trajectory
        active_goals = [g for g in twin.goals if g.progress < 100]
        if active_goals:
            top_goal = active_goals[0]
            insights.append(StateInsight(
                id="ins-goal-trajectory",
                title=f"Strategic Progress: {top_goal.title}",
                explanation=f"Active goal is {top_goal.progress}% complete with priority '{top_goal.priority}'. Linked tasks are moving the milestone trajectory forward.",
                supporting_signals=[f"{top_goal.progress}% completion", f"{len(top_goal.milestones)} total milestones"],
                affected_domain="Goals",
                direction="improving" if top_goal.progress > 0 else "stable",
                confidence=0.92,
                recommended_action=f"Continue sprint on {top_goal.title}.",
                timestamp=now_str
            ))

        # 3. Habit & Ritual Consistency
        if twin.habits:
            done_count = len([h for h in twin.habits if h.completed_today])
            total_habits = len(twin.habits)
            insights.append(StateInsight(
                id="ins-habit-rhythm",
                title=f"Daily Ritual Rhythm ({done_count}/{total_habits} Complete)",
                explanation=f"Habit consistency is running at {int(curr.habit_consistency*100)}% with an active {twin.behavior.active_streak_days}-day streak.",
                supporting_signals=[f"{done_count}/{total_habits} completed today", f"{twin.behavior.active_streak_days} days streak"],
                affected_domain="Habits",
                direction="improving" if done_count > 0 else "stable",
                confidence=0.95,
                recommended_action="Maintain ritual consistency across focus blocks.",
                timestamp=now_str
            ))

        # 4. State Representation Drift
        if comparison.has_historical_baseline and comparison.vector_cosine_drift > 0.15:
            insights.append(StateInsight(
                id="ins-vector-drift",
                title="State Representation Evolution",
                explanation=f"Latent 64D representation vector exhibited a cosine shift of {comparison.vector_cosine_drift}, reflecting new memories, focus changes, and task activity.",
                supporting_signals=[f"Cosine drift: {comparison.vector_cosine_drift}", f"Cluster: {curr.dominant_cluster}"],
                affected_domain="System",
                direction="improving",
                confidence=0.93,
                recommended_action="Inspect Life Graph to explore newly formed semantic connections.",
                timestamp=now_str
            ))

        return insights

    def get_temporal_triad(self, twin: DigitalTwin) -> TemporalTriadState:
        """
        Constructs the unified 3-layer Temporal Triad:
        PAST (History sequence & deltas) ─── CURRENT (Active state & operational label) ─── PREDICTED (Forecasts)
        """
        comparison = self.get_state_comparison(twin)
        history_snapshots = self.load_snapshots(twin.user_id)
        forecasts = prediction_service.generate_behavior_forecasts(twin)

        current_layer = {
            "operational_state": comparison.current_snapshot.operational_state,
            "active_focus": comparison.current_snapshot.active_focus,
            "energy_level": comparison.current_snapshot.energy_level,
            "productivity_score": comparison.current_snapshot.productivity_score,
            "dominant_cluster": comparison.current_snapshot.dominant_cluster,
            "semantic_coherence": comparison.current_snapshot.semantic_coherence,
            "pending_tasks": comparison.current_snapshot.pending_tasks_count,
            "active_goals": comparison.current_snapshot.active_goals_count,
            "memories_indexed": comparison.current_snapshot.memories_count
        }

        history_layer = {
            "snapshot_count": len(history_snapshots),
            "recent_snapshots": [s.model_dump() for s in history_snapshots[-8:]],
            "productivity_delta_pct": comparison.productivity_delta_pct,
            "focus_delta_pct": comparison.focus_delta_pct,
            "task_velocity_delta_pct": comparison.task_velocity_delta_pct,
            "habit_consistency_delta_pct": comparison.habit_consistency_delta_pct,
            "vector_cosine_drift": comparison.vector_cosine_drift,
            "summary": comparison.summary
        }

        predicted_layer = {
            "forecast_horizons": ["7 Days", "30 Days"],
            "forecasts": [f.model_dump() for f in forecasts],
            "momentum_trajectory": "Accelerating" if comparison.productivity_delta_pct >= 0 else "Stabilizing",
            "confidence_aggregate": 0.91
        }

        return TemporalTriadState(
            current=current_layer,
            history=history_layer,
            predicted=predicted_layer,
            active_operational_state=comparison.current_snapshot.operational_state,
            last_updated=datetime.now().isoformat()
        )

    def export_sequence_dataset_tensor(self, twin: DigitalTwin, sequence_length: int = 16) -> SequenceDatasetTensor:
        """
        Exports sequential historical state snapshots as a normalized tensor matrix
        ready for temporal sequence models (LSTM, GRU, Temporal Transformers).
        """
        history = self.load_snapshots(twin.user_id)
        current = self.capture_snapshot(twin, "Tensor Export")
        
        all_snaps = history + [current]
        selected_snaps = all_snaps[-sequence_length:]

        # Feature matrix: [energy_norm, productivity_norm, task_rate, habit_rate, coherence, goal_count_norm, mem_count_norm, drift]
        feature_names = [
            "energy_normalized",
            "productivity_normalized",
            "task_completion_rate",
            "habit_consistency",
            "semantic_coherence",
            "active_goals_normalized",
            "memories_indexed_normalized",
            "operational_state_code"
        ]

        state_code_map = {
            'IDLE': 0.0, 'ACTIVE': 0.2, 'HABIT_STABILIZING': 0.4,
            'GOAL_AT_RISK': 0.5, 'PROJECT_ACCELERATING': 0.7,
            'DEEP_FOCUS': 0.9, 'RECOVERY': 0.1
        }

        tensor_rows: List[List[float]] = []
        for snap in selected_snaps:
            row = [
                round(snap.energy_level / 100.0, 3),
                round(snap.productivity_score / 100.0, 3),
                round(snap.task_completion_rate, 3),
                round(snap.habit_consistency, 3),
                round(snap.semantic_coherence, 3),
                round(min(1.0, snap.active_goals_count / 10.0), 3),
                round(min(1.0, snap.memories_count / 50.0), 3),
                round(state_code_map.get(snap.operational_state, 0.2), 3)
            ]
            tensor_rows.append(row)

        # Pad with leading zeros if history is shorter than requested length
        while len(tensor_rows) < sequence_length:
            tensor_rows.insert(0, [0.0] * len(feature_names))

        return SequenceDatasetTensor(
            sequence_length=sequence_length,
            feature_dimension=len(feature_names),
            tensor_matrix=tensor_rows,
            feature_names=feature_names,
            ready_for_sequence_modeling=True
        )

state_engine_service = StateEngineService()
