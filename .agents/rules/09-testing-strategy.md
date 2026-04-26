---
trigger: model_decision
description: Reference when writing tests, setting up test infrastructure, creating fixtures, or validating code changes
---

# 1. Testing Philosophy
Tests are not optional. Every endpoint and service function needs tests. Focus on confidence in the critical paths: auth, incident CRUD, AI orchestration (mocked), file upload.

# 2. Test Infrastructure Setup

### `pytest.ini` (root of project)
```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

### `tests/conftest.py` — Must Define These Fixtures

```python
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import AsyncMock, patch
from app.main import app
from app.core.database import Base, get_db
from app.models import User, Incident  # all models

# Test database (separate PostgreSQL DB or SQLite for speed)
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_satark.db"

@pytest.fixture(scope="session")
def test_engine():
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session(test_engine):
    TestSession = sessionmaker(bind=test_engine)
    session = TestSession()
    yield session
    session.rollback()
    session.close()

@pytest_asyncio.fixture
async def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest.fixture
def analyst_token(db_session):
    """Create analyst user and return JWT token."""
    from app.services.auth import create_access_token, hash_password
    user = User(email="analyst@test.com", password_hash=hash_password("test"), role="analyst")
    db_session.add(user)
    db_session.commit()
    return create_access_token(str(user.id), user.role)

@pytest.fixture
def admin_token(db_session):
    """Create admin user and return JWT token."""
    from app.services.auth import create_access_token, hash_password
    user = User(email="admin@test.com", password_hash=hash_password("test"), role="admin")
    db_session.add(user)
    db_session.commit()
    return create_access_token(str(user.id), user.role)

@pytest.fixture
def mock_ai_analysis():
    """Mock AI analysis to never call real Gemini API in tests."""
    from app.services.ai.schemas import ThreatAnalysis
    mock_result = ThreatAnalysis(
        classification="phishing",
        threat_score=85,
        confidence=0.94,
        summary="Suspicious phishing attempt detected.",
        indicators=["malicious.example.com", "192.168.1.1"],
        mitigation_steps=["Do not click links", "Report to CERT-Army"],
        risk_factors=["Fake urgency", "Suspicious domain"],
    )
    with patch("app.services.ai.orchestrator.analyze_incident", return_value=mock_result):
        yield mock_result
```

# 3. What MUST Be Tested

### Backend (pytest)
- **Every API endpoint** — happy path + error path (at minimum)
- **Auth endpoints** — register, login, invalid credentials, role checks
- **Incident endpoints** — create, list (with filters), detail (guest token), update
- **Dashboard endpoints** — stats, chart data
- **AI service** — mocked, verifies structured output parsing
- **Case number generation** — uniqueness, format

### Frontend
- **API client functions** — mock responses, verify parsing
- **Auth context** — token storage, logout, role access
- Not required: pure presentational components

# 4. Mock Rules (CRITICAL)
- **NEVER call real Gemini API in tests** — always use `mock_ai_analysis` fixture
- **NEVER use production GCS in tests** — mock `app.services.storage.upload_file`
- **NEVER use production database** — always use test DB (SQLite or test PostgreSQL)
- **Use factory fixtures** — don't hardcode payloads across multiple tests

# 5. Test Pattern — API Endpoints

```python
# tests/test_incidents.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_incident_text_success(client: AsyncClient, mock_ai_analysis):
    response = await client.post("/api/incidents", json={
        "input_type": "text",
        "input_content": "URGENT: Click http://fake.com to verify your account",
    })
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["case_number"].startswith("SAT-")
    assert "guest_token" in data

@pytest.mark.asyncio
async def test_list_incidents_requires_analyst(client: AsyncClient):
    response = await client.get("/api/incidents")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_list_incidents_analyst_success(client: AsyncClient, analyst_token: str):
    response = await client.get(
        "/api/incidents",
        headers={"Authorization": f"Bearer {analyst_token}"}
    )
    assert response.status_code == 200
    assert "data" in response.json()
    assert "pagination" in response.json()
```

# 6. AI Mock Pattern
```python
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
async def test_analyze_text_returns_structured_output(client: AsyncClient):
    with patch("app.services.ai.analyzers.text.analyze_text") as mock_analyze:
        mock_analyze.return_value = ThreatAnalysis(
            classification="phishing",
            threat_score=90,
            ...
        )
        response = await client.post("/api/analyze/text", json={"content": "suspicious text"})
        assert response.status_code == 200
        assert response.json()["data"]["classification"] == "phishing"
```

# 7. Pre-Commit Requirements
```bash
make test-be  # Must pass
cd frontend && npm run lint && npm run build  # Must pass
```

Never skip a failing test. Fix the test or fix the code — not the other way around.
