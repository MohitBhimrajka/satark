# app/routers/incidents.py
"""
Satark — Incident router.
Handles creation (with file uploads), listing, detail, and updates.
"""
import math
import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.incident import (
    IncidentFilter,
    IncidentListItem,
    IncidentResponse,
    IncidentUpdate,
    PaginationMeta,
)
from app.security import get_current_user, get_optional_user, require_role
from app.services import incident as incident_service
from app.services.ai.orchestrator import analyze_incident

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_incident(
    request: Request,
    background_tasks: BackgroundTasks,
    input_type: str = Form(...),
    input_content: str | None = Form(None),
    description: str | None = Form(None),
    files: list[UploadFile] = File(default=[]),
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Submit a new cyber-incident for AI analysis. No auth required (guest access)."""
    from app.schemas.incident import IncidentCreate

    data = IncidentCreate(
        input_type=input_type,
        input_content=input_content,
        description=description,
    )
    ip = request.client.host if request.client else None
    incident = await incident_service.create_incident(
        data=data, files=files or None, user=user, db=db, ip_address=ip
    )

    # Trigger async AI analysis in background
    background_tasks.add_task(analyze_incident, str(incident.id))

    response_data = IncidentResponse.model_validate(incident).model_dump()
    return {
        "data": response_data,
        "message": "Incident submitted. AI analysis in progress.",
    }


@router.get("", dependencies=[Depends(require_role("analyst", "admin"))])
def list_incidents(
    status_filter: str | None = Query(None, alias="status"),
    priority: str | None = Query(None),
    classification: str | None = Query(None),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    search: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List incidents with filters and pagination. Analyst+ only."""
    filters = IncidentFilter(
        status=status_filter,
        priority=priority,
        classification=classification,
        start_date=start_date,
        end_date=end_date,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    items, total = incident_service.list_incidents(
        filters=filters, page=page, page_size=page_size, db=db
    )

    return {
        "data": [
            IncidentListItem.model_validate(i).model_dump() for i in items
        ],
        "pagination": PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total,
            total_pages=math.ceil(total / page_size) if total > 0 else 0,
        ).model_dump(),
    }


@router.get("/{incident_id}")
def get_incident(
    incident_id: uuid.UUID,
    token: str | None = Query(None),
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Get incident detail.
    Accessible by: guest with matching token, or analyst/admin.
    """
    incident = incident_service.get_incident(incident_id, db)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    if user and user.role in ("analyst", "admin"):
        pass  # Authorized
    elif token and incident.guest_token == token:
        pass  # Guest with valid token
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Provide a valid token or authenticate.",
        )

    return {
        "data": IncidentResponse.model_validate(incident).model_dump(),
    }


@router.patch(
    "/{incident_id}",
    dependencies=[Depends(require_role("analyst", "admin"))],
)
def update_incident(
    incident_id: uuid.UUID,
    data: IncidentUpdate,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update incident status, priority, notes, or assignment. Analyst+ only."""
    ip = request.client.host if request.client else None
    incident = incident_service.update_incident(
        incident_id=incident_id, data=data, user=user, db=db, ip_address=ip
    )
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return {
        "data": IncidentResponse.model_validate(incident).model_dump(),
        "message": "Incident updated",
    }
