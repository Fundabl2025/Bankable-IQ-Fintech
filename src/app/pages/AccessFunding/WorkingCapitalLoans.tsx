import { useState } from 'react';
import { 
  Wallet, 
  DollarSign, 
  Calendar, 
  Clock, 
  Shield, 
  TrendingUp,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  Building2,
  AlertCircle,
  CircleDollarSign,
  CheckCircle2,
  Lock,
  Target,
  Zap
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { FundingApplicationModal } from '../../components/FundingApplicationModal';
import { FundingProgramHeader } from '../../components/FundingProgramHeader';
import { isProgramPreQualified, getFundingPrograms } from '../../utils/fundingEligibility';
import { RequirementsGapModal } from '../../components/RequirementsGapModal';

export function WorkingCapitalLoans() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const isPreQualified = isProgramPreQualified('working-capital-loans');
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === 'working-capital-loans');

  const quickFacts = [
    { icon: DollarSign, label: 'Max Amount', value: '$10,000,000', color: 'success' },
    { icon: Calendar, label: 'Term', value: '6 to 24 months', color: 'info' },
    { icon: CircleDollarSign, label: 'Payments', value: 'Daily, weekly, or monthly payments available', color: 'accent' },
    { icon: Clock, label: 'Funding Speed', value: 'Same-day funding available', color: 'primary' },
    { icon: Check, label: 'Pros', value: 'Cash flow based approvals, same-day funding available, flexible payment cadence', color: 'success' },
    { icon: AlertCircle, label: 'Cons', value: 'Requires minimum monthly cash flow deposits and business banking standards', color: 'warning' }
  ];

  const qualifications = [
    { label: 'Time in Business', value: '6 months', icon: Building2 },
    { label: 'Minimum FICO', value: 'No minimum FICO score', icon: TrendingUp },
    { label: 'Minimum Revenue', value: '$10,000 minimum monthly cash flow deposits', icon: DollarSign },
    { label: 'Banking', value: 'Business bank account required, no personal accounts for sole proprietors', icon: Shield }
  ];

  const benefits = [
    'Cash flow based approvals.',
    'Same-day funding available.',
    '6 to 24 month terms available.',
    'Daily, weekly, or monthly payments available.',
    'Early payoff discounts available.'
  ];

  const industries = [
    'Construction',
    'Medical',
    'Food and beverage',
    'Retail and eCommerce',
    'Service based businesses'
  ];

  const faqs = [
    { question: 'Do I need good credit?', answer: 'No minimum FICO score is required.' },
    { question: 'What payment schedules are available?', answer: 'Daily, weekly, or monthly payments are available.' },
    { question: 'Is there an incentive to pay early?', answer: 'Early payoff discounts are available.' }
  ];

  const getColorStyles = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; icon: string } } = {
      success: { bg: 'var(--success-bg)', text: 'var(--success-foreground)', icon: 'var(--success)' },
      info: { bg: 'var(--info-bg)', text: 'var(--info-foreground)', icon: 'var(--info)' },
      accent: { bg: 'var(--accent-bg)', text: 'var(--accent-foreground)', icon: 'var(--accent)' },
      primary: { bg: 'var(--primary-bg)', text: 'var(--foreground)', icon: 'var(--primary)' },
      warning: { bg: 'var(--warning-bg)', text: 'var(--warning-foreground)', icon: 'var(--warning)' }
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto p-8">
        <FundingProgramHeader
          programId="working-capital-loans"
          icon={Wallet}
          title="Working Capital Loans"
          description="Short-term loans designed to cover day-to-day operational needs such as inventory, payroll, and overhead. Fast funding with flexible payment terms based on your cash flow."
          amount="Up to $10M"
          onApplyClick={() => setIsModalOpen(true)}
        />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <Card className="p-6 shadow-lg border" style={{ borderColor: 'var(--border-medium)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}>Quick Facts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickFacts.map((fact, index) => {
                const Icon = fact.icon;
                const colors = getColorStyles(fact.color);
                return (
                  <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }} className="rounded-sm p-3 border transition-all" style={{ backgroundColor: colors.bg, borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.bg }}>
                        <Icon className="w-4 h-4" style={{ color: colors.icon }} />
                      </div>
                      <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--muted-foreground)' }}>{fact.label}</span>
                    </div>
                    <p className="text-sm font-bold leading-snug" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: colors.text }}>{fact.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}>What it is</h2>
            <p className="leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: 'var(--foreground)' }}>
              Short-term loans designed to cover day-to-day operational needs such as inventory, payroll, and overhead. Funding speed can be same-day, and payment cadence can be daily, weekly, or monthly.
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
          <Card className="p-6 shadow-lg border" style={{ backgroundColor: 'var(--primary-bg)', borderColor: 'var(--primary-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}>Ideal Use Case</h2>
            <p className="leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: 'var(--foreground)' }}>
              Businesses needing cash flow to meet short-term obligations like payroll, inventory purchases, or seasonal expenses. Best for businesses with consistent monthly revenue who need fast access to capital.
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <Card className="p-6 shadow-lg border" style={{ backgroundColor: 'var(--info-bg)', borderColor: 'var(--info-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}>Why people choose it</h2>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--primary)' }}>
                    <Check className="w-4 h-4" style={{ color: 'var(--primary-foreground)' }} />
                  </div>
                  <p className="leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: 'var(--foreground)' }}>{benefit}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
          <Card className="p-6 shadow-lg border" style={{ backgroundColor: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}>Minimum qualifications</h2>
            <div className="space-y-3">
              {qualifications.map((qual, index) => {
                const Icon = qual.icon;
                return (
                  <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.05 }} className="flex items-start gap-3 rounded-sm p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--success-border)' }}>
                    <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--success-bg)' }}>
                      <Icon className="w-5 h-5" style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--foreground)' }}>{qual.label}</p>
                      <p className="text-sm" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: 'var(--muted-foreground)' }}>{qual.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}>Best-fit industries</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {industries.map((industry, index) => (
                <motion.div key={index} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + index * 0.05 }} className="flex items-center gap-3 rounded-sm p-4 border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--info-bg)' }}>
                    <Check className="w-5 h-5" style={{ color: 'var(--info)' }} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: 'var(--foreground)' }}>{industry}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-8">
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}>Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + index * 0.05 }}>
                    <button onClick={() => setExpandedFaq(isExpanded ? null : index)} className="w-full flex items-center justify-between p-4 rounded-sm transition-colors border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
                      <span className="font-semibold text-left" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--foreground)' }}>{faq.question}</span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} /> : <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="p-4 leading-relaxed border-l-4 ml-4 mt-2 rounded-r-sm" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--primary)', fontFamily: 'var(--font-body)', fontWeight: 300, color: 'var(--foreground)' }}>
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <Card className="p-8 shadow-xl border-2 text-center" style={{ 
            background: 'linear-gradient(to bottom right, var(--primary-bg), var(--success-bg))',
            borderColor: 'var(--primary-border)'
          }}>
            <Zap className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--primary)' }} />
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>Ready to Get Started?</h2>
            <p className="text-lg mb-6" style={{ color: 'var(--muted-foreground)' }}>
              {isPreQualified 
                ? 'You\'re pre-qualified! Complete your application to access this funding.'
                : 'Complete the Business Success Scan to see if you qualify for this program.'}
            </p>
            {isPreQualified ? (
              <Button
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="shadow-lg"
                style={{
                  background: 'linear-gradient(to right, var(--success), var(--info))',
                  color: 'var(--success-foreground)'
                }}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Start Your Application
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => setIsGapModalOpen(true)}
                variant="outline"
                className="shadow-lg"
              >
                <Target className="w-5 h-5 mr-2" />
                View Requirements
              </Button>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Application Modal */}
      <FundingApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programName="Working Capital Loans"
        programAmount="Up to $10M"
        programType="Working Capital"
      />

      {/* Requirements Gap Modal */}
      {programData && (
        <RequirementsGapModal
          isOpen={isGapModalOpen}
          onClose={() => setIsGapModalOpen(false)}
          programName="Working Capital Loans"
          programAmount="Up to $10M"
          gapAnalysis={programData.gapAnalysis}
        />
      )}
    </div>
  );
}
