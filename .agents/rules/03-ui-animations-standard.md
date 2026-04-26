---
trigger: model_decision
description: Reference when building or modifying any UI component, page layout, styling, animation, or visual design element
---

# 1. Design System: Satark Brand (MANDATORY)

**Theme:** Light mode. Premium. Government-modern. NOT dark mode. NOT Ampersand brand.

**Color Palette:**
| Token | Hex | Usage |
|-------|-----|-------|
| `navy-900` | `#0F172A` | Primary text, hero backgrounds |
| `navy-800` | `#1E293B` | Secondary text, nav |
| `blue-500` | `#3B82F6` | Primary CTAs, links, active states |
| `blue-600` | `#2563EB` | CTA hover states |
| `amber-500` | `#F59E0B` | Warnings, medium threats |
| `red-500` | `#EF4444` | Critical threats, errors |
| `emerald-500` | `#10B981` | Safe/clean classifications |
| `gray-50` | `#F8FAFC` | Page backgrounds |
| `gray-100` | `#F1F5F9` | Card backgrounds |
| `white` | `#FFFFFF` | Card surfaces |

**Typography:**
- Headings: `Inter` (Google Fonts)
- Code/data/case numbers: `JetBrains Mono` (Google Fonts)
- Body: `Inter`
- **Never** use browser default fonts.

# 2. Component Patterns

- **Cards:** Use shadcn `<Card>` with `bg-white border border-gray-100 shadow-sm` — clean light style, NOT glassmorphism.
- **Buttons:** `rounded-lg` (not `rounded-full`). Primary: `bg-blue-600 text-white hover:bg-blue-700`. Secondary: `border border-gray-300`. Ghost: `text-gray-600 hover:bg-gray-50`.
- **Badges:** Color-coded by classification: `phishing`→red, `malware`→red, `fraud`→amber, `espionage`→purple, `opsec_risk`→orange, `safe`→emerald.
- **Status chips:** `pending`→gray, `analyzing`→blue pulse, `reviewed`→green, `escalated`→red, `closed`→gray.
- **Threat Score Gauge:** SVG circular gauge 0–100. Colors: 0-30 emerald, 31-60 amber, 61-80 orange, 81-100 red.
- **TryItNow tabs:** 5 tabs on landing page with tab-specific color accents.

# 3. Typography Scale (Satark-Specific)

Use semantic class conventions:
- Hero H1: `text-5xl font-bold text-navy-900`
- Page titles: `text-3xl font-semibold text-gray-900`
- Section headers: `text-xl font-semibold text-gray-800`
- Card titles: `text-base font-medium text-gray-900`
- Labels: `text-sm font-medium text-gray-600`
- Case numbers: `font-mono text-sm text-gray-500`
- Metric values: `text-4xl font-bold text-gray-900`

# 4. Iconography
- **Library:** `lucide-react`
- **Stroke:** All icons `strokeWidth={1.5}`
- **Sizes:** `h-5 w-5` for inline/nav, `h-6 w-6` for cards, `h-8 w-8` for hero sections
- **Active State:** `text-blue-600` for active nav items

# 5. Animation Standards

Animations must feel **professional and purposeful** — not bouncy or marketing-site flashy.
- **Page transitions:** Framer Motion `opacity: 0→1` + `y: 20→0` on mount (0.3s ease)
- **List stagger:** Each item delayed by `index * 0.05s`
- **ThreatScore gauge:** Animated from 0 → actual value on mount (1s ease-out)
- **Analyzing state:** Blue pulsing border + spinning icon while AI processes
- **Skeleton loaders:** `shimmer` CSS animation (gradient sweep)
- **Counter:** Animated number count-up on stats section
- **Forbidden:** Bouncing, excessive scaling, layout thrashing, flashy color changes

# 6. Shadow System (Satark)
- Cards: `shadow-sm` (default), `shadow-md` (hover)
- Modals: `shadow-xl`
- Buttons: no shadow (flat design)
- Input focus: `ring-2 ring-blue-500 ring-offset-1`

# 7. Loading & Empty States
- Use `shimmer` animation for skeleton loaders on async data.
- Never render empty containers while data fetches.
- Empty states: icon + message + CTA button where appropriate.
- Analyzing state: animated AI processing indicator with "AI is analyzing your content..."

# 8. Layout Conventions — Satark Route Groups

**Public pages** (`/`, `/submit`, `/case/:id`, `/login`, `/register`):
- No sidebar
- Full-width layout
- Top navbar only (logo + nav links + auth buttons)

**Protected pages** (`/dashboard`, `/workbench`, `/workbench/:id`, `/admin`):
- Left sidebar (260px fixed, white bg, `border-r border-gray-200`)
- Sidebar nav items: icon + label, `text-gray-600 hover:bg-gray-50`, active: `bg-blue-50 text-blue-600`
- Top header: sticky, `bg-white border-b border-gray-100 shadow-sm`
- Content: `flex-1 bg-gray-50 p-6 lg:p-8`

# 9. Design Quality Enforcement (MANDATORY)

Before creating or modifying ANY UI component:
1. **Use Satark color tokens** — never hardcoded hex values in className
2. **Use shadcn/ui primitives** first before creating custom components
3. **Add loading states** — every async component needs a skeleton
4. **Add empty states** — every list/table needs an empty state
5. **Check responsiveness** — must work on mobile (min 375px) and desktop (1280px+)
6. After building: does it look premium? Is it "wow" at first glance? If not, add micro-interactions.