"""
Signal Attribution Engine:
Extracts metric deltas, directional shifts, and confidence scores
across Focus, Goals, Tasks, Habits, Memory, and Energy.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from app.models.twin_schemas import DigitalTwin
from app.deep_learning.state_engine.state_engine_service import state_engine_service
from app.deep_learning.cognition.cognition_schemas import AttributedSignal

class SignalAttributionEngine:
    def extract_attributed_signals(self, twin: DigitalTwin) -> List[AttributedSignal]:
        comparison = state_engine_service.get_state_comparison(twin)
        curr = comparison.current_snapshot
        prev = comparison.previous_snapshot
        now_str = datetime.now().strftime("%I:%M %p")

        signals: List[AttributedSignal] = []

        # 1. Productivity Score Signal
        prev_prod = float(prev.productivity_score) if prev else float(curr.productivity_score)
        curr_prod = float(curr.productivity_score)
        prod_delta = curr_prod - prev_prod
        prod_pct = round((prod_delta / max(1.0, prev_prod)) * 100, 1)
        signals.append(AttributedSignal(
            metric_name="Productivity Index",
            previous_value=prev_prod,
            current_value=curr_prod,
            delta_pct=prod_pct,
            direction="increasing" if prod_delta > 0 else ("decreasing" if prod_delta < 0 else "stable"),
            confidence=0.95,
            timestamp=now_str,
            domain="Focus"
        ))

        # 2. Focus Capacity / Energy Signal
        prev_energy = float(prev.energy_level) if prev else float(curr.energy_level)
        curr_energy = float(curr.energy_level)
        energy_delta = curr_energy - prev_energy
        energy_pct = round((energy_delta / max(1.0, prev_energy)) * 100, 1)
        signals.append(AttributedSignal(
            metric_name="Self-Reported Capacity (Energy)",
            previous_value=prev_energy,
            current_value=curr_energy,
            delta_pct=energy_pct,
            direction="increasing" if energy_delta > 0 else ("decreasing" if energy_delta < 0 else "stable"),
            confidence=0.94,
            timestamp=now_str,
            domain="Energy"
        ))

        # 3. Task Completion Velocity
        prev_task_rate = float(prev.task_completion_rate * 100) if prev else float(curr.task_completion_rate * 100)
        curr_task_rate = float(curr.task_completion_rate * 100)
        task_delta = curr_task_rate - prev_task_rate
        signals.append(AttributedSignal(
            metric_name="Task Completion Velocity",
            previous_value=round(prev_task_rate, 1),
            current_value=round(curr_task_rate, 1),
            delta_pct=round(task_delta, 1),
            direction="increasing" if task_delta > 0 else ("decreasing" if task_delta < 0 else "stable"),
            confidence=0.92,
            timestamp=now_str,
            domain="Tasks"
        ))

        # 4. Habit Ritual Consistency
        prev_habit_rate = float(prev.habit_consistency * 100) if prev else float(curr.habit_consistency * 100)
        curr_habit_rate = float(curr.habit_consistency * 100)
        habit_delta = curr_habit_rate - prev_habit_rate
        signals.append(AttributedSignal(
            metric_name="Habit Ritual Consistency",
            previous_value=round(prev_habit_rate, 1),
            current_value=round(curr_habit_rate, 1),
            delta_pct=round(habit_delta, 1),
            direction="increasing" if habit_delta > 0 else ("decreasing" if habit_delta < 0 else "stable"),
            confidence=0.96,
            timestamp=now_str,
            domain="Habits"
        ))

        # 5. Semantic Memory Ingestion Activity
        prev_mem = float(prev.memories_count) if prev else float(curr.memories_count)
        curr_mem = float(curr.memories_count)
        mem_delta_pct = round(((curr_mem - prev_mem) / max(1.0, prev_mem)) * 100, 1)
        signals.append(AttributedSignal(
            metric_name="Memory Node Ingestion",
            previous_value=prev_mem,
            current_value=curr_mem,
            delta_pct=mem_delta_pct,
            direction="increasing" if curr_mem > prev_mem else "stable",
            confidence=0.90,
            timestamp=now_str,
            domain="Memory"
        ))

        # 6. Representation Vector Drift
        drift = comparison.vector_cosine_drift
        signals.append(AttributedSignal(
            metric_name="Latent Representation Drift",
            previous_value=0.0,
            current_value=drift,
            delta_pct=round(drift * 100, 1),
            direction="increasing" if drift > 0.05 else "stable",
            confidence=0.93,
            timestamp=now_str,
            domain="System"
        ))

        return signals

signal_attribution_engine = SignalAttributionEngine()
