// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Getting Started / Platform Guide
// Persistent onboarding reference. Accessible any time from sidebar.
// Elon: one source of truth, dense but scannable, every section links to action
// Chase: identity language, completion pull, stage reveals, specificity creates belief
// ════════════════════════════════════════════════════════════════════════════════

import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import {
  ClipboardCheck, BarChart3, Shield, FolderOpen, DollarSign,
  TrendingUp, Brain, Wallet, Map, AlertCircle, BookOpen, FileText,
  Zap, ChevronRight, CheckCircle2, Circle,
} from 'lucide-react';
import { computeScore } from './business-assessment/engine';
import { getComplianceProgress, complianceModules } from '../utils/lenderComplianceModules';
import { getPipelineCounts } from '../lib/funding-service';

// ── Onboarding milestone checklist ──────────────────────────────────────────
// Steps are sequential. Complete them in order — each one unlocks the next.
const MILESTONES = [
  { id: 'scan',        step: 1, label: 'Take the Business Success Scan',       desc: '36 questions · 8 minutes · generates your full FundScore + DSCR profile', path: '/business-assessment',         check: () => !!localStorage.getItem('unified_assessment') },
  { id: 'results',     step: 2, label: 'Review your FundScore report',          desc: 'Understand your 6 capital dimensions and every active blocker',            path: '/business-assessment/results', check: () => localStorage.getItem('fundready_results_viewed') === '1' },
  { id: 'creditpath',  step: 3, label: 'Open your CreditPath roadmap',          desc: 'Personalized credit blockers, DSCR estimator, and step-by-step fix tools', path: '/app/credit-path',             check: () => !!localStorage.getItem('creditpath_progress') },
  { id: 'forge',       step: 4, label: 'Get your FORGE™ action plan',           desc: 'AI roadmap — your exact path from current stage to bank capital',          path: '/app/ai-coach',                check: () => localStorage.getItem('aiCoachOpened') === '1' },
  { id: 'compliance',  step: 5, label: 'Complete at least 1 compliance module', desc: 'Start building your lender file — required for Stage 2+ products',         path: '/app/lender-compliance',       check: () => complianceModules.some(m => getComplianceProgress()[m.id]?.completed) },
  { id: 'funding',     step: 6, label: 'Apply to a pre-qualified product',      desc: 'See which capital products you qualify for based on your current score',   path: '/app/access-funding',          check: () => !!localStorage.getItem('preQualifiedPrograms') },
];

// ── Sections ─────────────────────────────────────────────────────────────────

const STAGES = [
  {
    num: 1, label: 'Stage 1', title: 'Alternative Capital', color: '#ef4444',
    range: '$10K – $150K', apr: '35%+ APR',
    desc: 'MCAs, revenue-based loans, business credit lines. Fast approval (24–72 hrs), higher cost. The entry ramp.',
    requirements: ['6+ months in business', '580+ personal credit', 'Dedicated business bank account', '$5K+ average daily balance'],
  },
  {
    num: 2, label: 'Stage 2', title: 'Traditional Capital', color: '#f59e0b',
    range: '$50K – $500K', apr: '15–25% APR',
    desc: 'Term loans, SBA microloans, equipment financing. Lower cost, more documentation required.',
    requirements: ['1–2 years in business', '650+ personal credit', '3+ months consistent revenue', 'DSCR ≥ 1.0x (break-even coverage)', 'Business credit profile started'],
  },
  {
    num: 3, label: 'Stage 3', title: 'Bank & SBA Capital', color: '#10b981',
    range: '$250K – $5M+', apr: '8–15% APR',
    desc: 'SBA 7(a)/504, conventional bank loans, credit union loans. Best rates. Saves ~$62K/year vs Stage 1.',
    requirements: ['2+ years in business', '680+ personal credit (740+ preferred)', 'SBSS score 160+', 'DSCR ≥ 1.25x (lender minimum)', 'Full compliance file complete'],
  },
];

const DIMENSIONS = [
  { key: 'P', label: 'Personal Credit', icon: '💳', desc: 'Your personal FICO across all 3 bureaus. The #1 factor lenders check. Aim for 680+ minimum, 740+ for bank rates.' },
  { key: 'B', label: 'Business Profile', icon: '🏢', desc: 'Entity type, EIN, business address consistency, online presence. Affects credibility scoring across all lenders.' },
  { key: 'F', label: 'Financial Health', icon: '📈', desc: 'Monthly revenue, average daily balance, NSF frequency. Lenders look for $10K+ ADB and 3+ consistent months.' },
  { key: 'C', label: 'Compliance', icon: '🛡️', desc: 'Tax filings, licenses, judgments, liens. A single tax lien blocks 90% of products. Must be clean.' },
  { key: 'S', label: 'Stability', icon: '📅', desc: 'Time in business. Under 1 year = limited options. 2+ years unlocks SBA and conventional bank products.' },
  { key: 'N', label: 'Documentation', icon: '📁', desc: 'Tax returns, P&L, bank statements, EIN letter. A complete file closes 40% faster and at better terms.' },
];

const PLATFORM_SECTIONS = [
  { path: '/business-assessment', icon: ClipboardCheck, color: '#10b981', label: 'Business Success Scan', desc: 'Your 36-question assessment. Generates your FundScore, DSCR profile, and every active blocker.' },
  { path: '/app/dashboard', icon: BarChart3, color: '#3b82f6', label: 'Mission Control Dashboard', desc: 'Live view of your score, capital potential, goals, and top priority action.' },
  { path: '/app/credit-path', icon: TrendingUp, color: '#10b981', label: 'CreditPath™', desc: 'Your personalized credit improvement roadmap. DSCR estimator, utilization calculator, dispute scaffolding, tradeline starter list — tools mapped to your exact blockers.' },
  { path: '/app/ai-coach', icon: Brain, color: '#8b5cf6', label: 'FORGE™ AI Coach', desc: 'AI roadmap engine. Shows your exact path from current stage to Stage 3 bank capital.' },
  { path: '/app/lender-compliance', icon: Shield, color: '#f59e0b', label: 'Lender Compliance', desc: '13 verification modules that build your lender file. Complete all 13 to unlock the full capital stack.' },
  { path: '/app/document-collection', icon: FolderOpen, color: '#06b6d4', label: 'Document Portal', desc: 'Organize and store all required lender documents: returns, P&L, bank statements, licenses.' },
  { path: '/app/access-funding', icon: DollarSign, color: '#10b981', label: 'Access Funding', desc: '17 capital products. Filtered to what you qualify for based on your current FundScore.' },
  { path: '/app/my-progress', icon: TrendingUp, color: '#22c55e', label: 'My Progress', desc: 'Full blocker list, score trajectory, dimension breakdown, and achievement badges.' },
  { path: '/app/denial-diagnosis', icon: AlertCircle, color: '#ef4444', label: 'Denial Diagnosis', desc: 'Understand why you were declined and the exact steps to flip the decision.' },
  { path: '/app/finances', icon: Wallet, color: '#f59e0b', label: 'Finances', desc: 'Track revenue, expenses, and bank balance health — the core of lender underwriting.' },
  { path: '/app/status-reports', icon: BarChart3, color: '#3b82f6', label: 'Status Reports', desc: 'Deep-dive reports on SBSS, owner credit, estimated funding, and bankable status.' },
];

const FAQ = [
  { q: 'What is the FundScore?', a: 'A 0–1000 score across 6 dimensions that predicts your capital readiness. 700+ = capital ready. 800+ = bank-eligible. 900+ = top 5%.' },
  { q: 'What is DSCR and why does it matter?', a: 'DSCR (Debt Service Coverage Ratio) = Annual Net Operating Income ÷ Annual Debt Service. Lenders require ≥ 1.25x — meaning your business must generate $1.25 for every $1.00 of debt payments. Below 1.0x is an automatic decline in most lender pipelines. It is the single most common reason commercial loan applications are denied. Use CreditPath\'s DSCR Estimator to calculate yours and see exactly how to reach the 1.25x threshold.' },
  { q: 'What is the SBSS / Bank Readiness Score?', a: 'A 0–300 score (similar to FICO® SBSS) used by banks and the SBA to approve business loans. Score 160+ = bank-eligible. Below 160 = typically auto-declined by banks.' },
  { q: 'How long does it take to move from Stage 1 to Stage 3?', a: 'Most businesses can reach Stage 3 eligibility in 12–24 months with consistent execution. The platform gives you the exact blockers to address and tracks progress in real time.' },
  { q: 'Do I need an LLC to use Bankable IQ?', a: 'No — sole proprietors can use the platform. But most capital products require an LLC or Corp entity. If you\'re a sole prop, forming an LLC is typically Step 1.' },
  { q: 'What documents do I need for Stage 3 bank capital?', a: '2 years of business tax returns, 12 months of business bank statements, current P&L (dated within 60 days), EIN letter, and completed lender compliance file.' },
];

// ════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export function GettingStarted() {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<Record<string, boolean>>({});
  const [hasAssessment, setHasAssessment] = useState(false);
  const [fundScore, setFundScore] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    // Compute milestone completions
    const raw = localStorage.getItem('unified_assessment');
    setHasAssessment(!!raw);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        const result = computeScore(data);
        setFundScore(result.score);
      } catch { /* non-fatal */ }
    }
    const completed: Record<string, boolean> = {};
    for (const m of MILESTONES) {
      try { completed[m.id] = m.check(); } catch { completed[m.id] = false; }
    }
    setMilestones(completed);
  }, []);

  const completedCount = Object.values(milestones).filter(Boolean).length;
  const completionPct = Math.round((completedCount / MILESTONES.length) * 100);

  const gaugeColor = fundScore >= 800 ? '#10b981' : fundScore >= 650 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ padding: '32px 28px 64px', width: '100%', boxSizing: 'border-box' }}>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '820px', margin: '0 auto 40px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
          Platform Guide
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--foreground)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '12px' }}>
          How Bankable IQ Works
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--muted-foreground)', lineHeight: 1.6, maxWidth: '580px', marginBottom: '24px' }}>
          Everything you need to know to get from where you are today to funded — at the best possible rate.
        </p>

        {/* Onboarding checklist + progress */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: 'var(--foreground)' }}>
                Start Here: Your Setup Sequence
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                Complete these steps in order · {completedCount} of {MILESTONES.length} done
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {fundScore > 0 && (
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: gaugeColor }}>
                  {fundScore} <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', fontWeight: 500 }}>/1,000</span>
                </div>
              )}
              <button
                onClick={() => navigate('/business-assessment')}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {hasAssessment ? 'Update Scan →' : 'Start Scan →'}
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ height: '100%', width: `${completionPct}%`, background: 'linear-gradient(90deg, #10b981, #3b82f6)', borderRadius: '99px', transition: 'width 0.8s ease' }} />
          </div>
          {/* New-user callout */}
          {!hasAssessment && (
            <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>👋</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', lineHeight: 1.5 }}>
                <strong>New here?</strong> Start with Step 1 — the scan takes 8 minutes and instantly shows every blocker between you and funded, including your DSCR capacity profile.
              </span>
            </div>
          )}
          {/* Milestone list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {MILESTONES.map(m => (
              <div
                key={m.id}
                onClick={() => navigate(m.path)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', background: milestones[m.id] ? 'rgba(16,185,129,0.05)' : 'transparent', border: `1px solid ${milestones[m.id] ? 'rgba(16,185,129,0.2)' : 'transparent'}`, transition: 'all 0.12s' }}
                onMouseEnter={e => !milestones[m.id] && ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')}
                onMouseLeave={e => !milestones[m.id] && ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                {milestones[m.id]
                  ? <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                  : <Circle size={18} style={{ color: 'var(--border)', flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: milestones[m.id] ? '#10b981' : 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                      Step {m.step}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: milestones[m.id] ? '#10b981' : 'var(--foreground)' }}>{m.label}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '1px' }}>{m.desc}</div>
                </div>
                {!milestones[m.id] && <ChevronRight size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 1: 3-STAGE FRAMEWORK ────────────────────────────────── */}
      <div style={{ maxWidth: '820px', margin: '0 auto 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)', marginBottom: '6px' }}>The 3-Stage Capital Framework</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '20px', lineHeight: 1.5 }}>
          Every business moves through 3 stages of capital access. Your goal is Stage 3 — lowest cost, largest amounts.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {STAGES.map(stage => (
            <div key={stage.num} style={{ background: 'var(--card)', border: `1.5px solid ${stage.color}30`, borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ background: `${stage.color}12`, padding: '16px 20px', borderBottom: `1px solid ${stage.color}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 800, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stage.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: stage.color, background: `${stage.color}15`, padding: '2px 8px', borderRadius: '6px' }}>{stage.apr}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--foreground)' }}>{stage.title}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: stage.color, marginTop: '2px' }}>{stage.range}</div>
              </div>
              <div style={{ padding: '14px 20px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: '12px' }}>{stage.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {stage.requirements.map((req, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: stage.color, marginTop: '6px', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', lineHeight: 1.4 }}>{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Savings callout */}
        <div style={{ marginTop: '16px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.5 }}>
            A $250K loan at Stage 1 (35% APR) costs <strong>~$87K/yr in interest</strong>. The same loan at Stage 3 (8% APR) costs <strong>~$20K/yr</strong> — a <strong style={{ color: '#10b981' }}>$67K/year saving</strong>. That's the entire value of getting to Stage 3.
          </span>
        </div>
      </div>

      {/* ── SECTION 2: FUNDSCORE DIMENSIONS ─────────────────────────────── */}
      <div style={{ maxWidth: '820px', margin: '0 auto 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)', marginBottom: '6px' }}>Your FundScore™ Explained</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '20px', lineHeight: 1.5 }}>
          Your 0–1,000 FundScore is built from 6 capital readiness dimensions. Each one maps to a real lender underwriting category.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {DIMENSIONS.map(dim => (
            <div key={dim.key} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                {dim.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)', marginBottom: '4px' }}>{dim.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{dim.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 3: PLATFORM NAVIGATION GUIDE ───────────────────────── */}
      <div style={{ maxWidth: '820px', margin: '0 auto 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)', marginBottom: '6px' }}>Platform Navigation Guide</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '20px', lineHeight: 1.5 }}>
          Every section of Bankable IQ has a specific job in your capital readiness journey.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PLATFORM_SECTIONS.map(section => {
            const Icon = section.icon;
            return (
              <div
                key={section.path}
                onClick={() => navigate(section.path)}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.12s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = section.color + '50'; (e.currentTarget as HTMLElement).style.background = section.color + '08'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--card)'; }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: section.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color: section.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>{section.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{section.desc}</div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 4: FAQ ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: '820px', margin: '0 auto 40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)', marginBottom: '6px' }}>Frequently Asked Questions</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '20px' }}>The most important things to understand before you start applying for capital.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FAQ.map((item, i) => (
            <div
              key={i}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>{item.q}</span>
                <ChevronRight size={14} style={{ color: 'var(--muted-foreground)', transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 18px 16px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', padding: '32px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🚀</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)', marginBottom: '8px' }}>
          {hasAssessment ? 'Keep building your FundScore' : 'Start with your Business Success Scan'}
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 24px' }}>
          {hasAssessment
            ? `You're at FundScore ${fundScore}. Complete your compliance modules and address your top blockers to unlock Stage ${fundScore >= 700 ? '3' : '2'} capital.`
            : '33 questions · 8 minutes · Instant results. See exactly where you stand and what capital you can access today.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/business-assessment')}
            style={{ padding: '13px 28px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '12px', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(16,185,129,0.3)' }}
          >
            {hasAssessment ? 'Update My Assessment →' : 'Start Free Assessment →'}
          </button>
          <button
            onClick={() => navigate('/app/lender-compliance')}
            style={{ padding: '13px 28px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--foreground)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
          >
            Lender Compliance →
          </button>
        </div>
      </div>
    </div>
  );
}

export default GettingStarted;
