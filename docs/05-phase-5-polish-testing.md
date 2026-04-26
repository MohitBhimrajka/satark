# Phase 5 — Report Generation, Polish & Testing

> **Goal:** Add PDF report generation, final UI polish, seed data for demos, and comprehensive testing.

## Duration: ~20 commits

---

## Step 5.1 — PDF Report Generation

### Tasks
- [ ] Create `app/services/report.py`:
  - `generate_report(incident: Incident) → bytes (PDF)`
  - Uses ReportLab for PDF construction
  - Report sections:
    1. Header with Satark logo, case number, date
    2. Classification badge (color-coded)
    3. Threat score visual gauge
    4. Incident summary
    5. AI analysis findings
    6. IOC list (table format)
    7. Risk factors
    8. Mitigation playbook (numbered steps)
    9. Evidence log (files with checksums)
    10. Audit trail timeline
    11. Footer with generation timestamp

- [ ] Create report endpoint:
  - `GET /api/incidents/:id/report` → PDF download

- [ ] Add "Download Report" button on case detail page

### Success Criteria
- PDF generates correctly with all sections
- Color-coded badges render in PDF
- File downloads with correct MIME type
- Report is professional and clean-looking

### Commits
```
feat: add PDF report template with Satark branding
feat: add report generation service with all sections
feat: add GET /api/incidents/:id/report endpoint
feat: add report download button on case detail page
```

---

## Step 5.2 — Seed Data & Demo Content

### Tasks
- [ ] Create `scripts/seed_demo_data.py`:
  - Create admin user (admin@satark.io / admin123)
  - Create analyst user (analyst@satark.io / analyst123)
  - Create 15-20 sample incidents across all types with:
    - Various statuses (pending, analyzed, reviewed, escalated, closed)
    - Various classifications (phishing, malware, fraud, espionage, safe)
    - Various threat scores (10-95)
    - Realistic AI analysis JSON
    - Audit log entries
  - Ensure dashboard charts have meaningful data

- [ ] Create sample demo files in `public/samples/`:
  - `sample-phishing-email.png` — screenshot of fake bank login
  - `sample-suspicious-url-list.txt` — list of suspicious URLs
  - `sample-threat-report.pdf` — suspicious PDF document
  - Pre-written suspicious SMS texts (in JSON for frontend)

### Success Criteria
- `make reset-db` seeds all demo data
- Dashboard shows meaningful charts immediately
- "Try It Now" examples use real sample files
- Demo is fully functional out of the box

### Commits
```
feat: add demo data seeding script with 20 sample incidents
feat: add sample demo files for "Try It Now" section
chore: update Makefile seed command for demo data
```

---

## Step 5.3 — UI Polish & Micro-Animations

### Tasks
- [ ] Add page transitions (Framer Motion):
  - Fade + slide on route change
  - Stagger animations for list items

- [ ] Add loading states:
  - Skeleton screens for every data-dependent page
  - Pulse animation on analysis in progress
  - Shimmer effect on cards while loading

- [ ] Add micro-interactions:
  - Button press feedback (scale down + up)
  - Hover glow on cards
  - Threat score gauge animation on mount (0 → actual value)
  - Toast notifications (success, error)
  - Copy-to-clipboard feedback on IOC chips

- [ ] Add empty states:
  - No cases found (with illustration)
  - No analysis results yet
  - First-time user welcome

- [ ] Responsive audit:
  - Test all pages on mobile viewport
  - Fix any overflow or alignment issues
  - Ensure touch targets are 44px+

### Success Criteria
- Every interaction has visual feedback
- No layout jank or content shift
- Mobile experience is usable (not just "not broken")
- Loading states prevent blank screens

### Commits
```
style: add page transition animations with Framer Motion
style: add skeleton loading states for all pages
style: add micro-interactions (buttons, cards, gauges)
style: add toast notification system
style: add empty states with illustrations
style: responsive audit and mobile fixes
```

---

## Step 5.4 — SEO & Accessibility

### Tasks
- [ ] SEO:
  - Unique `<title>` for each page
  - Meta descriptions
  - Open Graph tags for social sharing
  - Semantic HTML (header, main, nav, section, article)

- [ ] Accessibility:
  - All interactive elements have unique IDs
  - ARIA labels on icon-only buttons
  - Keyboard navigation for all forms
  - Color contrast ratios ≥ 4.5:1
  - Focus visible outlines

### Success Criteria
- Lighthouse accessibility score ≥ 90
- All pages have proper `<title>` tags
- Tab navigation works throughout

### Commits
```
style: add SEO meta tags and Open Graph for all pages
style: add accessibility labels and keyboard navigation
```

---

## Step 5.5 — Pre-Commit Validation

### Tasks
- [ ] Frontend:
  - `cd frontend && npm run lint` → zero errors
  - `cd frontend && npm run build` → clean build
  - Fix any TypeScript errors
  - Remove unused imports and variables

- [ ] Backend:
  - `python -m py_compile app/main.py` → passes
  - All router files compile
  - No dead code (console.log, print, unused imports)

- [ ] Docker:
  - `make down && make up` → all services start
  - `make reset-db` → seeds correctly
  - Both health endpoints return 200

### Success Criteria
- Zero lint errors
- Clean production build
- All services healthy
- No dead code

### Commits
```
fix: resolve all TypeScript lint errors
fix: resolve all Python compilation issues
refactor: remove dead code and unused imports
```

---

## Phase 5 Output

At the end of Phase 5:
- ✅ PDF report generation working
- ✅ Demo data seeded (ready for presentation)
- ✅ All animations and micro-interactions polished
- ✅ SEO and accessibility compliant
- ✅ Zero lint errors, clean builds
- ✅ ~20 atomic commits
- ✅ Ready for Phase 6 (deployment)
