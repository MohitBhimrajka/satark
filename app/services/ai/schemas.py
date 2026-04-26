# app/services/ai/schemas.py
"""
Satark — AI structured output schemas.
Defines the ThreatAnalysis Pydantic model used for Gemini structured output.
Used with model_validate_json() — never json.loads().
"""
from typing import Literal

from pydantic import BaseModel, Field


class ThreatAnalysis(BaseModel):
    """
    Structured output schema for all Satark AI analyses.
    The AI model returns JSON matching this shape via structured output.
    """

    classification: Literal[
        "phishing", "malware", "fraud", "espionage", "opsec_risk", "safe"
    ]
    threat_score: int = Field(
        ge=0, le=100, description="0=completely safe, 100=critical threat"
    )
    confidence: float = Field(
        ge=0.0, le=1.0, description="Model confidence in classification"
    )
    summary: str = Field(
        description="2-4 sentence summary of what was found and why it's concerning"
    )
    indicators: list[str] = Field(
        description="Extracted IOCs: suspicious URLs, IPs, domains, phone numbers, hashes, email addresses"
    )
    mitigation_steps: list[str] = Field(
        description="Ordered playbook of 3-7 actionable mitigation steps"
    )
    risk_factors: list[str] = Field(
        description="2-5 specific red flags that drove the classification"
    )
