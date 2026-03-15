'use client';

import { motion } from 'motion/react';
import { TrendingUp, ArrowRight, Clock, CheckCircle, Zap, Target, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { CapitalUnlockForecast, getForecastSummary } from '../utils/capitalUnlockForecaster';

interface Props {
  forecast: CapitalUnlockForecast | null;
}

/**
 * CAPITAL UNLOCK FORECASTER COMPONENT
 * 
 * Strategic Purpose (from notes):
 * - Shows dramatic funding upside: "$80K today → $250K in 30 days → $1.4M in 90 days"
 * - Creates economic incentive to follow platform recommendations
 * - Answers: "What funding becomes possible if I fix this?"
 */
export function CapitalUnlockForecaster({ forecast }: Props) {
  const navigate = useNavigate();

  // Empty state - user hasn't taken assessment
  if (!forecast || forecast.currentScore === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="bg-emerald-100 p-3 rounded-lg flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-emerald-900 mb-2">
              Your Path to Capital
            </h3>
            <p className="text-sm text-emerald-700 mb-4">
              Complete your FundScore assessment to see exactly how much funding you can unlock 
              in 30, 60, and 90 days. We'll show you the specific actions with the biggest impact.
            </p>
            <Button
              onClick={() => navigate('/business-assessment')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Take Assessment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-xl border border-emerald-200 overflow-hidden"
    >
      {/* Header with headline */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              {forecast.headline}
            </h3>
            <p className="text-emerald-100 text-sm mt-1">
              {forecast.subheadline}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-emerald-200 uppercase tracking-wide">Confidence</div>
            <div className="text-white font-semibold flex items-center gap-1">
              {forecast.confidenceLevel === 'verified' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              {forecast.confidencePercent}% {forecast.confidenceLevel}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Current State */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">Current Eligibility</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              ${forecast.currentFundingMin.toLocaleString()} - ${forecast.currentFundingMax.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              (FundScore: {forecast.currentScore})
            </span>
          </div>
        </div>

        {/* Timeline - 30/60/90 days per strategic notes */}
        {forecast.timeline && forecast.timeline.length > 0 && (
          <div className="mb-8">
            <div className="text-sm text-gray-500 uppercase tracking-wide mb-4">Your Funding Timeline</div>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500" />
              
              {forecast.timeline.map((milestone, idx) => (
                <div key={idx} className="relative flex items-start gap-4 mb-6 last:mb-0">
                  {/* Circle marker */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                    idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-teal-500' : 'bg-cyan-500'
                  }`}>
                    <span className="text-white text-xs font-bold">{milestone.days}d</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{milestone.label}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        Score: {milestone.fundScore}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      ${milestone.fundingMin.toLocaleString()} - ${milestone.fundingMax.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {milestone.itemsToComplete} items to complete
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Key action: {milestone.keyAction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Actions - Top 3-5 per Master Instruction */}
        {forecast.priorityActions && forecast.priorityActions.length > 0 && (
          <div>
            <div className="text-sm text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Highest Impact Actions
            </div>
            <div className="space-y-3">
              {forecast.priorityActions.slice(0, 3).map((action, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-4 bg-white rounded-lg border border-gray-100 p-4 hover:border-emerald-300 transition-colors cursor-pointer"
                  onClick={() => navigate('/lender-compliance')}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {action.auditItem?.title || 'Complete this item'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {action.whyItMatters?.substring(0, 80)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-600 font-bold">
                      +${action.fundingImpact?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-gray-500">
                      ~{action.daysToComplete || 7} days
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <Button
            onClick={() => navigate('/lender-compliance')}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Target className="w-4 h-4" />
            Start Your Highest Impact Action
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
          {getForecastSummary(forecast)}
        </div>
      </div>
    </motion.div>
  );
}
