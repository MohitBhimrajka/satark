# app/routers/dashboard.py
"""
Satark — Dashboard router.
Stats and chart data for the analytics dashboard. Analyst+ only.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.security import require_role
from app.services import dashboard as dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

VALID_CHART_TYPES = {
    "incidents_by_type",
    "classification_breakdown",
    "severity_distribution",
    "status_overview",
    "trend_line",
    "confidence_distribution",
}


@router.get("/stats", dependencies=[Depends(require_role("analyst", "admin"))])
def get_stats(db: Session = Depends(get_db)):
    """Platform-wide aggregated statistics."""
    stats = dashboard_service.get_stats(db)
    return {"data": stats.model_dump()}


@router.get(
    "/charts/{chart_type}",
    dependencies=[Depends(require_role("analyst", "admin"))],
)
def get_chart_data(
    chart_type: str,
    db: Session = Depends(get_db),
):
    """Chart-specific data for dashboard visualizations."""
    if chart_type not in VALID_CHART_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid chart type. Must be one of: {', '.join(sorted(VALID_CHART_TYPES))}",
        )

    data = dashboard_service.get_chart_data(chart_type, db)
    return {"data": data.model_dump()}
