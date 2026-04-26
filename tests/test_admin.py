# tests/test_admin.py
"""Tests for Satark admin endpoints."""
from tests.conftest import auth_header


def test_list_users_admin(client, admin_token):
    """Admin can list all users."""
    response = client.get(
        "/api/admin/users", headers=auth_header(admin_token)
    )
    assert response.status_code == 200
    assert "data" in response.json()
    assert "pagination" in response.json()


def test_list_users_analyst_forbidden(client, analyst_token):
    """Analyst cannot access admin endpoints."""
    response = client.get(
        "/api/admin/users", headers=auth_header(analyst_token)
    )
    assert response.status_code == 403


def test_update_role_admin(client, admin_token, analyst_user):
    """Admin can update a user's role."""
    response = client.patch(
        f"/api/admin/users/{analyst_user.id}",
        json={"role": "admin"},
        headers=auth_header(admin_token),
    )
    assert response.status_code == 200
    assert response.json()["data"]["role"] == "admin"


def test_update_role_unauthorized(client, analyst_token, admin_user):
    """Non-admin cannot update roles."""
    response = client.patch(
        f"/api/admin/users/{admin_user.id}",
        json={"role": "analyst"},
        headers=auth_header(analyst_token),
    )
    assert response.status_code == 403
