"""
Data & Event Pipeline:
Ingests user interaction events, normalizes signals, extracts features, updates representations,
and writes to the Digital Twin state loop.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from app.models.twin_schemas import DigitalTwin
from app.deep_learning.representation.contextual_encoder import contextual_encoder
from app.deep_learning.representation.embedding_engine import embedding_engine
from app.deep_learning.state_engine.state_engine_service import state_engine_service

class EventPipeline:
    def log_and_process_event(self, twin: DigitalTwin, event_type: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes a raw event through validation, normalization, feature extraction,
        and triggers a latent state update on the Digital Twin and snapshot recording.
        """
        now_str = datetime.now().isoformat()
        
        # 1. Normalize event
        normalized_event = {
            "event_type": event_type,
            "timestamp": now_str,
            "payload": event_data,
            "user_id": twin.user_id
        }

        # 2. Extract feature representation
        event_str = f"{event_type} {str(event_data)}"
        event_embedding = embedding_engine.generate_dense_embedding(event_str)

        # 3. Update Twin State timestamp
        twin.state.last_updated = now_str

        # 4. Synthesize updated latent representation
        latent_state = contextual_encoder.encode_digital_twin_state(twin)

        # 5. Capture temporal snapshot in State Engine 2.0
        snapshot = state_engine_service.capture_snapshot(twin, event_trigger=f"Event: {event_type}")

        return {
            "processed": True,
            "event_type": event_type,
            "timestamp": now_str,
            "latent_state_coherence": latent_state.semantic_coherence,
            "dominant_cluster": latent_state.dominant_cluster,
            "operational_state": snapshot.operational_state
        }

event_pipeline = EventPipeline()
