# Fleet Activation Notes (post-PR #8)

## Current state

The fleet is ACTIVATED. From the moment this PR merges to main:

- `fleet-orchestrator` runs every 15 minutes via cron. Reads the blueprint + spec, opens GitHub Issues for missing work (capped at 20 new issues per cycle).
- `fleet-agent-dispatch` fires when an issue gains an owner label, is assigned, or receives a `/run` comment. Spawns the matching agent with full context.
- `fleet-reviewer` fires on every PR open / synchronize. Reviews the diff and posts a review comment.
- `fleet-test-healer` fires when any check_suite completes with conclusion=failure. Opens fix commits.
- `fleet-security-triage` fires when SAST/SCA workflows fail. Files security issues.
- `fleet-design-sync` fires on changes to `packages/design-tokens/`. Regenerates downstream CSS.
- `cost-reporter` runs every 6 hours via cron. Updates the burn dashboard.

## Action and tool used

- **Action:** `anthropics/claude-code-base-action@v1` (the published Claude Code GitHub action)
- **Tool whitelist per agent:** scoped to what the agent needs (orchestrator gets `gh`, agents get `Bash,Read,Write,Edit,Glob,Grep`)
- **GitHub authentication:** `actions/create-github-app-token@v1` mints a fresh installation token from `GH_APP_ID` + `GH_APP_PRIVATE_KEY` for every workflow run. PAT-based authentication is fully retired.
- **Anthropic authentication:** `ANTHROPIC_API_KEY` repository secret (set by operator).
- **Concurrency cap:** `FLEET_CONCURRENCY` variable (default 6) — adjust under Settings → Variables.
- **Budget cap:** `ANTHROPIC_BUDGET_HARD_CAP` variable (default 3000 USD/month).
- **Pause switch:** `FLEET_PAUSED` variable. Set to `true` to halt all dispatch.

## First-hour expectations

Within 15 minutes of the merge, the first orchestrator run fires. It will:

1. Read `docs/blueprint/BANKABLE-Blueprint-v1.8.md`.
2. Read `docs/spec/engineering-spec-v1.0.html` and `docs/strategy/BANKABLE-IQ_SPEC-PATCH-v1.1_AND_BOOTSTRAP-RIDER.md`.
3. List currently open issues with `gh issue list`.
4. Identify gaps between spec and code. Open the first 20 issues with the proper owner label.

Each issue, once labeled, triggers `fleet-agent-dispatch`. The matching agent wakes up, reads the issue, writes code in a branch named `feat/<bot>/<issue>-<slug>`, opens a PR.

`fleet-reviewer` then reviews. `fleet-test-healer` patches any CI failures.

## How to pause everything

If anything goes wrong, set the `FLEET_PAUSED` variable to `true`:

```
gh variable set FLEET_PAUSED --body "true"
```

Or via the web UI: Settings → Secrets and variables → Actions → Variables → edit `FLEET_PAUSED`.

All dispatch workflows respect this within seconds.

## Operator daily loop

1. Check the Issues tab for the day's progress.
2. Approve compliance-sensitive PRs with `compliance-officer-approved` comment.
3. Promote integration → main with `promote-to-prod` comment on release PR.
4. Monitor the budget via the cost-reporter dashboard issue.

That is the entire operator job.

## What is still skeleton

`fleet-budget-guard.yml` still runs the Anthropic spend check directly via curl. It does not yet auto-write `FLEET_PAUSED`. A future small PR can switch it to use `gh variable set` once a GitHub App token is available. For now, the operator manually pauses if needed.

`fleet-lock-arbiter.yml` enforces lock label collisions via gh CLI in plain bash. Working as designed.

`fleet-dashboard-render.yml` updates the pinned dashboard issue from `docs/runbooks/fleet-status.md`. Works once the runbook exists (orchestrator will create it on first cycle).

`labeler.yml` applies `.github/labels.yml` via `crazy-max/ghaction-github-labeler@v5`. Trigger manually first time: Actions → Manage Repository Labels → Run workflow.

## Cost expectations (rough)

Per the Operator Companion v2.2:
- Anthropic: $1,200-$4,500/mo
- GitHub Actions minutes (Linux, private repo): $400-$1,400/mo
- Total fleet operating cost: ~$1,670-$6,195/mo

Starting cap: $3,000 (current `ANTHROPIC_BUDGET_HARD_CAP`).
