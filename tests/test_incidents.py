# tests/test_incidents.py
"""Tests for Satark incident endpoints."""
from tests.conftest import auth_header


def _create_incident(client, token=None):
    """Helper to create a test incident."""
    headers = auth_header(token) if token else {}
    response = client.post(
        "/api/incidents",
        data={
            "input_type": "text",
            "input_content": "Suspicious SMS: You won a lottery! Click here.",
            "description": "Test phishing report",
        },
        headers=headers,
    )
    return response


def test_create_incident_guest(client):
    """Guest can create an incident without auth."""
    response = _create_incident(client)
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["case_number"].startswith("SAT-")
    assert data["guest_token"] is not None
    assert data["status"] == "submitted"


def test_create_incident_authenticated(client, analyst_token):
    """Authenticated user can create an incident."""
    response = _create_incident(client, analyst_token)
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["guest_token"] is None


def test_list_incidents_analyst(client, analyst_token):
    """Analyst can list incidents."""
    _create_incident(client)
    response = client.get(
        "/api/incidents", headers=auth_header(analyst_token)
    )
    assert response.status_code == 200
    assert "data" in response.json()
    assert "pagination" in response.json()


def test_list_incidents_unauthorized(client):
    """Unauthenticated user cannot list incidents."""
    response = client.get("/api/incidents")
    assert response.status_code == 401


def test_get_incident_by_guest_token(client):
    """Guest can view their own incident via token."""
    create_resp = _create_incident(client)
    incident_id = create_resp.json()["data"]["id"]
    guest_token = create_resp.json()["data"]["guest_token"]

    response = client.get(
        f"/api/incidents/{incident_id}?token={guest_token}"
    )
    assert response.status_code == 200


def test_get_incident_analyst(client, analyst_token):
    """Analyst can view any incident."""
    create_resp = _create_incident(client)
    incident_id = create_resp.json()["data"]["id"]

    response = client.get(
        f"/api/incidents/{incident_id}",
        headers=auth_header(analyst_token),
    )
    assert response.status_code == 200


def test_get_incident_forbidden(client):
    """Unauthenticated user without token gets 403."""
    create_resp = _create_incident(client)
    incident_id = create_resp.json()["data"]["id"]

    response = client.get(f"/api/incidents/{incident_id}")
    assert response.status_code == 403


def test_update_incident(client, analyst_token):
    """Analyst can update an incident."""
    create_resp = _create_incident(client)
    incident_id = create_resp.json()["data"]["id"]

    response = client.patch(
        f"/api/incidents/{incident_id}",
        json={"status": "investigating", "analyst_notes": "Checking IOCs"},
        headers=auth_header(analyst_token),
    )
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "investigating"


def test_update_incident_unauthorized(client):
    """Unauthenticated user cannot update incidents."""
    create_resp = _create_incident(client)
    incident_id = create_resp.json()["data"]["id"]

    response = client.patch(
        f"/api/incidents/{incident_id}",
        json={"status": "investigating"},
    )
    assert response.status_code == 401
