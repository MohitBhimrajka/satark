# app/schemas/analysis.py
"""Satark — AI analysis schemas (re-exports + request/response types)."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

# Re-export ThreatAnalysis from its canonical location in the AI service package.
# This preserves backward compatibility for any code importing from here.
from app.services.ai.schemas import ThreatAnalysis  # noqa: F401


class QuickScanRequest(BaseModel):
    """POST /api/analyze/text or /api/analyze/url request body."""

    input_type: Literal["text", "url"]
    content: str = Field(min_length=1)


class QuickScanResponse(BaseModel):
    """Response for quick scan endpoints."""

    analysis: ThreatAnalysis
    analyzed_at: datetime
