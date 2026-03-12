import { useState, useEffect } from 'react';
import { Heart, TrendingUp, Target, DollarSign, AlertCircle, CheckCircle, Clock, Shield, Home, CreditCard, Wallet, Users, BookOpen, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  getFoundationFirstData, 
  calculateNetWorth, 
  calculateDebtToIncomeRatio,
  calculateSavingsRate,
  calculateFinancialWellnessScore,
  getFinancialWellnessGrade,
  loadFoundationFirstTestData,
  calculateIncomeReplacementRatio
} from '../../utils/foundationFirstData';
import { FoundationFirstOnboardingModal } from '../../components/FoundationFirstOnboardingModal';

export function Dashboard() {
  const [data, setData] = useState(getFoundationFirstData());
  const [wellnessScore, setWellnessScore] = useState(0);
  const [grade, setGrade] = useState('F');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    const updateData = () => {
      const freshData = getFoundationFirstData();
      setData(freshData);
      
      const score = calculateFinancialWellnessScore(freshData);
      setWellnessScore(score);
      setGrade(getFinancialWellnessGrade(score));
    };

    updateData();

    window.addEventListener('foundationFirstDataUpdated', updateData);
    return () => window.removeEventListener('foundationFirstDataUpdated', updateData);
  }, []);

  const netWorth = calculateNetWorth(data);
  const dti = calculateDebtToIncomeRatio(data);
  const savingsRate = calculateSavingsRate(data);
  const incomeReplacement = calculateIncomeReplacementRatio(data);

  const loadTestData = () => {
    loadFoundationFirstTestData();
  };

  // Generate personalized recommendations
  const recommendations = generateRecommendations(data, netWorth, dti, savingsRate, incomeReplacement);
  
  // Generate action items
  const actionItems = generateActionItems(data);

  // Calculate module completion
  const moduleCompletion = calculateModuleCompletion(data);

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">FoundationFirst</h1>
                  <p className="text-slate-600">Personal Financial Wellness</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {!data.personalProfile.profileCompleted && (
                <button
                  onClick={() => setOnboardingOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
                >
                  Complete Onboarding
                </button>
              )}
              <button
                onClick={loadTestData}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Load Test Data
              </button>
            </div>
          </div>

          {/* Welcome Message */}
          {data.personalProfile.firstName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-slate-200 rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Welcome back, {data.personalProfile.firstName}! 👋
              </h2>
              <p className="text-slate-600">
                {data.personalProfile.profileCompleted 
                  ? "Here's your personalized financial wellness overview."
                  : "Let's complete your financial profile to get personalized recommendations."}
              </p>
            </motion.div>
          )}

          {/* Financial Wellness Score - Report Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Financial Wellness Score</p>
                <div className="flex items-baseline gap-3">
                  <div className={`text-6xl font-bold ${getGradeColor(grade)}`}>{grade}</div>
                  <div className="text-2xl text-slate-600">{wellnessScore}/100</div>
                </div>
              </div>
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                <Target className="w-12 h-12 text-white" />
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(wellnessScore)}`}
                  style={{ width: `${wellnessScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">{getWellnessMessage(wellnessScore)}</p>
            </div>
          </motion.div>

          {/* Financial Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FinancialIndicatorCard
              title="Net Worth"
              value={`$${netWorth.toLocaleString()}`}
              icon={DollarSign}
              color="from-green-400 to-emerald-500"
              description="Total assets minus liabilities"
              status={netWorth > 0 ? 'good' : 'warning'}
            />

            <FinancialIndicatorCard
              title="Debt-to-Income"
              value={`${dti.toFixed(1)}%`}
              icon={TrendingUp}
              color="from-orange-400 to-red-500"
              description="Monthly debt / monthly income"
              status={dti < 36 ? 'good' : dti < 50 ? 'warning' : 'alert'}
            />

            <FinancialIndicatorCard
              title="Savings Rate"
              value={`${savingsRate.toFixed(1)}%`}
              icon={Target}
              color="from-blue-400 to-indigo-500"
              description="Monthly savings / monthly income"
              status={savingsRate >= 15 ? 'good' : savingsRate >= 5 ? 'warning' : 'alert'}
            />

            <FinancialIndicatorCard
              title="Retirement Readiness"
              value={`${incomeReplacement.toFixed(0)}%`}
              icon={Target}
              color="from-purple-400 to-pink-500"
              description="Projected income replacement"
              status={incomeReplacement >= 60 ? 'good' : incomeReplacement >= 30 ? 'warning' : 'alert'}
            />
          </div>

          {/* Two Column Layout: Track Progress + Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Track Progress */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Track Progress</h3>
                  <p className="text-xs text-slate-600">Your financial wellness journey</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Action Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-900">Action Items</h4>
                    <span className="text-xs font-medium text-slate-500">{actionItems.length} items</span>
                  </div>
                  <div className="space-y-2">
                    {actionItems.slice(0, 3).map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${getActionItemBg(item.priority)}`}>
                        <div className={`w-2 h-2 rounded-full ${getActionItemDot(item.priority)}`} />
                        <span className="text-sm text-slate-700 flex-1">{item.text}</span>
                      </div>
                    ))}
                    {actionItems.length > 3 && (
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                        View all {actionItems.length} items →
                      </button>
                    )}
                  </div>
                </div>

                {/* Planning Modules */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-900">Planning Modules</h4>
                    <span className="text-xs font-medium text-slate-500">{moduleCompletion.completed}/{moduleCompletion.total}</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Emergency Fund', complete: data.incomeAndSavings.separateEmergencyFund },
                      { name: 'Retirement Planning', complete: data.retirementOutlook.targetRetirementAge > 0 },
                      { name: 'Estate Planning', complete: data.riskManagement.estatePlanning.lastWillAndTestament },
                      { name: 'Insurance Coverage', complete: data.riskManagement.insuranceCoverage.healthInsurance && data.riskManagement.insuranceCoverage.termLifeInsurance }
                    ].map((module, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-700">{module.name}</span>
                        {module.complete ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Literacy Progress */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-900">Financial Literacy</h4>
                    <span className="text-xs font-medium text-slate-500">0/12 lessons</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-600">Start learning to improve your score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personalized Recommendations</h3>
                  <p className="text-xs text-slate-600">Based on your financial profile</p>
                </div>
              </div>

              <div className="space-y-3">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`p-4 rounded-lg ${getRecommendationBg(rec.priority)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getRecommendationIconBg(rec.priority)}`}>
                          {rec.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-900 mb-1">{rec.title}</h4>
                          <p className="text-xs text-slate-600">{rec.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-lg">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Great job!</h4>
                    <p className="text-xs text-slate-600">You're on track with your financial goals.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Plan Status */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Financial Plan Status</h3>
                <p className="text-xs text-slate-600">Complete view of your financial health</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <PlanStatusCard
                icon={<Home className="w-5 h-5" />}
                title="Assets"
                value={`$${calculateTotalAssets(data).toLocaleString()}`}
                status="info"
              />
              <PlanStatusCard
                icon={<CreditCard className="w-5 h-5" />}
                title="Liabilities"
                value={`$${calculateTotalLiabilities(data).toLocaleString()}`}
                status="warning"
              />
              <PlanStatusCard
                icon={<Wallet className="w-5 h-5" />}
                title="Monthly Income"
                value={`$${(data.incomeAndSavings.grossIncome / 12).toFixed(0)}`}
                status="success"
              />
              <PlanStatusCard
                icon={<Users className="w-5 h-5" />}
                title="Dependents"
                value={data.personalProfile.dependentChildren.toString()}
                status="info"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              title="Update Financial Profile"
              description="Keep your information current"
              icon={<Users className="w-6 h-6" />}
              color="from-blue-500 to-cyan-500"
              onClick={() => setOnboardingOpen(true)}
            />
            <QuickActionCard
              title="View Detailed Reports"
              description="Analyze your financial trends"
              icon={<BookOpen className="w-6 h-6" />}
              color="from-purple-500 to-pink-500"
            />
            <QuickActionCard
              title="Set Financial Goals"
              description="Create custom milestones"
              icon={<Target className="w-6 h-6" />}
              color="from-emerald-500 to-green-500"
            />
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <FoundationFirstOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function FinancialIndicatorCard({ title, value, icon: Icon, color, description, status }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-sm font-medium text-slate-600">{title}</div>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="flex items-center gap-2">
        <p className="text-xs text-slate-500">{description}</p>
        {status === 'good' && <div className="w-2 h-2 rounded-full bg-green-500" />}
        {status === 'warning' && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
        {status === 'alert' && <div className="w-2 h-2 rounded-full bg-red-500" />}
      </div>
    </motion.div>
  );
}

function PlanStatusCard({ icon, title, value, status }: any) {
  const bgColors = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-orange-50 border-orange-200'
  };

  const iconColors = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-orange-600'
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${bgColors[status]}`}>
      <div className={`${iconColors[status]} mb-2`}>{icon}</div>
      <div className="text-sm font-medium text-slate-600 mb-1">{title}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function QuickActionCard({ title, description, icon, color, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-4 p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all text-left"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center flex-shrink-0 text-white`}>
        {icon}
      </div>
      <div>
        <div className="font-semibold text-slate-900 mb-1">{title}</div>
        <div className="text-sm text-slate-600">{description}</div>
      </div>
    </motion.button>
  );
}

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

function generateRecommendations(data: any, netWorth: number, dti: number, savingsRate: number, incomeReplacement: number) {
  const recommendations: any[] = [];

  // Emergency Fund
  if (!data.incomeAndSavings.separateEmergencyFund) {
    recommendations.push({
      priority: 'high',
      title: 'Create an Emergency Fund',
      description: 'Build 3-6 months of expenses for unexpected costs. Start with $1,000 and gradually increase.',
      icon: <Shield className="w-4 h-4 text-orange-600" />
    });
  }

  // High DTI
  if (dti > 50) {
    recommendations.push({
      priority: 'critical',
      title: 'Reduce Debt-to-Income Ratio',
      description: `Your DTI is ${dti.toFixed(1)}% (goal: <36%). Focus on paying down high-interest debt first.`,
      icon: <AlertCircle className="w-4 h-4 text-red-600" />
    });
  }

  // Low Savings Rate
  if (savingsRate < 15) {
    recommendations.push({
      priority: 'medium',
      title: 'Increase Savings Rate',
      description: `You're saving ${savingsRate.toFixed(1)}% (goal: 15%+). Consider automating transfers to savings.`,
      icon: <Wallet className="w-4 h-4 text-blue-600" />
    });
  }

  // No Will
  if (!data.riskManagement.estatePlanning.lastWillAndTestament && data.personalProfile.dependentChildren > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Create a Will',
      description: 'With dependents, a will is essential to protect your family\'s future.',
      icon: <Users className="w-4 h-4 text-purple-600" />
    });
  }

  // Retirement Underfunded
  if (incomeReplacement < 50) {
    recommendations.push({
      priority: 'medium',
      title: 'Boost Retirement Savings',
      description: `Current path: ${incomeReplacement.toFixed(0)}% income replacement (goal: 80%). Increase contributions now.`,
      icon: <Target className="w-4 h-4 text-green-600" />
    });
  }

  // Budgeting
  if (data.incomeAndSavings.budgetFrequency === 'Never' || data.incomeAndSavings.budgetFrequency === 'Seldom') {
    recommendations.push({
      priority: 'low',
      title: 'Establish a Budget',
      description: 'Regular budgeting helps track spending and find savings opportunities.',
      icon: <DollarSign className="w-4 h-4 text-slate-600" />
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function generateActionItems(data: any) {
  const items: any[] = [];

  if (!data.personalProfile.profileCompleted) {
    items.push({ priority: 'high', text: 'Complete your financial profile onboarding' });
  }

  if (data.assetsAndDebt.bankAccounts.length === 0) {
    items.push({ priority: 'medium', text: 'Add your bank accounts' });
  }

  if (data.assetsAndDebt.retirementAccounts.length === 0) {
    items.push({ priority: 'medium', text: 'Add your retirement accounts' });
  }

  if (!data.riskManagement.insuranceCoverage.healthInsurance) {
    items.push({ priority: 'high', text: 'Verify health insurance coverage' });
  }

  if (data.personalProfile.dependentChildren > 0 && !data.riskManagement.insuranceCoverage.termLifeInsurance) {
    items.push({ priority: 'high', text: 'Consider term life insurance' });
  }

  if (data.retirementOutlook.targetRetirementAge === 0) {
    items.push({ priority: 'medium', text: 'Set a target retirement age' });
  }

  return items;
}

function calculateModuleCompletion(data: any) {
  let completed = 0;
  const total = 8;

  if (data.personalProfile.firstName && data.personalProfile.lastName) completed++;
  if (data.incomeAndSavings.grossIncome > 0) completed++;
  if (data.assetsAndDebt.bankAccounts.length > 0) completed++;
  if (data.assetsAndDebt.retirementAccounts.length > 0) completed++;
  if (data.assetsAndDebt.primaryHome.homeOwnership) completed++;
  if (data.riskManagement.creditScoreRange) completed++;
  if (data.riskManagement.insuranceCoverage.healthInsurance) completed++;
  if (data.retirementOutlook.targetRetirementAge > 0) completed++;

  return { completed, total };
}

function calculateTotalAssets(data: any) {
  let total = 0;
  total += data.assetsAndDebt.bankAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
  total += data.assetsAndDebt.retirementAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
  total += data.assetsAndDebt.primaryHome.currentHomeValue;
  total += data.assetsAndDebt.vehicles.reduce((sum: number, v: any) => sum + v.currentValue, 0);
  return total;
}

function calculateTotalLiabilities(data: any) {
  let total = 0;
  total += data.assetsAndDebt.primaryHome.oweOnMortgage;
  total += data.assetsAndDebt.vehicles.reduce((sum: number, v: any) => sum + v.loanBalance, 0);
  total += data.assetsAndDebt.creditCards.reduce((sum: number, c: any) => sum + c.balance, 0);
  return total;
}

// ============================================================================
// STYLING HELPERS
// ============================================================================

function getGradeColor(grade: string) {
  if (grade === 'A') return 'text-green-600';
  if (grade === 'B') return 'text-blue-600';
  if (grade === 'C') return 'text-yellow-600';
  if (grade === 'D') return 'text-orange-600';
  return 'text-red-600';
}

function getProgressBarColor(score: number) {
  if (score >= 80) return 'bg-gradient-to-r from-green-400 to-emerald-500';
  if (score >= 60) return 'bg-gradient-to-r from-blue-400 to-cyan-500';
  if (score >= 40) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
  return 'bg-gradient-to-r from-orange-500 to-red-500';
}

function getWellnessMessage(score: number) {
  if (score >= 90) return 'Excellent! Your financial health is outstanding.';
  if (score >= 80) return 'Great job! You\'re on a strong financial path.';
  if (score >= 70) return 'Good progress. Keep working on your financial goals.';
  if (score >= 60) return 'Fair. Focus on key areas to improve your score.';
  return 'Needs attention. Follow recommendations to improve your financial health.';
}

function getActionItemBg(priority: string) {
  if (priority === 'high') return 'bg-orange-50 border border-orange-200';
  if (priority === 'medium') return 'bg-blue-50 border border-blue-200';
  return 'bg-slate-50 border border-slate-200';
}

function getActionItemDot(priority: string) {
  if (priority === 'high') return 'bg-orange-500';
  if (priority === 'medium') return 'bg-blue-500';
  return 'bg-slate-500';
}

function getRecommendationBg(priority: string) {
  if (priority === 'critical') return 'bg-red-50 border-2 border-red-200';
  if (priority === 'high') return 'bg-orange-50 border-2 border-orange-200';
  if (priority === 'medium') return 'bg-blue-50 border-2 border-blue-200';
  return 'bg-slate-50 border-2 border-slate-200';
}

function getRecommendationIconBg(priority: string) {
  if (priority === 'critical') return 'bg-red-100';
  if (priority === 'high') return 'bg-orange-100';
  if (priority === 'medium') return 'bg-blue-100';
  return 'bg-slate-100';
}
