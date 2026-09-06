from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    ok: bool
    service: str = "nexus-rag"
    documents: int
    chunks: int
    embedding: str
    rerank: str
    llm: dict[str, Any]


class Passage(BaseModel):
    id: str
    page: int
    section: str
    text: str


class DocumentRecord(BaseModel):
    id: str
    title: str
    type: Literal["pdf", "md", "txt", "docx"]
    date: str
    created: str
    modified: str
    year: int
    pages: int
    chunks: int
    sizeBytes: int
    topics: list[str]
    collection: str
    collectionId: str
    summary: str
    status: Literal["ready", "indexing", "processing", "attention"]
    health: int
    sections: list[str]
    passages: list[Passage]


class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    mode: Literal["semantic", "keyword", "hybrid"] = "semantic"
    collectionId: str | None = None
    type: str | None = None
    year: int | None = None
    topK: int | None = None


class SearchHit(BaseModel):
    documentId: str
    title: str
    page: int
    section: str
    relevance: float
    concept: str
    snippet: str
    type: str
    collection: str
    mode: str
    chunkId: str | None = None


class ChatRequest(BaseModel):
    query: str = Field(min_length=1, max_length=4000)
    mode: Literal["semantic", "keyword", "hybrid"] = "hybrid"


class Evidence(BaseModel):
    id: str
    documentId: str
    documentTitle: str
    page: int
    section: str
    passage: str
    highlight: str
    similarity: float
    confidence: Literal["HIGH", "MEDIUM", "LOW"]
    prevPassage: str | None = None
    nextPassage: str | None = None


class RetrievalStage(BaseModel):
    id: str
    label: str
    detail: str


class RetrievalTrace(BaseModel):
    chunksSearched: int
    candidates: int
    retained: int
    documentsUsed: int
    demo: bool = False
    reranked: bool = False
    llm: Literal["ollama", "extractive", "none"] = "extractive"


class AskResult(BaseModel):
    id: str
    question: str
    answer: str
    bullets: list[str] | None = None
    citations: list[Evidence]
    stages: list[RetrievalStage]
    relatedDocumentIds: list[str] | None = None
    trace: RetrievalTrace
    comparison: bool | None = None
    demo: bool = False
    llmAvailable: bool = False


class Collection(BaseModel):
    id: str
    name: str
    description: str
    documentIds: list[str]


class CollectionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str = ""
    documentIds: list[str] = Field(default_factory=list)


class PageResponse(BaseModel):
    documentId: str
    page: int
    text: str
    chunks: list[Passage]


class UploadResponse(BaseModel):
    ok: bool = True
    documentId: str
    name: str
    type: str
    sizeBytes: int
    estimatedPages: int
    chunks: int
    sections: int
    demo: bool = False


class ErrorResponse(BaseModel):
    error: str
    code: str
