#!/usr/bin/env bash
# Find the next open issue for a given owner label that has no linked PR.
# Usage: scripts/queue/next-issue.sh service:vault
set -euo pipefail
label="${1:?owner label required}"

gh api graphql -f query='
  query($owner: String!, $repo: String!, $label: String!) {
    repository(owner: $owner, name: $repo) {
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
  }' \
  -F owner=Fundabl2025 \
  -F repo=Bankable-IQ-Fintech \
  -F label="${label}" \
  | jq -r '.data.repository.issues.nodes[] | select(.timelineItems.totalCount == 0) | .number' \
  | head -n 1
