// ── FORGE Greeting Template ───────────────────────────────────────────────────
// Shown immediately after the user's roadmap finishes building.
// Summarizes position and invites questions.

export const PROMPT_KEY = 'forge-greeting';
export const PROMPT_VERSION = 'v1.0';
// Forbidden claims are enforced at runtime by guardrails.ts via GLOBAL_FORBIDDEN_CLAIMS
// in src/app/lib/forge/metadata.ts — do not redeclare here.

export interface GreetingContext {
  name: string;
  fundScore: number;
  bankableScore: number;
  tier: string;
  pointsToBank: number;
  completedModules: number;
  totalModules: number;
  preQualCount: number;
  stage: 1 | 2 | 3;
}

export function greetingTemplate(ctx: GreetingContext): string {
  return (
    `${ctx.name ? `${ctx.name}, ` : ''}I've analyzed your complete Bankable IQ profile. Here's where you stand:\n\n` +
    `**FundScore: ${ctx.fundScore}/1000** (${ctx.tier})\n` +
    `**SBSS: ${ctx.bankableScore}/300** — ${ctx.pointsToBank > 0 ? `${ctx.pointsToBank} points to institutional capital` : '✓ Bankable threshold crossed'}\n` +
    `**Compliance: ${ctx.completedModules}/${ctx.totalModules} modules** complete\n` +
    `**Pre-qualified: ${ctx.preQualCount} funding product${ctx.preQualCount !== 1 ? 's' : ''}** ready to apply\n\n` +
    `**Your Capital Progression:**\n` +
    `→ Stage 1 (Fundable): $10K–$150K at 35%+ APR — alternative capital, available now\n` +
    `→ Stage 2 (Momentum): $50K–$500K at 15–25% APR — traditional products, ~30–120 days\n` +
    `→ Stage 3 (Bankable): $250K–$5M+ at 8–15% APR — institutional capital, SBSS 160+ required\n\n` +
    `You're currently in **Stage ${ctx.stage}**. ` +
    `${ctx.pointsToBank > 0 ? `Getting to Stage 3 saves ~$62K/year on a $250K loan.` : `You've reached the institutional capital tier.`} ` +
    `Your personalized roadmap is below — ask me anything.`
  );
}
