"""
Personal Prediction Service:
Generates probabilistic, explainable forecasts for productivity, goal completion velocity,
and habit stability.
"""

from typing import List, Dict, Any
import numpy as np
from app.models.twin_schemas import DigitalTwin
from app.models.deep_learning_schemas import BehaviorForecast

class PersonalPredictionService:
    def generate_behavior_forecasts(self, twin: DigitalTwin) -> List[BehaviorForecast]:
        forecasts: List[BehaviorForecast] = []

        # 1. Productivity Score Forecast
        curr_prod = float(twin.behavior.productivity_score)
        energy_mod = (twin.state.energy_level - 75.0) * 0.1
        proj_7d_prod = min(98.0, max(40.0, curr_prod + energy_mod + 1.5))
        proj_30d_prod = min(99.0, max(45.0, curr_prod + energy_mod * 1.5 + 3.0))

        forecasts.append(BehaviorForecast(
            metric_name="Productivity Index",
            current_value=curr_prod,
            projected_7d=round(proj_7d_prod, 1),
            projected_30d=round(proj_30d_prod, 1),
            confidence_interval=[round(proj_7d_prod - 4.5, 1), round(proj_7d_prod + 4.5, 1)],
            trend_direction="improving" if proj_7d_prod > curr_prod else "stable",
            driving_factors=["Energy stability", "Active task completion velocity", "Goal clarity"]
        ))

        # 2. Habit Consistency Forecast
        curr_habit = float(twin.behavior.habit_consistency_index * 100.0)
        habit_count = len(twin.habits)
        streak_days = twin.behavior.active_streak_days
        proj_7d_habit = min(98.0, curr_habit + (2.0 if streak_days > 5 else 0.5))
        proj_30d_habit = min(99.0, curr_habit + (5.0 if streak_days > 10 else 1.5))

        forecasts.append(BehaviorForecast(
            metric_name="Habit Consistency",
            current_value=curr_habit,
            projected_7d=round(proj_7d_habit, 1),
            projected_30d=round(proj_30d_habit, 1),
            confidence_interval=[round(proj_7d_habit - 5.0, 1), round(proj_7d_habit + 5.0, 1)],
            trend_direction="improving" if streak_days > 7 else "stable",
            driving_factors=[f"{streak_days}-day active streak", f"{habit_count} daily rituals active"]
        ))

        # 3. Focus Velocity Forecast (Weekly Focus Hours)
        curr_focus = float(twin.behavior.weekly_focus_avg)
        proj_7d_focus = min(8.0, max(2.0, curr_focus + 0.3))
        proj_30d_focus = min(9.0, max(2.5, curr_focus + 0.8))

        forecasts.append(BehaviorForecast(
            metric_name="Daily Deep Focus (Hours)",
            current_value=curr_focus,
            projected_7d=round(proj_7d_focus, 1),
            projected_30d=round(proj_30d_focus, 1),
            confidence_interval=[round(proj_7d_focus - 0.6, 1), round(proj_7d_focus + 0.6, 1)],
            trend_direction="improving",
            driving_factors=["Scheduled morning focus blocks", "Reduced context switching"]
        ))

        return forecasts

prediction_service = PersonalPredictionService()
