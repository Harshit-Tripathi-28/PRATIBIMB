"""
PRATIBIMB Deep Learning & Cognitive OS Schemas
Defines data structures for representation learning, multimodal perception,
life graph, simulation engine, behavioral sequence modeling, and specialized agents.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

# ----------------- 1. Multimodal Perception Schemas -----------------

class MultimodalPerceptionInput(BaseModel):
    modality: Literal['text', 'vision', 'audio', 'document', 'multimodal']
    text_content: Optional[str] = None
    image_base64: Optional[str] = None
    document_name: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class PerceptionFeatureVector(BaseModel):
    modality: str
    feature_dimension: int
    dense_features: List[float]
    semantic_tokens: List[str] = []
    confidence: float = 0.95
    extracted_entities: List[Dict[str, Any]] = []
    timestamp: str

# ----------------- 2. Representation & Latent State Schemas -----------------

class LatentStateVector(BaseModel):
    dimensions: int = 64
    vector: List[float]
    principal_components_2d: List[float]  # [x, y] for 2D spatial visualizers
    principal_components_3d: List[float]  # [x, y, z] for 3D spatial visualizers
    semantic_coherence: float = 0.88
    entropy: float = 0.32
    dominant_cluster: str = "Engineering & Systems"
    computed_at: str

# ----------------- 3. Intelligent Memory Schemas -----------------

class EnhancedMemoryCategory(BaseModel):
    category: Literal[
        'episodic', 'semantic', 'procedural', 
        'contextual', 'preference', 'project', 'relationship'
    ]
    description: str

class MemoryCluster(BaseModel):
    cluster_id: str
    label: str
    category: str
    memory_count: int
    memory_ids: List[str]
    cohesion_score: float
    summary: str
    centroid_2d: List[float]

# ----------------- 4. Life Graph Schemas -----------------

class LifeGraphNode(BaseModel):
    id: str
    label: str
    type: Literal['identity', 'goal', 'task', 'memory', 'habit', 'skill', 'project', 'knowledge', 'context']
    category: str
    importance: float = 1.0
    status: Optional[str] = None
    progress: Optional[int] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    position: Optional[Dict[str, float]] = None  # {x, y, z}

class LifeGraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relation_type: str  # e.g., 'supports_goal', 'reinforces_habit', 'semantic_association', 'prerequisite_of'
    weight: float = Field(default=0.75, ge=0.0, le=1.0)
    bidirectional: bool = False

class LifeGraphData(BaseModel):
    nodes: List[LifeGraphNode]
    edges: List[LifeGraphEdge]
    cluster_labels: List[str] = []
    graph_density: float = 0.42
    total_entities: int = 0

# ----------------- 5. Behavioral Prediction & Simulation Schemas -----------------

class BehaviorForecast(BaseModel):
    metric_name: str
    current_value: float
    projected_7d: float
    projected_30d: float
    confidence_interval: List[float]  # [lower, upper]
    trend_direction: Literal['improving', 'stable', 'declining', 'volatile']
    driving_factors: List[str]

class AnomalySignal(BaseModel):
    id: str
    timestamp: str
    severity: Literal['info', 'low', 'medium', 'high']
    signal_type: str
    baseline_value: float
    observed_value: float
    deviation_z_score: float
    explanation: str
    recommendation: Optional[str] = None

class SimulationScenarioRequest(BaseModel):
    scenario_title: str
    focus_domain: str  # e.g., "DSA & Algorithms", "System Architecture", "Daily Exercise"
    allocated_hours_per_week: float = 15.0
    duration_weeks: int = 12
    competing_priorities_adjustment: Optional[str] = "Reduce non-essential project load by 20%"
    target_goal_id: Optional[str] = None

class ScenarioOutcome(BaseModel):
    scenario_id: str
    scenario_title: str
    estimated_goal_progress_delta: int  # e.g. +45%
    estimated_skill_acquisition_score: float  # 0 to 100
    cognitive_load_projection: Literal['Optimal', 'Challenging', 'Overloaded', 'Underutilized']
    burnout_risk_score: float = Field(ge=0.0, le=1.0)
    momentum_score: float = Field(ge=0.0, le=100.0)
    projected_tradeoffs: List[str]
    positive_catalysts: List[str]
    ai_synthesis: str

# ----------------- 6. Autonomous Agent Schemas -----------------

class SpecializedAgentSpec(BaseModel):
    id: str
    name: str
    role: str
    description: str
    capabilities: List[str]
    status: Literal['idle', 'processing', 'ready', 'offline'] = 'ready'
    icon_name: str = "Cpu"

class AgentTaskRequest(BaseModel):
    agent_id: str
    instruction: str
    context_parameters: Dict[str, Any] = Field(default_factory=dict)

class AgentTaskResponse(BaseModel):
    task_id: str
    agent_id: str
    status: Literal['completed', 'requires_confirmation', 'failed']
    result_summary: str
    structured_artifacts: Dict[str, Any] = Field(default_factory=dict)
    proposed_actions: List[Dict[str, Any]] = []
    execution_time_ms: int = 0
