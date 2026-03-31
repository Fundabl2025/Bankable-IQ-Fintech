import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  BarChart3,
  Search,
  Rocket,
  Banknote,
  Target,
  TrendingUp,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Zap,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import type { BusinessReport } from '../lib/types';

interface ReportViewerProps {
  report: BusinessReport;
}

// ── Score Ring Component ─────────────────────────────────────────────────────

function ScoreRing({ score, label, size = 80 }: { score: number; label: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return 'var(--success)';
    if (s >= 50) return 'var(--warning)';
    return 'var(--destructive)';
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="4"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xl font-bold" style={{ color: getColor(score), fontFamily: 'var(--font-display)' }}>
          {score}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-body)' }}>
        {label}
      </span>
    </div>
  );
}

// ── Collapsible Section Component ────────────────────────────────────────────

function ReportSection({
  title,
  icon: Icon,
  score,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  score?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center bg-[var(--primary-bg)] border border-[var(--primary-border)]">
            <Icon className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </span>
          {score !== undefined && (
            <Badge variant={score >= 75 ? 'success' : score >= 50 ? 'warning' : 'error'}>
              Score: {score}/100
            </Badge>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <CardContent className="pt-0 pb-4 px-4 border-t border-[var(--border)]">
              <div className="pt-4 space-y-4">
                {children}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ── Helper Sub-Components ────────────────────────────────────────────────────

function BulletList({ items, icon: Icon }: { items: string[]; icon?: React.ComponentType<{ className?: string }> }) {
  const ItemIcon = Icon || CheckCircle2;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, lineHeight: 1.65 }}>
          <ItemIcon className="h-4 w-4 mt-0.5 flex-shrink-0 text-[var(--primary)]" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] font-semibold" style={{ fontFamily: 'var(--font-body)' }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function TextBlock({ text }: { text: string }) {
  return (
    <p className="text-sm text-[var(--foreground)]" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, lineHeight: 1.65 }}>
      {text}
    </p>
  );
}

function SuitabilityBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const variant = level === 'high' ? 'success' : level === 'medium' ? 'warning' : 'error';
  return <Badge variant={variant}>{level}</Badge>;
}

// ── Main Report Viewer ───────────────────────────────────────────────────────

export function ReportViewer({ report }: ReportViewerProps) {
  const { businessOverview, marketResearch, launchAndScale, raiseCapital } = report;

  return (
    <div className="space-y-4">
      {/* Score Overview */}
      <Card className="bg-[var(--surface-1)] border-[var(--primary-border)]">
        <CardContent className="py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="relative flex flex-col items-center">
              <ScoreRing score={businessOverview.viabilityScore} label="Viability" />
            </div>
            <div className="relative flex flex-col items-center">
              <ScoreRing score={marketResearch.marketSizeScore} label="Market" />
            </div>
            <div className="relative flex flex-col items-center">
              <ScoreRing score={launchAndScale.readinessScore} label="Readiness" />
            </div>
            <div className="relative flex flex-col items-center">
              <ScoreRing score={raiseCapital.fundingReadinessScore} label="Fundability" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Business Overview */}
      <ReportSection
        title="Business Overview"
        icon={BarChart3}
        score={businessOverview.viabilityScore}
        defaultOpen={true}
      >
        <SubSection title="Executive Summary">
          <TextBlock text={businessOverview.executiveSummary} />
        </SubSection>

        <div className="grid sm:grid-cols-2 gap-4">
          <SubSection title="Business Model">
            <TextBlock text={businessOverview.businessModel} />
          </SubSection>
          <SubSection title="Value Proposition">
            <TextBlock text={businessOverview.valueProposition} />
          </SubSection>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <SubSection title="Industry">
            <TextBlock text={businessOverview.industryClassification} />
          </SubSection>
          <SubSection title="Revenue Model">
            <TextBlock text={businessOverview.revenueModel} />
          </SubSection>
        </div>

        {/* SWOT */}
        <div className="grid sm:grid-cols-2 gap-4">
          <SubSection title="Strengths">
            <BulletList items={businessOverview.strengths} icon={CheckCircle2} />
          </SubSection>
          <SubSection title="Weaknesses">
            <BulletList items={businessOverview.weaknesses} icon={AlertTriangle} />
          </SubSection>
          <SubSection title="Opportunities">
            <BulletList items={businessOverview.opportunities} icon={TrendingUp} />
          </SubSection>
          <SubSection title="Threats">
            <BulletList items={businessOverview.threats} icon={Shield} />
          </SubSection>
        </div>
      </ReportSection>

      {/* Section 2: Market Research */}
      <ReportSection
        title="Market Research"
        icon={Search}
        score={marketResearch.marketSizeScore}
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <SubSection title="TAM (Total Addressable Market)">
            <TextBlock text={marketResearch.totalAddressableMarket} />
          </SubSection>
          <SubSection title="SAM (Serviceable Addressable Market)">
            <TextBlock text={marketResearch.serviceableAddressableMarket} />
          </SubSection>
          <SubSection title="SOM (Serviceable Obtainable Market)">
            <TextBlock text={marketResearch.serviceableObtainableMarket} />
          </SubSection>
        </div>

        <SubSection title="Target Audience">
          <TextBlock text={`Primary: ${marketResearch.targetAudience.primaryDemographic}`} />
          <div className="mt-2">
            <BulletList items={marketResearch.targetAudience.painPoints} icon={Target} />
          </div>
          <div className="mt-2">
            <TextBlock text={`Buying Behavior: ${marketResearch.targetAudience.buyingBehavior}`} />
          </div>
        </SubSection>

        <SubSection title="Customer Segments">
          <BulletList items={marketResearch.targetAudience.customerSegments} icon={Users} />
        </SubSection>

        <SubSection title="Direct Competitors">
          <div className="space-y-3">
            {marketResearch.competitionAnalysis.directCompetitors.map((competitor, i) => (
              <div key={i} className="rounded-sm border border-[var(--border)] p-3 space-y-2">
                <p className="text-sm font-semibold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>
                  {competitor.name}
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--success)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>Strengths</p>
                    <BulletList items={competitor.strengths} icon={CheckCircle2} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--destructive)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>Weaknesses</p>
                    <BulletList items={competitor.weaknesses} icon={AlertTriangle} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Competitive Advantages">
          <BulletList items={marketResearch.competitionAnalysis.competitiveAdvantages} icon={Zap} />
        </SubSection>

        <SubSection title="Market Positioning">
          <TextBlock text={marketResearch.competitionAnalysis.marketPositioning} />
        </SubSection>

        <div className="grid sm:grid-cols-2 gap-4">
          <SubSection title="Market Trends">
            <BulletList items={marketResearch.marketTrends} icon={TrendingUp} />
          </SubSection>
          <SubSection title="Entry Barriers">
            <BulletList items={marketResearch.entryBarriers} icon={Shield} />
          </SubSection>
        </div>
      </ReportSection>

      {/* Section 3: Launch & Scale */}
      <ReportSection
        title="Launch & Scale"
        icon={Rocket}
        score={launchAndScale.readinessScore}
      >
        <SubSection title="Go-To-Market Strategy">
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>Channels</p>
                <BulletList items={launchAndScale.goToMarketStrategy.channels} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>MVP Features</p>
                <BulletList items={launchAndScale.goToMarketStrategy.mvpFeatures} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <SubSection title="Pricing Strategy">
                <TextBlock text={launchAndScale.goToMarketStrategy.pricingStrategy} />
              </SubSection>
              <SubSection title="Launch Timeline">
                <TextBlock text={launchAndScale.goToMarketStrategy.launchTimeline} />
              </SubSection>
            </div>
            <SubSection title="Marketing Approach">
              <TextBlock text={launchAndScale.goToMarketStrategy.marketingApproach} />
            </SubSection>
          </div>
        </SubSection>

        <SubSection title="Milestones">
          <div className="space-y-2">
            {launchAndScale.milestones.map((milestone, i) => (
              <div key={i} className="flex gap-3 items-start rounded-sm border border-[var(--border)] p-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-[var(--primary-bg)] text-[var(--primary)] text-xs font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>
                      {milestone.title}
                    </p>
                    <Badge variant="secondary">{milestone.timeline}</Badge>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, lineHeight: 1.65 }}>
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SubSection>

        <div className="grid sm:grid-cols-2 gap-4">
          <SubSection title="Growth Tactics">
            <BulletList items={launchAndScale.growthTactics} icon={TrendingUp} />
          </SubSection>
          <SubSection title="Key Metrics to Track">
            <BulletList items={launchAndScale.keyMetrics} icon={BarChart3} />
          </SubSection>
        </div>

        <SubSection title="Scaling Challenges">
          <BulletList items={launchAndScale.scalingChallenges} icon={AlertTriangle} />
        </SubSection>
      </ReportSection>

      {/* Section 4: Raise Capital */}
      <ReportSection
        title="Raise Capital"
        icon={Banknote}
        score={raiseCapital.fundingReadinessScore}
      >
        <SubSection title="Funding Options">
          <div className="space-y-2">
            {raiseCapital.fundingOptions.map((option, i) => (
              <div key={i} className="rounded-sm border border-[var(--border)] p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>
                    {option.type}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{option.typicalRange}</Badge>
                    <SuitabilityBadge level={option.suitability} />
                  </div>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, lineHeight: 1.65 }}>
                  {option.description}
                </p>
              </div>
            ))}
          </div>
        </SubSection>

        <SubSection title="Pitch Tips">
          <BulletList items={raiseCapital.pitchTips} icon={Zap} />
        </SubSection>

        <SubSection title="Financial Projections">
          <div className="grid sm:grid-cols-3 gap-4 mb-3">
            <div className="rounded-sm border border-[var(--border)] p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-body)' }}>Year 1</p>
              <p className="text-lg font-bold text-[var(--primary)] mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                {raiseCapital.financialProjections.year1Revenue}
              </p>
            </div>
            <div className="rounded-sm border border-[var(--border)] p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-body)' }}>Year 2</p>
              <p className="text-lg font-bold text-[var(--primary)] mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                {raiseCapital.financialProjections.year2Revenue}
              </p>
            </div>
            <div className="rounded-sm border border-[var(--border)] p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-body)' }}>Year 3</p>
              <p className="text-lg font-bold text-[var(--primary)] mt-1" style={{ fontFamily: 'var(--font-display)' }}>
                {raiseCapital.financialProjections.year3Revenue}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>Break-Even Timeline</p>
              <TextBlock text={raiseCapital.financialProjections.breakEvenTimeline} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>Initial Investment</p>
              <TextBlock text={raiseCapital.financialProjections.initialInvestment} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={{ fontFamily: 'var(--font-body)' }}>Key Assumptions</p>
            <BulletList items={raiseCapital.financialProjections.keyAssumptions} icon={DollarSign} />
          </div>
        </SubSection>

        <div className="grid sm:grid-cols-2 gap-4">
          <SubSection title="Ideal Investor Types">
            <BulletList items={raiseCapital.investorTypes} icon={Users} />
          </SubSection>
          <SubSection title="Funding Timeline">
            <TextBlock text={raiseCapital.fundingTimeline} />
          </SubSection>
        </div>
      </ReportSection>
    </div>
  );
}
