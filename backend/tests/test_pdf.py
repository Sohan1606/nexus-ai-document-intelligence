from pathlib import Path

from app.ingestion.extract import extract_pages
from app.ingestion.pdfutil import write_simple_pdf
from app.rag.pipeline import Pipeline


def test_pdf_extract_roundtrip(tmp_path: Path):
    raw = write_simple_pdf(
        ["The cobalt index freeze requires dual operators on retrieval keys."]
    )
    path = tmp_path / "cobalt.pdf"
    path.write_bytes(raw)
    pages = extract_pages(path, ".pdf")
    assert pages
    assert "cobalt" in pages[0].text.lower()
    assert "freeze" in pages[0].text.lower()


def test_corrupt_pdf_rejected(data_dir: Path):
    pipe = Pipeline(data_dir=data_dir)
    try:
        pipe.ingest_bytes("broken.pdf", b"%PDF-1.4 not a real pdf")
        raise AssertionError("corrupt PDF must not ingest")
    except ValueError:
        pass


def test_pdf_ingest_then_search(data_dir: Path):
    pipe = Pipeline(data_dir=data_dir)
    raw = write_simple_pdf(
        [
            "The cobalt index freeze requires dual operators on retrieval keys.",
            "Do not rebuild embeddings until forensic capture is complete.",
        ]
    )
    out = pipe.ingest_bytes("cobalt-index.pdf", raw)
    assert out["demo"] is False
    assert out["documentId"] == "cobalt-index"
    assert out["chunks"] >= 1
    hits = pipe.search("cobalt index freeze dual operators", mode="hybrid", top_k=5)
    assert hits
    assert hits[0]["documentId"] == "cobalt-index"
    assert hits[0]["chunkId"]
    assert hits[0]["page"] >= 1
