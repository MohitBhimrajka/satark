# app/services/ai/orchestrator.py
"""
Satark — AI analysis orchestrator.
Routes incidents to the correct modality analyzer and updates DB with results.
Runs as a FastAPI BackgroundTask with its own DB session.
"""
import importlib
import logging
from pathlib import Path

from pydantic import ValidationError

from app.core.constants import IncidentStatus, score_to_priority
from app.core.settings import settings
from app.models.incident import Incident
from app.services.audit import log_action

from .schemas import ThreatAnalysis

logger = logging.getLogger(__name__)

# Maps input_type → analyzer module path
ANALYZER_MAP = {
    "text": "app.services.ai.analyzers.text",
    "url": "app.services.ai.analyzers.url",
    "image": "app.services.ai.analyzers.image",
    "audio": "app.services.ai.analyzers.audio",
    "video": "app.services.ai.analyzers.video",
    "document": "app.services.ai.analyzers.document",
}


def _resolve_file_path(storage_path: str) -> str:
    """
    Resolve a storage_path (e.g. '<incident_id>/filename.ext') to a local file path.
    In local dev, files are under LOCAL_UPLOAD_DIR.
    """
    full_path = Path(settings.LOCAL_UPLOAD_DIR) / storage_path
    if not full_path.exists():
        raise FileNotFoundError(f"Evidence file not found: {full_path}")
    return str(full_path)


async def analyze_incident(incident_id: str) -> None:
    """
    Background task: run AI analysis on an incident.

    Creates its own DB session (the request-scoped session is closed
    by the time BackgroundTasks execute).
    """
    from app.core.database import SessionLocal

    db = SessionLocal()
    incident = None
    try:
        incident = (
            db.query(Incident).filter(Incident.id == incident_id).first()
        )
        if not incident:
            logger.error("Incident %s not found for analysis", incident_id)
            return

        # Mark as analyzing
        incident.status = IncidentStatus.ANALYZING
        db.commit()

        # Resolve the analyzer module
        module_path = ANALYZER_MAP.get(incident.input_type)
        if not module_path:
            raise ValueError(f"Unknown input_type: {incident.input_type}")

        analyzer = importlib.import_module(module_path)

        # Run analysis
        if incident.input_type in ("text", "url"):
            if not incident.input_content:
                raise ValueError("No input_content for text/URL analysis")
            result: ThreatAnalysis = await analyzer.analyze(
                incident.input_content
            )
        else:
            # File-based: get the first evidence file's local path
            evidence = (
                incident.evidence_files[0]
                if incident.evidence_files
                else None
            )
            if not evidence:
                raise ValueError(
                    "No evidence file attached for file-based analysis"
                )
            file_path = _resolve_file_path(evidence.storage_path)
            result = await analyzer.analyze(file_path, evidence.mime_type)

        # Write results to incident
        incident.classification = result.classification
        incident.threat_score = result.threat_score
        incident.confidence = result.confidence
        incident.ai_analysis = result.model_dump()
        incident.priority = score_to_priority(result.threat_score)
        incident.status = IncidentStatus.ANALYZED

        log_action(
            db=db,
            action="ai_analysis_complete",
            incident_id=incident.id,
            actor_label="AI_AGENT",
            details={
                "classification": result.classification,
                "threat_score": result.threat_score,
                "confidence": result.confidence,
            },
        )
        logger.info(
            "AI analysis complete for %s: %s (score=%d)",
            incident.case_number,
            result.classification,
            result.threat_score,
        )

    except (ValidationError, ValueError, FileNotFoundError, RuntimeError) as e:
        logger.error("AI analysis failed for %s: %s", incident_id, e)
        if incident:
            incident.status = IncidentStatus.ANALYSIS_FAILED
            log_action(
                db=db,
                action="ai_analysis_failed",
                incident_id=incident.id,
                actor_label="AI_AGENT",
                details={"error": str(e)},
            )

    except Exception as e:
        logger.exception("Unexpected error in AI analysis for %s", incident_id)
        if incident:
            incident.status = IncidentStatus.ANALYSIS_FAILED
            log_action(
                db=db,
                action="ai_analysis_failed",
                incident_id=incident.id,
                actor_label="AI_AGENT",
                details={"error": str(e)},
            )

    finally:
        try:
            db.commit()
        except Exception:
            db.rollback()
        db.close()
