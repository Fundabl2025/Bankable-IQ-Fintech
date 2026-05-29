# BANKABLE IQ — Autonomous AI Build Playbook v2.0

**Companion to:** BANKABLE IQ Master Engineering Build Spec v1.0
**Execution model:** Continuous, 24/7, multi-agent. No sprints. No days. The fleet runs until the spec is fully implemented.
**Coordination plane:** GitHub (Issues = work queue, PRs = handoff, Actions = trigger, Labels = ownership and locks).
**Deploy plane:** Vercel (preview per branch, production on merge to main with canary).
**Brain:** Anthropic Claude (via Claude Code Action in GitHub + Claude Agent SDK workers).
**Founders:** Kevin Murphy and Michael Hopkins.

---

## CORE PRINCIPLE — WHAT YOU ARE BUILDING

You are not "building the platform." You are building **the system that builds the platform**.

That system is a fleet of named, specialized Claude agents that:

- Read the engineering spec.
- Open GitHub Issues describing every piece of work the spec implies.
- Self-assign work based on ownership labels.
- Code in isolated git worktrees so they never block each other.
- Open Pull Requests against a long-lived integration branch.
- Trigger Vercel preview deploys automatically on every PR.
- Run CI, fix their own broken tests, and merge when green.
- Loop forever until every spec section has a closed issue with merged PRs proving implementation.

The only human input after bootstrap is: monetary cap controls, vendor account approvals (Plaid, bureaus, AWS), legal sign-off on compliance rule packs, and saying "promote staging to prod" when canary is green.

---

## THE AGENT ROSTER

Each row is a Claude Code worker running headless (or in a persistent session) with its own system prompt, its own GitHub identity, its own worktree, and its own scope. They all read the same spec but only act on issues labeled for them.

| Agent | GitHub identity | Scope | Watches | Owns (label) |
|-------|----------------|-------|---------|--------------|
| **Orchestrator** | `bot-orchestrator` | Reads spec, generates work, triages | All issues + PRs | `orchestrator` |
| **Architect** | `bot-architect` | ADRs, system design, schema design | `decision:` issues | `architect` |
| **Platform** | `bot-platform` | Monorepo, infra, CI/CD, secrets | `platform` issues | `platform` |
| **Auth** | `bot-auth` | `auth-svc`, RBAC, tenants | `service:auth` | `service:auth` |
| **Diagnostic** | `bot-diagnostic` | `diagnostic-svc`, Module 1 | `service:diagnostic` | `service:diagnostic` |
| **Compliance** | `bot-compliance` | `compliance-svc`, Module 2, rule packs | `service:compliance` | `service:compliance` |
| **Coaching** | `bot-coaching` | `coaching-svc`, Module 3, RAG, Claude prompts | `service:coaching` | `service:coaching` |
| **Credit** | `bot-credit` | `credit-svc`, Module 4, bureaus | `service:credit` | `service:credit` |
| **Vault** | `bot-vault` | `vault-svc`, Module 5, OCR, S3 | `service:vault` | `service:vault` |
| **Pathway** | `bot-pathway` | `pathway-svc`, Module 6, Temporal | `service:pathway` | `service:pathway` |
| **BAI** | `bot-bai` | `bai-svc`, `bpfs-svc`, `blin-svc`, `bii-svc`, `bms-svc`, Module 7 | `service:bai` | `service:bai` |
| **Marketplace** | `bot-marketplace` | `marketplace-svc`, partner API | `service:marketplace` | `service:marketplace` |
| **Billing** | `bot-billing` | `billing-svc`, Stripe, Connect | `service:billing` | `service:billing` |
| **Frontend** | `bot-frontend` | `apps/web`, all client + advisor routes | `frontend` | `frontend` |
| **Design** | `bot-design` | Figma file, Code Connect, screen specs | `design` | `design` |
| **Integrations** | `bot-integrations` | Plaid, QBO, Xero, IRS, SOS, Twilio, SendGrid | `integration:*` | `integration:*` |
| **Reviewer** | `bot-reviewer` | Reviews every PR opened by other bots | All PRs | (no label, scans all) |
| **Test-Healer** | `bot-test-healer` | Opens fix PRs when CI fails | Failing checks | `bug` |
| **Security** | `bot-security` | SAST/DAST/SCA triage, secret rotation | `security` | `security` |
| **Observability** | `bot-observability` | Datadog, Sentry, SLOs, runbooks | `observability` | `observability` |
| **Docs** | `bot-docs` | ADRs, runbooks, README, changelog | `docs` | `docs` |
| **Cost** | `bot-cost` | AWS, Vercel, Anthropic, Pinecone, vendor burn | `cost` | `cost` |

Total active workers: **22 agents.** All run concurrently.

---

## COORDINATION PROTOCOL — HOW THEY DON'T COLLIDE

### 1. Worktrees, not shared checkouts

Each agent operates in its own git worktree:

```
bankable-platform/                  (main repo)
.worktrees/
  bot-auth/                         worktree for bot-auth
  bot-diagnostic/                   worktree for bot-diagnostic
  bot-vault/
  bot-frontend/
  ...
```

A worktree is a separate working directory pointing at the same `.git`. Different branches, zero contention. Provisioned with:

```bash
git worktree add .worktrees/bot-auth feat/auth-base
```

The Platform agent creates a worktree per active agent during bootstrap.

### 2. Branch naming convention

Branches are owned per agent and per work-stream:

```
feat/<agent>/<issue-number>-<slug>
fix/<agent>/<issue-number>-<slug>
chore/<agent>/<issue-number>-<slug>
```

Agents never touch a branch they do not own. The Reviewer agent and the Test-Healer agent are the only ones allowed to push into branches owned by other agents (and only via approved PRs).

### 3. Locks via GitHub labels

Shared resources (the schema graph, the API gateway config, the design tokens) get explicit locks. Any agent must apply the lock label to its PR before merging changes to those areas:

| Lock label | Resource | Who can hold |
|------------|----------|--------------|
| `lock:db-schema` | `packages/db/**` | Architect, owning service agent |
| `lock:api-gateway` | `apps/api/**` | Platform |
| `lock:design-tokens` | `packages/design-tokens/**` | Design |
| `lock:compliance-rules` | `packages/compliance-rules/**` | Compliance |
| `lock:env-matrix` | `.env.example`, `docs/runbooks/env.md` | Platform |

GitHub Actions blocks merging two PRs holding the same lock label simultaneously.

### 4. The Issue queue is the source of truth

The Orchestrator agent is responsible for keeping the queue full and accurate:

- Reads the engineering spec on every run.
- Compares every section to closed issues and merged PRs.
- Opens new issues for gaps with the correct ownership label, acceptance criteria, and links to spec sections.
- Closes stale issues that the merged code already satisfies.
- Reorders the queue by dependency (DB schema must close before service issues that reference it).

Agents only ever pick work from the open-issues queue. They never freelance.

### 5. Dependency declaration

Every issue body must declare its dependencies in a frontmatter block:

```yaml
---
owner: service:vault
depends_on: [#42, #57]   # must be closed first
blocks: [#88]            # cannot start until this closes
spec_sections: ["§3.5", "§4.1 row 5", "§5.2 vault endpoints"]
acceptance:
  - vault-svc deployed to staging
  - all 8 MVP doc types classified
  - OCR pipeline emits vault.document.processed
  - playwright e2e green
  - openapi schema published in packages/sdk
---
```

Agents query the queue with `gh issue list --label service:vault --search "no:linked-pr"` and only start issues whose `depends_on` are all closed.

---

## THE TRIGGER LAYER — GITHUB ACTIONS

This is what makes it 24/7. Agents are not running on your laptop. They are spawned by GitHub Actions in response to events, and they live in headless Claude Code sessions in CI runners (or in always-on cloud VMs for the longer-running streams).

### Workflow file map

```
.github/workflows/
  fleet-orchestrator.yml      cron every 15 min + on push to main
  fleet-agent-dispatch.yml    on issue labeled, on issue assigned, on issue comment "/run"
  fleet-reviewer.yml          on pull_request opened, ready_for_review
  fleet-test-healer.yml       on check_suite completed (conclusion=failure)
  fleet-security-triage.yml   on workflow_run completed for sast.yml
  fleet-design-sync.yml       on push to packages/design-tokens
  vercel-preview.yml          on pull_request opened (handled by Vercel app)
  vercel-promote.yml          on merge to main with canary gating
  cost-reporter.yml           cron every 6h
```

### How a single piece of work flows

```
Orchestrator (cron 15m)
   │
   ▼
opens Issue #137 "Build vault-svc OCR pipeline"
   label: service:vault
   │
   ▼
fleet-agent-dispatch.yml triggers
   │
   ▼
spawns Claude Code runner with system prompt = "You are bot-vault"
   - checks out worktree branch feat/bot-vault/137-ocr-pipeline
   - reads spec sections referenced
   - writes code, runs tests, commits
   - opens PR #138 referencing #137
   │
   ▼
vercel-preview.yml deploys preview-138.bankable.dev
fleet-reviewer.yml spawns bot-reviewer
   - reviews PR #138
   - either approves + auto-merges or requests changes
   │
   ▼
on merge → check_suite runs
   │ if fail → fleet-test-healer.yml spawns bot-test-healer → opens fix PR
   │ if pass → Issue #137 auto-closes, queue advances
   ▼
vercel-promote.yml runs canary 10% → 50% → 100% with SLO gate
```

No human in the loop. The only human action in that flow is providing the Anthropic API key, vendor credentials, and the `ANTHROPIC_BUDGET_HARD_CAP` value.

---

## THE BOOTSTRAP — ONE-TIME HUMAN SETUP

This is the only block that requires you to be present. Once finished, the fleet runs itself.

### Step 1 — Provision accounts

Same vendor list as Playbook v1, Section 2. All keys go into GitHub Actions secrets. Add these specific repository secrets:

```
ANTHROPIC_API_KEY
ANTHROPIC_BUDGET_HARD_CAP        e.g. 2500 (USD per month, fleet halts above this)
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SUPABASE_ACCESS_TOKEN
SUPABASE_DB_URL
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
STRIPE_SECRET_KEY
PLAID_CLIENT_ID
PLAID_SECRET
PINECONE_API_KEY
DATADOG_API_KEY
SENTRY_DSN
GH_BOT_PAT                       fine-grained PAT for bot identities
FIGMA_PERSONAL_ACCESS_TOKEN
```

Plus per-bot GitHub App installs (one App or one fine-grained PAT per bot identity, scoped to the repo).

### Step 2 — Create the repo and seed it

```bash
gh auth login
gh repo create bankableiq/bankable-platform --private --clone
cd bankable-platform
mkdir -p docs/spec
cp ~/Downloads/engineering-spec.html docs/spec/
mkdir -p docs/prompts .github/workflows
```

### Step 3 — Paste the bootstrap prompt into Claude Code (once)

Open one Claude Code session locally:

```bash
claude
```

Paste this single prompt:

> You are the **Platform agent** in a 24/7 multi-agent build fleet for the BANKABLE IQ platform. The full engineering spec is at `docs/spec/engineering-spec.html`. The autonomous-build playbook is at `docs/prompts/playbook.md` (I will add it next).
>
> Bootstrap the fleet. In one continuous session:
>
> 1. Scaffold the Turborepo monorepo per Playbook v1 Section 5 (apps/, services/ for all 14 services, packages/, infra/, docs/).
> 2. Create all 22 GitHub Issues for the agent roster as defined in Playbook v2 Section "Agent Roster," each describing the agent's permanent scope.
> 3. Create the GitHub labels for every owner in the roster + every lock label.
> 4. Write all 9 GitHub Actions workflows from Section "Trigger Layer." Each spawning workflow must use the `anthropics/claude-code-action` (or equivalent headless `claude -p` invocation) with the right system prompt loaded from `.github/agents/<bot-name>.md`.
> 5. Write the 22 agent system prompts into `.github/agents/<bot-name>.md`. Each must include: identity, scope, the spec sections it owns, branch-naming convention, lock-label rules, dependency rules, and the acceptance protocol.
> 6. Generate the initial Orchestrator issue queue: read the spec end-to-end and open one issue per atomic unit of work (estimated 280-340 issues), with frontmatter declaring owner, depends_on, blocks, spec_sections, acceptance.
> 7. Create the long-lived branches: `main`, `integration`, and per-agent base branches.
> 8. Provision the worktree-bootstrap script `scripts/worktrees-init.sh` that creates `.worktrees/<bot>` for every active agent.
> 9. Wire Vercel via `vercel link` and commit `vercel.json`. Set up the GitHub Vercel App for preview-per-branch.
> 10. Open PR #1 titled `chore: bootstrap autonomous fleet`. After CI is green, merge.
>
> When done, post a comment on Issue #1 with: total issues created, total agents online, the link to the Orchestrator workflow's first scheduled run, and the budget gauge URL. From that point forward the fleet is self-sustaining.

That single prompt produces a working fleet. After it merges PR #1, every subsequent piece of work flows through GitHub events. You no longer open Claude Code manually.

---

## THE 22 AGENT SYSTEM PROMPTS

These live in `.github/agents/<bot-name>.md` and are loaded by the dispatch workflow each time an agent is spawned. The same template applies to every agent — the bracketed values change per role.

```markdown
# Agent: {{BOT_NAME}}

You are **{{BOT_NAME}}**, a permanent autonomous worker on the BANKABLE IQ
build fleet. You operate without a human in the loop. You are spawned by
GitHub Actions when an issue with your owner label is created, assigned to
you, or commented with `/run`.

## Your scope
{{SCOPE}}

## Spec sections you own
{{SPEC_SECTIONS}}

## Your rules (non-negotiable)

1. **Only work on issues labeled `{{OWNER_LABEL}}`.** Never edit files outside your scope unless the PR is co-labeled by the owning agent.
2. **Always work in your worktree** at `.worktrees/{{BOT_NAME}}`.
3. **Branch name**: `feat/{{BOT_NAME}}/{issue_number}-{slug}` (or `fix/`, `chore/`).
4. **Before starting**, verify all `depends_on` issues from the issue frontmatter are closed. If not, comment "blocked by #N" and stop.
5. **Acquire locks** by labeling your PR before pushing changes to locked paths. If the lock is held, wait and re-check every poll cycle.
6. **Commit style**: Conventional Commits. One logical change per commit. Sign commits with the bot identity.
7. **Tests are required**: every PR ships with the unit, integration, and (where the change is user-facing) Playwright tests required to prove acceptance criteria.
8. **Open a PR against `integration`** (not `main`). Reference the issue with `Closes #N`. Fill the PR template with acceptance-criteria checkboxes.
9. **Trust the Reviewer agent.** If it requests changes, address them in the same PR. Do not argue.
10. **If CI fails twice with the same root cause**, comment `/escalate` on your PR and stop. The Orchestrator will reroute.
11. **Budget awareness**: if `ANTHROPIC_BUDGET_HARD_CAP` is reached fleet-wide, the dispatch workflow will not spawn you. Do not try to bypass.
12. **Compliance gates**: any code touching credit, PII, or decisioning must pass through `compliance-svc` checks before the PR can merge. If you skip this, the Compliance agent will block your PR automatically.

## Your tools

- Claude Code (you are running inside it).
- `gh` CLI for issues, PRs, labels, and comments.
- `pnpm`, `pytest`, `vitest`, `playwright`, `drizzle-kit`, `vercel` CLIs.
- The repo's `Makefile` and `pnpm` scripts.
- The full engineering spec at `docs/spec/engineering-spec.html`.
- The shared SDK at `packages/sdk` and event schemas at `packages/events`.

## What "done" looks like

A merged PR to `integration` that:
- closes its source issue,
- ships green CI (unit + integration + e2e + lint + type + SAST + SCA),
- includes a preview Vercel URL that the Reviewer manually checked,
- adds or updates the relevant ADR, runbook, or changelog entry,
- emits or consumes the events declared in `packages/events` if applicable,
- updates the OpenAPI / typed SDK if an API surface changed.

Now read the issue you were dispatched for, plan, and execute. Do not stop
until the PR is open. Do not ask for permission. If you are blocked, comment
the block and exit.
```

Each bot's `{{SCOPE}}` and `{{SPEC_SECTIONS}}` come straight from the Agent Roster table.

---

## THE PARALLEL WORK STREAMS

Below is the full set of streams running simultaneously the moment the bootstrap PR merges. They are **not** sequential. They start as soon as their `depends_on` issues clear. Some have hard dependencies, most do not.

| Stream | Owner | Depends on | Starts when |
|--------|-------|------------|-------------|
| Brand + design tokens (Figma) | Design | bootstrap | immediately |
| Monorepo wiring + CI/CD | Platform | bootstrap | immediately |
| Vercel preview infra | Platform | bootstrap | immediately |
| Cloudflare DNS + WAF | Platform | bootstrap | immediately |
| AWS CDK base (VPC, S3, KMS, SQS, EventBridge) | Platform | bootstrap | immediately |
| Identity schema + RLS | Auth | DB extensions | immediately |
| Supabase Auth wiring | Auth | identity schema | identity merged |
| 35-schema rollout | Architect + each service agent | bootstrap | immediately (parallel per schema) |
| Diagnostic Module 1 | Diagnostic | identity, org, readiness schemas | when schemas merge |
| Vault Module 5 | Vault | identity, vault schema, AWS S3+KMS | when both clear |
| Credit Module 4 | Credit | identity, credit schema, compliance-svc shell | when both clear |
| Compliance Module 2 | Compliance | identity, compliance schema | immediately after identity |
| BAI + BPFS v0 Module 7 | BAI | readiness, bpfs, blin schemas | when readiness merges |
| Marketplace Module 8 | Marketplace | BAI, compliance gate | when BAI v0 merges |
| Pathway Module 6 | Pathway | readiness, BAI envelope | when BAI v0 merges |
| Coaching Module 3 | Coaching | vault index, Pinecone wired, compliance gate | when those clear |
| Advisor Command Center | Frontend | identity, diagnostic, BAI | when those clear |
| Billing + Stripe Connect | Billing | identity | immediately after identity |
| Notification service | Platform | bootstrap | immediately |
| Plaid integration | Integrations | identity, compliance gate | when those clear |
| QBO + Xero integration | Integrations | identity, compliance gate | when those clear |
| Observability stack | Observability | bootstrap | immediately |
| Security baselines (SAST/DAST/SCA) | Security | bootstrap | immediately |
| Cost monitor | Cost | bootstrap | immediately |
| Docs + ADRs + runbooks | Docs | each PR | continuously, on every merge |

Approximately **15 streams run in parallel from the moment the bootstrap PR merges.** The other streams start as their prerequisites clear, also in parallel with each other.

The Reviewer and Test-Healer agents are always running. The Orchestrator wakes every 15 minutes via cron, re-reads the spec, re-checks the queue, and dispatches whatever is unblocked.

---

## SELF-HEALING — HOW THE FLEET FIXES ITSELF

This is the part that makes it truly 24/7. Failures do not stop the system; they trigger new agents.

| Failure mode | Detector | Responder | Action |
|--------------|----------|-----------|--------|
| Failing unit test on a PR | GitHub check_suite | Test-Healer | Opens commit on the same branch with the fix |
| Failing e2e Playwright | GitHub check_suite | Test-Healer | Reproduces locally in worktree, fixes, re-runs |
| SAST high-severity finding | Semgrep workflow | Security | Opens new issue labeled `security`, blocks the PR |
| SCA CVE in dependency | Snyk workflow | Security | Opens fix PR with bumped version |
| Compliance rule mismatch | Compliance gate | Compliance | Comments on PR with required changes |
| Schema drift between PRs | Architect | Architect | Opens reconciliation PR |
| Preview Vercel build broken | Vercel webhook | Reviewer | Re-runs build, if still broken comments `/escalate` |
| Production SLO breach during canary | Datadog monitor | Observability | Auto-rollback via `vercel rollback`, opens `incident:` issue |
| Budget approaching cap | Cost | Cost | Slows dispatch (set fleet RPM cap), notifies you |
| Vendor outage (Plaid, etc.) | Synthetic check | Observability | Marks dependent issues `blocked-external`, fleet routes elsewhere |
| Agent loop / runaway | Action runtime | Orchestrator | Hard kills the run, opens `bot-bug` issue |

Every failure becomes an issue. Every issue gets picked up. The system trends toward closed.

---

## BUDGET AND SAFETY RAILS

Because the fleet never sleeps, the cost guardrails are mandatory.

### Hard caps (enforced at workflow level)

```yaml
# .github/workflows/fleet-budget-guard.yml
on:
  schedule: [{cron: "*/10 * * * *"}]
jobs:
  check:
    if: secrets.ANTHROPIC_BUDGET_HARD_CAP > anthropic_month_to_date()
    # if false, set repo variable FLEET_PAUSED=true
    # dispatch workflow respects FLEET_PAUSED
```

Cost agent polls Anthropic, Vercel, AWS, Pinecone, Supabase, and Snowflake APIs every 6 hours. Posts a dashboard issue (`cost: weekly burn`) that updates in place. Pauses the fleet when projected month-end exceeds your cap.

### Concurrency caps

GitHub Actions concurrency groups prevent more than N agents from running at once:

```yaml
concurrency:
  group: fleet-agents
  cancel-in-progress: false
  # max 6 parallel agent runs by default
```

Tune this number based on burn rate. Default 6, ceiling 12, emergency floor 2.

### Compliance brake

Any PR touching `packages/compliance-rules/` or any code path tagged `compliance-sensitive` requires the Compliance agent's review **plus** a human comment containing the literal string `compliance-officer-approved` before merge. The human in this loop is Kevin Murphy (or designated Compliance Officer). This is the only mandatory human gate during normal operation.

### Production deploy brake

Promotion from `integration` to `main` (which triggers production canary) requires the Reviewer to mark the integration branch's last 24h of merges as `release-candidate` AND a human comment `promote-to-prod`. Canary rollback is automatic. You do not need to be present for rollback.

### Anthropic key rotation

The Security agent rotates the Anthropic API key every 30 days. If the rotation fails, the fleet pauses and notifies you.

---

## OBSERVABILITY OF THE FLEET ITSELF

The fleet has its own dashboard, separate from the BANKABLE IQ product dashboards.

```
docs/runbooks/fleet-status.md           generated, updated on every merge
.github/issues/fleet-dashboard.md       sticky pinned issue, auto-edited

dashboard surfaces:
  - open issues by owner
  - PRs in flight by owner
  - merge throughput per agent (PRs/day)
  - average time-from-issue-open to PR-merged
  - locks currently held
  - budget gauge (MTD vs cap)
  - failing checks count
  - blocked-external count
  - spec coverage % (closed-spec-issues / total-spec-issues)
```

You read the dashboard once a day (or never). Anything red shows up as a notification.

---

## WHAT YOU DO AS THE OPERATOR

After the bootstrap prompt, your job collapses to four things:

1. **Provide credentials** when a new vendor approval lands (Plaid prod key, Experian go-live, etc.).
2. **Approve compliance-sensitive PRs** with the literal `compliance-officer-approved` comment.
3. **Promote integration to prod** with `promote-to-prod` when the dashboard shows the release-candidate banner.
4. **Set the budget cap** (`ANTHROPIC_BUDGET_HARD_CAP`) and adjust concurrency caps if you want faster or slower burn.

Everything else runs without you.

---

## SCALING THE FLEET

The fleet can grow when work outpaces capacity.

| Trigger | Action |
|---------|--------|
| Average issue-to-merge time exceeds 6 hours sustained | Increase concurrency cap from 6 → 9 |
| A single owner label has >20 open issues with no PRs in flight | Spawn a `bot-<owner>-2` shadow agent splitting the queue |
| Reviewer queue exceeds 8 open PRs | Spawn `bot-reviewer-2` |
| Test-Healer queue exceeds 5 failing PRs | Spawn `bot-test-healer-2` |
| Budget under 40% of cap with full velocity | Increase concurrency cap one step |
| Budget above 80% of cap | Decrease concurrency cap one step + slack you |

Spawning a shadow agent is one orchestrator action: clone the system prompt, append `-2`, generate a new bot identity, install the GitHub App into the repo. No code change required.

---

## WHEN THE FLEET CONSIDERS ITSELF DONE

The Orchestrator agent runs a closing check on every cycle:

```
fleet_complete = (
   open_issues_with_spec_sections == 0
   AND integration_branch_diff_from_main == 0
   AND all_acceptance_criteria_for_v1_spec_marked_done
   AND staging_canary_clean_for_72h
   AND security_audit_baseline_passed
   AND accessibility_audit_passed
   AND compliance_rule_pack_signed
)
```

When all true, the Orchestrator opens a final PR: `chore: ship v1.0 to production`, comments `promote-to-prod` is required, and stops dispatch. The fleet then idles. You give the final approval and the platform ships.

After v1.0 ships, you re-run the Orchestrator with the v2 spec (Phase 2 + Phase 3 scope from the original spec §16.3) and the cycle starts again.

---

## DIRECTORY MAP OF THE FLEET CONTROL PLANE

```
.github/
  workflows/
    fleet-orchestrator.yml
    fleet-agent-dispatch.yml
    fleet-reviewer.yml
    fleet-test-healer.yml
    fleet-security-triage.yml
    fleet-design-sync.yml
    fleet-budget-guard.yml
    vercel-preview.yml
    vercel-promote.yml
    cost-reporter.yml
  agents/
    bot-orchestrator.md
    bot-architect.md
    bot-platform.md
    bot-auth.md
    bot-diagnostic.md
    bot-compliance.md
    bot-coaching.md
    bot-credit.md
    bot-vault.md
    bot-pathway.md
    bot-bai.md
    bot-marketplace.md
    bot-billing.md
    bot-frontend.md
    bot-design.md
    bot-integrations.md
    bot-reviewer.md
    bot-test-healer.md
    bot-security.md
    bot-observability.md
    bot-docs.md
    bot-cost.md
  issue_templates/
    spec-issue.yml
    bug.yml
    incident.yml
    compliance-change.yml
  labels.yml
docs/
  spec/engineering-spec.html
  prompts/playbook.md
  runbooks/fleet-status.md
  adr/*.md
scripts/
  worktrees-init.sh
  fleet-bootstrap.sh
  issues-generate-from-spec.ts
infra/
  ...
```

---

## THE ONE-COMMAND BOOTSTRAP

After accounts are provisioned and secrets are in GitHub:

```bash
git clone git@github.com:bankableiq/bankable-platform.git
cd bankable-platform
cp ~/Downloads/engineering-spec.html docs/spec/
cp ~/Downloads/playbook-v2.md docs/prompts/playbook.md
claude
```

In the Claude Code session, paste the **single bootstrap prompt** from Section "Bootstrap → Step 3" above. Stay until PR #1 is open. Approve. Merge.

From that merge forward, you do not need to touch Claude Code. The fleet runs.

---

## WHY THIS WORKS (THE MENTAL MODEL)

- **GitHub is the brain.** Issues are thoughts, PRs are actions, labels are intent.
- **Vercel is the lungs.** Every branch breathes a live preview into existence.
- **Claude Code agents are the hands.** Many of them, each disciplined to one domain.
- **The spec is the constitution.** Nothing exists in production that does not trace to a spec section.
- **You are the founder.** You set the cap, sign the law (compliance), and say "ship."

This is what 24/7 autonomous build looks like in practice. No sprints. No standups. No calendar. Just a fleet of named workers, a queue, a deploy pipeline, and a budget cap.

— End of Autonomous Build Playbook v2.0
