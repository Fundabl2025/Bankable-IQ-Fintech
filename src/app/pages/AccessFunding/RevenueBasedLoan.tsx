import { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Clock, 
  Shield, 
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Percent,
  FileText,
  Building2,
  CreditCard,
  PackageCheck,
  Users,
  ShoppingCart,
  Briefcase,
  Box,
  Zap,
  BarChart3,
  Link2,
  CheckCircle2,
  AlertCircle,
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

export function RevenueBasedLoan() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const isPreQualified = isProgramPreQualified('revenue-based-loan');
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === 'revenue-based-loan');

  const quickFacts = [
    { icon: DollarSign, label: 'Amount', value: 'Typically $10,000 to $5,000,000, commonly capped at 10% to 30% of annual recurring revenue', color: 'warning' },
    { icon: Calendar, label: 'Term', value: 'Generally 6 to 24 months, determined by how long it takes to reach the repayment cap', color: 'accent' },
    { icon: Clock, label: 'Funding Speed', value: 'Typically 24 hours to 7 days after linking accounts', color: 'warning' },
    { icon: Percent, label: 'Payments', value: 'Flexible, a fixed percentage of monthly or weekly gross revenue, commonly 5% to 10%', color: 'primary' },
    { icon: BarChart3, label: 'Rates or Cost', value: 'Flat fee or factor rate, typically 1.1x to 1.3x principal, no compounding interest', color: 'accent' },
    { icon: Shield, label: 'Collateral', value: 'Generally unsecured, though a general business lien or personal guarantee is common', color: 'warning' },
    { icon: CheckCircle2, label: 'Prepayment Penalty', value: 'None, but because cost is a flat fee, early payoff usually does not reduce total cost unless the lender offers an early payoff discount clause', color: 'primary' },
    { icon: CheckCircle2, label: 'Pros', value: 'Payments adjust with revenue, fast funding once accounts are linked, no compounding interest, often unsecured', color: 'success' },
    { icon: AlertCircle, label: 'Cons', value: 'Total repayment is typically fixed via factor rate, lender may require lien or personal guarantee, high gross margins are commonly preferred', color: 'warning' }
  ];

  const benefits = [
    'Payments automatically adjust based on revenue, which can reduce strain during slower months.',
    'Funding can be fast when the lender can monitor revenue through linked accounts.',
    'Pricing is typically set upfront, so there is no compounding interest.'
  ];

  const uniqueBenefits = [
    'Repayment is a fixed percentage of revenue, so payments decrease automatically when revenue decreases.',
    'Pricing is based on a flat fee or factor rate, commonly 1.1x to 1.3x, with no compounding interest.'
  ];

  const qualifications = [
    { label: 'Time in Business', value: 'Typically 6 to 12 months', icon: Calendar },
    { label: 'Minimum Revenue', value: 'Typically $10,000 to $25,000 in monthly revenue', icon: DollarSign },
    { label: 'Data Access', value: 'Ability to link bank accounts and accounting or payment platforms such as QuickBooks and Stripe for real-time monitoring', icon: Link2 },
    { label: 'Profitability', value: 'Not always required, but high gross margins are commonly preferred, often 50%+', icon: TrendingUp }
  ];

  const industries = [
    'SaaS and software',
    'ECommerce',
    'Professional services with high-volume digital invoicing',
    'Subscription box services and retention-based models'
  ];

  const faqs = [
    { question: 'How are payments calculated?', answer: 'Payments are a fixed percentage of revenue, if you make $100,000 and your remittance rate is 5%, you pay $5,000, if revenue drops to $50,000, your payment drops to $2,500.' },
    { question: 'How is this different from a merchant advance?', answer: 'Revenue-based financing is typically cheaper and supports broader revenue streams like B2B and ACH, while merchant advances often focus on card swipes and can carry higher fees.' },
    { question: 'What documentation is required?', answer: 'Commonly last 3 to 6 months of business bank statements, connection to payment processor such as Stripe, PayPal, or Square, connection to accounting software, and tax returns for larger amounts.' }
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
        <FundingProgramHeader programId="revenue-based-loan" icon={TrendingUp} title="Revenue Based Loan" description="Flexible financing where repayments adjust based on your revenue performance." amount="Up to $5M" onApplyClick={() => setIsModalOpen(true)} />

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
              A financing structure where you receive capital upfront and repay it through a fixed percentage of gross revenue rather than a fixed installment. Because repayments are tied to revenue, the payment amount increases when revenue rises and decreases when revenue drops. The total repayment amount is typically determined upfront using a flat fee or factor rate, and there is no compounding interest.
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-8">
          <Card className="p-6 shadow-lg border" style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}>Ideal Use Case</h2>
            <p className="leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: 'var(--foreground)' }}>
              Businesses with steady revenue flow and strong gross margins that want repayment flexibility, especially companies that experience seasonal swings or fluctuating month-to-month revenue.
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <Card className="p-6 shadow-lg border" style={{ backgroundColor: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}>Why people choose it</h2>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--accent)' }}>
                    <Check className="w-4 h-4" style={{ color: 'var(--accent-foreground)' }} />
                  </div>
                  <p className="leading-relaxed" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: 'var(--foreground)' }}>{benefit}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
          <Card className="p-6 shadow-lg border" style={{ backgroundColor: 'var(--primary-bg)', borderColor: 'var(--primary-border)' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}>Unique Benefits</h2>
            <div className="space-y-3">
              {uniqueBenefits.map((benefit, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + index * 0.05 }} className="flex items-start gap-3">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qualifications.map((qualification, index) => {
                const Icon = qualification.icon;
                return (
                  <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.05 }} className="rounded-sm p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--success-border)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--success-bg)' }}>
                        <Icon className="w-5 h-5" style={{ color: 'var(--success)' }} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--foreground)' }}>{qualification.label}</p>
                        <p className="text-sm" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, color: 'var(--muted-foreground)' }}>{qualification.value}</p>
                      </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industries.map((industry, index) => (
                <motion.div key={index} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + index * 0.05 }} className="flex items-center gap-3 rounded-sm p-4 border" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--warning-bg)' }}>
                    <Check className="w-5 h-5" style={{ color: 'var(--warning)' }} />
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
        programName="Revenue Based Loan"
        programAmount="$10,000 to $5,000,000"
        programType="Revenue Based Loan"
      />

      {/* Requirements Gap Modal */}
      {programData && (
        <RequirementsGapModal
          isOpen={isGapModalOpen}
          onClose={() => setIsGapModalOpen(false)}
          programName="Revenue Based Loan"
          programAmount="$10K to $5M"
          gapAnalysis={programData.gapAnalysis}
        />
      )}
    </div>
  );
}
