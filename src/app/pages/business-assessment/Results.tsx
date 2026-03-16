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
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

// ════════════════════════════════════════════════════════════════════════════════
// Helper Functions for Dynamic Data Mapping
// ════════════════════════════════════════════════════════════════════════════════

function mapCreditScore(category: string): string {
  if (category === 'exceptional') return '820';
  if (category === 'very_good') return '770';
  if (category === 'good') return '700';
  if (category === 'fair') return '620';
  if (category === 'poor') return '550';
  if (category === 'unknown') return 'Not provided';
  return 'Not provided';
}

function mapUtilization(category: string): string {
  if (category === 'under_10') return 'Under 10%';
  if (category === '10_30') return '10% - 30%';
  if (category === '30_50') return '30% - 50%';
  if (category === '50_75') return '50% - 75%';
  if (category === 'over_75') return 'Over 75%';
  return 'Not provided';
}

function mapRevenue(category: string): string {
  if (category === 'under_5k') return 'Under $5K/mo';
  if (category === '5k_15k') return '$5K-$15K/mo';
  if (category === '15k_40k') return '$15K-$40K/mo';
  if (category === '40k_100k') return '$40K-$100K/mo';
  if (category === 'over_100k') return 'Over $100K/mo';
  return 'Not provided';
}

function mapInquiries(category: string): string {
  if (category === '0') return '0';
  if (category === '1_2') return '1-2';
  if (category === '3_4') return '3-4';
  if (category === '5plus') return '5+';
  return 'Not provided';
}

// ════════════════════════════════════════════════════════════════════════════════
// Status Badge System - Per Elon's vision
// Maps FundScore + Bankable Score to clear status progression
// ════════════════════════════════════════════════════════════════════════════════

interface StatusInfo {
  status: 'Unprepared' | 'Fundable' | 'Progressing' | 'Bankable' | 'Elite';
  bankableScore: number;
  bankableThreshold: number;
  pointsToBankable: number;
  statusColor: string;
  statusBgColor: string;
  capitalTier: string;
}

function computeStatus(extendedResults: ExtendedResultsOutput): StatusInfo {
  const bankableScore = extendedResults.sbssScore || 0;
  const bankableThreshold = 160;
  const pointsToBankable = Math.max(0, bankableThreshold - bankableScore);

  let status: 'Unprepared' | 'Fundable' | 'Progressing' | 'Bankable' | 'Elite';
  let statusColor: string;
  let statusBgColor: string;
  let capitalTier: string;

  if (bankableScore < 80) {
    status = 'Unprepared';
    statusColor = '#ef4444';
    statusBgColor = 'rgba(239,68,68,0.1)';
    capitalTier = 'Tier 0 - Preparing Foundation';
  } else if (bankableScore < 160) {
    status = 'Fundable';
    statusColor = '#f97316';
    statusBgColor = 'rgba(249,115,22,0.1)';
    capitalTier = 'Tier 1 - Alternative Capital';
  } else if (bankableScore < 190) {
    status = 'Progressing';
    statusColor = '#eab308';
    statusBgColor = 'rgba(234,179,8,0.1)';
    capitalTier = 'Tier 2 - Growing Bankability';
  } else if (bankableScore < 210) {
    status = 'Bankable';
    statusColor = '#10b981';
    statusBgColor = 'rgba(16,185,129,0.1)';
    capitalTier = 'Tier 3 - Bank Capital Eligible';
  } else {
    status = 'Elite';
    statusColor = '#8b5cf6';
    statusBgColor = 'rgba(139,92,246,0.1)';
    capitalTier = 'Tier 4 - Elite Borrower';
  }

  return {
    status,
    bankableScore,
    bankableThreshold,
    pointsToBankable,
    statusColor,
    statusBgColor,
    capitalTier,
  };
}

export function Results() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<UnifiedAnswers | null>(null);
  const [result, setResult] = useState<ReturnType<typeof computeScore> | null>(null);
  const [extendedResults, setExtendedResults] = useState<ExtendedResultsOutput | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'capital'>('overview');

  // Animated score counter
  const springScore = useSpring(0, { stiffness: 40, damping: 12 });
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Load assessment data from localStorage
    const saved = localStorage.getItem('unified_assessment');
    if (!saved || !saved.trim()) {
      navigate('/business-assessment?message=Please complete the assessment first to see your results');
      return;
    }

    try {
      const assessmentData = JSON.parse(saved);
      
      // Verify data is not empty
      if (!assessmentData || Object.keys(assessmentData).length === 0) {
        navigate('/business-assessment?message=Please complete the assessment first to see your results');
        return;
      }

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
      navigate('/business-assessment?message=Error loading assessment data');
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

  // Get audit items for blockers
  const auditItems = getAllAuditItems();
  const incompleteItems = auditItems.filter(item => item.status === 'incomplete');
  const topBlockers = incompleteItems.filter(item => item.priority === 'critical' || item.priority === 'high').slice(0, 3);

  // Get business owner info from assessment
  const ownerName = data.ownerFirstName || data.ownerLastName 
    ? `${data.ownerFirstName || ''} ${data.ownerLastName || ''}`.trim()
    : 'Business Owner';
  
  const businessName = data.businessName || 'Your Business';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: SCORE HERO */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
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

          {/* Status Badge Section - Per Elon's vision */}
          {extendedResults && (() => {
            const statusInfo = computeStatus(extendedResults);
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '32px',
                  maxWidth: '500px',
                  margin: '0 auto 32px auto',
                }}
              >
                {/* Status Badge */}
                <div
                  style={{
                    padding: '16px',
                    background: statusInfo.statusBgColor,
                    borderRadius: '8px',
                    border: `2px solid ${statusInfo.statusColor}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                    Status
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: statusInfo.statusColor }}>
                    {statusInfo.status}
                  </div>
                </div>

                {/* Capital Tier */}
                <div
                  style={{
                    padding: '16px',
                    background: 'var(--bg-surface-2)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                    Capital Access
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {statusInfo.capitalTier}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Bankable Score Progress */}
          {extendedResults && (() => {
            const statusInfo = computeStatus(extendedResults);
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{
                  padding: '16px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '24px',
                  maxWidth: '600px',
                  margin: '0 auto 24px auto',
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Bankable Score
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: statusInfo.bankableScore >= statusInfo.bankableThreshold ? 'var(--success)' : 'var(--warning)' }}>
                      {statusInfo.bankableScore} / {statusInfo.bankableThreshold}
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--bg-surface-1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        width: `${Math.min(100, (statusInfo.bankableScore / statusInfo.bankableThreshold) * 100)}%`,
                        height: '100%',
                        background: statusInfo.bankableScore >= statusInfo.bankableThreshold ? 'var(--success)' : 'var(--primary)',
                        transition: 'width 0.6s ease-out',
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {statusInfo.pointsToBankable === 0 
                    ? '✓ Bankable threshold reached!'
                    : `${statusInfo.pointsToBankable} points to Bankable`
                  }
                </div>
              </motion.div>
            );
          })()}

          {/* Key Metrics */}
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
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Bankable Score
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: 'var(--primary)' }}>
                {result.bankableScore}/160
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Products Eligible
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: 'var(--success)' }}>
                {eligibleProducts.length}/17
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Business FICO (SBSS)
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: 'var(--primary)' }}>
                {extendedResults?.sbssScore || 0}/300
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: WHAT THIS MEANS */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
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
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '24px',
          }}>
            What This Means
          </h2>

          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
          }}>
            {(() => {
              const tier = result.score >= 900 ? 'Prime' : result.score >= 800 ? 'Ready' : result.score >= 700 ? 'Approaching' : result.score >= 600 ? 'Developing' : 'Building';
              const tierColor = result.score >= 900 ? 'var(--success)' : result.score >= 800 ? 'var(--primary)' : 'var(--warning)';
              const blockedCount = products.filter(p => !p.qualifies).length;
              
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
                return <p>Your FundScore of <strong style={{ color: tierColor }}>{result.score}</strong> places you in the <strong>{tier}</strong> tier. You currently qualify for <strong style={{ color: 'var(--success)' }}>1 financing product</strong> with up to <strong>{maxFundingText}</strong> available. Address the {blockedCount} blockers to unlock significantly more capital.</p>;
              } else if (eligibleProducts.length <= 5) {
                return <p>Your FundScore of <strong style={{ color: tierColor }}>{result.score}</strong> places you in the <strong>{tier}</strong> tier. You qualify for <strong style={{ color: 'var(--success)' }}>{eligibleProducts.length} financing products</strong> with up to <strong>{maxFundingText}</strong> available. A few targeted improvements could unlock {blockedCount} more options.</p>;
              } else {
                return <p>Your FundScore of <strong style={{ color: tierColor }}>{result.score}</strong> places you in the <strong>{tier}</strong> tier. You qualify for <strong style={{ color: 'var(--success)' }}>{eligibleProducts.length} financing products</strong> with up to <strong>{maxFundingText}</strong> available. Excellent fundability — lenders will compete for your business.</p>;
              }
            })()}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 3: TOP BLOCKERS */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {topBlockers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            style={{
              background: 'var(--bg-surface-1)',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              padding: '40px',
              marginBottom: '32px',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '24px',
            }}>
              Top Blockers
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topBlockers.map((blocker, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: `4px solid ${blocker.priority === 'critical' ? '#ef4444' : '#f97316'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '4px',
                      }}>
                        {blocker.title}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        marginBottom: '8px',
                      }}>
                        {blocker.description}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                      }}>
                        Fix time: ~{blocker.priority === 'critical' ? '7 days' : blocker.priority === 'high' ? '14 days' : '21 days'}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 10px',
                      background: blocker.priority === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)',
                      color: blocker.priority === 'critical' ? '#ef4444' : '#f97316',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>
                      {blocker.priority === 'critical' ? 'Critical' : 'High'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 4: PRODUCTS AVAILABLE NOW */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          style={{
            background: 'var(--bg-surface-1)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '40px',
            marginBottom: '32px',
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '24px',
          }}>
            Products Available Now
          </h2>

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
                      Up to {product.maxAmount} • {product.speed}
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
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '12px' }}>
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
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 5: CAPITAL PATH */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          style={{
            marginBottom: '32px',
          }}
        >
          <button
            onClick={() => setActiveTab('capital')}
            style={{
              width: '100%',
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(16,185,129,0.3)',
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            View Your Capital Path (30/60/90/180 Days)
            <ArrowRight size={20} />
          </button>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'capital' && (
          <EstimatedFunding data={extendedResults!} />
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 6: BUSINESS OWNER STATUS */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          style={{
            background: 'var(--bg-surface-1)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            padding: '40px',
            marginBottom: '32px',
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '24px',
          }}>
            Business Owner Status
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Owner Name
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {ownerName}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Business Name
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {businessName}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Monthly Revenue
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {mapRevenue(data.monthlyRevenue)}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Credit Utilization
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {mapUtilization(data.utilization)}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Experian Score
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {mapCreditScore(data.experian)}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                TransUnion Score
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {mapCreditScore(data.transunion)}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Equifax Score
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {mapCreditScore(data.equifax)}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                30-Day Inquiries
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {mapInquiries(data.inquiries30d)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* SECTION 7: CONVERSION CTA (Only for non-logged-in users) */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2 }}
            style={{
              padding: '48px 32px',
              background: '#131510',
              border: '2px solid #8ab820',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 800,
              color: '#e4e8d8',
              marginBottom: '16px',
            }}>
              Save Your FundScore & Get Your Full Roadmap
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: '#b0b3a3',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px',
            }}>
              Create a free account to save your results, track your progress, and unlock your complete 30 to 180 day bankability roadmap with personalized action steps.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '14px 32px',
                  background: '#8ab820',
                  color: '#131510',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#9bc832'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#8ab820'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Save My Results <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '14px 32px',
                  background: 'transparent',
                  color: '#8ab820',
                  border: '1px solid #8ab820',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(138, 184, 32, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Sign In
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Results;

export function Results() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

          {/* Status Badge Section - Per Elon's vision */}
          {extendedResults && (() => {
            const statusInfo = computeStatus(extendedResults);
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '32px',
                  maxWidth: '500px',
                  margin: '0 auto 32px auto',
                }}
              >
                {/* Status Badge */}
                <div
                  style={{
                    padding: '16px',
                    background: statusInfo.statusBgColor,
                    borderRadius: '8px',
                    border: `2px solid ${statusInfo.statusColor}`,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                    Status
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: statusInfo.statusColor }}>
                    {statusInfo.status}
                  </div>
                </div>

                {/* Capital Tier */}
                <div
                  style={{
                    padding: '16px',
                    background: 'var(--bg-surface-2)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                    Capital Access
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {statusInfo.capitalTier}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Bankable Score Progress - Distance to Bankable */}
          {extendedResults && (() => {
            const statusInfo = computeStatus(extendedResults);
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{
                  padding: '16px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '24px',
                  maxWidth: '600px',
                  margin: '0 auto 24px auto',
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Bankable Score
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: statusInfo.bankableScore >= statusInfo.bankableThreshold ? 'var(--success)' : 'var(--warning)' }}>
                      {statusInfo.bankableScore} / {statusInfo.bankableThreshold}
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--bg-surface-1)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        width: `${Math.min(100, (statusInfo.bankableScore / statusInfo.bankableThreshold) * 100)}%`,
                        height: '100%',
                        background: statusInfo.bankableScore >= statusInfo.bankableThreshold ? 'var(--success)' : 'var(--primary)',
                        transition: 'width 0.6s ease-out',
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {statusInfo.pointsToBankable === 0 
                    ? '✓ Bankable threshold reached!'
                    : `${statusInfo.pointsToBankable} points to Bankable`
                  }
                </div>
              </motion.div>
            );
          })()}

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
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '16px',
              padding: '12px 14px',
              background: 'rgba(59,130,246,0.08)',
              borderRadius: '6px',
              border: '1px solid rgba(59,130,246,0.2)',
              display: 'none' // Hide the old description
            }}>
              Your FundScore determines how much capital you can access and at what terms. 
              The "Your Path to Capital" tab shows exactly what actions will unlock more funding — 
              entrepreneurs who follow the roadmap typically increase their eligible funding by 3-5x within 90 days.
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '16px',
              padding: '14px 16px',
              background: 'rgba(59,130,246,0.08)',
              borderRadius: '6px',
              border: '1px solid rgba(59,130,246,0.2)'
            }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Why This Information Matters</strong>
              Most entrepreneurs apply for funding blind—lenders know their underwriting thresholds, you don't. This creates massive information asymmetry in capital markets. Your FundScore reveals what lenders see. The "Your Path to Capital" tab translates that into a clear economic incentive: entrepreneurs who follow the roadmap typically unlock 3-5x more capital within 90 days.
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
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Products You Qualify For Today
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Based on your complete profile (credit, revenue, business age, etc.)
                </p>
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
                            {product.category} {product.category === 'Credit' && product.name === 'Personal Guarantee Line' ? '(Personal Guarantee)' : '(Business Financing)'} | Up to {product.maxAmount} | {product.speed}
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

        {/* Conversion CTA - Show only for non-logged-in users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              marginTop: '60px',
              padding: '48px 32px',
              background: '#131510',
              border: '2px solid #8ab820',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 800,
              color: '#e4e8d8',
              marginBottom: '16px',
            }}>
              Save Your FundScore & Get Your Full Roadmap
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              color: '#b0b3a3',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px',
            }}>
              Create a free account to save your results, track your progress, and unlock your complete 30 to 180 day bankability roadmap with personalized action steps.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => navigate('/signup')}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '14px 32px',
                  background: '#8ab820',
                  color: '#131510',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#9bc832'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#8ab820'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Save My Results <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '14px 32px',
                  background: 'transparent',
                  color: '#8ab820',
                  border: '1px solid #8ab820',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(138, 184, 32, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                Sign In
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Results;
