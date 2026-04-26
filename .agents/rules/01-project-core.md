---
trigger: always
description: Always active — defines what Satark is and what it is not
---

# 1. Project Identity: Satark — AI-Powered Cyber Incident Intelligence Portal

**Platform:** Satark (सतर्क)
**SIH 2025 PS ID:** 25210
**Organization:** Ministry of Defence / CERT-Army
**Mission:** An AI-enabled web portal for defence personnel to submit suspicious digital content (URLs, images, audio, text, documents), receive real-time AI-powered threat analysis, and enable CERT-Army analysts to triage, prioritize, and respond to cyber incidents.
**Academic Context:** Solo college project, SIH 2025. Professor evaluates commit history, functionality, UI quality, and Cloud Run deployment.

# 2. The Three Pillars (Satark-Specific)

Every feature fits within one of these pillars:
- **Dashboard (Eyes):** Analytics charts (6 types), incident stats, threat trends, IOC heatmaps.
- **Workbench (Hands):** Case management queue, incident detail view, analyst controls (status/priority/notes/assign/report).
- **AI Engine (Brain):** The Gemini 3 analysis pipeline — classifies, scores, extracts IOCs, generates mitigation playbooks.

# 3. User Roles

| Role | Access |
|------|--------|
| **Guest** | Submit incidents (no login required), view own case via shareable link |
| **Analyst** | Full Workbench access, Dashboard, generate reports |
| **Admin** | User management, platform stats, all analyst access |

# 4. Design Philosophy

**Light mode. Premium. Government-modern.**
- Clean whites and subtle grays as base
- Deep navy (`#0F172A`) for primary text and hero elements
- Electric blue (`#3B82F6`) for CTAs and key accents
- Amber (`#F59E0B`) for warnings, red (`#EF4444`) for critical, emerald (`#10B981`) for safe
- **NOT** dark mode. **NOT** glassmorphism-dominant. **NOT** Ampersand brand system.
- Typography: Inter (headings) + JetBrains Mono (code/data/case numbers)

# 5. Global Constraints

- **Never mention AI vendor names in the UI** (see Rule 13). Say "AI" not "Gemini".
- **No Keycloak.** Auth is JWT + bcrypt only.
- **No policy engine / RuleEngine / DSL.** AI makes decisions directly via structured output.
- **No ingestion adapters.** Users upload files directly via browser form.
- **Camera and microphone require HTTPS** — only work on deployed Cloud Run URL.
- **Commit discipline is mandatory** — professor checks git history.