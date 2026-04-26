# Phase 1 — Project Foundation & Cleanup

> **Goal:** Transform the generic template into the Satark project with a clean codebase, working Docker setup, git history, and Memory Bank.

## Duration: ~15 commits

---

## Step 1.1 — Git Initialization & Repo Setup

### Tasks
- [ ] Initialize fresh git repo (or clean existing)
- [ ] Create `.gitignore` (verify covers Python, Node, Docker, IDE, `.env`)
- [ ] Create initial `README.md` with Satark branding
- [ ] First commit: `chore: initialize Satark project repository`

### Success Criteria
- Clean git log with exactly 1 commit
- No sensitive files tracked

### Commits
```
chore: initialize Satark project repository
```

---

## Step 1.2 — Memory Bank Bootstrap

### Tasks
- [ ] Create `docs/memory-bank/projectbrief.md` with Satark-specific content
- [ ] Create `docs/memory-bank/activeContext.md`
- [ ] Create `docs/memory-bank/progress.md`
- [ ] Create `docs/memory-bank/decisionLog.md`

### Success Criteria
- All 4 Memory Bank files exist and are populated
- `projectbrief.md` fully describes the Satark use case

### Commits
```
docs: bootstrap Memory Bank with Satark project brief
docs: add active context and progress tracking
```

---

## Step 1.3 — Backend Template Cleanup

### Tasks
- [ ] Remove `Item` model (`app/models/item.py`)
- [ ] Remove `Item` schema (`app/schemas/`)
- [ ] Remove template routes from `main.py` (items, analytics, secure-asset)
- [ ] Remove GeoIP dependency and code from `main.py`
- [ ] Remove `make_ingest.py` (template utility)
- [ ] Update `main.py`: change app title to "Satark API", clean up imports
- [ ] Update health endpoint to return `{"service": "satark-api"}`
- [ ] Verify `python -m py_compile app/main.py` passes

### Success Criteria
- `app/main.py` is clean with only health and root endpoints
- No template-specific code remains
- Backend compiles without errors

### Commits
```
refactor: remove template Item model and schema
refactor: remove template routes and GeoIP from main.py
refactor: rebrand backend to Satark API
chore: remove make_ingest.py template utility
```

---

## Step 1.4 — Frontend Template Cleanup

### Tasks
- [ ] Update `package.json`: name → `satark`, version → `0.1.0`
- [ ] Remove template page content from `src/app/page.tsx`
- [ ] Create minimal landing page placeholder
- [ ] Update `layout.tsx`: title → "Satark", metadata
- [ ] Verify `npm run lint && npm run build` passes

### Success Criteria
- Frontend builds cleanly
- No template branding visible
- Package name is `satark`

### Commits
```
refactor: rebrand frontend package to Satark
refactor: replace template landing page with Satark placeholder
```

---

## Step 1.5 — Environment Configuration

### Tasks
- [ ] Update `.env.example` with Satark-specific variables:
  - `GEMINI_API_KEY`
  - `GCS_BUCKET_NAME`
  - `JWT_SECRET_KEY`
  - `JWT_ALGORITHM=HS256`
  - `JWT_EXPIRATION_MINUTES=1440`
- [ ] Create `.env` from example (gitignored)
- [ ] Update `docker-compose.yml` to pass new env vars to backend
- [ ] Verify `make up` starts all services

### Success Criteria
- Docker Compose starts cleanly
- Backend container has access to all env vars
- `.env` is not tracked in git

### Commits
```
chore: update environment config for Satark (AI key, JWT, GCS)
chore: update docker-compose with Satark env vars
```

---

## Step 1.6 — Dependencies Update

### Tasks — Backend (`packages/requirements.txt`)
- [ ] Remove: `geoip2`, `gitingest`
- [ ] Add: `google-genai` — Gemini 3 API
- [ ] Add: `PyJWT` — JWT token generation/validation
- [ ] Add: `bcrypt` — password hashing
- [ ] Add: `python-multipart` — **REQUIRED** for file uploads in FastAPI (without this, POST with files fails)
- [ ] Add: `reportlab` — PDF generation
- [ ] Add: `httpx` — async HTTP client (for tests + URL analysis)
- [ ] Add: `google-cloud-storage` — GCS file storage
- [ ] Add: `pytest-asyncio` — async test support
- [ ] Add: `aiosqlite` — async SQLite for test database
- [ ] Verify: `sqlalchemy`, `alembic`, `psycopg2-binary`, `fastapi`, `uvicorn`, `gunicorn` all present

### Tasks — Frontend (`frontend/package.json`)
- [ ] Verify: `next@15`, `react@19`, `framer-motion@11`, `recharts@3`, `lucide-react`, `@radix-ui/*`
- [ ] Add if missing: `swr` — data fetching with caching
- [ ] Verify: `react-hook-form`, `zod`, `tailwindcss@3`

### Tasks — Dev dependencies (backend)
- [ ] Add: `pytest`, `pytest-asyncio`, `aiosqlite`, `httpx` to dev requirements

### Success Criteria
- `docker-compose build` succeeds with no missing dep errors
- `python -m py_compile app/main.py` passes
- `npm run lint` passes

### Commits
```
chore: update backend dependencies (add google-genai, JWT, bcrypt, multipart, reportlab, GCS)
chore: update frontend dependencies (add SWR, verify all versions)
```

---

## Step 1.6b — Alembic Migration Reset

### Context
The current `alembic/versions/` contains migrations for the template's `Item` model. These must be removed before Satark models are added, to have a clean, linear migration history.

### Tasks
- [ ] Delete all existing files in `alembic/versions/` (template migrations)
- [ ] Verify `alembic/env.py` imports from `app.models` (all models, not just Item)
- [ ] After deleting: `make migrate-create MSG='initial_satark_schema'` will be run in Phase 2 after all models are written (NOT now)

### Success Criteria
- `alembic/versions/` is empty
- `alembic/env.py` is set up to auto-detect all models

### Commits
```
chore: clear template migrations for fresh Satark schema start
```

---

## Step 1.6c — Test Infrastructure Setup

### Tasks
- [ ] Create `pytest.ini` at project root:
```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```
- [ ] Create `tests/conftest.py` — see Rule 09 for the full template
- [ ] Verify `tests/__init__.py` exists

### Commits
```
test: add pytest configuration and test infrastructure
```

---

## Step 1.6d — Makefile Deploy Targets

### Tasks
- [ ] Add to `Makefile`:
```makefile
# Deployment targets (wraps deployment/gcloud-deploy.sh)
deploy:
	@bash deployment/gcloud-deploy.sh

deploy-backend:
	@bash deployment/gcloud-deploy.sh --backend-only

deploy-frontend:
	@bash deployment/gcloud-deploy.sh --frontend-only

deploy-status:
	@gcloud run services list --region=$(CLOUD_RUN_REGION)

seed-demo:
	@docker compose exec backend python scripts/seed_demo_data.py
```

### Commits
```
chore: add deploy and seed-demo Makefile targets
```

---

## Step 1.6e — app/core/settings.py

### Tasks
- [ ] Create `app/core/settings.py`:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_ENV: str = "development"
    DATABASE_URL: str
    GEMINI_API_KEY: str
    AI_MODEL: str = "gemini-3-flash-preview"
    STORAGE_BACKEND: str = "local"
    GCS_BUCKET_NAME: str = "satark-evidence"
    LOCAL_UPLOAD_DIR: str = "/app/uploads"
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440
    FRONTEND_URL: str = "http://localhost:3000"
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings()
```
- [ ] Add `pydantic-settings` to requirements.txt

### Commits
```
feat: add centralized settings with pydantic-settings
```

---

## Step 1.7 — Agent Rules Update

### Tasks
- [ ] Update `.agents/rules/02-tech-stack-architecture.md` to reflect Satark stack
- [ ] Update `.agents/rules/06-gemini-ai-patterns.md` for Gemini 3 patterns
- [ ] Update `.agents/rules/08-api-design-conventions.md` for Satark API patterns
- [ ] Review all other rule files for template-specific references
- [ ] Remove any rules that don't apply

### Success Criteria
- All agent rules reference Satark, not "template"
- AI rules document Gemini 3 structured output patterns
- API conventions match our planned endpoints

### Commits
```
docs: update agent rules for Satark project context
docs: update AI patterns for Gemini 3 structured output
```

---

## Step 1.8 — Project Documentation

### Tasks
- [ ] Finalize `docs/00-project-overview.md` (this file)
- [ ] Create `docs/01-phase-1.md` through `docs/06-phase-6.md`
- [ ] Create `docs/api-design.md` with full endpoint spec
- [ ] Create `docs/ai-integration.md` with prompts and schemas

### Success Criteria
- Complete documentation for all phases
- API spec covers every planned endpoint
- AI doc covers every analysis type

### Commits
```
docs: add phase implementation plans (phases 1-6)
docs: add API design specification
docs: add AI integration guide with prompt templates
```

---

## Phase 1 Output

At the end of Phase 1:
- ✅ Clean, Satark-branded codebase (zero template artifacts)
- ✅ Docker services start cleanly
- ✅ Git history with ~15 atomic commits
- ✅ Memory Bank initialized
- ✅ Agent rules updated
- ✅ Full project documentation in `/docs`
- ✅ Ready for Phase 2 (backend models + auth)
