// ════════════════════════════════════════════════════════════════════════════════
// CREDITPATH™ — Phase 2: Deterministic Credit Improvement Roadmap
// Assessment-Only · Confidence Tier 1 · No AI · No uploads · No score-engine changes
//
// Data flow: localStorage.unified_assessment
//   → computeExtendedResults() → personalCreditSummary
//   → extractCreditBlockers() → selectTopThree()
//   → render Credit Health Overview + Top-3 Roadmap + Progress Tracker
//
// Progress stored in: localStorage.creditpath_progress (separate key)
// Does not modify: computeScore(), computeExtendedResults(), unified_assessment
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  CheckCircle2, Circle, ChevronRight, TrendingUp, Shield,
  CreditCard, Info, AlertTriangle,
} from 'lucide-react';
import { computeExtendedResults } from './business-assessment/engine';
import { UnifiedAnswers } from './business-assessment/types';
import {
  extractCreditBlockers,
  selectTopThree,
  evaluateMilestones,
  loadProgressState,
  saveProgressState,
  toggleActionComplete,
  CreditProgressState,
} from './credit-path/creditBlockers';
import { logEvent } from '../lib/analytics/events';

// ── Score display helpers ─────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 740) return '#10b981';
  if (score >= 670) return '#8ab820';
  if (score >= 580) return '#f59e0b';
  if (score > 0) return '#b04428';
  return 'var(--muted-foreground)';
}

function scoreLabel(score: number): string {
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  if (score > 0) return 'Needs Attention';
  return 'Not provided';
}

const UTIL_LABEL: Record<string, string> = {
  under_10: 'Under 10% — Excellent',
  '10_30': '10–30% — Good',
  '30_50': '30–50% — Moderate',
  '50_75': '50–75% — High',
  over_75: 'Over 75% — Very High',
};

const UTIL_COLOR: Record<string, string> = {
  under_10: '#10b981',
  '10_30': '#8ab820',
  '30_50': '#f59e0b',
  '50_75': '#b04428',
  over_75: '#b04428',
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#b04428',
  high: '#f59e0b',
  medium: '#a0a020',
  low: '#64748b',
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const EFFORT_LABEL: Record<string, string> = {
  low: 'Low effort',
  medium: 'Medium effort',
  high: 'Higher effort',
};

// ── No-assessment state ───────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px 24px' }}>
        <CreditCard size={44} style={{ color: 'var(--muted-foreground)', marginBottom: '20px' }} />
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800,
          color: 'var(--foreground)', marginBottom: '10px',
        }}>
          Complete your scan first
        </div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)',
          lineHeight: 1.6, marginBottom: '24px',
        }}>
          CreditPath builds your personalized roadmap from your Business Success Scan results.
        </div>
        <Link
          to="/business-assessment"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '11px 22px', borderRadius: '10px',
            background: '#10b981', color: 'white',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          Start Business Success Scan
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CreditPath() {
  const [data, setData] = useState<UnifiedAnswers | null>(null);
  const [progress, setProgress] = useState<CreditProgressState>(() => loadProgressState());
  const viewedRef = useRef(false);

  // Load assessment
  useEffect(() => {
    try {
      const raw = localStorage.getItem('unified_assessment');
      if (raw) setData(JSON.parse(raw) as UnifiedAnswers);
    } catch { /* non-fatal */ }
  }, []);

  // Fire creditpath_viewed once on mount (ref-guarded)
  useEffect(() => {
    if (!data || viewedRef.current) return;
    viewedRef.current = true;
    try {
      const ext = computeExtendedResults(data);
      const blockers = extractCreditBlockers(data);
      const top = selectTopThree(blockers);
      logEvent({
        event_name: 'creditpath_viewed',
        payload: {
          has_assessment: true,
          composite_score: ext.personalCreditSummary.composite,
          blocker_count: blockers.length,
          top_blocker_severity: top[0]?.severity ?? 'none',
          confidence_tier: 1,
        },
      });
    } catch { /* non-fatal */ }
  }, [data]);

  if (!data) return <EmptyState />;

  // Derive data — reads from engine, does not modify it
  let ext;
  try {
    ext = computeExtendedResults(data);
  } catch {
    return <EmptyState />;
  }

  const pcs = ext.personalCreditSummary;
  const allBlockers = extractCreditBlockers(data);
  const topThree = selectTopThree(allBlockers);
  const milestones = evaluateMilestones(data, progress);
  const completedCount = topThree.filter(b => progress.completedActions.includes(b.id)).length;
  const reachedMilestoneCount = milestones.filter(m => m.reached).length;
  const progressPct = milestones.length > 1
    ? Math.round(((reachedMilestoneCount - 1) / (milestones.length - 1)) * 100)
    : 0;

  // Action handlers
  const handleToggle = (blockerId: string, category: string, position: number) => {
    const wasDone = progress.completedActions.includes(blockerId);

    // Fire action_clicked on every toggle interaction
    logEvent({
      event_name: 'creditpath_action_clicked',
      payload: {
        action_id: blockerId,
        action_category: category,
        action_severity: allBlockers.find(b => b.id === blockerId)?.severity ?? 'unknown',
        position,
      },
    });

    const newProgress = toggleActionComplete(progress, blockerId);
    setProgress(newProgress);
    saveProgressState(newProgress);

    if (!wasDone) {
      logEvent({
        event_name: 'creditpath_action_completed',
        payload: {
          action_id: blockerId,
          action_category: category,
          total_completed: newProgress.completedActions.length,
        },
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px 64px' }}>

        {/* ── Section 1: Header ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '28px' }}
        >
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px',
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800,
                color: 'var(--foreground)', margin: 0,
              }}>
                CreditPath
              </h1>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14px',
                color: 'var(--muted-foreground)', marginTop: '4px', marginBottom: 0,
              }}>
                Your personalized credit improvement roadmap
              </p>
            </div>

            {/* Confidence Tier 1 badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '99px', flexShrink: 0,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
            }}>
              <Info size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600,
                color: '#f59e0b',
              }}>
                Tier 1 · Self-reported data — not bureau-verified
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Section 2: Credit Health Overview ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '24px',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700,
              color: 'var(--foreground)', marginBottom: '18px',
            }}>
              Credit Health Overview
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '14px', marginBottom: '18px',
            }}>
              {/* Composite score */}
              <div style={{
                background: 'var(--background)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '16px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                  color: 'var(--muted-foreground)', textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em', marginBottom: '8px',
                }}>
                  Est. Credit Score
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 900,
                  color: scoreColor(pcs.composite), lineHeight: 1,
                }}>
                  {pcs.composite > 0 ? pcs.composite : '—'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px',
                  color: scoreColor(pcs.composite), marginTop: '4px', fontWeight: 600,
                }}>
                  {scoreLabel(pcs.composite)}
                </div>
              </div>

              {/* Utilization */}
              <div style={{
                background: 'var(--background)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '16px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                  color: 'var(--muted-foreground)', textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em', marginBottom: '8px',
                }}>
                  Credit Utilization
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800,
                  color: UTIL_COLOR[pcs.utilization] || 'var(--muted-foreground)', lineHeight: 1,
                }}>
                  {pcs.utilizationPct > 0 ? `~${pcs.utilizationPct}%` : '—'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px',
                  color: UTIL_COLOR[pcs.utilization] || 'var(--muted-foreground)',
                  marginTop: '4px', fontWeight: 600,
                }}>
                  {UTIL_LABEL[pcs.utilization] || 'Not provided'}
                </div>
              </div>

              {/* Derogatory items */}
              <div style={{
                background: 'var(--background)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '16px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                  color: 'var(--muted-foreground)', textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em', marginBottom: '8px',
                }}>
                  Derogatory Items
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 900,
                  color: pcs.hasAnyDerog ? '#f59e0b' : '#10b981', lineHeight: 1,
                }}>
                  {pcs.derogItems.length}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px',
                  color: pcs.hasAnyDerog ? '#f59e0b' : '#10b981',
                  marginTop: '4px', fontWeight: 600,
                }}>
                  {pcs.hasAnyDerog ? 'Flagged items' : 'None flagged'}
                </div>
                {pcs.hasAnyDerog && (
                  <div style={{ marginTop: '6px' }}>
                    {pcs.derogItems.slice(0, 2).map((item, i) => (
                      <div key={i} style={{
                        fontFamily: 'var(--font-body)', fontSize: '10px',
                        color: 'var(--muted-foreground)', lineHeight: 1.4,
                      }}>
                        · {item}
                      </div>
                    ))}
                    {pcs.derogItems.length > 2 && (
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '10px',
                        color: 'var(--muted-foreground)',
                      }}>
                        + {pcs.derogItems.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Disclosure + link to full report */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              padding: '10px 13px', borderRadius: '8px',
              background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
            }}>
              <Info size={12} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '11px',
                color: 'var(--muted-foreground)', lineHeight: 1.5,
              }}>
                Score estimates are based on ranges you self-reported and are not pulled from any credit bureau. For readiness guidance only.{' '}
                <Link
                  to="/app/status-reports/personal-credit"
                  style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}
                >
                  View full personal credit report →
                </Link>
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Section 3: Top-3 Action Roadmap ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700,
            color: 'var(--foreground)', marginBottom: '14px',
          }}>
            Your Top Actions
          </div>

          {topThree.length === 0 ? (
            <div style={{
              background: 'var(--card)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '14px', padding: '32px 24px', textAlign: 'center',
            }}>
              <CheckCircle2 size={36} style={{ color: '#10b981', marginBottom: '14px' }} />
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 700,
                color: 'var(--foreground)', marginBottom: '8px',
              }}>
                No critical actions right now
              </div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '13px',
                color: 'var(--muted-foreground)', maxWidth: '340px', margin: '0 auto',
              }}>
                Your credit profile looks strong based on your self-reported data.
                Keep building positive history to maintain your readiness.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {topThree.map((blocker, index) => {
                const isDone = progress.completedActions.includes(blocker.id);
                const isTop = index === 0;
                const accentBorder = isTop && !isDone
                  ? '1px solid rgba(16,185,129,0.35)'
                  : isDone
                    ? '1px solid rgba(16,185,129,0.2)'
                    : '1px solid var(--border)';

                return (
                  <div
                    key={blocker.id}
                    style={{
                      background: isDone ? 'rgba(16,185,129,0.03)' : 'var(--card)',
                      border: accentBorder,
                      borderRadius: '14px', padding: '20px',
                      opacity: isDone ? 0.72 : 1,
                      transition: 'opacity 0.2s, border-color 0.2s',
                    }}
                  >
                    {/* Card header */}
                    <div style={{
                      display: 'flex', alignItems: 'flex-start',
                      justifyContent: 'space-between', gap: '12px', marginBottom: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Position badge */}
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                          background: isTop ? 'rgba(16,185,129,0.1)' : 'var(--background)',
                          border: `1px solid ${isTop ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 800,
                          color: isTop ? '#10b981' : 'var(--muted-foreground)',
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <div style={{
                            fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700,
                            color: 'var(--foreground)',
                            textDecoration: isDone ? 'line-through' : 'none',
                          }}>
                            {blocker.title}
                          </div>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px',
                          }}>
                            <span style={{
                              fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                              padding: '2px 7px', borderRadius: '5px',
                              background: `${SEVERITY_COLOR[blocker.severity]}14`,
                              color: SEVERITY_COLOR[blocker.severity],
                              border: `1px solid ${SEVERITY_COLOR[blocker.severity]}28`,
                            }}>
                              {SEVERITY_LABEL[blocker.severity]}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-body)', fontSize: '10px',
                              color: 'var(--muted-foreground)',
                            }}>
                              {EFFORT_LABEL[blocker.effort]} · {blocker.timeToResult}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mark done toggle */}
                      <button
                        onClick={() => handleToggle(blocker.id, blocker.category, index + 1)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          padding: '6px 11px', borderRadius: '8px', cursor: 'pointer',
                          background: isDone ? 'rgba(16,185,129,0.08)' : 'var(--background)',
                          border: `1px solid ${isDone ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
                          color: isDone ? '#10b981' : 'var(--muted-foreground)',
                          fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
                          flexShrink: 0, transition: 'all 0.15s',
                        }}
                      >
                        {isDone
                          ? <CheckCircle2 size={13} />
                          : <Circle size={13} />
                        }
                        {isDone ? 'Done' : 'Mark done'}
                      </button>
                    </div>

                    {/* Done disclosure */}
                    {isDone && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '5px 10px', borderRadius: '6px', marginBottom: '10px',
                        background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                      }}>
                        <Info size={11} style={{ color: '#10b981', flexShrink: 0 }} />
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: '10px', color: '#10b981',
                        }}>
                          Marked as done by you — not independently verified
                        </span>
                      </div>
                    )}

                    {/* Why */}
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: '13px',
                      color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: '12px',
                    }}>
                      {blocker.why}
                    </div>

                    {/* Impact row */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr',
                      gap: '10px', marginBottom: '12px',
                    }}>
                      <div style={{
                        background: 'var(--background)', borderRadius: '8px',
                        padding: '10px 12px', border: '1px solid var(--border)',
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700,
                          textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                          color: 'var(--muted-foreground)', marginBottom: '4px',
                        }}>
                          Readiness Impact
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-body)', fontSize: '11px',
                          color: 'var(--foreground)', lineHeight: 1.4,
                        }}>
                          {blocker.readinessImpact}
                        </div>
                      </div>
                      <div style={{
                        background: 'var(--background)', borderRadius: '8px',
                        padding: '10px 12px', border: '1px solid var(--border)',
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700,
                          textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                          color: 'var(--muted-foreground)', marginBottom: '4px',
                        }}>
                          Capital Impact
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-body)', fontSize: '11px',
                          color: 'var(--foreground)', lineHeight: 1.4,
                        }}>
                          {blocker.capitalImpact}
                        </div>
                      </div>
                    </div>

                    {/* First step */}
                    <div style={{
                      padding: '11px 14px', borderRadius: '8px',
                      background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
                      marginBottom: '10px',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700,
                        textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                        color: '#10b981', marginBottom: '5px',
                      }}>
                        First Step
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
                        color: 'var(--foreground)', lineHeight: 1.5,
                      }}>
                        {blocker.firstStep}
                      </div>
                    </div>

                    {/* Disclosures */}
                    {blocker.disclosures.length > 0 && (
                      <div>
                        {blocker.disclosures.map((d, i) => (
                          <div key={i} style={{
                            fontFamily: 'var(--font-body)', fontSize: '10px',
                            color: 'var(--muted-foreground)', lineHeight: 1.4, marginTop: '3px',
                          }}>
                            * {d}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Confidence tier note */}
                    <div style={{
                      marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: '10px',
                      color: 'var(--muted-foreground)',
                    }}>
                      Based on self-reported assessment data · Confidence Tier 1
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Section 4: Progress Tracker ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '24px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '22px',
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700,
                color: 'var(--foreground)',
              }}>
                Progress
              </div>
              {topThree.length > 0 && (
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)',
                }}>
                  {completedCount} of {topThree.length} action{topThree.length !== 1 ? 's' : ''} addressed
                </div>
              )}
            </div>

            {/* Milestone track */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start' }}>
              {/* Base line */}
              <div style={{
                position: 'absolute', top: '12px', left: '12px', right: '12px', height: '2px',
                background: 'var(--border)', zIndex: 0,
              }} />
              {/* Progress fill */}
              <div style={{
                position: 'absolute', top: '12px', left: '12px', height: '2px',
                width: `calc(${Math.min(100, Math.max(0, progressPct))}% - 0px)`,
                maxWidth: 'calc(100% - 24px)',
                background: '#10b981', zIndex: 1, transition: 'width 0.4s ease',
              }} />

              {milestones.map(m => (
                <div key={m.id} style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', position: 'relative', zIndex: 2,
                }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: m.reached ? '#10b981' : 'var(--card)',
                    border: `2px solid ${m.reached ? '#10b981' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.25s',
                  }}>
                    {m.reached && (
                      <CheckCircle2 size={12} color="white" strokeWidth={3} />
                    )}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '10px',
                    fontWeight: m.reached ? 700 : 400,
                    color: m.reached ? '#10b981' : 'var(--muted-foreground)',
                    marginTop: '6px', textAlign: 'center', lineHeight: 1.3, maxWidth: '60px',
                  }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Section 5: Capital Connection ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '24px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
            }}>
              <TrendingUp size={17} style={{ color: '#10b981' }} />
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700,
                color: 'var(--foreground)',
              }}>
                How This Connects to Capital
              </div>
            </div>

            {topThree.length > 0 ? (
              <>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: '12px',
                }}>
                  Personal credit is the{' '}
                  <strong style={{ color: 'var(--foreground)' }}>
                    Personal Credit dimension (20%)
                  </strong>{' '}
                  of your FundScore. Addressing the items above may improve this dimension over time,
                  which could strengthen your overall readiness profile and lender signals.
                </div>
                <div style={{
                  padding: '10px 13px', borderRadius: '8px', marginBottom: '14px',
                  background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '11px',
                    color: 'var(--foreground)', lineHeight: 1.5,
                  }}>
                    These are estimated ranges based on typical lender signals.
                    Individual outcomes vary based on your full credit profile and lender-specific criteria.
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '13px',
                color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: '14px',
              }}>
                Your credit profile shows no significant blockers based on your self-reported data.
                Continue building positive history to maintain strong lender readiness.
              </div>
            )}

            <Link
              to="/app/status-reports/bankable-status"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
                color: '#10b981', textDecoration: 'none',
              }}
            >
              View full bankable status report
              <ChevronRight size={13} />
            </Link>
          </div>
        </motion.div>

        {/* ── Section 6: Footer link ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <Link
            to="/app/status-reports/personal-credit"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px', borderRadius: '10px',
              background: 'var(--card)', border: '1px solid var(--border)',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
              color: 'var(--muted-foreground)', textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
          >
            <Shield size={14} style={{ flexShrink: 0 }} />
            For your full 3-bureau breakdown → Personal Credit Report
            <ChevronRight size={14} />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
