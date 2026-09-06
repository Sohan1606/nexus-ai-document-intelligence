from pathlib import Path

from app.rag.pipeline import Pipeline


def test_faiss_reload_after_restart(data_dir: Path):
    first = Pipeline(data_dir=data_dir)
    first.ingest_bytes(
        "persist-note.md",
        b"<!-- page: 1 section: Note -->\nThe violet spool checksum is unique to this note.\n",
    )
    hits = first.search("violet spool checksum", mode="hybrid", top_k=3)
    assert hits
    assert hits[0]["documentId"] == "persist-note"

    second = Pipeline(data_dir=data_dir)
    assert len(second.index) >= 1
    again = second.search("violet spool checksum", mode="hybrid", top_k=3)
    assert again
    assert again[0]["documentId"] == "persist-note"


def test_index_file_written(data_dir: Path):
    pipe = Pipeline(data_dir=data_dir)
    pipe.ingest_bytes("x.md", b"<!-- page: 1 section: A -->\nalpha beta gamma token soup\n")
    faiss_path = data_dir / "index.faiss"
    idmap = data_dir / "idmap.json"
    assert idmap.exists()
    assert faiss_path.exists() or (data_dir / "index.npy").exists()
