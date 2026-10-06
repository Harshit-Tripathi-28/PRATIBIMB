"""
Cognitive Insight & Causal Context Engine:
Master coordinator generating grounded, multi-domain cognitive insights,
correlational context explanations, and actionable recommendations.
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.models.twin_schemas import DigitalTwin
from app.deep_learning.cognition.cognition_schemas import (
    CognitiveInsight, AttributedSignal, CognitiveExplanation, 
    RelatedEntityRef, RecommendationDecisionRequest, RecommendationDecisionResponse
)
from app.deep_learning.cognition.signal_attribution import signal_attribution_engine
from app.deep_learning.cognition.relationship_analyzer import relationship_analyzer
from app.deep_learning.cognition.explanation_engine import explanation_engine
from app.deep_learning.cognition.recommendation_engine import cognitive_recommendation_engine
from app.deep_learning.state_engine.state_engine_service import state_engine_service
from app.deep_learning.pipeline.event_pipeline import event_pipeline

class CognitiveInsightEngine:
    def generate_cognitive_insights(self, twin: DigitalTwin) -> List[CognitiveInsight]:
        """
        Generates full cognitive insights answering:
        - What changed?
        - What signals are associated with the change?
        - What related context exists?
        - What could be done next?
        """
        all_signals = signal_attribution_engine.extract_attributed_signals(twin)
        comparison = state_engine_service.get_state_comparison(twin)
        curr_snap = comparison.current_snapshot
        now_str = datetime.now().strftime("%b %d, %I:%M %p")

        insights: List[CognitiveInsight] = []

        # 1. State Shift / Trend Insight
        prod_signal = next((s for s in all_signals if s.metric_name == "Productivity Index"), None)
        task_signal = next((s for s in all_signals if s.metric_name == "Task Completion Velocity"), None)
        energy_signal = next((s for s in all_signals if s.metric_name == "Self-Reported Capacity (Energy)"), None)
        
        related_entities = relationship_analyzer.identify_related_entities(twin, "General")

        if prod_signal and prod_signal.delta_pct > 0:
            exp = explanation_engine.build_explanation(
                observed_change=f"Productivity increased by {prod_signal.delta_pct}% relative to baseline.",
                signals=[s for s in all_signals if s.metric_name in ["Productivity Index", "Task Completion Velocity"]],
                related_entities=related_entities
            )
            rec, act_type, act_payload = cognitive_recommendation_engine.generate_recommendation("TREND", "Goals", all_signals, twin)
            insights.append(CognitiveInsight(
                id=f"cog-trend-{uuid.uuid4().hex[:6]}",
                category="TREND",
                title="Productivity Trajectory Accelerating",
                statement="Recent focus sessions and task completions coincide with positive velocity across active goals.",
                explanation=exp,
                evidence_signals=[prod_signal, task_signal] if task_signal else [prod_signal],
                affected_entities=related_entities,
                recommended_action=rec,
                action_type=act_type,
                action_payload=act_payload,
                epistemic_level="ASSOCIATION",
                timestamp=now_str
            ))
        elif prod_signal and prod_signal.delta_pct < -5:
            exp = explanation_engine.build_explanation(
                observed_change=f"Productivity shifted downward by {abs(prod_signal.delta_pct)}%.",
                signals=[s for s in all_signals if s.direction == 'decreasing'],
                related_entities=related_entities
            )
            rec, act_type, act_payload = cognitive_recommendation_engine.generate_recommendation("CHANGE", "Energy", all_signals, twin)
            insights.append(CognitiveInsight(
                id=f"cog-change-{uuid.uuid4().hex[:6]}",
                category="CHANGE",
                title="Operational Velocity Moderating",
                statement="Task throughput slowed alongside lower self-reported capacity check-ins.",
                explanation=exp,
                evidence_signals=[prod_signal, energy_signal] if energy_signal else [prod_signal],
                affected_entities=related_entities,
                recommended_action=rec,
                action_type=act_type,
                action_payload=act_payload,
                epistemic_level="ASSOCIATION",
                timestamp=now_str
            ))

        # 2. Cross-Domain Relationship Insight (Focus <-> Habit Consistency)
        habit_signal = next((s for s in all_signals if s.metric_name == "Habit Ritual Consistency"), None)
        if habit_signal and twin.habits:
            exp = explanation_engine.build_explanation(
                observed_change=f"Habit consistency is tracking at {int(habit_signal.current_value)}%.",
                signals=[habit_signal],
                related_entities=[e for e in related_entities if e.entity_type in ['habit', 'goal']]
            )
            rec, act_type, act_payload = cognitive_recommendation_engine.generate_recommendation("RELATIONSHIP", "Habits", [habit_signal], twin)
            insights.append(CognitiveInsight(
                id=f"cog-rel-{uuid.uuid4().hex[:6]}",
                category="RELATIONSHIP",
                title="Habit Rhythm & Focus Block Alignment",
                statement=f"Active {twin.behavior.active_streak_days}-day ritual consistency is associated with sustained operating stability.",
                explanation=exp,
                evidence_signals=[habit_signal],
                affected_entities=[e for e in related_entities if e.entity_type == 'goal'],
                recommended_action=rec,
                action_type=act_type,
                action_payload=act_payload,
                epistemic_level="ASSOCIATION",
                timestamp=now_str
            ))

        # 3. Risk & Opportunity Diagnostics
        active_goals = [g for g in twin.goals if g.progress < 100]
        if active_goals and active_goals[0].priority in ['urgent', 'high'] and active_goals[0].progress < 30:
            top_goal = active_goals[0]
            exp = explanation_engine.build_explanation(
                observed_change=f"Goal '{top_goal.title}' is in early progress stage ({top_goal.progress}%) despite high priority rating.",
                signals=[task_signal] if task_signal else [],
                related_entities=[RelatedEntityRef(entity_id=f"goal-{top_goal.id}", entity_type="goal", label=top_goal.title, relationship_type="associated_with")]
            )
            rec, act_type, act_payload = cognitive_recommendation_engine.generate_recommendation("RISK", "Goals", all_signals, twin)
            insights.append(CognitiveInsight(
                id=f"cog-risk-{uuid.uuid4().hex[:6]}",
                category="RISK",
                title=f"Strategic Milestone Attention Required: {top_goal.title}",
                statement=f"Priority milestone '{top_goal.title}' is currently at {top_goal.progress}% completion.",
                explanation=exp,
                evidence_signals=[task_signal] if task_signal else all_signals[:1],
                affected_entities=[RelatedEntityRef(entity_id=f"goal-{top_goal.id}", entity_type="goal", label=top_goal.title, relationship_type="associated_with")],
                recommended_action=rec,
                action_type=act_type,
                action_payload=act_payload,
                epistemic_level="INTERPRETATION",
                timestamp=now_str
            ))
        elif active_goals:
            top_goal = active_goals[0]
            exp = explanation_engine.build_explanation(
                observed_change=f"Goal '{top_goal.title}' has steady milestone progression ({top_goal.progress}%).",
                signals=[s for s in all_signals if s.metric_name == "Productivity Index"],
                related_entities=[RelatedEntityRef(entity_id=f"goal-{top_goal.id}", entity_type="goal", label=top_goal.title, relationship_type="supports")]
            )
            rec, act_type, act_payload = cognitive_recommendation_engine.generate_recommendation("OPPORTUNITY", "Goals", all_signals, twin)
            insights.append(CognitiveInsight(
                id=f"cog-opp-{uuid.uuid4().hex[:6]}",
                category="OPPORTUNITY",
                title=f"Opportunity to Accelerate '{top_goal.title}'",
                statement=f"Operating capacity supports scheduling a deep engineering focus block to advance milestone progression.",
                explanation=exp,
                evidence_signals=[prod_signal] if prod_signal else all_signals[:1],
                affected_entities=[RelatedEntityRef(entity_id=f"goal-{top_goal.id}", entity_type="goal", label=top_goal.title, relationship_type="supports")],
                recommended_action=rec,
                action_type=act_type,
                action_payload=act_payload,
                epistemic_level="INTERPRETATION",
                timestamp=now_str
            ))

        return insights

    def record_recommendation_decision(self, twin: DigitalTwin, request: RecommendationDecisionRequest) -> RecommendationDecisionResponse:
        """
        Logs user acceptance or dismissal of a recommendation into the event loop.
        """
        event_pipeline.log_and_process_event(
            twin,
            "recommendation_feedback",
            {
                "insight_id": request.insight_id,
                "recommendation_text": request.recommendation_text,
                "decision": request.decision,
                "feedback_note": request.feedback_note
            }
        )

        return RecommendationDecisionResponse(
            event_id=f"evt-{uuid.uuid4().hex[:6]}",
            processed=True,
            insight_id=request.insight_id,
            decision=request.decision,
            timestamp=datetime.now().isoformat()
        )

cognitive_engine = CognitiveInsightEngine()
