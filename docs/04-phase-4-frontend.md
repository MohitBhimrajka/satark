# Phase 4 — Frontend Implementation Plan (v2 — Audited)

> **Prereqs:** Phase 2 ✅ + Phase 3 ✅ (41 tests passing) | **Target:** ~40 commits

---

## Audit Findings (Gaps Fixed From v1)

| # | Gap | Fix |
|---|-----|-----|
| 1 | No `providers.tsx` (Toaster, SWR, Auth) | Added to Step 4.2 |
| 2 | No TypeScript types mirroring backend schemas | Added Step 4.2 — `types/` directory |
| 3 | No frontend constants (statuses, classifications) | Added Step 4.2 — `lib/constants.ts` |
| 4 | **Chart names mismatch** — plan had `geo_map`, `top_iocs`, `severity_timeline` but backend has `severity_distribution`, `classification_breakdown`, `status_overview` | Fixed Step 4.9 to match actual backend |
| 5 | No `loading.tsx` / `error.tsx` / `not-found.tsx` | Added to Step 4.3 |
| 6 | No `formatDate()`, `threatScoreColor()` utils | Added to Step 4.2 |
| 7 | No toast notifications pattern | Added to Step 4.2 (Toaster in providers) |
| 8 | No favicon/logo asset | Added to Step 4.1 |
| 9 | Dashboard stats is analyst-only but StatsBar on landing needs it | Fixed: landing uses hardcoded demo stats (no API call) |
| 10 | No `useCopyToClipboard` | Added to Step 4.2 |
| 11 | No per-page SEO metadata | Added to each page step |
| 12 | No error/empty state patterns | Added to Step 4.4 |
| 13 | Guest token shareable URL flow unclear | Detailed in Step 4.7 + 4.8 |
| 14 | Stale `brand.*` colors in tailwind still referenced | Cleanup in Step 4.1 |

---

## Step 4.1 — Design Tokens & Assets

**Files:**
- Modify `tailwind.config.js` — remove `brand.*`, add `satark.*` colors, add keyframes (shimmer, fade-in, slide-up, pulse-border)
- Modify `globals.css` — add `.animate-shimmer`, `.animate-fade-in`, `.animate-pulse-border` utilities
- Add `public/favicon.svg` — Satark shield icon
- Update root `layout.tsx` — add favicon `<link>`

**Key details:**
- Satark color tokens per Rule 03: `navy-900 #0F172A`, `blue-500 #3B82F6`, `red-500 #EF4444`, `amber-500 #F59E0B`, `emerald-500 #10B981`
- Font families already configured (Inter + JetBrains Mono) ✅

**Commits:** `style: replace template brand colors with Satark tokens` / `style: add animation keyframes` / `chore: add Satark favicon`

---

## Step 4.2 — Foundation Layer (Types, Utils, Hooks, Providers)

### 4.2a — TypeScript Types (`frontend/src/types/`)

| File | Types | Source |
|------|-------|--------|
| `incident.ts` | `Incident`, `IncidentListItem`, `IncidentCreate`, `IncidentUpdate`, `IncidentFilter`, `PaginationMeta` | `app/schemas/incident.py` |
| `user.ts` | `User`, `UserCreate`, `UserLogin`, `TokenResponse` | `app/schemas/user.py` |
| `analysis.ts` | `ThreatAnalysis`, `QuickScanRequest`, `QuickScanResponse` | `app/schemas/analysis.py` |
| `dashboard.ts` | `DashboardStats`, `ChartData`, `ChartDataPoint` | `app/schemas/dashboard.py` |
| `evidence.ts` | `EvidenceFile` | `app/schemas/evidence.py` |
| `api.ts` | `ApiResponse<T>`, `ApiListResponse<T>`, `ApiError` | Standard envelope |

### 4.2b — Constants (`frontend/src/lib/constants.ts`)

Mirror `app/core/constants.py`.

### 4.2c — Utils Expansion (`frontend/src/lib/utils.ts`)

Add: `formatDate()`, `formatRelativeTime()`, `threatScoreColor(score)`, `classificationColor(cls)`, `statusColor(status)`, `priorityColor(priority)`, `copyToClipboard(text)`

### 4.2d — API Client Update (`frontend/src/lib/api-client.ts`)

- Add `getToken()` / `setToken()` / `removeToken()` (localStorage)
- Inject `Authorization: Bearer ${token}` when present
- Add typed helper methods: `api.get<T>()`, `api.post<T>()`, `api.patch<T>()`, `api.upload<T>()`

### 4.2e — Hooks (`frontend/src/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `useAuth.ts` | JWT management, login/logout/register, user state, role checks |
| `usePolling` | `usePolling.ts` | Poll `GET /api/incidents/:id` every 2s, stop when `status !== 'analyzing'` |
| `useIncidents` | `useIncidents.ts` | SWR-based incident list with IncidentFilter params |
| `useCopyToClipboard` | `useCopyToClipboard.ts` | Copy text + toast notification |

### 4.2f — Providers (`frontend/src/app/providers.tsx`)

Wraps: `<AuthProvider>` + `<Toaster />` (react-hot-toast) + `<SWRConfig>` (global error handler)

Update root `layout.tsx` to wrap `{children}` in `<Providers>`.

**Commits:** `feat: add TypeScript types mirroring backend schemas` / `feat: add frontend constants` / `feat: expand utils with formatting and color helpers` / `feat: wire JWT auth into api-client` / `feat: add useAuth, usePolling, useIncidents, useCopyToClipboard hooks` / `feat: add Providers wrapper with AuthContext, Toaster, SWR`

---

## Step 4.3 — Route Groups & Layouts

### Directory structure
```
app/
├── (public)/layout.tsx
│   ├── page.tsx              ← Landing
│   ├── submit/page.tsx
│   ├── case/[id]/page.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── (protected)/layout.tsx
│   ├── dashboard/page.tsx
│   ├── workbench/page.tsx
│   ├── workbench/[id]/page.tsx
│   └── admin/page.tsx
├── not-found.tsx
├── error.tsx
├── loading.tsx
├── layout.tsx
└── globals.css
```

### Layout components (`components/layout/`)

| Component | Details |
|-----------|---------|
| `Navbar` | Logo + Home / Submit / Track Case + Login/Register (or user dropdown). Responsive. Sticky. |
| `Sidebar` | 260px fixed, white bg. Items: Dashboard, Workbench, Admin (admin only). |
| `Header` | Sticky top bar in protected layout. Page title + user avatar dropdown. |

**Commits:** `refactor: create (public) and (protected) route groups` / `feat: add Navbar component` / `feat: add Sidebar and Header` / `feat: add protected layout with auth gate` / `feat: add not-found, error, loading pages` / `feat: add route protection in middleware`

---

## Step 4.4 — Shared UI Components

14 UI components + 6 analysis components. See file manifest below.

---

## Step 4.5 — Landing Page (`/`)

Hero + StatsBar (hardcoded) + TryItNow (5 tabs, quick-scan API) + HowItWorks + Footer

---

## Step 4.6 — Auth Pages

Login + Register with react-hook-form + zod validation.

---

## Step 4.7 — Incident Submission (`/submit`)

Type selector → input form → submit → success screen with shareable URL.

---

## Step 4.8 — Case Detail (`/case/[id]`)

Polling + AI analysis display + evidence + audit trail + analyst controls.

---

## Step 4.9 — Dashboard (`/dashboard`)

4 stat cards + 6 charts matching backend: `incidents_by_type`, `classification_breakdown`, `severity_distribution`, `status_overview`, `trend_line`, `confidence_distribution`.

---

## Step 4.10 — Workbench (`/workbench`)

Case queue DataTable + detail view reusing case components.

---

## Step 4.11 — Admin Panel (`/admin`)

User management table + platform stats.

---

## Step 4.12 — Polish & Build Verification

Lint, build, responsive, dead code cleanup.

---

## Complete File Manifest (65 new + 6 modified)

```
frontend/src/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── submit/page.tsx
│   │   ├── case/[id]/page.tsx
│   │   ├── case/[id]/loading.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── workbench/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [id]/page.tsx
│   │   └── admin/page.tsx
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   ├── providers.tsx
│   ├── layout.tsx                      (modified)
│   └── globals.css                     (modified)
├── components/
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   ├── ui/
│   │   ├── button.tsx                  (existing)
│   │   ├── card.tsx                    (existing)
│   │   ├── badge.tsx
│   │   ├── status-badge.tsx
│   │   ├── threat-score.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── file-upload.tsx
│   │   ├── skeleton.tsx
│   │   ├── modal.tsx
│   │   ├── empty-state.tsx
│   │   ├── page-header.tsx
│   │   ├── stat-card.tsx
│   │   ├── data-table.tsx
│   │   └── tabs.tsx
│   ├── analysis/
│   │   ├── result-card.tsx
│   │   ├── classification-badge.tsx
│   │   ├── ioc-list.tsx
│   │   ├── mitigation-playbook.tsx
│   │   ├── confidence-meter.tsx
│   │   └── analyzing-state.tsx
│   ├── landing/
│   │   ├── hero.tsx
│   │   ├── stats-bar.tsx
│   │   ├── try-it-now.tsx
│   │   ├── how-it-works.tsx
│   │   └── footer.tsx
│   ├── incidents/
│   │   ├── submit-form.tsx
│   │   ├── input-type-selector.tsx
│   │   ├── submission-success.tsx
│   │   ├── case-header.tsx
│   │   ├── evidence-list.tsx
│   │   ├── audit-timeline.tsx
│   │   └── analyst-controls.tsx
│   └── dashboard/
│       ├── dashboard-stats.tsx
│       ├── chart-a-incidents-by-type.tsx
│       ├── chart-b-classification.tsx
│       ├── chart-c-severity.tsx
│       ├── chart-d-status.tsx
│       ├── chart-e-trend.tsx
│       └── chart-f-confidence.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePolling.ts
│   ├── useIncidents.ts
│   └── useCopyToClipboard.ts
├── contexts/
│   └── AuthContext.tsx
├── types/
│   ├── incident.ts
│   ├── user.ts
│   ├── analysis.ts
│   ├── dashboard.ts
│   ├── evidence.ts
│   └── api.ts
├── lib/
│   ├── api-client.ts                   (modified)
│   ├── utils.ts                        (modified)
│   └── constants.ts
├── data/
│   └── demo-samples.json
└── middleware.ts                        (modified)
```
