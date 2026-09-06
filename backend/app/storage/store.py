from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.config import settings
from app.ingestion.chunking import Chunk


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class JsonStore:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path or settings.store_path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self._write(
                {
                    "documents": {},
                    "chunks": {},
                    "collections": {},
                    "saved": [],
                    "history": [],
                }
            )

    def _read(self) -> dict[str, Any]:
        return json.loads(self.path.read_text(encoding="utf-8"))

    def _write(self, data: dict[str, Any]) -> None:
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps(data, indent=2), encoding="utf-8")
        tmp.replace(self.path)

    def documents(self) -> list[dict[str, Any]]:
        docs = list(self._read()["documents"].values())
        docs.sort(key=lambda d: d.get("updated_at") or "", reverse=True)
        return docs

    def get_document(self, doc_id: str) -> dict[str, Any] | None:
        return self._read()["documents"].get(doc_id)

    def upsert_document(self, doc: dict[str, Any]) -> dict[str, Any]:
        data = self._read()
        data["documents"][doc["id"]] = doc
        self._write(data)
        return doc

    def delete_document(self, doc_id: str) -> None:
        data = self._read()
        data["documents"].pop(doc_id, None)
        drop = [cid for cid, c in data["chunks"].items() if c["document_id"] == doc_id]
        for cid in drop:
            data["chunks"].pop(cid, None)
        self._write(data)

    def put_chunks(self, chunks: list[Chunk]) -> None:
        data = self._read()
        for c in chunks:
            data["chunks"][c.id] = {
                "id": c.id,
                "document_id": c.document_id,
                "page": c.page,
                "section": c.section,
                "text": c.text,
                "index": c.index,
            }
        self._write(data)

    def get_chunk(self, chunk_id: str) -> Chunk | None:
        raw = self._read()["chunks"].get(chunk_id)
        if not raw:
            return None
        return Chunk(**raw)

    def all_chunks(self) -> list[Chunk]:
        return [Chunk(**c) for c in self._read()["chunks"].values()]

    def chunks_for(self, doc_id: str) -> list[Chunk]:
        return [c for c in self.all_chunks() if c.document_id == doc_id]

    def collections(self) -> list[dict[str, Any]]:
        return list(self._read()["collections"].values())

    def put_collection(self, col: dict[str, Any]) -> dict[str, Any]:
        data = self._read()
        data["collections"][col["id"]] = col
        self._write(data)
        return col

    def save_answer(self, item: dict[str, Any]) -> dict[str, Any]:
        data = self._read()
        data["saved"].insert(0, item)
        self._write(data)
        return item

    def saved(self) -> list[dict[str, Any]]:
        return list(self._read()["saved"])

    def record_search(self, query: str) -> None:
        data = self._read()
        data["history"] = [h for h in data["history"] if h.get("query") != query]
        data["history"].insert(0, {"query": query, "at": _now()})
        data["history"] = data["history"][:40]
        self._write(data)

    def history(self) -> list[dict[str, Any]]:
        return list(self._read()["history"])
