# Satark — Project Overview

> **सतर्क** (Satark) — *Vigilant. Alert. Watchful.*

## Problem Statement

**SIH 2025 | PS ID: 25210**
**Title:** AI-enabled Cyber Incident & Safety Web Portal for Defence
**Organization:** Ministry of Defence / CERT-Army
**Theme:** Blockchain & Cybersecurity
**Category:** Software

### What the PS Demands

1. Accept multi-format forensic samples (suspicious text messages, URLs, images, audio, video, and files)
2. Analyze inputs using AI/ML models to identify malicious content, espionage patterns, or targeted threat campaigns
3. Provide real-time alerts and recommended mitigation steps to the complainant
4. Generate segregated, priority- and risk-wise lists of incidents for CERT-Army, enabling swift and structured response
5. Maintain role-based access controls, strict audit trails, and compliance with defence data-security norms

### Functional Requirements (from PS)

- Ingest and securely store complaints with forensic evidence
- Perform AI-enabled classification of incidents (fraud, malware, phishing, espionage indicators, OPSEC risk)
- Issue immediate alerts to users when malicious content is detected
- Deliver automated playbook-style mitigation steps to guide users and responders
- Provide CERT-Army with risk-ranked dashboards and actionable intelligence
- Be deployed as a secure web portal (mobile is optional/bonus)

---

## Project Identity

| Field | Value |
|-------|-------|
| **Name** | Satark (सतर्क) |
| **Tagline** | AI-Powered Cyber Incident Intelligence |
| **Theme** | Light mode, premium, government-modern aesthetic |
| **Palette** | Clean whites, deep navy (#0F172A), electric blue (#3B82F6), amber alerts (#F59E0B), red critical (#EF4444), emerald safe (#10B981) |
| **Typography** | Inter (headings) + JetBrains Mono (code/data) |
| **Logo** | Shield + AI circuit motif |

---

## Tech Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | FastAPI | Latest |
| Language | Python | 3.11+ |
| Database | PostgreSQL | 15 (Alpine) |
| ORM | SQLAlchemy | 2.x |
| Migrations | Alembic | Latest |
| AI Engine | Google GenAI SDK (`google-genai`) | Latest |
| AI Model | `gemini-3-flash-preview` | Gemini 3 |
| File Storage | Google Cloud Storage (GCS) | — |
| Auth | JWT (PyJWT) + bcrypt | — |
| PDF Gen | ReportLab or WeasyPrint | — |
| Server | Gunicorn + Uvicorn workers | — |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 15.x |
| Language | TypeScript | 5.8+ |
| UI Library | Radix UI + custom components | — |
| Styling | Tailwind CSS | 3.4+ |
| Charts | Recharts | 3.x |
| Animations | Framer Motion | 11.x |
| Forms | React Hook Form + Zod | — |
| Icons | Lucide React | — |
| State | React Context + SWR or fetch | — |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Containerization | Docker + Docker Compose |
| Deployment | Google Cloud Run |
| Storage | Google Cloud Storage |
| Database (prod) | Cloud SQL (PostgreSQL) |
| CI/CD | GitHub Actions (optional) |

---

## AI Integration Strategy

### Model Selection
- **Primary:** `gemini-3-flash-preview` — Frontier-class, cost-efficient, native multimodal (text + image + audio + video)
- **Fallback:** `gemini-2.5-flash` — Stable, proven, slightly lower capability but fully GA

### Capabilities We Use

| Capability | How We Use It |
|-----------|---------------|
| **Text Analysis** | Classify suspicious messages, extract IOCs (IPs, domains, hashes) |
| **Image Understanding** | Analyze screenshot evidence, detect phishing pages, OCR suspicious documents |
| **Audio Understanding** | Transcribe + analyze audio recordings for social engineering patterns |
| **Video Understanding** | Extract key frames, detect suspicious visual content |
| **Document Processing** | Ingest PDFs/docs, extract text, identify embedded threats |
| **Structured Output** | Force JSON responses matching our Pydantic schemas for reliable parsing |
| **Thinking Mode** | Deep analysis for complex multi-vector threats |

### Structured Output Pattern (Critical)

Every AI analysis call returns a typed, validated response:

```python
from pydantic import BaseModel, Field
from typing import Literal
from google import genai

class ThreatAnalysis(BaseModel):
    classification: Literal["phishing", "malware", "fraud", "espionage", "opsec_risk", "safe"]
    threat_score: int = Field(ge=0, le=100, description="0=safe, 100=critical")
    confidence: float = Field(ge=0, le=1, description="Model confidence in classification")
    summary: str = Field(description="Human-readable summary of findings")
    indicators: list[str] = Field(description="Extracted IOCs: IPs, domains, hashes, etc.")
    mitigation_steps: list[str] = Field(description="Ordered playbook of recommended actions")
    risk_factors: list[str] = Field(description="Specific risk factors identified")

client = genai.Client(api_key=GEMINI_API_KEY)
response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=[prompt, uploaded_content],
    config={
        "response_mime_type": "application/json",
        "response_json_schema": ThreatAnalysis.model_json_schema(),
    },
)
result = ThreatAnalysis.model_validate_json(response.text)
```

### File Upload Strategy

| Input Type | Backend Handling | AI Processing |
|-----------|-----------------|---------------|
| URL | Fetch metadata, screenshot via headless browser | Text + image analysis |
| Text/Message | Store raw text | Direct text analysis |
| Image (PNG/JPG/WEBP) | Store to GCS | `inline_data` with MIME type |
| Audio (MP3/WAV/OGG) | Store to GCS | Audio understanding API |
| Video (MP4/WEBM) | Store to GCS, extract keyframes | Video understanding API |
| Document (PDF/DOCX) | Store to GCS | Document processing API |

---

## User Roles & Access

| Role | Capabilities |
|------|-------------|
| **Guest** | Submit incidents, view own case via shareable link, receive AI analysis |
| **Analyst** | Full workbench: view all cases, filter/sort, change status, add notes, generate reports |
| **Admin** | User management, platform statistics, system configuration |

### Auth Flow
1. **Guest Mode (default):** No login required. Submit → get case ID + shareable link
2. **Sign Up / Sign In:** Email + password. JWT-based sessions
3. **Role assignment:** Admin assigns analyst role via admin panel

---

## Interactive Demo Strategy

> *"The whole point is that it should be demoable. If somebody comes in they should be able to do something."*

### Built-in Demo Scenarios

| Demo | What User Does | What AI Shows |
|------|---------------|---------------|
| 🔗 **Scan a URL** | Paste a suspicious-looking URL (pre-populated examples available) | Classification, threat score, IOC extraction |
| 📸 **Snap a Photo** | Use device camera to capture a screenshot of a phishing email/page | Image analysis, text extraction, threat assessment |
| 🎤 **Record Audio** | Record a short voice clip simulating a vishing call | Transcription + social engineering pattern detection |
| 📄 **Upload a File** | Drag-and-drop a sample PDF (provided) | Document analysis, embedded threat detection |
| 💬 **Paste Text** | Paste a suspicious SMS/email text | NLP classification, urgency assessment |

### Pre-loaded Examples
The landing page will have a **"Try It Now"** section with:
- 3 example phishing URLs (safe, simulated)
- 2 sample phishing email screenshots (PNG)
- 1 sample suspicious PDF document
- Pre-written suspicious SMS texts

Users can click any example and immediately see the AI analysis pipeline in action.

### Camera/Microphone Integration
- **Camera:** HTML5 `getUserMedia` API → capture image → upload to backend → AI analysis
- **Microphone:** HTML5 `MediaRecorder` API → record audio clip → upload → AI transcription + analysis
- Both work in-browser without any plugins

---

## Pages & Routes

### Frontend Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing + "Try It Now" demo | Public |
| `/submit` | Full incident submission form | Public (guest) |
| `/case/:id` | Case detail + AI analysis results | Public (shareable link) |
| `/dashboard` | Analytics dashboard (charts A–F) | Analyst + Admin |
| `/workbench` | Case management queue | Analyst + Admin |
| `/workbench/:id` | Case detail (analyst view with controls) | Analyst + Admin |
| `/reports/:id` | Generated PDF report viewer | Analyst + Admin |
| `/admin` | User management + platform settings | Admin only |
| `/login` | Sign in | Public |
| `/register` | Sign up | Public |

### Backend API Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/incidents` | Submit new incident (guest or authenticated) |
| `GET` | `/api/incidents/:id` | Get incident details + AI analysis |
| `GET` | `/api/incidents` | List all incidents (analyst+) |
| `PATCH` | `/api/incidents/:id` | Update status, add notes (analyst+) |
| `GET` | `/api/incidents/:id/report` | Generate/download PDF report |
| `POST` | `/api/analyze/url` | Quick URL scan |
| `POST` | `/api/analyze/text` | Quick text analysis |
| `POST` | `/api/analyze/file` | Quick file upload + analysis |
| `GET` | `/api/dashboard/stats` | Aggregated dashboard stats |
| `GET` | `/api/dashboard/charts/:type` | Chart-specific data (A–F) |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/me` | Current user info |
| `GET` | `/api/admin/users` | List users (admin) |
| `PATCH` | `/api/admin/users/:id` | Update user role (admin) |
| `GET` | `/api/health` | Health check |

---

## Database Schema (High-Level)

### Core Entities

```
User
├── id (UUID)
├── email (unique)
├── password_hash
├── display_name
├── role (guest | analyst | admin)
├── created_at
└── updated_at

Incident
├── id (UUID)
├── case_number (human-readable, e.g., SAT-2026-00001)
├── submitted_by (FK → User, nullable for guests)
├── guest_token (for anonymous tracking)
├── input_type (url | text | image | audio | video | document)
├── input_content (text content or URL)
├── evidence_files[] (FK → EvidenceFile)
├── status (pending | analyzing | reviewed | escalated | closed)
├── priority (low | medium | high | critical)
├── classification (phishing | malware | fraud | espionage | opsec_risk | safe)
├── threat_score (0-100)
├── ai_analysis (JSON - full ThreatAnalysis)
├── analyst_notes (text)
├── assigned_to (FK → User, nullable)
├── created_at
└── updated_at

EvidenceFile
├── id (UUID)
├── incident_id (FK → Incident)
├── filename
├── mime_type
├── file_size
├── gcs_path
├── uploaded_at
└── checksum (SHA-256)

AuditLog
├── id (UUID)
├── incident_id (FK → Incident, nullable)
├── user_id (FK → User, nullable)
├── action (created | analyzed | status_changed | note_added | report_generated)
├── details (JSON)
├── ip_address
└── created_at
```

---

## Dashboard Charts (All 6)

| ID | Chart | Data Source |
|----|-------|------------|
| A | Total incidents by type (donut) | `GROUP BY classification` |
| B | Threat severity heatmap over time (calendar) | `GROUP BY date, threat_score_bucket` |
| C | Geographic origin map (India map with pins) | IP geolocation of submitters |
| D | Top IOCs table (most flagged IPs/domains) | `ai_analysis.indicators` aggregation |
| E | Daily/weekly incident trend line | `GROUP BY date` time series |
| F | AI confidence score distribution (histogram) | `ai_analysis.confidence` buckets |

---

## Report Generation (Module 5)

Each case can generate a downloadable PDF containing:
1. **Header:** Satark logo, case number, date, classification badge
2. **Incident Summary:** Input type, submission date, submitter info
3. **AI Analysis:** Classification, threat score (visual gauge), confidence
4. **Findings:** Extracted IOCs, risk factors
5. **Mitigation Playbook:** Numbered steps
6. **Evidence Log:** List of uploaded files with checksums
7. **Audit Trail:** Timeline of all actions on this case
8. **Footer:** Generated by Satark AI Intelligence Platform

---

## Commit Strategy

Every commit must be:
- **Atomic:** One logical change per commit
- **Prefixed:** `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`, `test:`
- **Descriptive:** Clear message explaining WHAT and WHY

### Target: 120–150+ commits across all phases

Example commit sequence for a feature:
```
feat: add Incident SQLAlchemy model with all fields
feat: add Incident Pydantic schemas (create, read, update)
feat: add incident service with CRUD operations
feat: add incident router with POST /api/incidents
test: add unit tests for incident service
feat: add file upload to GCS in incident submission
feat: integrate AI analysis pipeline into incident creation
style: add loading skeleton for incident detail page
docs: update API documentation for incident endpoints
```

---

## What Needs to Change from Template

The current codebase is a generic full-stack template. Here is what changes:

### Backend
- [ ] Remove: `Item` model, schema, routes (template demo)
- [ ] Remove: GeoIP dependency (not needed)
- [ ] Remove: Template-specific auth (`security.py` simplified auth)
- [ ] Add: All Satark models (User, Incident, EvidenceFile, AuditLog)
- [ ] Add: AI service layer (`app/services/ai/`)
- [ ] Add: GCS integration (`app/services/storage/`)
- [ ] Add: JWT auth system
- [ ] Add: Report generation service
- [ ] Update: `main.py` → Satark-branded, new routers
- [ ] Update: `.env.example` → add `GEMINI_API_KEY`, `GCS_BUCKET_NAME`
- [ ] Update: `requirements.txt` → add `google-genai`, `PyJWT`, `bcrypt`, `reportlab`

### Frontend
- [ ] Remove: All template pages and components
- [ ] Add: Complete Satark UI (landing, submit, case view, dashboard, workbench, admin)
- [ ] Update: `package.json` name → `satark`
- [ ] Update: Design system (colors, typography, spacing)
- [ ] Add: Camera/microphone integration components
- [ ] Add: Chart components (Recharts)
- [ ] Add: File upload with drag-and-drop

### Agent Rules
- [ ] Update: All `.agents/rules/` files to reflect Satark context (not generic template)
- [ ] Update: Workflow files for Satark-specific patterns
- [ ] Remove: References to template-specific patterns

### Infrastructure
- [ ] Update: `docker-compose.yml` → add GCS emulator for local dev
- [ ] Update: `Dockerfile` → ensure `google-genai` installs
- [ ] Add: Cloud Run deployment config
- [ ] Add: GCS bucket terraform/script
