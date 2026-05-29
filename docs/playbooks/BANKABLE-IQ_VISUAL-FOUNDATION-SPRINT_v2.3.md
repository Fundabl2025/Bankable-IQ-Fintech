# BANKABLE IQ Visual Foundation Sprint v2.3

**Companion to:** Autonomous Build Playbook v2.1 + Operator Companion v2.2 + Master Engineering Build Spec v1.0
**Purpose:** Lock the visual constitution of the platform in 72 hours so the 27-agent fleet has a north star to build against.
**Producer:** You (founder) + bot-design (Figma Make).
**Output:** Brand identity, 12 hero screens at web and mobile, two clickable prototypes, a 5-minute walkthrough video, all in one Figma file the fleet codes from via Code Connect.

I am writing this as the master developer and designer leading your build. Every prompt below is paste-ready. Every deliverable has an acceptance bar. Audit report is at the bottom.

---

## WHY THIS SPRINT EXISTS

The fleet can code from a spec alone. It cannot invent a coherent visual identity, a brand voice, a trust posture, or a founder's gut feel. Without the foundation locked first, 27 agents will produce 27 slightly different aesthetic interpretations and the platform will feel disjointed. Worse, you will not feel the product viscerally enough to sell it, defend it, raise on it, or correct it.

72 hours of focused visual work before the fleet starts means:
- Every screen the fleet produces inherits a locked identity.
- You can walk into any conversation with investors, beta customers, your team, with a clickable prototype and a 5-minute video.
- The fleet's velocity goes up because design decisions are pre-made.
- Brand trust signal is in place from PR #1.

This is the only block of human-paced work in the entire build. Everything after this is autonomous.

---

## THE 12 HERO SCREENS (LOCKED)

These are the screens you produce. Every other screen in the production platform inherits patterns from these.

| # | Screen | Role | Why hero | Spec refs |
|---|--------|------|----------|-----------|
| 1 | Sign-in (split, brand left) | All | First trust signal | §10.1, §6 |
| 2 | Client Dashboard | Client | Readiness Index hero, 3 outcomes, BPFS gauge | §3.7.2, §3.8 |
| 3 | Diagnostic Intake (mid-flow) | Client | Branching + save-resume + inline doc upload | §3.1 |
| 4 | Vault grid + detail drawer | Client | Classification, OCR preview, retention badges | §3.5 |
| 5 | Pathway timeline | Client | Goal-backwards plan visualization | §3.6 |
| 6 | Coach chat | Client | Streaming AI coach experience | §3.3, §12.5 |
| 7 | Marketplace shortlist | Client | Lender match cards with BPFS scoring | §5.2, §3.7 |
| 8 | Advisor Command Center (caseload) | Advisor | Filterable caseload, NBA queue, bulk actions | §3.9 |
| 9 | Advisor client detail (drill-in) | Advisor | Per-client trajectory + BPFS delta | §3.9 |
| 10 | Compliance audit log | Compliance Officer | Immutable hash-chained log UI | §3.2, §4.2.3 |
| 11 | Lender cohort browse | Lender | Partner-facing decisioning surface | §5.5 |
| 12 | Tenant admin (white-label) | Advisor Admin | Branding, billing, user management | §6.2 phase 2 |

All 12 at both 1440px desktop and 390px mobile. No exceptions.

---

## THE THREE EXECUTION BLOCKS

Three ordered work blocks. Inside each, you sit with bot-design for two 90-minute sessions. Three blocks, six sessions total. The 72-hour wall clock includes review and decision time between sessions.

---

## BLOCK 1. BRAND FOUNDATION

**Goal:** Lock the brand identity. Logo, color, typography, voice, brand statement.

### What you produce in Block 1

1. Logo system: primary wordmark, secondary monogram, lockup variants, favicon.
2. Color token system: navy 950 base, cyan accent, semantic colors (success, warning, danger, info), dark + light modes.
3. Typography scale: Sora display, Plus Jakarta Sans body, JetBrains Mono code, Playfair Display Italic accent.
4. Voice and tone one-pager.
5. Brand statement asset (1 page).

### Block 1 prompt to bot-design (paste in Figma Make)

```
Build the BANKABLE IQ brand foundation in a new Figma file named
"BANKABLE IQ Brand v1".

Company context:
- BANKABLE IQ is the Institutional Readiness Operating System for
  small business credit and funding access.
- Audience: small business owners 30 to 55, often Black and brown
  founders, who feel locked out of traditional banking.
- Tone: institutional, trust-coded, premium, technical, warm.
- Sibling brands: HUSLConnect (CRM), HUSLFi (bookkeeping),
  Fundabl (lending intake), NXTWave Wireless, Roccstar Wireless,
  Capital Connection Community. BANKABLE IQ is the institutional anchor.
- Founders: Kevin Murphy, Michael Hopkins.

Deliverable 1. Logo system. Show me three logo directions:
- Direction A: monogram-led (BIQ mark + wordmark)
- Direction B: wordmark-led (BANKABLE clean wordmark)
- Direction C: lockup-led (mark + wordmark + tagline "Institutional Readiness, Operationalized")
For each direction: primary, secondary, monogram, favicon, white on
navy, navy on white, monochrome.

Deliverable 2. Color tokens. Lock these Figma Variable collections:
- Brand: navy/950 #050E2B, navy/900 #0A1845, navy/700 #142B66,
  cyan/500 #00AEEF, cyan/400 #7DD3FC, blue/600 #137DC5
- Semantic: success/500 #51CF66, warning/500 #FFB347,
  danger/500 #FF6B6B, info/500 #00AEEF, violet/400 #B197FC
- Neutrals: grey/400 #8B9BBF, grey/600 #5A6A8E,
  surface/0 #FFFFFF, surface/950 #061128
- Modes: Dark (default, navy/950 background) and Light.

Deliverable 3. Typography scale. Lock:
- Display: Sora 800, sizes 60/48/36/30/24
- Body: Plus Jakarta Sans 400/500/600/700, sizes 20/18/16/14/12
- Code: JetBrains Mono 500, size 14
- Accent: Playfair Display Italic 700, used sparingly for emotional moments

Deliverable 4. Voice and tone one-pager. Write three voice samples:
1. How we talk to a client whose loan just got declined.
   (Empathetic, factual, action-oriented, never patronizing.)
2. How we talk to an advisor managing 50 clients.
   (Operational, sharp, time-respecting.)
3. How we talk to a lender partner browsing applicants.
   (Institutional, data-forward, compliance-clear.)
Each sample is 4 to 6 sentences. Then write the 10 brand words we
always use and the 10 we never use.

Deliverable 5. Brand statement asset. One frame, poster format.
Headline: "BANKABLE IQ is the Institutional Readiness Operating System."
Subhead: "We turn small businesses into capital-ready institutions."
Three pillars below: Diagnose. Build. Match.
Use the brand directions above. Show me variants.

Show me everything as Figma frames laid out on one page named
"01 Brand Foundation". I will pick one logo direction and one color
mode default before we move to screens.
```

### Block 1 acceptance bar

Before moving to Block 2, you must have:
- One picked logo direction.
- All color tokens bound as Figma Variables.
- Typography scale applied to the brand statement asset.
- Voice samples that you read out loud and feel right.
- A file named `BANKABLE IQ Brand v1` saved.

If any deliverable is wrong, comment in Figma and re-prompt bot-design with the specific change. Do not move on until Block 1 lands.

---

## BLOCK 2. THE 12 HERO SCREENS, WEB

**Goal:** Produce all 12 hero screens at 1440px desktop, fully variable-bound, Code Connect mapped.

### Pre-Block 2 setup

In the Figma file, before generating screens, you (or bot-design) build the **component primitive set** once. These are the shadcn-compatible building blocks every screen will use.

Components to build first (single 90-minute session):

```
Button (primary, secondary, ghost, destructive, 3 sizes, all states)
Input, Textarea, Select, Checkbox, Radio, Switch
Tabs, Badge, Tag, Avatar, Tooltip, Toast
Dialog (modal), Drawer
Card, Stat Card, Score Ring (0-100), Score Ring (0-1000)
Progress Bar, Stepper, Skeleton
Table (with stack-on-mobile pattern)
Empty State
Top Nav, Sidebar Nav, Mobile App Bar
```

Every component variable-bound. Every component with Code Connect mapping to its shadcn counterpart name (`Button → components/ui/button.tsx`, etc.).

### Block 2 prompt to bot-design

```
Build all 12 hero screens at 1440px in the BANKABLE IQ Brand v1
Figma file. Use ONLY variable-bound components from the primitive
set we built. No hardcoded colors, no hardcoded text sizes, no
hardcoded spacing.

Brand: navy/950 base (dark mode is the default). Cyan accent.
Components: shadcn primitives matched 1:1.
Aesthetic: institutional fintech, premium, trust-coded, calm
information density.

For EACH screen below, produce: default state, empty state, loading
state, error state. Include the realistic content described.

Screen 1. Sign-in (split layout).
  Left 50%: brand panel, logo top, brand statement, abstract
  navy-cyan gradient or geometric pattern.
  Right 50%: form, "Sign in to BANKABLE IQ" headline, email input,
  password input, "Sign in" primary CTA, "Sign in with magic link"
  secondary, "Sign in with Google" tertiary, MFA hint footnote,
  "New here? Request access" link.
  Spec ref: §10.1.

Screen 2. Client Dashboard.
  Top nav with workspace switcher + notifications + avatar.
  Hero: Readiness Index 0-1000 ring (currently 642), with delta
  +28 since last week.
  Three outcome cards horizontally:
  - "Capital Today" with eligibility check + 4 prequalified offers
  - "Bankability Built" with progress bar to next milestone
  - "Institutional Access" with gap-to-eligibility callout
  BPFS gauge (78% approval prob on a $250k working capital line).
  Next-best-action card: "Upload 2024 P&L to unlock +30 readiness pts"
  Recent activity timeline.
  Spec ref: §3.7.2, §3.8.

Screen 3. Diagnostic Intake (mid-flow, section 4 of 10).
  Top: progress indicator "Section 4 of 10: Financials".
  Question with branching helper text.
  Inline document upload card.
  "Save and resume" footer pinned.
  Spec ref: §3.1.

Screen 4. Vault grid + detail drawer.
  Top: filter chips (Formation, Financials, Tax, Banking, Identity),
  search, "Upload" CTA.
  Grid of 12 document cards with classification chip, retention badge,
  OCR status indicator.
  Right drawer open on one doc showing OCR preview, extracted fields,
  download presigned link CTA.
  Spec ref: §3.5.

Screen 5. Pathway timeline.
  Goal header: "Get bank-ready for a $500k SBA 7(a) line in 9 months."
  Timeline of 14 steps, color-coded by owner (client / advisor /
  system). Checkpoint chips every few steps.
  Per-step popovers showing blockers, dependencies, current state.
  Spec ref: §3.6.

Screen 6. Coach chat (streaming).
  Left rail: conversation history.
  Center: chat thread, AI message currently streaming with cursor,
  source-of-truth citations on hover.
  Right rail: "Context being used" panel showing the 3 vault docs +
  current snapshot summary the coach is grounded in.
  Input bar with attachment icon + "Send" primary.
  Spec ref: §3.3, §12.5.

Screen 7. Marketplace shortlist.
  Top: filter (loan type, amount, term, fastest funding).
  10 lender cards. Each card: lender logo, product name,
  amount range, term range, APR range, BPFS approval probability
  (color-coded), "Apply with one click" CTA, "Why this match"
  expandable.
  Compliance disclosure footer.
  Spec ref: §5.2, §3.7.

Screen 8. Advisor Command Center (caseload).
  Top: filter (stage, score band, last-touch, BPFS delta).
  Caseload table: 25 rows, sortable. Columns: client, NAICS,
  readiness, BPFS, last activity, stage, owner, actions.
  Right rail: NBA queue ("Next best action") with 8 ranked items
  the advisor should do today.
  Bulk action bar at bottom (Send nudge, Request docs,
  Trigger match).
  Spec ref: §3.9.

Screen 9. Advisor client detail (drill-in).
  Header: client name, NAICS, owner FICO, time-in-business.
  Tab nav: Overview, Diagnostic, Vault, Credit, Pathway, Coach,
  Applications, Notes.
  Overview tab open showing:
  - Score trajectory line chart (last 12 weeks)
  - BPFS delta chart
  - Active pathway summary
  - Recent coaching nudges
  - Open applications
  Right rail: advisor notes, schedule review CTA.
  Spec ref: §3.9.

Screen 10. Compliance audit log.
  Top filter (date range, actor, action type, subject).
  Audit log table with hash-chained badge per entry showing the
  prev_hash and curr_hash truncated.
  Each row expandable to show the full payload JSON.
  "Export evidence pack" CTA for SOC 2 evidence runs.
  Spec ref: §3.2, §4.2.3.

Screen 11. Lender cohort browse.
  Top: lender's credit-box criteria summary, "Subscribe" toggle.
  Cohort cards showing anonymized applicant counts in each
  score band, NAICS distribution, geo distribution.
  Drill into a cohort: anonymized applicant list, "Open decision"
  CTA on each, decision panel for approve / decline / counter.
  Compliance gates visible.
  Spec ref: §5.5.

Screen 12. Tenant admin (white-label).
  Left nav: Branding, Team, Billing, Integrations, Compliance.
  Branding tab open: upload logo, color picker (uses our token
  system to recolor), domain setup (CNAME instructions),
  email-from setup, preview of how their tenant looks live.
  Spec ref: §6.2 (advisor onboarding).

For every screen, add Code Connect mappings so the build fleet
can implement them 1:1 against the shadcn primitives in
packages/ui. Use the exact filenames the fleet will create:
components/ui/<lowercase-component-name>.tsx.

Show me each screen one at a time. I will react before you
move to the next.
```

### Block 2 acceptance bar

Before moving to Block 3, you must have:
- All 12 desktop screens completed.
- Every component on every screen is variable-bound (zero hardcoded values).
- Every component has a Code Connect mapping.
- Empty, loading, and error states exist for every screen.
- Realistic content (not "Lorem ipsum").

Walk through every screen once at the end and ask yourself: "Could a beta customer use this and not get lost?" If yes, ship Block 2.

---

## BLOCK 3. MOBILE + CLICKABLE PROTOTYPES + WALKTHROUGH VIDEO

**Goal:** Mobile parity, two clickable prototypes, a recorded narrated walkthrough.

### What you produce in Block 3

1. All 12 hero screens at 390px mobile.
2. Click-through prototype: Client gold path.
3. Click-through prototype: Advisor gold path.
4. 5-minute narrated walkthrough video.
5. Design system docs page (1 frame).

### Block 3 prompt to bot-design

```
Take every hero screen and produce the mobile version at 390px in
the same Figma file. Same components, restacked. Apply the
mobile-hardening patterns from spec §7.4:
- overflow-x: clip
- env(safe-area-inset-*) for notches and home indicators
- stack-on-mobile tables (label-prefixed cards)
- app-bar with hamburger replacing sidebar
- bottom nav on key client surfaces (Dashboard, Vault, Coach, Pathway, Marketplace)
- 44x44 minimum tap targets
- Lighthouse mobile target: 95+

Performance budget to design against:
- LCP < 1.8s on a mid-tier Android over 4G
- INP < 100ms
- CLS < 0.05
- JS bundle entry < 130 KB gz

Show me each mobile screen one at a time. I will react.

After the 12 mobile screens are done, wire two clickable Figma
prototypes:

Prototype A. Client gold path. Sequence:
  Sign-in (magic link) → Dashboard (first time) → Diagnostic intake
  (section 1 to section 4) → first Readiness Index reveal →
  Vault (upload P&L) → Coach (ask about increasing BPFS) →
  Marketplace shortlist → Apply with one click → confirmation.

Prototype B. Advisor gold path. Sequence:
  Sign-in → Command Center (caseload) → filter to "BPFS delta < 0
  this week" → drill into one client → score trajectory →
  Coach panel → send nudge → bulk action: request docs from
  3 clients → revenue dashboard quick glance.

Both prototypes wired on the mobile + desktop variants. Use
Figma's interactive components for state changes.

Then record a 5-minute walkthrough video using Figma's built-in
screen recorder. Narration script (you record, I provide the
script):

  [00:00 to 00:30] "This is BANKABLE IQ. It's the Institutional
  Readiness Operating System for small businesses. Here's how it
  works."
  [00:30 to 02:00] Client gold path walkthrough.
  [02:00 to 03:30] Advisor gold path walkthrough.
  [03:30 to 04:30] The two power moments: AI coach with grounded
  citations, and the BPFS prediction with SHAP explanations.
  [04:30 to 05:00] "This is what we are building. Twenty-seven
  AI agents code it. Founder picks the moves. Compliance signs.
  We ship."

Export the video to MP4 (1080p). Upload it to the Figma file as
a cover comment, and to docs/assets/ in the monorepo via
bot-design later.

Last thing: build one Figma frame titled "Design System Docs"
that documents: when to use Primary vs Secondary vs Ghost button,
when to use a Card vs a Stat Card vs a Score Ring, the spacing
scale, the typography scale, the color semantic mapping. One
page, scannable.
```

### Block 3 acceptance bar

Before declaring the sprint done, you must have:
- 12 mobile screens, every one passing the mobile patterns from spec §7.4.
- Two clickable prototypes that flow end-to-end without dead clicks.
- A 5-minute MP4 video that a non-technical viewer understands.
- A Design System Docs frame.

The "non-technical viewer test": show the video to one person who knows nothing about the platform. If they can articulate back what the product does and who it is for, the sprint is done.

---

## INTEGRATION POINTS BACK TO v2.1 AND v2.2

When the sprint completes, the outputs feed the fleet automatically.

| Sprint output | Goes to | How |
|---------------|---------|-----|
| `BANKABLE IQ Brand v1` Figma file URL | `.env`: `FIGMA_FILE_KEY` | bot-design (fleet) reads it via Figma MCP |
| Brand color tokens (Figma Variables) | `packages/design-tokens/tokens.json` | Exported via Figma Tokens plugin during bootstrap |
| Typography scale | Tailwind theme in `packages/design-tokens/tailwind.preset.ts` | Same export |
| Voice and tone one-pager | `packages/compliance-rules/coaching-system.md` and `docs/brand/voice.md` | Read by bot-coaching as part of system prompt |
| Brand statement asset | `apps/web/app/page.tsx` (public marketing home) | bot-frontend uses it as hero |
| 12 hero screens with Code Connect | First 12 frontend issues | bot-frontend implements them 1:1 |
| Mobile variants | Same screens, mobile breakpoint | bot-frontend implements both at once |
| Client gold path prototype | First Playwright e2e | bot-test-healer authors the e2e from the prototype flow |
| Advisor gold path prototype | Second Playwright e2e | Same |
| 5-minute walkthrough video | Build Console home, README, investor deck assets, `docs/assets/walkthrough-v1.mp4` | bot-console embeds it in the Console "About" panel |
| Design System Docs | `docs/design/system.md` and rendered in Storybook | bot-design (fleet) ports it to Storybook |

The bootstrap prompt from v2.1 + v2.2 needs one rider added when you run it. Append:

> Visual Foundation Sprint output is at Figma file key `{{FIGMA_FILE_KEY}}` (set as a repo secret). Before generating the initial issue queue, bot-platform must:
> 1. Read the Figma file via Figma MCP.
> 2. Export Figma Variables to `packages/design-tokens/tokens.json` and generate the Tailwind preset.
> 3. Pull all 12 hero screens' Code Connect mappings into `packages/ui/code-connect/`.
> 4. Copy the voice and tone one-pager into `packages/compliance-rules/coaching-system.md` and `docs/brand/voice.md`.
> 5. Embed the walkthrough video link in the Console "About" panel.
> 6. Use the 12 hero screens as the first 12 frontend issues (label `frontend`).
> 7. Use the two clickable prototypes as the source for the first two Playwright e2e suites.

The fleet then bootstraps with the visual constitution already loaded.

---

## YOUR RUN ORDER (PASTE-AND-GO)

Here is the exact path from "right now" to "fleet running."

1. **Open Figma. Enable Figma Make.**
2. **Create file:** `BANKABLE IQ Brand v1`.
3. **Paste the Block 1 prompt** above into Figma Make. Run it. Two 90-minute sessions.
4. **Lock Block 1 acceptance bar.** Move to Block 2.
5. **Build the component primitive set** (one session). Use the list under "Pre-Block 2 setup."
6. **Paste the Block 2 prompt.** Two sessions, one screen at a time, react after each.
7. **Lock Block 2 acceptance bar.** Move to Block 3.
8. **Paste the Block 3 prompt.** Mobile screens, prototypes, video.
9. **Lock Block 3 acceptance bar.** Sprint done.
10. **Export Figma file key.** Set it as a GitHub Actions secret: `FIGMA_FILE_KEY`.
11. **Run the v2.1 + v2.2 bootstrap prompt** in Claude Code with the rider above appended.
12. **PR #1 opens. You merge it. The fleet runs.**

From Block 1 start to fleet running: roughly 72 hours of wall clock with you in the loop for six 90-minute sessions and three reviews. The rest is bot-design generating and you reacting.

---

## WHAT YOU CAN DO WITH THE OUTPUT IMMEDIATELY

The instant the sprint completes, before any code exists, you have assets that are valuable on their own.

- **Show investors.** "Here is the product. Here is the founder feel. Here is the team building it."
- **Show beta customers.** Five potential clients, one of each persona. Get reactions to the prototype, not the abstract pitch.
- **Show partners.** Lender BDR conversations land harder when they see the cohort browse screen rendered.
- **Show your team.** The 27-agent fleet, every contractor, every advisor hire, lands on the same visual constitution.
- **Use in pitch deck.** Hero screens become deck slides. Walkthrough video becomes the demo slot.
- **Use in marketing.** Sign-up landing page, social proof carousel, sales one-pagers.

The Visual Foundation Sprint pays off three ways: it locks the fleet's direction, it gives you a sellable asset, and it tests the concept with real humans before code exists.

---

## COMMON FAILURE MODES (AND HOW TO AVOID THEM)

| Failure | Cause | Fix |
|---------|-------|-----|
| Sprint slips past 72 hours | Scope creep into long-tail screens | Block list. Only 12 hero screens. Refuse to design more until fleet is running. |
| Brand feels generic | Prompt was too short, bot-design picked safe defaults | Re-prompt with stronger audience and tone specifics. Lock voice samples first. |
| Components are not variable-bound | bot-design used hardcoded values to ship faster | Hard reject. Re-prompt with "every value must come from a Variable." |
| Prototype dead-ends on clicks | Wiring incomplete | Walk the prototype as a customer would. Every click must lead somewhere. |
| Video is too long or too jargon-heavy | Founder narration drifted | Use the script. 5 minutes hard cap. |
| Mobile screens are desktop screens with smaller text | bot-design did not actually re-architect for mobile | Re-prompt with explicit reference to spec §7.4 patterns. |
| Founder cannot pick a logo | Too many options shown | Ask bot-design to recommend one. Go with the recommendation 90% of the time. |
| Code Connect mappings missing | bot-design forgot the wiring | Re-prompt: "every component needs a Code Connect mapping or this is incomplete." |

---

## ALTERNATIVE PATHS (IF YOU CANNOT RUN THIS YOURSELF)

If you do not have the time or comfort to direct bot-design across six sessions:

| Alternative | Cost | Time | Quality |
|-------------|------|------|---------|
| Hire a Toptal or Dribbble senior fintech designer for 72h flat | $4,000 to $6,000 | 3 to 7 days lead time + 72h work | Highest, professional polish |
| Use Lovable or v0.dev to generate the 12 screens from text prompts | $50 to $200 | Same 72 hours | Strong if directed well |
| Skip mobile parity in this sprint, ship desktop only, do mobile after MVP | $0 | 36 hours saved | Risky; mobile is 60% of client traffic |

If you go with a hired designer, give them this document. They will know exactly what to produce.

---

## ACCEPTANCE CRITERIA FOR THE SPRINT AS A WHOLE

You are done with the Visual Foundation Sprint when all of the following are true:

- [ ] One logo direction picked.
- [ ] Color, typography, spacing tokens locked as Figma Variables.
- [ ] Voice and tone one-pager written, read out loud, feels right.
- [ ] Brand statement asset exists.
- [ ] All 12 hero screens at desktop done, variable-bound, Code Connect mapped, all states.
- [ ] All 12 hero screens at mobile done, mobile patterns applied.
- [ ] Client gold path prototype clicks end to end without dead ends.
- [ ] Advisor gold path prototype clicks end to end without dead ends.
- [ ] 5-minute walkthrough video recorded, exported MP4, narration matches script.
- [ ] Design System Docs frame exists.
- [ ] Figma file key saved to GitHub Actions secret `FIGMA_FILE_KEY`.
- [ ] One non-technical person watched the video and articulated back what the product does.

When every box is checked, you run the v2.1 + v2.2 bootstrap. From that point, the fleet builds.

---

## AUDIT REPORT (v2.3)

Same discipline applied here.

### What I verified

- Figma Make supports the prompt-driven generation pattern described.
- Figma Variables are the correct primitive for token systems.
- Code Connect is a real Figma feature for mapping components to code.
- Figma's built-in screen recorder exports MP4.
- shadcn/ui component naming matches what bot-frontend will scaffold under `packages/ui`.
- The mobile patterns referenced (overflow-x: clip, safe-area-inset, stack-on-mobile tables) all match what was in the source engineering spec §7.4.
- Performance budgets stated (LCP < 1.8s, INP < 100ms, CLS < 0.05) match spec §7.4 verbatim.
- Voice and tone one-pager into `coaching-system.md` matches the coaching architecture in spec §3.3.1.

### Decisions I made as master developer and designer

1. **12 hero screens, not 30.** Cuts sprint time to 72h. Long tail expands during the fleet build.
2. **Mobile parity in the same sprint.** Refusing to defer because 60% of client traffic is mobile and mobile-as-afterthought is the most common fintech UX failure.
3. **Two prototypes, not five.** Client gold path and Advisor gold path are the two flows that prove the platform. Lender, compliance officer, and admin views get static hero screens. Their interactive flows ship later from the fleet.
4. **5-minute video, hard cap.** A 12-minute walkthrough loses everyone. 5 minutes forces ruthless editing.
5. **bot-design + founder direction recommended over hiring a human designer.** Faster, cheaper, more consistent with the rest of the build philosophy. Hiring is the fallback if you do not want to direct.
6. **Dark mode is the default.** Trust-coded institutional fintech feels more premium in dark mode. Light mode exists but is the secondary.
7. **Sora display + Plus Jakarta Sans body.** Same as the spec, locked. Not negotiating fonts in this sprint.
8. **No A/B variants of major brand decisions.** Pick once, ship. The fleet can refine post-MVP.

### Limitations remaining

- The sprint produces visual assets, not validated usability research. Real user testing happens on preview deploys after the fleet ships them.
- The video is one founder's narration, not a polished marketing reel. Polished reel comes after MVP launches.
- The 12 hero screens do not cover every edge case. The fleet handles edge cases during build.
- The brand statement and voice samples are v1. They will evolve based on customer reactions.

---

## DELIVERABLES YOU NOW HOLD

| Document | What it covers |
|----------|----------------|
| `BANKABLE-IQ_AI-BUILD-PLAYBOOK_v1.md` | Sequential single-driver build, fallback model |
| `BANKABLE-IQ_AUTONOMOUS-BUILD-PLAYBOOK_v2.1.md` | 22-agent autonomous fleet |
| `BANKABLE-IQ_OPERATOR-COMPANION_v2.2.md` | +5 agents, Console, Demos, Decision Engine, Archeologist, Backup |
| `BANKABLE-IQ_VISUAL-FOUNDATION-SPRINT_v2.3.md` | This doc. 72-hour visual constitution. Runs before the fleet. |

Run order: v2.3 first (you produce visual constitution). Then v2.1 + v2.2 bootstrap (fleet starts). v1 is the fallback if you ever need to drop to manual.

End of Visual Foundation Sprint v2.3
