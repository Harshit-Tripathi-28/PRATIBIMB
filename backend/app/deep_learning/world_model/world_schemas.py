"""
PRATIBIMB Personal World Model Schemas 1.0
Defines first-class entities, typed relationships, temporal bounds,
multi-hop query structures, state propagation scenarios, and GNN tensor specifications.
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

WorldEntityType = Literal[
    'USER', 'GOAL', 'PROJECT', 'TASK', 'MILESTONE', 
    'SKILL', 'KNOWLEDGE', 'MEMORY', 'HABIT', 'FOCUS_SESSION', 
    'EVENT', 'AGENT', 'DOCUMENT', 'CONTEXT'
]

WorldRelationType = Literal[
    'RELATES_TO', 'SUPPORTS', 'BLOCKS', 'DEPENDS_ON', 
    'PART_OF', 'CONTRIBUTES_TO', 'DERIVED_FROM', 'PRECEDES', 
    'FOLLOWS', 'SIMILAR_TO', 'AFFECTS', 'REQUIRES', 'GENERATED_BY'
]

EpistemicImpactType = Literal[
    'KNOWN_RELATIONSHIP', 'POTENTIAL_IMPACT', 'UNCERTAIN_IMPACT', 'ASSOCIATION'
]

class WorldEntity(BaseModel):
    id: str
    type: WorldEntityType
    label: str
    state: str = "active"  # e.g., 'active', 'completed', 'in_progress', 'blocked', 'stabilizing'
    category: str = "General"
    importance: float = Field(default=1.0, ge=0.0, le=2.0)
    progress: Optional[int] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str
    valid_from: Optional[str] = None
    valid_to: Optional[str] = None
    vector_64d: Optional[List[float]] = None
    provenance: str = "twin_store"
    position_3d: Optional[Dict[str, float]] = None  # {x, y, z}

class WorldRelationship(BaseModel):
    id: str
    source_id: str
    target_id: str
    relation_type: WorldRelationType
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    weight: float = Field(default=0.8, ge=0.0, le=1.0)
    epistemic_status: EpistemicImpactType = 'KNOWN_RELATIONSHIP'
    timestamp: str
    provenance: str = "structural"
    bidirectional: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

class GNNReadyGraphTensors(BaseModel):
    num_nodes: int
    num_edges: int
    feature_dimension: int = 64
    node_features: List[List[float]] = Field(default_factory=list)  # [N x 64]
    edge_index: List[List[int]] = Field(default_factory=list)      # [2 x E]
    edge_type_ids: List[int] = Field(default_factory=list)         # [E]
    node_type_ids: List[int] = Field(default_factory=list)         # [N]
    node_id_map: Dict[str, int] = Field(default_factory=dict)
    edge_type_map: Dict[str, int] = Field(default_factory=dict)
    node_type_map: Dict[str, int] = Field(default_factory=dict)
    ready_for_gnn_training: bool = True

class WorldGraphSnapshot(BaseModel):
    snapshot_id: str
    user_id: str
    timestamp: str
    iso_timestamp: str
    entities: List[WorldEntity]
    relationships: List[WorldRelationship]
    entity_counts_by_type: Dict[str, int] = Field(default_factory=dict)
    graph_density: float = 0.0
    diameter_estimate: int = 4
    dominant_cluster: str = "Engineering & Systems"
    semantic_coherence: float = 0.88
    gnn_tensors: Optional[GNNReadyGraphTensors] = None

class WorldQueryRequest(BaseModel):
    target_entity_id: Optional[str] = None
    query_type: Literal[
        'affects_goal', 'blocking_tasks', 'related_memories', 
        'skills_developed', 'recent_changes', 'entity_dependencies', 'custom'
    ] = 'entity_dependencies'
    max_depth: int = 2
    include_events: bool = True
    include_memories: bool = True
    query_text: Optional[str] = None

class WorldQueryResult(BaseModel):
    query_type: str
    target_entity: Optional[WorldEntity] = None
    connected_entities: List[WorldEntity] = Field(default_factory=list)
    connecting_relationships: List[WorldRelationship] = Field(default_factory=list)
    upstream_dependencies: List[WorldEntity] = Field(default_factory=list)
    downstream_dependents: List[WorldEntity] = Field(default_factory=list)
    blocking_entities: List[WorldEntity] = Field(default_factory=list)
    related_memories: List[Dict[str, Any]] = Field(default_factory=list)
    recent_events: List[Dict[str, Any]] = Field(default_factory=list)
    cognitive_insights: List[Dict[str, Any]] = Field(default_factory=list)
    structured_synthesis: str
    timestamp: str

class ImpactedEntityRef(BaseModel):
    entity_id: str
    entity_type: WorldEntityType
    label: str
    impact_level: Literal['DIRECT_IMPACT', 'INDIRECT_IMPACT', 'POTENTIAL_IMPACT']
    estimated_effect: str
    confidence: float = 0.8
    epistemic_status: EpistemicImpactType = 'POTENTIAL_IMPACT'

class PropagationScenarioRequest(BaseModel):
    entity_id: str
    scenario_action: Literal['pause', 'accelerate', 'delete', 'complete', 'delay', 'overload'] = 'pause'
    duration_weeks: int = 4
    intensity_delta: float = -0.5

class PropagationScenarioResponse(BaseModel):
    scenario_id: str
    target_entity_id: str
    target_entity_label: str
    scenario_action: str
    direct_impacts: List[ImpactedEntityRef]
    indirect_impacts: List[ImpactedEntityRef]
    potential_impacts: List[ImpactedEntityRef]
    risk_assessment: str
    recommended_mitigations: List[str]
    timestamp: str
