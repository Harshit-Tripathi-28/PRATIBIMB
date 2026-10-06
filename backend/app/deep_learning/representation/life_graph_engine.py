"""
Personal Life Graph Engine:
Constructs an interactive topological graph of the user's digital identity:
User Identity, Goals, Tasks, Memories, Habits, Skills, Knowledge, and Context.
Dynamically derives semantic affinities and edge weights using embedding distance.
"""

from typing import List, Dict, Any
import numpy as np
from app.models.twin_schemas import DigitalTwin
from app.models.deep_learning_schemas import LifeGraphData, LifeGraphNode, LifeGraphEdge
from app.deep_learning.representation.embedding_engine import embedding_engine

class LifeGraphEngine:
    def build_life_graph(self, twin: DigitalTwin) -> LifeGraphData:
        nodes: List[LifeGraphNode] = []
        edges: List[LifeGraphEdge] = []

        # 1. Central User / Digital Twin Node
        user_node_id = f"user-{twin.user_id}"
        nodes.append(LifeGraphNode(
            id=user_node_id,
            label=twin.profile.name,
            type="identity",
            category="Core",
            importance=2.0,
            status="Active",
            metadata={"title": twin.profile.title, "focus": twin.state.current_focus},
            position={"x": 0.0, "y": 0.0, "z": 0.0}
        ))

        # Node embeddings map to compute semantic relationship edges
        node_embeddings: Dict[str, np.ndarray] = {
            user_node_id: embedding_engine.generate_dense_embedding(f"{twin.profile.name} {twin.profile.title} {twin.state.current_focus}")
        }

        # 2. Strategic Goals Nodes
        for i, goal in enumerate(twin.goals):
            g_id = f"goal-{goal.id}"
            angle = (i / max(1, len(twin.goals))) * 2 * np.pi
            nodes.append(LifeGraphNode(
                id=g_id,
                label=goal.title,
                type="goal",
                category=goal.category,
                importance=1.5 if goal.priority in ['urgent', 'high'] else 1.2,
                status=goal.priority,
                progress=goal.progress,
                metadata={"deadline": goal.deadline, "category": goal.category},
                position={"x": round(np.cos(angle) * 2.2, 2), "y": round(np.sin(angle) * 2.2, 2), "z": 0.2}
            ))
            node_embeddings[g_id] = embedding_engine.generate_dense_embedding(f"{goal.title} {goal.description} {goal.category}")

            # Connect goal to user
            edges.append(LifeGraphEdge(
                id=f"edge-{user_node_id}-{g_id}",
                source=user_node_id,
                target=g_id,
                relation_type="strategic_goal",
                weight=0.9
            ))

        # 3. Tasks Nodes (Pending priorities)
        for j, task in enumerate(twin.tasks[:8]):
            t_id = f"task-{task.id}"
            nodes.append(LifeGraphNode(
                id=t_id,
                label=task.title,
                type="task",
                category=task.category,
                importance=1.1,
                status=task.status,
                metadata={"priority": task.priority, "est_min": task.estimated_minutes},
                position={"x": round(np.cos(j * 0.8 + 0.3) * 3.4, 2), "y": round(np.sin(j * 0.8 + 0.3) * 3.4, 2), "z": -0.2}
            ))
            node_embeddings[t_id] = embedding_engine.generate_dense_embedding(f"{task.title} {task.category} {task.priority}")

            # Link task to goal or user
            if task.goal_id and f"goal-{task.goal_id}" in [n.id for n in nodes]:
                edges.append(LifeGraphEdge(
                    id=f"edge-goal-{task.goal_id}-{t_id}",
                    source=f"goal-{task.goal_id}",
                    target=t_id,
                    relation_type="actionable_milestone",
                    weight=0.85
                ))
            else:
                edges.append(LifeGraphEdge(
                    id=f"edge-{user_node_id}-{t_id}",
                    source=user_node_id,
                    target=t_id,
                    relation_type="direct_task",
                    weight=0.7
                ))

        # 4. Memories Nodes (Key episodic & semantic reflections)
        for k, memory in enumerate(twin.memories[:6]):
            m_id = f"mem-{memory.id}"
            nodes.append(LifeGraphNode(
                id=m_id,
                label=memory.summary or (memory.content[:36] + "..."),
                type="memory",
                category=memory.type.capitalize(),
                importance=1.0 + (memory.importance / 10.0),
                status=f"Importance {memory.importance}/10",
                metadata={"tags": memory.tags, "full_content": memory.content},
                position={"x": round(np.cos(k * 1.1 + 2.0) * 2.8, 2), "y": round(np.sin(k * 1.1 + 2.0) * 2.8, 2), "z": 0.4}
            ))
            node_embeddings[m_id] = embedding_engine.generate_dense_embedding(f"{memory.content} {' '.join(memory.tags)}")

            # Connect memory to user
            edges.append(LifeGraphEdge(
                id=f"edge-{user_node_id}-{m_id}",
                source=user_node_id,
                target=m_id,
                relation_type="indexed_reflection",
                weight=0.75
            ))

        # 5. Skills Nodes (from profile)
        for s_idx, skill in enumerate(twin.profile.skills[:6]):
            s_id = f"skill-{s_idx}"
            nodes.append(LifeGraphNode(
                id=s_id,
                label=skill,
                type="skill",
                category="Competency",
                importance=1.2,
                status="Proficient",
                metadata={"skill_name": skill},
                position={"x": round(np.cos(s_idx * 1.05 + 4.0) * 1.8, 2), "y": round(np.sin(s_idx * 1.05 + 4.0) * 1.8, 2), "z": -0.3}
            ))
            node_embeddings[s_id] = embedding_engine.generate_dense_embedding(skill)

            edges.append(LifeGraphEdge(
                id=f"edge-{user_node_id}-{s_id}",
                source=user_node_id,
                target=s_id,
                relation_type="mastered_skill",
                weight=0.8
            ))

        # 6. Discover cross-entity semantic affinity edges
        node_id_list = list(node_embeddings.keys())
        for a_idx in range(len(node_id_list)):
            id_a = node_id_list[a_idx]
            if id_a == user_node_id:
                continue
            for b_idx in range(a_idx + 1, len(node_id_list)):
                id_b = node_id_list[b_idx]
                if id_b == user_node_id:
                    continue
                
                sim = embedding_engine.compute_cosine_similarity(
                    node_embeddings[id_a],
                    node_embeddings[id_b]
                )
                # If high semantic affinity across different node types, connect them
                if sim > 0.42:
                    edges.append(LifeGraphEdge(
                        id=f"edge-semantic-{id_a}-{id_b}",
                        source=id_a,
                        target=id_b,
                        relation_type="semantic_affinity",
                        weight=round(sim, 2),
                        bidirectional=True
                    ))

        cluster_labels = list(set([n.category for n in nodes if n.category]))

        return LifeGraphData(
            nodes=nodes,
            edges=edges,
            cluster_labels=cluster_labels,
            graph_density=round(len(edges) / max(1, len(nodes) * 2), 2),
            total_entities=len(nodes)
        )

life_graph_engine = LifeGraphEngine()
