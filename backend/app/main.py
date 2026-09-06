from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.config import settings
from app.rag.pipeline import Pipeline, sync_collections


def create_app(*, data_dir: Path | str | None = None, seed: bool = True) -> FastAPI:
    pipe = Pipeline(data_dir=Path(data_dir) if data_dir else None)
    if seed:
        pipe.seed_corpus()
        sync_collections(pipe.store)

    app = FastAPI(title="NEXUS local RAG", version="1.0.0")
    app.state.pipeline = pipe
    origins = [o for o in settings.cors_origins if o and o != "*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins or ["http://localhost:5173"],
        allow_origin_regex=r"https://.*\.e2b\.app",
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )
    app.include_router(router)

    @app.exception_handler(HTTPException)
    async def http_error(_request: Request, exc: HTTPException) -> JSONResponse:
        detail = exc.detail
        if not isinstance(detail, str):
            detail = "Request failed"
        return JSONResponse({"error": detail, "code": str(exc.status_code)}, status_code=exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_error(_request: Request, _exc: RequestValidationError) -> JSONResponse:
        return JSONResponse({"error": "Invalid request", "code": "422"}, status_code=422)

    @app.exception_handler(Exception)
    async def unhandled(_request: Request, _exc: Exception) -> JSONResponse:
        return JSONResponse({"error": "Internal error", "code": "internal"}, status_code=500)

    return app


app = create_app(seed=os.environ.get("PYTEST_VERSION") is None)
