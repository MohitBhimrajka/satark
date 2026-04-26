# tests/test_auth.py
"""Tests for Satark authentication endpoints."""
from tests.conftest import auth_header


def test_register_success(client):
    """Registration creates a new user and returns JWT."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "new@test.com",
            "password": "Secure@123",
            "display_name": "New User",
        },
    )
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["access_token"]
    assert data["user"]["email"] == "new@test.com"
    assert data["user"]["role"] == "analyst"


def test_register_duplicate_email(client):
    """Duplicate email returns 409."""
    payload = {
        "email": "dup@test.com",
        "password": "Secure@123",
        "display_name": "Dup User",
    }
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409


def test_login_success(client):
    """Login with correct credentials returns JWT."""
    client.post(
        "/api/auth/register",
        json={
            "email": "login@test.com",
            "password": "Secure@123",
            "display_name": "Login User",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "login@test.com", "password": "Secure@123"},
    )
    assert response.status_code == 200
    assert response.json()["data"]["access_token"]


def test_login_wrong_password(client):
    """Login with wrong password returns 401."""
    client.post(
        "/api/auth/register",
        json={
            "email": "wrong@test.com",
            "password": "Secure@123",
            "display_name": "Wrong User",
        },
    )
    response = client.post(
        "/api/auth/login",
        json={"email": "wrong@test.com", "password": "WrongPass@123"},
    )
    assert response.status_code == 401


def test_me_authenticated(client, analyst_token):
    """GET /me returns current user info."""
    response = client.get(
        "/api/auth/me", headers=auth_header(analyst_token)
    )
    assert response.status_code == 200
    assert response.json()["data"]["email"] == "analyst@test.com"


def test_me_unauthenticated(client):
    """GET /me without token returns 401."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
