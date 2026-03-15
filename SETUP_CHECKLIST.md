# FundReady Supabase Setup Checklist

## Pre-Setup
- [ ] You have a Supabase account
- [ ] You have access to your FundReady project
- [ ] You can access Supabase Dashboard

## Setup Steps

### Step 1: Create Database Schema
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Create new query
- [ ] Open `scripts/000_fundready_schema.sql` in this project
- [ ] Copy entire contents
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run"
- [ ] Confirm: No errors appear
- [ ] Verify: 7 new tables in Supabase (check Tables list)

**Expected tables:**
- [ ] business_profiles
- [ ] audit_items
- [ ] fico_history
- [ ] gamification_data
- [ ] achievements
- [ ] audit_logs
- [ ] funding_applications

### Step 2: Set Environment Variables
- [ ] Open v0 Settings (gear icon, top right)
- [ ] Click "Vars"
- [ ] Add new variable:
  - Key: `VITE_SUPABASE_URL`
  - Value: (from Supabase Dashboard → Settings → API → Project URL)
- [ ] Add new variable:
  - Key: `VITE_SUPABASE_ANON_KEY`
  - Value: (from Supabase Dashboard → Settings → API → `anon` public key)
- [ ] Verify both variables are saved

### Step 3: Verify Setup
- [ ] App starts without errors (v0 Preview)
- [ ] No error about missing environment variables
- [ ] Browser console has no Supabase errors

### Step 4: Test Authentication (Optional)
- [ ] Open browser DevTools (F12)
- [ ] Open Console tab
- [ ] Paste: `import { supabase } from '@/app/lib/supabase/client'`
- [ ] You should see no errors

---

## Troubleshooting

### "Cannot find module '@/app/lib/supabase/client'"
**Fix**: Rebuild app (restart dev server)

### "Missing Supabase environment variables"
**Fix**: Make sure you added VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Settings → Vars

### SQL script fails to run
**Fix**: 
1. Try running one table at a time
2. Check for error messages in red
3. Verify you're in the right SQL Editor

### Tables not showing in Supabase
**Fix**: 
1. Refresh the page (Cmd+R)
2. Check you're in the correct schema (public)
3. Scroll down in Tables list

---

## Next Steps (After Setup)

Once all checkboxes above are done:

1. **Component Migration** (when ready)
   - Read: SUPABASE_MIGRATION_GUIDE.md
   - Section: Component Migration

2. **Data Migration** (optional)
   - Migrate localStorage data to Supabase
   - Follow data migration script (coming soon)

3. **Test Features**
   - Sign up a test user
   - Create a business profile
   - Verify data persists across sessions

---

## Quick Reference

### Where to find Supabase keys
1. Go to Supabase Dashboard
2. Click Settings (gear icon, bottom left)
3. Click API
4. Find:
   - **Project URL** → Copy to VITE_SUPABASE_URL
   - **API Keys → anon public** → Copy to VITE_SUPABASE_ANON_KEY

### SQL Script Location
- File: `scripts/000_fundready_schema.sql`
- Copy entire file
- Paste in: Supabase Dashboard → SQL Editor

### Environment Variables Location
- v0 Interface: Settings (gear icon) → Vars
- Or: `.env.local` file

---

**Status**: Ready for setup ✅  
**Time**: ~15 minutes total  
**Difficulty**: Easy (mostly copy/paste)  

Start with Step 1 above when ready!
