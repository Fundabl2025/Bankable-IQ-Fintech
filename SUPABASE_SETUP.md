## FundReady Supabase Migration - Setup Instructions

### Problem
The SQL script execution is timing out or encountering errors when trying to create the schema through the script tool.

### Solution
We'll use a **hybrid approach**:
1. **Create tables manually via Supabase Dashboard** (fast and reliable)
2. **Build the application layer** (API hooks and component integration)
3. **Migrate data** from localStorage to Supabase

### Tables Needed (Create in Supabase Dashboard)

#### 1. business_profiles
```
Columns:
- id (uuid, PK, default: gen_random_uuid())
- user_id (uuid, FK → auth.users)
- businessLegalName (text)
- contactFirstName (text)
- contactLastName (text)
- contactEmail (text)
- contactPhone (text)
- businessAddress (text)
- city (text)
- state (text)
- zipCode (text)
- businessType (text)
- industry (text)
- naicsCode (text)
- timeInBusiness (text)
- annualRevenue (text)
- monthlyRevenue (text)
- hasEIN (boolean, default: false)
- einNumber (text)
- hasBankAccount (boolean, default: false)
- hasBusinessAddress (boolean, default: false)
- hasBusinessPhone (boolean, default: false)
- businessPhoneNumber (text)
- hasBusinessEmail (boolean, default: false)
- hasWebsite (boolean, default: false)
- websiteUrl (text)
- hasBusinessLicense (boolean, default: false)
- personalCreditScore (integer)
- equifaxScore (integer)
- transunionScore (integer)
- experianScore (integer)
- hasBusinessCredit (boolean, default: false)
- tradelineCount (integer)
- hasDUNS (boolean, default: false)
- dunsNumber (text)
- profilePhoto (text)
- linkedInUrl (text)
- facebookUrl (text)
- twitterUrl (text)
- instagramUrl (text)
- youtubeUrl (text)
- tiktokUrl (text)
- ethnicity (text)
- annualHouseholdIncome (text)
- primaryLanguage (text)
- householdSize (text)
- comfortableWithEnglishCoaching (text)
- livesInRuralArea (text)
- gender (text)
- referralSource (text)
- birthday (text)
- bankingPartner (text)
- scanCompleted (boolean, default: false)
- scanCompletedDate (timestamp)
- lastUpdated (timestamp, default: now())
- createdDate (timestamp, default: now())
```

#### 2. audit_items
```
Columns:
- id (text, PK)
- user_id (uuid, FK → auth.users)
- title (text)
- description (text)
- category (text)
- status (text) // 'complete' | 'incomplete' | 'in-progress'
- ficoImpact (integer)
- priority (text) // 'critical' | 'high' | 'medium' | 'low'
- completedDate (timestamp)
- lastUpdated (timestamp, default: now())
- source (text) // 'scan' | 'manual' | 'automated'
- moduleId (text)
- taskId (text)
- notes (text)
```

#### 3. fico_history
```
Columns:
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- date (timestamp, default: now())
- score (integer)
- source (text) // 'bureau' | 'estimated' | 'calculated'
- breakdown (jsonb) // { equifax, transunion, experian, sbss }
```

#### 4. gamification_data
```
Columns:
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- totalPoints (integer, default: 0)
- level (integer, default: 1)
- experiencePoints (integer, default: 0)
- currentStreak (integer, default: 0)
- longestStreak (integer, default: 0)
- lastActivityDate (timestamp)
- lastUpdated (timestamp, default: now())
```

#### 5. achievements
```
Columns:
- id (text, PK)
- user_id (uuid, FK → auth.users)
- title (text)
- description (text)
- icon (text)
- category (text)
- isUnlocked (boolean, default: false)
- unlockedDate (timestamp)
- criteria (jsonb) // { type, value }
```

#### 6. audit_logs
```
Columns:
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- action (text)
- entity_type (text)
- entity_id (text)
- changes (jsonb) // { before, after }
- timestamp (timestamp, default: now())
```

#### 7. funding_applications
```
Columns:
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- program_id (text)
- program_name (text)
- status (text) // 'draft' | 'submitted' | 'approved' | 'rejected'
- appliedDate (timestamp)
- lastUpdated (timestamp, default: now())
- programData (jsonb)
```

### Step-by-Step Instructions for Supabase Dashboard

1. Go to Supabase Dashboard → Your Project → SQL Editor
2. Create each table using the schema above
3. For each table, enable Row Level Security (RLS):
   - Go to Authentication → Policies
   - Add policy: `SELECT` - `auth.uid() = user_id`
   - Add policy: `INSERT` - `auth.uid() = user_id`
   - Add policy: `UPDATE` - `auth.uid() = user_id`
   - Add policy: `DELETE` - `auth.uid() = user_id`

### Vite Environment Variables

Add to `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### What's Built in Code
- ✅ Supabase client created (`src/app/lib/supabase/client.ts`)
- ✅ @supabase/supabase-js dependency added
- ⏳ React data hooks (next step)
- ⏳ Component migration (next step)
