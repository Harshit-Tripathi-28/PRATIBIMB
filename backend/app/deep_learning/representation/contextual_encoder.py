"""
Contextual Encoder:
Encodes the user's full Digital Twin state (Profile, Focus, Goals, Habits, Memories, Cognitive Energy)
into a unified 64-dimensional latent state representation.
"""

from datetime import datetime
from typing import Dict, Any, List
import numpy as np
from app.models.twin_schemas import DigitalTwin
from app.models.deep_learning_schemas import LatentStateVector
from app.deep_learning.representation.embedding_engine import embedding_engine

class ContextualEncoder:
    def __init__(self, latent_dim: int = 64):
        self.latent_dim = latent_dim

    def encode_digital_twin_state(self, twin: DigitalTwin) -> LatentStateVector:
        """
        Synthesizes multimodal context and discrete state into a unified latent representation vector.
        """
        # 1. Textual & Identity context embedding
        profile_text = (
            f"{twin.profile.name} {twin.profile.title} {twin.profile.bio} "
            f"{' '.join(twin.profile.skills)} {' '.join(twin.profile.interests)} "
            f"{twin.state.current_focus}"
        )
        profile_vec = embedding_engine.generate_dense_embedding(profile_text)

        # 2. Goals & Tasks contextual vector
        goals_text = " ".join([f"{g.title} {g.category} priority:{g.priority} progress:{g.progress}" for g in twin.goals])
        goals_vec = embedding_engine.generate_dense_embedding(goals_text)

        # 3. Memories summary vector
        memories_text = " ".join([f"{m.type} {m.content}" for m in twin.memories[:8]])
        memories_vec = embedding_engine.generate_dense_embedding(memories_text)

        # 4. Behavioral & Capacity modulation
        energy_factor = max(0.1, min(1.0, twin.state.energy_level / 100.0))
        streak_factor = min(1.0, twin.behavior.active_streak_days / 30.0)

        # 5. Composite representation synthesis
        composite_vec = (
            profile_vec * 0.40 +
            goals_vec * 0.35 +
            memories_vec * 0.25
        )

        # Modulate amplitude with energy & consistency
        composite_vec = composite_vec * (0.8 + 0.2 * energy_factor)

        # Compute 2D & 3D principal projections
        p2d, p3d = embedding_engine.project_to_2d_3d(composite_vec)

        # Compute information entropy & coherence
        norm_probs = np.abs(composite_vec) / np.sum(np.abs(composite_vec) + 1e-7)
        entropy = float(-np.sum(norm_probs * np.log(norm_probs + 1e-7)) / np.log(len(composite_vec)))

        dominant_cluster = twin.profile.title or "General Intelligence"
        if twin.goals:
            dominant_cluster = f"{twin.goals[0].category} Focus"

        return LatentStateVector(
            dimensions=self.latent_dim,
            vector=[round(float(v), 4) for v in composite_vec.tolist()],
            principal_components_2d=p2d,
            principal_components_3d=p3d,
            semantic_coherence=round(float(1.0 - entropy * 0.3), 3),
            entropy=round(entropy, 3),
            dominant_cluster=dominant_cluster,
            computed_at=datetime.now().isoformat()
        )

contextual_encoder = ContextualEncoder()
