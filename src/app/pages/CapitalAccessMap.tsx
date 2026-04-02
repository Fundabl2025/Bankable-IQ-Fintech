import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, CheckCircle, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import { 
  getAllAuditItems,
  getFicoBankableStatus,
  getCategoryProgress,
  type AuditItem 
} from '../utils/businessData';

type TabType = 'products' | 'compliance' | 'score' | 'actions';

interface Product {
  id: string;
  name: string;
  amountRange: string;
  minScore: number;
  requiredCompliance: string[];
  rate: string;
  speed: string;
  status: 'unlocked' | 'approaching' | 'locked';
  scoreGap: number;
  complianceGaps: string[];
}

export function CapitalAccessMap() {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [score, setScore] = useState(0);
  const [complianceItems, setComplianceItems] = useState<AuditItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    updateData();
    window.addEventListener('businessDataUpdated', updateData);
    return () => window.removeEventListener('businessDataUpdated', updateData);
  }, []);

  const updateData = () => {
    // Get FICO SBSS score (80-160 scale) and convert to 0-1000 FundScore scale
    const ficoStatus = getFicoBankableStatus();
    const ficoScore = ficoStatus.currentScore; // 80-160
    // Convert FICO SBSS (80-160) to FundScore (0-1000): map 80->400, 160->1000
    const fundScore = Math.round(((ficoScore - 80) / 80) * 600 + 400);
    setScore(fundScore);

    const allItems = getAllAuditItems();
    const compliance = allItems.filter(item => item.category === 'lender-compliance');
    setComplianceItems(compliance);

    // Generate product eligibility
    const productList: Product[] = [
      {
        id: 'working-capital',
        name: 'Working Capital Loans',
        amountRange: '$25K - $500K',
        minScore: 400,
        requiredCompliance: ['business-entity', 'business-bank-account'],
        rate: '8-15%',
        speed: '7-14 days',
        status: 'unlocked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'business-credit-line',
        name: 'Business Credit Line',
        amountRange: '$10K - $250K',
        minScore: 550,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number', 'business-phone'],
        rate: '7-12%',
        speed: '3-7 days',
        status: 'approaching',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'equipment-financing',
        name: 'Equipment Financing',
        amountRange: '$50K - $5M',
        minScore: 500,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number'],
        rate: '6-10%',
        speed: '5-10 days',
        status: 'unlocked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'merchant-advance',
        name: 'Merchant Advance',
        amountRange: '$5K - $500K',
        minScore: 350,
        requiredCompliance: ['business-bank-account'],
        rate: 'Factor 1.2-1.4x',
        speed: '1-3 days',
        status: 'unlocked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'revenue-based',
        name: 'Revenue Based Loan',
        amountRange: '$10K - $1M',
        minScore: 450,
        requiredCompliance: ['business-entity', 'business-bank-account', 'business-plan'],
        rate: '12-20%',
        speed: '7-14 days',
        status: 'unlocked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'receivable-factoring',
        name: 'Receivable Factoring',
        amountRange: '$25K - $10M',
        minScore: 500,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number', 'bank-rating'],
        rate: '2-5% per invoice',
        speed: '3-7 days',
        status: 'approaching',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'sba-loan',
        name: 'SBA Loans: 7a & 504',
        amountRange: '$50K - $5M',
        minScore: 720,
        requiredCompliance: [
          'business-entity', 'business-bank-account', 'ein-number', 'business-phone', 
          'business-plan', 'bank-rating', 'comparable-credit'
        ],
        rate: '5-11%',
        speed: '45-90 days',
        status: 'locked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'business-term-loan',
        name: 'Business Term Loan',
        amountRange: '$25K - $500K',
        minScore: 600,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number', 'business-plan'],
        rate: '6-12%',
        speed: '14-21 days',
        status: 'approaching',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'credit-union',
        name: 'Credit Union Loans',
        amountRange: '$10K - $250K',
        minScore: 650,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number', 'business-phone', 'business-plan'],
        rate: '5-9%',
        speed: '21-45 days',
        status: 'approaching',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'business-credit-cards',
        name: 'Syndicated Line of Credit (SLOC)',
        amountRange: '$5K - $150K',
        minScore: 500,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number'],
        rate: '15-25% APR',
        speed: '1-7 days',
        status: 'unlocked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'ar-finance',
        name: 'Accounts Receivable Finance',
        amountRange: '$100K - $100M',
        minScore: 550,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number', 'bank-rating'],
        rate: '1-3% per month',
        speed: '7-14 days',
        status: 'unlocked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'inventory-loc',
        name: 'Inventory Line of Credit',
        amountRange: '$50K - $10M',
        minScore: 600,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number', 'bank-rating', 'business-plan'],
        rate: '6-12%',
        speed: '14-30 days',
        status: 'approaching',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'po-finance',
        name: 'Purchase Order Finance',
        amountRange: '$10K - $10M',
        minScore: 500,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number'],
        rate: '2-6% per order',
        speed: '5-10 days',
        status: 'unlocked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'bridge-loans',
        name: 'Bridge Loans',
        amountRange: '$100K - $25M',
        minScore: 650,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number', 'business-plan', 'bank-rating'],
        rate: '8-15%',
        speed: '7-21 days',
        status: 'locked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'dscr-loans',
        name: 'DSCR Loans',
        amountRange: '$75K - $5M',
        minScore: 680,
        requiredCompliance: ['business-entity', 'business-bank-account', 'ein-number', 'business-plan', 'bank-rating', 'comparable-credit'],
        rate: '6-10%',
        speed: '30-60 days',
        status: 'locked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'construction-loans',
        name: 'Construction Loans',
        amountRange: '$100K - $20M',
        minScore: 700,
        requiredCompliance: [
          'business-entity', 'business-bank-account', 'ein-number', 'business-plan', 
          'bank-rating', 'comparable-credit', 'asset-documentation'
        ],
        rate: '5-9%',
        speed: '30-90 days',
        status: 'locked',
        scoreGap: 0,
        complianceGaps: []
      },
      {
        id: 'personal-credit-cards',
        name: 'Personal Credit Cards for Business',
        amountRange: '$5K - $50K',
        minScore: 400,
        requiredCompliance: [],
        rate: '15-30% APR',
        speed: '1-7 days',
        status: 'unlocked',
        scoreGap: 0,
        complianceGaps: []
      }
    ];

    // Calculate status for each product
    const completedIds = compliance.filter(c => c.status === 'complete').map(c => c.id);
    
    productList.forEach(product => {
      const missingCompliance = product.requiredCompliance.filter(
        req => !completedIds.includes(req)
      );
      
      const scoreGap = Math.max(0, product.minScore - score);
      
      if (score >= product.minScore && missingCompliance.length === 0) {
        product.status = 'unlocked';
      } else if (scoreGap <= 100 || (score >= product.minScore && missingCompliance.length <= 2)) {
        product.status = 'approaching';
      } else {
        product.status = 'locked';
      }
      
      product.scoreGap = scoreGap;
      product.complianceGaps = missingCompliance;
    });

    // Sort: unlocked first, then approaching, then locked
    productList.sort((a, b) => {
      const statusOrder = { unlocked: 0, approaching: 1, locked: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    setProducts(productList);
  };

  const completedCount = complianceItems.filter(c => c.status === 'complete').length;
  const unlockedCount = products.filter(p => p.status === 'unlocked').length;
  const approachingCount = products.filter(p => p.status === 'approaching').length;
  const lockedCount = products.filter(p => p.status === 'locked').length;

  const getScoreBand = (score: number) => {
    if (score >= 900) return { label: 'Prime', color: 'var(--score-prime)', bgColor: 'rgba(200, 240, 64, 0.08)' };
    if (score >= 750) return { label: 'Ready', color: 'var(--score-ready)', bgColor: 'rgba(138, 184, 32, 0.08)' };
    if (score >= 650) return { label: 'Approaching', color: 'var(--score-approaching)', bgColor: 'rgba(56, 168, 128, 0.08)' };
    if (score >= 550) return { label: 'Developing', color: 'var(--score-developing)', bgColor: 'rgba(160, 160, 32, 0.08)' };
    if (score >= 400) return { label: 'Low', color: 'var(--score-low)', bgColor: 'rgba(200, 144, 32, 0.08)' };
    return { label: 'Critical', color: 'var(--score-critical)', bgColor: 'rgba(176, 68, 40, 0.08)' };
  };

  const scoreBand = getScoreBand(score);
  
  // Build score breakdown data
  const lenderComplianceProgress = getCategoryProgress('lender-compliance');
  const buildingCreditProgress = getCategoryProgress('business-credit');
  const documentationProgress = getCategoryProgress('business-documentation');
  
  // Create mock dimension data for display
  const allItems = getAllAuditItems();
  const scoreComplianceItems = allItems.filter(i => i.category === 'lender-compliance');
  const creditItems = allItems.filter(i => i.category === 'business-credit');
  const docItems = allItems.filter(i => i.category === 'business-documentation');
  
  const scoreData = {
    totalScore: score,
    breakdown: [
      { 
        category: 'Business Credit', 
        score: buildingCreditProgress.completed,
        maxScore: Math.max(buildingCreditProgress.total, 1),
        weight: 28,
        items: creditItems.slice(0, 5)
      },
      { 
        category: 'Documentation', 
        score: documentationProgress.completed,
        maxScore: Math.max(documentationProgress.total, 1),
        weight: 22,
        items: docItems.slice(0, 5)
      },
      { 
        category: 'Cash Flow', 
        score: Math.round(score / 1000 * 10),
        maxScore: 10,
        weight: 20,
        items: scoreComplianceItems.slice(0, 5).map(item => ({ ...item, title: 'Cash Flow Indicator' }))
      },
      { 
        category: 'Banking Relationship', 
        score: Math.round(score / 1000 * 8),
        maxScore: 8,
        weight: 13,
        items: scoreComplianceItems.slice(5, 10).map(item => ({ ...item, title: 'Banking Factor' }))
      },
      { 
        category: 'Business Structure', 
        score: lenderComplianceProgress.completed,
        maxScore: Math.max(lenderComplianceProgress.total, 1),
        weight: 10,
        items: scoreComplianceItems.slice(10, 15)
      },
      { 
        category: 'Use of Funds', 
        score: Math.round(score / 1000 * 5),
        maxScore: 5,
        weight: 7,
        items: scoreComplianceItems.slice(15, 20)
      }
    ]
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="flex capital-map-layout">
        {/* Internal Sidebar - 300px */}
        <aside
          className="sticky top-0 h-screen overflow-y-auto flex-shrink-0 capital-map-sidebar"
          style={{
            width: '300px',
            backgroundColor: 'var(--bg-surface-2)',
            borderRight: '1px solid var(--border-subtle)'
          }}
        >
          <div className="p-6 space-y-6">
            {/* FundScore Section */}
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
                className="p-4 rounded-sm mb-4"
                style={{ 
                  backgroundColor: scoreBand.bgColor,
                  border: `1px solid ${scoreBand.color}`
                }}
              >
                <div 
                  className="text-[52px] leading-none tracking-tight mb-1"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    color: scoreBand.color
                  }}
                >
                  {score}
                </div>
                <div 
                  className="text-[16px] italic"
                  style={{ 
                    fontFamily: 'var(--font-accent)',
                    fontWeight: 300,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {scoreBand.label}
                </div>
              </div>

              {/* Score Track */}
              <div className="mb-4">
                <div 
                  className="h-[6px] rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--border-subtle)' }}
                >
                  <div 
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${(score / 1000) * 100}%`,
                      background: 'linear-gradient(90deg, var(--primary-dark) 0%, var(--primary) 100%)'
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span 
                    className="text-[9px] uppercase tracking-[0.2em]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    0
                  </span>
                  <span 
                    className="text-[9px] uppercase tracking-[0.2em]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    1000
                  </span>
                </div>
              </div>

              {/* 6 Dimension Mini Bars */}
              <div className="space-y-2">
                {scoreData.breakdown.map((dim) => {
                  const percentage = Math.round((dim.score / dim.maxScore) * 100);
                  const barColor = percentage >= 70 ? 'var(--primary)' : 
                                  percentage >= 45 ? 'var(--status-approaching)' : 
                                  'var(--status-locked)';
                  
                  return (
                    <div key={dim.category}>
                      <div className="flex justify-between mb-1">
                        <span 
                          className="text-[10px] uppercase tracking-[0.12em]"
                          style={{ 
                            fontFamily: 'var(--font-body)',
                            fontWeight: 400,
                            color: 'var(--muted-foreground)'
                          }}
                        >
                          {dim.category}
                        </span>
                        <span 
                          className="text-[10px]"
                          style={{ 
                            fontFamily: 'var(--font-body)',
                            fontWeight: 400,
                            color: 'var(--foreground-secondary)'
                          }}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <div 
                        className="h-[4px] rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--border-subtle)' }}
                      >
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: barColor
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compliance Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p 
                  className="text-[9px] uppercase tracking-[0.2em]"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Lender Compliance
                </p>
                <span 
                  className="text-[11px] px-2 py-1 rounded-sm"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    backgroundColor: completedCount === 20 ? 'rgba(138, 184, 32, 0.1)' : 'rgba(200, 144, 32, 0.1)',
                    color: completedCount === 20 ? 'var(--primary)' : 'var(--status-approaching)',
                    border: `1px solid ${completedCount === 20 ? 'var(--primary)' : 'var(--status-approaching)'}`
                  }}
                >
                  {completedCount}/20
                </span>
              </div>

              {/* 20-dot grid */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                {complianceItems.map((item) => (
                  <div
                    key={item.id}
                    className="w-[14px] h-[14px] rounded-[2px]"
                    style={{
                      backgroundColor: item.status === 'complete' 
                        ? 'var(--primary)' 
                        : item.priority === 'critical'
                        ? 'var(--status-approaching)'
                        : item.priority === 'high'
                        ? '#c87020'
                        : 'var(--border-medium)',
                      border: item.status === 'complete' ? 'none' : '1px solid var(--border-medium)'
                    }}
                    title={item.title}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
                <div className="flex items-center gap-1">
                  <div className="w-[8px] h-[8px] rounded-[1px]" style={{ backgroundColor: 'var(--primary)' }} />
                  <span>Done</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-[8px] h-[8px] rounded-[1px]" style={{ backgroundColor: 'var(--status-approaching)' }} />
                  <span>Quick</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-[8px] h-[8px] rounded-[1px]" style={{ backgroundColor: '#c87020' }} />
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-[8px] h-[8px] rounded-[1px]" style={{ backgroundColor: 'var(--border-medium)' }} />
                  <span>Needed</span>
                </div>
              </div>
            </div>

            {/* Eligibility Summary */}
            <div>
              <p 
                className="text-[9px] uppercase tracking-[0.2em] mb-3"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  color: 'var(--muted-foreground)'
                }}
              >
                Product Eligibility
              </p>
              
              <div className="space-y-2">
                <div 
                  className="flex justify-between items-center p-2 rounded-sm"
                  style={{ 
                    backgroundColor: 'rgba(138, 184, 32, 0.08)',
                    border: '1px solid var(--primary)'
                  }}
                >
                  <span 
                    className="text-[11px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--foreground-secondary)'
                    }}
                  >
                    Unlocked
                  </span>
                  <span 
                    className="text-[14px]"
                    style={{ 
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      color: 'var(--primary)'
                    }}
                  >
                    {unlockedCount}
                  </span>
                </div>

                <div 
                  className="flex justify-between items-center p-2 rounded-sm"
                  style={{ 
                    backgroundColor: 'rgba(200, 144, 32, 0.08)',
                    border: '1px solid var(--status-approaching)'
                  }}
                >
                  <span 
                    className="text-[11px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--foreground-secondary)'
                    }}
                  >
                    Approaching
                  </span>
                  <span 
                    className="text-[14px]"
                    style={{ 
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      color: 'var(--status-approaching)'
                    }}
                  >
                    {approachingCount}
                  </span>
                </div>

                <div 
                  className="flex justify-between items-center p-2 rounded-sm"
                  style={{ 
                    backgroundColor: 'rgba(176, 68, 40, 0.08)',
                    border: '1px solid var(--status-locked)'
                  }}
                >
                  <span 
                    className="text-[11px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--foreground-secondary)'
                    }}
                  >
                    Locked
                  </span>
                  <span 
                    className="text-[14px]"
                    style={{ 
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      color: 'var(--status-locked)'
                    }}
                  >
                    {lockedCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {/* Top Nav with Tabs */}
          <div 
            className="sticky top-0 z-10"
            style={{ 
              backgroundColor: 'var(--bg-surface-1)',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            <div className="px-8 pt-6 pb-0">
              <h1 
                className="text-[28px] mb-6 tracking-tight"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: 'var(--foreground)'
                }}
              >
                Capital Access Map
              </h1>

              <div className="flex gap-1 capital-map-tabs">
                {[
                  { id: 'products' as TabType, label: 'Capital Access' },
                  { id: 'compliance' as TabType, label: 'Lender Compliance' },
                  { id: 'score' as TabType, label: 'FundScore™ Breakdown' },
                  { id: 'actions' as TabType, label: 'Action Plan' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-5 py-3 transition-all duration-200 relative"
                    style={{
                      fontFamily: activeTab === tab.id ? 'var(--font-display)' : 'var(--font-body)',
                      fontWeight: activeTab === tab.id ? 600 : 400,
                      fontSize: '14px',
                      color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                      backgroundColor: 'transparent'
                    }}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ backgroundColor: 'var(--primary)' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'products' && (
              <ProductsTab products={products} score={score} />
            )}
            {activeTab === 'compliance' && (
              <ComplianceTab items={complianceItems} />
            )}
            {activeTab === 'score' && (
              <ScoreBreakdownTab scoreData={scoreData} />
            )}
            {activeTab === 'actions' && (
              <ActionPlanTab />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Tab 1: Products Tab
function ProductsTab({ products, score }: { products: Product[]; score: number }) {
  const unlockedProducts = products.filter(p => p.status === 'unlocked');
  const approachingProducts = products.filter(p => p.status === 'approaching');
  const lockedProducts = products.filter(p => p.status === 'locked');

  return (
    <div className="space-y-8">
      {/* Unlocked Section */}
      {unlockedProducts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-[6px] h-[6px] rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
            />
            <h2 
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ 
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                color: 'var(--primary)'
              }}
            >
              Pre-Qualified Now
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {unlockedProducts.map((product) => (
              <ProductCard key={product.id} product={product} score={score} />
            ))}
          </div>
        </div>
      )}

      {/* Approaching Section */}
      {approachingProducts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-[6px] h-[6px] rounded-full"
              style={{ backgroundColor: 'var(--status-approaching)' }}
            />
            <h2 
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ 
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                color: 'var(--status-approaching)'
              }}
            >
              Approaching — Within Reach
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {approachingProducts.map((product) => (
              <ProductCard key={product.id} product={product} score={score} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Section */}
      {lockedProducts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="w-[6px] h-[6px] rounded-full"
              style={{ backgroundColor: 'var(--muted-foreground)' }}
            />
            <h2 
              className="text-[10px] uppercase tracking-[0.2em]"
              style={{ 
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                color: 'var(--muted-foreground)'
              }}
            >
              Locked — Gap Analysis Below
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {lockedProducts.map((product) => (
              <ProductCard key={product.id} product={product} score={score} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, score }: { product: Product; score: number }) {
  const statusConfig = {
    unlocked: {
      icon: CheckCircle,
      color: 'var(--primary)',
      bgColor: 'rgba(138, 184, 32, 0.08)',
      borderColor: 'var(--primary)',
      label: 'PRE-QUALIFIED'
    },
    approaching: {
      icon: AlertCircle,
      color: 'var(--status-approaching)',
      bgColor: 'rgba(200, 144, 32, 0.08)',
      borderColor: 'var(--status-approaching)',
      label: 'APPROACHING'
    },
    locked: {
      icon: Lock,
      color: 'var(--status-locked)',
      bgColor: 'rgba(176, 68, 40, 0.08)',
      borderColor: 'var(--border-medium)',
      label: 'LOCKED'
    }
  };

  const config = statusConfig[product.status];
  const Icon = config.icon;

  return (
    <div 
      className="p-6 rounded-sm transition-all duration-200 hover:shadow-lg"
      style={{ 
        backgroundColor: 'var(--bg-surface-2)',
        border: `1px solid ${config.borderColor}`
      }}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Icon size={20} style={{ color: config.color }} />
          <div>
            <h3 
              className="text-[14px] mb-1"
              style={{ 
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                color: 'var(--foreground)'
              }}
            >
              {product.name}
            </h3>
            <div 
              className="inline-block px-2 py-1 rounded-[2px] text-[10px] uppercase tracking-[0.12em]"
              style={{ 
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                backgroundColor: config.bgColor,
                color: config.color,
                border: `1px solid ${config.borderColor}`
              }}
            >
              {config.label}
            </div>
          </div>
        </div>

        <div 
          className="text-[28px] tracking-tight"
          style={{ 
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: config.color
          }}
        >
          {product.amountRange.split(' - ')[0]}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-4 gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div 
            className="text-[9px] uppercase tracking-[0.2em] mb-1"
            style={{ 
              fontFamily: 'var(--font-body)',
              color: 'var(--muted-foreground)'
            }}
          >
            Rate/Cost
          </div>
          <div 
            className="text-[13px]"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              color: 'var(--foreground-secondary)'
            }}
          >
            {product.rate}
          </div>
        </div>

        <div>
          <div 
            className="text-[9px] uppercase tracking-[0.2em] mb-1"
            style={{ 
              fontFamily: 'var(--font-body)',
              color: 'var(--muted-foreground)'
            }}
          >
            Funding Speed
          </div>
          <div 
            className="text-[13px]"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              color: 'var(--foreground-secondary)'
            }}
          >
            {product.speed}
          </div>
        </div>

        <div>
          <div 
            className="text-[9px] uppercase tracking-[0.2em] mb-1"
            style={{ 
              fontFamily: 'var(--font-body)',
              color: 'var(--muted-foreground)'
            }}
          >
            Min Score
          </div>
          <div 
            className="text-[13px]"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              color: score >= product.minScore ? 'var(--primary)' : 'var(--status-locked)'
            }}
          >
            {product.minScore} {score >= product.minScore && '✓'}
          </div>
        </div>

        <div>
          <div 
            className="text-[9px] uppercase tracking-[0.2em] mb-1"
            style={{ 
              fontFamily: 'var(--font-body)',
              color: 'var(--muted-foreground)'
            }}
          >
            Compliance Req
          </div>
          <div 
            className="text-[13px]"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              color: 'var(--foreground-secondary)'
            }}
          >
            {product.requiredCompliance.length} items
          </div>
        </div>
      </div>

      {/* Gap Section */}
      <div>
        {product.status === 'unlocked' && (
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded-sm"
            style={{ 
              backgroundColor: config.bgColor,
              border: `1px solid ${config.borderColor}`
            }}
          >
            <CheckCircle size={16} style={{ color: config.color }} />
            <span 
              className="text-[13px]"
              style={{ 
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                color: config.color
              }}
            >
              ✓ Pre-Qualified • All requirements met
            </span>
          </div>
        )}

        {product.status === 'approaching' && (
          <div className="space-y-2">
            {product.scoreGap > 0 && (
              <div 
                className="p-3 rounded-sm"
                style={{ 
                  backgroundColor: 'rgba(200, 144, 32, 0.05)',
                  border: '1px solid rgba(200, 144, 32, 0.4)'
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span 
                    className="text-[11px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Score Progress
                  </span>
                  <span 
                    className="text-[11px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      color: 'var(--status-approaching)'
                    }}
                  >
                    +{product.scoreGap} pts needed
                  </span>
                </div>
                <div 
                  className="h-[6px] rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--border-subtle)' }}
                >
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${(score / product.minScore) * 100}%`,
                      backgroundColor: 'var(--status-approaching)'
                    }}
                  />
                </div>
              </div>
            )}

            {product.complianceGaps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.complianceGaps.slice(0, 3).map((gap) => (
                  <span 
                    key={gap}
                    className="px-2 py-1 rounded-[2px] text-[10px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      backgroundColor: 'rgba(200, 144, 32, 0.05)',
                      color: 'var(--muted-foreground)',
                      border: '1px solid rgba(200, 144, 32, 0.2)'
                    }}
                  >
                    {gap.replace(/-/g, ' ')}
                  </span>
                ))}
                {product.complianceGaps.length > 3 && (
                  <span 
                    className="px-2 py-1 rounded-[2px] text-[10px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    +{product.complianceGaps.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {product.status === 'locked' && (
          <div className="space-y-2">
            {product.scoreGap > 0 && (
              <div 
                className="px-3 py-2 rounded-sm"
                style={{ 
                  backgroundColor: 'rgba(176, 68, 40, 0.05)',
                  border: '1px solid rgba(176, 68, 40, 0.2)'
                }}
              >
                <span 
                  className="text-[13px]"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Score {score} → {product.minScore} needed (+{product.scoreGap} pts)
                </span>
              </div>
            )}

            {product.complianceGaps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.complianceGaps.map((gap) => (
                  <span 
                    key={gap}
                    className="px-2 py-1 rounded-[2px] text-[10px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      backgroundColor: 'rgba(176, 68, 40, 0.05)',
                      color: 'var(--muted-foreground)',
                      border: '1px solid rgba(176, 68, 40, 0.2)'
                    }}
                  >
                    {gap.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Tab 2: Compliance Tab
function ComplianceTab({ items }: { items: AuditItem[] }) {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const toggleItem = (itemId: string) => {
    // This would update the businessData.ts store
    // For now, just update local state
    setLocalItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, status: item.status === 'complete' ? 'incomplete' as const : 'complete' as const }
          : item
      )
    );
    
    // Dispatch event for real update
    window.dispatchEvent(new CustomEvent('businessDataUpdated'));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {localItems.map((item, index) => {
        const isComplete = item.status === 'complete';
        
        return (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.01 }}
            className="p-5 rounded-sm cursor-pointer transition-all duration-200"
            style={{ 
              backgroundColor: isComplete ? 'rgba(138, 184, 32, 0.08)' : 'var(--bg-surface-2)',
              border: `1px solid ${isComplete ? 'var(--primary)' : 'var(--border-subtle)'}`
            }}
            onClick={() => toggleItem(item.id)}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <div 
                className="w-[20px] h-[20px] rounded-[2px] flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{ 
                  backgroundColor: isComplete ? 'var(--primary)' : 'transparent',
                  border: `2px solid ${isComplete ? 'var(--primary)' : 'var(--border-medium)'}`
                }}
              >
                {isComplete && (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path 
                      d="M1 5L4.5 8.5L11 1.5" 
                      stroke="var(--bg-base)" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-[9px] uppercase tracking-[0.2em]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 400,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Item {index + 1} of 20
                  </span>

                  {!isComplete && (
                    <span 
                      className="px-2 py-0.5 rounded-[2px] text-[9px] uppercase tracking-[0.12em]"
                      style={{ 
                        fontFamily: 'var(--font-body)',
                        fontWeight: 400,
                        backgroundColor: 
                          item.priority === 'critical' ? 'rgba(200, 144, 32, 0.1)' :
                          item.priority === 'high' ? 'rgba(200, 112, 32, 0.1)' :
                          'rgba(176, 68, 40, 0.1)',
                        color: 
                          item.priority === 'critical' ? 'var(--status-approaching)' :
                          item.priority === 'high' ? '#c87020' :
                          'var(--status-locked)',
                        border: `1px solid ${
                          item.priority === 'critical' ? 'var(--status-approaching)' :
                          item.priority === 'high' ? '#c87020' :
                          'var(--status-locked)'
                        }`
                      }}
                    >
                      {item.priority === 'critical' ? 'Quick' : 
                       item.priority === 'high' ? '30-60d' : '60d+'}
                    </span>
                  )}
                </div>

                <h3 
                  className="text-[14px] mb-2"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    color: 'var(--foreground)'
                  }}
                >
                  {item.title}
                </h3>

                <p 
                  className="text-[13px] leading-relaxed"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300,
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Tab 3: Score Breakdown Tab
function ScoreBreakdownTab({ scoreData }: { scoreData: any }) {
  const dimensionColors = {
    'Business Credit': 'var(--primary)',
    'Documentation': 'var(--status-approaching)',
    'Cash Flow': 'var(--score-approaching)',
    'Banking Relationship': '#8858c8',
    'Business Structure': 'var(--status-locked)',
    'Use of Funds': '#4a90e2'
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {scoreData.breakdown.map((dim: any) => {
        const percentage = Math.round((dim.score / dim.maxScore) * 100);
        const color = dimensionColors[dim.category as keyof typeof dimensionColors] || 'var(--primary)';
        
        return (
          <div 
            key={dim.category}
            className="p-6 rounded-sm"
            style={{ 
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 
                  className="text-[13px] uppercase tracking-[0.01em] mb-1"
                  style={{ 
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    color
                  }}
                >
                  {dim.category}
                </h3>
                <span 
                  className="text-[11px]"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  Weight: {dim.weight}%
                </span>
              </div>

              <div 
                className="text-[32px] tracking-tight"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color
                }}
              >
                {percentage}%
              </div>
            </div>

            <div 
              className="h-[6px] rounded-full overflow-hidden mb-4"
              style={{ backgroundColor: 'var(--border-subtle)' }}
            >
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: color
                }}
              />
            </div>

            <div className="space-y-2">
              {dim.items.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div 
                    className="w-[4px] h-[4px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span 
                    className="text-[12px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      color: 'var(--foreground-secondary)'
                    }}
                  >
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Tab 4: Action Plan Tab
function ActionPlanTab() {
  const actions = [
    {
      rank: 1,
      title: 'Complete 411 Directory Listing',
      why: 'Lenders verify business legitimacy through 411.com and other directories. Missing listings are red flags.',
      points: 25,
      time: 'Under 7 days',
      dimension: 'Compliance'
    },
    {
      rank: 2,
      title: 'Upload 12 months of bank statements',
      why: 'Documentation completeness is weighted at 22%. Bank statements prove cash flow patterns.',
      points: 42,
      time: '1-3 days',
      dimension: 'Documentation'
    },
    {
      rank: 3,
      title: 'Eliminate NSFs + build ADB',
      why: 'Banking relationship score is calculated from average daily balance and NSF frequency.',
      points: 35,
      time: '30-60 days',
      dimension: 'Banking'
    },
    {
      rank: 4,
      title: 'Open D&B file + 7 vendor lines',
      why: 'Business credit accounts for 28% of your score. D&B is the primary business credit bureau.',
      points: 28,
      time: '30-60 days',
      dimension: 'Credit'
    },
    {
      rank: 5,
      title: 'Write specific use-of-funds statement',
      why: 'Narrative clarity (7% weight) shows lenders you have a clear plan for capital deployment.',
      points: 18,
      time: '20 min',
      dimension: 'Narrative'
    },
    {
      rank: 6,
      title: 'Complete remaining compliance for SBA',
      why: 'SBA loans require all 20 compliance items. Completing these unlocks 5-11% rates.',
      points: 0,
      time: '60-120 days',
      dimension: 'Compliance'
    }
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      {actions.map((action) => (
        <div 
          key={action.rank}
          className="p-6 rounded-sm transition-all duration-200 hover:shadow-lg"
          style={{ 
            backgroundColor: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div className="flex gap-4">
            {/* Rank Box */}
            <div 
              className="w-[32px] h-[32px] flex items-center justify-center rounded-sm flex-shrink-0"
              style={{ 
                backgroundColor: 'var(--bg-surface-3)',
                border: '1px solid var(--border-medium)'
              }}
            >
              <span 
                className="text-[13px]"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: 'var(--foreground)'
                }}
              >
                {action.rank}
              </span>
            </div>

            <div className="flex-1">
              <h3 
                className="text-[14px] mb-2"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  color: 'var(--foreground)'
                }}
              >
                {action.title}
              </h3>

              <p 
                className="text-[13px] mb-3 leading-relaxed"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)'
                }}
              >
                {action.why}
              </p>

              <div className="flex gap-2">
                {action.points > 0 && (
                  <span 
                    className="px-3 py-1 rounded-[2px] text-[11px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      backgroundColor: 'rgba(138, 184, 32, 0.1)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary)'
                    }}
                  >
                    +{action.points} pts
                  </span>
                )}

                <span 
                  className="px-3 py-1 rounded-[2px] text-[11px]"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    backgroundColor: 'rgba(200, 144, 32, 0.1)',
                    color: 'var(--status-approaching)',
                    border: '1px solid rgba(200, 144, 32, 0.4)'
                  }}
                >
                  <Clock size={12} className="inline mr-1" />
                  {action.time}
                </span>

                <span 
                  className="px-3 py-1 rounded-[2px] text-[11px]"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    backgroundColor: 'var(--bg-surface-3)',
                    color: 'var(--muted-foreground)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  {action.dimension}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
