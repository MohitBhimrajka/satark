---
trigger: model_decision
description: Reference when adding features, creating new entities, scaffolding components, reviewing code quality, or checking authz/design compliance
---

# 1. Before-You-Start Checklist
Before ANY feature work, verify:
- [ ] `docs/memory-bank/` exists with `projectbrief.md`, `activeContext.md`, `progress.md`, `decisionLog.md`
- [ ] Project brief is filled out (Satark-specific, not template)
- [ ] `docs/satark-use-case.md` exists
- [ ] `docs/ai-integration.md` exists (prompt templates)
- [ ] `docs/api-design.md` exists (endpoint spec)

If any are missing — create them before writing feature code.

# 2. Access Control Enforcement (Satark — NOT authz.map.json)

Satark uses FastAPI dependency injection, NOT Keycloak's `authz.map.json`.

Before creating ANY new API endpoint:
1. Decide access level: public, guest+token, authenticated (any role), analyst+, admin-only
2. Apply the correct dependency in the router:

```python
# Public (no auth)
@router.post("/api/incidents")
async def create_incident(data: IncidentCreate, db: Session = Depends(get_db)):

# Guest can view own case (by guest_token query param) OR analyst+ can view any
@router.get("/api/incidents/{id}")
async def get_incident(id: str, token: str | None = Query(None), user: User | None = Depends(get_optional_user)):

# Analyst or Admin only
@router.get("/api/incidents", dependencies=[Depends(require_role("analyst", "admin"))])

# Admin only
@router.get("/api/admin/users", dependencies=[Depends(require_role("admin"))])
```

3. Before committing, verify every new endpoint has the correct dependency.

# 3. Design Quality Enforcement

Before creating ANY UI component:
1. **Reference Satark palette** (Rule 03) — clean whites, navy, blue, amber, red, emerald
2. **Use shadcn/ui primitives** first before creating custom components
3. **Must use Satark token system** — `text-navy-900`, `bg-blue-600`, etc. (defined in tailwind.config.js)
4. **Must have loading state** — skeleton or spinner for every async data render
5. **Must have empty state** — every list needs an empty state

Self-check after building:
- [ ] Colors from Satark palette (not arbitrary hex)?
- [ ] Light mode (white/gray backgrounds, dark text)?
- [ ] Loading state implemented?
- [ ] Empty state implemented?
- [ ] Mobile responsive?
- [ ] Lucide icons with strokeWidth 1.5?

# 4. Entity Lifecycle Checklist (Satark)
When adding ANY new domain entity, follow this order:

1. **Model** — `app/models/{entity}.py` (SQLAlchemy ORM)
2. **Migration** — `make migrate-create MSG='add_{entity}_table'` → `make migrate-up`
3. **Schema** — `app/schemas/{entity}.py` (Pydantic: `Create`, `Update`, `Response`, `ListResponse`)
4. **Service** — `app/services/{entity}.py` (CRUD + business logic — thin)
5. **Router** — `app/routers/{entity}.py` (delegates to service, applies access control)
6. **Tests** — At least 2 per endpoint (success + auth error)
7. **Frontend Page** — `frontend/src/app/(protected or public)/{entity}/page.tsx`
8. **Frontend Components** — `frontend/src/components/{entity}/`
9. **Navigation** — Add to Sidebar (protected) or Navbar (public) if needed
10. **Memory Bank** — Update `activeContext.md` and `progress.md`

# 5. Anti-Pattern Detection Table (Satark)

| Developer Says | Anti-Pattern | Correct Approach |
|----------------|-------------|-----------------|
| "Check role with if/else in router" | Logic in wrong layer | Use `require_role()` FastAPI dependency |
| "Save auth token in cookie" | Cookie confusion | Store JWT in localStorage via AuthContext |
| "Call Gemini directly in the router" | Bypasses abstraction | Use `app/services/ai/orchestrator.py` |
| "Process file synchronously" | Blocks HTTP response | Background task + polling |
| "Hardcode threshold: if score > 70" | Hardcoded logic | Let AI determine severity via structured output |
| "Just use any red color" | Off-brand | Use `text-red-500` or `bg-red-100` from Satark tokens |
| "I'll add the role check later" | Security hole | Add `require_role()` before committing |
| "Parse AI JSON with json.loads()" | Fragile parsing | Use `ThreatAnalysis.model_validate_json()` |
| "Read file from disk in router" | Wrong layer | Use `app/services/storage.py` |
| "gemini-3-flash-preview" in UI | Vendor name exposure | Never mention model/vendor in UI (Rule 13) |

# 6. Pre-Commit Self-Check
Before EVERY commit:
- [ ] `make test-be` passes?
- [ ] `cd frontend && npm run lint && npm run build` passes?
- [ ] No print() or console.log() in code?
- [ ] No unused imports?
- [ ] Every new endpoint has access control dependency?
- [ ] AI calls go through `app/services/ai/` only?
- [ ] Background tasks for all AI analysis?
- [ ] Memory Bank updated if significant change?

# 7. Satark-Specific Guards

### File Upload Guard
Every file upload must validate:
1. MIME type (whitelist — see Rule 08)
2. File size (per-type limits — see Rule 08)
3. Malware potential (send to AI for analysis — that IS the product)

### Guest Token Guard
Guest token endpoints must:
1. Check `guest_token` query param matches Incident `guest_token` field
2. Never expose other incidents to guests

### Case Number Guard
Case numbers must use PostgreSQL SEQUENCE — never `MAX(id)+1` which races.
