from __future__ import annotations

import uuid

from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from app.citations.map import lookup_evidence
from app.models.schemas import ChatRequest, CollectionCreate, SearchRequest
from app.rag.pipeline import Pipeline, sync_collections

router = APIRouter()


def pipe(request: Request) -> Pipeline:
    return request.app.state.pipeline


@router.get("/health")
def health(request: Request):
    return pipe(request).health()


@router.get("/api/health")
def api_health(request: Request):
    return pipe(request).health()


@router.get("/api/documents")
def list_documents(request: Request):
    return pipe(request).store.documents()


@router.get("/api/documents/{doc_id}")
def get_document(doc_id: str, request: Request):
    doc = pipe(request).store.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/api/documents/{doc_id}/pages/{page}")
def get_page(doc_id: str, page: int, request: Request):
    rec = pipe(request).page(doc_id, page)
    if rec is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return rec


@router.post("/api/search")
def search(body: SearchRequest, request: Request):
    p = pipe(request)
    p.store.record_search(body.query)
    return p.search(
        body.query,
        mode=body.mode,
        collection_id=body.collectionId,
        doc_type=body.type,
        year=body.year,
        top_k=body.topK,
    )


@router.post("/api/ask")
def ask(body: ChatRequest, request: Request):
    p = pipe(request)
    p.store.record_search(body.query)
    return p.ask(body.query)


@router.post("/api/chat")
def chat(body: ChatRequest, request: Request):
    return ask(body, request)


async def ingest_upload(file: UploadFile, request: Request):
    p = pipe(request)
    name = file.filename or "upload.bin"
    data = await file.read()
    try:
        result = p.ingest_bytes(name, data)
        sync_collections(p.store)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/api/upload")
async def upload(request: Request, file: UploadFile = File(...)):
    return await ingest_upload(file, request)


@router.post("/api/documents/upload")
async def upload_document(request: Request, file: UploadFile = File(...)):
    return await ingest_upload(file, request)


@router.get("/api/collections")
def collections(request: Request):
    p = pipe(request)
    cols = p.store.collections()
    if not cols:
        sync_collections(p.store)
        cols = p.store.collections()
    return cols


@router.post("/api/collections")
def create_collection(body: CollectionCreate, request: Request):
    col = {
        "id": f"col-{uuid.uuid4().hex[:8]}",
        "name": body.name,
        "description": body.description or "Local collection",
        "documentIds": body.documentIds,
    }
    return pipe(request).store.put_collection(col)


@router.get("/api/saved")
def saved(request: Request):
    return pipe(request).store.saved()


@router.post("/api/saved")
def save_answer(item: dict, request: Request):
    return pipe(request).store.save_answer(item)


@router.get("/api/history")
def history(request: Request):
    return pipe(request).store.history()


@router.post("/api/history")
def record(body: dict, request: Request):
    q = str(body.get("query") or "").strip()
    if q:
        pipe(request).store.record_search(q)
    return {"ok": True}


@router.get("/api/evidence/{evidence_id}")
def evidence(evidence_id: str, request: Request):
    rec = lookup_evidence(pipe(request).store, evidence_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return rec
