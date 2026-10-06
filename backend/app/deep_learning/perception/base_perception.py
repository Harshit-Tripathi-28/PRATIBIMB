"""
Base perception interfaces for PRATIBIMB Multimodal Perception.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
import numpy as np
from app.models.deep_learning_schemas import MultimodalPerceptionInput, PerceptionFeatureVector

class BasePerceptionExtractor(ABC):
    @abstractmethod
    def extract_features(self, perception_input: MultimodalPerceptionInput) -> PerceptionFeatureVector:
        """Extract dense normalized feature vectors and semantic tokens from input modality."""
        pass
