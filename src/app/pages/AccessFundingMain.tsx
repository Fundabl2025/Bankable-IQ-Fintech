import { useState } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle2, ChevronDown, ChevronUp, CreditCard as CreditCardIcon, Banknote, Zap, Check, AlertTriangle, Lock, Unlock, Target } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { getFundingPrograms, getTotalPreQualifiedAmount } from '../utils/fundingEligibility';
import { FundingApplicationModal } from '../components/FundingApplicationModal';
import { RequirementsGapModal } from '../components/RequirementsGapModal';
import { Outlet, useLocation } from 'react-router';

export function AccessFunding() {
  const location = useLocation();
  const [filter, setFilter] = useState<'all' | 'pre-qualified' | 'not-qualified'>('all');
  const [expandedPrograms, setExpandedPrograms] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<{
    name: string;
    amount: string;
    type: string;
    gapAnalysis?: any;
  } | null>(null);

  // Check if we're on a child route
  const isChildRoute = location.pathname !== '/access-funding';

  // If on a child route, render only the Outlet
  if (isChildRoute) {
    return <Outlet />;
  }

  const allPrograms = getFundingPrograms();
  const totalPreQualified = getTotalPreQualifiedAmount();

  const toggleProgramDetails = (index: number) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPrograms(newExpanded);
  };

  const handleApply = (program: any) => {
    setSelectedProgram({
      name: program.name,
      amount: program.amount,
      type: program.type
    });
    setIsModalOpen(true);
  };

  const handleViewRequirements = (program: any) => {
    setSelectedProgram({
      name: program.name,
      amount: program.amount,
      type: program.type,
      gapAnalysis: program.gapAnalysis
    });
    setIsGapModalOpen(true);
  };

  const filteredPrograms = filter === 'all' 
    ? allPrograms 
    : filter === 'pre-qualified'
    ? allPrograms.filter(p => p.status === 'pre-qualified')
    : allPrograms.filter(p => p.status === 'not-qualified');

  const preQualifiedCount = allPrograms.filter(p => p.status === 'pre-qualified').length;

  // Helper function to determine proximity status
  const getProximityStatus = (program: any) => {
    if (program.status === 'pre-qualified') return 'qualified';
    if (!program.gapAnalysis) return 'locked';
    
    const progress = program.gapAnalysis.matchScore || 0;
    if (progress >= 70) return 'close'; // 1-2 requirements away
    if (progress >= 50) return 'almost'; // Making progress
    return 'locked';
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
            <h1 className="text-4xl font-bold text-gray-900">Access Funding</h1>
            <Badge variant="info" className="text-sm px-3 py-1">
              {filteredPrograms.length} Programs Available
            </Badge>
          </div>
          <p className="text-gray-600">Explore pre-qualified funding opportunities for your business</p>
        </motion.div>

        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <TrendingUp className="w-6 h-6 text-emerald-200" />
            </div>
            <h3 className="text-3xl font-bold mb-1">
              ${(totalPreQualified / 1000).toFixed(0)}K+
            </h3>
            <p className="text-sm text-emerald-100">Total Pre-Qualified Amount</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">{preQualifiedCount}</h3>
            <p className="text-sm text-blue-100">Pre-Qualified Programs</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-1">24-48hrs</h3>
            <p className="text-sm text-purple-100">Fastest Approval Time</p>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 sticky top-0 z-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                }`}
              >
                All Programs ({allPrograms.length})
              </button>
              <button
                onClick={() => setFilter('pre-qualified')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === 'pre-qualified'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                }`}
              >
                Pre-Qualified ({preQualifiedCount})
              </button>
              <button
                onClick={() => setFilter('not-qualified')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === 'not-qualified'
                    ? 'bg-slate-600 text-white shadow-md'
                    : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
                }`}
              >
                Future Goals ({allPrograms.length - preQualifiedCount})
              </button>
            </div>
          </div>
        </motion.div>

        {/* Programs Grid */}
        <div className="space-y-4">
          {filteredPrograms.map((program, index) => {
            const isExpanded = expandedPrograms.has(index);
            const isPreQualified = program.status === 'pre-qualified';
            const proximityStatus = getProximityStatus(program);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index % 5) }}
              >
                <Card className={`overflow-hidden border-2 transition-all ${
                  isPreQualified 
                    ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50' 
                    : proximityStatus === 'close'
                    ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50'
                    : 'border-slate-200 bg-white opacity-90'
                }`}>
                  {/* Collapsed View */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {!isPreQualified && (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              proximityStatus === 'close'
                                ? 'bg-yellow-100'
                                : 'bg-slate-100'
                            }`}>
                              {proximityStatus === 'close' ? (
                                <Target className="w-5 h-5 text-yellow-600" />
                              ) : (
                                <Lock className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          )}
                          <h3 className={`text-xl font-bold ${
                            isPreQualified ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {program.name}
                          </h3>
                          <Badge variant={
                            isPreQualified ? 'success' : proximityStatus === 'close' ? 'warning' : 'default'
                          }>
                            {isPreQualified 
                              ? '✓ Pre-Qualified' 
                              : proximityStatus === 'close'
                              ? '⚡ Almost There!'
                              : '🔒 Locked'}
                          </Badge>
                        </div>
                        <p className={`text-sm mb-3 ${
                          isPreQualified ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                          {program.description}
                        </p>
                        
                        {/* Quick-Scan Metrics Bar */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isPreQualified ? 'bg-blue-100' : 'bg-slate-100'
                            }`}>
                              <CreditCardIcon className={`w-4 h-4 ${
                                isPreQualified ? 'text-blue-600' : 'text-slate-400'
                              }`} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Min FICO</p>
                              <p className={`font-bold ${
                                isPreQualified ? 'text-gray-900' : 'text-gray-500'
                              }`}>
                                {program.minFICO || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isPreQualified ? 'bg-emerald-100' : 'bg-slate-100'
                            }`}>
                              <Banknote className={`w-4 h-4 ${
                                isPreQualified ? 'text-emerald-600' : 'text-slate-400'
                              }`} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Min Revenue</p>
                              <p className={`font-bold ${
                                isPreQualified ? 'text-gray-900' : 'text-gray-500'
                              }`}>
                                {program.minRevenue || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isPreQualified ? 'bg-purple-100' : 'bg-slate-100'
                            }`}>
                              <Zap className={`w-4 h-4 ${
                                isPreQualified ? 'text-purple-600' : 'text-slate-400'
                              }`} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Funding Speed</p>
                              <p className={`font-bold ${
                                isPreQualified ? 'text-gray-900' : 'text-gray-500'
                              }`}>
                                {program.fundingSpeed || 'Varies'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Progress Indicator for Close Programs */}
                        {!isPreQualified && program.gapAnalysis && proximityStatus === 'close' && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-yellow-900">
                                {program.gapAnalysis.passedRequirements.length} of {program.gapAnalysis.passedRequirements.length + program.gapAnalysis.failedRequirements.length} Requirements Met
                              </span>
                              <span className="text-xs font-bold text-yellow-900">
                                {program.gapAnalysis.matchScore}%
                              </span>
                            </div>
                            <div className="h-2 bg-yellow-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                                style={{ width: `${program.gapAnalysis.matchScore}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 ml-6">
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${
                            isPreQualified ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {program.amount}
                          </p>
                          <p className={`text-sm ${
                            isPreQualified ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {program.rate}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <button
                        onClick={() => toggleProgramDetails(index)}
                        className={`flex items-center gap-2 font-medium text-sm transition-colors ${
                          isPreQualified 
                            ? 'text-blue-600 hover:text-blue-700' 
                            : 'text-slate-600 hover:text-slate-700'
                        }`}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            <span>Show Less</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>Learn More</span>
                          </>
                        )}
                      </button>
                      
                      {isPreQualified ? (
                        <Button
                          onClick={() => handleApply(program)}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                        >
                          Apply Now
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleViewRequirements(program)}
                          variant="outline"
                          className={`${
                            proximityStatus === 'close'
                              ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          View Requirements
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0 border-t border-slate-200 bg-white">
                          {/* What It Is */}
                          {program.whatItIs && (
                            <div className="mb-6 mt-6">
                              <h4 className="font-bold text-gray-900 mb-2">What It Is</h4>
                              <p className="text-sm text-gray-700">{program.whatItIs}</p>
                            </div>
                          )}

                          {/* Ideal For */}
                          {program.idealUseCase && (
                            <div className="mb-6">
                              <h4 className="font-bold text-gray-900 mb-2">Ideal For</h4>
                              <p className="text-sm text-gray-700">{program.idealUseCase}</p>
                            </div>
                          )}

                          {/* Pros and Cons - Two Column Layout */}
                          {(program.pros || program.cons) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              {/* Pros */}
                              {program.pros && (
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                  <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                                      <Check className="w-4 h-4 text-white" />
                                    </div>
                                    Advantages
                                  </h4>
                                  <ul className="space-y-2">
                                    {program.pros.map((pro, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-emerald-900">
                                        <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span>{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Cons */}
                              {program.cons && (
                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                  <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                    <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
                                      <AlertTriangle className="w-4 h-4 text-white" />
                                    </div>
                                    Considerations
                                  </h4>
                                  <ul className="space-y-2">
                                    {program.cons.map((con, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
                                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <span>{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Requirements Checklist */}
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <h4 className="font-bold text-gray-900 mb-3">Requirements</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {program.requirements.split(',').map((req, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                  <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <span>{req.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Apply/Requirements Button at Bottom */}
                          <div className="mt-6 flex justify-end">
                            {isPreQualified ? (
                              <Button
                                onClick={() => handleApply(program)}
                                size="lg"
                                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                              >
                                Apply Now for {program.name}
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleViewRequirements(program)}
                                size="lg"
                                variant="outline"
                                className={`${
                                  proximityStatus === 'close'
                                    ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                View Gap Analysis for {program.name}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Application Modal */}
      {selectedProgram && isModalOpen && (
        <FundingApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          programName={selectedProgram.name}
          programAmount={selectedProgram.amount}
          programType={selectedProgram.type}
        />
      )}

      {/* Requirements Gap Modal */}
      {selectedProgram && isGapModalOpen && (
        <RequirementsGapModal
          isOpen={isGapModalOpen}
          onClose={() => setIsGapModalOpen(false)}
          programName={selectedProgram.name}
          programAmount={selectedProgram.amount}
          gapAnalysis={selectedProgram.gapAnalysis}
        />
      )}
    </div>
  );
}