# CREDITPATH_ARCHITECTURE.md

## Purpose
This document defines how CreditPath fits into the current FundReady system.

CreditPath must extend the current borrower-readiness operating system.
It must not create a disconnected module or a parallel logic stack.

## Architecture Principles
### 1. One engine, many surfaces
CreditPath must reuse the existing assessment and deterministic engine outputs wherever possible.

### 2. Deterministic logic before AI explanation
Blockers, ranking, roadmap selection, milestones, and unlock states must come from deterministic product logic first.
AI may explain, personalize, and generate artifacts only after the deterministic layer is defined.

### 3. No second source of truth
CreditPath must not duplicate score logic, blocker logic, or readiness logic that already exists elsewhere.

### 4. Extend the current product grammar
CreditPath should feel native to:
- Dashboard
- Status Reports
- FORGE
- Compliance
- Capital Path
- upgrade and analytics patterns

## Initial Architectural Scope
CreditPath v1 is a docs-first and deterministic-first module.

It must begin as:
- a route
- a page shell
- a deterministic blocker extractor
- a deterministic top-3 roadmap
- a deterministic progress model
- a deterministic milestone model
- a lightweight tools layer

AI features are phase 4, not phase 1.

## Expected Route Placement
Preferred navigation placement:
- between Dashboard and Capital Path

Recommended route family:
- `/app/credit-path`
- optional nested routes later if needed:
  - `/app/credit-path/overview`
  - `/app/credit-path/tools`
  - `/app/credit-path/progress`

Do not add nested routes in v1 unless the page complexity requires it.

## CreditPath Surface Inventory
### Surface 1 -- Credit Health Overview
Purpose:
- present current blocker categories clearly
- show issue severity
- reduce ambiguity

### Surface 2 -- Repair Roadmap
Purpose:
- show the top 3 actions only
- explain why they matter
- connect action to likely upside

### Surface 3 -- Progress Tracker
Purpose:
- show completed actions
- show next milestone
- reinforce visible progress

### Surface 4 -- Credit Tools
Purpose:
- turn guidance into action
- help users move immediately

### Surface 5 -- AI Layer (later)
Purpose:
- explain
- personalize
- generate artifacts
- update guidance over time

## Data Inputs
CreditPath should draw from the following existing system layers first:

### Existing likely inputs
- unified assessment answers
- deterministic scoring outputs
- personal-credit-related outputs
- blocker-related outputs
- capital-readiness outputs
- current dashboard/report-compatible state

CreditPath must inspect and document the exact current source files before implementation.

## Credit Data Input Modes
### Mode 1 -- Assessment-only
Source:
- assessment answers
- current engine outputs

Use when:
- no upload exists
- no monitoring integration exists

Confidence:
- low to medium

Can power:
- top blockers
- top-3 roadmap
- broad estimate ranges
- milestone guidance
- basic coaching

### Mode 2 -- Uploaded report
Source:
- parsed user-uploaded report
- optionally user-confirmed extracted fields

Confidence:
- medium to high

Can additionally power:
- more specific issue mapping
- more specific dispute outputs
- better simulator inputs
- better monthly analysis

### Mode 3 -- Connected monitoring/API
Source:
- partner or bureau-linked integration

Confidence:
- highest

Can additionally power:
- recurring refresh
- delta tracking
- premium retention workflows
- more precise coaching updates

### Architecture rule
Mode 3 must not be required for v1.

## Domain Objects to Define
CreditPath must define these domain objects explicitly before implementation:

### CreditBlocker
Fields should include:
- id
- title
- category
- severity
- confidenceTier
- whyItMatters
- evidenceSource
- estimatedImpactBand
- affectedSurfaces
- routeHint
- requiresUploadPrecision
- requiresMonitoringPrecision

### CreditAction
Fields should include:
- id
- title
- relatedBlockerIds
- rank
- whyItMatters
- effortLevel
- timeToResult
- estimatedReadinessImpact
- estimatedCapitalImpact
- dataRequirements
- steps
- canMarkComplete
- completionEvidenceType

### CreditMilestone
Fields should include:
- id
- title
- thresholdDescription
- prerequisiteActionIds
- rewardDescription
- unlockDescription
- badgeKey
- visibleToFree
- visibleToPaid

### CreditProgressState
Fields should include:
- completedActionIds
- currentTop3ActionIds
- nextMilestoneId
- confidenceTier
- lastUpdatedAt
- currentMode
- latestAnalysisState

### CreditArtifact
Fields should include:
- id
- type
- sourceMode
- relatedBlockerId
- generatedBy
- safeToDownload
- disclosureRequired

## Integration Points
### Dashboard
CreditPath should eventually contribute:
- top credit blocker highlights
- progress summaries
- next-best-action reinforcement

### Status Reports
CreditPath should align with:
- personal credit report
- bankability
- funding estimate logic
- explanation style

### FORGE
FORGE may later explain:
- why a blocker matters
- how to execute a step
- what happens after completion

FORGE must not become the hidden source of CreditPath ranking logic.

### Compliance
CreditPath may intersect with compliance only where credit-related readiness actions overlap with broader bankability.

### Capital Path
CreditPath must eventually connect action completion to stronger capital-readiness outcomes without implying guaranteed approvals.

## State Ownership Rules
CreditPath must follow the same architecture discipline as the rest of FundReady:
- keep deterministic computations centralized
- keep UI presentational where possible
- do not hide business logic inside components
- preserve state ownership discipline
- prefer additive extensions over replacements

## Storage Rules
Before implementation, decide and document:
- what can remain client-side
- what must be persisted
- what requires Supabase
- what should remain derived only
- what uploaded-report or artifact handling requires storage or structured tables

Do not assume persistence rules.
Inspect the existing repo and auth/storage posture first.

## Analytics Requirements
CreditPath must define typed events before or alongside implementation.

At minimum, event candidates include:
- `creditpath_viewed`
- `creditpath_overview_viewed`
- `creditpath_action_started`
- `creditpath_action_completed`
- `creditpath_tool_used`
- `creditpath_upload_started`
- `creditpath_upload_completed`
- `creditpath_ai_coach_opened`
- `creditpath_letter_generated`
- `creditpath_simulation_run`
- `creditpath_upgrade_viewed`
- `creditpath_upgrade_started`

These are placeholders until repo inspection confirms the current event pattern.

## AI Integration Boundaries
AI may:
- explain blockers
- explain actions
- personalize framing
- generate letters
- generate monthly analysis
- simulate carefully labeled scenarios

AI may not:
- override deterministic rankings
- invent lender thresholds as facts
- guarantee score outcomes
- guarantee approval outcomes
- silently replace engine truth

## Unresolved Architecture Decisions
The following must be resolved before implementation:
- exact current file locations for personal-credit outputs
- upload parsing strategy
- uploaded-report schema
- connected-monitoring provider strategy
- persistence model for uploaded artifacts
- auth/access model for paid AI features
- route structure depth for v1