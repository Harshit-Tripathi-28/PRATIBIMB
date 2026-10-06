"""
Unified Multimodal Perception Engine:
Fuses text, vision, document, and context into a joint perception state.
"""

from datetime import datetime
from typing import Dict, Any, List
import numpy as np
from app.models.deep_learning_schemas import MultimodalPerceptionInput, PerceptionFeatureVector
from app.deep_learning.perception.text_perception import TextPerceptionEngine
from app.deep_learning.perception.vision_perception import VisionPerceptionEngine

class MultimodalPerceptionEngine:
    def __init__(self, joint_dim: int = 64):
        self.joint_dim = joint_dim
        self.text_engine = TextPerceptionEngine(feature_dim=joint_dim)
        self.vision_engine = VisionPerceptionEngine(feature_dim=joint_dim)

    def process(self, perception_input: MultimodalPerceptionInput) -> PerceptionFeatureVector:
        if perception_input.modality == "text" or (perception_input.text_content and not perception_input.image_base64):
            return self.text_engine.extract_features(perception_input)
        elif perception_input.modality == "vision" or perception_input.image_base64:
            v_feats = self.vision_engine.extract_features(perception_input)
            if perception_input.text_content:
                t_feats = self.text_engine.extract_features(perception_input)
                # Fuse representations
                fused = (np.array(v_feats.dense_features) + np.array(t_feats.dense_features)) / 2.0
                norm = np.linalg.norm(fused)
                if norm > 0:
                    fused = fused / norm
                return PerceptionFeatureVector(
                    modality="multimodal",
                    feature_dimension=self.joint_dim,
                    dense_features=fused.tolist(),
                    semantic_tokens=t_feats.semantic_tokens + v_feats.semantic_tokens,
                    confidence=0.94,
                    extracted_entities=t_feats.extracted_entities + v_feats.extracted_entities,
                    timestamp=datetime.now().isoformat()
                )
            return v_feats
        else:
            return self.text_engine.extract_features(perception_input)

multimodal_engine = MultimodalPerceptionEngine()
