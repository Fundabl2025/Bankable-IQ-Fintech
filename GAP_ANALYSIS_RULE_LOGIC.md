# Gap Analysis: Elon's Rule Logic Spec vs Current Implementation

## Overall Assessment: 65% Aligned

---

## Module 1: Assessment Engine

### Spec Requirements
| Field | Required | Current Status |
|-------|----------|----------------|
| entity_type | Yes | YES - entityType in UnifiedAnswers |
| time_in_business_months | Yes | YES - calculated from startDate |
| industry_type | Yes | YES - industry field |
| business_state | Yes | PARTIAL - businessState exists but optional |
| employee_count | No | NO - Not collected |
| annual_revenue_range | Yes | PARTIAL - monthlyRevenue only |
| monthly_revenue_consistency | Yes | NO - Not collected |
| average_monthly_deposits | Yes | PARTIAL - avgDailyBalance only |
| profitability_estimate | No | NO - Not collected |
| personal_credit_range | Yes | YES - 3 bureau scores |
| utilization_range | Yes | YES - utilization field |
| derogatories_flag | Yes | YES - multiple derog flags |
| inquiries_last_6_months | Yes | PARTIAL - inquiries30d only |
| revolving_accounts_count | No | NO - Not collected |
| tradelines_reporting | Yes | PARTIAL - bizCreditFile but no count |
| business_credit_file_exists | Yes | YES - bizCreditFile field |
| payment_history_indicator | No | NO - Not collected |
| EIN_exists | Yes | YES - hasEIN |
| business_bank_account | Yes | YES - bankAccount |
| tax_returns_available | Yes | YES - readinessAnswers[3] |
| PnL_available | Yes | YES - readinessAnswers |
| balance_sheet_available | Yes | YES - readinessAnswers |
| bank_statements_available | Yes | YES - implied by bank data |
| business_license_if_required | No | NO - Not collected |
| website | Yes | YES - hasWebsite |
| business_email | Yes | PARTIAL - ownerEmail but not business email |
| consistent_address | Yes | YES - NAP score computation |
| desired_funding_amount | No | NO - Not collected |
| funding_purpose | No | NO - Not collected |
| urgency_level | No | NO - Not collected |
| previous_denials | No | NO - Not collected |

**Gap Score: 70%** - Core signals captured, missing some optimization fields

---

## Module 2: FundScore Engine

### Spec Requirements
| Dimension | Spec Weight | Current Weight | Status |
|-----------|-------------|----------------|--------|
| Personal Credit | 20% | 28% (C bucket) | MISALIGNED |
| Business Credit | 10% | 10% (S bucket partial) | PARTIAL |
| Financial Capacity | 25% | 20% (F bucket) | MISALIGNED |
| Compliance Readiness | 20% | 22% (D bucket) | CLOSE |
| Stability | 15% | 10% (S bucket) | MISALIGNED |
| Lender File Completeness | 10% | 7% (N bucket) | MISALIGNED |

### Score Bands Comparison
| Spec Band | Spec Range | Current Band | Current Range | Status |
|-----------|------------|--------------|---------------|--------|
| High Risk | 0-499 | Critical/Low | 0-549 | CLOSE |
| Developing | 500-649 | Developing | 550-649 | CLOSE |
| Progressing | 650-799 | Approaching | 650-749 | MISALIGNED |
| Bankable Path | 800-899 | Ready | 750-899 | MISALIGNED |
| Prime | 900-1000 | Prime | 900-1000 | MATCH |

**Gap Score: 55%** - Dimension weighting needs realignment

---

## Module 3: Modeled Bankable Score (SBSS Proxy)

### Spec Requirements
| Variable | Spec Weight | Current Implementation | Status |
|----------|-------------|------------------------|--------|
| Personal Credit | 35% | ~50% | MISALIGNED |
| Business Financials | 30% | ~20% | MISALIGNED |
| Business Profile | 20% | ~20% | MATCH |
| Business Credit Reports | 15% | ~10% | MISALIGNED |

### Current Bankable Score Logic
```
Current: Baseline 80 + EIN(15) + Website(20) + Name(5) + Address(5) + Phone(5) + Bank(15) + BankAge(5) + Credit(10) + Entity(5) = max 165
```

### Spec Bankable Score Logic
```
Required: 
- Personal Credit Component: 35% × (normalized FICO 300-850 → 0-100)
- Business Financials: 30% × (revenue + bank rating + NSF + debt ratio)
- Business Profile: 20% × (industry risk + time in business + web + location)
- Business Credit: 15% × (tradelines + bureau depth + payment history)
```

**Gap Score: 45%** - Major refactor needed for SBSS weighting

---

## Module 4: Compliance Readiness Engine

### Spec: 20 items with severity tags
### Current: computeBankableItems returns ~20 items

| Severity Type | Spec | Current |
|---------------|------|---------|
| Hard Blocker | Yes | NO - Not tagged |
| Major Suppressor | Yes | NO - Not tagged |
| Optimization | Yes | NO - Not tagged |

**Gap Score: 60%** - Items exist, severity tagging missing

---

## Module 5: Funding Eligibility Matrix

### Spec Requirements
| Product | Spec Logic | Current Logic | Status |
|---------|------------|---------------|--------|
| MCA | revenue > 120k, deposits consistent | ccSales >= 5000, businessAge >= 3 | PARTIAL |
| Term Loan | FundScore > 700, revenue > 250k, TIB > 24mo | monthlyRev >= 10000, businessAge >= 6, credit >= 550 | MISALIGNED |
| SBA | BankableScore > 160, revenue > 500k, compliance > 80% | EIN, businessAge >= 24, credit >= 680, entity type | PARTIAL |

### Output Labels Comparison
| Spec Label | Current Label | Status |
|------------|---------------|--------|
| Available Now | High confidence + qualifies | MATCH |
| Likely with Minor Fixes | Medium confidence | PARTIAL |
| Approaching | Low confidence | NO |
| Locked | Not Eligible | MATCH |
| Not Recommended | Not implemented | NO |

**Gap Score: 65%** - Logic exists, thresholds need calibration

---

## Module 6: Optimization Roadmap Engine

### Spec Requirements
- Impact Score formula: approval_probability_gain × capital_unlock_amount ÷ time_to_fix
- Top 3 Actions Now
- 30/60/90 Day Plans
- Score lift projections
- Capital unlock projections

### Current Implementation
- workNeeded array in computeExtendedResults
- Basic action items without impact scoring
- No timeline structure (30/60/90)
- No projected score lift
- No capital unlock estimates

**Gap Score: 35%** - Major gap, needs full implementation

---

## PRIORITY FIXES

### P0 - Critical (Affects core value prop)
1. **Realign FundScore Weights** to spec (20/10/25/20/15/10)
2. **Refactor Bankable Score** to SBSS 35/30/20/15 weighting
3. **Add severity tagging** to compliance items (Hard Blocker / Suppressor / Optimization)

### P1 - High (Improves accuracy)
4. **Calibrate eligibility thresholds** per spec (MCA: 120k revenue, SBA: 500k + 160 SBSS)
5. **Align score bands** to spec ranges
6. **Add "Approaching" and "Not Recommended" labels**

### P2 - Medium (Enhances UX)
7. **Build Optimization Roadmap Engine** with impact scoring
8. **Add 30/60/90 day action structure**
9. **Add score lift and capital unlock projections**

### P3 - Low (Nice to have)
10. **Collect missing fields**: employee_count, revenue_consistency, funding_purpose, urgency
11. **Add tradeline count** (not just file exists)
12. **Add payment history indicator**

---

## RECOMMENDED APPROACH

1. **Phase 1**: Fix FundScore and Bankable Score weighting (engine.ts) - 2 hours
2. **Phase 2**: Add severity tagging to compliance items - 1 hour  
3. **Phase 3**: Calibrate eligibility thresholds (productEligibility.ts) - 1 hour
4. **Phase 4**: Build Optimization Roadmap Engine - 3 hours
5. **Phase 5**: Update Dashboard to show new data structure - 2 hours

Total estimated effort: 9 hours
