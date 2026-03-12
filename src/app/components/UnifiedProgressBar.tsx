// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Unified Progress Bar for BSS + FundScore™ Flow
// 5 visual steps: Identity → Operations → Credit → Assessment → Results
// ════════════════════════════════════════════════════════════════════════════════

import { motion } from 'motion/react';

interface UnifiedProgressBarProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  questionProgress?: number; // For step 4 (Assessment), show Q1-24 progress
}

const STEPS = [
  { id: 1, label: 'Identity' },
  { id: 2, label: 'Operations' },
  { id: 3, label: 'Credit' },
  { id: 4, label: 'Assessment' },
  { id: 5, label: 'Results' },
];

export function UnifiedProgressBar({ currentStep, questionProgress }: UnifiedProgressBarProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--surface-1)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Main Progress Bar */}
      <div
        style={{
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '800px',
            width: '100%',
          }}
        >
          {STEPS.map((step, idx) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Step Circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <motion.div
                  initial={false}
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                  }}
                  style={{
                    width: currentStep === step.id ? '32px' : '24px',
                    height: currentStep === step.id ? '32px' : '24px',
                    borderRadius: '50%',
                    border: step.id < currentStep 
                      ? '2px solid var(--primary)' 
                      : currentStep === step.id 
                      ? '3px solid var(--primary)' 
                      : '1px solid var(--border)',
                    background: step.id < currentStep ? 'var(--primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: currentStep === step.id ? '14px' : '12px',
                    color: step.id <= currentStep ? 'var(--primary)' : 'var(--muted-foreground)',
                  }}
                >
                  {step.id < currentStep ? '✓' : step.id}
                </motion.div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: currentStep === step.id ? 500 : 400,
                    color: step.id <= currentStep ? 'var(--primary)' : 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.label}
                </div>
              </div>

              {/* Connector Line */}
              {idx < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: step.id < currentStep ? 'var(--primary)' : 'var(--border)',
                    marginLeft: '8px',
                    marginRight: '8px',
                    marginBottom: '20px',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Question Progress Bar (only visible on step 4 - Assessment) */}
      {currentStep === 4 && questionProgress !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            height: '4px',
            width: '100%',
            background: 'var(--border)',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${questionProgress}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%',
              background: 'var(--primary)',
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
