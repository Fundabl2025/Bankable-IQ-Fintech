# CREDITPATH_EVALS.md

## Purpose
This document defines how CreditPath quality is evaluated before and after implementation.

CreditPath is not approved to ship unless:
- deterministic outputs are stable
- trust language is compliant with product rules
- AI outputs stay inside guardrails
- the module behaves like a native FundReady system extension

## Eval Philosophy
CreditPath must be evaluated on:
1. logic correctness
2. trust correctness
3. behavioral clarity
4. architecture alignment
5. AI safety
6. monetization readiness
7. analytics visibility

## Required Eval Buckets
### A. Deterministic blocker extraction
Verify that the correct blockers appear from the correct inputs.

### B. Top-3 action ranking
Verify that only 3 actions show and that they are sensibly prioritized.

### C. Confidence-mode behavior
Verify that self-reported, uploaded, and connected modes produce correct disclosure and different precision levels.

### D. Milestone behavior
Verify that milestones are earned correctly and not overstated.

### E. Tool behavior
Verify calculators, generators, and trackers behave safely and clearly.

### F. AI output safety
Verify AI explanations stay aligned with deterministic logic and do not overclaim.

### G. Upgrade / preview behavior
Verify free vs paid previews feel coherent and trust-preserving.

## Eval Fixtures
Create at least these fixtures.

### Fixture 1 -- High Utilization, No Derogatories
Profile:
- self-reported score band mid-range
- utilization high
- no collections
- no bankruptcy
- no business tradelines

Expected:
- utilization blocker appears high or critical
- utilization paydown action ranks in top 3
- first step is tiny and clear
- capital language remains estimate-safe

### Fixture 2 -- Collection Present, Thin File
Profile:
- collection present
- weak depth
- no business tradelines

Expected:
- collection-related blocker appears
- business-depth blocker appears
- action list still limited to top 3
- dispute guidance remains careful and non-legal-advice framed

### Fixture 3 -- Bankruptcy Aging + Rebuild Needed
Profile:
- bankruptcy history
- weak positive history
- inquiry load moderate

Expected:
- no false promise of bankruptcy removal
- roadmap focuses on rebuild path
- timeline language remains realistic
- milestone logic still creates hope

### Fixture 4 -- Uploaded Report Mode
Profile:
- uploaded report exists
- parsed derogatory items confirmed

Expected:
- disclosures reference uploaded report basis
- simulator becomes more specific
- dispute workflow becomes more specific
- no guarantee language appears

### Fixture 5 -- Connected Monitoring Mode
Profile:
- live connected data exists
- recent delta available

Expected:
- progress analysis references synced data
- recurring analysis updates correctly
- no certainty overclaiming appears

### Fixture 6 -- Strong Profile, Few Issues
Profile:
- limited blockers
- stronger score range
- healthier utilization
- business credit depth present

Expected:
- CreditPath does not force excessive remediation
- roadmap stays short and relevant
- copy remains supportive and not fear-driven

## Forbidden Language Eval
CreditPath fails if any output includes:
- guaranteed
- certain approval
- exact lender outcome
- instant success
- everyone qualifies
- secret hack language
- shame-based language
- unsupported bureau certainty
- unsupported capital certainty

## Required Disclosure Eval
CreditPath fails if it:
- presents self-reported data as bureau-pulled data
- presents uploaded-report data as connected live data
- presents AI-generated disputes as legal advice
- presents estimated score or capital movement as guaranteed

## Behavioral Eval
CreditPath should pass only if:
- the user sees no more than 3 primary actions
- the first action feels easy to start
- the page answers:
  - what is this
  - why does it matter
  - what should I do next
  - what happens if I do it
- the product reduces overwhelm rather than increasing it

## Architecture Eval
CreditPath should fail if:
- it introduces duplicate scoring logic
- it introduces duplicate status logic
- it creates a disconnected route family that ignores current product patterns
- it places hidden business logic inside UI components
- it lets AI become the ranking source of truth

## Analytics Eval
CreditPath should define and later emit events for:
- view
- action started
- action completed
- tool usage
- upload started/completed
- AI opened
- letter generated
- simulator run
- milestone reached
- upgrade viewed
- upgrade started

CreditPath fails readiness if important actions are invisible.

## Manual Review Questions
Before approving a build, answer:
- Does this feel native to FundReady?
- Does it reduce shame?
- Does it preserve trust?
- Does it make the next action easier?
- Does it connect improvement to business capital without overclaiming?
- Does it remain clear about what is deterministic versus AI-assisted?

## Eval Readiness Gate
CreditPath must not move from docs into implementation until:
- fixtures are defined
- blocker categories are locked
- top-3 action logic is defined
- confidence-mode language is defined
- trust/failure cases are defined