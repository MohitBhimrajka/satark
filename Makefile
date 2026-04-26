# ==============================================================================
#  Satark — Makefile
#  All development, database, and deployment commands
# ==============================================================================
.PHONY: help up down logs-be logs-fe restart-be restart-fe \
        reset-db seed seed-demo \
        migrate-create migrate-up migrate-down migrate-history \
        format lint test-be \
        deploy deploy-backend deploy-frontend deploy-status \
        setup-secrets

# ── Default ─────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  Satark — Development & Deployment Commands"
	@echo ""
	@echo "  Dev:"
	@echo "    make up                Start all services (postgres, backend, frontend)"
	@echo "    make down              Stop all services"
	@echo "    make logs-be           Tail backend logs"
	@echo "    make logs-fe           Tail frontend logs"
	@echo "    make restart-be        Restart backend only"
	@echo "    make restart-fe        Restart frontend only"
	@echo ""
	@echo "  Database:"
	@echo "    make reset-db          Wipe and re-init database"
	@echo "    make seed              Seed baseline data"
	@echo "    make seed-demo         Seed 20 demo incidents for presentation"
	@echo "    make migrate-create MSG='description'  Create new migration"
	@echo "    make migrate-up        Apply all pending migrations"
	@echo "    make migrate-down      Rollback one migration"
	@echo "    make migrate-history   Show migration chain"
	@echo ""
	@echo "  Quality:"
	@echo "    make format            Format Python (black+isort) and JS (prettier)"
	@echo "    make lint              Lint Python (flake8) and JS (eslint)"
	@echo "    make test-be           Run backend tests (pytest)"
	@echo ""
	@echo "  Deployment:"
	@echo "    make deploy            Deploy both services to Cloud Run"
	@echo "    make deploy-backend    Deploy backend only"
	@echo "    make deploy-frontend   Deploy frontend only"
	@echo "    make deploy-status     Show Cloud Run service status"
	@echo "    make setup-secrets     Interactive: create all Secret Manager secrets"
	@echo ""

# ── Dev ──────────────────────────────────────────────────────────────────────
up:
	@echo "[INFO] Starting Satark services..."
	docker compose up --build -d
	@echo "[INFO] Services started. Backend: http://localhost:8000 | Frontend: http://localhost:3000"

down:
	@echo "[INFO] Stopping Satark services..."
	docker compose down

logs-be:
	docker compose logs -f backend

logs-fe:
	docker compose logs -f frontend

restart-be:
	docker compose restart backend

restart-fe:
	docker compose restart frontend

# ── Database ─────────────────────────────────────────────────────────────────
reset-db:
	@echo "[INFO] Resetting database..."
	docker compose exec backend python scripts/reset_db.py
	@echo "[INFO] Database reset complete"

seed:
	@echo "[INFO] Seeding baseline data..."
	docker compose exec backend python scripts/seed_db.py
	@echo "[INFO] Seeding complete"

seed-demo:
	@echo "[INFO] Seeding 20 demo incidents for presentation..."
	docker compose exec backend python scripts/seed_demo_data.py
	@echo "[INFO] Demo data seeded"

migrate-create:
	@if [ -z "$(MSG)" ]; then \
		echo "[ERROR] Usage: make migrate-create MSG='your description'"; \
		exit 1; \
	fi
	@echo "[INFO] Creating migration: $(MSG)"
	docker compose exec backend alembic revision --autogenerate -m "$(MSG)"

migrate-up:
	@echo "[INFO] Applying migrations..."
	docker compose exec backend alembic upgrade head
	@echo "[INFO] Migrations applied"

migrate-down:
	@echo "[INFO] Rolling back one migration..."
	docker compose exec backend alembic downgrade -1

migrate-history:
	docker compose exec backend alembic history --verbose

# ── Quality ──────────────────────────────────────────────────────────────────
format:
	@echo "[INFO] Formatting Python..."
	docker compose exec backend black app/ tests/ scripts/
	docker compose exec backend isort app/ tests/ scripts/
	@echo "[INFO] Formatting TypeScript..."
	npm --prefix frontend run format 2>/dev/null || true
	@echo "[INFO] Formatting complete"

lint:
	@echo "[INFO] Linting Python..."
	docker compose exec backend flake8 app/ tests/
	@echo "[INFO] Linting TypeScript..."
	npm --prefix frontend run lint
	@echo "[INFO] Linting complete"

test-be:
	@echo "[INFO] Running backend tests..."
	docker compose exec backend pytest -v
	@echo "[INFO] Tests complete"

# ── Deployment ───────────────────────────────────────────────────────────────
deploy:
	@bash deployment/satark-deploy.sh

deploy-backend:
	@bash deployment/satark-deploy.sh --backend-only

deploy-frontend:
	@bash deployment/satark-deploy.sh --frontend-only

deploy-status:
	@echo "[INFO] Cloud Run service status:"
	@REGION=$$(grep GOOGLE_CLOUD_REGION deployment/.env.prod 2>/dev/null | cut -d= -f2 || echo "asia-south1"); \
	gcloud run services list --region=$$REGION --format="table(name,status.url,status.conditions[0].type)"

setup-secrets:
	@echo "[INFO] Setting up Secret Manager secrets for Satark..."
	@echo "This will prompt you to enter each secret value."
	@echo ""
	@read -p "GEMINI_API_KEY: " KEY; echo -n "$$KEY" | gcloud secrets create satark-gemini-api-key --data-file=- 2>/dev/null || echo -n "$$KEY" | gcloud secrets versions add satark-gemini-api-key --data-file=-
	@read -s -p "JWT_SECRET_KEY (generate with: openssl rand -hex 32): " JWT; echo -n "$$JWT" | gcloud secrets create satark-jwt-secret-key --data-file=- 2>/dev/null || echo -n "$$JWT" | gcloud secrets versions add satark-jwt-secret-key --data-file=-
	@read -p "GCS_BUCKET_NAME: " GCS; echo -n "$$GCS" | gcloud secrets create satark-gcs-bucket-name --data-file=- 2>/dev/null || echo -n "$$GCS" | gcloud secrets versions add satark-gcs-bucket-name --data-file=-
	@read -p "DATABASE_URL (postgresql://user:pass@/db?host=/cloudsql/...): " DB; echo -n "$$DB" | gcloud secrets create satark-database-url --data-file=- 2>/dev/null || echo -n "$$DB" | gcloud secrets versions add satark-database-url --data-file=-
	@echo ""
	@echo "[INFO] Secrets created. Set FRONTEND_URL and NEXT_PUBLIC_API_URL after first deploy."