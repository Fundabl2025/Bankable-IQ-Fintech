// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Funding Application Modal
// Elon: 3 clean steps, every field earns its place, zero sidebar noise
// Chase: identity anchor ("pre-filling X of 36"), micro-commitment ladder,
//        progress bar drives completion, gain-framed CTA at every step
// Submits to Bolt API; Supabase fallback on network failure
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { X, Building2, User, DollarSign, CheckCircle, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { applyToProgram } from '../lib/funding-service';

// ── Bolt API config ────────────────────────────────────────────────────────────
// Token is server-side only. Client calls /api/bolt-proxy which injects it.
// See: /api/bolt-proxy.ts and BOLT_BROKER_TOKEN env var in Vercel.
const BOLT_PROXY_URL = '/api/bolt-proxy';

// ── Types ──────────────────────────────────────────────────────────────────────
interface FundingApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  programAmount: string;
  programType: string;
}

type Step = 'business' | 'owner' | 'loan';

interface FormState {
  // Business
  businessLegalName: string;
  ein: string;
  dba: string;
  businessPhone: string;
  businessWebsite: string;
  contactEmail: string;
  businessEntity: string;
  businessSeason: string;
  businessRevenue: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  businessPropertyStatus: string;
  businessStartDate: string;
  businessPropertyPayment: string;
  businessStateOfOrganization: string;
  businessDescription: string;
  // Owner
  firstName: string;
  lastName: string;
  applicantSocial: string;
  dateOfBirth: string;
  phone: string;
  ownerPropertyPayment: string;
  ownerAddress: string;
  ownerCity: string;
  ownerState: string;
  ownerZip: string;
  ownerTimeLivingThere: string;
  ownerPropertyStatus: string;
  percentageOwnership: string;
  // Loan
  loanAmount: string;
  useOfFunds: string;
  bankruptcyStatus: string;
  personalCredit: string;
  outstandingLoans: string;
}

const EMPTY_FORM: FormState = {
  businessLegalName: '', ein: '', dba: '', businessPhone: '', businessWebsite: '',
  contactEmail: '', businessEntity: '', businessSeason: '', businessRevenue: '',
  businessAddress: '', businessCity: '', businessState: '', businessZip: '',
  businessPropertyStatus: '', businessStartDate: '', businessPropertyPayment: '',
  businessStateOfOrganization: '', businessDescription: '',
  firstName: '', lastName: '', applicantSocial: '', dateOfBirth: '', phone: '',
  ownerPropertyPayment: '', ownerAddress: '', ownerCity: '', ownerState: '',
  ownerZip: '', ownerTimeLivingThere: '', ownerPropertyStatus: '', percentageOwnership: '',
  loanAmount: '', useOfFunds: '', bankruptcyStatus: '', personalCredit: '', outstandingLoans: '',
};

// Fields we can pre-fill from unified_assessment (14 of 36)
const PRE_FILL_COUNT = 14;
const TOTAL_FIELDS = 36;

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

// ── Shared input style ─────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
  fontFamily: 'var(--font-body)', color: 'var(--foreground)',
  background: 'var(--background)', border: '1px solid var(--border)',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
};
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };
const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-body)', fontSize: '11px',
  fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '4px',
  textTransform: 'uppercase', letterSpacing: '0.06em',
};
const preFillLabelStyle: React.CSSProperties = {
  ...labelStyle,
  color: '#10b981',
};
const fieldWrap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0px' };
const rowStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };
const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
  color: 'var(--foreground)', marginBottom: '12px', marginTop: '4px',
  paddingBottom: '6px', borderBottom: '1px solid var(--border)',
};

// ── Helper ─────────────────────────────────────────────────────────────────────
function PreFilledDot() {
  return (
    <span title="Pre-filled from your Bankable IQ profile" style={{
      display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
      background: '#10b981', marginLeft: '5px', verticalAlign: 'middle',
    }} />
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function FundingApplicationModal({
  isOpen, onClose, programName, programAmount, programType,
}: FundingApplicationModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('business');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [preFillCount, setPreFillCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signature, setSignature] = useState('');

  // ── Pre-fill from unified_assessment ────────────────────────────────────────
  const loadPreFill = useCallback(() => {
    try {
      const raw = localStorage.getItem('unified_assessment');
      if (!raw) return;
      const a = JSON.parse(raw);

      const ownerParts = (a.ownerName || '').trim().split(/\s+/);
      const fName = ownerParts[0] || '';
      const lName = ownerParts.slice(1).join(' ') || '';

      // Format revenue: monthlyRevenue * 12
      const annualRev = a.monthlyRevenue
        ? String(Math.round(Number(a.monthlyRevenue) * 12))
        : a.annualRevenue || '';

      // Format start date to MM/DD/YYYY if it's a year-only value
      let startDate = a.businessStartDate || a.dateEstablished || '';
      if (startDate && /^\d{4}$/.test(startDate.trim())) {
        startDate = `01/01/${startDate.trim()}`;
      }

      const filled: Partial<FormState> = {};
      let count = 0;

      const set = (key: keyof FormState, val: string) => {
        if (val) { filled[key] = val; count++; }
      };

      set('businessLegalName', a.businessName || '');
      set('businessPhone', a.businessPhone || a.phone || '');
      set('contactEmail', user?.email || a.contactEmail || '');
      set('businessEntity', a.entityType || a.businessType || '');
      set('businessRevenue', annualRev);
      set('businessAddress', a.businessAddress || a.address || '');
      set('businessCity', a.businessCity || a.city || '');
      set('businessState', a.businessState || a.state || '');
      set('businessZip', a.businessZip || a.zip || '');
      set('businessStartDate', startDate);
      set('firstName', fName);
      set('lastName', lName);
      set('phone', a.businessPhone || a.phone || '');
      set('personalCredit', String(a.personalCreditScore || a.creditScore || ''));

      setForm(prev => ({ ...prev, ...filled }));
      setPreFillCount(count);
    } catch { /* non-fatal */ }
  }, [user?.email]);

  useEffect(() => {
    if (isOpen) {
      setStep('business');
      setForm(EMPTY_FORM);
      setIsSuccess(false);
      setIsSubmitting(false);
      setError('');
      setAgreedToTerms(false);
      setSignature('');
      loadPreFill();
    }
  }, [isOpen, loadPreFill]);

  // ── Field update helper ──────────────────────────────────────────────────────
  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  // ── Submit to Bolt API ───────────────────────────────────────────────────────
  // PII safety: no fallback storage. If Bolt is unavailable, surface an error.
  // Sensitive fields (SSN, DOB, EIN, financials) must never be written to Supabase
  // as a raw payload until RLS is enforced on funding_applications (WO-6).
  const handleSubmit = async () => {
    if (!agreedToTerms) { setError('Please agree to the terms to continue.'); return; }
    if (!signature.trim()) { setError('Please enter your digital signature.'); return; }
    setIsSubmitting(true);
    setError('');

    const payload = {
      ...form,
      loanProduct: programType,
      requestedAmount: form.loanAmount || programAmount,
    };

    try {
      const res = await fetch(`${BOLT_PROXY_URL}?path=/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError('Funding applications are temporarily unavailable. Please contact support@getbankable.io or try again later.');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      try { await applyToProgram(programType, programName, programAmount); } catch { /* non-fatal */ }
    } catch {
      setError('Funding applications are temporarily unavailable. Please contact support@getbankable.io or try again later.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  // ── Step progress ────────────────────────────────────────────────────────────
  const steps: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: 'business', label: 'Business', icon: Building2 },
    { key: 'owner',    label: 'Owner',    icon: User },
    { key: 'loan',     label: 'Loan',     icon: DollarSign },
  ];
  const stepIndex = steps.findIndex(s => s.key === step);
  const pct = Math.round(((stepIndex + 1) / 3) * 100);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', background: 'rgba(0,0,0,0.6)',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card)', borderRadius: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          width: '100%', maxWidth: '680px', maxHeight: '92vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Zap size={16} style={{ color: '#10b981' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Funding Application
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: '#fff', margin: 0 }}>
                {programName}
              </h2>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '5px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                  {programAmount}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '5px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  {programType}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Pre-fill identity bar — Chase: "you are X% pre-filled" */}
          {preFillCount > 0 && (
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '12px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                ✓ Pre-filling <strong>{preFillCount} of {TOTAL_FIELDS}</strong> fields from your Bankable IQ profile
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}> — marked with <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', verticalAlign: 'middle' }} /></span>
              </div>
            </div>
          )}

          {/* Step indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {steps.map((s, i) => {
              const Icon = s.icon;
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: done ? '#10b981' : active ? '#fff' : 'rgba(255,255,255,0.12)',
                      flexShrink: 0,
                    }}>
                      {done
                        ? <CheckCircle size={14} style={{ color: '#0f172a' }} />
                        : <Icon size={13} style={{ color: active ? '#0f172a' : 'rgba(255,255,255,0.4)' }} />
                      }
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: active ? 700 : 500, color: active ? '#fff' : done ? '#10b981' : 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div style={{ flex: 1, height: '1px', background: done ? '#10b981' : 'rgba(255,255,255,0.12)', margin: '0 10px' }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden', marginTop: '10px' }}>
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ height: '100%', background: '#10b981', borderRadius: '99px' }}
            />
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Success state */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ padding: '40px 24px', textAlign: 'center' }}
            >
              {/* Big green check */}
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} style={{ color: '#10b981' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)', margin: '0 0 6px' }}>
                Application Submitted!
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', margin: '0 0 28px', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                Your {programName} application is in the lender queue. Here's what happens next:
              </p>

              {/* Timeline */}
              <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto 32px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { day: 'Today', title: 'Application received', detail: 'Your profile is in the lender queue — soft pull only, no credit impact', color: '#10b981', done: true },
                  { day: 'Day 1–2', title: 'Advisor reviews your file', detail: 'A dedicated funding advisor evaluates your profile against lender criteria', color: '#3b82f6', done: false },
                  { day: 'Day 2–4', title: 'Soft pull & underwriting', detail: 'Lender runs a soft credit check and reviews your business financials', color: '#f59e0b', done: false },
                  { day: 'Day 3–5', title: 'Real offer arrives', detail: 'You receive actual amount, rate, and term — no obligation to accept', color: '#6366f1', done: false },
                ].map((step, i, arr) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step.done ? step.color : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${step.done ? step.color : 'var(--border)'}` }}>
                        {step.done
                          ? <CheckCircle size={14} style={{ color: 'white' }} />
                          : <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--muted-foreground)' }} />
                        }
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ width: '2px', flex: 1, background: 'var(--border)', margin: '4px 0', minHeight: '24px' }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: i < arr.length - 1 ? '16px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: step.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{step.day}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>{step.title}</span>
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.5 }}>{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { onClose(); navigate('/app/access-funding'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '11px 22px', borderRadius: '9px', background: '#10b981', border: 'none', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
                >
                  View My Pipeline <ChevronRight size={15} />
                </button>
                <button
                  onClick={onClose}
                  style={{ padding: '11px 18px', borderRadius: '9px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Business Info */}
          {!isSuccess && step === 'business' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={sectionTitle}>Business Information</p>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>Legal Business Name <PreFilledDot /></label>
                  <input value={form.businessLegalName} onChange={set('businessLegalName')} placeholder="Acme LLC" style={inputStyle} />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>EIN / Tax ID</label>
                  <input value={form.ein} onChange={set('ein')} placeholder="XX-XXXXXXX" style={inputStyle} />
                </div>
              </div>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>Business Phone <PreFilledDot /></label>
                  <input value={form.businessPhone} onChange={set('businessPhone')} placeholder="(555) 000-0000" style={inputStyle} />
                </div>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>Contact Email <PreFilledDot /></label>
                  <input value={form.contactEmail} onChange={set('contactEmail')} placeholder="you@business.com" style={inputStyle} />
                </div>
              </div>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>Entity Type <PreFilledDot /></label>
                  <select value={form.businessEntity} onChange={set('businessEntity')} style={selectStyle}>
                    <option value="">Select…</option>
                    <option value="LLC">LLC</option>
                    <option value="S-Corp">S-Corp</option>
                    <option value="C-Corp">C-Corp</option>
                    <option value="Sole Proprietor">Sole Proprietor</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Non-Profit">Non-Profit</option>
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>Annual Revenue <PreFilledDot /></label>
                  <input value={form.businessRevenue} onChange={set('businessRevenue')} placeholder="150000" style={inputStyle} />
                </div>
              </div>

              <div style={fieldWrap}>
                <label style={preFillLabelStyle}>Business Address <PreFilledDot /></label>
                <input value={form.businessAddress} onChange={set('businessAddress')} placeholder="123 Main St" style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '12px' }}>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>City <PreFilledDot /></label>
                  <input value={form.businessCity} onChange={set('businessCity')} placeholder="Chicago" style={inputStyle} />
                </div>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>State <PreFilledDot /></label>
                  <select value={form.businessState} onChange={set('businessState')} style={selectStyle}>
                    <option value="">–</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>ZIP <PreFilledDot /></label>
                  <input value={form.businessZip} onChange={set('businessZip')} placeholder="60601" style={inputStyle} />
                </div>
              </div>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>Date Established <PreFilledDot /></label>
                  <input value={form.businessStartDate} onChange={set('businessStartDate')} placeholder="MM/DD/YYYY" style={inputStyle} />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>State of Organization</label>
                  <select value={form.businessStateOfOrganization} onChange={set('businessStateOfOrganization')} style={selectStyle}>
                    <option value="">–</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Property Status</label>
                  <select value={form.businessPropertyStatus} onChange={set('businessPropertyStatus')} style={selectStyle}>
                    <option value="">Select…</option>
                    <option value="Own">Own</option>
                    <option value="Rent">Rent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Monthly Property Payment</label>
                  <input value={form.businessPropertyPayment} onChange={set('businessPropertyPayment')} placeholder="2500" style={inputStyle} />
                </div>
              </div>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Seasonal Business?</label>
                  <select value={form.businessSeason} onChange={set('businessSeason')} style={selectStyle}>
                    <option value="">Select…</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>DBA (if applicable)</label>
                  <input value={form.dba} onChange={set('dba')} placeholder="Trading as…" style={inputStyle} />
                </div>
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Business Website</label>
                <input value={form.businessWebsite} onChange={set('businessWebsite')} placeholder="https://yourbusiness.com" style={inputStyle} />
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Business Description</label>
                <textarea
                  value={form.businessDescription}
                  onChange={set('businessDescription')}
                  placeholder="Brief description of what your business does…"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Owner Info */}
          {!isSuccess && step === 'owner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={sectionTitle}>Owner Information</p>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>First Name <PreFilledDot /></label>
                  <input value={form.firstName} onChange={set('firstName')} placeholder="Jane" style={inputStyle} />
                </div>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>Last Name <PreFilledDot /></label>
                  <input value={form.lastName} onChange={set('lastName')} placeholder="Smith" style={inputStyle} />
                </div>
              </div>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>Cell Phone <PreFilledDot /></label>
                  <input value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" style={inputStyle} />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Ownership %</label>
                  <input value={form.percentageOwnership} onChange={set('percentageOwnership')} placeholder="100" style={inputStyle} />
                </div>
              </div>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>
                    Social Security Number
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 400, color: 'var(--muted-foreground)', marginLeft: '6px', textTransform: 'none', letterSpacing: 0 }}>
                      (enter directly — never stored)
                    </span>
                  </label>
                  <input
                    value={form.applicantSocial}
                    onChange={set('applicantSocial')}
                    placeholder="XXX-XX-XXXX"
                    type="password"
                    autoComplete="off"
                    style={inputStyle}
                  />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>
                    Date of Birth
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 400, color: 'var(--muted-foreground)', marginLeft: '6px', textTransform: 'none', letterSpacing: 0 }}>
                      (enter directly)
                    </span>
                  </label>
                  <input value={form.dateOfBirth} onChange={set('dateOfBirth')} placeholder="MM/DD/YYYY" style={inputStyle} />
                </div>
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Residential Address</label>
                <input value={form.ownerAddress} onChange={set('ownerAddress')} placeholder="456 Oak Ave" style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '12px' }}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>City</label>
                  <input value={form.ownerCity} onChange={set('ownerCity')} placeholder="Chicago" style={inputStyle} />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>State</label>
                  <select value={form.ownerState} onChange={set('ownerState')} style={selectStyle}>
                    <option value="">–</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>ZIP</label>
                  <input value={form.ownerZip} onChange={set('ownerZip')} placeholder="60601" style={inputStyle} />
                </div>
              </div>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Time at Residence</label>
                  <select value={form.ownerTimeLivingThere} onChange={set('ownerTimeLivingThere')} style={selectStyle}>
                    <option value="">Select…</option>
                    <option value="Less than 1 year">Less than 1 year</option>
                    <option value="1–2 years">1–2 years</option>
                    <option value="2–5 years">2–5 years</option>
                    <option value="5–10 years">5–10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Residence Status</label>
                  <select value={form.ownerPropertyStatus} onChange={set('ownerPropertyStatus')} style={selectStyle}>
                    <option value="">Select…</option>
                    <option value="Own">Own</option>
                    <option value="Rent">Rent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Monthly Housing Payment</label>
                <input value={form.ownerPropertyPayment} onChange={set('ownerPropertyPayment')} placeholder="1800" style={inputStyle} />
              </div>
            </div>
          )}

          {/* Step 3: Loan Info + Signature */}
          {!isSuccess && step === 'loan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={sectionTitle}>Loan Request</p>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Requested Amount</label>
                  <input value={form.loanAmount} onChange={set('loanAmount')} placeholder="50000" style={inputStyle} />
                </div>
                <div style={fieldWrap}>
                  <label style={preFillLabelStyle}>Personal Credit Score <PreFilledDot /></label>
                  <select value={form.personalCredit} onChange={set('personalCredit')} style={selectStyle}>
                    <option value="">Select range…</option>
                    <option value="800+">800+ (Excellent)</option>
                    <option value="750–799">750–799 (Very Good)</option>
                    <option value="700–749">700–749 (Good)</option>
                    <option value="650–699">650–699 (Fair)</option>
                    <option value="600–649">600–649 (Below Average)</option>
                    <option value="Below 600">Below 600</option>
                  </select>
                </div>
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Use of Funds</label>
                <select value={form.useOfFunds} onChange={set('useOfFunds')} style={selectStyle}>
                  <option value="">Select…</option>
                  <option value="Working Capital">Working Capital</option>
                  <option value="Equipment Purchase">Equipment Purchase</option>
                  <option value="Expansion">Expansion</option>
                  <option value="Inventory">Inventory</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Debt Refinancing">Debt Refinancing</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={rowStyle}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Bankruptcy (past 7 years)?</label>
                  <select value={form.bankruptcyStatus} onChange={set('bankruptcyStatus')} style={selectStyle}>
                    <option value="">Select…</option>
                    <option value="No">No</option>
                    <option value="Yes – Chapter 7">Yes – Chapter 7</option>
                    <option value="Yes – Chapter 11">Yes – Chapter 11</option>
                    <option value="Yes – Chapter 13">Yes – Chapter 13</option>
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Outstanding Loans?</label>
                  <select value={form.outstandingLoans} onChange={set('outstandingLoans')} style={selectStyle}>
                    <option value="">Select…</option>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>

              {/* Consent + Signature */}
              <div style={{ marginTop: '8px', padding: '16px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.6, margin: '0 0 12px' }}>
                  By signing below, I authorize Bankable IQ and its funding partners to obtain my personal and business credit information for the purpose of evaluating this application. I confirm all information provided is accurate.
                </p>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    id="terms-agree"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    style={{ marginTop: '2px', accentColor: '#10b981', width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  <label htmlFor="terms-agree" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', cursor: 'pointer', lineHeight: 1.5 }}>
                    I agree to the terms above and authorize credit inquiries
                  </label>
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Digital Signature — type your full legal name</label>
                  <input
                    value={signature}
                    onChange={e => setSignature(e.target.value)}
                    placeholder="Jane Smith"
                    style={{ ...inputStyle, fontFamily: 'Georgia, serif', fontSize: '15px', letterSpacing: '0.03em' }}
                  />
                </div>
              </div>

              {error && (
                <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontFamily: 'var(--font-body)', fontSize: '12px', color: '#ef4444' }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {!isSuccess && (
          <div style={{
            padding: '14px 24px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--card)', flexShrink: 0,
          }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
              Step {stepIndex + 1} of 3
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {step !== 'business' && (
                <button
                  onClick={() => setStep(step === 'loan' ? 'owner' : 'business')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 16px', borderRadius: '8px', fontSize: '13px',
                    fontFamily: 'var(--font-body)', fontWeight: 600,
                    background: 'var(--background)', border: '1px solid var(--border)',
                    color: 'var(--foreground)', cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={14} /> Back
                </button>
              )}

              {step !== 'loan' ? (
                <button
                  onClick={() => setStep(step === 'business' ? 'owner' : 'loan')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 20px', borderRadius: '8px', fontSize: '13px',
                    fontFamily: 'var(--font-body)', fontWeight: 700,
                    background: '#10b981', border: 'none',
                    color: '#fff', cursor: 'pointer',
                  }}
                >
                  Continue <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 24px', borderRadius: '8px', fontSize: '13px',
                    fontFamily: 'var(--font-body)', fontWeight: 700,
                    background: isSubmitting ? 'rgba(16,185,129,0.5)' : '#10b981',
                    border: 'none', color: '#fff',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Application'}
                  {!isSubmitting && <Zap size={14} />}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
