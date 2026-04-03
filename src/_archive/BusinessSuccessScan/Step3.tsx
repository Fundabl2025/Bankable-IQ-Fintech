// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Business Success Scan Step 3: Credit Profile
// Owner's credit picture - #1 factor lenders check
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { UnifiedProgressBar } from '../../components/UnifiedProgressBar';

interface Step3Data {
  ownerFirstName: string;
  ownerLastName: string;
  ownerCity: string;
  ownerState: string;
  personalIncome: string;
  experianScore: number;
  transunionScore: number;
  equifaxScore: number;
  hasBankruptcy: string;
  bankruptcyTiming: string;
  hasJudgments: string;
  creditInquiries: string;
  newAccounts: string;
  creditUtilization: number;
  derogatoryItems: string[];
}

export function Step3() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Step3Data>({
    ownerFirstName: '',
    ownerLastName: '',
    ownerCity: '',
    ownerState: '',
    personalIncome: '',
    experianScore: 680,
    transunionScore: 680,
    equifaxScore: 680,
    hasBankruptcy: '',
    bankruptcyTiming: '',
    hasJudgments: '',
    creditInquiries: '',
    newAccounts: '',
    creditUtilization: 30,
    derogatoryItems: [],
  });

  // Load saved data and pre-fill from Step 1
  useEffect(() => {
    const saved = localStorage.getItem('bss_step3');
    if (saved) {
      setFormData(JSON.parse(saved));
    } else {
      // Pre-fill owner name from Step 1
      const step1 = localStorage.getItem('bss_step1');
      if (step1) {
        const step1Data = JSON.parse(step1);
        setFormData((prev) => ({
          ...prev,
          ownerFirstName: step1Data.contactFirstName || '',
          ownerLastName: step1Data.contactLastName || '',
        }));
      }
    }
  }, []);

  const fillTestData = () => {
    setFormData({
      ownerFirstName: 'John',
      ownerLastName: 'Smith',
      ownerCity: 'Austin',
      ownerState: 'TX',
      personalIncome: '$75K - $125K',
      experianScore: 720,
      transunionScore: 715,
      equifaxScore: 718,
      hasBankruptcy: 'No',
      bankruptcyTiming: '',
      hasJudgments: 'No',
      creditInquiries: '1-2 inquiries',
      newAccounts: '1-2',
      creditUtilization: 22,
      derogatoryItems: [],
    });
  };

  // Calculate composite score
  const scores = [formData.experianScore, formData.transunionScore, formData.equifaxScore].sort((a, b) => a - b);
  const middleScore = scores[1]; // Middle score
  const avgScore = Math.round((scores[0] + scores[1] + scores[2]) / 3);

  // Score band
  const getScoreBand = (score: number) => {
    if (score < 580) return { color: '#b04428', label: 'Below subprime' };
    if (score < 620) return { color: '#c89020', label: 'Subprime' };
    if (score < 660) return { color: '#a0a020', label: 'Near-prime' };
    if (score < 700) return { color: '#38a880', label: 'Fair' };
    if (score < 750) return { color: '#8ab820', label: 'Good' };
    return { color: '#c8f040', label: 'Excellent' };
  };

  const scoreBand = getScoreBand(middleScore);

  // Product threshold message
  const getThresholdMessage = (score: number) => {
    if (score < 500) return { color: 'var(--destructive)', text: 'MCA available but all conventional products locked.' };
    if (score < 580) return { color: 'var(--warning)', text: 'MCA and some revenue products available.' };
    if (score < 620) return { color: 'var(--info)', text: 'Opens SBA access (minimum 580). Alt-lenders available.' };
    if (score < 650) return { color: 'var(--info)', text: 'Most alt-lenders available. Personal CC and credit line approaching.' };
    if (score < 700) return { color: 'var(--primary)', text: 'Opens credit union loans and approaching SBA 7(a).' };
    if (score < 750) return { color: 'var(--primary)', text: 'Strong access. Most products available except conventional bank.' };
    return { color: 'var(--primary)', text: '✓ Top-tier access across all 17 products.' };
  };

  const thresholdMessage = getThresholdMessage(middleScore);

  // Utilization band
  const getUtilizationBand = (util: number) => {
    if (util < 30) return { color: '#8ab820', label: 'Ideal' };
    if (util < 50) return { color: '#c89020', label: 'Caution' };
    if (util < 75) return { color: '#b04428', label: 'High' };
    return { color: '#b04428', label: 'Very High' };
  };

  const utilizationBand = getUtilizationBand(formData.creditUtilization);

  const handleContinue = () => {
    localStorage.setItem('bss_step3', JSON.stringify(formData));
    navigate('/business-success-scan/fundscore');
  };

  const handleBack = () => {
    navigate('/business-success-scan/step-2');
  };

  // Toggle derogatory items
  const toggleDerogatory = (item: string) => {
    if (item === 'none') {
      setFormData({ ...formData, derogatoryItems: ['none'] });
    } else {
      const filtered = formData.derogatoryItems.filter((i) => i !== 'none');
      if (filtered.includes(item)) {
        setFormData({ ...formData, derogatoryItems: filtered.filter((i) => i !== item) });
      } else {
        setFormData({ ...formData, derogatoryItems: [...filtered, item] });
      }
    }
  };

  // Validation
  const isValid =
    formData.ownerFirstName &&
    formData.ownerLastName &&
    formData.ownerCity &&
    formData.ownerState &&
    formData.personalIncome &&
    formData.hasBankruptcy &&
    (formData.hasBankruptcy === 'No' || formData.bankruptcyTiming) &&
    formData.hasJudgments &&
    formData.creditInquiries &&
    formData.newAccounts;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <UnifiedProgressBar currentStep={3} />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            padding: '40px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--primary)',
                  marginBottom: '12px',
                }}
              >
                STEP 3 OF 5 - CREDIT PROFILE
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: 'var(--foreground)',
                  marginBottom: '12px',
                  lineHeight: 1.2,
                }}
              >
                Your personal credit picture.
              </h1>
              <p
                style={{
                  fontFamily: 'Crimson Pro',
                  fontSize: '16px',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  lineHeight: 1.5,
                  marginBottom: '6px',
                }}
              >
                Personal credit is the first thing every lender checks. This section determines which products are available to you today.
              </p>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'var(--muted-foreground)',
                }}
              >
                🔒 No credit pull. Self-reported only.
              </div>
            </div>
            <button
              onClick={fillTestData}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 400,
                color: 'var(--primary)',
                border: '1px solid var(--border)',
                padding: '6px 12px',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Fill Test Data
            </button>
          </div>

          {/* Owner Identity */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--foreground)',
                marginBottom: '24px',
              }}
            >
              Owner Identity
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--muted-foreground)',
                    marginBottom: '8px',
                  }}
                >
                  FIRST NAME
                </label>
                <input
                  type="text"
                  value={formData.ownerFirstName}
                  onChange={(e) => setFormData({ ...formData, ownerFirstName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: 'var(--foreground)',
                    background: 'var(--surface-3)',
                    border: '2px solid var(--border)',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--muted-foreground)',
                    marginBottom: '8px',
                  }}
                >
                  LAST NAME
                </label>
                <input
                  type="text"
                  value={formData.ownerLastName}
                  onChange={(e) => setFormData({ ...formData, ownerLastName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: 'var(--foreground)',
                    background: 'var(--surface-3)',
                    border: '2px solid var(--border)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--muted-foreground)',
                    marginBottom: '8px',
                  }}
                >
                  CITY
                </label>
                <input
                  type="text"
                  value={formData.ownerCity}
                  onChange={(e) => setFormData({ ...formData, ownerCity: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: 'var(--foreground)',
                    background: 'var(--surface-3)',
                    border: '2px solid var(--border)',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--muted-foreground)',
                    marginBottom: '8px',
                  }}
                >
                  STATE
                </label>
                <input
                  type="text"
                  value={formData.ownerState}
                  onChange={(e) => setFormData({ ...formData, ownerState: e.target.value })}
                  placeholder="TX"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: 'var(--foreground)',
                    background: 'var(--surface-3)',
                    border: '2px solid var(--border)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 300,
                color: 'var(--muted-foreground)',
                marginTop: '6px',
              }}
            >
              Used for lender geographic matching only.
            </div>
          </div>

          {/* Personal Income */}
          <div style={{ marginBottom: '32px' }}>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--muted-foreground)',
                marginBottom: '8px',
              }}
            >
              ANNUAL PERSONAL INCOME
            </label>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 300,
                color: 'var(--muted-foreground)',
                marginBottom: '12px',
              }}
            >
              Required for Personal Credit Card qualification ($75K+ minimum).
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'Under $35K', color: 'var(--destructive)' },
                { value: '$35K - $75K', color: 'var(--warning)' },
                { value: '$75K - $125K', color: 'var(--primary)', note: 'Personal Credit Cards: Eligible' },
                { value: '$125K - $250K', color: 'var(--primary)' },
                { value: '$250K+', color: 'var(--primary)' },
              ].map((option) => (
                <motion.div
                  key={option.value}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setFormData({ ...formData, personalIncome: option.value })}
                  style={{
                    padding: '14px 16px',
                    background: formData.personalIncome === option.value ? `${option.color}15` : 'var(--surface-2)',
                    border: formData.personalIncome === option.value ? `2px solid ${option.color}` : '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--foreground)',
                    }}
                  >
                    {option.value}
                  </span>
                  {option.note && formData.personalIncome === option.value && (
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        fontWeight: 400,
                        color: option.color,
                      }}
                    >
                      {option.note}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Credit Scores */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                padding: '14px 18px',
                background: 'var(--primary-bg)',
                borderLeft: '3px solid var(--primary)',
                marginBottom: '24px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Crimson Pro',
                  fontSize: '15px',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Use your most recent scores from each bureau. If you don't know an exact score, use your best estimate - you can update these later.
              </p>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--foreground)',
                marginBottom: '24px',
              }}
            >
              Credit Scores
            </h3>

            {/* Experian */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                EXPERIAN CREDIT SCORE
              </label>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '48px',
                  fontWeight: 800,
                  color: getScoreBand(formData.experianScore).color,
                  marginBottom: '8px',
                }}
              >
                {formData.experianScore}
              </div>
              <input
                type="range"
                min="300"
                max="850"
                step="5"
                value={formData.experianScore}
                onChange={(e) => setFormData({ ...formData, experianScore: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--border)',
                  outline: 'none',
                  appearance: 'none',
                }}
              />
            </div>

            {/* TransUnion */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                TRANSUNION CREDIT SCORE
              </label>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '48px',
                  fontWeight: 800,
                  color: getScoreBand(formData.transunionScore).color,
                  marginBottom: '8px',
                }}
              >
                {formData.transunionScore}
              </div>
              <input
                type="range"
                min="300"
                max="850"
                step="5"
                value={formData.transunionScore}
                onChange={(e) => setFormData({ ...formData, transunionScore: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--border)',
                  outline: 'none',
                  appearance: 'none',
                }}
              />
            </div>

            {/* Equifax */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                EQUIFAX CREDIT SCORE
              </label>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '48px',
                  fontWeight: 800,
                  color: getScoreBand(formData.equifaxScore).color,
                  marginBottom: '8px',
                }}
              >
                {formData.equifaxScore}
              </div>
              <input
                type="range"
                min="300"
                max="850"
                step="5"
                value={formData.equifaxScore}
                onChange={(e) => setFormData({ ...formData, equifaxScore: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--border)',
                  outline: 'none',
                  appearance: 'none',
                }}
              />
            </div>

            {/* Composite Score Display */}
            <div
              style={{
                padding: '20px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                COMPOSITE SCORE USED FOR MATCHING
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '56px',
                  fontWeight: 800,
                  color: scoreBand.color,
                  lineHeight: 1,
                  marginBottom: '8px',
                }}
              >
                {middleScore}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  marginBottom: '12px',
                }}
              >
                Middle score: {middleScore} · Average: {avgScore}
              </div>
              <div
                style={{
                  fontFamily: 'Crimson Pro',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                }}
              >
                Most lenders use the middle of your three bureau scores.
              </div>
            </div>

            {/* Product Threshold Callout */}
            <div
              style={{
                padding: '12px 16px',
                background: `${thresholdMessage.color}15`,
                borderLeft: `3px solid ${thresholdMessage.color}`,
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 300,
                color: 'var(--muted-foreground)',
              }}
            >
              {thresholdMessage.text}
            </div>
          </div>

          {/* Major Derogatories */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--foreground)',
                marginBottom: '24px',
              }}
            >
              Major Derogatory Items
            </h3>

            {/* Bankruptcy */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '12px',
                }}
              >
                ACTIVE BANKRUPTCY?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                {[
                  { value: 'No', label: 'No - no bankruptcy on record', color: 'var(--primary)' },
                  { value: 'Yes', label: 'Yes - bankruptcy on record', sub: 'Timing matters - specify below', color: 'var(--destructive)' },
                ].map((option) => (
                  <motion.div
                    key={option.value}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setFormData({ ...formData, hasBankruptcy: option.value, bankruptcyTiming: option.value === 'No' ? '' : formData.bankruptcyTiming })}
                    style={{
                      padding: '16px',
                      background: formData.hasBankruptcy === option.value ? `${option.color}15` : 'var(--surface-2)',
                      border: formData.hasBankruptcy === option.value ? `2px solid ${option.color}` : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--foreground)',
                        marginBottom: '4px',
                      }}
                    >
                      {option.label}
                    </div>
                    {option.sub && (
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          fontWeight: 300,
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {option.sub}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {formData.hasBankruptcy === 'Yes' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Within last 2 years', '2-7 years ago', 'Over 7 years ago'].map((timing) => (
                      <motion.div
                        key={timing}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setFormData({ ...formData, bankruptcyTiming: timing })}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          background: formData.bankruptcyTiming === timing ? 'var(--warning-bg)' : 'var(--surface-2)',
                          border: formData.bankruptcyTiming === timing ? '2px solid var(--warning)' : '1px solid var(--border)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          fontWeight: 400,
                          color: 'var(--foreground)',
                          textAlign: 'center',
                        }}
                      >
                        {timing}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Judgments/Liens */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '12px',
                }}
              >
                JUDGMENTS OR LIENS?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { value: 'No', color: 'var(--primary)' },
                  { value: 'Yes', color: 'var(--destructive)', note: 'Must be resolved or explained' },
                ].map((option) => (
                  <motion.div
                    key={option.value}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setFormData({ ...formData, hasJudgments: option.value })}
                    style={{
                      padding: '16px',
                      background: formData.hasJudgments === option.value ? `${option.color}15` : 'var(--surface-2)',
                      border: formData.hasJudgments === option.value ? `2px solid ${option.color}` : '1px solid var(--border)',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'var(--foreground)',
                      }}
                    >
                      {option.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Credit Profile Details */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--foreground)',
                marginBottom: '24px',
              }}
            >
              Credit Profile Details
            </h3>

            {/* Credit Inquiries */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                HARD CREDIT INQUIRIES IN THE LAST 30 DAYS
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { value: '0 inquiries', color: 'var(--primary)' },
                  { value: '1-2 inquiries', color: 'var(--info)' },
                  { value: '3-4 inquiries', color: 'var(--warning)' },
                  { value: '5+ inquiries', color: 'var(--destructive)' },
                  { value: "I don't know", color: 'var(--muted-foreground)' },
                ].map((option) => (
                  <motion.div
                    key={option.value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFormData({ ...formData, creditInquiries: option.value })}
                    style={{
                      padding: '10px 16px',
                      background: formData.creditInquiries === option.value ? `${option.color}15` : 'var(--surface-2)',
                      border: formData.creditInquiries === option.value ? `2px solid ${option.color}` : '1px solid var(--border)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: 400,
                      color: 'var(--foreground)',
                    }}
                  >
                    {option.value}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* New Accounts */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                NEW CREDIT ACCOUNTS OPENED IN LAST 12 MONTHS
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['0', '1-2', '3-4', '5+', "I don't know"].map((option) => (
                  <motion.div
                    key={option}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFormData({ ...formData, newAccounts: option })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: formData.newAccounts === option ? 'var(--primary-bg)' : 'var(--surface-2)',
                      border: formData.newAccounts === option ? '2px solid var(--primary)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: 400,
                      color: 'var(--foreground)',
                      textAlign: 'center',
                    }}
                  >
                    {option}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Credit Utilization */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                PERSONAL CREDIT UTILIZATION (% OF AVAILABLE CREDIT IN USE)
              </label>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  marginBottom: '12px',
                }}
              >
                This is the #2 FICO factor. Over 30% starts hurting your score.
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '48px',
                  fontWeight: 800,
                  color: utilizationBand.color,
                  marginBottom: '4px',
                }}
              >
                {formData.creditUtilization}%
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: utilizationBand.color,
                  marginBottom: '16px',
                }}
              >
                {utilizationBand.label}
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={formData.creditUtilization}
                onChange={(e) => setFormData({ ...formData, creditUtilization: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--border)',
                  outline: 'none',
                  appearance: 'none',
                }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div style={{ marginBottom: '24px' }}>
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 300,
                color: 'var(--muted-foreground)',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              The FundScore™ assessment adds 24 precision questions that can't be captured from data alone - answers you only know yourself.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleBack}
              style={{
                flex: '0 0 auto',
                padding: '16px 24px',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--primary)',
                background: 'transparent',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleContinue}
              disabled={!isValid}
              style={{
                flex: 1,
                padding: '16px 32px',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#000',
                background: isValid ? 'var(--primary)' : 'var(--border)',
                border: 'none',
                cursor: isValid ? 'pointer' : 'not-allowed',
              }}
            >
              Continue to FundScore™ Assessment →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
