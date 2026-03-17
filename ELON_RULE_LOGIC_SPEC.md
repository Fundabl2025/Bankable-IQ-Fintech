# ELON'S RULE LOGIC SPEC - Move 2: Six Core Modules

## Module 1: Assessment Engine Rule Logic

### Purpose
Collect the minimum signals required to compute FundScore, Bankable Score, Compliance Score, and Eligibility.

### Data Categories

**Business Identity**
- entity_type (LLC, S-Corp, C-Corp, Sole Prop)
- time_in_business_months
- industry_type
- business_state
- employee_count

**Revenue Capacity**
- annual_revenue_range
- monthly_revenue_consistency
- average_monthly_deposits
- profitability_estimate

**Owner Credit Signals**
- personal_credit_range
- utilization_range
- derogatories_flag
- inquiries_last_6_months
- revolving_accounts_count

**Business Credit Signals**
- tradelines_reporting
- business_credit_file_exists
- payment_history_indicator

**Compliance Signals**
- EIN_exists
- business_bank_account
- tax_returns_available
- PnL_available
- balance_sheet_available
- bank_statements_available
- business_license_if_required
- website
- business_email
- consistent_address

**Funding Intent**
- desired_funding_amount
- funding_purpose
- urgency_level
- previous_denials

### Rule Behavior
Each field produces a normalized signal score between 0–100.

Example:
```
time_in_business_score =
  0 if <6 months
  40 if 6–12 months
  70 if 12–24 months
  100 if >24 months
```

---

## Module 2: FundScore Engine Rule Logic

### Purpose
Measure overall capital readiness across the entire funding ecosystem.

### Score Range: 0–1000

### Weighted Dimensions
| Dimension | Weight |
|-----------|--------|
| Personal Credit | 20% |
| Business Credit | 10% |
| Financial Capacity | 25% |
| Compliance Readiness | 20% |
| Stability | 15% |
| Lender File Completeness | 10% |

### Personal Credit Score Calculation
Inputs: credit_range, utilization, inquiries, derogatories

```
credit_score_points:
  720+ = 100
  680–719 = 85
  640–679 = 70
  600–639 = 50
  <600 = 30

Utilization adjustment:
  <30% = +0
  30–50% = -10
  50–75% = -20
  >75% = -30

Derogatory penalty:
  none = 0
  minor = -15
  major = -40
```

Final normalized score → scaled to 200 points.

### Business Credit Score
Inputs: tradelines_reporting, bureau_file_exists, payment_history

```
0 tradelines = 20
1–2 tradelines = 50
3–5 tradelines = 80
6+ tradelines = 100
```

Payment history penalty applied. Scaled to 100 points.

### Financial Capacity Score
Inputs: revenue level, revenue stability, deposit consistency, profitability estimate

```
Revenue score:
  <50k = 20
  50k–150k = 40
  150k–500k = 70
  500k–1M = 85
  1M+ = 100
```

Deposit stability multiplier applied. Scaled to 250 points.

### Compliance Score
20 compliance items each worth 5 points (total 100, scaled to 200).

### Stability Score
```
<6 months = 10
6–12 months = 40
12–24 months = 70
24–60 months = 85
60+ months = 100
```

Scaled to 150 points.

### Lender File Completeness
Based on available documentation. Scaled to 100 points.

### FundScore Output Bands
| Score | Status |
|-------|--------|
| 0–499 | High Risk |
| 500–649 | Developing |
| 650–799 | Progressing |
| 800–899 | Bankable Path |
| 900–1000 | Prime |

---

## Module 3: Modeled Bankable Score (SBSS Proxy)

### Purpose
Estimate proximity to the SBSS bankability threshold of 160.

### Score Range: 0–300 (160 = bankable threshold)

### Weighting (aligned with SBSS)
| Variable | Weight |
|----------|--------|
| Personal Credit | 35% |
| Business Financials | 30% |
| Business Profile | 20% |
| Business Credit Reports | 15% |

### Bankable Score Bands
| Score | Status |
|-------|--------|
| 0–159 | Non-bankable |
| 160–189 | Entry Bankable |
| 190–209 | Strong |
| 210–300 | Elite |

---

## Module 4: Compliance Readiness Engine

### Purpose
Identify approval blockers.

### Categories
1. **Business Identity**: EIN, entity formation, good standing
2. **Operational Legitimacy**: business bank account, website, business email, consistent NAP
3. **Financial Documentation**: tax returns, bank statements, P&L, balance sheet
4. **Packaging**: use of funds clarity, ownership disclosure, debt summary

### Total items: 20

### Severity Rules
| Type | Meaning |
|------|---------|
| Hard Blocker | prevents most approvals |
| Major Suppressor | lowers approval odds |
| Optimization | improves pricing |

---

## Module 5: Funding Eligibility Matrix

### Products
- Business credit cards
- Revenue based funding
- MCA
- Equipment financing
- Term loans
- Business lines of credit
- SBA path
- Refinancing

### Eligibility Logic Examples

**MCA**
```
if revenue > 120k AND deposits consistent
then status = Available Now
```

**Term Loan**
```
if FundScore > 700 AND revenue > 250k AND time_in_business > 24 months
then status = Likely
```

**SBA**
```
if BankableScore > 160 AND revenue > 500k AND compliance_score > 80%
then status = Approaching
```

### Output Labels
- Available Now
- Likely with Minor Fixes
- Approaching
- Locked
- Not Recommended

---

## Module 6: Optimization Roadmap Engine

### Purpose
Generate the highest-impact improvement actions.

### Action Scoring Formula
```
Impact Score = approval_probability_gain × capital_unlock_amount ÷ time_to_fix
```

### Example Action
```yaml
action: Reduce utilization below 30%
impact: High
time: 14 days
score_lift: +60
capital_unlock: $100k–$300k
```

### Roadmap Structure
1. Top 3 Actions Now
2. 30-Day Plan
3. 60-Day Plan
4. 90-Day Plan

---

## The Three Questions

The system must answer clearly:
1. **Where do I stand today?**
2. **What is holding me back?**
3. **What unlocks the next level of capital?**
