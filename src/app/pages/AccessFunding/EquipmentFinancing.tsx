import { useState } from 'react';
import { 
  Wrench, 
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
  Building2,
  Truck,
  Package,
  BadgeCheck,
  Settings,
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

export function EquipmentFinancing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Check if user is pre-qualified
  const isPreQualified = isProgramPreQualified('equipment-financing');
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === 'equipment-financing');

  const quickFacts = [
    { icon: DollarSign, label: 'Max Amount', value: '$5,000,000', color: 'success' },
    { icon: Calendar, label: 'Term', value: '1 to 5 years', color: 'info' },
    { icon: Percent, label: 'Rates', value: 'As low as 7% (tier-driven 5% to 24.99%)', color: 'warning' },
    { icon: Clock, label: 'Funding Speed', value: '3 to 10 days', color: 'accent' },
    { icon: Package, label: 'Structure', value: 'Purchase and lease options', color: 'info' },
    { icon: BadgeCheck, label: 'Financing', value: '100% financing available', color: 'success' },
    { icon: Truck, label: 'Eligible Sales', value: 'Vendor and private sales eligible', color: 'warning' },
    { icon: Settings, label: 'Minimum Deal Size', value: 'Minimum 15k purchase or lease', color: 'info' }
  ];

  const benefits = [
    'The asset-backed structure can improve financing access because the equipment reduces lender risk.',
    'It supports a wide range of equipment categories, including trucks and trailers.',
    'It preserves working capital for payroll, inventory, and operations while still acquiring needed assets.'
  ];

  const uniqueBenefits = [
    'Purchase and lease options available.',
    'Vendor and private sales eligible.',
    'Up to 100% financing available.',
    'Designed to cover a wide range of assets, including trucks, trailers, construction equipment, kitchen equipment, medical equipment, and IT equipment.'
  ];

  const qualifications = [
    { label: 'Time in Business', value: 'Catalog baseline is 1 year, tiering also references 2+ years for startup or subprime tier', icon: Building2 },
    { label: 'Minimum FICO', value: 'Catalog baseline is 550+, tiering ranges from 450 to 750+ depending on tier', icon: TrendingUp },
    { label: 'Minimum Revenue', value: '$25k+ monthly revenue', icon: DollarSign },
    { label: 'Documentation', value: 'Equipment invoice required, and tiering may require bank statements plus tax returns, and may require tax returns or PayNet verification', icon: FileText },
    { label: 'Banking', value: 'Business bank account required, no personal accounts for sole proprietors', icon: Shield }
  ];

  const tieredApprovals = [
    {
      tier: 'Tier 1A to 2',
      details: '700 to 750+ FICO, 3 to 7+ years in business, app-only up to $350k to $500k.',
      color: 'success'
    },
    {
      tier: 'Tier 3 to 4',
      details: '600 to 675 FICO, 2+ years in business, up to $200k to $250k.',
      color: 'info'
    },
    {
      tier: 'Startup or Subprime',
      details: '450 to 650 FICO, 2+ years, 20% to 40% down payment, bank statements plus tax returns required.',
      color: 'warning'
    }
  ];

  const industries = [
    'Construction',
    'Medical',
    'Manufacturing',
    'Trucking, trailers, and logistics',
    'Restaurants'
  ];

  const faqs = [
    {
      question: 'Can I finance equipment from a private seller?',
      answer: 'Yes, vendor and private sales are eligible.'
    },
    {
      question: 'Can I lease instead of purchase?',
      answer: 'Yes, purchase and lease options are available.'
    },
    {
      question: 'How fast can it fund?',
      answer: 'Funding is typically 3 to 10 days depending on verification and tier requirements.'
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
          programId="equipment-financing"
          icon={Wrench}
          title="Equipment Financing"
          description="Finance equipment purchases or leases without draining cash reserves."
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
              Loans or leases secured by equipment such as vehicles, heavy machinery, tools, and medical devices. This financing can be used to purchase or refinance equipment, and the equipment secures the financing.
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
              Businesses that need essential equipment and want to preserve cash by financing the asset instead of paying the full cost upfront.
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
          transition={{ delay: 0.4 }}
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
                  transition={{ delay: 0.4 + index * 0.05 }}
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

        {/* Baseline Qualifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg border-2" style={{ 
            backgroundColor: 'var(--warning-bg)',
            borderColor: 'var(--warning-border)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Minimum qualifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qualifications.map((qual, index) => {
                const Icon = qual.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
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
          </Card>
        </motion.div>

        {/* Tiered Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg border-2" style={{ 
            backgroundColor: 'var(--warning-bg)',
            borderColor: 'var(--warning-border)'
          }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Tiered Approvals</h2>
            <div className="space-y-3">
              {tieredApprovals.map((approval, index) => {
                const colors = getColorStyles(approval.color);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--warning)' }}>
                      <Check className="w-4 h-4" style={{ color: 'var(--background)' }} />
                    </div>
                    <p className="leading-relaxed" style={{ color: 'var(--foreground)' }}>
                      <span className="font-bold" style={{ color: colors.text }}>{approval.tier}</span>: {approval.details}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Best-Fit Industries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>Best-fit industries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {industries.map((industry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
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
          transition={{ delay: 0.8 }}
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
                  transition={{ delay: 0.8 + index * 0.05 }}
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
          transition={{ delay: 0.9 }}
          className="mb-8"
        >
          <Card className="p-8 shadow-xl border-2 text-center" style={{ 
            background: 'linear-gradient(to bottom right, var(--primary-bg), var(--warning-bg))',
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
                  background: 'linear-gradient(to right, var(--success), var(--warning))',
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
        programName="Equipment Financing"
        programAmount="Up to $5,000,000"
        programType="Equipment Financing"
      />

      {/* Requirements Gap Modal */}
      {programData && (
        <RequirementsGapModal
          isOpen={isGapModalOpen}
          onClose={() => setIsGapModalOpen(false)}
          programName="Equipment Financing"
          programAmount="Up to $5M"
          gapAnalysis={programData.gapAnalysis}
        />
      )}
    </div>
  );
}