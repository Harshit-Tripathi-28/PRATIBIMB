"""
Digital Twin State Engine 2.0 Schemas
Defines structured temporal snapshots, state comparisons, transition states,
explainable behavioral insights, and deep-learning sequence tensors.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

# ----------------- 1. Temporal State Snapshot -----------------

class StateSnapshot(BaseModel):
    snapshot_id: str
    timestamp: str
    iso_timestamp: str
    active_focus: str
    energy_level: int = Field(ge=0, le=100)
    productivity_score: int = Field(ge=0, le=100)
    task_completion_rate: float = Field(ge=0.0, le=1.0)
    habit_consistency: float = Field(ge=0.0, le=1.0)
    active_goals_count: int = 0
    pending_tasks_count: int = 0
    memories_count: int = 0
    operational_state: Literal[
        'IDLE', 'ACTIVE', 'DEEP_FOCUS', 'RECOVERY',
        'PROJECT_ACCELERATING', 'GOAL_AT_RISK', 'HABIT_STABILIZING'
    ] = 'ACTIVE'
    state_vector_64d: List[float] = Field(default_factory=list)
    dominant_cluster: str = "General Intelligence"
    semantic_coherence: float = 0.88
    major_event_trigger: Optional[str] = "Periodic Sync"
    confidence: float = 0.94

# ----------------- 2. State Comparison (T vs T-1) -----------------

class StateComparison(BaseModel):
    current_snapshot: StateSnapshot
    previous_snapshot: Optional[StateSnapshot] = None
    has_historical_baseline: bool = False
    focus_delta_pct: float = 0.0
    productivity_delta_pct: float = 0.0
    task_velocity_delta_pct: float = 0.0
    habit_consistency_delta_pct: float = 0.0
    memory_growth_delta_pct: float = 0.0
    vector_cosine_drift: float = 0.0
    summary: str = "State operating at baseline equilibrium."

# ----------------- 3. Grounded State Insights -----------------

class StateInsight(BaseModel):
    id: str
    title: str
    explanation: str
    supporting_signals: List[str]
    affected_domain: Literal['Focus', 'Goals', 'Tasks', 'Habits', 'Memory', 'Energy', 'System']
    direction: Literal['improving', 'declining', 'stable', 'attention_required']
    confidence: float = Field(ge=0.0, le=1.0)
    recommended_action: Optional[str] = None
    timestamp: str

# ----------------- 4. Temporal Triad State -----------------

class TemporalTriadState(BaseModel):
    current: Dict[str, Any]
    history: Dict[str, Any]
    predicted: Dict[str, Any]
    active_operational_state: str
    last_updated: str

# ----------------- 5. Deep Learning Sequence Tensor -----------------

class SequenceDatasetTensor(BaseModel):
    sequence_length: int
    feature_dimension: int
    tensor_matrix: List[List[float]]
    feature_names: List[str]
    ready_for_sequence_modeling: bool = True
