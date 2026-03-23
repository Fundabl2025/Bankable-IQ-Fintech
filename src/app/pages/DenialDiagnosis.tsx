/**
 * Capital Readiness Diagnosis Page
 * 
 * Shows WHY the user isn't bankable yet with ranked blockers,
 * severity classification, and actionable fixes.
 * 
 * Per Elon's spec: "The most important page. Answers the question:
 * Why did I get denied? What do I fix first?"
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  CheckCircle2,
  Target,
  ArrowRight
} from 'lucide-react';
import { getAllAuditItems, AuditItem } from '../utils/businessData';
import { computeScore, computeExtendedResults, getBand } from './business-assessment/engine';
import type { UnifiedAnswers } from './business-assessment/types';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

interface DiagnosisItem extends AuditItem {
  fixAction: string;
  fixTimeline: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPER: Get severity display info
// ════════════════════════════════════════════════════════════════════════════════

function getSeverityInfo(severity: 'hard_blocker' | 'suppressor' | 'optimization') {
  switch (severity) {
    case 'hard_blocker':
      return {
        label: 'Approval Barrier',
        description: 'A pattern that typically prevents approval at any level.',
        color: 'var(--destructive)',
        bgColor: 'var(--destructive-bg)',
        borderColor: 'var(--destructive-border)',
        icon: AlertTriangle,
      };
    case 'suppressor':
      return {
        label: 'Significant Pattern',
        description: 'A pattern that limits available options and amounts.',
        color: 'var(--warning)',
        bgColor: 'var(--warning-bg)',
        borderColor: 'var(--warning-border)',
        icon: AlertCircle,
      };
    case 'optimization':
      return {
        label: 'Improvement Signal',
        description: 'Addressing this typically improves terms and available options.',
        color: 'var(--primary)',
        bgColor: 'var(--primary-bg)',
        borderColor: 'var(--primary-border)',
        icon: TrendingUp,
      };
  }
}

function getTimelineLabel(timeline: string): string {
  switch (timeline) {
    case '7d': return '~1 week';
    case '30d': return '~1 month';
    case '60d': return '~2 months';
    case '90d': return '~3 months';
    default: return timeline;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export default function DenialDiagnosis() {
  const [sbssScore, setSbssScore] = useState(0);
  const [fundScore, setFundScore] = useState(0);
  const [scoreBand, setScoreBand] = useState({ name: 'Not Assessed', color: '#64748b' });
  const [hardBlockers, setHardBlockers] = useState<DiagnosisItem[]>([]);
  const [suppressors, setSuppressors] = useState<DiagnosisItem[]>([]);
  const [optimizations, setOptimizations] = useState<DiagnosisItem[]>([]);
  const [hasAssessment, setHasAssessment] = useState(false);

  // Centralized data loading function
  const loadDiagnosisData = () => {
    // Load assessment data
    const stored = localStorage.getItem('unified_assessment');
    if (stored) {
      const assessmentData = JSON.parse(stored) as UnifiedAnswers;
      const scoreResult = computeScore(assessmentData);
      const extended = computeExtendedResults(assessmentData);
      const band = getBand(scoreResult.score);
      
      setFundScore(scoreResult.score);
      setSbssScore(extended.sbssScore || scoreResult.bankableScore);
      setScoreBand(band);
      setHasAssessment(true);
    }

    // Load and categorize audit items by severity
    const allItems = getAllAuditItems();
    const incompleteItems = allItems.filter(item => item.status !== 'complete');
    
    const blockers: DiagnosisItem[] = [];
    const supps: DiagnosisItem[] = [];
    const opts: DiagnosisItem[] = [];

    incompleteItems.forEach(item => {
      const diagItem: DiagnosisItem = {
        ...item,
        fixAction: item.fixAction || 'Contact support for guidance',
        fixTimeline: item.fixTimeline || '30d',
      };

      if (item.severity === 'hard_blocker') {
        blockers.push(diagItem);
      } else if (item.severity === 'suppressor') {
        supps.push(diagItem);
      } else {
        opts.push(diagItem);
      }
    });

    // Sort by FICO impact (highest first)
    blockers.sort((a, b) => b.ficoImpact - a.ficoImpact);
    supps.sort((a, b) => b.ficoImpact - a.ficoImpact);
    opts.sort((a, b) => b.ficoImpact - a.ficoImpact);

    setHardBlockers(blockers);
    setSuppressors(supps);
    setOptimizations(opts);
  };

  useEffect(() => {
    // Initial load
    loadDiagnosisData();

    // Listen for data changes from other parts of the app
    const handleStorageChange = () => loadDiagnosisData();
    const handleFundscoreUpdate = () => loadDiagnosisData();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('fundscoreUpdated', handleFundscoreUpdate);
    window.addEventListener('auditItemUpdated', handleFundscoreUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('fundscoreUpdated', handleFundscoreUpdate);
      window.removeEventListener('auditItemUpdated', handleFundscoreUpdate);
    };
  }, []);

  const totalBlockerPoints = hardBlockers.reduce((sum, item) => sum + item.ficoImpact, 0);
  const totalSuppressorPoints = suppressors.reduce((sum, item) => sum + item.ficoImpact, 0);
  const totalOptPoints = optimizations.reduce((sum, item) => sum + item.ficoImpact, 0);
  const distanceToThreshold = Math.max(0, 160 - sbssScore);
  const isBankable = sbssScore >= 160;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '32px' }}
      >
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--muted-foreground)',
          marginBottom: '8px',
        }}>
          Capital Readiness Diagnosis
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--foreground)',
          margin: 0,
        }}>
          Patterns That Shape Your Bankability
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--muted-foreground)',
          marginTop: '8px',
          maxWidth: '600px',
        }}>
          These are the patterns lenders evaluate when reviewing your profile. 
          Businesses that reach bankable typically address Approval Barriers first, then Significant Patterns, then Improvement Signals.
        </p>
      </motion.div>

      {/* Score Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'var(--surface-1)',
          border: isBankable ? '2px solid var(--primary)' : '2px solid var(--border)',
          borderRadius: '2px',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* SBSS Score */}
          <div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--muted-foreground)',
              marginBottom: '8px',
            }}>
              SBSS Score
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '36px',
              fontWeight: 700,
              color: isBankable ? 'var(--primary)' : 'var(--foreground)',
            }}>
              {sbssScore}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--muted-foreground)',
            }}>
              of 300 max
            </div>
          </div>

          {/* Threshold */}
          <div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--muted-foreground)',
              marginBottom: '8px',
            }}>
              Bankable Threshold
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '36px',
              fontWeight: 700,
              color: 'var(--muted-foreground)',
            }}>
              160
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--muted-foreground)',
            }}>
              minimum required
            </div>
          </div>

          {/* Distance */}
          <div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--muted-foreground)',
              marginBottom: '8px',
            }}>
              Distance to Bankable
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '36px',
              fontWeight: 700,
              color: isBankable ? 'var(--primary)' : 'var(--destructive)',
            }}>
              {isBankable ? 'Qualified' : `${distanceToThreshold} pts`}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--muted-foreground)',
            }}>
              {isBankable ? 'You have crossed the bankable threshold' : 'from the bankable threshold'}
            </div>
          </div>

          {/* FundScore */}
          <div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--muted-foreground)',
              marginBottom: '8px',
            }}>
              FundScore
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '36px',
              fontWeight: 700,
              color: scoreBand.color,
            }}>
              {fundScore}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: scoreBand.color,
            }}>
              {scoreBand.name}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--muted-foreground)',
            }}>
              Progress toward bankable threshold
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--foreground)',
            }}>
              {Math.min(100, Math.round((sbssScore / 160) * 100))}%
            </span>
          </div>
          <div style={{
            height: '8px',
            background: 'var(--surface-2)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (sbssScore / 160) * 100)}%`,
              background: isBankable ? 'var(--primary)' : 'linear-gradient(90deg, var(--destructive), var(--warning))',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      </motion.div>

      {/* Issue Sections */}
      <div className="flex flex-col gap-8">
        {/* Hard Blockers */}
        {hardBlockers.length > 0 && (
          <IssueSection
            title="Approval Barriers"
            description="These patterns typically prevent approval. Businesses that reach bankable address these first."
            items={hardBlockers}
            severity="hard_blocker"
            totalPoints={totalBlockerPoints}
            delay={0.2}
          />
        )}

        {/* Suppressors */}
        {suppressors.length > 0 && (
          <IssueSection
            title="Significant Patterns"
            description="These patterns limit available options and amounts. Address after barriers are cleared."
            items={suppressors}
            severity="suppressor"
            totalPoints={totalSuppressorPoints}
            delay={0.3}
          />
        )}

        {/* Optimizations */}
        {optimizations.length > 0 && (
          <IssueSection
            title="Improvement Signals"
            description="Addressing these typically improves terms and rates. Not required but beneficial."
            items={optimizations}
            severity="optimization"
            totalPoints={totalOptPoints}
            delay={0.4}
          />
        )}

        {/* All Clear State */}
        {hardBlockers.length === 0 && suppressors.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--primary-bg)',
              border: '2px solid var(--primary)',
              borderRadius: '2px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 style={{
              width: 48,
              height: 48,
              color: 'var(--primary)',
              margin: '0 auto 16px',
            }} />
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--foreground)',
              marginBottom: '8px',
            }}>
              No Approval Barriers Found
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--muted-foreground)',
              marginBottom: '24px',
            }}>
              Your profile shows no approval barriers or significant patterns. Focus on improvement signals to secure the best terms.
            </p>
            <Link
              to="/app/access-funding"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: 'var(--primary)',
                color: 'var(--bg-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                borderRadius: '0',
              }}
            >
              View Funding Options
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </motion.div>
        )}
      </div>

      {/* CTA */}
      {(hardBlockers.length > 0 || suppressors.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: '32px',
            padding: '24px',
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '2px',
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--foreground)',
                marginBottom: '4px',
              }}>
                See what changes open this up
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--muted-foreground)',
              }}>
                Start with the patterns that have the highest impact on your bankability.
              </p>
            </div>
            <Link
              to="/app/lender-compliance"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                background: 'var(--primary)',
                color: 'var(--bg-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                borderRadius: '0',
                whiteSpace: 'nowrap',
              }}
            >
              Begin Addressing Patterns
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: Issue Section
// ════════════════════════════════════════════════════════════════════════════════

function IssueSection({
  title,
  description,
  items,
  severity,
  totalPoints,
  delay,
}: {
  title: string;
  description: string;
  items: DiagnosisItem[];
  severity: 'hard_blocker' | 'suppressor' | 'optimization';
  totalPoints: number;
  delay: number;
}) {
  const severityInfo = getSeverityInfo(severity);
  const Icon = severityInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '2px',
          background: severityInfo.bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon style={{ width: 18, height: 18, color: severityInfo.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 700,
            color: severityInfo.color,
            margin: 0,
          }}>
            {title}
            <span style={{
              marginLeft: '12px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--muted-foreground)',
            }}>
              ({items.length} patterns, +{totalPoints} pts when addressed)
            </span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--muted-foreground)',
            margin: 0,
          }}>
            {description}
          </p>
        </div>
      </div>

      {/* Items */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              background: 'var(--surface-1)',
              border: `1px solid ${severityInfo.borderColor}`,
              borderRadius: '2px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Rank */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '2px',
              background: severityInfo.bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 700,
              color: severityInfo.color,
              flexShrink: 0,
            }}>
              {index + 1}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--foreground)',
                marginBottom: '4px',
              }}>
                {item.title}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--muted-foreground)',
              }}>
                {item.fixAction}
              </div>
            </div>

            {/* Impact */}
            <div style={{
              textAlign: 'right',
              flexShrink: 0,
            }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                color: severityInfo.color,
              }}>
                +{item.ficoImpact} pts
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--muted-foreground)',
              }}>
                <Clock style={{ width: 12, height: 12 }} />
                {getTimelineLabel(item.fixTimeline)}
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight style={{
              width: 20,
              height: 20,
              color: 'var(--muted-foreground)',
              flexShrink: 0,
            }} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
