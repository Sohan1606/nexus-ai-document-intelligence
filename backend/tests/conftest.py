from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.rag.pipeline import Pipeline


@pytest.fixture()
def data_dir(tmp_path: Path) -> Path:
    d = tmp_path / "data"
    d.mkdir()
    return d


@pytest.fixture()
def pipeline(data_dir: Path) -> Pipeline:
    pipe = Pipeline(data_dir=data_dir)
    pipe.seed_corpus()
    return pipe


@pytest.fixture()
def client(data_dir: Path) -> TestClient:
    app = create_app(data_dir=data_dir, seed=True)
    return TestClient(app)
