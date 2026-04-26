# app/services/ai/analyzers/url.py
"""Satark — URL structure and metadata analyzer."""
import logging
import re
from urllib.parse import urlparse

from app.services.ai.client import generate_structured
from app.services.ai.prompts import SYSTEM_PROMPT_BASE, URL_ANALYSIS_PROMPT
from app.services.ai.schemas import ThreatAnalysis

logger = logging.getLogger(__name__)

SHORTENED_DOMAINS = {
    "bit.ly", "t.co", "tinyurl.com", "goo.gl", "ow.ly",
    "is.gd", "buff.ly", "rb.gy", "cutt.ly", "short.io",
}


def parse_url_signals(url: str) -> dict:
    """
    Extract structural signals from a URL for threat analysis.

    Returns a dict with: url, domain, tld, path, has_https, url_length,
    is_shortened, has_ip, has_unusual_chars.
    """
    parsed = urlparse(url if "://" in url else f"http://{url}")
    domain = parsed.hostname or ""
    parts = domain.split(".")
    tld = parts[-1] if parts else ""

    return {
        "url": url,
        "domain": domain,
        "tld": tld,
        "path": parsed.path or "/",
        "has_https": parsed.scheme == "https",
        "url_length": len(url),
        "is_shortened": domain in SHORTENED_DOMAINS,
        "has_ip": bool(re.match(r"^\d+\.\d+\.\d+\.\d+$", domain)),
        "has_unusual_chars": bool(
            re.search(r"[0-9](?=[a-z])|[a-z](?=[0-9])", domain)
        ) or domain.count("-") > 2,
    }


async def analyze(content: str, mime_type: str | None = None) -> ThreatAnalysis:
    """
    Analyze a suspicious URL by extracting structural signals.

    Args:
        content: The URL string to analyze.
        mime_type: Unused for URL analysis, kept for consistent interface.

    Returns:
        ThreatAnalysis with classification, score, IOCs, and playbook.
    """
    signals = parse_url_signals(content)
    prompt = URL_ANALYSIS_PROMPT.format(
        base=SYSTEM_PROMPT_BASE,
        **signals,
    )
    response_json = await generate_structured(
        contents=[prompt],
        response_schema=ThreatAnalysis,
    )
    return ThreatAnalysis.model_validate_json(response_json)
