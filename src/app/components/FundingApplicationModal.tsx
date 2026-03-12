import { useState, useEffect } from 'react';
import { X, Building2, User, DollarSign, CheckCircle, Play, HelpCircle, CreditCard, Shield, Users, Phone, DollarSign as DollarSignIcon, FileCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';

interface FundingApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  programAmount: string;
  programType: string;
}

export function FundingApplicationModal({
  isOpen,
  onClose,
  programName,
  programAmount,
  programType
}: FundingApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState<'business' | 'owner' | 'loan'>('business');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');

  // Business Information
  const [businessLegalName, setBusinessLegalName] = useState('');
  const [businessTaxId, setBusinessTaxId] = useState('');
  const [dbaName, setDbaName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [isSeasonal, setIsSeasonal] = useState('');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessCity, setBusinessCity] = useState('');
  const [businessState, setBusinessState] = useState('');
  const [businessZip, setBusinessZip] = useState('');
  const [propertyStatus, setPropertyStatus] = useState('');
  const [dateEstablished, setDateEstablished] = useState('');
  const [propertyPayment, setPropertyPayment] = useState('');
  const [stateOfOrganization, setStateOfOrganization] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');

  // Owner Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ssn, setSsn] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [cellPhone, setCellPhone] = useState('');
  const [personalPropertyPayment, setPersonalPropertyPayment] = useState('');
  const [residenceAddress, setResidenceAddress] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  const [residenceState, setResidenceState] = useState('');
  const [residenceZip, setResidenceZip] = useState('');
  const [timeAtResidence, setTimeAtResidence] = useState('');
  const [residenceStatus, setResidenceStatus] = useState('');
  const [ownershipPercentage, setOwnershipPercentage] = useState('');

  // Loan Information
  const [loanAmount, setLoanAmount] = useState('');
  const [purposeOfFunds, setPurposeOfFunds] = useState('');
  const [bankruptcyStatus, setBankruptcyStatus] = useState('');
  const [estimatedCreditScore, setEstimatedCreditScore] = useState('');
  const [outstandingLoans, setOutstandingLoans] = useState('');

  // Pre-fill data from localStorage
  useEffect(() => {
    if (isOpen) {
      const step1Data = localStorage.getItem('scanStep1');
      const step2Data = localStorage.getItem('scanStep2');
      const step3Data = localStorage.getItem('scanStep3');

      if (step1Data) {
        const step1 = JSON.parse(step1Data);
        setBusinessLegalName(step1.businessName || '');
        setBusinessType(step1.businessType || '');
        setAnnualRevenue(step1.annualRevenue || '');
        setDateEstablished(step1.timeInBusiness || '');
      }

      if (step3Data) {
        const step3 = JSON.parse(step3Data);
        setEstimatedCreditScore(step3.personalCreditScore || '');
      }
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!agreedToTerms || !digitalSignature) {
      alert('Please sign the application and agree to the terms');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      setCurrentStep('business');
      setAgreedToTerms(false);
      setDigitalSignature('');
    }, 3000);
  };

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const faqs = [
    {
      icon: HelpCircle,
      question: 'How does this process work?',
      answer: 'Complete the application to the left and receive offers for amount, rate and term.'
    },
    {
      icon: CreditCard,
      question: 'Is there an impact on credit?',
      answer: 'Soft credit pulls are used to obtain offers. Hard pulls are done at funding only.'
    },
    {
      icon: Users,
      question: 'Do I get a funding adviser?',
      answer: 'Yes, a dedicated advisor will work with you to obtain the capital you need.'
    },
    {
      icon: Phone,
      question: 'Am I going to get contacted by lenders?',
      answer: 'Lenders only contact you after you accept their funding offers.'
    },
    {
      icon: DollarSignIcon,
      question: 'Does it cost anything to apply?',
      answer: 'There are no costs involved in receiving offers. There are closing fees.'
    },
    {
      icon: Shield,
      question: 'Am I under any obligation?',
      answer: 'You are under no obligation to accept any funding offers.'
    },
    {
      icon: FileCheck,
      question: 'If I have questions who do I talk to?',
      answer: 'After submitting, you are provided the email and phone number of your funding advisor.'
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Video Modal */}
      {showVideoModal && (
        <AnimatePresence>
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80" onClick={() => setShowVideoModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 flex items-center justify-between" style={{ 
                background: 'linear-gradient(to right, var(--primary), var(--info))',
                color: 'var(--primary-foreground)'
              }}>
                <h3 className="font-bold">Why Apply For Funding</h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="w-8 h-8 rounded-lg transition-colors flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-black">
                <video
                  className="w-full"
                  controls
                  autoPlay
                  src="https://assets.cdn.filesafe.space/tv3eZjbDC2z4bYkRDJft/media/699bbd7ddf9bdfbca83052d4.mp4"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}

      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex"
          style={{ backgroundColor: 'var(--card)' }}
        >
          {/* Left Column - Information */}
          <div className="w-96 p-6 overflow-y-auto border-r" style={{ 
            background: 'linear-gradient(to bottom right, var(--surface-2), var(--surface-3))',
            borderColor: 'var(--border)'
          }}>
            <div className="space-y-6">
              {/* Let's Begin Section */}
              <div className="rounded-xl p-5 shadow-sm border" style={{ 
                backgroundColor: 'var(--card)',
                borderColor: 'var(--primary-border)'
              }}>
                <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--foreground)' }}>Let's Begin</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  Submit information about your request, the business and the owners to receive amount, rate and term offers.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ 
                      backgroundColor: 'var(--primary-bg)',
                      color: 'var(--primary)'
                    }}>1</div>
                    <span>Information about the business</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ 
                      backgroundColor: 'var(--primary-bg)',
                      color: 'var(--primary)'
                    }}>2</div>
                    <span>Information about the owners</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ 
                      backgroundColor: 'var(--primary-bg)',
                      color: 'var(--primary)'
                    }}>3</div>
                    <span>Requested loan information</span>
                  </div>
                </div>
              </div>

              {/* Why Apply Button */}
              <button
                onClick={() => setShowVideoModal(true)}
                className="w-full rounded-xl p-4 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
                style={{ 
                  background: 'linear-gradient(to right, var(--success), var(--info))',
                  color: 'var(--success-foreground)'
                }}
              >
                <Play className="w-5 h-5" />
                <span>Why Apply For Funding</span>
              </button>

              {/* FAQs */}
              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const Icon = faq.icon;
                  return (
                    <div key={index} className="rounded-xl p-4 shadow-sm border" style={{ 
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)'
                    }}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ 
                          backgroundColor: 'var(--primary-bg)',
                          color: 'var(--primary)'
                        }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--foreground)' }}>{faq.question}</h4>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6" style={{ 
              background: 'linear-gradient(to right, var(--primary), var(--info))',
              color: 'var(--primary-foreground)'
            }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Funding Application</h2>
                  <p className="text-sm opacity-90">{programName}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg transition-colors flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                <Badge variant="default" className="bg-white/20 border-white/30 text-white">
                  {programAmount}
                </Badge>
                <Badge variant="default" className="bg-white/20 border-white/30 text-white">
                  {programType}
                </Badge>
              </div>
            </div>

            {/* Success State */}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 text-center flex-1 flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ 
                  backgroundColor: 'var(--success-bg)'
                }}>
                  <CheckCircle className="w-10 h-10" style={{ color: 'var(--success)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Application Submitted!</h3>
                <p className="mb-4" style={{ color: 'var(--muted-foreground)' }}>
                  Your application for {programName} has been successfully submitted.
                </p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  We'll review your application and get back to you within 1-2 business days.
                </p>
              </motion.div>
            )}

            {/* Form Content */}
            {!isSuccess && (
              <>
                {/* Step Navigation */}
                <div className="border-b" style={{ 
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface-1)'
                }}>
                  <div className="flex">
                    <button
                      onClick={() => setCurrentStep('business')}
                      className="flex-1 px-6 py-4 font-semibold text-sm transition-colors"
                      style={
                        currentStep === 'business'
                          ? { backgroundColor: 'var(--card)', color: 'var(--primary)', borderBottom: '2px solid var(--primary)' }
                          : { color: 'var(--muted-foreground)' }
                      }
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Business Info</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setCurrentStep('owner')}
                      className="flex-1 px-6 py-4 font-semibold text-sm transition-colors"
                      style={
                        currentStep === 'owner'
                          ? { backgroundColor: 'var(--card)', color: 'var(--primary)', borderBottom: '2px solid var(--primary)' }
                          : { color: 'var(--muted-foreground)' }
                      }
                    >
                      <div className="flex items-center justify-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Owner Info</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setCurrentStep('loan')}
                      className="flex-1 px-6 py-4 font-semibold text-sm transition-colors"
                      style={
                        currentStep === 'loan'
                          ? { backgroundColor: 'var(--card)', color: 'var(--primary)', borderBottom: '2px solid var(--primary)' }
                          : { color: 'var(--muted-foreground)' }
                      }
                    >
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Loan Details</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="p-6 overflow-y-auto flex-1">
                  {/* Business Information */}
                  {currentStep === 'business' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>Business Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Legal Name *</label>
                          <input
                            type="text"
                            value={businessLegalName}
                            onChange={(e) => setBusinessLegalName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter legal business name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Tax ID Number *</label>
                          <input
                            type="text"
                            value={businessTaxId}
                            onChange={(e) => setBusinessTaxId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="00-0000000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">DBA or Trade Name</label>
                          <input
                            type="text"
                            value={dbaName}
                            onChange={(e) => setDbaName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter DBA name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone Number *</label>
                          <input
                            type="tel"
                            value={businessPhone}
                            onChange={(e) => setBusinessPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="000-000-0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Website</label>
                          <input
                            type="url"
                            value={businessWebsite}
                            onChange={(e) => setBusinessWebsite(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="www.example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
                          <select
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select One</option>
                            <option value="LLC">LLC</option>
                            <option value="Corporation">Corporation</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Sole Proprietorship">Sole Proprietorship</option>
                            <option value="Non-Profit">Non-Profit</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Is this Business Seasonal? *</label>
                          <select
                            value={isSeasonal}
                            onChange={(e) => setIsSeasonal(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select One</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Annual Gross Sales / Revenue *</label>
                          <input
                            type="text"
                            value={annualRevenue}
                            onChange={(e) => setAnnualRevenue(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="$0 - $50,000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date Business Established *</label>
                          <input
                            type="text"
                            value={dateEstablished}
                            onChange={(e) => setDateEstablished(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="MM/DD/YYYY"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Address *</label>
                        <input
                          type="text"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Street address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business City *</label>
                          <input
                            type="text"
                            value={businessCity}
                            onChange={(e) => setBusinessCity(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business State *</label>
                          <select
                            value={businessState}
                            onChange={(e) => setBusinessState(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select State</option>
                            {states.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Zip *</label>
                          <input
                            type="text"
                            value={businessZip}
                            onChange={(e) => setBusinessZip(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="00000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Property Status *</label>
                          <select
                            value={propertyStatus}
                            onChange={(e) => setPropertyStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select One</option>
                            <option value="rent">Rent</option>
                            <option value="own">Own</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Business Property Payment *</label>
                          <input
                            type="text"
                            value={propertyPayment}
                            onChange={(e) => setPropertyPayment(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Monthly payment"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State of Organization *</label>
                          <select
                            value={stateOfOrganization}
                            onChange={(e) => setStateOfOrganization(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select State</option>
                            {states.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description of Business *</label>
                        <textarea
                          value={businessDescription}
                          onChange={(e) => setBusinessDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                          placeholder="Describe your business"
                        />
                      </div>
                    </div>
                  )}

                  {/* Owner Information */}
                  {currentStep === 'owner' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Business Owner Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Last name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Social Security Number *</label>
                          <input
                            type="text"
                            value={ssn}
                            onChange={(e) => setSsn(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="000-00-0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                          <input
                            type="text"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="MM/DD/YYYY"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cell Phone Number *</label>
                          <input
                            type="tel"
                            value={cellPhone}
                            onChange={(e) => setCellPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="000-000-0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Personal Property Payment *</label>
                          <input
                            type="text"
                            value={personalPropertyPayment}
                            onChange={(e) => setPersonalPropertyPayment(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Monthly payment"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Personal Residence Address *</label>
                        <input
                          type="text"
                          value={residenceAddress}
                          onChange={(e) => setResidenceAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Street address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input
                            type="text"
                            value={residenceCity}
                            onChange={(e) => setResidenceCity(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                          <select
                            value={residenceState}
                            onChange={(e) => setResidenceState(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select State</option>
                            {states.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                          <input
                            type="text"
                            value={residenceZip}
                            onChange={(e) => setResidenceZip(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="00000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time at Residence *</label>
                          <input
                            type="text"
                            value={timeAtResidence}
                            onChange={(e) => setTimeAtResidence(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Years/Months"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Personal Property Status *</label>
                          <select
                            value={residenceStatus}
                            onChange={(e) => setResidenceStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select One</option>
                            <option value="rent">Rent</option>
                            <option value="own">Own</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Percentage of Business Ownership *</label>
                          <input
                            type="text"
                            value={ownershipPercentage}
                            onChange={(e) => setOwnershipPercentage(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="%"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loan Details */}
                  {currentStep === 'loan' && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Loan Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount Requested *</label>
                          <input
                            type="text"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="$0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose of Funds *</label>
                          <select
                            value={purposeOfFunds}
                            onChange={(e) => setPurposeOfFunds(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select one</option>
                            <option value="working-capital">Working Capital</option>
                            <option value="equipment">Equipment Purchase</option>
                            <option value="inventory">Inventory</option>
                            <option value="expansion">Business Expansion</option>
                            <option value="refinance">Refinance Debt</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bankruptcy Status *</label>
                          <select
                            value={bankruptcyStatus}
                            onChange={(e) => setBankruptcyStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select one</option>
                            <option value="none">Never Filed</option>
                            <option value="discharged">Discharged</option>
                            <option value="active">Active Bankruptcy</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Credit Score *</label>
                          <input
                            type="text"
                            value={estimatedCreditScore}
                            onChange={(e) => setEstimatedCreditScore(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="000"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Any outstanding loans / advances? *</label>
                          <select
                            value={outstandingLoans}
                            onChange={(e) => setOutstandingLoans(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select one</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                          </select>
                        </div>
                      </div>

                      {/* Digital Signature Section */}
                      <div className="border-t border-slate-200 pt-6 mt-6">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-blue-600" />
                          Digital Signature & Terms
                        </h4>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="text-xs text-gray-700 leading-relaxed max-h-40 overflow-y-auto">
                            <p className="mb-2">
                              By signing below, each of the above listed businesses and officers/owners (individually and collectively, "Applicant") certify that you are authorized to sign on behalf of the named business, all information and supporting documentation submitted with this application are true, correct and complete, and all such information may be relied upon by GoBolt LLC DBA Bolt Funding ("Bolt") and the Recipients (defined below).
                            </p>
                            <p>
                              You hereby authorize Bolt and each of its representatives, successors, assigns, designees and third-party funding partners, which includes lenders and other finance providers with whom Bolt has, or may in the future enter into, commercial-brokerage-financing relationships ("Recipients"): (1) to obtain consumer or personal, business and investigative reports and other information about you, including hard and/or soft credit pulls, from one or more consumer reporting agencies, such as TransUnion, Experian and Equifax; (2) to obtain credit card processor statements and bank statements from banks, creditors and other third parties; (3) to obtain the release, by any creditor or financial institution, of any information relating to you, to any Recipients; (4) to transmit this application form, along with any of the foregoing information obtained in connection with this application, to any or all Recipients for the foregoing purposes; and (5) to contact you via e-mail, call and/or text-message at the e-mail address and/or phone number provided above, or at any e-mail address and/or phone number reasonably identified as belonging to you, including wireless numbers (if applicable), even if listed on a Do-Not-Call registry, using an automated telephone dialing system or other similar system with respect to this application, future-related commercial-financing opportunities and/or other lawful telemarketing purposes. You further certify that should any of the foregoing information change, to the extent within your knowledge, that you will promptly notify Bolt of such changes. A copy of this authorization may be accepted as an original whether sent via email or facsimile.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type Full Name (Digital Signature) *</label>
                            <input
                              type="text"
                              value={digitalSignature}
                              onChange={(e) => setDigitalSignature(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Type your full legal name"
                            />
                          </div>
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="agreeTerms"
                              checked={agreedToTerms}
                              onChange={(e) => setAgreedToTerms(e.target.checked)}
                              className="w-5 h-5 mt-0.5 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <label htmlFor="agreeTerms" className="text-sm text-gray-700 cursor-pointer">
                              I agree to the terms and conditions stated above and certify that all information provided is accurate and complete.
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-6 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <div className="flex gap-3">
                      {currentStep === 'owner' && (
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep('business')}
                        >
                          Back
                        </Button>
                      )}
                      {currentStep === 'loan' && (
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep('owner')}
                        >
                          Back
                        </Button>
                      )}
                      {currentStep === 'business' && (
                        <Button
                          onClick={() => setCurrentStep('owner')}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                          Next: Owner Info
                        </Button>
                      )}
                      {currentStep === 'owner' && (
                        <Button
                          onClick={() => setCurrentStep('loan')}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                          Next: Loan Details
                        </Button>
                      )}
                      {currentStep === 'loan' && (
                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmitting || !agreedToTerms || !digitalSignature}
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}