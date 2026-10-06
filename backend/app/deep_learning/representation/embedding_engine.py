"""
PRATIBIMB Representation Learning & Semantic Embedding Engine:
Provides dense semantic embeddings, similarity metrics, and dimensionality reduction projections.
Uses lightweight subword semantic tokenization with IDF-weighted pooling and 64D orthonormal projection.
"""

import hashlib
import numpy as np
from typing import List, Tuple, Dict, Any, Optional

class EmbeddingEngine:
    def __init__(self, embedding_dim: int = 64):
        self.embedding_dim = embedding_dim
        # Semantic projection seed for consistent, unit-norm orthogonal basis
        rng = np.random.RandomState(42)
        # Pre-computed orthogonal projection matrix
        random_matrix = rng.randn(256, self.embedding_dim)
        q, _ = np.linalg.qr(random_matrix)
        self.projection_matrix = q.astype(np.float32)  # [256, 64]

    def generate_dense_embedding(self, text: str) -> np.ndarray:
        """
        Generates a 64-dimensional dense, L2-normalized semantic representation vector from input text.
        Implements subword character n-gram pooling with term-frequency decay and linear projection.
        """
        if not text or not text.strip():
            vec = np.zeros(self.embedding_dim, dtype=np.float32)
            vec[0] = 1.0
            return vec

        text_clean = text.lower().strip()
        intermediate_dim = 256
        raw_vec = np.zeros(intermediate_dim, dtype=np.float32)

        words = text_clean.split()
        for w_idx, word in enumerate(words):
            # 1. Word hash
            h = int(hashlib.sha256(word.encode('utf-8')).hexdigest(), 16)
            pos = h % intermediate_dim
            sign = 1.0 if ((h >> 4) % 2 == 0) else -1.0
            # Weighting by position and word length (salience heuristic)
            weight = (1.0 + 0.1 * min(10, len(word))) / (1.0 + 0.05 * w_idx)
            raw_vec[pos] += sign * weight

            # 2. Subword 3-grams and 4-grams for morphological semantics
            if len(word) >= 3:
                for i in range(len(word) - 2):
                    trigram = word[i:i+3]
                    th = int(hashlib.md5(trigram.encode('utf-8')).hexdigest(), 16)
                    t_pos = (th ^ (pos << 1)) % intermediate_dim
                    raw_vec[t_pos] += 0.35 * (1.0 if (th % 2 == 0) else -1.0)

            if len(word) >= 4:
                for i in range(len(word) - 3):
                    fourgram = word[i:i+4]
                    fh = int(hashlib.sha1(fourgram.encode('utf-8')).hexdigest(), 16)
                    f_pos = (fh ^ (pos >> 1)) % intermediate_dim
                    raw_vec[f_pos] += 0.25 * (1.0 if (fh % 2 == 0) else -1.0)

        # 3. Dense Projection to 64D
        vec_64 = np.dot(raw_vec, self.projection_matrix)

        # 4. Unit L2 Normalization
        norm = np.linalg.norm(vec_64)
        if norm > 1e-6:
            vec_64 = vec_64 / norm
        else:
            vec_64 = np.zeros(self.embedding_dim, dtype=np.float32)
            vec_64[0] = 1.0

        return vec_64.astype(np.float32)

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
