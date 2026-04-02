// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — FORGE™ AI Coach
// Not a dashboard. Not a report. A capital transformation engine with a voice.
//
// Elon: one truth function drives everything. Every response uses real data.
//       If two users get the same response, the system is broken.
// Chase: identity-first. Greet by name. Use behavioral language that creates
//        forward momentum. The Q&A is where belief and action are built.
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain, ArrowRight, CheckCircle, Circle, ChevronDown,
  Send, Zap, TrendingUp, Lock, DollarSign, Shield,
  MessageSquare, RotateCcw, Sparkles,
} from 'lucide-react';
import { computeScore } from './business-assessment/engine';
import { DIM_LABELS } from './business-assessment/types';
import { evaluateProducts } from './business-assessment/productEligibility';
import { getAllAuditItems } from '../utils/businessData';
import { complianceModules, getComplianceProgress } from '../utils/lenderComplianceModules';
import { getPreQualifiedPrograms } from '../utils/fundingEligibility';
import { checkForgeOutput } from '../lib/ai/guardrails';
import { logEvent } from '../lib/analytics/events';
import { greetingTemplate } from '../lib/forge/chat-greeting';
import {
  nextStepResponse, sbaResponse, scoreExplainResponse, sbssResponse,
  timelineResponse, aprResponse, preQualResponse, whatIsForgeResponse,
  modulesResponse, blockersResponse, revenueResponse, defaultResponse,
} from '../lib/forge/chat-responses';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CoachContext {
  name: string;
  businessName: string;
  fundScore: number;
  bankableScore: number;
  dimAvg: Record<string, number>;
  completedModules: number;
  totalModules: number;
  preQualCount: number;
  preQualIds: string[];
  criticalBlockers: string[];
  topIncompleteModule: string;
  topIncompleteModulePath: string;
  actualMaxFunding: number;
  monthsInBusiness: number;
  creditCategory: string;
  monthlyRevenue: string;
  hasBankAccount: boolean;
  hasEIN: boolean;
  stage: 1 | 2 | 3;
  stageLabel: string;
  tier: 'Fundable' | 'Approaching Bankable' | 'Bankable';
  tierColor: string;
  pointsToBank: number;
  weakestDim: string;
  weakestDimScore: number;
}

interface ChatMessage {
  role: 'forge' | 'user';
  text: string;
  timestamp: number;
}

interface RoadmapItem {
  id: string;
  label: string;
  why: string;
  impact: string;
  done: boolean;
  path?: string;
  pathLabel?: string;
}

interface RoadmapStage {
  number: 1 | 2 | 3;
  name: string;
  headline: string;
  narrative: string;
  capitalRange: string;
  aprRange: string;
  color: string;
  bg: string;
  border: string;
  items: RoadmapItem[];
  capitalUnlock: string;
  timeframe: string;
  complete: boolean;
}

// ─── Context Builder ──────────────────────────────────────────────────────────

function buildContext(raw: string): CoachContext | null {
  try {
    const data = JSON.parse(raw);
    const score = computeScore(data);
    const progress = getComplianceProgress();
    const auditItems = getAllAuditItems();
    const preQual = getPreQualifiedPrograms();
    const prods = evaluateProducts(data, score.score);
    const eligible = prods.filter(p => p.qualifies);

    const maxFunding = eligible.length > 0
      ? Math.max(...eligible.map(p => {
          const a = p.maxAmount.replace(/[$,KM+]/g, '');
          return a.includes('.') ? parseFloat(a) * 1_000_000 : parseInt(a) * 1000;
        })) : 0;

    const completedMods = complianceModules.filter(m => progress[m.id]?.completed);
    const incompleteMods = complianceModules.filter(m => !progress[m.id]?.completed);
    const nextMod = incompleteMods[0];

    const criticalBlockers = auditItems
      .filter(i => i.status !== 'complete' && i.priority === 'critical')
      .map(i => i.title)
      .slice(0, 3);

    const dimAvg = score.dimAvg as unknown as Record<string, number>;
    const weakest = Object.entries(dimAvg).sort((a, b) => a[1] - b[1])[0];

    // Stage determination
    const stage = completedMods.length >= 8 && score.bankableScore >= 130 ? 3
      : completedMods.length >= 4 && preQual.length > 0 ? 2 : 1;

    const tier = score.bankableScore >= 160 ? 'Bankable'
      : score.bankableScore >= 120 ? 'Approaching Bankable' : 'Fundable';

    const tierColor = tier === 'Bankable' ? '#10b981'
      : tier === 'Approaching Bankable' ? '#f59e0b' : '#3b82f6';

    // Business age in months
    const startYear = data.startDate?.year ? parseInt(data.startDate.year) : 0;
    const startMonth = data.startDate?.month ? parseInt(data.startDate.month) : 0;
    const now = new Date();
    const monthsInBiz = startYear
      ? (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth)
      : 0;

    const revenueLabel: Record<string, string> = {
      under_5k: 'under $5K/mo', '5k_15k': '$5K–$15K/mo',
      '15k_40k': '$15K–$40K/mo', '40k_100k': '$40K–$100K/mo', over_100k: 'over $100K/mo',
    };

    return {
      name: data.ownerFirstName || data.ownerName?.split(' ')[0] || data.firstName || '',
      businessName: data.businessName || '',
      fundScore: score.score,
      bankableScore: score.bankableScore,
      dimAvg,
      completedModules: completedMods.length,
      totalModules: complianceModules.length,
      preQualCount: preQual.length,
      preQualIds: preQual,
      criticalBlockers,
      topIncompleteModule: nextMod?.title || '',
      topIncompleteModulePath: nextMod ? `/app/lender-compliance/${nextMod.id}` : '/app/lender-compliance',
      actualMaxFunding: maxFunding,
      monthsInBusiness: monthsInBiz,
      creditCategory: data.experian || 'unknown',
      monthlyRevenue: revenueLabel[data.monthlyRevenue] || 'unknown',
      hasBankAccount: data.bankAccount === 'dedicated',
      hasEIN: data.hasEIN === true,
      stage: stage as 1 | 2 | 3,
      stageLabel: stage === 3 ? 'Bankable' : stage === 2 ? 'Momentum' : 'Foundation',
      tier,
      tierColor,
      pointsToBank: Math.max(0, 160 - score.bankableScore),
      weakestDim: DIM_LABELS[weakest?.[0]] || 'Compliance',
      weakestDimScore: Math.round((weakest?.[1] || 0) * 100),
    };
  } catch { return null; }
}

// ─── Dynamic Roadmap Generator ────────────────────────────────────────────────

function buildDynamicRoadmap(ctx: CoachContext, progress: ReturnType<typeof getComplianceProgress>): RoadmapStage[] {
  const s = ctx;

  const stage1: RoadmapStage = {
    number: 1,
    name: 'Foundation',
    headline: s.completedModules >= 5 ? 'Foundation nearly complete' : 'Build the structure lenders verify first',
    narrative: s.completedModules >= 5
      ? `You've completed ${s.completedModules} of 13 compliance modules. The lender verification layer is mostly in place. ${s.criticalBlockers.length > 0 ? `One critical item still flags: ${s.criticalBlockers[0]}.` : 'No critical blockers detected.'}`
      : `Lenders verify ${s.businessName || 'your business'} before approving anything. Right now ${s.completedModules === 0 ? 'none of' : `${s.completedModules} of`} the 13 verification layers are confirmed. Until these are in place, even a great credit score won't move approvals forward.`,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.06)',
    border: 'rgba(59,130,246,0.2)',
    timeframe: s.completedModules >= 4 ? '≈7–14 days to finish' : '≈14–30 days',
    capitalRange: '$10K – $150K',
    aprRange: '35%+ APR',
    capitalUnlock: 'Unlocks: MCA · Working Capital · Revenue-Based Loans · Credit Cards',
    complete: s.completedModules >= 5,
    items: [
      {
        id: 'entity', label: 'Form a legal business entity (LLC or Corp)',
        why: 'Lenders and bureaus can\'t verify a sole prop. An LLC or Corp creates a separate credit file.',
        impact: 'Required for SBA, bank loans, and all traditional products',
        done: progress['entity-filings']?.completed ?? false,
        path: '/app/lender-compliance/entity-filings', pathLabel: 'Complete module →',
      },
      {
        id: 'ein', label: 'Obtain EIN and all required licenses',
        why: 'Your EIN is your business Social Security Number — without it, lenders can\'t pull your business credit.',
        impact: '+35 FundScore · Required for 14 of 17 funding products',
        done: progress['ein-licenses']?.completed ?? false,
        path: '/app/lender-compliance/ein-licenses', pathLabel: 'Complete module →',
      },
      {
        id: 'banking', label: 'Open a dedicated business bank account',
        why: 'Bank statements are the #1 document lenders request. A personal account disqualifies you from most products.',
        impact: '+30 FundScore · Required for 12 of 17 products · Starts 3-month statement clock',
        done: progress['business-banking']?.completed ?? false,
        path: '/app/lender-compliance/business-banking', pathLabel: 'Complete module →',
      },
      {
        id: 'location', label: 'Establish a verified business address',
        why: `Lenders run a database check on ${s.businessName || 'your business'} address. A home address or virtual office can trigger a decline.`,
        impact: '+25 FundScore · Lender verification required',
        done: progress['business-location']?.completed ?? false,
        path: '/app/lender-compliance/business-location', pathLabel: 'Complete module →',
      },
      {
        id: 'nap', label: 'Establish consistent NAP across all directories',
        why: 'Name, Address, Phone must match exactly on Google, 411, D&B, Experian Business. Inconsistency = lender red flag.',
        impact: `+20 FundScore · NAP inconsistency is one of the most common silent declines`,
        done: progress['phones-411']?.completed ?? false,
        path: '/app/lender-compliance/phones-411', pathLabel: 'Complete module →',
      },
    ],
  };

  const stage2: RoadmapStage = {
    number: 2,
    name: 'Momentum',
    headline: s.preQualCount > 0 ? `${s.preQualCount} funding products ready to apply` : 'Get your first funding + build your credit profile',
    narrative: s.preQualCount > 0
      ? `You have ${s.preQualCount} pre-qualified product${s.preQualCount !== 1 ? 's' : ''} ready to apply for now. Your first funding starts your repayment history — which feeds your SBSS score. Use this stage to establish ${s.completedModules < 7 ? 'the remaining compliance modules and' : ''} 3+ business tradelines.`
      : `Stage 2 is where capital velocity begins. Getting your first funding — even a small working capital line — starts your repayment history. Complete your business registration with D&B and Experian Business so your payments report to the bureaus that actually matter for SBSS.`,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.06)',
    border: 'rgba(16,185,129,0.2)',
    timeframe: '≈30–120 days',
    capitalRange: '$50K – $500K',
    aprRange: '15–25% APR',
    capitalUnlock: 'Unlocks: Business Credit Line · Equipment Financing · Business Term Loan · Credit Unions',
    complete: s.completedModules >= 9 && s.preQualCount > 0,
    items: [
      {
        id: 'website', label: 'Build a professional website + business email',
        why: 'Lenders Google you. A domain email (info@yourbusiness.com) signals legitimacy. Without it, 40%+ of applications get flagged for manual review.',
        impact: '+20 FundScore · Credibility check by underwriters',
        done: progress['website-email']?.completed ?? false,
        path: '/app/lender-compliance/website-email', pathLabel: 'Complete module →',
      },
      {
        id: 'agencies', label: 'Register with D&B, Experian Business, and get NAICS code',
        why: `This is where ${s.businessName || 'your business'} credit file starts. Without D&B registration, no business payments report — your SBSS stays at zero regardless of how well you perform.`,
        impact: '+35 FundScore · SBSS 15% weighting starts here',
        done: progress['agencies-naics']?.completed ?? false,
        path: '/app/lender-compliance/agencies-naics', pathLabel: 'Complete module →',
      },
      {
        id: 'first-funding',
        label: s.preQualCount > 0
          ? `Apply for first pre-qualified program (${s.preQualCount} available now)`
          : 'Complete assessment to unlock first funding products',
        why: 'Your first funding creates a repayment track record. This is what converts your compliance work into a live credit event that reports.',
        impact: 'Starts SBSS repayment history · Opens door to 2nd round at better terms',
        done: false,
        path: s.preQualCount > 0 ? '/app/access-funding' : '/business-assessment',
        pathLabel: s.preQualCount > 0 ? `Apply Now (${s.preQualCount} ready) →` : 'Complete Scan →',
      },
      {
        id: 'bank-rating', label: 'Achieve business bank rating of 1-5 (BankScore)',
        why: 'Banks assign an internal score from 1-9. Scores above 5 trigger automatic review flags. This module shows exactly how to stay in the 1-5 range.',
        impact: '+30 FundScore · Internal bank scoring affects ALL bank product decisions',
        done: progress['bank-rating']?.completed ?? false,
        path: '/app/lender-compliance/bank-rating', pathLabel: 'Complete module →',
      },
      {
        id: 'biz-plan', label: 'Create a lender-ready business plan',
        why: 'Required by SBA, all bank term loans, and equipment financing. A well-structured plan can add 15-20 points to your SBSS scoring.',
        impact: 'Required for SBA · Improves terms on all traditional products',
        done: progress['business-plan']?.completed ?? false,
        path: '/app/lender-compliance/business-plan', pathLabel: 'Complete module →',
      },
    ],
  };

  const stage3: RoadmapStage = {
    number: 3,
    name: 'Bankable',
    headline: s.bankableScore >= 160 ? '✓ Bankable threshold crossed' : `${s.pointsToBank} SBSS points to bank capital`,
    narrative: s.bankableScore >= 160
      ? `${s.name ? s.name + ', you\'ve' : 'You\'ve'} crossed the SBSS 160 bankability threshold. You now qualify for institutional capital — SBA loans, bank term loans, and the full suite of traditional products. The cost of your capital just dropped from 35%+ to 8-15%.`
      : `The SBSS 160 threshold is the line between expensive capital and institutional bank capital. ${s.name ? s.name + ' is' : 'You\'re'} currently at ${s.bankableScore}/300 — ${s.pointsToBank} points away. The path: complete all compliance modules and establish 3+ reporting business tradelines.`,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.06)',
    border: 'rgba(139,92,246,0.2)',
    timeframe: s.bankableScore >= 130 ? '≈60–120 days' : '≈120–240 days',
    capitalRange: '$250K – $5M+',
    aprRange: '8–15% APR',
    capitalUnlock: 'Unlocks: SBA 7(a) & 504 · Bank Term Loans · DSCR Loans · Construction · Full Institutional Suite',
    complete: s.bankableScore >= 160,
    items: [
      {
        id: 'assets', label: 'Document business assets and UCC filing status',
        why: 'Collateral documentation strengthens your lender file. Even intangible assets — receivables, equipment, IP — can be used as collateral signals.',
        impact: '+25 FundScore · Required for secured bank products',
        done: progress['assets-ucc']?.completed ?? false,
        path: '/app/lender-compliance/assets-ucc', pathLabel: 'Complete module →',
      },
      {
        id: 'comparable', label: 'Build 3+ business tradelines (comparable credit)',
        why: 'This is 15% of your SBSS score. Three reporting tradelines from Net-30 vendors is the minimum to move the SBSS needle. Without them, your business credit file is empty regardless of personal credit.',
        impact: '+40 FundScore · Critical for SBSS 160 threshold',
        done: progress['comparable-credit']?.completed ?? false,
        path: '/app/lender-compliance/comparable-credit', pathLabel: 'Complete module →',
      },
      {
        id: 'corp-facts', label: 'Leverage corp-only lending advantages',
        why: 'Corporations access products sole props and LLCs cannot. Understanding the corp structure unlocks higher limits and lower personal guarantee requirements.',
        impact: 'Higher limits · Lower PG requirements · Corp-exclusive products',
        done: progress['corp-only-facts']?.completed ?? false,
        path: '/app/lender-compliance/corp-only-facts', pathLabel: 'Complete module →',
      },
      {
        id: 'cd-loan', label: 'Execute a CD-secured business loan strategy',
        why: 'A CD loan creates an instant, fully-paid tradeline that reports to all 3 business bureaus. It\'s the fastest single action to push your SBSS score.',
        impact: `Fastest path to SBSS 160 — can add 20-30 points in one move`,
        done: progress['cd-business-loan']?.completed ?? false,
        path: '/app/lender-compliance/cd-business-loan', pathLabel: 'Learn strategy →',
      },
      {
        id: 'sbss-target',
        label: `Reach SBSS 160+ (currently ${s.bankableScore}/300)`,
        why: `SBSS 160 is the SBA\'s minimum threshold. Below it: automatic review. Above it: automated approval for SBA Express loans and preferred rates on 7(a).`,
        impact: 'Crosses bankability threshold → 35%+ APR drops to 8-15% APR',
        done: s.bankableScore >= 160,
        path: '/app/lender-compliance', pathLabel: 'View all modules →',
      },
    ],
  };

  return [stage1, stage2, stage3];
}

// ─── FORGE™ Response Engine ───────────────────────────────────────────────────
// Intent routing — delegates to versioned templates in /prompts/forge/chat-responses.ts

function getForgeResponse(input: string, ctx: CoachContext): string {
  const q = input.toLowerCase().trim();

  if (/next step|what (should|do) i|where (do|should) i start|what now|priority/i.test(q)) {
    return nextStepResponse(ctx) ?? defaultResponse(ctx);
  }
  if (/sba|bank loan|traditional|institutional|7a|504/i.test(q)) {
    return sbaResponse(ctx);
  }
  if (/why is my score|explain my score|what (affects|impacts|drives) my score|fundscore/i.test(q)) {
    return scoreExplainResponse(ctx);
  }
  if (/sbss|bankable score|bank readiness|160|300 scale/i.test(q)) {
    return sbssResponse(ctx);
  }
  if (/how long|timeline|when can i|how many days|how many months/i.test(q)) {
    return timelineResponse(ctx);
  }
  if (/apr|interest rate|cost|expensive|cheap|rate/i.test(q)) {
    return aprResponse(ctx);
  }
  if (/pre.?qualif|qualify|eligible|which (products|programs|loans)/i.test(q)) {
    return preQualResponse(ctx);
  }
  if (/what (is|are) (forge|you|this)|how (does|do) (forge|you|this) work/i.test(q)) {
    return whatIsForgeResponse(ctx);
  }
  if (/compliance|module|lender compliance/i.test(q)) {
    return modulesResponse(ctx);
  }
  if (/block|prevent|stop|holding (me|us) back|what's wrong|issue|problem/i.test(q)) {
    return blockersResponse(ctx);
  }
  if (/revenue|cash flow|monthly|income|sales/i.test(q)) {
    return revenueResponse(ctx);
  }

  return defaultResponse(ctx);
}

// ─── Build Animation Steps ────────────────────────────────────────────────────

const BUILD_STEPS = [
  'Reading your FundScore and dimension breakdown…',
  'Analyzing compliance module progress…',
  'Identifying capital blockers and quick wins…',
  'Mapping pre-qualified products to your profile…',
  'Calculating SBSS trajectory and bankability timeline…',
  'Generating your personalized 3-stage roadmap…',
];

const SUGGESTED_QUESTIONS = [
  'What\'s my single next step?',
  'How do I qualify for an SBA loan?',
  'Why is my FundScore what it is?',
  'What\'s blocking me right now?',
  'When can I access bank-rate capital?',
  'How many products do I pre-qualify for?',
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function AICoach() {
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // ── Analytics refs — track session message count without triggering renders ──
  const messageIndexRef = useRef(0);

  const [ctx, setCtx] = useState<CoachContext | null>(null);
  const [progress, setProgress] = useState<ReturnType<typeof getComplianceProgress>>({});
  const [roadmap, setRoadmap] = useState<RoadmapStage[]>([]);
  const [hasAssessment, setHasAssessment] = useState(false);

  const [phase, setPhase] = useState<'idle' | 'building' | 'ready'>('idle');
  const [buildStep, setBuildStep] = useState(0);
  const [expandedStage, setExpandedStage] = useState<number | null>(1);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const load = useCallback(() => {
    const raw = localStorage.getItem('unified_assessment');
    if (!raw) { setHasAssessment(false); return; }
    setHasAssessment(true);
    const context = buildContext(raw);
    if (!context) return;
    const prog = getComplianceProgress();
    setCtx(context);
    setProgress(prog);
    setRoadmap(buildDynamicRoadmap(context, prog));
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

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleBuildRoadmap = useCallback(async () => {
    setPhase('building');
    setBuildStep(0);
    for (let i = 0; i < BUILD_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 420));
      setBuildStep(i + 1);
    }
    await new Promise(r => setTimeout(r, 300));
    setPhase('ready');

    // Opening message from FORGE™
    if (ctx) {
      messageIndexRef.current = 0;
      logEvent({ event_name: 'forge_session_started', payload: { fund_score: ctx.fundScore, stage: ctx.stage } });
      const greeting = greetingTemplate(ctx);
      setMessages([{ role: 'forge', text: checkForgeOutput(greeting, 'greeting'), timestamp: Date.now() }]);
    }
  }, [ctx]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !ctx) return;
    const userMsg: ChatMessage = { role: 'user', text: text.trim(), timestamp: Date.now() };
    // Fire before appending so message_index reflects position in session (0-based)
    logEvent({ event_name: 'forge_message_sent', payload: { message_length: text.trim().length, message_index: messageIndexRef.current } });
    messageIndexRef.current += 1;
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
    const response = checkForgeOutput(getForgeResponse(text, ctx), `chat:${text.slice(0, 40)}`);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'forge', text: response, timestamp: Date.now() }]);
  }, [ctx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); }
  };

  // ── No assessment ─────────────────────────────────────────────────────────
  if (!hasAssessment) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Brain style={{ width: '28px', height: '28px', color: 'white' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, color: 'var(--foreground)', margin: '0 0 8px 0' }}>
          Meet FORGE™
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', margin: '0 0 6px 0', lineHeight: 1.6 }}>
          Your always-on AI capital coach. FORGE™ reads your complete business profile and builds a personalized roadmap from Fundable to Bankable — then answers any capital question in real time.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', margin: '0 0 32px 0' }}>
          Complete the Business Success Scan first so FORGE™ has your data.
        </p>
        <button
          onClick={() => navigate('/business-assessment')}
          style={{
            padding: '14px 32px', borderRadius: '12px',
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

  // ── Idle: intro screen ────────────────────────────────────────────────────
  if (phase === 'idle' && ctx) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '48px 24px' }}>
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          {/* FORGE header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, color: 'var(--foreground)', lineHeight: 1 }}>
                FORGE™
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                Your AI Capital Coach · always-on · always synced with your profile
              </div>
            </div>
          </div>

          {/* Greeting */}
          <div style={{
            padding: '24px 28px', borderRadius: '16px', marginBottom: '24px',
            background: `${ctx.tierColor}08`, border: `1.5px solid ${ctx.tierColor}25`,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '8px', lineHeight: 1.3 }}>
              {ctx.name ? `Hey ${ctx.name} —` : 'Hey —'} I've been watching your profile.
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              Your current tier is <strong style={{ color: ctx.tierColor }}>{ctx.tier}</strong>. You're at FundScore <strong style={{ color: 'var(--foreground)' }}>{ctx.fundScore}/1000</strong> and SBSS <strong style={{ color: ctx.bankableScore >= 160 ? '#10b981' : 'var(--foreground)' }}>{ctx.bankableScore}/300</strong> — {ctx.pointsToBank > 0 ? <>{ctx.pointsToBank} points from institutional bank capital</> : <>past the bankability threshold</>}. {ctx.preQualCount > 0 ? <>{ctx.preQualCount} funding product{ctx.preQualCount !== 1 ? 's' : ''} are pre-qualified and ready to apply now.</> : <>Complete your first compliance modules to unlock funding products.</>}
            </div>
          </div>

          {/* Snapshot stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '28px' }}>
            {[
              { label: 'FundScore', value: `${ctx.fundScore}`, sub: '/ 1000', color: ctx.fundScore >= 800 ? '#10b981' : ctx.fundScore >= 600 ? '#f59e0b' : '#ef4444' },
              { label: 'SBSS', value: `${ctx.bankableScore}`, sub: '/ 300', color: ctx.bankableScore >= 160 ? '#10b981' : '#f59e0b' },
              { label: 'Compliance', value: `${ctx.completedModules}`, sub: `/ ${ctx.totalModules}`, color: ctx.completedModules === ctx.totalModules ? '#10b981' : '#3b82f6' },
              { label: 'Pre-Qualified', value: `${ctx.preQualCount}`, sub: 'products', color: ctx.preQualCount > 0 ? '#10b981' : 'var(--muted-foreground)' },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: '14px', borderRadius: '10px', textAlign: 'center',
                background: 'var(--card)', border: '1px solid var(--border)',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>
                  {stat.sub}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, color: 'var(--muted-foreground)', marginTop: '2px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Build CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleBuildRoadmap}
            style={{
              width: '100%', padding: '18px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            }}
          >
            <Sparkles style={{ width: '18px', height: '18px', color: 'white' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'white' }}>
              Build My Personalized Roadmap
            </span>
            <ArrowRight style={{ width: '16px', height: '16px', color: 'white' }} />
          </motion.button>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', textAlign: 'center', marginTop: '8px' }}>
            FORGE™ reads your full profile — no forms to fill out
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Building animation ────────────────────────────────────────────────────
  if (phase === 'building') {
    return (
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '14px', margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
            <Brain style={{ width: '24px', height: '24px', color: 'white' }} />
          </motion.div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: 'var(--foreground)', marginBottom: '28px' }}>
          FORGE™ is analyzing your profile…
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          {BUILD_STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: idx < buildStep ? 1 : 0.3, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', background: idx < buildStep ? 'rgba(16,185,129,0.07)' : 'var(--card)', border: `1px solid ${idx < buildStep ? 'rgba(16,185,129,0.2)' : 'var(--border)'}` }}
            >
              {idx < buildStep
                ? <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981', flexShrink: 0 }} />
                : <Circle style={{ width: '14px', height: '14px', color: 'var(--muted-foreground)', flexShrink: 0 }} />
              }
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: idx < buildStep ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ── Ready: full roadmap + chat ────────────────────────────────────────────
  if (!ctx) return null;
  const completedStages = roadmap.filter(s => s.complete).length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 28px 48px' }}>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain style={{ width: '18px', height: '18px', color: 'white' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 900, color: 'var(--foreground)', lineHeight: 1 }}>
              FORGE™ AI Coach
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                {ctx.name ? `${ctx.name}'s` : 'Your'} personalized capital roadmap · Stage {ctx.stage} of 3
              </span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '1px 6px', borderRadius: '4px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              }}>
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: '#10b981', display: 'inline-block',
                  animation: 'pulse 2s infinite',
                }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live</span>
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setPhase('idle'); setMessages([]); messageIndexRef.current = 0; }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
            background: 'var(--card)', border: '1px solid var(--border)',
            fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)',
          }}
        >
          <RotateCcw style={{ width: '12px', height: '12px' }} />
          Rebuild
        </button>
      </div>

      {/* Stage progress bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px',
        padding: '14px 16px', borderRadius: '12px',
        background: 'var(--card)', border: '1px solid var(--border)',
      }}>
        {roadmap.map((stage, idx) => {
          const done = stage.items.filter(i => i.done).length;
          const total = stage.items.length;
          const pct = total > 0 ? (done / total) * 100 : 0;
          const isActive = ctx.stage === stage.number;
          return (
            <button
              key={stage.number}
              onClick={() => setExpandedStage(expandedStage === stage.number ? null : stage.number)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: isActive ? 700 : 500, color: isActive ? stage.color : 'var(--muted-foreground)' }}>
                  Stage {stage.number}: {stage.name}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: stage.color, fontWeight: 600 }}>
                  {done}/{total}
                </span>
              </div>
              <div style={{ height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  style={{ height: '100%', background: stage.color, borderRadius: '99px' }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3-Stage roadmap accordions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {roadmap.map((stage, sIdx) => {
          const isOpen = expandedStage === stage.number;
          const doneCount = stage.items.filter(i => i.done).length;
          const isCurrentStage = ctx.stage === stage.number;

          return (
            <motion.div key={stage.number}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: sIdx * 0.06 }}
              style={{
                borderRadius: '12px', overflow: 'hidden',
                border: `1.5px solid ${isOpen || isCurrentStage ? stage.color : 'var(--border)'}`,
                background: isOpen ? stage.bg : 'var(--card)',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <button
                onClick={() => setExpandedStage(isOpen ? null : stage.number)}
                style={{
                  width: '100%', padding: '16px 18px', background: 'none', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left',
                }}
              >
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, marginTop: '1px',
                  background: stage.complete ? stage.color : `${stage.color}18`,
                  border: `1.5px solid ${stage.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stage.complete ? 'white' : stage.color,
                }}>
                  {stage.complete ? <CheckCircle style={{ width: '14px', height: '14px' }} /> : <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800 }}>{stage.number}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Stage title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: 'var(--foreground)' }}>
                      Stage {stage.number}: {stage.name}
                    </span>
                    {isCurrentStage && (
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700,
                        color: stage.color, background: `${stage.color}18`,
                        border: `1px solid ${stage.color}30`, padding: '1px 6px', borderRadius: '4px',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                      }}>
                        Current Stage
                      </span>
                    )}
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600,
                      color: stage.color, background: `${stage.color}10`,
                      border: `1px solid ${stage.color}20`, padding: '1px 6px', borderRadius: '4px',
                    }}>
                      {doneCount}/{stage.items.length} · {stage.timeframe}
                    </span>
                  </div>
                  {/* Capital potential + APR cost — the money line */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '4px 10px', borderRadius: '6px',
                      background: `${stage.color}12`, border: `1px solid ${stage.color}30`,
                    }}>
                      <DollarSign style={{ width: '12px', height: '12px', color: stage.color }} />
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800, color: stage.color }}>
                        {stage.capitalRange}
                      </span>
                    </div>
                    <div style={{
                      padding: '4px 10px', borderRadius: '6px',
                      background: stage.number === 3 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                      border: `1px solid ${stage.number === 3 ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                        color: stage.number === 3 ? '#10b981' : stage.number === 2 ? '#f59e0b' : '#ef4444',
                      }}>
                        {stage.aprRange}
                      </span>
                    </div>
                    {stage.number === 3 && (
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: '#10b981', fontWeight: 600 }}>
                        ↓ Save ~$62K/yr vs Stage 1
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: stage.color, marginBottom: '2px' }}>
                    {stage.headline}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                    {stage.narrative}
                  </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.18 }} style={{ flexShrink: 0 }}>
                  <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--muted-foreground)' }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 18px 16px' }}>
                      {/* Capital unlock + cost of capital banner */}
                      <div style={{
                        padding: '10px 14px', borderRadius: '9px', marginBottom: '12px',
                        background: `${stage.color}0e`, border: `1px solid ${stage.color}22`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
                      }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: stage.color }}>
                          🔓 {stage.capitalUnlock}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: stage.color }}>{stage.capitalRange}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Capital Range</div>
                          </div>
                          <div style={{ width: '1px', height: '28px', background: `${stage.color}25` }} />
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: stage.number === 3 ? '#10b981' : stage.number === 2 ? '#f59e0b' : '#ef4444' }}>{stage.aprRange}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cost of Capital</div>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {stage.items.map(item => (
                          <div key={item.id} style={{
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            padding: '12px 14px', borderRadius: '9px',
                            background: item.done ? 'rgba(16,185,129,0.04)' : 'var(--background)',
                            border: `1px solid ${item.done ? 'rgba(16,185,129,0.18)' : 'var(--border)'}`,
                          }}>
                            <div style={{ flexShrink: 0, marginTop: '2px' }}>
                              {item.done
                                ? <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
                                : <Circle style={{ width: '14px', height: '14px', color: 'var(--muted-foreground)' }} />
                              }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                                color: item.done ? 'var(--muted-foreground)' : 'var(--foreground)',
                                textDecoration: item.done ? 'line-through' : 'none', marginBottom: '3px',
                              }}>
                                {item.label}
                              </div>
                              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: '3px' }}>
                                {item.why}
                              </div>
                              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, color: stage.color }}>
                                {item.impact}
                              </div>
                            </div>
                            {!item.done && item.path && (
                              <Link to={item.path} style={{
                                flexShrink: 0, fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                                color: stage.color, textDecoration: 'none',
                                padding: '4px 10px', borderRadius: '6px',
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

      {/* ── FORGE™ CHAT ─────────────────────────────────────────────────────── */}
      <div style={{
        borderRadius: '16px', border: '1.5px solid rgba(16,185,129,0.25)',
        background: 'rgba(16,185,129,0.02)', overflow: 'hidden',
      }}>
        {/* Chat header */}
        <div style={{
          padding: '12px 18px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(16,185,129,0.05)',
        }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '7px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <MessageSquare style={{ width: '13px', height: '13px', color: 'white' }} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--foreground)' }}>
              Ask FORGE™
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginLeft: '6px' }}>
              · knows your complete profile
            </span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ padding: '16px 18px', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', gap: '10px',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}
            >
              {msg.role === 'forge' && (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain style={{ width: '13px', height: '13px', color: 'white' }} />
                </div>
              )}
              <div style={{
                maxWidth: '82%', padding: '12px 14px', borderRadius: '12px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #10b981, #3b82f6)'
                  : 'var(--card)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                borderTopLeftRadius: msg.role === 'forge' ? '4px' : '12px',
                borderTopRightRadius: msg.role === 'user' ? '4px' : '12px',
              }}>
                {msg.text.split('\n').map((line, i) => {
                  // Bold markdown **text**
                  const parts = line.split(/\*\*(.*?)\*\*/g);
                  return (
                    <p key={i} style={{
                      fontFamily: 'var(--font-body)', fontSize: '13px', margin: i === 0 ? 0 : '6px 0 0 0',
                      color: msg.role === 'user' ? 'white' : 'var(--foreground)', lineHeight: 1.6,
                    }}>
                      {parts.map((part, j) =>
                        j % 2 === 1
                          ? <strong key={j} style={{ fontWeight: 700 }}>{part}</strong>
                          : part
                      )}
                    </p>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain style={{ width: '13px', height: '13px', color: 'white' }} />
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '12px', borderTopLeftRadius: '4px', background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && (
          <div style={{ padding: '0 18px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                style={{
                  padding: '5px 11px', borderRadius: '20px', cursor: 'pointer',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, color: '#10b981',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask FORGE™ anything about your capital path…"
            style={{
              flex: 1, padding: '10px 14px', borderRadius: '10px',
              background: 'var(--background)', border: '1px solid var(--border)',
              fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)',
              outline: 'none',
            }}
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            style={{
              width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
              background: inputValue.trim() ? 'linear-gradient(135deg, #10b981, #3b82f6)' : 'var(--card)',
              border: inputValue.trim() ? 'none' : '1px solid var(--border)',
              cursor: inputValue.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            <Send style={{ width: '14px', height: '14px', color: inputValue.trim() ? 'white' : 'var(--muted-foreground)' }} />
          </button>
        </div>
      </div>

      {/* Deep report links */}
      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {[
          { label: 'Bankable Status Report', path: '/app/status-reports/bankable-status' },
          { label: 'Business FICO Analysis', path: '/app/status-reports/business-fico' },
          { label: 'Capital Forecast', path: '/app/status-reports/estimated-funding' },
          { label: "Owner's Credit Report", path: '/app/status-reports/owners-credit' },
        ].map(r => (
          <Link key={r.path} to={r.path} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderRadius: '9px', textDecoration: 'none',
            background: 'var(--card)', border: '1px solid var(--border)',
          }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: 'var(--foreground)' }}>
              {r.label}
            </span>
            <ArrowRight style={{ width: '12px', height: '12px', color: 'var(--muted-foreground)' }} />
          </Link>
        ))}
      </div>

    </div>
  );
}
