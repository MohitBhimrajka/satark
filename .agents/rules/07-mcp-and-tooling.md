---
trigger: model_decision
description: Reference when using MCP servers, development commands, deployment tools, or configuring the environment
---

# 1. MCP Servers Available in This Project

Use MCPs aggressively — they provide real-time accurate information that beats training data.

| MCP Server | Tool Prefix | When to Use |
|------------|-----------|----|
| **Google Developer Knowledge** | `mcp_google-developer-knowledge_*` | ANY time implementing GCP features (Cloud Run, Cloud SQL, GCS, Secret Manager, IAM) OR Gemini API patterns |
| **Cloud Run** | `mcp_cloudrun_*` | Deploying services, checking logs, getting service URLs, debugging production |
| **Aikido Security** | `mcp_aikido-mcp_*` | Before committing auth code, file upload code, JWT handling, API integrations |
| **Stitch** | `mcp_stitch_*` | When designing new pages — generate mockups before coding |
| **BigQuery** | `mcp_bigquery_*` | NOT needed for Satark (no BigQuery in this project) |
| **Google Docs** | `mcp_googledocs_*` | Reading/creating documentation |

**If a MCP tool call fails:** The MCP is not installed. Fall back to web search or training knowledge, but note the limitation.

# 2. Google Developer Knowledge Usage (MANDATORY for GCP/Gemini)

Before implementing ANY of these, search the docs:
```
# Gemini API patterns
mcp_google-developer-knowledge_search_documents("gemini 3 flash structured output python pydantic")
mcp_google-developer-knowledge_search_documents("gemini files api upload audio video")
mcp_google-developer-knowledge_search_documents("gemini multimodal image inline data")

# GCP services
mcp_google-developer-knowledge_search_documents("cloud run deploy python fastapi dockerfile")
mcp_google-developer-knowledge_search_documents("cloud sql python sqlalchemy connection")
mcp_google-developer-knowledge_search_documents("google cloud storage python upload signed url")
mcp_google-developer-knowledge_search_documents("secret manager python access secret")
```

# 3. Cloud Run Deployment MCP
- **NEVER choose project ID yourself.** Always confirm with user before deploying.
- Use `mcp_cloudrun_deploy_local_folder` for full project deployments when available.
- Use `mcp_cloudrun_get_service_log` to debug production issues.
- Use `mcp_cloudrun_get_service` to check service status and URLs.
- Default region: **`asia-south1` (Mumbai)** or `us-central1` — confirm with user.

# 4. Aikido Security Scanning
- Run `mcp_aikido-mcp_aikido_full_scan` before committing:
  - `app/security.py` and `app/services/auth.py` (JWT, password hashing)
  - `app/routers/incidents.py` (file upload endpoint)
  - `app/services/storage.py` (GCS + local file handling)
  - `app/services/ai/` (API key usage)
- Maximum 50 files per scan — split if needed.

# 5. Makefile Commands (ALWAYS USE THESE — Never Raw Docker)

| Command | Purpose |
|---------|---------| 
| `make up` | Start all services (postgres, backend, frontend) |
| `make down` | Stop all services |
| `make logs-be` | View backend logs |
| `make logs-fe` | View frontend logs |
| `make reset-db` | Clean and re-seed the database |
| `make format` | Format all code (black + isort) |
| `make lint` | Lint all code |
| `make test-be` | Run backend tests (pytest) |
| `make migrate-up` | Apply database migrations |
| `make migrate-create MSG='...'` | Create new Alembic migration |
| `make migrate-history` | View migration chain |
| `make migrate-down` | Rollback one migration |
| `make deploy` | Full production deployment (runs gcloud-deploy.sh) |
| `make deploy-backend` | Rebuild and redeploy backend only |
| `make deploy-frontend` | Rebuild and redeploy frontend only |
| `make deploy-status` | Show Cloud Run service status |
| `make seed-demo` | Seed 20 demo incidents for presentation |

# 6. Environment Configuration

**Backend env vars (`.env`):**
```
APP_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/satark_db
GEMINI_API_KEY=...
AI_MODEL=gemini-3-flash-preview
STORAGE_BACKEND=local  # or "gcs" for production
GCS_BUCKET_NAME=satark-evidence
LOCAL_UPLOAD_DIR=/app/uploads
JWT_SECRET_KEY=...
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440
LOG_LEVEL=INFO
FRONTEND_URL=http://localhost:3000
```

**Frontend env vars:**
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

**Production additional vars (in Secret Manager):**
```
GEMINI_API_KEY
DATABASE_URL
JWT_SECRET_KEY
GCS_BUCKET_NAME
```

# 7. Pre-Commit Validation (MANDATORY — Never Skip)

Before ANY commit:
```bash
# Backend
python -m py_compile app/main.py app/routers/*.py app/services/*.py

# Frontend
cd frontend && npm run lint && npm run build

# Tests
make test-be
```

If any fail — fix before committing. Never commit broken code.
