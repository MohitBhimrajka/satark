# app/services/ai/analyzers/audio.py
"""Satark — Audio analyzer (vishing, voice phishing, social engineering calls)."""
import logging
import os
from pathlib import Path

from google.genai import types

from app.services.ai.client import generate_structured, upload_file_to_gemini
from app.services.ai.prompts import AUDIO_ANALYSIS_PROMPT, SYSTEM_PROMPT_BASE
from app.services.ai.schemas import ThreatAnalysis

logger = logging.getLogger(__name__)

# Files > 20MB use the Files API; smaller files use inline bytes
INLINE_SIZE_LIMIT = 20_000_000


async def analyze(file_path: str, mime_type: str | None = None) -> ThreatAnalysis:
    """
    Analyze an audio recording for vishing and social engineering.
    Small files use inline bytes; large files use the Gemini Files API.

    Args:
        file_path: Local path to the audio file.
        mime_type: MIME type of the audio (e.g. audio/mpeg).

    Returns:
        ThreatAnalysis with transcription in summary, IOCs, and playbook.
    """
    path = Path(file_path)
    file_size = os.path.getsize(file_path)
    mime = mime_type or "audio/mpeg"

    prompt_text = AUDIO_ANALYSIS_PROMPT.format(base=SYSTEM_PROMPT_BASE)

    if file_size <= INLINE_SIZE_LIMIT:
        audio_part = types.Part.from_bytes(
            data=path.read_bytes(), mime_type=mime
        )
        contents = [prompt_text, audio_part]
    else:
        uploaded_file = await upload_file_to_gemini(file_path, mime)
        contents = [prompt_text, uploaded_file]

    response_json = await generate_structured(
        contents=contents,
        response_schema=ThreatAnalysis,
    )
    return ThreatAnalysis.model_validate_json(response_json)
