# app/services/ai/client.py
"""
Satark — AI client singleton with retry logic and concurrency control.
All AI calls go through generate_structured() or upload_file_to_gemini().
Never import google.genai directly outside this module.
"""
import asyncio
import logging
import time

from google import genai
from google.genai import types

from app.core.settings import settings

logger = logging.getLogger(__name__)

_client: genai.Client | None = None
_semaphore: asyncio.Semaphore | None = None


def get_ai_client() -> genai.Client:
    """Lazily create and return the singleton Gemini client."""
    global _client
    if _client is None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. AI analysis is unavailable."
            )
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def _get_semaphore() -> asyncio.Semaphore:
    """Lazily create the concurrency-limiting semaphore."""
    global _semaphore
    if _semaphore is None:
        _semaphore = asyncio.Semaphore(settings.AI_CONCURRENCY_LIMIT)
    return _semaphore


async def generate_structured(
    contents: list,
    response_schema: type,
    max_retries: int = 3,
) -> str:
    """
    Call Gemini with structured JSON output.

    Args:
        contents: List of content parts (strings, Part objects, uploaded files).
        response_schema: Pydantic model class for structured output.
        max_retries: Number of retry attempts on rate limiting.

    Returns:
        Raw JSON string from the model response.

    Raises:
        RuntimeError: If all retries are exhausted.
    """
    client = get_ai_client()
    sem = _get_semaphore()

    async with sem:
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=settings.AI_MODEL,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=response_schema,
                    ),
                )
                return response.text
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    wait = 2 ** attempt
                    logger.warning(
                        "AI rate limited (attempt %d/%d), retrying in %ds",
                        attempt + 1, max_retries, wait,
                    )
                    await asyncio.sleep(wait)
                else:
                    raise
    raise RuntimeError("AI service failed after max retries")


async def upload_file_to_gemini(file_path: str, mime_type: str):
    """
    Upload a file via the Gemini Files API for large media.
    Polls until the file state becomes ACTIVE (needed for video processing).

    Args:
        file_path: Local path to the file.
        mime_type: MIME type of the file.

    Returns:
        The uploaded file object, ready to pass in contents list.
    """
    client = get_ai_client()
    uploaded = client.files.upload(file=file_path)
    logger.info("Uploaded file to AI service: %s", uploaded.name)

    # Poll for processing completion (video/audio may need server-side processing)
    timeout = 300  # 5-minute hard timeout
    start = time.time()
    while uploaded.state and uploaded.state.name == "PROCESSING":
        if time.time() - start > timeout:
            raise RuntimeError(
                f"File processing timed out after {timeout}s: {uploaded.name}"
            )
        await asyncio.sleep(2)
        uploaded = client.files.get(name=uploaded.name)

    return uploaded
