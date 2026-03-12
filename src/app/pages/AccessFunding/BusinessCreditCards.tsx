import { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Clock, 
  Shield, 
  TrendingUp,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Percent,
  Zap,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Target
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { FundingApplicationModal } from '../../components/FundingApplicationModal';
import { FundingProgramHeader } from '../../components/FundingProgramHeader';
import { isProgramPreQualified, getFundingPrograms } from '../../utils/fundingEligibility';
import { RequirementsGapModal } from '../../components/RequirementsGapModal';

export function BusinessCreditCards() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Check if user is pre-qualified
  const isPreQualified = isProgramPreQualified('business-credit-cards');
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === 'business-credit-cards');

  const quickFacts = [
    { icon: Percent, label: '0% Promotional APR', value: '12 to 24 months, 0% interest up to 24 months is stated', color: 'primary' },
    { icon: Calendar, label: 'Term', value: '1 month is stated', color: 'info' },
    { icon: Clock, label: 'Funding Speed', value: '10 days', color: 'accent' },
    { icon: Zap, label: 'Payments', value: 'Not stated', color: 'info' },
    { icon: Shield, label: 'Collateral', value: 'Unsecured business credit lines based solely on personal credit', color: 'success' },
    { icon: CheckCircle2, label: 'Pros', value: '0% promotional APR up to 24 months, startup-friendly, minimal docs, can convert to cash, builds business credit rapidly for future funding', color: 'success' },
    { icon: AlertCircle, label: 'Cons', value: 'Requires strong credit, fee is 10% plus optional liquidation fees of 6%', color: 'warning' }
  ];

  const benefits = [
    'It provides 0% promotional APR access for up to 24 months.',
    'It is based solely on personal credit, which makes it startup-friendly.',
    'It is positioned as requiring minimal documentation.',
    'It can convert to cash and is positioned to build business credit rapidly for future funding.'
  ];

  const uniqueBenefits = [
    '0% promotional APR for 12 to 24 months, 0% interest up to 24 months is stated.',
    'Startup-friendly structure with minimal documentation.',
    'Can convert to cash.',
    'Builds business credit rapidly for future funding.'
  ];

  const qualifications = [
    { label: 'Minimum FICO', value: '680+', met: true },
    { label: 'Minimum Revenue', value: 'None', met: true },
    { label: 'Time in Business', value: 'None', met: true },
    { label: 'Credit profile', value: 'No recent late payments or collections', met: true },
    { label: 'Inquiries', value: 'Fewer than 4 hard inquiries in 30 days', met: true },
    { label: 'New accounts', value: 'Not many new accounts in the past 12 months', met: true },
    { label: 'Utilization', value: 'Preferably under 25%', met: true },
    { label: 'Fees', value: 'Fee is 10% plus optional liquidation fees of 6%', met: true }
  ];

  const industries = [
    'Startups and early-stage businesses',
    'Entrepreneurs with strong personal credit',
    'Businesses needing low-interest working capital for short-term execution plans'
  ];

  const faqs = [
    {
      question: 'Is this based on business revenue or personal credit?',
      answer: 'It is based solely on personal credit.'
    },
    {
      question: 'How long is the 0% promotional period?',
      answer: '12 to 24 months, with 0% interest up to 24 months stated.'
    },
    {
      question: 'How fast can I access funding?',
      answer: 'Funding speed is stated as 10 days.'
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
          programId="business-credit-cards"
          icon={CreditCard}
          title="Syndicated Line of Credit (SLOC)"
          description="Unsecured business credit lines offering 0% promotional APR for 12 to 24 months, based solely on personal credit. Designed for startups or entrepreneurs with strong credit seeking low-interest working capital."
          amount="$25K-$150K"
          onApplyClick={() => setIsModalOpen(true)}
        />

        {/* Quick Facts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg border" style={{ borderColor: 'var(--border-medium)' }}>
            <h2 
              className="text-xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700,
                color: 'var(--foreground)'
              }}
            >
              Quick Facts
            </h2>
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
                    className="rounded-sm p-3 border transition-all"
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div 
                        className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <Icon className="w-4 h-4" style={{ color: colors.icon }} />
                      </div>
                      <span 
                        className="text-xs font-medium"
                        style={{ 
                          fontFamily: 'var(--font-body)', 
                          fontWeight: 400,
                          color: 'var(--muted-foreground)'
                        }}
                      >
                        {fact.label}
                      </span>
                    </div>
                    <p 
                      className="text-sm font-bold leading-snug"
                      style={{ 
                        fontFamily: 'var(--font-body)', 
                        fontWeight: 600,
                        color: colors.text
                      }}
                    >
                      {fact.value}
                    </p>
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
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700,
                color: 'var(--foreground)'
              }}
            >
              What it is
            </h2>
            <p 
              className="leading-relaxed"
              style={{ 
                fontFamily: 'var(--font-body)', 
                fontWeight: 300,
                color: 'var(--foreground)'
              }}
            >
              Unsecured business credit lines offering 0% promotional APR for 12 to 24 months. Approval is based solely on personal credit. This is positioned as startup-friendly with minimal documentation and can be used to access low-interest working capital and convert available credit into cash.
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
          <Card 
            className="p-6 shadow-lg border"
            style={{
              backgroundColor: 'var(--primary-bg)',
              borderColor: 'var(--primary-border)'
            }}
          >
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700,
                color: 'var(--foreground)'
              }}
            >
              Ideal Use Case
            </h2>
            <p 
              className="leading-relaxed"
              style={{ 
                fontFamily: 'var(--font-body)', 
                fontWeight: 300,
                color: 'var(--foreground)'
              }}
            >
              Startups or entrepreneurs with strong personal credit who want low-interest working capital and want access to funding without traditional business revenue or time-in-business underwriting.
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
          <Card 
            className="p-6 shadow-lg border"
            style={{
              backgroundColor: 'var(--info-bg)',
              borderColor: 'var(--info-border)'
            }}
          >
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700,
                color: 'var(--foreground)'
              }}
            >
              Why people choose it
            </h2>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Check className="w-4 h-4" style={{ color: 'var(--primary-foreground)' }} />
                  </div>
                  <p 
                    className="leading-relaxed"
                    style={{ 
                      fontFamily: 'var(--font-body)', 
                      fontWeight: 300,
                      color: 'var(--foreground)'
                    }}
                  >
                    {benefit}
                  </p>
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
          <Card 
            className="p-6 shadow-lg border"
            style={{
              backgroundColor: 'var(--accent-bg)',
              borderColor: 'var(--accent-border)'
            }}
          >
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700,
                color: 'var(--foreground)'
              }}
            >
              Unique Benefits
            </h2>
            <div className="space-y-3">
              {uniqueBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <Check className="w-4 h-4" style={{ color: 'var(--accent-foreground)' }} />
                  </div>
                  <p 
                    className="leading-relaxed"
                    style={{ 
                      fontFamily: 'var(--font-body)', 
                      fontWeight: 300,
                      color: 'var(--foreground)'
                    }}
                  >
                    {benefit}
                  </p>
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
          <Card 
            className="p-6 shadow-lg border"
            style={{
              backgroundColor: 'var(--success-bg)',
              borderColor: 'var(--success-border)'
            }}
          >
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700,
                color: 'var(--foreground)'
              }}
            >
              Minimum qualifications
            </h2>
            <div className="space-y-3">
              {qualifications.map((qual, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-start gap-3 rounded-sm p-4 border"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--success-border)'
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--success-bg)' }}
                  >
                    <Check className="w-5 h-5" style={{ color: 'var(--success)' }} />
                  </div>
                  <div className="flex-1">
                    <p 
                      className="font-semibold"
                      style={{ 
                        fontFamily: 'var(--font-body)', 
                        fontWeight: 600,
                        color: 'var(--foreground)'
                      }}
                    >
                      {qual.label}
                    </p>
                    <p 
                      className="text-sm"
                      style={{ 
                        fontFamily: 'var(--font-body)', 
                        fontWeight: 300,
                        color: 'var(--muted-foreground)'
                      }}
                    >
                      {qual.value}
                    </p>
                  </div>
                </motion.div>
              ))}
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
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700,
                color: 'var(--foreground)'
              }}
            >
              Best-fit industries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {industries.map((industry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-start gap-3 rounded-sm p-4 border"
                  style={{
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--info-bg)' }}
                  >
                    <Check className="w-5 h-5" style={{ color: 'var(--info)' }} />
                  </div>
                  <p 
                    style={{ 
                      fontFamily: 'var(--font-body)', 
                      fontWeight: 300,
                      color: 'var(--foreground)'
                    }}
                  >
                    {industry}
                  </p>
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
            <h2 
              className="text-2xl font-bold mb-6"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700,
                color: 'var(--foreground)'
              }}
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full flex items-center justify-between p-4 rounded-sm transition-colors border"
                      style={{
                        backgroundColor: 'var(--surface-1)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      <span 
                        className="font-semibold text-left"
                        style={{ 
                          fontFamily: 'var(--font-body)', 
                          fontWeight: 600,
                          color: 'var(--foreground)'
                        }}
                      >
                        {faq.question}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                      ) : (
                        <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                      )}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div 
                            className="p-4 leading-relaxed border-l-4 ml-4 mt-2 rounded-r-sm"
                            style={{
                              backgroundColor: 'var(--card)',
                              borderColor: 'var(--primary)',
                              fontFamily: 'var(--font-body)', 
                              fontWeight: 300,
                              color: 'var(--foreground)'
                            }}
                          >
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
            background: 'linear-gradient(to bottom right, var(--primary-bg), var(--accent-bg))',
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
                  background: 'linear-gradient(to right, var(--success), var(--accent))',
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
        programName="Syndicated Line of Credit (SLOC)"
        programAmount="Not specified"
        programType="Business Credit Line"
      />

      {/* Requirements Gap Modal */}
      {programData && (
        <RequirementsGapModal
          isOpen={isGapModalOpen}
          onClose={() => setIsGapModalOpen(false)}
          programName="Business Credit Cards"
          programAmount="Varies"
          gapAnalysis={programData.gapAnalysis}
        />
      )}
    </div>
  );
}
