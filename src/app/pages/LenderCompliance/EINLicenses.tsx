// EIN & Licenses — Lender Compliance Module 4
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'obtain-ein',
    title: 'Obtain Your EIN from the IRS',
    description: 'Apply for a free Employer Identification Number to separate your business identity from your personal SSN.',
    priority: 'critical',
    ficoImpact: 25,
    why: 'Your EIN (Employer Identification Number) is the Social Security number of your business. Without it, you cannot open a business bank account, apply for business credit, or file business taxes separately from your personal return. Every lender requires it.',
    steps: [
      "Go to IRS.gov and apply for an EIN online — it takes 10 minutes and is free",
      'Apply in your business entity\'s legal name (LLC or Corp — not your personal name)',
      'Print and save your EIN Confirmation Letter (CP 575) — lenders will ask for it',
      'Use your EIN (not your SSN) on all business applications going forward',
    ],
    resources: [
      { name: 'IRS EIN Online Application — Free, instant', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online' },
    ],
  },
  {
    id: 'business-licenses',
    title: 'Obtain All Required Business Licenses',
    description: 'Secure every state, county, and city business license required for your industry and location.',
    priority: 'critical',
    ficoImpact: 10,
    why: "Operating without required licenses is illegal and is an automatic decline at every lender. Underwriters verify license status with state and local databases. An expired or missing license kills a loan application even if all other factors are perfect.",
    warningBox: {
      title: 'Operating without a license = automatic decline',
      body: "This applies even to businesses that don't 'feel like' they need one. Most states require a general business license to operate legally. Check your state, county, and city requirements separately — they are often cumulative.",
    },
    steps: [
      "Search '[your state] business license requirements' to find state-level requirements",
      "Search '[your city/county] business license' for local requirements",
      'Apply for all required licenses under your exact legal business name and EIN',
      'Set calendar reminders for license renewal dates — expired licenses are treated the same as missing ones',
      'Store all license documents in a secure folder with your formation documents',
    ],
    resources: [
      { name: 'SBA Business License & Permits Lookup — Free', url: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits' },
      { name: 'LicenseSuite — Business license research by state', url: 'https://www.licensesuite.com/?utm_source=bankableiq&utm_medium=referral' },
    ],
  },
  {
    id: 'professional-licenses',
    title: 'Obtain Industry-Specific Professional Licenses',
    description: 'Identify and obtain any professional or specialized licenses required for your industry.',
    priority: 'high',
    ficoImpact: 0,
    why: 'Certain industries (healthcare, construction, real estate, legal, financial services, food service) require professional or industry-specific licenses in addition to a general business license. Operating in a licensed field without the proper credential is a felony in most states — and an instant lender decline.',
    steps: [
      'Identify whether your industry requires a professional or specialized license',
      'Apply for required professional licenses under your entity',
      'Ensure your professional license is tied to your EIN and business entity (not just to you personally)',
      'Store license numbers — lenders frequently ask for them on applications',
    ],
  },
  {
    id: 'ein-consistency',
    title: 'Ensure EIN is Consistent Across All Registrations',
    description: 'Audit all business accounts and update any that still use your SSN instead of your EIN.',
    priority: 'medium',
    ficoImpact: 0,
    why: 'Using your SSN on some accounts and your EIN on others creates two separate credit profiles — and neither one will be strong. Mixing them also creates compliance issues that can delay loan closings.',
    infoBox: {
      title: 'EIN consistency rule',
      body: 'From the day you get your EIN, never use your SSN on a business application again. Every business account, application, and filing should use your EIN. Your SSN still appears on personal guarantees — that is different from the business application itself.',
    },
    steps: [
      'Audit your existing business accounts: bank, credit cards, and vendors',
      'Identify any that are registered under your SSN',
      'Contact each to update to your EIN',
      'Going forward: always use EIN on business applications, SSN only on personal guarantee sections',
    ],
  },
];

export function EINLicenses() {
  return (
    <ComplianceModulePage
      moduleId="ein-licenses"
      icon="📋"
      tasks={tasks}
    />
  );
}
