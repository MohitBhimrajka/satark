# tests/test_report.py
"""
Satark — PDF Report generation tests.
Tests both the generate_report service function and the API endpoint.
"""
import uuid

from tests.conftest import auth_header

from app.models.audit_log import AuditLog
from app.models.evidence_file import EvidenceFile
from app.models.incident import Incident
from app.services.report import generate_report


def _create_incident(db, *, with_analysis=True, with_evidence=False, with_audit=False):
    """Helper to create a test incident with optional relations."""
    incident = Incident(
        case_number="SAT-2026-00001",
        input_type="text",
        input_content="URGENT: Click http://fake-bank.tk/verify to avoid block.",
        description="Suspicious SMS reported by unit member.",
        status="analyzed" if with_analysis else "submitted",
        priority="high" if with_analysis else None,
        classification="phishing" if with_analysis else None,
        threat_score=85 if with_analysis else None,
        confidence=0.92 if with_analysis else None,
        guest_token=str(uuid.uuid4()),
    )

    if with_analysis:
        incident.ai_analysis = {
            "classification": "phishing",
            "threat_score": 85,
            "confidence": 0.92,
            "summary": "This message contains classic phishing indicators targeting bank credentials.",
            "indicators": ["fake-bank.tk", ".tk TLD", "urgency language"],
            "mitigation_steps": [
                "Do not click the link",
                "Report to IT security",
                "Block the sender",
            ],
            "risk_factors": [
                "Suspicious .tk domain",
                "Urgency-based social engineering",
                "Impersonates banking institution",
            ],
        }

    db.add(incident)
    db.flush()

    if with_evidence:
        ef = EvidenceFile(
            incident_id=incident.id,
            filename="abc123.png",
            original_filename="screenshot.png",
            mime_type="image/png",
            file_size=245000,
            storage_path="/app/uploads/abc123.png",
            checksum="a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
        )
        db.add(ef)

    if with_audit:
        log = AuditLog(
            incident_id=incident.id,
            actor_label="SYSTEM",
            action="created",
            details={"input_type": "text"},
        )
        db.add(log)

    db.commit()
    db.refresh(incident)
    return incident


class TestGenerateReport:
    """Tests for the generate_report service function."""

    def test_analyzed_incident_produces_valid_pdf(self, db):
        """Full incident with analysis generates a valid PDF."""
        incident = _create_incident(
            db, with_analysis=True, with_evidence=True, with_audit=True
        )
        pdf = generate_report(incident)
        assert isinstance(pdf, bytes)
        assert len(pdf) > 0
        assert pdf[:5] == b"%PDF-"

    def test_pending_incident_still_generates(self, db):
        """Incident without AI analysis should still produce a PDF."""
        incident = _create_incident(db, with_analysis=False)
        pdf = generate_report(incident)
        assert isinstance(pdf, bytes)
        assert pdf[:5] == b"%PDF-"

    def test_no_evidence_no_audit(self, db):
        """Incident with no evidence or audit logs produces valid PDF."""
        incident = _create_incident(
            db, with_analysis=True, with_evidence=False, with_audit=False
        )
        pdf = generate_report(incident)
        assert isinstance(pdf, bytes)
        assert pdf[:5] == b"%PDF-"


class TestReportEndpoint:
    """Tests for the GET /api/incidents/:id/report endpoint."""

    def test_requires_auth(self, client, db):
        """Report endpoint returns 401 without authentication."""
        incident = _create_incident(db, with_analysis=True)
        response = client.get(f"/api/incidents/{incident.id}/report")
        assert response.status_code == 401

    def test_analyst_can_download(self, client, db, analyst_token):
        """Analyst can download a report successfully."""
        incident = _create_incident(db, with_analysis=True)
        response = client.get(
            f"/api/incidents/{incident.id}/report",
            headers=auth_header(analyst_token),
        )
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "satark-SAT-2026-00001.pdf" in response.headers["content-disposition"]
        assert response.content[:5] == b"%PDF-"

    def test_not_found(self, client, analyst_token):
        """Returns 404 for non-existent incident."""
        fake_id = str(uuid.uuid4())
        response = client.get(
            f"/api/incidents/{fake_id}/report",
            headers=auth_header(analyst_token),
        )
        assert response.status_code == 404

    def test_audit_log_created(self, client, db, analyst_token, analyst_user):
        """Downloading a report creates a report_generated audit entry."""
        incident = _create_incident(db, with_analysis=True)
        client.get(
            f"/api/incidents/{incident.id}/report",
            headers=auth_header(analyst_token),
        )

        log = (
            db.query(AuditLog)
            .filter(
                AuditLog.incident_id == incident.id,
                AuditLog.action == "report_generated",
            )
            .first()
        )
        assert log is not None
        assert log.user_id == analyst_user.id
        assert log.details == {"format": "pdf"}
