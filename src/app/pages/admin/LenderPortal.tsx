// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Lender Admin Portal
// Internal tool: view all applications, update pipeline stage, submit offers.
// Access restricted to users in the admin_roles table.
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  CheckCircle2, Clock, DollarSign, AlertTriangle,
  ChevronDown, ChevronUp, ArrowRight, Search, X,
  RefreshCw, Shield,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { STAGE_CONFIG, type ApplicationStatus } from '../../lib/funding-service';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminApplication {
  id: string;
  user_id: string;
  program_id: string;
  program_name: string;
  status: ApplicationStatus;
  pre_qualified_amount: string | null;
  pre_qualified_rate: string | null;
  offer_amount: number | null;
  offer_rate: string | null;
  offer_term: string | null;
  offer_received_at: string | null;
  funded_at: string | null;
  declined_at: string | null;
  lender_notes: string | null;
  applied_at: string | null;
  updated_at: string | null;
  // joined from business_profiles
  business_name?: string;
  contact_email?: string;
  contact_phone?: string;
  fund_score?: number;
}

interface OfferForm {
  status: ApplicationStatus;
  offer_amount: string;
  offer_rate: string;
  offer_term: string;
  lender_notes: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  'applied', 'under_review', 'offer_received', 'accepted', 'funded', 'declined',
];

// ════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export function LenderPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = loading
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OfferForm>({ status: 'applied', offer_amount: '', offer_rate: '', offer_term: '', lender_notes: '' });
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // ── Check admin access ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  // ── Load all applications ───────────────────────────────────────────────────
  const loadApps = async () => {
    setLoading(true);
    // Join with business_profiles for user info
    const { data, error } = await supabase
      .from('funding_applications')
      .select(`
        *,
        business_profiles!inner(business_name, contact_email, contact_phone, fund_score)
      `)
      .not('status', 'eq', 'withdrawn')
      .order('applied_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map((row: any) => ({
        ...row,
        business_name: row.business_profiles?.business_name,
        contact_email: row.business_profiles?.contact_email,
        contact_phone: row.business_profiles?.contact_phone,
        fund_score: row.business_profiles?.fund_score,
      }));
      setApplications(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadApps();
  }, [isAdmin]);

  // ── Save offer / status update ──────────────────────────────────────────────
  const handleSave = async (appId: string) => {
    setSaving(true);
    const now = new Date().toISOString();
    const update: Record<string, any> = {
      status: form.status,
      lender_notes: form.lender_notes || null,
      updated_at: now,
    };

    if (form.offer_amount) update.offer_amount = parseFloat(form.offer_amount.replace(/[^0-9.]/g, ''));
    if (form.offer_rate) update.offer_rate = form.offer_rate;
    if (form.offer_term) update.offer_term = form.offer_term;
    if (form.status === 'offer_received' && !applications.find(a => a.id === appId)?.offer_received_at) {
      update.offer_received_at = now;
    }
    if (form.status === 'funded') update.funded_at = now;
    if (form.status === 'declined') update.declined_at = now;

    const { error } = await supabase
      .from('funding_applications')
      .update(update)
      .eq('id', appId);

    setSaving(false);
    if (error) {
      showToast('Save failed: ' + error.message, false);
    } else {
      showToast('Saved successfully', true);
      setEditingId(null);
      loadApps();
    }
  };

  const openEdit = (app: AdminApplication) => {
    setForm({
      status: app.status,
      offer_amount: app.offer_amount ? String(app.offer_amount) : '',
      offer_rate: app.offer_rate || '',
      offer_term: app.offer_term || '',
      lender_notes: app.lender_notes || '',
    });
    setEditingId(app.id);
    setExpandedId(app.id);
  };

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = applications.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q || (
      (a.business_name || '').toLowerCase().includes(q) ||
      (a.program_name || '').toLowerCase().includes(q) ||
      (a.contact_email || '').toLowerCase().includes(q)
    );
    return matchesStatus && matchesSearch;
  });

  // ── Pipeline counts ─────────────────────────────────────────────────────────
  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  // ── Access guard ────────────────────────────────────────────────────────────
  if (isAdmin === null) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--background)' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)' }}>Checking access…</div>
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', background: 'var(--background)' }}>
        <Shield size={40} style={{ color: '#ef4444' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--foreground)' }}>Access Restricted</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)' }}>This portal is for FundReady staff only.</div>
        <button onClick={() => navigate('/app')} style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', padding: '10px 20px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--foreground)' }}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ flex: 1, minHeight: '100vh', background: 'var(--background)', overflowY: 'auto' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: '20px', right: '24px', zIndex: 9999, padding: '12px 18px', borderRadius: '10px', background: toast.ok ? '#10b981' : '#ef4444', color: 'white', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            {toast.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Shield size={14} style={{ color: '#3b82f6' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin · Lender Portal</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px, 3vw, 30px)', color: 'var(--foreground)', margin: 0, lineHeight: 1.1 }}>
              Application Pipeline
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
              {applications.length} total applications · Update status, submit offers, add notes
            </p>
          </div>
          <button onClick={loadApps} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px', padding: '9px 16px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Pipeline summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '24px' }}>
          {STATUS_OPTIONS.map(s => {
            const cfg = STAGE_CONFIG[s];
            return (
              <div
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                style={{ padding: '12px 14px', borderRadius: '10px', background: statusFilter === s ? cfg.bg : 'var(--card)', border: `1px solid ${statusFilter === s ? cfg.color + '40' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', color: counts[s] > 0 ? cfg.color : 'var(--muted-foreground)' }}>{counts[s]}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600, marginTop: '2px' }}>{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={13} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by business, program, or email…"
              style={{ width: '100%', padding: '9px 12px 9px 32px', fontFamily: 'var(--font-body)', fontSize: '13px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {search && (
            <button onClick={() => setSearch('')} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={12} /> Clear
            </button>
          )}
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Application rows */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)' }}>Loading applications…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📭</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--foreground)' }}>No applications found</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(app => {
              const cfg = STAGE_CONFIG[app.status];
              const isExpanded = expandedId === app.id;
              const isEditing = editingId === app.id;

              return (
                <motion.div
                  key={app.id}
                  layout
                  style={{
                    background: 'var(--card)',
                    border: `1px solid ${isEditing ? cfg.color + '50' : 'var(--border)'}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Row header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
                  >
                    {/* Stage dot */}
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />

                    {/* Program + business */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>{app.program_name}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '5px', background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        {app.offer_amount && (
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: '#10b981' }}>
                            ${Number(app.offer_amount).toLocaleString()}
                            {app.offer_rate ? ` @ ${app.offer_rate}` : ''}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{app.business_name || 'Unknown Business'}</span>
                        {app.contact_email && <span> · {app.contact_email}</span>}
                        {app.fund_score && <span> · FundScore {app.fund_score}</span>}
                        <span> · Applied {timeAgo(app.applied_at)}</span>
                        {app.pre_qualified_amount && <span> · Pre-qual: {app.pre_qualified_amount}</span>}
                      </div>
                    </div>

                    {/* Edit button */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => isEditing ? setEditingId(null) : openEdit(app)}
                        style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', padding: '7px 14px', background: isEditing ? 'var(--border)' : cfg.bg, border: `1px solid ${cfg.color}30`, borderRadius: '7px', color: isEditing ? 'var(--muted-foreground)' : cfg.color, cursor: 'pointer' }}
                      >
                        {isEditing ? 'Cancel' : 'Update'}
                      </button>
                    </div>
                    <div style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </div>

                  {/* Expanded panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '0 18px 20px', borderTop: '1px solid var(--border)' }}>

                          {isEditing ? (
                            /* ── EDIT FORM ──────────────────────────────── */
                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>
                                Update Application — {app.business_name}
                              </div>

                              {/* Status selector */}
                              <div>
                                <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Pipeline Stage</label>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {STATUS_OPTIONS.map(s => {
                                    const sc = STAGE_CONFIG[s];
                                    return (
                                      <button
                                        key={s}
                                        onClick={() => setForm(f => ({ ...f, status: s }))}
                                        style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px', padding: '6px 12px', borderRadius: '7px', cursor: 'pointer', border: `1px solid ${form.status === s ? sc.color : 'var(--border)'}`, background: form.status === s ? sc.bg : 'var(--background)', color: form.status === s ? sc.color : 'var(--muted-foreground)' }}
                                      >
                                        {sc.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Offer fields */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                {[
                                  { key: 'offer_amount', label: 'Offer Amount', placeholder: '150000' },
                                  { key: 'offer_rate', label: 'Interest Rate', placeholder: '8.5% APR' },
                                  { key: 'offer_term', label: 'Repayment Term', placeholder: '60 months' },
                                ].map(field => (
                                  <div key={field.key}>
                                    <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>{field.label}</label>
                                    <input
                                      value={(form as any)[field.key]}
                                      onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                                      placeholder={field.placeholder}
                                      style={{ width: '100%', padding: '8px 10px', fontFamily: 'var(--font-body)', fontSize: '13px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--foreground)', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Notes */}
                              <div>
                                <label style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Lender Notes (shown to applicant)</label>
                                <textarea
                                  value={form.lender_notes}
                                  onChange={e => setForm(f => ({ ...f, lender_notes: e.target.value }))}
                                  placeholder="e.g. Approved based on strong cash flow. Funds disbursed within 3 business days."
                                  rows={3}
                                  style={{ width: '100%', padding: '8px 10px', fontFamily: 'var(--font-body)', fontSize: '13px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--foreground)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                              </div>

                              {/* Save */}
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button
                                  onClick={() => handleSave(app.id)}
                                  disabled={saving}
                                  style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 22px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '9px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', opacity: saving ? 0.7 : 1 }}
                                >
                                  {saving ? 'Saving…' : <><CheckCircle2 size={14} /> Save & Notify</>}
                                </button>
                                <button onClick={() => setEditingId(null)} style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '12px', padding: '10px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* ── READ-ONLY DETAIL ───────────────────────── */
                            <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                              {[
                                { label: 'Business', value: app.business_name },
                                { label: 'Email', value: app.contact_email },
                                { label: 'Phone', value: app.contact_phone },
                                { label: 'FundScore', value: app.fund_score ? String(app.fund_score) : null },
                                { label: 'Pre-qual Amount', value: app.pre_qualified_amount },
                                { label: 'Pre-qual Rate', value: app.pre_qualified_rate },
                                { label: 'Offer Amount', value: app.offer_amount ? `$${Number(app.offer_amount).toLocaleString()}` : null },
                                { label: 'Offer Rate', value: app.offer_rate },
                                { label: 'Offer Term', value: app.offer_term },
                                { label: 'Applied', value: app.applied_at ? new Date(app.applied_at).toLocaleDateString() : null },
                                { label: 'Offer Sent', value: app.offer_received_at ? new Date(app.offer_received_at).toLocaleDateString() : null },
                                { label: 'Funded', value: app.funded_at ? new Date(app.funded_at).toLocaleDateString() : null },
                              ].filter(f => f.value).map(field => (
                                <div key={field.label}>
                                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{field.label}</div>
                                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)', fontWeight: 600 }}>{field.value}</div>
                                </div>
                              ))}
                              {app.lender_notes && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Lender Notes</div>
                                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>"{app.lender_notes}"</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
