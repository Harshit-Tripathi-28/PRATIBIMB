"""
Unit Test Suite for PRATIBIMB Deep Learning & Cognitive OS Services
"""

import unittest
from app.services.twin_service import twin_service
from app.deep_learning.representation.contextual_encoder import contextual_encoder
from app.deep_learning.representation.embedding_engine import embedding_engine
from app.deep_learning.representation.life_graph_engine import life_graph_engine
from app.deep_learning.prediction.simulation_engine import simulation_engine
from app.deep_learning.prediction.prediction_service import prediction_service
from app.deep_learning.behavioral.anomaly_detector import anomaly_detector
from app.deep_learning.memory.intelligent_memory import intelligent_memory_engine
from app.deep_learning.memory.memory_consolidator import memory_consolidator
from app.deep_learning.agents.agent_registry import agent_registry
from app.deep_learning.perception.multimodal_engine import multimodal_engine
from app.models.deep_learning_schemas import SimulationScenarioRequest, MultimodalPerceptionInput, AgentTaskRequest

class TestDeepLearningCore(unittest.TestCase):

    def test_embedding_and_projection(self):
        vec = embedding_engine.generate_dense_embedding("Deep Learning and Neural Systems Architecture")
        self.assertEqual(len(vec), 64)
        p2d, p3d = embedding_engine.project_to_2d_3d(vec)
        self.assertEqual(len(p2d), 2)
        self.assertEqual(len(p3d), 3)

        vec2 = embedding_engine.generate_dense_embedding("Neural Architectures and AI Systems")
        sim = embedding_engine.compute_cosine_similarity(vec, vec2)
        self.assertGreater(sim, 0.25)

    def test_latent_state_vector_generation(self):
        twin = twin_service.get_twin("default")
        latent = contextual_encoder.encode_digital_twin_state(twin)
        self.assertEqual(latent.dimensions, 64)
        self.assertEqual(len(latent.vector), 64)
        self.assertGreaterEqual(latent.semantic_coherence, 0.0)
        self.assertLessEqual(latent.semantic_coherence, 1.0)

    def test_life_graph_construction(self):
        twin = twin_service.get_twin("default")
        graph = life_graph_engine.build_life_graph(twin)
        self.assertGreater(len(graph.nodes), 0)
        self.assertGreater(len(graph.edges), 0)
        node_types = set([n.type for n in graph.nodes])
        self.assertIn("identity", node_types)

    def test_simulation_engine(self):
        twin = twin_service.get_twin("default")
        req = SimulationScenarioRequest(
            scenario_title="Deep Focus on DSA",
            focus_domain="Algorithms & Data Structures",
            allocated_hours_per_week=15.0,
            duration_weeks=8
        )
        outcome = simulation_engine.simulate_scenario(twin, req)
        self.assertGreater(outcome.estimated_goal_progress_delta, 0)
        self.assertGreaterEqual(outcome.burnout_risk_score, 0.0)
        self.assertLessEqual(outcome.burnout_risk_score, 1.0)
        self.assertGreater(len(outcome.projected_tradeoffs), 0)

    def test_prediction_service_and_anomalies(self):
        twin = twin_service.get_twin("default")
        forecasts = prediction_service.generate_behavior_forecasts(twin)
        self.assertGreaterEqual(len(forecasts), 2)
        signals = anomaly_detector.detect_signals(twin)
        self.assertIsInstance(signals, list)

    def test_memory_intelligence_and_consolidation(self):
        twin = twin_service.get_twin("default")
        importance = intelligent_memory_engine.extract_memory_importance("Critical breakthrough in neural state representation", ["architecture"])
        self.assertGreaterEqual(importance, 6)
        clusters = memory_consolidator.consolidate_memories(twin.memories)
        self.assertIsInstance(clusters, list)

    def test_autonomous_agents(self):
        twin = twin_service.get_twin("default")
        agents = agent_registry.list_agents()
        self.assertGreaterEqual(len(agents), 4)
        task_req = AgentTaskRequest(
            agent_id="agent-planning",
            instruction="Decompose PRATIBIMB OS launch milestones"
        )
        res = agent_registry.execute_agent_task(twin, task_req)
        self.assertEqual(res.status, "completed")
        self.assertGreater(len(res.result_summary), 10)

    def test_multimodal_perception(self):
        inp = MultimodalPerceptionInput(
            modality="text",
            text_content="Synthesize my goals and prepare a 12-week roadmap for AI engineering."
        )
        features = multimodal_engine.process(inp)
        self.assertEqual(features.feature_dimension, 64)
        self.assertEqual(len(features.dense_features), 64)
        self.assertGreater(len(features.extracted_entities), 0)

    def test_state_engine_snapshots_and_triad(self):
        from app.deep_learning.state_engine.state_engine_service import state_engine_service
        twin = twin_service.get_twin("default")
        
        # 1. Capture snapshot
        snapshot = state_engine_service.capture_snapshot(twin, "Unit Test Sync")
        self.assertEqual(len(snapshot.state_vector_64d), 64)
        self.assertIn(snapshot.operational_state, [
            'IDLE', 'ACTIVE', 'DEEP_FOCUS', 'RECOVERY',
            'PROJECT_ACCELERATING', 'GOAL_AT_RISK', 'HABIT_STABILIZING'
        ])

        # 2. State comparison
        comparison = state_engine_service.get_state_comparison(twin)
        self.assertIsNotNone(comparison.current_snapshot)

        # 3. Grounded state insights
        insights = state_engine_service.derive_state_insights(twin)
        self.assertIsInstance(insights, list)

        # 4. Temporal Triad
        triad = state_engine_service.get_temporal_triad(twin)
        self.assertIn("operational_state", triad.current)
        self.assertIn("recent_snapshots", triad.history)
        self.assertIn("forecasts", triad.predicted)

    def test_sequence_dataset_tensor(self):
        from app.deep_learning.state_engine.state_engine_service import state_engine_service
        twin = twin_service.get_twin("default")
        tensor_obj = state_engine_service.export_sequence_dataset_tensor(twin, sequence_length=8)
        self.assertEqual(tensor_obj.sequence_length, 8)
        self.assertEqual(len(tensor_obj.tensor_matrix), 8)
        self.assertEqual(tensor_obj.feature_dimension, len(tensor_obj.feature_names))
        self.assertTrue(tensor_obj.ready_for_sequence_modeling)

    def test_cognitive_insight_and_causal_context_engine(self):
        from app.deep_learning.cognition.signal_attribution import signal_attribution_engine
        from app.deep_learning.cognition.relationship_analyzer import relationship_analyzer
        from app.deep_learning.cognition.cognitive_engine import cognitive_engine
        from app.deep_learning.cognition.cognition_schemas import RecommendationDecisionRequest

        twin = twin_service.get_twin("default")

        # 1. Attributed Signals Extraction
        signals = signal_attribution_engine.extract_attributed_signals(twin)
        self.assertIsInstance(signals, list)
        self.assertGreater(len(signals), 0)
        first_sig = signals[0]
        self.assertIn(first_sig.direction, ['increasing', 'decreasing', 'stable'])
        self.assertGreaterEqual(first_sig.confidence, 0.0)

        # 2. Relationship Analyzer
        related = relationship_analyzer.identify_related_entities(twin, "Goals")
        self.assertIsInstance(related, list)

        # 3. Full Cognitive Insights Generation
        insights = cognitive_engine.generate_cognitive_insights(twin)
        self.assertIsInstance(insights, list)
        self.assertGreater(len(insights), 0)
        first_insight = insights[0]
        self.assertIn(first_insight.category, ['TREND', 'CHANGE', 'RELATIONSHIP', 'RISK', 'OPPORTUNITY', 'ANOMALY'])
        self.assertIn(first_insight.epistemic_level, ['OBSERVATION', 'ASSOCIATION', 'INTERPRETATION', 'RECOMMENDATION', 'PREDICTION'])
        self.assertIsNotNone(first_insight.explanation)
        self.assertGreater(len(first_insight.recommended_action), 0)

        # 4. Recommendation Decision Loop
        req = RecommendationDecisionRequest(
            insight_id=first_insight.id,
            recommendation_text=first_insight.recommended_action,
            decision="accepted",
            feedback_note="Executed via test"
        )
        res = cognitive_engine.record_recommendation_decision(twin, req)
        self.assertTrue(res.processed)
        self.assertEqual(res.decision, "accepted")

    def test_personal_world_model_engine(self):
        from app.deep_learning.world_model.world_model_service import world_model_service
        from app.deep_learning.world_model.world_schemas import WorldQueryRequest, PropagationScenarioRequest

        twin = twin_service.get_twin("default")

        # 1. Build and verify World Graph Snapshot
        snapshot = world_model_service.get_world_snapshot(twin, record_history=True)
        self.assertGreater(len(snapshot.entities), 5)
        self.assertGreater(len(snapshot.relationships), 5)
        self.assertGreater(snapshot.graph_density, 0.0)

        # Check entity types
        types_present = set(e.type for e in snapshot.entities)
        self.assertIn('USER', types_present)
        self.assertIn('GOAL', types_present)
        self.assertIn('TASK', types_present)
        self.assertIn('SKILL', types_present)

        # 2. Multi-hop World Query
        target_goal_id = next((e.id for e in snapshot.entities if e.type == 'GOAL'), None)
        query_req = WorldQueryRequest(
            target_entity_id=target_goal_id,
            query_type="entity_dependencies",
            max_depth=2
        )
        query_res = world_model_service.query_world_model(twin, query_req)
        self.assertIsNotNone(query_res.target_entity)
        self.assertGreater(len(query_res.structured_synthesis), 10)

        # 3. State Propagation Engine
        prop_req = PropagationScenarioRequest(
            entity_id=target_goal_id or snapshot.entities[0].id,
            scenario_action="pause",
            duration_weeks=4
        )
        prop_res = world_model_service.simulate_propagation(twin, prop_req)
        self.assertEqual(prop_res.scenario_action, "pause")
        self.assertGreater(len(prop_res.risk_assessment), 10)
        self.assertGreater(len(prop_res.recommended_mitigations), 0)

        # 4. GNN Ready Graph Tensors
        gnn = world_model_service.get_gnn_tensors(twin)
        self.assertEqual(gnn.num_nodes, len(snapshot.entities))
        self.assertEqual(len(gnn.node_features), gnn.num_nodes)
        self.assertEqual(len(gnn.node_features[0]), 64)
        self.assertEqual(len(gnn.edge_index), 2)
        self.assertTrue(gnn.ready_for_gnn_training)

        # 5. History persistence
        history = world_model_service.load_world_history(twin.user_id)
        self.assertIsInstance(history, list)
        self.assertGreater(len(history), 0)

if __name__ == "__main__":
    unittest.main()


