// ── BuildingCredit.tsx — DEPRECATED ──────────────────────────────────────────
// This page has been superseded by CreditPath at /app/credit-path.
// CreditPath is assessment-aware, personalized, and includes Phase 3 tools.
// This file is retained for backward compatibility with any existing links.
// Navigation and sidebar no longer surface this route.
// TODO: Remove this file when no inbound links remain.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function BuildingCredit() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the live CreditPath page immediately.
    // Users who bookmarked or linked to this route will land on the current module.
    navigate('/app/credit-path', { replace: true });
  }, [navigate]);

  // Render nothing — redirect fires before paint
  return null;
}

// ── Preserved original component (renamed, unused) ───────────────────────────
// Kept below for reference during transition. Remove when redirect is confirmed stable.

import { useState } from 'react';
import { CreditCard, TrendingUp, Plus, CheckCircle, Clock, AlertCircle, DollarSign, Calendar, Award, Target } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'motion/react';

function BuildingCreditLegacy() {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'tradelines' | 'recommendations'>('roadmap');

  const creditRoadmap = [
    {
      phase: 'Phase 1: Foundation',
      timeline: 'Month 1-2',
      status: 'complete',
      steps: [
        { name: 'Obtain D-U-N-S Number', status: 'complete', description: 'Register with Dun & Bradstreet' },
        { name: 'Establish Business Credit File', status: 'complete', description: 'Create files with all 3 business bureaus' },
        { name: 'Set Up Vendor Accounts', status: 'complete', description: 'Open NET-30 vendor accounts that report' },
        { name: 'Monitor Business Credit Reports', status: 'in-progress', description: 'Regular monitoring of all bureaus' }
      ]
    },
    {
      phase: 'Phase 2: Starter Credit',
      timeline: 'Month 3-4',
      status: 'in-progress',
      steps: [
        { name: 'Apply for Starter Business Credit Cards', status: 'complete', description: 'Cards that don\'t require personal guarantee' },
        { name: 'Establish Trade Lines', status: 'in-progress', description: 'Minimum of 5 reporting trade lines' },
        { name: 'Maintain Perfect Payment History', status: 'in-progress', description: 'Pay all accounts on time' },
        { name: 'Build Credit Utilization', status: 'pending', description: 'Use less than 30% of available credit' }
      ]
    },
    {
      phase: 'Phase 3: Building Profile',
      timeline: 'Month 5-8',
      status: 'pending',
      steps: [
        { name: 'Add Fleet/Gas Cards', status: 'pending', description: 'Shell, BP, or other fleet cards' },
        { name: 'Apply for Store Credit Cards', status: 'pending', description: 'Home Depot, Staples, etc.' },
        { name: 'Increase Credit Limits', status: 'pending', description: 'Request limit increases on existing cards' },
        { name: 'Diversify Credit Mix', status: 'pending', description: 'Different types of credit accounts' }
      ]
    },
    {
      phase: 'Phase 4: Strong Credit',
      timeline: 'Month 9-12',
      status: 'pending',
      steps: [
        { name: 'Apply for Rewards Cards', status: 'pending', description: 'Premium business credit cards' },
        { name: 'Establish Credit Lines', status: 'pending', description: 'Business lines of credit' },
        { name: 'Build to 10+ Trade Lines', status: 'pending', description: 'Diverse portfolio of accounts' },
        { name: 'Optimize Credit Scores', status: 'pending', description: 'Target 80+ Paydex score' }
      ]
    },
    {
      phase: 'Phase 5: Premium Tier',
      timeline: 'Month 12+',
      status: 'pending',
      steps: [
        { name: 'High-Limit Business Cards', status: 'pending', description: '$50,000+ credit limits' },
        { name: 'Business Term Loans', status: 'pending', description: 'Qualify for term financing' },
        { name: 'SBA Loan Ready', status: 'pending', description: 'Meet SBA lending criteria' },
        { name: 'Equipment Financing', status: 'pending', description: 'Large equipment purchases' }
      ]
    }
  ];

  const currentTradelines = [
    { vendor: 'Uline', type: 'NET-30', creditLimit: 5000, balance: 1200, status: 'Active', paymentHistory: 'Excellent', reportsTo: 'D&B, Experian' },
    { vendor: 'Quill', type: 'NET-30', creditLimit: 2500, balance: 0, status: 'Active', paymentHistory: 'Excellent', reportsTo: 'D&B, Experian' },
    { vendor: 'Grainger', type: 'NET-30', creditLimit: 10000, balance: 3500, status: 'Active', paymentHistory: 'Excellent', reportsTo: 'D&B, Experian, Equifax' },
    { vendor: 'Home Depot Business', type: 'Revolving', creditLimit: 15000, balance: 4200, status: 'Active', paymentHistory: 'Good', reportsTo: 'All Bureaus' },
    { vendor: 'Amazon Business', type: 'Revolving', creditLimit: 20000, balance: 5800, status: 'Active', paymentHistory: 'Excellent', reportsTo: 'Experian' }
  ];

  const recommendations = [
    {
      category: 'Immediate Actions',
      priority: 'high',
      items: [
        { name: 'Pay Down High Balances', description: 'Reduce utilization on accounts over 30%', impact: 'High' },
        { name: 'Set Up Autopay', description: 'Ensure all payments are made on time', impact: 'High' },
        { name: 'Request Credit Limit Increases', description: 'On accounts with perfect payment history', impact: 'Medium' }
      ]
    },
    {
      category: 'Next 30 Days',
      priority: 'medium',
      items: [
        { name: 'Apply for 2 New Tradelines', description: 'Target vendors that report to all bureaus', impact: 'High' },
        { name: 'Monitor Credit Reports', description: 'Check for errors or inaccuracies', impact: 'Medium' },
        { name: 'Update Business Information', description: 'Ensure NAP consistency across all accounts', impact: 'Medium' }
      ]
    },
    {
      category: 'Long-Term Strategy',
      priority: 'low',
      items: [
        { name: 'Build to 15 Tradelines', description: 'Optimal number for strong business credit', impact: 'High' },
        { name: 'Establish Aged Tradelines', description: 'Longer credit history improves scores', impact: 'High' },
        { name: 'Diversify Credit Types', description: 'Mix of revolving, installment, and NET terms', impact: 'Medium' }
      ]
    }
  ];

  const totalCreditLimit = currentTradelines.reduce((sum, line) => sum + line.creditLimit, 0);
  const totalBalance = currentTradelines.reduce((sum, line) => sum + line.balance, 0);
  const utilization = Math.round((totalBalance / totalCreditLimit) * 100);
  const activeLines = currentTradelines.filter(line => line.status === 'Active').length;

  const getPhaseColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'from-emerald-600 to-green-600';
      case 'in-progress':
        return 'from-blue-600 to-cyan-600';
      case 'pending':
        return 'from-slate-400 to-slate-500';
      default:
        return 'from-slate-400 to-slate-500';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

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
            <h1 className="text-4xl font-bold text-gray-900">Building Business Credit</h1>
            <Badge variant="info" className="text-sm px-3 py-1">
              {activeLines} Active Tradelines
            </Badge>
          </div>
          <p className="text-gray-600">Strategic approach to building strong business credit profiles</p>
        </motion.div>

        {/* Credit Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Credit Limit</p>
            <p className="text-3xl font-bold">${totalCreditLimit.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-emerald-100 text-sm mb-1">Available Credit</p>
            <p className="text-3xl font-bold">${(totalCreditLimit - totalBalance).toLocaleString()}</p>
          </div>

          <div className={`rounded-2xl p-6 text-white shadow-lg ${
            utilization < 30 
              ? 'bg-gradient-to-br from-emerald-600 to-green-600' 
              : 'bg-gradient-to-br from-amber-600 to-orange-600'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <p className="text-white/90 text-sm mb-1">Credit Utilization</p>
            <p className="text-3xl font-bold">{utilization}%</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <p className="text-purple-100 text-sm mb-1">Active Tradelines</p>
            <p className="text-3xl font-bold">{activeLines}</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-2 shadow-md border border-slate-200 mb-8"
        >
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-slate-50'
              }`}
            >
              Credit Roadmap
            </button>
            <button
              onClick={() => setActiveTab('tradelines')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'tradelines'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-slate-50'
              }`}
            >
              Current Tradelines
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'recommendations'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-slate-50'
              }`}
            >
              Recommendations
            </button>
          </div>
        </motion.div>

        {/* Content Area */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {creditRoadmap.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${getPhaseColor(phase.status)} text-white p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{phase.phase}</h3>
                      <p className="text-sm opacity-90">{phase.timeline}</p>
                    </div>
                    <Badge variant={phase.status === 'complete' ? 'success' : phase.status === 'in-progress' ? 'info' : 'default'} className="capitalize">
                      {phase.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {phase.steps.map((step, stepIndex) => (
                      <div
                        key={stepIndex}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 ${
                          step.status === 'complete'
                            ? 'bg-emerald-50 border-emerald-200'
                            : step.status === 'in-progress'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        {getStepIcon(step.status)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{step.name}</h4>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'tradelines' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Active Tradelines</h2>
                    <p className="text-sm text-purple-100">Current credit accounts</p>
                  </div>
                </div>
                <Button className="bg-white text-purple-600 hover:bg-purple-50">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tradeline
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Vendor</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Credit Limit</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Balance</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Utilization</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Payment History</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">Reports To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTradelines.map((line, index) => {
                      const lineUtilization = Math.round((line.balance / line.creditLimit) * 100);
                      return (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-900">{line.vendor}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="info">{line.type}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-900">${line.creditLimit.toLocaleString()}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-gray-700">${line.balance.toLocaleString()}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={lineUtilization < 30 ? 'success' : 'warning'}>
                              {lineUtilization}%
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={line.paymentHistory === 'Excellent' ? 'success' : 'warning'}>
                              {line.paymentHistory}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600">{line.reportsTo}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
              >
                <div className={`p-6 ${
                  rec.priority === 'high' 
                    ? 'bg-gradient-to-r from-red-600 to-rose-600' 
                    : rec.priority === 'medium'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                } text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{rec.category}</h3>
                        <p className="text-sm opacity-90 capitalize">Priority: {rec.priority}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {rec.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <Badge variant={item.impact === 'High' ? 'error' : 'warning'}>
                              {item.impact} Impact
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
