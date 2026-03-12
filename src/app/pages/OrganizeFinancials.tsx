import { useState } from 'react';
import { FileText, DollarSign, TrendingUp, Calendar, CheckCircle, Clock, AlertCircle, Download, Upload, PieChart } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { motion } from 'motion/react';

export function OrganizeFinancials() {
  const [activeView, setActiveView] = useState<'overview' | 'documents' | 'checklist'>('overview');

  const financialDocuments = [
    {
      category: 'Tax Returns',
      required: true,
      documents: [
        { name: '2023 Business Tax Return (Form 1120)', status: 'complete', lastUpdated: '2024-01-15' },
        { name: '2022 Business Tax Return (Form 1120)', status: 'complete', lastUpdated: '2023-04-12' },
        { name: '2023 Personal Tax Return (Form 1040)', status: 'complete', lastUpdated: '2024-01-15' },
        { name: '2022 Personal Tax Return (Form 1040)', status: 'complete', lastUpdated: '2023-04-10' }
      ]
    },
    {
      category: 'Financial Statements',
      required: true,
      documents: [
        { name: 'Profit & Loss Statement (Current YTD)', status: 'complete', lastUpdated: '2024-01-20' },
        { name: 'Balance Sheet (Current)', status: 'complete', lastUpdated: '2024-01-20' },
        { name: 'Cash Flow Statement (Q4 2023)', status: 'complete', lastUpdated: '2024-01-10' },
        { name: 'Financial Projections (12 months)', status: 'in-progress', lastUpdated: '2024-01-05' }
      ]
    },
    {
      category: 'Bank Statements',
      required: true,
      documents: [
        { name: 'Business Checking - December 2023', status: 'complete', lastUpdated: '2024-01-02' },
        { name: 'Business Checking - November 2023', status: 'complete', lastUpdated: '2023-12-01' },
        { name: 'Business Checking - October 2023', status: 'complete', lastUpdated: '2023-11-01' },
        { name: 'Business Savings - Q4 2023', status: 'complete', lastUpdated: '2024-01-02' }
      ]
    },
    {
      category: 'Corporate Records',
      required: true,
      documents: [
        { name: 'Articles of Incorporation', status: 'complete', lastUpdated: '2015-03-15' },
        { name: 'Operating Agreement', status: 'complete', lastUpdated: '2015-03-20' },
        { name: 'Business Licenses', status: 'complete', lastUpdated: '2023-01-15' },
        { name: 'EIN Confirmation Letter', status: 'complete', lastUpdated: '2015-03-10' }
      ]
    },
    {
      category: 'Supporting Documents',
      required: false,
      documents: [
        { name: 'Business Plan', status: 'complete', lastUpdated: '2023-06-01' },
        { name: 'Accounts Receivable Aging', status: 'in-progress', lastUpdated: '2024-01-18' },
        { name: 'Accounts Payable Summary', status: 'missing', lastUpdated: null },
        { name: 'Equipment & Asset List', status: 'complete', lastUpdated: '2023-12-01' }
      ]
    }
  ];

  const financialMetrics = {
    revenue: {
      current: 850000,
      previous: 720000,
      change: 18
    },
    profit: {
      current: 175000,
      previous: 145000,
      change: 20.7
    },
    assets: {
      current: 425000,
      previous: 380000,
      change: 11.8
    },
    liabilities: {
      current: 185000,
      previous: 210000,
      change: -11.9
    }
  };

  const loanReadinessChecklist = [
    {
      category: 'Financial Documentation',
      items: [
        { task: 'Current P&L statement (< 30 days old)', status: 'complete' },
        { task: 'Current balance sheet (< 30 days old)', status: 'complete' },
        { task: 'Last 2 years tax returns', status: 'complete' },
        { task: '3-6 months bank statements', status: 'complete' },
        { task: '12-month financial projections', status: 'in-progress' }
      ]
    },
    {
      category: 'Business Records',
      items: [
        { task: 'Articles of incorporation/organization', status: 'complete' },
        { task: 'Business licenses (current)', status: 'complete' },
        { task: 'Operating agreement or bylaws', status: 'complete' },
        { task: 'Ownership/partnership agreements', status: 'complete' },
        { task: 'Business insurance policies', status: 'complete' }
      ]
    },
    {
      category: 'Financial Health',
      items: [
        { task: 'Positive cash flow demonstrated', status: 'complete' },
        { task: 'Debt service coverage ratio > 1.25', status: 'complete' },
        { task: 'Working capital adequate', status: 'complete' },
        { task: 'Clean audit (if applicable)', status: 'not-applicable' },
        { task: 'Tax liens resolved', status: 'complete' }
      ]
    },
    {
      category: 'Supporting Information',
      items: [
        { task: 'Business plan with use of funds', status: 'complete' },
        { task: 'Collateral documentation (if applicable)', status: 'complete' },
        { task: 'Personal financial statement', status: 'in-progress' },
        { task: 'Accounts receivable aging report', status: 'in-progress' },
        { task: 'Equipment/inventory list', status: 'complete' }
      ]
    }
  ];

  const getAllDocuments = () => {
    return financialDocuments.flatMap(cat => cat.documents);
  };

  const getAllChecklistItems = () => {
    return loanReadinessChecklist.flatMap(cat => cat.items);
  };

  const totalDocuments = getAllDocuments().length;
  const completeDocuments = getAllDocuments().filter(doc => doc.status === 'complete').length;
  const documentPercentage = Math.round((completeDocuments / totalDocuments) * 100);

  const totalChecklist = getAllChecklistItems().filter(item => item.status !== 'not-applicable').length;
  const completeChecklist = getAllChecklistItems().filter(item => item.status === 'complete').length;
  const checklistPercentage = Math.round((completeChecklist / totalChecklist) * 100);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'complete':
        return <Badge variant="success">Complete</Badge>;
      case 'in-progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'missing':
        return <Badge variant="error">Missing</Badge>;
      case 'not-applicable':
        return <Badge variant="default">N/A</Badge>;
      default:
        return <Badge variant="error">Missing</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'not-applicable':
        return <CheckCircle className="w-5 h-5 text-slate-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
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
            <h1 className="text-4xl font-bold text-gray-900">Organize Financials</h1>
            <Badge variant="info" className="text-sm px-3 py-1">
              {checklistPercentage}% Loan Ready
            </Badge>
          </div>
          <p className="text-gray-600">Manage financial documents and ensure loan readiness</p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Document Completion</p>
            <p className="text-4xl font-bold mb-1">{documentPercentage}%</p>
            <p className="text-sm text-blue-200">{completeDocuments} of {totalDocuments} docs</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-emerald-100 text-sm mb-1">Annual Revenue</p>
            <p className="text-4xl font-bold mb-1">${(financialMetrics.revenue.current / 1000).toFixed(0)}K</p>
            <p className="text-sm text-emerald-200">+{financialMetrics.revenue.change}% YoY</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-purple-100 text-sm mb-1">Net Profit</p>
            <p className="text-4xl font-bold mb-1">${(financialMetrics.profit.current / 1000).toFixed(0)}K</p>
            <p className="text-sm text-purple-200">+{financialMetrics.profit.change}% YoY</p>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6" />
              </div>
            </div>
            <p className="text-amber-100 text-sm mb-1">Loan Readiness</p>
            <p className="text-4xl font-bold mb-1">{checklistPercentage}%</p>
            <p className="text-sm text-amber-200">{completeChecklist} of {totalChecklist} items</p>
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
              onClick={() => setActiveView('overview')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeView === 'overview'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-slate-50'
              }`}
            >
              Financial Overview
            </button>
            <button
              onClick={() => setActiveView('documents')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeView === 'documents'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-slate-50'
              }`}
            >
              Document Library
            </button>
            <button
              onClick={() => setActiveView('checklist')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeView === 'checklist'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-slate-50'
              }`}
            >
              Loan Readiness
            </button>
          </div>
        </motion.div>

        {/* Content Area */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Key Financial Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Annual Revenue</div>
                    <div className="text-2xl font-bold text-gray-900">${financialMetrics.revenue.current.toLocaleString()}</div>
                  </div>
                  <Badge variant="success">+{financialMetrics.revenue.change}%</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Net Profit</div>
                    <div className="text-2xl font-bold text-gray-900">${financialMetrics.profit.current.toLocaleString()}</div>
                  </div>
                  <Badge variant="success">+{financialMetrics.profit.change}%</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Assets</div>
                    <div className="text-2xl font-bold text-gray-900">${financialMetrics.assets.current.toLocaleString()}</div>
                  </div>
                  <Badge variant="success">+{financialMetrics.assets.change}%</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Liabilities</div>
                    <div className="text-2xl font-bold text-gray-900">${financialMetrics.liabilities.current.toLocaleString()}</div>
                  </div>
                  <Badge variant="success">{financialMetrics.liabilities.change}%</Badge>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Health Indicators</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-gray-900">Strong Cash Flow</span>
                  </div>
                  <p className="text-sm text-gray-600">Consistent positive cash flow for 12+ months</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-gray-900">Debt Management</span>
                  </div>
                  <p className="text-sm text-gray-600">Debt-to-income ratio within acceptable range</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-gray-900">Profitability</span>
                  </div>
                  <p className="text-sm text-gray-600">20%+ profit margin demonstrates strong performance</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Growth Trajectory</span>
                  </div>
                  <p className="text-sm text-gray-600">18% revenue growth year-over-year</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeView === 'documents' && (
          <div className="space-y-6">
            {financialDocuments.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
              >
                <div className={`p-6 ${
                  category.required 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                } text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{category.category}</h3>
                        <p className="text-sm opacity-90">{category.documents.length} documents</p>
                      </div>
                    </div>
                    {category.required && (
                      <Badge variant="error" className="bg-white/20 text-white border-white/30">Required</Badge>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {category.documents.map((doc, docIndex) => (
                      <div
                        key={docIndex}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                          doc.status === 'complete'
                            ? 'bg-emerald-50 border-emerald-200'
                            : doc.status === 'in-progress'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(doc.status)}
                          <div>
                            <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                            {doc.lastUpdated && (
                              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                Last updated: {doc.lastUpdated}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(doc.status)}
                          {doc.status === 'complete' && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {doc.status !== 'complete' && (
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeView === 'checklist' && (
          <div className="space-y-6">
            {loanReadinessChecklist.map((category, index) => {
              const categoryTotal = category.items.filter(i => i.status !== 'not-applicable').length;
              const categoryComplete = category.items.filter(i => i.status === 'complete').length;
              const categoryPercentage = Math.round((categoryComplete / categoryTotal) * 100);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
                >
                  <div className={`p-6 ${
                    categoryPercentage === 100
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                  } text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{category.category}</h3>
                        <p className="text-sm opacity-90">{categoryComplete} of {categoryTotal} complete</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{categoryPercentage}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                            item.status === 'complete'
                              ? 'bg-emerald-50 border-emerald-200'
                              : item.status === 'in-progress'
                              ? 'bg-amber-50 border-amber-200'
                              : item.status === 'not-applicable'
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(item.status)}
                            <span className="font-medium text-gray-900">{item.task}</span>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
