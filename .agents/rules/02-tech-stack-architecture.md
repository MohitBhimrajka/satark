---
trigger: model_decision
description: Reference when making decisions about backend/frontend technology choices, folder structure, adding new services, or architectural patterns
---

# 1. Backend Tech Stack
- **Language:** Python 3.11
- **Framework:** FastAPI (async-capable, dependency injection)
- **ORM:** SQLAlchemy 2.x (with Alembic for migrations)
- **Database:** PostgreSQL 15
- **Server:** Gunicorn + Uvicorn workers (multi-worker production, single hot-reload dev)
- **AI SDK:** `google-genai` — always accessed through `app/services/ai/` abstraction layer
- **Auth:** JWT (PyJWT) + bcrypt — NO Keycloak, NO OAuth2 server. Standalone JWT only.
- **File Storage:** Google Cloud Storage (with local filesystem fallback for dev)
- **PDF:** ReportLab (pure Python, no system deps)

# 2. Frontend Tech Stack
- **Framework:** Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Styling:** Tailwind CSS v3 with Satark design tokens in `tailwind.config.js`
- **UI Primitives:** shadcn/ui (Radix-based: Dialog, Select, Tabs, DropdownMenu, etc.)
- **Animation:** Framer Motion (page transitions, complex sequences), Tailwind keyframes (simple loops)
- **Charts:** Recharts 3 with Satark color theme
- **Icons:** `lucide-react` (stroke-width 1.5)
- **Data Fetching:** SWR for cached data, native `fetch` for mutations
- **Auth State:** React Context (`AuthProvider`) storing JWT + user info in localStorage
- **Output:** Must have `output: "standalone"` in `next.config.ts` for Docker production build.

# 3. Infrastructure
- **Local Dev:** Docker + Docker Compose (`make up` / `make down`)
- **Production:** Google Cloud Run (both frontend and backend as separate services)
- **Database (prod):** Cloud SQL (PostgreSQL 15)
- **Storage (prod):** Google Cloud Storage bucket
- **CI/CD:** `deployment/cloudbuild.yaml` for GitHub trigger + `deployment/gcloud-deploy.sh` for manual deploy

# 4. Backend Folder Responsibilities
- `/app/main.py`: FastAPI app, router mounting, CORS, exception handlers.
- `/app/routers/`: API endpoint definitions — thin, delegates to services.
  - `auth.py`, `incidents.py`, `analyze.py`, `dashboard.py`, `admin.py`
- `/app/services/`: Business logic.
  - `auth.py` — password hashing, JWT creation/validation
  - `incident.py` — CRUD, case number generation
  - `dashboard.py` — aggregation queries
  - `audit.py` — audit log writes
  - `report.py` — PDF generation
  - `storage.py` — GCS uploads + local fallback
  - `ai/` — ALL Gemini API calls (see Rule 06)
- `/app/models/`: SQLAlchemy ORM models — User, Incident, EvidenceFile, AuditLog.
- `/app/schemas/`: Pydantic request/response schemas.
- `/app/core/`: database.py, logging_config.py, settings.py, errors.py.
- `/app/security.py`: JWT decode dependency, role check dependencies.

# 5. Frontend Folder Responsibilities
- `/frontend/src/app/`: Next.js App Router pages and layouts.
  - `(public)/` — route group: landing, submit, case detail, login, register (no sidebar)
  - `(protected)/` — route group: dashboard, workbench, admin (with sidebar)
- `/frontend/src/components/ui/`: Reusable primitives (Button, Card, Badge, etc.)
- `/frontend/src/components/layout/`: Navbar, Sidebar, PageHeader
- `/frontend/src/components/incidents/`: IncidentForm, CaseDetail, ThreatScore, etc.
- `/frontend/src/components/demo/`: TryItNow tabs, camera/mic components
- `/frontend/src/components/charts/`: All 6 dashboard chart components
- `/frontend/src/lib/`: `api-client.ts`, `utils.ts`, `auth.ts`
- `/frontend/src/context/`: `AuthContext.tsx`
- `/frontend/src/hooks/`: `useIncident.ts`, `useDashboard.ts`, `usePolling.ts`

# 6. Architectural Rules
- Components must be functional and typed with TypeScript.
- **Size Limit:** If a component grows beyond ~250 lines, split it.
- **AI Abstraction:** Never import `google-genai` directly in routers or business logic. Always use `app/services/ai/`.
- **Background Tasks:** All AI analysis and PDF generation use FastAPI `BackgroundTasks`.
- **No authz.map.json:** Use FastAPI dependency injection for role checks. `require_role(["analyst"])` as a dependency.
- **No ingestion adapters:** Users upload files directly. No adapter layer needed.
- **No Policy Engine:** AI makes classification decisions via structured output. No DSL.