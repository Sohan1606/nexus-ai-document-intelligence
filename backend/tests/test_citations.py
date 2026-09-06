from fastapi.testclient import TestClient

from app.citations.map import chunk_id_from_evidence, evidence_id


def test_evidence_id_roundtrip():
    assert evidence_id("doc:p1:c0") == "ev-doc:p1:c0"
    assert chunk_id_from_evidence("ev-doc:p1:c0") == "doc:p1:c0"


def test_ask_citations_map_to_evidence_endpoint(client: TestClient):
    a = client.post("/api/chat", json={"query": "Where should FAISS shards live?"})
    assert a.status_code == 200
    result = a.json()
    assert result["demo"] is False
    assert result["citations"]
    cite = result["citations"][0]
    assert cite["documentId"]
    assert cite["page"] >= 1
    assert cite["passage"]
    assert cite["id"].startswith("ev-")
    ev = client.get(f"/api/evidence/{cite['id']}")
    assert ev.status_code == 200
    body = ev.json()
    assert body["documentId"] == cite["documentId"]
    assert body["page"] == cite["page"]
