# PROJECT_GOVERNANCE.md
# Platform governance for FundReady — decisions, risk, versioning, anti-patterns, and
# operating standards. Enforced on every non-trivial task alongside PROJECT_PREFLIGHT.md.

---

## Purpose

This file defines how FundReady decisions must be made so the platform stays coherent,
trustworthy, and architecturally sound as it grows.

It governs:
- product decisions
- implementation posture
- source-of-truth priority
- risk handling
- scoring/versioning discipline
- copy and trust discipline
- change sequencing
- system harmony

---

## North Star

FundReady is a capital-readiness intelligence platform that helps business owners understand
how lenders see them, improve what matters most, and unlock better capital outcomes over time.

**FundReady is not:**
- just a funding marketplace
- just a broker lead funnel
- just a coaching dashboard
- just a credit repair tool
- just an AI chatbot

FundReady must behave like a coordinated borrower-readiness operating system.

**Founder standard:**
> We build fintech software that makes the right financial action feel clear, safe, and worth taking.

---

## Governing principles

### 1. Product coherence over feature accumulation
Every feature must strengthen the lender-readiness progression model.
If a feature does not reinforce the journey from uncertainty → readiness → stronger capital access,
it should be questioned before building.

### 2. One engine, many surfaces
The system operates from one assessment and one deterministic core engine, with many surfaces
reading from that same truth:
- Dashboard
- Goals
- Reports
- Compliance
- Capital Path
- FORGE
- future CreditPath domains

**Do not create parallel scoring or interpretation systems.**

### 3. Guidance before judgment
The platform must feel like a skilled advisor, not a cold compliance portal.
Language and flows must reduce shame, confusion, and overwhelm.

### 4. Trust before conversion
Do not optimize conversion by creating doubt, pressure, or false urgency.
Estimate language must remain clearly framed as estimates.
Progress must be earned, not exaggerated.

### 5. Deterministic logic before AI explanation
Core ranking, scoring, blockers, readiness states, and action ordering must come from
deterministic system logic.
AI may explain, personalize, summarize, and generate artifacts, but it must not silently
replace the engine.

### 6. Versioning over ambiguity
If visible product meaning changes, version it.
If scoring interpretation changes, version it.
If history could be read differently after a change, isolate it.

### 7. Safe sequencing over broad rewrites
Prefer:
- audits before implementation
- low-risk fixes before structural work
- additive extensions before replacements
- phased corrections before major refactors

### 8. Visible progress is mandatory
Every major product surface must help the user understand:
- where they are
- what is blocking progress
- what to do next
- what improves if they act

---

## Source-of-truth hierarchy

When there is conflict, resolve using this priority order:

1. Explicit approved product/scoring/security docs
2. Current deterministic production behavior
3. Architecture/governance docs
4. Local implementation details
5. AI-generated recommendations
6. Assumptions

If docs and live behavior conflict, identify the conflict explicitly before changing either.

---

## Required decision filters

Before approving any non-trivial change, evaluate all of:

### User filter
Does this make the next action easier, clearer, faster, or safer?

### Trust filter
Does this increase confidence or create doubt?

### Systems filter
Does this fit the broader borrower-readiness journey, or is it an isolated feature?

### Business filter
Does this improve activation, retention, monetization, outcomes, or defensibility?

### Simplicity filter
Can the change be explained simply?

### Architecture filter
Does this extend the current engine cleanly or create parallel logic?

---

## Change categories

### Category A — Zero-risk
- Docs, comments, dead-code cleanup
- Visible copy corrections with no logic change
- Label standardization with no logic impact

### Category B — Low-risk
- Analytics additions
- Typed eventing
- Additive diagnostics
- Report coherence improvements
- UI clarity improvements with no scoring or schema impact

### Category C — Medium-risk
- Visible goal logic changes
- Bankable-item logic corrections
- AI behavior changes that affect user interpretation
- Monetization or gating timing changes
- New report behavior
- Additive persistence features

### Category D — High-risk
- Scoring semantic changes
- Threshold changes (SBSS, FundScore bands, capital estimates)
- Historical interpretation changes
- Auth or routing rewrites
- Schema-sensitive migrations
- Major monetization architecture changes

---

## Rules for score and estimate language

### Allowed
```
estimated · likely · based on your profile · may improve · may unlock
current signal suggests · readiness indicator · assessment-based
```

### Disallowed
```
guaranteed · certain approval · exact lender outcome · instant success
everyone qualifies · hidden lender hack · you will be approved
```

---

## Rules for AI surfaces (FORGE)

AI **may**:
- Explain scoring signals in plain language
- Personalize recommendations based on user context
- Summarize assessment results
- Simulate carefully-labeled scenarios
- Generate letters, plans, and reports
- Guide next steps based on current state

AI **may not**:
- Guarantee outcomes
- Invent lender thresholds and present them as fact
- Override deterministic logic silently
- Replace system truth with persuasive language
- Create regulatory or compliance risk through overclaiming

---

## Two-layer verification model (enforced)

FundReady uses an intentional two-layer system for readiness measurement:

| Layer | Source | Label | Meaning |
|-------|--------|-------|---------|
| Assessment baseline | `computeBankableItems()` reads assessment answers | "Self-reported" / "Claimed" | What the user says they have |
| Verified completion | `getComplianceProgress()` reads localStorage module completions | "Verified" | What the user has proven through the app |

**These must never be conflated in the UI.**
- Bankable Items (19/20) = claimed in assessment
- Compliance Modules (0/13) = proven by completing the app's guided walkthroughs
- Goal 02 must always show BOTH signals side-by-side with clear labels

---

## Required pre-implementation posture

Before major work, follow this sequence:

1. **Audit** — inspect existing implementation and governing docs
2. **Normalize** — identify what exists, what is missing, what conflicts
3. **Classify** — assign risk category (A/B/C/D) to each change
4. **Sequence** — safe-first ordering (low-risk → high-risk)
5. **Execute** — small batches, not large rewrites
6. **Verify** — check after each batch before expanding
7. **Expand** — only broaden scope after verification passes

---

## Required implementation posture

Every implementation task must define:

- **Objective** — what this achieves
- **Personas affected** — who sees or uses this
- **User states affected** — which states this applies to
- **Surfaces affected** — which pages/components change
- **Logic affected** — which engine functions are touched
- **Analytics affected** — which events fire or need updating
- **Trust impact** — how user interpretation changes
- **Risk level** — zero / low / medium / high
- **Acceptance criteria** — what "done" looks like
- **What not to change** — explicit scope boundary
- **Verification steps** — how to confirm correctness after shipping

---

## Analytics and eval discipline

No significant product surface should remain invisible.

If a surface matters for activation, trust, progression, monetization, or AI coaching —
it should have typed analytics coverage and an eval posture.

Surfaces that must have event coverage:
- Assessment completion
- Score reveal
- Report views
- Goal state changes
- Module completions
- Upgrade events
- Capital product applications
- FORGE interactions

---

## Governance for future modules (including CreditPath)

Any future module must:
- Integrate into the existing system architecture
- Reuse existing assessment and core engine outputs
- Preserve one-source-of-truth logic
- Fit existing dashboard / report / compliance / FORGE patterns
- Follow the same trust and behavior rules
- Not fragment the platform into disconnected feature silos

---

## Explicit anti-patterns (never allow)

| Anti-pattern | Why it is forbidden |
|---|---|
| Duplicate score logic | Breaks single-source-of-truth; creates inconsistency |
| Duplicate status logic | Users see contradictory readiness signals |
| Duplicate labels/constants | Creates drift; one source wins |
| AI-first business logic | Engine logic must be deterministic; AI explains only |
| Scammy or overhyped copy | Destroys trust instantly |
| Features that create action without clarity | Users need to understand before they commit |
| Upgrades that interrupt trust-building moments | Trust must come before conversion asks |
| New modules that ignore existing reports/goals/flows | Fragmentation kills coherence |
| Static membership tier reads | Always use useState + event listener |
| Guarantee or approval-certain language | Regulatory and trust risk |

---

## Review triggers

A decision must be re-reviewed before shipping if it affects:

- Scoring / versioning semantics
- Historical interpretation of stored data
- Capital estimates shown to users
- Bankable status or Goal 02/03 logic
- Goal progression or completion criteria
- Monetization timing or upgrade gates
- Security or compliance boundaries
- User trust in funding readiness outputs
- FORGE behavior or AI claim language

---

## Final governance test

Before shipping anything non-trivial, confirm all of the following:

- [ ] Is this aligned with the product thesis?
- [ ] Does it fit the user journey?
- [ ] Does it preserve trust?
- [ ] Does it extend the current system instead of fragmenting it?
- [ ] Does it improve the user's ability to take the next right action?
- [ ] Does it keep FundReady feeling like one coordinated operating system?
- [ ] Does it pass the score/versioning check if relevant?
- [ ] Does it pass the copy/claim safety check?
- [ ] Has the preflight been completed?

If any answer is no or uncertain — stop, resolve the uncertainty, then proceed.
