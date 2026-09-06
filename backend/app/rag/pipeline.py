from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

from app.citations.map import citation_dict, only_real_citations
from app.config import settings
from app.embeddings.provider import get_embedder
from app.generation.llm import LLMProvider, NO_EVIDENCE, extractive_answer, strip_invalid_citation_marks
from app.ingestion.chunking import Chunk, chunk_pages
from app.ingestion.extract import extract_pages, safe_filename, validate_upload
from app.retrieval.faiss_index import VectorIndex
from app.retrieval.rerank import Reranker
from app.storage.store import JsonStore

_WORD = re.compile(r"[a-z0-9]{3,}", re.I)
_STOP = {
    "the",
    "and",
    "for",
    "are",
    "was",
    "who",
    "how",
    "did",
    "what",
    "why",
    "where",
    "when",
    "this",
    "that",
    "with",
    "from",
    "into",
    "should",
    "must",
    "not",
    "any",
    "all",
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Pipeline:
    def __init__(self, data_dir: Path | None = None) -> None:
        if data_dir is not None:
            settings.data_dir = Path(data_dir)
        settings.data_dir.mkdir(parents=True, exist_ok=True)
        settings.uploads_dir.mkdir(parents=True, exist_ok=True)
        self.store = JsonStore()
        self.embedder = get_embedder()
        self.index = VectorIndex(self.embedder.dim)
        self.reranker = Reranker()
        self.llm = LLMProvider()
        loaded = self.index.load()
        if not loaded or not self._embed_meta_matches():
            self.rebuild_index()

    def rebuild_index(self) -> None:
        chunks = self.store.all_chunks()
        if not chunks:
            self.index.rebuild([], np.zeros((0, self.embedder.dim), dtype=np.float32))
            self._write_embed_meta()
            return
        vecs = self.embedder.embed_texts([c.text for c in chunks])
        self.index.rebuild([c.id for c in chunks], vecs)
        self._write_embed_meta()

    def _embed_meta_matches(self) -> bool:
        path = settings.embed_meta_path
        if not path.exists():
            return len(self.index) == 0
        try:
            meta = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return False
        return (
            int(meta.get("dim") or -1) == int(self.embedder.dim)
            and str(meta.get("name") or "") == str(self.embedder.name)
        )

    def _write_embed_meta(self) -> None:
        settings.embed_meta_path.write_text(
            json.dumps(
                {
                    "name": self.embedder.name,
                    "dim": self.embedder.dim,
                    "provider": settings.embedding_provider,
                }
            ),
            encoding="utf-8",
        )

    def health(self) -> dict:
        llm_ok = self.llm.available()
        return {
            "ok": True,
            "service": "nexus-rag",
            "documents": len(self.store.documents()),
            "chunks": len(self.index),
            "embedding": self.embedder.name,
            "embeddingDim": self.embedder.dim,
            "rerank": self.reranker.kind if self.reranker.enabled else "off",
            "llm": {
                "provider": "ollama",
                "available": llm_ok,
                "model": self.llm.model,
                "fallback": "extractive",
            },
        }

    def ingest_bytes(
        self,
        filename: str,
        data: bytes,
        collection: str = "Uploads",
        collection_id: str = "uploads",
        doc_id: str | None = None,
        topics: list[str] | None = None,
        extra: dict | None = None,
    ) -> dict:
        suffix = validate_upload(filename, len(data), data)
        name = safe_filename(filename)
        dest_dir = settings.uploads_dir
        dest_dir.mkdir(parents=True, exist_ok=True)
        stored = f"{uuid.uuid4().hex}{suffix}"
        dest = dest_dir / stored
        dest.write_bytes(data)
        try:
            pages = extract_pages(dest, suffix)
        except ValueError:
            dest.unlink(missing_ok=True)
            raise
        stem = Path(name).stem.lower().replace(" ", "-")[:64]
        stem = re.sub(r"[^a-z0-9-]+", "-", stem).strip("-")
        doc_id = doc_id or stem or f"doc-{uuid.uuid4().hex[:12]}"
        existing = self.store.get_document(doc_id)
        if existing:
            self.store.delete_document(doc_id)
            self.rebuild_index()
        chunks = chunk_pages(doc_id, pages)
        vecs = self.embedder.embed_texts([c.text for c in chunks])
        self.index.add([c.id for c in chunks], vecs)
        self.index.save()
        self._write_embed_meta()
        self.store.put_chunks(chunks)
        now = _now()
        sections = list(dict.fromkeys(p.section for p in pages))
        passages = [
            {
                "id": c.id,
                "page": c.page,
                "section": c.section,
                "text": c.text[:1200],
            }
            for c in chunks
        ]
        summary = chunks[0].text[:280] if chunks else ""
        title = Path(filename).stem.replace("_", " ").replace("-", " ").title()
        doc = {
            "id": doc_id,
            "title": title,
            "type": suffix.lstrip("."),
            "date": now.date().isoformat(),
            "created": now.isoformat(),
            "modified": now.isoformat(),
            "updated_at": now.isoformat(),
            "year": now.year,
            "pages": max((p.page for p in pages), default=1),
            "chunks": len(chunks),
            "sizeBytes": len(data),
            "topics": topics or ["uploaded"],
            "collection": collection,
            "collectionId": collection_id,
            "summary": summary,
            "status": "ready",
            "health": 92,
            "sections": sections,
            "passages": passages,
        }
        if extra:
            for key in ("title", "year", "date", "topics", "collection", "collectionId", "summary"):
                if key in extra and extra[key] is not None:
                    doc[key] = extra[key]
            if extra.get("date"):
                doc["created"] = extra["date"]
                doc["modified"] = extra["date"]
        self.store.upsert_document(doc)
        return {
            "ok": True,
            "documentId": doc_id,
            "name": filename,
            "type": doc["type"],
            "sizeBytes": len(data),
            "estimatedPages": doc["pages"],
            "chunks": len(chunks),
            "sections": len(sections),
            "demo": False,
        }

    def seed_corpus(self) -> int:
        corpus = settings.corpus_dir
        if not corpus.exists():
            return 0
        n = 0
        for path in sorted(corpus.iterdir()):
            if path.suffix.lower() not in settings.allowed_extensions:
                continue
            if self.store.get_document(path.stem):
                continue
            meta = _seed_meta(path.stem)
            self.ingest_bytes(
                path.name,
                path.read_bytes(),
                collection=meta["collection"],
                collection_id=meta["collectionId"],
                doc_id=path.stem,
                topics=meta["topics"],
                extra=meta,
            )
            n += 1
        sync_collections(self.store)
        return n

    def search(
        self,
        query: str,
        mode: str = "semantic",
        collection_id: str | None = None,
        doc_type: str | None = None,
        year: int | None = None,
        top_k: int | None = None,
    ) -> list[dict]:
        k = top_k or settings.top_k
        ranked = self._retrieve(query, mode=mode, k=max(k * 3, 12))
        hits: list[dict] = []
        seen: set[str] = set()
        for chunk, score in ranked:
            doc = self.store.get_document(chunk.document_id)
            if not doc:
                continue
            if collection_id and doc.get("collectionId") != collection_id:
                continue
            if doc_type and doc_type not in {"all", None} and doc.get("type") != doc_type:
                continue
            if year and int(doc.get("year") or 0) != int(year):
                continue
            key = f"{chunk.document_id}:{chunk.page}"
            if key in seen:
                continue
            seen.add(key)
            hits.append(
                {
                    "documentId": chunk.document_id,
                    "title": doc["title"],
                    "page": chunk.page,
                    "section": chunk.section,
                    "relevance": round(max(0.0, min(1.0, score)), 4),
                    "concept": (doc.get("topics") or ["related"])[0],
                    "snippet": chunk.text[:180],
                    "type": doc["type"],
                    "collection": doc["collection"],
                    "mode": mode,
                    "chunkId": chunk.id,
                }
            )
            if len(hits) >= k:
                break
        return hits

    def ask(self, query: str) -> dict:
        stages = [
            {"id": "understand", "label": "Understand", "detail": "Parse question and retrieval mode."},
            {"id": "search", "label": "Search", "detail": "Embed query with the local vectorizer."},
            {"id": "retrieve", "label": "Retrieve", "detail": "FAISS inner-product over stored chunks."},
            {"id": "rerank", "label": "Rerank", "detail": "Lexical overlap mixed with similarity."},
            {"id": "context", "label": "Context", "detail": "Assemble page-aware evidence window."},
            {"id": "generate", "label": "Generate", "detail": "Ollama if present, else extractive reading."},
            {"id": "cite", "label": "Cite", "detail": "Map claims to document, page, and passage."},
        ]
        candidates = self._retrieve(query, mode="hybrid", k=16)
        floor = settings.min_evidence_score
        reranked = [
            pair for pair in self.reranker.rerank(query, candidates, keep=6) if pair[1] >= floor
        ]
        if str(self.embedder.name).startswith("hash"):
            reranked = [pair for pair in reranked if _token_overlap(query, pair[0].text)]
        evidence_pairs: list[tuple[int, Chunk]] = []
        citations: list[dict] = []
        related: list[str] = []
        for i, (chunk, score) in enumerate(reranked, start=1):
            doc = self.store.get_document(chunk.document_id)
            if not doc:
                continue
            evidence_pairs.append((i, chunk))
            if chunk.document_id not in related:
                related.append(chunk.document_id)
            neighbors = self.store.chunks_for(chunk.document_id)
            prev_t = next_t = None
            for n in neighbors:
                if n.index == chunk.index - 1:
                    prev_t = n.text[:240]
                if n.index == chunk.index + 1:
                    next_t = n.text[:240]
            citations.append(
                citation_dict(
                    chunk,
                    score,
                    doc["title"],
                    query,
                    prev_t,
                    next_t,
                    _confidence(score),
                )
            )
        citations = only_real_citations(citations)
        evidence_pairs = evidence_pairs[: len(citations)]

        llm_ok = self.llm.available()
        if not citations:
            answer = NO_EVIDENCE
            used = "none"
        else:
            answer = None
            used = "extractive"
            if llm_ok:
                answer = self.llm.generate(query, evidence_pairs)
                if answer:
                    used = "ollama"
            if not answer:
                answer = extractive_answer(query, evidence_pairs)
            answer = strip_invalid_citation_marks(answer, set(range(1, len(citations) + 1)))

        return {
            "id": f"ask-{uuid.uuid4().hex[:10]}",
            "question": query,
            "answer": answer,
            "bullets": None,
            "citations": citations,
            "stages": stages,
            "relatedDocumentIds": related,
            "trace": {
                "chunksSearched": len(self.index),
                "candidates": len(candidates),
                "retained": len(citations),
                "documentsUsed": len(related),
                "demo": False,
                "reranked": self.reranker.enabled,
                "llm": used,
            },
            "comparison": "compar" in query.lower(),
            "demo": False,
            "llmAvailable": llm_ok,
        }

    def page(self, document_id: str, page: int) -> dict | None:
        doc = self.store.get_document(document_id)
        if not doc:
            return None
        chunks = [c for c in self.store.chunks_for(document_id) if c.page == page]
        text = "\n\n".join(c.text for c in chunks)
        return {
            "documentId": document_id,
            "page": page,
            "text": text,
            "chunks": [
                {"id": c.id, "page": c.page, "section": c.section, "text": c.text}
                for c in chunks
            ],
        }

    def _retrieve(self, query: str, mode: str, k: int) -> list[tuple[Chunk, float]]:
        qvec = self.embedder.embed_text(query)
        dense = self.index.search(qvec, k=max(k, 8))
        lexical = self._lexical(query, k=max(k, 8)) if mode in {"keyword", "hybrid"} else []
        merged: dict[str, float] = {}
        for cid, score in dense:
            merged[cid] = score if mode != "keyword" else score * 0.15
        for cid, score in lexical:
            if mode == "keyword":
                merged[cid] = max(merged.get(cid, 0.0), score)
            elif mode == "hybrid":
                merged[cid] = merged.get(cid, 0.0) * 0.7 + score * 0.3
            else:
                merged[cid] = merged.get(cid, 0.0)
        ranked = sorted(merged.items(), key=lambda x: x[1], reverse=True)[:k]
        out: list[tuple[Chunk, float]] = []
        for cid, score in ranked:
            chunk = self.store.get_chunk(cid)
            if chunk:
                out.append((chunk, float(score)))
        return out

    def _lexical(self, query: str, k: int) -> list[tuple[str, float]]:
        q = set(_WORD.findall(query.lower()))
        if not q:
            return []
        scored: list[tuple[str, float]] = []
        for chunk in self.store.all_chunks():
            toks = set(_WORD.findall(chunk.text.lower()))
            if not toks:
                continue
            inter = len(q & toks)
            if not inter:
                continue
            j = inter / len(q | toks)
            scored.append((chunk.id, j))
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:k]


def _token_overlap(query: str, text: str) -> bool:
    toks = [t for t in _WORD.findall(query.lower()) if t not in _STOP]
    q = {t for t in toks if len(t) >= 4} or set(toks)
    if not q:
        return True
    hay = set(_WORD.findall(text.lower()))
    return bool(q & hay)


def _confidence(score: float) -> str:
    if score >= 0.55:
        return "HIGH"
    if score >= 0.32:
        return "MEDIUM"
    return "LOW"


def _seed_meta(stem: str) -> dict:
    table = {
        "q3-infra": {
            "title": "Q3 Infrastructure Review",
            "collection": "Infrastructure",
            "collectionId": "infra",
            "topics": ["Infrastructure", "Cost", "Cloud", "Scaling"],
            "year": 2025,
            "date": "2025-09-12",
        },
        "cloud-sec": {
            "title": "Cloud Security Architecture",
            "collection": "Architecture",
            "collectionId": "arch",
            "topics": ["Security", "Cloud", "Compliance", "Identity"],
            "year": 2025,
            "date": "2025-06-03",
        },
        "migration": {
            "title": "Platform Migration Strategy",
            "collection": "Architecture",
            "collectionId": "arch",
            "topics": ["Infrastructure", "Deployment", "Kubernetes", "Cost"],
            "year": 2025,
            "date": "2025-03-18",
        },
        "incident": {
            "title": "Incident Response Playbook",
            "collection": "Operations",
            "collectionId": "ops",
            "topics": ["Security", "Reliability", "Compliance"],
            "year": 2024,
            "date": "2024-11-22",
        },
        "reliability": {
            "title": "Engineering Reliability Report",
            "collection": "Infrastructure",
            "collectionId": "infra",
            "topics": ["Reliability", "Scaling", "Infrastructure"],
            "year": 2025,
            "date": "2025-08-01",
        },
        "devops-cost": {
            "title": "DevOps Cost Optimization Report",
            "collection": "Finance",
            "collectionId": "finance",
            "topics": ["Cost", "Cloud", "Infrastructure", "Deployment"],
            "year": 2025,
            "date": "2025-07-15",
        },
        "finops": {
            "title": "Platform FinOps Review",
            "collection": "Finance",
            "collectionId": "finance",
            "topics": ["Cost", "Cloud", "Infrastructure"],
            "year": 2025,
            "date": "2025-10-02",
        },
        "zero-trust": {
            "title": "Zero Trust Architecture Notes",
            "collection": "Architecture",
            "collectionId": "arch",
            "topics": ["Security", "Identity", "Zero Trust"],
            "year": 2025,
            "date": "2025-01-09",
        },
        "k8s-ops": {
            "title": "Kubernetes Operations Guide",
            "collection": "Infrastructure",
            "collectionId": "infra",
            "topics": ["Kubernetes", "Deployment", "Scaling", "Infrastructure"],
            "year": 2024,
            "date": "2024-12-04",
        },
        "policy-2024": {
            "title": "Security Policy 2024",
            "collection": "Security",
            "collectionId": "security",
            "topics": ["Security", "Compliance"],
            "year": 2024,
            "date": "2024-01-15",
        },
        "policy-2025": {
            "title": "Security Policy 2025",
            "collection": "Security",
            "collectionId": "security",
            "topics": ["Security", "Compliance", "Zero Trust", "Identity"],
            "year": 2025,
            "date": "2025-01-08",
        },
        "dr-plan": {
            "title": "Disaster Recovery Strategy",
            "collection": "Operations",
            "collectionId": "ops",
            "topics": ["Reliability", "Infrastructure", "Compliance"],
            "year": 2024,
            "date": "2024-08-19",
        },
        "soc2-notes": {
            "title": "Assurance Readiness Notes",
            "collection": "Security",
            "collectionId": "security",
            "topics": ["Compliance", "Security"],
            "year": 2025,
            "date": "2025-04-02",
        },
    }
    return table.get(
        stem,
        {"collection": "Library", "collectionId": "library", "topics": ["corpus"]},
    )

def sync_collections(store: JsonStore) -> None:
    grouped: dict[str, dict] = {}
    for d in store.documents():
        cid = d.get("collectionId") or "library"
        grouped.setdefault(
            cid,
            {
                "id": cid,
                "name": d.get("collection") or cid,
                "description": "Local collection from indexed documents.",
                "documentIds": [],
            },
        )
        grouped[cid]["documentIds"].append(d["id"])
    for col in grouped.values():
        store.put_collection(col)
