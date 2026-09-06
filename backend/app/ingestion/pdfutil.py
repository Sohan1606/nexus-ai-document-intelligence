from __future__ import annotations

from pathlib import Path


def write_simple_pdf(pages: list[str]) -> bytes:
    """Build a minimal uncompressed PDF that pypdf can extract.

    Offsets are computed, not guessed. Used for tests and seed PDFs.
    """
    if not pages:
        raise ValueError("need at least one page")
    objects: list[bytes] = []

    def obj(n: int, body: str) -> bytes:
        return f"{n} 0 obj\n{body}\nendobj\n".encode("latin-1")

    n_pages = len(pages)
    catalog_id = 1
    pages_id = 2
    font_id = 3
    page_ids = list(range(4, 4 + n_pages))
    content_ids = list(range(4 + n_pages, 4 + 2 * n_pages))

    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    objects.append(obj(catalog_id, f"<< /Type /Catalog /Pages {pages_id} 0 R >>"))
    objects.append(
        obj(pages_id, f"<< /Type /Pages /Count {n_pages} /Kids [{kids}] >>")
    )
    objects.append(
        obj(font_id, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    )

    page_objs: list[bytes] = []
    content_objs: list[bytes] = []
    for i, text in enumerate(pages):
        pid = page_ids[i]
        cid = content_ids[i]
        stream = _content_stream(text)
        page_objs.append(
            obj(
                pid,
                f"<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 612 792] "
                f"/Contents {cid} 0 R /Resources << /Font << /F1 {font_id} 0 R >> >> >>",
            )
        )
        content_objs.append(
            f"{cid} 0 obj\n<< /Length {len(stream)} >>\nstream\n".encode("latin-1")
            + stream
            + b"\nendstream\nendobj\n"
        )

    parts = objects + page_objs + content_objs
    buf = b"%PDF-1.4\n"
    offsets = [0]
    for part in parts:
        offsets.append(len(buf))
        buf += part
    xref_pos = len(buf)
    count = 1 + len(parts)
    xref = [b"xref\n", f"0 {count}\n".encode("ascii"), b"0000000000 65535 f \n"]
    for off in offsets[1:]:
        xref.append(f"{off:010d} 00000 n \n".encode("ascii"))
    buf += b"".join(xref)
    buf += (
        f"trailer\n<< /Size {count} /Root {catalog_id} 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n"
    ).encode("ascii")
    return buf


def write_simple_pdf_file(path: Path, pages: list[str]) -> Path:
    path.write_bytes(write_simple_pdf(pages))
    return path


def _pdf_escape(text: str) -> str:
    cleaned = []
    for ch in text:
        o = ord(ch)
        if ch in "()\\":
            cleaned.append("\\" + ch)
        elif 32 <= o <= 126:
            cleaned.append(ch)
        elif ch in "\n\r\t":
            cleaned.append(" ")
        else:
            cleaned.append("?")
    return "".join(cleaned)


def _content_stream(text: str) -> bytes:
    lines = _wrap(text, 86)
    cmds = ["BT", "/F1 11 Tf", "56 740 Td"]
    for i, line in enumerate(lines[:48]):
        if i:
            cmds.append("0 -14 Td")
        cmds.append(f"({_pdf_escape(line)}) Tj")
    cmds.append("ET")
    return "\n".join(cmds).encode("latin-1")


def _wrap(text: str, width: int) -> list[str]:
    words = text.replace("\n", " ").split()
    lines: list[str] = []
    cur = ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if len(trial) <= width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]
