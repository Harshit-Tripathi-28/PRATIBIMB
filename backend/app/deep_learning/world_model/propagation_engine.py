"""
PRATIBIMB World Model Propagation Engine:
Simulates multi-hop state propagation across the Personal World Model.
Categorizes downstream effects into DIRECT_IMPACT, INDIRECT_IMPACT, and POTENTIAL_IMPACT.
"""

import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional, Set
from app.deep_learning.world_model.world_schemas import (
    WorldGraphSnapshot, WorldEntity, WorldRelationship,
    PropagationScenarioRequest, PropagationScenarioResponse,
    ImpactedEntityRef, EpistemicImpactType
)

class WorldPropagationEngine:
    def simulate_propagation(
        self,
        snapshot: WorldGraphSnapshot,
        request: PropagationScenarioRequest
    ) -> PropagationScenarioResponse:
        """
        Calculates downstream state propagation when an entity undergoes a scenario change.
        """
        now_str = datetime.now().strftime("%b %d, %I:%M %p")
        entity_map = {e.id: e for e in snapshot.entities}
        target = entity_map.get(request.entity_id)

        if not target:
            # Fallback for root target
            target = snapshot.entities[0] if snapshot.entities else WorldEntity(
                id=request.entity_id,
                type='GOAL',
                label="Target Scenario Entity",
                state="active",
                created_at=now_str,
                updated_at=now_str
            )

        direct_impacts: List[ImpactedEntityRef] = []
        indirect_impacts: List[ImpactedEntityRef] = []
        potential_impacts: List[ImpactedEntityRef] = []

        # Build graph edges
        connected_to_target: List[Tuple[WorldRelationship, WorldEntity]] = []
        for rel in snapshot.relationships:
            if rel.source_id == target.id and rel.target_id in entity_map:
                connected_to_target.append((rel, entity_map[rel.target_id]))
            elif rel.target_id == target.id and rel.source_id in entity_map:
                connected_to_target.append((rel, entity_map[rel.source_id]))

        # Level 1: DIRECT IMPACTS (immediate milestones, tasks, and habits)
        visited_ids: Set[str] = {target.id}
        level1_ids: Set[str] = set()

        for rel, other_ent in connected_to_target:
            if other_ent.id in visited_ids:
                continue
            visited_ids.add(other_ent.id)
            level1_ids.add(other_ent.id)

            effect_desc = self._compute_direct_effect(request.scenario_action, target, other_ent, rel)
            direct_impacts.append(ImpactedEntityRef(
                entity_id=other_ent.id,
                entity_type=other_ent.type,
                label=other_ent.label,
                impact_level='DIRECT_IMPACT',
                estimated_effect=effect_desc,
                confidence=round(rel.confidence * 0.95, 2),
                epistemic_status='KNOWN_RELATIONSHIP'
            ))

        # Level 2: INDIRECT IMPACTS (dependents of level 1 entities)
        level2_ids: Set[str] = set()
        for rel in snapshot.relationships:
            if rel.source_id in level1_ids and rel.target_id in entity_map and rel.target_id not in visited_ids:
                other_ent = entity_map[rel.target_id]
                visited_ids.add(other_ent.id)
                level2_ids.add(other_ent.id)

                indirect_impacts.append(ImpactedEntityRef(
                    entity_id=other_ent.id,
                    entity_type=other_ent.type,
                    label=other_ent.label,
                    impact_level='INDIRECT_IMPACT',
                    estimated_effect=f"Secondary milestone progression affected through dependency on '{entity_map[rel.source_id].label}'.",
                    confidence=round(rel.confidence * 0.80, 2),
                    epistemic_status='POTENTIAL_IMPACT'
                ))
            elif rel.target_id in level1_ids and rel.source_id in entity_map and rel.source_id not in visited_ids:
                other_ent = entity_map[rel.source_id]
                visited_ids.add(other_ent.id)
                level2_ids.add(other_ent.id)

                indirect_impacts.append(ImpactedEntityRef(
                    entity_id=other_ent.id,
                    entity_type=other_ent.type,
                    label=other_ent.label,
                    impact_level='INDIRECT_IMPACT',
                    estimated_effect=f"Upstream task sequence and milestone pacing adjusted due to '{entity_map[rel.target_id].label}'.",
                    confidence=round(rel.confidence * 0.78, 2),
                    epistemic_status='POTENTIAL_IMPACT'
                ))

        # Level 3: POTENTIAL CROSS-DOMAIN IMPACTS (Skills, Cognitive Capacity, Habit Streaks)
        for ent in snapshot.entities:
            if ent.id not in visited_ids:
                if ent.type in ['SKILL', 'CONTEXT', 'HABIT']:
                    potential_impacts.append(ImpactedEntityRef(
                        entity_id=ent.id,
                        entity_type=ent.type,
                        label=ent.label,
                        impact_level='POTENTIAL_IMPACT',
                        estimated_effect=f"Long-term competency velocity and ritual rhythm may experience downstream calibration shifts.",
                        confidence=0.65,
                        epistemic_status='UNCERTAIN_IMPACT'
                    ))
                    if len(potential_impacts) >= 3:
                        break

        # Generate Risk Assessment and Actionable Mitigations
        risk_text = self._formulate_risk_assessment(request.scenario_action, target, direct_impacts, indirect_impacts)
        mitigations = self._generate_mitigations(request.scenario_action, target, direct_impacts)

        return PropagationScenarioResponse(
            scenario_id=f"prop-{uuid.uuid4().hex[:8]}",
            target_entity_id=target.id,
            target_entity_label=target.label,
            scenario_action=request.scenario_action,
            direct_impacts=direct_impacts,
            indirect_impacts=indirect_impacts,
            potential_impacts=potential_impacts,
            risk_assessment=risk_text,
            recommended_mitigations=mitigations,
            timestamp=now_str
        )

    def _compute_direct_effect(self, action: str, target: WorldEntity, other: WorldEntity, rel: WorldRelationship) -> str:
        if action == 'pause':
            if other.type in ['TASK', 'MILESTONE']:
                return f"Task execution paused; target completion schedule deferred by scenario duration."
            elif other.type == 'HABIT':
                return f"Focus ritual frequency reduced alongside paused goal progress."
            return f"Direct dependency link '{rel.relation_type}' temporarily placed in hold state."
        elif action == 'accelerate':
            return f"Throughput demand increased by ~40%; milestone velocity accelerates."
        elif action == 'delay':
            return f"Timeline pushed back; downstream delivery milestones dynamically recalibrated."
        return f"Operational state adjusted to {action.upper()}."

    def _formulate_risk_assessment(self, action: str, target: WorldEntity, direct: List[ImpactedEntityRef], indirect: List[ImpactedEntityRef]) -> str:
        count = len(direct) + len(indirect)
        if action == 'pause':
            return f"Moderate Risk: Pausing '{target.label}' directly impacts {len(direct)} immediate entities and causes {len(indirect)} downstream cascade adjustments. Core strategic velocity will be preserved if secondary goals absorb focus."
        elif action == 'accelerate':
            return f"Elevated Workload Risk: Accelerating '{target.label}' requires concentrating focus blocks, increasing cognitive load by an estimated 25%."
        return f"Scenario action '{action.upper()}' affects {count} total entities in the personal world model."

    def _generate_mitigations(self, action: str, target: WorldEntity, direct: List[ImpactedEntityRef]) -> List[str]:
        if action == 'pause':
            return [
                f"Reallocate released weekly hours (approx. 8-12h) to primary parallel strategic goal.",
                f"Notify AI Core to defer reminder cadence on {len(direct)} linked subtasks.",
                f"Record a temporal memory snapshot to preserve architecture context before pause."
            ]
        elif action == 'accelerate':
            return [
                "Schedule 90-minute uninterrupted morning deep work sprints.",
                "Temporarily offload non-critical administrative tasks to autonomous agents."
            ]
        return [
            "Review dependency tree adjustments in the World Model Explorer.",
            "Verify active habit consistency remains stable during transition."
        ]

world_propagation_engine = WorldPropagationEngine()
