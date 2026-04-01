// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — FORGE™ AI Coach
// Your always-on capital transformation engine.
// Replaces "Capital Intelligence" — contains all the same data + personalized roadmap.
//
// Elon: one page, one truth function, every item drives a specific capital outcome.
// Chase: identity-first framing. User sees who they ARE and who they're BECOMING.
//        3-stage roadmap with completion pull at every step.
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, ArrowRight, CheckCircle, Circle, ChevronDown, ChevronRight,
  TrendingUp, Lock, Unlock, DollarSign, Target, BarChart3, AlertCircle,
  BookOpen, Shield, Brain,
} from 'lucide-react';
import { computeScore, computeExtendedResults } from './business-assessment/engine';
import { evaluateProducts } from './business-assessment/productEligibility';
import { getAllAuditItems } from '../utils/businessData';
import { complianceModules, getComplianceProgress } from '../utils/lenderComplianceModules';
import { getPreQualifiedPrograms } from '../utils/fundingEligibility';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function getTier(bankableScore: number, fundScore: number): {
  label: string; color: string; bg: string; border: string;
  aprRange: string; aprLabel: string; capitalDesc: string;
} {
  if (bankableScore >= 200 || fundScore >= 850) return {
    label: 'Bankable', color: '#10b981', bg: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.25)', aprRange: '8–15%', aprLabel: 'Bank Capital',
    capitalDesc: 'You qualify for institutional bank capital — the lowest-cost, longest-term funding available.',
  };
  if (bankableScore >= 160 || fundScore >= 700) return {
    label: 'Approaching Bankable', color: '#f59e0b', bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.25)', aprRange: '15–25%', aprLabel: 'Transitioning',
    capitalDesc: 'You\'re crossing into traditional lending. A few more compliance steps unlock bank-rate capital.',
  };
  return {
    label: 'Fundable', color: '#3b82f6', bg: 'rgba(59,130,246,0.07)',
    border: 'rgba(59,130,246,0.25)', aprRange: '35%+', aprLabel: 'Expensive Capital',
    capitalDesc: 'You have access to alternative capital now. This is the starting point — not the destination.',
  };
}

const DIM_LABELS: Record<string, string> = {
  P: 'Personal Credit', B: 'Business Profile', F: 'Financials',
  C: 'Compliance', S: 'Stability', N: 'File Strength',
};
const DIM_WEIGHTS: Record<string, number> = {
  P: 20, B: 10, F: 25, C: 20, S: 15, N: 10,
};

// ─── Roadmap Generator ───────────────────────────────────────────────────────

interface RoadmapItem {
  id: string;
  label: string;
  done: boolean;
  impact: string;
  path?: string;
  pathLabel?: string;
}

interface RoadmapStage {
  number: 1 | 2 | 3;
  name: string;
  tagline: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  items: RoadmapItem[];
  capitalUnlock: string;
  daysToComplete: string;
}

function buildRoadmap(
  fundScore: number,
  bankableScore: number,
  complianceProgress: ReturnType<typeof getComplianceProgress>,
  auditItems: ReturnType<typeof getAllAuditItems>,
  preQualifiedIds: string[],
): RoadmapStage[] {
  const completedModules = complianceModules.filter(m => complianceProgress[m.id]?.completed);
  const incompleteModules = complianceModules.filter(m => !complianceProgress[m.id]?.completed);
  const criticalItems = auditItems.filter(i => i.status !== 'complete' && (i.priority === 'critical' || i.priority === 'high'));
  const hasFirstFunding = preQualifiedIds.length > 0;

  // Stage 1: Foundation — fix structural blockers + establish compliance base
  const stage1Items: RoadmapItem[] = [
    {
      id: 'entity',
      label: 'Form a legal business entity (LLC or Corp)',
      done: complianceProgress['entity-filings']?.completed ?? false,
      impact: '+40 FundScore · Required for SBA',
      path: '/app/lender-compliance/entity-filings', pathLabel: 'Complete →',
    },
    {
      id: 'ein',
      label: 'Obtain EIN and business licenses',
      done: complianceProgress['ein-licenses']?.completed ?? false,
      impact: '+35 FundScore · Required for all bank products',
      path: '/app/lender-compliance/ein-licenses', pathLabel: 'Complete →',
    },
    {
      id: 'banking',
      label: 'Open dedicated business bank account',
      done: complianceProgress['business-banking']?.completed ?? false,
      impact: '+30 FundScore · Required for 12 of 17 products',
      path: '/app/lender-compliance/business-banking', pathLabel: 'Complete →',
    },
    {
      id: 'location',
      label: 'Establish verified business address',
      done: complianceProgress['business-location']?.completed ?? false,
      impact: '+25 FundScore · Lender verification',
      path: '/app/lender-compliance/business-location', pathLabel: 'Complete →',
    },
    {
      id: 'nap',
      label: 'Establish consistent NAP (Name / Address / Phone)',
      done: complianceProgress['phones-411']?.completed ?? false,
      impact: '+20 FundScore · NAP consistency across all bureaus',
      path: '/app/lender-compliance/phones-411', pathLabel: 'Complete →',
    },
  ];

  // Stage 2: Momentum — compliance depth + first funding + tradeline building
  const stage2Items: RoadmapItem[] = [
    {
      id: 'website',
      label: 'Build professional website + business email',
      done: complianceProgress['website-email']?.completed ?? false,
      impact: '+20 FundScore · Lender credibility check',
      path: '/app/lender-compliance/website-email', pathLabel: 'Complete →',
    },
    {
      id: 'agencies',
      label: 'Register with D&B, Experian Business, NAICS',
      done: complianceProgress['agencies-naics']?.completed ?? false,
      impact: '+35 FundScore · Business credit profile starts here',
      path: '/app/lender-compliance/agencies-naics', pathLabel: 'Complete →',
    },
    {
      id: 'first-funding',
      label: hasFirstFunding
        ? `Apply for first pre-qualified program (${preQualifiedIds.length} ready)`
        : 'Complete assessment to unlock first funding products',
      done: false,
      impact: 'Starts cash flow + repayment history — feeds SBSS score',
      path: hasFirstFunding ? '/app/access-funding' : '/business-assessment',
      pathLabel: hasFirstFunding ? 'Apply Now →' : 'Complete Scan →',
    },
    {
      id: 'bank-rating',
      label: 'Achieve business bank rating of 1-5 (BankScore)',
      done: complianceProgress['bank-rating']?.completed ?? false,
      impact: '+30 FundScore · Banks assign internal score 1-9',
      path: '/app/lender-compliance/bank-rating', pathLabel: 'Learn More →',
    },
    {
      id: 'business-plan',
      label: 'Create lender-ready business plan',
      done: complianceProgress['business-plan']?.completed ?? false,
      impact: 'Required for SBA + bank term loans',
      path: '/app/lender-compliance/business-plan', pathLabel: 'Complete →',
    },
  ];

  // Stage 3: Optimization — cross SBSS 160, unlock institutional capital
  const stage3Items: RoadmapItem[] = [
    {
      id: 'assets-ucc',
      label: 'Document assets + UCC filing status',
      done: complianceProgress['assets-ucc']?.completed ?? false,
      impact: '+25 FundScore · Collateral signals for bank lenders',
      path: '/app/lender-compliance/assets-ucc', pathLabel: 'Complete →',
    },
    {
      id: 'comparable-credit',
      label: 'Build comparable credit (3+ business tradelines)',
      done: complianceProgress['comparable-credit']?.completed ?? false,
      impact: '+40 FundScore · SBSS 15% weighting — critical for 160 threshold',
      path: '/app/lender-compliance/comparable-credit', pathLabel: 'Complete →',
    },
    {
      id: 'corp-facts',
      label: 'Understand corp-only lending advantages',
      done: complianceProgress['corp-only-facts']?.completed ?? false,
      impact: 'Unlocks corp-exclusive products + lower personal guarantee requirements',
      path: '/app/lender-compliance/corp-only-facts', pathLabel: 'Complete →',
    },
    {
      id: 'cd-loan',
      label: 'CD-secured business loan strategy',
      done: complianceProgress['cd-business-loan']?.completed ?? false,
      impact: 'Establishes banking track record — fast-tracks SBSS to 160+',
      path: '/app/lender-compliance/cd-business-loan', pathLabel: 'Learn More →',
    },
    {
      id: 'sbss-target',
      label: `Reach SBSS 160+ (currently ${bankableScore}/300)`,
      done: bankableScore >= 160,
      impact: 'Crosses bankability threshold — SBA + bank loans unlock',
      path: '/app/lender-compliance', pathLabel: 'View Path →',
    },
  ];

  return [
    {
      number: 1, name: 'Foundation', tagline: 'Establish the structure lenders require.',
      color: '#3b82f6', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.2)',
      icon: <Shield style={{ width: '15px', height: '15px' }} />,
      items: stage1Items,
      capitalUnlock: 'Unlocks: MCA · Working Capital · Credit Cards · Revenue-Based',
      daysToComplete: '7–30 days',
    },
    {
      number: 2, name: 'Momentum', tagline: 'Get first funding. Build your credit profile.',
      color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)',
      icon: <TrendingUp style={{ width: '15px', height: '15px' }} />,
      items: stage2Items,
      capitalUnlock: 'Unlocks: Business Credit Line · Equipment Financing · Business Term Loan',
      daysToComplete: '30–120 days',
    },
    {
      number: 3, name: 'Bankable', tagline: 'Cross SBSS 160. Access institutional capital.',
      color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.2)',
      icon: <DollarSign style={{ width: '15px', height: '15px' }} />,
      items: stage3Items,
      capitalUnlock: 'Unlocks: SBA 7a/504 · Bank Term Loans · DSCR · Construction',
      daysToComplete: '120–240 days',
    },
  ];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AICoach() {
  const navigate = useNavigate();
  const [fundScore, setFundScore] = useState(0);
  const [bankableScore, setBankableScore] = useState(0);
  const [dimAvg, setDimAvg] = useState<Record<string, number>>({});
  const [businessName, setBusinessName] = useState('');
  const [complianceProgress, setComplianceProgress] = useState<ReturnType<typeof getComplianceProgress>>({});
  const [auditItems, setAuditItems] = useState<ReturnType<typeof getAllAuditItems>>([]);
  const [preQualifiedIds, setPreQualifiedIds] = useState<string[]>([]);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [expandedStage, setExpandedStage] = useState<number | null>(1);
  const [roadmap, setRoadmap] = useState<RoadmapStage[]>([]);
  const [actualMaxFunding, setActualMaxFunding] = useState(0);

  const load = useCallback(() => {
    const raw = localStorage.getItem('unified_assessment');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const scoreResult = computeScore(data);
      setFundScore(scoreResult.score);
      setBankableScore(scoreResult.bankableScore);
      setDimAvg(scoreResult.dimAvg as unknown as Record<string, number>);
      setBusinessName(data.businessName || data.ownerName || '');
      setHasAssessment(true);

      const items = getAllAuditItems();
      setAuditItems(items);

      const progress = getComplianceProgress();
      setComplianceProgress(progress);

      const preQ = getPreQualifiedPrograms();
      setPreQualifiedIds(preQ);

      const prods = evaluateProducts(data, scoreResult.score);
      const eligible = prods.filter(p => p.qualifies);
      const maxFunding = eligible.length > 0
        ? Math.max(...eligible.map(p => {
            const amt = p.maxAmount.replace(/[$,KM+]/g, '');
            return amt.includes('.') ? parseFloat(amt) * 1000000 : parseInt(amt) * 1000;
          }))
        : 0;
      setActualMaxFunding(maxFunding);

      setRoadmap(buildRoadmap(scoreResult.score, scoreResult.bankableScore, progress, items, preQ));
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('fundscoreUpdated', load);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'unified_assessment' || e.key === 'lenderComplianceProgress') load();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('fundscoreUpdated', load);
      window.removeEventListener('storage', onStorage);
    };
  }, [load]);

  const tier = getTier(bankableScore, fundScore);
  const completedModules = complianceModules.filter(m => complianceProgress[m.id]?.completed).length;
  const totalModules = complianceModules.length;

  // This week's focus: top 3 undone, highest-impact items across all stages
  const thisWeek = roadmap
    .flatMap(s => s.items)
    .filter(i => !i.done)
    .slice(0, 3);

  // Projected capital at 240 days
  const score240 = Math.min(fundScore + 200, 1000);
  const potentialMax = score240 >= 900 ? 1500000 : score240 >= 800 ? 500000 : score240 >= 700 ? 150000 : 75000;

  if (!hasAssessment) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔥</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--foreground)', margin: '0 0 8px 0' }}>
          FORGE™ needs your business data
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', margin: '0 0 28px 0' }}>
          Complete the Business Success Scan and FORGE™ will build your personalized roadmap from Fundable to Bankable.
        </p>
        <button
          onClick={() => navigate('/business-assessment')}
          style={{
            padding: '12px 28px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'white',
          }}
        >
          Start Business Success Scan →
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 20px' }}>

      {/* ── FORGE™ HEADER ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain style={{ width: '18px', height: '18px', color: 'white' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 900, color: 'var(--foreground)', lineHeight: 1 }}>
                  FORGE™
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                  Your AI Capital Coach · always-on · always synced
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '6px 12px', borderRadius: '8px',
              background: tier.bg, border: `1px solid ${tier.border}`,
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color: tier.color }}>
                {tier.label}
              </span>
            </div>
            <div style={{
              padding: '6px 12px', borderRadius: '8px',
              background: 'var(--card)', border: '1px solid var(--border)',
              display: 'flex', gap: '10px',
            }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                FundScore <strong style={{ color: 'var(--foreground)' }}>{fundScore}</strong>
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                SBSS <strong style={{ color: bankableScore >= 160 ? '#10b981' : 'var(--foreground)' }}>{bankableScore}</strong>/300
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── TWO-SYSTEM STATUS STRIP ────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          borderRadius: '12px', border: '1px solid var(--border)',
          overflow: 'hidden', marginBottom: '20px',
        }}
      >
        <div style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.04)' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Today — {tier.aprLabel}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#ef4444', lineHeight: 1, marginBottom: '4px' }}>
            {tier.aprRange} APR
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
            {actualMaxFunding > 0 ? fmt(actualMaxFunding) : '—'} accessible · {preQualifiedIds.length} programs pre-qualified
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', background: 'var(--card)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
          <ArrowRight style={{ width: '16px', height: '16px', color: 'var(--muted-foreground)' }} />
        </div>
        <div style={{ padding: '16px 20px', background: 'rgba(16,185,129,0.04)' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            240 Days — Bank Capital
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#10b981', lineHeight: 1, marginBottom: '4px' }}>
            8–15% APR
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
            Up to {fmt(potentialMax)} · SBA + bank suite unlocked
          </div>
        </div>
      </motion.div>

      {/* ── THIS WEEK'S FOCUS ─────────────────────────────────────────────── */}
      {thisWeek.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          style={{
            padding: '16px 20px', borderRadius: '12px', marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(59,130,246,0.05))',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap style={{ width: '14px', height: '14px', color: '#10b981' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--foreground)' }}>
              This Week's Focus
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
              — complete these to advance your stage
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {thisWeek.map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  background: idx === 0 ? '#10b981' : idx === 1 ? '#3b82f6' : '#8b5cf6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, color: 'white',
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)', fontWeight: 500 }}>
                    {item.label}
                  </span>
                  {item.path && (
                    <Link to={item.path} style={{
                      marginLeft: '8px', fontFamily: 'var(--font-body)', fontSize: '11px',
                      fontWeight: 600, color: '#10b981', textDecoration: 'none',
                    }}>
                      {item.pathLabel}
                    </Link>
                  )}
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                    {item.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── PERSONALIZED 3-STAGE ROADMAP ─────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--foreground)', margin: '0 0 2px 0' }}>
            Your Personalized Roadmap
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
            Built from your assessment + compliance data. Updates automatically as you complete modules.
          </p>
        </div>

        {/* Stage progress bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
          {roadmap.map(stage => {
            const done = stage.items.filter(i => i.done).length;
            const total = stage.items.length;
            const pct = total > 0 ? (done / total) * 100 : 0;
            return (
              <div key={stage.number} style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, color: stage.color, marginBottom: '4px' }}>
                  Stage {stage.number} · {done}/{total}
                </div>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: stage.color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage accordions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {roadmap.map((stage, sIdx) => {
            const isOpen = expandedStage === stage.number;
            const doneCount = stage.items.filter(i => i.done).length;
            const totalCount = stage.items.length;
            const isComplete = doneCount === totalCount;

            return (
              <motion.div key={stage.number}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + sIdx * 0.04 }}
                style={{
                  borderRadius: '12px', overflow: 'hidden',
                  border: `1.5px solid ${isOpen ? stage.color : 'var(--border)'}`,
                  background: isOpen ? stage.bg : 'var(--card)',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedStage(isOpen ? null : stage.number)}
                  style={{
                    width: '100%', padding: '14px 18px', background: 'none', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                    background: isComplete ? stage.color : `${stage.color}20`,
                    border: `1.5px solid ${stage.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isComplete ? 'white' : stage.color,
                  }}>
                    {isComplete ? <CheckCircle style={{ width: '14px', height: '14px' }} /> : stage.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--foreground)' }}>
                        Stage {stage.number}: {stage.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600,
                        color: stage.color, background: `${stage.color}15`,
                        border: `1px solid ${stage.color}25`, padding: '1px 6px', borderRadius: '4px',
                      }}>
                        {doneCount}/{totalCount} complete
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                        · {stage.daysToComplete}
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                      {stage.tagline}
                    </div>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
                    <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--muted-foreground)', flexShrink: 0 }} />
                  </motion.div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 18px 16px' }}>
                        {/* Capital unlock badge */}
                        <div style={{
                          padding: '8px 12px', borderRadius: '8px', marginBottom: '12px',
                          background: `${stage.color}10`, border: `1px solid ${stage.color}25`,
                          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: stage.color,
                        }}>
                          🔓 {stage.capitalUnlock}
                        </div>

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {stage.items.map(item => (
                            <div key={item.id} style={{
                              display: 'flex', alignItems: 'flex-start', gap: '10px',
                              padding: '10px 12px', borderRadius: '8px',
                              background: item.done ? 'rgba(16,185,129,0.05)' : 'var(--background)',
                              border: `1px solid ${item.done ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                            }}>
                              <div style={{ flexShrink: 0, marginTop: '1px' }}>
                                {item.done
                                  ? <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
                                  : <Circle style={{ width: '14px', height: '14px', color: 'var(--muted-foreground)' }} />
                                }
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
                                  color: item.done ? 'var(--muted-foreground)' : 'var(--foreground)',
                                  textDecoration: item.done ? 'line-through' : 'none',
                                  marginBottom: '2px',
                                }}>
                                  {item.label}
                                </div>
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                                  {item.impact}
                                </div>
                              </div>
                              {!item.done && item.path && (
                                <Link to={item.path} style={{
                                  flexShrink: 0, fontFamily: 'var(--font-body)', fontSize: '11px',
                                  fontWeight: 600, color: stage.color, textDecoration: 'none',
                                  padding: '3px 8px', borderRadius: '5px',
                                  background: `${stage.color}10`, border: `1px solid ${stage.color}25`,
                                  whiteSpace: 'nowrap',
                                }}>
                                  {item.pathLabel}
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── CAPITAL PROGRESSION SEQUENCE (60 / 120 / 240 days) ────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--foreground)', margin: '0 0 2px 0' }}>
            Capital Progression Sequence
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
            After first funding — what credit sees at each milestone, and what it unlocks.
          </p>
        </div>

        {[
          {
            label: 'TODAY', sub: 'First Funding Available', color: '#3b82f6', apr: '35–50%+', aprLabel: 'EXPENSIVE',
            range: actualMaxFunding > 0 ? `${fmt(Math.round(actualMaxFunding * 0.4))}–${fmt(actualMaxFunding)}` : '$5K–$50K',
            what: 'EIN obtained · business bank open · alternative lenders can approve in 24-48 hours',
            products: ['MCA', 'Working Capital', 'Revenue-Based', 'Credit Cards', 'Factoring'],
            icon: <Zap style={{ width: '13px', height: '13px' }} />, isCurrent: true,
          },
          {
            label: '60 DAYS', sub: 'After First Funding', color: '#06b6d4', apr: '25–35%', aprLabel: 'IMPROVING',
            range: '$25K–$150K',
            what: '60 days bank history · 1st credit card reporting cycle complete · NAP verified across directories',
            products: ['Business Credit Line', 'Credit Union Loans', 'Equipment Financing', 'PO Finance'],
            icon: <TrendingUp style={{ width: '13px', height: '13px' }} />, isCurrent: false,
          },
          {
            label: '120 DAYS', sub: 'Approaching Bankable', color: '#10b981', apr: '15–25%', aprLabel: 'TRANSITIONING',
            range: '$75K–$500K',
            what: '3 months bank statements · 2-3 tradeline cycles · SBSS score climbing · business credit forming',
            products: ['Business Term Loan', 'AR Finance', 'Inventory Line', 'SBA (approaching)'],
            icon: <Unlock style={{ width: '13px', height: '13px' }} />, isCurrent: false,
          },
          {
            label: '240 DAYS', sub: 'Full Bankability', color: '#8b5cf6', apr: '8–15%', aprLabel: 'BANK CAPITAL',
            range: `$250K–${fmt(potentialMax)}`,
            what: 'SBSS 160+ crossed · full compliance suite done · 3+ reporting agencies · 8+ months statements',
            products: ['SBA 7(a) & 504', 'Bank Term Loans', 'DSCR Loans', 'Construction', 'Full Institutional Suite'],
            icon: <DollarSign style={{ width: '13px', height: '13px' }} />, isCurrent: false,
          },
        ].map((stage, idx, arr) => (
          <div key={stage.label}>
            <div style={{
              display: 'grid', gridTemplateColumns: '100px 1fr',
              border: `1.5px solid ${stage.isCurrent ? stage.color : 'var(--border)'}`,
              borderRadius: '10px', overflow: 'hidden',
              background: stage.isCurrent ? `${stage.color}08` : 'var(--card)',
            }}>
              {/* Left */}
              <div style={{
                padding: '14px 12px', textAlign: 'center',
                background: `${stage.color}08`,
                borderRight: `1px solid ${stage.color}20`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
              }}>
                {stage.isCurrent && (
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '8px', fontWeight: 700,
                    color: stage.color, textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: `${stage.color}20`, padding: '1px 5px', borderRadius: '3px', marginBottom: '2px',
                  }}>
                    NOW
                  </div>
                )}
                <div style={{ color: stage.color }}>{stage.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 800, color: stage.color, lineHeight: 1.1 }}>
                  {stage.label}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)', lineHeight: 1.3, textAlign: 'center' }}>
                  {stage.sub}
                </div>
                <div style={{
                  marginTop: '4px', padding: '2px 6px', borderRadius: '4px',
                  background: `${stage.color}15`, border: `1px solid ${stage.color}25`,
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 800, color: stage.color }}>
                    {stage.apr}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '8px', color: stage.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {stage.aprLabel}
                  </div>
                </div>
              </div>
              {/* Right */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, color: 'var(--foreground)' }}>
                    {stage.range}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '8px', lineHeight: 1.5 }}>
                  {stage.what}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {stage.products.map(p => (
                    <span key={p} style={{
                      fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500,
                      color: stage.color, background: `${stage.color}10`,
                      border: `1px solid ${stage.color}20`, padding: '2px 6px', borderRadius: '4px',
                    }}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
            {idx < arr.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3px 0' }}>
                <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--muted-foreground)' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── CAPITAL INTELLIGENCE (FundScore breakdown + SBSS) ─────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--foreground)', margin: '0 0 2px 0' }}>
            Capital Intelligence
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
            Your complete lender profile — every dimension scored and explained.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* FundScore */}
          <div style={{
            padding: '18px', borderRadius: '12px',
            background: 'var(--card)', border: '1px solid var(--border)',
          }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
              FundScore™
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 900, color: fundScore >= 800 ? '#10b981' : fundScore >= 650 ? '#f59e0b' : '#ef4444', lineHeight: 1, marginBottom: '6px' }}>
              {fundScore}
              <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--muted-foreground)' }}>/1000</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {Object.entries(DIM_LABELS).map(([key, label]) => {
                const val = typeof dimAvg[key] === 'number' ? dimAvg[key] : 0;
                const pct = Math.round(val * 100);
                const color = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                        {label} ({DIM_WEIGHTS[key]}%)
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ height: '3px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SBSS / Bankable Score */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '18px', borderRadius: '12px', flex: 1,
              background: 'var(--card)', border: '1px solid var(--border)',
            }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                Bank Readiness (SBSS)
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, color: bankableScore >= 160 ? '#10b981' : bankableScore >= 120 ? '#f59e0b' : '#ef4444', lineHeight: 1, marginBottom: '6px' }}>
                {bankableScore}
                <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--muted-foreground)' }}>/300</span>
              </div>
              <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginBottom: '6px', position: 'relative' }}>
                <div style={{ height: '100%', width: `${(bankableScore / 300) * 100}%`, background: bankableScore >= 160 ? '#10b981' : '#f59e0b', borderRadius: '99px' }} />
                {/* 160 threshold marker */}
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(160 / 300) * 100}%`, width: '2px', background: '#ef4444' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: bankableScore >= 160 ? '#10b981' : 'var(--muted-foreground)' }}>
                {bankableScore >= 160
                  ? '✓ Bankable threshold reached'
                  : `${160 - bankableScore} points to bankable threshold (160)`}
              </div>
            </div>

            {/* Compliance */}
            <div style={{
              padding: '16px', borderRadius: '12px',
              background: 'var(--card)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Compliance
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: completedModules === totalModules ? '#10b981' : 'var(--foreground)' }}>
                  {completedModules}/{totalModules}
                </span>
              </div>
              <div style={{ height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', width: `${(completedModules / totalModules) * 100}%`, background: '#10b981', borderRadius: '99px' }} />
              </div>
              <Link to="/app/lender-compliance" style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                color: '#10b981', textDecoration: 'none',
              }}>
                {completedModules < totalModules ? 'Continue compliance modules' : 'All modules complete ✓'}
                <ChevronRight style={{ width: '12px', height: '12px' }} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── DEEP REPORTS LINKS ────────────────────────────────────────────── */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          Detailed Reports
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { label: 'Bankable Status Report', path: '/app/status-reports/bankable-status', icon: <Target style={{ width: '13px', height: '13px' }} /> },
            { label: 'Business FICO Analysis', path: '/app/status-reports/business-fico', icon: <BarChart3 style={{ width: '13px', height: '13px' }} /> },
            { label: 'Capital Forecast', path: '/app/status-reports/estimated-funding', icon: <DollarSign style={{ width: '13px', height: '13px' }} /> },
            { label: "Owner's Credit Report", path: '/app/status-reports/owners-credit', icon: <Shield style={{ width: '13px', height: '13px' }} /> },
          ].map(item => (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 14px', borderRadius: '9px', textDecoration: 'none',
              background: 'var(--card)', border: '1px solid var(--border)',
              transition: 'border-color 0.12s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#10b981')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <span style={{ color: '#10b981', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: 'var(--foreground)' }}>
                {item.label}
              </span>
              <ChevronRight style={{ width: '12px', height: '12px', color: 'var(--muted-foreground)', marginLeft: 'auto' }} />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
