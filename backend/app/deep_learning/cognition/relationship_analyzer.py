"""
Relationship Analyzer:
Maps cross-domain co-occurrences and links active state shifts to Life Graph entities
(Goals, Tasks, Memories, Habits, Skills).
"""

from typing import List, Dict, Any
from app.models.twin_schemas import DigitalTwin
from app.deep_learning.cognition.cognition_schemas import RelatedEntityRef

class RelationshipAnalyzer:
    def identify_related_entities(self, twin: DigitalTwin, domain: str) -> List[RelatedEntityRef]:
        entities: List[RelatedEntityRef] = []

        # 1. Match Active Goals
        for goal in twin.goals[:3]:
            entities.append(RelatedEntityRef(
                entity_id=f"goal-{goal.id}",
                entity_type="goal",
                label=goal.title,
                relationship_type="supports" if goal.progress >= 50 else "associated_with",
                weight=0.92 if goal.priority in ['urgent', 'high'] else 0.75
            ))

        # 2. Match Related Tasks
        pending_tasks = [t for t in twin.tasks if t.status != 'completed'][:3]
        for task in pending_tasks:
            entities.append(RelatedEntityRef(
                entity_id=f"task-{task.id}",
                entity_type="task",
                label=task.title,
                relationship_type="associated_with",
                weight=0.85
            ))

        # 3. Match Memories
        if twin.memories:
            latest_mem = twin.memories[0]
            entities.append(RelatedEntityRef(
                entity_id=f"mem-{latest_mem.id}",
                entity_type="memory",
                label=latest_mem.summary or latest_mem.content[:30],
                relationship_type="derived_from",
                weight=0.80
            ))

        # 4. Match Core Skill
        if twin.profile.skills:
            primary_skill = twin.profile.skills[0]
            entities.append(RelatedEntityRef(
                entity_id=f"skill-0",
                entity_type="skill",
                label=primary_skill,
                relationship_type="supports",
                weight=0.88
            ))

        return entities

relationship_analyzer = RelationshipAnalyzer()
