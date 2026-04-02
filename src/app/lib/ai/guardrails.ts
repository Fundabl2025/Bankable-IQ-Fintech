// ── FORGE Output Guardrails ───────────────────────────────────────────────────
// Post-render filter applied to all FORGE response strings before they are shown.
// Never blocks output — only logs warnings and strips banned phrases.
// If a banned phrase appears, it means a prompt template changed and should be reviewed.
//
// Usage:
//   import { checkForgeOutput } from '../lib/ai/guardrails';
//   const safeText = checkForgeOutput(responseText, 'chat-response');

const BANNED_PHRASES = [
  'guaranteed approval',
  'guaranteed funding',
  'guaranteed loan',
  'lender will approve',
  'ensures funding',
  'ensures approval',
  'instant funding success',
  'everyone gets approved',
  'secret lender hack',
  'beat the bank',
  'get money fast no matter what',
  'this changes everything forever',
  'no credit check required',
  'no questions asked',
  '100% approval rate',
];

/**
 * Check FORGE output for banned phrases.
 * Returns cleaned string (same as input if no issues found).
 * Never throws. Never blocks output.
 */
export function checkForgeOutput(text: string, context?: string): string {
  if (!text) return text;

  let cleaned = text;
  let flagged = false;

  for (const phrase of BANNED_PHRASES) {
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
