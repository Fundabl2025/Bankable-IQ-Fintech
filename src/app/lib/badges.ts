// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Badge System
// Milestone-based gamification layer tied to FundScore dimensions
// ════════════════════════════════════════════════════════════════════════════════

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
  category: 'assessment' | 'credit' | 'financial' | 'compliance' | 'score';
  /** Check if this badge is earned given current state */
  isEarned: (ctx: BadgeContext) => boolean;
  /** Human-readable hint shown when locked */
  hint: string;
}

export interface BadgeContext {
  hasAssessment: boolean;
  score: number;
  bankableScore: number;
  dimAvg: Record<string, number>;
}

export interface EarnedBadge {
  id: string;
  earnedAt: string; // ISO date string
}

const STORAGE_KEY = 'fundready_badges';

// ── Badge Definitions ──────────────────────────────────────────────────────────
export const BADGES: Badge[] = [
  // Assessment milestones
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Completed your FundReady assessment',
    icon: '🚀',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#10b981',
    category: 'assessment',
    isEarned: (ctx) => ctx.hasAssessment,
    hint: 'Complete your business assessment to earn this',
  },
  {
    id: 'score_revealed',
    name: 'Score Revealed',
    description: 'Viewed your full FundScore report',
    icon: '🔍',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#3b82f6',
    category: 'assessment',
    isEarned: (ctx) => ctx.hasAssessment && ctx.score > 0,
    hint: 'Complete your assessment and view your results',
  },

  // Credit milestones
  {
    id: 'club_680',
    name: '680 Club',
    description: 'Personal credit dimension is Strong or better',
    icon: '💳',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    color: '#8b5cf6',
    category: 'credit',
    isEarned: (ctx) => (ctx.dimAvg?.P ?? 0) >= 0.65,
    hint: 'Reach a Strong personal credit score (680+)',
  },
  {
    id: 'no_derogs',
    name: 'Clean Slate',
    description: 'No bankruptcies, judgments, or active collections',
    icon: '✅',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#22c55e',
    category: 'credit',
    isEarned: (ctx) => (ctx.dimAvg?.P ?? 0) >= 0.8,
    hint: 'Clear all derogatory marks from your credit profile',
  },

  // Financial health milestones
  {
    id: 'cash_flow_champion',
    name: 'Cash Flow Champion',
    description: 'Financial health dimension is Strong or Bankable',
    icon: '📈',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#f59e0b',
    category: 'financial',
    isEarned: (ctx) => (ctx.dimAvg?.F ?? 0) >= 0.75,
    hint: 'Demonstrate consistent revenue and low NSF activity',
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
    hint: 'Show 2+ years in business with stable operations',
  },

  // Compliance milestones
  {
    id: 'compliance_pro',
    name: 'Compliance Pro',
    description: 'Compliance dimension is Strong or Bankable',
    icon: '🛡️',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#ef4444',
    category: 'compliance',
    isEarned: (ctx) => (ctx.dimAvg?.C ?? 0) >= 0.75,
    hint: 'Have EIN, business license, and registered entity',
  },
  {
    id: 'file_ready',
    name: 'File Ready',
    description: 'File strength dimension is Strong or Bankable',
    icon: '📁',
    gradient: 'linear-gradient(135deg, #64748b, #475569)',
    color: '#64748b',
    category: 'compliance',
    isEarned: (ctx) => (ctx.dimAvg?.N ?? 0) >= 0.75,
    hint: 'Complete your financial documentation package',
  },

  // Score milestones
  {
    id: 'capital_ready',
    name: 'Capital Ready',
    description: 'FundScore reached 700+',
    icon: '💰',
    gradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
    color: '#10b981',
    category: 'score',
    isEarned: (ctx) => ctx.score >= 700,
    hint: 'Reach a FundScore of 700 or higher',
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
    hint: 'Reach a FundScore of 800 to unlock bank-grade products',
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
    hint: 'Reach a FundScore of 900 — elite capital access',
  },
  {
    id: 'sbss_bankable',
    name: 'SBSS Bankable',
    description: 'Bank Readiness Score crossed the 160 threshold',
    icon: '🎯',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#6366f1',
    category: 'score',
    isEarned: (ctx) => ctx.bankableScore >= 160,
    hint: 'Reach a Bank Readiness Score of 160+ (SBA-grade)',
  },
];

// ── Persistence ────────────────────────────────────────────────────────────────

export function getEarnedBadges(): EarnedBadge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEarnedBadges(badges: EarnedBadge[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
  } catch {
    // storage full or unavailable
  }
}

/**
 * Evaluate all badges against current context.
 * Returns an array of newly-earned badge IDs (not previously earned).
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
  }

  return newlyEarned;
}

export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
