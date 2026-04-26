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

