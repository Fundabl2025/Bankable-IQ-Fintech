// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Settings
// Left sub-nav layout with Profile, Business, Notifications, Privacy sections
// ════════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  User,
  Building2,
  Bell,
  Lock,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Mail,
  Phone,
  Globe,
  Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ── Sub-nav sections ──────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'profile',
    label: 'Profile & Account',
    icon: User,
    description: 'Your name, email, and login settings',
  },
  {
    id: 'business',
    label: 'Business Settings',
    icon: Building2,
    description: 'Business name, entity, and verification',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Email and in-app notification preferences',
  },
  {
    id: 'privacy',
    label: 'Privacy & Data',
    icon: Lock,
    description: 'Data sharing and account security',
  },
];

// ════════════════════════════════════════════════════════════════════════════════
// MAIN SETTINGS COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div
      className="flex-1 min-h-screen overflow-auto"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-5xl mx-auto px-6 py-8 lg:px-8 lg:py-10">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(24px, 4vw, 34px)',
              letterSpacing: '-0.02em',
              color: 'var(--foreground)',
            }}
          >
            Settings
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
            Manage your account, business profile, and preferences.
          </p>
        </motion.div>

        {/* Layout: left sub-nav + main content */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* ── Left Sub-Nav ──────────────────────────────────────────────── */}
          <div
            style={{
              width: '220px',
              flexShrink: 0,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              overflow: 'hidden',
              position: 'sticky',
              top: '24px',
            }}
          >
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: isActive ? 'var(--primary)' : 'var(--muted-foreground)', flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                    }}
                  >
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Main Content ──────────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'profile' && <ProfileSection user={user} onNavigate={navigate} />}
              {activeSection === 'business' && <BusinessSection onNavigate={navigate} />}
              {activeSection === 'notifications' && <NotificationsSection />}
              {activeSection === 'privacy' && <PrivacySection />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '16px',
      }}
    >
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>
          {title}
        </h2>
      </div>
      <div style={{ padding: '4px 0' }}>{children}</div>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  badge,
  onClick,
}: {
  icon?: any;
  label: string;
  value?: string;
  badge?: { text: string; color: string };
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '13px 20px',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLElement).style.background = 'transparent')}
    >
      {Icon && <Icon size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
          {label}
        </div>
        {value && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
            {value}
          </div>
        )}
      </div>
      {badge && (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '10px',
            background: badge.color === 'amber' ? '#fef3c7' : '#dcfce7',
            color: badge.color === 'amber' ? '#92400e' : '#166534',
          }}
        >
          {badge.text}
        </span>
      )}
      {onClick && <ChevronRight size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />}
    </div>
  );
}

// ── Profile & Account ─────────────────────────────────────────────────────────

function ProfileSection({ user, onNavigate }: { user: any; onNavigate: (path: string) => void }) {
  const email = user?.email || 'Not set';
  const emailVerified = !!user?.email_confirmed_at;
  const name = [user?.user_metadata?.first_name, user?.user_metadata?.last_name].filter(Boolean).join(' ') || 'Not set';

  return (
    <>
      <SectionCard title="Account Information">
        <SettingsRow icon={User} label="Full Name" value={name} onClick={() => {}} />
        <SettingsRow
          icon={Mail}
          label="Email Address"
          value={email}
          badge={emailVerified ? { text: 'Verified', color: 'green' } : { text: 'Unverified', color: 'amber' }}
        />
        <SettingsRow icon={Phone} label="Phone Number" value="Not set" onClick={() => {}} />
      </SectionCard>

      <SectionCard title="Password & Security">
        <SettingsRow icon={Lock} label="Change Password" onClick={() => {}} />
        <SettingsRow icon={Shield} label="Two-Factor Authentication" badge={{ text: 'Coming Soon', color: 'amber' }} />
      </SectionCard>

      {!emailVerified && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Mail size={16} style={{ color: '#92400e', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: '#92400e' }}>
              Email not verified
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#a16207', marginTop: '2px' }}>
              Verify your email to save your FundScore and unlock your full capital report.
            </div>
          </div>
          <button
            style={{
              padding: '6px 14px',
              background: '#92400e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Resend Email
          </button>
        </div>
      )}
    </>
  );
}

// ── Business Settings ─────────────────────────────────────────────────────────

function BusinessSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <>
      <SectionCard title="Business Profile">
        <SettingsRow icon={Building2} label="Business Name" value="Not set" onClick={() => onNavigate('/app/settings/my-business-profile')} />
        <SettingsRow icon={Globe} label="Entity Type" value="Not set" onClick={() => onNavigate('/app/settings/my-business-profile')} />
        <SettingsRow icon={Globe} label="Industry" value="Not set" onClick={() => onNavigate('/app/settings/my-business-profile')} />
        <SettingsRow icon={Globe} label="Business Website" value="Not set" onClick={() => onNavigate('/app/settings/my-business-profile')} />
      </SectionCard>

      <SectionCard title="Verification Status">
        <SettingsRow
          icon={CheckCircle2}
          label="EIN / Tax ID"
          badge={{ text: 'Not Verified', color: 'amber' }}
          onClick={() => onNavigate('/app/lender-compliance/ein-licenses')}
        />
        <SettingsRow
          icon={CheckCircle2}
          label="Business Bank Account"
          badge={{ text: 'Not Linked', color: 'amber' }}
          onClick={() => onNavigate('/app/lender-compliance/business-banking')}
        />
        <SettingsRow
          icon={CheckCircle2}
          label="411 Business Listing"
          badge={{ text: 'Not Verified', color: 'amber' }}
          onClick={() => onNavigate('/app/lender-compliance/phones-411')}
        />
      </SectionCard>

      <div style={{ padding: '12px 0' }}>
        <button
          onClick={() => onNavigate('/app/settings/my-business-profile')}
          style={{
            width: '100%',
            padding: '13px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Complete My Business Profile →
        </button>
      </div>
    </>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    scoreUpdates: true,
    weeklyDigest: true,
    productAlerts: false,
    marketingEmails: false,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <SectionCard title="Notification Preferences">
      {([
        { key: 'scoreUpdates', label: 'FundScore Updates', desc: 'When your score changes after reassessment' },
        { key: 'weeklyDigest', label: 'Weekly Capital Digest', desc: 'Summary of your capital readiness progress' },
        { key: 'productAlerts', label: 'New Capital Products', desc: 'When new products matching your profile unlock' },
        { key: 'marketingEmails', label: 'Tips & Education', desc: 'Capital readiness tips and guides' },
      ] as const).map(({ key, label, desc }) => (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '13px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
              {label}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
              {desc}
            </div>
          </div>
          <button
            onClick={() => toggle(key)}
            style={{
              width: '40px',
              height: '22px',
              borderRadius: '11px',
              background: prefs[key] ? 'var(--primary)' : 'var(--border)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: prefs[key] ? '21px' : '3px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'white',
                transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            />
          </button>
        </div>
      ))}
    </SectionCard>
  );
}

// ── Privacy & Data ────────────────────────────────────────────────────────────

function PrivacySection() {
  return (
    <>
      <SectionCard title="Data & Privacy">
        <SettingsRow icon={Shield} label="Download My Data" onClick={() => {}} />
        <SettingsRow icon={Lock} label="Privacy Policy" onClick={() => {}} />
        <SettingsRow icon={Globe} label="Terms of Service" onClick={() => {}} />
      </SectionCard>

      <SectionCard title="Account Actions">
        <div
          style={{ padding: '13px 20px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--secondary)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#ef4444' }}>
            Delete Account
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
            Permanently remove your account and all associated data.
          </div>
        </div>
      </SectionCard>
    </>
  );
}

export default Settings;
