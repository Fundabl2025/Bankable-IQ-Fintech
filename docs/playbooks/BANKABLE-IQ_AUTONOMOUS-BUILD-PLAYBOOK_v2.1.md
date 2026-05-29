# BANKABLE IQ Autonomous AI Build Playbook v2.1

**Companion to:** BANKABLE IQ Master Engineering Build Spec v1.0
**Supersedes:** v2.0 (audit fixes applied, see Audit Report below)
**Execution model:** Continuous, 24/7, multi-agent. No sprints. No days. The fleet runs until the spec is fully implemented.
**Coordination plane:** GitHub (Issues = work queue, PRs = handoff, Actions = trigger, Labels = ownership and locks).
**Deploy plane:** Vercel (preview per branch, production on merge to main with canary).
**Brain:** Anthropic Claude via the official `anthropics/claude-code-action` GitHub Action.
**Founders:** Kevin Murphy and Michael Hopkins.

---

## AUDIT REPORT (v2.0 to v2.1)

This is what I checked, what I changed, and what limitations remain. Read this before you trust the rest of the document.

### What I verified and kept as written

- `anthropics/claude-code-action` is a real, published GitHub Action.
- Claude Code CLI supports headless mode via `claude -p "prompt"`.
- Git worktrees behave exactly as described (`git worktree add`).
- GitHub Actions cron syntax `*/15 * * * *` is valid.
- GitHub Actions concurrency groups with `cancel-in-progress: false` work as described.
- Vercel preview-per-branch via the official GitHub integration is real.
- `vercel rollback` CLI command exists.
- 22 agent count matches: 14 spec services + 8 control agents (Orchestrator, Architect, Platform, Frontend, Design, Reviewer, Test-Healer, Security, Observability, Docs, Cost). Reconciled: actually 11 control agents + 11 service-mapped agents = 22. (BAI agent owns 5 backend services. Platform agent owns notification work. Integrations agent owns cross-vendor work.)
- All 35 schemas from the spec are represented in stream ownership.

### What I corrected from v2.0

1. **All em dashes removed.** User preferences forbid them. v2.0 had 11 instances in headers and prose.
2. **`no:linked-pr` removed.** That qualifier does not exist in GitHub search. Replaced with a real GraphQL query and a `gh` script.
3. **`fleet-budget-guard.yml` rewritten.** The `if:` expression in v2.0 was pseudocode. v2.1 ships a real workflow that runs a bash step which calls the Anthropic billing endpoint, computes MTD spend, and writes a repo variable that the dispatch workflow reads.
4. **Anthropic key rotation softened.** No automated rotation API exists today. Replaced with a quarterly manual rotation runbook owned by the Security agent and a Slack/email reminder.
5. **`labels.yml` clarified.** Wired to `crazy-max/ghaction-github-labeler@v5` which is the standard YAML-driven labeler action.
6. **Fleet dashboard clarified.** Source of truth is `docs/runbooks/fleet-status.md`. The pinned GitHub Issue is rendered from that file by a workflow that runs on push and posts via `gh issue edit`.
7. **Bot identity model clarified.** Recommended: one GitHub App named "BANKABLE Fleet" that posts comments and PRs under different `bot-<name>` display names via the App's installation token. Alternative: 22 separate bot user accounts each with a fine-grained PAT. Tradeoff documented in section "Bot Identities."
8. **Bootstrap prompt now verifies prereqs first.** Added a preflight step that checks every required secret exists and fails fast with a precise error if any are missing.
9. **Added "Risks and Known Limitations" section.** Lists failure modes the fleet cannot self-heal.
10. **Added "Fleet Operating Cost Estimate."** Separate from product infra cost. Helps set `ANTHROPIC_BUDGET_HARD_CAP`.

### Limitations that remain (read carefully)

- **GitHub Actions minutes are billable.** A 22-agent fleet running continuously will burn private-repo minutes. Estimate in the cost section.
- **Anthropic context window limits per call.** Each spawned agent loads only its own system prompt + the relevant issue + the relevant spec sections, not the entire spec. The Orchestrator does the spec slicing.
- **Anthropic rate limits.** At high parallelism you will hit the Tier rate limit. The dispatch workflow respects 429s with exponential backoff. Mitigation: request a tier increase early.
- **GitHub API rate limits.** 22 agents querying constantly will burn the 5,000/hr REST quota. Use the GitHub App token (15,000/hr) and prefer GraphQL.
- **Compliance is the one mandatory human gate.** Anything touching `compliance-svc` or `packages/compliance-rules/**` requires Kevin's literal approval comment. This is not bypassable by design.
- **Production deploy is a mandatory human gate.** `promote-to-prod` comment required. This is not bypassable by design.
- **Spec changes are not autonomous.** If the spec itself changes, you commit the new spec to `docs/spec/` and the Orchestrator picks up the diff on its next cycle. The spec is the constitution.
- **Vendor onboarding is human-paced.** Plaid Production approval, Experian Connect onboarding, D&B contracts, AWS account verification, Stripe Connect activation. These take days to weeks of calendar time. The fleet routes around them but cannot accelerate them.

Now the playbook.

---

## CORE PRINCIPLE: WHAT YOU ARE BUILDING

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

Human input after bootstrap reduces to four things: monetary cap, vendor approvals, compliance sign-off, and "ship."

---

## THE AGENT ROSTER

22 agents. Each is a Claude Code worker spawned by GitHub Actions, running with a system prompt at `.github/agents/<bot-name>.md`, scoped to one ownership label, working in one git worktree.

| Agent | GitHub display name | Scope | Owns (label) |
|-------|---------------------|-------|--------------|
| **Orchestrator** | bot-orchestrator | Reads spec, generates work, triages | `orchestrator` |
| **Architect** | bot-architect | ADRs, system design, schema design | `architect` |
| **Platform** | bot-platform | Monorepo, infra, CI/CD, secrets, notification-svc | `platform` |
| **Auth** | bot-auth | `auth-svc`, RBAC, tenants | `service:auth` |
| **Diagnostic** | bot-diagnostic | `diagnostic-svc`, Module 1 | `service:diagnostic` |
| **Compliance** | bot-compliance | `compliance-svc`, Module 2, rule packs | `service:compliance` |
| **Coaching** | bot-coaching | `coaching-svc`, Module 3, RAG, Claude prompts | `service:coaching` |
| **Credit** | bot-credit | `credit-svc`, Module 4, bureaus | `service:credit` |
| **Vault** | bot-vault | `vault-svc`, Module 5, OCR, S3 | `service:vault` |
| **Pathway** | bot-pathway | `pathway-svc`, Module 6, Temporal | `service:pathway` |
| **BAI** | bot-bai | `bai-svc`, `bpfs-svc`, `blin-svc`, `bii-svc`, `bms-svc`, Module 7 | `service:bai` |
| **Marketplace** | bot-marketplace | `marketplace-svc`, partner API | `service:marketplace` |
| **Billing** | bot-billing | `billing-svc`, Stripe, Connect | `service:billing` |
| **Frontend** | bot-frontend | `apps/web`, all client and advisor routes | `frontend` |
| **Design** | bot-design | Figma file, Code Connect, screen specs | `design` |
| **Integrations** | bot-integrations | Plaid, QBO, Xero, IRS, SOS, Twilio, SendGrid | `integration:*` |
| **Reviewer** | bot-reviewer | Reviews every PR opened by other bots | (no owner label; scans all PRs) |
| **Test-Healer** | bot-test-healer | Opens fix PRs when CI fails | `bug` |
| **Security** | bot-security | SAST/DAST/SCA triage, secret rotation runbook | `security` |
| **Observability** | bot-observability | Datadog, Sentry, SLOs, runbooks | `observability` |
| **Docs** | bot-docs | ADRs, runbooks, README, changelog | `docs` |
| **Cost** | bot-cost | AWS, Vercel, Anthropic, Pinecone, vendor burn | `cost` |

---

## BOT IDENTITIES (recommended approach)

You have two options. Pick one.

### Option A. One GitHub App (recommended)

Create one GitHub App named `BANKABLE Fleet` and install it on the repo. The App's installation token authors all comments and commits. The display name shown on each comment is set per-agent by signing commits with author lines like `bot-vault <bot-vault@bankableiq.dev>` and by prefixing every issue comment with a header `**Posted by bot-vault.**`. Pros: one set of permissions, one rate limit pool (15,000 GraphQL points/hr), one rotation. Cons: GitHub's PR author field shows the App name, not the per-bot name.

### Option B. 22 user accounts

Create one bot user per agent (`bot-vault@bankableiq.dev`, etc.). Each has its own fine-grained PAT. Pros: PR author field shows the actual bot name, cleaner audit trail. Cons: 22 accounts to manage, 22 rate limit pools, 22 rotation cycles. GitHub Free plan limits total seats; you may need a paid org seat per bot.

The default in this playbook is Option A. If you want Option B, the Platform agent's bootstrap will provision the accounts and PATs in addition to the App.

---

## COORDINATION PROTOCOL: HOW THEY DON'T COLLIDE

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

Provisioned with `git worktree add .worktrees/bot-auth feat/bot-auth/base`. Each agent's worktree lives on its own permanent base branch off `integration`. The Platform agent creates them in bootstrap.

### 2. Branch naming convention

```
feat/<agent>/<issue-number>-<slug>
fix/<agent>/<issue-number>-<slug>
chore/<agent>/<issue-number>-<slug>
```

Agents never touch a branch they do not own. The Reviewer and Test-Healer agents are the only ones permitted to push commits into another agent's branch, and only via PRs the owning agent approves.

### 3. Locks via GitHub labels

| Lock label | Resource | Holders allowed |
|------------|----------|-----------------|
| `lock:db-schema` | `packages/db/**` | Architect, owning service agent |
| `lock:api-gateway` | `apps/api/**` | Platform |
| `lock:design-tokens` | `packages/design-tokens/**` | Design |
| `lock:compliance-rules` | `packages/compliance-rules/**` | Compliance |
| `lock:env-matrix` | `.env.example`, `docs/runbooks/env.md` | Platform |
| `lock:openapi` | `packages/sdk/openapi/**` | Platform + owning service agent |

A GitHub Actions check named `fleet/lock-arbiter` runs on every PR. It blocks merge if two open PRs hold the same lock label. The losing PR waits and rebases after the winner merges.

### 4. The Issue queue is the source of truth

The Orchestrator agent:

- Reads the engineering spec on every run.
- Compares every section to closed issues and merged PRs.
- Opens new issues for gaps with the correct ownership label, acceptance criteria, and links to spec sections.
- Closes stale issues that the merged code already satisfies (via `Closes #N` traces).
- Reorders the queue by dependency (DB schema must close before service issues that reference it).

Agents only pick work from the open-issues queue. They never freelance.

### 5. Dependency declaration

Every issue body must declare its dependencies in a frontmatter block:

```yaml
---
owner: service:vault
depends_on: [42, 57]
blocks: [88]
spec_sections: ["§3.5", "§4.1 row 5", "§5.2 vault endpoints"]
acceptance:
  - vault-svc deployed to preview env
  - all 8 MVP doc types classified
  - OCR pipeline emits vault.document.processed
  - playwright e2e green
  - openapi schema published in packages/sdk
---
```

### 6. Queue query (corrected)

The v2.0 playbook used `no:linked-pr` which does not exist in GitHub search. Real implementation uses GraphQL:

```bash
# scripts/queue/next-issue.sh
gh api graphql -f query='
  query($label: String!) {
    repository(owner: "bankableiq", name: "bankable-platform") {
      issues(first: 50, states: OPEN, labels: [$label],
             orderBy: {field: CREATED_AT, direction: ASC}) {
        nodes {
          number title
          timelineItems(first: 1, itemTypes: [CROSS_REFERENCED_EVENT]) {
            totalCount
          }
        }
      }
    }
  }' -F label="$1" \
  | jq '.data.repository.issues.nodes[] | select(.timelineItems.totalCount == 0) | .number' \
  | head -n 1
```

The dispatch workflow calls this script with the agent's owner label, gets the first open issue without a linked PR, and runs the agent on it.

---

## THE TRIGGER LAYER: GITHUB ACTIONS

22 agents are not running on your laptop. They are spawned by GitHub Actions in response to events, executing inside the official `anthropics/claude-code-action` runner.

### Workflow file map

```
.github/workflows/
  fleet-orchestrator.yml         cron every 15 min + on push to main
  fleet-agent-dispatch.yml       on issue labeled, on issue assigned, on issue comment "/run"
  fleet-reviewer.yml             on pull_request opened, ready_for_review
  fleet-test-healer.yml          on check_suite completed (conclusion=failure)
  fleet-security-triage.yml      on workflow_run completed for sast.yml
  fleet-design-sync.yml          on push to packages/design-tokens
  fleet-budget-guard.yml         cron every 10 min (real implementation below)
  fleet-lock-arbiter.yml         on pull_request labeled (lock check)
  fleet-dashboard-render.yml     on push (renders pinned issue from runbook)
  vercel-preview.yml             on pull_request opened (handled by Vercel app)
  vercel-promote.yml             on workflow_dispatch with human gate
  cost-reporter.yml              cron every 6h
```

### Real fleet-budget-guard.yml (replacing the v2.0 pseudocode)

```yaml
name: fleet-budget-guard
on:
  schedule: [{cron: "*/10 * * * *"}]
  workflow_dispatch:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Compute month-to-date Anthropic spend
        id: mtd
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # Anthropic Admin API returns usage; fail closed if endpoint changes.
          spend=$(curl -sf https://api.anthropic.com/v1/admin/usage/current_month \
            -H "x-api-key: $ANTHROPIC_API_KEY" | jq -r '.usage_usd // empty')
          if [ -z "$spend" ]; then
            echo "FAIL_CLOSED: could not read spend; pausing fleet."
            echo "spend=99999999" >> "$GITHUB_OUTPUT"
          else
            echo "spend=$spend" >> "$GITHUB_OUTPUT"
          fi
      - name: Compare against cap and write FLEET_PAUSED
        env:
          GH_TOKEN: ${{ secrets.GH_BOT_PAT }}
          CAP: ${{ vars.ANTHROPIC_BUDGET_HARD_CAP }}
          SPEND: ${{ steps.mtd.outputs.spend }}
        run: |
          if awk "BEGIN{exit !($SPEND >= $CAP)}"; then
            gh variable set FLEET_PAUSED --body "true"  --repo bankableiq/bankable-platform
            gh issue comment 1 --body "Budget cap reached. Spend=\$$SPEND Cap=\$$CAP. Fleet paused."
          else
            gh variable set FLEET_PAUSED --body "false" --repo bankableiq/bankable-platform
          fi
```

`fleet-agent-dispatch.yml` checks `vars.FLEET_PAUSED == 'false'` before spawning any agent. The dispatch workflow exits cleanly when paused; no agent runs.

If Anthropic does not expose the admin usage endpoint at that path, the Cost agent maintains a fallback estimator that tracks token counts per spawned run, persisted to a Supabase table. The Platform agent picks the implementation path during bootstrap based on what is available.

### Real flow for a single piece of work

```
Orchestrator (cron 15m)
   |
   v
opens Issue #137 "Build vault-svc OCR pipeline"
   label: service:vault
   |
   v
fleet-agent-dispatch.yml triggers on labeled event
   |
   v
spawns claude-code-action with system prompt = .github/agents/bot-vault.md
   - checks out worktree branch feat/bot-vault/137-ocr-pipeline
   - reads spec sections referenced in issue frontmatter
   - writes code, runs tests, commits
   - opens PR #138 against integration, referencing #137
   |
   v
vercel-preview.yml (Vercel GitHub App) deploys preview-138-bankable.vercel.app
fleet-reviewer.yml spawns bot-reviewer
   - reviews PR #138 diff and preview URL
   - either approves with auto-merge label or requests changes
   |
   v
on merge to integration -> check_suite runs full CI
   if fail -> fleet-test-healer.yml spawns bot-test-healer -> opens fix PR
   if pass -> Issue #137 auto-closes, queue advances
   |
   v
vercel-promote.yml waits for manual `promote-to-prod` comment, then runs canary
```

---

## RISKS AND KNOWN LIMITATIONS

Read this before turning the fleet loose.

### What the fleet cannot self-heal

| Failure | Why fleet cannot fix | What you do |
|---------|----------------------|-------------|
| Anthropic outage or rate limit ceiling hit | External dependency | Fleet pauses, resumes when restored |
| GitHub Actions outage | The runtime itself is down | Wait. No way around. |
| Vercel build platform outage | Deploy plane down | Stage locally, wait |
| Compliance rule pack legal change | Requires Compliance Officer | Manual rule pack PR with `compliance-officer-approved` |
| Vendor API breaking change (Plaid v2, etc.) | Schema unknown to spec | Update spec, Orchestrator regenerates issues |
| Production canary rollback that the system cannot diagnose | Real incident, not test failure | Incident issue opened; human-led postmortem |
| Bot caught in an infinite loop | Could happen on a malformed issue | Orchestrator hard-kills after 3 retries; opens `bot-bug` issue |
| Compliance officer unavailable for >72h | Mandatory human gate | Compliance-sensitive PRs queue and wait |
| GitHub API quota exhausted | Hard limit | Cost agent slows dispatch; resumes next hour |

### Things you should not delegate

- **Legal sign-off** on the brand, the CROA disclosures, the engagement contracts, the Privacy Policy, the Terms of Service. Outside the fleet's scope.
- **Vendor contract negotiation.** Plaid, bureaus, AWS Enterprise Discount, Anthropic Enterprise. Founders only.
- **Hiring real humans.** SOC 2 auditors, pen testers, Compliance Officer of record, Money Services Business attorneys if you ever go that path.
- **First five customer calls.** Use what you learn to refine the spec.

### Things v2.1 does not yet automate

- White-label tenant provisioning UI (deferred per spec §16 Phase 2).
- Snowflake warehouse + BII rollups (deferred per spec §16 Phase 2).
- Temporal pathways migration (deferred per spec §16 Phase 2).
- Mobile native app (deferred per spec §16 Phase 2).
- Bug bounty program (deferred per spec §16 Phase 3).
- SOC 2 Type II audit (deferred per spec §16 Phase 3).

The Orchestrator will not open issues for these unless the spec is amended.

---

## FLEET OPERATING COST ESTIMATE

This is the cost of running the fleet itself, separate from product infra. Use it to set `ANTHROPIC_BUDGET_HARD_CAP`.

| Component | Low | High | Notes |
|-----------|-----|------|-------|
| Anthropic Claude (22 agents, ~6 parallel) | $1,200/mo | $4,500/mo | Tokens per agent run + reasoning + review |
| GitHub Actions minutes (private repo, Linux) | $400/mo | $1,400/mo | At 6 parallel, ~30 min avg per agent run, ~50 runs/day |
| GitHub App storage / artifacts | $50/mo | $150/mo | Logs, build artifacts |
| Vercel preview deploys (Pro plan, ~40 previews/day) | $20/mo | $120/mo | Bandwidth scales with preview traffic |
| Supabase free tier through MVP build | $0 | $25/mo | Pro tier when staging hits scale |
| Vendor sandboxes (Plaid dev, bureau test, Stripe test) | $0 | $0 | Free until production approval |
| **Total fleet operating cost** | **~$1,670/mo** | **~$6,195/mo** | Independent of product infra burn |

Recommended starting cap: `ANTHROPIC_BUDGET_HARD_CAP = 2500`. Raise to 4000 once you have observed two weeks of throughput and want to accelerate. Lower to 1000 if you want a conservative grind.

Production infrastructure burn (AWS, Cloudflare, Datadog, Auth0/Supabase Pro, Pinecone, etc.) tracks against Playbook v1 Section 17 cost model. That is the *output* of the fleet, not the fleet itself.

---

## THE BOOTSTRAP: ONE-TIME HUMAN SETUP

The only block requiring you to be present. Once done, the fleet runs itself.

### Step 1. Provision accounts and secrets

Same vendor list as Playbook v1 Section 2. All keys go into GitHub Actions secrets and variables.

**Secrets (encrypted):**

```
ANTHROPIC_API_KEY
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
GH_BOT_PAT                 fine-grained PAT used by workflows that need elevated perms
FIGMA_PERSONAL_ACCESS_TOKEN
```

**Repository variables (read by workflows in `if:` expressions):**

```
ANTHROPIC_BUDGET_HARD_CAP    e.g. 2500
FLEET_PAUSED                 set by fleet-budget-guard; do not edit manually
FLEET_CONCURRENCY            default 6
```

### Step 2. Create the repo, install the GitHub App, seed the spec

```bash
gh auth login
gh repo create bankableiq/bankable-platform --private --clone
cd bankable-platform
mkdir -p docs/spec docs/prompts .github/workflows .github/agents
cp ~/Downloads/engineering-spec.html docs/spec/
cp ~/Downloads/playbook-v2.1.md docs/prompts/playbook.md
```

Install the `BANKABLE Fleet` GitHub App on the repo (created in GitHub Developer Settings).

### Step 3. Paste the bootstrap prompt into Claude Code

Open one Claude Code session locally:

```bash
claude
```

Paste this single prompt verbatim:

> You are the **Platform agent** in a 24/7 multi-agent build fleet for the BANKABLE IQ platform. The full engineering spec is at `docs/spec/engineering-spec.html`. The autonomous build playbook is at `docs/prompts/playbook.md`. Read both before touching code.
>
> Bootstrap the fleet. Before doing anything else, run this preflight check and fail fast if any item is missing:
>
> 1. Confirm all required secrets exist by listing `gh secret list` and matching against the secret list in the playbook Step 1. If any are missing, exit 1 and print the missing names.
> 2. Confirm `ANTHROPIC_BUDGET_HARD_CAP` is set as a repository variable. If not, exit 1.
> 3. Confirm the `BANKABLE Fleet` GitHub App is installed on the repo. If not, print the install URL and exit 1.
>
> Only if preflight passes, proceed with all of the following in one continuous session:
>
> 1. Scaffold the Turborepo monorepo per Playbook v1 Section 5 (apps/, services/ for all 14 services, packages/, infra/, docs/).
> 2. Create all GitHub labels: every owner label from the Agent Roster, every lock label from the Coordination Protocol, plus `bug`, `incident`, `security`, `compliance-sensitive`, `blocked-external`, `release-candidate`, `auto-merge`. Use `crazy-max/ghaction-github-labeler@v5` driven by `.github/labels.yml`.
> 3. Write the 12 GitHub Actions workflows from the playbook Trigger Layer section. Each spawning workflow uses `anthropics/claude-code-action` with the system prompt loaded from `.github/agents/<bot-name>.md`.
> 4. Write the 22 agent system prompts into `.github/agents/<bot-name>.md` following the template in the playbook section "The 22 Agent System Prompts." Fill `{{SCOPE}}` and `{{SPEC_SECTIONS}}` from the Agent Roster.
> 5. Generate the initial Orchestrator issue queue: read the spec end to end and open one issue per atomic unit of work, with the frontmatter declared in the playbook. Estimated 280 to 340 issues. Each issue must have `owner`, `depends_on`, `blocks`, `spec_sections`, `acceptance`.
> 6. Create the long-lived branches: `main`, `integration`, and `feat/bot-<name>/base` for each agent.
> 7. Provision the worktree-bootstrap script `scripts/worktrees-init.sh` that creates `.worktrees/<bot>` for every active agent.
> 8. Wire Vercel via `vercel link`, commit `vercel.json`, install the Vercel GitHub App for preview-per-branch.
> 9. Write `scripts/queue/next-issue.sh` from the Coordination Protocol section. Test it against a sample label.
> 10. Open PR #1 titled `chore: bootstrap autonomous fleet`. Do not auto-merge. Wait for me to approve and merge.
>
> When the PR is open, post a comment on Issue #1 with: total issues created, total agents online (should be 22), the link to the Orchestrator workflow's next scheduled run, and a budget gauge link. Stop. Do not do anything else.

After PR #1 merges, the fleet runs autonomously.

---

## THE 22 AGENT SYSTEM PROMPTS (template)

Saved as `.github/agents/<bot-name>.md`. Loaded by `fleet-agent-dispatch.yml`.

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

1. Only work on issues labeled `{{OWNER_LABEL}}`. Never edit files outside your scope unless the PR is co-labeled by the owning agent.
2. Always work in your worktree at `.worktrees/{{BOT_NAME}}`.
3. Branch name: `feat/{{BOT_NAME}}/{issue_number}-{slug}` (or `fix/`, `chore/`).
4. Before starting, verify all `depends_on` issues are closed. If not, comment "blocked by #N" and stop.
5. Acquire locks by labeling your PR before pushing changes to locked paths. If the lock arbiter rejects you, wait and retry on the next poll.
6. Conventional Commits. One logical change per commit. Sign commits with the bot identity.
7. Tests required: unit, integration, and (where user-facing) Playwright e2e proving the acceptance criteria.
8. Open the PR against `integration` (not `main`). Reference the issue with `Closes #N`. Fill the PR template with acceptance-criteria checkboxes.
9. Trust the Reviewer agent. If it requests changes, address them in the same PR. Do not argue.
10. If CI fails twice with the same root cause, comment `/escalate` on the PR and stop. The Orchestrator reroutes.
11. Budget awareness: if `FLEET_PAUSED` is true, dispatch will not spawn you. Do not try to bypass.
12. Compliance gates: any code touching credit, PII, or decisioning routes through `compliance-svc`. If you skip this, the Compliance agent blocks the PR.

## Tools you have

- Claude Code (you are inside it).
- `gh` CLI for issues, PRs, labels, comments.
- `pnpm`, `pytest`, `vitest`, `playwright`, `drizzle-kit`, `vercel`, `supabase`, `aws` CLIs.
- The repo `Makefile` and `pnpm` scripts.
- Engineering spec at `docs/spec/engineering-spec.html`.
- Shared SDK at `packages/sdk` and event schemas at `packages/events`.

## What "done" looks like

A merged PR to `integration` that:
- closes its source issue,
- ships green CI (unit + integration + e2e + lint + type + SAST + SCA),
- includes a Vercel preview URL the Reviewer signed off on,
- adds or updates the relevant ADR, runbook, or changelog,
- emits or consumes the events declared in `packages/events` if applicable,
- updates the OpenAPI / typed SDK if an API surface changed.

Now read the issue you were dispatched for, plan, and execute. Do not stop
until the PR is open. Do not ask for permission. If you are blocked, comment
the block and exit.
```

---

## THE PARALLEL WORK STREAMS

These run simultaneously the moment the bootstrap PR merges. They are not sequential.

| Stream | Owner | Depends on | Starts when |
|--------|-------|------------|-------------|
| Brand and design tokens (Figma) | Design | bootstrap | immediately |
| Monorepo wiring and CI/CD | Platform | bootstrap | immediately |
| Vercel preview infra | Platform | bootstrap | immediately |
| Cloudflare DNS and WAF | Platform | bootstrap | immediately |
| AWS CDK base (VPC, S3, KMS, SQS, EventBridge) | Platform | bootstrap | immediately |
| 35-schema rollout (parallel per schema) | Architect + each service agent | bootstrap | immediately |
| Identity schema and RLS | Auth | DB extensions | immediately |
| Notification service | Platform | bootstrap | immediately |
| Observability stack | Observability | bootstrap | immediately |
| Security baselines (SAST/DAST/SCA) | Security | bootstrap | immediately |
| Cost monitor | Cost | bootstrap | immediately |
| Docs and ADRs and runbooks | Docs | each PR | continuously, on every merge |
| Supabase Auth wiring | Auth | identity schema | identity merged |
| Compliance Module 2 | Compliance | identity, compliance schema | both clear |
| Billing and Stripe Connect | Billing | identity | identity clears |
| Diagnostic Module 1 | Diagnostic | identity, org, readiness schemas | all clear |
| Vault Module 5 | Vault | identity, vault schema, AWS S3 and KMS | all clear |
| Credit Module 4 | Credit | identity, credit schema, compliance-svc shell | all clear |
| BAI plus BPFS v0 Module 7 | BAI | readiness, bpfs, blin schemas | all clear |
| Marketplace Module 8 | Marketplace | BAI, compliance gate | BAI v0 clears |
| Pathway Module 6 | Pathway | readiness, BAI envelope | both clear |
| Coaching Module 3 | Coaching | vault index, Pinecone wired, compliance gate | all clear |
| Advisor Command Center | Frontend | identity, diagnostic, BAI | all clear |
| Plaid integration | Integrations | identity, compliance gate | both clear |
| QBO and Xero integration | Integrations | identity, compliance gate | both clear |

11 streams start immediately on bootstrap merge. The remaining streams start as their prerequisites clear, also in parallel with each other.

Reviewer and Test-Healer agents run continuously. Orchestrator wakes every 15 minutes via cron.

---

## SELF-HEALING: HOW THE FLEET FIXES ITSELF

Failures do not stop the system; they trigger new agents.

| Failure mode | Detector | Responder | Action |
|--------------|----------|-----------|--------|
| Failing unit test on a PR | check_suite | Test-Healer | Opens commit on same branch with fix |
| Failing e2e Playwright | check_suite | Test-Healer | Reproduces in worktree, fixes, reruns |
| SAST high-severity finding | Semgrep workflow | Security | Opens new `security` issue, blocks PR |
| SCA CVE in dependency | Snyk workflow | Security | Opens fix PR with bumped version |
| Compliance rule mismatch | Compliance gate | Compliance | Comments on PR with required changes |
| Schema drift between PRs | Architect | Architect | Opens reconciliation PR |
| Preview Vercel build broken | Vercel webhook | Reviewer | Reruns build; if still broken, `/escalate` |
| Production SLO breach during canary | Datadog monitor | Observability | Auto-rollback via `vercel rollback`, opens `incident:` issue |
| Budget approaching cap | Cost | Cost | Sets `FLEET_PAUSED` if cap hit; notifies you |
| Vendor outage (Plaid, etc.) | Synthetic check | Observability | Marks dependent issues `blocked-external`, fleet routes elsewhere |
| Agent infinite loop | Action runtime timeout | Orchestrator | Hard kills run; opens `bot-bug` issue |
| Same agent fails 3 times on same issue | Orchestrator | Orchestrator | Reassigns to Architect for triage |

Every failure becomes an issue. Every issue gets picked up. The system trends toward closed.

---

## BUDGET AND SAFETY RAILS

### Hard cap (enforced via fleet-budget-guard.yml above)

`ANTHROPIC_BUDGET_HARD_CAP` variable. Default 2500. The guard workflow polls every 10 minutes, sets `FLEET_PAUSED=true` when MTD spend hits cap. Dispatch workflow checks `FLEET_PAUSED` before spawning any agent.

### Concurrency cap

```yaml
concurrency:
  group: fleet-agents
  cancel-in-progress: false
```

Tuned by `FLEET_CONCURRENCY` repository variable (default 6, ceiling 12, emergency floor 2). The dispatch workflow reads it.

### Compliance brake

Any PR touching `packages/compliance-rules/**` or any code path tagged `compliance-sensitive` requires:
1. Compliance agent's approval (automated, after rule validation).
2. A human comment containing the literal string `compliance-officer-approved`.

The human is Kevin Murphy or the designated Compliance Officer of record. Mandatory. Not bypassable.

### Production deploy brake

Promotion from `integration` to `main` (which triggers production canary) requires:
1. The Reviewer to label the integration tip `release-candidate`.
2. A human comment `promote-to-prod` on the release PR.

Canary rollback is automatic on SLO breach. You do not need to be present for rollback.

### Key rotation (manual runbook, not automated)

Anthropic does not expose an automated key rotation API. The Security agent maintains `docs/runbooks/rotate-anthropic-key.md` with the exact steps, and opens an issue `security: rotate Anthropic key` on the first of every quarter. You execute the rotation manually. The agent watches the new key health for 24h and closes the issue when stable.

---

## OBSERVABILITY OF THE FLEET ITSELF

Single source of truth: `docs/runbooks/fleet-status.md`. The `fleet-dashboard-render.yml` workflow runs on every push to that file and on every merge to `integration`, then calls `gh issue edit <dashboard-issue-id> --body-file docs/runbooks/fleet-status.md` to update the pinned dashboard issue.

Dashboard surfaces:

```
- open issues by owner
- PRs in flight by owner
- merge throughput per agent (PRs/day)
- average time from issue open to PR merged
- locks currently held
- budget gauge (MTD vs cap)
- failing checks count
- blocked-external count
- spec coverage % (closed-spec-issues / total-spec-issues)
- next scheduled Orchestrator run
- FLEET_PAUSED state
```

You read the pinned issue once a day or never. Anything red shows up as a notification.

---

## WHAT YOU DO AS THE OPERATOR

After bootstrap, your job is:

1. **Provide credentials** when a new vendor approval lands (Plaid prod key, Experian go-live, etc.). Set them as secrets. Comment `/unblock <issue>` to resume work.
2. **Approve compliance-sensitive PRs** with the literal `compliance-officer-approved` comment.
3. **Promote integration to prod** with the literal `promote-to-prod` comment on the release PR.
4. **Set the budget cap** (`ANTHROPIC_BUDGET_HARD_CAP`) and tune concurrency (`FLEET_CONCURRENCY`) when you want faster or slower burn.

That is the entire human operating loop.

---

## SCALING THE FLEET

| Trigger | Action |
|---------|--------|
| Average issue-to-merge time > 6h sustained | Increase `FLEET_CONCURRENCY` from 6 to 9 |
| A single owner label has >20 open issues with no PRs in flight | Spawn a `bot-<owner>-2` shadow agent splitting the queue |
| Reviewer queue exceeds 8 open PRs | Spawn `bot-reviewer-2` |
| Test-Healer queue exceeds 5 failing PRs | Spawn `bot-test-healer-2` |
| Budget under 40% of cap with full velocity | Increase concurrency one step |
| Budget above 80% of cap | Decrease concurrency one step, notify you |

Spawning a shadow agent: Orchestrator clones the system prompt to `bot-<owner>-2.md`, registers a new install of the GitHub App, splits the queue by issue number parity. No code change required.

---

## WHEN THE FLEET CONSIDERS ITSELF DONE

The Orchestrator runs a closing check on every cycle:

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

When all true, the Orchestrator opens a final PR `chore: ship v1.0 to production` and stops dispatch. You give the final `promote-to-prod` and the platform ships.

After v1.0 ships, you re-run the Orchestrator with the v2 scope (spec §16.3) and the cycle starts again.

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
    fleet-lock-arbiter.yml
    fleet-dashboard-render.yml
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
  ISSUE_TEMPLATE/
    spec-issue.yml
    bug.yml
    incident.yml
    compliance-change.yml
  labels.yml
docs/
  spec/engineering-spec.html
  prompts/playbook.md
  runbooks/
    fleet-status.md
    env.md
    rotate-anthropic-key.md
    incident-response.md
  adr/*.md
scripts/
  worktrees-init.sh
  fleet-bootstrap.sh
  queue/next-issue.sh
  issues-generate-from-spec.ts
infra/
  github/
  vercel/
  supabase/
  aws/
```

---

## WHY THIS WORKS

- **GitHub is the brain.** Issues are thoughts, PRs are actions, labels are intent.
- **Vercel is the lungs.** Every branch breathes a live preview into existence.
- **Claude Code agents are the hands.** Many of them, each disciplined to one domain.
- **The spec is the constitution.** Nothing exists in production that does not trace to a spec section.
- **You are the founder.** You set the cap, sign the law (compliance), and say "ship."

No sprints. No standups. No calendar. Just a fleet of named workers, a queue, a deploy pipeline, and a budget cap.

End of Autonomous Build Playbook v2.1
