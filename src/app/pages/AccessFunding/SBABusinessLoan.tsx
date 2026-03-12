import { useState } from 'react';
import { 
  Shield, 
  DollarSign, 
  Calendar, 
  Clock, 
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Percent,
  FileText,
  Building2,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Award,
  LineChart,
  Briefcase,
  BadgeCheck,
  Target,
  Lock,
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

export function SBABusinessLoan() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Check if user is pre-qualified
  const isPreQualified = isProgramPreQualified('sba-business-loan');
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === 'sba-business-loan');

  const quickFacts = [
    { icon: DollarSign, label: 'Max Amount', value: '$5,000,000', color: 'info' },
    { icon: Clock, label: 'Approval Timeline', value: '1 to 5 days for approvals', color: 'accent' },
    { icon: Calendar, label: 'Funding Timeline', value: '4 to 10 weeks to funding', color: 'info' },
    { icon: Clock, label: 'Typical Overall Timeline', value: '3 to 8 weeks common', color: 'accent' },
    { icon: Calendar, label: 'Terms', value: 'SBA 7a up to 10 years, SBA 504 up to 25 years', color: 'info' },
    { icon: Percent, label: 'Rates', value: 'Prime + 1% to 2.75%', color: 'accent' },
    { icon: Calendar, label: 'Payments', value: 'Monthly', color: 'info' },
    { icon: CheckCircle2, label: 'Prepayment Penalty', value: 'None', color: 'success' }
  ];

  const benefits = [
    'Prime-based pricing and long terms can reduce borrowing cost and monthly payment pressure.',
    'Large loan amounts support expansion and refinancing.',
    'Structured monthly payments improve predictability.',
    'No prepayment penalty supports early payoff flexibility.'
  ];

  const uniqueBenefits = [
    'SBA 7a up to $5,000,000 and up to 10 year terms.',
    'SBA 504 up to 25 year terms on certain assets.',
    'Prime + 1% to 2.75% pricing.',
    'No prepayment penalty.',
    'Monthly payments.'
  ];

  const qualifications = [
    { label: 'Time in Business', value: 'Typically 2+ years for SBA 7a', icon: Calendar },
    { label: 'Minimum FICO', value: '680+ stated for common SBA pathways', icon: Shield },
    { label: 'Documentation', value: 'Full documentation is required including tax returns, bank statements, entity documents, and financials', icon: FileText },
    { label: 'Personal Guarantee', value: 'Personal guarantee required', icon: Briefcase },
    { label: 'Collateral', value: 'Collateral required for SBA 504, may be required for SBA 7a', icon: Building2 }
  ];

  const industries = [
    'Restaurants',
    'Retail',
    'Manufacturing',
    'Professional services',
    'Real estate'
  ];

  const faqs = [
    {
      question: 'What is the difference between SBA 7a and SBA 504?',
      answer: 'SBA 7a supports working capital and general business purposes with terms up to 10 years and loan amounts up to $5,000,000, while SBA 504 is designed for fixed asset purchases and can support terms up to 25 years on certain assets.'
    },
    {
      question: 'How long does funding take?',
      answer: 'Approvals can occur in 1 to 5 days, but funding can take 4 to 10 weeks, with a common overall timeline of 3 to 8 weeks stated.'
    },
    {
      question: 'Is there a prepayment penalty?',
      answer: 'No prepayment penalty is stated.'
    }
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
        {/* Header with Eligibility Status */}
        <FundingProgramHeader
          programId="sba-business-loan"
          icon={Shield}
          title="SBA Business Loan"
          description="Government-backed financing with competitive rates and long terms for established businesses."
          amount="Up to $5M"
          onApplyClick={() => setIsModalOpen(true)}
        />

        {/* Quick Facts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg border-2" style={{ borderColor: 'var(--info-border)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Quick Facts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickFacts.map((fact, index) => {
                const Icon = fact.icon;
                const colors = getColorStyles(fact.color);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="rounded-lg p-3 border-2 transition-all"
                    style={{ 
                      backgroundColor: colors.bg,
                      borderColor: 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.bg }}>
                        <Icon className="w-4 h-4" style={{ color: colors.icon }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{fact.label}</span>
                    </div>
                    <p className="text-sm font-bold leading-snug" style={{ color: colors.text }}>{fact.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* What It Is */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>What it is</h2>
            <p className="leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Government-backed loans offered through the Small Business Administration. SBA 7a loans support working capital and general business purposes with terms up to 10 years, while SBA 504 loans are designed for fixed asset purchases with terms up to 25 years.
            </p>
          </Card>
        </motion.div>

        {/* Ideal Use Case */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg border-2" style={{ 
            backgroundColor: 'var(--info-bg)',
            borderColor: 'var(--info-border)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Ideal Use Case</h2>
            <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>
              Established businesses with 2+ years of operation, strong credit, and documented financials seeking competitive rates and long-term financing for expansion, refinancing, or fixed asset purchases.
            </p>
          </Card>
        </motion.div>

        {/* Why People Choose It */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg border-2" style={{ 
            backgroundColor: 'var(--info-bg)',
            borderColor: 'var(--info-border)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Why people choose it</h2>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--info)' }}>
                    <Check className="w-4 h-4" style={{ color: 'var(--background)' }} />
                  </div>
                  <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>{benefit}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Unique Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg border-2" style={{ 
            backgroundColor: 'var(--accent-bg)',
            borderColor: 'var(--accent-border)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Unique Benefits</h2>
            <div className="space-y-3">
              {uniqueBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--accent)' }}>
                    <Check className="w-4 h-4" style={{ color: 'var(--background)' }} />
                  </div>
                  <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>{benefit}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Minimum Qualifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg border-2" style={{ 
            backgroundColor: 'var(--info-bg)',
            borderColor: 'var(--info-border)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Minimum qualifications</h2>
            <div className="space-y-3">
              {qualifications.map((qual, index) => {
                const Icon = qual.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-start gap-3 rounded-lg p-4 border"
                    style={{ 
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--info-bg)' }}>
                      <Icon className="w-5 h-5" style={{ color: 'var(--info)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{qual.label}</p>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{qual.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm italic" style={{ color: 'var(--muted-foreground)' }}>
                *Minimum Qualifications do not Guarantee Approval.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Best-Fit Industries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Top Industries by volume</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map((industry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center gap-3 rounded-lg p-4 border"
                  style={{ 
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--info-bg)' }}>
                    <Check className="w-5 h-5" style={{ color: 'var(--info)' }} />
                  </div>
                  <p style={{ color: 'var(--foreground)' }}>{industry}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="border rounded-lg overflow-hidden"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-4 py-3 flex items-center justify-between transition-colors"
                    style={{ 
                      backgroundColor: expandedFaq === index ? 'var(--surface-1)' : 'transparent',
                      color: 'var(--foreground)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                      <span className="font-semibold text-left">{faq.question}</span>
                    </div>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                    ) : (
                      <ChevronDown className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 py-3 border-t" style={{ 
                          backgroundColor: 'var(--surface-1)',
                          borderColor: 'var(--border)',
                          color: 'var(--muted-foreground)'
                        }}>
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
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
            background: 'linear-gradient(to bottom right, var(--primary-bg), var(--info-bg))',
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
        programName="SBA Business Loan"
        programAmount="Up to $5,000,000"
        programType="SBA Business Loan"
      />

      {/* Requirements Gap Modal */}
      {programData && (
        <RequirementsGapModal
          isOpen={isGapModalOpen}
          onClose={() => setIsGapModalOpen(false)}
          programName="SBA Business Loan"
          programAmount="Up to $5M"
          gapAnalysis={programData.gapAnalysis}
        />
      )}
    </div>
  );
}