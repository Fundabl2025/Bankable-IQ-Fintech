# 🔧 Foundation Questions Updates Required

## Summary of Changes Needed

Due to file size limitations, here are the specific changes needed to `/src/app/pages/business-assessment/FoundationQuestions.tsx`:

---

## ✅ CHANGES TO MAKE:

### 1. **Q_F2: ADD Business Contact Information**

**Current:** Only asks for Business Name + Entity Type

**New:** Should ask for:
- Business Legal Name
- Business Address
- City
- State (dropdown)
- Zip Code
- Business Phone Number
- Entity Type

**Implementation:**
```typescript
// Add US_STATES constant
const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

// Update isValid check
const isValid = (data.businessName || '').trim() && 
                (data.businessAddress || '').trim() &&
                (data.businessCity || '').trim() &&
                data.businessState &&
                (data.businessZip || '').trim() &&
                (data.businessPhone || '').trim() &&
                data.entityType;

// Add new input fields before Entity Type section
```

---

### 2. **Q_F3: EXPAND Industry Dropdown**

**Current:** 6 basic options

**New:** 35+ comprehensive industry options:

```typescript
const industries = [
  'Accounting, Tax Preparation, Bookkeeping',
  'Advertising, Marketing, Public Relations',
  'Agriculture, Farming, Ranching',
  'Architecture, Engineering, Surveying',
  'Automotive Sales, Service, Repair',
  'Beauty Salon, Barbershop, Spa',
  'Childcare, Daycare Services',
  'Cleaning Services (Commercial or Residential)',
  'Computer Services, IT, Software Development',
  'Construction, Contracting, Remodeling',
  'Consulting, Business Services',
  'Dental Practice',
  'E-commerce, Online Retail',
  'Education, Tutoring, Training',
  'Entertainment, Events, Production',
  'Financial Services, Insurance',
  'Fitness Center, Gym, Personal Training',
  'Food & Beverage Manufacturing',
  'Freight, Trucking, Logistics',
  'Healthcare, Medical Practice',
  'Home Services (Plumbing, Electrical, HVAC)',
  'Hospitality, Hotels, Lodging',
  'Landscaping, Lawn Care',
  'Legal Services, Law Firm',
  'Manufacturing, Production',
  'Pet Services, Veterinary',
  'Photography, Videography',
  'Property Management, Real Estate',
  'Restaurant, Food Service, Catering',
  'Retail Store (Brick & Mortar)',
  'Security Services',
  'Technology, Telecommunications',
  'Transportation, Taxi, Rideshare',
  'Wholesale, Distribution',
  'Other',
];
```

**Also Update:**
- Question title: "When did your business legally start operating, and what is your **major industry focus**?"
- Label: "Major Industry Focus" (instead of just "Industry")

---

### 3. **Q_F4: UPDATE Website Instructions**

**Current:** Placeholder says "https://your-business.com"

**New:** 
- Placeholder: `"bestcars.com"`
- Input type: `text` (not `url`)
- Add helper text below input:

```typescript
<div style={{
  marginTop: '8px',
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontStyle: 'italic',
}}>
  Enter without http:// or www (e.g., bestcars.com)
</div>
```

---

### 4. **Q_F5: UPDATE Slider Maximums**

**Current Values:**
- Monthly Revenue: max $150K
- CC Sales: max $100K

**New Values:**
- Monthly Revenue: max **$300,000,000** (step: 100000)
- CC Sales: max **$1,000,000** (step: 10000)

**Update formatCurrency function:**
```typescript
const formatCurrency = (val: number) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
};
```

**Update Labels:**
- "Average Gross Monthly Revenue" (add "Gross")
- "Total Monthly Credit Card Sales" (add "Total")

**Update max label:**
- Revenue: `<span>$300M</span>`
- CC Sales: `<span>$1M</span>`

---

### 5. **Q_F7: UPDATE Asset Slider Maximums**

**Current Values:**
- AR Balance: max $500K
- Equipment: max $1M
- Purchase Orders: max $500K

**New Values:**
- AR Balance: max **$20,000,000** (step: 50000)
- Equipment: max **$20,000,000** (step: 50000)
- Purchase Orders: max **$20,000,000** (step: 50000)

**Update Labels:**
- AR: "Amount Owed to You by Other Businesses" (more descriptive)
- Equipment: "Total Value of Equipment Owned Outright"
- PO: "Current Amount of Purchase Orders"

**Add helper text for PO:**
```typescript
<div style={{
  marginTop: '6px',
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  color: 'var(--text-muted)',
  fontStyle: 'italic',
}}>
  Actual open business purchase orders, not contracts
</div>
```

**Update max labels:**
- All three: `<span>$20M</span>`

---

## 🔑 KEY TECHNICAL DETAILS:

### New Fields in Data Model (already added to types.ts):
✅ `businessAddress: string`
✅ `businessCity: string`
✅ `businessState: string`
✅ `businessZip: string`
✅ `businessPhone: string`

These exist in the type definition but need to be used in Q_F2.

---

## 📊 VALIDATION UPDATES:

**Q_F2 validation must include all new fields:**
```typescript
const isValid = (data.businessName || '').trim() && 
                (data.businessAddress || '').trim() &&
                (data.businessCity || '').trim() &&
                data.businessState &&
                (data.businessZip || '').trim() &&
                (data.businessPhone || '').trim() &&
                data.entityType;
```

---

## 🎯 QUICK REFERENCE - What Each Question Now Contains:

**Q_F1:** Owner Contact (First, Last, Email, Phone) ✅ ALREADY CORRECT

**Q_F2:** Business Legal Name, Business Address (street, city, state, zip), Business Phone, Entity Type ← **NEEDS UPDATE**

**Q_F3:** Start Date, Expanded Industry Dropdown ← **NEEDS INDUSTRY EXPANSION**

**Q_F4:** EIN, Website Domain (without http/www) ← **NEEDS INSTRUCTION UPDATE**

**Q_F5:** Revenue slider ($0-$300M), CC Sales slider ($0-$1M) ← **NEEDS MAX UPDATE**

**Q_F6:** Banking (account type, age, balance) ✅ ALREADY CORRECT

**Q_F7:** NSFs, AR slider ($0-$20M), Equipment slider ($0-$20M), PO slider ($0-$20M), Property ← **NEEDS MAX UPDATE**

**Q_F8:** Personal Credit (3 bureaus) ✅ ALREADY CORRECT

**Q_F9:** Utilization, Personal Income ✅ ALREADY CORRECT

**Q_F10:** Bankruptcy, Derogatories ✅ ALREADY CORRECT

**Q_F11:** Business Credit, Inquiries ✅ ALREADY CORRECT

---

## 🚀 IMPLEMENTATION PRIORITY:

1. **Q_F2** - Add business contact fields (HIGH PRIORITY - missing required data)
2. **Q_F5** - Update revenue slider max to $300M (HIGH PRIORITY - affects calculations)
3. **Q_F7** - Update asset slider maxes to $20M (HIGH PRIORITY - affects product eligibility)
4. **Q_F3** - Expand industry dropdown (MEDIUM PRIORITY - better UX)
5. **Q_F4** - Update website instructions (LOW PRIORITY - cosmetic)

---

## ⚠️ DON'T FORGET:

After updating FoundationQuestions.tsx, also update:

1. `/src/app/pages/business-assessment/types.ts` - Ensure all new fields have default values in `getDefaultAnswers()`

2. `/src/app/pages/business-assessment/UnifiedAssessment.tsx` - Ensure `getDefaultAnswers()` includes:
```typescript
businessAddress: '',
businessCity: '',
businessState: '',
businessZip: '',
businessPhone: '',
```

3. Update any scoring/calculation logic that uses these fields

4. Update Results page if it displays any of these new fields

---

## 📝 TESTING CHECKLIST:

After making changes:

- [ ] Q_F2 validates all 6 business contact fields
- [ ] State dropdown shows all 50 US states
- [ ] Revenue slider goes up to $300M with smooth formatting
- [ ] CC sales slider goes up to $1M
- [ ] All 3 asset sliders go up to $20M
- [ ] Industry dropdown has 35+ options
- [ ] Website placeholder says "bestcars.com"
- [ ] Website has helper text about no http://
- [ ] Currency formatting works for millions (e.g., "$5.2M")
- [ ] Data persists correctly in localStorage
- [ ] Results page can access all new fields

---

## 💡 WHY THESE CHANGES MATTER:

**Business Contact Fields:**
- Lenders require full business address for verification
- Business phone separate from owner phone for professionalism
- State is needed for state-specific lending programs

**Higher Slider Maxes:**
- $300M revenue accommodates larger businesses
- $20M assets unlock commercial/enterprise products
- Better represents actual business scale

**Expanded Industries:**
- More accurate risk assessment
- Industry-specific product matching
- Better underwriting precision

**Website Domain Format:**
- Easier for users (no protocol confusion)
- Standardized format for verification
- Matches industry best practices

