// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Foundation Questions (Q_F1–Q_F11)
// These 11 questions replace ALL of BSS Steps 1-3
// Smart grouping, combined fields, zero redundancy
// ════════════════════════════════════════════════════════════════════════════════

import { motion } from 'motion/react';
import { UnifiedAnswers } from './types';
import { Info } from 'lucide-react';

interface FoundationQuestionProps {
  step: number;
  data: UnifiedAnswers;
  updateData: (updates: Partial<UnifiedAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
  currentQuestionNumber?: number;
  totalQuestions?: number;
}

export function FoundationQuestion({ step, data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions }: FoundationQuestionProps) {
  const questions = [
    QuestionF1, QuestionF2, QuestionF3, QuestionF4, QuestionF5,
    QuestionF6, QuestionF7, QuestionF8, QuestionF9, QuestionF11,
  ];

  const CurrentQuestion = questions[step];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <CurrentQuestion 
        data={data} 
        updateData={updateData} 
        onNext={onNext} 
        onBack={onBack} 
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
        step={step}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════

function QuestionHeader({ number, title, why, currentQuestionNumber, totalQuestions }: { number: number; title: string; why: string; currentQuestionNumber?: number; totalQuestions?: number }) {
  return (
    <>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}
      >
        Question {currentQuestionNumber || number} of {totalQuestions || 25}
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '24px',
          lineHeight: 1.3,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          background: 'var(--primary-alpha)',
          border: '1px solid var(--primary)',
          borderLeft: '3px solid var(--primary)',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '15px',
            fontStyle: 'italic',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          {why}
        </div>
      </div>
    </>
  );
}

function NavigationButtons({ onNext, onBack, disabled, step }: any) {
  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '40px' }}>
      {step > 0 && (
        <button
          onClick={onBack}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 24px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      )}

      <button
        onClick={onNext}
        disabled={disabled}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          fontWeight: 600,
          padding: '12px 32px',
          background: disabled ? 'var(--bg-surface-2)' : 'var(--primary)',
          border: 'none',
          borderRadius: '8px',
          color: disabled ? 'var(--text-disabled)' : 'var(--bg-base)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          marginLeft: 'auto',
        }}
      >
        Continue →
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Q_F1: Owner Contact Info
// ════════════════════════════════════════════════════════════════════════════════

function QuestionF1({ data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, step }: any) {
  const isValid = (data.ownerFirstName || '').trim() && 
                  (data.ownerLastName || '').trim() && 
                  (data.ownerEmail || '').trim() && 
                  (data.ownerPhone || '').trim();

  return (
    <>
      <QuestionHeader
        number={1}
        title="Let's start with your contact information"
        why="We need to know who we're working with. This information helps us personalize your experience and ensures we can reach you with important updates about your fundability."
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '8px' }}>
        {/* First Name */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            First Name
          </label>
          <input
            type="text"
            value={data.ownerFirstName || ''}
            onChange={(e) => updateData({ ownerFirstName: e.target.value })}
            placeholder="John"
            style={{
              width: '100%',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              padding: '14px 16px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            Last Name
          </label>
          <input
            type="text"
            value={data.ownerLastName || ''}
            onChange={(e) => updateData({ ownerLastName: e.target.value })}
            placeholder="Smith"
            style={{
              width: '100%',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              padding: '14px 16px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            value={data.ownerEmail || ''}
            onChange={(e) => updateData({ ownerEmail: e.target.value })}
            placeholder="john.smith@example.com"
            style={{
              width: '100%',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              padding: '14px 16px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Phone */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            Phone Number
          </label>
          <input
            type="tel"
            value={data.ownerPhone || ''}
            onChange={(e) => updateData({ ownerPhone: e.target.value })}
            placeholder="(555) 123-4567"
            style={{
              width: '100%',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              padding: '14px 16px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      <NavigationButtons onNext={onNext} onBack={onBack} disabled={!isValid} step={0} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Q_F2: Business Name + Entity Type
// ════════════════════════════════════════════════════════════════════════════════

function QuestionF2({ data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, step }: any) {
  const entityTypes = [
    { value: 'sole_prop', label: 'Sole Proprietorship', sub: 'No legal separation' },
    { value: 'llc_single', label: 'LLC (Single-Member)', sub: 'Basic liability protection' },
    { value: 'llc_multi', label: 'LLC (Multi-Member) / Partnership', sub: 'Shared ownership structure' },
    { value: 'corp', label: 'S-Corp or C-Corp', sub: 'Strongest legal structure' },
  ];

  const isValid = (data.businessName || '').trim() && data.entityType;

  return (
    <>
      <QuestionHeader
        number={2}
        title="What's your business legal name and entity type?"
        why="Lenders verify your legal name against state records and EIN databases. Entity type is the #1 structural signal — it determines your legal separation from personal liability."
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      {/* Business Name */}
      <div style={{ marginBottom: '32px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          Business Legal Name
        </label>
        <input
          type="text"
          value={data.businessName || ''}
          onChange={(e) => updateData({ businessName: e.target.value })}
          placeholder="Enter your legal business name"
          style={{
            width: '100%',
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            padding: '14px 16px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Entity Type */}
      <div style={{ marginBottom: '8px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Entity Type
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
        {entityTypes.map((type) => (
          <motion.div
            key={type.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateData({ entityType: type.value as any })}
            style={{
              background: data.entityType === type.value ? 'var(--primary-alpha)' : 'var(--bg-surface-2)',
              border: data.entityType === type.value ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              {type.label}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 300,
                color: 'var(--text-secondary)',
              }}
            >
              {type.sub}
            </div>
            {data.entityType === type.value && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--bg-base)',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <NavigationButtons onNext={onNext} onBack={onBack} disabled={!isValid} step={1} />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════���═════════
// Q_F3: Start Date + Industry
// ════════════════════════════════════════════════════════════════════════════════

function QuestionF3({ data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, step }: any) {
  const industries = [
    'Accounting, Tax Preparation, Bookkeeping',
    'Advertising, Marketing, Public Relations',
    'Agriculture, Farming, Ranching',
    'Architecture, Engineering, Surveying',
    'Automotive Sales, Service, Repair',
    'Beauty Salon, Barbershop, Spa, Cosmetics',
    'Childcare, Daycare Services',
    'Cleaning Services (Commercial or Residential)',
    'Computer Services, IT, Software Development',
    'Construction, Contracting, Remodeling',
    'Consulting, Business Services',
    'Dental Practice',
    'E-commerce, Online Retail',
    'Education, Tutoring, Training',
    'Entertainment, Events, Production',
    'Financial Services, Insurance',
    'Fitness Center, Gym, Personal Training',
    'Food & Beverage Manufacturing',
    'Freight, Trucking, Logistics',
    'Healthcare, Medical Practice',
    'Home Services (Plumbing, Electrical, HVAC)',
    'Hospitality, Hotels, Lodging',
    'Landscaping, Lawn Care, Tree Service',
    'Legal Services, Law Firm',
    'Manufacturing, Production',
    'Pet Services, Veterinary',
    'Photography, Videography',
    'Property Management, Real Estate',
    'Restaurant, Food Service, Catering',
    'Retail Store (Brick & Mortar)',
    'Security Services',
    'Technology, Telecommunications',
    'Transportation, Taxi, Rideshare',
    'Wholesale, Distribution',
    'Other',
  ];

  // Calculate business age
  const now = new Date();
  const ageMonths = data.startDate.year && data.startDate.month
    ? (now.getFullYear() - data.startDate.year) * 12 + (now.getMonth() + 1 - data.startDate.month)
    : 0;
  const ageYears = Math.floor(ageMonths / 12);
  const ageRemainder = ageMonths % 12;

  const isValid = data.startDate.year && data.startDate.month && data.industry;

  return (
    <>
      <QuestionHeader
        number={3}
        title="When did your business legally start operating, and what is your major industry focus?"
        why="Business age is a hard filter lenders cannot override. Industry determines risk overlay — some industries face automatic additional scrutiny regardless of financials."
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      {/* Start Date */}
      <div style={{ marginBottom: '32px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Business Start Date
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={data.startDate.month}
            onChange={(e) => updateData({ startDate: { ...data.startDate, month: parseInt(e.target.value) } })}
            style={{
              flex: 1,
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              padding: '14px 16px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="">Month</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={data.startDate.year}
            onChange={(e) => updateData({ startDate: { ...data.startDate, year: parseInt(e.target.value) } })}
            style={{
              flex: 1,
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              padding: '14px 16px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <option value="">Year</option>
            {[...Array(30)].map((_, i) => {
              const year = now.getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        {ageMonths > 0 && (
          <div
            style={{
              marginTop: '12px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--primary)',
            }}
          >
            {ageYears > 0 && `${ageYears} year${ageYears !== 1 ? 's' : ''}`}
            {ageYears > 0 && ageRemainder > 0 && ', '}
            {ageRemainder > 0 && `${ageRemainder} month${ageRemainder !== 1 ? 's' : ''}`}
            {' in operation'}
          </div>
        )}
      </div>

      {/* Industry */}
      <div style={{ marginBottom: '8px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Major Industry Focus
        </label>
        <select
          value={data.industry}
          onChange={(e) => updateData({ industry: e.target.value })}
          style={{
            width: '100%',
            fontFamily: 'var(--font-body)',
            fontSize: '16px',
            padding: '14px 16px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <option value="">Select your industry</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

      <NavigationButtons onNext={onNext} onBack={onBack} disabled={!isValid} step={2} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Q_F4: EIN + Website
// ════════════════════════════════════════════════════════════════════════════════

function QuestionF4({ data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, step }: any) {
  return (
    <>
      <QuestionHeader
        number={4}
        title="What is your EIN, and do you have a business website?"
        why="EIN is required for SBA and most institutional lenders — it separates business from personal tax identity. A verifiable web presence is one of the first things lenders check for legitimacy."
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      {/* EIN Status */}
      <div style={{ marginBottom: '32px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Do you have an EIN (Employer Identification Number)?
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { value: true, label: 'Yes, I have an EIN' },
            { value: false, label: 'No EIN yet' },
          ].map((opt) => (
            <motion.div
              key={String(opt.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ hasEIN: opt.value, einNumber: opt.value ? data.einNumber : undefined })}
              style={{
                flex: 1,
                background: data.hasEIN === opt.value ? 'var(--primary-alpha)' : 'var(--bg-surface-2)',
                border: data.hasEIN === opt.value ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {opt.label}
            </motion.div>
          ))}
        </div>

        {data.hasEIN && (
          <input
            type="text"
            value={data.einNumber || ''}
            onChange={(e) => updateData({ einNumber: e.target.value })}
            placeholder="XX-XXXXXXX (optional)"
            style={{
              width: '100%',
              marginTop: '12px',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              padding: '14px 16px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
          />
        )}
      </div>

      {/* Website */}
      <div style={{ marginBottom: '8px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Do you have a business website?
        </label>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ].map((opt) => (
            <motion.div
              key={String(opt.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ hasWebsite: opt.value, websiteUrl: opt.value ? data.websiteUrl : undefined })}
              style={{
                flex: 1,
                background: data.hasWebsite === opt.value ? 'var(--primary-alpha)' : 'var(--bg-surface-2)',
                border: data.hasWebsite === opt.value ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {opt.label}
            </motion.div>
          ))}
        </div>

        {data.hasWebsite && (
          <input
            type="url"
            value={data.websiteUrl || ''}
            onChange={(e) => updateData({ websiteUrl: e.target.value })}
            placeholder="https://your-business.com"
            style={{
              width: '100%',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              padding: '14px 16px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
          />
        )}
      </div>

      <NavigationButtons onNext={onNext} onBack={onBack} disabled={false} step={3} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Q_F5: Monthly Revenue + CC Sales (SLIDERS)
// ════════════════════════════════════════════════════════════════════════════════

function QuestionF5({ data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, step }: any) {
  const revenueOptions = [
    { value: 'under_5k',   label: 'Under $5,000' },
    { value: '5k_15k',    label: '$5,000 to $15,000' },
    { value: '15k_40k',   label: '$15,000 to $40,000' },
    { value: '40k_100k',  label: '$40,000 to $100,000' },
    { value: 'over_100k', label: 'Over $100,000' },
  ];

  const ccSalesOptions = [
    { value: 'under_5k',  label: 'Under $5,000' },
    { value: '5k_15k',   label: '$5,000 to $15,000' },
    { value: '15k_50k',  label: '$15,000 to $50,000' },
    { value: 'over_50k', label: 'Over $50,000' },
  ];

  const buttonStyle = (selected: boolean) => ({
    background: '#131510',
    border: selected ? '2px solid #8ab820' : '1px solid #6b7258',
    color: selected ? '#8ab820' : '#e4e8d8',
    borderRadius: '8px',
    padding: '12px 16px',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    fontWeight: 500 as const,
    cursor: 'pointer',
    textAlign: 'left' as const,
    width: '100%',
    transition: 'all 0.2s ease',
  });

  const isValid = !!data.monthlyRevenue && !!data.acceptsCards &&
    (data.acceptsCards === 'no' || !!data.ccSales);

  return (
    <>
      <QuestionHeader
        number={5}
        title="Revenue and credit card sales"
        why="Monthly revenue sets your maximum borrowing power. Credit card sales are the primary qualification factor for Merchant Cash Advance — the fastest-funding product in the market."
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      {/* SECTION 1: Monthly Revenue — always shown */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}>
          Average Gross Monthly Revenue
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {revenueOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ monthlyRevenue: option.value as any })}
              style={buttonStyle(data.monthlyRevenue === option.value)}
              onMouseEnter={(e: any) => {
                if (data.monthlyRevenue !== option.value) e.currentTarget.style.borderColor = 'rgba(138, 184, 32, 0.6)';
              }}
              onMouseLeave={(e: any) => {
                if (data.monthlyRevenue !== option.value) e.currentTarget.style.borderColor = '#6b7258';
              }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* SECTION 2: Accept Credit Cards — always shown */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}>
          Do you accept credit card payments?
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'no',  label: 'No' },
          ].map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ acceptsCards: option.value as any, ccSales: option.value === 'no' ? '' : data.ccSales })}
              style={{ ...buttonStyle(data.acceptsCards === option.value), flex: 1, textAlign: 'center' as const }}
              onMouseEnter={(e: any) => {
                if (data.acceptsCards !== option.value) e.currentTarget.style.borderColor = 'rgba(138, 184, 32, 0.6)';
              }}
              onMouseLeave={(e: any) => {
                if (data.acceptsCards !== option.value) e.currentTarget.style.borderColor = '#6b7258';
              }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* SECTION 3: CC Sales — only shown if acceptsCards === 'yes' */}
      {data.acceptsCards === 'yes' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '24px' }}
        >
          <label style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}>
            Total Monthly Credit Card Sales
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ccSalesOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateData({ ccSales: option.value as any })}
                style={buttonStyle(data.ccSales === option.value)}
                onMouseEnter={(e: any) => {
                  if (data.ccSales !== option.value) e.currentTarget.style.borderColor = 'rgba(138, 184, 32, 0.6)';
                }}
                onMouseLeave={(e: any) => {
                  if (data.ccSales !== option.value) e.currentTarget.style.borderColor = '#6b7258';
                }}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <NavigationButtons onNext={onNext} onBack={onBack} disabled={!isValid} step={4} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Q_F6: Banking (3 sub-fields)
// ════════════════════════════════════════════════════════════════════════════════

function QuestionF6({ data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, step }: any) {
  const accountTypes = [
    { value: 'dedicated', label: 'Dedicated Business Account', sub: 'Strongest signal' },
    { value: 'personal', label: 'Personal Account for Business', sub: 'Acceptable but weaker' },
    { value: 'none', label: 'No Bank Account', sub: 'Hard stop for most lenders' },
  ];

  const accountAges = [
    { value: '0_6mo', label: '0–6 months' },
    { value: '6_12mo', label: '6–12 months' },
    { value: '12_24mo', label: '12–24 months' },
    { value: '24plus', label: '24+ months' },
  ];

  const balances = [
    { value: 'near_zero', label: 'Near zero' },
    { value: '500_2k', label: '$500–$2K' },
    { value: '2k_10k', label: '$2K–$10K' },
    { value: '10k_25k', label: '$10K–$25K' },
    { value: '25k_plus', label: '$25K+' },
  ];

  const isValid = data.bankAccount && (data.bankAccount === 'none' || (data.bankAge && data.avgDailyBalance));

  return (
    <>
      <QuestionHeader
        number={6}
        title="Tell us about your business banking situation."
        why="Lenders read 12 months of bank statements like a report card. Your account type, age, and average balance are verified against stated income. NSFs are flagged automatically."
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      {/* Account Type */}
      <div style={{ marginBottom: '32px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Bank Account Type
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {accountTypes.map((type) => (
            <motion.div
              key={type.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => updateData({ bankAccount: type.value as any })}
              style={{
                background: data.bankAccount === type.value ? 'var(--primary-alpha)' : 'var(--bg-surface-2)',
                border: data.bankAccount === type.value ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px 20px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {type.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--text-secondary)',
                }}
              >
                {type.sub}
              </div>
              {data.bankAccount === type.value && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '20px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--bg-base)',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Account Age - ONLY SHOW if Bank Account is NOT 'none' */}
      {data.bankAccount !== 'none' && (
        <div style={{ marginBottom: '32px' }}>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}
          >
            Account Age
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {accountAges.map((age) => (
              <motion.div
                key={age.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateData({ bankAge: age.value as any })}
                style={{
                  background: data.bankAge === age.value ? 'var(--primary-alpha)' : 'var(--bg-surface-2)',
                  border: data.bankAge === age.value ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                {age.label}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Average Daily Balance - REMOVED (duplicated in Q_R21) */}

      <NavigationButtons onNext={onNext} onBack={onBack} disabled={!isValid} step={5} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Q_F7: NSFs + Assets (SLIDERS FOR MONEY FIELDS!)
// ════════════════════════════════════════════════════════════════════════════════

function QuestionF7({ data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, step }: any) {
  const nsfOptions = [
    { value: 'zero', label: 'Zero', sub: 'Strongest signal' },
    { value: '1_2', label: '1–2', sub: 'Acceptable' },
    { value: '3_5', label: '3–5', sub: 'Concerning' },
    { value: 'over_5', label: '5+', sub: 'Red flag' },
  ];

  const propertyOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'planning', label: 'Planning to acquire' },
  ];

  const formatCurrency = (val: number) => val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${val.toLocaleString()}`;

  return (
    <>
      <QuestionHeader
        number={7}
        title="What other business assets do you have?"
        why="Outstanding invoices, equipment, and purchase orders each unlock different funding products and expand your borrowing capacity."
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      {/* NSF Count - REMOVED (duplicated in Q_R22) */}

      {/* Assets - SLIDERS */}
      <div
        style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}
        >
          Business Assets (Optional)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Accounts Receivable - BUTTON SELECT */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '12px',
              }}
            >
              Amount Owed to You by Other Businesses
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'none', label: 'None / Not applicable' },
                { value: 'under_10k', label: 'Under $10,000' },
                { value: '10k_50k', label: '$10,000 - $50,000' },
                { value: '50k_250k', label: '$50,000 - $250,000' },
                { value: 'over_250k', label: 'Over $250,000' },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateData({ arBalance: option.value as any })}
                  style={{
                    background: '#131510',
                    border: data.arBalance === option.value ? '2px solid #8ab820' : '1px solid #6b7258',
                    color: data.arBalance === option.value ? '#8ab820' : '#e4e8d8',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e: any) => {
                    if (data.arBalance !== option.value) {
                      e.currentTarget.style.borderColor = 'rgba(138, 184, 32, 0.6)';
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (data.arBalance !== option.value) {
                      e.currentTarget.style.borderColor = '#6b7258';
                    }
                  }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Equipment Value - BUTTON SELECT */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '12px',
              }}
            >
              Total Value of Equipment Owned Outright
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'none', label: 'None / No equipment' },
                { value: 'under_10k', label: 'Under $10,000' },
                { value: '10k_50k', label: '$10,000 - $50,000' },
                { value: '50k_250k', label: '$50,000 - $250,000' },
                { value: 'over_250k', label: 'Over $250,000' },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateData({ equipmentValue: option.value as any })}
                  style={{
                    background: '#131510',
                    border: data.equipmentValue === option.value ? '2px solid #8ab820' : '1px solid #6b7258',
                    color: data.equipmentValue === option.value ? '#8ab820' : '#e4e8d8',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e: any) => {
                    if (data.equipmentValue !== option.value) {
                      e.currentTarget.style.borderColor = 'rgba(138, 184, 32, 0.6)';
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (data.equipmentValue !== option.value) {
                      e.currentTarget.style.borderColor = '#6b7258';
                    }
                  }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Purchase Orders - BUTTON SELECT */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '12px',
              }}
            >
              Current Amount of Purchase Orders
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'none', label: 'None / No open POs' },
                { value: 'under_10k', label: 'Under $10,000' },
                { value: '10k_50k', label: '$10,000 - $50,000' },
                { value: '50k_250k', label: '$50,000 - $250,000' },
                { value: 'over_250k', label: 'Over $250,000' },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateData({ poBalance: option.value as any })}
                  style={{
                    background: '#131510',
                    border: data.poBalance === option.value ? '2px solid #8ab820' : '1px solid #6b7258',
                    color: data.poBalance === option.value ? '#8ab820' : '#e4e8d8',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e: any) => {
                    if (data.poBalance !== option.value) {
                      e.currentTarget.style.borderColor = 'rgba(138, 184, 32, 0.6)';
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (data.poBalance !== option.value) {
                      e.currentTarget.style.borderColor = '#6b7258';
                    }
                  }}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
            <div
              style={{
                marginTop: '12px',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
              }}
            >
              Actual open business purchase orders, not contracts
            </div>
          </div>

          {/* Property */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}
            >
              Own Investment Property?
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {propertyOptions.map((opt) => (
                <motion.div
                  key={opt.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateData({ ownsProperty: opt.value as any })}
                  style={{
                    flex: 1,
                    background: data.ownsProperty === opt.value ? 'var(--primary-alpha)' : 'var(--bg-surface-1)',
                    border: data.ownsProperty === opt.value ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {opt.label}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NavigationButtons onNext={onNext} onBack={onBack} disabled={!data.nsfCount} step={6} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Q_F8: Personal Credit (3 Bureaus)
// ════════════════════════════════════════════════════════════════════════════════

function QuestionF8({ data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, step }: any) {
  const scores = [
    data.experian || 680,
    data.transunion || 680,
    data.equifax || 680,
  ].sort((a, b) => a - b);
  const composite = scores[1]; // Middle score

  return (
    <>
      <QuestionHeader
        number={8}
        title="What is your personal credit score across the three bureaus?"
        why="Personal credit is the first thing every lender checks — before they look at anything else about your business. The middle score is what most lenders use."
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      {/* Experian - BUTTON SELECT */}
      <div style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Experian
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { value: 'exceptional', label: 'Exceptional (800-850)' },
            { value: 'very_good', label: 'Very Good (740-799)' },
            { value: 'good', label: 'Good (670-739)' },
            { value: 'fair', label: 'Fair (580-669)' },
            { value: 'poor', label: 'Poor (300-579)' },
            { value: 'unknown', label: 'I don\'t know my score' },
          ].map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ experian: option.value as any })}
              style={{
                background: '#131510',
                border: data.experian === option.value ? '2px solid #8ab820' : '1px solid #6b7258',
                color: data.experian === option.value ? '#8ab820' : '#e4e8d8',
                borderRadius: '8px',
                padding: '12px 16px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e: any) => {
                if (data.experian !== option.value) {
                  e.currentTarget.style.borderColor = 'rgba(138, 184, 32, 0.6)';
                }
              }}
              onMouseLeave={(e: any) => {
                if (data.experian !== option.value) {
                  e.currentTarget.style.borderColor = '#6b7258';
                }
              }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* TransUnion - BUTTON SELECT */}
      <div style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          TransUnion
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { value: 'exceptional', label: 'Exceptional (800-850)' },
            { value: 'very_good', label: 'Very Good (740-799)' },
            { value: 'good', label: 'Good (670-739)' },
            { value: 'fair', label: 'Fair (580-669)' },
            { value: 'poor', label: 'Poor (300-579)' },
            { value: 'unknown', label: 'I don\'t know my score' },
          ].map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ transunion: option.value as any })}
              style={{
                background: '#131510',
                border: data.transunion === option.value ? '2px solid #8ab820' : '1px solid #6b7258',
                color: data.transunion === option.value ? '#8ab820' : '#e4e8d8',
                borderRadius: '8px',
                padding: '12px 16px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e: any) => {
                if (data.transunion !== option.value) {
                  e.currentTarget.style.borderColor = 'rgba(138, 184, 32, 0.6)';
                }
              }}
              onMouseLeave={(e: any) => {
                if (data.transunion !== option.value) {
                  e.currentTarget.style.borderColor = '#6b7258';
                }
              }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Equifax - BUTTON SELECT */}
      <div style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Equifax
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { value: 'exceptional', label: 'Exceptional (800-850)' },
            { value: 'very_good', label: 'Very Good (740-799)' },
            { value: 'good', label: 'Good (670-739)' },
            { value: 'fair', label: 'Fair (580-669)' },
            { value: 'poor', label: 'Poor (300-579)' },
            { value: 'unknown', label: 'I don\'t know my score' },
          ].map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ equifax: option.value as any })}
              style={{
                background: '#131510',
                border: data.equifax === option.value ? '2px solid #8ab820' : '1px solid #6b7258',
                color: data.equifax === option.value ? '#8ab820' : '#e4e8d8',
                borderRadius: '8px',
                padding: '12px 16px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e: any) => {
                if (data.equifax !== option.value) {
                  e.currentTarget.style.borderColor = 'rgba(138, 184, 32, 0.6)';
                }
              }}
              onMouseLeave={(e: any) => {
                if (data.equifax !== option.value) {
                  e.currentTarget.style.borderColor = '#6b7258';
                }
              }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Composite Score */}
      <div
        style={{
          background: 'var(--primary-alpha)',
          border: '2px solid var(--primary)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 400,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            marginBottom: '8px',
          }}
        >
          Composite Score (Middle)
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '48px',
            fontWeight: 800,
            color: 'var(--primary)',
          }}
        >
          {composite}
        </div>
      </div>

      <NavigationButtons onNext={onNext} onBack={onBack} disabled={false} step={7} />
    </>
  );
}

// Q_F9, Q_F10, Q_F11 remain unchanged from previous implementation
// (Utilization + Income, Bankruptcy + Derogatories, Business Credit + Inquiries)

function QuestionF9({ data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, step }: any) {
  const incomeRanges = [
    { value: 'under_35k', label: 'Under $35K' },
    { value: '35_75k', label: '$35K–$75K' },
    { value: '75_125k', label: '$75K–$125K' },
    { value: '125_250k', label: '$125K–$250K' },
    { value: 'over_250k', label: 'Over $250K' },
  ];

  return (
    <>
      <QuestionHeader
        number={9}
        title="What is your approximate credit utilization, and your annual personal income?"
        why="Utilization is the #2 FICO factor — above 30% is actively hurting your score right now. Personal income is required for credit card stacking ($75K minimum) — a fast capital strategy for qualified owners."
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      {/* Utilization */}
      <div style={{ marginBottom: '32px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Credit Utilization
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { value: 'under_10', label: 'Under 10%' },
            { value: '10_30', label: '10% - 30%' },
            { value: '30_50', label: '30% - 50%' },
            { value: '50_75', label: '50% - 75%' },
            { value: 'over_75', label: 'Over 75%' },
          ].map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ utilization: option.value as any })}
              style={{
                background: '#131510',
                border: data.utilization === option.value ? '2px solid #8ab820' : '1px solid #6b7258',
                color: data.utilization === option.value ? '#8ab820' : '#e4e8d8',
                borderRadius: '8px',
                padding: '12px 16px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e: any) => {
                if (data.utilization !== option.value) {
                  e.currentTarget.style.borderColor = 'rgba(138, 184, 32, 0.6)';
                }
              }}
              onMouseLeave={(e: any) => {
                if (data.utilization !== option.value) {
                  e.currentTarget.style.borderColor = '#6b7258';
                }
              }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
        {data.utilization && (data.utilization === '50_75' || data.utilization === 'over_75') && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px 16px',
              background: 'rgba(200, 144, 32, 0.1)',
              border: '1px solid #c89020',
              borderRadius: '8px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#c89020',
            }}
          >
            Above 30% actively hurts your FICO score
          </div>
        )}
      </div>

      {/* Income */}
      <div style={{ marginBottom: '8px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Annual Personal Income
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {incomeRanges.map((range) => (
            <motion.div
              key={range.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ personalIncome: range.value as any })}
              style={{
                background: data.personalIncome === range.value ? 'var(--primary-alpha)' : 'var(--bg-surface-2)',
                border: data.personalIncome === range.value ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {range.label}
            </motion.div>
          ))}
        </div>
      </div>

      <NavigationButtons onNext={onNext} onBack={onBack} disabled={!data.personalIncome} step={8} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// Q_F11: Business Credit & Inquiry History
// ════════════════════════════════════════════════════════════════════════════════

function QuestionF11({ data, updateData, onNext, onBack, currentQuestionNumber, totalQuestions, step }: any) {
  const bizCreditOptions = [
    { value: 'paydex_80plus', label: 'Yes — Paydex 80+ or Intelliscore 76+', sub: 'Strong business credit' },
    { value: 'below_80', label: 'Yes — but score is below those thresholds', sub: 'Building business credit' },
    { value: 'building', label: "I've started building it", sub: 'Early stage' },
    { value: 'none', label: 'No business credit file', sub: 'Very common' },
  ];

  const inquiryOptions = [
    { value: '0', label: '0' },
    { value: '1_2', label: '1–2' },
    { value: '3_4', label: '3–4' },
    { value: '5plus', label: '5+' },
    { value: 'unknown', label: "Don't know" },
  ];

  return (
    <>
      <QuestionHeader
        number={11}
        title="Do you have a business credit file? And how many hard inquiries in the last 30 days?"
        why="Business credit (D&B Paydex, Experian Intelliscore) is completely separate from your personal score. Most small business owners have no file — and don't know it's costing them. Inquiry count signals credit-seeking behavior that lenders flag."
        currentQuestionNumber={currentQuestionNumber}
        totalQuestions={totalQuestions}
      />

      {/* Business Credit File */}
      <div style={{ marginBottom: '32px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Business Credit File Status
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bizCreditOptions.map((opt) => (
            <motion.div
              key={opt.value}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => updateData({ bizCreditFile: opt.value as any })}
              style={{
                background: data.bizCreditFile === opt.value ? 'var(--primary-alpha)' : 'var(--bg-surface-2)',
                border: data.bizCreditFile === opt.value ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px 20px',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {opt.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--text-secondary)',
                }}
              >
                {opt.sub}
              </div>
              {data.bizCreditFile === opt.value && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '20px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--bg-base)',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Inquiries */}
      <div style={{ marginBottom: '8px' }}>
        <label
          style={{
            display: 'block',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}
        >
          Hard Inquiries in Last 30 Days
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {inquiryOptions.map((opt) => (
            <motion.div
              key={opt.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => updateData({ inquiries30d: opt.value as any })}
              style={{
                background: data.inquiries30d === opt.value ? 'var(--primary-alpha)' : 'var(--bg-surface-2)',
                border: data.inquiries30d === opt.value ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {opt.label}
            </motion.div>
          ))}
        </div>
      </div>

      <NavigationButtons onNext={onNext} onBack={onBack} disabled={!data.bizCreditFile || !data.inquiries30d} step={10} />
    </>
  );
}
