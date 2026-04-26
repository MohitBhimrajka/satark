# tests/conftest.py
"""
Satark Test Infrastructure — shared fixtures.
Full async DB fixtures and mocked AI client will be added in Phase 2.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    """Synchronous test client for the Satark API."""
    with TestClient(app) as c:
        yield c
