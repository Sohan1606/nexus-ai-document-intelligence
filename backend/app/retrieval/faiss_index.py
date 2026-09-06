from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from app.config import settings


class VectorIndex:
    """FAISS inner-product index over L2-normalized vectors (cosine)."""

    def __init__(self, dim: int, path: Path | None = None, idmap_path: Path | None = None) -> None:
        self.dim = dim
        self.path = path or settings.faiss_path
        self.idmap_path = idmap_path or settings.idmap_path
        self._ids: list[str] = []
        self._index = None
        self._use_faiss = True
        try:
            import faiss  # noqa: F401
        except Exception:
            self._use_faiss = False
            self._matrix = np.zeros((0, dim), dtype=np.float32)

    def __len__(self) -> int:
        return len(self._ids)

    def add(self, ids: list[str], vectors: np.ndarray) -> None:
        if vectors.ndim != 2 or vectors.shape[1] != self.dim:
            raise ValueError("vector shape mismatch")
        vecs = _l2_normalize(vectors.astype(np.float32, copy=False))
        if self._use_faiss:
            import faiss

            if self._index is None:
                self._index = faiss.IndexFlatIP(self.dim)
            self._index.add(vecs)
        else:
            if self._matrix.shape[0] == 0:
                self._matrix = vecs
            else:
                self._matrix = np.vstack([self._matrix, vecs])
        self._ids.extend(ids)

    def search(self, query: np.ndarray, k: int) -> list[tuple[str, float]]:
        if not self._ids:
            return []
        q = _l2_normalize(query.astype(np.float32, copy=False).reshape(1, -1))
        k = max(1, min(k, len(self._ids)))
        if self._use_faiss:
            scores, idxs = self._index.search(q, k)
            out: list[tuple[str, float]] = []
            for score, i in zip(scores[0], idxs[0], strict=False):
                if i < 0:
                    continue
                out.append((self._ids[int(i)], float(score)))
            return out
        sims = (self._matrix @ q.T).ravel()
        top = np.argsort(-sims)[:k]
        return [(self._ids[int(i)], float(sims[int(i)])) for i in top]

    def save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.idmap_path.write_text(json.dumps(self._ids), encoding="utf-8")
        if self._use_faiss:
            import faiss

            if self._index is None:
                self._index = faiss.IndexFlatIP(self.dim)
            faiss.write_index(self._index, str(self.path))
        else:
            if not hasattr(self, "_matrix"):
                self._matrix = np.zeros((0, self.dim), dtype=np.float32)
            np.save(self.path.with_suffix(".npy"), self._matrix)

    def load(self) -> bool:
        if not self.idmap_path.exists():
            return False
        self._ids = json.loads(self.idmap_path.read_text(encoding="utf-8"))
        if self._use_faiss and self.path.exists():
            import faiss

            idx = faiss.read_index(str(self.path))
            if int(idx.d) != int(self.dim):
                self._ids = []
                self._index = None
                return False
            self._index = idx
            return True
        npy = self.path.with_suffix(".npy")
        if npy.exists():
            mat = np.load(npy)
            if mat.ndim != 2 or int(mat.shape[1]) != int(self.dim):
                self._ids = []
                return False
            self._matrix = mat
            self._use_faiss = False
            return True
        return False

    def rebuild(self, ids: list[str], vectors: np.ndarray) -> None:
        self._ids = []
        self._index = None
        if not self._use_faiss:
            self._matrix = np.zeros((0, self.dim), dtype=np.float32)
        if ids:
            self.add(ids, vectors)
        self.save()


def _l2_normalize(x: np.ndarray) -> np.ndarray:
    n = np.linalg.norm(x, axis=1, keepdims=True)
    n = np.maximum(n, 1e-12)
    return x / n
