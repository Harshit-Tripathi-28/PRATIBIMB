"""
Behavioral Sequence Modeling Engine:
Provides temporal sequence encoding interfaces (time-series patterns, activity rhythm,
focus duration sequences, and circadian task velocity).
"""

from datetime import datetime
from typing import List, Dict, Any, Tuple
import numpy as np
from app.models.twin_schemas import DigitalTwin, FocusSession

class SequenceEncoder:
    def __init__(self, sequence_dim: int = 32):
        self.sequence_dim = sequence_dim

    def encode_focus_sequence(self, focus_sessions: List[FocusSession]) -> Dict[str, Any]:
        """
        Transforms temporal focus sessions into sequential rhythm metrics
        and velocity features ready for recurrent/temporal neural layers.
        """
        if not focus_sessions:
            return {
                "sequence_length": 0,
                "average_duration_min": 0.0,
                "energy_delta_mean": 0.0,
                "rhythm_regularity_score": 0.5,
                "encoded_latent_sequence": [0.0] * self.sequence_dim
            }

        durations = [s.duration_minutes for s in focus_sessions]
        energy_deltas = [s.energy_after - s.energy_before for s in focus_sessions]

        avg_dur = float(np.mean(durations))
        std_dur = float(np.std(durations)) if len(durations) > 1 else 5.0
        rhythm_regularity = max(0.1, min(1.0, 1.0 - (std_dur / (avg_dur + 1e-5))))

        # Encode temporal state into 32-dim dense sequence vector
        seq_vec = np.zeros(self.sequence_dim, dtype=np.float32)
        for idx, (dur, delta) in enumerate(zip(durations[-self.sequence_dim:], energy_deltas[-self.sequence_dim:])):
            seq_vec[idx % self.sequence_dim] = (dur / 60.0) * 0.7 + (delta * 0.3)

        return {
            "sequence_length": len(focus_sessions),
            "average_duration_min": round(avg_dur, 1),
            "energy_delta_mean": round(float(np.mean(energy_deltas)), 2),
            "rhythm_regularity_score": round(rhythm_regularity, 2),
            "encoded_latent_sequence": [round(float(v), 3) for v in seq_vec.tolist()]
        }

sequence_encoder = SequenceEncoder()
