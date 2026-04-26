# app/routers/analyze.py
"""
Satark — Quick-scan endpoints for the "Try It Now" demo section.
No authentication required. No incident records created.
Returns AI analysis results directly.
"""
import logging
import os
import tempfile
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.schemas.analysis import QuickScanRequest, QuickScanResponse
from app.services.ai.analyzers import (
    audio as audio_analyzer,
    document as document_analyzer,
    image as image_analyzer,
    text as text_analyzer,
    url as url_analyzer,
    video as video_analyzer,
)
from app.services.storage import ALL_ALLOWED_MIMES

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["Quick Scan"])

# Maps MIME type prefixes to analyzer modules
FILE_ANALYZER_MAP = {
    "image/": image_analyzer,
    "audio/": audio_analyzer,
    "video/": video_analyzer,
    "application/pdf": document_analyzer,
    "application/vnd.openxmlformats": document_analyzer,
}


@router.post("/text")
async def scan_text(data: QuickScanRequest):
    """Analyze a suspicious text message. No auth required."""
    try:
        result = await text_analyzer.analyze(data.content)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI analysis is temporarily unavailable.",
        ) from e

    return {
        "data": QuickScanResponse(
            analysis=result,
            analyzed_at=datetime.now(timezone.utc),
        ).model_dump(),
    }


@router.post("/url")
async def scan_url(data: QuickScanRequest):
    """Analyze a suspicious URL. No auth required."""
    try:
        result = await url_analyzer.analyze(data.content)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI analysis is temporarily unavailable.",
        ) from e

    return {
        "data": QuickScanResponse(
            analysis=result,
            analyzed_at=datetime.now(timezone.utc),
        ).model_dump(),
    }


@router.post("/file")
async def scan_file(file: UploadFile = File(...)):
    """
    Analyze a suspicious file (image, audio, video, document).
    No auth required. File is saved temporarily, analyzed, then deleted.
    """
    if not file.content_type or file.content_type not in ALL_ALLOWED_MIMES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}",
        )

    # Find the correct analyzer based on MIME type
    analyzer = None
    for prefix, mod in FILE_ANALYZER_MAP.items():
        if file.content_type.startswith(prefix):
            analyzer = mod
            break

    if not analyzer:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"No analyzer available for: {file.content_type}",
        )

    # Save to temp file, analyze, then cleanup
    content = await file.read()
    suffix = os.path.splitext(file.filename or "file")[1]
    tmp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=suffix
        ) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        result = await analyzer.analyze(tmp_path, file.content_type)

    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI analysis is temporarily unavailable.",
        ) from e

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return {
        "data": QuickScanResponse(
            analysis=result,
            analyzed_at=datetime.now(timezone.utc),
        ).model_dump(),
    }
