from __future__ import annotations

from app.generation.llm import highlight
from app.ingestion.chunking import Chunk
from app.storage.store import JsonStore


def evidence_id(chunk_id: str) -> str:
    return f"ev-{chunk_id}"


def chunk_id_from_evidence(evidence_id_value: str) -> str:
    if evidence_id_value.startswith("ev-"):
        return evidence_id_value[3:]
    return evidence_id_value


def citation_dict(
    chunk: Chunk,
    score: float,
    title: str,
    query: str,
    prev_text: str | None,
    next_text: str | None,
    confidence: str,
) -> dict:
    return {
        "id": evidence_id(chunk.id),
        "documentId": chunk.document_id,
        "documentTitle": title,
        "page": chunk.page,
        "section": chunk.section,
        "passage": chunk.text,
        "highlight": highlight(chunk.text, query),
        "similarity": round(max(0.0, min(1.0, score)), 4),
        "confidence": confidence,
        "prevPassage": prev_text,
        "nextPassage": next_text,
        "chunkId": chunk.id,
    }


def only_real_citations(citations: list[dict]) -> list[dict]:
    """Drop any citation that is missing a real chunk id / document / page."""
    out: list[dict] = []
    seen: set[str] = set()
    for c in citations:
        cid = str(c.get("chunkId") or "")
        doc = str(c.get("documentId") or "")
        page = c.get("page")
        if not cid or not doc or not isinstance(page, int) or page < 1:
            continue
        if cid in seen:
            continue
        seen.add(cid)
        out.append(c)
    return out


def lookup_evidence(store: JsonStore, evidence_id_value: str) -> dict | None:
    cid = chunk_id_from_evidence(evidence_id_value)
    chunk = store.get_chunk(cid)
    if not chunk:
        return None
    doc = store.get_document(chunk.document_id) or {}
    return {
        "id": evidence_id(chunk.id),
        "documentId": chunk.document_id,
        "documentTitle": doc.get("title") or chunk.document_id,
        "page": chunk.page,
        "section": chunk.section,
        "passage": chunk.text,
        "highlight": chunk.text[:80],
        "similarity": 0.0,
        "confidence": "MEDIUM",
        "chunkId": chunk.id,
    }
