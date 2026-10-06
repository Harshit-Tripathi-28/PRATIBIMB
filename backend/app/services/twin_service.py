import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from app.models.twin_schemas import (
    DigitalTwin, UserProfile, BehaviorMetrics, DigitalTwinState,
    Goal, GoalMilestone, Task, Habit, MemoryItem, Insight, FocusSession,
    DigitalTwinGraph, GraphNode, GraphLink, OnboardingPayload
)
from app.config import settings

from app.db.database import db

DATA_DIR = os.path.join(settings.BASE_DIR, "data")
TWINS_DIR = os.path.join(DATA_DIR, "twins")

class DigitalTwinService:
    def __init__(self):
        self.db = db
        os.makedirs(TWINS_DIR, exist_ok=True)
        self.cached_twins: Dict[str, DigitalTwin] = {}

    def _get_twin_file_path(self, user_id: str) -> str:
        safe_id = "".join(c for c in user_id if c.isalnum() or c in ('_', '-'))
        return os.path.join(TWINS_DIR, f"{safe_id}.json")

    def _create_fresh_user_twin(self, user_id: str, name: str = "Explorer", email: str = "") -> DigitalTwin:
        now_str = datetime.now().strftime("%b %d, %Y - %I:%M %p")
        
        profile = UserProfile(
            name=name,
            title="Digital Twin Explorer",
            bio="Personal AI Digital Twin calibrated to reflect and support personal goals and cognitive clarity.",
            skills=[],
            interests=[],
            preferred_work_style="Deep Focus Blocks (Morning Peak)",
            workload_capacity="Optimal",
            timezone="IST (UTC+5:30)",
            avatar_config={
                "gender_expression": "neutral",
                "skin_tone": "#E0B394",
                "hair_style": "short_clean",
                "hair_color": "#2C221E",
                "outfit_style": "tech_minimal",
                "outfit_color": "#0F172A",
                "glasses": "none",
                "mood": "focused",
                "aura_color": "cyan"
            }
        )

        behavior = BehaviorMetrics(
            productivity_score=50,
            focus_hours_today=0.0,
            weekly_focus_avg=0.0,
            active_streak_days=0,
            task_completion_rate=0.0,
            peak_focus_time="Calibrating (needs 2+ focus sessions)",
            habit_consistency_index=0.0,
            cognitive_load="Optimal"
        )

        state = DigitalTwinState(
            current_focus="Digital Twin Initialization & Goal Alignment",
            energy_level=80,
            workload_status="Optimal",
            context_mode="Initialization Mode",
            last_updated=now_str,
            active_insights_count=1,
            unresolved_actions_count=0
        )

        insights = [
            Insight(
                id="ins-welcome",
                category="productivity",
                title="Welcome to PRATIBIMB",
                description="Your Digital Twin is initialized. Add your first goal or log a focus session to begin cognitive calibration.",
                impact="info",
                confidence=1.0,
                action_prompt="Define your primary strategic goal.",
                created_at="Today"
            )
        ]

        return DigitalTwin(
            user_id=user_id,
            profile=profile,
            behavior=behavior,
            state=state,
            goals=[],
            tasks=[],
            habits=[],
            memories=[],
            insights=insights,
            focus_sessions=[]
        )

    def _get_seeded_initial_twin(self, user_id: str = "default") -> DigitalTwin:
        now_str = datetime.now().strftime("%b %d, %Y - %I:%M %p")
        
        profile = UserProfile(
            name="Harshit Tripathi",
            title="AI Systems Architect & Engineer",
            bio="Building autonomous agent intelligence, human digital twin architectures, and high-performance cognitive systems.",
            skills=["Python", "FastAPI", "PyTorch", "Computer Vision", "React", "TypeScript", "LLM Orchestration", "Distributed Systems"],
            interests=["AI Digital Twins", "Neuro-symbolic AI", "Deep Learning", "High-Performance Systems", "Cognitive Architecture"],
            preferred_work_style="Deep Morning Sprints (3-4 hour focus blocks)",
            workload_capacity="Optimal",
            timezone="IST (UTC+5:30)",
            avatar_config={
                "gender_expression": "neutral",
                "skin_tone": "#E0B394",
                "hair_style": "short_clean",
                "hair_color": "#2C221E",
                "outfit_style": "tech_minimal",
                "outfit_color": "#0F172A",
                "glasses": "classic",
                "mood": "focused",
                "aura_color": "cyan"
            }
        )

        behavior = BehaviorMetrics(
            productivity_score=65,
            focus_hours_today=0.0,
            weekly_focus_avg=0.0,
            active_streak_days=1,
            task_completion_rate=0.33,
            peak_focus_time="Calibrating (needs 2+ focus sessions)",
            habit_consistency_index=0.50,
            cognitive_load="Balanced"
        )

        state = DigitalTwinState(
            current_focus="Personal AI Operating Layer & Digital Twin Intelligence",
            energy_level=80,
            workload_status="Optimal",
            context_mode="Deep Systems Architecture",
            last_updated=now_str,
            active_insights_count=2,
            unresolved_actions_count=0
        )

        goals = [
            Goal(
                id="goal-1",
                title="Launch Pratibimb Personal AI Operating Layer & Digital Twin",
                description="Deliver an end-to-end AI operating system combining personal intelligence, second brain memory, and a customizable digital avatar.",
                category="Engineering",
                priority="urgent",
                progress=50,
                deadline="End of Sprint",
                milestones=[
                    GoalMilestone(id="m1", title="Core State Persistence & CRUD Architecture", completed=True),
                    GoalMilestone(id="m2", title="Neural Knowledge Constellation Graph", completed=True),
                    GoalMilestone(id="m3", title="Real LLM Provider Integration & Dynamic Reasoning", completed=False),
                    GoalMilestone(id="m4", title="Customizable Digital Avatar Identity", completed=False)
                ],
                linked_task_ids=["task-1", "task-2"],
                ai_insights="2 of 4 milestones completed. Progress tracked dynamically from milestone state.",
                created_at="Oct 01, 2026"
            ),
            Goal(
                id="goal-2",
                title="Publish Research on Anthropometric Digital Twins",
                description="Synthesize behavioral tracking, multi-objective ranking algorithms, and state evolution metrics.",
                category="Research",
                priority="high",
                progress=33,
                deadline="Nov 15, 2026",
                milestones=[
                    GoalMilestone(id="m5", title="Draft Methodology & Architecture Overview", completed=True),
                    GoalMilestone(id="m6", title="Empirical Latency & Accuracy Benchmarks", completed=False),
                    GoalMilestone(id="m7", title="Peer Review & Submission", completed=False)
                ],
                linked_task_ids=["task-3"],
                ai_insights="Methodology section complete. Empirical benchmarks scheduled.",
                created_at="Oct 02, 2026"
            )
        ]

        tasks = [
            Task(
                id="task-1",
                title="Architect Multi-Provider LLM Integration",
                description="Integrate Gemini and OpenAI with graceful deterministic standby fallback.",
                category="Engineering",
                priority="urgent",
                status="completed",
                estimated_minutes=45,
                goal_id="goal-1",
                completed_at="Today"
            ),
            Task(
                id="task-2",
                title="Validate Digital Twin Calibration & Avatar Studio",
                description="Verify avatar persistence, telemetry indicators, and reactive graph updates.",
                category="Engineering",
                priority="high",
                status="todo",
                estimated_minutes=30,
                goal_id="goal-1"
            ),
            Task(
                id="task-3",
                title="Evaluate Semantic Memory Retrieval Benchmark",
                description="Execute vector TF-IDF cosine-similarity evaluation across test corpora.",
                category="Research",
                priority="medium",
                status="todo",
                estimated_minutes=60,
                goal_id="goal-2"
            )
        ]

        habits = [
            Habit(id="h1", title="Morning Neural Deep Work Sprint (90m)", category="Focus", frequency="Daily", streak_count=1, target_days=7, completed_today=True, last_completed="Today"),
            Habit(id="h2", title="AI Technical Reading & Systems Review", category="Learning", frequency="Daily", streak_count=0, target_days=5, completed_today=False, last_completed=None),
            Habit(id="h3", title="Hydration & Cognitive Movement Breaks", category="Health", frequency="Daily", streak_count=1, target_days=7, completed_today=True, last_completed="Today"),
            Habit(id="h4", title="Evening Second Brain Reflection & Ingestion", category="Reflection", frequency="Daily", streak_count=0, target_days=7, completed_today=False, last_completed=None)
        ]

        memories: List[MemoryItem] = [
            MemoryItem(
                id="mem-init-1",
                type="semantic",
                content="Initial Digital Twin profile calibrated for deep work sprints and AI systems architecture.",
                summary="Core work style calibration",
                tags=["twin", "profile", "deep work", "calibration"],
                importance=8,
                created_at="Setup",
                source="system_initialization"
            ),
            MemoryItem(
                id="mem-init-2",
                type="episodic",
                content="Pratibimb Personal AI Operating Layer initialized with real-time cognitive tracking and second brain integration.",
                summary="System initialization event",
                tags=["setup", "pratibimb", "milestone"],
                importance=7,
                created_at="Setup",
                source="system_initialization"
            )
        ]

        insights = [
            Insight(
                id="ins-init-1",
                category="goal_alignment",
                title="Goal 1: 50% Milestone Completion",
                description="You have completed 2 of 4 milestones toward Launch Pratibimb Personal AI Operating Layer.",
                impact="high",
                confidence=1.0,
                action_prompt="Queue 'Validate Digital Twin Calibration & Avatar Studio' as next task.",
                created_at="Today"
            ),
            Insight(
                id="ins-init-2",
                category="productivity",
                title="Cognitive Load Balanced",
                description="Active workload has 1 urgent task completed and 2 pending tasks, maintaining balanced focus.",
                impact="info",
                confidence=1.0,
                action_prompt="Begin a 25-minute focus sprint to maintain momentum.",
                created_at="Today"
            )
        ]

        return DigitalTwin(
            user_id=user_id,
            profile=profile,
            behavior=behavior,
            state=state,
            goals=goals,
            tasks=tasks,
            habits=habits,
            memories=memories,
            insights=insights,
            focus_sessions=[]
        )

    def get_twin(self, user_id: str = "default") -> DigitalTwin:
        if user_id in self.cached_twins:
            return self.cached_twins[user_id]

        # 1. Try SQLite first
        try:
            db_data = self.db.get_twin(user_id)
            if db_data:
                twin = DigitalTwin(**db_data)
                self.cached_twins[user_id] = twin
                return twin
        except Exception as e:
            pass

        # 2. Fallback to file if DB did not have record
        file_path = self._get_twin_file_path(user_id)
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    twin = DigitalTwin(**data)
                    self.cached_twins[user_id] = twin
                    # Populate into SQLite
                    self.db.save_twin(user_id, twin.model_dump())
                    return twin
            except Exception as e:
                print(f"Notice: Re-initializing twin state for {user_id}:", e)

        # 3. For default / demo / harshit_primary user, seed demo data for integration tests
        if user_id in ("default", "harshit_primary", "demo_user"):
            twin = self._get_seeded_initial_twin(user_id)
        else:
            # Check user account name
            from app.services.auth_service import auth_service
            user = auth_service.get_user(user_id)
            user_name = user.name if user else "Explorer"
            twin = self._create_fresh_user_twin(user_id, name=user_name)

        self.cached_twins[user_id] = twin
        self._recalculate_twin_metrics(twin)
        self.save_twin(twin, user_id)
        return twin

    def save_twin(self, twin: Optional[DigitalTwin] = None, user_id: str = "default"):
        if twin:
            self.cached_twins[user_id] = twin
        else:
            twin = self.get_twin(user_id)
        
        twin.state.last_updated = datetime.now().strftime("%b %d, %Y - %I:%M %p")
        twin_dict = twin.model_dump()

        # 1. Persist to SQLite
        try:
            self.db.save_twin(user_id, twin_dict)
        except Exception as e:
            print(f"Failed to persist twin state to DB for {user_id}:", e)

        # 2. Backup to JSON file
        file_path = self._get_twin_file_path(user_id)
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(twin_dict, f, indent=2)
        except Exception as e:
            print(f"Failed to persist twin state file for {user_id}:", e)

    def initialize_onboarded_twin(self, user_id: str, payload: OnboardingPayload) -> DigitalTwin:
        twin = self.get_twin(user_id)
        
        # 1. Update Profile
        twin.profile.name = payload.name.strip()
        twin.profile.title = payload.title.strip()
        if payload.bio:
            twin.profile.bio = payload.bio.strip()
        if payload.skills:
            twin.profile.skills = payload.skills
        if payload.interests:
            twin.profile.interests = payload.interests
        twin.profile.preferred_work_style = payload.preferred_work_style
        if payload.avatar_config:
            twin.profile.avatar_config = payload.avatar_config

        # 2. Update Initial State & Energy
        twin.state.energy_level = payload.energy_level
        twin.state.current_focus = payload.title.strip() or "Strategic Goal Execution"
        twin.state.context_mode = "Active Calibration"

        # 3. Add Initial Goals
        twin.goals = []
        for idx, g_data in enumerate(payload.initial_goals):
            title = g_data.get("title", "").strip()
            if not title:
                continue
            category = g_data.get("category", "General")
            priority = g_data.get("priority", "high")
            deadline = g_data.get("deadline", "End of Quarter")
            new_goal = Goal(
                id=f"goal-{uuid.uuid4().hex[:6]}",
                title=title,
                description=g_data.get("description", title),
                category=category,
                priority=priority if priority in ('low', 'medium', 'high', 'urgent') else 'high',
                progress=0,
                deadline=deadline,
                milestones=[
                    GoalMilestone(id=f"m-{uuid.uuid4().hex[:4]}", title="Initial milestone setup", completed=False)
                ],
                linked_task_ids=[],
                created_at=datetime.now().strftime("%b %d, %Y")
            )
            twin.goals.append(new_goal)

        # 4. Add Initial Habits
        twin.habits = []
        for h_data in payload.initial_habits:
            title = h_data.get("title", "").strip()
            if not title:
                continue
            category = h_data.get("category", "Deep Work")
            twin.habits.append(Habit(
                id=f"h-{uuid.uuid4().hex[:6]}",
                title=title,
                category=category,
                frequency=h_data.get("frequency", "Daily"),
                streak_count=0,
                target_days=int(h_data.get("target_days", 7)),
                completed_today=False
            ))

        # 5. Dynamic insight
        twin.insights = [
            Insight(
                id=f"ins-init-{uuid.uuid4().hex[:4]}",
                category="goal_alignment",
                title=f"Digital Twin Calibrated for {twin.profile.name}",
                description=f"Your Digital Twin is tuned to {twin.profile.preferred_work_style} with {len(twin.goals)} active goal(s).",
                impact="high",
                confidence=1.0,
                action_prompt="Review your today's focus directives.",
                created_at="Today"
            )
        ]

        self._recalculate_twin_metrics(twin)
        self.save_twin(twin, user_id)
        
        from app.services.auth_service import auth_service
        auth_service.mark_onboarded(user_id, name=twin.profile.name)
        return twin

    def update_energy_level(self, level: int, user_id: str = "default") -> int:
        twin = self.get_twin(user_id)
        clamped = max(0, min(100, level))
        twin.state.energy_level = clamped
        self._recalculate_twin_metrics(twin)
        self.save_twin(twin, user_id)
        return clamped

    def update_avatar_config(self, avatar_config: Dict[str, Any], user_id: str = "default") -> Dict[str, Any]:
        twin = self.get_twin(user_id)
        twin.profile.avatar_config = avatar_config
        self.save_twin(twin, user_id)
        return avatar_config

    def get_tasks(self, user_id: str = "default") -> List[Task]:
        return self.get_twin(user_id).tasks

    def add_task(self, task: Task, user_id: str = "default") -> Task:
        twin = self.get_twin(user_id)
        twin.tasks.append(task)
        if task.goal_id:
            for g in twin.goals:
                if g.id == task.goal_id and task.id not in g.linked_task_ids:
                    g.linked_task_ids.append(task.id)
        self._recalculate_twin_metrics(twin)
        self.save_twin(twin, user_id)
        return task

    def toggle_task(self, task_id: str, user_id: str = "default") -> Optional[Task]:
        twin = self.get_twin(user_id)
        for t in twin.tasks:
            if t.id == task_id:
                if t.status == 'completed':
                    t.status = 'todo'
                    t.completed_at = None
                else:
                    t.status = 'completed'
                    t.completed_at = datetime.now().strftime("Today, %I:%M %p")
                self._recalculate_twin_metrics(twin)
                self.save_twin(twin, user_id)
                return t
        return None

    def delete_task(self, task_id: str, user_id: str = "default") -> bool:
        twin = self.get_twin(user_id)
        initial_len = len(twin.tasks)
        twin.tasks = [t for t in twin.tasks if t.id != task_id]
        for g in twin.goals:
            g.linked_task_ids = [tid for tid in g.linked_task_ids if tid != task_id]
        if len(twin.tasks) < initial_len:
            self._recalculate_twin_metrics(twin)
            self.save_twin(twin, user_id)
            return True
        return False

    def get_goals(self, user_id: str = "default") -> List[Goal]:
        return self.get_twin(user_id).goals

    def add_goal(self, goal: Goal, user_id: str = "default") -> Goal:
        twin = self.get_twin(user_id)
        twin.goals.append(goal)
        self._recalculate_twin_metrics(twin)
        self.save_twin(twin, user_id)
        return goal

    def update_goal_progress(self, goal_id: str, progress: int, user_id: str = "default") -> Optional[Goal]:
        twin = self.get_twin(user_id)
        for g in twin.goals:
            if g.id == goal_id:
                g.progress = max(0, min(100, progress))
                self._recalculate_twin_metrics(twin)
                self.save_twin(twin, user_id)
                return g
        return None

    def toggle_goal_milestone(self, goal_id: str, milestone_id: str, user_id: str = "default") -> Optional[Goal]:
        twin = self.get_twin(user_id)
        for g in twin.goals:
            if g.id == goal_id:
                for m in g.milestones:
                    if m.id == milestone_id:
                        m.completed = not m.completed
                        self._sync_goal_progress(g)
                        self._recalculate_twin_metrics(twin)
                        self.save_twin(twin, user_id)
                        return g
        return None

    def _sync_goal_progress(self, goal: Goal):
        if not goal.milestones:
            return
        completed_count = sum(1 for m in goal.milestones if m.completed)
        goal.progress = int((completed_count / len(goal.milestones)) * 100)

    def get_habits(self, user_id: str = "default") -> List[Habit]:
        return self.get_twin(user_id).habits

    def add_habit(self, habit: Habit, user_id: str = "default") -> Habit:
        twin = self.get_twin(user_id)
        twin.habits.append(habit)
        self._recalculate_twin_metrics(twin)
        self.save_twin(twin, user_id)
        return habit

    def toggle_habit(self, habit_id: str, user_id: str = "default") -> Optional[Habit]:
        twin = self.get_twin(user_id)
        for h in twin.habits:
            if h.id == habit_id:
                h.completed_today = not h.completed_today
                if h.completed_today:
                    h.streak_count += 1
                    h.last_completed = datetime.now().strftime("Today, %I:%M %p")
                else:
                    h.streak_count = max(0, h.streak_count - 1)
                self._recalculate_twin_metrics(twin)
                self.save_twin(twin, user_id)
                return h
        return None

    def delete_habit(self, habit_id: str, user_id: str = "default") -> bool:
        twin = self.get_twin(user_id)
        initial_len = len(twin.habits)
        twin.habits = [h for h in twin.habits if h.id != habit_id]
        if len(twin.habits) < initial_len:
            self._recalculate_twin_metrics(twin)
            self.save_twin(twin, user_id)
            return True
        return False

    def get_memories(self, user_id: str = "default") -> List[MemoryItem]:
        return self.get_twin(user_id).memories

    def add_memory(self, memory: MemoryItem, user_id: str = "default") -> MemoryItem:
        twin = self.get_twin(user_id)
        if not memory.created_at:
            memory.created_at = datetime.now().strftime("%b %d, %Y")
        twin.memories.insert(0, memory)
        self.save_twin(twin, user_id)
        return memory

    def delete_memory(self, memory_id: str, user_id: str = "default") -> bool:
        twin = self.get_twin(user_id)
        initial_len = len(twin.memories)
        twin.memories = [m for m in twin.memories if m.id != memory_id]
        if len(twin.memories) < initial_len:
            self.save_twin(twin, user_id)
            return True
        return False

    def record_focus_session(self, session: FocusSession, user_id: str = "default") -> FocusSession:
        twin = self.get_twin(user_id)
        twin.focus_sessions.insert(0, session)
        self._recalculate_twin_metrics(twin)
        self.save_twin(twin, user_id)
        return session

    def reset_to_demo(self, user_id: str = "default") -> DigitalTwin:
        twin = self._get_seeded_initial_twin(user_id)
        self.cached_twins[user_id] = twin
        self._recalculate_twin_metrics(twin)
        self.save_twin(twin, user_id)
        return twin

    def generate_dynamic_insights(self, twin: DigitalTwin) -> List[Insight]:
        insights = []
        now_str = datetime.now().strftime("%b %d")

        # 1. Goal Alignment Insight
        if twin.goals:
            active_goals = [g for g in twin.goals if g.progress < 100]
            if active_goals:
                top_goal = active_goals[0]
                completed_m = sum(1 for m in top_goal.milestones if m.completed)
                total_m = len(top_goal.milestones)
                m_str = f" ({completed_m}/{total_m} milestones)" if total_m > 0 else ""
                insights.append(Insight(
                    id=f"ins-goal-{uuid.uuid4().hex[:4]}",
                    category="goal_alignment",
                    title=f"Goal Progress: {top_goal.title[:35]}...",
                    description=f"{top_goal.progress}% completed{m_str}. Target priority: {top_goal.priority.upper()}.",
                    impact="high" if top_goal.priority in ('urgent', 'high') else "medium",
                    confidence=1.0,
                    action_prompt=f"Focus next block on: {top_goal.title}",
                    created_at="Today"
                ))

        # 2. Task & Cognitive Load Insight
        urgent_tasks = [t for t in twin.tasks if t.status != 'completed' and t.priority == 'urgent']
        pending_tasks = [t for t in twin.tasks if t.status != 'completed']
        
        if urgent_tasks:
            insights.append(Insight(
                id=f"ins-task-{uuid.uuid4().hex[:4]}",
                category="productivity",
                title=f"Urgent Attention Needed ({len(urgent_tasks)} items)",
                description=f"Task '{urgent_tasks[0].title}' is marked urgent. Estimated duration: {urgent_tasks[0].estimated_minutes} mins.",
                impact="high",
                confidence=1.0,
                action_prompt=f"Execute: {urgent_tasks[0].title}",
                created_at="Today"
            ))
        elif pending_tasks:
            insights.append(Insight(
                id=f"ins-task-{uuid.uuid4().hex[:4]}",
                category="productivity",
                title=f"Active Task Queue ({len(pending_tasks)} pending)",
                description=f"Cognitive load is currently {twin.behavior.cognitive_load}. Next prioritized task: '{pending_tasks[0].title}'.",
                impact="info",
                confidence=1.0,
                action_prompt=f"Start 25-min sprint on: {pending_tasks[0].title}",
                created_at="Today"
            ))
        else:
            insights.append(Insight(
                id=f"ins-task-clear",
                category="productivity",
                title="Task Matrix Clear",
                description="No pending tasks in queue. Review goals or capture new thoughts in Second Brain.",
                impact="info",
                confidence=1.0,
                action_prompt="Capture new ideas or define next milestone",
                created_at="Today"
            ))

        # 3. Habit Consistency Insight
        if twin.habits:
            done_habits = [h for h in twin.habits if h.completed_today]
            if len(done_habits) == len(twin.habits) and len(twin.habits) > 0:
                insights.append(Insight(
                    id=f"ins-habit-all",
                    category="habit",
                    title="All Daily Rituals Complete",
                    description=f"Completed {len(done_habits)}/{len(twin.habits)} daily habits today.",
                    impact="info",
                    confidence=1.0,
                    action_prompt="Reflect on today's progress in Second Brain",
                    created_at="Today"
                ))
            else:
                remaining_habits = [h for h in twin.habits if not h.completed_today]
                if remaining_habits:
                    insights.append(Insight(
                        id=f"ins-habit-rem",
                        category="habit",
                        title=f"Pending Ritual: {remaining_habits[0].title}",
                        description=f"{len(done_habits)} of {len(twin.habits)} habits completed today.",
                        impact="medium",
                        confidence=1.0,
                        action_prompt=f"Complete: {remaining_habits[0].title}",
                        created_at="Today"
                    ))

        return insights[:3]

    def get_digital_twin_graph(self, user_id: str = "default") -> DigitalTwinGraph:
        twin = self.get_twin(user_id)
        nodes: List[GraphNode] = []
        links: List[GraphLink] = []

        # Central User Node
        user_node_id = "node_user_root"
        nodes.append(GraphNode(
            id=user_node_id,
            label=f"{twin.profile.name} (Digital Twin)",
            group="user",
            value=25,
            details={
                "Title": twin.profile.title,
                "Work Style": twin.profile.preferred_work_style,
                "Energy": f"{twin.state.energy_level}%",
                "Cognitive Load": twin.behavior.cognitive_load,
                "Timezone": twin.profile.timezone
            }
        ))

        # Goal Nodes
        for goal in twin.goals:
            g_node_id = f"node_goal_{goal.id}"
            nodes.append(GraphNode(
                id=g_node_id,
                label=goal.title[:28] + ("..." if len(goal.title) > 28 else ""),
                group="goal",
                value=18,
                details={
                    "Category": goal.category,
                    "Priority": goal.priority,
                    "Progress": f"{goal.progress}%",
                    "Deadline": goal.deadline,
                    "Milestones": f"{sum(1 for m in goal.milestones if m.completed)}/{len(goal.milestones)}"
                }
            ))
            links.append(GraphLink(source=user_node_id, target=g_node_id, label="strategic_target", weight=2.0))

        # Skill Nodes
        for idx, skill in enumerate(twin.profile.skills[:6]):
            s_node_id = f"node_skill_{idx}"
            nodes.append(GraphNode(
                id=s_node_id,
                label=skill,
                group="skill",
                value=10,
                details={"Type": "Core Competency", "Proficiency": "Advanced"}
            ))
            links.append(GraphLink(source=user_node_id, target=s_node_id, label="competency", weight=1.0))

        # Habit Nodes
        for habit in twin.habits[:4]:
            h_node_id = f"node_habit_{habit.id}"
            nodes.append(GraphNode(
                id=h_node_id,
                label=habit.title[:24] + ("..." if len(habit.title) > 24 else ""),
                group="habit",
                value=12,
                details={
                    "Category": habit.category,
                    "Streak": f"{habit.streak_count} days",
                    "Frequency": habit.frequency,
                    "Done Today": "Yes" if habit.completed_today else "No"
                }
            ))
            links.append(GraphLink(source=user_node_id, target=h_node_id, label="daily_ritual", weight=1.2))

        # Task Nodes
        for task in twin.tasks[:6]:
            t_node_id = f"node_task_{task.id}"
            nodes.append(GraphNode(
                id=t_node_id,
                label=task.title[:24] + ("..." if len(task.title) > 24 else ""),
                group="task",
                value=11,
                details={
                    "Priority": task.priority,
                    "Status": task.status,
                    "Est. Duration": f"{task.estimated_minutes} min",
                    "Category": task.category
                }
            ))
            parent_id = f"node_goal_{task.goal_id}" if (task.goal_id and any(g.id == task.goal_id for g in twin.goals)) else user_node_id
            links.append(GraphLink(source=parent_id, target=t_node_id, label="action_item", weight=1.5))

        # Memory Nodes
        for mem in twin.memories[:4]:
            m_node_id = f"node_mem_{mem.id}"
            nodes.append(GraphNode(
                id=m_node_id,
                label=(mem.summary or mem.content[:24]) + "...",
                group="memory",
                value=13,
                details={
                    "Type": mem.type,
                    "Importance": f"{mem.importance}/10",
                    "Tags": ", ".join(mem.tags),
                    "Created": mem.created_at
                }
            ))
            links.append(GraphLink(source=user_node_id, target=m_node_id, label="episodic_context", weight=1.1))

        return DigitalTwinGraph(nodes=nodes, links=links)

    def _recalculate_twin_metrics(self, twin: DigitalTwin):
        total_tasks = len(twin.tasks)
        completed_tasks = len([t for t in twin.tasks if t.status == 'completed'])
        pending_urgent = len([t for t in twin.tasks if t.status != 'completed' and t.priority == 'urgent'])
        pending_high = len([t for t in twin.tasks if t.status != 'completed' and t.priority == 'high'])
        total_pending = total_tasks - completed_tasks

        # 1. Task Completion Rate
        twin.behavior.task_completion_rate = round(completed_tasks / max(1, total_tasks), 2)

        # 2. Habit Consistency Index
        total_habits = len(twin.habits)
        completed_habits = len([h for h in twin.habits if h.completed_today])
        twin.behavior.habit_consistency_index = round(completed_habits / max(1, total_habits), 2)

        # 3. Overall Productivity Score
        task_weight = 0.60
        habit_weight = 0.40
        twin.behavior.productivity_score = int(
            (twin.behavior.task_completion_rate * task_weight + 
             twin.behavior.habit_consistency_index * habit_weight) * 100
        )

        # 4. Deterministic Cognitive Load & Workload
        if pending_urgent >= 2 or total_pending >= 8:
            cog_load = "Heavy"
            workload = "Heavy"
        elif pending_urgent == 1 or pending_high >= 2 or total_pending >= 4:
            cog_load = "Elevated"
            workload = "Optimal"
        elif total_pending > 0:
            cog_load = "Balanced"
            workload = "Optimal"
        else:
            cog_load = "Optimal"
            workload = "Light"

        twin.behavior.cognitive_load = cog_load
        twin.state.workload_status = workload

        # 5. Focus hours today from actual sessions logged today
        today_mins = 0
        for s in twin.focus_sessions:
            if "Today" in s.timestamp or datetime.now().strftime("%b %d") in s.timestamp:
                today_mins += s.duration_minutes
        twin.behavior.focus_hours_today = round(today_mins / 60.0, 1)

        # 6. Peak focus time calibration check
        if len(twin.focus_sessions) >= 2:
            morning = sum(1 for s in twin.focus_sessions if "AM" in s.timestamp)
            afternoon = sum(1 for s in twin.focus_sessions if "PM" in s.timestamp)
            twin.behavior.peak_focus_time = "Morning Sprints (09:00 AM - 01:00 PM)" if morning >= afternoon else "Afternoon / Evening Focus (02:00 PM - 06:00 PM)"
        else:
            twin.behavior.peak_focus_time = "Calibrating (needs 2+ focus sessions)"

        # 7. Dynamic insights update
        twin.insights = self.generate_dynamic_insights(twin)

twin_service = DigitalTwinService()
