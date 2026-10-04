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
