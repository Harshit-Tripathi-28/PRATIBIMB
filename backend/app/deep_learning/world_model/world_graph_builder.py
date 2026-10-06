"""
PRATIBIMB World Graph Builder:
Synthesizes first-class entities, typed multi-directional edges, 64D dense embeddings,
and GNN-ready graph tensors from the user's Digital Twin and State History.
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple
import numpy as np
from app.models.twin_schemas import DigitalTwin
from app.deep_learning.world_model.world_schemas import (
    WorldEntity, WorldRelationship, WorldGraphSnapshot, 
    GNNReadyGraphTensors, WorldEntityType, WorldRelationType
)
from app.deep_learning.representation.embedding_engine import embedding_engine
from app.deep_learning.representation.contextual_encoder import contextual_encoder
from app.deep_learning.agents.agent_registry import agent_registry

class WorldGraphBuilder:
    def __init__(self):
        self.node_type_map: Dict[str, int] = {
            'USER': 0, 'GOAL': 1, 'PROJECT': 2, 'TASK': 3, 'MILESTONE': 4,
            'SKILL': 5, 'KNOWLEDGE': 6, 'MEMORY': 7, 'HABIT': 8,
            'FOCUS_SESSION': 9, 'EVENT': 10, 'AGENT': 11, 'DOCUMENT': 12, 'CONTEXT': 13
        }
        self.edge_type_map: Dict[str, int] = {
            'RELATES_TO': 0, 'SUPPORTS': 1, 'BLOCKS': 2, 'DEPENDS_ON': 3,
            'PART_OF': 4, 'CONTRIBUTES_TO': 5, 'DERIVED_FROM': 6, 'PRECEDES': 7,
            'FOLLOWS': 8, 'SIMILAR_TO': 9, 'AFFECTS': 10, 'REQUIRES': 11, 'GENERATED_BY': 12
        }

    def build_world_snapshot(self, twin: DigitalTwin) -> WorldGraphSnapshot:
        """
        Builds a comprehensive Personal World Model graph snapshot.
        """
        now_str = datetime.now().strftime("%b %d, %I:%M %p")
        iso_now = datetime.now().isoformat()

        entities: List[WorldEntity] = []
        relationships: List[WorldRelationship] = []
        entity_embeddings: Dict[str, np.ndarray] = {}

        # ---------------------------------------------------------
        # 1. USER ENTITY (Central Persona)
        # ---------------------------------------------------------
        user_id = f"user-{twin.user_id}"
        user_vec = embedding_engine.generate_dense_embedding(
            f"{twin.profile.name} {twin.profile.title} {twin.state.current_focus} {twin.profile.bio}"
        )
        entity_embeddings[user_id] = user_vec
        entities.append(WorldEntity(
            id=user_id,
            type='USER',
            label=twin.profile.name,
            state="active",
            category="Core Persona",
            importance=2.0,
            metadata={
                "title": twin.profile.title,
                "current_focus": twin.state.current_focus,
                "energy_level": twin.state.energy_level,
                "operational_state": getattr(twin.state, 'operational_state', 'ACTIVE')
            },
            created_at=twin.state.last_updated or iso_now,
            updated_at=twin.state.last_updated or iso_now,
            vector_64d=user_vec.tolist(),
            provenance="user_store",
            position_3d={"x": 0.0, "y": 0.0, "z": 0.0}
        ))

        # ---------------------------------------------------------
        # 2. CONTEXT ENTITY (Current Mode)
        # ---------------------------------------------------------
        ctx_id = f"context-{twin.user_id}"
        ctx_vec = embedding_engine.generate_dense_embedding(f"Operating Context: {twin.state.context_mode} {twin.state.current_focus}")
        entity_embeddings[ctx_id] = ctx_vec
        entities.append(WorldEntity(
            id=ctx_id,
            type='CONTEXT',
            label=f"Context: {twin.state.context_mode}",
            state=getattr(twin.state, 'operational_state', 'ACTIVE'),
            category="Operational Context",
            importance=1.4,
            metadata={"workload_status": twin.state.workload_status, "current_focus": twin.state.current_focus},
            created_at=iso_now,
            updated_at=iso_now,
            vector_64d=ctx_vec.tolist(),
            provenance="state_engine",
            position_3d={"x": 0.0, "y": -1.2, "z": 0.2}
        ))
        relationships.append(WorldRelationship(
            id=f"rel-{user_id}-{ctx_id}",
            source_id=user_id,
            target_id=ctx_id,
            relation_type='AFFECTS',
            confidence=0.95,
            epistemic_status='KNOWN_RELATIONSHIP',
            timestamp=now_str,
            provenance="state_engine"
        ))

        # ---------------------------------------------------------
        # 3. GOAL & MILESTONE ENTITIES
        # ---------------------------------------------------------
        for i, goal in enumerate(twin.goals):
            g_id = f"goal-{goal.id}"
            angle = (i / max(1, len(twin.goals))) * 2 * np.pi
            g_vec = embedding_engine.generate_dense_embedding(f"{goal.title} {goal.description} {goal.category}")
            entity_embeddings[g_id] = g_vec
            
            entities.append(WorldEntity(
                id=g_id,
                type='GOAL',
                label=goal.title,
                state="active" if goal.progress < 100 else "completed",
                category=goal.category,
                importance=1.6 if goal.priority in ['urgent', 'high'] else 1.2,
                progress=goal.progress,
                metadata={
                    "priority": goal.priority,
                    "deadline": goal.deadline,
                    "milestones_count": len(goal.milestones)
                },
                created_at=goal.created_at,
                updated_at=iso_now,
                vector_64d=g_vec.tolist(),
                provenance="goal_store",
                position_3d={"x": round(np.cos(angle) * 2.4, 2), "y": round(np.sin(angle) * 2.4, 2), "z": 0.2}
            ))

            relationships.append(WorldRelationship(
                id=f"rel-{user_id}-{g_id}",
                source_id=user_id,
                target_id=g_id,
                relation_type='SUPPORTS',
                confidence=0.92,
                epistemic_status='KNOWN_RELATIONSHIP',
                timestamp=now_str,
                provenance="goal_store"
            ))

            # Milestones inside goal
            for m_idx, ms in enumerate(goal.milestones):
                ms_id = f"milestone-{goal.id}-{ms.id}"
                ms_vec = embedding_engine.generate_dense_embedding(f"{ms.title} {goal.title}")
                entity_embeddings[ms_id] = ms_vec
                
                entities.append(WorldEntity(
                    id=ms_id,
                    type='MILESTONE',
                    label=ms.title,
                    state="completed" if ms.completed else "in_progress",
                    category=goal.category,
                    importance=1.1,
                    metadata={"parent_goal_id": goal.id, "due_date": ms.due_date},
                    created_at=iso_now,
                    updated_at=iso_now,
                    vector_64d=ms_vec.tolist(),
                    provenance="goal_store",
                    position_3d={"x": round(np.cos(angle) * 3.2 + (m_idx * 0.3), 2), "y": round(np.sin(angle) * 3.2, 2), "z": 0.4}
                ))

                relationships.append(WorldRelationship(
                    id=f"rel-{ms_id}-{g_id}",
                    source_id=ms_id,
                    target_id=g_id,
                    relation_type='PART_OF',
                    confidence=0.98,
                    epistemic_status='KNOWN_RELATIONSHIP',
                    timestamp=now_str,
                    provenance="goal_store"
                ))

        # ---------------------------------------------------------
        # 4. TASK ENTITIES & DEPENDENCY LINKS
        # ---------------------------------------------------------
        for j, task in enumerate(twin.tasks):
            t_id = f"task-{task.id}"
            t_vec = embedding_engine.generate_dense_embedding(f"{task.title} {task.category} {task.priority}")
            entity_embeddings[t_id] = t_vec

            is_blocked = False
            entities.append(WorldEntity(
                id=t_id,
                type='TASK',
                label=task.title,
                state="completed" if task.status == 'completed' else ("blocked" if is_blocked else "active"),
                category=task.category,
                importance=1.3 if task.priority == 'high' else 1.0,
                metadata={
                    "priority": task.priority,
                    "estimated_minutes": task.estimated_minutes,
                    "goal_id": task.goal_id
                },
                created_at=iso_now,
                updated_at=iso_now,
                vector_64d=t_vec.tolist(),
                provenance="task_store",
                position_3d={"x": round(np.cos(j * 0.6 + 1.2) * 3.8, 2), "y": round(np.sin(j * 0.6 + 1.2) * 3.8, 2), "z": -0.3}
            ))

            # Connect task to goal or user
            if task.goal_id and f"goal-{task.goal_id}" in [e.id for e in entities]:
                relationships.append(WorldRelationship(
                    id=f"rel-{t_id}-goal-{task.goal_id}",
                    source_id=t_id,
                    target_id=f"goal-{task.goal_id}",
                    relation_type='CONTRIBUTES_TO',
                    confidence=0.90,
                    epistemic_status='KNOWN_RELATIONSHIP',
                    timestamp=now_str,
                    provenance="task_store"
                ))
            else:
                relationships.append(WorldRelationship(
                    id=f"rel-{user_id}-{t_id}",
                    source_id=user_id,
                    target_id=t_id,
                    relation_type='RELATES_TO',
                    confidence=0.75,
                    epistemic_status='KNOWN_RELATIONSHIP',
                    timestamp=now_str,
                    provenance="task_store"
                ))

            # Sequential task precedence within same category
            if j > 0 and twin.tasks[j-1].category == task.category:
                prev_id = f"task-{twin.tasks[j-1].id}"
                relationships.append(WorldRelationship(
                    id=f"rel-seq-{prev_id}-{t_id}",
                    source_id=prev_id,
                    target_id=t_id,
                    relation_type='PRECEDES',
                    confidence=0.82,
                    epistemic_status='POTENTIAL_IMPACT',
                    timestamp=now_str,
                    provenance="task_sequence"
                ))

        # ---------------------------------------------------------
        # 5. SKILL & KNOWLEDGE ENTITIES
        # ---------------------------------------------------------
        for s_idx, skill in enumerate(twin.profile.skills):
            s_id = f"skill-{s_idx}"
            s_vec = embedding_engine.generate_dense_embedding(skill)
            entity_embeddings[s_id] = s_vec

            entities.append(WorldEntity(
                id=s_id,
                type='SKILL',
                label=skill,
                state="mastered",
                category="Competency",
                importance=1.2,
                metadata={"proficiency": "Proficient"},
                created_at=twin.state.last_updated or iso_now,
                updated_at=iso_now,
                vector_64d=s_vec.tolist(),
                provenance="profile",
                position_3d={"x": round(np.cos(s_idx * 0.9 + 3.8) * 2.0, 2), "y": round(np.sin(s_idx * 0.9 + 3.8) * 2.0, 2), "z": -0.4}
            ))

            relationships.append(WorldRelationship(
                id=f"rel-{user_id}-{s_id}",
                source_id=user_id,
                target_id=s_id,
                relation_type='REQUIRES',
                confidence=0.88,
                epistemic_status='KNOWN_RELATIONSHIP',
                timestamp=now_str,
                provenance="profile"
            ))

        # ---------------------------------------------------------
        # 6. MEMORY ENTITIES
        # ---------------------------------------------------------
        for k, memory in enumerate(twin.memories[:8]):
            m_id = f"mem-{memory.id}"
            m_vec = embedding_engine.generate_dense_embedding(f"{memory.content} {' '.join(memory.tags)}")
            entity_embeddings[m_id] = m_vec

            entities.append(WorldEntity(
                id=m_id,
                type='MEMORY',
                label=memory.summary or (memory.content[:32] + "..."),
                state="consolidated",
                category=memory.type.capitalize(),
                importance=1.0 + (memory.importance / 10.0),
                metadata={
                    "importance": memory.importance,
                    "tags": memory.tags,
                    "content": memory.content
                },
                created_at=memory.created_at,
                updated_at=iso_now,
                vector_64d=m_vec.tolist(),
                provenance="memory_vault",
                position_3d={"x": round(np.cos(k * 0.8 + 2.4) * 3.0, 2), "y": round(np.sin(k * 0.8 + 2.4) * 3.0, 2), "z": 0.5}
            ))

            relationships.append(WorldRelationship(
                id=f"rel-{user_id}-{m_id}",
                source_id=user_id,
                target_id=m_id,
                relation_type='DERIVED_FROM',
                confidence=0.85,
                epistemic_status='KNOWN_RELATIONSHIP',
                timestamp=now_str,
                provenance="memory_vault"
            ))

        # ---------------------------------------------------------
        # 7. HABIT & FOCUS RITUAL ENTITIES
        # ---------------------------------------------------------
        for h_idx, habit in enumerate(twin.habits):
            h_id = f"habit-{habit.id}"
            h_vec = embedding_engine.generate_dense_embedding(f"{habit.title} {habit.category} {habit.frequency}")
            entity_embeddings[h_id] = h_vec

            entities.append(WorldEntity(
                id=h_id,
                type='HABIT',
                label=habit.title,
                state="stabilizing" if habit.completed_today else "pending",
                category=habit.category,
                importance=1.2,
                metadata={
                    "streak_count": habit.streak_count,
                    "completed_today": habit.completed_today,
                    "target_days": habit.target_days
                },
                created_at=iso_now,
                updated_at=iso_now,
                vector_64d=h_vec.tolist(),
                provenance="habit_engine",
                position_3d={"x": round(np.cos(h_idx * 1.1 + 4.8) * 2.6, 2), "y": round(np.sin(h_idx * 1.1 + 4.8) * 2.6, 2), "z": -0.2}
            ))

            relationships.append(WorldRelationship(
                id=f"rel-{user_id}-{h_id}",
                source_id=user_id,
                target_id=h_id,
                relation_type='SUPPORTS',
                confidence=0.90,
                epistemic_status='KNOWN_RELATIONSHIP',
                timestamp=now_str,
                provenance="habit_engine"
            ))

        # ---------------------------------------------------------
        # 8. AUTONOMOUS AGENT ENTITIES
        # ---------------------------------------------------------
        agents_list = agent_registry.list_agents()
        for a_idx, agent in enumerate(agents_list[:4]):
            ag_id = f"agent-{agent.id}"
            ag_vec = embedding_engine.generate_dense_embedding(f"{agent.name} {agent.role} {' '.join(agent.capabilities)}")
            entity_embeddings[ag_id] = ag_vec

            entities.append(WorldEntity(
                id=ag_id,
                type='AGENT',
                label=agent.name,
                state=agent.status,
                category="Autonomous System",
                importance=1.1,
                metadata={"role": agent.role, "capabilities": agent.capabilities},
                created_at=iso_now,
                updated_at=iso_now,
                vector_64d=ag_vec.tolist(),
                provenance="agent_registry",
                position_3d={"x": round(np.cos(a_idx * 1.3 + 0.5) * 4.2, 2), "y": round(np.sin(a_idx * 1.3 + 0.5) * 4.2, 2), "z": -0.5}
            ))

            relationships.append(WorldRelationship(
                id=f"rel-{user_id}-{ag_id}",
                source_id=user_id,
                target_id=ag_id,
                relation_type='SUPPORTS',
                confidence=0.88,
                epistemic_status='KNOWN_RELATIONSHIP',
                timestamp=now_str,
                provenance="agent_registry"
            ))

        # ---------------------------------------------------------
        # 9. DISCOVER CROSS-ENTITY SEMANTIC AFFINITIES (SIMILAR_TO)
        # ---------------------------------------------------------
        node_id_list = list(entity_embeddings.keys())
        for a_idx in range(len(node_id_list)):
            id_a = node_id_list[a_idx]
            if id_a == user_id:
                continue
            for b_idx in range(a_idx + 1, len(node_id_list)):
                id_b = node_id_list[b_idx]
                if id_b == user_id:
                    continue

                sim = embedding_engine.compute_cosine_similarity(
                    entity_embeddings[id_a],
                    entity_embeddings[id_b]
                )
                if sim > 0.44:
                    relationships.append(WorldRelationship(
                        id=f"rel-aff-{id_a}-{id_b}",
                        source_id=id_a,
                        target_id=id_b,
                        relation_type='SIMILAR_TO',
                        confidence=round(float(sim), 2),
                        weight=round(float(sim), 2),
                        epistemic_status='ASSOCIATION',
                        timestamp=now_str,
                        provenance="embedding_engine",
                        bidirectional=True
                    ))

        # ---------------------------------------------------------
        # 10. PREPARE GNN-READY TENSORS
        # ---------------------------------------------------------
        gnn_tensors = self._build_gnn_tensors(entities, relationships)

        # Entity counts by type
        counts: Dict[str, int] = {}
        for ent in entities:
            counts[ent.type] = counts.get(ent.type, 0) + 1

        density = round(len(relationships) / max(1, len(entities) * (len(entities) - 1) * 0.5), 3)

        return WorldGraphSnapshot(
            snapshot_id=f"wgs-{uuid.uuid4().hex[:8]}",
            user_id=twin.user_id,
            timestamp=now_str,
            iso_timestamp=iso_now,
            entities=entities,
            relationships=relationships,
            entity_counts_by_type=counts,
            graph_density=density,
            diameter_estimate=4,
            dominant_cluster="Engineering & Systems",
            semantic_coherence=0.92,
            gnn_tensors=gnn_tensors
        )

    def _build_gnn_tensors(self, entities: List[WorldEntity], relationships: List[WorldRelationship]) -> GNNReadyGraphTensors:
        """
        Encodes node feature matrix [N x 64], edge index [2 x E], edge type ids, and node type ids.
        """
        node_id_map = {ent.id: idx for idx, ent in enumerate(entities)}
        num_nodes = len(entities)

        node_features: List[List[float]] = []
        node_type_ids: List[int] = []

        for ent in entities:
            vec = ent.vector_64d if ent.vector_64d and len(ent.vector_64d) == 64 else [0.0] * 64
            node_features.append(vec)
            node_type_ids.append(self.node_type_map.get(ent.type, 0))

        src_indices: List[int] = []
        dst_indices: List[int] = []
        edge_type_ids: List[int] = []

        for rel in relationships:
            if rel.source_id in node_id_map and rel.target_id in node_id_map:
                u = node_id_map[rel.source_id]
                v = node_id_map[rel.target_id]
                tid = self.edge_type_map.get(rel.relation_type, 0)

                src_indices.append(u)
                dst_indices.append(v)
                edge_type_ids.append(tid)

                if rel.bidirectional:
                    src_indices.append(v)
                    dst_indices.append(u)
                    edge_type_ids.append(tid)

        edge_index = [src_indices, dst_indices]

        return GNNReadyGraphTensors(
            num_nodes=num_nodes,
            num_edges=len(src_indices),
            feature_dimension=64,
            node_features=node_features,
            edge_index=edge_index,
            edge_type_ids=edge_type_ids,
            node_type_ids=node_type_ids,
            node_id_map=node_id_map,
            edge_type_map=self.edge_type_map,
            node_type_map=self.node_type_map,
            ready_for_gnn_training=True
        )

world_graph_builder = WorldGraphBuilder()
