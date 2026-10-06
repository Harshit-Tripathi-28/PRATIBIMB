"""
Cognitive Recommendation Engine:
Generates evidence-based, non-intrusive action proposals tied to specific insights.
"""

from typing import List, Dict, Any, Optional, Tuple
from app.models.twin_schemas import DigitalTwin
from app.deep_learning.cognition.cognition_schemas import AttributedSignal

class CognitiveRecommendationEngine:
    def generate_recommendation(
        self,
        category: str,
        domain: str,
        signals: List[AttributedSignal],
        twin: DigitalTwin
    ) -> Tuple[Optional[str], Optional[str], Dict[str, Any]]:
        """
        Generates actionable, non-prescriptive recommendation text, action type, and payload.
        """
        active_goals = [g for g in twin.goals if g.progress < 100]
        pending_tasks = [t for t in twin.tasks if t.status != 'completed']

        if domain == "Energy" and twin.state.energy_level <= 45:
            rec_text = "Schedule a 20-minute restorative focus break or shift to low-friction task review."
            return rec_text, "start_focus_session", {"duration_minutes": 20, "mode": "recovery"}

        if domain == "Tasks" and pending_tasks:
            top_task = pending_tasks[0]
            rec_text = f"Dedicate the next morning sprint block to '{top_task.title}'."
            return rec_text, "schedule_task", {"task_id": top_task.id, "title": top_task.title}

        if domain == "Goals" and active_goals:
            top_goal = active_goals[0]
            rec_text = f"Decompose the next milestone for '{top_goal.title}' into 30-minute actionable tasks."
            return rec_text, "create_task", {"goal_id": top_goal.id, "goal_title": top_goal.title}

        if domain == "Habits" and twin.habits:
            uncompleted = [h for h in twin.habits if not h.completed_today]
            if uncompleted:
                rec_text = f"Complete your daily ritual for '{uncompleted[0].title}' to sustain your active streak."
                return rec_text, "complete_habit", {"habit_id": uncompleted[0].id}

        return (
            "Review active milestones and preserve focus block consistency.",
            "review_priorities",
            {}
        )

cognitive_recommendation_engine = CognitiveRecommendationEngine()
