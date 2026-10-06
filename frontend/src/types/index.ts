export type LayerType = 'base_top' | 'outerwear' | 'accessory' | 'eyewear' | 'headwear' | 'background';
export type AnchorType = 'torso' | 'torso_neck' | 'face_eyes' | 'head_top' | 'background';

export interface SelectedLayerItem {
  id: string;
  layer_type: LayerType;
  custom_base64?: string;
  adjust_scale?: number;
  adjust_offset_x?: number;
  adjust_offset_y?: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  sub_category?: string;
  layer_type: LayerType;
  layer_order: number;
  anchor_type: AnchorType;
  scale_multiplier?: number;
  collar_offset_ratio?: number;
  brand?: string;
  price?: number;
  color?: string;
  style_tags: string[];
  image_url: string;
  overlay_url: string;
  recommended_face_shapes?: string[];
  recommended_undertones?: string[];
  description?: string;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  color_theme: string;
  image_url: string;
  description: string;
}

export interface SampleImage {
  id: string;
  name: string;
  url: string;
  file_path: string;
}

export interface BiometricAnalysis {
  face_detected: boolean;
  face_shape: 'Oval' | 'Square' | 'Round' | 'Heart' | 'Diamond' | 'Oblong' | string;
  face_proportions: Record<string, number>;
  skin_tone_hex: string;
  skin_undertone: 'Warm' | 'Cool' | 'Neutral' | string;
  estimated_size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | string;
  size_confidence: number;
  measurements_cm: Record<string, number>;
  style_recommendations: string[];
  flattering_colors: string[];
  best_eyewear_shapes: string[];
}

export interface AppliedLayerInfo {
  id: string;
  name: string;
  layer_type: string;
  layer_order: number;
  anchor: string;
}

export interface TryOnResponse {
  success: boolean;
  result_image_base64: string;
  face_mesh_detected: boolean;
  pose_detected: boolean;
  processing_time_ms: number;
  biometrics?: BiometricAnalysis;
  applied_items: Record<string, string>;
  applied_layers: AppliedLayerInfo[];
  validation_warnings?: string[];
  error?: string;
}

export interface SavedLook {
  id: string;
  title: string;
  created_at: string;
  result_image_base64: string;
  items_applied: string[];
  notes?: string;
}

// ==========================================
// PRATIBIMB DIGITAL TWIN & AI OS TYPINGS
// ==========================================

export interface AvatarConfig {
  gender_expression?: string;
  skin_tone?: string;
  hair_style?: string;
  hair_color?: string;
  outfit_style?: string;
  outfit_color?: string;
  glasses?: string;
  mood?: string;
  aura_color?: string;
}

export interface LLMStatus {
  configured: boolean;
  provider: string | null;
  model: string;
  instructions: string;
}

export interface UserProfile {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  interests: string[];
  preferred_work_style: string;
  workload_capacity: string;
  timezone: string;
  avatar_config?: AvatarConfig;
}

export interface BehaviorMetrics {
  productivity_score: number;
  focus_hours_today: number;
  weekly_focus_avg: number;
  active_streak_days: number;
  task_completion_rate: number;
  peak_focus_time: string;
  habit_consistency_index: number;
  cognitive_load: string;
}

export interface DigitalTwinState {
  current_focus: string;
  energy_level: number;
  workload_status: 'Light' | 'Optimal' | 'Heavy' | 'Overloaded' | string;
  context_mode: string;
  last_updated: string;
  active_insights_count: number;
  unresolved_actions_count: number;
  operational_state?: OperationalStateType;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  due_date?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  deadline: string;
  milestones: GoalMilestone[];
  linked_task_ids: string[];
  ai_insights?: string;
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  status: 'todo' | 'in_progress' | 'completed';
  due_date?: string;
  estimated_minutes: number;
  goal_id?: string;
  created_at?: string;
  completed_at?: string;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  frequency: string;
  streak_count: number;
  target_days: number;
  completed_today: boolean;
  last_completed?: string;
}

export interface MemoryItem {
  id: string;
  type: 'short_term' | 'episodic' | 'semantic' | 'behavioral' | 'goal';
  content: string;
  summary?: string;
  tags: string[];
  importance: number;
  created_at: string;
  source: string;
  similarity_score?: number;
}

export interface Insight {
  id: string;
  category: 'productivity' | 'habit' | 'goal_alignment' | 'cognitive' | 'neglect';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'info';
  confidence: number;
  action_prompt?: string;
  created_at: string;
}

export interface FocusSession {
  id: string;
  task_id?: string;
  task_title?: string;
  duration_minutes: number;
  energy_before: number;
  energy_after: number;
  notes?: string;
  timestamp: string;
}

export interface AIAction {
  id: string;
  type: 'create_task' | 'update_task' | 'complete_task' | 'create_goal' | 'create_note' | 'start_focus_session' | 'recommend_action';
  title: string;
  description?: string;
  payload: Record<string, any>;
  status: 'proposed' | 'confirmed' | 'rejected' | 'executed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actions?: AIAction[];
  memory_citations?: string[];
  telemetry_status?: string;
}

export interface ChatResponse {
  response: string;
  actions: AIAction[];
  memory_citations: string[];
  suggested_prompts: string[];
  telemetry: Record<string, any>;
  updated_twin_summary?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  group: string;
  value: number;
  details?: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
  weight: number;
}

export interface DigitalTwinGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface DigitalTwin {
  user_id: string;
  profile: UserProfile;
  behavior: BehaviorMetrics;
  state: DigitalTwinState;
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  memories: MemoryItem[];
  insights: Insight[];
  focus_sessions: FocusSession[];
}

export interface RecommendationItem {
  task: Task;
  score: number;
  priority_weight: number;
  energy_match: number;
  goal_alignment: number;
  recommendation_reason: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  has_onboarded: boolean;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user_id: string;
  email: string;
  name: string;
  has_onboarded: boolean;
}

export interface OnboardingData {
  name: string;
  title: string;
  bio?: string;
  skills: string[];
  interests: string[];
  preferred_work_style: string;
  energy_level: number;
  initial_goals: {
    title: string;
    category: string;
    priority: string;
    deadline: string;
  }[];
  initial_habits: {
    title: string;
    category: string;
    frequency: string;
    target_days: number;
  }[];
  avatar_config?: AvatarConfig;
}

// ==========================================
// DEEP LEARNING & COGNITIVE OS TYPINGS
// ==========================================

export interface LatentStateVector {
  dimensions: number;
  vector: number[];
  principal_components_2d: [number, number];
  principal_components_3d: [number, number, number];
  semantic_coherence: number;
  entropy: number;
  dominant_cluster: string;
  computed_at: string;
}

export interface LifeGraphNode {
  id: string;
  label: string;
  type: 'identity' | 'goal' | 'task' | 'memory' | 'habit' | 'skill' | 'project' | 'knowledge' | 'context';
  category: string;
  importance: number;
  status?: string;
  progress?: number;
  metadata?: Record<string, any>;
  position?: { x: number; y: number; z: number };
}

export interface LifeGraphEdge {
  id: string;
  source: string;
  target: string;
  relation_type: string;
  weight: number;
  bidirectional?: boolean;
}

export interface LifeGraphData {
  nodes: LifeGraphNode[];
  edges: LifeGraphEdge[];
  cluster_labels: string[];
  graph_density: number;
  total_entities: number;
}

export interface BehaviorForecast {
  metric_name: string;
  current_value: number;
  projected_7d: number;
  projected_30d: number;
  confidence_interval: [number, number];
  trend_direction: 'improving' | 'stable' | 'declining' | 'volatile';
  driving_factors: string[];
}

export interface AnomalySignal {
  id: string;
  timestamp: string;
  severity: 'info' | 'low' | 'medium' | 'high';
  signal_type: string;
  baseline_value: number;
  observed_value: number;
  deviation_z_score: number;
  explanation: string;
  recommendation?: string;
}

export interface SimulationScenarioRequest {
  scenario_title: string;
  focus_domain: string;
  allocated_hours_per_week: number;
  duration_weeks: number;
  competing_priorities_adjustment?: string;
  target_goal_id?: string;
}

export interface ScenarioOutcome {
  scenario_id: string;
  scenario_title: string;
  estimated_goal_progress_delta: number;
  estimated_skill_acquisition_score: number;
  cognitive_load_projection: 'Optimal' | 'Challenging' | 'Overloaded' | 'Underutilized';
  burnout_risk_score: number;
  momentum_score: number;
  projected_tradeoffs: string[];
  positive_catalysts: string[];
  ai_synthesis: string;
}

export interface MemoryCluster {
  cluster_id: string;
  label: string;
  category: string;
  memory_count: number;
  memory_ids: string[];
  cohesion_score: number;
  summary: string;
  centroid_2d: [number, number];
}

export interface SpecializedAgentSpec {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  status: 'idle' | 'processing' | 'ready' | 'offline';
  icon_name: string;
}

export interface AgentTaskRequest {
  agent_id: string;
  instruction: string;
  context_parameters?: Record<string, any>;
}

export interface AgentTaskResponse {
  task_id: string;
  agent_id: string;
  status: 'completed' | 'requires_confirmation' | 'failed';
  result_summary: string;
  structured_artifacts?: Record<string, any>;
  proposed_actions?: any[];
  execution_time_ms: number;
}

// ==========================================
// STATE ENGINE 2.0 TYPINGS
// ==========================================

export type OperationalStateType = 
  | 'IDLE' 
  | 'ACTIVE' 
  | 'DEEP_FOCUS' 
  | 'RECOVERY' 
  | 'PROJECT_ACCELERATING' 
  | 'GOAL_AT_RISK' 
  | 'HABIT_STABILIZING';

export interface StateSnapshot {
  snapshot_id: string;
  timestamp: string;
  iso_timestamp: string;
  active_focus: string;
  energy_level: number;
  productivity_score: number;
  task_completion_rate: number;
  habit_consistency: number;
  active_goals_count: number;
  pending_tasks_count: number;
  memories_count: number;
  operational_state: OperationalStateType;
  state_vector_64d: number[];
  dominant_cluster: string;
  semantic_coherence: number;
  major_event_trigger?: string;
  confidence: number;
}

export interface StateComparison {
  current_snapshot: StateSnapshot;
  previous_snapshot?: StateSnapshot | null;
  has_historical_baseline: boolean;
  focus_delta_pct: number;
  productivity_delta_pct: number;
  task_velocity_delta_pct: number;
  habit_consistency_delta_pct: number;
  memory_growth_delta_pct: number;
  vector_cosine_drift: number;
  summary: string;
}

export interface StateInsight {
  id: string;
  title: string;
  explanation: string;
  supporting_signals: string[];
  affected_domain: 'Focus' | 'Goals' | 'Tasks' | 'Habits' | 'Memory' | 'Energy' | 'System';
  direction: 'improving' | 'declining' | 'stable' | 'attention_required';
  confidence: number;
  recommended_action?: string;
  timestamp: string;
}

export interface TemporalTriadState {
  current: Record<string, any>;
  history: Record<string, any>;
  predicted: Record<string, any>;
  active_operational_state: OperationalStateType;
  last_updated: string;
}

export interface SequenceDatasetTensor {
  sequence_length: number;
  feature_dimension: number;
  tensor_matrix: number[][];
  feature_names: string[];
  ready_for_sequence_modeling: boolean;
}

export interface AttributedSignal {
  metric_name: string;
  previous_value: number;
  current_value: number;
  delta_pct: number;
  direction: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timestamp: string;
  domain: 'Focus' | 'Goals' | 'Tasks' | 'Habits' | 'Memory' | 'Energy' | 'System';
}

export interface RelatedEntityRef {
  entity_id: string;
  entity_type: 'goal' | 'task' | 'project' | 'memory' | 'habit' | 'skill' | 'context';
  label: string;
  relationship_type: 'associated_with' | 'supports' | 'coincides_with' | 'blocks' | 'derived_from' | 'competes_with';
  weight: number;
}

export interface CognitiveExplanation {
  observed_change: string;
  supporting_signals: AttributedSignal[];
  related_context: string;
  interpretation: string;
  confidence: number;
}

export interface CognitiveInsight {
  id: string;
  category: 'TREND' | 'CHANGE' | 'RELATIONSHIP' | 'RISK' | 'OPPORTUNITY' | 'ANOMALY';
  title: string;
  statement: string;
  explanation: CognitiveExplanation;
  evidence_signals: AttributedSignal[];
  affected_entities: RelatedEntityRef[];
  recommended_action?: string;
  action_type?: string;
  action_payload?: Record<string, any>;
  epistemic_level: 'OBSERVATION' | 'ASSOCIATION' | 'INTERPRETATION' | 'PREDICTION';
  timestamp: string;
}

export interface RecommendationDecisionRequest {
  insight_id: string;
  recommendation_text: string;
  decision: 'accepted' | 'dismissed' | 'deferred';
  feedback_note?: string;
}

export interface RecommendationDecisionResponse {
  event_id: string;
  processed: boolean;
  insight_id: string;
  decision: string;
  timestamp: string;
}

// ==========================================
// PERSONAL WORLD MODEL ENGINE 1.0 TYPINGS
// ==========================================

export type WorldEntityType = 
  | 'USER' 
  | 'GOAL' 
  | 'PROJECT' 
  | 'TASK' 
  | 'MILESTONE' 
  | 'SKILL' 
  | 'KNOWLEDGE' 
  | 'MEMORY' 
  | 'HABIT' 
  | 'FOCUS_SESSION' 
  | 'EVENT' 
  | 'AGENT' 
  | 'DOCUMENT' 
  | 'CONTEXT';

export type WorldRelationType = 
  | 'RELATES_TO' 
  | 'SUPPORTS' 
  | 'BLOCKS' 
  | 'DEPENDS_ON' 
  | 'PART_OF' 
  | 'CONTRIBUTES_TO' 
  | 'DERIVED_FROM' 
  | 'PRECEDES' 
  | 'FOLLOWS' 
  | 'SIMILAR_TO' 
  | 'AFFECTS' 
  | 'REQUIRES' 
  | 'GENERATED_BY';

export type EpistemicImpactType = 
  | 'KNOWN_RELATIONSHIP' 
  | 'POTENTIAL_IMPACT' 
  | 'UNCERTAIN_IMPACT' 
  | 'ASSOCIATION';

export interface WorldEntity {
  id: string;
  type: WorldEntityType;
  label: string;
  state: string;
  category: string;
  importance: number;
  progress?: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  valid_from?: string;
  valid_to?: string;
  vector_64d?: number[];
  provenance: string;
  position_3d?: { x: number; y: number; z: number };
}

export interface WorldRelationship {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: WorldRelationType;
  confidence: number;
  weight: number;
  epistemic_status: EpistemicImpactType;
  timestamp: string;
  provenance: string;
  bidirectional: boolean;
  metadata?: Record<string, any>;
}

export interface GNNReadyGraphTensors {
  num_nodes: number;
  num_edges: number;
  feature_dimension: number;
  node_features: number[][];
  edge_index: number[][];
  edge_type_ids: number[];
  node_type_ids: number[];
  node_id_map: Record<string, number>;
  edge_type_map: Record<string, number>;
  node_type_map: Record<string, number>;
  ready_for_gnn_training: boolean;
}

export interface WorldGraphSnapshot {
  snapshot_id: string;
  user_id: string;
  timestamp: string;
  iso_timestamp: string;
  entities: WorldEntity[];
  relationships: WorldRelationship[];
  entity_counts_by_type: Record<string, number>;
  graph_density: number;
  diameter_estimate: number;
  dominant_cluster: string;
  semantic_coherence: number;
  gnn_tensors?: GNNReadyGraphTensors;
}

export interface WorldQueryRequest {
  target_entity_id?: string;
  query_type?: 'affects_goal' | 'blocking_tasks' | 'related_memories' | 'skills_developed' | 'recent_changes' | 'entity_dependencies' | 'custom';
  max_depth?: number;
  include_events?: boolean;
  include_memories?: boolean;
  query_text?: string;
}

export interface WorldQueryResult {
  query_type: string;
  target_entity?: WorldEntity | null;
  connected_entities: WorldEntity[];
  connecting_relationships: WorldRelationship[];
  upstream_dependencies: WorldEntity[];
  downstream_dependents: WorldEntity[];
  blocking_entities: WorldEntity[];
  related_memories: Array<{ memory_id: string; summary: string; category: string; importance: number; content: string }>;
  recent_events: Array<Record<string, any>>;
  cognitive_insights: Array<Record<string, any>>;
  structured_synthesis: string;
  timestamp: string;
}

export interface ImpactedEntityRef {
  entity_id: string;
  entity_type: WorldEntityType;
  label: string;
  impact_level: 'DIRECT_IMPACT' | 'INDIRECT_IMPACT' | 'POTENTIAL_IMPACT';
  estimated_effect: string;
  confidence: number;
  epistemic_status: EpistemicImpactType;
}

export interface PropagationScenarioRequest {
  entity_id: string;
  scenario_action?: 'pause' | 'accelerate' | 'delete' | 'complete' | 'delay' | 'overload';
  duration_weeks?: number;
  intensity_delta?: number;
}

export interface PropagationScenarioResponse {
  scenario_id: string;
  target_entity_id: string;
  target_entity_label: string;
  scenario_action: string;
  direct_impacts: ImpactedEntityRef[];
  indirect_impacts: ImpactedEntityRef[];
  potential_impacts: ImpactedEntityRef[];
  risk_assessment: string;
  recommended_mitigations: string[];
  timestamp: string;
}

// ==========================================
// DEEP LEARNING FEATURE EXPANSIONS (3.0)
// ==========================================

export interface MemoryAssociationItem {
  id: string;
  content: string;
  type: string;
  similarity_score: number;
  raw_similarity: number;
  shared_tags: string[];
  connected_goals: string[];
  importance: number;
  created_at?: string;
}

export interface MemoryAssociationResponse {
  target_id: string;
  target_content: string;
  target_type: string;
  associations: MemoryAssociationItem[];
}

export interface MemorySemanticPoint {
  id: string;
  title: string;
  full_content: string;
  type: string;
  tags: string[];
  importance: number;
  x: number;
  y: number;
  created_at?: string;
}

export interface MemorySemanticSpaceResponse {
  count: number;
  embedding_dim: number;
  points: MemorySemanticPoint[];
}

export interface BehavioralSequenceSignal {
  focus_capacity: number;
  task_velocity: number;
  habit_consistency: number;
}

export interface BehavioralSequencePatternResponse {
  current_pattern_summary: string;
  signals: {
    past: BehavioralSequenceSignal;
    current: BehavioralSequenceSignal;
    projected: BehavioralSequenceSignal;
  };
  deltas: {
    focus_delta: number;
    velocity_delta: number;
    consistency_delta: number;
  };
}






