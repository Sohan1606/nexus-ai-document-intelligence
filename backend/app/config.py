from __future__ import annotations

import os
from pathlib import Path


def _load_dotenv() -> None:
    """Load backend/.env if python-dotenv is installed. Existing env vars win."""
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    path = Path(__file__).resolve().parent.parent / ".env"
    if path.is_file():
        load_dotenv(path, override=False)


_load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.data_dir = Path(os.environ.get("NEXUS_DATA_DIR", Path(__file__).resolve().parent.parent / "data"))
        self.corpus_dir = Path(os.environ.get("NEXUS_CORPUS_DIR", Path(__file__).resolve().parent.parent / "corpus"))
        self.max_upload_bytes = int(os.environ.get("NEXUS_MAX_UPLOAD_BYTES", str(15 * 1024 * 1024)))
        self.allowed_extensions = {".pdf", ".txt", ".md"}
        self.chunk_size = int(os.environ.get("NEXUS_CHUNK_SIZE", "700"))
        self.chunk_overlap = int(os.environ.get("NEXUS_CHUNK_OVERLAP", "120"))
        self.top_k = int(os.environ.get("NEXUS_TOP_K", "8"))
        self.rerank_enabled = os.environ.get("NEXUS_RERANK", "lexical").lower() not in {"0", "false", "off", "none"}
        self.rerank_kind = os.environ.get("NEXUS_RERANK", "lexical")
        self.embedding_provider = os.environ.get("NEXUS_EMBEDDING_PROVIDER", "hash")
        self.embedding_model = os.environ.get("NEXUS_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        self.embedding_dim = int(os.environ.get("NEXUS_EMBEDDING_DIM", "384"))
        self.min_evidence_score = float(os.environ.get("NEXUS_MIN_EVIDENCE_SCORE", "0.08"))
        self.ollama_base_url = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
        self.ollama_model = os.environ.get("OLLAMA_MODEL", "llama3.2")
        self.cors_origins = [
            o.strip()
            for o in os.environ.get(
                "NEXUS_CORS_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080",
            ).split(",")
            if o.strip()
        ]

    @property
    def uploads_dir(self) -> Path:
        return self.data_dir / "uploads"

    @property
    def store_path(self) -> Path:
        return self.data_dir / "store.json"

    @property
    def docs_path(self) -> Path:
        return self.data_dir / "documents.json"

    @property
    def chunks_path(self) -> Path:
        return self.data_dir / "chunks.json"

    @property
    def faiss_path(self) -> Path:
        return self.data_dir / "index.faiss"

    @property
    def idmap_path(self) -> Path:
        return self.data_dir / "idmap.json"

    @property
    def embed_meta_path(self) -> Path:
        return self.data_dir / "embed_meta.json"


settings = Settings()
