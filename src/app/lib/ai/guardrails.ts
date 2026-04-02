// ── FORGE Output Guardrails ───────────────────────────────────────────────────
// Post-render filter applied to all FORGE response strings before they are shown.
// Never blocks output — only logs warnings and strips banned phrases.
// If a banned phrase appears, it means a prompt template changed and should be reviewed.
//
// Phrase list source: GLOBAL_FORBIDDEN_CLAIMS in ../forge/metadata.ts
// To add or remove a banned phrase, edit that list — do not add phrases here.
//
// Usage:
//   import { checkForgeOutput } from '../lib/ai/guardrails';
//   const safeText = checkForgeOutput(responseText, 'chat-response');

import { GLOBAL_FORBIDDEN_CLAIMS } from '../forge/metadata';

/**
 * Check FORGE output for banned phrases.
 * Returns cleaned string (same as input if no issues found).
 * Never throws. Never blocks output.
 */
export function checkForgeOutput(text: string, context?: string): string {
  if (!text) return text;

  let cleaned = text;
  let flagged = false;

  for (const phrase of GLOBAL_FORBIDDEN_CLAIMS) {
    if (cleaned.toLowerCase().includes(phrase.toLowerCase())) {
      console.warn(`[FORGE guardrail] Banned phrase detected: "${phrase}"`, { context });
      cleaned = cleaned.replace(new RegExp(phrase, 'gi'), '[removed]');
      flagged = true;
    }
  }

  if (flagged) {
    console.error(
      '[FORGE guardrail] Output contained banned phrase(s). Review prompt template.',
      { context }
    );
  }

  return cleaned;
}
