import { useState, useEffect } from 'react';
import { Shield, CheckCircle, Clock, Zap, Target, ArrowRight, Award, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { getAllAuditItems, markAuditItemComplete, markAuditItemIncomplete } from '../utils/businessData';
import { getPreQualifiedPrograms } from '../utils/fundingEligibility';

export function LenderCompliance() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [fundScore, setFundScore] = useState<number>(0);

  // Listen for updates
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('scanDataUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('fundscoreUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('scanDataUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('fundscoreUpdated', handleUpdate);
    };
  }, []);

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
  }, [refreshKey]);

  // Get all lender compliance items - sorted by priority (critical → high → medium → low)
  const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
  const allItems = getAllAuditItems();
  const complianceItems = allItems
    .filter(item => item.category === 'lender-compliance')
    .sort((a, b) => {
      // First sort by completion status (incomplete items first)
      if (a.status === 'complete' && b.status !== 'complete') return 1;
      if (a.status !== 'complete' && b.status === 'complete') return -1;
      
      // Then sort by priority
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const totalItems = complianceItems.length;
  const completedItems = complianceItems.filter(item => item.status === 'complete').length;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  const currentScore = fundScore;

  // Get pre-qualified programs
  const preQualifiedPrograms = getPreQualifiedPrograms();

  // Count items by time category (estimatedDays might not exist, so we'll use priority as fallback)
  const quickWins = complianceItems.filter(item => item.status !== 'complete' && item.priority === 'critical').length;
  const mediumTerm = complianceItems.filter(item => item.status !== 'complete' && (item.priority === 'high' || item.priority === 'medium')).length;
  const longTerm = complianceItems.filter(item => item.status !== 'complete' && item.priority === 'low').length;

  // Handle checkbox toggle
  const handleToggle = (itemId: string) => {
    const item = complianceItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (item.status === 'complete') {
      markAuditItemIncomplete(itemId);
    } else {
      markAuditItemComplete(itemId, 'manual');
    }
    
    setRefreshKey(prev => prev + 1);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('scanDataUpdated'));
  };

  // Get time tag for item based on priority
  const getTimeTag = (item: any) => {
    if (item.status === 'complete') return null;
    
    // Map priority to time estimates
    if (item.priority === 'critical') {
      return { label: 'Quick Win — Under 7 days', color: 'var(--warning)', bg: 'var(--warning-bg)', border: 'var(--warning-border)' };
    } else if (item.priority === 'high' || item.priority === 'medium') {
      return { label: '30–60 Days', color: '#c87020', bg: 'rgba(200, 112, 32, 0.10)', border: 'rgba(200, 112, 32, 0.25)' };
    } else {
      return { label: '60–90+ Days', color: 'var(--destructive)', bg: 'var(--destructive-bg)', border: 'var(--destructive-border)' };
    }
  };

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
            Lender Compliance
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
            20 structural items lenders verify before approving any application
          </p>
        </motion.div>

        {/* PROGRESS HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div 
            className="border rounded-sm p-8"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                  <h2 
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 700,
                      fontSize: '22px',
                      letterSpacing: '-0.01em',
                      color: 'var(--foreground)'
                    }}
                  >
                    Completion Progress
                  </h2>
                </div>
                <p 
                  style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700,
                    fontSize: '32px',
                    letterSpacing: '-0.02em',
                    color: 'var(--primary)'
                  }}
                >
                  {completedItems} OF {totalItems} COMPLETE
                </p>
              </div>

              {/* 3 BADGES */}
              <div className="flex gap-3">
                <div 
                  className="px-4 py-3 rounded-sm border text-center"
                  style={{
                    backgroundColor: 'var(--success-bg)',
                    borderColor: 'var(--success-border)'
                  }}
                >
                  <div 
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 800,
                      fontSize: '20px',
                      color: 'var(--success)'
                    }}
                  >
                    {completedItems}
                  </div>
                  <div 
                    className="text-[9px] uppercase tracking-[0.15em]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 400,
                      color: 'var(--success)'
                    }}
                  >
                    Done
                  </div>
                </div>

                <div 
                  className="px-4 py-3 rounded-sm border text-center"
                  style={{
                    backgroundColor: 'var(--warning-bg)',
                    borderColor: 'var(--warning-border)'
                  }}
                >
                  <div 
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 800,
                      fontSize: '20px',
                      color: 'var(--warning)'
                    }}
                  >
                    {quickWins}
                  </div>
                  <div 
                    className="text-[9px] uppercase tracking-[0.15em]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 400,
                      color: 'var(--warning)'
                    }}
                  >
                    Quick Wins
                  </div>
                </div>

                <div 
                  className="px-4 py-3 rounded-sm border text-center"
                  style={{
                    backgroundColor: 'var(--destructive-bg)',
                    borderColor: 'var(--destructive-border)'
                  }}
                >
                  <div 
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 800,
                      fontSize: '20px',
                      color: 'var(--destructive)'
                    }}
                  >
                    {totalItems - completedItems}
                  </div>
                  <div 
                    className="text-[9px] uppercase tracking-[0.15em]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 400,
                      color: 'var(--destructive)'
                    }}
                  >
                    Still Needed
                  </div>
                </div>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div>
              <div 
                className="h-3 rounded-none overflow-hidden"
                style={{ backgroundColor: 'var(--border)' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                  style={{
                    background: `linear-gradient(90deg, var(--primary-hover), var(--primary))`
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span 
                  className="text-xs"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {completionPercentage}% Complete
                </span>
                <span 
                  className="text-xs"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {totalItems - completedItems} items remaining
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MAIN CONTENT: 2-column on desktop with sticky sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          
          {/* LEFT: COMPLIANCE ITEMS GRID */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="grid grid-cols-1 gap-4">
              {complianceItems.map((item, index) => {
                const timeTag = getTimeTag(item);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + (index * 0.03) }}
                    className={`border rounded-sm p-5 transition-all cursor-pointer ${
                      item.status === 'complete' ? 'hover:border-[var(--success-border)]' : 'hover:border-[var(--border-medium)]'
                    }`}
                    onClick={() => handleToggle(item.id)}
                    style={{
                      backgroundColor: item.status === 'complete' ? 'var(--success-bg)' : 'var(--card)',
                      borderColor: item.status === 'complete' ? 'var(--success-border)' : 'var(--border)'
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* CHECKBOX */}
                      <div className="flex-shrink-0 mt-1">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-6 h-6 rounded-sm border-2 flex items-center justify-center cursor-pointer"
                          style={{
                            backgroundColor: item.status === 'complete' ? 'var(--success)' : 'transparent',
                            borderColor: item.status === 'complete' ? 'var(--success)' : 'var(--border-medium)'
                          }}
                        >
                          {item.status === 'complete' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              <CheckCircle 
                                className="w-5 h-5" 
                                style={{ color: 'var(--primary-foreground)' }} 
                                fill="currentColor"
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span 
                                className="text-[9px] uppercase tracking-[0.2em]"
                                style={{ 
                                  fontFamily: 'var(--font-body)',
                                  fontWeight: 400,
                                  color: 'var(--muted-foreground)'
                                }}
                              >
                                ITEM {index + 1} OF {totalItems}
                              </span>
                              {item.ficoImpact > 0 && (
                                <span 
                                  className="px-2 py-0.5 rounded-sm text-[8px] uppercase tracking-[0.15em] inline-flex items-center gap-1"
                                  style={{
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: 400,
                                    backgroundColor: 'var(--primary-bg)',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: 'var(--primary-border)',
                                    color: 'var(--primary)'
                                  }}
                                >
                                  <Zap className="w-2.5 h-2.5" />
                                  {item.ficoImpact} PTS
                                </span>
                              )}
                            </div>
                            <h3 
                              className="mb-2"
                              style={{ 
                                fontFamily: 'var(--font-display)', 
                                fontWeight: 600,
                                fontSize: '14px',
                                color: 'var(--foreground)'
                              }}
                            >
                              {item.title}
                            </h3>
                            <p 
                              style={{ 
                                fontFamily: 'var(--font-body)', 
                                fontWeight: 300,
                                fontSize: '12px',
                                lineHeight: 1.6,
                                color: 'var(--muted-foreground)'
                              }}
                            >
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* TIME TAG (only if incomplete) */}
                        {timeTag && (
                          <div className="mt-3">
                            <span 
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] uppercase tracking-[0.15em] border"
                              style={{
                                fontFamily: 'var(--font-body)',
                                fontWeight: 400,
                                backgroundColor: timeTag.bg,
                                borderColor: timeTag.border,
                                color: timeTag.color
                              }}
                            >
                              <Clock className="w-3 h-3" />
                              {timeTag.label}
                            </span>
                          </div>
                        )}

                        {/* DONE STATE */}
                        {item.status === 'complete' && (
                          <div className="mt-3">
                            <span 
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] uppercase tracking-[0.15em] border"
                              style={{
                                fontFamily: 'var(--font-body)',
                                fontWeight: 400,
                                backgroundColor: 'var(--success-bg)',
                                borderColor: 'var(--success-border)',
                                color: 'var(--success)'
                              }}
                            >
                              <CheckCircle className="w-3 h-3" />
                              Complete
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* RIGHT: IMPACT PANEL (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:sticky lg:top-8 h-fit space-y-6"
          >
            
            {/* WHAT COMPLETING UNLOCKS */}
            <div 
              className="border rounded-sm p-6"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <h3 
                className="mb-4"
                style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700,
                  fontSize: '18px',
                  letterSpacing: '0.01em',
                  color: 'var(--foreground)'
                }}
              >
                What Completing These Unlocks
              </h3>

              {completedItems > 0 ? (
                <div className="space-y-4">
                  {/* Current Score Impact */}
                  <div 
                    className="p-4 rounded-sm border"
                    style={{
                      backgroundColor: 'var(--primary-bg)',
                      borderColor: 'var(--primary-border)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                      <span 
                        className="text-[9px] uppercase tracking-[0.15em]"
                        style={{ 
                          fontFamily: 'var(--font-body)',
                          fontWeight: 400,
                          color: 'var(--primary)'
                        }}
                      >
                        Score Impact
                      </span>
                    </div>
                    <p 
                      style={{ 
                        fontFamily: 'var(--font-display)', 
                        fontWeight: 700,
                        fontSize: '24px',
                        letterSpacing: '-0.02em',
                        color: 'var(--primary)'
                      }}
                    >
                      {currentScore}
                    </p>
                    <p 
                      className="text-xs mt-1"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        fontWeight: 300,
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      Current FundScore™
                    </p>
                  </div>

                  {/* Pre-qualified products */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4" style={{ color: 'var(--success)' }} />
                      <span 
                        className="text-[9px] uppercase tracking-[0.15em]"
                        style={{ 
                          fontFamily: 'var(--font-body)',
                          fontWeight: 400,
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        Products Unlocked
                      </span>
                    </div>
                    
                    {preQualifiedPrograms.length > 0 ? (
                      <div className="space-y-2">
                        {preQualifiedPrograms.slice(0, 3).map((program, idx) => (
                          <div 
                            key={idx}
                            className="p-3 rounded-sm border cursor-pointer hover:border-[var(--primary-border)] transition-colors"
                            onClick={() => navigate(program.path)}
                            style={{
                              backgroundColor: 'var(--surface-2)',
                              borderColor: 'var(--border)'
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div 
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: 'var(--success)' }}
                              />
                              <span 
                                className="text-xs"
                                style={{ 
                                  fontFamily: 'var(--font-display)',
                                  fontWeight: 600,
                                  color: 'var(--foreground)'
                                }}
                              >
                                {program.name}
                              </span>
                            </div>
                            <p 
                              className="text-xs"
                              style={{ 
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: '11px',
                                color: 'var(--primary)'
                              }}
                            >
                              {program.maxAmount}
                            </p>
                          </div>
                        ))}
                        
                        {preQualifiedPrograms.length > 3 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => navigate('/access-funding')}
                          >
                            View All {preQualifiedPrograms.length} Programs
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div 
                        className="p-4 rounded-sm border text-center"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <Target className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                        <p 
                          className="text-xs"
                          style={{ 
                            fontFamily: 'var(--font-body)',
                            fontWeight: 300,
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          Complete more items to unlock funding products
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  className="p-6 rounded-sm border text-center"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <Info className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
                  <p 
                    style={{ 
                      fontFamily: 'var(--font-body)', 
                      fontWeight: 300,
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Check an item to see what it unlocks
                  </p>
                </div>
              )}
            </div>

            {/* LEGEND */}
            <div 
              className="border rounded-sm p-5"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              <h4 
                className="mb-3 text-[9px] uppercase tracking-[0.15em]"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  color: 'var(--muted-foreground)'
                }}
              >
                Time Estimates
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: 'var(--warning)' }}
                  />
                  <span 
                    className="text-xs"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 300,
                      color: 'var(--foreground)'
                    }}
                  >
                    Quick Win — Under 7 days
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: '#c87020' }}
                  />
                  <span 
                    className="text-xs"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 300,
                      color: 'var(--foreground)'
                    }}
                  >
                    30–60 Days
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: 'var(--destructive)' }}
                  />
                  <span 
                    className="text-xs"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 300,
                      color: 'var(--foreground)'
                    }}
                  >
                    60–90+ Days
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div 
              className="border rounded-sm p-5"
              style={{
                background: 'linear-gradient(135deg, var(--primary-bg), var(--surface-2))',
                borderColor: 'var(--primary-border)'
              }}
            >
              <Zap className="w-8 h-8 mb-3" style={{ color: 'var(--primary)' }} />
              <h4 
                className="mb-2"
                style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700,
                  fontSize: '16px',
                  color: 'var(--foreground)'
                }}
              >
                Need Help?
              </h4>
              <p 
                className="mb-4 text-xs"
                style={{ 
                  fontFamily: 'var(--font-serif)', 
                  fontWeight: 300,
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                  color: 'var(--muted-foreground)'
                }}
              >
                Get personalized guidance on completing these items faster
              </p>
              <Button 
                size="sm"
                className="w-full"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}
              >
                Contact Support
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>

          </motion.div>

        </div>

      </div>
    </div>
  );
}