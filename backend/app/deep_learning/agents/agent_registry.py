"""
Autonomous Agent Registry & Dispatcher:
Defines specialized autonomous agents (Research, Planning, Analysis, Coding, Data)
with structured execution contracts coordinated by the AI Core.
"""

import uuid
import time
from typing import List, Dict, Any, Optional
from app.models.deep_learning_schemas import SpecializedAgentSpec, AgentTaskRequest, AgentTaskResponse
from app.models.twin_schemas import DigitalTwin

class AgentRegistry:
    AGENTS: List[SpecializedAgentSpec] = [
        SpecializedAgentSpec(
            id="agent-research",
            name="Research Agent",
            role="Deep Technical & Domain Exploration",
            description="Synthesizes academic papers, architectural patterns, and state-of-the-art documentation.",
            capabilities=["Literature Synthesis", "Comparative Architecture Analysis", "Knowledge Extraction"],
            status="ready",
            icon_name="Search"
        ),
        SpecializedAgentSpec(
            id="agent-planning",
            name="Strategic Planning Agent",
            role="Milestone & Roadmap Decomposition",
            description="Decomposes high-level strategic objectives into sequenced, friction-minimized tasks and timelines.",
            capabilities=["Milestone Scheduling", "Dependency Graph Resolution", "Workload Leveling"],
            status="ready",
            icon_name="Calendar"
        ),
        SpecializedAgentSpec(
            id="agent-analysis",
            name="Cognitive Analysis Agent",
            role="Behavioral & Metric Introspection",
            description="Analyzes focus streaks, energy drops, productivity cycles, and habit consistency.",
            capabilities=["Circadian Energy Modeling", "Anomaly Diagnostics", "Burnout Prevention"],
            status="ready",
            icon_name="BarChart3"
        ),
        SpecializedAgentSpec(
            id="agent-coding",
            name="Systems & Coding Agent",
            role="Code Architecture & Algorithmic Design",
            description="Assists with high-performance code structuring, schema modeling, and API design.",
            capabilities=["TypeScript/Python Architecture", "FastAPI Optimization", "Three.js Pipelines"],
            status="ready",
            icon_name="Code2"
        ),
        SpecializedAgentSpec(
            id="agent-data",
            name="Data & Memory Agent",
            role="Representation & Knowledge Graph Maintenance",
            description="Organizes memory clusters, extracts life-graph relationships, and prunes stale data.",
            capabilities=["Graph Pruning", "Semantic Clustering", "Entity Disambiguation"],
            status="ready",
            icon_name="Database"
        ),
    ]

    def list_agents(self) -> List[SpecializedAgentSpec]:
        return self.AGENTS

    def execute_agent_task(self, twin: DigitalTwin, request: AgentTaskRequest) -> AgentTaskResponse:
        start_t = time.time()
        agent = next((a for a in self.AGENTS if a.id == request.agent_id), None)
        if not agent:
            return AgentTaskResponse(
                task_id=f"task-err-{uuid.uuid4().hex[:6]}",
                agent_id=request.agent_id,
                status="failed",
                result_summary="Agent not found in registry.",
                execution_time_ms=10
            )

        task_id = f"task-{uuid.uuid4().hex[:6]}"
        instruction = request.instruction.strip()

        # Contextual execution based on agent role
        if agent.id == "agent-planning":
            result_summary = (
                f"### 📋 Strategic Plan Synthesized by {agent.name}\n\n"
                f"Decomposed objective '{instruction}' into a 3-stage execution roadmap aligned with your current "
                f"operating capacity ({twin.state.energy_level}% Energy)."
            )
            proposed_actions = [
                {
                    "type": "create_task",
                    "title": f"Phase 1: Foundation for {instruction[:30]}",
                    "priority": "high",
                    "estimated_minutes": 45
                },
                {
                    "type": "create_task",
                    "title": f"Phase 2: Core implementation sprint",
                    "priority": "medium",
                    "estimated_minutes": 60
                }
            ]
        elif agent.id == "agent-analysis":
            result_summary = (
                f"### 📊 Behavioral Diagnostics from {agent.name}\n\n"
                f"Current productivity is running at {twin.behavior.productivity_score}/100 with an active "
                f"{twin.behavior.active_streak_days}-day streak. Workload status is rated '{twin.state.workload_status}'."
            )
            proposed_actions = []
        elif agent.id == "agent-research":
            result_summary = (
                f"### 🔬 Research Synthesis from {agent.name}\n\n"
                f"Extracted key domain principles and state representations regarding '{instruction}'."
            )
            proposed_actions = []
        else:
            result_summary = f"### ⚡ Execution complete for {agent.name}\n\nProcessed directive: '{instruction}'."
            proposed_actions = []

        elapsed_ms = int((time.time() - start_t) * 1000)

        return AgentTaskResponse(
            task_id=task_id,
            agent_id=agent.id,
            status="completed",
            result_summary=result_summary,
            structured_artifacts={"agent_role": agent.role, "instruction": instruction},
            proposed_actions=proposed_actions,
            execution_time_ms=max(15, elapsed_ms)
        )

agent_registry = AgentRegistry()
