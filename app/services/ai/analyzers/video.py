# app/services/ai/analyzers/video.py
"""Satark — Video analyzer (screen recordings, deepfakes, malware demos)."""
import logging

from app.services.ai.client import generate_structured, upload_file_to_gemini
from app.services.ai.prompts import SYSTEM_PROMPT_BASE, VIDEO_ANALYSIS_PROMPT
from app.services.ai.schemas import ThreatAnalysis

logger = logging.getLogger(__name__)


async def analyze(file_path: str, mime_type: str | None = None) -> ThreatAnalysis:
    """
    Analyze a video for cyber threats (screen recordings, deepfakes, etc.).
    Always uses the Gemini Files API — videos require server-side processing.

    Args:
        file_path: Local path to the video file.
        mime_type: MIME type of the video (e.g. video/mp4).

    Returns:
        ThreatAnalysis with classification, score, IOCs, and playbook.
    """
    mime = mime_type or "video/mp4"
    prompt_text = VIDEO_ANALYSIS_PROMPT.format(base=SYSTEM_PROMPT_BASE)

    uploaded_file = await upload_file_to_gemini(file_path, mime)
    response_json = await generate_structured(
        contents=[prompt_text, uploaded_file],
        response_schema=ThreatAnalysis,
    )
    return ThreatAnalysis.model_validate_json(response_json)
