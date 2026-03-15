# Elon's Vision vs. Current Build: Strategic Comparison

## Date: March 14, 2026

---

## EXECUTIVE SUMMARY

| Area | Elon's Vision | Current Build | Gap |
|------|---------------|---------------|-----|
| **Two-Score System** | FundScore (0-1000) + Bankable Score (0-160) | ✅ Both implemented | Minor calibration needed |
| **SBSS Weighting** | Personal 35%, Biz Financials 30%, Profile 20%, Credit 15% | ❌ Different weights | Needs alignment |
| **Timeline Intervals** | 30 → 60 → 90 → 120-180 days | ❌ Today → 30 → 90 → Long-term | Needs fix |
| **Data Labels** | VERIFIED / SELF-REPORTED / ESTIMATED | ❌ Not implemented | Critical gap |
| **Intelligence Loop** | Learns from funding outcomes | ❌ No database yet | Major gap |
| **Capital Narrative** | "Fundable → Bankable" journey | ⚠️ Partially there | Messaging needs work |

---

## 1. SCORING ARCHITECTURE

### Elon's Vision: FundScore (0-1000)

**Weighted Dimensions:**
| Dimension | Weight | Max Points |
|-----------|--------|------------|
| Personal Credit | 20% | 200 |
| Business Credit | 10% | 100 |
| Financial Capacity | 25% | 250 |
| Compliance Readiness | 20% | 200 |
| Stability | 15% | 150 |
| Lender File Completeness | 10% | 100 |

**Score Bands:**
| Score | Status |
|-------|--------|
| 0–499 | High Risk |
| 500–649 | Developing |
| 650–799 | Progressing |
| 800–899 | Bankable Path |
| 900–1000 | Prime |

### Current Build: FundScore

**Current Weights:**
| Dimension | Weight | Code Key |
|-----------|--------|----------|
| Credit Profile | 28% | C |
| Documentation | 22% | D |
| Cash Flow | 20% | F |
| Banking Behavior | 13% | B |
| Business Structure | 10% | S |
| Narrative Strength | 7% | N |

### GAP ANALYSIS - FundScore

**Problems:**
1. Dimension names don't match Elon's terminology
2. "Financial Capacity" (25%) is split between F (20%) and B (13%) = 33%
3. "Compliance Readiness" (20%) maps to D (22%) ≈ OK
4. "Stability" (15%) maps to S (10%) + partial N = needs adjustment
5. "Lender File Completeness" (10%) is embedded in D, not separate
6. Missing explicit "Business Credit" dimension (10%)

**Fix Required:** Re-map dimension weights to Elon's 6-category model.

---

## 2. BANKABLE SCORE (SBSS PROXY)

### Elon's Vision: 0-160 Scale

**SBSS Weighting:**
| Variable | Weight |
|----------|--------|
| Personal Credit | 35% |
| Business Financials | 30% |
| Business Profile | 20% |
| Business Credit Reports | 15% |

**Bands:**
| Score | Status |
|-------|--------|
| 0–159 | Non-bankable |
| 160–189 | Entry Bankable |
| 190–209 | Strong |
| 210–300 | Elite |

### Current Build: Bankable Score

**Current Calculation (from engine.ts):**
```
ownerCreditComponent = ((composite - 300) / 550) * 150  // 50% weight
businessCreditComponent = (bankableScore / 160) * 150   // 50% weight
sbssScore = ownerCreditComponent + businessCreditComponent
```

### GAP ANALYSIS - Bankable Score

**Problems:**
1. Current uses 50/50 split, Elon says 35/30/20/15
2. Missing "Business Financials" component (30%)
3. Missing "Business Profile" component (20%)
4. Current max is 300, Elon says 160 (different scales)

**Fix Required:** Recalculate SBSS to match 4-component weighted model.

---

## 3. TIMELINE INTERVALS

### Elon's Vision

| Milestone | Timeframe | What Happens |
|-----------|-----------|--------------|
| Today | Current | Current funding options |
| 30 days | +30 | Initial improvements (quick wins) |
| 60 days | +60 | Credit and compliance improvements |
| 90 days | +90 | Near bankable state |
| 120-180 days | +120-180 | Bankable threshold crossed |

**Key Quote:** "Typical timeline to bankability: 4-6 months"

### Current Build

| Milestone | Label |
|-----------|-------|
| Current | Today |
| +30 days | 30 Days |
| +90 days | 90 Days |
| +365 days | Long-Term |

### GAP ANALYSIS - Timeline

**Problems:**
1. Missing 60-day milestone
2. "Long-Term" is vague (365 days), Elon says 120-180 days for bankability
3. Current timeline doesn't map to credit reporting cycles

**Fix Required:** Change to 30 → 60 → 90 → 180 day intervals.

---

## 4. DATA LABELS (CRITICAL GAP)

### Elon's Vision

Every data point must have a truth label:

| Label | Meaning |
|-------|---------|
| **VERIFIED** | Confirmed by documentation or integration |
| **SELF-REPORTED** | User provided but not verified |
| **ESTIMATED** | Derived by the model |

**Example:**
```
Funding Today: $80K — Label: VERIFIED / Current Profile
Funding 90 Days: $350K — Label: ESTIMATED Projection
```

### Current Build

**No labels exist.** All data appears with equal authority.

### GAP ANALYSIS - Data Labels

**Critical Problem:** Users cannot distinguish between:
- What they verified (documents uploaded)
- What they claimed (self-reported answers)
- What we projected (model estimates)

**Fix Required:** Add `dataSource` field to all outputs.

---

## 5. INTELLIGENCE LOOP (MAJOR GAP)

### Elon's Vision

**Data Flywheel:**
```
More businesses use platform
→ more assessments completed
→ more funding attempts logged
→ more approval data captured
→ scoring accuracy improves
→ lender matches improve
→ forecasts improve
→ platform becomes more valuable
→ more businesses join
```

**Critical Tables Needed:**
- `funding_attempt` — User applies for funding
- `funding_outcome` — Approved/denied + amount + rate + denial reason
- `score_history` — Track score changes over time

### Current Build

**localStorage only.** No persistent storage. Cannot:
- Track funding outcomes
- Build predictive intelligence
- Learn from approvals/denials
- Create data moat

### GAP ANALYSIS - Intelligence Loop

**This is the biggest gap.** Without Supabase migration:
- No learning engine
- No outcome tracking
- No model calibration
- No competitive moat

**Fix Required:** Implement Supabase schema from strategic-process.md.

---

## 6. CAPITAL NARRATIVE

### Elon's Vision

**Two-System Framework:**

| System | Characteristics | Examples | Amounts |
|--------|-----------------|----------|---------|
| **Fundable** (Non-bankable) | High cost, short term, lower standards | MCA, factoring, credit stacking | $10K–$250K |
| **Bankable** | Low cost, long term, strict underwriting | SBA, bank loans, commercial RE | $250K–$5M+ |

**Strategic Message:**
> "FundReady turns businesses from fundable to bankable."
> "From expensive capital to bank capital."

### Current Build

**Partially implemented.** We show:
- Products eligible
- Tier potential vs. actual

**But we don't clearly say:**
- "You're currently in the FUNDABLE zone"
- "Here's your path to BANKABLE"
- "Bankable = 160+ SBSS threshold"

### GAP ANALYSIS - Narrative

**Missing:** Clear "Fundable → Bankable" journey visualization.

---

## 7. MODULE COVERAGE

### Elon's Six Modules

| Module | Purpose | Current Build Status |
|--------|---------|---------------------|
| 1. Assessment Engine | Collect signals | ✅ Implemented (24 questions) |
| 2. FundScore Engine | Capital readiness | ⚠️ Needs weight adjustment |
| 3. Bankable Score (SBSS) | Proximity to 160 threshold | ⚠️ Needs 4-component calc |
| 4. Compliance Engine | Identify blockers | ✅ Audit items implemented |
| 5. Eligibility Matrix | Product matching | ✅ 17 products, rule-based |
| 6. Optimization Roadmap | Improvement actions | ⚠️ Needs prioritization formula |

---

## 8. PRIORITY FIXES (ORDERED)

### P0 — Critical (Must Fix Now)

1. **Timeline Intervals**: Change to 30 → 60 → 90 → 180 days
2. **Data Labels**: Add VERIFIED/SELF-REPORTED/ESTIMATED to all outputs
3. **Capital Narrative**: Add explicit "Fundable → Bankable" journey language

### P1 — High Priority (Next Sprint)

4. **SBSS Calculation**: Implement 4-component weighted model (35/30/20/15)
5. **FundScore Weights**: Re-map to Elon's 6-dimension model
6. **Supabase Migration**: Enable intelligence loop

### P2 — Medium Priority (Following Sprint)

7. **Action Prioritization Formula**: `impact = approval_gain × capital_unlock ÷ time_to_fix`
8. **Score History Tracking**: Show progress over time
9. **Confidence Scoring**: Add confidence levels to projections

---

## 9. QUESTIONS FOR ELON

1. **Timeline Precision**: Is 30 → 60 → 90 → 180 correct, or should the last milestone be "120-180" as a range?

2. **Bankable Score Scale**: You mention 0-160 with 160 being the bankable threshold, but also mention "Elite" at 210-300. Should we use 0-160 or 0-300 scale?

3. **FundScore Bands**: Your bands go 0-499, 500-649, 650-799, 800-899, 900-1000. But current scoring produces different distributions. Should we calibrate to these exact bands?

4. **Data Flywheel Priority**: Given limited resources, should we prioritize Supabase migration for the intelligence loop, or first fix the scoring/timeline UI issues?

---

## ARCHIVE STATUS

This document compares Elon's complete vision (from strategic notes and Move 2/3 documentation) against the current FundReady build as of March 14, 2026.

**Next Action:** Address P0 fixes, then review with Elon before P1 implementation.
