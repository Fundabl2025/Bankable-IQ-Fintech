/**
 * CAPITAL UNLOCK FORECASTER™
 * 
 * Answers the strategic question: "After X days of improvements, eligibility increases to $Y"
 * This is THE differentiator that makes FundReady a decision-first platform.
 * 
 * Inputs: Current FundScore, Current audit items completed, All audit items available
 * Outputs: Timeline to unlock funding milestones, Top 3 actions with highest capital impact
 */

import { AuditItem } from './businessData';

export interface CapitalUnlockMilestone {
  daysToAchieve: number;
  fundScoreProjected: number;
  capitalMin: number;
  capitalMax: number;
  description: string;
  mainActionNeeded: string;
}

export interface UnlockAction {
  auditItem: AuditItem;
  impactScore: number; // 0-100: how much this action increases capital
  capitalUnlocked: number;
  daysToComplete: number;
  reasoning: string;
}

export interface CapitalUnlockForecast {
  currentFundScore: number;
  currentCapitalMin: number;
  currentCapitalMax: number;
  milestones: CapitalUnlockMilestone[];
  topThreeActions: UnlockAction[];
  confidence: number; // 0-100: how confident is this forecast
  lastUpdated: string;
}

/**
 * Map FundScore (0-1000) to funding range
 * This mirrors the lending market's real expectations
 */
function scoreToCapitalRange(score: number): { min: number; max: number } {
  const normalizedScore = score / 10; // 0-1000 → 0-100
  
  if (normalizedScore >= 90) return { min: 80000, max: 100000 };
  if (normalizedScore >= 80) return { min: 60000, max: 80000 };
  if (normalizedScore >= 70) return { min: 40000, max: 60000 };
  if (normalizedScore >= 60) return { min: 20000, max: 40000 };
  if (normalizedScore >= 50) return { min: 5000, max: 20000 };
  return { min: 0, max: 5000 };
}

/**
 * Estimate how many points an audit item is worth when completed
 * Based on Master Build Spec - bankable items mapped to FICO impact
 */
function estimateAuditItemImpact(item: AuditItem): number {
  // Critical items (high impact on FICO/funding)
  const criticalKeywords = ['FICO', 'credit', 'EIN', 'collections', 'derogatory', 'bankruptcy'];
  if (criticalKeywords.some(k => item.name.toLowerCase().includes(k.toLowerCase()))) {
    return 8; // Each = ~80 points on FundScore
  }
  
  // Major items (medium impact)
  const majorKeywords = ['bank', 'entity', 'website', 'filing', 'NSF', 'balance'];
  if (majorKeywords.some(k => item.name.toLowerCase().includes(k.toLowerCase()))) {
    return 5; // Each = ~50 points
  }
  
  // Default: minor items worth ~20 points each
  return 2;
}

/**
 * Estimate days to complete an audit item
 * User context would normally come from user input, but this is reasonable default
 */
function estimateDaysToComplete(item: AuditItem): number {
  const easierItems = ['website', 'email', 'phone'];
  const mediumItems = ['entity', 'filing', 'bank', 'business plan'];
  const harderItems = ['credit', 'FICO', 'derogatory', 'collections', 'bankruptcy'];
  
  const name = item.name.toLowerCase();
  
  if (easierItems.some(k => name.includes(k))) return 3;
  if (mediumItems.some(k => name.includes(k))) return 7;
  if (harderItems.some(k => name.includes(k))) return 30;
  
  return 10; // Default: 10 days
}

/**
 * Generate the complete Capital Unlock Forecast
 * Shows user the path to funding with specific timelines and capital amounts
 */
export function generateCapitalUnlockForecast(
  currentFundScore: number,
  completedAuditItems: string[], // IDs of completed items
  allAuditItems: AuditItem[]
): CapitalUnlockForecast {
  const incompleteItems = allAuditItems.filter(
    item => !completedAuditItems.includes(item.id)
  );
  
  // Calculate impact of each incomplete item
  const actionImpacts: UnlockAction[] = incompleteItems.map(item => {
    const impactPoints = estimateAuditItemImpact(item);
    const daysToComplete = estimateDaysToComplete(item);
    
    return {
      auditItem: item,
      impactScore: impactPoints * 10, // Convert to 0-100 scale
      capitalUnlocked: impactPoints * 5000, // Each point = ~$5k capital
      daysToComplete,
      reasoning: `Completing "${item.name}" directly improves your ${getCategoryImpact(item.category)}, which lenders weight heavily.`,
    };
  });
  
  // Sort by impact and take top 3
  const topThreeActions = actionImpacts
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, 3);
  
  // Generate milestones: show progression if user completes top 3 actions
  const milestones: CapitalUnlockMilestone[] = [];
  let projectedScore = currentFundScore;
  let daysCumulative = 0;
  
  for (let i = 0; i < Math.min(3, topThreeActions.length); i++) {
    const action = topThreeActions[i];
    projectedScore += action.impactScore * 1.5; // Score increases ~1.5x the points gained
    daysCumulative += action.daysToComplete;
    
    if (projectedScore > 1000) projectedScore = 1000;
    
    const capitalRange = scoreToCapitalRange(projectedScore);
    
    milestones.push({
      daysToAchieve: daysCumulative,
      fundScoreProjected: Math.round(projectedScore),
      capitalMin: capitalRange.min,
      capitalMax: capitalRange.max,
      description: `After completing ${i + 1} recommended action${i > 0 ? 's' : ''}`,
      mainActionNeeded: action.auditItem.name,
    });
  }
  
  // Calculate confidence based on data completeness
  const completedRatio = completedAuditItems.length / allAuditItems.length;
  const confidence = Math.round(completedRatio * 100); // Higher confidence = more data
  
  const currentCapitalRange = scoreToCapitalRange(currentFundScore);
  
  return {
    currentFundScore: Math.round(currentFundScore),
    currentCapitalMin: currentCapitalRange.min,
    currentCapitalMax: currentCapitalRange.max,
    milestones,
    topThreeActions,
    confidence,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Describe how an audit category impacts lending decisions
 */
function getCategoryImpact(category: string): string {
  const impacts: Record<string, string> = {
    'credit-profile': 'credit profile and payment history',
    'documentation': 'required documentation and compliance',
    'cash-flow': 'ability to service debt',
    'banking-behavior': 'banking patterns and stability',
    'business-structure': 'business legitimacy and structure',
    'lender-compliance': 'lender compliance and readiness',
  };
  
  return impacts[category.toLowerCase()] || 'bankability';
}

/**
 * Get a plain-English summary of the forecast
 * Used in dashboards and communications
 */
export function getForecastSummary(forecast: CapitalUnlockForecast): string {
  if (forecast.topThreeActions.length === 0) {
    return 'Congratulations! You\'ve completed all recommended audit items.';
  }
  
  const firstAction = forecast.topThreeActions[0];
  const firstMilestone = forecast.milestones[0];
  
  return `By completing "${firstAction.auditItem.name}" in ${firstAction.daysToComplete} days, your funding eligibility could increase to $${firstMilestone.capitalMin.toLocaleString()}-$${firstMilestone.capitalMax.toLocaleString()}.`;
}
