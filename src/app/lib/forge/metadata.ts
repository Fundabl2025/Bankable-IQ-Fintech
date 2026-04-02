// ── FORGE Prompt Registry ─────────────────────────────────────────────────────
// Central version registry for all FORGE prompt templates.
// Increment PROMPT_VERSION when template content changes — never silently.
// FORBIDDEN_CLAIMS are checked by guardrails.ts at runtime.

export const PROMPT_REGISTRY = {
  'forge-greeting':     { key: 'forge-greeting',     version: 'v1.0' },
  'forge-chat-next':    { key: 'forge-chat-next',     version: 'v1.0' },
  'forge-chat-sba':     { key: 'forge-chat-sba',      version: 'v1.0' },
  'forge-chat-score':   { key: 'forge-chat-score',    version: 'v1.0' },
  'forge-chat-sbss':    { key: 'forge-chat-sbss',     version: 'v1.0' },
  'forge-chat-timeline':{ key: 'forge-chat-timeline', version: 'v1.0' },
  'forge-chat-apr':     { key: 'forge-chat-apr',      version: 'v1.0' },
  'forge-chat-prequal': { key: 'forge-chat-prequal',  version: 'v1.0' },
  'forge-chat-what':    { key: 'forge-chat-what',     version: 'v1.0' },
  'forge-chat-modules': { key: 'forge-chat-modules',  version: 'v1.0' },
  'forge-chat-blockers':{ key: 'forge-chat-blockers', version: 'v1.0' },
  'forge-chat-revenue': { key: 'forge-chat-revenue',  version: 'v1.0' },
  'forge-chat-default': { key: 'forge-chat-default',  version: 'v1.0' },
  'forge-roadmap-s1':   { key: 'forge-roadmap-s1',    version: 'v1.0' },
  'forge-chat-personal-credit': { key: 'forge-chat-personal-credit', version: 'v1.0' },
  'forge-roadmap-s2':   { key: 'forge-roadmap-s2',    version: 'v1.0' },
  'forge-roadmap-s3':   { key: 'forge-roadmap-s3',    version: 'v1.0' },
} as const;

export type PromptKey = keyof typeof PROMPT_REGISTRY;

// ── Forbidden claims — single source of truth ─────────────────────────────────
// This is the canonical list used both as authoring policy and runtime enforcement.
// guardrails.ts imports this list directly — adding a phrase here automatically
// adds it to runtime protection. Never remove a phrase without reviewing guardrails.ts.
//
// Reconciliation (2026-04-02, T-03):
//   Original GLOBAL_FORBIDDEN_CLAIMS (10) was a policy subset of the runtime BANNED_PHRASES (15).
//   The 5 additional runtime phrases are now merged here as the single superset.
export const GLOBAL_FORBIDDEN_CLAIMS = [
  // Core approval/funding guarantee claims (original policy list)
  'guaranteed approval',
  'guaranteed funding',
  'guaranteed loan',
  'lender will approve',
  'ensures funding',
  'ensures approval',
  'instant funding success',
  'everyone gets approved',
  // Predatory/hype language (runtime-only additions, now canonicalized)
  'secret lender hack',
  'beat the bank',
  'get money fast no matter what',
  'this changes everything forever',
  'no credit check required',
  'no questions asked',
  '100% approval rate',
];
