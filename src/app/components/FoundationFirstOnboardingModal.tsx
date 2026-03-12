import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Check, Plus, Trash2, User, DollarSign, Landmark, GraduationCap, Home, CreditCard, Shield, Target } from 'lucide-react';
import {
  getFoundationFirstData,
  updatePersonalProfile,
  updateIncomeAndSavings,
  updateAssetsAndDebt,
  updateRiskManagement,
  updateRetirementOutlook,
  BankAccount,
  RetirementAccount,
  EducationAccount,
  OtherAccount,
  Vehicle,
  StudentLoan,
  CreditCard as CreditCardType,
  AdditionalRealEstate,
  OtherAsset,
  OtherLiability
} from '../utils/foundationFirstData';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FoundationFirstOnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState(getFoundationFirstData());

  const totalSteps = 8;

  useEffect(() => {
    if (isOpen) {
      setData(getFoundationFirstData());
    }
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    updatePersonalProfile({ profileCompleted: true });
    onClose();
  };

  if (!isOpen) return null;

  const stepIcons = [User, DollarSign, Landmark, GraduationCap, Home, CreditCard, Shield, Target];
  const StepIcon = stepIcons[currentStep - 1];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
              <StepIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">FoundationFirst Onboarding</h2>
              <p className="text-sm text-slate-600">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && <Step1PersonalProfile data={data} setData={setData} />}
              {currentStep === 2 && <Step2IncomeSavings data={data} setData={setData} />}
              {currentStep === 3 && <Step3BankAccounts data={data} setData={setData} />}
              {currentStep === 4 && <Step4RetirementEducation data={data} setData={setData} />}
              {currentStep === 5 && <Step5HomeVehicles data={data} setData={setData} />}
              {currentStep === 6 && <Step6DebtCreditCards data={data} setData={setData} />}
              {currentStep === 7 && <Step7RiskManagement data={data} setData={setData} />}
              {currentStep === 8 && <Step8RetirementOutlook data={data} setData={setData} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i + 1 === currentStep
                    ? 'bg-gradient-to-r from-rose-400 to-pink-500 w-6'
                    : i + 1 < currentStep
                    ? 'bg-green-500'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:shadow-lg transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg transition-all"
            >
              <Check className="w-4 h-4" />
              Complete
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// STEP 1: PERSONAL PROFILE
// ============================================================================

function Step1PersonalProfile({ data, setData }: any) {
  const handleChange = (field: string, value: any) => {
    const updated = {
      ...data,
      personalProfile: {
        ...data.personalProfile,
        [field]: value
      }
    };
    setData(updated);
    updatePersonalProfile({ [field]: value });
  };

  const handleChildrenAgesChange = (ages: string) => {
    const agesArray = ages.split(',').map(a => parseInt(a.trim())).filter(a => !isNaN(a));
    handleChange('childrenAges', agesArray);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Personal Information</h3>
        <p className="text-slate-600">Let's start with some basic information about you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
          <input
            type="text"
            value={data.personalProfile.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
            placeholder="John"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
          <input
            type="text"
            value={data.personalProfile.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
            placeholder="Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
          <input
            type="number"
            value={data.personalProfile.age || ''}
            onChange={(e) => handleChange('age', parseInt(e.target.value))}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
            placeholder="30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
          <select
            value={data.personalProfile.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Zip Code</label>
          <input
            type="text"
            value={data.personalProfile.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
            placeholder="75204"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
          <input
            type="text"
            value={data.personalProfile.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
            placeholder="TX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input
            type="email"
            value={data.personalProfile.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
          <input
            type="tel"
            value={data.personalProfile.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Family Profile</h4>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.personalProfile.married}
              onChange={(e) => handleChange('married', e.target.checked)}
              className="w-5 h-5 text-rose-500 border-slate-300 rounded focus:ring-rose-400"
            />
            <label className="text-sm font-medium text-slate-700">Married</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of Dependent Children</label>
            <input
              type="number"
              value={data.personalProfile.dependentChildren || 0}
              onChange={(e) => handleChange('dependentChildren', parseInt(e.target.value))}
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
              min="0"
            />
          </div>

          {data.personalProfile.dependentChildren > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Children's Ages (comma separated)</label>
              <input
                type="text"
                value={data.personalProfile.childrenAges.join(', ')}
                onChange={(e) => handleChildrenAgesChange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
                placeholder="8, 10, 12"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 2: INCOME & SAVINGS
// ============================================================================

function Step2IncomeSavings({ data, setData }: any) {
  const handleChange = (field: string, value: any) => {
    const updated = {
      ...data,
      incomeAndSavings: {
        ...data.incomeAndSavings,
        [field]: value
      }
    };
    setData(updated);
    updateIncomeAndSavings({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Income & Savings</h3>
        <p className="text-slate-600">Tell us about your income and savings habits.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Annual Gross Income</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              value={data.incomeAndSavings.grossIncome || ''}
              onChange={(e) => handleChange('grossIncome', parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
              placeholder="75000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Savings (Retirement)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              value={data.incomeAndSavings.monthlySavingsRetirement || ''}
              onChange={(e) => handleChange('monthlySavingsRetirement', parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
              placeholder="500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Savings (Other)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <input
              type="number"
              value={data.incomeAndSavings.monthlySavingsOther || ''}
              onChange={(e) => handleChange('monthlySavingsOther', parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
              placeholder="200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">How often do you budget?</label>
          <select
            value={data.incomeAndSavings.budgetFrequency}
            onChange={(e) => handleChange('budgetFrequency', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
          >
            <option value="">Select frequency</option>
            <option value="Always">Always</option>
            <option value="Often">Often</option>
            <option value="Sometimes">Sometimes</option>
            <option value="Seldom">Seldom</option>
            <option value="Never">Never</option>
          </select>
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <input
            type="checkbox"
            checked={data.incomeAndSavings.separateEmergencyFund}
            onChange={(e) => handleChange('separateEmergencyFund', e.target.checked)}
            className="w-5 h-5 text-rose-500 border-slate-300 rounded focus:ring-rose-400"
          />
          <label className="text-sm font-medium text-slate-700">I have a separate emergency fund</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Do you maximize employer retirement contributions?</label>
          <select
            value={data.incomeAndSavings.employerContributionsMaximized}
            onChange={(e) => handleChange('employerContributionsMaximized', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
          >
            <option value="">Select option</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Not applicable">Not applicable</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: BANK ACCOUNTS
// ============================================================================

function Step3BankAccounts({ data, setData }: any) {
  const addBankAccount = () => {
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      accountType: 'Checking',
      accountName: '',
      balance: 0
    };
    
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        bankAccounts: [...data.assetsAndDebt.bankAccounts, newAccount]
      }
    };
    setData(updated);
    updateAssetsAndDebt({ bankAccounts: updated.assetsAndDebt.bankAccounts });
  };

  const removeBankAccount = (id: string) => {
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        bankAccounts: data.assetsAndDebt.bankAccounts.filter((a: BankAccount) => a.id !== id)
      }
    };
    setData(updated);
    updateAssetsAndDebt({ bankAccounts: updated.assetsAndDebt.bankAccounts });
  };

  const updateBankAccount = (id: string, field: string, value: any) => {
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        bankAccounts: data.assetsAndDebt.bankAccounts.map((a: BankAccount) =>
          a.id === id ? { ...a, [field]: value } : a
        )
      }
    };
    setData(updated);
    updateAssetsAndDebt({ bankAccounts: updated.assetsAndDebt.bankAccounts });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Bank Accounts</h3>
        <p className="text-slate-600">Add your checking and savings accounts.</p>
      </div>

      <div className="space-y-4">
        {data.assetsAndDebt.bankAccounts.map((account: BankAccount) => (
          <div key={account.id} className="p-4 border-2 border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">Bank Account</h4>
              <button
                onClick={() => removeBankAccount(account.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={account.accountType}
                  onChange={(e) => updateBankAccount(account.id, 'accountType', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={account.accountName}
                  onChange={(e) => updateBankAccount(account.id, 'accountName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="Chase Checking"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Balance</label>
                <input
                  type="number"
                  value={account.balance}
                  onChange={(e) => updateBankAccount(account.id, 'balance', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addBankAccount}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-rose-400 hover:text-rose-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Bank Account
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: RETIREMENT & EDUCATION ACCOUNTS
// ============================================================================

function Step4RetirementEducation({ data, setData }: any) {
  const addRetirementAccount = () => {
    const newAccount: RetirementAccount = {
      id: Date.now().toString(),
      accountType: '401k',
      accountName: '',
      balance: 0
    };
    
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        retirementAccounts: [...data.assetsAndDebt.retirementAccounts, newAccount]
      }
    };
    setData(updated);
    updateAssetsAndDebt({ retirementAccounts: updated.assetsAndDebt.retirementAccounts });
  };

  const removeRetirementAccount = (id: string) => {
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        retirementAccounts: data.assetsAndDebt.retirementAccounts.filter((a: RetirementAccount) => a.id !== id)
      }
    };
    setData(updated);
    updateAssetsAndDebt({ retirementAccounts: updated.assetsAndDebt.retirementAccounts });
  };

  const updateRetirementAccount = (id: string, field: string, value: any) => {
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        retirementAccounts: data.assetsAndDebt.retirementAccounts.map((a: RetirementAccount) =>
          a.id === id ? { ...a, [field]: value } : a
        )
      }
    };
    setData(updated);
    updateAssetsAndDebt({ retirementAccounts: updated.assetsAndDebt.retirementAccounts });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Retirement & Education Accounts</h3>
        <p className="text-slate-600">Add your retirement and education savings accounts.</p>
      </div>

      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Retirement Accounts</h4>
        <div className="space-y-4">
          {data.assetsAndDebt.retirementAccounts.map((account: RetirementAccount) => (
            <div key={account.id} className="p-4 border-2 border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-slate-900">Retirement Account</h5>
                <button
                  onClick={() => removeRetirementAccount(account.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={account.accountType}
                    onChange={(e) => updateRetirementAccount(account.id, 'accountType', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="401k">401(k)</option>
                    <option value="IRA">IRA</option>
                    <option value="Roth IRA">Roth IRA</option>
                    <option value="Traditional IRA">Traditional IRA</option>
                    <option value="403b">403(b)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={account.accountName}
                    onChange={(e) => updateRetirementAccount(account.id, 'accountName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="Fidelity 401k"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Balance</label>
                  <input
                    type="number"
                    value={account.balance}
                    onChange={(e) => updateRetirementAccount(account.id, 'balance', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="50000"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addRetirementAccount}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-rose-400 hover:text-rose-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Retirement Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 5: HOME & VEHICLES
// ============================================================================

function Step5HomeVehicles({ data, setData }: any) {
  const handleHomeChange = (field: string, value: any) => {
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        primaryHome: {
          ...data.assetsAndDebt.primaryHome,
          [field]: value
        }
      }
    };
    setData(updated);
    updateAssetsAndDebt({ primaryHome: updated.assetsAndDebt.primaryHome });
  };

  const addVehicle = () => {
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      name: '',
      ownership: 'Own outright',
      currentValue: 0,
      loanBalance: 0,
      monthlyPayment: 0
    };
    
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        vehicles: [...data.assetsAndDebt.vehicles, newVehicle]
      }
    };
    setData(updated);
    updateAssetsAndDebt({ vehicles: updated.assetsAndDebt.vehicles });
  };

  const removeVehicle = (id: string) => {
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        vehicles: data.assetsAndDebt.vehicles.filter((v: Vehicle) => v.id !== id)
      }
    };
    setData(updated);
    updateAssetsAndDebt({ vehicles: updated.assetsAndDebt.vehicles });
  };

  const updateVehicle = (id: string, field: string, value: any) => {
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        vehicles: data.assetsAndDebt.vehicles.map((v: Vehicle) =>
          v.id === id ? { ...v, [field]: value } : v
        )
      }
    };
    setData(updated);
    updateAssetsAndDebt({ vehicles: updated.assetsAndDebt.vehicles });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Primary Home & Vehicles</h3>
        <p className="text-slate-600">Tell us about your home and vehicles.</p>
      </div>

      {/* Primary Home */}
      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg space-y-4">
        <h4 className="font-semibold text-slate-900">Primary Home</h4>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Home Ownership</label>
          <select
            value={data.assetsAndDebt.primaryHome.homeOwnership}
            onChange={(e) => handleHomeChange('homeOwnership', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
          >
            <option value="">Select ownership</option>
            <option value="Own with a mortgage">Own with a mortgage</option>
            <option value="Own outright">Own outright</option>
            <option value="Rent">Rent</option>
            <option value="Live with family">Live with family</option>
          </select>
        </div>

        {(data.assetsAndDebt.primaryHome.homeOwnership === 'Own with a mortgage' || 
          data.assetsAndDebt.primaryHome.homeOwnership === 'Own outright') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Home Value</label>
              <input
                type="number"
                value={data.assetsAndDebt.primaryHome.currentHomeValue || ''}
                onChange={(e) => handleHomeChange('currentHomeValue', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg"
                placeholder="350000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mortgage Balance</label>
              <input
                type="number"
                value={data.assetsAndDebt.primaryHome.oweOnMortgage || ''}
                onChange={(e) => handleHomeChange('oweOnMortgage', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg"
                placeholder="250000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Payment</label>
              <input
                type="number"
                value={data.assetsAndDebt.primaryHome.mortgagePayment || ''}
                onChange={(e) => handleHomeChange('mortgagePayment', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={data.assetsAndDebt.primaryHome.mortgageInterestRate || ''}
                onChange={(e) => handleHomeChange('mortgageInterestRate', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg"
                placeholder="3.5"
              />
            </div>
          </div>
        )}
      </div>

      {/* Vehicles */}
      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Vehicles</h4>
        <div className="space-y-4">
          {data.assetsAndDebt.vehicles.map((vehicle: Vehicle) => (
            <div key={vehicle.id} className="p-4 border-2 border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-slate-900">Vehicle</h5>
                <button
                  onClick={() => removeVehicle(vehicle.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Vehicle Name</label>
                  <input
                    type="text"
                    value={vehicle.name}
                    onChange={(e) => updateVehicle(vehicle.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="2020 Toyota Camry"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ownership</label>
                  <select
                    value={vehicle.ownership}
                    onChange={(e) => updateVehicle(vehicle.id, 'ownership', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Own outright">Own outright</option>
                    <option value="Loan">Loan</option>
                    <option value="Lease">Lease</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Current Value</label>
                  <input
                    type="number"
                    value={vehicle.currentValue}
                    onChange={(e) => updateVehicle(vehicle.id, 'currentValue', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="25000"
                  />
                </div>

                {(vehicle.ownership === 'Loan' || vehicle.ownership === 'Lease') && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Loan Balance</label>
                      <input
                        type="number"
                        value={vehicle.loanBalance}
                        onChange={(e) => updateVehicle(vehicle.id, 'loanBalance', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="20000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Monthly Payment</label>
                      <input
                        type="number"
                        value={vehicle.monthlyPayment}
                        onChange={(e) => updateVehicle(vehicle.id, 'monthlyPayment', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="350"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={addVehicle}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-rose-400 hover:text-rose-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 6: DEBT & CREDIT CARDS
// ============================================================================

function Step6DebtCreditCards({ data, setData }: any) {
  const handleCreditCardActiveChange = (value: string) => {
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        activeCreditCards: value
      }
    };
    setData(updated);
    updateAssetsAndDebt({ activeCreditCards: value });
  };

  const addCreditCard = () => {
    const newCard: CreditCardType = {
      id: Date.now().toString(),
      cardName: '',
      balance: 0,
      creditLimit: 0,
      minimumPayment: 0
    };
    
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        creditCards: [...data.assetsAndDebt.creditCards, newCard]
      }
    };
    setData(updated);
    updateAssetsAndDebt({ creditCards: updated.assetsAndDebt.creditCards });
  };

  const removeCreditCard = (id: string) => {
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        creditCards: data.assetsAndDebt.creditCards.filter((c: CreditCardType) => c.id !== id)
      }
    };
    setData(updated);
    updateAssetsAndDebt({ creditCards: updated.assetsAndDebt.creditCards });
  };

  const updateCreditCard = (id: string, field: string, value: any) => {
    const updated = {
      ...data,
      assetsAndDebt: {
        ...data.assetsAndDebt,
        creditCards: data.assetsAndDebt.creditCards.map((c: CreditCardType) =>
          c.id === id ? { ...c, [field]: value } : c
        )
      }
    };
    setData(updated);
    updateAssetsAndDebt({ creditCards: updated.assetsAndDebt.creditCards });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Debt & Credit Cards</h3>
        <p className="text-slate-600">Tell us about your credit cards and debt.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Do you have active credit cards?</label>
        <select
          value={data.assetsAndDebt.activeCreditCards}
          onChange={(e) => handleCreditCardActiveChange(e.target.value)}
          className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
        >
          <option value="">Select option</option>
          <option value="Yes, pay in full each month">Yes, pay in full each month</option>
          <option value="Yes, make payments but leave some balance remaining each month">Yes, make payments but leave some balance remaining</option>
          <option value="No">No</option>
        </select>
      </div>

      {data.assetsAndDebt.activeCreditCards.startsWith('Yes') && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Credit Cards</h4>
          <div className="space-y-4">
            {data.assetsAndDebt.creditCards.map((card: CreditCardType) => (
              <div key={card.id} className="p-4 border-2 border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-slate-900">Credit Card</h5>
                  <button
                    onClick={() => removeCreditCard(card.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Card Name</label>
                    <input
                      type="text"
                      value={card.cardName}
                      onChange={(e) => updateCreditCard(card.id, 'cardName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="Chase Sapphire"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Balance</label>
                    <input
                      type="number"
                      value={card.balance}
                      onChange={(e) => updateCreditCard(card.id, 'balance', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="2500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Credit Limit</label>
                    <input
                      type="number"
                      value={card.creditLimit}
                      onChange={(e) => updateCreditCard(card.id, 'creditLimit', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Minimum Payment</label>
                    <input
                      type="number"
                      value={card.minimumPayment}
                      onChange={(e) => updateCreditCard(card.id, 'minimumPayment', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder="50"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addCreditCard}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-rose-400 hover:text-rose-500 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Credit Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEP 7: RISK MANAGEMENT
// ============================================================================

function Step7RiskManagement({ data, setData }: any) {
  const handleCreditScoreChange = (value: string) => {
    const updated = {
      ...data,
      riskManagement: {
        ...data.riskManagement,
        creditScoreRange: value
      }
    };
    setData(updated);
    updateRiskManagement({ creditScoreRange: value });
  };

  const handleInsuranceChange = (field: string, value: boolean) => {
    const updated = {
      ...data,
      riskManagement: {
        ...data.riskManagement,
        insuranceCoverage: {
          ...data.riskManagement.insuranceCoverage,
          [field]: value
        }
      }
    };
    setData(updated);
    updateRiskManagement({ insuranceCoverage: updated.riskManagement.insuranceCoverage });
  };

  const handleEstatePlanningChange = (field: string, value: boolean) => {
    const updated = {
      ...data,
      riskManagement: {
        ...data.riskManagement,
        estatePlanning: {
          ...data.riskManagement.estatePlanning,
          [field]: value
        }
      }
    };
    setData(updated);
    updateRiskManagement({ estatePlanning: updated.riskManagement.estatePlanning });
  };

  const handleHealthRatingChange = (value: string) => {
    const updated = {
      ...data,
      riskManagement: {
        ...data.riskManagement,
        healthRating: value
      }
    };
    setData(updated);
    updateRiskManagement({ healthRating: value });
  };

  const handleSmokeRatingChange = (value: string) => {
    const updated = {
      ...data,
      riskManagement: {
        ...data.riskManagement,
        smokeRating: value
      }
    };
    setData(updated);
    updateRiskManagement({ smokeRating: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Risk Management</h3>
        <p className="text-slate-600">Tell us about your insurance coverage and estate planning.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Credit Score Range</label>
        <select
          value={data.riskManagement.creditScoreRange}
          onChange={(e) => handleCreditScoreChange(e.target.value)}
          className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
        >
          <option value="">Select range</option>
          <option value="300-579">300-579 (Poor)</option>
          <option value="580-669">580-669 (Fair)</option>
          <option value="670-739">670-739 (Good)</option>
          <option value="740-799">740-799 (Very Good)</option>
          <option value="800-850">800-850 (Exceptional)</option>
        </select>
      </div>

      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg space-y-3">
        <h4 className="font-semibold text-slate-900">Insurance Coverage</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { field: 'homeownersOrRentalInsurance', label: 'Homeowners/Rental Insurance' },
            { field: 'healthInsurance', label: 'Health Insurance' },
            { field: 'autoInsurance', label: 'Auto Insurance' },
            { field: 'dentalInsurance', label: 'Dental Insurance' },
            { field: 'termLifeInsurance', label: 'Term Life Insurance' },
            { field: 'permanentLifeInsurance', label: 'Permanent Life Insurance' },
            { field: 'disabilityInsurance', label: 'Disability Insurance' },
            { field: 'umbrellaInsurance', label: 'Umbrella Insurance' }
          ].map((item) => (
            <div key={item.field} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={data.riskManagement.insuranceCoverage[item.field]}
                onChange={(e) => handleInsuranceChange(item.field, e.target.checked)}
                className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-400"
              />
              <label className="text-sm text-slate-700">{item.label}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg space-y-3">
        <h4 className="font-semibold text-slate-900">Estate Planning</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { field: 'guardianshipNomination', label: 'Guardianship Nomination' },
            { field: 'lastWillAndTestament', label: 'Last Will and Testament' },
            { field: 'livingTrust', label: 'Living Trust' },
            { field: 'durablePowerOfAttorney', label: 'Durable Power of Attorney' },
            { field: 'advanceHealthCareDirective', label: 'Advance Healthcare Directive' },
            { field: 'finalDispositionInstructions', label: 'Final Disposition Instructions' }
          ].map((item) => (
            <div key={item.field} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={data.riskManagement.estatePlanning[item.field]}
                onChange={(e) => handleEstatePlanningChange(item.field, e.target.checked)}
                className="w-4 h-4 text-rose-500 border-slate-300 rounded focus:ring-rose-400"
              />
              <label className="text-sm text-slate-700">{item.label}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Health Rating</label>
          <select
            value={data.riskManagement.healthRating}
            onChange={(e) => handleHealthRatingChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
          >
            <option value="">Select rating</option>
            <option value="Very healthy">Very healthy</option>
            <option value="Somewhat healthy">Somewhat healthy</option>
            <option value="Average health">Average health</option>
            <option value="Somewhat unhealthy">Somewhat unhealthy</option>
            <option value="Very unhealthy">Very unhealthy</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Smoking Status</label>
          <select
            value={data.riskManagement.smokeRating}
            onChange={(e) => handleSmokeRatingChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
          >
            <option value="">Select status</option>
            <option value="Never smoked">Never smoked</option>
            <option value="Former smoker">Former smoker</option>
            <option value="Current smoker">Current smoker</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 8: RETIREMENT OUTLOOK
// ============================================================================

function Step8RetirementOutlook({ data, setData }: any) {
  const handleChange = (field: string, value: any) => {
    const updated = {
      ...data,
      retirementOutlook: {
        ...data.retirementOutlook,
        [field]: value
      }
    };
    setData(updated);
    updateRetirementOutlook({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Retirement Outlook</h3>
        <p className="text-slate-600">Let's plan for your retirement future.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Target Retirement Age</label>
          <input
            type="number"
            value={data.retirementOutlook.targetRetirementAge || ''}
            onChange={(e) => handleChange('targetRetirementAge', parseInt(e.target.value))}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
            placeholder="65"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Retirement Lifestyle</label>
          <select
            value={data.retirementOutlook.preferredRetirementLifestyle}
            onChange={(e) => handleChange('preferredRetirementLifestyle', e.target.value)}
            className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-rose-400 focus:outline-none"
          >
            <option value="">Select lifestyle</option>
            <option value="More modest than now">More modest than now</option>
            <option value="About the same as now">About the same as now</option>
            <option value="More extravagant than now">More extravagant than now</option>
          </select>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">You're Almost Done!</h4>
            <p className="text-sm text-slate-600">Click Complete to finish your financial profile setup.</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          After completing this onboarding, you'll have access to your personalized financial wellness dashboard, 
          action items, and recommendations to improve your financial health.
        </p>
      </div>
    </div>
  );
}
