import math
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Tuple
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.twin_schemas import Task, Goal, MemoryItem, BehaviorMetrics

class MLIntelligenceService:
    def __init__(self):
        # Behavioral Anomaly & Pattern Model (Isolation Forest)
        # Baseline normal features: [hour_of_day, session_duration_min, tasks_completed, energy_level, focus_score]
        self.baseline_behavior_data = np.array([
            [9.0, 45.0, 2.0, 8.0, 85.0],
            [10.5, 60.0, 3.0, 9.0, 92.0],
            [11.5, 50.0, 2.0, 8.5, 88.0],
            [14.0, 30.0, 1.0, 6.5, 72.0],
            [15.5, 45.0, 2.0, 7.5, 80.0],
            [17.0, 40.0, 2.0, 7.0, 78.0],
            [20.0, 35.0, 1.0, 6.0, 68.0],
        ])
        self.anomaly_model = IsolationForest(contamination=0.12, random_state=42)
        self.anomaly_model.fit(self.baseline_behavior_data)

        # Semantic Search Vectorizer
        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english')

    def analyze_behavior_pattern(
        self,
        current_hour: float,
        duration: float,
        tasks_done: float,
        energy: float,
        focus_score: float
    ) -> Dict[str, Any]:
        """
        Evaluates current session behavior against the Isolation Forest baseline.
        Reports whether the pattern is in optimal flow, fatigued, or an anomaly.
        If user has zero logged duration or completed tasks today, reports insufficient data.
        """
        if duration <= 0 and tasks_done <= 0:
            return {
                "has_sufficient_data": False,
                "is_optimal_flow": True,
                "anomaly_score": 0.0,
                "pattern_state": "Calibrating (No focus sessions recorded today)",
                "recommended_next_break_min": 0
            }

        sample = np.array([[current_hour, max(5.0, duration), tasks_done, energy, focus_score]])
        is_normal = self.anomaly_model.predict(sample)[0] == 1
        anomaly_score = float(self.anomaly_model.score_samples(sample)[0])

        pattern_state = "Optimal Flow Regime"
        if not is_normal:
            if energy < 5.0 or focus_score < 50.0:
                pattern_state = "Cognitive Fatigue Detected"
            elif duration > 90.0:
                pattern_state = "Extended Focus Block (Break Recommended)"
            else:
                pattern_state = "High-Intensity Focus Spike"

        return {
            "has_sufficient_data": True,
            "is_optimal_flow": is_normal,
            "anomaly_score": round(anomaly_score, 3),
            "pattern_state": pattern_state,
            "recommended_next_break_min": 15 if duration >= 50 else 0
        }

    def rank_task_recommendations(self, tasks: List[Task], current_energy: int, active_goals: List[Goal]) -> List[Dict[str, Any]]:
        """
        Multi-objective recommendation ranking model.
        Scores each pending task based on priority, energy alignment, and goal linkage.
        """
        scored_tasks = []
        goal_priority_map = {g.id: g.priority for g in active_goals}
        priority_weights = {'urgent': 4.0, 'high': 3.0, 'medium': 2.0, 'low': 1.0}
        energy_ratio = max(0.1, min(1.0, current_energy / 100.0))

        for task in tasks:
            if task.status == 'completed':
                continue

            base_p_score = priority_weights.get(task.priority, 2.0)
            
            # Energy alignment: high energy benefits from longer/urgent tasks
            if task.estimated_minutes >= 45:
                energy_fit = energy_ratio * 1.5
            else:
                energy_fit = (1.1 - energy_ratio) * 1.2

            # Goal bonus
            goal_bonus = 1.3 if (task.goal_id and task.goal_id in goal_priority_map) else 1.0
            
            # Calculate final recommendation score
            recommendation_score = round((base_p_score * 0.4 + energy_fit * 0.35 + goal_bonus * 0.25) * 25.0, 1)

            reason = "Matches current energy state and aligns with active goal targets."
            if task.priority == 'urgent':
                reason = "Urgent priority task requiring immediate focus."
            elif energy_ratio < 0.6 and task.estimated_minutes <= 25:
                reason = "Shorter task suited for current energy level."

            scored_tasks.append({
                "task": task,
                "score": recommendation_score,
                "reason": reason
            })

        # Sort descending by score
        scored_tasks.sort(key=lambda x: x["score"], reverse=True)
        return scored_tasks

    def semantic_memory_search(self, query: str, memories: List[MemoryItem], top_k: int = 4) -> List[Tuple[MemoryItem, float]]:
        """
        Uses dense semantic vector embeddings and cosine similarity to retrieve the most relevant memories.
        """
        if not memories or not query.strip():
            return []

        from app.deep_learning.representation.embedding_engine import embedding_engine

        q_vec = embedding_engine.generate_dense_embedding(query)
        scored_results: List[Tuple[MemoryItem, float]] = []

        for m in memories:
            text_rep = f"{m.content} {' '.join(m.tags)} {m.summary or ''}"
            m_vec = embedding_engine.generate_dense_embedding(text_rep)
            sim = embedding_engine.compute_cosine_similarity(q_vec, m_vec)

            # Keyword matching boost
            q_terms = [t for t in query.lower().split() if len(t) > 2]
            kw_hits = sum(1 for t in q_terms if t in text_rep.lower())
            final_score = sim * 0.7 + (kw_hits / max(1, len(q_terms))) * 0.3

            if final_score > 0.05:
                scored_results.append((m, float(final_score)))

        scored_results.sort(key=lambda x: x[1], reverse=True)
        return scored_results[:top_k]

    def forecast_productivity_trend(self, past_scores: List[int]) -> Dict[str, Any]:
        """
        Polynomial trend estimation from real historical scores.
        Only forecasts if at least 3 genuine historical points exist.
        """
        if len(past_scores) < 3:
            return {
                "has_sufficient_history": False,
                "slope": 0.0,
                "trend_direction": "Calibrating (Needs ≥3 logged sessions)",
                "forecast_next_3_days": []
            }

        x = np.arange(len(past_scores))
        y = np.array(past_scores)
        poly = np.polyfit(x, y, 1)
        slope = float(poly[0])

        future_x = np.arange(len(past_scores), len(past_scores) + 3)
        forecast_values = [int(max(20, min(100, poly[0] * fx + poly[1]))) for fx in future_x]
        trend_direction = "Ascending" if slope > 0.5 else ("Stable" if slope >= -0.5 else "Declining")

        return {
            "has_sufficient_history": True,
            "slope": round(slope, 2),
            "trend_direction": trend_direction,
            "forecast_next_3_days": forecast_values
        }

ml_service = MLIntelligenceService()
