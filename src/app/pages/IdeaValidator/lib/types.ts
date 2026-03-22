// ════════════════════════════════════════════════════════════════════════════════
// Idea Validator Types
// ════════════════════════════════════════════════════════════════════════════════

export interface IdeaReport {
  id: string;
  userId: string;
  ideaDescription: string;
  createdAt: string;
  status: 'generating' | 'complete' | 'error';
  report: BusinessReport | null;
  error?: string;
}

export interface BusinessReport {
  businessOverview: BusinessOverview;
  marketResearch: MarketResearch;
  launchAndScale: LaunchAndScale;
  raiseCapital: RaiseCapital;
}

// ── Section 1: Business Overview ─────────────────────────────────────────────

export interface BusinessOverview {
  viabilityScore: number; // 0-100
  executiveSummary: string;
  businessModel: string;
  valueProposition: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  industryClassification: string;
  revenueModel: string;
}

// ── Section 2: Market Research ───────────────────────────────────────────────

export interface MarketResearch {
  marketSizeScore: number; // 0-100
  totalAddressableMarket: string;
  serviceableAddressableMarket: string;
  serviceableObtainableMarket: string;
  targetAudience: TargetAudience;
  competitionAnalysis: CompetitionAnalysis;
  marketTrends: string[];
  entryBarriers: string[];
}

export interface TargetAudience {
  primaryDemographic: string;
  painPoints: string[];
  buyingBehavior: string;
  customerSegments: string[];
}

export interface CompetitionAnalysis {
  directCompetitors: Competitor[];
  indirectCompetitors: string[];
  competitiveAdvantages: string[];
  marketPositioning: string;
}

export interface Competitor {
  name: string;
  strengths: string[];
  weaknesses: string[];
}

// ── Section 3: Launch & Scale ────────────────────────────────────────────────

export interface LaunchAndScale {
  readinessScore: number; // 0-100
  goToMarketStrategy: GoToMarketStrategy;
  milestones: Milestone[];
  growthTactics: string[];
  keyMetrics: string[];
  scalingChallenges: string[];
}

export interface GoToMarketStrategy {
  channels: string[];
  pricingStrategy: string;
  launchTimeline: string;
  mvpFeatures: string[];
  marketingApproach: string;
}

export interface Milestone {
  title: string;
  timeline: string;
  description: string;
}

// ── Section 4: Raise Capital ─────────────────────────────────────────────────

export interface RaiseCapital {
  fundingReadinessScore: number; // 0-100
  fundingOptions: FundingOption[];
  pitchTips: string[];
  financialProjections: FinancialProjections;
  investorTypes: string[];
  fundingTimeline: string;
}

export interface FundingOption {
  type: string;
  suitability: 'high' | 'medium' | 'low';
  description: string;
  typicalRange: string;
}

export interface FinancialProjections {
  year1Revenue: string;
  year2Revenue: string;
  year3Revenue: string;
  breakEvenTimeline: string;
  initialInvestment: string;
  keyAssumptions: string[];
}
