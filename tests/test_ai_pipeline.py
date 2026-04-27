# tests/test_ai_pipeline.py
"""
Satark — AI pipeline unit tests.
All Gemini API calls are mocked — no real API key needed.
"""
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.core.constants import score_to_priority
from app.services.ai.analyzers.url import parse_url_signals
from app.services.ai.schemas import ThreatAnalysis

# ── Mock response fixtures ──────────────────────────────────────────────────

MOCK_PHISHING_JSON = json.dumps({
    "classification": "phishing",
    "threat_score": 85,
    "confidence": 0.92,
    "summary": "This message impersonates HDFC Bank and contains a suspicious .tk domain link designed to steal banking credentials.",
    "indicators": ["hdfc-secure.tk", ".tk domain", "fake urgency"],
    "mitigation_steps": [
        "Do not click the link",
        "Block the sender",
        "Report to IT security",
        "Change bank password from official app",
    ],
    "risk_factors": [
        "Suspicious .tk top-level domain",
        "Urgency tactics to pressure immediate action",
        "Impersonation of HDFC Bank",
    ],
})

MOCK_SAFE_JSON = json.dumps({
    "classification": "safe",
    "threat_score": 5,
    "confidence": 0.95,
    "summary": "This is a routine administrative message about a meeting schedule change. No threat indicators found.",
    "indicators": [],
    "mitigation_steps": ["No action required"],
    "risk_factors": [],
})

MOCK_URL_PHISHING_JSON = json.dumps({
    "classification": "phishing",
    "threat_score": 92,
    "confidence": 0.88,
    "summary": "This URL uses a .tk domain with typosquatting of SBI banking to steal credentials.",
    "indicators": ["sbi-banking-secure.tk", ".tk domain", "no HTTPS"],
    "mitigation_steps": [
        "Do not visit this URL",
        "Report to cybersecurity team",
        "Check bank account from official SBI site",
    ],
    "risk_factors": [
        "Suspicious .tk TLD",
        "Typosquatting of SBI domain",
        "No HTTPS encryption",
    ],
})


# ── ThreatAnalysis schema tests ─────────────────────────────────────────────

def test_threat_analysis_valid():
    """ThreatAnalysis should parse valid JSON correctly."""
    result = ThreatAnalysis.model_validate_json(MOCK_PHISHING_JSON)
    assert result.classification == "phishing"
    assert result.threat_score == 85
    assert result.confidence == 0.92
    assert len(result.indicators) == 3
    assert len(result.mitigation_steps) == 4
    assert len(result.risk_factors) == 3


def test_threat_analysis_safe():
    """ThreatAnalysis should handle safe classification."""
    result = ThreatAnalysis.model_validate_json(MOCK_SAFE_JSON)
    assert result.classification == "safe"
    assert result.threat_score == 5


# ── score_to_priority mapping tests ─────────────────────────────────────────

def test_score_to_priority_critical():
    assert score_to_priority(85) == "critical"
    assert score_to_priority(100) == "critical"
    assert score_to_priority(80) == "critical"


def test_score_to_priority_high():
    assert score_to_priority(79) == "high"
    assert score_to_priority(60) == "high"


def test_score_to_priority_medium():
    assert score_to_priority(59) == "medium"
    assert score_to_priority(40) == "medium"


def test_score_to_priority_low():
    assert score_to_priority(39) == "low"
    assert score_to_priority(0) == "low"


# ── URL parsing tests ──────────────────────────────────────────────────────

def test_url_parse_signals_phishing():
    """URL parser should extract signals from a phishing URL."""
    signals = parse_url_signals("http://sbi-banking-secure.tk/login?ref=army")
    assert signals["domain"] == "sbi-banking-secure.tk"
    assert signals["tld"] == "tk"
    assert signals["has_https"] is False
    assert signals["is_shortened"] is False
    assert signals["has_ip"] is False


def test_url_parse_signals_shortened():
    """URL parser should detect shortened URLs."""
    signals = parse_url_signals("https://bit.ly/abc123")
    assert signals["is_shortened"] is True
    assert signals["domain"] == "bit.ly"


def test_url_parse_signals_ip():
    """URL parser should detect IP-based URLs."""
    signals = parse_url_signals("http://192.168.1.1/admin")
    assert signals["has_ip"] is True


def test_url_parse_signals_safe():
    """URL parser should handle safe URLs."""
    signals = parse_url_signals("https://mod.gov.in")
    assert signals["has_https"] is True
    assert signals["tld"] == "in"
    assert signals["is_shortened"] is False


# ── Text analyzer tests (mocked) ───────────────────────────────────────────

@pytest.mark.asyncio
@patch("app.services.ai.analyzers.text.generate_structured")
async def test_text_analyzer_phishing(mock_gen):
    """Text analyzer should return phishing classification for suspicious SMS."""
    mock_gen.return_value = MOCK_PHISHING_JSON

    from app.services.ai.analyzers import text as text_analyzer

    result = await text_analyzer.analyze(
        "ALERT: Your HDFC account blocked. Click http://hdfc-secure.tk/verify"
    )
    assert result.classification == "phishing"
    assert result.threat_score == 85
    mock_gen.assert_called_once()


@pytest.mark.asyncio
@patch("app.services.ai.analyzers.text.generate_structured")
async def test_text_analyzer_safe(mock_gen):
    """Text analyzer should return safe classification for routine messages."""
    mock_gen.return_value = MOCK_SAFE_JSON

    from app.services.ai.analyzers import text as text_analyzer

    result = await text_analyzer.analyze(
        "Reminder: PT parade tomorrow at 0600 hours."
    )
    assert result.classification == "safe"
    assert result.threat_score == 5


# ── URL analyzer tests (mocked) ────────────────────────────────────────────

@pytest.mark.asyncio
@patch("app.services.ai.analyzers.url.generate_grounded")
async def test_url_analyzer_suspicious_tld(mock_gen):
    """URL analyzer should flag .tk domain as phishing using grounded analysis."""
    mock_gen.return_value = MOCK_URL_PHISHING_JSON

    from app.services.ai.analyzers import url as url_analyzer

    result = await url_analyzer.analyze(
        "http://sbi-banking-secure.tk/login?ref=army"
    )
    assert result.classification == "phishing"
    assert result.threat_score == 92
    # Verify grounded was called with google_search=True, url_context=True
    mock_gen.assert_called_once()
    call_kwargs = mock_gen.call_args
    assert call_kwargs.kwargs.get("use_google_search") is True
    assert call_kwargs.kwargs.get("use_url_context") is True


@pytest.mark.asyncio
@patch("app.services.ai.analyzers.url.generate_structured")
@patch("app.services.ai.analyzers.url.generate_grounded")
async def test_url_analyzer_fallback(mock_grounded, mock_structured):
    """URL analyzer should fall back to non-grounded if grounding fails."""
    mock_grounded.side_effect = RuntimeError("Grounding unavailable")
    mock_structured.return_value = MOCK_URL_PHISHING_JSON

    from app.services.ai.analyzers import url as url_analyzer

    result = await url_analyzer.analyze(
        "http://sbi-banking-secure.tk/login?ref=army"
    )
    assert result.classification == "phishing"
    mock_grounded.assert_called_once()
    mock_structured.assert_called_once()


# ── Quick-scan endpoint tests ──────────────────────────────────────────────

@patch("app.routers.analyze.text_analyzer.analyze")
def test_quick_scan_text_endpoint(mock_analyze, client):
    """POST /api/analyze/text should return AI analysis."""
    mock_result = ThreatAnalysis.model_validate_json(MOCK_PHISHING_JSON)
    mock_analyze.return_value = mock_result

    resp = client.post(
        "/api/analyze/text",
        json={"input_type": "text", "content": "Click here to steal your bank info"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["analysis"]["classification"] == "phishing"
    assert "analyzed_at" in data


@patch("app.routers.analyze.url_analyzer.analyze")
def test_quick_scan_url_endpoint(mock_analyze, client):
    """POST /api/analyze/url should return AI analysis."""
    mock_result = ThreatAnalysis.model_validate_json(MOCK_URL_PHISHING_JSON)
    mock_analyze.return_value = mock_result

    resp = client.post(
        "/api/analyze/url",
        json={"input_type": "url", "content": "http://fake-bank.tk/login"},
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["analysis"]["classification"] == "phishing"


# ── Orchestrator tests (mocked DB + analyzer) ──────────────────────────────

@pytest.mark.asyncio
@patch("app.services.ai.orchestrator.log_action")
@patch("app.services.ai.analyzers.text.generate_structured")
async def test_orchestrator_updates_incident(mock_gen, mock_log):
    """
    Orchestrator should write classification, threat_score, priority,
    ai_analysis, and status=analyzed to the incident after success.
    Uses a mocked DB session to avoid SQLite UUID dialect issues.
    """
    import uuid as uuid_module
    from unittest.mock import MagicMock
    from app.services.ai.orchestrator import analyze_incident

    mock_gen.return_value = MOCK_PHISHING_JSON

    # Build a mock incident that looks like a real one
    incident_id = str(uuid_module.uuid4())
    mock_incident = MagicMock()
    mock_incident.id = incident_id
    mock_incident.input_type = "text"
    mock_incident.input_content = "ALERT: Your HDFC account blocked."
    mock_incident.case_number = "SAT-2026-00001"
    mock_incident.status = "submitted"

    # Build a mock DB session
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = mock_incident

    with patch("app.core.database.SessionLocal", return_value=mock_db):
        await analyze_incident(incident_id)

    # The orchestrator should have set these fields
    assert mock_incident.status == "analyzed"
    assert mock_incident.classification == "phishing"
    assert mock_incident.threat_score == 85
    assert mock_incident.priority == "critical"
    assert mock_incident.ai_analysis["classification"] == "phishing"
    mock_log.assert_called_once()
    call_kwargs = mock_log.call_args.kwargs
    assert call_kwargs["action"] == "ai_analysis_complete"
    assert call_kwargs["actor_label"] == "AI_AGENT"


@pytest.mark.asyncio
@patch("app.services.ai.orchestrator.log_action")
@patch("app.services.ai.analyzers.text.generate_structured")
async def test_orchestrator_handles_failure(mock_gen, mock_log):
    """
    Orchestrator should set status=analysis_failed and log the failure
    when the AI analyzer raises an exception.
    """
    import uuid as uuid_module
    from unittest.mock import MagicMock
    from app.services.ai.orchestrator import analyze_incident

    mock_gen.side_effect = RuntimeError("AI service unavailable")

    incident_id = str(uuid_module.uuid4())
    mock_incident = MagicMock()
    mock_incident.id = incident_id
    mock_incident.input_type = "text"
    mock_incident.input_content = "Suspicious message"
    mock_incident.case_number = "SAT-2026-00002"
    mock_incident.status = "submitted"

    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = mock_incident

    with patch("app.core.database.SessionLocal", return_value=mock_db):
        await analyze_incident(incident_id)

    assert mock_incident.status == "analysis_failed"
    mock_log.assert_called_once()
    call_kwargs = mock_log.call_args.kwargs
    assert call_kwargs["action"] == "ai_analysis_failed"
    assert call_kwargs["actor_label"] == "AI_AGENT"


def test_incident_triggers_background(client):
    """
    POST /api/incidents should enqueue the AI analysis background task.
    The autouse mock_ai_background_task fixture intercepts analyze_incident.
    We verify the response message indicates analysis is in progress.
    """
    resp = client.post(
        "/api/incidents",
        data={
            "input_type": "text",
            "input_content": "ALERT: Click this link immediately http://hdfc-secure.tk",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["message"] == "Incident submitted. AI analysis in progress."
    assert body["data"]["status"] == "submitted"
    assert body["data"]["input_type"] == "text"
