from __future__ import annotations

import re
from pathlib import Path

from pypdf import PdfReader

from app.config import settings
from app.ingestion.chunking import PageText

_SAFE_NAME = re.compile(r"[^a-zA-Z0-9._-]+")


def safe_filename(name: str) -> str:
    base = Path(name).name
    cleaned = _SAFE_NAME.sub("_", base).strip("._") or "document"
    return cleaned[:180]


def extract_pages(path: Path, suffix: str) -> list[PageText]:
    suffix = suffix.lower()
    if suffix == ".pdf":
        return _pdf_pages(path)
    if suffix in {".txt", ".md"}:
        from app.ingestion.chunking import parse_marked_text

        return parse_marked_text(path.read_text(encoding="utf-8", errors="replace"))
    raise ValueError(f"unsupported type: {suffix}")


def _pdf_pages(path: Path) -> list[PageText]:
    try:
        reader = PdfReader(str(path))
    except Exception as exc:  # noqa: BLE001
        raise ValueError("PDF could not be read — file may be corrupted.") from exc
    if getattr(reader, "is_encrypted", False):
        try:
            reader.decrypt("")
        except Exception as exc:  # noqa: BLE001
            raise ValueError("Encrypted PDFs are not supported.") from exc
    pages: list[PageText] = []
    for i, page in enumerate(reader.pages, start=1):
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
        text = text.strip()
        if not text:
            continue
        heading = _first_heading(text)
        pages.append(PageText(page=i, section=heading, text=text))
    if not pages:
        raise ValueError("No extractable text in this PDF.")
    return pages


def _first_heading(text: str) -> str:
    line = text.splitlines()[0].strip() if text else ""
    line = re.sub(r"\s+", " ", line)
    return (line[:72] or "Body").strip()


def validate_upload(filename: str, size: int, data: bytes | None = None) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix not in settings.allowed_extensions:
        raise ValueError("Only PDF, Markdown, and plain text are accepted.")
    if size <= 0:
        raise ValueError("Empty file.")
    if size > settings.max_upload_bytes:
        raise ValueError("File exceeds the 15 MB local limit.")
    if data is not None:
        sniff_payload(suffix, data)
    return suffix


def sniff_payload(suffix: str, data: bytes) -> None:
    if not data.strip():
        raise ValueError("Empty file.")
    if suffix == ".pdf":
        if not data.lstrip().startswith(b"%PDF"):
            raise ValueError("File is not a valid PDF.")
        if data.startswith(b"MZ"):
            raise ValueError("File is not a valid PDF.")
    if suffix in {".txt", ".md"} and b"\x00" in data[:2048]:
        raise ValueError("Binary files are not accepted as text.")
