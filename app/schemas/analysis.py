# app/schemas/analysis.py
"""Satark — AI analysis structured output schemas."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ThreatAnalysis(BaseModel):
    """
    Structured output schema for AI threat analysis.
    The AI model returns JSON matching this shape via structured output.
    Used with model_validate_json() — never json.loads().
    """

    classification: Literal[
        "phishing", "malware", "fraud", "espionage", "opsec_risk", "safe"
    ]
    threat_score: int = Field(ge=0, le=100)
    confidence: float = Field(ge=0.0, le=1.0)
    summary: str
    indicators: list[str]
    mitigation_steps: list[str]
    risk_factors: list[str]


class QuickScanRequest(BaseModel):
    """POST /api/analyze/text or /api/analyze/url request body."""

    input_type: Literal["text", "url"]
    content: str = Field(min_length=1)


class QuickScanResponse(BaseModel):
    """Response for quick scan endpoints."""

    analysis: ThreatAnalysis
    analyzed_at: datetime
