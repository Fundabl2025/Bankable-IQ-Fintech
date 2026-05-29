# Fleet Operations Runbook

## What is in this repo for the fleet

| Path | Purpose |
|------|---------|
| `.github/labels.yml` | Owner labels + lock labels + workflow labels (50+ labels) |
| `.github/agents/` | 27 agent system prompts (one per bot) + `_TEMPLATE.md` universal rules |
| `.github/workflows/` | 13 fleet workflow YAMLs (orchestrator, dispatch, reviewer, healer, security, design, budget, lock arbiter, dashboard, vercel preview/promote, cost, labeler) |
| `.github/ISSUE_TEMPLATE/` | 4 issue templates (spec-issue, bug, incident, compliance-change) |
| `scripts/queue/next-issue.sh` | GraphQL query for the next unblocked issue per owner |
| `scripts/worktrees-init.sh` | Provision a git worktree per active agent |
| `docs/strategy/FLEET-OPS-RUNBOOK.md` | This file |

## Activation checklist (founder/operator does these)

The fleet workflows are currently **dormant**. They will not spawn agents until these are configured.

### Step 1. Repository variables (Settings → Secrets and variables → Actions → Variables tab)

| Variable | Value | Notes |
|----------|-------|-------|
| `ANTHROPIC_BUDGET_HARD_CAP` | `3000` | USD per month. Fleet halts above this. |
| `FLEET_PAUSED` | `false` | Auto-managed by fleet-budget-guard. Default false. |
| `FLEET_CONCURRENCY` | `6` | Max parallel agent runs. Tune 2-12. |
| `FLEET_DASHBOARD_ISSUE_NUMBER` | (optional) | Pinned issue number for dashboard render |

### Step 2. Repository secrets (Settings → Secrets and variables → Actions → Secrets tab)

Minimum to activate the fleet:

| Secret | Where it goes |
|--------|---------------|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys → set monthly cap = $500 to start |
| `GH_BOT_PAT` | fine-grained PAT scoped to this repo, Contents/Issues/PRs read+write |

For production product runtime (not just fleet ops):

| Secret | Where it goes |
|--------|---------------|
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | vercel.com → Account Settings → Tokens |
| `SUPABASE_DB_URL`, `SUPABASE_ACCESS_TOKEN` | supabase.com project settings |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API keys |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | AWS IAM user with S3+KMS+Textract scope |
| `PLAID_CLIENT_ID`, `PLAID_SECRET` | dashboard.plaid.com |
| `DATADOG_API_KEY`, `SENTRY_DSN`, `PINECONE_API_KEY`, `FIGMA_PERSONAL_ACCESS_TOKEN` | per vendor portal |

### Step 3. Branch protection on main (Settings → Branches)

| Setting | Value |
|---------|-------|
| Require pull request before merging | YES |
| Required approvals | 1 |
| Dismiss stale approvals | YES |
| Require status checks to pass | YES |
| Require branches up to date | YES |
| Require conversation resolution | YES |
| Restrict who can push to matching branches | platform admins only |

### Step 4. Install the GitHub App (recommended for ongoing fleet operation)

Once Step 1-3 are done, create a GitHub App named "BANKABLE Fleet" at:
github.com/settings/apps/new

| Field | Value |
|-------|-------|
| Permissions: Contents | Read and write |
| Permissions: Issues | Read and write |
| Permissions: Pull requests | Read and write |
| Permissions: Workflows | Read and write |
| Permissions: Metadata | Read-only |
| Subscribe to events | Issue, Issue comment, Pull request, Pull request review, Push, Check run |

Install the app on `Fundabl2025/Bankable-IQ-Fintech`. Store the app id + private key as `GH_APP_ID` and `GH_APP_PRIVATE_KEY` repository secrets. Workflows will use these instead of `GH_BOT_PAT` going forward.

### Step 5. Run the worktree initializer (one-time, when the autonomous fleet starts shipping code)

After Step 4 completes and a bot is ready to run, the platform agent runs:

```bash
bash scripts/worktrees-init.sh
```

This provisions one isolated git worktree per agent under `.worktrees/`.

### Step 6. Run the labeler workflow (one-time)

Manually trigger via Actions → "Manage Repository Labels" → Run workflow.

This applies `.github/labels.yml` to the repo so the agent dispatch can resolve owner labels.

## Daily operator loop (you, founder)

The fleet runs continuously. Your daily input collapses to four things:

1. **Approve compliance-sensitive PRs** with literal `compliance-officer-approved` comment.
2. **Promote integration to prod** with literal `promote-to-prod` comment on the release PR.
3. **Provide vendor credentials** when a new approval lands (Plaid prod, bureau go-live, etc.). Add them as Actions secrets.
4. **Tune budget and concurrency** by editing the `ANTHROPIC_BUDGET_HARD_CAP` and `FLEET_CONCURRENCY` variables.

## How to manually run a single agent (for debugging)

Open any issue labeled with an owner label. Comment `/run`. The fleet-agent-dispatch workflow spawns that bot.

## Pause the fleet

Set `FLEET_PAUSED=true` repository variable. All dispatch workflows respect it.

## Status: dormant until activated

The workflows in `.github/workflows/` are skeleton implementations. They log intent but do not yet invoke `anthropics/claude-code-action`. Activation happens once `ANTHROPIC_API_KEY` is set and the action runner is wired in. PR #7 of the bootstrap stretch upgrades these workflows to call the real action.
