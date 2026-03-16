// ============================================================================
// CENTRAL DATA STORE - Single Source of Truth for ALL Business Data
// ============================================================================

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface BusinessProfile {
  // Basic Business Information
  businessLegalName: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Business Address
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Business Details (from scan)
  businessType: string; // LLC, Corporation, etc.
  industry: string;
  naicsCode?: string;
  timeInBusiness: string;
  annualRevenue: string;
  monthlyRevenue: string;
  
  // Business Basics (Yes/No)
  hasEIN: boolean;
  einNumber?: string;
  hasBankAccount: boolean;
  hasBusinessAddress: boolean;
  hasBusinessPhone: boolean;
  businessPhoneNumber?: string;
  hasBusinessEmail: boolean;
  hasWebsite: boolean;
  websiteUrl?: string;
  hasBusinessLicense: boolean;
  
  // Credit Information
  personalCreditScore: number; // Owner's personal FICO (deprecated - use bureau scores)
  equifaxScore?: number;
  transunionScore?: number;
  experianScore?: number;
  hasBusinessCredit: boolean;
  tradelineCount: number;
  hasDUNS: boolean;
  dunsNumber?: string;
  
  // Social Media & Branding
  profilePhoto?: string; // Base64 or URL
  linkedInUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  
  // Personal Information (Owner/Contact)
  ethnicity?: string;
  annualHouseholdIncome?: string;
  primaryLanguage?: string;
  householdSize?: string;
  comfortableWithEnglishCoaching?: string; // 'Yes' | 'No'
  livesInRuralArea?: string; // 'Yes' | 'No'
  gender?: string;
  referralSource?: string; // How did you hear about us?
  birthday?: string; // ISO date string
  bankingPartner?: string;
  
  // Metadata
  scanCompleted: boolean;
  scanCompletedDate?: string;
  lastUpdated: string;
  createdDate: string;
}

export interface AuditItem {
  id: string;
  title: string;
  description: string;
  category: string; // Which of the 7 categories
  status: 'complete' | 'incomplete' | 'in-progress';
  ficoImpact: number; // Points toward 160 FICO SBSS
  priority: 'critical' | 'high' | 'medium' | 'low';
  // Severity classification per Elon's Rule Logic Spec:
  // - hard_blocker: Auto-decline. Must fix before ANY funding (no entity, recent BK, FICO<620)
  // - suppressor: Limits options/amounts. Can still get some funding (late pays, low revenue)
  // - optimization: Improves terms. Not required but helps rates/amounts (tradelines, utilization)
  severity: 'hard_blocker' | 'suppressor' | 'optimization';
  // Fix metadata for Denial Diagnosis page
  fixAction?: string; // What user needs to do to fix
  fixTimeline?: '7d' | '30d' | '60d' | '90d'; // Estimated time to fix
  completedDate?: string;
  lastUpdated?: string;
  source?: 'scan' | 'manual' | 'automated'; // How it was marked complete
  moduleId?: string; // Link to Lender Compliance module if applicable
  taskId?: string; // Link to specific task if applicable
  notes?: string;
}

export interface AuditCategory {
  id: string;
  name: string;
  description: string;
  weight: number; // Total FICO points available in this category
  items: AuditItem[];
  order: number;
}

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or icon name
  category: 'completion' | 'speed' | 'quality' | 'streak' | 'milestone';
  unlockedDate?: string;
  isUnlocked: boolean;
  criteria: {
    type: 'task_count' | 'percentage' | 'module_complete' | 'streak_days' | 'metadata_filled' | 'time_based';
    value: number | string;
  };
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // ISO date string
  streakHistory: { date: string; tasksCompleted: number }[];
}

export interface GamificationData {
  achievements: Achievement[];
  streak: UserStreak;
  totalPoints: number; // Same as FICO score earned
  level: number;
  experiencePoints: number;
  lastCelebration?: string; // Prevents duplicate celebrations
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  BUSINESS_PROFILE: 'businessProfile',
  AUDIT_ITEMS: 'auditItems',
  FICO_HISTORY: 'ficoHistory',
  GAMIFICATION_DATA: 'gamificationData',
} as const;

// ============================================================================
// AUDIT CATEGORIES & ITEMS DEFINITION (83 Items Total = 160 Points)
// ============================================================================

export function getDefaultAuditCategories(): AuditCategory[] {
  return [
    // ========================================================================
    // CATEGORY 1: LENDER COMPLIANCE (70 points)
    // 13 modules with tasks - this is the biggest category
    // ========================================================================
    {
      id: 'lender-compliance',
      name: 'Lender Compliance',
      description: 'Essential business infrastructure required by all lenders',
      weight: 70,
      order: 1,
      items: [
        // Module 1: Entity & Filings (4 tasks = 70 points for this module)
        {
          id: 'entity-formation',
          title: 'Business Entity Formation (LLC/Corp)',
          description: 'Form your business as an LLC, Corporation, or Partnership',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 45,
          priority: 'critical',
          severity: 'hard_blocker',
          fixAction: 'File LLC or Corporation with your state Secretary of State',
          fixTimeline: '7d',
          moduleId: 'entity-filings',
          taskId: 'task-1'
        },
        {
          id: 'trademark-verification',
          title: 'Trademark Infringement Verification',
          description: 'Verify business name has no trademark conflicts',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 0,
          priority: 'high',
          severity: 'optimization',
          fixAction: 'Search USPTO database and resolve any conflicts',
          fixTimeline: '30d',
          moduleId: 'entity-filings',
          taskId: 'task-2'
        },
        {
          id: 'good-standing',
          title: 'Entity in Good Standing',
          description: 'Verify entity is current with all state filings and fees',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 25,
          priority: 'critical',
          severity: 'hard_blocker',
          fixAction: 'Pay any outstanding fees and file annual reports with Secretary of State',
          fixTimeline: '7d',
          moduleId: 'entity-filings',
          taskId: 'task-3'
        },
        {
          id: 'business-name-review',
          title: 'Business Name Review (No High-Risk Terms)',
          description: 'Ensure business name contains no auto-decline terms',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 0,
          priority: 'low',
          severity: 'optimization',
          fixAction: 'Review name for trigger words and file DBA if needed',
          fixTimeline: '30d',
          moduleId: 'entity-filings',
          taskId: 'task-4'
        },
        
        // Module 2: Business Location (5 points)
        {
          id: 'business-address',
          title: 'USPS-Compliant Business Address',
          description: 'Set up a proper business address that meets lender requirements',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 5,
          priority: 'critical',
          severity: 'suppressor',
          fixAction: 'Register business address with USPS as commercial location',
          fixTimeline: '7d',
          moduleId: 'business-location'
        },
        
        // Module 3: Phones & 411 (5 points)
        {
          id: 'business-phone',
          title: 'Business Phone Number',
          description: 'Dedicated business phone line with 411 listing',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 5,
          priority: 'critical',
          severity: 'suppressor',
          fixAction: 'Set up dedicated business phone and register with 411 directory',
          fixTimeline: '7d',
          moduleId: 'phones-411'
        },
        
        // Module 4: Website & Email (5 points)
        {
          id: 'business-website',
          title: 'Professional Business Website',
          description: 'Active website with business information and NAP consistency',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 3,
          priority: 'high',
          severity: 'suppressor',
          fixAction: 'Create professional website with consistent NAP information',
          fixTimeline: '30d',
          moduleId: 'website-email'
        },
        {
          id: 'business-email',
          title: 'Professional Business Email',
          description: 'Email address using business domain (not Gmail/Yahoo)',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 2,
          priority: 'high',
          severity: 'suppressor',
          fixAction: 'Set up email using your business domain (e.g., you@yourbusiness.com)',
          fixTimeline: '7d',
          moduleId: 'website-email'
        },
        
        // Module 5: EIN & Licenses (5 points)
        {
          id: 'ein-number',
          title: 'Employer Identification Number (EIN)',
          description: 'Federal tax ID number from IRS',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 3,
          priority: 'critical',
          severity: 'suppressor',
          fixAction: 'Apply for EIN online at IRS.gov (free, instant)',
          fixTimeline: '7d',
          moduleId: 'ein-licenses'
        },
        {
          id: 'business-license',
          title: 'Business License',
          description: 'State and local business licenses obtained',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 2,
          priority: 'high',
          severity: 'optimization',
          fixAction: 'Obtain required business licenses from city/county',
          fixTimeline: '30d',
          moduleId: 'ein-licenses'
        },
        
        // Module 6: Business Banking (5 points)
        {
          id: 'business-bank-account',
          title: 'Business Bank Account',
          description: 'Separate business banking account established',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 5,
          priority: 'critical',
          severity: 'hard_blocker',
          fixAction: 'Open dedicated business checking account at bank or credit union',
          fixTimeline: '7d',
          moduleId: 'business-banking'
        },
        
        // Module 7: Agencies & NAICS (3 points)
        {
          id: 'naics-code',
          title: 'NAICS Code Registration',
          description: 'North American Industry Classification System code assigned',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 3,
          priority: 'medium',
          severity: 'optimization',
          fixAction: 'Identify correct NAICS code and register with SBA',
          fixTimeline: '7d',
          moduleId: 'agencies-naics'
        },
        
        // Module 8: Business Plan (2 points)
        {
          id: 'business-plan',
          title: 'Written Business Plan',
          description: 'Formal business plan documenting strategy and financials',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 2,
          priority: 'low',
          severity: 'optimization',
          fixAction: 'Create formal business plan with financials and projections',
          fixTimeline: '30d',
          moduleId: 'business-plan'
        },
        
        // Module 9: Assets & UCC (3 points)
        {
          id: 'asset-documentation',
          title: 'Business Asset Documentation',
          description: 'Documented inventory, equipment, and assets',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 3,
          priority: 'medium',
          severity: 'optimization',
          fixAction: 'Create asset inventory with valuations',
          fixTimeline: '30d',
          moduleId: 'assets-ucc'
        },
        
        // Module 10: Corp Only Facts (2 points)
        {
          id: 'corporate-records',
          title: 'Corporate Records & Compliance',
          description: 'Operating agreement, bylaws, and corporate minutes',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 2,
          priority: 'low',
          severity: 'optimization',
          fixAction: 'Prepare and maintain corporate governance documents',
          fixTimeline: '30d',
          moduleId: 'corp-only-facts'
        },
        
        // Module 11: Bank Rating (3 points)
        {
          id: 'bank-rating',
          title: 'Bank Rating & History',
          description: 'Positive banking history and account age',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 3,
          priority: 'medium',
          severity: 'suppressor',
          fixAction: 'Maintain positive balance history and avoid NSFs for 90 days',
          fixTimeline: '90d',
          moduleId: 'bank-rating'
        },
        
        // Module 12: Comparable Credit (2 points)
        {
          id: 'comparable-credit',
          title: 'Comparable Credit References',
          description: 'Credit references from similar businesses or industries',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 2,
          priority: 'medium',
          severity: 'optimization',
          fixAction: 'Gather trade references from vendors and suppliers',
          fixTimeline: '30d',
          moduleId: 'comparable-credit'
        },
        
        // Module 13: CD Business Loan (2 points)
        {
          id: 'cd-business-loan',
          title: 'CD-Secured Business Loan',
          description: 'Certificate of Deposit secured business credit line',
          category: 'lender-compliance',
          status: 'incomplete',
          ficoImpact: 2,
          priority: 'low',
          severity: 'optimization',
          fixAction: 'Open CD-secured credit line to build business credit history',
          fixTimeline: '60d',
          moduleId: 'cd-business-loan'
        },
      ]
    },

    // ========================================================================
    // CATEGORY 2: BUILDING CREDIT (25 points)
    // Business credit bureau profiles and monitoring
    // ========================================================================
    {
      id: 'credit-agencies',
      name: 'Credit Agencies',
      description: 'Business credit bureau profiles and monitoring',
      weight: 25,
      order: 2,
      items: [
        {
          id: 'duns-number',
          title: 'D-U-N-S Number (Dun & Bradstreet)',
          description: 'Unique 9-digit business identifier from D&B',
          category: 'credit-agencies',
          status: 'incomplete',
          ficoImpact: 8,
          priority: 'critical',
          severity: 'suppressor',
          fixAction: 'Apply for free D-U-N-S number at dnb.com',
          fixTimeline: '30d'
        },
        {
          id: 'experian-profile',
          title: 'Experian Business Profile',
          description: 'Active business credit file with Experian',
          category: 'credit-agencies',
          status: 'incomplete',
          ficoImpact: 6,
          priority: 'high',
          severity: 'suppressor',
          fixAction: 'Establish Experian business credit profile',
          fixTimeline: '60d'
        },
        {
          id: 'equifax-profile',
          title: 'Equifax Business Profile',
          description: 'Active business credit file with Equifax',
          category: 'credit-agencies',
          status: 'incomplete',
          ficoImpact: 6,
          priority: 'high',
          severity: 'suppressor',
          fixAction: 'Establish Equifax business credit profile',
          fixTimeline: '60d'
        },
        {
          id: 'credit-monitoring',
          title: 'Business Credit Monitoring',
          description: 'Active monitoring of all three business credit bureaus',
          category: 'credit-agencies',
          status: 'incomplete',
          ficoImpact: 5,
          priority: 'medium',
          severity: 'optimization',
          fixAction: 'Set up monitoring with Nav, CreditSignal, or similar service',
          fixTimeline: '7d'
        },
      ]
    },

    // ========================================================================
    // CATEGORY 3: OWNERS CREDIBILITY (15 points)
    // Owner's personal credit and background
    // ========================================================================
    {
      id: 'owners-credibility',
      name: 'Owners Credibility',
      description: 'Owner personal credit and financial responsibility',
      weight: 15,
      order: 3,
      items: [
        {
          id: 'personal-fico-680',
          title: 'Personal FICO Score 680+',
          description: 'Owner personal credit score minimum 680',
          category: 'owners-credibility',
          status: 'incomplete',
          ficoImpact: 10,
          priority: 'critical',
          severity: 'hard_blocker',
          fixAction: 'Pay down balances, dispute errors, become authorized user on aged accounts',
          fixTimeline: '90d'
        },
        {
          id: 'clean-credit-history',
          title: 'Clean Personal Credit History',
          description: 'No bankruptcies, judgments, liens, or collections',
          category: 'owners-credibility',
          status: 'incomplete',
          ficoImpact: 5,
          priority: 'high',
          severity: 'hard_blocker',
          fixAction: 'Pay or negotiate settlements on collections, wait for BK to age out',
          fixTimeline: '90d'
        },
      ]
    },

    // ========================================================================
    // CATEGORY 4: BUSINESS SETUP (15 points)
    // Core business foundation and structure
    // ========================================================================
    {
      id: 'business-setup',
      name: 'Business Setup',
      description: 'Foundational business structure and operations',
      weight: 15,
      order: 4,
      items: [
        {
          id: 'time-in-business',
          title: 'Time in Business (2+ Years)',
          description: 'Business has been operating for at least 2 years',
          category: 'business-setup',
          status: 'incomplete',
          ficoImpact: 8,
          priority: 'high',
          severity: 'suppressor',
          fixAction: 'Continue operations; consider shelf company for faster access',
          fixTimeline: '90d'
        },
        {
          id: 'business-revenue',
          title: 'Annual Revenue ($50K+)',
          description: 'Minimum $50,000 in annual business revenue',
          category: 'business-setup',
          status: 'incomplete',
          ficoImpact: 7,
          priority: 'high',
          severity: 'suppressor',
          fixAction: 'Increase sales, ensure all revenue flows through business bank account',
          fixTimeline: '90d'
        },
      ]
    },

    // ========================================================================
    // CATEGORY 5: BUSINESS CREDIBILITY (15 points)
    // Online presence, reviews, and reputation
    // ========================================================================
    {
      id: 'business-credibility',
      name: 'Business Credibility',
      description: 'Online presence and business reputation',
      weight: 15,
      order: 5,
      items: [
        {
          id: 'google-business-profile',
          title: 'Google Business Profile',
          description: 'Verified Google Business Profile with reviews',
          category: 'business-credibility',
          status: 'incomplete',
          ficoImpact: 5,
          priority: 'high',
          severity: 'optimization',
          fixAction: 'Create and verify Google Business Profile',
          fixTimeline: '7d'
        },
        {
          id: 'social-media-presence',
          title: 'Social Media Presence',
          description: 'Active social media accounts (LinkedIn, Facebook, etc.)',
          category: 'business-credibility',
          status: 'incomplete',
          ficoImpact: 3,
          priority: 'medium',
          severity: 'optimization',
          fixAction: 'Create professional LinkedIn company page and Facebook business page',
          fixTimeline: '7d'
        },
        {
          id: 'positive-reviews',
          title: 'Positive Online Reviews',
          description: 'Positive customer reviews on Google, Yelp, etc.',
          category: 'business-credibility',
          status: 'incomplete',
          ficoImpact: 4,
          priority: 'medium',
          severity: 'optimization',
          fixAction: 'Request reviews from satisfied customers',
          fixTimeline: '30d'
        },
        {
          id: 'nap-consistency',
          title: 'NAP Consistency',
          description: 'Name, Address, Phone consistent across all platforms',
          category: 'business-credibility',
          status: 'incomplete',
          ficoImpact: 3,
          priority: 'high',
          severity: 'suppressor',
          fixAction: 'Audit and correct NAP across all directories and platforms',
          fixTimeline: '30d'
        },
      ]
    },

    // ========================================================================
    // CATEGORY 6: BUSINESS CREDIT (15 points)
    // Active business credit tradelines and payment history
    // ========================================================================
    {
      id: 'business-credit',
      name: 'Business Credit',
      description: 'Active business credit accounts and payment history',
      weight: 15,
      order: 6,
      items: [
        {
          id: 'starter-tradelines',
          title: 'Starter Vendor Tradelines (3+)',
          description: 'At least 3 net-30 vendor accounts reporting',
          category: 'business-credit',
          status: 'incomplete',
          ficoImpact: 5,
          priority: 'high',
          severity: 'optimization',
          fixAction: 'Open accounts with Uline, Quill, Grainger, or similar net-30 vendors',
          fixTimeline: '60d'
        },
        {
          id: 'business-credit-cards',
          title: 'Business Credit Cards (2+)',
          description: 'At least 2 business credit cards reporting',
          category: 'business-credit',
          status: 'incomplete',
          ficoImpact: 5,
          priority: 'high',
          severity: 'optimization',
          fixAction: 'Apply for business credit cards that report to bureaus',
          fixTimeline: '30d'
        },
        {
          id: 'payment-history',
          title: 'Perfect Payment History',
          description: 'Zero late payments on business credit accounts',
          category: 'business-credit',
          status: 'incomplete',
          ficoImpact: 5,
          priority: 'critical',
          severity: 'suppressor',
          fixAction: 'Set up autopay on all business credit accounts',
          fixTimeline: '7d'
        },
      ]
    },

    // ========================================================================
    // CATEGORY 7: BUSINESS DOCUMENTATION VERIFICATION (5 points)
    // Final verification and documentation
    // ========================================================================
    {
      id: 'business-documentation',
      name: 'Business Documentation Verification',
      description: 'Final documentation and verification requirements',
      weight: 5,
      order: 7,
      items: [
        {
          id: 'financial-statements',
          title: 'Financial Statements',
          description: 'Current P&L and Balance Sheet prepared',
          category: 'business-documentation',
          status: 'incomplete',
          ficoImpact: 3,
          priority: 'medium',
          severity: 'optimization',
          fixAction: 'Prepare current P&L and Balance Sheet using accounting software',
          fixTimeline: '30d'
        },
        {
          id: 'business-insurance',
          title: 'Business Insurance',
          description: 'General liability insurance in place',
          category: 'business-documentation',
          status: 'incomplete',
          ficoImpact: 2,
          priority: 'medium',
          severity: 'optimization',
          fixAction: 'Obtain general liability insurance from a commercial provider',
          fixTimeline: '7d'
        },
      ]
    },
  ];
}

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

export function getBusinessProfile(): BusinessProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BUSINESS_PROFILE);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading business profile:', error);
  }
  
  // Return default empty profile
  return {
    businessLegalName: '',
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    businessType: '',
    industry: '',
    timeInBusiness: '',
    annualRevenue: '',
    monthlyRevenue: '',
    hasEIN: false,
    hasBankAccount: false,
    hasBusinessAddress: false,
    hasBusinessPhone: false,
    hasBusinessEmail: false,
    hasWebsite: false,
    hasBusinessLicense: false,
    personalCreditScore: 0,
    equifaxScore: 0,
    transunionScore: 0,
    experianScore: 0,
    hasBusinessCredit: false,
    tradelineCount: 0,
    hasDUNS: false,
    scanCompleted: false,
    lastUpdated: new Date().toISOString(),
    createdDate: new Date().toISOString(),
  };
}

export function updateBusinessProfile(updates: Partial<BusinessProfile>): void {
  const current = getBusinessProfile();
  const updated = {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.BUSINESS_PROFILE, JSON.stringify(updated));
}

export function getAllAuditItems(): AuditItem[] {
  // Always start with default items (which have all the severity/fix metadata)
  const categories = getDefaultAuditCategories();
  const defaultItems = categories.flatMap(cat => cat.items);
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_ITEMS);
    if (stored) {
      const storedData = JSON.parse(stored);
      
      // If stored is a full array, use it but merge with defaults to get any new fields
      if (Array.isArray(storedData)) {
        return storedData.map(storedItem => {
          const defaultItem = defaultItems.find(d => d.id === storedItem.id);
          return defaultItem ? { ...defaultItem, ...storedItem } : storedItem;
        });
      }
      
      // If stored is a partial map of statuses (from demo data), merge with defaults
      if (typeof storedData === 'object') {
        return defaultItems.map(item => {
          const storedUpdate = storedData[item.id];
          if (storedUpdate) {
            return { ...item, ...storedUpdate };
          }
          return item;
        });
      }
    }
  } catch (error) {
    console.error('Error loading audit items:', error);
  }
  
  return defaultItems;
}

export function saveAuditItems(items: AuditItem[]): void {
  localStorage.setItem(STORAGE_KEYS.AUDIT_ITEMS, JSON.stringify(items));
}

export function getAuditItemById(id: string): AuditItem | undefined {
  const items = getAllAuditItems();
  return items.find(item => item.id === id);
}

export function updateAuditItem(id: string, updates: Partial<AuditItem>): void {
  const items = getAllAuditItems();
  const index = items.findIndex(item => item.id === id);
  
  if (index !== -1) {
    items[index] = {
      ...items[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    saveAuditItems(items);
  }
}

export function markAuditItemComplete(id: string, source: 'scan' | 'manual' | 'automated' = 'manual'): void {
  updateAuditItem(id, {
    status: 'complete',
    completedDate: new Date().toISOString(),
    source,
  });
}

export function markAuditItemIncomplete(id: string): void {
  updateAuditItem(id, {
    status: 'incomplete',
    completedDate: undefined,
  });
}

// ============================================================================
// CATEGORY & PROGRESS FUNCTIONS
// ============================================================================

export function getAuditItemsByCategory(categoryId: string): AuditItem[] {
  const items = getAllAuditItems();
  return items.filter(item => item.category === categoryId);
}

export function getCategoryProgress(categoryId: string) {
  const items = getAuditItemsByCategory(categoryId);
  const completed = items.filter(item => item.status === 'complete').length;
  const total = items.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const completedPoints = items
    .filter(item => item.status === 'complete')
    .reduce((sum, item) => sum + item.ficoImpact, 0);
  
  const totalPoints = items.reduce((sum, item) => sum + item.ficoImpact, 0);
  
  return {
    completed,
    total,
    percentage,
    completedPoints,
    totalPoints,
  };
}

export function getOverallProgress() {
  const items = getAllAuditItems();
  const completed = items.filter(item => item.status === 'complete').length;
  const total = items.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    completed,
    total,
    percentage,
  };
}

// ============================================================================
// FICO SBSS CALCULATION (80-160 scale)
// ============================================================================

export function calculateFicoSBSS(): number {
  const baseline = 80; // Starting point for a new business
  const items = getAllAuditItems();
  
  // Sum up FICO points from completed items
  const completedPoints = items
    .filter(item => item.status === 'complete')
    .reduce((sum, item) => sum + item.ficoImpact, 0);
  
  return baseline + completedPoints;
}

export function getFicoBankableStatus(): {
  currentScore: number;
  targetScore: number;
  pointsNeeded: number;
  isBankable: boolean;
  percentage: number;
} {
  const currentScore = calculateFicoSBSS();
  const targetScore = 160;
  const pointsNeeded = Math.max(0, targetScore - currentScore);
  const isBankable = currentScore >= targetScore;
  const percentage = Math.round((currentScore / targetScore) * 100);
  
  return {
    currentScore,
    targetScore,
    pointsNeeded,
    isBankable,
    percentage,
  };
}

// ============================================================================
// NAP SCORE CALCULATION (0-100 scale)
// ============================================================================

export function calculateNAPScore(): number {
  const profile = getBusinessProfile();
  let score = 0;
  
  // Name (30 points)
  if (profile.businessLegalName && profile.businessLegalName.length > 0) {
    score += 15; // Has business name
    // Check NAP consistency item
    const napItem = getAuditItemById('nap-consistency');
    if (napItem?.status === 'complete') {
      score += 15; // Name is consistent everywhere
    }
  }
  
  // Address (40 points)
  if (profile.hasBusinessAddress) {
    score += 10; // Has business address
  }
  if (profile.businessAddress && profile.city && profile.state && profile.zipCode) {
    score += 10; // Address is complete
  }
  // Check physical address item
  const addressItem = getAuditItemById('business-address');
  if (addressItem?.status === 'complete') {
    score += 20; // Address verified and compliant
  }
  
  // Phone (30 points)
  if (profile.hasBusinessPhone) {
    score += 10; // Has business phone
  }
  if (profile.businessPhoneNumber) {
    score += 5; // Phone number provided
  }
  // Check business phone item
  const phoneItem = getAuditItemById('business-phone');
  if (phoneItem?.status === 'complete') {
    score += 15; // Phone verified with 411 listing
  }
  
  return Math.min(100, score);
}

// ============================================================================
// DATA MIGRATION & SYNC FUNCTIONS
// ============================================================================

export function syncScanDataToAuditItems(): void {
  const profile = getBusinessProfile();
  
  // Auto-mark items complete based on scan data
  
  // ===================================
  // CATEGORY 1: LENDER COMPLIANCE
  // ===================================
  
  // Entity Formation - if has EIN and business type
  if (profile.hasEIN && profile.businessType) {
    markAuditItemComplete('entity-formation', 'scan');
  }
  
  // EIN Number
  if (profile.hasEIN) {
    markAuditItemComplete('ein-number', 'scan');
  }
  
  // Bank Account
  if (profile.hasBankAccount) {
    markAuditItemComplete('business-bank-account', 'scan');
  }
  
  // Business Address
  if (profile.hasBusinessAddress) {
    markAuditItemComplete('business-address', 'scan');
  }
  
  // Business Phone
  if (profile.hasBusinessPhone) {
    markAuditItemComplete('business-phone', 'scan');
  }
  
  // Business Email
  if (profile.hasBusinessEmail) {
    markAuditItemComplete('business-email', 'scan');
  }
  
  // Website
  if (profile.hasWebsite) {
    markAuditItemComplete('business-website', 'scan');
  }
  
  // Business License
  if (profile.hasBusinessLicense) {
    markAuditItemComplete('business-license', 'scan');
  }
  
  // ===================================
  // CATEGORY 2: BUILDING CREDIT
  // ===================================
  
  // Personal Credit Score
  if (profile.personalCreditScore >= 680) {
    markAuditItemComplete('personal-fico-680', 'scan');
  }
  
  // Business Credit
  if (profile.hasBusinessCredit && profile.tradelineCount >= 3) {
    markAuditItemComplete('starter-tradelines', 'scan');
  }
  
  // Starter tradelines (5+ tier 1 accounts)
  if (profile.tradelineCount >= 5) {
    markAuditItemComplete('tier1-vendors', 'scan');
  }
  
  // D-U-N-S Number
  if (profile.hasDUNS) {
    markAuditItemComplete('duns-number', 'scan');
  }
  
  // ===================================
  // CATEGORY 3: OPTIMIZE REPORTING
  // ===================================
  
  // Time in Business
  if (profile.timeInBusiness && !profile.timeInBusiness.includes('Less than 1 year')) {
    const yearsMatch = profile.timeInBusiness.match(/(\d+)/);
    if (yearsMatch) {
      const years = parseInt(yearsMatch[1]);
      if (years >= 2) {
        markAuditItemComplete('time-in-business', 'scan');
      }
    }
  }
  
  // Annual Revenue
  if (profile.annualRevenue && profile.annualRevenue !== '$0') {
    const revenueValue = parseFloat(profile.annualRevenue.replace(/[^0-9.]/g, '')) || 0;
    if (revenueValue >= 50000) {
      markAuditItemComplete('business-revenue', 'scan');
    }
  }
  
  // ===================================
  // CATEGORY 4: ONLINE ANALYSIS (NAP)
  // ===================================
  
  // Google Business Profile listing
  if (profile.hasBusinessAddress && profile.businessPhoneNumber && profile.businessLegalName) {
    // Don't auto-mark these as they require actual online verification
    // Just keep them incomplete until manually verified
  }
}

export function migrateLegacyData(): void {
  // Migrate from old Business Success Scan storage
  try {
    const step1 = localStorage.getItem('scanStep1');
    const step2 = localStorage.getItem('scanStep2');
    const step3 = localStorage.getItem('scanStep3');
    
    if (step1 || step2 || step3) {
      const profile = getBusinessProfile();
      
      if (step1) {
        const data = JSON.parse(step1);
        updateBusinessProfile({
          businessLegalName: data.businessLegalName || '',
          contactFirstName: data.contactFirstName || '',
          contactLastName: data.contactLastName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          businessAddress: data.businessAddress || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          businessPhoneNumber: data.businessPhone || '',
          hasEIN: data.hasEIN === 'Yes',
        });
      }
      
      if (step2) {
        const data = JSON.parse(step2);
        updateBusinessProfile({
          hasBusinessAddress: data.businessAddress === 'yes',
          hasBusinessPhone: data.businessPhone === 'yes',
          hasBankAccount: data.bankAccount === 'yes',
          hasEIN: data.ein === 'yes',
        });
      }
      
      if (step3) {
        const data = JSON.parse(step3);
        updateBusinessProfile({
          personalCreditScore: parseInt(data.personalCreditScore) || 0,
          hasBusinessCredit: data.businessCreditFile === 'yes',
          tradelineCount: parseInt(data.tradelines) || 0,
        });
      }
      
      // Mark scan as completed
      updateBusinessProfile({
        scanCompleted: true,
        scanCompletedDate: new Date().toISOString(),
      });
      
      // Sync to audit items
      syncScanDataToAuditItems();
    }
  } catch (error) {
    console.error('Error migrating legacy data:', error);
  }
  
  // Migrate from old Lender Compliance progress
  try {
    const oldProgress = localStorage.getItem('lenderComplianceProgress');
    if (oldProgress) {
      const progress = JSON.parse(oldProgress);
      
      // Map old module IDs to new item IDs
      const moduleMapping: Record<string, string[]> = {
        'entity-filings': ['entity-formation', 'trademark-verification', 'good-standing', 'business-name-review'],
        'business-location': ['business-address'],
        'phones-411': ['business-phone'],
        'website-email': ['business-website', 'business-email'],
        'ein-licenses': ['ein-number', 'business-license'],
        'business-banking': ['business-bank-account'],
        'agencies-naics': ['naics-code'],
        'business-plan': ['business-plan'],
        'assets-ucc': ['asset-documentation'],
        'corp-only-facts': ['corporate-records'],
        'bank-rating': ['bank-rating'],
        'comparable-credit': ['comparable-credit'],
        'cd-business-loan': ['cd-business-loan'],
      };
      
      // Mark items complete based on old module progress
      Object.keys(progress).forEach(moduleId => {
        if (progress[moduleId]?.completed) {
          const itemIds = moduleMapping[moduleId] || [];
          itemIds.forEach(itemId => {
            markAuditItemComplete(itemId, 'automated');
          });
        }
      });
    }
  } catch (error) {
    console.error('Error migrating compliance data:', error);
  }
  
  // Migrate from Entity & Filings tasks
  try {
    const oldTasks = localStorage.getItem('entityFilingsTasks');
    if (oldTasks) {
      const tasks = JSON.parse(oldTasks);
      
      const taskMapping: Record<string, string> = {
        'task-1': 'entity-formation',
        'task-2': 'trademark-verification',
        'task-3': 'good-standing',
        'task-4': 'business-name-review',
      };
      
      Object.keys(tasks).forEach(taskId => {
        if (tasks[taskId]?.status === 'complete') {
          const itemId = taskMapping[taskId];
          if (itemId) {
            markAuditItemComplete(itemId, 'automated');
          }
        }
      });
    }
  } catch (error) {
    console.error('Error migrating task data:', error);
  }
}

// ============================================================================
// GAMIFICATION FUNCTIONS
// ============================================================================

// Achievement Definitions
export function getDefaultAchievements(): Achievement[] {
  return [
    {
      id: 'first-blood',
      title: 'First Blood',
      description: 'Complete your first task',
      icon: '🎯',
      category: 'completion',
      isUnlocked: false,
      criteria: { type: 'task_count', value: 1 }
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Complete 5 tasks',
      icon: '🚀',
      category: 'completion',
      isUnlocked: false,
      criteria: { type: 'task_count', value: 5 }
    },
    {
      id: 'quarter-master',
      title: 'Quarter Master',
      description: 'Reach 25% completion',
      icon: '⭐',
      category: 'milestone',
      isUnlocked: false,
      criteria: { type: 'percentage', value: 25 }
    },
    {
      id: 'halfway-hero',
      title: 'Halfway Hero',
      description: 'Reach 50% completion',
      icon: '🏆',
      category: 'milestone',
      isUnlocked: false,
      criteria: { type: 'percentage', value: 50 }
    },
    {
      id: 'almost-there',
      title: 'Almost There!',
      description: 'Reach 75% completion',
      icon: '💎',
      category: 'milestone',
      isUnlocked: false,
      criteria: { type: 'percentage', value: 75 }
    },
    {
      id: 'module-master',
      title: 'Module Master',
      description: 'Complete 100% of a module',
      icon: '👑',
      category: 'completion',
      isUnlocked: false,
      criteria: { type: 'module_complete', value: 'entity-filings' }
    },
    {
      id: 'bankable-boss',
      title: 'Bankable Boss',
      description: 'Reach 100% and become bankable',
      icon: '🎉',
      category: 'milestone',
      isUnlocked: false,
      criteria: { type: 'percentage', value: 100 }
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Complete a module in under 7 days',
      icon: '⚡',
      category: 'speed',
      isUnlocked: false,
      criteria: { type: 'time_based', value: 7 }
    },
    {
      id: 'perfectionist',
      title: 'The Perfectionist',
      description: 'Fill out all task metadata (due dates, tags, assignees)',
      icon: '✨',
      category: 'quality',
      isUnlocked: false,
      criteria: { type: 'metadata_filled', value: 100 }
    },
    {
      id: 'streak-starter',
      title: 'Streak Starter',
      description: 'Maintain a 3-day streak',
      icon: '🔥',
      category: 'streak',
      isUnlocked: false,
      criteria: { type: 'streak_days', value: 3 }
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 7-day streak',
      icon: '🔥🔥',
      category: 'streak',
      isUnlocked: false,
      criteria: { type: 'streak_days', value: 7 }
    },
    {
      id: 'on-fire',
      title: 'On Fire!',
      description: 'Maintain a 30-day streak',
      icon: '🔥🔥🔥',
      category: 'streak',
      isUnlocked: false,
      criteria: { type: 'streak_days', value: 30 }
    }
  ];
}

// Get gamification data
export function getGamificationData(): GamificationData {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAMIFICATION_DATA);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading gamification data:', error);
  }

  // Return default
  return {
    achievements: getDefaultAchievements(),
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date().toISOString(),
      streakHistory: []
    },
    totalPoints: 0,
    level: 1,
    experiencePoints: 0,
    lastCelebration: undefined
  };
}

// Save gamification data
export function saveGamificationData(data: GamificationData): void {
  localStorage.setItem(STORAGE_KEYS.GAMIFICATION_DATA, JSON.stringify(data));
}

// Update streak on task completion
export function updateStreak(): UserStreak {
  const data = getGamificationData();
  const today = new Date().toISOString().split('T')[0];
  const lastActivityDay = data.streak.lastActivityDate.split('T')[0];
  
  const daysDiff = Math.floor(
    (new Date(today).getTime() - new Date(lastActivityDay).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) {
    // Same day, just update history
    const todayHistory = data.streak.streakHistory.find(h => h.date === today);
    if (todayHistory) {
      todayHistory.tasksCompleted++;
    } else {
      data.streak.streakHistory.push({ date: today, tasksCompleted: 1 });
    }
  } else if (daysDiff === 1) {
    // Next day, increment streak
    data.streak.currentStreak++;
    data.streak.longestStreak = Math.max(data.streak.longestStreak, data.streak.currentStreak);
    data.streak.lastActivityDate = new Date().toISOString();
    data.streak.streakHistory.push({ date: today, tasksCompleted: 1 });
  } else {
    // Streak broken, restart
    data.streak.currentStreak = 1;
    data.streak.lastActivityDate = new Date().toISOString();
    data.streak.streakHistory.push({ date: today, tasksCompleted: 1 });
  }

  saveGamificationData(data);
  return data.streak;
}

// Check and unlock achievements
export function checkAchievements(): Achievement[] {
  const data = getGamificationData();
  const items = getAllAuditItems();
  const completedItems = items.filter(item => item.status === 'complete');
  const completedCount = completedItems.length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  
  const newlyUnlocked: Achievement[] = [];

  data.achievements.forEach(achievement => {
    if (achievement.isUnlocked) return; // Already unlocked

    let shouldUnlock = false;

    switch (achievement.criteria.type) {
      case 'task_count':
        shouldUnlock = completedCount >= (achievement.criteria.value as number);
        break;
      
      case 'percentage':
        shouldUnlock = percentage >= (achievement.criteria.value as number);
        break;
      
      case 'module_complete':
        const moduleId = achievement.criteria.value as string;
        const moduleItems = items.filter(item => item.moduleId === moduleId);
        const moduleCompleted = moduleItems.filter(item => item.status === 'complete').length;
        shouldUnlock = moduleItems.length > 0 && moduleCompleted === moduleItems.length;
        break;
      
      case 'streak_days':
        shouldUnlock = data.streak.currentStreak >= (achievement.criteria.value as number);
        break;
      
      case 'metadata_filled':
        // Check if metadata is filled (this would need task metadata from EntityFilings)
        // For now, we'll skip this
        shouldUnlock = false;
        break;
      
      case 'time_based':
        // Check if module was completed within time limit
        // This requires tracking module start date
        shouldUnlock = false;
        break;
    }

    if (shouldUnlock) {
      achievement.isUnlocked = true;
      achievement.unlockedDate = new Date().toISOString();
      newlyUnlocked.push(achievement);
    }
  });

  // Update points and level
  data.totalPoints = calculateFicoSBSS();
  data.level = Math.floor(data.totalPoints / 20) + 1; // Level up every 20 points
  data.experiencePoints = completedCount * 10;

  saveGamificationData(data);
  return newlyUnlocked;
}

// Get unlocked achievements
export function getUnlockedAchievements(): Achievement[] {
  const data = getGamificationData();
  return data.achievements.filter(a => a.isUnlocked);
}

// Get locked achievements
export function getLockedAchievements(): Achievement[] {
  const data = getGamificationData();
  return data.achievements.filter(a => !a.isUnlocked);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initializeBusinessData(): void {
  // Check if audit items exist, if not, create them
  const existingItems = localStorage.getItem(STORAGE_KEYS.AUDIT_ITEMS);
  if (!existingItems) {
    const categories = getDefaultAuditCategories();
    const allItems = categories.flatMap(cat => cat.items);
    saveAuditItems(allItems);
  }
  
  // Migrate legacy data if it exists
  migrateLegacyData();
}
