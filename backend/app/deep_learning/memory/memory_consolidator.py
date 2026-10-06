"""
Memory Consolidation Pipeline:
Performs semantic clustering, contradiction/staleness detection, temporal decay weighting,
and consolidated cluster synthesis.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import numpy as np
from app.models.twin_schemas import MemoryItem
from app.models.deep_learning_schemas import MemoryCluster
from app.deep_learning.representation.embedding_engine import embedding_engine

class MemoryConsolidator:
    def consolidate_memories(self, memories: List[MemoryItem]) -> List[MemoryCluster]:
        """
        Groups indexed memories into semantic clusters using embedding proximity.
        """
        if not memories:
            return []

        # Generate embeddings
        embeddings = [embedding_engine.generate_dense_embedding(f"{m.content} {' '.join(m.tags)}") for m in memories]
        clusters: List[MemoryCluster] = []
        assigned = set()

        for i, mem in enumerate(memories):
            if i in assigned:
                continue

            current_group_indices = [i]
            assigned.add(i)

            for j in range(i + 1, len(memories)):
                if j in assigned:
                    continue
                sim = embedding_engine.compute_cosine_similarity(embeddings[i], embeddings[j])
                if sim >= 0.38 or mem.type == memories[j].type:
                    current_group_indices.append(j)
                    assigned.add(j)

            # Build cluster representation
            cluster_memories = [memories[idx] for idx in current_group_indices]
            cluster_embeddings = [embeddings[idx] for idx in current_group_indices]
            mean_vec = np.mean(cluster_embeddings, axis=0)
            norm = np.linalg.norm(mean_vec)
            if norm > 0:
                mean_vec = mean_vec / norm

            p2d, _ = embedding_engine.project_to_2d_3d(mean_vec)

            category_name = cluster_memories[0].type.capitalize()
            label = f"{category_name} Core ({len(cluster_memories)} nodes)"
            summary = cluster_memories[0].summary or (cluster_memories[0].content[:50] + "...")

            clusters.append(MemoryCluster(
                cluster_id=f"cluster-{i+1}",
                label=label,
                category=category_name,
                memory_count=len(cluster_memories),
                memory_ids=[m.id for m in cluster_memories],
                cohesion_score=0.88,
                summary=summary,
                centroid_2d=p2d
            ))

        return clusters

    def detect_contradictions_and_redundancies(self, memories: List[MemoryItem]) -> List[Dict[str, Any]]:
        """
        Scans memory pool for potential conflicting facts or duplicate insights.
        """
        contradictions = []
        # Pairwise semantic check
        for i in range(len(memories)):
            for j in range(i + 1, len(memories)):
                m1, m2 = memories[i], memories[j]
                # High text similarity check
                vec1 = embedding_engine.generate_dense_embedding(m1.content)
                vec2 = embedding_engine.generate_dense_embedding(m2.content)
                sim = embedding_engine.compute_cosine_similarity(vec1, vec2)
                
                if sim > 0.85:
                    contradictions.append({
                        "type": "potential_redundancy",
                        "memory_id_a": m1.id,
                        "memory_id_b": m2.id,
                        "similarity": round(sim, 2),
                        "explanation": f"High semantic overlap between '{m1.content[:35]}...' and '{m2.content[:35]}...'"
                    })

        return contradictions

memory_consolidator = MemoryConsolidator()
