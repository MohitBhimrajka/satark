# app/services/dashboard.py
"""
Satark — Dashboard service.
Aggregation queries for stats and chart data.
"""
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.incident import Incident
from app.schemas.dashboard import ChartData, ChartDataPoint, DashboardStats


def get_stats(db: Session) -> DashboardStats:
    """Get aggregated platform statistics."""
    total = db.query(func.count(Incident.id)).scalar() or 0

    status_rows = (
        db.query(Incident.status, func.count(Incident.id))
        .group_by(Incident.status)
        .all()
    )
    by_status = {row[0]: row[1] for row in status_rows}

    priority_rows = (
        db.query(Incident.priority, func.count(Incident.id))
        .filter(Incident.priority.isnot(None))
        .group_by(Incident.priority)
        .all()
    )
    by_priority = {row[0]: row[1] for row in priority_rows}

    classification_rows = (
        db.query(Incident.classification, func.count(Incident.id))
        .filter(Incident.classification.isnot(None))
        .group_by(Incident.classification)
        .all()
    )
    by_classification = {row[0]: row[1] for row in classification_rows}

    avg_score = (
        db.query(func.avg(Incident.threat_score))
        .filter(Incident.threat_score.isnot(None))
        .scalar()
    )

    return DashboardStats(
        total_incidents=total,
        by_status=by_status,
        by_priority=by_priority,
        by_classification=by_classification,
        avg_threat_score=round(float(avg_score), 1) if avg_score else None,
    )


def get_chart_data(
    chart_type: str,
    db: Session,
) -> ChartData:
    """Get chart-specific data for dashboard visualizations."""
    if chart_type == "incidents_by_type":
        rows = (
            db.query(Incident.input_type, func.count(Incident.id))
            .group_by(Incident.input_type)
            .all()
        )
        data = [ChartDataPoint(label=r[0], value=r[1]) for r in rows]

    elif chart_type == "classification_breakdown":
        rows = (
            db.query(Incident.classification, func.count(Incident.id))
            .filter(Incident.classification.isnot(None))
            .group_by(Incident.classification)
            .all()
        )
        data = [ChartDataPoint(label=r[0], value=r[1]) for r in rows]

    elif chart_type == "severity_distribution":
        rows = (
            db.query(Incident.priority, func.count(Incident.id))
            .filter(Incident.priority.isnot(None))
            .group_by(Incident.priority)
            .all()
        )
        data = [ChartDataPoint(label=r[0], value=r[1]) for r in rows]

    elif chart_type == "status_overview":
        rows = (
            db.query(Incident.status, func.count(Incident.id))
            .group_by(Incident.status)
            .all()
        )
        data = [ChartDataPoint(label=r[0], value=r[1]) for r in rows]

    elif chart_type == "trend_line":
        rows = (
            db.query(
                func.date_trunc("day", Incident.created_at).label("day"),
                func.count(Incident.id),
            )
            .group_by("day")
            .order_by("day")
            .limit(30)
            .all()
        )
        data = [
            ChartDataPoint(label=r[0].strftime("%Y-%m-%d"), value=r[1])
            for r in rows
        ]

    elif chart_type == "confidence_distribution":
        rows = (
            db.query(
                func.floor(Incident.confidence * 10).label("bucket"),
                func.count(Incident.id),
            )
            .filter(Incident.confidence.isnot(None))
            .group_by("bucket")
            .order_by("bucket")
            .all()
        )
        data = [
            ChartDataPoint(
                label=f"{int(r[0] * 10)}-{int(r[0] * 10 + 10)}%",
                value=r[1],
            )
            for r in rows
        ]

    else:
        data = []

    return ChartData(chart_type=chart_type, data=data)
