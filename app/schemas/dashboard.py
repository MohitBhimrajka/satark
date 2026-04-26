# app/schemas/dashboard.py
"""Satark — Dashboard and chart data schemas."""
from pydantic import BaseModel


class DashboardStats(BaseModel):
    """GET /api/dashboard/stats response."""

    total_incidents: int
    by_status: dict[str, int]
    by_priority: dict[str, int]
    by_classification: dict[str, int]
    avg_threat_score: float | None = None


class ChartDataPoint(BaseModel):
    """Single data point for chart rendering."""

    label: str
    value: float


class ChartData(BaseModel):
    """GET /api/dashboard/charts/:type response."""

    chart_type: str
    data: list[ChartDataPoint]


class TimeSeriesPoint(BaseModel):
    """Date-count pair for trend charts."""

    date: str
    count: int
