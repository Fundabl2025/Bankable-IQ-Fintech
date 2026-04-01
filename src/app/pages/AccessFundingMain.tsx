// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Access Funding Pipeline
// Elon-style: deal pipeline view. Every program has a stage. One click to apply.
// Pre-qual = prediction. Applied = in lender queue. Offer = real numbers.
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Outlet, useLocation } from 'react-router';
import {
  DollarSign, TrendingUp, ChevronDown, ChevronUp,
  ArrowRight, CheckCircle2, Lock, Info, Zap,
  Clock, AlertTriangle, X,
} from 'lucide-react';
import { getFundingPrograms, getTotalPreQualifiedAmount } from '../utils/fundingEligibility';
import { RequirementsGapModal } from '../components/RequirementsGapModal';
import {
  applyToProgram,
  withdrawApplication,
  getUserApplications,
  getPipelineCounts,
  STAGE_CONFIG,
  type FundingApplication,
  type PipelineCounts,
  type ApplicationStatus,
} from '../lib/funding-service';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

type ViewFilter = 'all' | 'pre-qualified' | 'applied' | 'offers' | 'future';

// ════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export function AccessFunding() {
  const location = useLocation();
  const navigate = useNavigate();

  // ALL hooks must come before any conditional return
  const [filter, setFilter] = useState<ViewFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applications, setApplications] = useState<FundingApplication[]>([]);
  const [pipeline, setPipeline] = useState<PipelineCounts>({ applied: 0, under_review: 0, offer_received: 0, accepted: 0, funded: 0, declined: 0, total: 0 });
  const [applying, setApplying] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [gapProgram, setGapProgram] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const allPrograms = getFundingPrograms();
  const totalPreQualified = getTotalPreQualifiedAmount();
  const preQualCount = allPrograms.filter(p => p.status === 'pre-qualified').length;

  // Load applications & pipeline
  const loadData = async () => {
    const [apps, counts] = await Promise.all([getUserApplications(), getPipelineCounts()]);
    setApplications(apps);
    setPipeline(counts);
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener('fundingPipelineUpdated', handler);
    window.addEventListener('fundscoreUpdated', handler);
    return () => {
      window.removeEventListener('fundingPipelineUpdated', handler);
      window.removeEventListener('fundscoreUpdated', handler);
    };
  }, []);

  // Child routes render via Outlet only — AFTER all hooks
  const isChildRoute = location.pathname !== '/app/access-funding' && location.pathname !== '/access-funding';
  if (isChildRoute) return <Outlet />;

  // Build lookup: programId → application
  const appMap = new Map(applications.map(a => [a.program_id, a]));

  // Filter programs
  const filteredPrograms = allPrograms.filter(p => {
    const app = appMap.get(p.id);
    if (filter === 'all') return true;
    if (filter === 'pre-qualified') return p.status === 'pre-qualified' && !app;
    if (filter === 'applied') return !!app && app.status !== 'offer_received' && app.status !== 'funded';
    if (filter === 'offers') return app?.status === 'offer_received' || app?.status === 'accepted';
    if (filter === 'future') return p.status !== 'pre-qualified';
    return true;
  });

  // Show toast briefly
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApply = async (program: any) => {
    setApplying(program.id);
    const result = await applyToProgram(program.id, program.name, program.amount, program.rate);
    setApplying(null);
    if (result.success) {
      showToast(`Applied to ${program.name} — your profile is in the lender queue`, 'success');
      loadData();
    } else {
      showToast(result.error || 'Could not submit application', 'error');
    }
  };

  const handleWithdraw = async (programId: string, programName: string) => {
    if (!confirm(`Withdraw your application for ${programName}?`)) return;
    setWithdrawing(programId);
    await withdrawApplication(programId);
    setWithdrawing(null);
    showToast(`Application withdrawn`, 'success');
    loadData();
  };

  // Pipeline stage tabs
  const stageTabs: { key: ViewFilter; label: string; count: number; color: string }[] = [
    { key: 'all',           label: 'All Programs',   count: allPrograms.length,    color: 'var(--foreground)' },
    { key: 'pre-qualified', label: 'Pre-Qualified',  count: preQualCount,          color: '#10b981' },
    { key: 'applied',       label: 'Applied',        count: pipeline.applied + pipeline.under_review, color: '#3b82f6' },
    { key: 'offers',        label: 'Offers',         count: pipeline.offer_received + pipeline.accepted, color: '#f59e0b' },
    { key: 'future',        label: 'Future Goals',   count: allPrograms.length - preQualCount, color: '#94a3b8' },
  ];

  return (
    <div style={{ flex: 1, minHeight: '100vh', overflowY: 'auto', backgroundColor: 'var(--background)' }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: '20px', right: '24px', zIndex: 9999,
              padding: '12px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: toast.type === 'success' ? '#10b981' : '#ef4444',
              color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                Capital Access
              </p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px, 3vw, 32px)', color: 'var(--foreground)', margin: 0, lineHeight: 1.1 }}>
                Funding Pipeline
              </h1>
            </div>
            <button
              onClick={() => setShowDisclaimer(d => !d)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            >
              <Info size={13} /> How this works
            </button>
          </div>

          <AnimatePresence>
            {showDisclaimer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <Info size={14} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--foreground)' }}>Pre-Qualified = prediction, not a promise.</strong> Your FundScore engine scans your profile against lender criteria. Clicking Apply submits your profile to the lender's soft-pull queue — no hard credit inquiry, no obligation to accept. Lenders review and send back real offers (amount, rate, term) which appear here. You decide what to accept.
                    <button onClick={() => setShowDisclaimer(false)} style={{ marginLeft: '8px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Got it ✕</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── PIPELINE SUMMARY STRIP ───────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Pre-Qualified', value: preQualCount, sub: 'Estimated eligible', color: '#10b981', icon: <Zap size={16} /> },
            { label: 'Applied', value: pipeline.applied, sub: 'In lender queue', color: '#3b82f6', icon: <ArrowRight size={16} /> },
            { label: 'Under Review', value: pipeline.under_review, sub: 'Lender evaluating', color: '#f59e0b', icon: <Clock size={16} /> },
            { label: 'Offers Received', value: pipeline.offer_received, sub: 'Real numbers in', color: '#10b981', icon: <DollarSign size={16} /> },
            { label: 'Funded', value: pipeline.funded, sub: 'Capital deployed', color: '#10b981', icon: <CheckCircle2 size={16} /> },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'var(--card)',
                border: `1px solid ${stat.value > 0 ? stat.color + '30' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ color: stat.value > 0 ? stat.color : 'var(--muted-foreground)' }}>{stat.icon}</div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', color: stat.value > 0 ? stat.color : 'var(--muted-foreground)' }}>
                  {stat.value}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--foreground)' }}>{stat.label}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── OFFER ALERT — appears when offers are waiting ────────────────── */}
        {pipeline.offer_received > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ padding: '16px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.08))', border: '1.5px solid #10b98140', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--foreground)' }}>
                  {pipeline.offer_received} funding offer{pipeline.offer_received !== 1 ? 's' : ''} waiting for your review
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Real amounts, rates, and terms from lenders — no obligation to accept
                </div>
              </div>
            </div>
            <button onClick={() => setFilter('offers')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '9px 18px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              View Offers <ArrowRight size={13} />
            </button>
          </motion.div>
        )}

        {/* ── FILTER TABS ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {stageTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px',
                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s',
                background: filter === tab.key ? tab.color : 'var(--card)',
                color: filter === tab.key ? 'white' : 'var(--muted-foreground)',
                border: filter === tab.key ? `1px solid ${tab.color}` : '1px solid var(--border)',
              }}
            >
              {tab.label}
              <span style={{ marginLeft: '6px', fontWeight: 700, opacity: 0.85 }}>({tab.count})</span>
            </button>
          ))}
        </div>

        {/* ── PROGRAM LIST ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredPrograms.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--foreground)', marginBottom: '6px' }}>No programs in this view</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)' }}>Try a different filter above</div>
            </div>
          )}

          {filteredPrograms.map((program, index) => {
            const app = appMap.get(program.id);
            const isPreQual = program.status === 'pre-qualified';
            const isApplied = !!app;
            const isExpanded = expandedId === program.id;
            const matchPct = program.gapAnalysis?.matchScore ?? 0;
            const stage = app ? STAGE_CONFIG[app.status] : null;
            const hasOffer = app?.status === 'offer_received' || app?.status === 'accepted';

            return (
              <motion.div
                key={program.id || index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                style={{
                  background: hasOffer ? 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(59,130,246,0.04))' : 'var(--card)',
                  border: hasOffer ? '1.5px solid #10b98135' : isApplied ? '1px solid #3b82f630' : isPreQual ? '1px solid #10b98120' : '1px solid var(--border)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  opacity: !isPreQual && !isApplied && matchPct < 30 ? 0.65 : 1,
                }}
              >
                {/* Card header row */}
                <div
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : (program.id || String(index)))}
                >
                  {/* Status indicator dot */}
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    background: hasOffer ? '#10b981' : isApplied ? '#3b82f6' : isPreQual ? '#10b98160' : matchPct >= 70 ? '#f59e0b' : '#94a3b8',
                  }} />

                  {/* Name + badges */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      <span
                        onClick={e => { e.stopPropagation(); navigate(`/app/access-funding/${program.id}`); }}
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--foreground)', cursor: 'pointer', textDecoration: 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#10b981')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--foreground)')}
                      >
                        {program.name}
                      </span>

                      {/* Application stage badge */}
                      {stage && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: stage.bg, color: stage.color }}>
                          {stage.label}
                        </span>
                      )}

                      {/* Pre-qual badge (only if not applied) */}
                      {!isApplied && isPreQual && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                          Pre-Qualified
                        </span>
                      )}

                      {/* Close badge */}
                      {!isApplied && !isPreQual && matchPct >= 70 && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                          Almost There
                        </span>
                      )}
                    </div>

                    {/* Estimated amount + offer amount if available */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {hasOffer && app?.offer_amount ? (
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: '#10b981' }}>
                          Offer: {formatDollars(app.offer_amount)}
                          {app.offer_rate ? ` @ ${app.offer_rate}` : ''}
                          {app.offer_term ? ` · ${app.offer_term}` : ''}
                        </span>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          {isPreQual ? `Est. ${program.amount}` : program.amount}
                          {program.rate ? ` · ${program.rate}` : ''}
                          {!isPreQual && matchPct > 0 && (
                            <span style={{ marginLeft: '6px', color: matchPct >= 70 ? '#f59e0b' : '#94a3b8' }}>
                              {matchPct}% match
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    {/* Always-visible Details link */}
                    <button
                      onClick={() => navigate(`/app/access-funding/${program.id}`)}
                      style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '11px', padding: '6px 10px', background: 'none', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                    >
                      Details <ArrowRight size={11} />
                    </button>

                    {hasOffer ? (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : (program.id || String(index)))}
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', padding: '8px 16px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        View Offer <ArrowRight size={12} />
                      </button>
                    ) : isApplied ? (
                      <button
                        onClick={() => handleWithdraw(program.id, program.name)}
                        disabled={withdrawing === program.id}
                        style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '11px', padding: '6px 12px', background: 'none', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--muted-foreground)', cursor: 'pointer' }}
                      >
                        {withdrawing === program.id ? '...' : 'Withdraw'}
                      </button>
                    ) : isPreQual ? (
                      <button
                        onClick={() => handleApply(program)}
                        disabled={applying === program.id}
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 2px 10px rgba(16,185,129,0.25)', opacity: applying === program.id ? 0.7 : 1 }}
                      >
                        {applying === program.id ? 'Applying…' : <><Zap size={12} /> Apply</>}
                      </button>
                    ) : matchPct >= 50 ? (
                      <button
                        onClick={() => setGapProgram(program)}
                        style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '11px', padding: '7px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '7px', color: '#f59e0b', cursor: 'pointer' }}
                      >
                        See Gap
                      </button>
                    ) : (
                      <Lock size={14} style={{ color: 'var(--muted-foreground)' }} />
                    )}
                    <div style={{ color: 'var(--muted-foreground)' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded detail panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>

                        {/* Offer details (if offer received) */}
                        {hasOffer && app && (
                          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', margin: '16px 0' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '13px', color: '#10b981', marginBottom: '10px' }}>💰 Lender Offer</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                              {[
                                { label: 'Amount', value: app.offer_amount ? formatDollars(app.offer_amount) : '—' },
                                { label: 'Rate', value: app.offer_rate || '—' },
                                { label: 'Term', value: app.offer_term || '—' },
                              ].map(item => (
                                <div key={item.label} style={{ textAlign: 'center' }}>
                                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color: 'var(--foreground)' }}>{item.value}</div>
                                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>{item.label}</div>
                                </div>
                              ))}
                            </div>
                            {app.lender_notes && (
                              <div style={{ marginTop: '10px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                                "{app.lender_notes}"
                              </div>
                            )}
                            {app.status === 'offer_received' && (
                              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                                <button
                                  onClick={() => navigate('/app/access-funding/' + program.id)}
                                  style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 20px', background: '#10b981', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
                                >
                                  Accept Offer
                                </button>
                                <button
                                  onClick={() => handleWithdraw(program.id, program.name)}
                                  style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px', padding: '10px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted-foreground)', cursor: 'pointer' }}
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Program info grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>What It Is</div>
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.6, margin: 0 }}>
                              {program.description || 'No description available.'}
                            </p>
                          </div>
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Requirements</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {[
                                { label: 'Min FICO', value: program.minFICO },
                                { label: 'Min Revenue', value: program.minRevenue },
                                { label: 'Time in Business', value: program.minTimeInBusiness },
                              ].filter(r => r.value).map(req => (
                                <div key={req.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: '12px' }}>
                                  <span style={{ color: 'var(--muted-foreground)' }}>{req.label}</span>
                                  <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{req.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Progress bar for non-qualified */}
                        {!isPreQual && matchPct > 0 && (
                          <div style={{ marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>Qualification progress</span>
                              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', color: matchPct >= 70 ? '#f59e0b' : 'var(--muted-foreground)' }}>{matchPct}%</span>
                            </div>
                            <div style={{ height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ width: `${matchPct}%`, height: '100%', background: matchPct >= 70 ? '#f59e0b' : '#94a3b8', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); setGapProgram(program); }}
                              style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              See what's missing →
                            </button>
                          </div>
                        )}

                        {/* Apply button + Full Details at bottom of expanded card */}
                        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          {!isApplied && isPreQual && (
                            <button
                              onClick={() => handleApply(program)}
                              disabled={applying === program.id}
                              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 22px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '9px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 3px 12px rgba(16,185,129,0.25)' }}
                            >
                              <Zap size={14} /> {applying === program.id ? 'Submitting…' : 'Apply Now — Soft Pull Only'}
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); navigate(`/app/access-funding/${program.id}`); }}
                            style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px', padding: '9px 16px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            Full Details <ArrowRight size={12} />
                          </button>
                          {!isApplied && isPreQual && (
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>No hard inquiry · No obligation</span>
                          )}
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

      {/* Gap analysis modal */}
      {gapProgram && (
        <RequirementsGapModal
          isOpen={!!gapProgram}
          onClose={() => setGapProgram(null)}
          program={{ name: gapProgram.name, amount: gapProgram.amount, type: gapProgram.type, gapAnalysis: gapProgram.gapAnalysis }}
        />
      )}
    </div>
  );
}
