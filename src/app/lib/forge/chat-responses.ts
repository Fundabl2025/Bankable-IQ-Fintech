// ── FORGE Chat Response Templates ─────────────────────────────────────────────
// One function per intent. Each is called from getForgeResponse() in AICoach.tsx.
// Extracted verbatim — no logic changes, just isolated + versioned.

import { DIM_LABELS } from '../../pages/business-assessment/types';

export const PROMPT_KEY = 'forge-chat-responses';
export const PROMPT_VERSION = 'v1.0';
// Forbidden claims are enforced at runtime by guardrails.ts via GLOBAL_FORBIDDEN_CLAIMS
// in src/app/lib/forge/metadata.ts — do not redeclare here.

// ── Shared helpers ─────────────────────────────────────────────────────────────

export function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

// ── Intent: next step ─────────────────────────────────────────────────────────

export interface NextStepCtx {
  name: string; stage: 1|2|3; stageLabel: string;
  topIncompleteModule: string; topIncompleteModulePath: string;
  fundScore: number; weakestDim: string; weakestDimScore: number;
  preQualCount: number; bankableScore: number;
  totalModules: number; completedModules: number; pointsToBank: number;
}
export function nextStepResponse(ctx: NextStepCtx): string | null {
  const n = ctx.name || 'your business';
  if (ctx.stage === 1 && ctx.topIncompleteModule) {
    return `The single highest-impact action right now is completing your **${ctx.topIncompleteModule}** module. Here's why it matters: your FundScore is ${ctx.fundScore} and your weakest dimension is ${ctx.weakestDim} at ${ctx.weakestDimScore}%. Fixing the compliance foundation addresses that directly. Each module you complete adds 20-40 points. Go to: [${ctx.topIncompleteModulePath}]`;
  }
  if (ctx.stage === 2 && ctx.preQualCount > 0) {
    return `${n} has ${ctx.preQualCount} funding product${ctx.preQualCount !== 1 ? 's' : ''} pre-qualified right now. The next step is applying — specifically to start building a repayment track record. Even a small first draw creates a live credit event that starts reporting to D&B and Experian Business. That reporting is what moves your SBSS score from ${ctx.bankableScore} toward the 160 bankability threshold. [Go to Access Funding →]`;
  }
  return `You're in Stage ${ctx.stage}: ${ctx.stageLabel}. The most impactful next move: complete the remaining ${ctx.totalModules - ctx.completedModules} compliance modules — especially the ones in the "Getting Approved" category. Each one is worth 15-40 SBSS points. You're ${ctx.pointsToBank > 0 ? `${ctx.pointsToBank} points from the 160 bankability threshold` : 'past the bankability threshold — apply for SBA now'}.`;
}

// ── Intent: SBA / bank loans ──────────────────────────────────────────────────

export interface SbaCtx {
  name: string; bankableScore: number; pointsToBank: number;
  dimAvg: Record<string, number>;
}
export function sbaResponse(ctx: SbaCtx): string {
  const who = ctx.name ? `${ctx.name}'s` : 'Your';
  return `SBA loans require a SBSS score of 160+. ${who} current SBSS is **${ctx.bankableScore}/300** — ${ctx.pointsToBank > 0 ? `${ctx.pointsToBank} points away from eligibility` : '**above the threshold ✓**'}. \n\nThe SBSS is weighted: Personal Credit (35%), Business Financials (30%), Business Profile (20%), Business Credit Reports (15%). Your personal credit dimension is at ${Math.round((ctx.dimAvg['P'] || 0) * 100)}%. The fastest path to 160: complete comparable credit module (builds the 15% business credit component) and ensure all 13 compliance modules are done. Timeline from your current position: ${ctx.bankableScore >= 130 ? '60-90 days' : ctx.bankableScore >= 100 ? '90-150 days' : '150-240 days'}.`;
}

// ── Intent: score explanation ─────────────────────────────────────────────────

export interface ScoreCtx {
  fundScore: number; dimAvg: Record<string, number>;
  weakestDim: string; weakestDimScore: number;
}
export function scoreExplainResponse(ctx: ScoreCtx): string {
  const dims = Object.entries(DIM_LABELS).map(([k, label]) => {
    const pct = Math.round((ctx.dimAvg[k] || 0) * 100);
    const emoji = pct >= 70 ? '✓' : pct >= 40 ? '⚠' : '✗';
    return `${emoji} ${label}: ${pct}%`;
  }).join('\n');
  return `Your FundScore of **${ctx.fundScore}/1000** breaks down across 6 dimensions:\n\n${dims}\n\nYour lowest dimension is **${ctx.weakestDim} at ${ctx.weakestDimScore}%**. That's the highest-leverage area — improving it from ${ctx.weakestDimScore}% to 70%+ would add approximately ${Math.round((70 - ctx.weakestDimScore) * 2)} points to your total FundScore.`;
}

// ── Intent: SBSS / bankable score ─────────────────────────────────────────────

export interface SbssCtx {
  name: string; bankableScore: number; pointsToBank: number;
}
export function sbssResponse(ctx: SbssCtx): string {
  const who = ctx.name ? `${ctx.name} is` : 'You\'re';
  return `The SBSS (Small Business Scoring Service) is the 0-300 scale lenders and the SBA use internally to score businesses. **160 is the threshold** — below it, you're in automatic review or decline territory for SBA and most bank products.\n\n${who} at **${ctx.bankableScore}/300**. It's weighted: Personal Credit (35%), Business Financials (30%), Business Profile (20%), Business Credit Reports (15%). The fastest moves to raise it: establish business tradelines (the 15% component is often 0 for new businesses) and complete your compliance modules. You need ${ctx.pointsToBank} more points.`;
}

// ── Intent: timeline ──────────────────────────────────────────────────────────

export interface TimelineCtx {
  name: string; fundScore: number; bankableScore: number;
  completedModules: number; totalModules: number;
  preQualCount: number; pointsToBank: number;
}
export function timelineResponse(ctx: TimelineCtx): string {
  const who = ctx.name ? `${ctx.name}'s` : 'your';
  const stage1Days = ctx.completedModules >= 4 ? 7 : 30;
  return `Based on ${who} current profile (FundScore ${ctx.fundScore}, SBSS ${ctx.bankableScore}, ${ctx.completedModules}/${ctx.totalModules} modules done):\n\n**Alternative capital (MCA, Working Capital):** Available now — ${ctx.preQualCount > 0 ? `${ctx.preQualCount} products pre-qualified` : 'complete 2-3 compliance modules first'}\n\n**Traditional lending (Business Term Loans, Credit Unions):** ~${stage1Days + 60} days from today — requires consistent bank deposits and business credit profile forming\n\n**SBA / Bank Loans:** ~${ctx.bankableScore >= 130 ? '90 days' : ctx.bankableScore >= 100 ? '150 days' : '240 days'} — SBSS 160+ threshold needs to be crossed (${ctx.pointsToBank} points away)\n\nThe timeline compresses fast once you complete compliance modules and get first funding reporting.`;
}

// ── Intent: APR / cost of capital ────────────────────────────────────────────

export interface AprCtx {
  name: string; businessName: string;
  tier: string; pointsToBank: number;
}
export function aprResponse(ctx: AprCtx): string {
  const who = ctx.name ? ctx.name : 'your business';
  const aprRange = ctx.tier === 'Bankable' ? '8-15%' : ctx.tier === 'Approaching Bankable' ? '15-25%' : '35-50%+';
  return `Right now, ${who === 'your business' ? 'your' : `${who}'s`} tier is **${ctx.tier}** — which means the available capital costs **${aprRange} APR**.\n\nHere's what that means in real dollars: on a $250K loan, the difference between 35% and 10% APR is **$62,500/year in interest**. That's money that goes to lenders instead of back into ${ctx.businessName || 'the business'}.\n\nThe path to bank-rate capital is SBSS 160+ — ${ctx.pointsToBank > 0 ? `you need ${ctx.pointsToBank} more points` : 'you\'ve already crossed it'}. Every compliance module you complete moves you closer.`;
}

// ── Intent: pre-qualified programs ───────────────────────────────────────────

export interface PreQualCtx {
  name: string; preQualCount: number; actualMaxFunding: number;
}
export function preQualResponse(ctx: PreQualCtx): string {
  const who = ctx.name ? `${ctx.name} doesn't` : 'You don\'t';
  if (ctx.preQualCount === 0) {
    return `${who} have any pre-qualified programs yet. The fastest path to first qualification: complete the Entity & Filings, EIN & Licenses, and Business Banking compliance modules. Once those are done, Working Capital Loans and MCA products typically unlock. Complete your Business Success Scan too — the more data in the system, the more products can be evaluated.`;
  }
  const who2 = ctx.name ? `${ctx.name}'s` : 'your';
  return `Based on ${who2} profile, **${ctx.preQualCount} funding product${ctx.preQualCount !== 1 ? 's' : ''}** are pre-qualified right now. You can view and apply at [Access Funding →].\n\nThese are alternative capital products (${ctx.actualMaxFunding > 0 ? `up to ${fmt(ctx.actualMaxFunding)}` : ''}). As you complete more compliance modules, the pre-qualified list expands into traditional and bank products.`;
}

// ── Intent: what is FORGE ─────────────────────────────────────────────────────

export interface WhatIsForgeCtx {
  fundScore: number; bankableScore: number;
  completedModules: number; totalModules: number; preQualCount: number;
}
export function whatIsForgeResponse(ctx: WhatIsForgeCtx): string {
  return `FORGE™ is your capital transformation engine — an always-on AI coach that reads every data point in your Bankable IQ profile and tells you exactly what to do next to move from expensive alternative capital to institutional bank capital.\n\nI know your FundScore (${ctx.fundScore}), your SBSS score (${ctx.bankableScore}/300), which compliance modules are done (${ctx.completedModules}/${ctx.totalModules}), and which funding products you qualify for (${ctx.preQualCount} right now). Every answer I give uses your actual data — not generic advice.\n\nAsk me anything about your capital path, your scores, timelines, or specific products.`;
}

// ── Intent: compliance modules ────────────────────────────────────────────────

export interface ModulesCtx {
  name: string; completedModules: number; totalModules: number;
  topIncompleteModule: string; dimAvg: Record<string, number>;
}
export function modulesResponse(ctx: ModulesCtx): string {
  const who = ctx.name ? `${ctx.name} has` : 'You\'ve';
  const pct = Math.round((ctx.completedModules / ctx.totalModules) * 100);
  return `${who} completed **${ctx.completedModules} of ${ctx.totalModules} compliance modules** (${pct}%). ${ctx.topIncompleteModule ? `The next one to complete is **${ctx.topIncompleteModule}**.` : ''}\n\nCompliance is your FundScore's "C" dimension — currently at ${Math.round((ctx.dimAvg['C'] || 0) * 100)}%. Every module adds 15-40 FundScore points and directly affects your SBSS. The full suite is required for SBA approval. Go to [Lender Compliance →] to continue.`;
}

// ── Intent: blockers ──────────────────────────────────────────────────────────

export interface BlockersCtx {
  name: string; criticalBlockers: string[];
  bankableScore: number;
}
export function blockersResponse(ctx: BlockersCtx): string {
  const who = ctx.name ? ctx.name : 'your business';
  if (ctx.criticalBlockers.length > 0) {
    return `I'm seeing **${ctx.criticalBlockers.length} critical item${ctx.criticalBlockers.length !== 1 ? 's' : ''}** flagged in your profile:\n\n${ctx.criticalBlockers.map((b, i) => `${i + 1}. ${b}`).join('\n')}\n\nThese aren't minor flags — most lenders treat items like these as automatic disqualifiers. Fix these before anything else. The Denial Diagnosis tool ([here →](/app/denial-diagnosis)) breaks them down in detail.`;
  }
  return `No critical blockers detected in ${who === 'your business' ? 'your' : `${ctx.name}'s`} profile. The main limiting factor right now is your SBSS score (${ctx.bankableScore}/300) — it's not a blocker per se, but it's what separates your current alternative capital options from institutional bank capital. Complete compliance modules and establish business tradelines to close the gap.`;
}

// ── Intent: revenue / cash flow ───────────────────────────────────────────────

export interface RevenueCtx {
  name: string; monthlyRevenue: string; businessName: string;
  dimAvg: Record<string, number>;
}
export function revenueResponse(ctx: RevenueCtx): string {
  const who = ctx.name ? `${ctx.name}'s` : 'Your';
  return `${who} reported revenue is **${ctx.monthlyRevenue || 'not yet specified in your profile'}**. This feeds directly into your Financial Health dimension (currently ${Math.round((ctx.dimAvg['F'] || 0) * 100)}% — weighted at 25% of your FundScore).\n\nFor revenue-based products (Working Capital, MCA, Revenue-Based Loans), lenders typically want to see 3+ months of consistent bank deposits matching what you've reported. If there's a gap between reported and deposited revenue, that creates a verification flag. Update your assessment if revenue has changed — it affects which products you qualify for.`;
}

// ── Intent: default (catch-all) ───────────────────────────────────────────────

export interface DefaultCtx {
  name: string; fundScore: number; bankableScore: number;
  completedModules: number; totalModules: number; preQualCount: number;
  stage: 1|2|3; topIncompleteModule: string; pointsToBank: number;
}
export function defaultResponse(ctx: DefaultCtx): string {
  const who = ctx.name ? ctx.name : 'your business';
  return `Good question. Based on ${who === 'your business' ? 'your' : `${ctx.name}'s`} current profile — FundScore ${ctx.fundScore}, SBSS ${ctx.bankableScore}/300, ${ctx.completedModules}/${ctx.totalModules} compliance modules, ${ctx.preQualCount} pre-qualified products — here's what I'd focus on:\n\n${ctx.stage === 1 ? `Stage 1 Foundation: Complete ${ctx.topIncompleteModule || 'remaining compliance modules'} to unlock your first funding products.` : ctx.stage === 2 ? `Stage 2 Momentum: You have ${ctx.preQualCount} products ready. Apply now to start your repayment history and push your SBSS toward 160.` : `Stage 3 Bankable: You're ${ctx.pointsToBank} points from the institutional capital threshold. Focus on comparable credit and the CD loan strategy.`}\n\nAsk me anything more specific — timeline, specific products, what's blocking you, or how a particular score works.`;
}

// ── Intent: personal credit ───────────────────────────────────────────────────

export interface PersonalCreditCtx {
  name: string;
  bankableScore: number;
  pointsToBank: number;
  dimAvg: Record<string, number>;
  personalCredit: { composite: number; utilizationPct: number; hasAnyDerog: boolean; inquiries30d: string; } | null;
}
export function personalCreditResponse(ctx: PersonalCreditCtx): string {
  const who = ctx.name ? ctx.name : 'Your';
  const pc = ctx.personalCredit;
  const composite = pc?.composite ?? 0;
  const utilPct = pc?.utilizationPct ?? 0;
  const hasDerog = pc?.hasAnyDerog ?? false;
  const inq = pc?.inquiries30d ?? '0';
  const pcDimPct = Math.round((ctx.dimAvg['P'] || 0) * 100);

  const scoreLabel = composite >= 750 ? 'Exceptional' : composite >= 700 ? 'Good' : composite >= 660 ? 'Fair' : 'Needs work';
  const gate = composite >= 700 ? '700+ gate cleared' : `${700 - composite} points from the 700 gate`;

  return `${who === 'Your' ? 'Your' : `${ctx.name}'s`} personal credit composite is estimated at **${composite}** (${scoreLabel}) — ${gate}. *(Derived from the credit range you reported in your assessment — not a bureau pull.)*\n\nPersonal credit is **35% of your FICO SBSS score**, making it the single largest component. Your personal credit dimension is currently at ${pcDimPct}%.\n\nKey factors right now:\n- **Utilization:** ${utilPct}% — ${utilPct <= 10 ? 'excellent, keep it here' : utilPct <= 30 ? 'good, target under 10% for best SBSS impact' : 'high — paying down to under 30% is the fastest credit move'}\n- **Inquiries (30 days):** ${inq === '0' ? 'none — ideal' : inq + ' inquiry/ies — limit new applications until score stabilizes'}\n- **Derogatory items:** ${hasDerog ? 'flagged — address these first, they suppress your score' : 'none found — strong baseline'}\n\nThe SBSS 160 threshold requires your personal credit dimension to be above ~60%. Full report: [Personal Credit Report →](/app/status-reports/personal-credit).`;
}
