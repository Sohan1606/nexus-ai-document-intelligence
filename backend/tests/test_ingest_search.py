from pathlib import Path

from app.rag.chunking import PageText, chunk_pages
from app.rag.pipeline import Pipeline
from app.rag.rerank import Reranker


def test_seed_and_search_known_phrase(pipeline: Pipeline):
    hits = pipeline.search("Cloud infrastructure expenditure increased 18%", mode="hybrid", top_k=5)
    assert hits
    assert hits[0]["documentId"] == "q3-infra"
    assert hits[0]["page"] == 17


def test_keyword_mode_finds_vpn_policy(pipeline: Pipeline):
    hits = pipeline.search("Corporate VPN is required for all remote access", mode="keyword", top_k=5)
    ids = [h["documentId"] for h in hits]
    assert "policy-2024" in ids


def test_ask_returns_real_citations(pipeline: Pipeline):
    result = pipeline.ask("Why did cloud infrastructure expenditure increase 18% quarter over quarter?")
    assert result["demo"] is False
    assert result["citations"]
    assert result["trace"]["chunksSearched"] > 0
    cite = result["citations"][0]
    assert cite["documentId"]
    assert cite["page"] >= 1
    assert cite["passage"]
    assert "18%" in result["answer"] or "18%" in cite["passage"]


def test_upload_markdown_then_ask(data_dir: Path):
    pipe = Pipeline(data_dir=data_dir)
    body = b"""<!-- page: 1 section: Runbook -->
The crimson lantern failover runbook requires two operators and a 15-minute freeze of retrieval keys.
"""
    out = pipe.ingest_bytes("crimson-lantern.md", body)
    assert out["demo"] is False
    assert out["chunks"] >= 1
    hits = pipe.search("crimson lantern failover runbook", mode="hybrid", top_k=3)
    assert hits[0]["documentId"] == "crimson-lantern"


def test_rejects_bad_extension(data_dir: Path):
    pipe = Pipeline(data_dir=data_dir)
    try:
        pipe.ingest_bytes("notes.exe", b"not a document")
        raise AssertionError("should have failed")
    except ValueError as exc:
        assert "PDF" in str(exc) or "accepted" in str(exc)


def test_rejects_empty(data_dir: Path):
    pipe = Pipeline(data_dir=data_dir)
    try:
        pipe.ingest_bytes("empty.txt", b"")
        raise AssertionError("should have failed")
    except ValueError:
        pass


def test_path_traversal_filename_stays_in_uploads(data_dir: Path):
    pipe = Pipeline(data_dir=data_dir)
    pipe.ingest_bytes("../../etc/passwd.md", b"<!-- page: 1 section: X -->\nsafe text about widgets\n")
    uploads = list((data_dir / "uploads").glob("*"))
    assert uploads
    assert all(".." not in p.name for p in uploads)
    assert all(p.parent == data_dir / "uploads" for p in uploads)


def test_rerank_can_reorder():
    from app.rag.chunking import Chunk

    chunks = [
        Chunk(id="a", document_id="d", page=1, section="A", text="unrelated cloud billing tables", index=0),
        Chunk(
            id="b",
            document_id="d",
            page=2,
            section="B",
            text="crimson lantern failover runbook requires two operators",
            index=1,
        ),
    ]
    items = [(chunks[0], 0.55), (chunks[1], 0.50)]
    reranked = Reranker("lexical").rerank("crimson lantern failover", items, keep=2)
    assert [c.id for c, _ in items] == ["a", "b"]
    assert reranked[0][0].id == "b"


def test_page_aware_chunk_ids():
    pages = [PageText(1, "A", "one"), PageText(2, "B", "two")]
    chunks = chunk_pages("doc", pages, size=50, overlap=0)
    assert chunks[0].id.startswith("doc:p1:")
    assert chunks[1].page == 2
