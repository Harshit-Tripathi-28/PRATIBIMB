import uuid
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.models.twin_schemas import (
    ChatRequest, ChatResponse, AIAction, DigitalTwin, Task, Goal, FocusSession
)
from app.services.twin_service import twin_service
from app.services.ml_intelligence_service import ml_service
from app.services.llm_provider import llm_service

class AIOrchestrator:
    def __init__(self):
        self.system_prompt = (
            "You are PRATIBIMB, the personal AI Digital Twin and Cognitive Operating Layer of the user. "
            "You are NOT a generic assistant. You reflect the user back to themselves: their cognitive state, "
            "active goals, behavioral patterns, memories, and priorities. "
            "Be concise, insightful, supportive, and direct. Help them maintain clarity, prioritize high-leverage "
            "work, overcome friction, and make thoughtful decisions aligned with their aspirations."
        )

    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        twin: DigitalTwin = twin_service.get_twin()
        user_msg = request.message.strip()
        msg_lower = user_msg.lower()

        actions: List[AIAction] = []
        citations: List[str] = []
        suggested_prompts: List[str] = []

        # 1. Semantic Memory Retrieval (Vector Search)
        retrieved_memories = ml_service.semantic_memory_search(user_msg, twin.memories, top_k=3)
        for mem, sim_score in retrieved_memories:
            citations.append(f"Memory [{mem.type.upper()}]: {mem.summary or mem.content[:60]}... (Similarity: {int(sim_score*100)}%)")

        # 2. Build Live Context Summary for Reasoning
        active_goals_str = "\n".join([f"- Goal: {g.title} ({g.progress}% done, Priority: {g.priority})" for g in twin.goals[:3]]) or "None"
        pending_tasks_str = "\n".join([f"- Task: {t.title} [Priority: {t.priority}, Est: {t.estimated_minutes}m]" for t in twin.tasks if t.status != 'completed'][:4]) or "None"
        memories_str = "\n".join([f"- [{m.type}] {m.content}" for m, _ in retrieved_memories]) or "No relevant memories retrieved."

        context_summary = (
            f"User Profile: {twin.profile.name} ({twin.profile.title})\n"
            f"Work Style: {twin.profile.preferred_work_style} | Timezone: {twin.profile.timezone}\n"
            f"Current Focus: {twin.state.current_focus}\n"
            f"Cognitive Load: {twin.behavior.cognitive_load} | Energy Level: {twin.state.energy_level}%\n"
            f"Active Goals:\n{active_goals_str}\n"
            f"Pending Tasks:\n{pending_tasks_str}\n"
            f"Retrieved Memories:\n{memories_str}"
        )

        llm_status = llm_service.get_status()

        # 3. IF REAL LLM IS CONFIGURED: Run Live Generative Reasoning
        if llm_status["configured"]:
            raw_text, action_dict = await llm_service.generate_response(
                system_prompt=self.system_prompt,
                user_message=user_msg,
                context_summary=context_summary
            )

            if action_dict:
                actions.append(AIAction(
                    id=f"act-{uuid.uuid4().hex[:6]}",
                    type=action_dict.get("type", "create_task"),
                    title=action_dict.get("title", "Proposed Action"),
                    description=action_dict.get("description", ""),
                    payload=action_dict.get("payload", {})
                ))

            suggested_prompts = [
                "What should I prioritize right now?",
                "Analyze my behavioral patterns",
                "Summarize my active goals"
            ]

            telemetry = {
                "llm_connected": True,
                "provider": llm_status["provider"],
                "model": llm_status["model"],
                "semantic_memories_retrieved": len(retrieved_memories),
                "timestamp": datetime.now().strftime("%I:%M:%S %p")
            }

            return ChatResponse(
                response=raw_text,
                actions=actions,
                memory_citations=citations,
                suggested_prompts=suggested_prompts,
                telemetry=telemetry,
                updated_twin_summary=f"Cognitive Load: {twin.behavior.cognitive_load} | Energy: {twin.state.energy_level}%"
            )

        # 4. IF NO LLM CONFIGURED: Transparent Standby Mode (No Fake Intelligence)
        # Handle structured deterministic operations honestly
        if any(w in msg_lower for w in ["task", "todo", "schedule", "remind", "action"]):
            cleaned_title = re.sub(
                r"^(create\s+a?\s*task\s*(for|to)?|add\s+a?\s*task\s*(for|to)?|let's\s+create\s+a?\s*task\s*(for|to)?|remind\s+me\s+to|schedule\s+a?\s*task\s*(for|to)?)\s*",
                "", user_msg, flags=re.IGNORECASE
            ).strip()
            if not cleaned_title:
                cleaned_title = "Follow up on active engineering priorities"

            actions.append(AIAction(
                id=f"act-{uuid.uuid4().hex[:6]}",
                type="create_task",
                title=f"Create Task: '{cleaned_title.capitalize()}'",
                description="Adds task to your prioritized queue linked to your primary goal.",
                payload={
                    "title": cleaned_title.capitalize(),
                    "priority": "high",
                    "estimated_minutes": 30,
                    "category": "Engineering",
                    "goal_id": twin.goals[0].id if twin.goals else None
                }
            ))

            response_text = (
                f"### ⚡ Structured Task Proposal\n\n"
                f"I've structured a task based on your input:\n\n"
                f"- **Title**: `{cleaned_title.capitalize()}`\n"
                f"- **Assigned Priority**: `HIGH`\n"
                f"- **Estimated Time**: `30 mins`\n"
                f"- **Target Goal**: `{twin.goals[0].title if twin.goals else 'General'}`\n\n"
                f"Click **Execute Action** below to commit it to your Digital Twin task matrix.\n\n"
                f"> ℹ️ *Note: AI Core is running in Standby Mode. Configure `GEMINI_API_KEY` or `OPENAI_API_KEY` for generative reasoning.*"
            )

        elif any(w in msg_lower for w in ["focus", "priorities", "what should i do", "what to do next", "today's plan"]):
            ranked_tasks = ml_service.rank_task_recommendations(twin.tasks, twin.state.energy_level, twin.goals)
            top_rec = ranked_tasks[0] if ranked_tasks else None

            response_text = (
                f"### 🎯 Current Focus Directive (State Analysis)\n\n"
                f"Evaluating your active state: **Cognitive Load: {twin.behavior.cognitive_load}**, **Energy: {twin.state.energy_level}%**.\n\n"
            )

            if top_rec:
                t: Task = top_rec["task"]
                response_text += (
                    f"**Recommended Task**: **{t.title}** (`{t.priority.upper()}` priority, ~{t.estimated_minutes} min)\n"
                    f"*Criteria*: {top_rec['reason']}\n\n"
                )
                actions.append(AIAction(
                    id=f"act-{uuid.uuid4().hex[:6]}",
                    type="start_focus_session",
                    title=f"Start 25-min Focus Block: '{t.title[:30]}...'",
                    description="Activates timer and logs focus session.",
                    payload={"task_id": t.id, "duration_minutes": 25, "task_title": t.title}
                ))
            else:
                response_text += "No pending tasks found. All active items completed or clear.\n\n"

            response_text += (
                f"> ℹ️ *Notice: To enable full neural generative reasoning, add `GEMINI_API_KEY` or `OPENAI_API_KEY` to your `.env` file.*"
            )

        elif any(w in msg_lower for w in ["pattern", "behavior", "routine", "anomaly", "diagnostic"]):
            # Real behavioral inputs
            today_focus_mins = sum(s.duration_minutes for s in twin.focus_sessions if "Today" in s.timestamp or datetime.now().strftime("%b %d") in s.timestamp)
            today_tasks_done = len([t for t in twin.tasks if t.status == 'completed' and (t.completed_at and 'Today' in t.completed_at)])
            now_hour = datetime.now().hour + (datetime.now().minute / 60.0)

            pattern = ml_service.analyze_behavior_pattern(
                current_hour=now_hour,
                duration=float(today_focus_mins),
                tasks_done=float(today_tasks_done),
                energy=twin.state.energy_level / 10.0,
                focus_score=float(twin.behavior.productivity_score)
            )

            if not pattern["has_sufficient_data"]:
                response_text = (
                    "### 🧠 Behavioral Diagnostics\n\n"
                    "**Insufficient Session Data for Today**\n\n"
                    "You have not completed any focus timer sprints or tasks today. "
                    "Run at least one 25-minute focus session to generate behavioral pattern diagnostics."
                )
            else:
                response_text = (
                    f"### 🧠 Behavioral Diagnostic (Live Data)\n\n"
                    f"- **Today's Logged Focus**: `{today_focus_mins} minutes`\n"
                    f"- **Tasks Completed Today**: `{today_tasks_done}`\n"
                    f"- **Pattern State**: `{pattern['pattern_state']}`\n"
                    f"- **Break Recommendation**: `{pattern['recommended_next_break_min']} min reset recommended`"
                )

        elif any(w in msg_lower for w in ["goals", "milestones", "progress"]):
            response_text = "### 🏆 Active Goal State\n\n"
            for g in twin.goals:
                done_m = len([m for m in g.milestones if m.completed])
                total_m = len(g.milestones)
                response_text += f"- **{g.title}**: `{g.progress}%` ({done_m}/{total_m} milestones, Deadline: `{g.deadline}`)\n"

        else:
            response_text = (
                f"### 🪞 Pratibimb Digital Twin Core (Standby Mode)\n\n"
                f"Hello {twin.profile.name}. I am monitoring your live state as **{twin.profile.title}**.\n\n"
                f"- **Current Focus**: `{twin.state.current_focus}`\n"
                f"- **Cognitive Workload**: `{twin.behavior.cognitive_load}` | **Energy**: `{twin.state.energy_level}%`\n"
                f"- **Active Goals**: **{len(twin.goals)}** strategic targets in flight.\n\n"
                f"⚙️ **LLM Configuration Notice**:\n"
                f"To enable free-form conversation, generative reasoning, and personalized insights, "
                f"set `GEMINI_API_KEY` or `OPENAI_API_KEY` in your backend `.env` file.\n\n"
                f"You can currently ask me to:\n"
                f"- *\"What should I focus on today?\"*\n"
                f"- *\"Create a task to review documentation\"*\n"
                f"- *\"Show my active goals\"*\n"
                f"- *\"Analyze my behavioral patterns\"*"
            )

        suggested_prompts = [
            "What should I focus on today?",
            "Create a task for system review",
            "Analyze my behavioral patterns",
            "Show my active goals"
        ]

        telemetry = {
            "llm_connected": False,
            "mode": "deterministic_standby",
            "semantic_memories_retrieved": len(retrieved_memories),
            "timestamp": datetime.now().strftime("%I:%M:%S %p")
        }

        return ChatResponse(
            response=response_text,
            actions=actions,
            memory_citations=citations,
            suggested_prompts=suggested_prompts,
            telemetry=telemetry,
            updated_twin_summary=f"Cognitive Load: {twin.behavior.cognitive_load} | Energy: {twin.state.energy_level}%"
        )

    def execute_action(self, action: AIAction) -> Dict[str, Any]:
        """
        Executes a user-confirmed structured action and updates the Digital Twin state.
        """
        if action.type == "create_task":
            payload = action.payload
            new_task = Task(
                id=f"task-{uuid.uuid4().hex[:6]}",
                title=payload.get("title", "New Task"),
                priority=payload.get("priority", "medium"),
                category=payload.get("category", "General"),
                estimated_minutes=int(payload.get("estimated_minutes", 30)),
                goal_id=payload.get("goal_id"),
                status="todo"
            )
            created = twin_service.add_task(new_task)
            return {"success": True, "message": f"Task '{created.title}' created and queued.", "item": created.model_dump()}

        elif action.type == "start_focus_session":
            payload = action.payload
            twin = twin_service.get_twin()
            new_session = FocusSession(
                id=f"fs-{uuid.uuid4().hex[:6]}",
                task_id=payload.get("task_id"),
                task_title=payload.get("task_title", "Deep Focus Sprint"),
                duration_minutes=int(payload.get("duration_minutes", 25)),
                energy_before=twin.state.energy_level // 10,
                energy_after=twin.state.energy_level // 10,
                timestamp=datetime.now().strftime("Today, %I:%M %p")
            )
            created = twin_service.record_focus_session(new_session)
            return {"success": True, "message": f"Focus session for '{created.task_title}' started and logged.", "session": created.model_dump()}

        elif action.type == "create_goal":
            payload = action.payload
            new_goal = Goal(
                id=f"goal-{uuid.uuid4().hex[:6]}",
                title=payload.get("title", "New Goal"),
                description=payload.get("description", ""),
                category=payload.get("category", "General"),
                priority=payload.get("priority", "medium"),
                progress=0,
                deadline=payload.get("deadline", "End of Quarter")
            )
            created = twin_service.add_goal(new_goal)
            return {"success": True, "message": f"Goal '{created.title}' created.", "item": created.model_dump()}

        return {"success": False, "message": f"Unsupported action type '{action.type}'"}

ai_orchestrator = AIOrchestrator()
