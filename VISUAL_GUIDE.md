# FUNDREADY DATA PERSISTENCE - VISUAL IMPLEMENTATION GUIDE

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        FUNDREADY ASSESSMENT SYSTEM                         │
└────────────────────────────────────────────────────────────────────────────┘

                            Three Layers of Storage:

┌─────────────────────┐
│  LOCAL STORAGE      │  ← Primary fallback (always available)
│  (Browser)          │     • unified_assessment (JSON)
│  localStorage.set   │     • fundready_business_profile
│  localStorage.get   │     • auditItems
└─────────────────────┘
         ↕ (sync via data-adapter.ts)
┌─────────────────────────────────────────────────────────────────┐
│  SUPABASE DATABASE (business_profiles table)                     │
│                                                                   │
│  When user is logged in:                                         │
│  ├─ user_id (uuid, FK → auth.users)                             │
│  ├─ assessment_data (jsonb, full assessment)                    │
│  ├─ fund_score (integer) ← NEW                                  │
│  ├─ bankable_score (integer) ← NEW                              │
│  ├─ business_legal_name (text, optional)                        │
│  ├─ created_at (timestamp)                                      │
│  └─ updated_at (timestamp)                                      │
└─────────────────────────────────────────────────────────────────┘
         ↑ (loads via getDataItem)
         │
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION STATE                                               │
│  (React components)                                              │
│  • Dashboard (fundScore, bankableScore)                         │
│  • Results (displayScore, extendedResults)                      │
│  • AuthContext (user)                                           │
└─────────────────────────────────────────────────────────────────┘

Key Principle: ✅ localStorage first, 🔄 sync to Supabase, 📂 load from Supabase
```

---

## User Journey Map

```
START: Unauthenticated User
│
├─ ASSESSMENT FLOW
│  ├─ Take assessment (/business-assessment)
│  │  └─ Q1-Q24 collected in unified_assessment
│  │
│  └─ Save assessment
│     ├─ ✅ localStorage.setItem('unified_assessment', JSON)
│     └─ ❌ Supabase (no user)
│
├─ RESULTS FLOW
│  ├─ View results (/business-assessment/results)
│  │  ├─ Load from localStorage
│  │  ├─ Calculate scores with engine
│  │  └─ Display results
│  │
│  └─ Show status indicator
│     └─ ⚠️ "Results not saved — create account to save"
│
├─ [CREATE ACCOUNT] ← Key branching point
│  │
│  └─ SIGNUP FLOW (/signup)
│     ├─ Enter email + password
│     ├─ Submit form
│     ├─ Success: signUp(email, password)
│     ├─ Auto-run: migrateLocalDataToSupabase()
│     │  ├─ Get current user
│     │  ├─ Read unified_assessment from localStorage
│     │  ├─ Parse fund_score + bankable_score
│     │  └─ Upsert to business_profiles table
│     │     └─ ✅ Supabase now has user's data
│     │
│     └─ Redirect to /app/dashboard
│        │
│        ├─ DASHBOARD FLOW
│        │  ├─ useEffect triggers
│        │  ├─ User exists in AuthContext
│        │  ├─ Call getDataItem('unified_assessment')
│        │  │  ├─ Query Supabase business_profiles
│        │  │  ├─ Get current user's assessment_data
│        │  │  └─ Return from Supabase ✅
│        │  │
│        │  ├─ Parse and calculate scores
│        │  ├─ Display scores and blockers
│        │  └─ Show hero cards + capital path
│        │
│        └─ User can now view Results
│           ├─ View results (/business-assessment/results)
│           │  ├─ Load from localStorage (same as before)
│           │  ├─ Calculate scores with engine
│           │  └─ Display results
│           │
│           └─ Show status indicator
│              └─ ✓ "Results saved to your account"
│
└─ [LOGIN] ← Alternative path for returning users
   │
   └─ LOGIN FLOW (/login)
      ├─ Enter email + password
      ├─ Submit form
      ├─ Success: signIn(email, password)
      ├─ Auto-run: migrateLocalDataToSupabase()
      │  ├─ Get current user
      │  ├─ Read unified_assessment from localStorage (if exists)
      │  ├─ Parse fund_score + bankable_score
      │  └─ Upsert to business_profiles table
      │     └─ ✅ Update Supabase with latest data
      │
      └─ Redirect to /app/dashboard
         └─ [Same as above]

END: Persistent, Synced Data State ✅
```

---

## Code Change Map

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. DATA ADAPTER LAYER (src/app/lib/data-adapter.ts)            │
└─────────────────────────────────────────────────────────────────┘

    setDataItem(key, value)
    ├─ localStorage.setItem(key, value)  ← Always first
    │  └─ window.dispatchEvent('storage')  [instant]
    │
    └─ If key === 'unified_assessment' AND user logged in AND Supabase configured:
       ├─ parseScoresFromAssessment(value)
       │  └─ Extract fund_score + bankable_score from JSON
       │
       ├─ supabase.from('business_profiles').upsert({
       │  ├─ user_id: user.id
       │  ├─ assessment_data: value
       │  ├─ fund_score: extracted
       │  ├─ bankable_score: extracted
       │  └─ updated_at: now()
       │  })  [async, non-blocking]
       │
       └─ Errors logged but don't crash app

    getDataItem(key)
    ├─ If key === 'unified_assessment' AND user logged in AND Supabase configured:
    │  ├─ Get current user
    │  ├─ supabase.from('business_profiles').select('assessment_data').eq('user_id', user.id).single()
    │  │  └─ Returns assessment_data if found
    │  │
    │  └─ If error or not found → null
    │
    └─ Return localStorage.getItem(key) as fallback

    migrateLocalDataToSupabase()
    ├─ Get current user
    ├─ Read unified_assessment from localStorage
    ├─ Parse scores
    ├─ Upsert to business_profiles with scores
    └─ Called after signup/login


┌─────────────────────────────────────────────────────────────────┐
│ 2. DASHBOARD PAGE (src/app/pages/Dashboard.tsx)                │
└─────────────────────────────────────────────────────────────────┘

    useEffect(() => {
      loadScores()
    }, [user])  ← Re-run when user changes

    loadScores = async () => {
      if (user) {
        assessmentJson = await getDataItem('unified_assessment')
        └─ Loads from Supabase (or localStorage if Supabase unavailable)
      } else {
        assessmentJson = localStorage.getItem('unified_assessment')
        └─ Unauthenticated users use localStorage only
      }

      if (assessmentJson) {
        Parse JSON → Calculate scores → Update state
      }
    }


┌─────────────────────────────────────────────────────────────────┐
│ 3. RESULTS PAGE (src/app/pages/business-assessment/Results.tsx) │
└─────────────────────────────────────────────────────────────────┘

    At top of page:
    {user ? (
      <div>✓ Green dot - "Results saved to your account"</div>
    ) : (
      <div>⚠️ Yellow dot - "Results not saved — create account to save"</div>
    )}


┌─────────────────────────────────────────────────────────────────┐
│ 4. AUTH PAGES (Already wired!)                                  │
└─────────────────────────────────────────────────────────────────┘

    SignupPage.tsx (line ~53):
    try {
      await signUp(email, password)
      await migrateLocalDataToSupabase()  ← Automatic sync
    } catch { ... }

    LoginPage.tsx (line ~35):
    try {
      await signIn(email, password)
      await migrateLocalDataToSupabase()  ← Automatic sync
    } catch { ... }
```

---

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        ASSESSMENT COMPLETION FLOW                          │
└────────────────────────────────────────────────────────────────────────────┘

Step 1: Complete Assessment Questions (Q1-Q24)
    unified_assessment = {
      "businessName": "...",
      "ownerFirstName": "...",
      "creditScore": "...",
      ... (all 24 Q&A)
    }

Step 2: Submit Assessment
    assessmentEngine.computeScore(unified_assessment)
    └─ Returns: fundScore (0-1000), bankableScore (0-300)

Step 3: Save Results
    If NOT logged in:
    ├─ localStorage.setItem('unified_assessment', JSON.stringify(assessment))
    └─ ✓ Saved to browser storage

    If logged in:
    ├─ localStorage.setItem(...)  [instant]
    ├─ AND async:
    └─ supabase.business_profiles.upsert({
         user_id: user.id,
         assessment_data: JSON.stringify(assessment),
         fund_score: computed_score,
         bankable_score: computed_score,
         updated_at: now()
       })
       └─ ✓ Synced to Supabase

Step 4: Display Results Page
    Load assessment:
    ├─ If user: getDataItem('unified_assessment')
    │  ├─ Try Supabase first
    │  └─ Fallback to localStorage
    └─ If not user: localStorage.getItem('unified_assessment')

    Show indicator:
    ├─ If user: "✓ Results saved to your account"
    └─ If not user: "⚠️ Results not saved — create account"

Step 5: After Signup
    SignupPage → migrateLocalDataToSupabase() called
    ├─ Get current user from auth
    ├─ Read assessment from localStorage
    ├─ Upsert to Supabase with scores
    └─ Data now synced ✓

Step 6: View Dashboard
    Dashboard loads assessment:
    ├─ useEffect with [user] dependency
    ├─ Call getDataItem('unified_assessment')
    │  ├─ Query Supabase for user's data
    │  └─ Fallback to localStorage
    ├─ Parse and calculate scores
    └─ Display on dashboard


┌────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE QUERY FLOW                               │
└────────────────────────────────────────────────────────────────────────────┘

WRITE (setDataItem):
    localStorage.setItem() ─┐ IMMEDIATE ✅
                           │
                           ├─ Dispatch 'storage' event
                           │
                           └─ (if logged in + Supabase configured)
                              │
                              └─ supabase.upsert() ─── ASYNC (non-blocking) ✅
                                 │
                                 ├─ Query: business_profiles where user_id = :id
                                 ├─ If exists: UPDATE row
                                 └─ If not exists: INSERT row
                                    └─ assessment_data JSONB stored

READ (getDataItem):
    if (user logged in && Supabase configured)
    │
    └─ supabase.select().eq('user_id', user.id).single()
       │
       ├─ Query: business_profiles where user_id = :id
       ├─ If found: return assessment_data
       ├─ If not found: return null → fallback
       └─ If error: return null → fallback
    
    localStorage.getItem() ─── FALLBACK (always works)
    │
    └─ Return value or null


┌────────────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING STRATEGY                             │
└────────────────────────────────────────────────────────────────────────────┘

Scenario 1: Supabase is down
    Write: localStorage OK ✓, Supabase fails silently (logged)
    Read: localStorage used immediately ✓

Scenario 2: User logs in after local assessment
    Migration runs, data saved to Supabase ✓

Scenario 3: User clears browser cache
    Dashboard loads from Supabase for logged-in users ✓
    Unauthenticated users see empty (OK)

Scenario 4: Network is slow
    localStorage loads instantly ✓
    Supabase loads async in background (better data)

Scenario 5: Old assessment data in localStorage
    Migration on login/signup updates Supabase ✓
    Latest version used on load

Result: ✅ Graceful degradation, no breaking changes
```

---

## Success Criteria

After implementation, you should see:

✅ **Unauthenticated User:**
- Takes assessment
- Sees "⚠️ Results not saved" indicator
- Data in localStorage only

✅ **After Signup:**
- Migration runs automatically
- "✓ Results saved" indicator appears
- Dashboard loads scores from Supabase
- Supabase business_profiles table has new records

✅ **After Login:**
- Migration runs automatically
- Dashboard loads scores from Supabase (even if localStorage cleared)
- Scores persist across sessions

✅ **Data Reliability:**
- localStorage always available (offline access)
- Supabase syncs for logged-in users
- Fallback chain works (Supabase → localStorage)
- No data loss on migration

---

## Troubleshooting Guide

```
Issue: "Results not saved" indicator shows for logged-in user
→ Check: Is user object available in AuthContext?
→ Check: Did migration run? (Look for console logs)
→ Check: Does business_profiles have records for this user?

Issue: Dashboard shows no scores after login
→ Check: getDataItem working? (Network tab)
→ Check: Supabase query returns data?
→ Check: localStorage fallback working?

Issue: Supabase query fails
→ Check: business_profiles table exists?
→ Check: Required columns present?
→ Check: user_id FK constraint exists?
→ Run: verify-supabase-schema.sql to fix

Issue: Migration doesn't run
→ Check: SignupPage.tsx/LoginPage.tsx has calls?
→ Check: isSupabaseConfigured = true?
→ Check: getCurrentUser() returns user?

Issue: Scores not calculated
→ Check: assessment_data has all required fields?
→ Check: computeScore() function working?
→ Check: fund_score + bankable_score saved?
```

---

**All systems ready for deployment! ✅**

See DEPLOYMENT_CHECKLIST.md for final pre-launch verification.
