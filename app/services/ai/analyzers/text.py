# app/services/ai/analyzers/text.py
"""Satark — Text message/communication analyzer."""
import logging

from app.services.ai.client import generate_structured
from app.services.ai.prompts import SYSTEM_PROMPT_BASE, TEXT_ANALYSIS_PROMPT
from app.services.ai.schemas import ThreatAnalysis

logger = logging.getLogger(__name__)


async def analyze(content: str, mime_type: str | None = None) -> ThreatAnalysis:
    """
    Analyze a suspicious text message or communication.

    Args:
        content: The raw text content to analyze.
        mime_type: Unused for text analysis, kept for consistent interface.

    Returns:
        ThreatAnalysis with classification, score, IOCs, and playbook.
    """
    prompt = TEXT_ANALYSIS_PROMPT.format(
        base=SYSTEM_PROMPT_BASE,
        content=content,
    )
    response_json = await generate_structured(
        contents=[prompt],
        response_schema=ThreatAnalysis,
    )
    return ThreatAnalysis.model_validate_json(response_json)
