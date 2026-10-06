"""
Cognitive Insight & Causal Context Engine Schemas
Defines structured signal attributions, cross-domain entity links,
grounded explanations, and cognitive feedback structures.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

class AttributedSignal(BaseModel):
    metric_name: str
    previous_value: float
    current_value: float
    delta_pct: float
    direction: Literal['increasing', 'decreasing', 'stable']
    confidence: float = Field(ge=0.0, le=1.0)
    timestamp: str
    domain: Literal['Focus', 'Goals', 'Tasks', 'Habits', 'Memory', 'Energy', 'System']

class RelatedEntityRef(BaseModel):
    entity_id: str
    entity_type: Literal['goal', 'task', 'project', 'memory', 'habit', 'skill', 'context']
    label: str
    relationship_type: Literal['associated_with', 'supports', 'coincides_with', 'blocks', 'derived_from', 'competes_with']
    weight: float = 0.85

class CognitiveExplanation(BaseModel):
    observed_change: str
    supporting_signals: List[AttributedSignal]
    related_context: str
    interpretation: str
    confidence: float = 0.90

class CognitiveInsight(BaseModel):
    id: str
    category: Literal['TREND', 'CHANGE', 'RELATIONSHIP', 'RISK', 'OPPORTUNITY', 'ANOMALY']
    title: str
    statement: str
    explanation: CognitiveExplanation
    evidence_signals: List[AttributedSignal]
    affected_entities: List[RelatedEntityRef]
    recommended_action: Optional[str] = None
    action_type: Optional[str] = None
    action_payload: Dict[str, Any] = Field(default_factory=dict)
    epistemic_level: Literal['OBSERVATION', 'ASSOCIATION', 'INTERPRETATION', 'PREDICTION'] = 'ASSOCIATION'
    timestamp: str

class RecommendationDecisionRequest(BaseModel):
    insight_id: str
    recommendation_text: str
    decision: Literal['accepted', 'dismissed', 'deferred']
    feedback_note: Optional[str] = None

class RecommendationDecisionResponse(BaseModel):
    event_id: str
    processed: bool = True
    insight_id: str
    decision: str
    timestamp: str
