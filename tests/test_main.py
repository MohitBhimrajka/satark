# tests/test_main.py
"""Tests for Satark API root endpoints."""


def test_health(client):
    """Health endpoint returns service name."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "satark-api"


def test_root(client):
    """Root endpoint returns service info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Satark API"
    assert data["version"] == "0.1.0"


def test_not_found_returns_error_envelope(client):
    """404s return the standard Satark error envelope."""
    response = client.get("/api/nonexistent")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_FOUND"
