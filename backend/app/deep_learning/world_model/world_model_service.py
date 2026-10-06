"""
PRATIBIMB Personal World Model Service:
Master coordinator managing World Model snapshots, persistence,
multi-hop graph queries, state propagation, and GNN tensor pipelines.
"""

import os
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.models.twin_schemas import DigitalTwin
from app.deep_learning.world_model.world_schemas import (
    WorldGraphSnapshot, WorldQueryRequest, WorldQueryResult,
    PropagationScenarioRequest, PropagationScenarioResponse,
    GNNReadyGraphTensors
)
from app.deep_learning.world_model.world_graph_builder import world_graph_builder
from app.deep_learning.world_model.world_query_engine import world_query_engine
from app.deep_learning.world_model.propagation_engine import world_propagation_engine

from app.db.database import db

class WorldModelService:
    def __init__(self):
        self.db = db
        self.history_dir = Path(__file__).resolve().parent.parent.parent / "data" / "world_history"
        self.history_dir.mkdir(parents=True, exist_ok=True)

    def get_world_snapshot(self, twin: DigitalTwin, record_history: bool = True) -> WorldGraphSnapshot:
        """
        Builds the current World Model snapshot and persists it in history.
        """
        snapshot = world_graph_builder.build_world_snapshot(twin)
        if record_history:
            self._save_snapshot_history(twin.user_id, snapshot)
        return snapshot

    def query_world_model(self, twin: DigitalTwin, request: WorldQueryRequest) -> WorldQueryResult:
        """
        Executes multi-hop graph query and dependency analysis.
        """
        snapshot = self.get_world_snapshot(twin, record_history=False)
        return world_query_engine.execute_query(snapshot, request, twin=twin)

    def simulate_propagation(self, twin: DigitalTwin, request: PropagationScenarioRequest) -> PropagationScenarioResponse:
        """
        Simulates state propagation and downstream impacts across the personal world model.
        """
        snapshot = self.get_world_snapshot(twin, record_history=False)
        return world_propagation_engine.simulate_propagation(snapshot, request)

    def get_gnn_tensors(self, twin: DigitalTwin) -> GNNReadyGraphTensors:
        """
        Exports GNN-ready node feature matrix and edge index tensors.
        """
        snapshot = self.get_world_snapshot(twin, record_history=False)
        return snapshot.gnn_tensors or world_graph_builder._build_gnn_tensors(snapshot.entities, snapshot.relationships)

    def load_world_history(self, user_id: str, limit: int = 15) -> List[Dict[str, Any]]:
        """
        Loads historical world snapshots for temporal queries and trajectory analysis.
        """
        try:
            db_records = self.db.get_world_history(user_id, limit=limit)
            if db_records:
                return db_records
        except Exception:
            pass

        file_path = self.history_dir / f"{user_id}.json"
        if not file_path.exists():
            return []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data[-limit:] if isinstance(data, list) else []
        except Exception:
            return []

    def _save_snapshot_history(self, user_id: str, snapshot: WorldGraphSnapshot):
        """
        Appends snapshot metadata to user world history log.
        """
        history_item = {
            "snapshot_id": snapshot.snapshot_id,
            "timestamp": snapshot.timestamp,
            "iso_timestamp": snapshot.iso_timestamp,
            "entity_count": len(snapshot.entities),
            "relationship_count": len(snapshot.relationships),
            "graph_density": snapshot.graph_density,
            "entity_counts_by_type": snapshot.entity_counts_by_type,
            "dominant_cluster": snapshot.dominant_cluster
        }

        # 1. Save to SQLite
        try:
            self.db.add_world_history_record(user_id, history_item)
        except Exception:
            pass

        # 2. File backup
        file_path = self.history_dir / f"{user_id}.json"
        history: List[Dict[str, Any]] = []
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    history = json.load(f)
            except Exception:
                history = []

        history.append(history_item)
        if len(history) > 50:
            history = history[-50:]

        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(history, f, indent=2)
        except Exception:
            pass

world_model_service = WorldModelService()
