"""
Intelligent Personal Memory Engine:
Extends memory representation with hierarchical categories (Episodic, Semantic, Procedural,
Contextual, Preference, Project, Relationship) and embedding indexing.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from app.models.twin_schemas import MemoryItem
from app.models.deep_learning_schemas import EnhancedMemoryCategory
from app.deep_learning.representation.embedding_engine import embedding_engine

class IntelligentMemoryEngine:
    MEMORY_CATEGORIES: List[EnhancedMemoryCategory] = [
        EnhancedMemoryCategory(category="episodic", description="Chronological autobiographical events and personal moments."),
        EnhancedMemoryCategory(category="semantic", description="Generalized knowledge, learned concepts, and factual notes."),
        EnhancedMemoryCategory(category="procedural", description="Workflows, problem-solving techniques, and repeatable rituals."),
        EnhancedMemoryCategory(category="contextual", description="Situational environmental factors and working conditions."),
        EnhancedMemoryCategory(category="preference", description="Expressed personal tastes, communication styles, and tool choices."),
        EnhancedMemoryCategory(category="project", description="Architectural milestones, technical decisions, and project history."),
        EnhancedMemoryCategory(category="relationship", description="Interpersonal context, team dynamics, and collaboration patterns.")
    ]

    def extract_memory_importance(self, content: str, user_tags: List[str]) -> int:
        """
        Calculates memory importance score (1 to 10) based on content depth,
        emotional/urgency tokens, and strategic tags.
        """
        score = 5
        content_lower = content.lower()

        high_salience_terms = ["decision", "milestone", "lesson", "critical", "breakthrough", "architecture", "resolved", "always", "never"]
        for term in high_salience_terms:
            if term in content_lower:
                score += 1

        if len(content.split()) > 30:
            score += 1
        if len(user_tags) >= 2:
            score += 1

        return min(10, max(1, score))

    def categorize_memory(self, content: str) -> str:
        """Categorizes raw input into one of the 7 taxonomy categories."""
        c_low = content.lower()
        if any(w in c_low for w in ["prefer", "like", "dislike", "favorite", "style", "format"]):
            return "preference"
        if any(w in c_low for w in ["how to", "step", "workflow", "script", "command", "process"]):
            return "procedural"
        if any(w in c_low for w in ["project", "architecture", "repo", "commit", "deployment", "system"]):
            return "project"
        if any(w in c_low for w in ["team", "colleague", "meeting", "manager", "alice", "bob", "discussion"]):
            return "relationship"
        if any(w in c_low for w in ["today", "yesterday", "happened", "went", "felt", "session"]):
            return "episodic"
        return "semantic"

intelligent_memory_engine = IntelligentMemoryEngine()
