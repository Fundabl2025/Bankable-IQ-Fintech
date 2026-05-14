// ═══════════════════════════════════════════════════════════════════════
// COMPLIANCE MODULE PAGE — Shared template for all 13 lender compliance modules
// Design system native: CSS variables only, no hardcoded Tailwind colors
// Connects to lenderComplianceModules.ts for progress tracking
// ═══════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  ExternalLink,
  Zap,
  Star,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  complianceModules,
  getComplianceProgress,
  setComplianceProgress,
  getNextModule,
  getPreviousModule,
} from '../utils/lenderComplianceModules';
import { getAuditItemById, updateAuditItem } from '../utils/businessData';
import { checkAndAwardBadges, getInitialScore } from '../lib/badges';
import { computeScore } from '../pages/business-assessment/engine';
import { logEvent } from '../lib/analytics/events';

// ─── Types ────────────────────────────────────────────────────────────

export interface ModuleTask {
  id: string;                                  // matches audit item id if applicable
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  ficoImpact: number;
  why: string;                                 // 1–2 sentence explanation
  steps: string[];                             // numbered action steps
  resources?: { name: string; url: string }[]; // links / partner referrals
  warningBox?: { title: string; body: string };
  infoBox?: { title: string; body: string };
  customContent?: React.ReactNode;             // escape hatch for rich content
}

export interface ComplianceModuleConfig {
  moduleId: string;     // must match lenderComplianceModules.ts id
  icon: string;         // emoji
  tasks: ModuleTask[];
}

// ─── Priority helpers ─────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  critical: { label: 'Critical',  color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'  },
  high:     { label: 'High',      color: '#f97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.2)' },
  medium:   { label: 'Medium',    color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  low:      { label: 'Low',       color: '#22c55e', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)'  },
};

// ─── Individual task card ─────────────────────────────────────────────

function TaskCard({
  task,
  isComplete,
  onToggle,
  index,
}: {
  task: ModuleTask;
  isComplete: boolean;
  onToggle: () => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const p = PRIORITY_CONFIG[task.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={{
        background: isComplete ? 'rgba(16,185,129,0.04)' : 'var(--card)',
        border: `1.5px solid ${isComplete ? 'rgba(16,185,129,0.3)' : p.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Priority accent bar */}
      {!isComplete && (
        <div style={{ height: '3px', background: `linear-gradient(90deg, ${p.color}00, ${p.color}, ${p.color}00)` }} />
      )}
      {isComplete && (
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #10b98100, #10b981, #10b98100)' }} />
      )}

      {/* Header row */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Checkbox */}
        <button
          onClick={onToggle}
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 0 }}
          aria-label={isComplete ? 'Mark incomplete' : 'Mark complete'}
        >
          {isComplete
            ? <CheckCircle2 size={24} style={{ color: '#10b981' }} />
            : <Circle size={24} style={{ color: 'var(--muted-foreground)' }} />}
        </button>

        {/* Title + badges */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px',
              color: isComplete ? '#10b981' : 'var(--foreground)',
              textDecoration: isComplete ? 'line-through' : 'none',
              opacity: isComplete ? 0.75 : 1,
            }}>
              {task.title}
            </span>
            {/* Priority badge */}
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: p.bg, border: `1px solid ${p.border}`, color: p.color, flexShrink: 0 }}>
              {p.label}
            </span>
            {/* FICO impact */}
            {task.ficoImpact > 0 && !isComplete && (
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', flexShrink: 0 }}>
                +{task.ficoImpact} pts
              </span>
            )}
            {isComplete && (
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                ✓ Done
              </span>
            )}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.5 }}>
            {task.description}
          </p>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--muted-foreground)', lineHeight: 0 }}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>

              {/* Why it matters */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.7, margin: 0 }}>
                  {task.why}
                </p>
              </div>

              {/* Warning box */}
              {task.warningBox && (
                <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: '#ef4444' }}>{task.warningBox.title}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', margin: 0, lineHeight: 1.6 }}>{task.warningBox.body}</p>
                </div>
              )}

              {/* Info box */}
              {task.infoBox && (
                <div style={{ marginBottom: '14px', padding: '12px 14px', borderRadius: '10px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Zap size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: '#3b82f6' }}>{task.infoBox.title}</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', margin: 0, lineHeight: 1.6 }}>{task.infoBox.body}</p>
                </div>
              )}

              {/* Custom rich content */}
              {task.customContent && (
                <div style={{ marginBottom: '16px' }}>{task.customContent}</div>
              )}

              {/* Action steps */}
              {task.steps.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    Action Steps
                  </p>
                  <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {task.steps.map((step, i) => (
                      <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '11px', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '5px', padding: '2px 6px', flexShrink: 0, marginTop: '1px' }}>
                          {i + 1}
                        </span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.5 }}>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Resources / partner links */}
              {task.resources && task.resources.length > 0 && (
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    Resources & Partners
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {task.resources.map(r => {
                      const isPartner = r.url.includes('utm_source=bankableiq');
                      return (
                        <a
                          key={r.name}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', borderRadius: '10px',
                            background: isPartner ? 'rgba(16,185,129,0.04)' : 'var(--background)',
                            border: `1px solid ${isPartner ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                            textDecoration: 'none', transition: 'border-color 0.15s',
                          }}
                        >
                          <ExternalLink size={13} style={{ color: isPartner ? '#10b981' : 'var(--muted-foreground)', flexShrink: 0 }} />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)', flex: 1 }}>{r.name}</span>
                          {isPartner && (
                            <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)', color: '#065f46', border: '1px solid rgba(16,185,129,0.25)', flexShrink: 0 }}>
                              PARTNER
                            </span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mark complete / incomplete button */}
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={onToggle}
                  style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px',
                    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
                    border: 'none', display: 'flex', alignItems: 'center', gap: '8px',
                    background: isComplete
                      ? 'rgba(100,116,139,0.1)'
                      : 'linear-gradient(135deg, #10b981, #3b82f6)',
                    color: isComplete ? 'var(--muted-foreground)' : 'white',
                  }}
                >
                  {isComplete ? (
                    <><Circle size={14} /> Mark Incomplete</>
                  ) : (
                    <><CheckCircle2 size={14} /> Mark Complete</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main template ────────────────────────────────────────────────────

export function ComplianceModulePage({ moduleId, icon, tasks }: ComplianceModuleConfig) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath: string = (location.state as any)?.fromPath ?? '/app/lender-compliance';
  const fromLabel: string = (location.state as any)?.fromLabel ?? 'Lender Compliance';
  const fromState = { fromPath, fromLabel };
  const [refreshKey, setRefreshKey] = useState(0);

  // Get module metadata from the module registry
  const module = complianceModules.find(m => m.id === moduleId);
  const nextModule = getNextModule(moduleId);
  const prevModule = getPreviousModule(moduleId);

  useEffect(() => {
    const handle = () => setRefreshKey(k => k + 1);
    window.addEventListener('auditItemUpdated', handle);
    window.addEventListener('storage', handle);
    return () => {
      window.removeEventListener('auditItemUpdated', handle);
      window.removeEventListener('storage', handle);
    };
  }, []);

  // Fire once per mount — each navigation to a module page is a true start
  useEffect(() => {
    logEvent({ event_name: 'module_started', payload: { module_id: moduleId } });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Task completion — writes to BOTH systems ──────────────────────
  const isTaskComplete = (taskId: string): boolean => {
    // Primary: audit item system (if it exists there)
    const auditItem = getAuditItemById(taskId);
    if (auditItem) return auditItem.status === 'complete';
    // Fallback: module-level completion
    const progress = getComplianceProgress();
    return !!progress[`${moduleId}__${taskId}`]?.completed;
  };

  const toggleTask = (taskId: string) => {
    const nowComplete = !isTaskComplete(taskId);

    // Write to audit item system if the item exists there
    const auditItem = getAuditItemById(taskId);
    if (auditItem) {
      updateAuditItem(taskId, {
        status: nowComplete ? 'complete' : 'incomplete',
        ...(nowComplete ? { completedDate: new Date().toISOString(), source: 'manual' } : {}),
      });
    } else {
      // Write to module progress system
      const progress = getComplianceProgress();
      const key = `${moduleId}__${taskId}`;
      progress[key] = { completed: nowComplete, ...(nowComplete ? { completedDate: new Date().toISOString() } : {}) };
      setComplianceProgress(progress);
    }

    // Check if all tasks are now complete → mark module complete
    const allDone = tasks.every(t => (t.id === taskId ? nowComplete : isTaskComplete(t.id)));
    if (allDone) {
      const progress = getComplianceProgress();
      progress[moduleId] = { completed: true, completedDate: new Date().toISOString(), lastViewed: new Date().toISOString() };
      setComplianceProgress(progress);
      logEvent({ event_name: 'module_completed', payload: { module_id: moduleId } });
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#10b981', '#3b82f6', '#f59e0b'] });

      // ── Badge check on module completion ────────────────────────────
      try {
        const raw = localStorage.getItem('unified_assessment');
        const completedModuleCount = complianceModules.filter(
          (m) => getComplianceProgress()[m.id]?.completed
        ).length;
        if (raw) {
          const assessmentData = JSON.parse(raw);
          const scoreResult = computeScore(assessmentData);
          checkAndAwardBadges({
            hasAssessment: true,
            score: scoreResult.score,
            bankableScore: scoreResult.bankableScore,
            dimAvg: scoreResult.dimAvg || {},
            resultsViewed: localStorage.getItem('fundready_results_viewed') === '1',
            completedModuleCount,
            totalApplications: 0,
            fundedCount: 0,
            initialScore: getInitialScore(),
          });
        } else {
          // No assessment — still check module-only badges
          checkAndAwardBadges({
            hasAssessment: false,
            score: 0,
            bankableScore: 0,
            dimAvg: {},
            completedModuleCount,
            totalApplications: 0,
            fundedCount: 0,
            initialScore: getInitialScore(),
          });
        }
      } catch {
        // badge check failure is non-fatal
      }
    } else if (!nowComplete) {
      // If unchecking, un-complete the module too
      const progress = getComplianceProgress();
      if (progress[moduleId]?.completed) {
        progress[moduleId] = { completed: false };
        setComplianceProgress(progress);
      }
    }

    window.dispatchEvent(new Event('auditItemUpdated'));
    window.dispatchEvent(new Event('complianceProgressUpdated'));
    setRefreshKey(k => k + 1);
  };

  // ── Stats ─────────────────────────────────────────────────────────
  const completedCount = tasks.filter(t => isTaskComplete(t.id)).length;
  const totalCount = tasks.length;
  const pct = Math.round((completedCount / totalCount) * 100);
  const totalFico = tasks.reduce((s, t) => s + t.ficoImpact, 0);
  const earnedFico = tasks.filter(t => isTaskComplete(t.id)).reduce((s, t) => s + t.ficoImpact, 0);
  const gaugeColor = pct === 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

  if (!module) return null;

  return (
    <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-[860px] mx-auto px-6 py-8 lg:px-8 lg:py-10">

        {/* ── BREADCRUMB NAV ─────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button
            onClick={() => navigate(fromPath)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer' }}
          >
            <ArrowLeft size={14} /> {fromLabel}
          </button>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>{module.title}</span>
        </div>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                {module.category} · Module {module.order} of {complianceModules.length}
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px, 3vw, 30px)', color: 'var(--foreground)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
                {module.title}
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', marginTop: '6px', lineHeight: 1.5 }}>
                {module.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── PROGRESS CARD ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', color: gaugeColor }}>
                {completedCount}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)' }}>
                {' '}/ {totalCount} tasks complete
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {totalFico > 0 && (
                <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: '#10b981' }}>{earnedFico}/{totalFico}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>FICO pts</div>
                </div>
              )}
              {pct === 100 && (
                <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={14} style={{ color: '#f59e0b' }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: '#10b981' }}>Module Complete!</span>
                </div>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${gaugeColor}99, ${gaugeColor})`, borderRadius: '99px' }}
            />
          </div>
          {pct < 100 && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '8px' }}>
              {totalCount - completedCount} task{totalCount - completedCount !== 1 ? 's' : ''} remaining — expand each card for instructions
            </p>
          )}
        </motion.div>

        {/* ── TASKS ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          {tasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              isComplete={isTaskComplete(task.id)}
              onToggle={() => toggleTask(task.id)}
              index={i}
            />
          ))}
        </div>

        {/* ── MODULE NAVIGATION ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}
        >
          {/* Previous */}
          {prevModule ? (
            <button
              onClick={() => navigate(`/app${prevModule.route}`, { state: fromState })}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer' }}
            >
              <ArrowLeft size={14} /> {prevModule.title}
            </button>
          ) : (
            <button
              onClick={() => navigate(fromPath)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer' }}
            >
              <ArrowLeft size={14} /> {fromLabel}
            </button>
          )}

          {/* Center: back to hub */}
          <button
            onClick={() => navigate(fromPath)}
            style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Back to {fromLabel}
          </button>

          {/* Next */}
          {nextModule ? (
            <button
              onClick={() => navigate(`/app${nextModule.route}`, { state: fromState })}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', padding: '10px 18px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
            >
              Next: {nextModule.title} <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => navigate(fromPath)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'white', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', padding: '10px 18px', cursor: 'pointer' }}
            >
              All Modules Complete! <Star size={14} />
            </button>
          )}
        </motion.div>

      </div>
    </div>
  );
}
