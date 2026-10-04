import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from app.models.twin_schemas import (
    DigitalTwin, UserProfile, BehaviorMetrics, DigitalTwinState,
    Goal, GoalMilestone, Task, Habit, MemoryItem, Insight, FocusSession,
    DigitalTwinGraph, GraphNode, GraphLink
)
from app.config import settings

DATA_DIR = os.path.join(settings.BASE_DIR, "data")
STATE_FILE = os.path.join(DATA_DIR, "twin_state.json")

class DigitalTwinService:
    def __init__(self):
        os.makedirs(DATA_DIR, exist_ok=True)
        self.twin: DigitalTwin = self._load_or_create_twin()

    def _get_seeded_initial_twin(self) -> DigitalTwin:
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
            workload_status="Balanced",
            context_mode="Deep Systems Architecture",
            last_updated=now_str,
            active_insights_count=2,
            unresolved_actions_count=0
        )

        # 1. Connected Personal Goals
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
                ai_insights="1 of 3 milestones completed.",
                created_at="Sep 28, 2026"
            )
        ]

        # 2. Linked Tasks
        tasks = [
            Task(
                id="task-1",
                title="Complete Digital Twin LLM Provider Integration",
                description="Connect Gemini / OpenAI / Anthropic provider abstraction with environment key detection.",
                priority="urgent",
                category="Engineering",
                status="completed",
                due_date="Today",
                estimated_minutes=45,
                goal_id="goal-1",
                created_at="Today, 09:15 AM",
                completed_at="Today, 10:45 AM"
            ),
            Task(
                id="task-2",
                title="Test Dynamic Insight Generation & Avatar Studio",
                description="Verify dynamic rule-based insights and interactive digital avatar identity layer.",
                priority="high",
                category="Engineering",
                status="todo",
                due_date="Today",
                estimated_minutes=35,
                goal_id="goal-1",
                created_at="Today, 10:50 AM"
            ),
            Task(
                id="task-3",
                title="Log 25-min Deep Focus Session on Cognitive Architecture",
                description="Execute first timed sprint to calibrate personal peak focus time and energy metrics.",
                priority="medium",
                category="Research",
                status="todo",
                due_date="Tomorrow",
                estimated_minutes=25,
                goal_id="goal-2",
                created_at="Today, 11:00 AM"
            )
        ]

        # 3. Habits
        habits = [
            Habit(id="h1", title="Morning Deep Architecture Session (90 min)", category="Deep Work", frequency="Daily", streak_count=1, target_days=7, completed_today=True, last_completed="Today"),
            Habit(id="h2", title="AI Technical Reading & Systems Review", category="Learning", frequency="Daily", streak_count=0, target_days=5, completed_today=False, last_completed=None),
            Habit(id="h3", title="Hydration & Cognitive Movement Breaks", category="Health", frequency="Daily", streak_count=1, target_days=7, completed_today=True, last_completed="Today"),
            Habit(id="h4", title="Evening Second Brain Reflection & Ingestion", category="Reflection", frequency="Daily", streak_count=0, target_days=7, completed_today=False, last_completed=None)
        ]

        # 4. Clean Memories (Clean Second Brain for the user)
        memories: List[MemoryItem] = []

        # 5. Dynamic Insights
        insights = [
            Insight(
                id="ins-init-1",
                category="goal_alignment",
                title="Goal 1: 50% Milestone Completion",
                description="You have completed 2 of 4 milestones toward Launch Pratibimb Personal AI Operating Layer.",
                impact="high",
                confidence=1.0,
                action_prompt="Queue 'Test Dynamic Insight Generation & Avatar Studio' as next task.",
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

        focus_sessions: List[FocusSession] = []

        return DigitalTwin(
            user_id="harshit_primary",
            profile=profile,
            behavior=behavior,
            state=state,
            goals=goals,
            tasks=tasks,
            habits=habits,
            memories=memories,
            insights=insights,
            focus_sessions=focus_sessions
        )

    def _load_or_create_twin(self) -> DigitalTwin:
        if os.path.exists(STATE_FILE):
            try:
                with open(STATE_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    twin = DigitalTwin(**data)
                    return twin
            except Exception as e:
                print("Notice: Re-initializing twin state due to schema update:", e)
        twin = self._get_seeded_initial_twin()
        self._recalculate_twin_metrics(twin)
        self.save_twin(twin)
        return twin

    def save_twin(self, twin: Optional[DigitalTwin] = None):
        if twin:
            self.twin = twin
        self.twin.state.last_updated = datetime.now().strftime("%b %d, %Y - %I:%M %p")
        try:
            with open(STATE_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.twin.model_dump(), f, indent=2)
        except Exception as e:
            print("Failed to persist twin state to disk:", e)

    def get_twin(self) -> DigitalTwin:
        return self.twin

    def reset_to_demo(self) -> DigitalTwin:
        self.twin = self._get_seeded_initial_twin()
        self._recalculate_twin_metrics()
        self.save_twin()
        return self.twin

    def update_energy_level(self, level: int) -> int:
        self.twin.state.energy_level = max(0, min(100, level))
        self.save_twin()
        return self.twin.state.energy_level

    def update_avatar_config(self, avatar_config: Dict[str, Any]) -> Dict[str, Any]:
        self.twin.profile.avatar_config = avatar_config
        self.save_twin()
        return self.twin.profile.avatar_config

    # ---------------- Task Operations ----------------
    def get_tasks(self) -> List[Task]:
        return self.twin.tasks

    def add_task(self, task: Task) -> Task:
        if not task.id:
            task.id = f"task-{uuid.uuid4().hex[:6]}"
        if not task.created_at:
            task.created_at = "Today, " + datetime.now().strftime("%I:%M %p")
        self.twin.tasks.insert(0, task)
        self._recalculate_twin_metrics()
        self.save_twin()
        return task

    def update_task(self, task_id: str, updates: Dict[str, Any]) -> Optional[Task]:
        for i, t in enumerate(self.twin.tasks):
            if t.id == task_id:
                updated_dict = t.model_dump()
                updated_dict.update(updates)
                new_task = Task(**updated_dict)
                self.twin.tasks[i] = new_task
                self._recalculate_twin_metrics()
                self.save_twin()
                return new_task
        return None

    def toggle_task(self, task_id: str) -> Optional[Task]:
        for t in self.twin.tasks:
            if t.id == task_id:
                if t.status == 'completed':
                    t.status = 'todo'
                    t.completed_at = None
                else:
                    t.status = 'completed'
                    t.completed_at = datetime.now().strftime("%b %d, %I:%M %p")
                self._recalculate_twin_metrics()
                self.save_twin()
                return t
        return None

    def delete_task(self, task_id: str) -> bool:
        initial_len = len(self.twin.tasks)
        self.twin.tasks = [t for t in self.twin.tasks if t.id != task_id]
        if len(self.twin.tasks) != initial_len:
            self._recalculate_twin_metrics()
            self.save_twin()
            return True
        return False

    # ---------------- Goal Operations ----------------
    def get_goals(self) -> List[Goal]:
        return self.twin.goals

    def add_goal(self, goal: Goal) -> Goal:
        if not goal.id:
            goal.id = f"goal-{uuid.uuid4().hex[:6]}"
        if not goal.created_at:
            goal.created_at = datetime.now().strftime("%b %d, %Y")
        self._sync_goal_progress(goal)
        self.twin.goals.append(goal)
        self._recalculate_twin_metrics()
        self.save_twin()
        return goal

    def update_goal_progress(self, goal_id: str, progress: int) -> Optional[Goal]:
        for g in self.twin.goals:
            if g.id == goal_id:
                g.progress = max(0, min(100, progress))
                self._recalculate_twin_metrics()
                self.save_twin()
                return g
        return None

    def toggle_goal_milestone(self, goal_id: str, milestone_id: str) -> Optional[Goal]:
        for g in self.twin.goals:
            if g.id == goal_id:
                for m in g.milestones:
                    if m.id == milestone_id:
                        m.completed = not m.completed
                self._sync_goal_progress(g)
                self._recalculate_twin_metrics()
                self.save_twin()
                return g
        return None

    def _sync_goal_progress(self, goal: Goal):
        if goal.milestones:
            done = len([m for m in goal.milestones if m.completed])
            total = len(goal.milestones)
            goal.progress = int((done / float(total)) * 100)
            goal.ai_insights = f"{done} of {total} milestones completed ({goal.progress}%)."

    # ---------------- Habit Operations ----------------
    def get_habits(self) -> List[Habit]:
        return self.twin.habits

    def add_habit(self, habit: Habit) -> Habit:
        if not habit.id:
            habit.id = f"h-{uuid.uuid4().hex[:6]}"
        self.twin.habits.append(habit)
        self._recalculate_twin_metrics()
        self.save_twin()
        return habit

    def toggle_habit(self, habit_id: str) -> Optional[Habit]:
        for h in self.twin.habits:
            if h.id == habit_id:
                h.completed_today = not h.completed_today
                if h.completed_today:
                    h.streak_count += 1
                    h.last_completed = "Today"
                else:
                    h.streak_count = max(0, h.streak_count - 1)
                self._recalculate_twin_metrics()
                self.save_twin()
                return h
        return None

    def delete_habit(self, habit_id: str) -> bool:
        initial_len = len(self.twin.habits)
        self.twin.habits = [h for h in self.twin.habits if h.id != habit_id]
        if len(self.twin.habits) != initial_len:
            self._recalculate_twin_metrics()
            self.save_twin()
            return True
        return False

    # ---------------- Memory Operations ----------------
    def get_memories(self) -> List[MemoryItem]:
        return self.twin.memories

    def add_memory(self, memory: MemoryItem) -> MemoryItem:
        if not memory.id:
            memory.id = f"mem-{uuid.uuid4().hex[:6]}"
        if not memory.created_at:
            memory.created_at = datetime.now().strftime("%b %d, %Y")
        self.twin.memories.insert(0, memory)
        self._recalculate_twin_metrics()
        self.save_twin()
        return memory

    def delete_memory(self, memory_id: str) -> bool:
        initial_len = len(self.twin.memories)
        self.twin.memories = [m for m in self.twin.memories if m.id != memory_id]
        if len(self.twin.memories) != initial_len:
            self._recalculate_twin_metrics()
            self.save_twin()
            return True
        return False

    # ---------------- Focus Session Operations ----------------
    def record_focus_session(self, session: FocusSession) -> FocusSession:
        if not session.id:
            session.id = f"fs-{uuid.uuid4().hex[:6]}"
        if not session.timestamp:
            session.timestamp = datetime.now().strftime("%b %d, %I:%M %p")
        self.twin.focus_sessions.insert(0, session)
        self._recalculate_twin_metrics()
        self.save_twin()
        return session

    # ---------------- Dynamic Insights Generator ----------------
    def generate_dynamic_insights(self) -> List[Insight]:
        """
        Generates genuine insights from actual state rather than static mock text.
        Evaluates real tasks, deadlines, habits, and focus metrics.
        """
        insights: List[Insight] = []
        now_date_str = datetime.now().strftime("%b %d")

        # 1. Urgent/High Priority Task Evaluation
        urgent_tasks = [t for t in self.twin.tasks if t.status != 'completed' and t.priority == 'urgent']
        high_tasks = [t for t in self.twin.tasks if t.status != 'completed' and t.priority == 'high']
        completed_today = [t for t in self.twin.tasks if t.status == 'completed' and (t.completed_at and 'Today' in t.completed_at)]

        if urgent_tasks:
            t = urgent_tasks[0]
            insights.append(Insight(
                id=f"ins-urg-{uuid.uuid4().hex[:4]}",
                category="productivity",
                title=f"Urgent Priority: {t.title}",
                description=f"You have an urgent task requiring attention (~{t.estimated_minutes} min estimated).",
                impact="high",
                confidence=1.0,
                action_prompt=f"Execute '{t.title[:32]}...'",
                created_at=now_date_str
            ))
        elif completed_today:
            insights.append(Insight(
                id=f"ins-comp-{uuid.uuid4().hex[:4]}",
                category="productivity",
                title=f"{len(completed_today)} Task{'s' if len(completed_today) > 1 else ''} Completed Today",
                description="Positive momentum detected. Your active task completion rate is reflecting steady progress.",
                impact="info",
                confidence=1.0,
                action_prompt="Review pending goals to select your next focus block.",
                created_at=now_date_str
            ))

        # 2. Goal Alignment Evaluation
        active_goals = [g for g in self.twin.goals if g.progress < 100]
        if active_goals:
            top_goal = active_goals[0]
            completed_milestones = len([m for m in top_goal.milestones if m.completed])
            total_milestones = len(top_goal.milestones)
            insights.append(Insight(
                id=f"ins-goal-{uuid.uuid4().hex[:4]}",
                category="goal_alignment",
                title=f"Goal Progress: {top_goal.title[:35]}...",
                description=f"{completed_milestones} of {total_milestones} milestones finished ({top_goal.progress}%). Deadline: {top_goal.deadline}.",
                impact="high" if top_goal.priority in ['urgent', 'high'] else 'medium',
                confidence=1.0,
                action_prompt=f"Review milestone trajectory for '{top_goal.title[:25]}...'",
                created_at=now_date_str
            ))

        # 3. Habit Consistency Check
        done_habits = [h for h in self.twin.habits if h.completed_today]
        total_habits = len(self.twin.habits)
        if total_habits > 0:
            if len(done_habits) == total_habits:
                insights.append(Insight(
                    id=f"ins-hab-{uuid.uuid4().hex[:4]}",
                    category="habit",
                    title="100% Daily Habits Fulfilled",
                    description=f"All {total_habits} daily ritual protocols checked off today. Consistency index peaked.",
                    impact="info",
                    confidence=1.0,
                    action_prompt="Record a reflection note in your Second Brain.",
                    created_at=now_date_str
                ))
            elif len(done_habits) > 0:
                insights.append(Insight(
                    id=f"ins-hab-{uuid.uuid4().hex[:4]}",
                    category="habit",
                    title=f"Habits: {len(done_habits)}/{total_habits} Complete Today",
                    description=f"{total_habits - len(done_habits)} habits remaining for today's routine.",
                    impact="medium",
                    confidence=1.0,
                    action_prompt="Check in on remaining daily habits.",
                    created_at=now_date_str
                ))

        # 4. Cognitive Workload Diagnostic
        if self.twin.behavior.cognitive_load == "Heavy":
            insights.append(Insight(
                id=f"ins-load-{uuid.uuid4().hex[:4]}",
                category="cognitive",
                title="Cognitive Workload Elevated",
                description="Multiple urgent tasks pending. Consider deferring secondary items to protect focus quality.",
                impact="high",
                confidence=1.0,
                action_prompt="Delegate or reschedule lower-priority tasks.",
                created_at=now_date_str
            ))
        elif self.twin.behavior.cognitive_load == "Optimal" or self.twin.behavior.cognitive_load == "Balanced":
            insights.append(Insight(
                id=f"ins-load-{uuid.uuid4().hex[:4]}",
                category="cognitive",
                title=f"Workload {self.twin.behavior.cognitive_load}",
                description="Task distribution is within manageable parameters for uninterrupted deep focus.",
                impact="info",
                confidence=1.0,
                action_prompt="Engage in a 25-minute focus session.",
                created_at=now_date_str
            ))

        # Default if empty
        if not insights:
            insights.append(Insight(
                id="ins-init",
                category="productivity",
                title="Digital Twin Initialized",
                description="Add tasks, goals, or memories to generate personalized behavioral insights.",
                impact="info",
                confidence=1.0,
                action_prompt="Create your first execution task.",
                created_at=now_date_str
            ))

        return insights[:4]

    # ---------------- Neural Graph Generation ----------------
    def get_digital_twin_graph(self) -> DigitalTwinGraph:
        """
        Builds the 2D/3D Node-Link Neural Constellation Graph connecting all facets of the human digital twin.
        """
        nodes: List[GraphNode] = []
        links: List[GraphLink] = []

        # Central User Node
        user_node_id = "node_user_core"
        nodes.append(GraphNode(
            id=user_node_id,
            label=self.twin.profile.name,
            group="user",
            value=25,
            details={
                "Title": self.twin.profile.title,
                "Work Style": self.twin.profile.preferred_work_style,
                "Timezone": self.twin.profile.timezone,
                "Productivity Score": f"{self.twin.behavior.productivity_score}%",
                "Cognitive Load": self.twin.behavior.cognitive_load,
                "Energy": f"{self.twin.state.energy_level}%",
                "Current Focus": self.twin.state.current_focus
            }
        ))

        # Goals Nodes
        for g in self.twin.goals:
            g_node_id = f"node_goal_{g.id}"
            nodes.append(GraphNode(
                id=g_node_id,
                label=g.title,
                group="goal",
                value=16,
                details={
                    "Category": g.category,
                    "Priority": g.priority.upper(),
                    "Progress": f"{g.progress}%",
                    "Deadline": g.deadline,
                    "Milestones": f"{len([m for m in g.milestones if m.completed])}/{len(g.milestones)} completed"
                }
            ))
            links.append(GraphLink(source=user_node_id, target=g_node_id, label="Targets Goal", weight=2.0))

        # Skills Nodes
        for idx, skill in enumerate(self.twin.profile.skills[:6]):
            s_node_id = f"node_skill_{idx}"
            nodes.append(GraphNode(
                id=s_node_id,
                label=skill,
                group="skill",
                value=12,
                details={"Skill": skill, "Category": "Core Competency"}
            ))
            links.append(GraphLink(source=user_node_id, target=s_node_id, label="Competency", weight=1.2))

        # Active Tasks Nodes
        for t in self.twin.tasks[:5]:
            t_node_id = f"node_task_{t.id}"
            nodes.append(GraphNode(
                id=t_node_id,
                label=t.title,
                group="task",
                value=10,
                details={
                    "Task": t.title,
                    "Priority": t.priority.upper(),
                    "Status": t.status.replace("_", " ").title(),
                    "Estimated Duration": f"{t.estimated_minutes} min",
                    "Category": t.category
                }
            ))
            if t.goal_id:
                links.append(GraphLink(source=f"node_goal_{t.goal_id}", target=t_node_id, label="Milestone Task", weight=1.5))
            else:
                links.append(GraphLink(source=user_node_id, target=t_node_id, label="Active Task", weight=1.0))

        # Habits Nodes
        for h in self.twin.habits:
            h_node_id = f"node_habit_{h.id}"
            nodes.append(GraphNode(
                id=h_node_id,
                label=h.title,
                group="habit",
                value=11,
                details={
                    "Habit": h.title,
                    "Streak": f"{h.streak_count} consecutive days",
                    "Target": f"{h.target_days} days/week",
                    "Status Today": "Completed ✓" if h.completed_today else "Pending"
                }
            ))
            links.append(GraphLink(source=user_node_id, target=h_node_id, label="Daily Rhythm", weight=1.3))

        # Semantic Memories Nodes
        for m in self.twin.memories[:6]:
            m_node_id = f"node_mem_{m.id}"
            nodes.append(GraphNode(
                id=m_node_id,
                label=m.summary or m.content[:28] + ("..." if len(m.content) > 28 else ""),
                group="memory",
                value=9,
                details={
                    "Type": m.type.upper(),
                    "Content": m.content,
                    "Tags": ", ".join(m.tags) if m.tags else "None",
                    "Importance": f"{m.importance}/10",
                    "Date": m.created_at
                }
            ))
            links.append(GraphLink(source=user_node_id, target=m_node_id, label="Memory Trace", weight=0.8))

        return DigitalTwinGraph(nodes=nodes, links=links)

    def _recalculate_twin_metrics(self, target_twin: Optional[DigitalTwin] = None):
        twin = target_twin or self.twin

        # Sync goal progress
        for g in twin.goals:
            self._sync_goal_progress(g)

        # 1. Task Completion Rate
        total_tasks = len(twin.tasks)
        if total_tasks > 0:
            done_tasks = len([t for t in twin.tasks if t.status == 'completed'])
            twin.behavior.task_completion_rate = round(done_tasks / float(total_tasks), 2)
        else:
            twin.behavior.task_completion_rate = 0.0

        # 2. Habit Consistency Index
        completed_habits = len([h for h in twin.habits if h.completed_today])
        total_habits = len(twin.habits)
        if total_habits > 0:
            habit_ratio = completed_habits / float(total_habits)
            twin.behavior.habit_consistency_index = round(habit_ratio, 2)
        else:
            twin.behavior.habit_consistency_index = 0.0

        # 3. Productivity Score (honest formula based on actual completion ratios)
        if total_tasks == 0 and total_habits == 0:
            twin.behavior.productivity_score = 50
        else:
            base_score = int(
                (twin.behavior.task_completion_rate * 55) +
                (twin.behavior.habit_consistency_index * 35) +
                10
            )
            twin.behavior.productivity_score = max(20, min(100, base_score))

        # 4. Cognitive Load Calculation from actual pending tasks
        pending_urgent = len([t for t in twin.tasks if t.status != 'completed' and t.priority == 'urgent'])
        pending_high = len([t for t in twin.tasks if t.status != 'completed' and t.priority == 'high'])
        total_pending = len([t for t in twin.tasks if t.status != 'completed'])

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
            morning = 0
            afternoon = 0
            for s in twin.focus_sessions:
                if "AM" in s.timestamp:
                    morning += 1
                else:
                    afternoon += 1
            if morning > afternoon:
                twin.behavior.peak_focus_time = "09:00 AM - 01:00 PM (Morning)"
            elif afternoon > morning:
                twin.behavior.peak_focus_time = "02:00 PM - 06:00 PM (Afternoon)"
            else:
                twin.behavior.peak_focus_time = "Flexible / Mixed Sessions"
        else:
            twin.behavior.peak_focus_time = "Calibrating (needs 2+ focus sessions)"

        # 7. Dynamic Insights Generation
        twin.insights = self.generate_dynamic_insights()
        twin.state.active_insights_count = len(twin.insights)

twin_service = DigitalTwinService()
