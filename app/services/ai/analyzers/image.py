# app/services/ai/analyzers/image.py
"""Satark — Image analyzer (screenshots, phishing pages, fake docs)."""
import logging
from pathlib import Path

from google.genai import types

from app.services.ai.client import generate_structured
from app.services.ai.prompts import IMAGE_ANALYSIS_PROMPT, SYSTEM_PROMPT_BASE
from app.services.ai.schemas import ThreatAnalysis

logger = logging.getLogger(__name__)


async def analyze(file_path: str, mime_type: str | None = None) -> ThreatAnalysis:
    """
    Analyze an image for phishing pages, fake documents, or social engineering.
    Uses inline bytes (images are typically < 20MB).

    Args:
        file_path: Local path to the image file.
        mime_type: MIME type of the image (e.g. image/png).

    Returns:
        ThreatAnalysis with classification, score, IOCs, and playbook.
    """
    path = Path(file_path)
    image_bytes = path.read_bytes()
    mime = mime_type or "image/png"

    prompt_text = IMAGE_ANALYSIS_PROMPT.format(base=SYSTEM_PROMPT_BASE)
    image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime)

    response_json = await generate_structured(
        contents=[prompt_text, image_part],
        response_schema=ThreatAnalysis,
    )
    return ThreatAnalysis.model_validate_json(response_json)
