from __future__ import annotations

import re
from dataclasses import dataclass

from app.config import settings

_HEADING = re.compile(r"^(#{1,4}\s+).+", re.M)
_PAGE_MARK = re.compile(
    r"<!--\s*page:\s*(\d+)\s*(?:section:\s*([^>]*?))?\s*-->",
    re.I,
)


@dataclass
class PageText:
    page: int
    section: str
    text: str


@dataclass
class Chunk:
    id: str
    document_id: str
    page: int
    section: str
    text: str
    index: int


def parse_marked_text(raw: str) -> list[PageText]:
    """Split markdown/txt that uses <!-- page: N section: Name --> markers."""
    matches = list(_PAGE_MARK.finditer(raw))
    if not matches:
        return [PageText(page=1, section="Body", text=raw.strip())]
    pages: list[PageText] = []
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(raw)
        body = raw[m.end() : end].strip()
        section = (m.group(2) or "Body").strip() or "Body"
        pages.append(PageText(page=int(m.group(1)), section=section, text=body))
    return [p for p in pages if p.text]


def chunk_pages(
    document_id: str,
    pages: list[PageText],
    size: int | None = None,
    overlap: int | None = None,
) -> list[Chunk]:
    size = size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap
    chunks: list[Chunk] = []
    idx = 0
    for page in pages:
        parts = _split_text(page.text, size, overlap)
        for part in parts:
            cid = f"{document_id}:p{page.page}:c{idx}"
            chunks.append(
                Chunk(
                    id=cid,
                    document_id=document_id,
                    page=page.page,
                    section=page.section,
                    text=part,
                    index=idx,
                )
            )
            idx += 1
    return chunks


def _split_text(text: str, size: int, overlap: int) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    if len(text) <= size:
        return [text]
    out: list[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + size)
        if end < len(text):
            cut = text.rfind(" ", start + size // 2, end)
            if cut > start:
                end = cut
        piece = text[start:end].strip()
        if piece:
            out.append(piece)
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return out
