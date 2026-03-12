// Lender Compliance Module Structure
// Two main categories: Complete Compliance & Getting Approved

export interface ComplianceModule {
  id: string;
  title: string;
  description: string;
  category: 'Complete Compliance' | 'Getting Approved';
  route: string;
  videoUrl?: string; // Will be provided later
  order: number;
}

export const complianceModules: ComplianceModule[] = [
  // Complete Compliance (7 items)
  {
    id: 'entity-filings',
    title: 'Entity & Filings',
    description: 'Establish your business entity and complete necessary state filings',
    category: 'Complete Compliance',
    route: '/lender-compliance/entity-filings',
    order: 1
  },
  {
    id: 'business-location',
    title: 'Business Location',
    description: 'Set up a proper business address that meets lender requirements',
    category: 'Complete Compliance',
    route: '/lender-compliance/business-location',
    order: 2
  },
  {
    id: 'phones-411',
    title: 'Phones & 411',
    description: 'Establish business phone lines and directory listings',
    category: 'Complete Compliance',
    route: '/lender-compliance/phones-411',
    order: 3
  },
  {
    id: 'website-email',
    title: 'Website & Email',
    description: 'Create professional online presence with domain and email',
    category: 'Complete Compliance',
    route: '/lender-compliance/website-email',
    order: 4
  },
  {
    id: 'ein-licenses',
    title: 'EIN & Licenses',
    description: 'Obtain EIN and all required business licenses and permits',
    category: 'Complete Compliance',
    route: '/lender-compliance/ein-licenses',
    order: 5
  },
  {
    id: 'business-banking',
    title: 'Business Banking',
    description: 'Open business bank accounts and establish banking relationships',
    category: 'Complete Compliance',
    route: '/lender-compliance/business-banking',
    order: 6
  },
  {
    id: 'agencies-naics',
    title: 'Agencies & NAICS',
    description: 'Register with credit agencies and classify your business with NAICS code',
    category: 'Complete Compliance',
    route: '/lender-compliance/agencies-naics',
    order: 7
  },
  
  // Getting Approved (6 items)
  {
    id: 'business-plan',
    title: 'The Business Plan',
    description: 'Create a comprehensive business plan for lender review',
    category: 'Getting Approved',
    route: '/lender-compliance/business-plan',
    order: 8
  },
  {
    id: 'assets-ucc',
    title: 'Assets & UCC Data',
    description: 'Document business assets and UCC filing information',
    category: 'Getting Approved',
    route: '/lender-compliance/assets-ucc',
    order: 9
  },
  {
    id: 'corp-only-facts',
    title: 'Corp Only Facts',
    description: 'Understand corporate-specific requirements and advantages',
    category: 'Getting Approved',
    route: '/lender-compliance/corp-only-facts',
    order: 10
  },
  {
    id: 'bank-rating',
    title: 'Your Bank Rating',
    description: 'Learn how banks rate your business creditworthiness',
    category: 'Getting Approved',
    route: '/lender-compliance/bank-rating',
    order: 11
  },
  {
    id: 'comparable-credit',
    title: 'Comparable Credit',
    description: 'Understand how lenders compare your credit to industry standards',
    category: 'Getting Approved',
    route: '/lender-compliance/comparable-credit',
    order: 12
  },
  {
    id: 'cd-business-loan',
    title: 'CD Business Loan',
    description: 'Learn about CD-secured business loans and how to qualify',
    category: 'Getting Approved',
    route: '/lender-compliance/cd-business-loan',
    order: 13
  }
];

// State management for module completion
const STORAGE_KEY = 'lenderComplianceProgress';

export interface ComplianceProgress {
  [moduleId: string]: {
    completed: boolean;
    completedDate?: string;
    lastViewed?: string;
  };
}

export function getComplianceProgress(): ComplianceProgress {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return {};
    }
  }
  return {};
}

export function setComplianceProgress(progress: ComplianceProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markModuleComplete(moduleId: string): void {
  const progress = getComplianceProgress();
  progress[moduleId] = {
    completed: true,
    completedDate: new Date().toISOString(),
    lastViewed: new Date().toISOString()
  };
  setComplianceProgress(progress);
}

export function markModuleIncomplete(moduleId: string): void {
  const progress = getComplianceProgress();
  if (progress[moduleId]) {
    progress[moduleId].completed = false;
  }
  setComplianceProgress(progress);
}

export function updateModuleLastViewed(moduleId: string): void {
  const progress = getComplianceProgress();
  if (!progress[moduleId]) {
    progress[moduleId] = { completed: false };
  }
  progress[moduleId].lastViewed = new Date().toISOString();
  setComplianceProgress(progress);
}

export function isModuleComplete(moduleId: string): boolean {
  const progress = getComplianceProgress();
  return progress[moduleId]?.completed || false;
}

export function getCategoryProgress(category: 'Complete Compliance' | 'Getting Approved') {
  const modules = complianceModules.filter(m => m.category === category);
  const progress = getComplianceProgress();
  const completed = modules.filter(m => progress[m.id]?.completed).length;
  const total = modules.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

export function getOverallProgress() {
  const progress = getComplianceProgress();
  const completed = complianceModules.filter(m => progress[m.id]?.completed).length;
  const total = complianceModules.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

export function getModuleById(id: string): ComplianceModule | undefined {
  return complianceModules.find(m => m.id === id);
}

export function getNextModule(currentId: string): ComplianceModule | undefined {
  const currentModule = complianceModules.find(m => m.id === currentId);
  if (!currentModule) return undefined;
  
  return complianceModules.find(m => m.order === currentModule.order + 1);
}

export function getPreviousModule(currentId: string): ComplianceModule | undefined {
  const currentModule = complianceModules.find(m => m.id === currentId);
  if (!currentModule) return undefined;
  
  return complianceModules.find(m => m.order === currentModule.order - 1);
}

export function getModulesByCategory(category: 'Complete Compliance' | 'Getting Approved'): ComplianceModule[] {
  return complianceModules.filter(m => m.category === category).sort((a, b) => a.order - b.order);
}