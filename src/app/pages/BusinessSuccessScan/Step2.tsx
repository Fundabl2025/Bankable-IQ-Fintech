// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Business Success Scan Step 2: Business Status
// Operations, revenue, banking profile, and assets
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { UnifiedProgressBar } from '../../components/UnifiedProgressBar';
import { ChevronDown } from 'lucide-react';

interface Step2Data {
  startMonth: string;
  startYear: string;
  industry: string;
  entityType: string;
  websiteUrl: string;
  monthlyRevenue: number;
  monthlyCCSales: number;
  accountsReceivable: number;
  purchaseOrders: number;
  equipmentValue: number;
  bankAccountStatus: string;
  bankAccountAge: string;
  avgMonthlyBalance: string;
  nsfOverdrafts: string;
  ownsProperty: string;
  propertyCount: number;
  propertyValue: number;
  propertyMortgage: number;
  rentalIncome: number;
  constructionProject: string;
  constructionBudget: number;
}

export function Step2() {
  const navigate = useNavigate();
  const [showPropertySection, setShowPropertySection] = useState(false);
  const [formData, setFormData] = useState<Step2Data>({
    startMonth: '',
    startYear: '',
    industry: '',
    entityType: '',
    websiteUrl: '',
    monthlyRevenue: 10000,
    monthlyCCSales: 5000,
    accountsReceivable: 0,
    purchaseOrders: 0,
    equipmentValue: 0,
    bankAccountStatus: '',
    bankAccountAge: '',
    avgMonthlyBalance: '',
    nsfOverdrafts: '',
    ownsProperty: '',
    propertyCount: 0,
    propertyValue: 0,
    propertyMortgage: 0,
    rentalIncome: 0,
    constructionProject: '',
    constructionBudget: 0,
  });

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('bss_step2');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  // Calculate business age in months
  const calculateBusinessAge = () => {
    if (!formData.startMonth || !formData.startYear) return null;
    const startDate = new Date(parseInt(formData.startYear), parseInt(formData.startMonth) - 1);
    const now = new Date();
    const months = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    return months;
  };

  const businessAgeMonths = calculateBusinessAge();
  const businessAgeYears = businessAgeMonths ? Math.floor(businessAgeMonths / 12) : 0;
  const businessAgeRemainderMonths = businessAgeMonths ? businessAgeMonths % 12 : 0;

  // Get business age threshold message
  const getBusinessAgeMessage = () => {
    if (!businessAgeMonths) return null;
    if (businessAgeMonths < 6) return { color: 'var(--destructive)', text: 'Limited alt-lender access only' };
    if (businessAgeMonths < 12) return { color: 'var(--warning)', text: 'MCAs + revenue-based products available' };
    if (businessAgeMonths < 24) return { color: 'var(--info)', text: 'Opens credit lines and most alt-lenders' };
    return { color: 'var(--primary)', text: 'Meets SBA and conventional minimums' };
  };

  const ageMessage = getBusinessAgeMessage();

  // Fill test data
  const fillTestData = () => {
    setFormData({
      startMonth: '3',
      startYear: '2021',
      industry: 'Professional Services, Technology, or Healthcare',
      entityType: 'LLC (Single-Member)',
      websiteUrl: 'https://techstartsolutions.com',
      monthlyRevenue: 35000,
      monthlyCCSales: 15000,
      accountsReceivable: 25000,
      purchaseOrders: 50000,
      equipmentValue: 45000,
      bankAccountStatus: 'dedicated',
      bankAccountAge: '24+',
      avgMonthlyBalance: '$10,000 - $25,000',
      nsfOverdrafts: 'Zero',
      ownsProperty: 'No',
      propertyCount: 0,
      propertyValue: 0,
      propertyMortgage: 0,
      rentalIncome: 0,
      constructionProject: 'No',
      constructionBudget: 0,
    });
  };

  const handleContinue = () => {
    localStorage.setItem('bss_step2', JSON.stringify(formData));
    navigate('/business-success-scan/step-3');
  };

  const handleBack = () => {
    navigate('/business-success-scan');
  };

  // Validation
  const isValid =
    formData.startMonth &&
    formData.startYear &&
    formData.industry &&
    formData.entityType &&
    formData.bankAccountStatus &&
    (formData.bankAccountStatus === 'none' || formData.bankAccountAge) &&
    formData.avgMonthlyBalance &&
    formData.nsfOverdrafts;

  // Industry risk mapping
  const getIndustryRisk = (industry: string) => {
    if (industry === 'Professional Services, Technology, or Healthcare') return { color: 'var(--primary)', text: 'Low Risk' };
    if (industry === 'Construction or Real Estate') return { color: 'var(--warning)', text: 'Moderate Risk' };
    if (industry === 'Restaurant, Food Service, or Hospitality') return { color: 'var(--destructive)', text: 'Higher Risk' };
    if (industry === 'Transportation, Trucking, or Logistics') return { color: 'var(--warning)', text: 'Moderate Risk' };
    return null;
  };

  const industryRisk = getIndustryRisk(formData.industry);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <UnifiedProgressBar currentStep={2} />

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            padding: '40px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--primary)',
                  marginBottom: '12px',
                }}
              >
                STEP 2 OF 5 - BUSINESS STATUS
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: 'var(--foreground)',
                  marginBottom: '12px',
                  lineHeight: 1.2,
                }}
              >
                Your operations, revenue, and assets.
              </h1>
              <p
                style={{
                  fontFamily: 'Crimson Pro',
                  fontSize: '16px',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  lineHeight: 1.5,
                }}
              >
                Be as accurate as possible - these numbers drive your eligibility.
              </p>
            </div>
            <button
              onClick={fillTestData}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 400,
                color: 'var(--primary)',
                border: '1px solid var(--border)',
                padding: '6px 12px',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Fill Test Data
            </button>
          </div>

          {/* GROUP 1: Business Operations */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--foreground)',
                marginBottom: '24px',
              }}
            >
              Business Operations
            </h3>

            {/* Business Start Date */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                WHEN DID YOUR BUSINESS LEGALLY START OPERATING?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <select
                  value={formData.startMonth}
                  onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: 'var(--foreground)',
                    background: 'var(--surface-3)',
                    border: '2px solid var(--border)',
                    outline: 'none',
                  }}
                >
                  <option value="">Select Month</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
                    (month, idx) => (
                      <option key={month} value={String(idx + 1)}>
                        {month}
                      </option>
                    )
                  )}
                </select>
                <select
                  value={formData.startYear}
                  onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: 'var(--foreground)',
                    background: 'var(--surface-3)',
                    border: '2px solid var(--border)',
                    outline: 'none',
                  }}
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 25 }, (_, i) => 2025 - i).map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              {businessAgeMonths !== null && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '12px' }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      marginBottom: '6px',
                    }}
                  >
                    {businessAgeYears} years, {businessAgeRemainderMonths} months in operation
                  </div>
                  {ageMessage && (
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: `${ageMessage.color}15`,
                        border: `1px solid ${ageMessage.color}`,
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        fontWeight: 400,
                        color: ageMessage.color,
                      }}
                    >
                      {ageMessage.text}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Industry Type */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                INDUSTRY TYPE
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: 'var(--foreground)',
                  background: 'var(--surface-3)',
                  border: '2px solid var(--border)',
                  outline: 'none',
                }}
              >
                <option value="">Select Industry</option>
                <option value="Professional Services, Technology, or Healthcare">Professional Services, Technology, or Healthcare</option>
                <option value="Retail, E-commerce, or Wholesale">Retail, E-commerce, or Wholesale</option>
                <option value="Construction or Real Estate">Construction or Real Estate</option>
                <option value="Restaurant, Food Service, or Hospitality">Restaurant, Food Service, or Hospitality</option>
                <option value="Transportation, Trucking, or Logistics">Transportation, Trucking, or Logistics</option>
                <option value="Other / Not listed">Other / Not listed</option>
              </select>
              {industryRisk && (
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: `${industryRisk.color}15`,
                    border: `1px solid ${industryRisk.color}`,
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: industryRisk.color,
                    marginTop: '8px',
                  }}
                >
                  {industryRisk.text}
                </div>
              )}
            </div>

            {/* Entity Type - Visual Cards */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '12px',
                }}
              >
                BUSINESS ENTITY TYPE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { value: 'Sole Proprietorship', note: 'Limited lender access', color: 'var(--warning)' },
                  { value: 'LLC (Single-Member)', note: 'Opens most alt-lending', color: 'var(--primary)' },
                  { value: 'LLC (Multi-Member) or Partnership', note: 'Strong lender signal', color: 'var(--primary)' },
                  { value: 'S-Corp or C-Corp', note: 'Strongest conventional lending signal', color: 'var(--primary)' },
                ].map((entity) => (
                  <motion.div
                    key={entity.value}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setFormData({ ...formData, entityType: entity.value })}
                    style={{
                      padding: '16px',
                      background: formData.entityType === entity.value ? `${entity.color}15` : 'var(--surface-2)',
                      border: formData.entityType === entity.value ? `2px solid ${entity.color}` : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--foreground)',
                        marginBottom: '4px',
                      }}
                    >
                      {entity.value}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        fontWeight: 300,
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {entity.note}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Website URL */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                BUSINESS WEBSITE URL <span style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>(optional)</span>
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://yourbusiness.com"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: 'var(--foreground)',
                  background: 'var(--surface-3)',
                  border: '2px solid var(--border)',
                  outline: 'none',
                }}
              />
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  marginTop: '6px',
                }}
              >
                A verifiable web presence adds +20 to your Bankable Score.
              </div>
            </div>
          </div>

          {/* GROUP 2: Revenue & Assets - Simplified with sliders */}
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--foreground)',
                marginBottom: '24px',
              }}
            >
              Revenue & Assets
            </h3>

            {/* Monthly Revenue Slider */}
            <div style={{ marginBottom: '32px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                AVERAGE MONTHLY REVENUE (LAST 6 MONTHS)
              </label>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  marginBottom: '16px',
                }}
              >
                This sets your maximum borrowing power with most lenders.
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  marginBottom: '8px',
                }}
              >
                ${formData.monthlyRevenue.toLocaleString()} / month
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  marginBottom: '4px',
                }}
              >
                Annual: ~${(formData.monthlyRevenue * 12).toLocaleString()}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'var(--info)',
                  marginBottom: '16px',
                }}
              >
                Estimated max line: ~${Math.round(formData.monthlyRevenue * 1.5).toLocaleString()}
              </div>
              <input
                type="range"
                min="0"
                max="150000"
                step="1000"
                value={formData.monthlyRevenue}
                onChange={(e) => setFormData({ ...formData, monthlyRevenue: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--border)',
                  outline: 'none',
                  appearance: 'none',
                }}
              />
              {formData.monthlyRevenue < 3000 && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'var(--warning-bg)',
                    borderLeft: '3px solid var(--warning)',
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  ⚠ Below minimum for most lenders
                </div>
              )}
              {formData.monthlyRevenue >= 3000 && formData.monthlyRevenue < 15000 && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'var(--info-bg)',
                    borderLeft: '3px solid var(--info)',
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  Opens revenue-based and working capital products
                </div>
              )}
              {formData.monthlyRevenue >= 15000 && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'var(--primary-bg)',
                    borderLeft: '3px solid var(--primary)',
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  → Full product range available at this revenue level
                </div>
              )}
            </div>

            {/* Credit Card Sales Slider */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '8px',
                }}
              >
                MONTHLY CREDIT CARD SALES
              </label>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  marginBottom: '16px',
                }}
              >
                ${formData.monthlyCCSales.toLocaleString()} / month
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={formData.monthlyCCSales}
                onChange={(e) => setFormData({ ...formData, monthlyCCSales: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--border)',
                  outline: 'none',
                  appearance: 'none',
                }}
              />
              {formData.monthlyCCSales >= 10000 && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'var(--primary-bg)',
                    borderLeft: '3px solid var(--primary)',
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  ✓ You meet the Merchant Cash Advance revenue threshold ($10K+/mo)
                </div>
              )}
            </div>
          </div>

          {/* GROUP 3: Banking Profile */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                padding: '14px 18px',
                background: 'var(--primary-bg)',
                borderLeft: '3px solid var(--primary)',
                marginBottom: '24px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Crimson Pro',
                  fontSize: '15px',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Lenders read 12 months of bank statements like a report card. This section carries heavy weight in your eligibility review.
              </p>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--foreground)',
                marginBottom: '24px',
              }}
            >
              Business Banking
            </h3>

            {/* Bank Account Status */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '12px',
                }}
              >
                DO YOU HAVE A BUSINESS BANK ACCOUNT?
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    value: 'dedicated',
                    label: 'Yes - dedicated business account',
                    sub: 'Fully separated from personal finances',
                    note: '✓ Required for virtually all lending products',
                    color: 'var(--primary)',
                  },
                  {
                    value: 'personal',
                    label: 'Yes - but I use a personal account for business',
                    sub: 'Common but limits lender access',
                    note: '⚠ Must open dedicated account before most applications',
                    color: 'var(--warning)',
                  },
                  {
                    value: 'none',
                    label: 'No - I do not have a business bank account',
                    sub: '',
                    note: '✗ Hard stop for most products - must be resolved',
                    color: 'var(--destructive)',
                  },
                ].map((option) => (
                  <motion.div
                    key={option.value}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setFormData({ ...formData, bankAccountStatus: option.value, bankAccountAge: option.value === 'none' ? '' : formData.bankAccountAge })}
                    style={{
                      padding: '16px',
                      background: formData.bankAccountStatus === option.value ? `${option.color}15` : 'var(--surface-2)',
                      border: formData.bankAccountStatus === option.value ? `2px solid ${option.color}` : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'var(--foreground)',
                        marginBottom: '4px',
                      }}
                    >
                      {option.label}
                    </div>
                    {option.sub && (
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          fontWeight: 300,
                          color: 'var(--muted-foreground)',
                          marginBottom: '8px',
                        }}
                      >
                        {option.sub}
                      </div>
                    )}
                    {formData.bankAccountStatus === option.value && (
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          fontWeight: 400,
                          color: option.color,
                        }}
                      >
                        {option.note}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bank Account Age - Conditional */}
            {formData.bankAccountStatus !== 'none' && formData.bankAccountStatus !== '' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: '24px' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 400,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--muted-foreground)',
                    marginBottom: '12px',
                  }}
                >
                  HOW LONG HAS YOUR BUSINESS BANK ACCOUNT BEEN OPEN?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { value: '0-6', label: '0-6 months', sub: 'Recent - limited history', color: 'var(--warning)' },
                    { value: '6-12', label: '6-12 months', sub: 'Approaching lender minimums', color: 'var(--info)' },
                    { value: '12-24', label: '12-24 months', sub: 'Meets most lender requirements', color: 'var(--primary)' },
                    { value: '24+', label: '24+ months', sub: 'Strong account history', color: 'var(--primary)' },
                  ].map((option) => (
                    <motion.div
                      key={option.value}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setFormData({ ...formData, bankAccountAge: option.value })}
                      style={{
                        padding: '14px',
                        background: formData.bankAccountAge === option.value ? `${option.color}15` : 'var(--surface-2)',
                        border: formData.bankAccountAge === option.value ? `2px solid ${option.color}` : '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--foreground)',
                          marginBottom: '4px',
                        }}
                      >
                        {option.label}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          fontWeight: 300,
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        {option.sub}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 300,
                    color: 'var(--muted-foreground)',
                    marginTop: '8px',
                  }}
                >
                  Most lenders require 6+ months. SBA requires 12+ months.
                </div>
              </motion.div>
            )}

            {/* Average Monthly Balance */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '12px',
                }}
              >
                AVERAGE MONTHLY BALANCE IN YOUR BUSINESS ACCOUNT
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { value: 'negative', label: 'Near zero or negative', color: 'var(--destructive)' },
                  { value: '500-2000', label: '$500 - $2,000', color: 'var(--warning)' },
                  { value: '$2,000 - $10,000', label: '$2,000 - $10,000', color: 'var(--info)' },
                  { value: '$10,000 - $25,000', label: '$10,000 - $25,000', color: 'var(--primary)' },
                  { value: '$25,000+', label: '$25,000+', color: 'var(--primary)' },
                ].map((option) => (
                  <motion.div
                    key={option.value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFormData({ ...formData, avgMonthlyBalance: option.value })}
                    style={{
                      padding: '10px 16px',
                      background: formData.avgMonthlyBalance === option.value ? `${option.color}15` : 'var(--surface-2)',
                      border: formData.avgMonthlyBalance === option.value ? `2px solid ${option.color}` : '1px solid var(--border)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: 400,
                      color: 'var(--foreground)',
                    }}
                  >
                    {option.label}
                  </motion.div>
                ))}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                  marginTop: '8px',
                }}
              >
                Lenders want a balance equal to at least 10% of your loan request.
              </div>
            </div>

            {/* NSFs/Overdrafts */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--muted-foreground)',
                  marginBottom: '12px',
                }}
              >
                ANY OVERDRAFTS OR NSFS IN THE LAST 12 MONTHS?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  { value: 'Zero', color: 'var(--primary)' },
                  { value: '1-2', color: 'var(--info)' },
                  { value: '3-5', color: 'var(--warning)' },
                  { value: '5+', color: 'var(--destructive)' },
                ].map((option) => (
                  <motion.div
                    key={option.value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFormData({ ...formData, nsfOverdrafts: option.value })}
                    style={{
                      padding: '14px',
                      background: formData.nsfOverdrafts === option.value ? `${option.color}15` : 'var(--surface-2)',
                      border: formData.nsfOverdrafts === option.value ? `2px solid ${option.color}` : '1px solid var(--border)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--foreground)',
                      textAlign: 'center',
                    }}
                  >
                    {option.value}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleBack}
              style={{
                flex: '0 0 auto',
                padding: '16px 24px',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--primary)',
                background: 'transparent',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleContinue}
              disabled={!isValid}
              style={{
                flex: 1,
                padding: '16px 32px',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#000',
                background: isValid ? 'var(--primary)' : 'var(--border)',
                border: 'none',
                cursor: isValid ? 'pointer' : 'not-allowed',
              }}
            >
              Continue to Credit Profile →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
