# Bankable IQ

> The Business Operating System for Bankability — Capital Readiness and Growth Strategy platform.

[![Status](https://img.shields.io/badge/status-pre--launch-blue)](#status)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey)](#license)
[![Launch](https://img.shields.io/badge/launch-2026--05--29-green)](#roadmap)
[![Score](https://img.shields.io/badge/Bankable%20Score-0--100-137DC5)](#scoring)

---

## What is Bankable IQ?

Most companies help business owners apply for funding. **Bankable IQ helps business owners become the type of business banks actually want to lend to.**

Bankable IQ is a Capital Readiness and Growth Strategy platform that diagnoses where a business stands on the path to being truly bankable, prepares the business to qualify for the right capital products, and guides it through staged growth from foundation through institutional-grade access.

**Live deploy:** [`v0-fundabl-saasfinancingsystem.vercel.app`](https://v0-fundabl-saasfinancingsystem.vercel.app/) (transitioning to `bankableiq.io`)

---

## Core concepts

| Concept | Description |
|---|---|
| **Bankable Score™ 0-100** | Single client-facing readiness number based on 7 weighted categories |
| **6 Bankable Stages™** | Foundation → Stabilization → Activation → Expansion → Optimization → Institutional |
| **5 Capital Pathways™** | Starter / Credit Recovery / Growth / Scale / Investor — the route a business takes to capital |
| **5 Client Profiles** | Starter / Emerging / Constrained / Growth / Scale — the segment the business currently fits |
| **Capital Growth Plan** | Per-client roadmap from current stage to bankable — the deliverable |

---

## Status legend

- ✅ **Built** — exists in production code, deployed
- 🟡 **Partial** — exists but has known gaps (see Roadmap)
- 📋 **Spec only** — designed but not yet built
- 🔜 **Planned** — on the roadmap

---

## Features

### Assessment Engine
- ✅ Multi-step intake form
- ✅ Save & resume intake
- ✅ Persona-based question routing
- ✅ 7 question categories
- 🟡 Conditional logic (ad-hoc, declarative framework pending)
- 🔜 Full 47-question spec (currently at 36)

### Scoring Engine
- ✅ Three-layer architecture (Client Bankable Score / Operator FundScore / Lender FICO SBSS)
- ✅ Tier bands (Not Bankable → Highly Bankable)
- ✅ Partial score during intake
- ✅ Scoring version locking
- 🔜 Bankable Score 0-100 client-facing transform
- 🔜 21 automated scoring regression tests

### Client Experience
- ✅ Landing page
- ✅ Unified intake
- ✅ Results page with score + tier + pathway recommendation
- ✅ Logged-in dashboard
- ✅ Score-aware navigation (sidebar + top nav)
- 📋 Capital Growth Plan PDF (per-client downloadable)

### Funding Product Modules (50+ products supported)
- ✅ Access Funding (router for all product flows)
- ✅ Business Credit Cards · Business Credit Line · Business Term Loan
- ✅ DSCR Loans · Bridge Loans · Construction Loans · Credit Union Loans
- ✅ Equipment Financing · Accounts Receivable Finance
- ✅ Business FICO SBSS reference
- ✅ Funding Application Modal (server-side proxy to underwriting partner)

### Compliance & Lender Alignment (50+ modules)
- ✅ Compliance Module Page (router)
- ✅ Building Credit guidance
- ✅ Capital Access Map
- ✅ Capital Glossary
- ✅ Denial Diagnosis
- ✅ Document Collection
- ✅ Entity Filings
- ✅ Estimated Funding range
- 📋 5 Profile-specific Playbooks (1 of 5 drafted)
- 📋 Bankable Decision Engine™ (AI routing logic)
- 🟡 Bankability Compliance Layer™ framework

### Advisor & Agency Tools
- ✅ Advisor Dashboard
- ✅ Badge Grid (visual status indicators)
- ✅ Bankable Status widget
- ✅ Finances overview
- ✅ Status Reports
- ✅ My Progress tracking
- ✅ Credit Path visual
- ✅ Getting Started onboarding
- 📋 Bankable Operating Dashboard™ (Hub Leader / Agency view)

### Intelligence Layer
- 🟡 AI Coach (currently templated responses; Anthropic API integration planned T+7)
- ✅ Compliance-aware response sanitizer
- ✅ Industry-specific modules (e.g., Phones411 telecom)

### Auth & Multi-Tenant
- ✅ Sign up / Login / Forgot Password / Reset Password
- ✅ Auth-required route wrapper
- 🟡 4-tier multi-tenant architecture (Business Owner / Capital Advisor / Capital Hub Leader / Platform Admin)

### Integrations
- ✅ Supabase (auth + data)
- ✅ Vercel (deploy + serverless functions)
- ✅ Underwriting partner API (via server-side proxy)
- 🔜 Plaid (bank-statement data) — sandbox at launch, production T+7
- 🔜 Anthropic API (live AI Coach) — T+7
- 🔜 GoHighLevel (CRM + membership) — webhook integration in progress

---

## Tech stack

- **Frontend:** React + Vite (Next.js migration begins T+14)
- **Routing:** React Router v6 SPA mode
- **Styling:** Tailwind CSS (locked brand palette: `#137DC5` primary, `#E6E8EB` neutral, gradient `#2D388A → #00AEEF`)
- **Auth & data:** Supabase
- **Deploy:** Vercel (SPA mode, aggressive cache-busting)
- **PDFs:** `@react-pdf/renderer` (migrating from `jspdf` + `html2canvas`)
- **Server:** Vercel serverless functions for sensitive API proxying
- **Tests:** Vitest (in setup)
- **Wordmark typeface:** GillSansMTPro Medium

---

## Roadmap

### Sprint 0 — Foundation Lock (NOW → May 18)
- Brand rebrand (FundReady → Bankable across UI)
- Bankable Score 0-100 client-facing transform
- 21 golden scoring regression tests
- 47-question intake completion
- Capital Growth Plan PDF v1
- Webhook integration with CRM platform
- Security hygiene (secrets rotation, repo cleanup)

### Sprint 1 — Launch Week (May 25-29)
- Sandbox Plaid integration
- Static AI Coach explainer
- End-to-end subscription → onboarding chain verified
- Launch-day operations dashboard
- 500-seat Founding Cohort capacity

### Sprint 2 — T+7 Stabilization
- Plaid production cutover
- Live Anthropic AI Coach
- 5 Profile Playbooks complete
- Capital Growth Plan PDF v2

### Sprint 3 — T+14 Expansion
- Next.js migration begins
- Bankable Stages™ visual journey UI
- Bankable Operating Dashboard™ (Hub Leader / Agency view)
- Role-naming alignment with operating model

### Sprint 4 — Q3 Growth (July → September)
- Multi-tenant 4-tier polish
- Bankability Compliance Layer™ framework
- Bankable Playbook System™ operationalized
- Advisor caseload management (20-30 simultaneous clients per advisor)

### Sprint 5+ — Strategic Forward (Q4 2026+)
- Bankable Decision Engine™ deep AI routing
- Investor-readiness module live
- Stripe direct billing in-app
- Mobile app (iOS + Android)
- Public API for third-party integrations

---

## Project structure

```
src/
├── app/
│   ├── pages/
│   │   ├── business-assessment/   # Intake + scoring engine
│   │   │   ├── engine.ts          # computeScore() — the canonical scoring engine
│   │   │   ├── UnifiedAssessment.tsx
│   │   │   └── Results.tsx
│   │   ├── access-funding/        # 50+ funding product modules
│   │   ├── lender-compliance/     # 50+ compliance modules
│   │   └── dashboard/             # Logged-in surfaces
│   ├── components/
│   ├── lib/
│   │   ├── ai/                    # AI Coach + guardrails
│   │   ├── forge/                 # Response templates
│   │   └── supabase/              # Auth + data client
│   ├── utils/
│   └── routes.tsx                 # All routes
├── _archive/                      # Legacy code (BSS prefix — pre-rebrand)
api/
└── bolt-proxy.ts                  # Server-side proxy for underwriting partner
scripts/
└── eval-scoring.ts                # Persona fixture evaluations
```

---

## Getting started (dev)

### Prerequisites
- Node.js 18+
- pnpm or npm
- Supabase account (for `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Setup

```bash
# Clone
git clone https://github.com/Fundabl-Fintech/Bankable-IQ-Fintech.git bankable-iq
cd bankable-iq

# Install
pnpm install   # or npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase keys + underwriting partner credentials

# Run dev server
pnpm dev       # or npm run dev
```

The app is available at `http://localhost:5173` (Vite default).

### Build

```bash
pnpm build     # Production build
pnpm preview   # Preview build locally
```

### Tests

```bash
pnpm test      # Run Vitest suite (in setup — see Sprint 0)
```

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anonymous key |
| `BOLT_BROKER_TOKEN` | yes (server-only) | Underwriting partner API token — never expose in client |
| `NODE_ENV` | auto | `development` / `production` |
| `PLAID_MODE` | no (planned) | `sandbox` / `production` |
| `ANTHROPIC_API_KEY` | no (planned) | AI Coach upgrade T+7 |

**Security note:** Never commit `.env.local`. The `BOLT_BROKER_TOKEN` is server-side only and must NOT appear in any client bundle.

---

## Compliance posture

Bankable IQ is an information and education service. It is **not** a lender, broker, credit repair organization, or financial advisor and does not provide financial, legal, tax, or credit advice.

The platform language is carefully calibrated to:
- Estimate, never guarantee
- Surface readiness gaps without promising specific outcomes
- Label every illustrative case as illustrative
- Defer all funding decisions to the lender of record

The AI Coach output is filtered through a forbidden-claims sanitizer before delivery to users.

---

## Brand

- **Primary color:** `#137DC5`
- **Neutral:** `#E6E8EB`
- **Accent gradient:** `#2D388A → #00AEEF`
- **Wordmark:** GillSansMTPro Medium
- **Voice:** Mature, institutional, transformation-led. Calm and specific. Never tactical or hype-driven.

---

## Contributing

This is currently a private development project. External contributions are not being accepted at this time. If you're a partner, advisor, or member of the Bankable team, contact the project lead.

---

## License

Proprietary — all rights reserved. Unauthorized reproduction, distribution, or use of this software or its derivative works is prohibited.

© 2026 Bankable Business Solutions. All rights reserved.

---

## Trademarks (USPTO filings in progress)

- Bankable Score™
- Bankable Stages™
- Capital Pathways™
- Bankable Decision Engine™
- Bankable Playbook System™
- Bankable Operating Dashboard™
- Bankability Compliance Layer™

---

## Project links

- **Live deploy:** [v0-fundabl-saasfinancingsystem.vercel.app](https://v0-fundabl-saasfinancingsystem.vercel.app/)
- **Future domain:** `bankableiq.io` (post-rebrand)
- **Community domain:** `getbankable.io`

---

*Last updated: 2026-05-12*
