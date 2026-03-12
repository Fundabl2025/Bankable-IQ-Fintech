════════════════════════════════════════════════════════════════════════════════
FUNDREADY™ — BUSINESS SUCCESS SCAN + FUNDSCORE™ INTEGRATION
COMPLETE UNIFIED DESIGN PROMPT FOR FIGMA
Expert-Level · Production-Grade · Zero Ambiguity · Full System Coverage
════════════════════════════════════════════════════════════════════════════════

You are designing the complete, unified Business Success Scan + FundScore™
system inside FundReady™ — a pre-funding readiness platform serving 33 million
U.S. small business owners who are denied funding not because their businesses
are unworthy, but because they were never prepared.

This is NOT a redesign of two separate tools. This is the COMPLETE UNIFICATION
of two existing systems into one seamless, intelligent assessment experience:

  SYSTEM A (ALREADY BUILT):
  The Business Success Scan (BSS) — a 3-step intake form that collects business
  identity, operational data, and credit profile, then runs a 3-tier eligibility
  check (Pre-Qualified / Likely Qualified / Not Pre-Qualified) across 17 funding
  programs. Data syncs to businessData.ts and drives the Bankable Score (0–160)
  and NAP Score (0–100).

  SYSTEM B (DEFINED BUT NOT YET MERGED):
  The FundScore™ Assessment — 24 plain-language questions across 6 weighted
  dimensions (Credit Profile 28%, Documentation 22%, Cash Flow 20%, Banking
  Behavior 13%, Business Structure 10%, Narrative Strength 7%) producing a
  0–1000 score with 6 score bands, a ranked 5-action plan, and a 17-product
  eligibility matrix. Score feeds the full Capital Access Map.

  THE UNIFIED RESULT:
  One assessment. Three-step structured intake (identity + operations + credit)
  immediately followed by the enhanced 24-question FundScore™ deep assessment.
  One results experience that delivers: Bankable Score (0–160) + FundScore™
  (0–1000) + 17-product eligibility across all 4 tiers + ranked action plan +
  compliance gap map + path orientation for 3 user goals.

This prompt is the complete design authority. Build exactly what is specified.
Do not guess. Do not simplify. Do not substitute components. Every pixel,
every animation, every data connection, every word is intentional.

════════════════════════════════════════════════════════════════════════════════
PART 1 — WHAT THE UNIFIED SYSTEM DOES
════════════════════════════════════════════════════════════════════════════════

The Business Success Scan + FundScore™ integration does six things in sequence:

1. IDENTIFY (Steps 1–3 of the BSS intake)
   Collects structured business identity and credit profile data.
   This establishes the Bankable Score baseline — who the business is,
   what it owns, how it's structured, what the owner's credit looks like.
   These are hard data fields: EIN, entity type, revenue, bank account age,
   credit scores, derogatory history, assets, property.

2. DEEPEN (24-Question FundScore™ Assessment)
   After the BSS intake, the user transitions directly into 24 behavioral and
   qualitative questions that score 6 dimensions. These questions cannot be
   answered by a database — only the owner knows whether their P&L matches
   their bank statements, whether they've defaulted on a loan, whether they
   can articulate their repayment plan. The FundScore™ captures what structured
   data cannot.

3. CALCULATE (Dual Score Engine)
   Two scores run simultaneously from combined data:

   BANKABLE SCORE (0–160):
   calculateFicoSBSS() runs from BSS structured data.
   Baseline: 80 pts for any new business.
   Target: 160 pts for fully bankable.
   Factors: 83 audit items across 7 categories.
   NAP Score (0–100): name/address/phone/web/EIN/bank completeness.

   FUNDSCORE™ (0–1000):
   computeScore() runs from 24-question dimension responses.
   Weights: C:0.28 D:0.22 F:0.20 B:0.13 S:0.10 N:0.07
   BSS structured data pre-fills dimension starting values.
   24 questions then refine those values.
   Score drives all product eligibility and action plan generation.

4. MATCH (17-Program Eligibility Matrix)
   Both score systems feed into a unified product eligibility check.
   Every one of the 17 funding programs is evaluated against:
     → FundScore™ minimum threshold (from the 0–1000 scale)
     → BSS hard requirements (minimum revenue, credit score, business age,
       asset ownership, EIN, bank account, NSF history, entity type)
     → Compliance requirement IDs (from compReq arrays)
   Status: Pre-Qualified / Likely Qualified / Approaching / Not Pre-Qualified

   IMPORTANT — STATUS MAPPING:
   The BSS system uses: Pre-Qualified / Likely Qualified / Not Pre-Qualified
   The FundScore™ system uses: Unlocked / Approaching / Locked
   The unified system uses ALL FOUR in one combined display:
     PRE-QUALIFIED    = FundScore threshold MET + all BSS hard reqs MET (green)
     LIKELY QUALIFIED = FundScore threshold MET + some BSS data unverified (amber)
     APPROACHING      = FundScore within 80 pts of threshold, ≤3 reqs missing (teal)
     NOT PRE-QUALIFIED= FundScore threshold NOT met + critical BSS gap (gray)

5. DELIVER (Unified Results Experience)
   One results page. Everything at once.
   Summary hero: FundScore™ + Bankable Score + Programs pre-qualified + Top action.
   4-tab product display: Pre-Qualified / Likely Qualified / Approaching / Not Pre-Qualified.
   6-dimension breakdown with bars.
   Ranked 5-action plan targeting weakest dimensions.
   Compliance gap map (20-item dot grid from BSS).
   Path orientation: 3 goal tracks with 30/60/90 day projections.
   All sync to businessData.ts. All feed Capital Access Map.

6. ROUTE (To Command Center)
   After results, user enters /capital-dashboard pre-populated with:
     Their FundScore™, Bankable Score, 17-program eligibility status,
     ranked action plan, compliance status, and dimension breakdown.
   No empty states. No "come back when you have more data."
   They arrive knowing exactly what to do first.

════════════════════════════════════════════════════════════════════════════════
PART 2 — COMPLETE UNIFIED FLOW MAP
════════════════════════════════════════════════════════════════════════════════

ROUTE: /business-success-scan

SUB-ROUTES:
  /business-success-scan           → Step 1: Business Information
  /business-success-scan/step-2    → Step 2: Business Status
  /business-success-scan/step-3    → Step 3: Credit Profile
  /business-success-scan/fundscore → FundScore™ Assessment (24 Questions)
  /business-success-scan/results   → Unified Results Page

PROGRESS BAR (persistent, top of all screens):
  7 steps total. Labeled segments:
    1 "Identity"    → BSS Step 1
    2 "Operations"  → BSS Step 2
    3 "Credit"      → BSS Step 3
    4–7 "Assessment"→ FundScore™ sections (Credit / Docs / Cash / Banking / Structure / Narrative)
       Condenses sections 4–7 into a single "Assessment" segment visually,
       but sub-progress shows inside the assessment (Q1–Q24 individual bar).
  Completed steps: lime filled dot + lime connector line.
  Current step: lime ring outline + step number + label.
  Upcoming: border-subtle circle + step number + label (muted).
  Height: 52px sticky bar, bg var(--bg-surface-1), border-bottom var(--border-subtle).

DATA PERSISTENCE:
  BSS Step 1 data: localStorage['bss_step1']
  BSS Step 2 data: localStorage['bss_step2']
  BSS Step 3 data: localStorage['bss_step3']
  FundScore™ answers: localStorage['fundscore_answers']
  On results load: read all four, run full dual calculation, sync to businessData.ts.

TRANSITION SCREEN (between BSS Step 3 and FundScore™ Assessment):
  Full-screen centered card. 1 screen. Not a loading state — an intentional bridge.
  See Part 6 for complete spec.

════════════════════════════════════════════════════════════════════════════════
PART 3 — DESIGN SYSTEM (COMPLETE)
════════════════════════════════════════════════════════════════════════════════

This system uses the global FundReady™ dark design language.
All values below are CSS custom property names — reference from theme.css.
NEVER hardcode hex values in component code.

── BACKGROUNDS ──────────────────────────────────────────────────────────────
  --bg-base:       #0d0f0b    Page background, always
  --bg-surface-1:  #131510    Cards, panels, sidebar
  --bg-surface-2:  #191c14    Elevated cards, inner panels, sticky bars
  --bg-surface-3:  #1f231a    Input fields, deepest nested content

── BORDERS ───────────────────────────────────────────────────────────────────
  --border-subtle:  #2a2e22   Default card borders
  --border-medium:  #363b2c   Hover/focus borders
  --border-strong:  #4a5038   Active/selected borders

── TEXT ──────────────────────────────────────────────────────────────────────
  --text-primary:    #e4e8d8
  --text-secondary:  #b8bca8
  --text-muted:      #6b7258
  --text-disabled:   #3a3d2e

── BRAND — LIME ──────────────────────────────────────────────────────────────
  --primary:        #8ab820
  --primary-hover:  #5a7a10
  --primary-alpha:  rgba(138,184,32,0.08)
  --lime-glow:      rgba(138,184,32,0.20)

── SCORE BANDS (FundScore™ 0–1000) ──────────────────────────────────────────
  --score-critical:    #b04428    0–399
  --score-low:         #c89020    400–549
  --score-developing:  #a0a020    550–649
  --score-approaching: #38a880    650–749
  --score-ready:       #8ab820    750–899
  --score-prime:       #c8f040    900–1000

── BANKABLE SCORE BANDS (0–160) ─────────────────────────────────────────────
  0–64:    "Needs Work"     — color #b04428 (same as critical)
  65–95:   "Building"       — color #c89020 (same as low)
  96–127:  "Near Bankable"  — color #38a880 (same as approaching)
  128–160: "Bankable"       — color #8ab820 (same as ready)

── STATUS TIERS (eligibility) ────────────────────────────────────────────────
  Pre-Qualified:    bg --primary-alpha, border --primary,      text --primary     (lime)
  Likely Qualified: bg amber 8% alpha, border #c89020,         text #c89020       (amber)
  Approaching:      bg teal 8% alpha,  border #38a880,         text #38a880       (teal)
  Not Pre-Qualified: bg var(--bg-surface-2), border var(--border-subtle), text muted (gray)

── TYPOGRAPHY ────────────────────────────────────────────────────────────────
  Display / Score Numbers:  Syne 800
  Section Headings:         Syne 700 / 600
  Labels / UI:              DM Sans 300 / 400 / 500
  Advisory Callouts:        Crimson Pro italic 300

── COMPONENT RULES ───────────────────────────────────────────────────────────
  border-radius: 0 on ALL elements — no exceptions anywhere
  No white (#fff) backgrounds on any surface
  No blue (#1e40af or any shade) anywhere
  Score numbers: ALWAYS use their band color variable
  No rounded pill badges — all status badges are sharp-cornered
  Framer Motion: whileTap={{ scale: 0.97 }} on all primary buttons
                 whileTap={{ scale: 0.99 }} on all card/option selections

════════════════════════════════════════════════════════════════════════════════
PART 4 — BSS STEP 1: BUSINESS INFORMATION  /business-success-scan
════════════════════════════════════════════════════════════════════════════════

PURPOSE:
  Establish business identity. The data collected here feeds:
  → NAP Score (+25 for address, +25 for phone, +20 for web, +15 for EIN, +15 for bank)
  → Bankable Score (EIN, business entity legitimacy)
  → Lender compliance items 1 (business name/address), 2 (phone), 11 (EIN)
  → Pre-population of the FundScore™ Business Structure dimension
  This is who the business is. Lenders verify it against public databases.

LAYOUT:
  No sidebar. Progress bar step 1 of 5 active.
  Content card: max-width 640px centered. bg var(--bg-surface-1).
  Padding: 40px desktop, 24px mobile.

STEP HEADER:
  Step badge: "STEP 1 OF 5 — BUSINESS IDENTITY"
  DM Sans 400 11px UPPERCASE var(--primary), tracking 0.12em
  Headline: "Tell us about your business." — Syne 800 36px var(--text-primary)
  Sub: "This information establishes your business identity in lender databases."
  Crimson Pro italic 16px var(--text-secondary)
  margin-bottom: 40px

TEST DATA BUTTON (top-right of card header):
  Ghost button: "Fill Test Data" — DM Sans 400 12px var(--primary)
  border: 1px solid var(--border-subtle), padding 6px 12px
  onClick: populates all fields with sample data
  This button exists on all 3 BSS steps and the assessment welcome.

──────────────────────────────────────────────────────────────────────────────
FIELDS — Group 1: Business Identity
──────────────────────────────────────────────────────────────────────────────

All input fields follow this spec:
  bg: var(--bg-surface-3)
  border: 2px solid var(--border-subtle)
  focus: border var(--primary) + box-shadow 0 0 0 3px var(--primary-alpha)
  border-radius: 0
  padding: 14px 16px
  font: DM Sans 400 15px var(--text-primary)
  placeholder: DM Sans 300 15px var(--text-muted)
  Label above: DM Sans 400 11px UPPERCASE tracking-widest var(--text-muted), mb 8px

Field 1: BUSINESS LEGAL NAME
  Input: type text, placeholder "Exact legal name as registered"
  Note below: "Must match your state registration and EIN paperwork exactly."
  DM Sans 300 12px var(--text-muted)

Field 2: CONTACT NAME (2-column: First + Last)
  First Name + Last Name side by side. gap 12px.

Field 3: CONTACT EMAIL
  Input: type email
  Validation: inline error "Please enter a valid email address"
  Note: "Used only for your FundReady™ results — never shared."

Field 4: CONTACT PHONE NUMBER
  Input: type tel, auto-format (xxx) xxx-xxxx
  Placeholder "(555) 555-5555"

Field 5: BUSINESS PHYSICAL ADDRESS
  Street (full width)
  City + State + Zip (3-column row, widths 45% / 30% / 25%)
  Note: "Lenders verify Name, Address, Phone (NAP) consistency across databases."
  DM Sans 300 12px var(--text-muted), amber left-border callout

Field 6: BUSINESS PHONE NUMBER
  Label: "BUSINESS PHONE (LANDLINE PREFERRED)"
  Note: "Landline numbers carry more weight in NAP verification databases."
  DM Sans 300 12px var(--text-muted)

Field 7: EIN STATUS — VISUAL RADIO
  Label: "DO YOU HAVE A FEDERAL EMPLOYER IDENTIFICATION NUMBER (EIN)?"
  2 cards horizontal:

  YES card:
    Title: "Yes — I have an EIN" — Syne 600 15px
    Sub: "Required for SBA and most institutional lenders"
    Selected: lime border 2px + lime-alpha bg
    Conditional sub-field slides in when YES selected:
      Label: "EIN NUMBER"
      Input: type text, format XX-XXXXXXX, placeholder "12-3456789"

  NO card:
    Title: "No — I don't have an EIN yet"
    Sub: "Limits your lender access — can be obtained in minutes at IRS.gov"
    amber callout note on card: "Getting an EIN is free and takes 5 minutes."
    Selected: amber border 2px + amber 8% bg

  LENDER NOTE (appears below both cards after selection):
    YES: lime box "✓  EIN adds +15 to your Bankable Score and is required for SBA."
    NO:  amber box "→  Apply at IRS.gov now before your assessment is complete."

──────────────────────────────────────────────────────────────────────────────
NAVIGATION
──────────────────────────────────────────────────────────────────────────────
  Primary CTA (full-width): "Continue to Business Status →"
  Syne 700 14px UPPERCASE, bg var(--primary), color #000
  disabled until: business name + contact name + email + phone + address + EIN status all filled
  onClick: save to localStorage['bss_step1'], route to /step-2

  Below button (centered):
    "🔒  Your data is saved locally and used only to calculate your scores."
    DM Sans 300 12px var(--text-muted)

════════════════════════════════════════════════════════════════════════════════
PART 5 — BSS STEP 2: BUSINESS STATUS  /business-success-scan/step-2
════════════════════════════════════════════════════════════════════════════════

PURPOSE:
  Establish business operations and asset profile. This data feeds:
  → Business Structure dimension (S — 10% of FundScore™)
  → Cash Flow dimension (F — 20% of FundScore™)
  → Banking Behavior dimension (B — 13% of FundScore™)
  → Bankable Score: entity, revenue, banking items
  → Product-specific hard requirements: MCA (CC sales), Factoring (A/R),
    Equipment (value), Bridge/DSCR/Construction (property ownership)
  → NAP Score: website (+20), bank account (+15)
  Pre-qualifying logic for all 17 programs runs from these answers.

LAYOUT: Focus mode. Progress bar step 2 active. Max-width 640px.

STEP HEADER:
  "STEP 2 OF 5 — BUSINESS STATUS" — same badge style
  Headline: "Your operations, revenue, and assets." — Syne 800 36px
  Sub: "Be as accurate as possible — these numbers drive your eligibility."
  margin-bottom: 40px

──────────────────────────────────────────────────────────────────────────────
GROUP 1 — Business Operations
──────────────────────────────────────────────────────────────────────────────

Field 1: BUSINESS START DATE
  Label: "WHEN DID YOUR BUSINESS LEGALLY START OPERATING?"
  2-field row: Month (select, 12 options) + Year (select, 2000–current)
  LIVE CALCULATION below (appears after both selected):
    "[X years, X months] in operation" — Syne 600 18px var(--primary)
    Product threshold tags update live:
      < 6 months: red tag "Limited alt-lender access only"
      6–12 months: amber tag "MCAs + revenue-based products available"
      12–24 months: teal tag "Opens credit lines and most alt-lenders"
      24+ months: lime tag "Meets SBA and conventional minimums"

Field 2: INDUSTRY TYPE
  Label: "INDUSTRY TYPE"
  Searchable dropdown. Options (same as FundScore™ Q18 with exact scoring):
    "Professional Services, Technology, or Healthcare"    — lime tag "Low Risk"
    "Retail, E-commerce, or Wholesale"                    — text "Standard"
    "Construction or Real Estate"                         — amber tag "Moderate Risk"
    "Restaurant, Food Service, or Hospitality"            — red tag "Higher Risk"
    "Transportation, Trucking, or Logistics"              — amber tag "Moderate Risk"
    "Other / Not listed"                                  — text "Standard"
  Risk tag appears inline right of dropdown after selection.

Field 3: BUSINESS ENTITY TYPE
  Label: "BUSINESS ENTITY TYPE"
  4 visual cards (2×2 grid, gap 12px) — same spec as onboarding Step 1:
    Sole Proprietorship: selected = amber border + note "Limited lender access"
    LLC (Single-Member): selected = lime border + note "Opens most alt-lending"
    LLC (Multi-Member) or Partnership: lime border + note "Strong lender signal"
    S-Corp or C-Corp: lime border + note "Strongest conventional lending signal"

Field 4: WEBSITE URL
  Label: "BUSINESS WEBSITE URL"
  Input: type url, placeholder "https://yourbusiness.com"
  Note: "A verifiable web presence adds +20 to your Bankable Score."
  DM Sans 300 12px var(--text-muted)
  Optional — mark "(optional)" next to label in muted text.

──────────────────────────────────────────────────────────────────────────────
GROUP 2 — Revenue & Credit Card Sales
──────────────────────────────────────────────────────────────────────────────

Field 5: MONTHLY REVENUE
  Label: "AVERAGE MONTHLY REVENUE (LAST 6 MONTHS)"
  Sub-label: "This sets your maximum borrowing power with most lenders."
  Premium slider: min $0, max $150,000
  LIVE VALUE: "[amount] / month" — Syne 800 36px var(--primary)
  LIVE ANNUAL: "Annual: ~$[X]" — DM Sans 300 13px var(--text-muted)
  LIVE BORROW ESTIMATE: "Estimated max line: ~$[amount × 1.5]" — DM Sans 400 13px #38a880
  Scale markers: $0 · $5K · $20K · $50K · $100K · $150K+
  Threshold note updates live (same ranges as onboarding):
    < $3K/mo: amber "⚠  Below minimum for most lenders"
    $3–15K: teal "Opens revenue-based and working capital products"
    $15K+: lime "→ Full product range available at this revenue level"

Field 6: MONTHLY CREDIT CARD SALES
  Label: "MONTHLY CREDIT CARD SALES"
  Sub-label: "Required for Merchant Cash Advance qualification."
  Same premium slider, max $100,000.
  Conditional MCA note (appears when value > $10,000):
    lime box: "✓  You meet the Merchant Cash Advance revenue threshold ($10K+/mo)"
  Conditional note (< $10,000):
    muted text: "MCA requires $10K+/month in credit card processing"

Field 7: ACCOUNTS RECEIVABLE (outstanding invoices owed to business)
  Label: "CURRENT ACCOUNTS RECEIVABLE (UNPAID INVOICES OWED TO YOU)"
  Input: type currency, placeholder "$0"
  Sub-label: "This is money customers owe you. Enables Invoice Factoring and A/R Finance."
  Conditional note when value > $0:
    teal box: "→  You have A/R. Invoice Factoring and A/R Finance are potentially available."

Field 8: PURCHASE ORDERS IN HAND
  Label: "VERIFIED PURCHASE ORDERS CURRENTLY IN HAND"
  Input: type currency, placeholder "$0"
  Sub-label: "Confirmed POs from customers — enables PO Financing."
  Conditional note when > $100,000:
    lime box: "✓  PO amount meets Purchase Order Finance minimum ($100K+)"

Field 9: EQUIPMENT VALUE
  Label: "TOTAL BUSINESS EQUIPMENT VALUE"
  Sub-label: "Machinery, vehicles, tech infrastructure — anything over $5,000."
  Input: type currency, placeholder "$0"
  Conditional note when > $15,000:
    teal box: "→  Equipment value qualifies for Equipment Financing consideration."

──────────────────────────────────────────────────────────────────────────────
GROUP 3 — Business Banking (CRITICAL — most lenders check this first)
──────────────────────────────────────────────────────────────────────────────

Section callout (above Group 3):
  bg: var(--primary-alpha), border-left: 3px solid var(--primary)
  "Lenders read 12 months of bank statements like a report card.
   This section carries heavy weight in your eligibility review."
  Crimson Pro italic 15px var(--text-secondary), padding 14px 18px

Field 10: BUSINESS BANK ACCOUNT STATUS
  Label: "DO YOU HAVE A BUSINESS BANK ACCOUNT?"
  3 visual cards:
    "Yes — dedicated business account" (lime border on select)
      Sub: "Fully separated from personal finances"
      LENDER NOTE: "✓  Required for virtually all lending products"
    "Yes — but I use a personal account for business" (amber border on select)
      Sub: "Common but limits lender access"
      LENDER NOTE: "⚠  Must open dedicated account before most applications"
    "No — I don't have a business bank account" (red border on select)
      Sub: ""
      LENDER NOTE: "✗  Hard stop for most products — must be resolved"
  Bank account status adds +15 to Bankable Score when dedicated account confirmed.

Field 11: BANK ACCOUNT AGE (conditional — shows when any YES selected above)
  Label: "HOW LONG HAS YOUR BUSINESS BANK ACCOUNT BEEN OPEN?"
  4 cards:
    "0–6 months"    amber    "Recent — limited history"
    "6–12 months"   teal     "Approaching lender minimums"
    "12–24 months"  lime     "Meets most lender requirements"
    "24+ months"    lime     "Strong account history"
  Minimum bank account age requirements shown below:
    "Most lenders require 6+ months. SBA requires 12+ months."
    DM Sans 300 12px var(--text-muted)

Field 12: AVERAGE MONTHLY BALANCE
  Label: "AVERAGE MONTHLY BALANCE IN YOUR BUSINESS ACCOUNT"
  5 cards horizontal (same as FundScore™ Q13):
    "Near zero or negative"   red
    "$500 – $2,000"           amber
    "$2,000 – $10,000"        teal
    "$10,000 – $25,000"       lime
    "$25,000+"                lime
  Note: "Lenders want a balance equal to at least 10% of your loan request."

Field 13: RECENT NSFS OR OVERDRAFTS
  Label: "ANY OVERDRAFTS OR NSFS IN THE LAST 12 MONTHS?"
  4 cards (same as FundScore™ Q12):
    "Zero"      lime
    "1–2"       teal
    "3–5"       amber
    "5+"        red

──────────────────────────────────────────────────────────────────────────────
GROUP 4 — Property Ownership (OPTIONAL — conditional section)
──────────────────────────────────────────────────────────────────────────────

Section toggle above Group 4:
  Collapsed by default. Toggle to expand:
  "Do you own investment or rental property? (This unlocks additional loan products)"
  DM Sans 400 14px var(--text-secondary) + chevron icon, hover lime
  When expanded, slides in (Framer: height 0 → auto, 300ms):

Field 14: OWNS INVESTMENT PROPERTY?
  3 cards: "Yes" / "No" / "Planning to purchase"
  When YES:
    Field 14a: PROPERTY COUNT (number input)
    Field 14b: TOTAL PROPERTY VALUE (currency input)
    Field 14c: TOTAL MORTGAGE BALANCE (currency input)
    Field 14d: TOTAL MONTHLY RENTAL INCOME (currency input)
    Property equity calculated live:
      "Estimated equity: $[value - mortgage]" — Syne 700 20px var(--primary)
    Conditional product note:
      If equity > $50K: lime box "✓  Bridge Loan and DSCR products may be available"
      If rental income > $0: teal box "→  DSCR Loan eligibility requires rental income verification"

Field 15: PLANNING A CONSTRUCTION PROJECT?
  3 cards: "Yes" / "No" / "Planning for later"
  When YES:
    Field 15a: CONSTRUCTION BUDGET (currency input)
    Conditional note when > $200,000:
      lime box "✓  Meets Construction Loan minimum ($200K+)"

──────────────────────────────────────────────────────────────────────────────
NAVIGATION
──────────────────────────────────────────────────────────────────────────────
  Primary: "Continue to Credit Profile →"
  Ghost left: "← Back to Business Information"
  Disabled until: start date + industry + entity + revenue + bank account + bank age + balance + NSFs all selected.

════════════════════════════════════════════════════════════════════════════════
PART 6 — BSS STEP 3: CREDIT PROFILE  /business-success-scan/step-3
════════════════════════════════════════════════════════════════════════════════

PURPOSE:
  Capture the owner's complete credit picture. This is the #1 factor lenders
  check first. Data feeds:
  → Credit Profile dimension (C — 28% of FundScore™, highest weight)
  → Bankable Score credit items
  → Hard product filters (minimum FICO floors per program)
  → Derogatory flag logic — bankruptcy, judgments, collections, charge-offs

LAYOUT: Focus mode. Progress bar step 3 active. Max-width 640px.

STEP HEADER:
  "STEP 3 OF 5 — CREDIT PROFILE" badge
  Headline: "Your personal credit picture." — Syne 800 36px
  Sub: "Personal credit is the first thing every lender checks.
        This section determines which products are available to you today."
  Crimson Pro italic 16px var(--text-secondary)
  TRUST NOTE: "🔒  No credit pull. Self-reported only."
  DM Sans 400 12px var(--text-muted), display inline-block, margin-top 4px

──────────────────────────────────────────────────────────────────────────────
GROUP 1 — Owner Identity (minimal — links to business profile)
──────────────────────────────────────────────────────────────────────────────

Field 1: OWNER NAME (pre-filled from Step 1 contact name — editable)
  2-column: First Name / Last Name

Field 2: CITY / STATE
  2-column: City + State dropdown (50 states + DC)
  Note: "Used for lender geographic matching only."

──────────────────────────────────────────────────────────────────────────────
GROUP 2 — Personal Income
──────────────────────────────────────────────────────────────────────────────

Field 3: PERSONAL INCOME RANGE
  Label: "ANNUAL PERSONAL INCOME"
  Sub-label: "Required for Personal Credit Card qualification ($75K+ minimum)."
  5 cards:
    "Under $35K"      red
    "$35K – $75K"     amber
    "$75K – $125K"    lime + "Personal Credit Cards: Eligible"
    "$125K – $250K"   lime
    "$250K+"          lime
  Conditional note when < $75K:
    amber box "Personal Credit Card stacking requires $75K+ annual income."

──────────────────────────────────────────────────────────────────────────────
GROUP 3 — Credit Scores (CRITICAL)
──────────────────────────────────────────────────────────────────────────────

Section header callout:
  bg var(--primary-alpha), border-left 3px var(--primary):
  "Use your most recent scores from each bureau. If you don't know an exact
   score, use your best estimate — you can update these later."
  Crimson Pro italic 15px var(--text-secondary), padding 14px 18px

Field 4: EXPERIAN SCORE (slider)
  Label: "EXPERIAN CREDIT SCORE"
  Slider: min 300, max 850, step 5
  LIVE VALUE: "[score]" — Syne 800 48px, colored by band:
    300–579: #b04428 "Below subprime"
    580–619: #c89020 "Subprime"
    620–659: #a0a020 "Near-prime"
    660–699: #38a880 "Fair"
    700–749: #8ab820 "Good"
    750–850: #c8f040 "Excellent"
  Lender threshold markers on slider track (small ticks with labels):
    |500 MCA| |580 SBA floor| |620 alt-lender| |650 conventional| |720 best rates|

Field 5: TRANSUNION SCORE (same slider spec)
  Label: "TRANSUNION CREDIT SCORE"

Field 6: EQUIFAX SCORE (same slider spec)
  Label: "EQUIFAX CREDIT SCORE"

COMPOSITE SCORE DISPLAY (calculated live from all 3 sliders):
  Card below all 3 sliders:
  bg var(--bg-surface-2), border var(--border-subtle), padding 20px
  "COMPOSITE SCORE USED FOR MATCHING"
  DM Sans 400 10px UPPERCASE var(--text-muted)
  Score: "[avg of 3]" — Syne 800 56px band-colored
  "Middle score: [middle of three values]" — DM Sans 300 13px var(--text-muted)
  Note: "Most lenders use the middle of your three bureau scores."
  DM Sans 300 12px var(--text-muted) Crimson Pro italic

  PRODUCT THRESHOLD CALLOUT (updates live as scores change):
    Score < 500:  red box "MCA available but all conventional products locked."
    500–579:      amber box "MCA and some revenue products available."
    580–619:      teal box "Opens SBA access (minimum 580). Alt-lenders available."
    620–649:      teal box "Most alt-lenders available. Personal CC and credit line approaching."
    650–699:      lime box "Opens credit union loans and approaching SBA 7(a)."
    700–749:      lime box "Strong access. Most products available except conventional bank."
    750+:         lime box "✓  Top-tier access across all 17 products."

──────────────────────────────────────────────────────────────────────────────
GROUP 4 — Major Derogatories
──────────────────────────────────────────────────────────────────────────────

Section header:
  "MAJOR DEROGATORY ITEMS"
  DM Sans 400 11px UPPERCASE var(--text-muted)

Field 7: ACTIVE BANKRUPTCY?
  2 cards:
    "No — no bankruptcy on record"    lime border on select
    "Yes — bankruptcy on record"      red border on select + sub: "Timing matters — specify below"
  Conditional when YES selected:
    3 mini-cards: "Within last 2 years" / "2–7 years ago" / "Over 7 years ago"
    Bankruptcy timing note:
      < 2 years: red box "Most lenders require bankruptcy discharged 2+ years prior."
      2–7 years: amber box "Affects SBA. Some alt-lenders will work with you."
      7+ years: teal box "Minimal impact on most products at this stage."

Field 8: JUDGMENTS OR LIENS?
  2 cards: "No" (lime) / "Yes" (red)
  When YES: note "Must be resolved or explained before most applications."

──────────────────────────────────────────────────────────────────────────────
GROUP 5 — Credit Profile Details (CRITICAL for FundScore™ C dimension)
──────────────────────────────────────────────────────────────────────────────

These fields directly map to FundScore™ assessment questions Q1 (utilization),
Q2 (derogatories), Q3 (business credit). They pre-fill the assessment answers.

Field 9: CREDIT INQUIRIES IN LAST 30 DAYS
  Label: "HARD CREDIT INQUIRIES IN THE LAST 30 DAYS"
  Sub-label: "Multiple inquiries signal credit-seeking behavior to lenders."
  5 cards:
    "0 inquiries"     lime     "No impact"
    "1–2 inquiries"   teal     "Minor — acceptable"
    "3–4 inquiries"   amber    "Concerning pattern"
    "5+ inquiries"    red      "Significant red flag"
    "I don't know"    muted    "Assumed moderate impact"

Field 10: NEW ACCOUNTS IN LAST 12 MONTHS
  Label: "NEW CREDIT ACCOUNTS OPENED IN LAST 12 MONTHS"
  5 cards: "0" / "1–2" / "3–4" / "5+" / "I don't know"
  Same color scheme as inquiries above.

Field 11: CREDIT UTILIZATION
  Label: "PERSONAL CREDIT UTILIZATION (% OF AVAILABLE CREDIT IN USE)"
  Sub-label: "This is the #2 FICO factor. Over 30% starts hurting your score."
  Premium slider: 0% to 100%
  LIVE VALUE: "[X]%" — Syne 800 48px, colored:
    0–29%: #8ab820 "Ideal"
    30–49%: #c89020 "Caution"
    50–74%: #b04428 "High"
    75–100%: #b04428 "Very High"
  Threshold line at 30% and 50% on track.
  Note updates live: same logic as FundScore™ Q1.

──────────────────────────────────────────────────────────────────────────────
GROUP 6 — Derogatory Items Checklist
──────────────────────────────────────────────────────────────────────────────

Label: "WHICH OF THE FOLLOWING APPLY TO YOUR CREDIT REPORT?"
Sub: "Check all that apply. Leave unchecked if not applicable."

6 TOGGLE CHECKBOXES (checklist cards — checked state: lime border + lime-alpha bg):

  □ Collections on my credit report
    DM Sans 400 14px var(--text-primary)
    Note (visible on check): "Active collections flag on most bank reviews."

  □ Charge-offs on my credit report
    Note: "Charged-off accounts stay on file 7 years. Explain proactively."

  □ Late payments (60+ days) in last 24 months
    Note: "Recent late payments carry higher weight than older ones."

  □ Federal or state tax liens
    Note: "Tax liens must be resolved or payment plans established before SBA."

  □ No derogatory items — my report is clean
    This option is mutually exclusive from the others.
    When checked: all other boxes uncheck automatically.
    Card gets lime border + "✓ Clean credit report" sub-label.

──────────────────────────────────────────────────────────────────────────────
CREDIT IMPACT SUMMARY (appears after all credit groups are complete)
──────────────────────────────────────────────────────────────────────────────
  Card: bg var(--bg-surface-2), border var(--border-subtle), padding 20px
  Slides in after user completes Groups 3–6.

  Title: "YOUR CREDIT POSITION SUMMARY"
  DM Sans 400 10px UPPERCASE var(--text-muted)

  3 columns:
    Col 1: "COMPOSITE SCORE" — Syne 800 44px band-colored
    Col 2: "PRODUCTS ACCESSIBLE" — Syne 800 44px var(--primary) "[X] of 17"
    Col 3: "CREDIT DIMENSION" — Syne 800 44px band-colored "[X]%" projected C score

  Note below: "These will be refined further in your FundScore™ assessment."
  Crimson Pro italic 14px var(--text-secondary)

──────────────────────────────────────────────────────────────────────────────
NAVIGATION
──────────────────────────────────────────────────────────────────────────────
  Primary: "Continue to FundScore™ Assessment →"
  Ghost left: "← Back to Business Status"
  Disabled until: all credit score sliders touched + inquiries + utilization + derogatory section completed.

  CTA NOTE below button:
    "The FundScore™ assessment adds 24 precision questions that can't be
     captured from data alone — answers you only know yourself."
    DM Sans 300 13px var(--text-muted), text-align center

════════════════════════════════════════════════════════════════════════════════
PART 7 — TRANSITION SCREEN: BSS → FUNDSCORE™
════════════════════════════════════════════════════════════════════════════════

PURPOSE:
  Bridge the two systems. The user has completed 3 structured data steps.
  Now they're entering the qualitative assessment that sharpens everything.
  This screen creates intentionality — they know what's coming and why.
  It also shows a PRELIMINARY SCORE based on BSS data alone, before the
  24 questions refine it.

ROUTE: /business-success-scan/fundscore (this IS Step 4 of progress bar)
LAYOUT: Full screen. No sidebar. Progress bar step 4 (Assessment) active.
Content card: max-width 720px centered.

──────────────────────────────────────────────────────────────────────────────
PRELIMINARY SCORE REVEAL (from BSS data only — before 24 questions)
──────────────────────────────────────────────────────────────────────────────

Top label: "PRELIMINARY FUNDSCORE™ — BASED ON INTAKE DATA"
DM Sans 400 11px UPPERCASE tracking-widest var(--text-muted)

Score number:
  Syne 800 96px, band-colored
  Framer Motion useSpring, 0 → preliminary score, 1000ms, stiffness 40 damping 12
  Label: "Preliminary" in Crimson Pro italic 14px var(--text-muted) below

Band label: result.band.name — Crimson Pro italic 20px var(--text-secondary)

Score meter: same spec as results, fills 0 → (score/10)%, 800ms

Explanation callout:
  bg var(--primary-alpha), border-left 3px var(--primary), padding 16px 20px
  "This preliminary score is based on the structured data you've provided.
   The 24 questions below will sharpen it — some answers can move your score
   significantly in either direction. Your final score is calculated after
   all 24 questions."
  Crimson Pro italic 16px var(--text-secondary)

──────────────────────────────────────────────────────────────────────────────
QUICK STATS (from BSS data)
──────────────────────────────────────────────────────────────────────────────
3 stat boxes horizontal, stagger animate in:

  "X PRE-QUALIFIED" — Syne 800 36px var(--primary)
  "products from intake data" — DM Sans 300 12px muted

  "X APPROACHING" — Syne 800 36px #38a880
  "need minor improvements" — DM Sans 300 12px muted

  "X ACTIONS IDENTIFIED" — Syne 800 36px #c89020
  "to improve your score" — DM Sans 300 12px muted

──────────────────────────────────────────────────────────────────────────────
WHY 24 MORE QUESTIONS (builds trust before the assessment begins)
──────────────────────────────────────────────────────────────────────────────

Headline: "Why 24 more questions?" — Syne 700 24px var(--text-primary)

4 reason cards in a 2×2 grid, each with icon + title + 1 sentence:

  Card 1: Documentation Depth
    "Lenders cross-reference your documents. We need to know not just
     whether you have them — but whether they're consistent with each other."

  Card 2: Behavioral Signals
    "NSF history, utilization trends, balance trajectory — behavioral data
     that databases don't capture but lenders read carefully."

  Card 3: Narrative Strength
    "Can you explain exactly how you'll use and repay the money? Vague
     answers kill applications that otherwise would have been approved."

  Card 4: Prior Loan History
    "Have you successfully repaid a business loan before? This single data
     point can add 45 points to your final FundScore™."

Card styling: bg var(--bg-surface-1), border var(--border-subtle), padding 20px
Icon: 24px, var(--primary)
Title: Syne 600 15px var(--text-primary)
Body: DM Sans 300 13px var(--text-secondary) lh 1.6

──────────────────────────────────────────────────────────────────────────────
CTA
──────────────────────────────────────────────────────────────────────────────
Trust strip:
  "🔒  24 questions.  No bank login.  No credit pull.  6–9 minutes."
  Same strip styling as assessment welcome screen.

Primary CTA (full-width):
  "Start My FundScore™ Assessment →"
  Syne 700 15px UPPERCASE, bg var(--primary), color #000, padding 16px 32px, br 0

What you'll get (4-item 2×2 grid below CTA — same as assessment welcome):
  "FundScore™ (0–1000)" / "6-Dimension Breakdown" / "Ranked Action Plan" / "Lender Access Preview"

Time badge: "⏱  Most people finish in 6–9 minutes."

════════════════════════════════════════════════════════════════════════════════
PART 8 — FUNDSCORE™ ASSESSMENT: 24 QUESTIONS
════════════════════════════════════════════════════════════════════════════════

This section integrates the complete FundScore™ assessment INSIDE the BSS flow.
The assessment runs as a continuation of the same progress bar, in the same
visual system, with one addition: BSS data PRE-FILLS certain questions.

── PRE-FILL LOGIC (BSS data → FundScore™ question answers) ──────────────────

BSS data that pre-fills assessment questions:
  BSS credit score composite → Q0 (personal credit score) — auto-selected, editable
  BSS credit utilization     → Q1 (utilization rate) — auto-selected, editable
  BSS derogatory checkboxes  → Q2 (derogatory marks) — auto-selected, editable
  BSS monthly revenue        → Q8 (monthly revenue) — auto-selected, editable
  BSS NSF/overdraft          → Q12 (overdrafts/NSFs) — auto-selected, editable
  BSS avg daily balance      → Q13 (average daily balance) — auto-selected, editable
  BSS fund separation        → Q14 (personal/business separated) — auto-selected, editable
  BSS entity type            → Q16 (entity type) — auto-selected, editable
  BSS business age           → Q17 (years in business) — auto-selected, editable
  BSS industry               → Q18 (industry) — auto-selected, editable
  BSS good standing          → Q19 (state standing) — auto-selected, editable

PRE-FILLED QUESTION TREATMENT:
  When a question is pre-filled from BSS data:
  1. Show it NORMALLY — same question card layout, same options.
  2. The matching option is auto-selected (lime border + checkmark showing).
  3. A small banner above the question:
     "↗  Pre-filled from your intake data — change if needed"
     bg var(--bg-surface-2), border-left 2px #38a880
     DM Sans 400 11px #38a880
  4. The user can change the answer — it overrides the BSS data for scoring.
  5. Questions that CANNOT be pre-filled (Q3, Q4, Q5, Q6, Q7, Q9, Q10, Q11,
     Q15, Q20, Q21, Q22, Q23) appear with no pre-fill banner.

PRE-FILLED QUESTION HANDLING IN NAVIGATION:
  Pre-filled questions are NOT skipped. Every question must be confirmed.
  But the Continue button is immediately ACTIVE (not disabled) on pre-filled
  questions because an answer is already selected. The user can confirm by
  pressing Continue without changing anything.
  This keeps the experience fast without forcing them to re-select every field.

── ASSESSMENT LAYOUT ─────────────────────────────────────────────────────────

Uses the exact same template as the standalone assessment (Part 7 of assessment
prompt). Differences from standalone assessment:

1. Progress bar at top shows BOTH the global 5-step bar (steps 1–5, step 4
   active) AND below it a secondary question progress bar:
   "Question X of 24" fill bar. The two bars stack vertically.
   Global bar: 52px sticky, as before.
   Question bar: 4px slim below the global bar, full width, lime fill.

2. The section counter row shows:
   LEFT: dim dot + section name + pre-fill badge (if applicable)
   RIGHT: "Question " + (currentQ+1) + " of 24"
   (Same as standalone except pre-fill badge addition.)

3. All 24 questions, all option cards, all advisory callouts, all navigation
   are IDENTICAL to the standalone assessment specification (see Part 11 of
   assessment prompt for all 24 questions with exact text, why, and scores).

4. The scoring engine is IDENTICAL:
   computeScore(answers, questions) with WEIGHTS C:0.28 D:0.22 F:0.20 B:0.13 S:0.10 N:0.07
   Plus BSS-derived initial dimension values as floor values.

BSS-TO-DIMENSION FLOOR VALUES:
  Before 24 questions run, seed dimBuckets with BSS data:
  C bucket seed: BSS credit score composite → 0.05 to 1.00 (same mapping as before)
  F bucket seed: BSS monthly revenue → 0.10 to 1.00
  B bucket seed: BSS bank account status + NSF + balance (average of 3)
  S bucket seed: BSS entity type + business age + industry + good standing (average of 4)
  D and N buckets: NOT seeded from BSS — these require assessment questions only.
  Then 24 questions run on top of the seeded buckets.
  Final dimAvg = average of (seed values + question values) for seeded dims.
  This means BSS data adds real weight — not just pre-selecting answers — 
  it contributes as actual scored data points to the dimensions.

── LOADING SCREEN (after Q24 — before results) ───────────────────────────────

1800ms. Full screen. bg var(--bg-base).
Animated lime circle spinner.
Text line 1: "Calculating your FundScore™..." — Syne 600 20px var(--text-primary)
Text line 2: "Combining intake data with 24 assessment answers..." — DM Sans 300 14px var(--text-muted)
Text line 3: "Matching 17 funding programs..." — DM Sans 300 14px var(--text-muted)
(Lines cycle with crossfade 400ms each.)

Then: run full dual calculation (computeScore + calculateFicoSBSS + calculateNAPScore),
sync all data to businessData.ts, route to /business-success-scan/results.

════════════════════════════════════════════════════════════════════════════════
PART 9 — UNIFIED RESULTS PAGE  /business-success-scan/results
════════════════════════════════════════════════════════════════════════════════

PURPOSE:
  Everything the user needs to know. In one page. Right now.
  FundScore™ + Bankable Score + 17 programs across 4 tiers + 6-dim breakdown +
  5-action ranked plan + compliance dots + path preview.
  This is the payoff for everything they just completed.

LAYOUT: Full-width. Sidebar NOT present yet (it appears after they enter /capital-dashboard).
Max-width: 1100px. Two-column on desktop (60/40). One-column on mobile.

──────────────────────────────────────────────────────────────────────────────
SECTION 1 — DUAL SCORE HERO (full-width, above the fold)
──────────────────────────────────────────────────────────────────────────────

bg: var(--bg-surface-1), border-bottom: 1px solid var(--border-subtle)
padding: 48px 60px desktop, 24px mobile

Layout: 2 columns, gap 40px.

LEFT COLUMN — FundScore™:
  "YOUR FUNDSCORE™" — DM Sans 400 11px UPPERCASE tracking-widest var(--text-muted)
  Score: Syne 800 120px band-colored
  Animation: useSpring 0 → final, stiffness 40 damping 12, 1400ms
  Color transitions through band colors as counter rises.
  Score meter: width 100%, 12px height, bg var(--border-subtle)
  Fill: (score/10)% width, band color, animate 0 → final 1200ms delay 200ms
  Band label: result.band.name — Crimson Pro italic 24px var(--text-secondary), fades in after counter stops

RIGHT COLUMN — Bankable Score:
  "YOUR BANKABLE SCORE" — DM Sans 400 11px UPPERCASE var(--text-muted)
  Score fraction: "132/160" — Syne 800 80px band-colored (128+ = lime)
  Band label: "Near Bankable" or equivalent — Crimson Pro italic 18px var(--text-secondary)
  Score bar: same design, fills to (bankable/160)*100%, 1200ms delay 400ms

  BANKABLE SCORE BREAKDOWN (mini, below bar):
    4 sub-items in a row:
      "FICO SBSS" [0–160 sub-score] — DM Sans 400 12px
      "NAP Score" [0–100] — DM Sans 400 12px
      "Items Complete" [X/83] — DM Sans 400 12px
      "Categories" [X/7] — DM Sans 400 12px
    Each value: Syne 600 16px var(--primary) (or band color)

BELOW BOTH SCORES — Quick stats strip (full-width, 4 boxes):
  Box 1: "[X] PRE-QUALIFIED" — Syne 800 36px var(--primary)
         "funding programs available now" — DM Sans 300 12px muted
  Box 2: "[X] LIKELY QUALIFIED" — Syne 800 36px #c89020
         "pending verification" — DM Sans 300 12px muted
  Box 3: "[X] APPROACHING" — Syne 800 36px #38a880
         "within reach — minor gaps" — DM Sans 300 12px muted
  Box 4: "TOP ACTION" — Syne 800 36px var(--primary)
         First action item name truncated to 30 chars — DM Sans 300 12px muted
  Boxes stagger animate in, 80ms each, after scores complete.

──────────────────────────────────────────────────────────────────────────────
SECTION 2 — 17-PROGRAM RESULTS (4-TAB INTERFACE — PRIMARY SECTION)
──────────────────────────────────────────────────────────────────────────────

Full-width. bg var(--bg-base).

TAB BAR:
  4 tabs, full-width, border-bottom var(--border-subtle)
  bg transparent, padding 14px 20px
  Active tab: Syne 700 13px UPPERCASE var(--primary) + 2px lime bottom border
  Inactive tab: DM Sans 400 13px var(--text-muted)
  Badges on each tab: count of programs in that tier, small pill

  TAB 1: "Pre-Qualified [X]"
  TAB 2: "Likely Qualified [X]"
  TAB 3: "Approaching [X]"
  TAB 4: "Not Pre-Qualified [X]" — default closed/last
  Hidden toggle: "Not Applicable [X]" — collapsed behind "Show all" ghost button

DEFAULT TAB: Tab 1 (Pre-Qualified). If 0 in Tab 1, default to Tab 2.

──────────────────────────────────────────────────────────────────────────────
PROGRAM CARD DESIGN (same template across all 4 tabs — only color/status varies)
──────────────────────────────────────────────────────────────────────────────

Cards in a 2-column grid (desktop), 1-column (mobile). gap 16px.
Each card: bg var(--bg-surface-1), border var(--border-subtle), padding 20px, br 0

CARD TOP ROW (flex, align-items flex-start, gap 16px):
  LEFT: Status dot 12px (color per tier: lime/amber/teal/muted)
  CENTER (flex 1):
    Program name: Syne 600 16px var(--text-primary)
    Amount range: DM Sans 400 13px var(--text-muted)
  RIGHT:
    Status badge (sharp corners):
      Pre-Qualified:    "✓ PRE-QUALIFIED"    bg lime-alpha, border lime, text lime
      Likely Qualified: "⚠ LIKELY QUALIFIED"  bg amber alpha, border amber, text amber
      Approaching:      "→ APPROACHING"        bg teal alpha, border teal, text teal
      Not Pre-Qual:     "✗ NOT PRE-QUALIFIED"  bg surface-2, border subtle, text muted

CARD METRICS ROW (flex, gap 16px, margin-top 12px):
  3 metric chips (inline):
    Speed: "⚡ [X hours/days]" — DM Sans 400 12px var(--text-muted)
    Rate:  "% [rate range]" — DM Sans 400 12px var(--text-muted)
    Score req: "[score] min" — DM Sans 400 12px var(--text-muted)

CARD DESCRIPTION:
  1–2 sentence description. DM Sans 300 13px var(--text-secondary) lh 1.6
  margin-top 12px

CARD REASONING (the most important element):
  "Why [Pre-Qualified / Likely Qualified / Approaching / Not Pre-Qualified]:"
  DM Sans 500 12px UPPERCASE var(--text-muted), margin-top 12px
  2–3 lines of specific logic. DM Sans 300 13px var(--text-secondary) lh 1.5
  Examples:
    Pre-Q: "✓ Score 742 exceeds 550 minimum · ✓ All 4 compliance items complete · ✓ Revenue $25K meets $15K threshold"
    Likely: "✓ Score meets minimum · ⚠ Revenue unverified · ⚠ Awaiting bank statement confirmation"
    Approach: "→ Need +47 pts · Need 2 of 4 compliance items · Estimated 30 days"
    Not: "✗ Score 412 — need 520 minimum (+108 pts) · ✗ Business age 8 months — need 12 months"

EXPANDABLE DETAILS (accordion):
  "View Requirements ↓" — DM Sans 400 12px var(--primary), Framer expand animation
  When expanded:
    3 columns:
      ✅ Requirements Met:     each on own line, lime checkmark
      ❌ Requirements Not Met: each on own line, red X
      ❓ Missing Data:         each on own line, amber question mark
  Collapse on second click.

CARD BOTTOM ROW (flex, justify-content space-between, margin-top 16px):
  LEFT: "Confidence: [X]%" — DM Sans 400 12px var(--text-muted)
    Mini progress bar (4px) showing match score %
  RIGHT: "View Details →" — DM Sans 400 13px var(--primary)
    Routes to /capital-access/[program-id]

SPECIAL CARD RULE — MCA:
  Merchant Cash Advance always includes an amber disclosure box at bottom of card:
  bg amber 8% alpha, border amber, padding 12px 16px:
  "Note: MCAs carry factor rates (not APR). Total cost is typically 10–50% of
   the advance amount. Confirm terms carefully before accepting."
  DM Sans 300 12px #c89020

──────────────────────────────────────────────────────────────────────────────
SECTION 3 — 6-DIMENSION BREAKDOWN (FUNDSCORE™ ANATOMY)
──────────────────────────────────────────────────────────────────────────────

Full-width below tab section.
Section header: "FundScore™ Breakdown" — Syne 700 22px var(--text-primary), margin-bottom 24px
Sub: "Your score is composed of 6 weighted dimensions. This shows exactly where you're strong and where lenders see risk."
Crimson Pro italic 15px var(--text-secondary)

6 bars. Same rendering as standalone results (Part 9 of assessment prompt).
Stagger 80ms per bar. Colors from DIM_DATA. All animations same spec.

DIM_DATA:
  C — Credit Profile      28%  #8ab820
  D — Documentation       22%  #c89020
  F — Cash Flow           20%  #38a880
  B — Banking Behavior    13%  #8858c8
  S — Business Structure  10%  #b04428
  N — Narrative Strength   7%  #3878c8

BELOW BARS — Dimension Callouts:
  For any dimension where score < 0.50 (50%):
    Inline callout card:
    bg dim color 8% alpha, border-left 3px dim color
    "[Dim Name] needs attention. This dimension is [weight]% of your FundScore™.
     [1 specific action to improve it]."
    DM Sans 300 13px var(--text-secondary), padding 12px 16px

──────────────────────────────────────────────────────────────────────────────
SECTION 4 — RANKED ACTION PLAN (TOP 5)
──────────────────────────────────────────────────────────────────────────────

Section header: "Your Highest-Impact Actions" — same style
Sub: "Ranked by points gained per effort invested. Do these in order."

5 action cards. IDENTICAL spec to standalone results (Part 9 of assessment prompt).
rank box / title / 3 pills (pts/time/dim) / why text.
All styling identical.

──────────────────────────────────────────────────────────────────────────────
SECTION 5 — LENDER COMPLIANCE STATUS (20-Item Grid)
──────────────────────────────────────────────────────────────────────────────

Section header: "Lender Compliance Status — 20 Required Items"
Sub: "[X] of 20 items verified through your intake data. Complete the remaining [Y] to unlock more products."

3-column stat row:
  "[X] COMPLETE" — lime · "[X] QUICK WINS" — amber · "[X] NEED WORK" — red

20-DOT GRID (4 rows × 5 columns):
  Each dot: 28×28, border-radius 0 (square)
  Color by status:
    Confirmed complete (from BSS data):        bg var(--primary) #8ab820
    Quick win (< 7 days):                      bg #c89020 (amber)
    Medium-term (30–60 days):                  bg #c87020 (orange)
    Long-term (60+ days):                      bg #b04428 (red)
    Unknown / not assessed:                    bg var(--border-medium) #363b2c
  Tooltip on hover: compliance item name + time to complete + impact
  Dots animate in: stagger 30ms per dot, scale 0→1

LEGEND below grid: 5 legend items, each: dot 14×14 + label DM Sans 400 11px

"View All 20 Compliance Items →" — lime link, routes to /lender-compliance

──────────────────────────────────────────────────────────────────────────────
SECTION 6 — PATH ORIENTATION (3 Goal Tracks)
──────────────────────────────────────────────────────────────────────────────

Section header: "Your Funding Roadmap"
Sub: "Three paths forward — choose based on your goals."

3 goal cards (same spec as onboarding path orientation, Part 11 of onboarding prompt):

CARD 1 — Access Funding Now (lime):
  Available products: "[X] pre-qualified programs ready"
  Speed: "Fastest: [X] hours funding"
  CTA: "Go to Capital Access Map →" → /capital-access

CARD 2 — Build Bankability 30–90 Days (teal):
  Milestone: "+[X] pts projected in 30 days with top 3 actions"
  Products unlock: "[X] new programs"
  CTA: "View Action Plan →" → /action-plan

CARD 3 — Premium Access 90–180 Days (amber/prime):
  SBA gap: "+[X] pts to SBA minimum" or "SBA accessible now"
  Items needed: "[X] compliance items"
  CTA: "Plan My SBA Path →" → /action-plan?goal=sba

──────────────────────────────────────────────────────────────────────────────
SECTION 7 — MAIN CTA (Enter Dashboard)
──────────────────────────────────────────────────────────────────────────────

Full-width primary button:
  "Enter My Command Center →"
  Syne 700 15px UPPERCASE, bg var(--primary), color #000, padding 18px 32px, br 0
  onClick: syncScanDataToAuditItems() then router.push('/capital-dashboard')

Below button (centered):
  "Everything from this assessment is loaded in your dashboard."
  DM Sans 300 13px var(--text-muted)

Ghost below that:
  "Share my results" — DM Sans 400 13px var(--text-muted), hover underline

margin-bottom: 80px

════════════════════════════════════════════════════════════════════════════════
PART 10 — DATA CONNECTIONS & SYNC ENGINE
════════════════════════════════════════════════════════════════════════════════

ON RESULTS PAGE LOAD — execute in this exact order:

STEP 1 — Read all localStorage:
  const step1 = JSON.parse(localStorage.getItem('bss_step1') || '{}');
  const step2 = JSON.parse(localStorage.getItem('bss_step2') || '{}');
  const step3 = JSON.parse(localStorage.getItem('bss_step3') || '{}');
  const answers = JSON.parse(localStorage.getItem('fundscore_answers') || '[]');

STEP 2 — Build BSS dimension seeds:
  Map BSS fields to dimension bucket seeds.
  (Full mapping table in Part 8 above.)

STEP 3 — Run FundScore™ computation:
  computeScore(answers, QUESTIONS)
  → returns { score, dimAvg }
  → Merge BSS seeds into dimAvg (weighted: BSS seeds count as 1 question each)

STEP 4 — Run BSS eligibility checks:
  checkAllProgramsEligibilityPhase1(step1, step2, step3)
  → returns 17 program objects with status + reasoning

STEP 5 — Merge eligibility with FundScore™ matrix:
  For each of 17 programs:
    bssStatus = phase1 check result
    fsStatus = getStatus(product, score, compDone)
    finalStatus = mergeStatus(bssStatus, fsStatus):
      If BOTH pre-qualified → "Pre-Qualified"
      If BSS pre-qualified + FS approaching → "Likely Qualified"
      If BSS likely + FS any → "Likely Qualified"
      If either has critical failure → use lowest status
      If FS score gap > 80 → "Not Pre-Qualified"
      If FS approaching (gap ≤ 80) → "Approaching"

STEP 6 — Run Bankable Score:
  syncScanDataToAuditItems()
  updateBusinessProfile()
  const bankableScore = calculateFicoSBSS();
  const napScore = calculateNAPScore();

STEP 7 — Run action generation:
  generateActions(dimAvg) → top 5 actions

STEP 8 — Display all results simultaneously.
  All animations trigger on mount.

STEP 9 — Push to dashboard context:
  setDashboardData({ score, dimAvg, bankableScore, napScore, programs, actions })
  This pre-populates /capital-dashboard before the user arrives.

════════════════════════════════════════════════════════════════════════════════
PART 11 — FIGMA FILE STRUCTURE FOR THIS DESIGN
════════════════════════════════════════════════════════════════════════════════

FIGMA PAGE ORGANIZATION for the Business Success Scan + FundScore™ system:

Page: 📋 BSS + FundScore™ System

  Frame: BSS_Step1_Desktop (1440×900)
  Frame: BSS_Step1_Mobile (390×844)
  Frame: BSS_Step2_Desktop (1440×900)
  Frame: BSS_Step2_Mobile (390×844)
  Frame: BSS_Step3_Desktop (1440×900)
  Frame: BSS_Step3_Mobile (390×844)
  Frame: BSS_Transition_Desktop (1440×900) — preliminary score bridge
  Frame: Assessment_Q_Template_Desktop (1440×900) — Q1 as representative
  Frame: Assessment_Q_PreFilled_Desktop (1440×900) — pre-filled state
  Frame: Assessment_Loading_Desktop (1440×900)
  Frame: Results_Desktop_Hero (1440×900) — dual score above fold
  Frame: Results_Desktop_Programs_Tab1 (1440×1400) — pre-qualified tab
  Frame: Results_Desktop_Programs_Tab2 (1440×1200) — likely qualified tab
  Frame: Results_Desktop_Programs_Tab3 (1440×1000) — approaching tab
  Frame: Results_Desktop_Breakdown (1440×700) — 6 dims + action plan
  Frame: Results_Desktop_Compliance (1440×600) — 20-dot grid
  Frame: Results_Desktop_Path (1440×600) — 3 goal tracks + CTA
  Frame: Results_Mobile_Full (390×3200) — full page mobile
  Frame: Results_Scrolled_ProgBarSticky (1440×900) — scroll state

COMPONENT LIBRARY (build each as Figma component with all variants):

  Progress_Bar (global 5-step)
    Variant: step 1/2/3/4/5 active
    Variant: desktop / mobile

  BSS_Input_Field
    Variant: empty / filled / focus / error
    Variant: text / email / phone / currency / url

  BSS_VisualCard_Select (entity type, entity, years, goals)
    Variant: unselected / selected-lime / selected-amber / selected-red

  BSS_ToggleCard_3State (documentation status)
    Variant: YES / IN_PROGRESS / NO / unselected

  BSS_PremiumSlider
    Variant: revenue / FICO / utilization / balance
    Variant: desktop / mobile

  FundScore_ProgressBars_Double (global bar + question bar stacked)

  FundScore_Question_Card
    Variant: no prefill / prefilled
    Includes option cards in all states

  FundScore_OptionCard
    Variant: unselected / hover / selected

  Program_Card (17 instances — 4 status states each)
    Variant: Pre-Qualified / Likely / Approaching / Not Pre-Qual
    Variant: collapsed / expanded

  Score_Hero_Dual
    Variant: loading / revealed

  DimensionBar
    Variant: 6 colors × loading/animated states

  ActionCard (5 per results)

  ComplianceDot (20 instances)
    Variant: 5 status colors

  PathCard_Goal (3 instances)
    Variant: lime / teal / amber

  StatusBadge
    Variant: Pre-Qualified / Likely / Approaching / Not Pre-Qual / Not Applicable

════════════════════════════════════════════════════════════════════════════════
PART 12 — ALL 24 FUNDSCORE™ QUESTIONS (EXACT — DO NOT MODIFY)
════════════════════════════════════════════════════════════════════════════════

These questions appear in the FundScore™ assessment section exactly as written.
Pre-fill logic is applied per Part 8. Text, options, and scores are FIXED.
Refer to Part 11 of the fundready_assessment_prompt.txt for complete question
text. The exact questions are reproduced here for completeness:

[CREDIT PROFILE Q0–Q3]
Q0: "What's your estimated personal credit score right now?"
    Options A–F: Below 580 (C:0.05) / 580–619 (C:0.20) / 620–649 (C:0.40) /
                 650–699 (C:0.60) / 700–739 (C:0.78) / 740+ (C:1.00)
    Pre-fill: FROM BSS composite credit score

Q1: "What is your approximate personal credit utilization rate?"
    Options A–E: Under 20% (C:1.00) / 20–30% (C:0.75) / 30–50% (C:0.45) /
                 Over 50% (C:0.10) / I don't know (C:0.35)
    Pre-fill: FROM BSS utilization slider

Q2: "Do you have any active derogatory marks on your personal credit report?"
    Options A–D: No—clean (C:1.00) / Yes over 2yr (C:0.60) / Yes within 2yr (C:0.20) /
                 Haven't checked (C:0.40)
    Pre-fill: FROM BSS derogatory checkboxes

Q3: "Does your business have its own credit file and score?"
    Options A–D: Paydex 80+ (C:1.00) / Below 80 (C:0.50) / Building (C:0.30) /
                 No file (C:0.05)
    No pre-fill (BSS does not collect business credit file status)

[DOCUMENTATION Q4–Q7 — NO PRE-FILLS]
Q4: "How many years of filed business tax returns do you have?"
    A: None (D:0.00) / B: 1yr (D:0.35) / C: 2yr (D:0.75) / D: 3+ (D:1.00)

Q5: "Do you have a current Profit & Loss (P&L) statement?"
    A: Yes pro (D:1.00) / B: Yes self-made (D:0.60) / C: Over 6mo old (D:0.35) / D: No (D:0.00)

Q6: "How many months of business bank statements can you provide right now?"
    A: <3mo (D:0.10) / B: 3–5mo (D:0.35) / C: 6–11mo (D:0.65) / D: 12+ (D:1.00)

Q7: "Do the revenue figures on your tax returns and bank statements roughly match?"
    A: Yes match (D:1.00) / B: Within 25% (D:0.60) / C: Significant diff (D:0.15) / D: Unsure (D:0.35)

[CASH FLOW Q8–Q11]
Q8: "What is your business's approximate average monthly revenue over the last 6 months?"
    A: <$3K (F:0.10) / B: $3–8K (F:0.30) / C: $8–20K (F:0.55) / D: $20–50K (F:0.78) / E: >$50K (F:1.00)
    Pre-fill: FROM BSS monthly revenue slider

Q9: "Has your revenue been growing, flat, or declining over the past 12 months?"
    A: Growing consistent (F:1.00) / B: Inconsistent (F:0.70) / C: Flat (F:0.50) / D: Declining (F:0.10)
    No pre-fill

Q10: "After expenses, does your business consistently generate a monthly profit?"
     A: Every month (F:1.00) / B: Most months (F:0.65) / C: Half the time (F:0.30) / D: Rarely (F:0.05)
     No pre-fill

Q11: "If you took on a new monthly loan payment, could your business comfortably cover it?"
     A: Strong surplus DSCR 1.35+ (F:1.00) / B: Tight 1.10–1.25 (F:0.60) / C: Maybe (F:0.35) / D: No margin (F:0.05)
     No pre-fill

[BANKING BEHAVIOR Q12–Q15]
Q12: "How many overdrafts or NSFs has your business account had in the last 12 months?"
     A: Zero (B:1.00) / B: 1–2 (B:0.65) / C: 3–5 (B:0.25) / D: More than 5 (B:0.00)
     Pre-fill: FROM BSS NSF field

Q13: "What is the typical average daily balance in your business checking account?"
     A: Near zero (B:0.00) / B: $500–2K (B:0.25) / C: $2–10K (B:0.55) / D: $10–25K (B:0.80) / E: $25K+ (B:1.00)
     Pre-fill: FROM BSS average balance field

Q14: "Are your personal and business finances completely separated?"
     A: Fully separate (B:1.00) / B: Mostly (B:0.50) / C: No (B:0.00)
     Pre-fill: FROM BSS bank account status (dedicated = fully separate)

Q15: "Has your average daily bank balance been trending upward over the last 3–6 months?"
     A: Growing (B:1.00) / B: Same (B:0.55) / C: Declining (B:0.10) / D: Haven't tracked (B:0.40)
     No pre-fill

[BUSINESS STRUCTURE Q16–Q19]
Q16: "What is your current business entity type?"
     A: Sole Prop (S:0.10) / B: LLC Single (S:0.65) / C: LLC Multi/Partnership (S:0.78) / D: S/C-Corp (S:1.00)
     Pre-fill: FROM BSS entity type field

Q17: "How long has your business been legally operating?"
     A: <6mo (S:0.05) / B: 6–12mo (S:0.25) / C: 1–2yr (S:0.55) / D: 2–5yr (S:0.85) / E: 5+ (S:1.00)
     Pre-fill: FROM BSS business start date (calculated age)

Q18: "What industry is your business in?"
     A: Prof/Tech/Health (S:1.00) / B: Retail/Ecomm (S:0.85) / C: Construction/RE (S:0.65) /
     D: Restaurant/Food (S:0.40) / E: Transport (S:0.50) / F: Other (S:0.70)
     Pre-fill: FROM BSS industry field

Q19: "Is your business currently in good standing with your state?"
     A: Yes current (S:1.00) / B: Think so (S:0.65) / C: No issues (S:0.00)
     Pre-fill: (if BSS collected good standing — otherwise no pre-fill)

[NARRATIVE STRENGTH Q20–Q23 — NO PRE-FILLS]
Q20: "Can you clearly explain exactly how you will use the loan funds?"
     A: Precisely with numbers (N:1.00) / B: General idea (N:0.55) / C: Know but not ROI (N:0.25) / D: Just need capital (N:0.00)

Q21: "Can you explain clearly how you will repay the loan?"
     A: Specific path (N:1.00) / B: From revenue generally (N:0.50) / C: Haven't thought through (N:0.10)

Q22: "Have you ever successfully repaid a business loan or line of credit?"
     A: Yes paid full on time (N:1.00) BOOST: +45 pts / B: Yes with late (N:0.55) /
     C: First loan (N:0.40) / D: Defaults (N:0.00)
     NOTE: Q22 Option A boost (+45) is the ONLY boost in the system.

Q23: "How relevant is your personal background and experience to the business you're operating?"
     A: 10+ years exact (N:1.00) / B: 5–10 years (N:0.78) / C: 1–5 years (N:0.50) / D: New (N:0.20)

════════════════════════════════════════════════════════════════════════════════
PART 13 — CRITICAL DESIGN & BUILD RULES
════════════════════════════════════════════════════════════════════════════════

RULE 1 — ONE SYSTEM, ONE EXPERIENCE.
  The Business Success Scan and the FundScore™ are not two features placed
  side by side. They are one unified assessment experience with one progress
  bar, one results page, and one data model. No modal to "switch" to the
  assessment. No separate entry point for the FundScore™. One flow.

RULE 2 — BSS HARD DATA IS NEVER OVERRIDDEN BY ASSESSMENT SOFT DATA.
  If BSS shows business age < 6 months (a hard fact), and Q17 would have
  selected a different option — BSS wins for eligibility hard-stop checks.
  The assessment pre-fills from BSS but the hard facts from BSS always
  govern hard product minimum requirements.

RULE 3 — EVERY STATUS IS EARNED.
  Nothing shows as Pre-Qualified unless BOTH the FundScore™ threshold is
  met AND the BSS hard requirements are met. "Likely Qualified" means the
  score is there but soft data (unverified revenue, statement depth) needs
  human confirmation. The 3-tier BSS system and the FundScore™ matrix
  must BOTH be satisfied for a pre-qual designation.

RULE 4 — PRE-FILLED ANSWERS ARE CONFIRMED, NOT FORCED.
  Every pre-filled question shows the pre-selected answer visually but
  the user can change it. If they change an answer that contradicts BSS
  data, both values are stored — BSS data used for hard eligibility,
  assessment answer used for FundScore™ dimension scoring.

RULE 5 — THE PRELIMINARY SCORE IS REAL.
  The preliminary score shown on the transition screen between BSS Step 3
  and the 24-question assessment is a REAL calculation from BSS-seeded
  dimension values. It is not an estimate or placeholder. It may be lower
  than the final score (since D and N are not seeded from BSS). That is
  correct and should be stated clearly in the explanation callout.

RULE 6 — DUAL SCORE DISPLAY.
  On the results page, BOTH FundScore™ AND Bankable Score appear side by
  side with equal visual weight in the hero section. They are separate
  metrics that serve different purposes. Neither is primary. Explain each
  clearly on hover/tooltip:
    FundScore™: "Measures your readiness across 6 qualitative dimensions.
                  Drives product eligibility and action plan."
    Bankable Score: "Measures your compliance completeness across 83 audit items.
                     Drives lender confidence and institutional readiness."

RULE 7 — MCA ALWAYS LAST, ALWAYS WITH DISCLOSURE.
  In every tab, every list, every display — Merchant Cash Advance appears
  last among products of the same status tier, and always carries the
  cost disclosure amber box. No exceptions.

RULE 8 — NOT APPLICABLE IS HIDDEN BY DEFAULT.
  Property-based programs (Bridge, DSCR, Construction) show as "Not Applicable"
  when BSS data confirms no property ownership and no construction plans.
  This tab is collapsed by default with a ghost toggle "Show not applicable (3)"
  to reveal. Does not contribute to any count in the summary stats.

RULE 9 — SAVE PROGRESS AT EVERY STEP.
  localStorage saves on every field change — not just on Continue click.
  If the user closes the browser mid-BSS, they return to where they left off.
  Resume prompt on scan entry: amber callout "Continue where you left off →"

RULE 10 — THE SCORE COUNTER IS NON-NEGOTIABLE.
  The FundScore™ counter animation from 0 to final over 1400ms (useSpring,
  stiffness 40, damping 12) is never skipped, never replaced with a static
  number, never shortened for "performance." This moment is the payoff for
  the entire assessment journey. Build it. Protect it.

RULE 11 — THE TEST DATA BUTTON EXISTS ON ALL 3 BSS STEPS.
  Each step has a "Fill Test Data" ghost button in the upper right of the card.
  This is a development and demo tool. It populates ALL fields on that step
  with the TechStart Solutions example data from the system documentation.
  It does not appear in production (feature-flagged). Design it in.

RULE 12 — ALL 4 BSS + ALL 17 PROGRAMS ARE ALWAYS EVALUATED.
  No matter what data is entered, all 17 programs run through eligibility.
  There is no conditional skipping of programs based on early data signals.
  The user sees the full picture — pre-qualified, likely, approaching,
  not pre-qualified, not applicable — every time.

RULE 13 — MOBILE FIRST WITHIN DESKTOP DESIGN.
  All interactive elements: 52px minimum touch targets.
  All sliders: draggable thumb minimum 28px on touch.
  Navigation (back/continue) fixed at bottom on mobile.
  Tab bar on results page: scrollable horizontally on mobile.
  Score hero on mobile: stacked vertically (FundScore™ then Bankable, full width).

RULE 14 — THE PLATFORM VOICE THROUGHOUT.
  "Great start!" is never used.
  "You're doing great!" is never used.
  Every piece of copy is direct, specific, data-driven.
  "Your documentation score is at 42% — this is your fastest win."
  "You are 108 points from Purchase Order Finance."
  "Zero NSFs in 12 months: this is the strongest possible banking signal."
  The platform speaks like a CFO, not a cheerleader.

════════════════════════════════════════════════════════════════════════════════
BUILD THIS EXACTLY AS SPECIFIED.
Every screen. Every state. Every data connection. Every animation.
Every question text. Every score value. Every product. Every word.
This is one unified system built to fix the story of 33 million businesses.
════════════════════════════════════════════════════════════════════════════════

════════════════════════════════════════════════════════════════════════════════
PART 14 — DYNAMIC SCORING LOGIC: COMPLETE SPECIFICATION
THIS SECTION GOVERNS ALL LIVE SCORE DISPLAY BEHAVIOR ACROSS THE ENTIRE PLATFORM
════════════════════════════════════════════════════════════════════════════════

WHAT THE CURRENT SYSTEM HAS (do not remove — enhance and replace):

  The existing dashboard (fundready-unified-dashboard.html) has:
  ✓ renderAll() → calls renderSidebar(), renderProducts(), renderCompliance(),
    renderScoreDetail(), renderActions() on every state change
  ✓ updateScore(val) → slider changes currentScore → renderAll()
  ✓ updateCompliance(val) → toggles first N compliance items → renderAll()
  ✓ toggleComp(id) → individual compliance item toggle → renderAll()
  ✓ getStatus(product) → returns 'unlocked' / 'approaching' / 'locked'
  ✓ getBand(score) → returns band name + color from 0–1000
  ✓ FIXED_DIM {C:72,D:58,F:68,B:44,S:80,N:62} — static dimension scores
    that scale proportionally with currentScore via (FIXED_DIM[d] * (currentScore/624))
  ✓ Live product gap pills showing "+X pts needed" and missing compliance IDs
  ✓ Live compliance dot grid coloring (done/quick/medium/longterm)
  ✓ Live eligibility summary badges (X unlocked · X approaching · X locked)

  The existing standalone FundScore™ (fundscore-no-integration.html) has:
  ✓ computeScore() — real dimension-weighted calculation from 24 answers
  ✓ generateActions(dimAvg) — real action generation from actual dim scores
  ✓ getLenderAccess(score) — tier unlocking from real score
  ✓ showResults() — animates score counter (setInterval, not spring)
  ✓ Dim bars rendered from real dimAvg values
  ✓ Action plan from real weakness detection

  WHAT IS MISSING AND MUST BE BUILT:

  PROBLEM 1 — FIXED_DIM IS FAKE.
  The dashboard uses FIXED_DIM multiplied by (currentScore/624) to simulate
  dimension scores. This means every user sees the same dimension ratios —
  just scaled up or down. This is a placeholder. In the unified system,
  dimension scores come from REAL computeScore() output from the 24 answers
  AND from BSS-seeded values. FIXED_DIM must be REPLACED with real dimAvg
  computed from actual assessment data.

  PROBLEM 2 — DASHBOARD SCORE SLIDER IS A DEMO TOOL, NOT PRODUCTION.
  The updateScore(val) slider and updateCompliance(val) slider exist for
  demonstration. In production, currentScore is SET ONCE from computeScore()
  results and UPDATES only when the user:
    → Completes a new assessment
    → Checks off compliance items (which re-runs getStatus() but NOT computeScore())
    → Is shown a projected score from an action plan simulation
  The sliders should remain as a DEBUG/PREVIEW mode, feature-flagged.

  PROBLEM 3 — NO LIVE SCORE PROJECTION ON BSS STEPS.
  During BSS Steps 2 and 3, there is no live projected score display. The
  unified system must show a live preliminary FundScore™ updating as users
  fill each field. This is the sticky bottom bar described in Part 5.

  PROBLEM 4 — NO BSS → DIMENSION SEED PIPELINE.
  BSS structured data (revenue, credit scores, entity, banking) is not being
  piped into dimension scores. It syncs to businessData.ts and updates the
  Bankable Score, but it does not feed computeScore(). This gap must be closed.

  PROBLEM 5 — SCORE COUNTER ANIMATION IS setInterval, NOT useSpring.
  The standalone FundScore™ uses a setInterval counter at 20ms steps. The
  unified system uses Framer Motion useSpring (stiffness: 40, damping: 12)
  for a physics-based spring feel. All score counter animations must use
  useSpring, not setInterval.

──────────────────────────────────────────────────────────────────────────────
14A — THE UNIFIED SCORE STATE MODEL
──────────────────────────────────────────────────────────────────────────────

Replace FIXED_DIM and currentScore global variables with this unified state:

interface UnifiedScoreState {
  // Primary scores — SET from assessment, READ everywhere
  fundScore:      number;                    // 0–1000, from computeScore()
  bankableScore:  number;                    // 0–160, from calculateFicoSBSS()
  napScore:       number;                    // 0–100, from calculateNAPScore()

  // Dimension averages — SET from computeScore(), READ by all render functions
  dimAvg: {
    C: number;   // 0.00–1.00 (Credit Profile, weight 0.28)
    D: number;   // 0.00–1.00 (Documentation, weight 0.22)
    F: number;   // 0.00–1.00 (Cash Flow, weight 0.20)
    B: number;   // 0.00–1.00 (Banking Behavior, weight 0.13)
    S: number;   // 0.00–1.00 (Business Structure, weight 0.10)
    N: number;   // 0.00–1.00 (Narrative Strength, weight 0.07)
  };

  // Compliance — SET by toggleComp(), READ by getStatus() and renderAll()
  compDone: Set<number>;   // IDs of completed compliance items (1–20)

  // Projected score — SET by simulateAction(), READ by action plan display
  projectedScore: number | null;   // null = no active simulation
  projectedDimAvg: typeof dimAvg | null;

  // Source tracking — for display labels
  scoreSource: 'assessment' | 'bss_seed' | 'preliminary';
  lastUpdated: Date | null;
}

INITIAL STATE (before any assessment):
  fundScore: 0
  bankableScore: 80   (baseline — calculateFicoSBSS() default for new business)
  napScore: 0
  dimAvg: { C:0.5, D:0.5, F:0.5, B:0.5, S:0.5, N:0.5 }   (neutral defaults)
  compDone: new Set()
  projectedScore: null
  scoreSource: 'preliminary'
  lastUpdated: null

AFTER BSS STEPS 1–3 COMPLETE (before assessment):
  fundScore: [calculated from BSS seeds — see 14B]
  bankableScore: [from calculateFicoSBSS(bssData)]
  napScore: [from calculateNAPScore(bssData)]
  dimAvg: [from bssToSeedDimAvg(bssData) — see 14B]
  scoreSource: 'bss_seed'

AFTER FULL ASSESSMENT COMPLETES:
  fundScore: [from computeScore(answers, QUESTIONS, bssSeeds)]
  dimAvg: [real per-dimension averages from computeScore()]
  scoreSource: 'assessment'
  lastUpdated: new Date()

──────────────────────────────────────────────────────────────────────────────
14B — BSS → DIMENSION SEED PIPELINE (THE MISSING CONNECTION)
──────────────────────────────────────────────────────────────────────────────

This function runs immediately after BSS Step 3 is submitted.
It converts BSS structured data into preliminary dimension scores.
These scores are REAL — not estimates. They are the same values that would
result from answering the pre-filled assessment questions.

// bssToSeedDimAvg.ts
function bssToSeedDimAvg(bss: BSSData): DimAvg {
  const seeds: Record<string, number[]> = { C:[], D:[], F:[], B:[], S:[], N:[] };

  // ── CREDIT PROFILE (C) — from Step 3 ──────────────────────────────────
  // Composite credit score → maps to Q0 score value
  const compositeScore = Math.round((bss.experian + bss.transunion + bss.equifax) / 3);
  const creditScoreSeed =
    compositeScore < 580 ? 0.05 :
    compositeScore < 620 ? 0.20 :
    compositeScore < 650 ? 0.40 :
    compositeScore < 700 ? 0.60 :
    compositeScore < 740 ? 0.78 : 1.00;
  seeds.C.push(creditScoreSeed);

  // Credit utilization slider → maps to Q1 score value
  const utilSeed =
    bss.utilization < 20 ? 1.00 :
    bss.utilization < 30 ? 0.75 :
    bss.utilization < 50 ? 0.45 : 0.10;
  seeds.C.push(utilSeed);

  // Derogatory checkboxes → maps to Q2 score value
  const derogSeed =
    bss.noDerogItems ? 1.00 :
    bss.hasLatePay60 || bss.hasCollections ? (bss.bankruptcyAge === 'under2' ? 0.20 : 0.40) :
    bss.hasChargeOffs ? 0.20 : 0.60;
  seeds.C.push(derogSeed);

  // ── CASH FLOW (F) — from Step 2 ───────────────────────────────────────
  // Monthly revenue slider → maps to Q8 score value
  const revSeed =
    bss.monthlyRevenue < 3000  ? 0.10 :
    bss.monthlyRevenue < 8000  ? 0.30 :
    bss.monthlyRevenue < 20000 ? 0.55 :
    bss.monthlyRevenue < 50000 ? 0.78 : 1.00;
  seeds.F.push(revSeed);

  // ── BANKING BEHAVIOR (B) — from Step 2 ────────────────────────────────
  // NSF/overdraft → maps to Q12 score value
  const nsfSeed =
    bss.nsfCount === 'zero'  ? 1.00 :
    bss.nsfCount === '1_2'   ? 0.65 :
    bss.nsfCount === '3_5'   ? 0.25 : 0.00;
  seeds.B.push(nsfSeed);

  // Average daily balance → maps to Q13 score value
  const balSeed =
    bss.avgBalance === 'near_zero' ? 0.00 :
    bss.avgBalance === '500_2k'    ? 0.25 :
    bss.avgBalance === '2k_10k'    ? 0.55 :
    bss.avgBalance === '10k_25k'   ? 0.80 : 1.00;
  seeds.B.push(balSeed);

  // Fund separation → maps to Q14 score value
  const sepSeed =
    bss.bankAccount === 'yes_dedicated' ? 1.00 :
    bss.bankAccount === 'yes_personal'  ? 0.50 : 0.00;
  seeds.B.push(sepSeed);

  // ── BUSINESS STRUCTURE (S) — from Steps 1 & 2 ─────────────────────────
  // Entity type → maps to Q16 score value
  const entitySeed =
    bss.entityType === 'sole_prop'  ? 0.10 :
    bss.entityType === 'llc_single' ? 0.65 :
    bss.entityType === 'llc_multi'  ? 0.78 : 1.00;
  seeds.S.push(entitySeed);

  // Business age (calculated from start date) → maps to Q17 score value
  const ageMonths = monthsSince(bss.startDate);
  const ageSeed =
    ageMonths < 6   ? 0.05 :
    ageMonths < 12  ? 0.25 :
    ageMonths < 24  ? 0.55 :
    ageMonths < 60  ? 0.85 : 1.00;
  seeds.S.push(ageSeed);

  // Industry → maps to Q18 score value
  const industrySeed =
    bss.industry === 'professional_tech_health' ? 1.00 :
    bss.industry === 'retail_ecomm'             ? 0.85 :
    bss.industry === 'construction_re'          ? 0.65 :
    bss.industry === 'restaurant_food'          ? 0.40 :
    bss.industry === 'transport'                ? 0.50 : 0.70;
  seeds.S.push(industrySeed);

  // ── DOCUMENTATION (D) — NOT seeded from BSS ───────────────────────────
  // D is intentionally left at neutral 0.5 until Q4–Q7 are answered.
  // BSS collects document status in Step 2 optional section but this
  // is NOT sufficient for D dimension scoring — assessment Q4–Q7 required.
  seeds.D.push(0.50);   // neutral placeholder only

  // ── NARRATIVE (N) — NOT seeded from BSS ───────────────────────────────
  // N cannot be seeded from structured data. Assessment Q20–Q23 required.
  seeds.N.push(0.50);   // neutral placeholder only

  // ── COMPUTE PRELIMINARY FUNDSCORE™ ────────────────────────────────────
  const WEIGHTS = { C: 0.28, D: 0.22, F: 0.20, B: 0.13, S: 0.10, N: 0.07 };
  const dimAvg: Record<string, number> = {};
  Object.keys(seeds).forEach(d => {
    const vals = seeds[d];
    dimAvg[d] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  let base = 0;
  Object.entries(WEIGHTS).forEach(([d, w]) => { base += (dimAvg[d] || 0.5) * w; });
  const prelimScore = Math.max(0, Math.min(1000, Math.round(base * 1000)));

  return { dimAvg, prelimScore };
}

NOTE ON D AND N NEUTRAL SEEDS:
  D (Documentation) defaulting to 0.50 means the preliminary score
  assumes average documentation — it will move up or down when Q4–Q7 are
  answered. If the user has already indicated doc status in BSS Step 3
  optional section (bank statements, tax returns), those CAN seed D but
  only at 0.5 weight (1 data point vs 4 questions).
  This must be shown transparently in the transition screen callout.

──────────────────────────────────────────────────────────────────────────────
14C — MERGED computeScore() WITH BSS SEEDS
──────────────────────────────────────────────────────────────────────────────

The final computeScore() after the 24-question assessment merges BSS seeds
with assessment answers. BSS seeds count as 1 additional data point per seeded
dimension, then assessment answers add their values to the same bucket.

// engine.ts — unified version
export function computeScore(
  answers: (number | undefined)[],
  questions: Question[],
  bssSeeds?: Partial<Record<'C'|'D'|'F'|'B'|'S'|'N', number>>
) {
  const WEIGHTS = { C:0.28, D:0.22, F:0.20, B:0.13, S:0.10, N:0.07 };
  const dimBuckets: Record<string, number[]> = { C:[], D:[], F:[], B:[], S:[], N:[] };
  let totalBoost = 0;

  // STEP 1: Inject BSS seeds first (each counts as 1 data point)
  if (bssSeeds) {
    Object.entries(bssSeeds).forEach(([dim, val]) => {
      if (val !== undefined && dimBuckets[dim]) {
        dimBuckets[dim].push(val);
      }
    });
  }

  // STEP 2: Add 24 assessment answers on top of seeds
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

  // STEP 3: Average each dimension
  const dimAvg: Record<string, number> = {};
  Object.entries(dimBuckets).forEach(([d, vals]) => {
    dimAvg[d] = vals.length
      ? vals.reduce((a, b) => a + b, 0) / vals.length
      : 0.50;
  });

  // STEP 4: Weighted composite → 0–1000 with boost cap
  let base = 0;
  Object.entries(WEIGHTS).forEach(([d, w]) => {
    base += (dimAvg[d] || 0) * w;
  });
  const score = Math.max(0, Math.min(1000,
    Math.round(base * 1000 + Math.min(totalBoost, 80))
  ));

  return { score, dimAvg };
}

──────────────────────────────────────────────────────────────────────────────
14D — LIVE SCORE DISPLAY: EVERY SCREEN, EVERY STATE
──────────────────────────────────────────────────────────────────────────────

FUNDSCORE™ NUMBER DISPLAY — UNIVERSAL RULES:
  Font:        Syne 800
  Color:       ALWAYS the band color from getBand(score):
               0–399: #b04428 · 400–549: #c89020 · 550–649: #a0a020
               650–749: #38a880 · 750–899: #8ab820 · 900–1000: #c8f040
  Never:       Use a static color. Never show in white or text-primary.
  Transition:  color property transitions: 0.4s ease on color changes.

SCORE METER BAR — UNIVERSAL RULES:
  Track:       bg var(--border-subtle) or #2a2e22, height 6px sidebar / 10px results / 12px hero
  Fill:        linear-gradient(90deg, var(--primary-hover), var(--primary))
               OR solid band color when showing individual dimension bars
  Width:       (score / 1000) * 100 + '%' for FundScore™ bars
               (bankable / 160) * 100 + '%' for Bankable Score bars
               (dimAvg[key] * 100) + '%' for dimension bars
  Animation:   transition: width 1200ms cubic-bezier(0.16, 1, 0.3, 1)
  Initial:     width: 0% (all bars start at zero and animate to value on mount)

──── SCREEN: BSS STEP 2 — STICKY LIVE SCORE BAR ────────────────────────────

Position: fixed bottom 0, full width, z-index 100
bg: var(--bg-surface-1), border-top: 1px solid var(--border-subtle), height: 52px

LEFT (padding-left 24px):
  "PROJECTED FUNDSCORE™" — DM Sans 400 10px UPPERCASE var(--text-muted), letter-spacing 0.12em

CENTER:
  Score number: "[XXX]" — Syne 800 28px, band-colored, updates live
  Score label: "preliminary" — DM Sans 300 11px var(--text-muted), margin-left 8px

RIGHT (padding-right 24px):
  "[X] programs pre-qualified" — DM Sans 400 12px var(--primary) (live count)
  Updates every time a field is changed.

SCORE UPDATE TRIGGER during BSS Step 2:
  Every onChange event on every field calls recalcPrelimScore():
    Pull current field values from form state
    Run bssToSeedDimAvg() with partial data (handle undefined fields with 0.5)
    Update sticky bar score + color + program count
  This is a lightweight re-calculation — not the full computeScore()
  Animation on score number update:
    Framer Motion: animate={{ scale: [1, 1.05, 1] }} triggered on value change
    Duration: 300ms — subtle pulse, not dramatic

──── SCREEN: BSS STEP 3 — STICKY LIVE SCORE BAR ────────────────────────────

Same sticky bar spec as Step 2.
Updates on every credit score slider move, utilization change, derogatory toggle.
Credit score composite (middle of 3) is used for seed.
Score updates with each slider drag (throttle to 50ms for performance).

CREDIT SCORE SLIDER — LIVE PRODUCT THRESHOLD VISUALIZATION:
  As user drags FICO slider, show a vertical tick mark on the score meter bar
  in the sticky bottom showing which product thresholds they're crossing.
  When score crosses 580: small lime tick + "SBA Floor" appears/animates
  When score crosses 620: small lime tick + "Alt-Lenders" appears
  When score crosses 650: small lime tick + "Credit Lines" appears
  When score crosses 700: small lime tick + "SBA 7(a)" appears
  When score crosses 720: small lime tick + "Best Rates" appears
  Ticks: 2px wide, 14px tall, colored lime, label DM Sans 300 10px muted
  Below the product threshold visualization only — not on main assessment.

──── SCREEN: TRANSITION (BSS → ASSESSMENT) — PRELIMINARY SCORE ──────────────

Uses preliminary score from bssToSeedDimAvg(bssData).
Score counter: Framer Motion useSpring(0, { stiffness: 40, damping: 12 })
animates to prelimScore over ~1000ms on screen mount.
Band color transitions as counter rises: live color interpolation.
Score meter fills simultaneously.

IMPORTANT — ACCURACY DISCLOSURE (shown below score, always):
  "Based on your intake data. Your final score may be higher once you
   complete the 24-question assessment — Documentation and Narrative
   dimensions are still unscored."
  DM Sans 300 13px var(--text-muted)
  This is accurate because D and N are seeded at 0.50 until assessment.

──── SCREEN: ASSESSMENT QUESTIONS — RUNNING SCORE INDICATOR ─────────────────

During the 24-question assessment, show a small score estimate in the
progress bar area — NOT a full score display, just a live indicator.

POSITION: Right side of the global progress bar sticky area
  Score estimate: "[XXX]*" — Syne 700 18px band-colored
  Asterisk note: "provisional" — DM Sans 300 10px var(--text-muted)
  Updates every time user selects an option (before hitting Continue)

BEHAVIOR:
  After each answer selection: run a fast computeScore() pass on all
  answered questions + current BSS seeds → update the indicator.
  This gives the user real-time feedback that their answers are moving
  their score. Psychologically reinforces engagement.
  Do NOT show the indicator until at least 4 questions answered.
  Animation: same pulse as sticky bar (scale 1→1.05→1, 300ms).

──── SCREEN: LOADING (between Q24 and results) ──────────────────────────────

Full-screen. The loading period is 1800ms.
During this time, the FINAL computeScore() runs with all answers + BSS seeds.
Score is calculated but NOT displayed yet.
Loading animation shows 3 lines cycling — see Part 8.
Do NOT show score during loading — the reveal is the payoff.

──── SCREEN: RESULTS — FUNDSCORE™ HERO ANIMATION ────────────────────────────

ANIMATION SEQUENCE (all timing from mount):
  t=0ms:       Score label "YOUR FUNDSCORE™" fades in (opacity 0→1, 300ms)
  t=300ms:     Score counter begins: useSpring(0, { stiffness:40, damping:12 })
               animates 0 → finalScore. At stiffness:40 damping:12, this takes
               ~1400ms to settle. The number displayed is Math.round(spring.current).
  t=300ms:     Color begins transitioning through band colors in real-time
               as the spring value rises through each band threshold.
               Below 400: #b04428
               Crosses 400: transitions to #c89020 (4s ease)
               Crosses 550: transitions to #a0a020
               Crosses 650: transitions to #38a880
               Crosses 750: transitions to #8ab820
               Crosses 900: transitions to #c8f040
               This is achieved by computing band color from Math.round(spring.current)
               on every animation frame, not by transitions on the color property.
  t=500ms:     Score meter bar begins filling: width 0 → (finalScore/10)%
               transition: 1200ms cubic-bezier(0.16,1,0.3,1)
  t=1700ms:    (after counter settles) Band label fades in: opacity 0→1, translateY 8→0
               200ms ease
  t=1900ms:    6 dimension bars begin staggered fill:
               Each bar: width 0 → dimAvg[key]*100%, 1000ms cubic-bezier(0.16,1,0.3,1)
               Stagger: 80ms between each bar (C=0ms, D=80ms, F=160ms, B=240ms, S=320ms, N=400ms)
  t=2700ms:    Quick stats boxes appear: stagger opacity 0→1 + translateY 16→0
               80ms between boxes
  t=3000ms:    Action plan items stagger in: opacity 0→1, 60ms between each card
  t=3500ms:    Compliance dot grid animates in: stagger scale 0→1, 30ms per dot
  t=4500ms:    Main CTA button appears: opacity 0→1, scale 0.95→1, 300ms

BANKABLE SCORE ANIMATION (right column of results hero):
  Begins t=400ms (100ms after FundScore™ counter starts)
  Same useSpring but animates 0 → bankableScore (0–160 scale)
  Band color from bankable score bands (see Part 3)
  Fill bar: 0 → (bankableScore/160)*100%, same timing as FundScore™ meter

──────────────────────────────────────────────────────────────────────────────
14E — LIVE COMPLIANCE → SCORE IMPACT (EXISTING LOGIC ENHANCED)
──────────────────────────────────────────────────────────────────────────────

The existing toggleComp(id) → renderAll() chain is correct but needs these
enhancements in the unified system:

WHEN A COMPLIANCE ITEM IS CHECKED:
  1. compDone.add(id) — same as current
  2. Re-run getStatus(product) for ALL 17 products — same as current
  3. RE-RUN renderProducts() with new statuses — same as current
  4. NEW: Show a transient score impact notification:
     Position: fixed top-right, z-index 200
     bg: var(--primary-alpha), border: 1px solid var(--primary)
     padding: 12px 16px, br: 0
     Content: "✓ [Item Name] complete — [X] products updated"
     DM Sans 400 14px var(--text-secondary)
     Auto-dismiss: 3 seconds, slide out to right (Framer: x: 0 → 300px, opacity 1→0)

  5. NEW: If checking this item changes a product from 'approaching' to 'unlocked':
     Show a PRODUCT UNLOCK NOTIFICATION:
     bg: var(--primary), color: #000
     "[Product Name] is now Pre-Qualified!"
     Syne 700 16px, padding: 16px 24px
     Stays visible for 5 seconds. Includes "View →" link to that product card.

WHEN A COMPLIANCE ITEM IS UNCHECKED:
  1. compDone.delete(id) — same as current
  2. Re-run getStatus() for all products
  3. If a product drops from 'unlocked' to 'approaching':
     amber notification: "[Product Name] moved to Approaching — item #[X] needed"

COMPLIANCE ITEM GAP ANALYSIS — ENHANCED DISPLAY:
  Current system shows: "3 compliance items missing" + pill per missing item
  Enhanced: sort missing items by ease of completion (quick wins first):
    Show missing items in this order: quick → medium → long-term
    Each pill now includes time estimate:
      "#5: Business Phone Number — Quick Win (< 7 days)"
      "#15: D&B DUNS Number — 30–60 days"
    Pill color: quick=amber, medium=#c87020, long-term=#b04428

──────────────────────────────────────────────────────────────────────────────
14F — ACTION PLAN PROJECTED SCORE (SIMULATION MODE)
──────────────────────────────────────────────────────────────────────────────

Each action card in the results page and dashboard has a "Simulate Impact"
interaction. When activated, it shows a projected score WITH that action complete.

SIMULATE BUTTON on action card:
  Position: right side of action card, inline with the pts pill
  Label: "See Score Impact →" — DM Sans 400 12px var(--primary)
  OR on hover of pts pill, it becomes clickable.

WHEN SIMULATING:
  1. Take current dimAvg
  2. Apply the action's expected improvement to the relevant dimension:
     "Upload 12mo bank statements" → D: +0.30 (additive to current D dimAvg)
     "Pull credit / dispute errors" → C: +0.15 to +0.30 range (show as range)
     "Form LLC / open business account" → S: +0.40, B: +0.25
     "Prepare P&L" → D: +0.20
     "Register D&B DUNS" → C: +0.10
     "Build average daily balance" → B: +0.25
     "Write use-of-funds statement" → N: +0.30
     "Reduce utilization below 30%" → C: +0.20
  3. Re-run weighted composite with adjusted dimAvg
  4. Show projected score in a comparison display:

  COMPARISON DISPLAY (appears in place of action card body on simulate):
    "Current: [XXX]" → "[→]" → "Projected: [YYY]" → "[+ZZ pts]"
    Syne 800 for numbers, band-colored each
    Framer: animate the projected number with spring from current to projected (600ms)
    DIM DELTA: small bar showing which dimension moved and by how much
    Close: "× Reset" ghost button — returns to normal action card

  IMPORTANT: "Simulate" is visual only — it does NOT update the stored score.
  The stored fundScore only updates when a new assessment is completed.

──────────────────────────────────────────────────────────────────────────────
14G — SCORE DISPLAY IN DASHBOARD SIDEBAR (ENHANCED EXISTING)
──────────────────────────────────────────────────────────────────────────────

The current sidebar has:
  ✓ score-number-big (52px) with live color from getBand()
  ✓ score-band (italic) with band name
  ✓ score-track-fill with width transition 1s
  ✓ dim-bar-row for each of 6 dimensions
  ✓ comp-dot grid (20 dots)
  ✓ elig-badge summary (X unlocked · X approaching · X locked)

CHANGES FROM CURRENT TO UNIFIED:
  1. Score number: keep 52px Syne 800, change from --lime to band-colored dynamic.
     Current: color: var(--lime) hardcoded. Change to: color: getBand(score).color
     transition: color 0.4s ease

  2. Dimension bars: remove FIXED_DIM * (currentScore/624) formula.
     Replace with real dimAvg[key] * 100 from state.
     Each bar: width = (dimAvg[d.key] * 100) + '%'

  3. Add BANKABLE SCORE below FundScore™ in sidebar:
     Same sidebar card, below the score meter:
     Separator: 1px var(--border-subtle)
     "BANKABLE SCORE" label — DM Sans 400 9px UPPERCASE var(--text-muted)
     "[bankable]/160" — Syne 700 20px band-colored
     Mini bar: same spec, fills to (bankable/160)*100%, bg var(--primary)

  4. Score source indicator below band name:
     IF scoreSource === 'assessment': lime dot + "Last assessment: [date]" — DM Sans 300 11px muted
     IF scoreSource === 'bss_seed': amber dot + "Intake data only — complete assessment" — DM Sans 300 11px
     IF scoreSource === 'preliminary': muted dot + "Estimated" — DM Sans 300 11px

  5. KEEP the dev slider (updateScore range input) — feature-flagged:
     Only renders if URL contains ?debug=true
     In production: hidden. In demo/dev: visible.

──────────────────────────────────────────────────────────────────────────────
14H — SCORING DISPLAY IN FIGMA (WHAT TO DESIGN)
──────────────────────────────────────────────────────────────────────────────

These are the exact frames and component states to design for the live scoring
system. This is what "dynamic scoring logic and display" means in Figma:

FRAME: Score_Number_Component (all 6 band states):
  Band 1: 412 in #b04428 — "Critical — Rebuild Required"
  Band 2: 487 in #c89020 — "Low — Foundation Gaps"
  Band 3: 621 in #a0a020 — "Developing — Momentum Building"
  Band 4: 698 in #38a880 — "Approaching — Lender Qualified"
  Band 5: 812 in #8ab820 — "Lender Ready"
  Band 6: 947 in #c8f040 — "Prime — Best-Rate Access"
  Show each at sidebar size (52px), results hero size (120px), and chip size (18px).

FRAME: Score_Meter_States (all stages):
  State 1: 0% fill (loading / pre-assessment)
  State 2: 41.2% fill, band 1 color
  State 3: 62.1% fill, band 3 color (mid-animation frame)
  State 4: 81.2% fill, band 5 color (settled)

FRAME: DimBar_All6_States:
  6 dimension bars with correct weights labeled.
  Show at three score scenarios:
    Scenario A: all dims at ~50% (neutral/unstarted)
    Scenario B: C=72%, D=44%, F=65%, B=38%, S=82%, N=58% (weak banking)
    Scenario C: C=88%, D=91%, F=78%, B=82%, S=90%, N=71% (near-prime)
  Each bar: dim label (130px min-width), weight tag, track + fill, percentage
  Color: dim's assigned color from DIM_DATA

FRAME: Sticky_LiveScore_Bar:
  State 1: "—" with muted color (no data yet)
  State 2: "412*" in #b04428 + "1 program pre-qualified"
  State 3: "624*" in #a0a020 + "4 programs pre-qualified"
  State 4: "786*" in #8ab820 + "9 programs pre-qualified"

FRAME: Score_Transition_Counter (animation storyboard):
  Frame 1: "000" — counter starting
  Frame 2: "142" — mid-count, band 1 color
  Frame 3: "487" — crosses band 2 threshold
  Frame 4: "621" — final score, band 3 color, settled
  Arrow between frames showing the spring animation path.

FRAME: Compliance_Toggle_Impact:
  State 1: Product card as "Approaching" (amber border, +47 pts pill)
  State 2: User checks compliance item #5
  State 3: Notification appears top-right: "✓ Business Phone complete — 2 products updated"
  State 4: Product card transitions to "Pre-Qualified" (lime border, ✓ pre-qual badge)
  Show this as a 4-state storyboard — these are the interaction states to spec.

FRAME: Simulate_Score_Impact:
  State 1: Action card default (rank + title + pts pill + why text)
  State 2: Hover on pts pill → "See Score Impact →" appears
  State 3: Simulate active — comparison display:
    "Current: 624" → "→" → "Projected: 666" → "+42 pts"
    D dimension bar highlighted with delta (+0.30)
  State 4: Sim dismissed, back to default

FRAME: Score_Source_Indicator (3 states):
  State 1: amber dot + "Intake data only — complete assessment to sharpen"
  State 2: lime dot + "Last assessment: March 5, 2026"
  State 3: muted dot + "Estimated — no assessment started"

════════════════════════════════════════════════════════════════════════════════
PART 15 — WHAT GETS UPDATED IN THE EXISTING SYSTEM
════════════════════════════════════════════════════════════════════════════════

This prompt is an UPDATE to the existing Business Success Scan + FundScore™
integration. Below is the exact list of what changes, what stays, and what
connects to what. Use this as your implementation checklist.

──────────────────────────────────────────────────────────────────────────────
WHAT STAYS — DO NOT CHANGE THESE
──────────────────────────────────────────────────────────────────────────────

  ✓ All 17 product definitions (id, name, range, rate, speed, minScore, compReq, desc)
    KEEP EXACTLY. Do not change a single minScore or compReq value.

  ✓ All 20 compliance items (id, name, desc, time classification)
    KEEP EXACTLY.

  ✓ getStatus(product, score, compDone) logic:
    unlocked = score >= minScore AND all compReq in compDone
    approaching = gap <= 80 pts AND missing <= 3 items
    locked = everything else
    KEEP EXACTLY.

  ✓ getBand(score) thresholds and band names
    KEEP EXACTLY.

  ✓ renderCompliance() — toggle behavior, time tags, click handlers
    KEEP. Enhance with compliance impact notification (Part 14E).

  ✓ calculateFicoSBSS() and calculateNAPScore() functions
    KEEP. They run from businessData.ts. Do not modify their logic.

  ✓ syncScanDataToAuditItems() and updateBusinessProfile()
    KEEP. Called after assessment on results page load.

  ✓ localStorage data keys:
    'bss_step1', 'bss_step2', 'bss_step3'
    KEEP. Add: 'fundscore_answers', 'unified_score_state'.

  ✓ Route structure:
    /business-success-scan, /step-2, /step-3, /results
    ADD: /fundscore (transition screen), update /results for unified output.

  ✓ Test data buttons on all 3 BSS steps
    KEEP. Add test data population for fundscore_answers as well.

──────────────────────────────────────────────────────────────────────────────
WHAT CHANGES — THESE ARE THE UPDATES
──────────────────────────────────────────────────────────────────────────────

  CHANGE 1: FIXED_DIM → real dimAvg from computeScore()
    File: everywhere FIXED_DIM is used
    Replace: FIXED_DIM[d.key] * (currentScore/624)
    With: dimAvg[d.key] * 100

  CHANGE 2: score number color → band-colored dynamic
    File: renderSidebar(), score-number-big, all score displays
    Replace: color: var(--lime)
    With: color: getBand(currentScore).color + transition: color 0.4s ease

  CHANGE 3: Score counter animation → useSpring
    File: showResults() in fundscore-no-integration
    Replace: setInterval counter
    With: Framer Motion useSpring(0, { stiffness:40, damping:12 }) → displayValue

  CHANGE 4: computeScore() → accepts bssSeeds parameter
    File: engine.ts / computeScore function
    Add: optional bssSeeds param, inject into dimBuckets first (see Part 14C)

  CHANGE 5: Results page → dual score hero
    File: Results_NEW.tsx / results page
    Add: Bankable Score column alongside FundScore™ column (see Part 9)

  CHANGE 6: Results page → 4-tab product display
    File: Results_NEW.tsx
    Replace: current 3-tier BSS display
    With: 4-tab (Pre-Qualified / Likely Qualified / Approaching / Not Pre-Qual)
    Merge logic: see Part 10, Step 5

  CHANGE 7: renderProducts() → adds reasoning text per card
    File: renderProducts()
    Add: specific reasoning paragraph showing which checks passed/failed
    Format: "✓ Score [X] meets [Y] minimum · ✓ [X] of [Y] compliance items done · ✗ Need [Z]"

  CHANGE 8: Add BSS → assessment transition screen
    File: NEW page at /business-success-scan/fundscore
    Content: preliminary score from bssToSeedDimAvg(), why 24 questions, CTA

  CHANGE 9: Add sticky live score bar to BSS Steps 2 and 3
    File: Step2.tsx, Step3.tsx
    Add: fixed bottom bar, recalcPrelimScore() on every field change

  CHANGE 10: Add pre-fill logic to assessment questions
    File: fundscore assessment page
    Add: check bssData for pre-fillable fields, auto-select option, show pre-fill banner

  CHANGE 11: Add compliance toggle impact notifications
    File: toggleComp() function
    Add: transient notifications + product unlock celebration (see Part 14E)

  CHANGE 12: Add score simulation to action cards
    File: action plan render function
    Add: "See Score Impact" interaction + comparison display (see Part 14F)

  CHANGE 13: Add score source indicator to sidebar
    File: renderSidebar()
    Add: source dot + label below band name (see Part 14G)

  CHANGE 14: Update BSS results to sync into unified state
    File: results page load sequence
    Follow: 9-step execution order in Part 10

──────────────────────────────────────────────────────────────────────────────
WHAT IS NEW — DOES NOT EXIST YET
──────────────────────────────────────────────────────────────────────────────

  NEW 1: bssToSeedDimAvg() function (Part 14B)
    Maps all BSS field values to preliminary dimAvg for C, F, B, S dimensions.
    Returns both dimAvg and prelimScore.

  NEW 2: UnifiedScoreState context / store (Part 14A)
    Single source of truth for fundScore, bankableScore, dimAvg, compDone,
    projectedScore, scoreSource, lastUpdated.

  NEW 3: Transition screen (/business-success-scan/fundscore)
    Preliminary score reveal, 4 reason cards, 24q assessment entry.

  NEW 4: Assessment running score indicator in progress bar (Part 14D)
    Small provisional score "[XXX]*" in top right of progress bar during Q1–Q24.

  NEW 5: Score band color transition during counter animation (Part 14D)
    Real-time color change as spring value crosses band thresholds.

  NEW 6: Bankable Score in sidebar + results hero (Parts 9, 14G)
    Second score metric displayed alongside FundScore™ everywhere.

  NEW 7: Product unlock celebration notification (Part 14E)
    Full-width lime bar: "[Product] is now Pre-Qualified!" with 5-second dismiss.

  NEW 8: Score simulation on action cards (Part 14F)
    "See Score Impact" → comparison display with projected score spring animation.

  NEW 9: Compliance item gap pills sorted by ease + time estimate (Part 14E)
    Quick wins first, with time estimate in each pill.

════════════════════════════════════════════════════════════════════════════════
THIS IS THE COMPLETE UNIFIED SYSTEM.
Parts 1–13: Full design and flow specification.
Parts 14–15: Complete dynamic scoring logic, display spec, and update map.
Build exactly what is specified. Every interaction. Every animation.
Every data connection. Every screen state. Leave nothing vague.
════════════════════════════════════════════════════════════════════════════════
