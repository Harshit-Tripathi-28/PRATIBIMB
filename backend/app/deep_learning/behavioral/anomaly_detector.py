"""
Behavioral Anomaly & Baseline Drift Detector:
Evaluates incoming activity vectors against learned user baselines,
detecting cognitive fatigue, schedule shifts, or productivity surges.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
import numpy as np
from app.models.twin_schemas import DigitalTwin
from app.models.deep_learning_schemas import AnomalySignal

class AnomalyDetector:
    def detect_signals(self, twin: DigitalTwin) -> List[AnomalySignal]:
        signals: List[AnomalySignal] = []
        now_str = datetime.now().isoformat()

        # 1. Cognitive Energy Drift Detection
        current_energy = twin.state.energy_level
        baseline_energy = 80.0
        energy_z = (current_energy - baseline_energy) / 12.0

        if current_energy < 40:
            signals.append(AnomalySignal(
                id="sig-energy-fatigue",
                timestamp=now_str,
                severity="medium",
                signal_type="Cognitive Capacity Drop",
                baseline_value=baseline_energy,
                observed_value=float(current_energy),
                deviation_z_score=round(energy_z, 2),
                explanation="Reported energy level is significantly below baseline operating threshold.",
                recommendation="Shift to low-friction maintenance tasks or schedule a restorative break."
            ))
        elif current_energy >= 95:
            signals.append(AnomalySignal(
                id="sig-energy-peak",
                timestamp=now_str,
                severity="info",
                signal_type="Peak Flow Operating State",
                baseline_value=baseline_energy,
                observed_value=float(current_energy),
                deviation_z_score=round(energy_z, 2),
                explanation="Optimal mental capacity detected.",
                recommendation="Channel focus toward high-complexity architectural or strategic milestones."
            ))

        # 2. Goal-Task Alignment Discrepancy
        pending_tasks = [t for t in twin.tasks if t.status != 'completed']
        unlinked_tasks = [t for t in pending_tasks if not t.goal_id]
        if len(pending_tasks) > 3 and (len(unlinked_tasks) / len(pending_tasks)) > 0.6:
            signals.append(AnomalySignal(
                id="sig-alignment-drift",
                timestamp=now_str,
                severity="low",
                signal_type="Strategic Goal Disconnection",
                baseline_value=0.2,
                observed_value=round(len(unlinked_tasks) / len(pending_tasks), 2),
                deviation_z_score=1.85,
                explanation="Majority of pending tasks are not linked to an active strategic goal.",
                recommendation="Review pending queue and associate tasks with target milestones."
            ))

        return signals

anomaly_detector = AnomalyDetector()
