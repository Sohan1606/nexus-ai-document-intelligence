from fastapi.testclient import TestClient

from app.ingestion.pdfutil import write_simple_pdf


def test_health(client: TestClient):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["documents"] >= 1
    assert body["chunks"] >= 1
    assert "hash" in body["embedding"] or "sbert" in body["embedding"]
    assert body["llm"]["fallback"] == "extractive"


def test_search_and_ask_api(client: TestClient):
    s = client.post("/api/search", json={"query": "FAISS shards live on local NVMe", "mode": "hybrid"})
    assert s.status_code == 200
    hits = s.json()
    assert hits
    assert hits[0]["documentId"] == "k8s-ops"
    assert hits[0]["page"] == 41

    a = client.post("/api/ask", json={"query": "Where should FAISS shards live?"})
    assert a.status_code == 200
    result = a.json()
    assert result["demo"] is False
    assert result["citations"]
    pages = {(c["documentId"], c["page"]) for c in result["citations"]}
    assert ("k8s-ops", 41) in pages or any(c["documentId"] == "k8s-ops" for c in result["citations"])


def test_chat_alias(client: TestClient):
    a = client.post("/api/chat", json={"query": "FAISS shards live on local NVMe"})
    assert a.status_code == 200
    assert a.json()["citations"]


def test_upload_and_documents(client: TestClient):
    files = {
        "file": (
            "amber-protocol.md",
            b"<!-- page: 2 section: Protocol -->\nThe amber protocol requires dual control on index rebuilds.\n",
            "text/markdown",
        )
    }
    u = client.post("/api/documents/upload", files=files)
    assert u.status_code == 200
    body = u.json()
    assert body["ok"] is True
    assert body["demo"] is False
    assert body["documentId"] == "amber-protocol"

    d = client.get("/api/documents/amber-protocol")
    assert d.status_code == 200
    assert d.json()["pages"] >= 1

    bad = client.post(
        "/api/upload",
        files={"file": ("malware.exe", b"MZ", "application/octet-stream")},
    )
    assert bad.status_code == 400


def test_pdf_upload_then_search(client: TestClient):
    pdf = write_simple_pdf(["The indigo spool protocol is a retrieval drill for dual control."])
    u = client.post(
        "/api/documents/upload",
        files={"file": ("indigo-spool.pdf", pdf, "application/pdf")},
    )
    assert u.status_code == 200
    body = u.json()
    assert body["demo"] is False
    assert body["documentId"] == "indigo-spool"
    hits = client.post(
        "/api/search",
        json={"query": "indigo spool protocol retrieval drill", "mode": "hybrid"},
    )
    assert hits.status_code == 200
    assert hits.json()[0]["documentId"] == "indigo-spool"


def test_collections_and_history(client: TestClient):
    cols = client.get("/api/collections")
    assert cols.status_code == 200
    assert isinstance(cols.json(), list)
    created = client.post("/api/collections", json={"name": "Lab"})
    assert created.status_code == 200
    assert created.json()["name"] == "Lab"
    client.post("/api/search", json={"query": "zero trust cryptographic boundaries"})
    hist = client.get("/api/history")
    assert hist.status_code == 200
    assert any("zero trust" in (h.get("query") or "") for h in hist.json())
