// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Membership Tier System
// Three goals, three access tiers
//   free    → Goal #1 only: scan + initial funding
//   virtual → Goal #2 unlocked: 13 compliance modules + virtual coaching
//   live    → Goal #3: done-for-you compliance + live human coach
// ════════════════════════════════════════════════════════════════════════════════

export type MembershipTier = 'free' | 'virtual' | 'live';

const STORAGE_KEY = 'fundready_membership_tier';

export function getMembershipTier(): MembershipTier {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'virtual' || stored === 'live') return stored as MembershipTier;
  } catch { /* storage unavailable */ }
  return 'free';
}

export function setMembershipTier(tier: MembershipTier): void {
  try {
    localStorage.setItem(STORAGE_KEY, tier);
    window.dispatchEvent(new Event('membershipUpdated'));
  } catch { /* storage unavailable */ }
}

/** Can the user access the 13 compliance modules (Goal #2)? */
export function canAccessGoal2(tier: MembershipTier = getMembershipTier()): boolean {
  return tier === 'virtual' || tier === 'live';
}

export function getTierLabel(tier: MembershipTier): string {
  if (tier === 'live') return 'Live Coached';
  if (tier === 'virtual') return 'Virtual Coached';
  return 'Free Member';
}

export function getTierColor(tier: MembershipTier): string {
  if (tier === 'live') return '#f59e0b';
  if (tier === 'virtual') return '#10b981';
  return '#64748b';
}

export const TIER_FEATURES = {
  free: [
    'Business Success Scan (FundScore)',
    'Pre-qualified funding results',
    'Apply for initial funding',
    'View bankable status indicator',
  ],
  virtual: [
    'Everything in Free',
    '13 Lender Compliance modules',
    '90+ virtual coaching videos',
    'Step-by-step bankability guide',
    'FORGE™ AI Coach full access',
  ],
  live: [
    'Everything in Virtual',
    'Done-for-you compliance completion',
    'Live professional coach (12 months)',
    'Business directory listings',
    'Priority application support',
  ],
};
