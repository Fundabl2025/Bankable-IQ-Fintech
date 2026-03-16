// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Unified Assessment Page
// ONE ROUTE. ONE FLOW. 23 QUESTIONS. SEAMLESS EXPERIENCE.
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, useSpring } from 'motion/react';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
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
  const totalQuestions = 33; // 10 foundation + 23 readiness

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

  // Navigation handlers with conditional question logic
  const getApplicableQuestionCount = (upToIndex: number): number => {
    // Count how many questions from 0 to upToIndex are actually applicable
    let count = 0;
    const hasBusinessBankAccount = data.bankAccount === 'dedicated' || data.bankAccount === 'personal';
    const hasNegativeItems = data.readinessAnswers[14] === 1;
    
    for (let i = 0; i <= upToIndex && i < 33; i++) {
      if (i < 10) {
        // Foundation questions always count
        count++;
      } else {
        const readinessIdx = i - 10;
        let shouldCount = true;
        
        // Check banking conditionals (readiness indices 2, 3, 7, 20, 21)
        if ((readinessIdx === 2 || readinessIdx === 3 || readinessIdx === 7 || readinessIdx === 20 || readinessIdx === 21) && !hasBusinessBankAccount) {
          shouldCount = false;
        }
        
        // Check derogatory conditionals (readiness indices 15, 16, 17)
        if ((readinessIdx === 15 || readinessIdx === 16 || readinessIdx === 17) && !hasNegativeItems) {
          shouldCount = false;
        }
        
        if (shouldCount) count++;
      }
    }
    return count;
  };
  
  const handleNext = () => {
    let nextQuestion = currentQuestion + 1;
    
    // Skip to next applicable question
    while (nextQuestion < 33) {
      const isFoundation = nextQuestion < 10;
      const readinessIdx = nextQuestion - 10;
      const hasBusinessBankAccount = data.bankAccount === 'dedicated' || data.bankAccount === 'personal';
      const hasNegativeItems = data.readinessAnswers[14] === 1;
      
      let shouldShow = true;
      
      if (!isFoundation) {
        // Check banking conditionals
        if ((readinessIdx === 2 || readinessIdx === 3 || readinessIdx === 7 || readinessIdx === 20 || readinessIdx === 21) && !hasBusinessBankAccount) {
          shouldShow = false;
        }
        
        // Check derogatory conditionals
        if ((readinessIdx === 15 || readinessIdx === 16 || readinessIdx === 17) && !hasNegativeItems) {
          shouldShow = false;
        }
      }
      
      if (shouldShow) break;
      nextQuestion++;
    }
    
    if (nextQuestion < 33) {
      setCurrentQuestion(nextQuestion);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // All done - show loading and navigate to results
      setShowLoading(true);
      setTimeout(() => {
        navigate('/business-assessment/results');
      }, 1800);
    }
  };

  const handleBack = () => {
    let prevQuestion = currentQuestion - 1;
    
    // Skip back to previous applicable question
    while (prevQuestion >= 0) {
      const isFoundation = prevQuestion < 10;
      const readinessIdx = prevQuestion - 10;
      const hasBusinessBankAccount = data.bankAccount === 'dedicated' || data.bankAccount === 'personal';
      const hasNegativeItems = data.readinessAnswers[14] === 1;
      
      let shouldShow = true;
      
      if (!isFoundation) {
        // Check banking conditionals
        if ((readinessIdx === 2 || readinessIdx === 3 || readinessIdx === 7 || readinessIdx === 20 || readinessIdx === 21) && !hasBusinessBankAccount) {
          shouldShow = false;
        }
        
        // Check derogatory conditionals
        if ((readinessIdx === 15 || readinessIdx === 16 || readinessIdx === 17) && !hasNegativeItems) {
          shouldShow = false;
        }
      }
      
      if (shouldShow) break;
      prevQuestion--;
    }
    
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
  const isFoundationQuestion = currentQuestion < 10; // Q0-9 are foundation
  const readinessIndex = currentQuestion - 10; // Q10-32 map to readiness 0-22

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Progress Bar */}
      <ProgressBar progress={progress} currentQuestion={currentQuestion} totalQuestions={totalQuestions} />

      {/* Content */}
      <div style={{ paddingTop: '60px', paddingBottom: '80px' }}>
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
// PROGRESS BAR COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

function ProgressBar({ progress, currentQuestion, totalQuestions }: any) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '8px',
        background: 'var(--bg-surface-2)',
        borderBottom: '1px solid var(--border-subtle)',
        zIndex: 100,
      }}
    >
      <motion.div
        style={{
          height: '100%',
          background: 'var(--primary)',
          borderRadius: '0',
        }}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
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
        Live FundScore™
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
        Calculating eligibility...
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════���════════════════════════════════
// READINESS QUESTION
// ════════════════════════════════════════════════════════════════════════════════

function ReadinessQuestion({ index, data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions }: any) {
  const question = READINESS_QUESTIONS[index];
  const selectedAnswer = data.readinessAnswers[index];

  // Conditional logic to hide questions based on user answers
  const shouldShowQuestion = (): boolean => {
    // Banking-related questions - only show if user has a business bank account
    const hasBusinessBankAccount = data.bankAccount === 'dedicated' || data.bankAccount === 'personal';
    
    // Q_R3 (index 2) - Bank statements months - only if has business account
    if (index === 2 && !hasBusinessBankAccount) return false;
    
    // Q_R4 (index 3) - Revenue alignment (tax vs bank) - only if has business account
    if (index === 3 && !hasBusinessBankAccount) return false;
    
    // Q_R8 (index 7) - Bank balance trending - only if has business account
    if (index === 7 && !hasBusinessBankAccount) return false;
    
    // Q_R21 (index 20) - Average Daily Balance - only if has business account
    if (index === 20 && !hasBusinessBankAccount) return false;
    
    // Q_R22 (index 21) - NSF/Overdraft count - only if has business account
    if (index === 21 && !hasBusinessBankAccount) return false;
    
    // Derogatory items section - only show bankruptcy/collections/tax liens if user said "Yes, I have some"
    // This means readinessAnswers[14] (Q_R15: noDerogItems) === 1 (which is the "Yes, I have some" option)
    
    // Q_R16 (index 15) - Bankruptcy - only show if has negative items (readinessAnswers[14] === 1)
    if (index === 15 && data.readinessAnswers[14] !== 1) return false;
    
    // Q_R17 (index 16) - Collections - only show if has negative items
    if (index === 16 && data.readinessAnswers[14] !== 1) return false;
    
    // Q_R18 (index 17) - Tax Liens - only show if has negative items
    if (index === 17 && data.readinessAnswers[14] !== 1) return false;
    
    // All other questions show by default
    return true;
  };

  if (!shouldShowQuestion()) {
    // Skip to next question automatically
    setTimeout(() => onNext(), 0);
    return null;
  }

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...data.readinessAnswers];
    newAnswers[index] = optionIndex;
    updateData({ readinessAnswers: newAnswers });
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
          {index === 12 ? 'Complete Assessment →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// LOADING SCREEN
// ════════════════════════════════════════════════════════════════════════════════

function LoadingScreen() {
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
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            margin: '0 auto 24px',
          }}
        />
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          Calculating Your FundScore™
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 300,
            color: 'var(--text-secondary)',
          }}
        >
          Analyzing 24 data points across 6 dimensions...
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
    hasTaxLiens: false,
    noDerogItems: true,
    bizCreditFile: '',
    inquiries30d: '',
    readinessAnswers: new Array(13).fill(undefined),
  };
}
