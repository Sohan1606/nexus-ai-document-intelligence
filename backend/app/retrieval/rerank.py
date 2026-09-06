from __future__ import annotations

import re

from app.config import settings
from app.ingestion.chunking import Chunk

_TOKEN = re.compile(r"[a-z0-9]{2,}", re.I)


class Reranker:
    """Lightweight local reranker.

    Default: lexical overlap (Jaccard) mixed with the retrieval score.
    This is real reordering, not a copy of the first-pass rank.
    Neural cross-encoders are optional and not required.
    """

    def __init__(self, kind: str | None = None) -> None:
        self.kind = (kind or settings.rerank_kind).lower()
        self.enabled = settings.rerank_enabled and self.kind not in {"0", "false", "off", "none"}

    def rerank(
        self,
        query: str,
        items: list[tuple[Chunk, float]],
        keep: int,
    ) -> list[tuple[Chunk, float]]:
        if not items:
            return []
        if not self.enabled:
            return items[:keep]
        q = set(_TOKEN.findall(query.lower()))
        scored: list[tuple[Chunk, float]] = []
        for chunk, sim in items:
            toks = set(_TOKEN.findall(chunk.text.lower()))
            if not q or not toks:
                mix = sim
            else:
                j = len(q & toks) / len(q | toks)
                mix = 0.65 * sim + 0.35 * j
            scored.append((chunk, float(mix)))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:keep]
