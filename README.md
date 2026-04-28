# Satark (सतर्क) — AI-Powered Cyber Incident Intelligence Portal

> **Smart India Hackathon 2025** | Problem Statement ID: **25210**
>
> An AI-powered portal for defence personnel to submit, analyze, and respond to cyber incidents and suspicious digital content — with automated threat classification, IOC extraction, and mitigation playbook generation.

---

## Live Demo

| Service | URL |
|---------|-----|
| 🌐 Frontend | [satark.mohitbhimrajka.com](satark.mohitbhimrajka.com) |
| ⚙️ Backend API | [satark-backend-1094555524365.asia-south1.run.app](https://satark-backend-1094555524365.asia-south1.run.app) |
| 📖 API Docs | [/docs](https://satark-backend-1094555524365.asia-south1.run.app/docs) |
| ❤️ Health | [/health](https://satark-backend-1094555524365.asia-south1.run.app/health) |

**Demo Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@satark.gov.in` | `Admin@123` |
| Analyst | `analyst@satark.gov.in` | `Analyst@123` |

---

## What It Does

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

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Python 3.11 + FastAPI | REST API, async analysis orchestration |
| Frontend | Next.js 15 + React 19 + TypeScript | App Router, server/client components |
| Database | PostgreSQL 15 + SQLAlchemy 2.x + Alembic | ORM, migrations, case number sequences |
| AI | Google GenAI SDK + Gemini 3 Flash | 6-modality threat analysis with structured output |
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

### Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/satark.git
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
│   │   │   ├── client.py         # Gemini client (singleton, retry, semaphore)
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
| `GEMINI_API_KEY` | ✅ | — | Google AI API key for threat analysis |
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

## Deployment

Satark is deployed on **Google Cloud Run** with Cloud SQL, GCS, and Secret Manager.

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

## Testing

```bash
# Run all 52 backend tests
make test-be

# Frontend lint + build
cd frontend && npm run lint && npm run build
```

Test coverage includes: authentication, incident CRUD, dashboard aggregations, admin operations, AI pipeline (mocked), and PDF report generation.

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

## License

Built for Smart India Hackathon 2025 — educational and demonstration purposes.
