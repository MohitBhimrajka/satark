# app/services/incident.py
"""
Satark — Incident service.
Handles creation, retrieval, listing (with filters), and updates.
"""
import uuid
from datetime import datetime

from fastapi import UploadFile
from sqlalchemy import func, text
from sqlalchemy.orm import Session, joinedload

from app.core.constants import CASE_NUMBER_PREFIX, score_to_priority
from app.models.evidence_file import EvidenceFile
from app.models.incident import Incident
from app.models.user import User
from app.schemas.incident import IncidentCreate, IncidentFilter, IncidentUpdate
from app.services.audit import log_action
from app.services.storage import upload_file, validate_file


def generate_case_number(db: Session) -> str:
    """
    Generate a thread-safe case number.
    PostgreSQL: uses SEQUENCE (thread-safe).
    SQLite (tests): falls back to MAX-based counter.
    """
    dialect = db.bind.dialect.name if db.bind else "sqlite"
    year = datetime.now().year

    if dialect == "postgresql":
        result = db.execute(text("SELECT nextval('satark_case_seq')"))
        seq = result.scalar()
    else:
        # SQLite fallback for tests
        result = db.execute(
            text(
                "SELECT COALESCE(MAX(CAST(SUBSTR(case_number, -5) AS INTEGER)), 0) + 1 "
                "FROM incidents"
            )
        )
        seq = result.scalar() or 1

    return f"{CASE_NUMBER_PREFIX}-{year}-{seq:05d}"


async def create_incident(
    data: IncidentCreate,
    files: list[UploadFile] | None,
    user: User | None,
    db: Session,
    ip_address: str | None = None,
) -> Incident:
    """Create a new incident with optional file uploads."""
    case_number = generate_case_number(db)
    guest_token = str(uuid.uuid4()) if user is None else None

    incident = Incident(
        case_number=case_number,
        submitted_by=user.id if user else None,
        guest_token=guest_token,
        input_type=data.input_type,
        input_content=data.input_content,
        description=data.description,
        status="submitted",
    )
    db.add(incident)
    db.flush()

    if files:
        for file in files:
            if file.filename and file.size and file.size > 0:
                validate_file(file, data.input_type)
                result = await upload_file(file, str(incident.id))
                evidence = EvidenceFile(
                    incident_id=incident.id,
                    filename=result.stored_filename,
                    original_filename=file.filename or "unknown",
                    mime_type=result.mime_type,
                    file_size=result.file_size,
                    storage_path=result.storage_path,
                    checksum=result.checksum,
                )
                db.add(evidence)

    actor_label = user.display_name if user else "GUEST"
    log_action(
        db=db,
        action="created",
        incident_id=incident.id,
        user_id=user.id if user else None,
        actor_label=actor_label,
        details={"input_type": data.input_type, "case_number": case_number},
        ip_address=ip_address,
    )

    db.commit()
    db.refresh(incident)
    return incident


def get_incident(
    incident_id: uuid.UUID, db: Session
) -> Incident | None:
    """Get a single incident with eager-loaded relationships."""
    return (
        db.query(Incident)
        .options(
            joinedload(Incident.evidence_files),
            joinedload(Incident.audit_logs),
        )
        .filter(Incident.id == incident_id)
        .first()
    )


def list_incidents(
    filters: IncidentFilter,
    page: int,
    page_size: int,
    db: Session,
) -> tuple[list[Incident], int]:
    """List incidents with filtering, sorting, and pagination."""
    query = db.query(Incident)

    if filters.status:
        query = query.filter(Incident.status == filters.status)
    if filters.priority:
        query = query.filter(Incident.priority == filters.priority)
    if filters.classification:
        query = query.filter(Incident.classification == filters.classification)
    if filters.start_date:
        query = query.filter(Incident.created_at >= filters.start_date)
    if filters.end_date:
        query = query.filter(Incident.created_at <= filters.end_date)
    if filters.search:
        search_term = f"%{filters.search}%"
        query = query.filter(
            Incident.case_number.ilike(search_term)
            | Incident.description.ilike(search_term)
            | Incident.input_content.ilike(search_term)
        )

    total = query.count()

    sort_col = getattr(Incident, filters.sort_by, Incident.created_at)
    if filters.sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()

    return items, total


def update_incident(
    incident_id: uuid.UUID,
    data: IncidentUpdate,
    user: User,
    db: Session,
    ip_address: str | None = None,
) -> Incident | None:
    """Update an incident's status, priority, notes, or assignment."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        return None

    changes: dict = {}
    if data.status is not None and data.status != incident.status:
        changes["status"] = {"from": incident.status, "to": data.status}
        incident.status = data.status

    if data.priority is not None and data.priority != incident.priority:
        changes["priority"] = {"from": incident.priority, "to": data.priority}
        incident.priority = data.priority

    if data.analyst_notes is not None:
        incident.analyst_notes = data.analyst_notes
        changes["analyst_notes"] = "updated"

    if data.assigned_to is not None:
        changes["assigned_to"] = str(data.assigned_to)
        incident.assigned_to = data.assigned_to

    if changes:
        action = "status_changed" if "status" in changes else "updated"
        log_action(
            db=db,
            action=action,
            incident_id=incident.id,
            user_id=user.id,
            actor_label=user.display_name,
            details=changes,
            ip_address=ip_address,
        )

    db.commit()
    db.refresh(incident)
    return incident
