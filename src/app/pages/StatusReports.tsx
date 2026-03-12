import { Link } from 'react-router';
import { motion } from 'motion/react';
import { TrendingUp, Target, DollarSign, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  getAllAuditItems, 
  getBusinessProfile 
} from '../utils/businessData';

export function StatusReports() {
  const [fundScore, setFundScore] = useState<number>(0);
  
  // Load FundScore from localStorage
  useEffect(() => {
    const loadFundScore = () => {
      try {
        const stored = localStorage.getItem('fundscore_result');
        if (stored) {
          const result = JSON.parse(stored);
          setFundScore(result.score || 0);
        }
      } catch (error) {
        console.error('Error reading FundScore:', error);
      }
    };

    loadFundScore();

    // Listen for FundScore updates
    window.addEventListener('fundscoreUpdated', loadFundScore);
    window.addEventListener('storage', loadFundScore);

    return () => {
      window.removeEventListener('fundscoreUpdated', loadFundScore);
      window.removeEventListener('storage', loadFundScore);
    };
  }, []);
  
  // Get real data from unified system
  const allItems = getAllAuditItems();
  const businessProfile = getBusinessProfile();
  
  const completedItems = allItems.filter(i => i.status === 'complete').length;
  const totalItems = allItems.length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // Calculate estimated funding based on completion (simplified)
  const estimatedFunding = progressPercentage > 85 ? '$250K - $5M' : 
                           progressPercentage > 60 ? '$100K - $500K' :
                           progressPercentage > 40 ? '$50K - $250K' :
                           '$10K - $100K';

  const reportCards = [
    {
      id: 'estimated-funding',
      title: 'Estimated Funding',
      description: 'Funding range estimate with contingency analysis',
      icon: DollarSign,
      path: '/status-reports/estimated-funding',
      metric: estimatedFunding,
      metricLabel: 'Funding Range',
      status: 'approaching',
      bgGradient: 'linear-gradient(135deg, rgba(200, 240, 64, 0.08) 0%, rgba(160, 240, 64, 0.08) 100%)',
      borderColor: 'var(--primary)'
    },
    {
      id: 'bankable-status',
      title: 'Bankable Status',
      description: '20-item compliance status report',
      icon: CheckCircle,
      path: '/status-reports/bankable-status',
      metric: `${completedItems}/${totalItems}`,
      metricLabel: 'Items Complete',
      status: progressPercentage >= 85 ? 'ready' : progressPercentage >= 60 ? 'approaching' : 'developing',
      bgGradient: 'linear-gradient(135deg, rgba(138, 184, 32, 0.08) 0%, rgba(200, 240, 64, 0.08) 100%)',
      borderColor: progressPercentage >= 85 ? 'var(--primary)' : 'var(--status-approaching)'
    },
    {
      id: 'business-fico',
      title: 'Business FICO',
      description: 'FICO SBSS score breakdown and analysis',
      icon: Target,
      path: '/status-reports/business-fico',
      metric: fundScore > 0 ? Math.round(fundScore / 10) : '—',
      metricLabel: 'SBSS Composite',
      status: 'developing',
      bgGradient: 'linear-gradient(135deg, rgba(138, 184, 32, 0.06) 0%, rgba(56, 168, 128, 0.08) 100%)',
      borderColor: 'var(--border-medium)'
    }
  ];

  const getScoreBand = (score: number) => {
    if (score >= 900) return { label: 'Prime', color: 'var(--score-prime)' };
    if (score >= 750) return { label: 'Ready', color: 'var(--score-ready)' };
    if (score >= 650) return { label: 'Approaching', color: 'var(--score-approaching)' };
    if (score >= 550) return { label: 'Developing', color: 'var(--score-developing)' };
    if (score >= 400) return { label: 'Low', color: 'var(--score-low)' };
    return { label: 'Critical', color: 'var(--score-critical)' };
  };

  const scoreBand = getScoreBand(fundScore);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 
            className="text-[32px] mb-2 tracking-tight"
            style={{ 
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: 'var(--foreground)'
            }}
          >
            Status Reports
          </h1>
          <p 
            className="text-[14px]"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              color: 'var(--muted-foreground)'
            }}
          >
            Comprehensive view of your business creditworthiness and funding readiness
          </p>
        </motion.div>

        {/* FundScore Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-sm p-8 mb-8"
          style={{ 
            backgroundColor: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FundScore */}
            <div>
              <p 
                className="text-[9px] uppercase tracking-[0.2em] mb-3"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  color: 'var(--muted-foreground)'
                }}
              >
                Your FundScore™
              </p>
              <div 
                className="text-[48px] leading-none tracking-tight mb-1"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  color: scoreBand.color
                }}
              >
                {fundScore}
              </div>
              <div 
                className="text-[14px] italic"
                style={{ 
                  fontFamily: 'var(--font-accent)',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)'
                }}
              >
                {scoreBand.label}
              </div>
            </div>

            {/* Business Name */}
            <div className="flex flex-col justify-center">
              <p 
                className="text-[9px] uppercase tracking-[0.2em] mb-2"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  color: 'var(--muted-foreground)'
                }}
              >
                Business Name
              </p>
              <p 
                className="text-[18px]"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  color: 'var(--foreground)'
                }}
              >
                {businessProfile.businessName || 'Your Business'}
              </p>
            </div>

            {/* Progress */}
            <div className="flex flex-col justify-center">
              <p 
                className="text-[9px] uppercase tracking-[0.2em] mb-2"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  color: 'var(--muted-foreground)'
                }}
              >
                Overall Progress
              </p>
              <div className="flex items-center gap-3">
                <div 
                  className="text-[24px]"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    color: 'var(--primary)'
                  }}
                >
                  {progressPercentage}%
                </div>
                {progressPercentage >= 85 ? (
                  <CheckCircle className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                ) : (
                  <AlertCircle className="w-6 h-6" style={{ color: 'var(--status-approaching)' }} />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
            >
              <Link to={card.path} className="block group">
                <div
                  className="rounded-sm p-6 transition-all duration-300 group-hover:translate-y-[-4px]"
                  style={{
                    background: card.bgGradient,
                    border: `1px solid ${card.borderColor}`
                  }}
                >
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0"
                      style={{ 
                        backgroundColor: 'var(--bg-surface-2)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <card.icon className="w-6 h-6" style={{ color: card.borderColor }} />
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="text-[18px] mb-1"
                        style={{ 
                          fontFamily: 'var(--font-display)',
                          fontWeight: 600,
                          color: 'var(--foreground)'
                        }}
                      >
                        {card.title}
                      </h3>
                      <p 
                        className="text-[12px]"
                        style={{ 
                          fontFamily: 'var(--font-body)',
                          fontWeight: 400,
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Metric */}
                  <div className="flex items-end justify-between pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <p 
                        className="text-[9px] uppercase tracking-[0.2em] mb-1"
                        style={{ 
                          fontFamily: 'var(--font-body)',
                          fontWeight: 400,
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        {card.metricLabel}
                      </p>
                      <div 
                        className="text-[28px] leading-none"
                        style={{ 
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          color: card.borderColor
                        }}
                      >
                        {card.metric}
                      </div>
                    </div>
                    <div 
                      className="text-[11px] px-3 py-1 rounded-sm"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        fontWeight: 400,
                        backgroundColor: `${card.borderColor}20`,
                        color: card.borderColor,
                        border: `1px solid ${card.borderColor}`
                      }}
                    >
                      View Report →
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-sm p-6"
          style={{ 
            backgroundColor: 'rgba(138, 184, 32, 0.06)',
            border: '1px solid var(--primary)'
          }}
        >
          <div className="flex items-start gap-4">
            <TrendingUp className="w-6 h-6 flex-shrink-0" style={{ color: 'var(--primary)' }} />
            <div>
              <h4 
                className="text-[14px] mb-2"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  color: 'var(--foreground)'
                }}
              >
                Understanding Your Status Reports
              </h4>
              <p 
                className="text-[13px] leading-relaxed"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  color: 'var(--foreground-secondary)'
                }}
              >
                These reports provide a comprehensive view of your business's creditworthiness and funding readiness. 
                Track your progress across key metrics including FICO SBSS scores, compliance items, and estimated 
                funding capacity. Each report is updated in real-time as you complete audit items and improve your profile.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}