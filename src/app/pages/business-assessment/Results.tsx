// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Unified Assessment Results
// Complete score reveal with products, actions, and comprehensive insights
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, useSpring } from 'motion/react';
import { ArrowRight, CheckCircle2, AlertCircle, TrendingUp, FileText, Zap, Building, CreditCard, Package, AlertTriangle, DollarSign } from 'lucide-react';
import { UnifiedAnswers, DIMENSION_INFO, ExtendedResultsOutput } from './types';
import { computeScore, getBand, computeExtendedResults } from './engine';
import { evaluateProducts, Product } from './productEligibility';
import { generateActionPlan, Action } from './actionPlan';
import { getAllAuditItems, AuditItem } from '../../utils/businessData';
import { EstimatedFunding } from '../StatusReports/EstimatedFunding';

export function Results() {
  const navigate = useNavigate();
  const [data, setData] = useState<UnifiedAnswers | null>(null);
  const [result, setResult] = useState<ReturnType<typeof computeScore> | null>(null);
  const [extendedResults, setExtendedResults] = useState<ExtendedResultsOutput | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'capital'>('overview');

  // Animated score counter
  const springScore = useSpring(0, { stiffness: 40, damping: 12 });
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Load assessment data
    const saved = localStorage.getItem('unified_assessment');
    if (!saved) {
      navigate('/business-assessment');
      return;
    }

    try {
      const assessmentData = JSON.parse(saved);
      setData(assessmentData);

      // Calculate final score
      const scoreResult = computeScore(assessmentData);
      setResult(scoreResult);

      // Compute extended results for reports
      const extended = computeExtendedResults(assessmentData);
      setExtendedResults(extended);

      // Animate score counter
      springScore.set(scoreResult.score);
    } catch (error) {
      console.error('Error loading assessment:', error);
      navigate('/business-assessment');
    }
  }, [navigate]);

  // Update display score from spring
  useEffect(() => {
    const unsubscribe = springScore.on('change', (latest) => {
      setDisplayScore(Math.round(latest));
    });
    return unsubscribe;
  }, [springScore]);

  if (!result || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-primary)' }}>Loading results...</div>
      </div>
    );
  }

  const band = getBand(result.score);

  // Evaluate products and actions
  const products = evaluateProducts(data, result.score);
  const actions = generateActionPlan(data, result.score);

  // Filter to eligible products only
  const eligibleProducts = products.filter(p => p.qualifies);
  const topActions = actions.slice(0, 5);

  // Get compliance items
  const auditItems = getAllAuditItems();
  const incompleteItems = auditItems.filter(item => item.status === 'incomplete');
  const criticalItems = incompleteItems.filter(item => item.priority === 'critical').slice(0, 5);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            marginBottom: '64px',
            padding: '60px 0',
            background: 'var(--bg-surface-1)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
              marginBottom: '24px',
            }}
          >
            Your FundScore™
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '120px',
              fontWeight: 800,
              color: getBand(displayScore).color,
              lineHeight: 1,
              marginBottom: '16px',
            }}
          >
            {displayScore}
          </motion.div>

          {/* Band */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 600,
              color: band.color,
              marginBottom: '32px',
            }}
          >
            {band.name}
          </motion.div>

          {/* Bankable Score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{
              display: 'flex',
              gap: '32px',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              background: 'var(--bg-surface-2)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              marginTop: '24px',
            }}
          >
            <div style={{ maxWidth: '600px', textAlign: 'left' }}>
              <div style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '13px', 
                color: 'var(--text-secondary)', 
                lineHeight: 1.6,
                marginBottom: '12px'
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>What Your FundScore™ Means:</strong>
              </div>
              <div style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '13px', 
                color: 'var(--text-secondary)', 
                lineHeight: 1.6 
              }}>
                Your FundScore™ is a comprehensive 0-1000 rating that measures your business's fundability across six critical dimensions. 
                A higher score means you qualify for more financing options, better terms, and faster approvals. 
                Think of it like a FICO score, but specifically for business financing access.
              </div>
              <div style={{ 
                display: 'flex', 
                gap: '24px', 
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Bankable Score
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: 'var(--primary)' }}>
                    {result.bankableScore}/160
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Measures SBA readiness
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Products Eligible
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: 'var(--success)' }}>
                    {eligibleProducts.length}/17
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Financing options available
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Business FICO (SBSS)
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: 'var(--primary)' }}>
                    {extendedResults?.sbssScore || 0}/300
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Business creditworthiness
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            borderBottom: '1px solid var(--border)',
            marginBottom: '40px',
            paddingBottom: '16px',
          }}
        >
          {[
            { id: 'overview', label: 'Your FundScore' },
            { id: 'capital', label: 'Your Path to Capital' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 500 : 400,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '0',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                position: 'relative',
                bottom: '-17px',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Dimension Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              style={{
                background: 'var(--bg-surface-1)',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                padding: '40px',
                marginBottom: '32px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '32px',
                }}
              >
                Dimension Breakdown
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(DIMENSION_INFO).map(([key, info], index) => {
                  const percentage = Math.round((result.dimAvg[key as keyof typeof result.dimAvg] || 0) * 100);
                  
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + index * 0.08 }}
                    >
                      {/* Dimension name and percentage */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '14px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {info.name}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '11px',
                              fontWeight: 400,
                              color: 'var(--text-muted)',
                            }}
                          >
                            {Math.round(info.weight * 100)}% weight
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: info.color,
                          }}
                        >
                          {percentage}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div
                        style={{
                          height: '8px',
                          background: 'var(--bg-surface-3)',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 1.2 + index * 0.08 + 0.1, duration: 0.6, ease: 'easeOut' }}
                          style={{
                            height: '100%',
                            background: info.color,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Critical Compliance Items */}
            {criticalItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                style={{
                  background: 'var(--bg-surface-1)',
                  borderRadius: '16px',
                  border: '2px solid var(--warning)',
                  padding: '40px',
                  marginBottom: '32px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <AlertTriangle
                    style={{
                      width: '28px',
                      height: '28px',
                      color: 'var(--warning)',
                    }}
                  />
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '24px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    Critical Compliance Items
                  </h2>
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '32px',
                    lineHeight: 1.6,
                  }}
                >
                  These items must be completed to maximize your fundability and access to financing products. Each item contributes to your overall business credit profile.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {criticalItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 + index * 0.08 }}
                      style={{
                        background: 'var(--bg-surface-2)',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <AlertCircle
                          style={{
                            width: '20px',
                            height: '20px',
                            color: 'var(--warning)',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '15px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              marginBottom: '6px',
                            }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '13px',
                              fontWeight: 400,
                              color: 'var(--text-secondary)',
                              marginBottom: '10px',
                              lineHeight: 1.5,
                            }}
                          >
                            {item.description}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <div
                              style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '11px',
                                fontWeight: 500,
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              Category: {item.category}
                            </div>
                            <div
                              style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--primary)',
                                background: 'var(--primary-alpha)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                              }}
                            >
                              +{item.ficoImpact} FICO Impact
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: '24px',
                    padding: '16px',
                    background: 'var(--bg-surface-2)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: 'var(--text-primary)' }}>Total Incomplete Items:</strong> {incompleteItems.length} of {auditItems.length} • 
                    <strong style={{ color: 'var(--text-primary)' }}> Potential FICO Gain:</strong> {criticalItems.reduce((sum, item) => sum + item.ficoImpact, 0)} points
                  </div>
                </div>
              </motion.div>
            )}

            {/* Pre-Approved Funding Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              style={{
                background: 'var(--bg-surface-1)',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                padding: '40px',
                marginBottom: '32px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <DollarSign
                  style={{
                    width: '28px',
                    height: '28px',
                    color: 'var(--success)',
                  }}
                />
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}
                >
                  Pre-Approved Funding Options
                </h2>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginBottom: '32px',
                  lineHeight: 1.6,
                }}
              >
                Based on your FundScore™ of <strong style={{ color: 'var(--primary)' }}>{result.score}/1000</strong>, you qualify for <strong style={{ color: 'var(--success)' }}>{eligibleProducts.length} of 17</strong> financing products. 
                Below is your complete funding landscape—products you're eligible for now, plus those you can unlock by improving specific areas.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {products.map((product, index) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 + index * 0.05 }}
                    style={{
                      background: product.qualifies ? 'var(--bg-surface-2)' : 'var(--bg-surface-3)',
                      borderRadius: '12px',
                      padding: '24px',
                      border: product.qualifies ? '2px solid var(--success)' : '1px solid var(--border-subtle)',
                      opacity: product.qualifies ? 1 : 0.7,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle2
                          style={{
                            width: '24px',
                            height: '24px',
                            color: 'var(--success)',
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '16px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              marginBottom: '4px',
                            }}
                          >
                            {product.name}
                          </div>
                          <div
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '11px',
                              fontWeight: 500,
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {product.category} Financing
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          background: product.confidence === 'High' ? 'var(--success-alpha)' : product.confidence === 'Medium' ? 'var(--warning-alpha)' : 'var(--bg-surface-3)',
                          color: product.confidence === 'High' ? 'var(--success)' : product.confidence === 'Medium' ? 'var(--warning)' : 'var(--text-muted)',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {product.confidence} Confidence
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: 'var(--text-secondary)',
                        marginBottom: '16px',
                        lineHeight: 1.5,
                      }}
                    >
                      {product.description}
                    </div>

                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            fontWeight: 400,
                            color: 'var(--text-muted)',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Max Amount
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: 'var(--primary)',
                          }}
                        >
                          {product.maxAmount}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            fontWeight: 400,
                            color: 'var(--text-muted)',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Funding Speed
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {product.speed}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            fontWeight: 400,
                            color: 'var(--text-muted)',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Min Score Required
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {product.minScore}/1000
                        </div>
                      </div>
                    </div>

                    {product.boosts.length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: 'var(--success)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          ✓ Strengths
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {product.boosts.map((boost, i) => (
                            <div
                              key={i}
                              style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              • {boost}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.blockers.length > 0 && !product.qualifies && (
                      <div style={{ marginTop: '16px' }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: 'var(--warning)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          ⚠ Requirements Needed
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {product.blockers.map((blocker, i) => (
                            <div
                              key={i}
                              style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              • {blocker}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {eligibleProducts.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: 'var(--bg-surface-2)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <AlertCircle
                    style={{
                      width: '48px',
                      height: '48px',
                      color: 'var(--text-muted)',
                      margin: '0 auto 16px',
                    }}
                  />
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}
                  >
                    No Pre-Approved Products Yet
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    Complete the critical compliance items above to unlock funding opportunities.
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              style={{
                background: 'var(--bg-surface-1)',
                borderRadius: '16px',
                border: '1px solid var(--border-subtle)',
                padding: '40px',
                marginBottom: '32px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '32px',
                }}
              >
                Action Plan
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {topActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.8 + index * 0.08 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CheckCircle2
                        style={{
                          width: '24px',
                          height: '24px',
                          color: 'var(--success)',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {action.title}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        fontWeight: 400,
                        color: 'var(--text-muted)',
                        marginTop: '8px',
                      }}
                    >
                      {action.description}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0 }}
              style={{ textAlign: 'center' }}
            >
              <button
                onClick={() => navigate('/capital-dashboard')}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '16px',
                  fontWeight: 600,
                  padding: '16px 48px',
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'var(--bg-base)',
                  cursor: 'pointer',
                }}
              >
                View Your Dashboard →
              </button>
            </motion.div>
          </>
        )}

        {activeTab === 'capital' && (
          <EstimatedFunding data={extendedResults!} />
        )}
      </div>
    </div>
  );
}

export default Results;
