# app/core/constants.py
"""
Satark — Application Constants & Display Mappings.
These are NOT business logic — the AI determines the threat score,
we only map scores to display categories.
"""

# ── Priority Mapping (score → display priority) ─────────────────────────────
# The AI determines the threat_score (0-100). This maps it to a UI label.
PRIORITY_MAP: dict[tuple[int, int], str] = {
    (80, 100): "critical",
    (60, 79): "high",
    (40, 59): "medium",
    (0, 39): "low",
}


def score_to_priority(score: int) -> str:
    """Convert an AI-generated threat score to a display priority label."""
    for (low, high), priority in PRIORITY_MAP.items():
        if low <= score <= high:
            return priority
    return "low"


# ── Incident Status Values ──────────────────────────────────────────────────
class IncidentStatus:
    SUBMITTED = "submitted"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    INVESTIGATING = "investigating"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"

    ALL = [SUBMITTED, ANALYZING, ANALYZED, INVESTIGATING, ESCALATED, RESOLVED, CLOSED]


# ── Classification Labels ───────────────────────────────────────────────────
CLASSIFICATIONS = [
    "phishing",
    "malware",
    "fraud",
    "espionage",
    "opsec_risk",
    "safe",
]

# ── Input Types ──────────────────────────────────────────────────────────────
INPUT_TYPES = ["text", "url", "image", "audio", "video", "document"]

# ── User Roles ───────────────────────────────────────────────────────────────
ROLES = ["guest", "analyst", "admin"]

# ── Case Number Prefix ───────────────────────────────────────────────────────
CASE_NUMBER_PREFIX = "SAT"
