from __future__ import annotations

import hashlib
import re
from typing import Protocol

import numpy as np

from app.config import settings

_TOKEN = re.compile(r"[a-z0-9]{2,}", re.I)


class EmbeddingProvider(Protocol):
    name: str
    dim: int

    def embed_texts(self, texts: list[str]) -> np.ndarray: ...

    def embed_text(self, text: str) -> np.ndarray:
        return self.embed_texts([text])[0]


class HashingEmbedder:
    """Lexical hashed n-gram bag. Default / CI / zero-download path.

    This is a real vectorizer (deterministic features, cosine via FAISS) but it is
    NOT a neural semantic model. Paraphrases that share few tokens will score poorly.

    Production-capable neural option: NEXUS_EMBEDDING_PROVIDER=sbert
    (sentence-transformers/all-MiniLM-L6-v2, 384-d, local, no paid API).
    """

    name = "hash-ngram"
    dim: int

    def __init__(self, dim: int = 384) -> None:
        self.dim = dim

    def embed_texts(self, texts: list[str]) -> np.ndarray:
        out = np.zeros((len(texts), self.dim), dtype=np.float32)
        for i, text in enumerate(texts):
            out[i] = self._one(text)
        return out

    def embed_text(self, text: str) -> np.ndarray:
        return self._one(text)

    def _one(self, text: str) -> np.ndarray:
        vec = np.zeros(self.dim, dtype=np.float32)
        toks = _TOKEN.findall(text.lower())
        grams = list(toks)
        grams += [f"{a}_{b}" for a, b in zip(toks, toks[1:])]
        for tok in grams:
            h = int(hashlib.sha256(tok.encode("utf-8")).hexdigest(), 16)
            vec[h % self.dim] += 1.0
            vec[(h >> 9) % self.dim] -= 0.35
        n = float(np.linalg.norm(vec))
        if n > 0:
            vec /= n
        return vec


class SentenceTransformerEmbedder:
    name = "sbert"
    dim: int

    def __init__(self, model_name: str) -> None:
        from sentence_transformers import SentenceTransformer  # type: ignore

        self._model = SentenceTransformer(model_name)
        self.dim = int(self._model.get_sentence_embedding_dimension())
        self.name = f"sbert:{model_name}"

    def embed_texts(self, texts: list[str]) -> np.ndarray:
        arr = self._model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        return np.asarray(arr, dtype=np.float32)

    def embed_text(self, text: str) -> np.ndarray:
        return self.embed_texts([text])[0]


_provider: EmbeddingProvider | None = None


def get_embedder() -> EmbeddingProvider:
    global _provider
    if _provider is not None:
        return _provider
    kind = settings.embedding_provider.lower()
    if kind in {"sbert", "sentence-transformers", "minilm"}:
        try:
            _provider = SentenceTransformerEmbedder(settings.embedding_model)
            return _provider
        except Exception:
            _provider = HashingEmbedder(settings.embedding_dim)
            _provider.name = "hash-ngram (sbert unavailable)"
            return _provider
    _provider = HashingEmbedder(settings.embedding_dim)
    return _provider


def reset_embedder() -> None:
    global _provider
    _provider = None
