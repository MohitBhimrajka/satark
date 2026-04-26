# Project Brief: Satark — AI-Powered Cyber Incident Intelligence Portal

## Business Context

**Problem:** India's defence sector (CERT-Army) lacks an AI-enabled, structured platform to receive, analyze, and respond to cyber incidents and suspicious digital content submitted by defence personnel. Incidents arrive in multiple formats (URLs, images, audio recordings, text messages) with no automated triage, classification, or threat scoring.

**Stakeholders:**
- **End Users (Submitters):** Defence personnel, soldiers, civilians who encounter suspicious digital content
- **Analysts (CERT-Army operators):** Cybersecurity officers who review and respond to incidents
- **Admins:** Platform administrators managing users, roles, and platform health

**Problem this solves:** Manual triage of cyber incidents is slow and error-prone. Satark automates classification, severity scoring, IOC extraction, and mitigation playbook generation using AI — enabling CERT-Army to respond faster and at scale.

**Academic Context:** This is a SIH 2025 submission (PS ID: 25210) by a solo student. The professor evaluates:
- Commit frequency and quality (atomic, descriptive, prefixed)
- Functionality and feature completeness
- UI quality and demo-ability
- Deployment on Cloud Run

---

## What We're Building

### Dashboard (Eyes)
- 6 analytics charts: incident type distribution, severity heatmap, geographic origin map, top IOCs, trend line, AI confidence histogram
- Real-time stats: total incidents, active cases, threats detected, avg threat score
- Date range filtering, auto-refresh

### Workbench (Hands)
- Case management queue: sortable, filterable, searchable table of all incidents
- Case detail view: AI analysis results, evidence files, audit trail, analyst controls
- Analyst actions: change status, change priority, add notes, assign, generate PDF report

### AI Engine (Brain)
- 6-modality AI analysis pipeline: text, URL, image, audio, video, document
- Powered by `gemini-3-flash-preview` with structured JSON output (Pydantic schemas)
- Async analysis with status polling
- Auto-classification, threat scoring (0-100), IOC extraction, mitigation playbooks

### Interactive Demo
- "Try It Now" section on landing page: 5 demo tabs (URL, Text, Image, Audio, File)
- Pre-loaded sample threat data for each tab
- Camera integration (getUserMedia) for live photo capture
- Microphone integration (MediaRecorder) for live audio recording
- Results appear in-place without page navigation

---

## Data Model (High-Level)

**Core Entities:**
- `User`: id, email, password_hash, display_name, role (guest/analyst/admin)
- `Incident`: id, case_number (SAT-YYYY-NNNNN), submitted_by (nullable), guest_token, input_type, input_content, status, priority, classification, threat_score, ai_analysis (JSON), analyst_notes, assigned_to
- `EvidenceFile`: id, incident_id, filename, mime_type, file_size, gcs_path, checksum (SHA-256)
- `AuditLog`: id, incident_id, user_id, action, details (JSON), ip_address, created_at

**AI Output Structure (ThreatAnalysis):**
```python
class ThreatAnalysis(BaseModel):
    classification: Literal["phishing", "malware", "fraud", "espionage", "opsec_risk", "safe"]
    threat_score: int  # 0–100
    confidence: float  # 0.0–1.0
    summary: str
    indicators: list[str]  # IOCs: IPs, domains, hashes
    mitigation_steps: list[str]
    risk_factors: list[str]
```

**Feedback loop:** Analyst notes → future prompt context (not yet implemented; planned for v2).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + Python 3.11 |
| Database | PostgreSQL 15 + SQLAlchemy 2.x + Alembic |
| AI | `google-genai` SDK + `gemini-3-flash-preview` |
| Storage | Google Cloud Storage (GCS) + local fallback for dev |
| Auth | JWT (PyJWT) + bcrypt (no Keycloak — standalone project) |
| PDF | ReportLab |
| Frontend | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS + Framer Motion + Radix UI |
| Charts | Recharts 3 |
| Deployment | Google Cloud Run (frontend + backend) + Cloud SQL + GCS |

---

## Integrations

- **Google Gemini API** — all AI analysis (`gemini-3-flash-preview`)
- **Google Cloud Storage** — evidence file storage, report PDFs
- **Google Cloud Run** — hosting for frontend and backend
- **Cloud SQL (PostgreSQL)** — production database

---

## Success Criteria

- Guest can submit an incident and receive AI analysis results within 15 seconds
- All 6 input modalities work: text, URL, image, audio, video, document
- "Try It Now" demo works without login
- Camera and microphone capture work on HTTPS (production)
- All 6 dashboard charts populate with real data
- PDF reports download correctly
- Deployed and publicly accessible on Cloud Run
- 130+ atomic, prefixed git commits

---

## Important Constraints

1. **No Keycloak** — use JWT/bcrypt only (this is not a Supervity project)
2. **Light mode** — premium, government-modern aesthetic (NOT dark mode)
3. **No AI vendor names in UI** — use "AI" not "Gemini" in all user-facing text
4. **Camera/mic require HTTPS** — only work on deployed URL (not localhost HTTP)
5. **Commit discipline** — professor checks git history; every change is a commit
6. **Solo project** — one developer, no team coordination needed
