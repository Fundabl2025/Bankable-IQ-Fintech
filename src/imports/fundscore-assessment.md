════════════════════════════════════════════════════════════════════════════════
FUNDREADY™ — BUSINESS SCAN, QUESTIONNAIRE & RESULTS MATCHING
EXPERT-LEVEL BUILD PROMPT
════════════════════════════════════════════════════════════════════════════════

You are building the FundReady™ FundScore™ Assessment — the core intelligence
engine of a pre-funding readiness platform for 33 million U.S. small business
owners who get denied funding not because their business is unworthy, but
because they were never prepared to be evaluated.

This prompt covers the COMPLETE assessment flow — from the first screen a user
sees, through all 24 questions, to the results page with score, dimension
breakdown, action plan, and matched funding products.

Build it exactly as specified. Do not improvise logic. Do not add features.
Every number, every color, every formula, every word is intentional.

════════════════════════════════════════════════════════════════════════════════
PART 1 — WHAT THIS ASSESSMENT DOES
════════════════════════════════════════════════════════════════════════════════

The FundScore™ Assessment produces a single output: a score from 0 to 1000
that tells a small business owner exactly where they stand with lenders —
and exactly what to do next.

No bank login. No credit pull. No personal data harvested.
Self-reported answers only. Results in 6–9 minutes.

The score is built from 24 plain-language questions organized into 6 dimensions.
Each dimension is weighted to mirror how actual underwriters evaluate a file.
The output connects to a live product eligibility matrix — 17 funding products,
each with a minimum score threshold and compliance requirements that must BOTH
be met before a product shows as unlocked.

The user walks in underprepared. They walk out knowing:
  → Their FundScore™ (0–1000) and what band they're in
  → Which of 6 dimensions are strong vs. weak
  → What 5 specific actions will move their score the most
  → Which funding products they pre-qualify for right now
  → Which products they are approaching and exactly what the gap is

════════════════════════════════════════════════════════════════════════════════
PART 2 — TECH STACK AND FILE LOCATIONS
════════════════════════════════════════════════════════════════════════════════

Framework:   Next.js 14 with App Router
Language:    TypeScript
Styling:     Tailwind CSS + CSS custom properties (theme.css)
Animation:   Framer Motion (already installed)
Route:       /fundscore-assessment
Layout:      NO sidebar. NO topnav. Full-focus mode.
             Content centered, max-width 720px, bg var(--bg-base)

Files to create or edit:
  src/app/fundscore-assessment/page.tsx      Main assessment page
  src/app/fundscore-assessment/questions.ts  QUESTIONS array (24 questions)
  src/app/fundscore-assessment/engine.ts     computeScore(), generateActions(),
                                             getLenderAccess(), getBand()
  src/app/fundscore-assessment/types.ts      TypeScript interfaces

DO NOT TOUCH:
  src/utils/fundingEligibility.ts
  src/utils/lenderComplianceModules.ts
  src/utils/fundingRequirements.ts

════════════════════════════════════════════════════════════════════════════════
PART 3 — DESIGN SYSTEM (ASSESSMENT-SPECIFIC)
════════════════════════════════════════════════════════════════════════════════

This screen uses the global dark design system. Reference these variables
from theme.css. Never use hardcoded hex values in component code.

BACKGROUNDS:
  --bg-base:       #0d0f0b  (page background)
  --bg-surface-1:  #131510  (cards, panels)
  --bg-surface-2:  #191c14  (nested elements)
  --bg-surface-3:  #1f231a  (deepest — option card backgrounds)

TEXT:
  --text-primary:    #e4e8d8
  --text-secondary:  #b8bca8
  --text-muted:      #6b7258

BRAND:
  --primary:        #8ab820  (lime — buttons, accents, active states)
  --primary-hover:  #5a7a10  (darker lime on hover)
  --primary-alpha:  rgba(138,184,32,0.08)  (selected card bg)

BORDERS:
  --border-subtle:  #2a2e22
  --border-medium:  #363b2c

SCORE BAND COLORS (use on score numbers, bars, and band labels):
  --score-critical:    #b04428   (0–399)
  --score-low:         #c89020   (400–549)
  --score-developing:  #a0a020   (550–649)
  --score-approaching: #38a880   (650–749)
  --score-ready:       #8ab820   (750–899)
  --score-prime:       #c8f040   (900–1000)

TYPOGRAPHY:
  Headings / score numbers:  font-family: 'Syne', font-weight: 800
  Body / labels:             font-family: 'DM Sans', font-weight: 300–400
  Advisory callouts:         font-family: 'Crimson Pro', font-style: italic

COMPONENT RULES:
  border-radius: 0 on ALL cards, buttons, inputs — no exceptions
  No white (#fff) backgrounds on any surface
  No blue (#1e40af or any shade) anywhere
  Score numbers must always use their band color variable

════════════════════════════════════════════════════════════════════════════════
PART 4 — STATE SHAPE
════════════════════════════════════════════════════════════════════════════════

// src/app/fundscore-assessment/types.ts

export type Screen = 'welcome' | 'question' | 'loading' | 'results';

export interface Option {
  label: string;
  sub:   string;
  score: Partial<Record<'C'|'D'|'F'|'B'|'S'|'N', number>>;
  boost?: number;
}

export interface Question {
  text: string;
  why:  string;
  type: 'options';
  options: Option[];
}

export interface ComputedResult {
  score:   number;
  dimAvg:  Record<'C'|'D'|'F'|'B'|'S'|'N', number>;
  band:    { name: string; color: string };
  actions: ActionItem[];
  lender:  { unlocked: LenderTier[]; locked: string[] };
}

export interface ActionItem {
  name: string;
  why:  string;
  pts:  string;
  time: string;
  dim:  'C'|'D'|'F'|'B'|'S'|'N';
}

export interface LenderTier {
  label: string;
  note:  string;
}

// Component state:
// currentScreen: Screen
// currentQ:      number  (0–23)
// answers:       (number | undefined)[]  length 24
// result:        ComputedResult | null

════════════════════════════════════════════════════════════════════════════════
PART 5 — SCREEN FLOW
════════════════════════════════════════════════════════════════════════════════

4 screens managed by a single state variable. No routing between them.
They render conditionally inside the same page component.

  Screen 1:  WELCOME   (currentScreen === 'welcome')
  Screen 2:  QUESTION  (currentScreen === 'question')
  Screen 3:  LOADING   (currentScreen === 'loading') — 1800ms then auto-advance
  Screen 4:  RESULTS   (currentScreen === 'results')

Flow:
  Welcome → "Start" button → currentScreen = 'question', currentQ = 0
  Question N → option selected, "Continue" → currentQ++
  Question 23 → "Continue" → currentScreen = 'loading'
  Loading (1800ms) → currentScreen = 'results', result = computeScore(answers)
  Results → "Get My Full Remediation Plan →" → navigate('/capital-dashboard')

SECTION LABELS (maps question index to dimension section name):
const SECTIONS = [
  'Credit Profile',    // Q0
  'Credit Profile',    // Q1
  'Credit Profile',    // Q2
  'Credit Profile',    // Q3
  'Documentation',     // Q4
  'Documentation',     // Q5
  'Documentation',     // Q6
  'Documentation',     // Q7
  'Cash Flow',         // Q8
  'Cash Flow',         // Q9
  'Cash Flow',         // Q10
  'Cash Flow',         // Q11
  'Banking Behavior',  // Q12
  'Banking Behavior',  // Q13
  'Banking Behavior',  // Q14
  'Banking Behavior',  // Q15
  'Business Structure',// Q16
  'Business Structure',// Q17
  'Business Structure',// Q18
  'Business Structure',// Q19
  'Narrative Strength',// Q20
  'Narrative Strength',// Q21
  'Narrative Strength',// Q22
  'Narrative Strength',// Q23
];

════════════════════════════════════════════════════════════════════════════════
PART 6 — SCREEN 1: WELCOME
════════════════════════════════════════════════════════════════════════════════

Layout: No sidebar. Centered, max-width 720px, padding 48px 0.
Background: var(--bg-base).

── TOP TRUST STRIP ──────────────────────────────────────────────────────────
bg: var(--primary-alpha)
border-left: 3px solid var(--primary)
padding: 12px 20px
text: "🔒  No bank login.  No credit pull.  Results in under 10 minutes."
font: DM Sans 14px var(--text-secondary)

── HEADLINE ──────────────────────────────────────────────────────────────────
"Find out exactly where you stand" — Syne 800 42px var(--text-primary)
"with every lender in the market." — Syne 800 42px var(--primary)
margin-top: 32px

── SUBHEADING ────────────────────────────────────────────────────────────────
"24 questions. Your FundScore™. Your funding gap. Your next move."
Crimson Pro italic 20px var(--text-secondary)
margin-top: 16px

── TIME BADGE ────────────────────────────────────────────────────────────────
bg: var(--bg-surface-2)
border: 1px solid var(--border-subtle)
border-radius: 0
padding: 10px 16px
"⏱  Most people finish in 6–9 minutes."
DM Sans 14px var(--text-muted)
display: inline-block, margin-top: 24px

── WHAT YOU'LL GET (2×2 grid) ────────────────────────────────────────────────
Section header: "What you'll get:" DM Sans 500 12px UPPERCASE tracking-widest var(--text-muted)
margin-top: 40px

Grid — 4 items, 2 columns, gap 12px:

  Card 1: bg var(--bg-surface-1), border var(--border-subtle), padding 16px 20px
    "FundScore™ (0–1000)"
    Syne 600 16px var(--primary)
    "Your personal funding readiness number"
    DM Sans 300 13px var(--text-muted)

  Card 2: "6-Dimension Breakdown"
    "See exactly which areas are strong vs. weak"

  Card 3: "Ranked Action Plan"
    "5 specific moves that move your score the most"

  Card 4: "Lender Access Preview"
    "Which products you pre-qualify for right now"

── CTA BUTTON ────────────────────────────────────────────────────────────────
Full-width button, margin-top: 40px
bg: var(--primary)
text: "Start My FundScore™ Assessment →"
font: Syne 700 15px UPPERCASE letter-spacing 0.06em
color: #000
padding: 16px 32px
border-radius: 0
border: none
cursor: pointer
hover: bg var(--primary-hover)
whileTap: { scale: 0.97 } (Framer Motion)
onClick: currentScreen = 'question', currentQ = 0

════════════════════════════════════════════════════════════════════════════════
PART 7 — SCREEN 2: QUESTION TEMPLATE
════════════════════════════════════════════════════════════════════════════════

This template renders all 24 questions. Same layout. All logic driven by
currentQ and QUESTIONS[currentQ].

── PROGRESS BAR (very top of page, full width) ───────────────────────────────
height: 4px
bg track: var(--border-subtle)
fill: var(--primary)
width: Math.round(((currentQ + 1) / 24) * 100) + '%'
transition: width 300ms ease

── SECTION + COUNTER ROW ─────────────────────────────────────────────────────
margin-top: 28px
display: flex, justify-content: space-between, align-items: center

LEFT:
  Lime dot 8px round bg var(--primary)  +  SECTIONS[currentQ]
  DM Sans 400 12px UPPERCASE tracking-widest var(--primary)

RIGHT:
  "Question " + (currentQ + 1) + " of 24"
  DM Sans 400 12px var(--text-muted)

── QUESTION TEXT ──────────────────────────────────────────────────────────────
QUESTIONS[currentQ].text
Syne 600 28px var(--text-primary)
line-height: 1.25
margin-top: 20px

── ADVISORY CALLOUT ───────────────────────────────────────────────────────────
bg: var(--primary-alpha)
border-left: 3px solid var(--primary)
padding: 14px 18px
margin-top: 16px

Text: QUESTIONS[currentQ].why
Crimson Pro italic 16px var(--text-secondary)
line-height: 1.7

── OPTION CARDS (stacked, full-width) ─────────────────────────────────────────
margin-top: 28px
display: flex, flex-direction: column, gap: 10px

Each card:
  UNSELECTED STATE:
    bg: var(--bg-surface-1)
    border: 1px solid var(--border-subtle)
    border-radius: 0
    padding: 16px 20px
    display: flex, align-items: center, gap: 16px
    cursor: pointer

  SELECTED STATE:
    bg: var(--primary-alpha)
    border: 2px solid var(--primary-hover)

  HOVER STATE (unselected only):
    border: 1px solid var(--border-medium)

  Framer Motion: whileTap={{ scale: 0.99 }}

INSIDE EACH CARD:
  LEFT — Letter Badge:
    width: 28px, height: 28px
    bg: var(--bg-surface-3) (unselected) / var(--primary) (selected)
    border: 1px solid var(--border-medium) (unselected) / none (selected)
    border-radius: 0
    display: flex, align-items: center, justify-content: center
    text: ['A','B','C','D','E','F'][optionIndex]
    font: Syne 700 13px
    color: var(--text-muted) (unselected) / #000 (selected)

  CENTER — Text block (flex: 1):
    Label: option.label — DM Sans 500 15px var(--text-primary)
    Sub-label: option.sub (if present) — DM Sans 300 13px var(--text-muted), margin-top 2px

  RIGHT — Checkmark (only visible when selected):
    "✓"  Syne 700 16px var(--primary)
    Framer Motion: initial {{ scale: 0 }}, animate {{ scale: 1 }}
    spring transition stiffness: 400, damping: 25

  onClick: answers[currentQ] = optionIndex

── NAVIGATION ROW ─────────────────────────────────────────────────────────────
margin-top: 36px
display: flex, justify-content: space-between, align-items: center

LEFT — Back button:
  Hidden when currentQ === 0
  Ghost button: "← Back"
  DM Sans 400 14px var(--text-muted)
  bg: transparent, border: none
  hover: var(--text-primary)
  onClick: currentQ--

RIGHT — Continue button:
  bg: var(--primary) when answers[currentQ] !== undefined
  bg: var(--bg-surface-2) border var(--border-subtle) when no answer selected
  color: #000 (active) / var(--text-muted) (disabled)
  text: "Continue →"
  Syne 700 14px UPPERCASE
  padding: 12px 28px, border-radius: 0
  cursor: pointer (active) / not-allowed (disabled)
  pointer-events: none when no answer selected
  onClick:
    if currentQ < 23: currentQ++
    if currentQ === 23: currentScreen = 'loading'

════════════════════════════════════════════════════════════════════════════════
PART 8 — SCREEN 3: LOADING
════════════════════════════════════════════════════════════════════════════════

Duration: 1800ms, then auto-advance to results.
Centered vertically and horizontally. bg var(--bg-base).

Animated lime circle spinner (Framer Motion rotate 0→360, repeat Infinity, 1s).
"Calculating your FundScore™..." — Syne 600 20px var(--text-primary), margin-top 24px
"Analyzing 6 dimensions. Matching 17 funding products." — DM Sans 300 14px var(--text-muted)

useEffect: setTimeout(() => {
  const computed = computeScore(answers);
  setResult(computed);
  setCurrentScreen('results');
}, 1800);

════════════════════════════════════════════════════════════════════════════════
PART 9 — SCREEN 4: RESULTS
════════════════════════════════════════════════════════════════════════════════

All content from result: ComputedResult.
All animations trigger on mount. Sequence controlled by delays.

── SCORE SECTION ──────────────────────────────────────────────────────────────
Centered. margin-top: 48px.

"YOUR FUNDSCORE™" — DM Sans 400 11px UPPERCASE tracking-widest var(--text-muted)

Score number:
  Syne 800 96px
  color: result.band.color  (band color variable value)
  Uses ScoreCounter animation:
    Framer Motion useSpring, stiffness: 40, damping: 12
    animates from 0 → result.score over ~1200ms
    The displayed integer = Math.round(springValue)

Score meter bar:
  width: 100%, height: 10px, bg var(--border-subtle)
  fill div: width (result.score / 10) + '%', bg var(--primary)
  animate: initial width 0%, animate to final, transition 1200ms cubic-bezier(0.16,1,0.3,1)
  delay: 200ms

Band label below score:
  result.band.name — Crimson Pro italic 22px var(--text-secondary)

── 6 DIMENSION BARS ───────────────────────────────────────────────────────────
Section header: "Score Breakdown" DM Sans 400 11px UPPERCASE var(--text-muted), margin-top: 48px

6 bars staggered. Render in this order: C, D, F, B, S, N
Each bar animates after delay: index * 80ms (so C=0ms, D=80ms, F=160ms etc.)

DIM_DATA reference:
  C — Credit Profile     28%  color #8ab820
  D — Documentation      22%  color #c89020
  F — Cash Flow          20%  color #38a880
  B — Banking Behavior   13%  color #8858c8
  S — Business Structure 10%  color #b04428
  N — Narrative Strength  7%  color #3878c8

Each bar row:
  display: flex, align-items: center, gap: 12px, margin-bottom: 10px

  Label col (min-width 130px): DIM_DATA[key].name — DM Sans 400 13px var(--text-secondary)
  Weight tag (min-width 36px): DIM_DATA[key].weight — DM Sans 400 11px var(--text-muted)
  Track (flex 1, height 6px, bg var(--border-subtle)):
    Fill div: width Math.round(result.dimAvg[key] * 100) + '%'
    bg color: DIM_DATA[key].color
    Framer: initial width 0%, animate to final
    transition: 1000ms cubic-bezier(0.16,1,0.3,1), delay index * 80ms
  Percentage (min-width 40px, text-right):
    Math.round(result.dimAvg[key] * 100) + '%'
    Syne 600 14px, color: DIM_DATA[key].color

── TOP 5 ACTIONS ───────────────────────────────────────────────────────────────
Section header: "Your Top 5 Priority Actions" — same style as above, margin-top: 48px

result.actions.slice(0,5).map((action, i) => (
  Card: bg var(--bg-surface-1), border var(--border-subtle), padding 16px 20px
        border-radius: 0, margin-bottom 10px

  TOP ROW (flex, align-items: center, gap: 12px):
    Rank box 32×32: bg var(--bg-surface-2) border var(--border-medium)
      Syne 700 16px var(--primary), text: i+1

    Action title: DM Sans 500 15px var(--text-primary), flex: 1

    3 pills (flex, gap: 6px):
      Pts pill:  bg --primary-alpha, border 1px --primary-hover
                 DM Sans 400 12px var(--primary), text: action.pts
      Time pill: bg amber/alpha, border 1px amber-muted
                 DM Sans 400 12px #c89020, text: action.time
      Dim pill:  bg DIM_DATA[action.dim].color at 10% opacity
                 DM Sans 400 12px DIM_DATA[action.dim].color
                 text: DIM_DATA[action.dim].name (abbreviated to first word)

  WHY ROW (margin-top 8px):
    action.why — DM Sans 300 13px var(--text-muted), line-height: 1.6
))

── LENDER ACCESS PREVIEW ──────────────────────────────────────────────────────
Section header: "Funding Access Preview" — same style, margin-top: 48px

bg: var(--bg-surface-1), border: 1px solid var(--border-subtle)
padding: 24px, border-radius: 0

UNLOCKED items:
  display: flex, align-items: flex-start, gap: 12px
  per item — margin-bottom: 12px

  Lime checkmark dot (12px round, bg var(--primary)):
  Left text block:
    label: DM Sans 500 14px var(--text-primary)
    note:  DM Sans 300 12px var(--text-muted)

Divider line: var(--border-subtle), margin: 16px 0

LOCKED items:
  Per item — DM Sans 400 14px var(--text-muted)
  Muted arrow "→" var(--text-muted) + locked product string

── MAIN CTA ──────────────────────────────────────────────────────────────────
margin-top: 48px, margin-bottom: 80px

Full-width primary button:
  "Get My Full Remediation Plan →"
  Same styling as welcome CTA
  onClick: router.push('/capital-dashboard?score=' + result.score +
    '&dims=' + encodeDims(result.dimAvg))

Sub-link below button (centered):
  "Share your results" — DM Sans 400 13px var(--text-muted), underline on hover

════════════════════════════════════════════════════════════════════════════════
PART 10 — THE SCORING ENGINE
════════════════════════════════════════════════════════════════════════════════

// src/app/fundscore-assessment/engine.ts

const WEIGHTS = { C: 0.28, D: 0.22, F: 0.20, B: 0.13, S: 0.10, N: 0.07 };

// ── computeScore ──────────────────────────────────────────────────────────
export function computeScore(answers: (number|undefined)[], questions: Question[]) {
  const dimBuckets: Record<string, number[]> = { C:[], D:[], F:[], B:[], S:[], N:[] };
  let totalBoost = 0;

  questions.forEach((q, qi) => {
    const ai = answers[qi];
    if (ai === undefined) return;
    const opt = q.options[ai];
    if (!opt?.score) return;
    if (opt.boost) totalBoost += opt.boost;
    Object.entries(opt.score).forEach(([dim, val]) => {
      if (dimBuckets[dim]) dimBuckets[dim].push(val as number);
    });
  });

  // Average each dimension. Default 0.5 if no answers for that dim.
  const dimAvg: Record<string, number> = {};
  Object.entries(dimBuckets).forEach(([d, vals]) => {
    dimAvg[d] = vals.length
      ? vals.reduce((a, b) => a + b, 0) / vals.length
      : 0.5;
  });

  // Weighted composite
  let base = 0;
  Object.entries(WEIGHTS).forEach(([d, w]) => {
    base += (dimAvg[d] || 0) * w;
  });

  // Scale 0–1000, cap boost at 80, clamp
  const score = Math.max(0, Math.min(1000,
    Math.round(base * 1000 + Math.min(totalBoost, 80))
  ));

  return { score, dimAvg } as { score: number; dimAvg: Record<string,number> };
}

// ── getBand ───────────────────────────────────────────────────────────────
export function getBand(score: number) {
  if (score < 400) return { name: 'Critical — Rebuild Required',    color: '#b04428' };
  if (score < 550) return { name: 'Low — Foundation Gaps',          color: '#c89020' };
  if (score < 650) return { name: 'Developing — Momentum Building', color: '#a0a020' };
  if (score < 750) return { name: 'Approaching — Lender Qualified', color: '#38a880' };
  if (score < 900) return { name: 'Lender Ready',                   color: '#8ab820' };
  return              { name: 'Prime — Best-Rate Access',           color: '#c8f040' };
}

// ── generateActions ───────────────────────────────────────────────────────
// Returns the top 5 highest-impact actions based on dimension scores.
// Each action targets the weakest area and shows specific point impact.
export function generateActions(dimAvg: Record<string,number>) {
  const actions: ActionItem[] = [];

  if ((dimAvg.D||0) < 0.60) actions.push({
    name: 'Upload 12 months of business bank statements',
    why:  'Your documentation score is your fastest win. Bank statements are the #1 thing lenders read first — getting to 12 months coverage takes days, not months.',
    pts: '+42 pts', time: '1–3 days', dim: 'D'
  });
  if ((dimAvg.C||0) < 0.50) actions.push({
    name: 'Pull your credit reports and dispute any errors',
    why:  'Most credit reports have at least one error. A successful dispute can move your score 20–50 points — and open lender doors that are currently closed.',
    pts: '+30–50 pts', time: '30–45 days', dim: 'C'
  });
  if ((dimAvg.S||0) < 0.65) actions.push({
    name: 'Form an LLC and open a dedicated business bank account',
    why:  'Operating as a sole prop or mixing finances is a structural red flag. LLC formation takes 1–2 weeks and immediately improves your lender presentation.',
    pts: '+35 pts', time: '7–14 days', dim: 'S'
  });
  if ((dimAvg.D||0) < 0.75) actions.push({
    name: 'Prepare or update your Profit & Loss statement',
    why:  'Lenders want current financials. A clean P&L — even a simple one — shows you understand your own business.',
    pts: '+25 pts', time: '3–7 days', dim: 'D'
  });
  if ((dimAvg.C||0) < 0.35) actions.push({
    name: 'Register your business with Dun & Bradstreet (DUNS)',
    why:  'Most small businesses have no business credit file at all. Building one takes 30–60 days but opens an entirely separate credit track lenders score independently.',
    pts: '+28 pts', time: '30–60 days', dim: 'C'
  });
  if ((dimAvg.B||0) < 0.50) actions.push({
    name: 'Build your average daily balance over the next 60 days',
    why:  'Your banking behavior score is low. Lenders read the last 6 months. Consistent positive balance growth is a visible, trackable signal you can move immediately.',
    pts: '+20 pts', time: '30–60 days', dim: 'B'
  });
  if ((dimAvg.N||0) < 0.60) actions.push({
    name: 'Write a specific use-of-funds statement with ROI projections',
    why:  'Your narrative score needs work. This takes 20 minutes and can be the difference between a lender saying yes or asking another question.',
    pts: '+18 pts', time: '20 minutes', dim: 'N'
  });
  if ((dimAvg.C||0) < 0.70) actions.push({
    name: 'Reduce personal credit utilization below 30%',
    why:  'High utilization is actively dragging your score down. Pay down balances or request a credit limit increase. Either move improves your number within 30 days.',
    pts: '+22 pts', time: '30 days', dim: 'C'
  });

  // Ensure at least 5 actions always returned
  if (actions.length < 5) actions.push({
    name: 'Complete your FundReady™ lender document checklist',
    why:  'Use the lender-specific document checklist to ensure nothing is missing before you apply. One missing document can delay an approval by weeks.',
    pts: '+15 pts', time: '1–2 days', dim: 'D'
  });

  return actions.slice(0, 5);
}

// ── getLenderAccess ───────────────────────────────────────────────────────
// Maps score to funding product tiers — what's unlocked vs. locked.
// These are simplified tiers for the results preview.
// Full product matrix lives in getStatus() in fundingEligibility.ts.
export function getLenderAccess(score: number) {
  const unlocked: { label: string; note: string }[] = [];
  const locked:   string[] = [];

  if (score >= 350) unlocked.push({
    label: 'CDFI Microloans & Community Lenders',
    note:  'Up to $50K · Mission-aligned lenders · FICO as low as 575'
  });
  if (score >= 450) unlocked.push({
    label: 'Revenue-Based Financing',
    note:  'No FICO floor · Based on monthly deposits · Higher cost'
  });
  if (score >= 550) unlocked.push({
    label: 'Online Alt-Lender Term Loans',
    note:  'FICO 600+ · 1 year in business · Faster funding'
  });
  if (score >= 650) unlocked.push({
    label: 'SBA Microloan Program',
    note:  'FICO 620+ · Up to $50K · Best rates at this tier'
  });
  if (score >= 700) unlocked.push({
    label: 'SBA 7(a) Standard Loan',
    note:  'FICO 650+ · 2 years in business · Up to $5M'
  });
  if (score >= 750) unlocked.push({
    label: 'Conventional Bank Term Loan',
    note:  'FICO 680+ · Best terms · Lowest rates'
  });

  if (score < 550) locked.push('Online Alt-Lender access — need +' + (550-score) + ' pts');
  if (score < 700) locked.push('SBA 7(a) Standard — need +' + (700-score) + ' pts');
  if (score < 750) locked.push('Conventional Bank — need +' + (750-score) + ' pts');

  return { unlocked, locked };
}

════════════════════════════════════════════════════════════════════════════════
PART 11 — ALL 24 QUESTIONS
════════════════════════════════════════════════════════════════════════════════

// src/app/fundscore-assessment/questions.ts
// export const QUESTIONS: Question[] = [ ...all 24 below... ]

────────────────────────────────────────────────────────────────────────────────
SECTION 1 — CREDIT PROFILE  (Q0–Q3)
────────────────────────────────────────────────────────────────────────────────

Q0:
text:  "What's your estimated personal credit score right now?"
why:   "Lenders check your personal credit first — before they look at anything else. This single number can open or close doors before a conversation even starts."
options:
  A: label "Below 580"       sub "Needs significant work before most lenders will consider you"  score {C: 0.05}
  B: label "580 – 619"       sub "Qualifies for limited alternative lending only"                 score {C: 0.20}
  C: label "620 – 649"       sub "Opens SBA and some alt-lender products"                        score {C: 0.40}
  D: label "650 – 699"       sub "Solid foundation — conventional lending range begins"          score {C: 0.60}
  E: label "700 – 739"       sub "Good standing — qualifies for most products"                   score {C: 0.78}
  F: label "740 or above"    sub "Excellent — top-tier lender access"                            score {C: 1.00}

Q1:
text:  "What is your approximate personal credit utilization rate?"
why:   "This is how much of your available credit you're using. Lenders want to see below 30%. Above 50% is a red flag they see immediately."
options:
  A: label "Under 20%"       sub "Ideal — strong signal of credit discipline"    score {C: 1.00}
  B: label "20% – 30%"       sub "Good — within acceptable lender range"         score {C: 0.75}
  C: label "30% – 50%"       sub "Caution — starting to impact your score"       score {C: 0.45}
  D: label "Over 50%"        sub "High — actively pulling your score down"       score {C: 0.10}
  E: label "I don't know"    sub ""                                               score {C: 0.35}

Q2:
text:  "Do you have any active derogatory marks on your personal credit report?"
why:   "Collections, charge-offs, late payments — lenders see all of it. Recent derogatories (under 2 years) are weighted heavily against you."
options:
  A: label "No — my report is clean"                   sub ""                                score {C: 1.00}
  B: label "Yes — but all are over 2 years old"        sub "Less impact, but still visible"  score {C: 0.60}
  C: label "Yes — some are within the last 2 years"    sub "Active drag on your score"       score {C: 0.20}
  D: label "I haven't checked recently"                sub ""                                score {C: 0.40}

Q3:
text:  "Does your business have its own credit file and score?"
why:   "Business credit (D&B Paydex, Experian Intelliscore) is separate from your personal credit. Most small business owners don't have one — and don't know it matters."
options:
  A: label "Yes — active file with Paydex 80+"           sub "Strong business credit standing"          score {C: 1.00}
  B: label "Yes — but score is below 80"                 sub "File exists but needs improvement"        score {C: 0.50}
  C: label "I've started building it but it's new"       sub ""                                         score {C: 0.30}
  D: label "No — I don't have a business credit file"    sub "Very common — but it needs to be built"   score {C: 0.05}

────────────────────────────────────────────────────────────────────────────────
SECTION 2 — DOCUMENTATION  (Q4–Q7)
────────────────────────────────────────────────────────────────────────────────

Q4:
text:  "How many years of filed business tax returns do you have?"
why:   "The SBA requires 2 years of filed returns. Most banks want 2–3 years. No returns = instant denial from most conventional lenders."
options:
  A: label "None filed yet"        sub "Hard stop for most lenders"              score {D: 0.00}
  B: label "1 year"                sub "Qualifies for some alternative lenders"  score {D: 0.35}
  C: label "2 years"               sub "Meets SBA minimum requirement"           score {D: 0.75}
  D: label "3 or more years"       sub "Strong documentation history"            score {D: 1.00}

Q5:
text:  "Do you have a current Profit & Loss (P&L) statement for your business?"
why:   "A P&L shows lenders whether your business is actually making money. Without one, you're asking them to trust a number without proof."
options:
  A: label "Yes — current, professionally prepared"        sub "CPA or accounting software generated"        score {D: 1.00}
  B: label "Yes — but I made it myself in a spreadsheet"   sub "Better than nothing but less credibility"    score {D: 0.60}
  C: label "I have one but it's over 6 months old"         sub "Lenders want current-year data"              score {D: 0.35}
  D: label "No — I don't have a P&L"                       sub ""                                            score {D: 0.00}

Q6:
text:  "How many months of business bank statements can you provide right now?"
why:   "Lenders read your bank statements like a report card. 12 months is the gold standard. Less than 3 months disqualifies you from most products."
options:
  A: label "Less than 3 months"    sub "Below minimum for most products"              score {D: 0.10}
  B: label "3 – 5 months"          sub "Qualifies for some revenue-based products"    score {D: 0.35}
  C: label "6 – 11 months"         sub "Good — approaching full coverage"             score {D: 0.65}
  D: label "12 or more months"     sub "Full coverage — strong documentation signal"  score {D: 1.00}

Q7:
text:  "Do the revenue figures on your tax returns and bank statements roughly match?"
why:   "Lenders cross-reference your documents. If your tax return says $200K but your bank shows $80K — that inconsistency raises immediate red flags."
options:
  A: label "Yes — they closely match (within 10%)"    sub "Clean — no reconciliation concerns"           score {D: 1.00}
  B: label "Somewhat — within 15–25%"                 sub "Minor gap — explainable but notable"          score {D: 0.60}
  C: label "No — there is a significant difference"   sub "Will require explanation to every lender"     score {D: 0.15}
  D: label "I'm not sure"                             sub ""                                             score {D: 0.35}

────────────────────────────────────────────────────────────────────────────────
SECTION 3 — CASH FLOW  (Q8–Q11)
────────────────────────────────────────────────────────────────────────────────

Q8:
text:  "What is your business's approximate average monthly revenue over the last 6 months?"
why:   "This is how lenders calculate whether your business generates enough income to repay a loan. It sets your maximum borrowing power."
options:
  A: label "Under $3,000 / month"       sub ""  score {F: 0.10}
  B: label "$3,000 – $8,000 / month"    sub ""  score {F: 0.30}
  C: label "$8,000 – $20,000 / month"   sub ""  score {F: 0.55}
  D: label "$20,000 – $50,000 / month"  sub ""  score {F: 0.78}
  E: label "Over $50,000 / month"       sub ""  score {F: 1.00}

Q9:
text:  "Has your revenue been growing, flat, or declining over the past 12 months?"
why:   "Lenders don't just look at where you are — they look at where you're headed. A declining trend triggers automatic concern about repayment ability."
options:
  A: label "Growing — consistently up month over month"   sub ""                               score {F: 1.00}
  B: label "Growing — but inconsistently"                 sub "Good but seasonal or sporadic"  score {F: 0.70}
  C: label "Flat — roughly the same each month"           sub "Stable but not compelling"      score {F: 0.50}
  D: label "Declining — revenue has been going down"      sub "Significant lender concern"     score {F: 0.10}

Q10:
text:  "After all business expenses, does your business consistently generate a monthly profit?"
why:   "Profit is how lenders know you can service new debt. A business that breaks even every month has very little room to add a loan payment."
options:
  A: label "Yes — we profit every month"          sub ""                                        score {F: 1.00}
  B: label "Most months — occasional break-even"  sub ""                                        score {F: 0.65}
  C: label "About half the time"                  sub "Inconsistent — lenders will probe this"  score {F: 0.30}
  D: label "Rarely or not yet"                    sub ""                                        score {F: 0.05}

Q11:
text:  "If you took on a new monthly loan payment, could your business comfortably cover it?"
why:   "This is the DSCR — Debt Service Coverage Ratio — the most important cash flow metric. Lenders want to see 25% more income than debt payments."
options:
  A: label "Yes — we have strong surplus above expenses"    sub "DSCR likely 1.35+"       score {F: 1.00}
  B: label "Yes — but it would be tight"                   sub "DSCR likely 1.10–1.25"   score {F: 0.60}
  C: label "Possibly — depending on the payment amount"    sub ""                         score {F: 0.35}
  D: label "No — we don't have much margin"                sub "DSCR concern"             score {F: 0.05}

────────────────────────────────────────────────────────────────────────────────
SECTION 4 — BANKING BEHAVIOR  (Q12–Q15)
────────────────────────────────────────────────────────────────────────────────

Q12:
text:  "How many overdrafts or NSFs has your business account had in the last 12 months?"
why:   "Lenders read 12 months of statements. NSFs signal cash flow instability. Even 2–3 in a year can raise red flags at traditional banks."
options:
  A: label "Zero — clean account history"    sub "Best possible signal"                         score {B: 1.00}
  B: label "1 – 2"                           sub "Minor — may need brief explanation"           score {B: 0.65}
  C: label "3 – 5"                           sub "Concerning pattern — lenders will notice"     score {B: 0.25}
  D: label "More than 5"                     sub "Significant red flag in lending review"       score {B: 0.00}

Q13:
text:  "What is the typical average daily balance in your business checking account?"
why:   "Lenders look for an average daily balance of at least 10% of your loan request. It signals you're not running your business to zero every month."
options:
  A: label "Usually near zero or negative"   sub "High-risk signal"                    score {B: 0.00}
  B: label "$500 – $2,000"                   sub "Low — minimal cushion"               score {B: 0.25}
  C: label "$2,000 – $10,000"                sub "Building — depends on loan size"     score {B: 0.55}
  D: label "$10,000 – $25,000"               sub "Good stability signal"               score {B: 0.80}
  E: label "Over $25,000"                    sub "Strong — well-capitalized signal"    score {B: 1.00}

Q14:
text:  "Are your personal and business finances completely separated?"
why:   "Mixing personal and business money is a red flag. It signals weak discipline, complicates tax filings, and creates legal concerns for lenders."
options:
  A: label "Yes — fully separate accounts and records"    sub "Clean structure"                                   score {B: 1.00}
  B: label "Mostly — occasional overlap"                  sub "Minor concern — address before applying"          score {B: 0.50}
  C: label "No — I use personal accounts for business"    sub "Significant issue — must fix before applying"     score {B: 0.00}

Q15:
text:  "Has your average daily bank balance been trending upward over the last 3–6 months?"
why:   "An improving cash position tells lenders your business is gaining financial strength — exactly what they want to see before extending credit."
options:
  A: label "Yes — consistently growing"    sub "Strong positive signal"                  score {B: 1.00}
  B: label "About the same"                sub "Neutral — stable but not compelling"     score {B: 0.55}
  C: label "Declining"                     sub "Negative trend — needs to be addressed"  score {B: 0.10}
  D: label "I haven't tracked it"          sub ""                                         score {B: 0.40}

────────────────────────────────────────────────────────────────────────────────
SECTION 5 — BUSINESS STRUCTURE  (Q16–Q19)
────────────────────────────────────────────────────────────────────────────────

Q16:
text:  "What is your current business entity type?"
why:   "Entity type signals legal seriousness. A sole proprietorship has no legal separation from personal assets — that creates risk lenders price in."
options:
  A: label "Sole Proprietorship"                 sub "No legal separation from your personal assets"      score {S: 0.10}
  B: label "LLC (Single-Member)"                 sub "Basic protection — good starting point"             score {S: 0.65}
  C: label "LLC (Multi-Member) or Partnership"   sub "More structure — better lender signal"             score {S: 0.78}
  D: label "S-Corp or C-Corp"                    sub "Strongest entity signal for conventional lending"  score {S: 1.00}

Q17:
text:  "How long has your business been legally operating?"
why:   "Business age is a hard filter. Under 1 year locks out most products. Under 2 years blocks SBA. Time cannot be manufactured — this is a fixed clock."
options:
  A: label "Less than 6 months"   sub "Pre-qualification stage — very limited options"  score {S: 0.05}
  B: label "6 – 12 months"        sub "Some alt-lenders and MCAs available"             score {S: 0.25}
  C: label "1 – 2 years"          sub "More options open — SBA approaching"             score {S: 0.55}
  D: label "2 – 5 years"          sub "Meets most lender minimums"                     score {S: 0.85}
  E: label "Over 5 years"         sub "Strong operational history"                     score {S: 1.00}

Q18:
text:  "What industry is your business in?"
why:   "Lenders use NAICS codes to apply risk overlays. Some industries face automatic additional scrutiny — even with strong financials."
options:
  A: label "Professional Services, Tech, or Healthcare"   sub "Low-risk industry classification"                  score {S: 1.00}
  B: label "Retail, E-commerce, or Wholesale"             sub "Standard risk — no overlay"                       score {S: 0.85}
  C: label "Construction or Real Estate"                  sub "Moderate risk — additional documentation common"  score {S: 0.65}
  D: label "Restaurant, Food Service, or Hospitality"     sub "Higher risk — additional scrutiny"               score {S: 0.40}
  E: label "Transportation, Trucking, or Logistics"       sub "Moderate-high risk — fleet/liability factors"    score {S: 0.50}
  F: label "Other / Not listed"                           sub ""                                                 score {S: 0.70}

Q19:
text:  "Is your business currently in good standing with your state?"
why:   "Lapsed filings or delinquent state fees trigger automatic rejection. Lenders verify this in minutes — and there is no workaround."
options:
  A: label "Yes — all filings are current"                 sub "Clean legal standing"                  score {S: 1.00}
  B: label "I think so — but I haven't checked recently"   sub "Worth verifying before applying"       score {S: 0.65}
  C: label "No — there are outstanding issues"             sub "Must be resolved before any application"  score {S: 0.00}

────────────────────────────────────────────────────────────────────────────────
SECTION 6 — NARRATIVE STRENGTH  (Q20–Q23)
────────────────────────────────────────────────────────────────────────────────

Q20:
text:  "Can you clearly explain exactly how you will use the loan funds?"
why:   "Vague answers kill applications. 'Working capital' is not an answer. Lenders want exact numbers, exact purpose, exact timeline."
options:
  A: label "Yes — I can explain it precisely with numbers"    sub "Strong narrative position"          score {N: 1.00}
  B: label "Mostly — I have a general idea"                   sub "Needs sharpening before applying"  score {N: 0.55}
  C: label "I know what I need but can't explain the ROI"     sub ""                                  score {N: 0.25}
  D: label "Not really — I just know I need capital"          sub "Must be developed before applying" score {N: 0.00}

Q21:
text:  "Can you explain clearly how you will repay the loan?"
why:   "Lenders lend to plans, not desperation. Which revenue stream? What margin? What timeline? 'From revenue' is not a repayment plan."
options:
  A: label "Yes — specific repayment path from projected revenue"   sub ""                       score {N: 1.00}
  B: label "Generally — from ongoing business revenue"              sub "Needs more specificity" score {N: 0.50}
  C: label "I haven't thought through the repayment in detail"      sub ""                       score {N: 0.10}

Q22:
text:  "Have you ever successfully repaid a business loan or line of credit?"
why:   "Past repayment is the strongest predictor of future behavior. Lenders weight this heavily — it's proof of credit character, not just credit score."
options:
  A: label "Yes — paid in full, on time"                   sub "Strongest possible signal"                             score {N: 1.00}  boost: 45
  B: label "Yes — paid off but had some late payments"     sub "Positive history with a caveat"                       score {N: 0.55}
  C: label "No — this is my first business loan"           sub "Common — not a penalty, just no boost"                score {N: 0.40}
  D: label "No — and there were defaults or issues"        sub "Significant concern — will need to address directly"  score {N: 0.00}

NOTE on Q22: Option A has boost: 45 — this is added to the final score as a flat
bonus (capped with other boosts at total max +80). It rewards proven repayment
behavior because it is the single strongest behavioral signal lenders care about.

Q23:
text:  "How relevant is your personal background and experience to the business you're operating?"
why:   "Years of relevant experience reduce perceived execution risk — especially for newer businesses. Lenders weigh operator expertise heavily."
options:
  A: label "10+ years in this exact industry"     sub "Deep expertise — strong operator signal"  score {N: 1.00}
  B: label "5 – 10 years of relevant experience"  sub "Solid background"                         score {N: 0.78}
  C: label "1 – 5 years — still learning"         sub ""                                         score {N: 0.50}
  D: label "New to this industry"                 sub "Mitigate with a strong plan"              score {N: 0.20}

════════════════════════════════════════════════════════════════════════════════
PART 12 — PRODUCT MATCHING LOGIC (FULL MATRIX)
════════════════════════════════════════════════════════════════════════════════

After computeScore(), the results screen shows a PREVIEW of lender access
(getLenderAccess above). But the full product matching — used on the Capital
Access Map and all product pages — uses the complete matrix below.

Each product has:
  minScore:  minimum FundScore™ to be ELIGIBLE
  compReq:   array of compliance item IDs that must also be completed
  BOTH must be met for status = 'unlocked'

getStatus(product, currentScore, compDone):
  if (currentScore >= product.minScore) AND (all product.compReq in compDone)
    → 'unlocked'
  elif (product.minScore - currentScore <= 80) AND (missing items <= 3)
    → 'approaching'
  else
    → 'locked'

ALL 17 PRODUCTS:

  id: mca
  name: Merchant Cash Advance
  range: Up to $500K
  rate: Factor 1.1–1.5
  speed: 24–48 hours
  minScore: 350
  compReq: [1, 2, 3, 5]
  NOTE: Always show with cost disclosure. List last among unlocked.

  id: wc
  name: Working Capital Loans
  range: Up to $10M
  rate: 10–35%
  speed: 24–48 hours
  minScore: 400
  compReq: [1, 2, 3, 4, 5, 9]

  id: inv_fact
  name: Invoice Factoring
  range: Up to 90% of invoices
  rate: 1–5% per month
  speed: 24–48 hours
  minScore: 350
  compReq: [1, 2, 3, 5]

  id: equip
  name: Equipment Financing
  range: Up to 100% of equipment value
  rate: 5–30%
  speed: 3–7 days
  minScore: 380
  compReq: [1, 2, 3, 4, 5]

  id: rev
  name: Revenue Based Loan
  range: Up to 10% of annual revenue
  rate: 15–35%
  speed: 2–3 days
  minScore: 480
  compReq: [1, 2, 3, 5, 9, 10]

  id: bcl
  name: Business Credit Line
  range: Up to $750K
  rate: 8–25%
  speed: 1–3 days
  minScore: 550
  compReq: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13]

  id: btl
  name: Business Term Loan
  range: Up to $10M
  rate: 8–30%
  speed: 2–5 days
  minScore: 580
  compReq: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 20]

  id: po
  name: Purchase Order Finance
  range: $100K – $10M+
  rate: 1.5–6% per transaction
  speed: 7–14 days
  minScore: 520
  compReq: [1, 2, 3, 5, 9]

  id: pcc
  name: Personal Credit Cards
  range: Varies by issuer
  rate: Varies
  speed: 7–14 days
  minScore: 620
  compReq: []

  id: sloc
  name: Syndicated Line of Credit
  range: $25K – $150K
  rate: 0% APR promotional
  speed: 7–14 days
  minScore: 650
  compReq: []

  id: cu
  name: Credit Union Loans
  range: $5K – $75K
  rate: 6–18%
  speed: 3–10 days
  minScore: 600
  compReq: [1, 2, 3, 4, 5, 6]

  id: bridge
  name: Bridge Loans (Investment Properties)
  range: $100K – $3M
  rate: 8–15%
  speed: 3–5 days
  minScore: 520
  compReq: [1, 2, 5]

  id: dscr
  name: DSCR Loans
  range: $100K – $1.5M
  rate: 7–12%
  speed: 14–30 days
  minScore: 580
  compReq: [1, 2, 5]

  id: const
  name: Construction Loans
  range: $100K – $5M+
  rate: 7–14%
  speed: 30–60 days
  minScore: 580
  compReq: [1, 2, 5]

  id: ar
  name: Accounts Receivable Finance
  range: $100K – $250K+
  rate: 1.5–5% per month
  speed: 3–7 days
  minScore: 600
  compReq: [1, 2, 3, 5, 9]

  id: inv_loc
  name: Inventory Line of Credit
  range: $250K – $2M+
  rate: 8–20%
  speed: 7–14 days
  minScore: 600
  compReq: [1, 2, 3, 4, 5]

  id: sba
  name: SBA Loans (7a & 504)
  range: Up to $5M
  rate: 5–11%
  speed: 30–90 days
  minScore: 720
  compReq: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
  NOTE: Requires ALL 20 compliance items complete. No exceptions.

DISPLAY ORDER ON RESULTS AND DASHBOARD:
  Sort by status: unlocked first (sorted by speed fastest-first),
  then approaching (sorted by score gap smallest-first),
  then locked (sorted by minScore lowest-first — shows easiest to unlock).
  MCA always displays last within its status group with cost disclosure.

════════════════════════════════════════════════════════════════════════════════
PART 13 — CRITICAL RULES FOR THIS SCREEN
════════════════════════════════════════════════════════════════════════════════

1. NEVER show a locked product as pre-qualified — not in any state, not in any
   loading screen, not as a "you might" hedge. Either it's unlocked or it isn't.

2. ALWAYS animate the score counter from 0 to the final score on results load.
   Do not skip this. Do not use a static number. This is the emotional peak.

3. ALWAYS show the advisory "why" callout for every question.
   This is what makes users trust the platform — they understand why it matters.

4. NEVER ask for information that requires a bank login, credit bureau access,
   or any external data source. Every question must be answerable from memory.

5. The Back button must restore the previously selected answer visually —
   the option card must show as selected when the user returns to a question.

6. On mobile, option cards must be tap-friendly with minimum 52px touch targets.
   The Continue button must be fixed at bottom on mobile.

7. The boost from Q22 Option A (+45 pts) is the ONLY boost in the system.
   Do not add boosts elsewhere.

8. If the user has a score below 350 at results, show a special message above
   the action plan: "You're in rebuild territory — and that's okay. This is
   exactly the starting point the platform was built for. Your action plan
   below is your complete roadmap." Do not hide or sugarcoat the score.

9. Results screen data must be passed to /capital-dashboard via context or
   URL params: score, dimAvg values (as integers 0–100), so the Capital
   Access Map pre-populates with assessment results immediately.

10. The platform voice throughout: direct, specific, no platitudes.
    "Great start!" is never acceptable language. Data motivates. Specificity
    motivates. "You are 96 points from SBA access" motivates.

════════════════════════════════════════════════════════════════════════════════
NOW BUILD IT. LEAVE NOTHING VAGUE.
Every color from the design system. Every animation from the spec.
Every question exactly as written. Every score value exactly as specified.
This is the assessment that changes the trajectory of 33 million businesses.
════════════════════════════════════════════════════════════════════════════════