import { useState } from 'react';
import { User, Save, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { motion } from 'motion/react';

export function OwnersCredit() {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    ssn: '',
    dateOfBirth: '',
    ownershipPercentage: '',
    
    // Credit Scores
    experianScore: '720',
    transUnionScore: '720',
    equiFaxScore: '720',
    
    // Financial Information
    personalIncome: '$100,000',
    homeOwnership: 'Own',
    monthlyMortgage: '',
    liquidAssets: '',
    
    // Credit History
    yearsOfCredit: '10+',
    bankruptcies: 'None',
    foreclosures: 'None',
    taxLiens: 'None',
    judgments: 'None',
    
    // Contact
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleSave = () => {
    localStorage.setItem('ownersCredit', JSON.stringify(formData));
    alert('Owner credit information saved successfully!');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 740) return 'var(--primary)';
    if (score >= 670) return 'var(--status-approaching)';
    if (score >= 580) return 'var(--status-locked)';
    return 'var(--status-locked)';
  };

  const getCreditRating = (score: number) => {
    if (score >= 740) return 'Excellent';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  const avgScore = Math.round((
    parseInt(formData.experianScore || '0') + 
    parseInt(formData.transUnionScore || '0') + 
    parseInt(formData.equiFaxScore || '0')
  ) / 3);

  const isQualified = avgScore >= 680;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 
              className="text-[32px] tracking-tight"
              style={{ 
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--foreground)'
              }}
            >
              Owner's Credit Profile
            </h1>
            <div 
              className="px-3 py-1 rounded-sm text-[11px] uppercase tracking-[0.12em]"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                backgroundColor: 'rgba(138, 184, 32, 0.1)',
                color: 'var(--primary)',
                border: '1px solid var(--primary)'
              }}
            >
              Required for Funding
            </div>
          </div>
          <p 
            className="text-[14px]"
            style={{ 
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              color: 'var(--muted-foreground)'
            }}
          >
            Personal credit information for business financing assessment
          </p>
        </motion.div>

        {/* Credit Score Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-sm p-8 mb-8 relative overflow-hidden"
          style={{ 
            background: isQualified 
              ? 'linear-gradient(135deg, rgba(138, 184, 32, 0.12) 0%, rgba(56, 168, 128, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(200, 144, 32, 0.12) 0%, rgba(176, 68, 40, 0.08) 100%)',
            border: `1px solid ${isQualified ? 'var(--primary)' : 'var(--status-approaching)'}`
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 
                className="text-[24px] mb-2"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: 'var(--foreground)'
                }}
              >
                Average Credit Score
              </h2>
              <p 
                className="text-[13px]"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  color: 'var(--foreground-secondary)'
                }}
              >
                Based on three bureau scores
              </p>
            </div>
            <div 
              className="w-16 h-16 rounded-sm flex items-center justify-center"
              style={{ 
                backgroundColor: 'var(--bg-surface-2)',
                border: `2px solid ${getCreditScoreColor(avgScore)}`
              }}
            >
              <User className="w-8 h-8" style={{ color: getCreditScoreColor(avgScore) }} />
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <div 
                className="text-[52px] leading-none mb-2"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  color: getCreditScoreColor(avgScore)
                }}
              >
                {avgScore}
              </div>
              <div 
                className="text-[16px] italic"
                style={{ 
                  fontFamily: 'var(--font-accent)',
                  fontWeight: 300,
                  color: 'var(--muted-foreground)'
                }}
              >
                {getCreditRating(avgScore)}
              </div>
            </div>
            
            <div 
              className="px-4 py-2 rounded-sm"
              style={{ 
                backgroundColor: isQualified ? 'rgba(138, 184, 32, 0.15)' : 'rgba(200, 144, 32, 0.15)',
                border: `1px solid ${isQualified ? 'var(--primary)' : 'var(--status-approaching)'}`
              }}
            >
              {isQualified ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <span 
                    className="text-[12px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      color: 'var(--primary)'
                    }}
                  >
                    Meets Requirement (680+)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" style={{ color: 'var(--status-approaching)' }} />
                  <span 
                    className="text-[12px]"
                    style={{ 
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      color: 'var(--status-approaching)'
                    }}
                  >
                    Below Requirement (680+)
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bureau Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-sm p-8 mb-8"
          style={{ 
            backgroundColor: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h3 
            className="text-[18px] mb-6 flex items-center gap-2"
            style={{ 
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              color: 'var(--foreground)'
            }}
          >
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            Credit Bureau Scores
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Experian', field: 'experianScore' },
              { label: 'TransUnion', field: 'transUnionScore' },
              { label: 'Equifax', field: 'equiFaxScore' }
            ].map((bureau) => (
              <div key={bureau.field}>
                <Label 
                  htmlFor={bureau.field}
                  className="text-[11px] uppercase tracking-[0.15em] mb-2 block"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--foreground-secondary)'
                  }}
                >
                  {bureau.label}
                </Label>
                <Input
                  id={bureau.field}
                  type="number"
                  value={formData[bureau.field as keyof typeof formData]}
                  onChange={(e) => handleChange(bureau.field, e.target.value)}
                  placeholder="Enter score"
                  className="rounded-sm"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-sm p-8 mb-8"
          style={{ 
            backgroundColor: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h3 
            className="text-[18px] mb-6"
            style={{ 
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              color: 'var(--foreground)'
            }}
          >
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'First Name', field: 'firstName', type: 'text' },
              { label: 'Last Name', field: 'lastName', type: 'text' },
              { label: 'SSN', field: 'ssn', type: 'text', placeholder: '***-**-****' },
              { label: 'Date of Birth', field: 'dateOfBirth', type: 'date' },
              { label: 'Ownership %', field: 'ownershipPercentage', type: 'number', placeholder: '25' },
              { label: 'Personal Income', field: 'personalIncome', type: 'text', placeholder: '$100,000' }
            ].map((fieldInfo) => (
              <div key={fieldInfo.field}>
                <Label 
                  htmlFor={fieldInfo.field}
                  className="text-[11px] uppercase tracking-[0.15em] mb-2 block"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--foreground-secondary)'
                  }}
                >
                  {fieldInfo.label}
                </Label>
                <Input
                  id={fieldInfo.field}
                  type={fieldInfo.type}
                  value={formData[fieldInfo.field as keyof typeof formData]}
                  onChange={(e) => handleChange(fieldInfo.field, e.target.value)}
                  placeholder={fieldInfo.placeholder || `Enter ${fieldInfo.label.toLowerCase()}`}
                  className="rounded-sm"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Financial Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-sm p-8 mb-8"
          style={{ 
            backgroundColor: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h3 
            className="text-[18px] mb-6"
            style={{ 
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              color: 'var(--foreground)'
            }}
          >
            Financial Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Home Ownership', field: 'homeOwnership', type: 'text', placeholder: 'Own / Rent' },
              { label: 'Monthly Mortgage/Rent', field: 'monthlyMortgage', type: 'text', placeholder: '$2,000' },
              { label: 'Liquid Assets', field: 'liquidAssets', type: 'text', placeholder: '$50,000' },
              { label: 'Years of Credit', field: 'yearsOfCredit', type: 'text', placeholder: '10+' }
            ].map((fieldInfo) => (
              <div key={fieldInfo.field}>
                <Label 
                  htmlFor={fieldInfo.field}
                  className="text-[11px] uppercase tracking-[0.15em] mb-2 block"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--foreground-secondary)'
                  }}
                >
                  {fieldInfo.label}
                </Label>
                <Input
                  id={fieldInfo.field}
                  type={fieldInfo.type}
                  value={formData[fieldInfo.field as keyof typeof formData]}
                  onChange={(e) => handleChange(fieldInfo.field, e.target.value)}
                  placeholder={fieldInfo.placeholder}
                  className="rounded-sm"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Credit History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-sm p-8 mb-8"
          style={{ 
            backgroundColor: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h3 
            className="text-[18px] mb-6"
            style={{ 
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              color: 'var(--foreground)'
            }}
          >
            Credit History
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Bankruptcies', field: 'bankruptcies', placeholder: 'None / 1 / 2+' },
              { label: 'Foreclosures', field: 'foreclosures', placeholder: 'None / 1 / 2+' },
              { label: 'Tax Liens', field: 'taxLiens', placeholder: 'None / 1 / 2+' },
              { label: 'Judgments', field: 'judgments', placeholder: 'None / 1 / 2+' }
            ].map((fieldInfo) => (
              <div key={fieldInfo.field}>
                <Label 
                  htmlFor={fieldInfo.field}
                  className="text-[11px] uppercase tracking-[0.15em] mb-2 block"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--foreground-secondary)'
                  }}
                >
                  {fieldInfo.label}
                </Label>
                <Input
                  id={fieldInfo.field}
                  type="text"
                  value={formData[fieldInfo.field as keyof typeof formData]}
                  onChange={(e) => handleChange(fieldInfo.field, e.target.value)}
                  placeholder={fieldInfo.placeholder}
                  className="rounded-sm"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-sm p-8 mb-8"
          style={{ 
            backgroundColor: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <h3 
            className="text-[18px] mb-6"
            style={{ 
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              color: 'var(--foreground)'
            }}
          >
            Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Phone', field: 'phone', type: 'tel', placeholder: '(555) 123-4567' },
              { label: 'Email', field: 'email', type: 'email', placeholder: 'owner@business.com' },
              { label: 'Address', field: 'address', type: 'text', placeholder: '123 Main St' },
              { label: 'City', field: 'city', type: 'text', placeholder: 'New York' },
              { label: 'State', field: 'state', type: 'text', placeholder: 'NY' },
              { label: 'Zip Code', field: 'zipCode', type: 'text', placeholder: '10001' }
            ].map((fieldInfo) => (
              <div key={fieldInfo.field}>
                <Label 
                  htmlFor={fieldInfo.field}
                  className="text-[11px] uppercase tracking-[0.15em] mb-2 block"
                  style={{ 
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    color: 'var(--foreground-secondary)'
                  }}
                >
                  {fieldInfo.label}
                </Label>
                <Input
                  id={fieldInfo.field}
                  type={fieldInfo.type}
                  value={formData[fieldInfo.field as keyof typeof formData]}
                  onChange={(e) => handleChange(fieldInfo.field, e.target.value)}
                  placeholder={fieldInfo.placeholder}
                  className="rounded-sm"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--foreground)'
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-end"
        >
          <Button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-sm transition-all duration-200"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '14px',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: '1px solid var(--primary)'
            }}
          >
            <Save className="w-4 h-4" />
            Save Owner Information
          </Button>
        </motion.div>

        {/* Information Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-sm p-6 mt-8"
          style={{ 
            background: 'rgba(138, 184, 32, 0.06)',
            border: '1px solid var(--primary)'
          }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
            <div>
              <h4 
                className="text-[14px] mb-2"
                style={{ 
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  color: 'var(--foreground)'
                }}
              >
                Why Owner's Credit Matters
              </h4>
              <p 
                className="text-[12px] leading-relaxed"
                style={{ 
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  color: 'var(--foreground-secondary)'
                }}
              >
                For FICO SBSS scoring, anyone owning 25% or more of the business must have a minimum personal credit score of 680. 
                This represents 35% of your Business FICO score. Scores above 710 significantly improve your fundability 
                and access to lower interest rates.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
