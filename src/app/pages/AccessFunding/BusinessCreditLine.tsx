import { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Shield,
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Zap,
  CreditCard,
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

export function BusinessCreditLine() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Check if user is pre-qualified
  const isPreQualified = isProgramPreQualified('business-credit-line');
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === 'business-credit-line');

  const quickFacts = [
    { icon: DollarSign, label: 'Max Line', value: '$750,000', color: 'success' },
    { icon: CreditCard, label: 'Payments', value: 'Weekly or monthly', color: 'info' },
    { icon: Clock, label: 'Funding Speed', value: 'Same-day funding available', color: 'accent' },
    { icon: Check, label: 'Pros', value: 'Cash flow based approvals, only pay on what you use, revolving structure', color: 'success' },
    { icon: AlertCircle, label: 'Cons', value: 'Must meet minimum standards, approval is not guaranteed', color: 'warning' }
  ];

  const qualifications = [
    { label: 'Time in Business', value: '1 year', icon: CreditCard },
    { label: 'Credit Score', value: '600+ FICO', icon: TrendingUp },
    { label: 'Annual Revenue', value: '$500,000 annual sales or $40,000 monthly deposits', icon: DollarSign },
    { label: 'Banking', value: 'Business bank account required, no personal accounts for sole proprietors', icon: FileText }
  ];

  const benefits = [
    'Cash flow based approvals.',
    'Same-day funding available.',
    'Only pay on usage.',
    'True revolving structure, each payment frees up available credit on the line.'
  ];

  const industries = [
    'Construction',
    'Medical',
    'Manufacturing',
    'Wholesale and distribution',
    'ECommerce'
  ];

  const faqs = [
    {
      question: 'Do I pay on the full approved amount?',
      answer: 'No, you only pay on the amount you actually use.'
    },
    {
      question: 'Does paying it down restore available credit?',
      answer: 'Yes, each payment frees up available credit on the line.'
    },
    {
      question: 'Is same-day funding guaranteed?',
      answer: 'Same-day funding is available, timing depends on approval and bank processing.'
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
          programId="business-credit-line"
          icon={TrendingUp}
          title="Business Credit Line"
          description="A revolving business line of credit that allows you to draw funds up to your approved limit. As you make payments, available credit opens back up so you can reuse the line again."
          amount="Up to $750K"
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
                    className="rounded-sm p-3 border transition-all"
                    style={{ 
                      backgroundColor: colors.bg,
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.bg }}>
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
            <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>
              A revolving business line of credit that allows you to draw funds up to your approved limit. This is a true line of credit, meaning as you make payments, available credit opens back up so you can reuse the line again.
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
          <Card className="p-6 shadow-lg border" style={{ backgroundColor: 'var(--primary-bg)', borderColor: 'var(--primary-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Ideal Use Case</h2>
            <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>
              Businesses that want ongoing access to capital for operating expenses, growth opportunities, and short-term working capital needs, without taking a full lump sum upfront.
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
          <Card className="p-6 shadow-lg border" style={{ backgroundColor: 'var(--info-bg)', borderColor: 'var(--info-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Why people choose it</h2>
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--primary)' }}>
                  <Check className="w-4 h-4" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>It is built for flexibility, you can draw what you need, when you need it.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--primary)' }}>
                  <Check className="w-4 h-4" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>You only pay based on usage rather than paying on the full approved line.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--primary)' }}>
                  <Check className="w-4 h-4" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>As you repay, the line replenishes, restoring available credit for future use.</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--primary)' }}>
                  <Check className="w-4 h-4" style={{ color: 'var(--primary-foreground)' }} />
                </div>
                <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>Same-day funding is available for qualified files.</p>
              </motion.div>
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
          <Card className="p-6 shadow-lg border" style={{ backgroundColor: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Unique Benefits</h2>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--primary)' }}>
                    <Check className="w-4 h-4" style={{ color: 'var(--primary-foreground)' }} />
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
          <Card className="p-6 shadow-lg border-2" style={{ borderColor: 'var(--info)', backgroundColor: 'var(--info-bg)' }}>
            <h2 className="mb-4" style={{ color: 'var(--foreground)' }}>Minimum qualifications</h2>
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
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
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
                Minimum qualifications do not guarantee approval.
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
            <h2 className="mb-4" style={{ color: 'var(--foreground)' }}>Best-fit industries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map((industry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center gap-3 rounded-lg p-4 border"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--success-bg)' }}>
                    <Check className="w-5 h-5" style={{ color: 'var(--success)' }} />
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
            <h2 className="mb-6" style={{ color: 'var(--foreground)' }}>Frequently Asked Questions</h2>
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
                      className="w-full flex items-center justify-between p-4 rounded-lg transition-colors border"
                      style={{ 
                        backgroundColor: 'var(--surface-2)', 
                        borderColor: 'var(--border)',
                        ':hover': { backgroundColor: 'var(--surface-3)' }
                      }}
                    >
                      <span className="font-semibold text-left" style={{ color: 'var(--foreground)' }}>{faq.question}</span>
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
                          <div className="p-4 leading-relaxed border-l-4 ml-4 mt-2 rounded-r-lg" style={{ 
                            color: 'var(--foreground)', 
                            backgroundColor: 'var(--card)', 
                            borderLeftColor: 'var(--primary)' 
                          }}>
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
        programName="Business Credit Line"
        programAmount="Up to $750,000"
        programType="Business Credit Line"
      />

      {/* Requirements Gap Modal */}
      {programData && (
        <RequirementsGapModal
          isOpen={isGapModalOpen}
          onClose={() => setIsGapModalOpen(false)}
          programName="Business Credit Line"
          programAmount="Up to $750K"
          gapAnalysis={programData.gapAnalysis}
        />
      )}
    </div>
  );
}