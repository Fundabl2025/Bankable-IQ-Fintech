// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Unified Assessment Results
// Complete score reveal with products, actions, and comprehensive insights
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, useSpring } from 'motion/react';
import { UnifiedAnswers, ExtendedResultsOutput } from './types';
import { computeScore, getBand, computeExtendedResults } from './engine';
import { evaluateProducts } from './productEligibility';
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

  // Evaluate products
  const products = evaluateProducts(data, result.score);
  const eligibleProducts = products.filter(p => p.qualifies);

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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* What Your Score Means - Actionable Intelligence */}
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
                  marginBottom: '24px',
                }}
              >
                What Your Score Means
              </h2>

              <div style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '15px', 
                color: 'var(--text-secondary)', 
                lineHeight: 1.8,
                marginBottom: '24px'
              }}>
                {(() => {
                  // Dynamic text based on ACTUAL product eligibility, not just score tier
                  const tier = result.score >= 900 ? 'Prime' : result.score >= 800 ? 'Ready' : result.score >= 700 ? 'Approaching' : result.score >= 600 ? 'Developing' : 'Building';
                  const tierColor = result.score >= 900 ? 'var(--success)' : result.score >= 800 ? 'var(--primary)' : 'var(--warning)';
                  const blockedCount = products.filter(p => !p.qualifies).length;
                  
                  // Calculate actual max funding from eligible products
                  const maxFunding = eligibleProducts.length > 0 
                    ? Math.max(...eligibleProducts.map(p => {
                        const amt = p.maxAmount.replace(/[$,KM+]/g, '');
                        return amt.includes('.') ? parseFloat(amt) * 1000000 : parseInt(amt) * 1000;
                      }))
                    : 0;
                  const maxFundingText = maxFunding >= 1000000 ? `$${(maxFunding/1000000).toFixed(1)}M` : maxFunding >= 1000 ? `$${Math.round(maxFunding/1000)}K` : '$0';

                  if (eligibleProducts.length === 0) {
                    return <p>Your FundScore of <strong style={{ color: tierColor }}>{result.score}</strong> places you in the <strong>{tier}</strong> tier. However, based on your current profile, you don't yet qualify for any of the 17 financing products. The "Your Path to Capital" tab shows exactly what blockers to address to unlock funding options.</p>;
                  } else if (eligibleProducts.length === 1) {
                    return <p>Your FundScore of <strong style={{ color: tierColor }}>{result.score}</strong> places you in the <strong>{tier}</strong> tier. You currently qualify for <strong style={{ color: 'var(--success)' }}>1 financing product</strong> with up to <strong>{maxFundingText}</strong> available. Address the {blockedCount} blockers below to unlock significantly more capital.</p>;
                  } else if (eligibleProducts.length <= 5) {
                    return <p>Your FundScore of <strong style={{ color: tierColor }}>{result.score}</strong> places you in the <strong>{tier}</strong> tier. You qualify for <strong style={{ color: 'var(--success)' }}>{eligibleProducts.length} financing products</strong> with up to <strong>{maxFundingText}</strong> available. A few targeted improvements could unlock {blockedCount} more options.</p>;
                  } else {
                    return <p>Your FundScore of <strong style={{ color: tierColor }}>{result.score}</strong> places you in the <strong>{tier}</strong> tier. You qualify for <strong style={{ color: 'var(--success)' }}>{eligibleProducts.length} financing products</strong> with up to <strong>{maxFundingText}</strong> available. Excellent fundability — lenders will compete for your business.</p>;
                  }
                })()}
              </div>

              {/* Eligible Products Section */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  You Qualify For:
                </h3>
                {eligibleProducts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {eligibleProducts.slice(0, 5).map((product) => (
                      <div key={product.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        background: 'var(--bg-surface-2)',
                        borderRadius: '8px',
                        border: '1px solid var(--success)',
                      }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {product.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {product.category} | Up to {product.maxAmount} | {product.speed}
                          </div>
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '4px',
                          background: product.confidence === 'High' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          color: product.confidence === 'High' ? '#10b981' : '#f59e0b',
                        }}>
                          {product.confidence} Confidence
                        </div>
                      </div>
                    ))}
                    {eligibleProducts.length > 5 && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                        +{eligibleProducts.length - 5} more products available
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    padding: '20px',
                    background: 'var(--bg-surface-2)',
                    borderRadius: '8px',
                    border: '1px solid var(--warning)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--warning)', marginBottom: '8px' }}>
                      No products available yet
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Complete the actions in "Your Path to Capital" to unlock financing options.
                    </div>
                  </div>
                )}
              </div>

              {/* What's Blocking You Section */}
              {products.filter(p => !p.qualifies).length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                    What's Blocking Other Products:
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {products.filter(p => !p.qualifies).slice(0, 3).map((product) => (
                      <div key={product.id} style={{
                        padding: '12px 16px',
                        background: 'var(--bg-surface-2)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                              {product.name}
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {product.blockers.slice(0, 2).join(' | ')}
                            </div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                            Up to {product.maxAmount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                    Fix these blockers to unlock {products.filter(p => !p.qualifies).length} more financing options.
                  </div>
                </div>
              )}

              {/* CTA to Path to Capital */}
              <div style={{ 
                marginTop: '24px', 
                padding: '20px', 
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.1) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(16,185,129,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Ready to unlock more capital?
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    See your personalized 30/90/180-day funding projections and exactly which actions to take.
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('capital')}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 600,
                    padding: '12px 24px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  View Path to Capital
                </button>
              </div>
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
