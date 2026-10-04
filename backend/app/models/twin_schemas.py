from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# ----------------- Core Digital Twin Schemas -----------------

class UserProfile(BaseModel):
    name: str = "Harshit Tripathi"
    title: str = "AI Engineer & Systems Architect"
    bio: str = "Passionate about building autonomous agent systems, neural interfaces, and high-performance ML architectures."
    skills: List[str] = ["Python", "FastAPI", "PyTorch", "Computer Vision", "React", "Distributed Systems", "LLM Orchestration"]
    interests: List[str] = ["AI Digital Twins", "Neuroscience", "Productivity Systems", "Deep Learning", "Generative UI"]
    preferred_work_style: str = "Deep Focus Blocks (Morning Peak)"
    workload_capacity: str = "Optimal"
    timezone: str = "IST (UTC+5:30)"
    avatar_config: Optional[Dict[str, Any]] = Field(default_factory=lambda: {
        "gender_expression": "neutral",
        "skin_tone": "#E0B394",
        "hair_style": "short_clean",
        "hair_color": "#2C221E",
        "outfit_style": "tech_minimal",
        "outfit_color": "#0F172A",
        "glasses": "none",
        "mood": "focused",
        "aura_color": "cyan"
    })

class BehaviorMetrics(BaseModel):
    productivity_score: int = Field(default=88, ge=0, le=100)
    focus_hours_today: float = 4.5
    weekly_focus_avg: float = 5.2
    active_streak_days: int = 14
    task_completion_rate: float = 0.92
    peak_focus_time: str = "09:00 AM - 01:00 PM"
    habit_consistency_index: float = 0.89
    cognitive_load: str = "Balanced"

class GoalMilestone(BaseModel):
    id: str
    title: str
    completed: bool = False
    due_date: Optional[str] = None

class Goal(BaseModel):
    id: str
    title: str
    description: str
    category: str  # Engineering, Career, Learning, Health, Personal
    priority: Literal['low', 'medium', 'high', 'urgent'] = 'high'
    progress: int = Field(default=0, ge=0, le=100)
    deadline: str
    milestones: List[GoalMilestone] = []
    linked_task_ids: List[str] = []
    ai_insights: Optional[str] = None
    created_at: Optional[str] = None

class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    priority: Literal['low', 'medium', 'high', 'urgent'] = 'medium'
    category: str = "General"
    status: Literal['todo', 'in_progress', 'completed'] = 'todo'
    due_date: Optional[str] = None
    estimated_minutes: int = 45
    goal_id: Optional[str] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None

class Habit(BaseModel):
    id: str
    title: str
    category: str
    frequency: str = "Daily"
    streak_count: int = 0
    target_days: int = 7
    completed_today: bool = False
    last_completed: Optional[str] = None

class MemoryItem(BaseModel):
    id: str
    type: Literal['short_term', 'episodic', 'semantic', 'behavioral', 'goal']
    content: str
    summary: Optional[str] = None
    tags: List[str] = []
    importance: int = Field(default=5, ge=1, le=10)
    created_at: str
    source: str = "user_interaction"

class Insight(BaseModel):
    id: str
    category: Literal['productivity', 'habit', 'goal_alignment', 'cognitive', 'neglect']
    title: str
    description: str
    impact: Literal['high', 'medium', 'info'] = 'medium'
    confidence: float = 0.92
    action_prompt: Optional[str] = None
    created_at: str

class FocusSession(BaseModel):
    id: str
    task_id: Optional[str] = None
    task_title: Optional[str] = None
    duration_minutes: int = 25
    energy_before: int = 8
    energy_after: int = 9
    notes: Optional[str] = ""
    timestamp: str

class DigitalTwinState(BaseModel):
    current_focus: str = "Pratibimb AI Architecture Completion"
    energy_level: int = Field(default=85, ge=0, le=100)
    workload_status: Literal['Light', 'Optimal', 'Heavy', 'Overloaded'] = 'Optimal'
    context_mode: str = "Deep Engineering Mode"
    last_updated: str
    active_insights_count: int = 4
    unresolved_actions_count: int = 1

class DigitalTwin(BaseModel):
    user_id: str = "user_default"
    profile: UserProfile
    behavior: BehaviorMetrics
    state: DigitalTwinState
    goals: List[Goal] = []
    tasks: List[Task] = []
    habits: List[Habit] = []
    memories: List[MemoryItem] = []
    insights: List[Insight] = []
    focus_sessions: List[FocusSession] = []

# ----------------- AI Chat & Action Schemas -----------------

class AIAction(BaseModel):
    id: str
    type: Literal['create_task', 'update_task', 'complete_task', 'create_goal', 'create_note', 'start_focus_session', 'recommend_action']
    title: str
    description: Optional[str] = None
    payload: Dict[str, Any] = {}
    status: Literal['proposed', 'confirmed', 'rejected', 'executed'] = 'proposed'

class ChatMessage(BaseModel):
    id: str
    role: Literal['user', 'assistant', 'system']
    content: str
    timestamp: str
    actions: Optional[List[AIAction]] = None
    memory_citations: Optional[List[str]] = None
    telemetry_status: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default_session"
    context_filters: Optional[List[str]] = None

class ChatResponse(BaseModel):
    response: str
    actions: List[AIAction] = []
    memory_citations: List[str] = []
    suggested_prompts: List[str] = []
    telemetry: Dict[str, Any] = {}
    updated_twin_summary: Optional[str] = None

class GraphNode(BaseModel):
    id: str
    label: str
    group: str  # user, goal, skill, habit, task, memory, pattern
    value: int = 10
    details: Dict[str, Any] = {}

class GraphLink(BaseModel):
    source: str
    target: str
    label: Optional[str] = None
    weight: float = 1.0

class DigitalTwinGraph(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]

# ----------------- Auth & Onboarding Schemas -----------------

class UserAccount(BaseModel):
    id: str
    email: str
    name: str
    password_hash: str
    salt: str
    created_at: str
    has_onboarded: bool = False

class SignUpRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user_id: str
    email: str
    name: str
    has_onboarded: bool

class OnboardingPayload(BaseModel):
    name: str
    title: str
    bio: Optional[str] = ""
    skills: List[str] = []
    interests: List[str] = []
    preferred_work_style: str = "Deep Focus Blocks (Morning Peak)"
    energy_level: int = Field(default=80, ge=10, le=100)
    initial_goals: List[Dict[str, Any]] = []
    initial_habits: List[Dict[str, Any]] = []
    avatar_config: Optional[Dict[str, Any]] = None

