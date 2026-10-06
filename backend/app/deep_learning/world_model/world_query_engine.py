"""
PRATIBIMB World Query Engine:
Executes multi-hop graph traversals, dependency analysis,
and contextual entity retrieval across the Personal World Model.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional, Set
from app.models.twin_schemas import DigitalTwin
from app.deep_learning.world_model.world_schemas import (
    WorldGraphSnapshot, WorldEntity, WorldRelationship, 
    WorldQueryRequest, WorldQueryResult
)
from app.deep_learning.representation.embedding_engine import embedding_engine

class WorldQueryEngine:
    def execute_query(
        self, 
        snapshot: WorldGraphSnapshot, 
        request: WorldQueryRequest,
        twin: Optional[DigitalTwin] = None
    ) -> WorldQueryResult:
        """
        Executes structured multi-hop traversal over the world model graph.
        """
        now_str = datetime.now().strftime("%b %d, %I:%M %p")
        entity_map = {e.id: e for e in snapshot.entities}
        
        target_entity = entity_map.get(request.target_entity_id) if request.target_entity_id else None

        # Build adjacency maps
        outgoing: Dict[str, List[WorldRelationship]] = {}
        incoming: Dict[str, List[WorldRelationship]] = {}

        for rel in snapshot.relationships:
            outgoing.setdefault(rel.source_id, []).append(rel)
            incoming.setdefault(rel.target_id, []).append(rel)
            if rel.bidirectional:
                outgoing.setdefault(rel.target_id, []).append(rel)
                incoming.setdefault(rel.source_id, []).append(rel)

        connected_entity_ids: Set[str] = set()
        connecting_rels: List[WorldRelationship] = []
        upstream_entities: List[WorldEntity] = []
        downstream_entities: List[WorldEntity] = []
        blocking_entities: List[WorldEntity] = []
        related_memories: List[Dict[str, Any]] = []
        recent_events: List[Dict[str, Any]] = []
        cognitive_insights: List[Dict[str, Any]] = []

        if target_entity:
            # 1. Multi-hop BFS traversal from target_entity
            visited = {target_entity.id}
            queue = [(target_entity.id, 0)]

            while queue:
                curr_id, depth = queue.pop(0)
                if depth >= request.max_depth:
                    continue

                # Inspect outgoing edges (Target -> Dependents)
                for rel in outgoing.get(curr_id, []):
                    other_id = rel.target_id if rel.source_id == curr_id else rel.source_id
                    if other_id not in visited:
                        visited.add(other_id)
                        connected_entity_ids.add(other_id)
                        connecting_rels.append(rel)
                        queue.append((other_id, depth + 1))
                        
                        other_ent = entity_map.get(other_id)
                        if other_ent:
                            downstream_entities.append(other_ent)
                            if rel.relation_type in ['BLOCKS', 'DEPENDS_ON']:
                                blocking_entities.append(other_ent)

                # Inspect incoming edges (Upstream Dependencies -> Target)
                for rel in incoming.get(curr_id, []):
                    other_id = rel.source_id if rel.target_id == curr_id else rel.target_id
                    if other_id not in visited:
                        visited.add(other_id)
                        connected_entity_ids.add(other_id)
                        connecting_rels.append(rel)
                        queue.append((other_id, depth + 1))

                        other_ent = entity_map.get(other_id)
                        if other_ent:
                            upstream_entities.append(other_ent)
                            if rel.relation_type in ['BLOCKS', 'DEPENDS_ON'] and other_ent.state != 'completed':
                                blocking_entities.append(other_ent)

            # 2. Extract Connected Memories
            for e_id in connected_entity_ids.union({target_entity.id}):
                ent = entity_map.get(e_id)
                if ent and ent.type == 'MEMORY':
                    related_memories.append({
                        "memory_id": ent.id,
                        "summary": ent.label,
                        "category": ent.category,
                        "importance": ent.metadata.get("importance", 5),
                        "content": ent.metadata.get("content", "")
                    })

        else:
            # Global query across snapshot (e.g. blocking tasks or active goals)
            if request.query_type == 'blocking_tasks':
                for rel in snapshot.relationships:
                    if rel.relation_type in ['BLOCKS', 'PRECEDES']:
                        src_ent = entity_map.get(rel.source_id)
                        if src_ent and src_ent.state != 'completed':
                            blocking_entities.append(src_ent)
                            connecting_rels.append(rel)
            elif request.query_type == 'skills_developed':
                for ent in snapshot.entities:
                    if ent.type == 'SKILL':
                        connected_entity_ids.add(ent.id)

        connected_entities = [entity_map[eid] for eid in connected_entity_ids if eid in entity_map]

        # 3. Formulate Structured Synthesis
        synthesis = self._synthesize_explanation(
            target_entity, 
            request.query_type, 
            connected_entities, 
            upstream_entities, 
            downstream_entities, 
            blocking_entities,
            related_memories
        )

        return WorldQueryResult(
            query_type=request.query_type,
            target_entity=target_entity,
            connected_entities=connected_entities,
            connecting_relationships=connecting_rels,
            upstream_dependencies=upstream_entities,
            downstream_dependents=downstream_entities,
            blocking_entities=blocking_entities,
            related_memories=related_memories,
            recent_events=recent_events,
            cognitive_insights=cognitive_insights,
            structured_synthesis=synthesis,
            timestamp=now_str
        )

    def _synthesize_explanation(
        self,
        target: Optional[WorldEntity],
        query_type: str,
        connected: List[WorldEntity],
        upstream: List[WorldEntity],
        downstream: List[WorldEntity],
        blocking: List[WorldEntity],
        memories: List[Dict[str, Any]]
    ) -> str:
        """
        Constructs grounded natural language synthesis with explicit epistemic distinctions.
        """
        if not target:
            if blocking:
                return f"Identified {len(blocking)} active entities with blocking or precedence relationships: {', '.join([b.label for b in blocking[:3]])}."
            return f"Global world model query '{query_type}' analyzed {len(connected)} relevant entities."

        lines = [f"World Model Analysis for [{target.type}] '{target.label}':"]

        # Status & Progress
        if target.progress is not None:
            lines.append(f"• Current State: {target.state.upper()} ({target.progress}% completion).")
        else:
            lines.append(f"• Current State: {target.state.upper()}.")

        # Upstream & Downstream Dependencies
        if upstream:
            lines.append(f"• Upstream Dependencies ({len(upstream)}): Connected to {', '.join([u.label for u in upstream[:3]])}.")
        if downstream:
            lines.append(f"• Downstream Dependents ({len(downstream)}): Directly supports/impacts {', '.join([d.label for d in downstream[:3]])}.")

        # Blocking items
        if blocking:
            lines.append(f"• Active Blockers / Precedence Constraints: {len(blocking)} pending items require resolution ({', '.join([b.label for b in blocking[:2]])}).")
        else:
            lines.append("• No critical dependency blocks detected in the current graph traversal.")

        # Related Memories
        if memories:
            lines.append(f"• Associated Second Brain Memories ({len(memories)}): Grounded in past reflections ({memories[0]['summary']}).")

        return "\n".join(lines)

world_query_engine = WorldQueryEngine()
