"""
Text Perception Engine: extracts semantic tokens, sentiment/urgency embeddings,
and intent representations from natural language inputs.
"""

import re
import hashlib
from datetime import datetime
from typing import List, Dict, Any
import numpy as np
from app.models.deep_learning_schemas import MultimodalPerceptionInput, PerceptionFeatureVector
from app.deep_learning.perception.base_perception import BasePerceptionExtractor

class TextPerceptionEngine(BasePerceptionExtractor):
    def __init__(self, feature_dim: int = 64):
        self.feature_dim = feature_dim
        self.intent_keywords = {
            "goal_setting": ["goal", "aim", "target", "milestone", "achieve", "objective", "roadmap"],
            "task_execution": ["task", "todo", "finish", "complete", "deadline", "implement", "build", "code"],
            "reflection": ["feel", "think", "remember", "learned", "insight", "retrospective", "reflect"],
            "knowledge_query": ["how", "what", "why", "explain", "architecture", "concept", "algorithm"],
            "habit_tracking": ["habit", "routine", "daily", "streak", "ritual", "focus", "meditate"],
            "simulation": ["if I", "what if", "simulate", "forecast", "future", "scenario", "predict"]
        }

    def extract_features(self, perception_input: MultimodalPerceptionInput) -> PerceptionFeatureVector:
        text = perception_input.text_content or ""
        tokens = re.findall(r'\b[a-zA-Z0-9_\-]{2,}\b', text.lower())
        
        # Dense feature generation using deterministic semantic hashing + frequency projection
        feature_vec = np.zeros(self.feature_dim, dtype=np.float32)
        
        for token in tokens:
            # Deterministic hash projection
            h = int(hashlib.md5(token.encode('utf-8')).hexdigest(), 16)
            idx = h % self.feature_dim
            sign = 1.0 if ((h >> 8) % 2 == 0) else -1.0
            feature_vec[idx] += sign * (1.0 + (len(token) / 10.0))

        # Intent distribution projection
        extracted_entities = []
        for intent, kws in self.intent_keywords.items():
            matches = [kw for kw in kws if kw in text.lower()]
            if matches:
                confidence = min(1.0, len(matches) * 0.35 + 0.3)
                extracted_entities.append({
                    "entity_type": "intent",
                    "intent": intent,
                    "matched_tokens": matches,
                    "confidence": confidence
                })

        # L2 normalize feature vector
        norm = np.linalg.norm(feature_vec)
        if norm > 0:
            feature_vec = feature_vec / norm

        return PerceptionFeatureVector(
            modality="text",
            feature_dimension=self.feature_dim,
            dense_features=feature_vec.tolist(),
            semantic_tokens=tokens[:20],
            confidence=0.92 if len(tokens) > 3 else 0.65,
            extracted_entities=extracted_entities,
            timestamp=datetime.now().isoformat()
        )
