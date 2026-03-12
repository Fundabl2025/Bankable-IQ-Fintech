



FUNDREADY™
FIGMA EXECUTION PLAN

─────────────────────────────────────────

The step-by-step system for designing the complete
pre-funding readiness platform — one prompt at a time.


Total Prompts:  28
Total Phases:  7
Total Screens:  12 + Component Library
Platform:  FundReady™ by Fundabl


Kevin Murphy  ·  Fundabl  ·  info@getfundabl.com
 
HOW TO USE THIS EXECUTION PLAN


This document is your complete, ordered, step-by-step blueprint for designing FundReady™ in Figma. Every prompt in this plan builds on the previous one. Nothing is skipped. Nothing is assumed.

THE STRUCTURE
●	7 Phases from Design System to Final Prototype
●	28 individual Figma prompts — each does one specific job
●	Every prompt has a label (e.g. P1.1, P2.3) for reference
●	Every prompt lists its deliverables — what Figma must produce
●	Every prompt lists its dependencies — what must exist before it runs

HOW TO USE EACH PROMPT
●	Copy the prompt exactly as written
●	Paste it into Figma AI (or give it to your designer verbatim)
●	Do not run the next prompt until the current deliverables are complete
●	Check off each deliverable before advancing

  IMPORTANT: Prompts are not suggestions. They are precise build instructions. Treat them like a contractor reads blueprints — exactly as written, in order, no improvisation.

THE THREE USER GOALS THIS SYSTEM SERVES
●	Goal 1: Access as much funding as possible RIGHT NOW
●	Goal 2: Build a bankable business (30–90 day track)
●	Goal 3: Access larger loans at lower rates (90–180 day track)

THE THREE-LAYER ENGINE (understand this before designing anything)
●	LAYER 1  Layer 1 — FundScore™ (0–1000)
○	    6-dimension weighted score: Credit 28% · Documentation 22% · Cash Flow 20% · Banking 13% · Structure 10% · Narrative 7%
●	LAYER 2  Layer 2 — 20-Item Lender Compliance Checklist
○	    Business infrastructure items lenders verify — separate from FundScore™
●	LAYER 3  Layer 3 — 17-Product Eligibility Matrix
○	    Score + compliance together determine which products unlock, approach, or stay locked
 
MASTER OUTLINE — ALL 28 PROMPTS AT A GLANCE


PHASE 1 — DESIGN SYSTEM FOUNDATION
●	P1.1 — Color Token System + Semantic Variables
●	P1.2 — Typography Scale + Font Pairing
●	P1.3 — Core Component Library Part A (Buttons, Inputs, Cards)
●	P1.4 — Core Component Library Part B (Score, Status, Compliance)
●	P1.5 — Layout Grid + Navigation Shell

PHASE 2 — MARKETING + ENTRY POINT
●	P2.1 — Landing Page (Hero + Problem + Solution)
●	P2.2 — Onboarding Flow (5 Steps + Score Reveal)

PHASE 3 — CORE ASSESSMENT ENGINE
●	P3.1 — FundScore™ Assessment (Welcome Screen)
●	P3.2 — FundScore™ Assessment (Question Screen Template)
●	P3.3 — FundScore™ Assessment (Results Screen)

PHASE 4 — COMMAND CENTER
●	P4.1 — Main Dashboard (Score + Compliance Left Column)
●	P4.2 — Main Dashboard (Products + Actions Right Column)
●	P4.3 — Capital Access Map (Sidebar + Tab Shell)
●	P4.4 — Capital Access Map (Tab 1 — Products)
●	P4.5 — Capital Access Map (Tab 2 — Compliance)
●	P4.6 — Capital Access Map (Tab 3 — Score Breakdown)
●	P4.7 — Capital Access Map (Tab 4 — Action Plan)

PHASE 5 — OPERATIONAL SCREENS
●	P5.1 — Lender Compliance Page (Full 20-Item Checklist)
●	P5.2 — Action Plan Page (Ranked Actions + Milestones)
●	P5.3 — Product Detail Page Template (3 Status Variants)
●	P5.4 — Business Health Scan (3 Steps + Results)
●	P5.5 — Document Center
●	P5.6 — AI Financial Advisor Chat

PHASE 6 — MOBILE + RESPONSIVE
●	P6.1 — Mobile Navigation System (Bottom Tab Bar)
●	P6.2 — Mobile Key Screens (Score + Products + Compliance)
●	P6.3 — Mobile Assessment + Results

PHASE 7 — PROTOTYPE + USER FLOWS
●	P7.1 — Goal 1 User Flow (Get Funded Now — Interactive)
●	P7.2 — Goal 2 User Flow (Build Bankability — Interactive)
●	P7.3 — Goal 3 User Flow (Premium Loan Path — Interactive)
 
PHASE 1  —  DESIGN SYSTEM FOUNDATION
Everything in this platform is built from this phase. Run all 5 prompts in sequence before touching any screen. A screen built without the design system is throwaway work.

P1.1 — Color Token System + Semantic Variables
  Dependency: None. This is the starting point for the entire project.

[PROMPT P1.1]  Design System — Color Tokens
     Create the FundReady™ color token system as a Figma Styles library. Build every token as a named style so it can be applied globally and updated from one place. Organize into groups exactly as listed below.

Backgrounds (6 tokens):
●	bg/base → #0d0f0b
●	bg/surface-1 → #131510
●	bg/surface-2 → #191c14
●	bg/surface-3 → #1f231a
●	bg/sidebar → #0a0c08
●	bg/elevated → #242820

Borders (3 tokens):
●	border/subtle → #2a2e22
●	border/medium → #363b2c
●	border/strong → #4a5038

Text (4 tokens):
●	text/primary → #e4e8d8
●	text/secondary → #b8bca8
●	text/muted → #6b7258
●	text/disabled → #3a3d2e

Brand — Lime System (5 tokens):
●	lime/500 → #8ab820  (primary CTA, active)
●	lime/600 → #5a7a10  (hover, dark)
●	lime/900 → #1a2a04  (deep bg)
●	lime/alpha → rgba(138,184,32,0.08)  (subtle tint)
●	lime/glow → rgba(138,184,32,0.20)  (hover glow)

Score Band Colors (6 tokens — CRITICAL):
●	score/critical → #b04428  (0–399)
●	score/low → #c89020  (400–549)
●	score/developing → #a0a020  (550–649)
●	score/approaching → #38a880  (650–749)
●	score/ready → #8ab820  (750–899)
●	score/prime → #c8f040  (900–1000)

Status + Semantic (8 tokens):
●	status/unlocked → #8ab820
●	status/approaching → #c89020
●	status/locked → #b04428
●	status/done → #8ab820
●	semantic/amber → #c89020
●	semantic/red → #b04428
●	semantic/teal → #38a880
●	semantic/violet → #8858c8

Deliverables:
✓  32 named color styles in Figma color panel, grouped exactly as above
✓  Each style tested against bg/base for accessibility legibility
✓  Style naming convention documented in a text node on the page

P1.2 — Typography Scale + Font Pairing
  Dependency: P1.1 complete. Fonts: Syne (400/600/700/800), DM Sans (300/400/500), Crimson Pro (italic 300/400).

[PROMPT P1.2]  Design System — Typography
     Create the FundReady™ typography system as Figma Text Styles. Every text style must be named, sized, and applied to a sample. Build a specimen page showing every style in context.

Text Styles to Create (15 total):
●	score/hero — Syne 800, 96px, -0.03em tracking
●	score/large — Syne 800, 64px, -0.02em
●	score/medium — Syne 700, 44px, -0.02em
●	heading/h1 — Syne 800, 52px, -0.02em
●	heading/h2 — Syne 700, 28px, -0.01em
●	heading/h3 — Syne 600, 20px, 0.01em
●	heading/h4 — DM Sans 500, 16px, 0.02em
●	body/lg — DM Sans 300, 16px, 1.7 line height
●	body/default — DM Sans 300, 14px, 1.65 line height
●	body/sm — DM Sans 400, 13px, 1.6 line height
●	label/default — DM Sans 400, 11px, 0.12em, UPPERCASE
●	label/sm — DM Sans 400, 9px, 0.2em, UPPERCASE
●	callout — Crimson Pro italic 300, 18px, 1.8 line height
●	callout/sm — Crimson Pro italic 300, 15px, 1.7 line height
●	mono — DM Mono 400, 13px (for code/data values)

Specimen Page Requirements:
●	Each style shown with sample text relevant to the platform
●	score/hero: "624" in each of the 6 score band colors
●	heading/h1: "Your FundScore™ is ready."
●	callout: "Momentum is building. Focus on your top 3 actions."

Deliverables:
✓  15 named text styles in Figma text styles panel
✓  Typography specimen page with all 15 styles demonstrated
✓  Font pairings tested on dark background (bg/base)

P1.3 — Core Component Library Part A (Buttons, Inputs, Cards)
  Dependency: P1.1 and P1.2 complete.

[PROMPT P1.3]  Component Library — Interactive Elements
     Build the FundReady™ interactive component library. Every component must be a Figma component with variants covering ALL states. Use auto-layout throughout. No fixed-width components unless specified.

BUTTONS — 4 variants × 5 states = 20 total:
●	Variant: Primary (bg lime/500, text black, Syne 700 14px uppercase, 0 radius)
○	    States: Default · Hover (bg lime/600 + glow) · Active (pressed, scale 0.98) · Disabled (bg border/subtle, text/disabled) · Loading (spinner left of text)
●	Variant: Secondary (transparent bg, 2px border/medium, text/secondary)
○	    States: Default · Hover (border lime/500, text/primary) · Active · Disabled · Loading
●	Variant: Ghost (no border, text/muted)
○	    States: Default · Hover (text lime/500) · Active · Disabled
●	Variant: Danger (red/10% bg, border red, text red)
○	    States: Default · Hover (red/20% bg) · Active · Disabled · Loading

INPUTS — 3 variants × 4 states = 12 total:
●	Variant: Text Input (bg surface-3, border subtle, DM Sans 300 14px)
○	    States: Default · Focus (border lime/500, ring lime/alpha) · Error (border red) · Disabled
●	Variant: Search Input (with search icon left)
○	    States: same 4 states
●	Variant: Text Area (multiline, resize handle)
○	    States: same 4 states

CARDS — 3 variants × 3 states = 9 total:
●	Variant: Default (bg surface-1, border subtle, 0 radius, padding 24px)
○	    States: Default · Hover (border medium) · Active/Selected (border lime/600)
●	Variant: Elevated (bg surface-2, border subtle)
○	    States: Default · Hover · Active
●	Variant: Highlighted (bg lime/alpha, border lime/600)
○	    States: Default · Hover · Active

Deliverables:
✓  4 button components with all 5 states each
✓  3 input components with all 4 states each
✓  3 card components with all 3 states each
✓  All on a single "Components / Interactive" page in Figma

P1.4 — Core Component Library Part B (Score, Status, Compliance)
  Dependency: P1.1, P1.2, P1.3 complete. This is the most critical component page — these elements appear on every screen.

[PROMPT P1.4]  Component Library — FundReady™ Signature Components
     Build the platform-specific components that define the FundReady™ visual identity. These are the score display system, status indicators, compliance dots, dimension bars, product status pills, and gap pills. Every variant. Every state.

SCORE BADGE — 6 variants (one per score band):
●	Score number: Syne 800, sized to container, colored by band
●	Band label: Crimson Pro italic 16px, below score
●	Score track: 6px bar, gradient lime-600 to lime-500, shows position 0–1000
●	Sizes: hero (96px number), large (64px), medium (44px), small (32px), chip (24px)
●	All 6 must exist for each size = 30 total variants minimum

STATUS PILLS — 3 variants:
●	Unlocked: bg lime/alpha, border 1px lime/600, lime dot, "PRE-QUALIFIED" label (Syne 700 10px uppercase)
●	Approaching: bg amber/10%, border amber/60%, amber dot, "APPROACHING" label
●	Locked: bg red/10%, border red/60%, red dot, "LOCKED" label

COMPLIANCE DOT — 5 variants:
●	Done: bg lime/500, 14×14px, border-radius 2px
●	Quick Win: bg amber/500, same size
●	Medium: bg #c87020, same size
●	Long-term: bg red/500, same size
●	Empty: bg border/medium, same size
●	Hover state on all: scale 1.3, show tooltip with item name

DIMENSION BAR — 1 component, 3 color states:
●	Row: label (10px label style, 80px wide) | track (flex, 6px height) | percentage (28px right-aligned)
●	Fill color: lime if ≥70%, amber if 45–69%, red if <45%
●	Build with auto-layout, fill width

GAP PILLS — 2 variants:
●	Score Gap: bg amber/10%, border amber/60%, text amber, "+X pts needed"
●	Compliance Gap: bg amber/5%, border amber/40%, text muted, "#X: Item Name"

PROGRESS BAR — 1 component, 3 sizes:
●	Track: bg border/subtle, heights: 4px / 6px / 10px
●	Fill: linear-gradient lime/600 → lime/500
●	Label overlay option: percentage right-aligned above bar

ADVISORY NOTE — 1 component:
●	bg amber/10%, border-left 3px amber, padding 16px 20px
●	Text: Crimson Pro italic 300 16px
●	Include icon variant (⚠) and clean variant

Deliverables:
✓  Score badge component: 30+ variants (6 bands × 5 sizes)
✓  Status pill component: 3 variants
✓  Compliance dot component: 5 variants + hover state
✓  Dimension bar component: 3 color states
✓  Gap pill component: 2 variants
✓  Progress bar component: 3 sizes
✓  Advisory note component: 2 variants
✓  All on "Components / FundReady™ Signature" page

P1.5 — Layout Grid + Navigation Shell
  Dependency: P1.1–P1.4 complete. This establishes the frame every screen is built inside.

[PROMPT P1.5]  Layout System + Navigation Components
     Build the FundReady™ layout system: the sidebar, the top navigation bar, the content area grid, and the mobile bottom tab bar. These are the structural shells that every screen sits inside. Build as Figma components so each screen can use the same base.

SIDEBAR COMPONENT (280px × full height):
●	bg: #0a0c08, border-right: 1px border/subtle
●	Top section: Logo "FUND" + lime "READY™" (Syne 800 20px) + score chip below
●	3 nav groups with group labels (label/sm style, border-bottom border/subtle):
○	    Group 1 "YOUR READINESS": FundScore Overview · Lender Compliance · Business Scan · Action Plan
○	    Group 2 "ACCESS FUNDING": Capital Access Map · [17 product names in collapsed list]
○	    Group 3 "TOOLS": AI Advisor · Document Center · Assessment · Settings
●	Nav item states: Default · Hover (bg lime/alpha) · Active (bg lime/alpha, lime left border 2px, text/primary)
●	Bottom section: business name + entity type + last updated timestamp
●	Collapsed state (60px wide) for smaller screens — icon only

TOP NAV COMPONENT (52px height):
●	bg: surface-1, border-bottom: 1px border/subtle, sticky
●	Left: breadcrumb (text/muted → text/secondary → text/primary)
●	Right: score chip + notification bell + user avatar
●	Tab variant: 4 tab options with active state (lime 2px bottom border)

LAYOUT FRAME TEMPLATES:
●	Full layout: sidebar(280px) + topnav(52px) + content area — 1440px frame
●	Full layout mobile: no sidebar + topnav + content — 375px frame
●	Focus mode: no sidebar, centered content max-width 720px (for assessment)
●	Content grid: 32px column gap, 40px horizontal padding

MOBILE BOTTOM TAB BAR:
●	5 tabs: Home · Score · Products · Actions · Chat
●	Active: lime icon + lime label, bg surface-1
●	Inactive: muted icon + muted label
●	Height: 72px, border-top border/subtle

Deliverables:
✓  Sidebar component: expanded + collapsed states
✓  Top nav component: default + tab variants
✓  3 layout frame templates (1440 desktop, 375 mobile, 720 focus)
✓  Mobile bottom tab bar component
✓  "Components / Layout" page in Figma
 
PHASE 2  —  MARKETING + ENTRY POINT
The first things a skeptical business owner sees. These screens must convert distrust into action. No inspiration. No story. Show the tool, show the data, show the path.

P2.1 — Landing Page
  Dependency: Full Phase 1 complete. Use all components from the library.

[PROMPT P2.1]  Landing Page — Full Desktop + Mobile
     Design the FundReady™ marketing landing page. The primary user has been denied funding before. They are skeptical. Do not inspire them. Show them the tool and what it produces. Every section must convert skepticism into a single click: "Get My FundScore™ Free."

HERO SECTION (viewport height):
●	bg: #0d0f0b + SVG grain texture overlay (2% opacity)
●	Left column 55%: headline + subhead + CTAs + trust strip
●	Headline (h1, Syne 800 72px): "You weren't denied / because you failed." (line 2 lime) / "You were denied because / you weren't prepared." (line 4 lime)
●	Subhead (Crimson Pro italic 20px, muted): "33 million small businesses. 80%+ denied. Not because their business isn't worthy — because no one showed them what lenders actually check."
●	CTA row: Primary "Get My FundScore™ Free" + Ghost "See How It Works"
●	Trust strip: 🔒 "No bank login" · 📊 "No credit pull" · ⏱ "Results in 10 min" — 12px label, text/muted
●	Right column 45%: floating score preview card — Score 624, band "Developing," 3 unlocked product chips, 2–3° rotation, lime edge glow

PROBLEM SECTION (3 columns):
●	Headline: "The real reasons you were denied." Syne 700, 36px, centered
●	3 cards: Credit Profile · Compliance (14 of 20 items fixable in 30 days) · Documentation
●	Each card: stat in lime/500 Syne 800, explanation below in body/default

SOLUTION SECTION (3 steps):
●	Step 1: FundScore™ Assessment → 24 questions, 10 min, no bank login
●	Step 2: Gap Analysis → see exactly what's blocking you
●	Step 3: Capital Access → pre-qualify today, unlock more in 30–90 days
●	Visual connector: simplified score card showing transformation between steps

SOCIAL PROOF STRIP:
●	Full-width dark strip: "33M small businesses" · "$300B+ denied annually" · "17 funding products mapped" — numbers in Syne 800 lime, labels in DM Sans muted

FINAL CTA SECTION:
●	"Stop applying unprepared. Start with your FundScore™."
●	Primary CTA centered, large (padding 18px 48px)

Deliverables:
✓  Desktop landing page (1440px): all 5 sections
✓  Mobile landing page (375px): all sections adapted
✓  Hero section hover state on score preview card

P2.2 — Onboarding Flow (5 Steps + Score Reveal)
  Dependency: P1.1–P1.5 complete.

[PROMPT P2.2]  Onboarding — 5-Step Flow + Score Reveal
     Design the FundReady™ onboarding flow. 5 steps that collect enough context to run the first eligibility check. No sidebar. Focus mode layout. Progress bar across top showing step X of 5. This is not a form — it is a setup conversation.

STEP 1 — Business Basics (fields):
●	Business Name · Entity Type (visual radio cards with icons) · State · Industry (searchable select) · Years in Business
●	Entity Type cards: Sole Prop / LLC / S-Corp / C-Corp — selected state lime border + lime icon

STEP 2 — Revenue & Banking (sliders + inputs):
●	Average Monthly Revenue: styled range slider + manual input
●	Business Bank Months Open: slider 0–60
●	Personal FICO Range: slider 500–850, labels at key thresholds
●	Avg Daily Balance Range: slider
●	All sliders: lime thumb, lime track fill, 0 default radius

STEP 3 — Documentation Status (toggle cards):
●	5 items: Tax returns · P&L · Bank statements · Business plan · Articles of incorporation
●	Each: toggle card with Yes / No / In Progress — selected = lime border + lime check

STEP 4 — Goal Selection (multi-select visual cards):
●	Card 1: "Get funded now" ⚡
●	Card 2: "Build bankability" 🏗
●	Card 3: "Access premium rates" 🏦
●	All 3 can be selected. Selected state: lime border, lime/alpha bg, lime check top-right
●	Amount range selector below: "How much are you looking to access?"

STEP 5 — Score Loading + Reveal:
●	Loading state: full screen, animated progress bar, 3 cycling text lines
○	    "Analyzing your credit profile..." / "Running lender eligibility check..." / "Building your action plan..."
●	Score reveal: counter from 0 to final score (show 624 as default for design)
●	Below score: "Your assessment is ready. Let's review it together."
●	CTA: "View My FundReady™ Dashboard →"

Deliverables:
✓  5 onboarding step screens (desktop 1440px)
✓  Score loading state
✓  Score reveal state
✓  Mobile versions of all 7 screens (375px)
 
PHASE 3  —  CORE ASSESSMENT ENGINE
The FundScore™ questionnaire is the entry point into the platform's engine. 24 questions. No bank login. No credit pull. The design must feel authoritative — this is a financial evaluation, not a survey.

P3.1 — FundScore™ Assessment — Welcome Screen
  Dependency: Phase 1 complete. Focus mode layout (no sidebar, max-width 720px centered).

[PROMPT P3.1]  FundScore™ Assessment — Welcome Screen
     Design the welcome screen for the FundScore™ 24-question assessment. Full-page focus mode. No sidebar. This screen must communicate: this is serious, this is fast, and the result is specific to your business. The user has likely been denied funding — they are skeptical. Show them the outcome before they start.

Layout:
●	Topbar: Logo left · "🔒 No bank login · No credit pull" center (trust callout in lime/alpha pill) · progress 0% right
●	Progress bar: 4px height, lime gradient, full width below topbar
●	Content: centered, max-width 600px, auto-scrollable

Content (top to bottom):
●	Trust strip: bg lime/alpha, border lime/600, "🔒 No bank login. No credit pull. Results in 10 minutes." DM Sans 500
●	H1 (Syne 800 clamp 36–56px): "Find out if you're ready to get funded."
●	Subhead (Crimson Pro italic 20px): "24 plain-language questions. No bank login. No credit pull. Your FundScore™ is specific to your business — not a generic range."
●	Time badge (amber bg, amber border): "⏱ Most people finish in 6–9 minutes"
●	"What you'll get" card (bg surface-2):
○	    ✓ FundScore™ (0–1000)  ✓ 6-Dimension Breakdown
○	    ✓ Ranked Action Plan   ✓ Lender Access Preview
○	    Each check: 22×22 lime square (no radius), lime checkmark inside
●	CTA: Primary button full-width "Start My FundScore™ Assessment →"

Deliverables:
✓  Welcome screen desktop (1440px focus layout)
✓  Welcome screen mobile (375px)

P3.2 — FundScore™ Assessment — Question Screen Template
  Dependency: P3.1 complete. This is a template — one design for all 24 questions.

[PROMPT P3.2]  FundScore™ Assessment — Question Screen
     Design the question screen template for all 24 questions in the FundScore™ assessment. One template that works for all questions. Show it populated with Question 1 ("What is your estimated personal credit score?") as the example.

Layout: Focus mode, max-width 680px centered.

Topbar (same as welcome, progress updates):
●	Progress bar shows current % (show at 25% for Q7 example)
●	Section label: "Credit Profile" left + "Question 7 of 24" right (label/sm style)

Question Area:
●	Section indicator: 10px lime dot + section name (label/sm, muted) + count right
●	Question text: Syne 600, clamp 20–28px, text/primary
●	"Why this matters" advisory callout:
○	    Crimson Pro italic, bg lime/alpha, border-left 3px lime/600
○	    1–2 sentences: why lenders care about this question

Option Cards (4–6 per question):
●	Full-width stacked cards, bg surface-2, border border/subtle
●	Left: letter badge (A/B/C) — Syne 600 12px in 28×28 bg surface-3 box
●	Right: option label (DM Sans 400 15px) + optional subtitle (DM Sans 300 12px muted)
●	UNSELECTED hover: border lime/600, bg lime/alpha
●	SELECTED: border lime/600, bg lime/alpha, lime checkmark right (animated in)
●	Letter badge changes: bg lime/500, text black when selected

Navigation:
●	"Continue" button (primary, full-width) — disabled until answer selected
●	"Back" ghost button left of Continue — hidden on Q1

Show all 5 states:
●	Fresh (no selection)
●	Option hovered
●	Option selected (Continue enabled)
●	Transition to next question
●	Back button visible (Q2+)

Deliverables:
✓  Question screen template (desktop 1440 focus)
✓  5 state variants as Figma frames
✓  Mobile version (375px)

P3.3 — FundScore™ Assessment — Results Screen
  Dependency: P3.1 and P3.2 complete. This is the most important reveal in the entire platform.

[PROMPT P3.3]  FundScore™ Assessment — Results Screen
     Design the FundScore™ results screen. This is the score reveal moment — where an unprepared business owner sees their number for the first time. The design must communicate precision and momentum simultaneously. Show them where they stand, what it means, and what they do next — in that order.

Layout: Focus mode, full scrollable, max-width 720px centered.

Section 1 — Score Reveal:
●	Score number: Syne 800, 120px, color from score band (show 624 → score/developing color #a0a020)
●	Annotation: "(annotate: counter animates from 0 to 624 over 1.2s)"
●	Band label: Crimson Pro italic 22px → "Developing — Momentum Building"
●	Score meter: 12px track, lime gradient fill, fills from left after 300ms delay
●	Meter markers: "0" left, "500" center, "1000" right — label/sm muted

Section 2 — 6 Dimension Breakdown:
●	Title: "Your Score Breakdown" Syne 600
●	6 dimension rows (use dimension bar component from P1.4)
●	Show Credit 72% · Documentation 58% · Cash Flow 68% · Banking 44% · Structure 80% · Narrative 62%
●	Bars animate in staggered (80ms between each) after score reveal

Section 3 — Top 5 Priority Actions:
●	Title: "Your Highest-Impact Moves"
●	5 action cards: rank box · action name · 2-sentence why · 3 pills (pts, time, dimension)

Section 4 — Lender Access Block:
●	Dark panel (bg #1a1a14): "What You Can Access Right Now"
●	Title: lime, Syne 700 16px
●	Unlocked items: lime ✓ + label + note
●	Locked items: muted → + description

Final CTA:
●	"Get My Full Remediation Plan →" — primary button, full width
●	Navigates to Capital Access Map

Deliverables:
✓  Results screen desktop (1440 focus mode)
✓  Animation annotations on score counter, meter, and dimension bars
✓  Mobile results screen (375px)
 
PHASE 4  —  COMMAND CENTER
The heart of the platform. These 7 prompts build the main dashboard and the Capital Access Map — the two screens where users spend the most time. These must be flawless.

P4.1 — Main Dashboard — Score + Compliance (Left Column)
  Dependency: Full Phase 1 + Phase 3 complete. Full layout (sidebar + topnav).

[PROMPT P4.1]  Main Dashboard — Left Column
     Design the left column of the FundReady™ main dashboard. This column contains the FundScore™ display, dimension breakdown, compliance summary, and eligibility summary. It is always visible. It is the user's north star. Design it for a user returning after taking the assessment.

Left Column Width: 38% of content area

SCORE CARD (top):
●	Score: Syne 800 96px, color from band (show 624 → #a0a020)
●	Band: Crimson Pro italic 22px → "Developing — Momentum Building"
●	Score track: 10px, lime gradient, shows 62.4% fill
●	Subscript: "Last updated 3 days ago · Take new assessment →" (link style, text/muted)
●	6 dimension bars below score (from P1.4 component)

COMPLIANCE CARD:
●	Header: "Lender Compliance" (h3) + "11/20 Complete" (score chip, amber)
●	20-dot grid: 4 rows of 5 dots, 16px each, 8px gap
●	Show 11 lime (done), 4 amber (quick win), 3 orange (medium), 2 red (long-term)
●	Legend: 4 items in a row below dots
●	"View All 20 Items →" (ghost link)

ELIGIBILITY SUMMARY:
●	3 badges in a row:
○	    "4 Unlocked" → green badge / "3 Approaching" → amber badge / "10 Locked" → red badge

Deliverables:
✓  Left column design (desktop)
✓  Empty state for left column (no score yet)
✓  Loading skeleton for left column

P4.2 — Main Dashboard — Products + Actions (Right Column)
  Dependency: P4.1 complete.

[PROMPT P4.2]  Main Dashboard — Right Column
     Design the right column of the main dashboard. This is the action side — it shows what the user can do, what they qualify for right now, and what their next highest-impact moves are. Every element must drive a specific next action.

Right Column Width: 62% of content area

METRIC STRIP (4 stats in a row):
●	Score Change: "+12 this week" (lime) · Products Unlocked: "4" · Items Completed: "11" · Days Active: "14"
●	Each: label/sm above, Syne 700 28px number in respective color

PRE-QUALIFIED PRODUCTS:
●	Title: "Available to You Now" (h2)
●	Subtitle: "These products match your score and compliance status" (body/sm muted)
●	Horizontal scroll row of 4 product cards:
○	    Each: status dot (lime glow) · name · amount range · 2 key stats · "Fastest" or "Best Rate" tag
○	    "View Details →" link

NEXT BEST ACTIONS (3 items):
●	Title: "Your Highest-Impact Moves" (h2)
●	3 action items: rank (Syne 800 28px) · description · pts pill · time pill
●	"View Full Action Plan →" link

APPROACHING PRODUCTS (2 cards):
●	Title: "Within Your Reach" (h2)
●	2 compact product cards showing gap: "Need +47 pts and 2 compliance items"
●	Progress bar per card showing proximity to unlocking

Deliverables:
✓  Right column design (desktop)
✓  Full dashboard composite (left + right + sidebar + topnav)
✓  Empty state (no assessment taken)
✓  Loading skeleton (full dashboard)

P4.3 — Capital Access Map — Sidebar + Tab Shell
  Dependency: P4.1 + P4.2 complete.

[PROMPT P4.3]  Capital Access Map — Layout Shell
     Design the layout shell for the Capital Access Map. This is the most data-dense screen in the platform. It has a 300px internal sidebar (separate from the main nav sidebar), a topbar with 4 tabs, and a main content panel. Design the shell with all 4 tabs labeled, the sidebar populated, and the content area empty (it will be filled in P4.4–P4.7).

INTERNAL SIDEBAR (300px):
●	Section 1 — FundScore™: score Syne 800 52px (lime) · band italic · 6px track · 6 mini dim bars
●	Section 2 — Compliance: 20-dot grid · legend
●	Section 3 — Eligibility: 3 badges
●	Section 4 — Adjust Profile (interactive label):
○	    FundScore™ slider 200–950 (labeled)
○	    Compliance Done slider 0–20 (labeled)
○	    "Changes update eligibility in real time" — callout/sm text, amber

TOPBAR (4 tabs):
●	Tab 1: "Capital Access" (default active)
●	Tab 2: "Lender Compliance"
●	Tab 3: "FundScore™ Breakdown"
●	Tab 4: "Action Plan"
●	Active: Syne 600, lime bottom border 2px, text/primary
●	Inactive: DM Sans, text/muted

Deliverables:
✓  Capital Access Map shell (sidebar + tabs + empty content area)
✓  Sidebar: default state + slider moved state (showing eligibility change)

P4.4 — Capital Access Map — Tab 1: Products
  Dependency: P4.3 complete.

[PROMPT P4.4]  Capital Access Map — Products Tab
     Design Tab 1 of the Capital Access Map: the full 17-product eligibility grid. Products are sorted by status: unlocked first, then approaching, then locked. Each group has a header. Each product has a card. Show detailed gap analysis on cards.

Group Headers between status changes:
●	"PRE-QUALIFIED NOW" — lime, label/sm
●	"APPROACHING — WITHIN REACH" — amber, label/sm
●	"LOCKED — GAP ANALYSIS BELOW" — muted, label/sm

Product Card (show 3 variants — unlocked / approaching / locked):
●	HEADER ROW: status dot · product name (Syne 600 14px) · amount range (colored by status)
●	METADATA GRID (4 columns): Rate/Cost · Funding Speed · Min Score · Compliance Req
●	GAP SECTION (unlocked): "✓ Pre-Qualified" tag + any requirements note
●	GAP SECTION (approaching): score bar showing current vs needed · missing compliance pills
●	GAP SECTION (locked): "Score X → Y needed" text + all missing compliance pills

Show these 3 products as examples:
●	Working Capital Loan: UNLOCKED (score 624 ≥ 400, all required items done)
●	Business Credit Line: APPROACHING (score 624, need 550 ✓, missing 2 compliance)
●	SBA Loan: LOCKED (need 720 pts + all 20 compliance items)

Deliverables:
✓  Products tab content (all 3 status group headers + 3 example card variants)
✓  Expanded gap section for approaching and locked states

P4.5 — Capital Access Map — Tab 2: Compliance
  Dependency: P4.3 + P4.4 complete.

[PROMPT P4.5]  Capital Access Map — Lender Compliance Tab
     Design Tab 2 of the Capital Access Map: the interactive lender compliance checklist. Show all 20 items in a 2-column grid. Each item can be checked. When an item is checked, the products tab updates. Show both states of multiple items.

Grid: 2 columns, each item is a card:
●	UNCHECKED: bg surface-2, border border/subtle
○	    Checkbox (20px, border border/medium) · "ITEM X OF 20" label · name · description · time tag
●	CHECKED/DONE: bg lime/alpha, border lime/600, checkbox filled lime with ✓ black
●	Time tags: Quick (amber) · 30–60d (orange) · 60d+ (red) — hidden once done

Show these 5 items as examples:
●	Item 1 (Entity with State Records): DONE
●	Item 3 (Business Bank Account): DONE
●	Item 7 (411 Directory Listing): NOT DONE — Quick Win tag
●	Item 12 (Dun & Bradstreet File): NOT DONE — 30–60 Day tag
●	Item 20 (SBA Business Plan): NOT DONE — 30–60 Day tag

Deliverables:
✓  Compliance tab: 5 example items (3 states shown)
✓  Checked state animation annotation

P4.6 — Capital Access Map — Tab 3: FundScore™ Breakdown
  Dependency: P4.3 complete.

[PROMPT P4.6]  Capital Access Map — Score Breakdown Tab
     Design Tab 3: the 6-dimension FundScore™ breakdown. Six cards in a 2-column grid, each showing a dimension's score, bar, weight, and 5 signal items that feed into that dimension.

2-column card grid. Each card:
●	Dimension name: Syne 600 13px uppercase, colored by dimension
○	    Credit → lime · Documentation → amber · Cash Flow → teal · Banking → violet · Structure → red · Narrative → blue
●	Weight label: "Weight: 28%" DM Sans 11px muted
●	Score percentage: Syne 700 32px, colored by dimension
●	Bar track (6px) + fill (dimension color)
●	5 signal items: colored dot (4px, dimension color) + signal name (12px)

Show all 6 cards with example scores:
●	Credit 72% · Documentation 58% · Cash Flow 68% · Banking 44% · Structure 80% · Narrative 62%

Deliverables:
✓  Score breakdown tab: 6 dimension cards in 2-column grid

P4.7 — Capital Access Map — Tab 4: Action Plan
  Dependency: P4.3–P4.6 complete.

[PROMPT P4.7]  Capital Access Map — Action Plan Tab
     Design Tab 4: the ranked action plan. Minimum 6 action items, ranked by impact. Each item shows the action title, explanation, and impact metrics. The list is ordered by highest-value + fastest-to-complete.

Each action item:
●	Rank box: 32×32, bg surface-2, border border/medium, Syne 700 13px
●	Action title: DM Sans 500 14px
●	Why this matters: DM Sans 300 13px muted, 2 sentences
●	3 pills: pts gain (lime border + text) · time estimate (amber) · dimension (dim color)

Show 6 ranked actions (example content):
●	#1: Complete 411 Directory Listing — +25 pts · Under 7 days · Compliance
●	#2: Upload 12 months of bank statements — +42 pts · 1–3 days · Documentation
●	#3: Eliminate NSFs + build ADB — +35 pts · 30–60 days · Banking
●	#4: Open D&B file + 7 vendor lines — +28 pts · 30–60 days · Credit
●	#5: Write specific use-of-funds statement — +18 pts · 20 min · Narrative
●	#6: Complete remaining compliance for SBA — Unlocks 5–11% rates · 60–120 days

Deliverables:
✓  Action plan tab: 6 action cards
✓  Full Capital Access Map composite (all 4 tab contents shown as separate frames)
 
PHASE 5  —  OPERATIONAL SCREENS
The deep-work screens. These are where users spend time between sessions — checking off compliance items, reviewing product details, uploading documents, and chatting with the AI advisor.

P5.1 — Lender Compliance Page (Full 20-Item Checklist)
  Dependency: Phase 1 + P4.5 complete. Reuse compliance component.

[PROMPT P5.1]  Lender Compliance — Full Page
     Design the full Lender Compliance page. This is the standalone page for managing all 20 compliance items. It has a page header with progress, an interactive right-side impact panel, and the full 2-column item grid.

PAGE HEADER:
●	Title: "Lender Compliance" (h1)
●	Subtitle: "20 structural items lenders verify before approving any application." (body muted)
●	Progress bar: large (10px), full-width, showing 11/20 = 55%
●	3 badges: "11 Done" (lime) · "4 Quick Wins" (amber) · "5 Still Needed" (red)

LAYOUT: main grid (left 65%) + sticky impact panel (right 35%)

IMPACT PANEL (sticky):
●	Title: "What Completing These Unlocks"
●	"Check an item to see what unlocks →" in empty state
●	When items checked: shows product cards that just unlocked (animated in)

Deliverables:
✓  Full compliance page (desktop 1440)
✓  Impact panel: empty state + item-checked state
✓  Mobile adaptation (375px, single column, impact panel below grid)

P5.2 — Action Plan Page
  Dependency: Phase 1 + P4.7 complete.

[PROMPT P5.2]  Action Plan — Full Page
     Design the full standalone Action Plan page. This is the operational guide for improving fundability. It has a page header with overall impact estimate, ranked action cards, a milestone timeline, and a completed actions section.

PAGE HEADER:
●	"Your Priority Action Plan" (h1)
●	"Ranked by funding impact. Do these in order." (body muted italic)
●	Impact summary: "Completing all actions unlocks 5 new products and +118 pts"

ACTION CARDS: same as P4.7 but with expand arrow
●	Collapsed: rank · title · 3 pills
●	Expanded: + explanation + step-by-step how to complete + "Mark Complete" checkbox
●	Completed: move to collapsed "Completed" section below, lime bg tint

MILESTONE TIMELINE (visual):
●	3 timeline points on a horizontal line:
○	    30 days: "Unlock 3 additional products — Score ~680"
○	    60 days: "Approaching SBA tier — Score ~720"
○	    90 days: "SBA-ready — Full conventional bank access"

Deliverables:
✓  Action plan page: collapsed + expanded card states
✓  Milestone timeline section
✓  Completed actions section (collapsed accordion)

P5.3 — Product Detail Page Template (3 Status Variants)
  Dependency: Phase 1 + P4.4 complete. One template × 3 status variants.

[PROMPT P5.3]  Product Detail Page — 3 Variants
     Design the product detail page template. Build it THREE times: once showing a UNLOCKED product, once showing APPROACHING, once showing LOCKED. Use Working Capital Loan (unlocked), Business Credit Line (approaching), and SBA Loan (locked) as examples.

PRODUCT HERO:
●	Status pill (unlocked/approaching/locked) · product name (h1) · amount range (Syne 800 28px)
●	4-stat row: Rate · Speed · Min Score · Compliance Req Count

ELIGIBILITY SECTION (visual card split in 2):
●	Left: "What You Have" — score bar with current position, compliance items met (lime checks)
●	Right: "What's Needed" — full requirement list vs. current status

REQUIREMENTS DEEP DIVE:
●	FundScore: "Requires 400 points · You have 624 · ✓ Met"
●	Compliance: each item done/not-done with status icon

PRODUCT DETAILS ACCORDION (4 sections):
●	What it is · Typical terms (table) · Who it's best for · Application process

CALL TO ACTION:
●	Unlocked: "Apply Now" primary CTA
●	Approaching: "Complete These Items First" → links to compliance
●	Locked: "Start Your Gap Plan" → action plan

Deliverables:
✓  Product detail page: 3 variants (Unlocked / Approaching / Locked)

P5.4 — Business Health Scan (3 Steps + Results)
  Dependency: Phase 1 + P2.2 complete (reuse onboarding step shell).

[PROMPT P5.4]  Business Health Scan — 3 Steps + Results
     Design the 3-step Business Health Scan — a deeper diagnostic than the FundScore™ questionnaire. Steps handle document uploads, credit inputs, and revenue validation. End with a detailed health report showing letter grades per dimension.

STEP 1 — Document Upload:
●	Upload zones for: Tax returns (2yr) · P&L · Bank statements · Business plan
●	Each: drag-drop zone + manual input fallback
●	Uploaded state: lime border + filename + size + ✓

STEP 2 — Credit + Banking:
●	FICO range, NSF history, ADB trend, entity verification section

STEP 3 — Revenue Validation:
●	Revenue inputs, trend selection, DSCR estimation tool (interactive)

RESULTS PAGE:
●	Health cards for 4 areas: Credit · Documentation · Banking · Structure
●	Each: letter grade (Syne 800, A–F, colored) + dimension name + specific issues flagged
●	Issue severity chips: Critical (red) · Moderate (amber) · Minor (muted)
●	"Your Recommended Path": 3-item personalized roadmap

Deliverables:
✓  Steps 1, 2, 3 screens (desktop)
✓  Results page (desktop + mobile)

P5.5 — Document Center
  Dependency: Phase 1 complete.

[PROMPT P5.5]  Document Center
     Design the Document Center — the centralized hub for all funding-related documents. Tabbed view: All Documents · By Requirement · Upload. Each document card shows status, which products need it, and action buttons.

DOCUMENT CARD:
●	Icon (file type) · Document name · Status (Uploaded / Missing / Expired / Not Required)
●	"Required for:" chips showing which products need this document
●	Upload button (if missing) or Preview button (if uploaded)

Deliverables:
✓  Document center (3 tab views, desktop + mobile)

P5.6 — AI Financial Advisor Chat
  Dependency: Phase 1 complete.

[PROMPT P5.6]  AI Financial Advisor Chat
     Design the AI Financial Advisor Chat screen. Split panel: chat thread left (65%), context panel right (35%). The AI knows the user's score and compliance status. Responses can include embedded cards. Show an active conversation about the fastest path to $100K.

CHAT PANEL (65%):
●	Message thread: user right (lime/alpha bg) · AI left (surface-2 bg)
●	AI message with embedded score reference card (show as example)
●	AI message with product comparison mini-table
●	Input bar: lime focus border + send button
●	Suggested prompt chips on first load (4 chips)

CONTEXT PANEL (35%):
●	"Your Current Status": score chip + compliance count + products unlocked
●	"Referenced in this conversation": items the AI mentioned

Deliverables:
✓  AI chat desktop (active conversation state)
✓  AI chat empty/welcome state (before first message)
✓  Mobile adaptation (full screen chat, context collapses to header chip)
 
PHASE 6  —  MOBILE + RESPONSIVE
Mobile is not a compressed desktop. Mobile is a different context — the user is checking their progress, completing a quick compliance item, or asking the AI a question on the go. Design for that context.

P6.1 — Mobile Navigation System
  Dependency: Phase 1 + P1.5 complete.

[PROMPT P6.1]  Mobile — Navigation System
     Design the complete FundReady™ mobile navigation system. Bottom tab bar (5 tabs). Mobile header bar. Mobile score chip. Drawer navigation for secondary screens. Show all states and transitions.

BOTTOM TAB BAR:
●	5 tabs: Home · Score · Products · Actions · Chat
●	Active: lime icon (24px) + lime label (label/sm) + 2px lime top border
●	Inactive: muted icon + muted label
●	Height: 72px, bg surface-1, border-top border/subtle

MOBILE HEADER:
●	52px, bg surface-1, border-bottom border/subtle
●	Left: hamburger or back arrow · Center: page title · Right: score chip (small)

Deliverables:
✓  Bottom tab bar component (all 5 active states)
✓  Mobile header component (title + score chip)
✓  Navigation drawer (full menu, slides from left)

P6.2 — Mobile Key Screens
  Dependency: All Phase 4 + 5 desktop screens complete.

[PROMPT P6.2]  Mobile — Core Screens (6 screens)
     Design the mobile versions of the 6 most important screens. These are not compressed desktops — they are redesigned for a 375px context with thumb-zone interaction in mind.

6 screens to design:
●	Mobile Dashboard: score card full-width top · swipeable dimension cards · product row horizontal scroll · actions list
●	Mobile Capital Access Products: status filter chips (swipeable) · single-column product cards · expanded gap on tap
●	Mobile Compliance Checklist: dot grid top (2 rows of 10) · single-column item list
●	Mobile Action Plan: accordion cards · milestone strip horizontal scroll
●	Mobile Score Overview: hero score + dim bars + band message
●	Mobile Lender Compliance: single column full checklist

Deliverables:
✓  6 mobile screens (375px)
✓  Swipe/scroll annotations on interactive sections

P6.3 — Mobile Assessment + Results
  Dependency: Phase 3 complete.

[PROMPT P6.3]  Mobile — Assessment + Results
     Design the mobile versions of the FundScore™ assessment: welcome screen, question screen, and results screen. These must feel native to mobile — not just shrunk desktop. The question cards must be easy to tap with a thumb. The results must scroll beautifully.

Mobile Welcome: full-screen, CTA thumb zone (bottom 40%), trust strip top
Mobile Question: option cards full-width, 56px+ tap targets, sticky nav bottom
Mobile Results: score large + centered, dim bars full-width, actions scrollable

Deliverables:
✓  Mobile welcome screen
✓  Mobile question screen (with option cards optimized for thumb)
✓  Mobile results screen (full scroll)
 
PHASE 7  —  PROTOTYPE + USER FLOWS
Three interactive prototypes — one per goal. These connect every screen into a clickable flow that tells the story of each user path. Use Figma prototype connections with smart animate transitions.

P7.1 — Goal 1 User Flow (Get Funded Now)
  Dependency: All phases complete.

[PROMPT P7.1]  Interactive Prototype — Goal 1: Get Funded Now
     Connect all screens into an interactive Figma prototype for Goal 1: a user who wants to access funding as fast as possible. This flow goes from landing page to application in 15 minutes. Use Smart Animate for score counter and bar animations.

Flow sequence (14 screens):
●	1. Landing page → CTA click
●	2. Onboarding Step 1 (business basics)
●	3. Onboarding Step 4 (goal: "Get funded now" selected)
●	4. Score loading animation
●	5. Score reveal
●	6. Assessment Welcome screen
●	7. Question screen (Q1 — FICO question)
●	8. Question screen (Q5 — Documentation)
●	9. Results screen (score + actions)
●	10. Capital Access Map (Tab 1 — Products, sorted by unlocked first)
●	11. Product detail — Working Capital Loan (UNLOCKED)
●	12. Apply CTA → Application modal or external
●	13. Main Dashboard (returning view)
●	14. Score chip updated

Transitions to annotate:
●	Score counter: Smart Animate, 1.2s
●	Screen transitions: Slide + fade, 200ms
●	Option selection → Continue enable: Instant
●	Product card expansion: Smart Animate, 200ms

Deliverables:
✓  Goal 1 flow: 14 screens connected in Figma prototype
✓  Transition annotations on every screen change

P7.2 — Goal 2 User Flow (Build Bankability)
  Dependency: P7.1 complete.

[PROMPT P7.2]  Interactive Prototype — Goal 2: Build Bankability
     Connect screens into a prototype for Goal 2: a user building their business over 30–90 days. This flow shows the weekly loop — check dashboard, complete compliance items, see new products unlock, take an action. This is the retention loop.

Flow sequence (10 screens):
●	1. Main Dashboard (score 624, 11 compliance done)
●	2. Action Plan (top action: complete 411 listing)
●	3. Action card expanded (how to complete it)
●	4. Compliance page (item 7 unchecked → check it)
●	5. Item 7 checked animation → impact panel shows new unlock
●	6. Capital Access Map — products tab refreshed
●	7. New product unlocked (animated in)
●	8. Dashboard (score chip shows +15 pts)
●	9. AI Advisor chat ("What should I do next week?")
●	10. AI response with next action embedded

Deliverables:
✓  Goal 2 flow: 10 screens connected
✓  Compliance check interaction with product unlock animation

P7.3 — Goal 3 User Flow (Premium Loan Path)
  Dependency: P7.1 + P7.2 complete.

[PROMPT P7.3]  Interactive Prototype — Goal 3: Premium Loan Access
     Connect screens into a prototype for Goal 3: a user on the 90–180 day path to SBA and conventional bank access. This flow shows the score improvement arc — from 624 to SBA-ready. Show the slider interaction on Capital Access Map revealing SBA unlocking.

Flow sequence (8 screens):
●	1. Main Dashboard (score 624, goal 3 highlighted)
●	2. Capital Access Map (SBA card — locked, gap analysis visible)
●	3. Action Plan (SBA-specific filtered view)
●	4. Business Health Scan (Step 1 — document upload)
●	5. Health Scan Results (showing gaps to SBA)
●	6. Capital Access Map sidebar slider — move from 624 to 720
●	7. SBA card animates from locked → unlocked (Smart Animate)
●	8. SBA product detail page (UNLOCKED state)

Deliverables:
✓  Goal 3 flow: 8 screens connected
✓  Score slider → eligibility change animation (key interaction)
 
APPENDIX A — QUICK REFERENCE


ALL 28 PROMPTS WITH DEPENDENCIES

●	P1.1 Color Tokens — No dependency
●	P1.2 Typography — Needs P1.1
●	P1.3 Components Part A — Needs P1.1 + P1.2
●	P1.4 Components Part B — Needs P1.1 + P1.2 + P1.3
●	P1.5 Layout + Navigation — Needs P1.1–P1.4
●	P2.1 Landing Page — Needs Phase 1 complete
●	P2.2 Onboarding — Needs Phase 1 complete
●	P3.1 Assessment Welcome — Needs Phase 1 complete
●	P3.2 Assessment Questions — Needs P3.1
●	P3.3 Assessment Results — Needs P3.1 + P3.2
●	P4.1 Dashboard Left — Needs Phase 1 + Phase 3
●	P4.2 Dashboard Right — Needs P4.1
●	P4.3 Capital Map Shell — Needs P4.1 + P4.2
●	P4.4 Capital Map Tab 1 — Needs P4.3
●	P4.5 Capital Map Tab 2 — Needs P4.3 + P4.4
●	P4.6 Capital Map Tab 3 — Needs P4.3
●	P4.7 Capital Map Tab 4 — Needs P4.3–P4.6
●	P5.1 Compliance Page — Needs Phase 1 + P4.5
●	P5.2 Action Plan Page — Needs Phase 1 + P4.7
●	P5.3 Product Detail — Needs Phase 1 + P4.4
●	P5.4 Health Scan — Needs Phase 1 + P2.2
●	P5.5 Document Center — Needs Phase 1
●	P5.6 AI Chat — Needs Phase 1
●	P6.1 Mobile Nav — Needs Phase 1 + P1.5
●	P6.2 Mobile Key Screens — Needs Phase 4 + 5 desktop
●	P6.3 Mobile Assessment — Needs Phase 3
●	P7.1 Goal 1 Prototype — All phases complete
●	P7.2 Goal 2 Prototype — Needs P7.1
●	P7.3 Goal 3 Prototype — Needs P7.1 + P7.2

  Total build time estimate: 15–22 hours for an experienced Figma designer working from this plan.

FIGMA FILE STRUCTURE

●	Page 0: 🎨 Design System (P1.1–P1.5)
●	Page 1: 🌐 Landing + Onboarding (P2.1–P2.2)
●	Page 2: 📊 Assessment (P3.1–P3.3)
●	Page 3: 🏠 Dashboard (P4.1–P4.2)
●	Page 4: 💰 Capital Access Map (P4.3–P4.7)
●	Page 5: ✅ Compliance + Action Plan (P5.1–P5.2)
●	Page 6: 🏦 Products + Health Scan (P5.3–P5.4)
●	Page 7: 📄 Doc Center + AI Chat (P5.5–P5.6)
●	Page 8: 📱 Mobile (P6.1–P6.3)
●	Page 9: 🔄 Prototypes (P7.1–P7.3)

THE SCORE BAND REFERENCE (use everywhere)

●	0–399:   #b04428 — Critical — Rebuild Required
●	400–549: #c89020 — Low — Foundation Gaps
●	550–649: #a0a020 — Developing — Momentum Building
●	650–749: #38a880 — Approaching Ready
●	750–899: #8ab820 — Lender Ready — Apply Now
●	900+:    #c8f040 — Prime — Maximum Leverage

THE THREE LAYERS (reference for every screen)

●	Layer 1 — FundScore™: C(28%) D(22%) F(20%) B(13%) S(10%) N(7%)
●	Layer 2 — Compliance: 20 items (Quick: 1–9 · Medium: 10–14, 20 · Long: 15–19)
●	Layer 3 — Eligibility: score threshold + compliance requirements → unlocked / approaching / locked

  Every screen in this platform is a view into these three layers. Design accordingly.
