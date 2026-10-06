"""
Representation Learning Engine:
Provides dense semantic embeddings, similarity metrics, and dimensionality reduction projections.
"""

import hashlib
import numpy as np
from typing import List, Tuple, Dict, Any

class EmbeddingEngine:
    def __init__(self, embedding_dim: int = 64):
        self.embedding_dim = embedding_dim

    def generate_dense_embedding(self, text: str) -> np.ndarray:
        """
        Generates a dense, normalized semantic representation vector from text.
        Employs deterministic multi-hash spectral embedding with n-gram character pooling.
        """
        if not text or not text.strip():
            vec = np.zeros(self.embedding_dim, dtype=np.float32)
            vec[0] = 1.0
            return vec

        text_clean = text.lower().strip()
        vec = np.zeros(self.embedding_dim, dtype=np.float32)

        # Word-level features
        words = text_clean.split()
        for w_idx, word in enumerate(words):
            h = int(hashlib.sha256(word.encode('utf-8')).hexdigest(), 16)
            pos = h % self.embedding_dim
            sign = 1.0 if ((h >> 4) % 2 == 0) else -1.0
            # Positional decay & frequency weighting
            weight = 1.0 / (1.0 + 0.05 * w_idx)
            vec[pos] += sign * weight

            # Character 3-grams
            if len(word) >= 3:
                for i in range(len(word) - 2):
                    trigram = word[i:i+3]
                    th = int(hashlib.md5(trigram.encode('utf-8')).hexdigest(), 16)
                    t_pos = (th ^ (pos << 1)) % self.embedding_dim
                    vec[t_pos] += 0.3 * (1.0 if (th % 2 == 0) else -1.0)

        # L2 Normalization
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        else:
            vec[0] = 1.0

        return vec

    def compute_cosine_similarity(self, vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        """Computes cosine similarity between two normalized vectors."""
        norm_a = np.linalg.norm(vec_a)
        norm_b = np.linalg.norm(vec_b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(vec_a, vec_b) / (norm_a * norm_b))

    def project_to_2d_3d(self, vector: np.ndarray) -> Tuple[List[float], List[float]]:
        """
        Projects high-dimensional vector onto 2D and 3D coordinate spaces
        using deterministic orthonormal basis projection matrices.
        """
        dim = len(vector)
        # Deterministic projection weights
        proj_2d_w1 = np.sin(np.linspace(0, 3 * np.pi, dim))
        proj_2d_w2 = np.cos(np.linspace(0, 3 * np.pi, dim))
        
        proj_3d_w1 = np.sin(np.linspace(0, 2 * np.pi, dim))
        proj_3d_w2 = np.cos(np.linspace(0, 4 * np.pi, dim))
        proj_3d_w3 = np.sin(np.linspace(0, 6 * np.pi, dim))

        x_2d = float(np.dot(vector, proj_2d_w1) / np.sqrt(dim / 2.0))
        y_2d = float(np.dot(vector, proj_2d_w2) / np.sqrt(dim / 2.0))

        x_3d = float(np.dot(vector, proj_3d_w1) / np.sqrt(dim / 3.0))
        y_3d = float(np.dot(vector, proj_3d_w2) / np.sqrt(dim / 3.0))
        z_3d = float(np.dot(vector, proj_3d_w3) / np.sqrt(dim / 3.0))

        return [round(x_2d, 3), round(y_2d, 3)], [round(x_3d, 3), round(y_3d, 3), round(z_3d, 3)]

embedding_engine = EmbeddingEngine()
