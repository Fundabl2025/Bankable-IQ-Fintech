import { useState } from 'react';
import { 
  Package, 
  DollarSign, 
  Calendar, 
  Clock, 
  Shield, 
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Percent,
  Building2,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Warehouse,
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

export function InventoryLineOfCredit() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Check if user is pre-qualified
  const isPreQualified = isProgramPreQualified('inventory-line-of-credit');
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === 'inventory-line-of-credit');

  const quickFacts = [
    { icon: DollarSign, label: 'Facility Size', value: '$100,000 to $10,000,000', color: 'success' },
    { icon: RefreshCw, label: 'Structure', value: 'Revolving line of credit', color: 'info' },
    { icon: TrendingUp, label: 'Availability', value: 'Line amount fluctuates as inventory fluctuates, up and down', color: 'success' },
    { icon: Percent, label: 'Advance Rate', value: 'Up to 85% financing of inventory liquidation value', color: 'info' },
    { icon: Percent, label: 'Rates', value: 'Starting at Prime + 2%', color: 'accent' },
    { icon: Clock, label: 'Funding Speed', value: '7+ days application to funding', color: 'warning' },
    { icon: Check, label: 'Pros', value: 'Scales based on inventory value, revolving access, prime-based pricing starting point', color: 'success' },
    { icon: AlertCircle, label: 'Cons', value: 'Requires inventory verification and clean reporting, availability can decrease if inventory decreases', color: 'warning' }
  ];

  const qualifications = [
    { label: 'Time in Business', value: '1 year', icon: Calendar },
    { label: 'Minimum FICO', value: 'No minimum FICO', icon: Shield },
    { label: 'Minimum Revenue', value: '$1,000,000 annual sales', icon: DollarSign },
    { label: 'Minimum Inventory', value: '$1,000,000 in current inventory', icon: Package },
    { label: 'Operational Requirements', value: 'Inventory verification and clean reporting to support valuation and monitoring', icon: AlertCircle }
  ];

  const benefits = [
    'It provides working capital access tied directly to inventory value.',
    'It supports ongoing liquidity for purchasing and scaling inventory.',
    'The revolving structure allows reuse as the line is repaid and inventory position supports availability.'
  ];

  const uniqueBenefits = [
    'Facility size: $100,000 to $10,000,000.',
    'Revolving line of credit structure.',
    'Line amount fluctuates as inventory fluctuates up and down.',
    'Rates starting at Prime + 2%.',
    'Up to 85% financing of inventory liquidation value.',
    '7+ days application to funding is stated.'
  ];

  const industries = [
    'ECommerce',
    'Wholesale and distribution',
    'Manufacturing',
    'Technology',
    'Healthcare'
  ];

  const faqs = [
    {
      question: 'Why does the line fluctuate?',
      answer: 'Because availability is tied to inventory levels and inventory liquidation value.'
    },
    {
      question: 'How much inventory value can be financed?',
      answer: 'Up to 85% of inventory liquidation value is stated.'
    },
    {
      question: 'How long does funding take?',
      answer: '7+ days application to funding is stated.'
    }
  ];

  const getColorStyles = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; icon: string } } = {
      success: { bg: 'var(--success-bg)', text: 'var(--success)', icon: 'var(--success)' },
      info: { bg: 'var(--info-bg)', text: 'var(--info)', icon: 'var(--info)' },
      accent: { bg: 'var(--accent-bg)', text: 'var(--accent)', icon: 'var(--accent)' },
      warning: { bg: 'var(--warning-bg)', text: 'var(--warning)', icon: 'var(--warning)' }
    };
    return colors[color] || colors.info;
  };

  return (
    <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-6xl mx-auto p-8">
        {/* Header with Eligibility Status */}
        <FundingProgramHeader
          programId="inventory-line-of-credit"
          icon={Package}
          title="Inventory Line of Credit"
          description="A revolving credit facility secured by inventory, where borrowing capacity is based on inventory liquidation value and can adjust upward or downward as inventory levels change."
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
          <Card className="p-6 shadow-lg border-2" style={{ borderColor: 'var(--accent-border)' }}>
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
              A revolving credit facility secured by inventory, where borrowing capacity is based on inventory liquidation value and can adjust upward or downward as inventory levels change.
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
              Inventory-heavy businesses that need working capital to purchase, carry, and scale inventory without waiting for sales cycles to convert inventory into cash.
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
            backgroundColor: 'var(--accent-bg)',
            borderColor: 'var(--accent-border)'
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
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--accent)' }}>
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
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--accent-bg)' }}>
                    <Check className="w-5 h-5" style={{ color: 'var(--accent)' }} />
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
        programName="Inventory Line of Credit"
        programAmount="$100,000 to $10,000,000"
        programType="Inventory Line of Credit"
      />

      {/* Requirements Gap Modal */}
      {programData && (
        <RequirementsGapModal
          isOpen={isGapModalOpen}
          onClose={() => setIsGapModalOpen(false)}
          programName="Inventory Line of Credit"
          programAmount="$100K to $10M"
          gapAnalysis={programData.gapAnalysis}
        />
      )}
    </div>
  );
}