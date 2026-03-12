import { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  Calendar, 
  Clock, 
  Shield, 
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Percent,
  TrendingUp,
  CheckCircle2,
  FileText,
  Home,
  AlertCircle,
  Hammer,
  MapPin,
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

export function ConstructionLoans() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Check if user is pre-qualified
  const isPreQualified = isProgramPreQualified('construction-loans');
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === 'construction-loans');

  const quickFacts = [
    { icon: DollarSign, label: 'Loan Amounts', value: '$200,000 to $2,500,000', color: 'warning' },
    { icon: Shield, label: 'Minimum Credit', value: '660 FICO', color: 'info' },
    { icon: Percent, label: 'Rates', value: '11.99% to 13.99%', color: 'accent' },
    { icon: TrendingUp, label: 'Points', value: '2% to 4%', color: 'info' },
    { icon: Calendar, label: 'Payments', value: 'Monthly, interest-only', color: 'success' },
    { icon: CheckCircle2, label: 'Prepayment Penalty', value: 'None', color: 'success' },
    { icon: Percent, label: 'Loan to Land (AILTV)', value: 'Up to 65%', color: 'info' },
    { icon: Percent, label: 'Loan to Cost', value: 'Up to 85%', color: 'accent' },
    { icon: Percent, label: 'After Repair Value', value: 'Up to 70%', color: 'accent' },
    { icon: Calendar, label: 'Terms', value: '12, 18, or 24 months', color: 'accent' },
    { icon: Clock, label: 'Funding Speed', value: '3 to 5 days to close', color: 'warning' },
    { icon: Check, label: 'Pros', value: 'Fast close timeline, interest-only payments, no prepayment penalty, multiple draw method options', color: 'success' },
    { icon: AlertCircle, label: 'Cons', value: 'Investment properties only, higher rates and points than long-term financing, requires draw schedule and supporting documents', color: 'warning' }
  ];

  const qualifications = [
    { label: 'Minimum FICO', value: '660', icon: Shield },
    { label: 'Project Type and Location', value: 'Infill construction in urban or suburban areas', icon: MapPin },
    { label: 'Build Duration Requirement', value: 'Builds over 36 months must have a general contractor', icon: Hammer }
  ];

  const benefits = [
    'It supports multiple construction loan structures.',
    'It provides defined leverage limits across land value, cost, and after-repair value.',
    'A first-time builder program is available.'
  ];

  const uniqueBenefits = [
    'Loan types include purchase plus construction, refinance plus construction, and construction only.',
    'Type and location focus on infill construction in urban or suburban areas.',
    'Builds over 36 months must have a general contractor.',
    'First time builder program available.'
  ];

  const industries = [
    'Residential Land Development & Homebuilding',
    'Multi-Family & Mixed-Use Development',
    'Industrial & Cold Storage',
    'Hospitality (Hotel Development)',
    'Healthcare & Medical Facilities'
  ];

  const faqs = [
    {
      question: 'What loan structures are available?',
      answer: 'Purchase plus construction, refinance plus construction, and construction only.'
    },
    {
      question: 'Is there a first-time builder option?',
      answer: 'Yes, a first time builder program is available.'
    },
    {
      question: 'When is a GC required?',
      answer: 'Builds over 36 months must have a GC.'
    }
  ];

  const getColorStyles = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; icon: string } } = {
      emerald: { bg: 'var(--success-bg)', text: 'var(--success)', icon: 'var(--success)' },
      blue: { bg: 'var(--info-bg)', text: 'var(--info)', icon: 'var(--info)' },
      purple: { bg: 'var(--accent-bg)', text: 'var(--accent)', icon: 'var(--accent)' },
      indigo: { bg: 'var(--accent-bg)', text: 'var(--accent)', icon: 'var(--accent)' },
      violet: { bg: 'var(--accent-bg)', text: 'var(--accent)', icon: 'var(--accent)' },
      fuchsia: { bg: 'var(--accent-bg)', text: 'var(--accent)', icon: 'var(--accent)' },
      pink: { bg: 'var(--accent-bg)', text: 'var(--accent)', icon: 'var(--accent)' },
      rose: { bg: 'var(--accent-bg)', text: 'var(--accent)', icon: 'var(--accent)' },
      cyan: { bg: 'var(--info-bg)', text: 'var(--info)', icon: 'var(--info)' },
      teal: { bg: 'var(--info-bg)', text: 'var(--info)', icon: 'var(--info)' },
      green: { bg: 'var(--success-bg)', text: 'var(--success)', icon: 'var(--success)' },
      orange: { bg: 'var(--warning-bg)', text: 'var(--warning)', icon: 'var(--warning)' },
      amber: { bg: 'var(--warning-bg)', text: 'var(--warning)', icon: 'var(--warning)' },
      lime: { bg: 'var(--success-bg)', text: 'var(--success)', icon: 'var(--success)' },
      slate: { bg: 'var(--surface-1)', text: 'var(--muted-foreground)', icon: 'var(--muted-foreground)' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto p-8">
        {/* Header with Eligibility Status */}
        <FundingProgramHeader
          programId="construction-loans"
          icon={Building2}
          title="Construction Loans"
          description="Short-term financing for construction and renovation projects with draw schedules."
          amount="Up to $10M"
          onApplyClick={() => setIsModalOpen(true)}
        />

        {/* Quick Facts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg border-2" style={{ borderColor: 'var(--warning-border)' }}>
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
              Short-term construction financing for infill projects, structured as monthly interest-only payments and designed to support construction scenarios through defined leverage guidelines.
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
            backgroundColor: 'var(--warning-bg)',
            borderColor: 'var(--warning-border)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Ideal Use Case</h2>
            <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>
              Builders and developers working on infill urban or suburban projects that need short-term capital to complete construction under a structured financing program.
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
            backgroundColor: 'var(--warning-bg)',
            borderColor: 'var(--warning-border)'
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
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--warning)' }}>
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
            backgroundColor: 'var(--warning-bg)',
            borderColor: 'var(--warning-border)'
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
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--warning)' }}>
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
            backgroundColor: 'var(--warning-bg)',
            borderColor: 'var(--warning-border)'
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
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--warning-bg)' }}>
                      <Icon className="w-5 h-5" style={{ color: 'var(--warning)' }} />
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
            <div className="grid grid-cols-1 gap-4">
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--warning-bg)' }}>
                    <Check className="w-5 h-5" style={{ color: 'var(--warning)' }} />
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
        programName="Construction Loans"
        programAmount="$200,000 to $2,500,000"
        programType="Construction Loans"
      />

      {/* Requirements Gap Modal */}
      {programData && (
        <RequirementsGapModal
          isOpen={isGapModalOpen}
          onClose={() => setIsGapModalOpen(false)}
          programName="Construction Loans"
          programAmount="$200K to $2.5M"
          gapAnalysis={programData.gapAnalysis}
        />
      )}
    </div>
  );
}