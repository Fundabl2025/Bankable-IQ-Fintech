// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Unified Assessment Page
// ONE ROUTE. ONE FLOW. 23 QUESTIONS. SEAMLESS EXPERIENCE.
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, useSpring } from 'motion/react';
import { ArrowRight, ArrowLeft, Info, Building2, FileText, TrendingUp, CreditCard, Shield, DollarSign, Lock, CheckCircle2 } from 'lucide-react';
import { UnifiedAnswers } from './types';
import { READINESS_QUESTIONS } from './questions';
import { calculatePartialScore, getBand } from './engine';
import { FoundationQuestion } from './FoundationQuestions';
import { setDataItem } from '../../lib/data-adapter';

export function UnifiedAssessment() {
  const navigate = useNavigate();
  
  // Assessment data
  const [data, setData] = useState<UnifiedAnswers>(getDefaultAnswers);
  
  // Current question (0-32 for 33 total questions)
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const totalQuestions = 35; // 12 foundation + 23 readiness

  // Live score
  const [liveScore, setLiveScore] = useState(0);
  const springScore = useSpring(0, { stiffness: 40, damping: 12 });

  // Save data to localStorage/Supabase whenever it changes
  useEffect(() => {
    const saveData = async () => {
      await setDataItem('unified_assessment', JSON.stringify(data));
    }
    saveData();
    
    // Update live score
    const newScore = calculatePartialScore(data);
    setLiveScore(newScore);
    springScore.set(newScore);
  }, [data]);

  // Handle data updates
  const updateData = (updates: Partial<UnifiedAnswers>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // ═══════════════════════════════════════════════════════════════════════════════
  // COMPREHENSIVE CONDITIONAL QUESTION LOGIC — ALL CATEGORIES
  // ═══════════════════════════════════════════════════════════════════════════════
  
  const shouldShowReadinessQuestion = (readinessIdx: number): boolean => {
    const hasBusinessBankAccount = data.bankAccount === 'dedicated' || data.bankAccount === 'personal';
    const hasNegativeItems = data.noDerogItems === 'false'; // Q_R15: User selected "Yes, I have some"
    const businessAgeMonths = data.bankAge !== '0_6mo'; // More than 6 months
    const businessNotNew = data.startDate?.year && (new Date().getFullYear() - data.startDate.year > 0);
    
    // DEBUG: Log only when checking conditional questions (reduce verbosity)
    const isConditionalQ = [2, 3, 7, 20, 21, 1, 4, 5, 15, 16, 17].includes(readinessIdx);
    if (isConditionalQ) {
      console.log(`[v0] Q_R${readinessIdx + 1}: bankAccount=${data.bankAccount}, noDerogItems=${data.noDerogItems}, bankAge=${data.bankAge}`);
    }
    
    // BANKING CONDITIONALS (indices 2, 3, 7, 20, 21)
    if ((readinessIdx === 2 || readinessIdx === 3 || readinessIdx === 20 || readinessIdx === 21) && !hasBusinessBankAccount) {
      if (isConditionalQ) console.log(`    → HIDDEN (no bank account)`);
      return false;
    }
    // Q_R8 additionally requires 6+ months of bank history
    if (readinessIdx === 7 && (!hasBusinessBankAccount || !businessAgeMonths)) {
      if (isConditionalQ) console.log(`    → HIDDEN (bank age < 6mo)`);
      return false;
    }
    
    // REVENUE & FINANCIAL CONDITIONALS
    // Q_R2 (index 1): P&L only if business not brand new
    if (readinessIdx === 1 && !businessNotNew) {
      if (isConditionalQ) console.log(`    → HIDDEN (business too new)`);
      return false;
    }
    // Q_R5 (index 4): Revenue trend only if 6+ months history
    if (readinessIdx === 4 && !businessAgeMonths) {
      if (isConditionalQ) console.log(`    → HIDDEN (bank age < 6mo)`);
      return false;
    }
    // Q_R6 (index 5): Profit margin only if revenue >= $5k/month
    if (readinessIdx === 5 && data.monthlyRevenue === 'under_5k') {
      if (isConditionalQ) console.log(`    → HIDDEN (revenue under $5k)`);
      return false;
    }
    
    // DEROGATORY CONDITIONALS (indices 15, 16, 17)
    // Q_R16, Q_R17, Q_R18 only show if user said "Yes, I have some" to Q_R15
    if ((readinessIdx === 15 || readinessIdx === 16 || readinessIdx === 17) && !hasNegativeItems) {
      if (isConditionalQ) console.log(`    → HIDDEN (no negative items)`);
      return false;
    }
    
    // All other readiness questions show by default
    if (isConditionalQ) console.log(`    → SHOWN`);
    return true;
  };
  
  const calculateApplicableQuestions = (): number => {
    // Calculate total applicable questions for accurate progress tracking
    let count = 12; // Foundation questions always shown (12 total)
    
    // Check each readiness question for applicability
    for (let i = 0; i < 23; i++) {
      if (shouldShowReadinessQuestion(i)) {
        count++;
      }
    }
    
    return count;
  };
  
  const getNextApplicableQuestion = (startFrom: number): number => {
    let nextQuestion = startFrom + 1;

    while (nextQuestion < 35) {
      if (nextQuestion < 12) {
        // Foundation questions always applicable
        return nextQuestion;
      } else {
        const readinessIdx = nextQuestion - 12;
        if (shouldShowReadinessQuestion(readinessIdx)) {
          return nextQuestion;
        }
      }
      nextQuestion++;
    }

    return 35; // Reached end
  };
  
  const getPreviousApplicableQuestion = (startFrom: number): number => {
    let prevQuestion = startFrom - 1;
    
    while (prevQuestion >= 0) {
      if (prevQuestion < 10) {
        // Foundation questions always applicable
        return prevQuestion;
      } else {
        const readinessIdx = prevQuestion - 10;
        if (shouldShowReadinessQuestion(readinessIdx)) {
          return prevQuestion;
        }
      }
      prevQuestion--;
    }
    
    return -1; // Reached beginning
  };
  
  const handleNext = () => {
    const nextQuestion = getNextApplicableQuestion(currentQuestion);
    
    if (nextQuestion < 35) {
      setCurrentQuestion(nextQuestion);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // All done - show loading and navigate to results
      setShowLoading(true);
      setTimeout(() => {
        navigate('/business-assessment/results');
      }, 2400);
    }
  };

  const handleBack = () => {
    const prevQuestion = getPreviousApplicableQuestion(currentQuestion);
    
    if (prevQuestion >= 0) {
      setCurrentQuestion(prevQuestion);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calculate progress
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  
  // Loading state
  const [showLoading, setShowLoading] = useState(false);

  // Determine which component to render based on question number
  const isFoundationQuestion = currentQuestion < 12; // Q0-11 are foundation (12 questions)
  const readinessIndex = currentQuestion - 12; // Q12-34 map to readiness 0-22

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Assessment Step Track */}
      <AssessmentStepTrack currentQuestion={currentQuestion} totalQuestions={totalQuestions} />

      {/* Content */}
      <div style={{ paddingTop: '92px', paddingBottom: '80px' }}>
        {!showLoading && isFoundationQuestion && (
          <FoundationQuestion
            step={currentQuestion}
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
            currentQuestionNumber={currentQuestion + 1}
            totalQuestions={totalQuestions}
          />
        )}

        {!showLoading && !isFoundationQuestion && (
          <ReadinessQuestion
            index={readinessIndex}
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onBack={handleBack}
            currentQuestionNumber={currentQuestion + 1}
            totalQuestions={totalQuestions}
            shouldShowReadinessQuestion={shouldShowReadinessQuestion}
          />
        )}

        {showLoading && (
          <LoadingScreen />
        )}
      </div>

      {/* Live Score Bar */}
      {!showLoading && (
        <LiveScoreBar score={Math.round(springScore.get())} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ASSESSMENT STEP TRACK — Icon-based category progress header
// ════════════════════════════════════════════════════════════════════════════════

const STEP_TRACK = [
  { label: 'Business Profile', Icon: Building2, start: 0, end: 11 },
  { label: 'Documents', Icon: FileText, start: 12, end: 15 },
  { label: 'Cash Flow', Icon: TrendingUp, start: 16, end: 19 },
  { label: 'Credit', Icon: CreditCard, start: 20, end: 26 },
  { label: 'History', Icon: Shield, start: 27, end: 31 },
  { label: 'Capital', Icon: DollarSign, start: 32, end: 34 },
  { label: 'Your Score', Icon: Lock, start: 35, end: 35, locked: true },
];

function AssessmentStepTrack({ currentQuestion, totalQuestions }: { currentQuestion: number; totalQuestions: number }) {
  const navigate = useNavigate();
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const getStatus = (start: number, end: number, locked?: boolean) => {
    if (locked) return 'locked';
    if (currentQuestion > end) return 'completed';
    if (currentQuestion >= start) return 'active';
    return 'upcoming';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-subtle)',
        zIndex: 100,
      }}
    >
      {/* Brand + Steps row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 20px',
          gap: '6px',
          overflowX: 'auto',
        }}
      >
        {/* ← Exit breadcrumb — Elon: one clear escape. Chase: "auto-saved" removes fear */}
        <button
          onClick={() => navigate('/app/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'none', border: '1px solid var(--border-subtle)',
            borderRadius: '7px', padding: '5px 10px',
            fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600,
            color: 'var(--text-muted)', cursor: 'pointer',
            flexShrink: 0, whiteSpace: 'nowrap', marginRight: '8px',
          }}
        >
          <ArrowLeft size={13} /> Dashboard
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', flexShrink: 0, marginRight: '8px' }} />

        {/* Logo */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginRight: '12px',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          FundReady™
        </div>

        {/* Steps */}
        {STEP_TRACK.map((step, i) => {
          const status = getStatus(step.start, step.end, step.locked);
          const { Icon } = step;
          const isActive = status === 'active';
          const isCompleted = status === 'completed';

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {/* Connector line */}
              {i > 0 && (
                <div
                  style={{
                    width: '20px',
                    height: '2px',
                    background: isCompleted ? 'var(--primary)' : 'var(--border-subtle)',
                    transition: 'background 0.3s',
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Step item */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  opacity: status === 'upcoming' ? 0.38 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isActive
                      ? 'var(--primary)'
                      : isCompleted
                      ? 'rgba(16,185,129,0.12)'
                      : 'var(--bg-surface-2)',
                    border: isActive || isCompleted
                      ? '2px solid var(--primary)'
                      : '2px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                  ) : (
                    <Icon
                      size={14}
                      style={{
                        color: isActive ? 'white' : 'var(--text-muted)',
                      }}
                    />
                  )}
                </div>
                <span
                  className="assessment-category-label"
                  style={{
                    fontSize: '9px',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s',
                  }}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Auto-saved indicator — Chase: removes loss-aversion anxiety */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          flexShrink: 0, marginLeft: '8px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Auto-saved
          </span>
        </div>
      </div>

      {/* Gradient progress line */}
      <div style={{ height: '3px', background: 'var(--bg-surface-2)' }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--primary), #3b82f6)',
            borderRadius: '0 2px 2px 0',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// LIVE SCORE BAR (STICKY BOTTOM)
// ════════════════════════════════════════════════════════════════════════════════

function LiveScoreBar({ score }: { score: number }) {
  const band = getBand(score);
  
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: 'var(--bg-surface-1)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 100,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
        }}
      >
        Live Capital Readiness Score
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 800,
            color: band.color,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 300,
            color: 'var(--text-muted)',
          }}
        >
          *provisional
        </span>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 400,
          color: 'var(--text-secondary)',
        }}
      >
        Mapping your capital path...
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════���════════════════════════════════
// READINESS QUESTION
// ════════════════════════════════════════════════════════════════════════════════

function ReadinessQuestion({ index, data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, shouldShowReadinessQuestion }: any) {
  const question = READINESS_QUESTIONS[index];
  const selectedAnswer = data.readinessAnswers[index];

  // Conditional logic to hide questions based on user answers (use passed prop)
  const shouldShowQuestion = (): boolean => {
    return shouldShowReadinessQuestion(index);
  };

  if (!shouldShowQuestion()) {
    // Skip to next question automatically
    setTimeout(() => onNext(), 0);
    return null;
  }

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...data.readinessAnswers];
    newAnswers[index] = optionIndex;
    
    // Special handling: Q_R15 (index 14) is "Do you have negative items?"
    // Option 0 = "No negative items" → set noDerogItems to 'true'
    // Option 1 = "Yes, I have some" → set noDerogItems to 'false'
    if (index === 14) {
      const noDerogValue = optionIndex === 0 ? 'true' : 'false';
      console.log(`[v0] Q_R15 answered: optionIndex=${optionIndex}, setting noDerogItems='${noDerogValue}'`);
      updateData({ readinessAnswers: newAnswers, noDerogItems: noDerogValue });
    } else {
      updateData({ readinessAnswers: newAnswers });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Section label */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}
      >
        Question {currentQuestionNumber} of {totalQuestions}
      </div>

      {/* Question text */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '24px',
          lineHeight: 1.3,
        }}
      >
        {question.text}
      </h2>

      {/* Why this matters */}
      <div
        style={{
          background: 'var(--primary-alpha)',
          border: '1px solid var(--primary)',
          borderLeft: '3px solid var(--primary)',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '15px',
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          {question.why}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {question.options?.map((option, optIndex) => (
          <motion.div
            key={optIndex}
            className="assessment-answer-card"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => handleSelectOption(optIndex)}
            style={{
              background: selectedAnswer === optIndex ? 'var(--primary-alpha)' : 'var(--bg-surface-2)',
              border: selectedAnswer === optIndex ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '20px 24px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
          >
            {/* Option label */}
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: option.sub ? '6px' : 0,
              }}
            >
              {option.label}
            </div>

            {/* Sub-label */}
            {option.sub && (
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 300,
                  color: 'var(--text-secondary)',
                }}
              >
                {option.sub}
              </div>
            )}

            {/* Checkmark */}
            {selectedAnswer === optIndex && (
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '24px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--bg-base)',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 24px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>

        <button
          onClick={onNext}
          disabled={selectedAnswer === undefined}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px 32px',
            background: selectedAnswer !== undefined ? 'var(--primary)' : 'var(--bg-surface-2)',
            border: 'none',
            borderRadius: '8px',
            color: selectedAnswer !== undefined ? 'var(--bg-base)' : 'var(--text-disabled)',
            cursor: selectedAnswer !== undefined ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          {index === 22 ? 'Complete Assessment →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// LOADING SCREEN
// ════════════════════════════════════════════════════════════════════════════════

function LoadingScreen() {
  const [phase, setPhase] = useState(0);
  const phases = [
    "Analyzing your funding profile...",
    "Identifying patterns lenders flag...",
    "Mapping your capital path...",
    "Calculating what you unlock in 30, 90, and 180 days...",
  ];

  useEffect(() => {
    const timers = phases.map((_, i) =>
      setTimeout(() => setPhase(i), i * 500)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            margin: '0 auto 32px',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {phases.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: phase >= i ? 1 : 0, y: phase >= i ? 0 : 8 }}
              transition={{ duration: 0.4 }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: phase === i ? 500 : 300,
                color: phase === i ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {text}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UnifiedAssessment;

// Helper function to get default answers
function getDefaultAnswers(): UnifiedAnswers {
  // Load from localStorage if exists
  const saved = localStorage.getItem('unified_assessment');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  
  // Default empty state
  return {
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    businessName: '',
    entityType: '',
    startDate: { month: new Date().getMonth() + 1, year: new Date().getFullYear() },
    industry: '',
    hasEIN: false,
    hasWebsite: false,
    monthlyRevenue: 0,
    ccSales: 0,
    bankAccount: '',
    bankAge: '',
    avgDailyBalance: '',
    nsfCount: '',
    arBalance: 0,
    equipmentValue: 0,
    poBalance: 0,
    ownsProperty: '',
    constructionPlan: '',
    experian: 680,
    transunion: 680,
    equifax: 680,
    utilization: 30,
    personalIncome: '',
    hasBankruptcy: false,
    hasJudgments: false,
    hasCollections: false,
    hasChargeoffs: false,
    hasLatePay: false,
    hasTaxLiens: '',
    noDerogItems: '', // Empty until Q_R15 is answered
    bizCreditFile: '',
    inquiries30d: '',
    readinessAnswers: new Array(23).fill(undefined),
  };
}
