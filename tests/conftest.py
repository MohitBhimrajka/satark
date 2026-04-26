# tests/conftest.py
"""
Satark Test Infrastructure — shared fixtures.
Uses in-memory SQLite for fast, isolated tests.
"""
import uuid
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models.user import User
from app.services.auth import create_access_token, hash_password

# ── In-memory SQLite engine ─────────────────────────────────────────────────
SQLALCHEMY_TEST_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_conn, connection_record):
    """Enable foreign key support in SQLite."""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


# ── Database fixture ────────────────────────────────────────────────────────
@pytest.fixture(autouse=True)
def db():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    session = TestSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def override_db(db):
    """Override FastAPI's get_db dependency to use the test session."""

    def _get_test_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def mock_ai_background_task():
    """
    Prevent the AI orchestrator background task from running in tests.
    The task creates its own SessionLocal() pointing to PostgreSQL,
    which isn't available in the test environment.
    """
    with patch(
        "app.routers.incidents.analyze_incident",
        new_callable=AsyncMock,
    ):
        yield


# ── Test client ─────────────────────────────────────────────────────────────
@pytest.fixture
def client():
    """Synchronous test client for the Satark API."""
    with TestClient(app) as c:
        yield c


# ── User helpers ────────────────────────────────────────────────────────────
@pytest.fixture
def admin_user(db) -> User:
    """Create and return an admin user."""
    user = User(
        email="admin@test.com",
        password_hash=hash_password("TestAdmin@123"),
        display_name="Test Admin",
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def analyst_user(db) -> User:
    """Create and return an analyst user."""
    user = User(
        email="analyst@test.com",
        password_hash=hash_password("TestAnalyst@123"),
        display_name="Test Analyst",
        role="analyst",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_token(admin_user) -> str:
    """JWT token for the admin user."""
    return create_access_token(admin_user.id, admin_user.role)


@pytest.fixture
def analyst_token(analyst_user) -> str:
    """JWT token for the analyst user."""
    return create_access_token(analyst_user.id, analyst_user.role)


def auth_header(token: str) -> dict:
    """Build Authorization header dict."""
    return {"Authorization": f"Bearer {token}"}
