# CREDITPATH_BUILD_SEQUENCE.md

## Purpose
This document defines the required order of work for CreditPath.

CreditPath must not begin with screens or AI prompts.
It must begin with domain clarity and system alignment.

## Governing Build Rule
Before implementation:
1. inspect the current repo state
2. confirm relevant source-of-truth docs
3. define domain model
4. define trust rules
5. define eval posture
6. then implement in small phases

## Phase 0 -- Inspection and Preconditions
### Goal
Understand the real current state of the FundReady codebase before building CreditPath.

### Required inspection
Inspect:
- current routes
- current sidebar
- current dashboard structure
- current report structure
- current FORGE structure
- current compliance structure
- unified assessment data shape
- computeScore()
- computeExtendedResults()
- personal-credit-related outputs
- monetization/gating state
- analytics/eventing state
- existing docs that affect CreditPath

### Deliverable
A preflight report with:
- relevant docs reviewed
- affected personas
- affected surfaces
- affected logic/data
- trust implications
- scoring/versioning risk
- monetization/gating risk
- recommended posture

### No code yet

## Phase 1 -- Docs Only
### Goal
Create the CreditPath source-of-truth layer.

### Required files
- CREDITPATH.md
- CREDITPATH_ARCHITECTURE.md
- CREDITPATH_SCORING.md
- CREDITPATH_EVALS.md
- CREDITPATH_BUILD_SEQUENCE.md

### Deliverable
Complete docs with:
- product model
- architecture model
- scoring / ranking / milestone model
- eval model
- implementation sequence

### No implementation yet

## Phase 2 -- Deterministic Foundation
### Goal
Build the non-AI core of CreditPath.

### Scope
- route or page shell
- deterministic Credit Health Overview
- deterministic top-3 roadmap
- deterministic milestone model
- deterministic progress tracker
- free-preview behavior
- confidence-tier display
- initial typed analytics plan if needed

### Requirements
- no AI-generated ranking
- no overclaiming
- no duplicate logic
- all business logic remains deterministic

### Deliverable
A functioning CreditPath shell that works from assessment-only mode.

## Phase 3 -- Lightweight Tools
### Goal
Add action-support tools that do not depend on broad AI orchestration.

### Scope
- utilization payoff calculator
- inquiry aging tracker
- business tradeline starter list
- dispute workflow scaffolding

### Requirements
- tools must be clear
- tools must be estimate-safe
- tools must not require monitoring integration
- tools must preserve trust language

## Phase 4 -- AI Layer
### Goal
Add the AI-assisted CreditPath features after the deterministic system is stable.

### Scope
- AI Credit Coach
- AI Dispute Letter Generator
- Score Impact Simulator
- Monthly Progress Analyst

### Requirements
- AI explains deterministic system outputs
- AI does not become the hidden source of truth
- AI prompts are constrained
- disclosures are present
- simulator outputs are clearly estimates
- dispute-letter outputs are clearly assistance, not legal advice

## Phase 5 -- Monetization Integration
### Goal
Integrate CreditPath into the paid-value system safely.

### Scope
- finalize free vs paid boundaries
- define preview states
- define upgrade moments
- align with existing payment-gating strategy
- implement only after gating strategy is approved

### Requirements
- trust before conversion
- no interruption of high-trust moments
- no pressure-first upgrade logic
- do not assume current payment activation is ready without inspection

## Phase 6 -- Premium / Advisor / Done-For-You Layer
### Goal
Add higher-touch or premium assistance after the core system is working.

### Scope
- human advisor review
- deeper letter review
- lender-facing handoff paths
- higher-ticket support workflows
- future partner integrations

## Credit Data-Source Build Order
### Phase A -- Assessment-only foundation
Mandatory for v1.

### Phase B -- Uploaded report support
Add upload flow, parsing strategy, user confirmation, and stronger confidence mode.

### Phase C -- Monitoring/API integration
Only later, only if justified, and never as a v1 blocker.

## Stop Conditions
Do not proceed if:
- the required docs are not approved
- current repo state has not been inspected
- blocker logic is not defined
- confidence tiers are not defined
- trust language is still unresolved
- monetization state is unclear and relevant to the phase
- implementation would create a second source of truth

## Required Reporting at Each Phase
Every implementation phase must report:
- files changed
- what changed
- whether logic moved
- whether trust language changed
- whether analytics changed
- whether monetization changed
- whether build passes
- whether eval criteria still pass
- safe to proceed: yes/no

## Phase Exit Criteria
### Phase 1 exit
All docs complete and approved.

### Phase 2 exit
Assessment-only deterministic CreditPath works and passes trust review.

### Phase 3 exit
Core tools work safely.

### Phase 4 exit
AI features stay within deterministic and disclosure boundaries.

### Phase 5 exit
Gating logic is aligned with business strategy and trust rules.

### Phase 6 exit
Premium workflows feel additive, not invasive.