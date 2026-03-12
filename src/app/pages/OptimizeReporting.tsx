import { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, XCircle, Target, Zap, Shield, FileText } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';

export function OptimizeReporting() {
  const [selectedBureau, setSelectedBureau] = useState<'all' | 'experian' | 'equifax' | 'dun'>('all');

  const personalCreditOptimization = [
    {
      category: 'Payment History',
      weight: '35%',
      score: 95,
      status: 'excellent',
      items: [
        { issue: 'On-time payment history', status: 'good', action: 'Continue maintaining perfect payment record' },
        { issue: 'No recent late payments', status: 'good', action: 'Keep up current practices' },
        { issue: 'No collections or charge-offs', status: 'good', action: 'Maintain clean record' }
      ]
    },
    {
      category: 'Credit Utilization',
      weight: '30%',
      score: 72,
      status: 'fair',
      items: [
        { issue: 'Overall utilization at 42%', status: 'warning', action: 'Pay down balances to below 30%' },
        { issue: 'Some cards over 50% utilized', status: 'warning', action: 'Target high utilization cards first' },
        { issue: 'Total available credit', status: 'good', action: 'Request limit increases on good accounts' }
      ]
    },
    {
      category: 'Credit History Length',
      weight: '15%',
      score: 88,
      status: 'good',
      items: [
        { issue: 'Average age: 8 years', status: 'good', action: 'Keep old accounts open' },
        { issue: 'Oldest account: 12 years', status: 'good', action: 'Maintain oldest accounts' },
        { issue: 'Recent account opened', status: 'neutral', action: 'Space out new applications' }
      ]
    },
    {
      category: 'Credit Mix',
      weight: '10%',
      score: 85,
      status: 'good',
      items: [
        { issue: 'Has revolving credit', status: 'good', action: 'Continue using credit cards responsibly' },
        { issue: 'Has installment loans', status: 'good', action: 'Maintain auto/mortgage payments' },
        { issue: 'Good account diversity', status: 'good', action: 'No action needed' }
      ]
    },
    {
      category: 'New Credit Inquiries',
      weight: '10%',
      score: 78,
      status: 'fair',
      items: [
        { issue: '3 hard inquiries (6 months)', status: 'warning', action: 'Limit new credit applications' },
        { issue: 'Rate shopping detected', status: 'neutral', action: 'Complete within 14-45 day window' },
        { issue: 'Some recent applications', status: 'neutral', action: 'Wait 6+ months before new apps' }
      ]
    }
  ];

  const businessCreditOptimization = [
    {
      bureau: 'Dun & Bradstreet',
      score: 'Paydex 78',
      status: 'good',
      optimizations: [
        { issue: 'Need more trade references', priority: 'high', action: 'Add 3-5 NET-30 vendors that report to D&B', impact: '+10 points' },
        { issue: 'Some late payments reported', priority: 'high', action: 'Ensure all payments made by due date', impact: '+5 points' },
        { issue: 'Business age under 2 years', priority: 'low', action: 'Time will improve this factor', impact: 'N/A' }
      ]
    },
    {
      bureau: 'Experian Business',
      score: 'Intelliscore Plus 65',
      status: 'fair',
      optimizations: [
        { issue: 'Limited credit file', priority: 'high', action: 'Establish more reporting tradelines', impact: '+15 points' },
        { issue: 'Credit utilization high', priority: 'high', action: 'Pay down balances below 30%', impact: '+10 points' },
        { issue: 'Recent credit inquiries', priority: 'medium', action: 'Space out applications by 90 days', impact: '+5 points' }
      ]
    },
    {
      bureau: 'Equifax Business',
      score: 'Business Credit Risk Score 520',
      status: 'fair',
      optimizations: [
        { issue: 'Incomplete business profile', priority: 'high', action: 'Update all business information', impact: '+20 points' },
        { issue: 'Missing financial data', priority: 'medium', action: 'Provide recent financial statements', impact: '+10 points' },
        { issue: 'Few reporting accounts', priority: 'high', action: 'Add accounts that report to Equifax', impact: '+15 points' }
      ]
    }
  ];

  const quickWins = [
    {
      title: 'Dispute Credit Report Errors',
      description: 'Review all 3 personal credit reports for errors and dispute inaccuracies',
      timeframe: '1-2 weeks',
      impact: 'High',
      difficulty: 'Easy'
    },
    {
      title: 'Become Authorized User',
      description: 'Ask family member with excellent credit to add you as authorized user',
      timeframe: '1-2 months',
      impact: 'High',
      difficulty: 'Easy'
    },
    {
      title: 'Pay Down High Utilization Cards',
      description: 'Target cards over 50% utilization first for maximum impact',
      timeframe: 'Immediate',
      impact: 'High',
      difficulty: 'Medium'
    },
    {
      title: 'Request Credit Limit Increases',
      description: 'Ask for increases on cards with perfect payment history',
      timeframe: '1 day',
      impact: 'Medium',
      difficulty: 'Easy'
    },
    {
      title: 'Set Up Automatic Payments',
      description: 'Never miss a payment again with autopay',
      timeframe: 'Immediate',
      impact: 'High',
      difficulty: 'Easy'
    },
    {
      title: 'Update Business Information',
      description: 'Ensure NAP consistency across all credit bureaus',
      timeframe: '1 week',
      impact: 'Medium',
      difficulty: 'Easy'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-emerald-600 to-green-600';
    if (score >= 70) return 'from-blue-600 to-cyan-600';
    if (score >= 50) return 'from-amber-600 to-orange-600';
    return 'from-red-600 to-rose-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
      case 'good':
        return <Badge variant="success">Excellent</Badge>;
      case 'fair':
        return <Badge variant="warning">Needs Work</Badge>;
      case 'poor':
        return <Badge variant="error">Critical</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'neutral':
        return <Target className="w-5 h-5 text-blue-600" />;
      default:
        return <XCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const avgPersonalScore = Math.round(
    personalCreditOptimization.reduce((sum, cat) => sum + cat.score, 0) / personalCreditOptimization.length
  );

  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Optimize Credit Reporting</h1>
            <Badge variant="info" className="text-sm px-3 py-1">
              Credit Optimization
            </Badge>
          </div>
          <p className="text-gray-600">Strategic recommendations to improve personal and business credit profiles</p>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className={`bg-gradient-to-br ${getScoreColor(avgPersonalScore)} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-white/90 text-sm mb-1">Personal Credit Health</p>
            <p className="text-4xl font-bold mb-1">{avgPersonalScore}/100</p>
            <p className="text-sm text-white/80">Average category score</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <p className="text-purple-100 text-sm mb-1">Business Credit Score</p>
            <p className="text-4xl font-bold mb-1">Paydex 78</p>
            <p className="text-sm text-purple-200">D&B Score</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Quick Wins Available</p>
            <p className="text-4xl font-bold mb-1">{quickWins.length}</p>
            <p className="text-sm text-blue-200">Action items</p>
          </div>
        </motion.div>

        {/* Quick Wins Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Wins - High Impact Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickWins.map((win, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.05) }}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={win.impact === 'High' ? 'error' : 'warning'}>
                      {win.impact} Impact
                    </Badge>
                    <Badge variant={win.difficulty === 'Easy' ? 'success' : 'warning'}>
                      {win.difficulty}
                    </Badge>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{win.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{win.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">⏱️ {win.timeframe}</span>
                  <Button size="sm" variant="outline">Take Action</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Personal Credit Optimization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Credit Optimization</h2>
          <div className="space-y-6">
            {personalCreditOptimization.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${getScoreColor(category.score)} text-white p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">{category.category}</h3>
                        <Badge variant="default" className="bg-white/20 text-white border-white/30">
                          Weight: {category.weight}
                        </Badge>
                      </div>
                      <p className="text-sm opacity-90">Impact on credit score</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">{category.score}</div>
                      <div className="text-sm opacity-90">Score</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 ${
                          item.status === 'good'
                            ? 'bg-emerald-50 border-emerald-200'
                            : item.status === 'warning'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{item.issue}</h4>
                          <p className="text-sm text-gray-600">{item.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Business Credit Optimization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Credit Optimization</h2>
          <div className="space-y-6">
            {businessCreditOptimization.map((bureau, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + (index * 0.1) }}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{bureau.bureau}</h3>
                        <p className="text-sm opacity-90">Current score: {bureau.score}</p>
                      </div>
                    </div>
                    {getStatusBadge(bureau.status)}
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {bureau.optimizations.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 ${
                          opt.priority === 'high'
                            ? 'bg-red-50 border-red-200'
                            : opt.priority === 'medium'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-current">
                          <Target className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{opt.issue}</h4>
                            <Badge variant={opt.priority === 'high' ? 'error' : opt.priority === 'medium' ? 'warning' : 'info'}>
                              {opt.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{opt.action}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-600">Potential Impact: {opt.impact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
