#!/usr/bin/env bash
# Provision a git worktree per active agent so multiple bots do not collide.
# Usage: scripts/worktrees-init.sh
set -euo pipefail

agents=(
  bot-orchestrator bot-architect bot-platform bot-auth bot-diagnostic
  bot-compliance bot-coaching bot-credit bot-vault bot-pathway bot-bai
  bot-marketplace bot-billing bot-frontend bot-design bot-integrations
  bot-reviewer bot-test-healer bot-security bot-observability bot-docs
  bot-cost bot-console bot-demo bot-explainer bot-archeologist bot-backup
)

mkdir -p .worktrees
for bot in "${agents[@]}"; do
  branch="feat/${bot}/base"
  if ! git show-ref --verify --quiet "refs/heads/${branch}"; then
    git branch "${branch}" integration 2>/dev/null || git branch "${branch}" main
  fi
  if [ ! -d ".worktrees/${bot}" ]; then
    git worktree add ".worktrees/${bot}" "${branch}"
  fi
done

echo "Worktrees provisioned: $(ls .worktrees/ | wc -l)"
