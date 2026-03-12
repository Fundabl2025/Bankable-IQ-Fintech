// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Business Success Scan Step 1: Business Identity
// Establishes business identity, NAP score foundation, EIN status
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { UnifiedProgressBar } from '../../components/UnifiedProgressBar';

interface Step1Data {
  businessLegalName: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  businessPhone: string;
  hasEIN: 'yes' | 'no' | '';
  einNumber: string;
}

export function Step1() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Step1Data>({
    businessLegalName: '',
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    businessPhone: '',
    hasEIN: '',
    einNumber: '',
  });

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem('bss_step1');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  // Fill test data
  const fillTestData = () => {
    setFormData({
      businessLegalName: 'TechStart Solutions LLC',
      contactFirstName: 'John',
      contactLastName: 'Smith',
      contactEmail: 'john.smith@techstartsolutions.com',
      contactPhone: '(555) 123-4567',
      businessAddress: '1234 Innovation Drive',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      businessPhone: '(512) 555-9876',
      hasEIN: 'yes',
      einNumber: '12-3456789',
    });
  };

  const handleContinue = () => {
    localStorage.setItem('bss_step1', JSON.stringify(formData));
    navigate('/business-success-scan/step-2');
  };

  // Validation - all required fields filled
  const isValid =
    formData.businessLegalName.trim() &&
    formData.contactFirstName.trim() &&
    formData.contactLastName.trim() &&
    formData.contactEmail.trim() &&
    formData.contactPhone.trim() &&
    formData.businessAddress.trim() &&
    formData.city.trim() &&
    formData.state.trim() &&
    formData.zipCode.trim() &&
    formData.businessPhone.trim() &&
    formData.hasEIN !== '' &&
    (formData.hasEIN === 'no' || formData.einNumber.trim());

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <UnifiedProgressBar currentStep={1} />

      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            padding: '40px',
          }}
        >
          {/* Header with Test Data Button */}
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
                STEP 1 OF 5 - BUSINESS IDENTITY
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
                Tell us about your business.
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
                This information establishes your business identity in lender databases.
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

          {/* Business Legal Name */}
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
              BUSINESS LEGAL NAME
            </label>
            <input
              type="text"
              value={formData.businessLegalName}
              onChange={(e) => setFormData({ ...formData, businessLegalName: e.target.value })}
              placeholder="Exact legal name as registered"
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
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
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
              Must match your state registration and EIN paperwork exactly.
            </div>
          </div>

          {/* Contact Name - 2 column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
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
                FIRST NAME
              </label>
              <input
                type="text"
                value={formData.contactFirstName}
                onChange={(e) => setFormData({ ...formData, contactFirstName: e.target.value })}
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
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
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
                LAST NAME
              </label>
              <input
                type="text"
                value={formData.contactLastName}
                onChange={(e) => setFormData({ ...formData, contactLastName: e.target.value })}
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
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Contact Email */}
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
              CONTACT EMAIL
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="your@email.com"
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
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
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
              Used only for your FundReady™ results - never shared.
            </div>
          </div>

          {/* Contact Phone */}
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
              CONTACT PHONE NUMBER
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="(555) 555-5555"
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
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Business Address */}
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
              BUSINESS PHYSICAL ADDRESS
            </label>
            <input
              type="text"
              value={formData.businessAddress}
              onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
              placeholder="Street address"
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
                marginBottom: '12px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '45% 30% 25%', gap: '12px' }}>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
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
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
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
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="Zip"
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
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 300,
                color: 'var(--muted-foreground)',
                marginTop: '6px',
                borderLeft: '3px solid var(--warning)',
                paddingLeft: '12px',
              }}
            >
              Lenders verify Name, Address, Phone (NAP) consistency across databases.
            </div>
          </div>

          {/* Business Phone */}
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
              BUSINESS PHONE (LANDLINE PREFERRED)
            </label>
            <input
              type="tel"
              value={formData.businessPhone}
              onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
              placeholder="(555) 555-5555"
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
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
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
              Landline numbers carry more weight in NAP verification databases.
            </div>
          </div>

          {/* EIN Status - Visual Radio Cards */}
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
                marginBottom: '12px',
              }}
            >
              DO YOU HAVE A FEDERAL EMPLOYER IDENTIFICATION NUMBER (EIN)?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* YES Card */}
              <motion.div
                whileTap={{ scale: 0.99 }}
                onClick={() => setFormData({ ...formData, hasEIN: 'yes' })}
                style={{
                  padding: '20px',
                  background: formData.hasEIN === 'yes' ? 'var(--primary-bg)' : 'var(--surface-2)',
                  border: formData.hasEIN === 'yes' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    marginBottom: '6px',
                  }}
                >
                  Yes - I have an EIN
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 300,
                    color: 'var(--muted-foreground)',
                    lineHeight: 1.5,
                  }}
                >
                  Required for SBA and most institutional lenders
                </div>
              </motion.div>

              {/* NO Card */}
              <motion.div
                whileTap={{ scale: 0.99 }}
                onClick={() => setFormData({ ...formData, hasEIN: 'no', einNumber: '' })}
                style={{
                  padding: '20px',
                  background: formData.hasEIN === 'no' ? 'var(--warning-bg)' : 'var(--surface-2)',
                  border: formData.hasEIN === 'no' ? '2px solid var(--warning)' : '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    marginBottom: '6px',
                  }}
                >
                  No - I do not have an EIN yet
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 300,
                    color: 'var(--muted-foreground)',
                    lineHeight: 1.5,
                  }}
                >
                  Limits your lender access - can be obtained in minutes at IRS.gov
                </div>
              </motion.div>
            </div>

            {/* Conditional EIN Input */}
            {formData.hasEIN === 'yes' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: '16px' }}
              >
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
                  EIN NUMBER
                </label>
                <input
                  type="text"
                  value={formData.einNumber}
                  onChange={(e) => setFormData({ ...formData, einNumber: e.target.value })}
                  placeholder="12-3456789"
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
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </motion.div>
            )}

            {/* Lender Note */}
            {formData.hasEIN !== '' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  marginTop: '12px',
                  padding: '12px 16px',
                  background: formData.hasEIN === 'yes' ? 'var(--primary-bg)' : 'var(--warning-bg)',
                  borderLeft: formData.hasEIN === 'yes' ? '3px solid var(--primary)' : '3px solid var(--warning)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)',
                }}
              >
                {formData.hasEIN === 'yes'
                  ? '✓  EIN adds +15 to your Bankable Score and is required for SBA.'
                  : '→  Apply at IRS.gov now before your assessment is complete.'}
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            disabled={!isValid}
            style={{
              width: '100%',
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
              marginBottom: '12px',
            }}
          >
            Continue to Business Status →
          </motion.button>

          <div
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 300,
              color: 'var(--muted-foreground)',
            }}
          >
            🔒 Your data is saved locally and used only to calculate your scores.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
