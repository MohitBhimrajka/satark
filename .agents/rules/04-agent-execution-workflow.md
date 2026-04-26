---
trigger: always_on
---

# 1. Step-by-Step Implementation Strategy
Do not output massive code dumps. Work incrementally:
1. **Plan:** Define data structures, dependencies, and API contracts internally.
2. **Backend First:** Models (`/app/models/`) → Schemas (`/app/schemas/`) → Services (`/app/services/`) → Routers (`/app/routers/`).
3. **Frontend:** Hooks/Context → UI Components → Pages that integrate them.
4. **Verify:** Lint, build, and test via Docker before committing.

# 2. Pre-Commit Validation (MANDATORY)
Before writing any `git commit`, you MUST run the following to ensure nothing is broken:

**Frontend:**
```bash
cd frontend && npm run lint && npm run build
```

**Backend:** Verify Python files compile and pass any tests:
```bash
cd /path/to/project && python -m py_compile app/main.py
```

If either fails, read the errors and fix them before committing.
**NEVER leave the codebase in a broken state.**

# 3. Git Commit Discipline
You are permitted to edit files and commit locally. You are **NEVER** permitted to run `git push`. Pushing is a human decision.
Commits must be atomic using standard prefixes:
- `feat:` (New feature)
- `fix:` (Bug fix)
- `refactor:` (Code cleanup without changing functionality)
- `style:` (CSS/UI updates)
- `docs:` (Updating Memory Bank or documentation)

# 4. No Dead Code
Before committing, you must remove:
- `console.log` and `print()` statements.
- Unused imports or variables.
- Temporary debug comments.

# 5. Docker & Local Dev Awareness
- **Start all services:** `make up`
- **Stop all services:** `make down`
- **View logs:** `make logs-be` (backend), `make logs-fe` (frontend)
- **Restart individual:** `docker compose restart backend` or `docker compose restart frontend`
- **Reset database:** `make reset-db` (clears and re-seeds)
- Backend hot-reloads in dev (`APP_ENV=development`). Frontend hot-reloads via `npm run dev` in the `frontend` service.

# 6. Database Migration Discipline
Any change to SQLAlchemy models (`/app/models/`) MUST be accompanied by an Alembic migration:
1. `make migrate-create MSG='describe_the_change'` — auto-generate migration.
2. Review the generated file in `alembic/versions/`.
3. `make migrate-up` — apply the migration.
4. `make migrate-history` — verify migration chain is correct.
Never edit models without creating a migration. Never commit without applying it.