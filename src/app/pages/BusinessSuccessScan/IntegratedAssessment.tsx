// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Integrated FundScore Assessment
// Part of unified BSS + FundScore flow with pre-fill from BSS data
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { UnifiedProgressBar } from '../../components/UnifiedProgressBar';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { QUESTIONS, SECTIONS } from '../fundscore-assessment/questions';
import { computeScore } from '../fundscore-assessment/engine';
import { loadBSSData, mapBSSToFundScoreAnswers, isQuestionPrefilled } from '../../utils/bssToFundscoreSync';

export function IntegratedAssessment() {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>(new Array(24).fill(undefined));
  const [prefilledAnswers, setPrefilledAnswers] = useState<Record<number, number>>({});
  const [showLoading, setShowLoading] = useState(false);

  // Load BSS data and pre-fill on mount
  useEffect(() => {
    const bssData = loadBSSData();
    
    if (!bssData) {
      // Redirect to start if BSS not complete
      navigate('/business-success-scan');
      return;
    }

    // Map BSS data to FundScore answers
    const prefilled = mapBSSToFundScoreAnswers(bssData);
    setPrefilledAnswers(prefilled);

    // Initialize answers array with pre-filled values
    const initialAnswers = new Array(24).fill(undefined);
    Object.entries(prefilled).forEach(([qIdx, optIdx]) => {
      initialAnswers[parseInt(qIdx)] = optIdx;
    });
    setAnswers(initialAnswers);
  }, [navigate]);

  const currentQuestion = QUESTIONS[currentQ];
  const currentSectionName = SECTIONS[currentQ];
  const isFirstInSection = currentQ === 0 || SECTIONS[currentQ - 1] !== currentSectionName;
  const isPrefilled = isQuestionPrefilled(currentQ);
  const hasAnswer = answers[currentQ] !== undefined;

  const handleSelectOption = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // All questions answered - show loading and go to results
      setShowLoading(true);
      
      // Save answers to localStorage
      localStorage.setItem('fundscore_answers', JSON.stringify(answers));
      
      // Navigate to results after loading
      setTimeout(() => {
        navigate('/business-success-scan/results');
      }, 1800);
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/business-success-scan/fundscore');
    }
  };

  // Calculate progress
  const questionProgress = ((currentQ + 1) / QUESTIONS.length) * 100;

  // Loading screen
  if (showLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
        <UnifiedProgressBar currentStep={4} questionProgress={100} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 56px)',
            padding: '24px',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              marginBottom: '24px',
            }}
          />
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--foreground)',
              marginBottom: '8px',
            }}
          >
            Calculating your FundScore™
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--muted-foreground)',
            }}
          >
            Analyzing your responses across 6 dimensions...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <UnifiedProgressBar currentStep={4} questionProgress={questionProgress} />

      {/* Section Header */}
      {isFirstInSection && (
        <div
          style={{
            background: 'var(--card)',
            borderBottom: '1px solid var(--border)',
            padding: '24px',
          }}
        >
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--primary)',
                marginBottom: '8px',
              }}
            >
              SECTION {getSectionNumber(currentSectionName)} OF 6
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--foreground)',
                margin: 0,
              }}
            >
              {currentSectionName}
            </h2>
          </div>
        </div>
      )}

      {/* Question Content */}
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        {/* Pre-filled Banner */}
        {isPrefilled && prefilledAnswers[currentQ] !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--surface-2)',
              borderLeft: '2px solid #38a880',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Info size={16} style={{ color: '#38a880', flexShrink: 0 }} />
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 400,
                color: '#38a880',
              }}
            >
              ↗ Pre-filled from your intake data — change if needed
            </div>
          </motion.div>
        )}

        {/* Progress Indicator */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--muted-foreground)',
            marginBottom: '16px',
          }}
        >
          Question {currentQ + 1} of {QUESTIONS.length}
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            padding: '32px',
            marginBottom: '32px',
          }}
        >
          {/* Question Text */}
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--foreground)',
              marginBottom: '16px',
              lineHeight: 1.4,
            }}
          >
            {currentQuestion.text}
          </h3>

          {/* Why this matters */}
          <div
            style={{
              background: 'var(--primary-bg)',
              borderLeft: '3px solid var(--primary)',
              padding: '12px 16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 300,
                color: 'var(--secondary-foreground)',
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}
            >
              <strong style={{ fontWeight: 500, fontStyle: 'normal' }}>Why this matters:</strong>{' '}
              {currentQuestion.why}
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQ] === idx;
              return (
                <motion.div
                  key={idx}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectOption(idx)}
                  style={{
                    background: isSelected ? 'var(--primary-bg)' : 'var(--surface-2)',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      fontWeight: isSelected ? 500 : 400,
                      color: 'var(--foreground)',
                      marginBottom: option.sub ? '4px' : 0,
                    }}
                  >
                    {option.label}
                  </div>
                  {option.sub && (
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        fontWeight: 300,
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {option.sub}
                    </div>
                  )}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        fontSize: '12px',
                      }}
                    >
                      ✓
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Navigation */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleBack}
            style={{
              padding: '14px 24px',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            disabled={!hasAnswer}
            style={{
              flex: 1,
              padding: '14px 24px',
              background: hasAnswer ? 'var(--primary)' : 'var(--muted)',
              color: '#000',
              border: 'none',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              cursor: hasAnswer ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: hasAnswer ? 1 : 0.5,
            }}
          >
            {currentQ === QUESTIONS.length - 1 ? 'Calculate My Score' : 'Continue'}
            <ArrowRight size={16} />
          </motion.button>
        </div>

        {/* Progress Text */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--muted-foreground)',
          }}
        >
          {QUESTIONS.length - currentQ - 1} question{QUESTIONS.length - currentQ - 1 !== 1 ? 's' : ''} remaining
        </div>
      </div>
    </div>
  );
}

// Helper function to get section number
function getSectionNumber(sectionName: string): number {
  const sections = ['Credit Profile', 'Documentation', 'Cash Flow', 'Banking Behavior', 'Business Structure', 'Narrative Strength'];
  return sections.indexOf(sectionName) + 1;
}
