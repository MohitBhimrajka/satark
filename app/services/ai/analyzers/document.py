# app/services/ai/analyzers/document.py
"""Satark — Document analyzer (PDFs, DOCX — fake gov notices, embedded links)."""
import logging
import os
from pathlib import Path

from google.genai import types

from app.services.ai.client import generate_structured, upload_file_to_gemini
from app.services.ai.prompts import DOCUMENT_ANALYSIS_PROMPT, SYSTEM_PROMPT_BASE
from app.services.ai.schemas import ThreatAnalysis

logger = logging.getLogger(__name__)

# PDFs up to 50MB can use inline bytes; DOCX and larger files use Files API
INLINE_PDF_LIMIT = 50_000_000


async def analyze(file_path: str, mime_type: str | None = None) -> ThreatAnalysis:
    """
    Analyze a document (PDF/DOCX) for fake notices, embedded links, social engineering.
    PDFs ≤ 50MB use inline bytes; DOCX and large PDFs use the Files API.

    Args:
        file_path: Local path to the document file.
        mime_type: MIME type (application/pdf or application/vnd.openxmlformats-...).

    Returns:
        ThreatAnalysis with classification, score, IOCs, and playbook.
    """
    path = Path(file_path)
    file_size = os.path.getsize(file_path)
    mime = mime_type or "application/pdf"

    prompt_text = DOCUMENT_ANALYSIS_PROMPT.format(base=SYSTEM_PROMPT_BASE)

    is_pdf = "pdf" in mime.lower()
    if is_pdf and file_size <= INLINE_PDF_LIMIT:
        doc_part = types.Part.from_bytes(
            data=path.read_bytes(), mime_type=mime
        )
        contents = [prompt_text, doc_part]
    else:
        uploaded_file = await upload_file_to_gemini(file_path, mime)
        contents = [prompt_text, uploaded_file]

    response_json = await generate_structured(
        contents=contents,
        response_schema=ThreatAnalysis,
    )
    return ThreatAnalysis.model_validate_json(response_json)
