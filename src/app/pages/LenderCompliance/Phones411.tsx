// Phones & 411 — Lender Compliance Module 2
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'dedicated-business-phone',
    title: 'Get a Dedicated Business Phone Line',
    description: 'Obtain a business phone number registered to your entity, not your personal name.',
    priority: 'critical',
    ficoImpact: 15,
    why: 'Lenders verify your phone number via 411 and directory databases. A cell phone number registered to your personal name will not appear as your business number — and that gap alone can trigger a decline.',
    warningBox: {
      title: 'Personal cell = not a business phone to lenders',
      body: 'Your personal mobile number is tied to your personal identity, not your business entity. When a lender calls 411 to verify your business phone, a missing or personal listing = automatic red flag.',
    },
    steps: [
      'Get a dedicated business phone number — VoIP services work and are lender-accepted',
      'Register the number in your business name (not your personal name)',
      'Use this number consistently on all business accounts, licenses, and applications',
      'Never use a Google Voice number as your primary — it does not list in 411',
    ],
    resources: [
      { name: 'RingCentral — Business VoIP from $20/mo', url: 'https://www.ringcentral.com/?utm_source=bankableiq&utm_medium=referral' },
      { name: 'Nextiva — Business phone system', url: 'https://www.nextiva.com/?utm_source=bankableiq&utm_medium=referral' },
      { name: 'Grasshopper — Virtual business phone', url: 'https://grasshopper.com/?utm_source=bankableiq&utm_medium=referral' },
    ],
  },
  {
    id: '411-listing',
    title: 'List Your Business in 411 & National Directories',
    description: 'Submit your business to 411 and major national directory databases used by lender underwriting systems.',
    priority: 'critical',
    ficoImpact: 10,
    why: 'Commercial lenders run an automated 411 verification check on every application. If your business does not appear in the national business directory databases (which feed 411), many lenders treat this as evidence the business does not exist.',
    warningBox: {
      title: 'Not in 411 = automatic decline at many lenders',
      body: 'This is not an optional step. 411 verification is one of the first automated checks in underwriting. It takes 4–12 weeks for new listings to propagate after you submit — start this immediately.',
    },
    steps: [
      'Submit your business to 411.com (ListYourself)',
      'Submit to YellowPages.com and Yelp for Business (free listings)',
      'Submit to Manta, Superpages, and Hotfrog',
      'Ensure your business name, address, and phone match your Secretary of State filing exactly',
      "Wait 4–12 weeks for propagation, then search '411.com [your business name]' to verify",
    ],
    resources: [
      { name: '411.com ListYourself — Free business listing', url: 'https://www.411.com/listyourbusiness' },
      { name: 'YellowPages — Free business listing', url: 'https://www.yellowpages.com/advertise' },
      { name: 'Yext — Sync listings across 70+ directories', url: 'https://www.yext.com/?utm_source=bankableiq&utm_medium=referral' },
    ],
  },
  {
    id: 'phone-nap-match',
    title: 'Ensure Phone Matches Across All Registrations',
    description: 'Confirm your business phone is identical on your bank, state filing, and all directory listings.',
    priority: 'medium',
    ficoImpact: 0,
    why: 'If your phone number on your bank account, Secretary of State filing, and 411 listing are all different, automated systems flag it as three different businesses — or a fraudulent application.',
    steps: [
      'Confirm your exact business phone number',
      'Update your Secretary of State filing if the phone is listed there',
      'Update your business bank account contact info',
      'Update Google Business Profile, Yelp, and all directory listings to match',
      "Update your website's contact page and footer",
    ],
  },
];

export function Phones411() {
  return (
    <ComplianceModulePage
      moduleId="phones-411"
      icon="📞"
      tasks={tasks}
    />
  );
}
