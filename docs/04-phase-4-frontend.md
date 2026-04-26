# Phase 4 — Frontend: Design System & Core Pages

> **Goal:** Build the complete Satark frontend with premium light-mode design, all core pages, and interactive demo features.

## Duration: ~35 commits

---

## Step 4.0 — Next.js Route Group Architecture

**Critical: Do this before building any pages.** The current `layout.tsx` wraps ALL routes in Sidebar + Header. This is wrong for Satark — public pages (landing, login) must not have the sidebar.

### Tasks
- [ ] Create route group structure:
```
frontend/src/app/
├── (public)/              ← No sidebar — landing, submit, case, auth
│   ├── layout.tsx         ← Only Navbar (no sidebar)
│   ├── page.tsx           ← Landing page (/)
│   ├── submit/
│   │   └── page.tsx
│   ├── case/[id]/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
├── (protected)/           ← With Sidebar + Header
│   ├── layout.tsx         ← Full app shell (sidebar + header) — auth-gated
│   ├── dashboard/
│   │   └── page.tsx
│   ├── workbench/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── admin/
│       └── page.tsx
│
├── globals.css
├── layout.tsx             ← Root layout (only html, body — no UI chrome)
└── providers.tsx
```

- [ ] Update root `layout.tsx` to have NO UI chrome (just `<html><body><Providers>`)
- [ ] Create `(public)/layout.tsx` with Navbar only
- [ ] Create `(protected)/layout.tsx` with Sidebar + Header + auth check
- [ ] `(protected)/layout.tsx` redirects to `/login` if no JWT in localStorage

### Success Criteria
- Landing page has NO sidebar
- Dashboard page has sidebar and header
- Route groups don't appear in URLs
- Auth redirect works

### Commits
```
refactor: restructure Next.js app with public/protected route groups
feat: add public layout (navbar only) for landing and auth pages
feat: add protected layout (sidebar + header) with auth gate
```

---

## Step 4.1 — Design System & Tokens

### Tasks
- [ ] Update `tailwind.config.js`:
  - Custom colors: navy, electric-blue, amber, red-critical, emerald-safe
  - Custom font families: Inter, JetBrains Mono
  - Custom spacing/radius tokens
  - Custom animation keyframes (fade-in, slide-up, pulse-glow)

- [ ] Update `globals.css`:
  - CSS custom properties for all design tokens
  - Base styles for body, headings, links
  - Light mode palette (clean whites, subtle grays)
  - Premium gradients (navy → blue for CTAs)
  - Glass effects for cards (subtle backdrop-blur)

- [ ] Add Google Fonts (Inter + JetBrains Mono) to `layout.tsx`

### Success Criteria
- Design tokens accessible via Tailwind classes
- Typography renders correctly
- No browser default fonts visible

### Commits
```
style: add Satark design tokens to Tailwind config
style: add global CSS with light-mode palette and typography
style: add Inter and JetBrains Mono font imports
```

---

## Step 4.2 — Shared UI Components

### Tasks
- [ ] Create/update shared components:
  - `Button` — primary, secondary, ghost, danger variants with hover animations
  - `Card` — elevated, outlined, glass variants
  - `Badge` — severity badges (critical/high/medium/low/safe) with color coding
  - `Input`, `Textarea`, `Select` — form elements with validation states
  - `StatusBadge` — incident status chips (pending/analyzing/reviewed/closed)
  - `ThreatScore` — circular gauge (0-100) with color gradient
  - `FileUpload` — drag-and-drop zone with preview
  - `Skeleton` — loading placeholders
  - `Modal` — dialog with backdrop
  - `EmptyState` — illustrated empty states
  - `PageHeader` — consistent page title + breadcrumb
  - `DataTable` — sortable, filterable table component

### Success Criteria
- All components are reusable and properly typed (TypeScript)
- Variants work correctly
- Animations are smooth (60fps)
- Components match design system tokens

### Commits
```
style: add Button component with variants and animations
style: add Card, Badge, and StatusBadge components
style: add ThreatScore circular gauge component
style: add FileUpload drag-and-drop component
style: add DataTable with sorting and filtering
style: add remaining shared components (Input, Modal, Skeleton, etc.)
```

---

## Step 4.3 — Navigation & Layout

### Tasks
- [ ] Create `AppLayout` component:
  - Top navbar: Satark logo, nav links, auth status, user dropdown
  - Responsive: mobile hamburger menu
  - Sticky header with subtle shadow on scroll

- [ ] Create navigation structure:
  - Public: Home, Submit Incident, Track Case
  - Analyst: Dashboard, Workbench
  - Admin: Admin Panel
  - Auth: Login, Register

- [ ] Create `ProtectedRoute` wrapper:
  - Redirects to login if not authenticated
  - Checks role for analyst/admin routes

- [ ] Create `AuthProvider` context:
  - Stores JWT, user info
  - Login/logout/register methods
  - Auto-refresh token before expiry

### Success Criteria
- Navigation adapts to user role
- Protected routes redirect correctly
- Auth state persists across page refreshes (localStorage)
- Mobile navigation works

### Commits
```
feat: add AppLayout with responsive navbar
feat: add AuthProvider context with JWT management
feat: add ProtectedRoute wrapper for role-based access
style: add Satark logo and branding to navbar
```

---

## Step 4.4 — Landing Page (/)

### Tasks
- [ ] Hero section:
  - Satark shield logo (large, centered or left)
  - Headline: "AI-Powered Cyber Incident Intelligence"
  - Subheadline: "Analyze suspicious content in seconds using advanced AI"
  - CTA buttons: "Report an Incident" + "Try It Now"
  - Subtle animated background (grid pattern or gradient shift)

- [ ] **"Try It Now" section** (THE key interactive feature):
  - Tab interface: URL | Text | Image | Audio | File
  - **URL tab:** Input field with 3 pre-loaded example URLs, "Scan" button
  - **Text tab:** Textarea with pre-loaded suspicious SMS, "Analyze" button
  - **Image tab:** Drag-and-drop zone + "Use Camera" button + 2 sample images
  - **Audio tab:** "Record Audio" button (microphone) + sample audio file
  - **File tab:** Drag-and-drop for PDF/docs + sample PDF
  - Results appear in-place with animated reveal (threat score gauge, classification badge, IOC list)

- [ ] Stats section:
  - Animated counters: "X incidents analyzed", "Y threats detected", "Z active cases"

- [ ] How It Works:
  - 3-step visual: Submit → AI Analyzes → Get Results
  - Clean iconography with micro-animations

- [ ] Footer:
  - SIH 2025 attribution, PS ID 25210, MoD/CERT-Army reference
  - Tech stack badges

### Success Criteria
- First impression is "wow" — premium, modern, clean
- "Try It Now" works end-to-end without login
- Camera and microphone permissions requested only when buttons clicked
- Example inputs produce real AI analysis results
- Fully responsive (mobile + desktop)

### Commits
```
feat: add landing page hero section with animated background
feat: add "Try It Now" interactive demo section
feat: add URL scanner tab with example URLs
feat: add text analyzer tab with example messages
feat: add image upload tab with camera integration
feat: add audio recorder tab with microphone integration
feat: add file upload tab with sample documents
style: add landing page stats and "How It Works" sections
style: add footer with SIH attribution
```

---

## Step 4.5 — Incident Submission Page (/submit)

### Tasks
- [ ] Full-form submission (more detailed than quick-scan):
  - Input type selector (tabs or cards)
  - Content input (URL/text field or file upload)
  - Description textarea
  - Optional: severity self-assessment
  - Submit button with loading state

- [ ] After submission:
  - Show case number (SAT-2026-XXXXX)
  - Show shareable link
  - Animated redirect to case detail page

### Success Criteria
- Multi-file upload works (multiple evidence files)
- Form validation prevents empty submissions
- Case number displayed immediately

### Commits
```
feat: add incident submission page with multi-type input
feat: add multi-file evidence upload support
feat: add submission success screen with case number
```

---

## Step 4.6 — Case Detail Page (/case/:id)

### Tasks
- [ ] Case header:
  - Case number, status badge, priority badge, classification badge
  - Threat score gauge (large, prominent)
  - Timestamp and input type icon

- [ ] AI Analysis section:
  - Summary (text block)
  - IOC list (copyable chips)
  - Risk factors (bullet list)
  - Mitigation playbook (numbered steps with checkboxes)
  - Confidence meter

- [ ] Evidence section:
  - File thumbnails/previews
  - Download links (via signed URLs)
  - Checksum verification status

- [ ] Audit trail:
  - Timeline of all actions on this case
  - Who did what, when

- [ ] Actions (analyst view):
  - Change status dropdown
  - Change priority
  - Add analyst notes (rich text)
  - Assign to analyst
  - Generate PDF report button

### Success Criteria
- Guest view (via shareable link) shows analysis results
- Analyst view adds management controls
- Threat score gauge is visually impactful
- IOCs are individually copyable
- PDF download works

### Commits
```
feat: add case detail page with AI analysis display
style: add threat score gauge and classification badges
feat: add evidence file viewer with download links
feat: add audit trail timeline
feat: add analyst controls (status, priority, notes, assign)
feat: add PDF report generation button
```

---

## Step 4.7 — Dashboard (/dashboard)

### Tasks
- [ ] Stats row:
  - Total incidents, active cases, threats detected, avg threat score
  - Each stat in a card with trend indicator (↑ ↓)

- [ ] Charts (all 6):
  - **A:** Incidents by type — donut chart (Recharts PieChart)
  - **B:** Severity heatmap — calendar heatmap
  - **C:** Geographic map — India SVG map with hotspot pins
  - **D:** Top IOCs — sortable table with copy buttons
  - **E:** Trend line — area chart with date range selector
  - **F:** Confidence distribution — histogram (Recharts BarChart)

- [ ] Date range filter (applies to all charts)
- [ ] Auto-refresh toggle

### Success Criteria
- All 6 charts render correctly with backend data
- Charts are interactive (hover tooltips, click to filter)
- Responsive layout (2-column on desktop, 1-column on mobile)
- Date range filtering works across all charts

### Commits
```
feat: add dashboard stats cards with trend indicators
feat: add incidents by type donut chart
feat: add severity heatmap calendar chart
feat: add geographic origin India map
feat: add top IOCs table with copy functionality
feat: add incident trend line with date range selector
feat: add AI confidence distribution histogram
style: add dashboard responsive layout and polish
```

---

## Step 4.8 — Workbench (/workbench)

### Tasks
- [ ] Case queue table:
  - Sortable columns: case#, date, type, status, priority, classification, threat score
  - Filter panel: status, priority, classification, date range
  - Search bar (case number or description)
  - Pagination

- [ ] Quick actions:
  - Bulk status change
  - Bulk assign
  - Click row → navigate to case detail

- [ ] Status pipeline view (optional Kanban alternative):
  - Columns: Pending → Analyzing → Reviewed → Escalated → Closed
  - Drag-and-drop cards between columns

### Success Criteria
- Table loads all cases with pagination
- Filters work correctly
- Click-through to case detail works
- Responsive on tablet+

### Commits
```
feat: add workbench case queue with sorting and filtering
feat: add workbench search and pagination
feat: add workbench quick actions (bulk status, assign)
style: add workbench responsive layout
```

---

## Step 4.9 — Admin Panel (/admin)

### Tasks
- [ ] User management:
  - User list table (email, name, role, joined date)
  - Edit role (dropdown: analyst/admin)
  - Deactivate user

- [ ] Platform stats:
  - Total users, by role
  - Total incidents, by status
  - AI usage (total analyses, avg response time)

### Success Criteria
- Only admin can access
- Role changes take effect immediately
- Clean, minimal design

### Commits
```
feat: add admin panel with user management
feat: add admin platform statistics
```

---

## Step 4.10 — Auth Pages (/login, /register)

### Tasks
- [ ] Login page:
  - Email + password form
  - "Continue as Guest" link
  - Error messages for invalid credentials
  - Clean, centered card design

- [ ] Register page:
  - Email + password + display name
  - Password strength indicator
  - "Already have an account?" link

### Success Criteria
- Auth flow works end-to-end
- Token stored in localStorage
- Redirect to dashboard after login (analyst/admin) or home (guest)

### Commits
```
feat: add login page with form validation
feat: add register page with password strength
```

---

## Phase 4 Output

At the end of Phase 4:
- ✅ Complete design system with all components
- ✅ 10 pages fully built and connected to backend
- ✅ Interactive "Try It Now" demo with camera/mic
- ✅ All 6 dashboard charts
- ✅ Case management workbench
- ✅ Admin panel
- ✅ Auth flow (login/register/guest)
- ✅ ~35 atomic commits
- ✅ `npm run lint && npm run build` passes
- ✅ Ready for Phase 5 (report generation + polish)
