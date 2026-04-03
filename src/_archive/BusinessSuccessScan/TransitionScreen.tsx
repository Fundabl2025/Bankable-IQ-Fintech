// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Transition Screen: BSS → FundScore™ Assessment
// Bridge between structured intake and qualitative assessment
// Shows preliminary score based on BSS data before 24 questions
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, useSpring, useTransform } from 'motion/react';
import { UnifiedProgressBar } from '../../components/UnifiedProgressBar';
import { FileText, TrendingUp, MessageSquare, History } from 'lucide-react';

interface PreliminaryResult {
  score: number;
  band: {
    name: string;
    color: string;
  };
  preQualified: number;
  approaching: number;
  actionsIdentified: number;
}

export function TransitionScreen() {
  const navigate = useNavigate();
  const [prelimResult, setPrelimResult] = useState<PreliminaryResult | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load BSS data and calculate preliminary score
  useEffect(() => {
    const step1 = localStorage.getItem('bss_step1');
    const step2 = localStorage.getItem('bss_step2');
    const step3 = localStorage.getItem('bss_step3');

    if (!step1 || !step2 || !step3) {
      // Redirect back to start if BSS not complete
      navigate('/business-success-scan');
      return;
    }

    // Parse BSS data
    const bssData = {
      step1: JSON.parse(step1),
      step2: JSON.parse(step2),
      step3: JSON.parse(step3),
    };

    // Calculate preliminary score from BSS data
    const preliminary = calculatePreliminaryScore(bssData);
    setPrelimResult(preliminary);
    setMounted(true);
  }, [navigate]);

  // Animated score counter
  const scoreSpring = useSpring(0, { stiffness: 40, damping: 12 });
  const scoreValue = useTransform(scoreSpring, (val) => Math.round(val));

  useEffect(() => {
    if (prelimResult && mounted) {
      scoreSpring.set(prelimResult.score);
    }
  }, [prelimResult, mounted, scoreSpring]);

  const handleStartAssessment = () => {
    navigate('/business-success-scan/assessment');
  };

  if (!prelimResult) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
        <UnifiedProgressBar currentStep={4} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 52px)' }}>
          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--muted-foreground)' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <UnifiedProgressBar currentStep={4} />

      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            padding: '40px',
          }}
        >
          {/* Preliminary Score Display */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--muted-foreground)',
                marginBottom: '16px',
              }}
            >
              PRELIMINARY FUNDSCORE™ — BASED ON INTAKE DATA
            </div>

            {/* Animated Score Number */}
            <motion.div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '96px',
                fontWeight: 800,
                lineHeight: 1,
                color: prelimResult.band.color,
                marginBottom: '8px',
              }}
            >
              <motion.span>{scoreValue}</motion.span>
            </motion.div>

            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                fontStyle: 'italic',
                color: 'var(--muted-foreground)',
                marginBottom: '16px',
              }}
            >
              Preliminary
            </div>

            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '20px',
                fontStyle: 'italic',
                color: 'var(--secondary-foreground)',
                marginBottom: '24px',
              }}
            >
              {prelimResult.band.name}
            </div>

            {/* Score Meter */}
            <div
              style={{
                width: '100%',
                height: '10px',
                background: 'var(--border)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(prelimResult.score / 1000) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, var(--primary-hover), var(--primary))`,
                }}
              />
            </div>
          </div>

          {/* Explanation Callout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              background: 'var(--primary-bg)',
              borderLeft: '3px solid var(--primary)',
              padding: '16px 20px',
              marginBottom: '32px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '16px',
                fontStyle: 'italic',
                color: 'var(--secondary-foreground)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              This preliminary score is based on the structured data you&apos;ve provided.
              The 24 questions below will sharpen it — some answers can move your score
              significantly in either direction. Your final score is calculated after
              all 24 questions.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  marginBottom: '4px',
                }}
              >
                {prelimResult.preQualified}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                }}
              >
                Pre-Qualified
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--muted-foreground)',
                }}
              >
                products from intake data
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#38a880',
                  marginBottom: '4px',
                }}
              >
                {prelimResult.approaching}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                }}
              >
                Approaching
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--muted-foreground)',
                }}
              >
                need minor improvements
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#c89020',
                  marginBottom: '4px',
                }}
              >
                {prelimResult.actionsIdentified}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                }}
              >
                Actions
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--muted-foreground)',
                }}
              >
                to improve your score
              </div>
            </motion.div>
          </div>

          {/* Why 24 More Questions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--foreground)',
                marginBottom: '24px',
              }}
            >
              Why 24 more questions?
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              {[
                {
                  icon: FileText,
                  title: 'Documentation Depth',
                  description:
                    "Lenders cross-reference your documents. We need to know not just whether you have them — but whether they're consistent with each other.",
                },
                {
                  icon: TrendingUp,
                  title: 'Behavioral Signals',
                  description:
                    "NSF history, utilization trends, balance trajectory — behavioral data that databases don't capture but lenders read carefully.",
                },
                {
                  icon: MessageSquare,
                  title: 'Narrative Strength',
                  description:
                    "Can you explain exactly how you'll use and repay the money? Vague answers kill applications that otherwise would have been approved.",
                },
                {
                  icon: History,
                  title: 'Prior Loan History',
                  description:
                    'Have you successfully repaid a business loan before? This single data point can add 45 points to your final FundScore™.',
                },
              ].map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + idx * 0.1 }}
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    padding: '20px',
                  }}
                >
                  <card.icon
                    size={24}
                    style={{ color: 'var(--primary)', marginBottom: '12px' }}
                  />
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--foreground)',
                      marginBottom: '8px',
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: 300,
                      color: 'var(--secondary-foreground)',
                      lineHeight: 1.6,
                    }}
                  >
                    {card.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trust Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
            style={{
              background: 'var(--primary-bg)',
              border: '1px solid var(--primary)',
              padding: '12px 20px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--secondary-foreground)',
              }}
            >
              🔒 24 questions. No bank login. No credit pull. 6–9 minutes.
            </span>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStartAssessment}
            style={{
              width: '100%',
              padding: '16px 32px',
              background: 'var(--primary)',
              color: '#000',
              border: 'none',
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginBottom: '24px',
            }}
          >
            Start My FundScore™ Assessment →
          </motion.button>

          {/* What You'll Get */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            {[
              'FundScore™ (0–1000)',
              '6-Dimension Breakdown',
              'Ranked Action Plan',
              'Lender Access Preview',
            ].map((item) => (
              <div
                key={item}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  padding: '12px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'var(--foreground)',
                  textAlign: 'center',
                }}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Time Badge */}
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--muted-foreground)',
            }}
          >
            ⏱ Most people finish in 6–9 minutes.
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PRELIMINARY SCORE CALCULATION
// ════════════════════════════════════════════════════════════════════════════════

function calculatePreliminaryScore(bssData: any): PreliminaryResult {
  // This is a simplified preliminary calculation based on BSS data
  // The actual FundScore calculation happens in the assessment engine
  
  const { step2, step3 } = bssData;

  // Start with a base score
  let score = 400;

  // Credit Profile (28% weight) - biggest factor
  const creditScores = [
    step3.experianScore || 680,
    step3.transunionScore || 680,
    step3.equifaxScore || 680,
  ].sort((a, b) => a - b);
  const middleScore = creditScores[1];

  if (middleScore >= 750) score += 200;
  else if (middleScore >= 700) score += 160;
  else if (middleScore >= 650) score += 120;
  else if (middleScore >= 600) score += 80;
  else if (middleScore >= 550) score += 40;

  // Credit utilization impact
  if (step3.creditUtilization <= 30) score += 30;
  else if (step3.creditUtilization <= 50) score += 15;

  // Derogatory items
  const hasCleanCredit = step3.derogatoryItems?.length === 0 || 
                         step3.derogatoryItems?.includes('No derogatory items - my report is clean');
  if (hasCleanCredit) score += 40;

  // Business Structure (10% weight)
  if (step2.entityType?.includes('Corp')) score += 30;
  else if (step2.entityType?.includes('LLC')) score += 20;

  // Business age
  const businessAgeMonths = calculateBusinessAgeMonths(step2.startMonth, step2.startYear);
  if (businessAgeMonths >= 24) score += 30;
  else if (businessAgeMonths >= 12) score += 20;
  else if (businessAgeMonths >= 6) score += 10;

  // Cash Flow (20% weight)
  const revenue = step2.monthlyRevenue || 0;
  if (revenue >= 50000) score += 60;
  else if (revenue >= 20000) score += 45;
  else if (revenue >= 10000) score += 30;
  else if (revenue >= 5000) score += 15;

  // Banking Behavior (13% weight)
  if (step2.bankAccountStatus === 'Yes - dedicated business account') score += 25;
  if (step2.nsfOverdrafts === 'Zero') score += 20;
  
  if (step2.avgMonthlyBalance === '$25,000+') score += 25;
  else if (step2.avgMonthlyBalance === '$10,000 - $25,000') score += 20;
  else if (step2.avgMonthlyBalance === '$2,000 - $10,000') score += 10;

  // Cap the score at 1000
  score = Math.min(1000, Math.max(400, score));

  // Get score band
  const band = getScoreBand(score);

  // Calculate mock product eligibility counts
  const preQualified = score >= 750 ? 8 : score >= 650 ? 5 : score >= 550 ? 3 : 1;
  const approaching = score >= 650 ? 4 : score >= 550 ? 6 : score >= 450 ? 5 : 3;
  const actionsIdentified = score < 750 ? Math.ceil((750 - score) / 50) : 2;

  return {
    score,
    band,
    preQualified,
    approaching,
    actionsIdentified,
  };
}

function calculateBusinessAgeMonths(startMonth: string, startYear: string): number {
  if (!startMonth || !startYear) return 0;
  const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1);
  const now = new Date();
  return (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
}

function getScoreBand(score: number) {
  if (score >= 900) return { name: 'Prime — Top 5%', color: '#c8f040' };
  if (score >= 750) return { name: 'Ready — Strong Position', color: '#8ab820' };
  if (score >= 650) return { name: 'Approaching — Building Momentum', color: '#38a880' };
  if (score >= 550) return { name: 'Developing — Work in Progress', color: '#a0a020' };
  if (score >= 400) return { name: 'Emerging — Early Stage', color: '#c89020' };
  return { name: 'Critical — Needs Attention', color: '#b04428' };
}
