// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Badge System
// Milestone-based gamification layer tied to real user actions + FundScore
// ════════════════════════════════════════════════════════════════════════════════

import { setDataItem, getDataItem } from './data-adapter';

export interface Badge {
  id: string;
  name: string;
  description: string;
  /** Icon emoji */
  icon: string;
  /** Gradient CSS string for the badge card */
  gradient: string;
  /** Color for glow/border */
  color: string;
  /** Category grouping */
  category: 'assessment' | 'credit' | 'financial' | 'compliance' | 'score' | 'action';
  /** Check if this badge is earned given current state */
  isEarned: (ctx: BadgeContext) => boolean;
  /** Human-readable hint shown when locked */
  hint: string;
  /** Where to navigate to earn this badge */
  actionPath: string;
  /** Short action label for the CTA button */
  actionLabel: string;
}

export interface BadgeContext {
  hasAssessment: boolean;
  score: number;
  bankableScore: number;
  dimAvg: Record<string, number>;
  resultsViewed?: boolean;
  // Action-based context
  completedModuleCount: number;   // # of compliance modules fully completed
  totalApplications: number;      // # of lender pipeline applications ever submitted
  fundedCount: number;            // # of applications with status === 'funded'
  initialScore?: number;          // score from very first assessment (for improvement badge)
}

export interface EarnedBadge {
  id: string;
  earnedAt: string; // ISO date string
}

const STORAGE_KEY = 'fundready_badges';

// ── Badge Definitions ──────────────────────────────────────────────────────────
export const BADGES: Badge[] = [

  // ── Assessment milestones ────────────────────────────────────────────────────
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Completed your Business Success Scan',
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#10b981',
    category: 'assessment',
    isEarned: (ctx) => ctx.hasAssessment,
    hint: 'Complete the 33-question Business Success Scan',
    actionPath: '/business-assessment',
    actionLabel: 'Start Scan',
  },
  {
    id: 'report_reviewed',
    name: 'Report Reviewed',
    description: 'Opened your full FundScore results report',
    icon: '🔍',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#3b82f6',
    category: 'assessment',
    isEarned: (ctx) => ctx.resultsViewed === true,
    hint: 'Complete the scan then open your full results report',
    actionPath: '/business-assessment/results',
    actionLabel: 'View Report',
  },

  // ── Credit milestones ────────────────────────────────────────────────────────
  {
    id: 'club_680',
    name: '680 Club',
    description: 'Personal credit dimension is Strong or better',
    icon: '💳',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    color: '#8b5cf6',
    category: 'credit',
    isEarned: (ctx) => (ctx.dimAvg?.P ?? 0) >= 0.65,
    hint: 'Reach 680+ personal credit score with no major derogatories',
    actionPath: '/app/status-reports',
    actionLabel: 'View Credit',
  },
  {
    id: 'strong_credit',
    name: 'Strong Credit',
    description: 'Personal credit profile is excellent — 740+ territory',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#22c55e',
    category: 'credit',
    isEarned: (ctx) => (ctx.dimAvg?.P ?? 0) >= 0.80,
    hint: 'Build personal credit to 740+ with clean payment history',
    actionPath: '/app/status-reports',
    actionLabel: 'View Credit',
  },

  // ── Financial health milestones ──────────────────────────────────────────────
  {
    id: 'cash_flow_champion',
    name: 'Cash Flow Champion',
    description: 'Financial health dimension is Strong or Bankable',
    icon: '📈',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#f59e0b',
    category: 'financial',
    isEarned: (ctx) => (ctx.dimAvg?.F ?? 0) >= 0.75,
    hint: 'Show consistent revenue + maintain $10K+ avg daily bank balance',
    actionPath: '/app/finances',
    actionLabel: 'View Finances',
  },
  {
    id: 'two_year_track',
    name: '2-Year Track Record',
    description: 'Business stability dimension is Strong or Bankable',
    icon: '📅',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    color: '#06b6d4',
    category: 'financial',
    isEarned: (ctx) => (ctx.dimAvg?.S ?? 0) >= 0.75,
    hint: 'Reach 2+ years in business — update your scan when you hit this milestone',
    actionPath: '/business-assessment',
    actionLabel: 'Update Scan',
  },

  // ── Compliance action milestones ─────────────────────────────────────────────
  {
    id: 'first_module',
    name: 'First Module',
    description: 'Completed your first lender compliance module',
    icon: '🎯',
    gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
    color: '#10b981',
    category: 'compliance',
    isEarned: (ctx) => ctx.completedModuleCount >= 1,
    hint: 'Complete any 1 of the 13 lender compliance modules',
    actionPath: '/app/lender-compliance',
    actionLabel: 'Start Module',
  },
  {
    id: 'compliance_pro',
    name: 'Compliance Pro',
    description: 'Completed 7+ lender compliance modules',
    icon: '🛡️',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#3b82f6',
    category: 'compliance',
    isEarned: (ctx) => ctx.completedModuleCount >= 7,
    hint: 'Complete 7 of the 13 lender compliance modules',
    actionPath: '/app/lender-compliance',
    actionLabel: 'Continue Modules',
  },
  {
    id: 'compliance_complete',
    name: 'Compliance Complete',
    description: 'Completed all 13 compliance modules — fully lender-ready',
    icon: '🏅',
    gradient: 'linear-gradient(135deg, #f59e0b, #10b981)',
    color: '#f59e0b',
    category: 'compliance',
    isEarned: (ctx) => ctx.completedModuleCount >= 13,
    hint: 'Complete all 13 lender compliance modules — the full verification stack',
    actionPath: '/app/lender-compliance',
    actionLabel: 'Finish Modules',
  },
  {
    id: 'file_ready',
    name: 'File Ready',
    description: 'File strength dimension is Strong or Bankable',
    icon: '📁',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    color: '#8b5cf6',
    category: 'compliance',
    isEarned: (ctx) => (ctx.dimAvg?.N ?? 0) >= 0.75,
    hint: 'Complete your document collection and financial file package',
    actionPath: '/app/document-collection',
    actionLabel: 'Document Portal',
  },

  // ── Action milestones — funding pipeline ─────────────────────────────────────
  {
    id: 'first_application',
    name: 'First Application',
    description: 'Submitted your first lender application',
    icon: '📬',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#6366f1',
    category: 'action',
    isEarned: (ctx) => ctx.totalApplications >= 1,
    hint: 'Apply for any pre-qualified funding product',
    actionPath: '/app/access-funding',
    actionLabel: 'Apply Now',
  },
  {
    id: 'funded',
    name: 'Funded!',
    description: 'Capital secured — a lender funded your business',
    icon: '💸',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    color: '#f59e0b',
    category: 'action',
    isEarned: (ctx) => ctx.fundedCount >= 1,
    hint: 'Get a pre-qualified application accepted and funded',
    actionPath: '/app/access-funding',
    actionLabel: 'Access Funding',
  },

  // ── Score milestones ─────────────────────────────────────────────────────────
  {
    id: 'score_climber',
    name: 'Score Climber',
    description: 'Improved FundScore by 100+ points from your starting baseline',
    icon: '📊',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
    color: '#10b981',
    category: 'score',
    isEarned: (ctx) =>
      ctx.initialScore !== undefined && ctx.score - ctx.initialScore >= 100,
    hint: 'Improve your FundScore by 100+ points — fix blockers and complete compliance',
    actionPath: '/app/denial-diagnosis',
    actionLabel: 'Fix Blockers',
  },
  {
    id: 'capital_ready',
    name: 'Capital Ready',
    description: 'FundScore reached 700+',
    icon: '💰',
    gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
    color: '#10b981',
    category: 'score',
    isEarned: (ctx) => ctx.score >= 700,
    hint: 'Reach FundScore 700 — complete compliance modules to push your score',
    actionPath: '/app/lender-compliance',
    actionLabel: 'Boost Score',
  },
  {
    id: 'bankable',
    name: 'Bankable',
    description: 'FundScore reached 800+ — lender-ready',
    icon: '🏦',
    gradient: 'linear-gradient(135deg, #f59e0b, #10b981)',
    color: '#f59e0b',
    category: 'score',
    isEarned: (ctx) => ctx.score >= 800,
    hint: 'Reach FundScore 800 — complete all compliance modules and fix critical blockers',
    actionPath: '/app/my-progress',
    actionLabel: 'View Progress',
  },
  {
    id: 'elite',
    name: 'Elite Status',
    description: 'FundScore reached 900+ — top 5% of applicants',
    icon: '⭐',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    color: '#ef4444',
    category: 'score',
    isEarned: (ctx) => ctx.score >= 900,
    hint: 'Reach FundScore 900 — elite capital access, top 5% of applicants',
    actionPath: '/app/my-progress',
    actionLabel: 'View Progress',
  },
  {
    id: 'sbss_bankable',
    name: 'SBSS Bankable',
    description: 'Bank Readiness Score crossed the SBA threshold of 160',
    icon: '🎖️',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#6366f1',
    category: 'score',
    isEarned: (ctx) => ctx.bankableScore >= 160,
    hint: 'Reach SBSS 160+ — the SBA minimum for automated loan approval',
    actionPath: '/app/lender-compliance',
    actionLabel: 'Build SBSS',
  },
];

// ── Persistence ────────────────────────────────────────────────────────────────

/** Synchronous read from localStorage — fast, used by BadgeGrid at render time */
export function getEarnedBadges(): EarnedBadge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save badges to localStorage AND Supabase (via data-adapter).
 * Fire-and-forget for Supabase — localStorage is always written synchronously.
 */
export function saveEarnedBadges(badges: EarnedBadge[]): void {
  try {
    const json = JSON.stringify(badges);
    localStorage.setItem(STORAGE_KEY, json);
    setDataItem(STORAGE_KEY, json).catch(() => {});
  } catch {
    // storage full or unavailable
  }
}

/**
 * Load badges from Supabase into localStorage on login.
 */
export async function syncBadgesFromCloud(): Promise<void> {
  try {
    await getDataItem(STORAGE_KEY);
  } catch {
    // non-fatal
  }
}

/**
 * Evaluate all badges against current context.
 * Returns newly-earned badge IDs (not previously earned).
 * Also dispatches 'badgeNewlyEarned' window event for cross-component toasts.
 */
export function checkAndAwardBadges(ctx: BadgeContext): string[] {
  const earned = getEarnedBadges();
  const earnedIds = new Set(earned.map((b) => b.id));
  const newlyEarned: string[] = [];

  for (const badge of BADGES) {
    if (!earnedIds.has(badge.id) && badge.isEarned(ctx)) {
      earned.push({ id: badge.id, earnedAt: new Date().toISOString() });
      newlyEarned.push(badge.id);
    }
  }

  if (newlyEarned.length > 0) {
    saveEarnedBadges(earned);
    window.dispatchEvent(
      new CustomEvent('badgeNewlyEarned', { detail: { ids: newlyEarned } })
    );
  }

  return newlyEarned;
}

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}

// ── Initial score tracking ─────────────────────────────────────────────────────

/**
 * Call this the first time an assessment score is computed.
 * Saves the baseline score once — never overwritten — for the Score Climber badge.
 */
export function recordInitialScore(score: number): void {
  if (!localStorage.getItem('fundready_initial_score')) {
    localStorage.setItem('fundready_initial_score', String(score));
  }
}

export function getInitialScore(): number | undefined {
  const raw = localStorage.getItem('fundready_initial_score');
  if (!raw) return undefined;
  const n = parseInt(raw, 10);
  return isNaN(n) ? undefined : n;
}
