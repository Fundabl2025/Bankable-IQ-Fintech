// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Optimize Reporting
// CLAUDE.md: Fogg (progress + single action) · Zhuo (what/why/next/get) ·
//            Elon (status+gap+action, no prose walls) · Chase (fear-of-loss hook)
// Design: matches Lender Compliance row pattern exactly — actor mode, not observer
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, ChevronDown, ChevronRight, CheckCircle2,
  Lock, AlertTriangle, Target, Zap, Shield, ArrowRight, X,
} from 'lucide-react';
import { getMembershipTier, canAccessGoal2, type MembershipTier, TIER_FEATURES } from '../lib/membership';
import { getMembershipPricing, getMembershipPricingSync } from '../lib/platform-config';
import { getComplianceProgress } from '../utils/lenderComplianceModules';
import { logEvent } from '../lib/analytics/events';

// ── Types ─────────────────────────────────────────────────────────────────────

type MainTab = 'business' | 'owner';

interface AssessmentData {
  experian?: string;
  transunion?: string;
  equifax?: string;
  personalCreditScore?: number;
  monthlyRevenue?: string | number;
  startDate?: { year: number; month: number };
  hasBankruptcy?: string;
  hasEIN?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CREDIT_MAP: Record<string, number> = {
  exceptional: 810, very_good: 760, good: 700, fair: 650, poor: 560, unknown: 0,
};

function getCreditScore(data: AssessmentData): number {
  if (data.personalCreditScore) return data.personalCreditScore;
  const scores = [
    CREDIT_MAP[data.experian ?? 'unknown'] ?? 0,
    CREDIT_MAP[data.transunion ?? 'unknown'] ?? 0,
    CREDIT_MAP[data.equifax ?? 'unknown'] ?? 0,
  ].filter(s => s > 0);
  return scores.length ? Math.min(...scores) : 0;
}

function getAgeMonths(data: AssessmentData): number {
  if (!data.startDate) return 0;
  const now = new Date();
  const start = new Date(data.startDate.year, (data.startDate.month || 1) - 1);
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

function getFicoSBSS(fico: number, ageMonths: number, modulesCount: number): number {
  if (fico === 0) return 0;
  const base = Math.round((fico / 850) * 160 + Math.min(ageMonths / 60, 1) * 20 + modulesCount * 3);
  return Math.min(base, 280);
}

// ── Upgrade Modal ─────────────────────────────────────────────────────────────

function UpgradeModal({ onClose, source }: { onClose: () => void; source: string }) {
  const [pricing, setPricing] = useState(getMembershipPricingSync());
  useEffect(() => { getMembershipPricing().then(setPricing); }, []);
  // Fire once when modal is actually rendered on screen (not on CTA click)
  useEffect(() => { logEvent({ event_name: 'upgrade_modal_viewed', payload: { source } }); }, []);

  const TIERS = [
    {
      tier: 'virtual',
      label: 'Virtual Coached',
      price: `${pricing.virtual.monthlyDisplay}/month`,
      icon: '🎓',
      color: '#10b981',
      cta: 'Start Virtual Coaching',
      highlight: false,
      features: TIER_FEATURES.virtual,
      note: 'Goal #2 + AI Coaching — built to make you bankable in 60–90 days.',
    },
    {
      tier: 'live',
      label: 'Live Coached',
      price: `${pricing.live.monthlyDisplay}/month`,
      icon: '⭐',
      color: '#f59e0b',
      cta: 'Get a Live Coach',
      highlight: true,
      features: TIER_FEATURES.live,
      note: 'Done-For-You + Live Coach — a real human coach handles compliance for 12 months.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--background)', borderRadius: '22px', overflow: 'hidden', width: '100%', maxWidth: '560px', boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', padding: '28px 28px 24px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <X size={14} />
          </button>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
            GOAL #2 — BECOME BANKABLE
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', color: 'white', lineHeight: 1.2, marginBottom: '8px' }}>
            Unlock Bureau Reporting & Credit Optimization
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>
            Most owners don't know what lenders see when they pull their business credit. These bureaus and FICO strategies are how you control exactly what lenders find — before you apply.
          </p>
        </div>

        {/* Tier cards */}
        <div style={{ padding: '20px 24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {TIERS.map(tier => (
            <div
              key={tier.tier}
              style={{ background: tier.highlight ? `${tier.color}08` : 'var(--card)', border: `${tier.highlight ? '2px' : '1px'} solid ${tier.highlight ? tier.color + '50' : 'var(--border)'}`, borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}
            >
              {tier.highlight && (
                <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: tier.color, borderRadius: '0 0 8px 8px', padding: '2px 12px', fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingTop: tier.highlight ? '10px' : '0' }}>
                <span style={{ fontSize: '22px' }}>{tier.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--foreground)' }}>{tier.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: tier.color, fontWeight: 600 }}>{tier.price}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{tier.note}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {tier.features.slice(1).map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: tier.color, fontWeight: 800, marginTop: '2px' }}>✓</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--foreground)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                style={{ padding: '10px', background: tier.highlight ? `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)` : tier.color + '15', border: tier.highlight ? 'none' : `1px solid ${tier.color}40`, borderRadius: '10px', color: tier.highlight ? 'white' : tier.color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: tier.highlight ? `0 4px 14px ${tier.color}40` : 'none' }}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 24px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
            Goal #1 (current access): initial funding products still available · No credit card required to continue with free access
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Bureau Data ───────────────────────────────────────────────────────────────

interface BureauStep {
  label: string;
  description: string;
  path: string;
  pathLabel: string;
  moduleId?: string;
}

interface Bureau {
  id: string;
  icon: string;
  name: string;
  scoreLabel: string;
  bankableTarget: string;
  purpose: string;
  requiredModules: string[];
  steps: BureauStep[];
}

const BUREAUS: Bureau[] = [
  {
    id: 'dun-bradstreet', icon: '📊', name: 'Dun & Bradstreet', scoreLabel: 'PAYDEX Score',
    bankableTarget: '70+ (vendor credit) · 80+ (full strength)',
    purpose: 'B2B vendors for net terms, landlords for leases, government contracting',
    requiredModules: ['entity-filings', 'agencies-naics', 'business-banking'],
    steps: [
      { label: 'Register legal business entity', description: 'State filing required to open your D&B file', path: '/app/lender-compliance/entity-filings', pathLabel: 'Entity & Filings', moduleId: 'entity-filings' },
      { label: 'Get your D-U-N-S Number', description: 'Free at dnb.com — required to activate your PAYDEX file', path: '/app/lender-compliance/agencies-naics', pathLabel: 'Agencies & NAICS', moduleId: 'agencies-naics' },
      { label: 'Open dedicated business bank account', description: 'Establishes your business identity with financial institutions', path: '/app/lender-compliance/business-banking', pathLabel: 'Business Banking', moduleId: 'business-banking' },
      { label: 'Build 7–10 vendor tradelines (net-30)', description: 'Vendors reporting to D&B: Uline, Quill, Grainger, Crown Office Supplies', path: '/app/lender-compliance/comparable-credit', pathLabel: 'Comparable Credit', moduleId: 'comparable-credit' },
      { label: 'Pay all invoices 10 days early', description: 'D&B PAYDEX scores payment timing — early = highest possible score', path: '/app/building-credit', pathLabel: 'Building Credit guide' },
    ],
  },
  {
    id: 'experian-business', icon: '📈', name: 'Experian Business', scoreLabel: 'Intelliscore Plus',
    bankableTarget: '76+ (low risk) · 80+ (bankable)',
    purpose: 'Most business lenders and credit card issuers pull Experian first',
    requiredModules: ['entity-filings', 'agencies-naics'],
    steps: [
      { label: 'Register legal entity with state', description: 'Required for Experian to create a business file', path: '/app/lender-compliance/entity-filings', pathLabel: 'Entity & Filings', moduleId: 'entity-filings' },
      { label: 'Register with credit reporting agencies', description: 'Experian Business requires active registration to track your file', path: '/app/lender-compliance/agencies-naics', pathLabel: 'Agencies & NAICS', moduleId: 'agencies-naics' },
      { label: 'Build 7–10 reporting tradelines', description: 'Business cards and vendor accounts that report to Experian', path: '/app/lender-compliance/comparable-credit', pathLabel: 'Comparable Credit', moduleId: 'comparable-credit' },
      { label: 'Pay 5–10 days early, use accounts monthly', description: 'Inactive accounts lose reporting weight — use them or lose them', path: '/app/building-credit', pathLabel: 'Building Credit guide' },
      { label: 'Keep revolving utilization under 30%', description: 'Experian scores per-card and aggregate utilization separately', path: '/app/finances', pathLabel: 'Finances' },
    ],
  },
  {
    id: 'equifax-business', icon: '🏦', name: 'Equifax Business', scoreLabel: 'Business Credit Risk Score',
    bankableTarget: '500+ (acceptable) · 700+ (preferred)',
    purpose: 'Bank lenders and commercial real estate',
    requiredModules: ['entity-filings', 'business-banking'],
    steps: [
      { label: 'Register legal business entity', description: 'Entity establishment is the foundation of your Equifax file', path: '/app/lender-compliance/entity-filings', pathLabel: 'Entity & Filings', moduleId: 'entity-filings' },
      { label: 'Open business bank account', description: 'Equifax Business links your financial identity to your entity', path: '/app/lender-compliance/business-banking', pathLabel: 'Business Banking', moduleId: 'business-banking' },
      { label: 'Build business credit tradelines', description: 'Consistent payment history across multiple reporting accounts', path: '/app/lender-compliance/comparable-credit', pathLabel: 'Comparable Credit', moduleId: 'comparable-credit' },
      { label: 'Maintain consistent payment history 6+ months', description: 'Equifax weights time in business and payment consistency heavily', path: '/app/building-credit', pathLabel: 'Building Credit guide' },
    ],
  },
  {
    id: 'creditsafe', icon: '🛡️', name: 'CreditSafe', scoreLabel: 'CreditSafe Score',
    bankableTarget: '70+ (acceptable) · 85+ (preferred)',
    purpose: 'International lenders, B2B vendors, and some US commercial lenders',
    requiredModules: ['business-banking', 'ein-licenses'],
    steps: [
      { label: 'Open dedicated business bank account', description: 'CreditSafe uses banking data as a primary scoring signal', path: '/app/lender-compliance/business-banking', pathLabel: 'Business Banking', moduleId: 'business-banking' },
      { label: 'Get EIN registered', description: 'EIN is required for CreditSafe to create and verify your file', path: '/app/lender-compliance/ein-licenses', pathLabel: 'EIN & Licenses', moduleId: 'ein-licenses' },
      { label: 'Establish business tradelines', description: 'Vendor and credit accounts that report to CreditSafe', path: '/app/lender-compliance/comparable-credit', pathLabel: 'Comparable Credit', moduleId: 'comparable-credit' },
    ],
  },
  {
    id: 'fico-sbss', icon: '⚡', name: 'FICO SBSS', scoreLabel: 'Small Business Scoring Service',
    bankableTarget: '160+ = bankable threshold (SBA minimum)',
    purpose: 'SBA lenders and bank commercial loan departments — the final gatekeeper',
    requiredModules: ['entity-filings', 'business-banking', 'ein-licenses'],
    steps: [
      { label: 'Improve personal FICO to 720+', description: 'Personal FICO is the single largest input into SBSS — fix this first', path: '/app/optimize-reporting', pathLabel: "Owner's Credit tab" },
      { label: 'Complete all 13 compliance modules', description: 'Business compliance data feeds directly into the SBSS calculation', path: '/app/lender-compliance', pathLabel: 'Lender Compliance' },
      { label: 'Build business credit tradelines (6+ months)', description: 'SBSS weights business credit history and depth of file', path: '/app/lender-compliance/comparable-credit', pathLabel: 'Comparable Credit', moduleId: 'comparable-credit' },
      { label: 'Maintain business bank account 6+ months', description: 'Banking history is a key input — age of account matters', path: '/app/lender-compliance/business-banking', pathLabel: 'Business Banking', moduleId: 'business-banking' },
      { label: 'Keep business 2+ years with clean history', description: 'Time in business is a hard-weighted factor in SBSS', path: '/business-assessment', pathLabel: 'Update Assessment' },
    ],
  },
];

// ── Funding Program FICO Requirements ─────────────────────────────────────────

const PROGRAM_FICO = [
  { name: 'Merchant Cash Advance',    required: 500, path: '/app/access-funding/merchant-advance',          icon: '💵' },
  { name: 'Truck & Utility Vehicles', required: 550, path: '/app/access-funding/truck-utility-vehicles',    icon: '🚛' },
  { name: 'Startup Equipment',        required: 580, path: '/app/access-funding/startup-equipment',         icon: '🚀' },
  { name: 'Business Credit Line',     required: 600, path: '/app/access-funding/business-credit-line',      icon: '💳' },
  { name: 'Working Capital',          required: 600, path: '/app/access-funding/working-capital-loans',     icon: '⚡' },
  { name: 'Revenue-Based Loan',       required: 600, path: '/app/access-funding/revenue-based-loan',        icon: '📊' },
  { name: 'Equipment Financing',      required: 600, path: '/app/access-funding/equipment-financing',       icon: '🔧' },
  { name: 'Inventory Line of Credit', required: 600, path: '/app/access-funding/inventory-line-of-credit',  icon: '📦' },
  { name: 'Business Term Loan',       required: 640, path: '/app/access-funding/business-term-loan',        icon: '🏛️' },
  { name: 'Bridge Loans',             required: 640, path: '/app/access-funding/bridge-loans',              icon: '🌉' },
  { name: 'Credit Union Loans',       required: 650, path: '/app/access-funding/credit-union-loans',        icon: '🤝' },
  { name: 'DSCR Loans',               required: 660, path: '/app/access-funding/dscr-loans',                icon: '🏠' },
  { name: 'Construction Loans',       required: 660, path: '/app/access-funding/construction-loans',        icon: '🏗️' },
  { name: 'Personal Credit Cards',    required: 670, path: '/app/access-funding/personal-credit-cards',     icon: '🪪' },
  { name: 'Business Credit Cards',    required: 680, path: '/app/access-funding/business-credit-cards',     icon: '💼' },
  { name: 'SBA Business Loan',        required: 680, path: '/app/access-funding/sba-business-loan',         icon: '🏦' },
];

// ── Debt Strategies ───────────────────────────────────────────────────────────

const DEBT_STRATEGIES = [
  {
    label: 'Per-card utilization ≤ 45%',
    target: '≤ 45% on every individual card',
    optimal: '≤ 19% for max approvals',
    description: 'Lenders check each card separately — one card over 45% triggers a risk flag even if your total aggregate is fine. Pay down the highest-utilization card first.',
    actionPath: '/app/finances',
    action: 'View Finances',
  },
  {
    label: 'Aggregate utilization ≤ 45%',
    target: '≤ 45% across all revolving accounts',
    optimal: '≤ 19% for maximum FICO lift',
    description: 'Total balance across all cards divided by total credit limit. Both per-card and aggregate are scored — you need both below 45%.',
    actionPath: '/app/finances',
    action: 'View Finances',
  },
  {
    label: 'Pay highest utilization first, not highest balance',
    target: 'Highest % utilization account first',
    optimal: 'Never sort by dollar amount — sort by utilization %',
    description: 'The FICO model responds to utilization percentages, not payoff dollar amounts. A $500 balance on a $600 card hurts more than a $5,000 balance on a $20,000 card.',
    actionPath: '/app/finances',
    action: 'View Finances',
  },
  {
    label: 'Add installment credit to shift your mix',
    target: 'Mix of revolving + installment',
    optimal: 'Installment loan reduces revolving utilization ratio',
    description: 'If revolving utilization is high, adding a business installment loan can shift your credit mix and lower your effective revolving ratio — even without paying down balances.',
    actionPath: '/app/access-funding/business-term-loan',
    action: 'View Term Loans',
  },
];

// ── Inquiry Rules ─────────────────────────────────────────────────────────────

const INQUIRY_RULES = [
  { label: 'Max 4 total hard inquiries in 6 months', description: 'Most lender risk models auto-flag files with 4+ inquiries. The window is 6 months rolling — not per year.', risk: 'high' },
  { label: 'Max 2 revolving inquiries in 6 months', description: 'Revolving applications (cards, lines of credit) are weighted heavier than installment. Lenders track these separately in their risk models.', risk: 'high' },
  { label: 'No shot-gunning — one lender at a time', description: 'Applying to multiple lenders the same day creates a burst of inquiries. It signals desperation. Wait 30–60 days between applications for the same product.', risk: 'medium' },
  { label: '5 in 24 rule (Chase and some banks)', description: 'Opening 5+ new accounts in 24 months triggers automatic decline at several major lenders — even if your score is strong. Applies to personal cards.', risk: 'medium' },
  { label: 'Freeze third-party data brokers', description: 'LexisNexis, SageStream, Innovis, and TeleTrack all sell data to lenders. Freezing them prevents silent pulls you never authorized. Request freezes at each provider separately.', risk: 'low' },
];

// ── Quick Wins ────────────────────────────────────────────────────────────────

const QUICK_WINS = [
  { label: 'Pull your free credit report',                    time: '5 min',  impact: '+0 pts — but you need to know what lenders see',  path: 'https://annualcreditreport.com', external: true },
  { label: 'Dispute any errors on your report',              time: '15 min', impact: '+15–40 pts if errors are found and corrected',      path: 'https://annualcreditreport.com', external: true },
  { label: 'Become authorized user on an aged account',      time: '10 min', impact: '+10–30 pts — inherits the account\'s full history', path: '/app/lender-compliance/comparable-credit', external: false },
  { label: 'Request credit limit increase on existing cards', time: '5 min',  impact: 'Drops utilization % without paying a dollar',       path: 'https://annualcreditreport.com', external: true },
  { label: 'Open a secured business credit card',            time: '10 min', impact: 'Builds business credit with zero personal risk',     path: '/app/lender-compliance/cd-business-loan', external: false },
  { label: 'Freeze LexisNexis, SageStream, Innovis, TeleTrack', time: '20 min', impact: 'Stops silent third-party data pulls',           path: 'https://optout.lexisnexis.com', external: true },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHook({ text }: { text: string }) {
  return (
    <div style={{ background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.15)', borderLeft: '3px solid #ef4444', borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: '16px' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>{text}</p>
    </div>
  );
}

function SectionHead({ icon, title, badge, color = '#10b981' }: { icon: React.ReactNode; title: string; badge: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      {icon}
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', color: 'var(--foreground)', margin: 0 }}>{title}</h2>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color, background: `${color}14`, border: `1px solid ${color}35`, borderRadius: '5px', padding: '2px 8px' }}>{badge}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: 'established' | 'building' | 'not-started' }) {
  const c = status === 'established'
    ? { label: 'Established', bg: 'rgba(16,185,129,.08)', border: 'rgba(16,185,129,.25)', color: '#10b981' }
    : status === 'building'
    ? { label: 'Building',     bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.25)', color: '#f59e0b' }
    : { label: 'Not Started',  bg: 'rgba(239,68,68,.08)',  border: 'rgba(239,68,68,.25)',  color: '#ef4444' };
  return (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '5px', background: c.bg, border: `1px solid ${c.border}`, color: c.color, whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  );
}

function BureauRow({ bureau, completedModules, expandedId, onToggle, navigate, locked, onLockedClick }: {
  bureau: Bureau; completedModules: string[]; expandedId: string | null;
  onToggle: (id: string) => void; navigate: (p: string) => void;
  locked?: boolean; onLockedClick?: () => void;
}) {
  const isExpanded = expandedId === bureau.id;
  const stepsCompleted = bureau.steps.filter(s => s.moduleId && completedModules.includes(s.moduleId)).length;
  const status: 'established' | 'building' | 'not-started' =
    bureau.requiredModules.every(m => completedModules.includes(m)) ? 'established' :
    bureau.requiredModules.some(m => completedModules.includes(m)) ? 'building' : 'not-started';
  const isComplete = status === 'established';

  return (
    <div style={{ border: `1px solid ${locked ? 'var(--border)' : isComplete ? 'rgba(16,185,129,.25)' : 'var(--border)'}`, borderRadius: '14px', overflow: 'hidden', background: locked ? 'var(--card)' : isComplete ? 'rgba(16,185,129,.03)' : 'var(--card)', position: 'relative', opacity: locked ? 0.75 : 1 }}>
      {/* Lock strip for free-tier — identical to ModuleCard */}
      {locked && (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '3px', background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />
      )}
      <div onClick={() => locked ? onLockedClick?.() : onToggle(bureau.id)} style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.02)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
      >
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, background: locked ? 'rgba(99,102,241,0.06)' : isComplete ? 'rgba(16,185,129,.1)' : 'var(--background)', border: `1px solid ${locked ? 'rgba(99,102,241,0.2)' : isComplete ? 'rgba(16,185,129,.2)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', filter: locked ? 'grayscale(0.4)' : 'none' }}>
          {bureau.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>{bureau.name}</span>
            {isComplete && <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
            {bureau.scoreLabel} · Target: {bureau.bankableTarget}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          {locked ? (
            <>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '5px', padding: '2px 7px' }}>
                Locked
              </span>
              <Lock size={14} style={{ color: '#6366f1' }} />
            </>
          ) : (
            <>
              <StatusBadge status={status} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>{stepsCompleted}/{bureau.steps.length} steps</span>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.18 }}>
                  <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '10px 18px', background: 'rgba(0,0,0,.02)', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
                <strong style={{ color: 'var(--foreground)' }}>Who pulls this:</strong> {bureau.purpose}
              </p>
            </div>
            {bureau.steps.map((step, i) => {
              const done = step.moduleId ? completedModules.includes(step.moduleId) : false;
              return (
                <div key={i}
                  onClick={() => step.path.startsWith('http') ? window.open(step.path, '_blank') : navigate(step.path)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 18px', borderBottom: i < bureau.steps.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.02)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, background: done ? '#10b981' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                    {done
                      ? <CheckCircle2 size={12} style={{ color: 'white' }} />
                      : <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700, color: 'var(--muted-foreground)' }}>{i + 1}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: done ? '#10b981' : 'var(--foreground)', marginBottom: '2px' }}>{step.label}{done ? ' ✓' : ''}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{step.description}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: '5px', padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {step.pathLabel} →
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProgramRow({ name, icon, required, userFico, path, navigate }: {
  name: string; icon: string; required: number; userFico: number; path: string; navigate: (p: string) => void;
}) {
  const met = userFico > 0 && userFico >= required;
  const gap = required - userFico;
  return (
    <motion.div onClick={() => navigate(path)}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${met ? 'rgba(16,185,129,.2)' : 'var(--border)'}`, background: met ? 'rgba(16,185,129,.03)' : 'var(--card)', cursor: 'pointer' }}
      whileHover={{ boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}
    >
      <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{name}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>Requires {required}+ FICO</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {userFico === 0 ? (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>Complete scan</span>
        ) : met ? (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: '5px', padding: '2px 8px' }}>✓ Qualified</span>
        ) : (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '5px', padding: '2px 8px' }}>+{gap} pts needed</span>
        )}
        <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />
      </div>
    </motion.div>
  );
}

function StrategyRow({ label, target, optimal, description, action, actionPath, navigate }: {
  label: string; target: string; optimal: string; description: string; action: string; actionPath: string; navigate: (p: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--card)' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '2px' }}>{label}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>Target: {target}</div>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: '5px', padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>{optimal}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5, margin: 0 }}>{description}</p>
              <button onClick={e => { e.stopPropagation(); navigate(actionPath); }}
                style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '11px', padding: '6px 12px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.25)', borderRadius: '8px', color: '#10b981', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {action} →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InquiryRow({ label, description, risk }: { label: string; description: string; risk: string }) {
  const [open, setOpen] = useState(false);
  const color = risk === 'high' ? '#ef4444' : risk === 'medium' ? '#f59e0b' : '#10b981';
  const riskBg = risk === 'high' ? 'rgba(239,68,68,.06)' : risk === 'medium' ? 'rgba(245,158,11,.06)' : 'rgba(16,185,129,.06)';
  const riskBorder = risk === 'high' ? 'rgba(239,68,68,.2)' : risk === 'medium' ? 'rgba(245,158,11,.2)' : 'rgba(16,185,129,.2)';
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--card)' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{label}</div>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '5px', background: riskBg, border: `1px solid ${riskBorder}`, color, flexShrink: 0 }}>
          {risk === 'high' ? 'High Risk' : risk === 'medium' ? 'Med Risk' : 'Low Risk'}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '12px 16px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5, margin: 0 }}>{description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickWinRow({ label, time, impact, path, external, navigate }: {
  label: string; time: string; impact: string; path: string; external: boolean; navigate: (p: string) => void;
}) {
  return (
    <motion.div
      onClick={() => external ? window.open(path, '_blank') : navigate(path)}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', cursor: 'pointer' }}
      whileHover={{ boxShadow: '0 2px 10px rgba(0,0,0,.06)' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#10b981', fontWeight: 500 }}>{impact}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>{time}</span>
        <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />
      </div>
    </motion.div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function OptimizeReporting() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MainTab>('business');
  const [assessment, setAssessment] = useState<AssessmentData>({});
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [creditScore, setCreditScore] = useState(0);
  const [ageMonths, setAgeMonths] = useState(0);
  const [expandedBureau, setExpandedBureau] = useState<string | null>(null);
  const [tier, setTier] = useState<MembershipTier>(() => getMembershipTier());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isLocked = !canAccessGoal2(tier);

  const openUpgrade = () => {
    logEvent({ event_name: 'upgrade_started', payload: { source: 'optimize_reporting' } });
    setShowUpgrade(true);
  };

  useEffect(() => {
    const updateTier = () => setTier(getMembershipTier());
    loadData();
    window.addEventListener('businessDataUpdated', loadData);
    window.addEventListener('scanDataUpdated', loadData);
    window.addEventListener('membershipUpdated', updateTier);
    window.addEventListener('auditItemUpdated', loadData);
    window.addEventListener('complianceProgressUpdated', loadData);
    return () => {
      window.removeEventListener('businessDataUpdated', loadData);
      window.removeEventListener('scanDataUpdated', loadData);
      window.removeEventListener('membershipUpdated', updateTier);
      window.removeEventListener('auditItemUpdated', loadData);
      window.removeEventListener('complianceProgressUpdated', loadData);
    };
  }, []);

  function loadData() {
    try {
      const raw = localStorage.getItem('unified_assessment');
      const data: AssessmentData = raw ? JSON.parse(raw) : {};
      setAssessment(data);
      setCreditScore(getCreditScore(data));
      setAgeMonths(getAgeMonths(data));
    } catch { /* no data */ }
    try {
      const progress = getComplianceProgress();
      const done = Object.entries(progress)
        .filter(([, val]) => val.completed)
        .map(([id]) => id);
      setCompletedModules(done);
    } catch { /* no compliance data */ }
  }

  // Derived state
  const bureausEstablished = BUREAUS.filter(b => b.requiredModules.every(m => completedModules.includes(m))).length;
  const totalBureauSteps = BUREAUS.reduce((s, b) => s + b.steps.length, 0);
  const doneBureauSteps = BUREAUS.reduce((s, b) => s + b.steps.filter(st => st.moduleId && completedModules.includes(st.moduleId)).length, 0);
  const qualifiedPrograms = PROGRAM_FICO.filter(p => creditScore > 0 && creditScore >= p.required).length;
  const ficoSBSS = getFicoSBSS(creditScore, ageMonths, completedModules.length);
  const gaugeColor = creditScore >= 720 ? '#10b981' : creditScore >= 650 ? '#f59e0b' : '#ef4444';
  const sbssColor = ficoSBSS >= 160 ? '#10b981' : ficoSBSS >= 120 ? '#f59e0b' : '#ef4444';
  const ficoLabel = creditScore >= 750 ? 'Excellent' : creditScore >= 700 ? 'Good' : creditScore >= 650 ? 'Fair' : creditScore >= 580 ? 'Below Average' : creditScore > 0 ? 'Poor' : '';

  // Smart next-step CTA — mirrors LenderCompliance "Continue" button
  const nextBureau = BUREAUS.find(b => !b.requiredModules.every(m => completedModules.includes(m)));
  const nextStep = nextBureau?.steps.find(s => !s.moduleId || !completedModules.includes(s.moduleId));

  // Wrap navigate to always pass origin state for module breadcrumbs
  const navigateFrom = (path: string) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
      return;
    }
    navigate(path, { state: { fromPath: '/app/optimize-reporting', fromLabel: 'Optimize Reporting' } });
  };

  return (
    <>
      <AnimatePresence>{showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} source="optimize_reporting" />}</AnimatePresence>
      <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
      <div style={{ padding: '32px 28px 48px', width: '100%', boxSizing: 'border-box' }}>

        {/* FREE-TIER UPGRADE BANNER — matches LenderCompliance exactly */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Lock size={18} style={{ color: '#6366f1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--foreground)', marginBottom: '3px' }}>
                Goal #2 — Become Bankable — requires Full Access
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                Most owners don't know what lenders see when they pull their business credit file. This section shows you every bureau gap, every FICO gap, and the exact actions that fix them — with a coach at every step.
              </div>
            </div>
            <button
              onClick={() => openUpgrade()}
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 14px rgba(99,102,241,0.3)', whiteSpace: 'nowrap' }}
            >
              Upgrade to Unlock →
            </button>
          </motion.div>
        )}

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '28px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Goal #2 — Become Bankable
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(26px,3.5vw,36px)', color: 'var(--foreground)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
                Optimize Reporting
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', marginTop: '6px' }}>
                Bureau-by-bureau roadmap to build business credit and optimize your owner's FICO — so lenders see exactly what you need them to see
              </p>
            </div>
            {isLocked ? (
              <button
                onClick={() => openUpgrade()}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(99,102,241,0.25)', flexShrink: 0 }}
              >
                <Lock size={13} /> Unlock Full Access
              </button>
            ) : nextStep ? (
              <button
                onClick={() => navigateFrom(nextStep.path)}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(16,185,129,0.25)', flexShrink: 0 }}
              >
                {bureausEstablished === 0 ? 'Start First Bureau' : 'Continue'} <ArrowRight size={14} />
              </button>
            ) : null}
          </div>
        </motion.div>

        {/* PROGRESS HERO */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px 28px', marginBottom: '28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" strokeWidth="5" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#10b981" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - bureausEstablished / 5)}`}
                    strokeLinecap="round" transform="rotate(-90 28 28)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '12px', color: '#10b981' }}>
                  {bureausEstablished}/5
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', color: 'var(--foreground)', lineHeight: 1 }}>
                  {doneBureauSteps} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>/ {totalBureauSteps} bureau steps complete</span>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                  {bureausEstablished} of 5 bureaus established · {qualifiedPrograms} of {PROGRAM_FICO.length} programs FICO-qualified
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ padding: '8px 14px', borderRadius: '10px', background: `${gaugeColor}0a`, border: `1px solid ${gaugeColor}30`, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: gaugeColor }}>{creditScore > 0 ? creditScore : '—'}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Personal FICO</div>
              </div>
              <div style={{ padding: '8px 14px', borderRadius: '10px', background: `${sbssColor}0a`, border: `1px solid ${sbssColor}30`, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: sbssColor }}>{ficoSBSS > 0 ? `~${ficoSBSS}` : '—'}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>FICO SBSS /300</div>
              </div>
            </div>
          </div>
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((bureausEstablished / 5) * 100, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg,#10b98199,#10b981)', borderRadius: '99px' }}
            />
          </div>
        </motion.div>

        {/* TAB BAR */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', marginBottom: '28px', width: 'fit-content' }}>
          {([['business', '🏢  Business Credit'], ['owner', '👤  Owner\'s Credit']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ fontFamily: 'var(--font-body)', fontWeight: activeTab === tab ? 700 : 500, fontSize: '13px', padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', background: activeTab === tab ? 'var(--background)' : 'transparent', color: activeTab === tab ? 'var(--foreground)' : 'var(--muted-foreground)', boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,.1)' : 'none', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── BUSINESS CREDIT TAB ──────────────────────────────────────────── */}
        {activeTab === 'business' && (
          <motion.div key="business" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <SectionHead icon={<BarChart3 size={18} style={{ color: '#10b981' }} />} title="Business Credit Bureaus" badge={`${bureausEstablished} of 5 established`} />
            <SectionHook text="Lenders, vendors, and landlords each pull different bureaus. A bureau file that doesn't exist is the same as a credit score of zero — your application is invisible before it's ever read." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {BUREAUS.map((bureau, i) => (
                <motion.div key={bureau.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <BureauRow bureau={bureau} completedModules={completedModules} expandedId={expandedBureau}
                    onToggle={id => setExpandedBureau(expandedBureau === id ? null : id)} navigate={navigateFrom}
                    locked={isLocked} onLockedClick={() => openUpgrade()} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── OWNER'S CREDIT TAB ───────────────────────────────────────────── */}
        {activeTab === 'owner' && (
          <motion.div key="owner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

            {/* FICO Summary Card */}
            <motion.div style={{ background: 'var(--card)', border: `1px solid ${gaugeColor}30`, borderRadius: '14px', padding: '20px 24px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Your Personal FICO</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', color: gaugeColor, lineHeight: 1 }}>
                    {creditScore > 0 ? creditScore : '—'}
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)', marginLeft: '8px' }}>
                      {ficoLabel || 'Complete scan to see your score'}
                    </span>
                  </div>
                  <div style={{ marginTop: '10px', height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((creditScore / 850) * 100, 100)}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
                      style={{ height: '100%', background: `linear-gradient(90deg,${gaugeColor}99,${gaugeColor})`, borderRadius: '99px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>300 · Poor</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#10b981', fontWeight: 600 }}>720 = ideal · 850 · Max</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 20px', borderRadius: '12px', background: `${sbssColor}0a`, border: `1px solid ${sbssColor}30` }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: sbssColor }}>{ficoSBSS > 0 ? `~${ficoSBSS}` : '—'}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase' }}>FICO SBSS / 300</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, marginTop: '4px', color: ficoSBSS >= 160 ? '#10b981' : '#ef4444' }}>
                    {ficoSBSS >= 160 ? '✓ Above bankable threshold' : ficoSBSS > 0 ? `${160 - ficoSBSS} pts to bankable (160)` : 'Complete scan'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FICO vs Programs */}
            <div style={{ marginBottom: '32px' }}>
              <SectionHead icon={<Target size={18} style={{ color: '#3b82f6' }} />} title="FICO vs. Funding Programs" badge={`${qualifiedPrograms} of ${PROGRAM_FICO.length} qualified`} color="#3b82f6" />
              <SectionHook text="Every 10 points below 720 costs roughly 0.5% APR. On a $500K loan that's $2,500 per year in extra interest — compounding every year you carry the balance." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {PROGRAM_FICO.map((p, i) => (
                  <motion.div key={p.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <ProgramRow {...p} userFico={creditScore} navigate={navigateFrom} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Debt Strategy */}
            <div style={{ marginBottom: '32px' }}>
              <SectionHead icon={<BarChart3 size={18} style={{ color: '#f59e0b' }} />} title="Debt & Utilization Strategy" badge="4 rules" color="#f59e0b" />
              <SectionHook text="Lenders see your card-by-card utilization before your application reaches a human. One card over 45% triggers a risk flag — even if your aggregate looks fine." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DEBT_STRATEGIES.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <StrategyRow {...s} navigate={navigateFrom} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Inquiry Management */}
            <div style={{ marginBottom: '32px' }}>
              <SectionHead icon={<AlertTriangle size={18} style={{ color: '#ef4444' }} />} title="Inquiry Management" badge={`${INQUIRY_RULES.length} rules`} color="#ef4444" />
              <SectionHook text="4 or more hard inquiries in 6 months flags you as 'credit hungry' in most lender risk systems. They see this before reading anything else in your file." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {INQUIRY_RULES.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <InquiryRow {...r} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Wins */}
            <div>
              <SectionHead icon={<Zap size={18} style={{ color: '#8b5cf6' }} />} title="Quick Wins" badge={`${QUICK_WINS.length} actions`} color="#8b5cf6" />
              <SectionHook text="These six actions take under 30 minutes each and can add 15–40 points to your FICO. Most people skip them because nobody told them they existed." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {QUICK_WINS.map((w, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <QuickWinRow {...w} navigate={navigateFrom} />
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
    </>
  );
}
