---
trigger: model_decision
description: Reference when using MCP servers, development commands, deployment tools, or configuring the environment
---

# 1. MCP Servers Available in This Project

**Use MCPs aggressively — always prefer MCPs over training knowledge or web search.**

| MCP Server | Tool Prefix | Status | When to Use |
|------------|-------------|--------|-------------|
| **Google Developer Knowledge** | `mcp_google-developer-knowledge_*` | ✅ Active | ANY time implementing GCP features (Cloud Run, Cloud SQL, GCS, Secret Manager, IAM, Gemini API) |
| **Cloud Run** | `mcp_cloudrun_*` | ✅ Active | Deploying services, checking logs, getting service URLs, listing projects, debugging production |
| **Stitch** | `mcp_StitchMCP_*` | ✅ Active | When designing new UI screens — generate mockups before writing CSS |
| **BigQuery** | `mcp_bigquery_*` | ✅ Active | Not used for Satark's primary data — only if analytics dashboards need BQ data |

**If a MCP tool call fails:** MCP is not available. Fall back to `search_web` or training knowledge but note the limitation.

# 2. Google Developer Knowledge MCP (MANDATORY for GCP/Gemini work)

Use `mcp_google-developer-knowledge_search_documents` or `mcp_google-developer-knowledge_answer_query` BEFORE implementing any of these — do NOT rely on training knowledge:

```
# Gemini AI patterns
mcp_google-developer-knowledge_search_documents("gemini 3 flash structured output python pydantic")
mcp_google-developer-knowledge_search_documents("gemini files api upload audio video")
mcp_google-developer-knowledge_search_documents("gemini multimodal image inline data base64")
mcp_google-developer-knowledge_answer_query("How do I use Gemini with structured JSON output in Python?")

# GCP infrastructure
mcp_google-developer-knowledge_search_documents("cloud run deploy python fastapi dockerfile 2025")
mcp_google-developer-knowledge_search_documents("cloud sql python sqlalchemy asyncpg connection pool")
mcp_google-developer-knowledge_search_documents("google cloud storage python upload signed url")
mcp_google-developer-knowledge_search_documents("secret manager python access latest version")
mcp_google-developer-knowledge_search_documents("artifact registry docker push authentication")
```

# 3. Cloud Run MCP (Deployment & Operations)

**Available tools:**

| Tool | When to Use |
|------|-------------|
| `mcp_cloudrun_list_projects` | Always call first to confirm project ID exists |
| `mcp_cloudrun_deploy_local_folder` | 🔥 Primary deploy method — deploys entire local folder directly to Cloud Run (no Docker CLI needed) |
| `mcp_cloudrun_deploy_file_contents` | Deploy when files only exist in context |
| `mcp_cloudrun_deploy_container_image` | Deploy a pre-built image from Artifact Registry |
| `mcp_cloudrun_get_service` | Check service details, URL, status after deploy |
| `mcp_cloudrun_list_services` | List all services in a project |
| `mcp_cloudrun_get_service_log` | Debug production issues — always check logs before escalating |
| `mcp_cloudrun_create_project` | Create a new GCP project if needed |

**Rules:**
- **NEVER choose project ID yourself.** Always confirm with user or call `mcp_cloudrun_list_projects` first.
- Default region: **`asia-south1` (Mumbai)** — matches project config.
- For Phase 6: use `mcp_cloudrun_deploy_local_folder` instead of manual Docker build — it's faster and handles Artifact Registry automatically.
- After deploy: always call `mcp_cloudrun_get_service` to confirm URL and `mcp_cloudrun_get_service_log` to check for startup errors.

**Current GCP projects (confirmed active):**
- `gen-lang-client-0385278307` — where Gemini API key is linked
- `supervity-witty` — company project (do NOT use for Satark)

# 4. Stitch MCP (UI Design — Use Before Writing CSS)

**Available tools:**

| Tool | When to Use |
|------|-------------|
| `mcp_StitchMCP_create_project` | Create new Satark design project |
| `mcp_StitchMCP_create_design_system` | Set up Satark light mode design tokens (Inter font, government-modern colors) |
| `mcp_StitchMCP_generate_screen_from_text` | Generate a screen mockup from description |
| `mcp_StitchMCP_edit_screens` | Iterate on an existing screen |
| `mcp_StitchMCP_generate_variants` | Generate multiple layout variants to compare |
| `mcp_StitchMCP_get_screen` | Get screenshot of a generated screen |
| `mcp_StitchMCP_list_screens` | List all screens in a project |

**Workflow for Phase 4 (Frontend):**
1. Create Satark Stitch project with the design system (light mode, Inter, `#1B3A5C` primary)
2. Generate screen mockups for: Landing, Submit Form, Case Detail, Dashboard, Workbench
3. Fetch screenshots to use as visual reference while building Next.js components
4. Do NOT spend time designing in Stitch — generate → screenshot → code

**Note:** Tool prefix is `mcp_StitchMCP_*` (capital MCP, capital S). Do not use `mcp_stitch_*`.

# 5. Makefile Commands (ALWAYS USE THESE — Never Raw Docker)

| Command | Purpose |
|---------|---------|
| `make up` | Start all services (postgres, backend, frontend) |
| `make down` | Stop all services |
| `make logs-be` | View backend logs |
| `make logs-fe` | View frontend logs |
| `make reset-db` | Clean and re-seed the database |
| `make seed` | Seed baseline data |
| `make seed-demo` | Seed 20 demo incidents for presentation |
| `make format` | Format all code (black + isort + prettier) |
| `make lint` | Lint all code (flake8 + eslint) |
| `make test-be` | Run backend tests (pytest) |
| `make migrate-up` | Apply database migrations |
| `make migrate-create MSG='...'` | Create new Alembic migration |
| `make migrate-history` | View migration chain |
| `make migrate-down` | Rollback one migration |
| `make deploy` | Full production deployment (runs deployment/satark-deploy.sh) |
| `make deploy-backend` | Rebuild and redeploy backend only |
| `make deploy-frontend` | Rebuild and redeploy frontend only |
| `make deploy-status` | Show Cloud Run service status |
| `make setup-secrets` | Interactive: create all Secret Manager secrets |

# 6. Environment Configuration

**Backend (`.env` — copy from `.env.example`):**
```
APP_ENV=development
DATABASE_URL=postgresql://satark_user:satark_pass@localhost:5432/satark_db
GEMINI_API_KEY=your-key-here
AI_MODEL=gemini-3-flash-preview
STORAGE_BACKEND=local
LOCAL_UPLOAD_DIR=/app/uploads
GCS_BUCKET_NAME=satark-evidence
JWT_SECRET_KEY=generate-with-openssl-rand-hex-32
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
LOG_LEVEL=DEBUG
FRONTEND_URL=http://localhost:3000
```

**Frontend (`.env.local` — copy from `frontend/.env.local.example`):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Production — ALL secrets go in Secret Manager (names):**
```
satark-gemini-api-key
satark-jwt-secret-key
satark-gcs-bucket-name
satark-database-url
satark-frontend-url
satark-next-public-api-url
```

See `deployment/prod.example.env` for full production variable reference.

# 7. Pre-Commit Validation (MANDATORY — Never Skip)

Before ANY commit, run:
```bash
# Backend — verify Python files compile
python -m py_compile app/main.py

# Frontend — lint + build must pass
cd frontend && npm run lint && npm run build

# Tests
make test-be
```

If any fail — fix before committing. Never commit broken code. Never `git push` — that's the human's job.
