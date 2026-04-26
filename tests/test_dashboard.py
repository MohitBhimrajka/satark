# tests/test_dashboard.py
"""Tests for Satark dashboard endpoints."""
from tests.conftest import auth_header


def test_stats_analyst(client, analyst_token):
    """Analyst can access dashboard stats."""
    response = client.get(
        "/api/dashboard/stats", headers=auth_header(analyst_token)
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert "total_incidents" in data
    assert "by_status" in data


def test_stats_unauthorized(client):
    """Unauthenticated user cannot access stats."""
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 401


def test_chart_data(client, analyst_token):
    """Analyst can fetch chart data."""
    response = client.get(
        "/api/dashboard/charts/incidents_by_type",
        headers=auth_header(analyst_token),
    )
    assert response.status_code == 200
    assert response.json()["data"]["chart_type"] == "incidents_by_type"


def test_chart_invalid_type(client, analyst_token):
    """Invalid chart type returns 400."""
    response = client.get(
        "/api/dashboard/charts/invalid_chart",
        headers=auth_header(analyst_token),
    )
    assert response.status_code == 400
