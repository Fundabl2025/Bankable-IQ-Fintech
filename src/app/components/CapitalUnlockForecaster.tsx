import { motion } from 'motion/react';
import { TrendingUp, Calendar, Target, Zap, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { CapitalUnlockForecast, getForecastSummary } from '../utils/capitalUnlockForecaster';

interface Props {
  forecast: CapitalUnlockForecast;
}

export function CapitalUnlockForecaster({ forecast }: Props) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-emerald-900">Your Path to Capital</h3>
          <p className="text-sm text-emerald-700">Projected timeline and funding growth</p>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-emerald-100">
        <div className="flex items-justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Current Funding Eligibility</span>
          <span className="text-xs text-emerald-600">Confidence: {forecast.confidence}%</span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-emerald-600">
            ${forecast.currentCapitalMin.toLocaleString()}
          </span>
          <span className="text-sm text-gray-600">
            to ${forecast.currentCapitalMax.toLocaleString()}
          </span>
        </div>
        <div className="text-sm text-gray-600">FundScore: {forecast.currentFundScore}/1000</div>
      </div>

      {/* Milestones Timeline */}
      {forecast.milestones.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Growth Timeline</h4>
          <div className="space-y-3">
            {forecast.milestones.map((milestone, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg p-3 border border-emerald-100 hover:border-emerald-300 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-gray-900">
                        In ~{milestone.daysToAchieve} days
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{milestone.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600">
                      ${milestone.capitalMin.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">
                      FundScore {milestone.fundScoreProjected}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Top 3 Actions */}
      {forecast.topThreeActions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Actions to Unlock Capital</h4>
          <div className="space-y-2">
            {forecast.topThreeActions.map((action, idx) => (
              <motion.div
                key={action.auditItem.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg p-3 border border-emerald-100 hover:border-emerald-300 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-gray-900 text-sm">
                        {idx + 1}. {action.auditItem.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{action.reasoning}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-600">
                        <span className="font-semibold text-emerald-600">
                          ${action.capitalUnlocked.toLocaleString()}
                        </span>{' '}
                        unlocked
                      </span>
                      <span className="text-gray-600">
                        ~{action.daysToComplete} days to complete
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {forecast.topThreeActions.length > 0 && (
        <Button
          onClick={() => navigate('/lender-compliance')}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Target className="w-4 h-4 mr-2" />
          Start on Top Priority
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}

      {/* Summary text */}
      <div className="mt-4 text-sm text-emerald-700 bg-emerald-100 rounded-lg p-3">
        {getForecastSummary(forecast)}
      </div>
    </motion.div>
  );
}
