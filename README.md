# Satark (सतर्क) — AI-Powered Cyber Incident Intelligence Portal

> **Smart India Hackathon 2025** | Problem Statement ID: **25210**
> **Organization:** Ministry of Defence / CERT-Army
> **Theme:** Blockchain & Cybersecurity

---

## Team

| Name | Roll No | GitHub |
|------|---------|--------|
| Mohit Bhimrajka | 2304572 | [@MohitBhimrajka](https://github.com/MohitBhimrajka) |

**Guide / Faculty:** Yogesh Haridas Jadhav

---

## What Is Satark?

Satark is an AI-powered web portal that enables defence personnel and civilians to submit suspicious digital content — URLs, text messages, images, audio recordings, videos, and documents — for automated threat analysis. The system uses AI to classify threats, score severity, extract Indicators of Compromise (IOCs), and generate step-by-step mitigation playbooks. Analysts access a workbench to triage incidents, while admins monitor threat trends via a real-time analytics dashboard.

---

## Live Demo

| Service | URL |
|---------|-----|
| 🌐 Frontend | [satark.mohitbhimrajka.com](https://satark.mohitbhimrajka.com) |
| ⚙️ Backend API | [satark-backend-1094555524365.asia-southeast1.run.app](https://satark-backend-1094555524365.asia-southeast1.run.app) |
| 📖 API Docs | [/docs](https://satark-backend-1094555524365.asia-southeast1.run.app/docs) |
| ❤️ Health | [/health](https://satark-backend-1094555524365.asia-southeast1.run.app/health) |

**Demo Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@satark.gov.in` | `Admin@123` |
| Analyst | `analyst@satark.gov.in` | `Analyst@123` |

---

## Problem Statement

**PS ID:** 25210
**Title:** AI-enabled Cyber Incident & Safety Web Portal for Defence

India's defence sector (CERT-Army) lacks an AI-enabled, structured platform to receive, analyze, and respond to cyber incidents and suspicious digital content submitted by defence personnel. Currently:

- Incidents arrive in multiple formats with no standardized intake
- Manual triage is slow, error-prone, and doesn't scale
- No automated classification or severity scoring exists
- Response playbooks are created manually for each incident
- No centralized dashboard for threat intelligence

### What the PS Demands

1. Accept multi-format forensic samples (text, URLs, images, audio, video, documents)
2. Analyze inputs using AI/ML to identify malicious content, espionage patterns, and targeted threat campaigns
3. Provide real-time alerts and recommended mitigation steps
4. Generate segregated, priority- and risk-wise lists of incidents for CERT-Army
5. Maintain role-based access controls, strict audit trails, and compliance with defence data-security norms

---

## Key Features

| Feature | Description |
|---------|-------------|
| **6-Modality AI Analysis** | Text, URL, image, audio, video, and document analysis |
| **URL Intelligence** | Google Search grounding + URL Context for real-time domain reputation |
| **Threat Scoring** | AI-generated 0–100 severity score with confidence metrics |
| **Analytics Dashboard** | 6 interactive charts — classification distribution, severity trends, IOC rankings |
| **Case Management Workbench** | Filterable incident queue with analyst controls (status, notes, assignment) |
| **PDF Report Generation** | 9-section branded threat reports downloadable per incident |
| **Camera/Mic Capture** | In-browser photo capture and audio recording for evidence submission |
| **Role-Based Access** | Guest (anonymous), Analyst, Admin roles with JWT authentication |
| **Audit Trail** | Complete action history on every incident |
| **"Try It Now" Demo** | Landing page with pre-loaded threat samples for instant AI analysis |

---

## How It Works

1. **Guest submits suspicious content** — a phishing SMS, malicious URL, suspicious image, audio recording, video clip, or document
2. **AI analyzes the content** — classifies the threat, scores severity (0–100), extracts IOCs (IPs, domains, hashes), and generates a step-by-step mitigation playbook
3. **Analyst triages from the workbench** — views AI results, adds notes, changes status, escalates, downloads PDF reports
4. **Admin monitors the dashboard** — 6 analytics charts showing threat distribution, severity trends, geographic origin, and more

All analysis is asynchronous — submissions return immediately while the AI processes in the background. The frontend polls every 2 seconds until results are ready.

---

## Architecture

```
┌─────────────┐     HTTPS      ┌──────────────────┐
│  Next.js 15  │◄──────────────►│   FastAPI 3.11   │
│  (React 19)  │   REST API    │   (Gunicorn)     │
│  Cloud Run   │               │   Cloud Run      │
└─────────────┘               └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
              ┌─────▼─────┐   ┌───────▼───────┐  ┌──────▼──────┐
              │ Cloud SQL  │   │ AI Service    │  │    GCS      │
              │ PostgreSQL │   │ (Gemini 3     │  │  Evidence   │
              │    15      │   │  Flash)       │  │  Storage    │
              └───────────┘   └───────────────┘  └─────────────┘
```

*Three-tier architecture — Next.js 15 (Presentation), FastAPI (Application), PostgreSQL + GCS + AI API (Data) — deployed on Google Cloud Run.*

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Python 3.11 + FastAPI | REST API, async analysis orchestration |
| Frontend | Next.js 15 + React 19 + TypeScript | App Router, server/client components |
| Database | PostgreSQL 15 + SQLAlchemy 2.x + Alembic | ORM, migrations, case number sequences |
| AI | Google GenAI SDK | 6-modality threat analysis with structured output |
| Auth | PyJWT + bcrypt | JWT tokens, role-based access (guest/analyst/admin) |
| Storage | Google Cloud Storage | Evidence files, SHA-256 checksums |
| Reports | ReportLab | Branded 9-section PDF threat reports |
| Styling | Tailwind CSS + Framer Motion + Radix UI | Animations, accessible components |
| Charts | Recharts 3 | 6 dashboard chart types |
| Deployment | Google Cloud Run + Cloud SQL + GCS + Secret Manager | Serverless, auto-scaling |

---

## AI Analysis Pipeline

Satark supports **6 input modalities**, each with a specialized analyzer:

| Input Type | What It Analyzes | Special Features |
|-----------|------------------|------------------|
| **Text** | SMS, email, chat messages | Phishing pattern detection |
| **URL** | Websites, links | Google Search grounding + URL Context (visits the page) |
| **Image** | Screenshots, photos | OCR + visual analysis |
| **Audio** | Voice recordings, calls | Speech-to-text + intent analysis |
| **Video** | Screen recordings, clips | Frame analysis + audio extraction |
| **Document** | PDFs, Word, Excel | Content extraction + embedded threat detection |

Every analysis returns a structured `ThreatAnalysis` result:

```json
{
  "classification": "phishing",
  "threat_score": 85,
  "confidence": 0.92,
  "summary": "This SMS contains a phishing attempt...",
  "indicators": ["suspicious-domain.com", "185.234.x.x"],
  "mitigation_steps": ["Do not click the link", "Block the sender", "..."],
  "risk_factors": ["Urgency language", "Suspicious domain", "..."]
}
```

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/incidents` | None | Submit incident (guest mode) |
| `GET` | `/api/incidents` | analyst+ | List with filters + pagination |
| `GET` | `/api/incidents/:id` | guest_token or analyst+ | Get incident detail |
| `PATCH` | `/api/incidents/:id` | analyst+ | Update status/notes |
| `GET` | `/api/incidents/:id/report` | guest_token or analyst+ | Download PDF report |
| `POST` | `/api/analyze/url` | None | Quick URL scan (no DB) |
| `POST` | `/api/analyze/text` | None | Quick text scan (no DB) |
| `POST` | `/api/analyze/file` | None | Quick file scan (no DB) |
| `GET` | `/api/dashboard/stats` | analyst+ | Platform statistics |
| `GET` | `/api/dashboard/charts/:type` | analyst+ | Chart data (types A–F) |
| `POST` | `/api/auth/register` | None | Register new user |
| `POST` | `/api/auth/login` | None | Login → JWT token |
| `GET` | `/api/auth/me` | authenticated | Current user profile |
| `GET` | `/api/admin/users` | admin | List all users |
| `GET` | `/api/admin/stats` | admin | Admin statistics |
| `PATCH` | `/api/admin/users/:id` | admin | Update user role |
| `GET` | `/health` | None | Health check |

All responses follow a standard envelope:

```json
// Success
{ "data": { ... }, "message": "..." }

// Error
{ "error": { "code": "NOT_FOUND", "message": "...", "details": [] } }
```

---

## Local Development

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (required)
- [Git](https://git-scm.com/downloads)
- A [Gemini API key](https://aistudio.google.com/apikey) for AI analysis

### Quick Start

```bash
# 1. Clone
git clone https://github.com/MohitBhimrajka/satark.git
cd satark

# 2. Configure environment
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY

# 3. Start all services
make up

# 4. Access
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs

# 5. Seed demo data (optional)
make seed        # Baseline users (admin + analyst)
make seed-demo   # 20 demo incidents for presentation
```

### Development Commands

```bash
# ── Services ───────────────────────────────────
make up                # Start postgres + backend + frontend
make down              # Stop all services
make logs-be           # Tail backend logs
make logs-fe           # Tail frontend logs
make restart-be        # Restart backend only
make restart-fe        # Restart frontend only

# ── Database ───────────────────────────────────
make reset-db          # Wipe and re-init
make seed              # Seed baseline data (admin + analyst users)
make seed-demo         # Seed 20 demo incidents for presentation
make migrate-create MSG='description'  # Create new Alembic migration
make migrate-up        # Apply all pending migrations
make migrate-down      # Rollback one migration
make migrate-history   # Show migration chain

# ── Code Quality ───────────────────────────────
make format            # Format Python (black+isort) + JS (prettier)
make lint              # Lint Python (flake8) + JS (eslint)
make test-be           # Run backend tests (pytest)

# ── Deployment ─────────────────────────────────
make deploy            # Deploy both services to Cloud Run
make deploy-backend    # Deploy backend only
make deploy-frontend   # Deploy frontend only
make deploy-status     # Show Cloud Run service status
make setup-secrets     # Create Secret Manager secrets (interactive)
```

---

## Project Structure

```
satark/
├── app/                          # FastAPI backend
│   ├── core/
│   │   ├── settings.py           # Pydantic Settings (env vars)
│   │   ├── database.py           # SQLAlchemy engine + get_db()
│   │   ├── constants.py          # PRIORITY_MAP, score_to_priority()
│   │   └── logging_config.py     # Structured logging setup
│   ├── models/                   # SQLAlchemy ORM models
│   │   ├── user.py               # User (guest/analyst/admin roles)
│   │   ├── incident.py           # Incident (SAT-YYYY-NNNNN case numbers)
│   │   ├── evidence_file.py      # EvidenceFile (SHA-256 checksums)
│   │   └── audit_log.py          # AuditLog (full action history)
│   ├── schemas/                  # Pydantic request/response schemas
│   ├── routers/                  # FastAPI routers (thin, delegate to services)
│   │   ├── auth.py               # /api/auth/*
│   │   ├── incidents.py          # /api/incidents/*
│   │   ├── analyze.py            # /api/analyze/* (quick scan, no auth)
│   │   ├── dashboard.py          # /api/dashboard/*
│   │   └── admin.py              # /api/admin/*
│   ├── services/
│   │   ├── ai/                   # AI analysis pipeline
│   │   │   ├── client.py         # AI client (singleton, retry, semaphore)
│   │   │   ├── schemas.py        # ThreatAnalysis structured output
│   │   │   ├── prompts.py        # 6 prompt templates
│   │   │   ├── orchestrator.py   # Routes to analyzer, updates incident
│   │   │   └── analyzers/        # text, url, image, audio, video, document
│   │   ├── auth.py               # JWT creation, bcrypt hashing
│   │   ├── incident.py           # Incident CRUD + file uploads
│   │   ├── dashboard.py          # Stats + 6 chart data aggregations
│   │   ├── storage.py            # GCS / local filesystem dual backend
│   │   ├── audit.py              # Audit trail logging
│   │   └── report.py             # PDF generation (ReportLab, 9 sections)
│   ├── security.py               # get_current_user, require_role()
│   └── main.py                   # App init, CORS, exception handlers
│
├── frontend/src/                 # Next.js 15 frontend
│   ├── app/
│   │   ├── (public)/             # No sidebar: landing, submit, case, login, register
│   │   └── (protected)/          # With sidebar: dashboard, workbench, admin
│   ├── components/
│   │   ├── landing/              # Hero, StatsBar, TryItNow, HowItWorks, Footer
│   │   ├── analysis/             # ThreatScore gauge, IOCList, MitigationPlaybook
│   │   ├── incidents/            # SubmitForm, IncidentCard, ReportDownloadButton
│   │   ├── dashboard/            # StatCard, Charts A–F
│   │   ├── workbench/            # WorkbenchList, WorkbenchDetail
│   │   ├── media/                # CameraCapture, AudioRecorder
│   │   ├── layout/               # Navbar, Sidebar, Header
│   │   └── ui/                   # Badge, StatusBadge, Skeleton, EmptyState
│   ├── hooks/                    # useAuth, usePolling, useIncidents, useCopyToClipboard
│   ├── contexts/                 # AuthContext (JWT + role state)
│   ├── lib/                      # api-client, utils, constants
│   ├── types/                    # TypeScript interfaces (7 files)
│   └── data/                     # demo-samples.json
│
├── tests/                        # 52 backend tests (pytest)
├── scripts/                      # seed_db, seed_demo_data, reset_db, migration_utils
├── deployment/                   # satark-deploy.sh, cloudbuild.yaml, prod.example.env
├── alembic/                      # Database migrations
├── docker-compose.yml            # PostgreSQL + backend + frontend
├── Dockerfile                    # Backend container (Python 3.11)
├── frontend/Dockerfile           # Frontend container (3-stage standalone)
├── Makefile                      # 18 development + deployment targets
└── .env.example                  # All required environment variables
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `GEMINI_API_KEY` | ✅ | — | AI API key for threat analysis |
| `JWT_SECRET_KEY` | ✅ | — | Secret for JWT signing (`openssl rand -hex 32`) |
| `APP_ENV` | No | `development` | `development` / `production` |
| `LOG_LEVEL` | No | `INFO` | `DEBUG` / `INFO` / `WARNING` / `ERROR` |
| `AI_MODEL` | No | `gemini-3-flash-preview` | AI model identifier |
| `AI_CONCURRENCY_LIMIT` | No | `5` | Max parallel AI calls (rate limit guard) |
| `STORAGE_BACKEND` | No | `local` | `local` (dev) or `gcs` (production) |
| `GCS_BUCKET_NAME` | No | `satark-evidence` | GCS bucket for evidence files |
| `LOCAL_UPLOAD_DIR` | No | `/app/uploads` | Local file upload directory |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `JWT_EXPIRATION_MINUTES` | No | `1440` | Token expiry (default: 24 hours) |
| `FRONTEND_URL` | No | `http://localhost:3000` | CORS origin |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000` | Backend URL for frontend |

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| **Average analysis time** | 8–12 seconds |
| **Maximum analysis time** | 15 seconds (video/large files) |
| **API response time** (submission) | <200ms |
| **Frontend polling interval** | 2 seconds |
| **Backend test suite** | 52 tests, all passing |
| **Frontend build** | 0 errors, 0 warnings, 10 routes |
| **Total commits** | 112+ atomic, prefixed commits |
| **Backend Python files** | 43 files |
| **Frontend TypeScript files** | 89 files |

---

## Testing

```bash
# Run all 52 backend tests
make test-be

# Frontend lint + build
cd frontend && npm run lint && npm run build
```

```
tests/test_main.py       ✓ 2 tests   (health check, root endpoint)
tests/test_auth.py       ✓ 5 tests   (register, login, me, duplicate, invalid)
tests/test_incidents.py  ✓ 7 tests   (create, list, get, update, guest access)
tests/test_dashboard.py  ✓ 3 tests   (stats, charts, auth required)
tests/test_admin.py      ✓ 3 tests   (list users, update role, auth required)
tests/test_ai_pipeline.py ✓ 19 tests (all 6 analyzers, orchestrator, client)
tests/test_report.py     ✓ 7 tests   (PDF generation, endpoint, audit logging)
─────────────────────────────────────
Total:                   52 tests ✅ ALL PASSING
```

---

## Deployment

Satark is deployed on **Google Cloud Run** (asia-southeast1) with Cloud SQL, GCS, and Secret Manager.

```bash
# Full deployment (backend + frontend)
make deploy

# Individual service deployment
make deploy-backend
make deploy-frontend

# Check status
make deploy-status
```

See [`deployment/`](./deployment/) for the complete deployment guide including Cloud SQL setup, Secret Manager configuration, and CI/CD pipeline.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| JWT + bcrypt (not Keycloak) | Standalone project — Keycloak adds unnecessary complexity |
| Polling (not WebSocket) | Simpler, stateless; analyses complete in 5–15 seconds |
| ReportLab (not WeasyPrint) | Pure Python, no system deps, lightweight Docker image |
| Local filesystem fallback | No GCS emulator needed in dev; `/app/uploads` + StaticFiles |
| PostgreSQL SEQUENCE for case numbers | Thread-safe auto-increment (not MAX+1 which has race conditions) |
| AI determines all classifications | No hardcoded thresholds — only display mapping in code |

Full decision log: [`docs/memory-bank/decisionLog.md`](./docs/memory-bank/decisionLog.md)

---

## Documentation

Full project documentation is available on the **[GitHub Wiki](https://github.com/MohitBhimrajka/satark/wiki)**:

| Page | Description |
|------|-------------|
| [Home](https://github.com/MohitBhimrajka/satark/wiki) | Project overview, objectives, features |
| [Introduction](https://github.com/MohitBhimrajka/satark/wiki/Introduction) | Background, motivation, existing systems |
| [Objectives & Scope](https://github.com/MohitBhimrajka/satark/wiki/Objectives-and-Scope) | Project objectives and scope definition |
| [Literature Survey](https://github.com/MohitBhimrajka/satark/wiki/Literature-Survey) | Related work and literature review |
| [System Architecture](https://github.com/MohitBhimrajka/satark/wiki/System-Architecture) | 3-tier architecture, ER diagram, modules |
| [Technologies Used](https://github.com/MohitBhimrajka/satark/wiki/Technologies-Used) | Full tech stack with versions |
| [Methodology](https://github.com/MohitBhimrajka/satark/wiki/Methodology) | Development methodology |
| [Implementation](https://github.com/MohitBhimrajka/satark/wiki/Implementation) | Code structure, key snippets, integration details |
| [Results & Output](https://github.com/MohitBhimrajka/satark/wiki/Results) | Screenshots, performance metrics, test results |
| [Challenges](https://github.com/MohitBhimrajka/satark/wiki/Challenges) | Challenges and limitations |
| [Future Scope](https://github.com/MohitBhimrajka/satark/wiki/Future-Scope) | Planned enhancements |
| [Conclusion](https://github.com/MohitBhimrajka/satark/wiki/Conclusion) | Summary, key learnings, final outcome |
| [References](https://github.com/MohitBhimrajka/satark/wiki/References) | Citations and references |
| [Demo](https://github.com/MohitBhimrajka/satark/wiki/Demo) | Live demo, credentials, walkthrough |

---

## License

Built for Smart India Hackathon 2025 — educational and demonstration purposes.
