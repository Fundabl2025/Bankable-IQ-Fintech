import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ProgressRing } from '../components/ui/progress-ring';
import { motion } from 'motion/react';
import { Shield, TrendingUp, LineChart, CreditCard, Briefcase, Building, DollarSign, Target, CheckCircle, ArrowRight, AlertCircle, Clock, Zap, Award, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { 
  getBusinessProfile, 
  calculateNAPScore, 
  getOverallProgress, 
  getCategoryProgress,
  getAllAuditItems 
} from '../utils/businessData';
import { getPreQualifiedPrograms, getTotalPreQualifiedAmount } from '../utils/fundingEligibility';
import { getDataItem } from '../lib/data-adapter';

export function Dashboard() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [fundScore, setFundScore] = useState(0);
  const [scoreBand, setScoreBand] = useState({ name: 'Take Assessment to See Your Score', color: '#64748b' });

  // Listen for updates from other modules
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    handleUpdate(); // Initial load
    
    window.addEventListener('scanDataUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('fundscoreUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('scanDataUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('fundscoreUpdated', handleUpdate);
    };
  }, []);

  // Load FundScore using data adapter (works with localStorage or Supabase)
  useEffect(() => {
    const loadFundScore = async () => {
      try {
        const stored = await getDataItem('fundscore_result');
        if (stored) {
          const result = JSON.parse(stored);
          setFundScore(result.score || 0);
          setScoreBand(result.band || { name: 'Take Assessment to See Your Score', color: '#64748b' });
        }
      } catch (error) {
        console.error('Error reading FundScore:', error);
      }
    };

    loadFundScore();
  }, [refreshKey]);
  
  // Pull REAL data from unified system (re-runs when refreshKey changes)
  const businessProfile = getBusinessProfile();
  const napScore = calculateNAPScore();
  const overallProgress = getOverallProgress();
  
  // Get funding data
  const preQualifiedPrograms = getPreQualifiedPrograms();
  const preQualifiedCount = preQualifiedPrograms.length;
  const totalPreQualifiedAmount = getTotalPreQualifiedAmount();
  
  // Category progress for dimension bars
  const lenderComplianceProgress = getCategoryProgress('lender-compliance');
  const buildingCreditProgress = Math.round((businessProfile.tradelineCount / 15) * 100);
  const optimizeReportingProgress = 0;
  const onlineAnalysisProgress = napScore;
  const organizeFinancialsProgress = 0;
  const becomeBankableProgress = 0;

  // Funding status counts
  const unlockedCount = preQualifiedCount;
  const approachingCount = 0; // Would calculate from programs close to qualifying
  const lockedCount = 17 - unlockedCount - approachingCount;

  // Top 3 priority actions (items with lowest completion)
  const allDimensions = [
    { name: 'Lender Compliance', percentage: lenderComplianceProgress.percentage, path: '/lender-compliance', points: 40, timeEst: '2-3 weeks', color: '#8ab820' },
    { name: 'Building Credit', percentage: buildingCreditProgress, path: '/building-credit', points: 35, timeEst: '4-6 weeks', color: '#8858c8' },
    { name: 'Online Analysis', percentage: onlineAnalysisProgress, path: '/online-analysis', points: 25, timeEst: '1-2 weeks', color: '#3878c8' },
    { name: 'Optimize Reporting', percentage: optimizeReportingProgress, path: '/optimize-reporting', points: 20, timeEst: '2 weeks', color: '#c89020' },
    { name: 'Organize Financials', percentage: organizeFinancialsProgress, path: '/organize-financials', points: 15, timeEst: '1 week', color: '#38a880' },
    { name: 'Become Bankable', percentage: becomeBankableProgress, path: '/become-bankable', points: 25, timeEst: '8-12 weeks', color: '#8ab820' },
  ];

  const priorityActions = allDimensions
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
      why: idx === 0 ? 'Foundational requirement for credit building' : 
           idx === 1 ? 'Critical for unlocking more funding' :
           'Improves NAP score and lender perception'
    }));

  // Compliance progress (20-item system)
  const complianceItems = getAllAuditItems().filter(item => item.category === 'lender-compliance');
  const complianceCompleted = complianceItems.filter(item => item.status === 'complete').length;

  // Calculate days active (mock)
  const daysActive = 12;

  // Calculate items completed across all categories
  const allItems = getAllAuditItems();
  const totalCompleted = allItems.filter(item => item.status === 'complete').length;

  return (
    <div 
      className="flex-1 min-h-screen overflow-auto"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 
            style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 800,
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--foreground)'
            }}
          >
            FundReady™ Dashboard
          </h1>
          <p 
            className="mt-2"
            style={{ 
              fontFamily: 'var(--font-serif)', 
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: '18px',
              lineHeight: 1.8,
              color: 'var(--muted-foreground)'
            }}
          >
            Your complete funding readiness command center
          </p>
        </motion.div>

        {/* FUNDSCORE ASSESSMENT CTA BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 border rounded-sm p-6 relative overflow-hidden cursor-pointer hover:border-[var(--primary)]"
          onClick={() => navigate('/fundscore-assessment')}
          style={{
            backgroundColor: 'var(--primary-bg)',
            borderColor: 'var(--border)',
            borderLeft: '3px solid var(--primary)',
            transition: 'border-color 200ms ease'
          }}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Zap 
                  style={{ 
                    color: 'var(--primary)',
                    width: '20px',
                    height: '20px'
                  }} 
                />
                <h3 
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700,
                    fontSize: '20px',
                    color: 'var(--foreground)'
                  }}
                >
                  Take Your FundScore™ Assessment
                </h3>
              </div>
              <p 
                style={{ 
                  fontFamily: 'var(--font-serif)', 
                  fontStyle: 'italic',
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--muted-foreground)',
                  marginBottom: '12px'
                }}
              >
                Get your complete funding readiness score in 6–9 minutes. 24 questions. Zero credit pull. See exactly which lenders you pre-qualify for right now.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div 
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle style={{ width: '14px', height: '14px' }} />
                  No bank login required
                </div>
                <div 
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Clock style={{ width: '14px', height: '14px' }} />
                  Results in under 10 minutes
                </div>
                <div 
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Award style={{ width: '14px', height: '14px' }} />
                  Personalized action plan included
                </div>
              </div>
            </div>
            <div>
              <Button
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  backgroundColor: 'var(--primary)',
                  color: '#000',
                  padding: '12px 24px',
                  borderRadius: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                Start Assessment →
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 2-COLUMN LAYOUT: Left 38% | Right 62% */}
        <div className="grid grid-cols-1 lg:grid-cols-[38%_1fr] gap-8">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN — Score + Compliance Status                                  */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            
            {/* SCORE CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border rounded-sm p-8"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              {/* Score Number */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h2 
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 800,
                      fontSize: 'clamp(64px, 8vw, 96px)',
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                      color: scoreBand.color
                    }}
                  >
                    {fundScore}
                  </h2>
                  <p 
                    className="mt-3"
                    style={{ 
                      fontFamily: 'var(--font-serif)', 
                      fontWeight: 300,
                      fontStyle: 'italic',
                      fontSize: '18px',
                      lineHeight: 1.8,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    {scoreBand.name}
                  </p>
                </motion.div>
              </div>

              {/* Score Meter (0-1000 scale) */}
              <div className="mb-6">
                <div 
                  className="h-2 rounded-none overflow-hidden"
                  style={{ backgroundColor: 'var(--border)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((fundScore / 1000) * 100, 100)}%` }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full"
                    style={{
                      background: `linear-gradient(90deg, ${scoreBand.color}, var(--primary))`
                    }}
                  />
                </div>
                <p 
                  className="text-right mt-1 text-xs"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Last updated {daysActive} days ago · 
                  <button 
                    onClick={() => navigate('/business-success-scan')}
                    className="ml-1 hover:underline"
                    style={{ color: 'var(--primary)' }}
                  >
                    Take new assessment →
                  </button>
                </p>
              </div>

              {/* 6 DIMENSION BARS */}
              <div className="space-y-3 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
                {allDimensions.map((dimension, index) => (
                  <motion.div
                    key={dimension.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + (index * 0.08) }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="uppercase text-[10px] tracking-[0.12em]"
                        style={{ 
                          fontFamily: 'var(--font-body)', 
                          fontWeight: 400,
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        {dimension.name}
                      </span>
                      <span 
                        className="text-sm"
                        style={{ 
                          fontFamily: 'var(--font-display)', 
                          fontWeight: 700,
                          color: dimension.percentage >= 70 ? 'var(--success)' : 
                                 dimension.percentage >= 45 ? 'var(--warning)' : 
                                 'var(--destructive)'
                        }}
                      >
                        {dimension.percentage}%
                      </span>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, delay: 0.5 + (index * 0.08), ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div 
                        className="h-1.5 rounded-none overflow-hidden"
                        style={{ backgroundColor: 'var(--border)' }}
                      >
                        <div 
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: `${dimension.percentage}%`,
                            backgroundColor: dimension.percentage >= 70 ? 'var(--success)' : 
                                            dimension.percentage >= 45 ? 'var(--warning)' : 
                                            'var(--destructive)'
                          }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* COMPLIANCE CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="border rounded-sm p-6 cursor-pointer transition-colors hover:border-[var(--border-medium)]"
              onClick={() => navigate('/lender-compliance')}
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 700,
                      fontSize: '20px',
                      letterSpacing: '0.01em',
                      color: 'var(--foreground)'
                    }}
                  >
                    Lender Compliance
                  </h3>
                  <p 
                    className="mt-1"
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 700,
                      fontSize: '14px',
                      color: 'var(--primary)'
                    }}
                  >
                    {complianceCompleted} OF 20 COMPLETE
                  </p>
                </div>
                <ArrowRight className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
              </div>

              {/* 20-DOT GRID (4x5 layout) */}
              <div className="grid grid-cols-10 gap-2 mb-4">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const isCompleted = idx < complianceCompleted;
                  const isQuickWin = !isCompleted && idx < complianceCompleted + 5;
                  const isMediumTerm = !isCompleted && !isQuickWin && idx < complianceCompleted + 10;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.5 + (idx * 0.02) }}
                      className="w-full aspect-square rounded-sm"
                      style={{
                        backgroundColor: isCompleted ? 'var(--success)' :
                                        isQuickWin ? 'var(--warning)' :
                                        isMediumTerm ? '#c87020' :
                                        'var(--border-medium)'
                      }}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-[9px] uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--success)' }} />
                  <span style={{ color: 'var(--muted-foreground)' }}>Done</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--warning)' }} />
                  <span style={{ color: 'var(--muted-foreground)' }}>Quick</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#c87020' }} />
                  <span style={{ color: 'var(--muted-foreground)' }}>30-60d</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--border-medium)' }} />
                  <span style={{ color: 'var(--muted-foreground)' }}>60d+</span>
                </div>
              </div>
            </motion.div>

            {/* ELIGIBILITY SUMMARY - 3 BADGES */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-3 gap-3"
            >
              {/* Unlocked */}
              <div 
                className="border rounded-sm p-4 text-center"
                style={{
                  backgroundColor: 'var(--success-bg)',
                  borderColor: 'var(--success-border)'
                }}
              >
                <div 
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 800,
                    fontSize: '28px',
                    letterSpacing: '-0.02em',
                    color: 'var(--success)'
                  }}
                >
                  {unlockedCount}
                </div>
                <div 
                  className="text-[9px] uppercase tracking-[0.15em] mt-1"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--success)'
                  }}
                >
                  Unlocked
                </div>
              </div>

              {/* Approaching */}
              <div 
                className="border rounded-sm p-4 text-center"
                style={{
                  backgroundColor: 'var(--warning-bg)',
                  borderColor: 'var(--warning-border)'
                }}
              >
                <div 
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 800,
                    fontSize: '28px',
                    letterSpacing: '-0.02em',
                    color: 'var(--warning)'
                  }}
                >
                  {approachingCount}
                </div>
                <div 
                  className="text-[9px] uppercase tracking-[0.15em] mt-1"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--warning)'
                  }}
                >
                  Approaching
                </div>
              </div>

              {/* Locked */}
              <div 
                className="border rounded-sm p-4 text-center"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)'
                }}
              >
                <div 
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 800,
                    fontSize: '28px',
                    letterSpacing: '-0.02em',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {lockedCount}
                </div>
                <div 
                  className="text-[9px] uppercase tracking-[0.15em] mt-1"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Locked
                </div>
              </div>
            </motion.div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN — Activity + Quick Actions + Products                       */}
          {/* ========================================================================= */}
          <div className="space-y-6">
            
            {/* TOP ROW — METRIC STRIP (4 stats) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {/* Score Change */}
              <div 
                className="border rounded-sm p-4"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  <span 
                    className="text-[9px] uppercase tracking-[0.15em]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 400,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Score Change
                  </span>
                </div>
                <div 
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700,
                    fontSize: '20px',
                    letterSpacing: '-0.02em',
                    color: 'var(--success)'
                  }}
                >
                  +12
                </div>
                <p 
                  className="text-xs mt-0.5"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  This week
                </p>
              </div>

              {/* Products Unlocked */}
              <div 
                className="border rounded-sm p-4"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <span 
                    className="text-[9px] uppercase tracking-[0.15em]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 400,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Products
                  </span>
                </div>
                <div 
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700,
                    fontSize: '20px',
                    letterSpacing: '-0.02em',
                    color: 'var(--primary)'
                  }}
                >
                  {unlockedCount}
                </div>
                <p 
                  className="text-xs mt-0.5"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Unlocked
                </p>
              </div>

              {/* Items Completed */}
              <div 
                className="border rounded-sm p-4"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4" style={{ color: 'var(--info)' }} />
                  <span 
                    className="text-[9px] uppercase tracking-[0.15em]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 400,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Completed
                  </span>
                </div>
                <div 
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700,
                    fontSize: '20px',
                    letterSpacing: '-0.02em',
                    color: 'var(--info)'
                  }}
                >
                  {totalCompleted}
                </div>
                <p 
                  className="text-xs mt-0.5"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Items
                </p>
              </div>

              {/* Days Active */}
              <div 
                className="border rounded-sm p-4"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                  <span 
                    className="text-[9px] uppercase tracking-[0.15em]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 400,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Days Active
                  </span>
                </div>
                <div 
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700,
                    fontSize: '20px',
                    letterSpacing: '-0.02em',
                    color: 'var(--foreground)'
                  }}
                >
                  {daysActive}
                </div>
                <p 
                  className="text-xs mt-0.5"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Days
                </p>
              </div>
            </motion.div>

            {/* PRE-QUALIFIED PRODUCTS */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border rounded-sm p-6"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 700,
                      fontSize: '22px',
                      lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                      color: 'var(--foreground)'
                    }}
                  >
                    Available to You Now
                  </h2>
                  <p 
                    className="mt-1"
                    style={{ 
                      fontFamily: 'var(--font-serif)', 
                      fontWeight: 300,
                      fontStyle: 'italic',
                      fontSize: '14px',
                      lineHeight: 1.7,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    These products match your current score + compliance status
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/access-funding')}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {preQualifiedCount > 0 ? (
                <div className="space-y-3">
                  {preQualifiedPrograms.slice(0, 4).map((program, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + (idx * 0.05) }}
                      whileHover={{ borderColor: 'var(--primary-border)' }}
                      className="border rounded-sm p-4 cursor-pointer transition-colors"
                      onClick={() => navigate(program.path)}
                      style={{
                        backgroundColor: 'var(--primary-bg)',
                        borderColor: 'var(--primary-border)'
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: 'var(--success)' }}
                            />
                            <span 
                              className="text-[9px] uppercase tracking-[0.15em]"
                              style={{ 
                                fontFamily: 'var(--font-body)',
                                fontWeight: 400,
                                color: 'var(--success)'
                              }}
                            >
                              Pre-Qualified
                            </span>
                            {idx === 0 && (
                              <span 
                                className="px-2 py-0.5 rounded-sm text-[8px] uppercase tracking-[0.15em]"
                                style={{
                                  fontFamily: 'var(--font-body)',
                                  fontWeight: 400,
                                  backgroundColor: 'var(--warning-bg)',
                                  borderColor: 'var(--warning-border)',
                                  color: 'var(--warning)'
                                }}
                              >
                                Fastest
                              </span>
                            )}
                          </div>
                          <h3 
                            className="mb-1"
                            style={{ 
                              fontFamily: 'var(--font-display)', 
                              fontWeight: 600,
                              fontSize: '14px',
                              color: 'var(--foreground)'
                            }}
                          >
                            {program.name}
                          </h3>
                          <p 
                            style={{ 
                              fontFamily: 'var(--font-display)', 
                              fontWeight: 700,
                              fontSize: '16px',
                              color: 'var(--primary)'
                            }}
                          >
                            {program.maxAmount}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div 
                  className="border rounded-sm p-8 text-center"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <Target className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
                  <p 
                    className="mb-2"
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 600,
                      fontSize: '14px',
                      color: 'var(--foreground)'
                    }}
                  >
                    No programs unlocked yet
                  </p>
                  <p 
                    className="mb-4"
                    style={{ 
                      fontFamily: 'var(--font-serif)', 
                      fontWeight: 300,
                      fontStyle: 'italic',
                      fontSize: '14px',
                      lineHeight: 1.7,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Complete the Business Success Scan to see your funding options
                  </p>
                  <Button 
                    onClick={() => navigate('/business-success-scan')}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '13px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Start Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </motion.section>

            {/* NEXT BEST ACTIONS (Ranked, max 3) */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="border rounded-sm p-6"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 700,
                      fontSize: '22px',
                      lineHeight: 1.2,
                      letterSpacing: '-0.01em',
                      color: 'var(--foreground)'
                    }}
                  >
                    Your Highest-Impact Moves
                  </h2>
                  <p 
                    className="mt-1"
                    style={{ 
                      fontFamily: 'var(--font-serif)', 
                      fontWeight: 300,
                      fontStyle: 'italic',
                      fontSize: '14px',
                      lineHeight: 1.7,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Ranked by funding impact per hour of effort
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {priorityActions.map((action) => (
                  <motion.div
                    key={action.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + (action.rank * 0.05) }}
                    whileHover={{ borderColor: 'var(--border-medium)' }}
                    className="border rounded-sm p-4 cursor-pointer transition-colors"
                    onClick={() => navigate(action.path)}
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank Box */}
                      <div 
                        className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          borderWidth: '2px',
                          borderStyle: 'solid',
                          borderColor: 'var(--border-medium)'
                        }}
                      >
                        <span 
                          style={{ 
                            fontFamily: 'var(--font-display)', 
                            fontWeight: 800,
                            fontSize: '18px',
                            color: 'var(--foreground)'
                          }}
                        >
                          {action.rank}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="mb-1"
                          style={{ 
                            fontFamily: 'var(--font-display)', 
                            fontWeight: 600,
                            fontSize: '13px',
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                            color: 'var(--foreground)'
                          }}
                        >
                          {action.name}
                        </h3>
                        <p 
                          className="mb-2"
                          style={{ 
                            fontFamily: 'var(--font-body)', 
                            fontWeight: 300,
                            fontSize: '12px',
                            lineHeight: 1.6,
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          {action.why}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            className="px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-[0.15em] border inline-flex items-center gap-1"
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontWeight: 400,
                              backgroundColor: 'var(--primary-bg)',
                              borderColor: 'var(--primary-border)',
                              color: 'var(--primary)'
                            }}
                          >
                            <Zap className="w-2.5 h-2.5" />
                            +{action.points} PTS
                          </span>
                          <span 
                            className="px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-[0.15em] border"
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontWeight: 400,
                              backgroundColor: 'var(--info-bg)',
                              borderColor: 'rgba(56,168,128,.25)',
                              color: 'var(--info)'
                            }}
                          >
                            {action.timeEst}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/lender-compliance')}
                  className="w-full"
                >
                  View Full Action Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.section>

            {/* APPROACHING PRODUCTS (Secondary) */}
            {approachingCount > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="border rounded-sm p-6"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)'
                }}
              >
                <h2 
                  className="mb-4"
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700,
                    fontSize: '22px',
                    lineHeight: 1.2,
                    letterSpacing: '-0.01em',
                    color: 'var(--foreground)'
                  }}
                >
                  Within Your Reach
                </h2>

                <div className="space-y-3">
                  {/* Mock approaching product cards - replace with real data when available */}
                  <div 
                    className="border rounded-sm p-4"
                    style={{
                      backgroundColor: 'var(--warning-bg)',
                      borderColor: 'var(--warning-border)'
                    }}
                  >
                    <p 
                      className="mb-2"
                      style={{ 
                        fontFamily: 'var(--font-display)', 
                        fontWeight: 600,
                        fontSize: '13px',
                        color: 'var(--foreground)'
                      }}
                    >
                      SBA 7(a) Loan
                    </p>
                    <p 
                      className="mb-3"
                      style={{ 
                        fontFamily: 'var(--font-body)', 
                        fontWeight: 300,
                        fontSize: '11px',
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      Need +47 pts and 2 compliance items
                    </p>
                    <div className="h-1.5 rounded-none overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                      <div 
                        className="h-full"
                        style={{ 
                          width: '68%',
                          backgroundColor: 'var(--warning)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
