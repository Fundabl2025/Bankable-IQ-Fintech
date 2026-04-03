# CREDITPATH_SCORING.md

## Purpose
This document defines the deterministic logic, ranking rules, milestone rules, estimate rules, and trust guardrails for CreditPath.

CreditPath is not a new scoring system.
It is a deterministic blocker-and-action engine that sits on top of existing FundReady assessment and readiness data.

## Core Rule
CreditPath must not create a second score that competes with:
- FundScore
- Bankable / SBSS-related logic
- existing readiness logic

CreditPath may introduce:
- blocker severity
- action rank
- milestone states
- confidence tiers
- estimate bands

It may not introduce a shadow score that fragments the system.

## Deterministic First
The following must be deterministic:
- blocker extraction
- severity assignment
- top-3 action selection
- milestone qualification
- confidence tier assignment
- free vs paid preview behavior

AI may explain these.
AI may not silently determine them.

## Credit Blocker Categories
CreditPath must support at least these categories:

### 1. Utilization
Examples:
- utilization above 30%
- utilization above 50%
- maxed or near-maxed revolving exposure

### 2. Derogatories
Examples:
- collections
- charge-offs
- severe late history
- public negative items

### 3. Bankruptcy / Public Records
Examples:
- active bankruptcy impact
- bankruptcy aging impact
- lien-related readiness issues

### 4. Inquiry Load
Examples:
- recent hard inquiry density
- excessive inquiry velocity

### 5. Thin File / Weak Positive History
Examples:
- not enough depth
- weak revolving mix
- weak installment mix
- no business tradelines

### 6. Business Credit Depth
Examples:
- no business credit file
- shallow tradeline depth
- weak commercial credit visibility

## Severity Model
Each blocker must have a deterministic severity:
- critical
- high
- medium
- low

Severity should be based on:
1. likely suppression of lender confidence
2. likely suppression of creditworthiness
3. time sensitivity
4. readiness relevance
5. whether the issue blocks broader progress

## Confidence Tiers
Every CreditPath output must declare its confidence tier.

### Confidence Tier 1 -- Self-reported
Based only on assessment answers or user-provided ranges.

Allowed phrasing:
- based on the information you reported
- estimated from your assessment
- current signal suggests
- likely improvement path

Disallowed phrasing:
- your actual bureau report shows
- this exact item is definitely reporting
- this is your exact bureau score

### Confidence Tier 2 -- Uploaded report
Based on uploaded report data that has been parsed and confirmed.

Allowed phrasing:
- based on the report you uploaded
- based on the items identified in your uploaded report
- estimated from your uploaded report details

Still disallowed:
- guaranteed outcomes
- exact lender outcomes

### Confidence Tier 3 -- Connected monitoring/API
Based on live or recently synced connected data.

Allowed phrasing:
- based on your connected credit data
- based on your latest synced report
- updated from your connected monitoring source

Still disallowed:
- guaranteed score changes
- guaranteed approvals
- exact lender certainty

## Top-3 Action Selection Logic
CreditPath must always show only the top 3 actions.

Ranking should consider:
1. blocker severity
2. estimated readiness impact
3. estimated time to result
4. ease of execution
5. whether the action unlocks other actions
6. whether the action fits current confidence tier

### Example ranking principles
- utilization paydown often ranks high because it is fast and high-impact
- disputing a collection may rank high if supported by uploaded or connected data
- opening first business tradeline may rank high if business credit depth is empty
- low-confidence assumptions should not outrank highly-supported blockers unless clearly framed

## Action Object Rules
Each action must include:
- title
- why it matters
- estimated effort
- estimated time to result
- estimated readiness impact
- estimated capital impact
- first small step
- completion method
- disclosure where needed

## Estimate Rules
### Score-related estimates
Allowed:
- estimated range
- likely range
- current signal suggests
- may improve by

Disallowed:
- exact increase
- guaranteed score change
- deterministic outcome language when based on self-reported data

### Capital-related estimates
Allowed:
- may unlock
- may strengthen access to
- may improve access to
- estimated capital path improvement
- estimated based on your current profile

Disallowed:
- will unlock
- guarantees access
- exact lender outcome
- exact funding certainty

## Milestone Model
CreditPath should define milestone states such as:
- started
- first action completed
- first blocker reduced
- utilization under 30%
- first derogatory resolved
- first business tradeline added
- approaching bankable
- bankable
- strong bankable

Milestones must be:
- visible
- understandable
- earned
- connected to action completion
- connected to emotional progress, not just math

## Progress Rules
Progress must be visible through:
- completed actions
- next milestone
- what changed
- what is unlocked next

Progress must not be exaggerated.
If nothing material has changed, say so honestly.

## Tool-Specific Logic Rules
### Utilization Payoff Calculator
Must calculate:
- current utilization
- target payoff amount to reach 30%
- optional stretch payoff to reach 10%

### Dispute Letter Workflow
Must require:
- item type
- reason
- source mode
- disclosure that it is assistance, not legal advice

### Inquiry Aging Tracker
Must estimate:
- aging windows
- likely drop-off timing
- confidence based on available data

### Business Tradeline Starter List
Must be educational and curated.
It must not imply guaranteed reporting outcomes or guaranteed score improvement.

## AI Explanation Guardrails
AI may explain:
- why a blocker matters
- why an action is ranked highly
- how a tool works
- how progress is changing

AI must not:
- invent a deterministic rank
- claim unseen bureau facts
- claim exact lender logic as certainty
- overstate score or capital outcomes

## User-Facing Copy Rules
Always prefer:
- calm
- clear
- non-judgmental
- lender-aware
- estimate-safe
- capability-building language

Avoid:
- "bad credit"
- "you messed up"
- "fix your mess"
- "guaranteed"
- "instant"
- "everyone qualifies"
- "secret hack"
- "automatic approval"

## Scoring / Versioning Rule
If CreditPath changes:
- visible thresholds
- interpretation semantics
- milestone meaning
- historical meaning of stored progress
- estimate logic in a user-visible way

Then the change must be classified for versioning review before ship.

## Open Logic Decisions
The following need explicit definition before implementation:
- exact blocker extraction mapping from current assessment fields
- exact severity thresholds
- exact milestone thresholds
- exact business-credit-depth logic
- exact dispute-letter structured inputs
- exact confidence escalation rules when upload data exists