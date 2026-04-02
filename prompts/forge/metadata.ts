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
  'forge-roadmap-s2':   { key: 'forge-roadmap-s2',    version: 'v1.0' },
  'forge-roadmap-s3':   { key: 'forge-roadmap-s3',    version: 'v1.0' },
} as const;

export type PromptKey = keyof typeof PROMPT_REGISTRY;

export const GLOBAL_FORBIDDEN_CLAIMS = [
  'guaranteed approval',
  'guaranteed funding',
  'lender will approve',
  'ensures funding',
  'instant funding success',
  'everyone gets approved',
  'secret lender hack',
  'beat the bank',
  'no credit check required',
  '100% approval rate',
];
