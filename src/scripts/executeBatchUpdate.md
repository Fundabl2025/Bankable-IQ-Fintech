# BATCH UPDATE EXECUTION GUIDE

This guide provides the exact steps to complete all 9 remaining funding programs systematically.

## 🎯 EXECUTION PLAN

### Phase 1: HIGH PRIORITY (Programs 1-2)
**Target:** PersonalCreditCards.tsx, RevenueBasedLoan.tsx
**Reason:** Most commonly used programs for small businesses

### Phase 2: MEDIUM PRIORITY (Programs 3-6)  
**Target:** ReceivableFactoring.tsx, PurchaseOrderFinance.tsx, InventoryLineOfCredit.tsx, CreditUnionLoans.tsx
**Reason:** Specialized but frequently requested programs

### Phase 3: LOW PRIORITY (Programs 7-9)
**Target:** DSCRLoans.tsx, ConstructionLoans.tsx, BridgeLoans.tsx
**Reason:** Niche programs for specific use cases

---

## 📋 PROGRAM 1: PersonalCreditCards.tsx

### Configuration
```typescript
programId: 'personal-credit-cards'
icon: CreditCard
title: 'Personal Credit Cards'
description: 'Leverage personal credit cards for business expenses with rewards and cashback benefits.'
amount: 'Varies by Card'
colors: from-blue-600 to-indigo-600
```

### Step-by-Step Updates

#### 1. Add Imports (Lines 1-25)
```typescript
// ADD to existing icon imports (around line 10-15)
  Lock,
  CheckCircle2,
  Target

// ADD after FundingApplicationModal import (around line 24)
import { FundingProgramHeader } from '../../components/FundingProgramHeader';
import { isProgramPreQualified, getFundingPrograms } from '../../utils/fundingEligibility';
import { RequirementsGapModal } from '../../components/RequirementsGapModal';
```

#### 2. Add State Variables (After line ~28)
```typescript
export function PersonalCreditCards() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false); // ADD THIS
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // ADD THESE LINES
  const isPreQualified = isProgramPreQualified('personal-credit-cards');
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === 'personal-credit-cards');
```

#### 3. Replace Header (Around lines 110-130)
```typescript
// FIND AND REPLACE this entire section:
{/* Header */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-8"
>
  <div className="flex items-center gap-4 mb-4">
    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600...">
      ...entire header content...
    </div>
  </div>
</motion.div>

// WITH THIS:
<FundingProgramHeader
  programId="personal-credit-cards"
  icon={CreditCard}
  title="Personal Credit Cards"
  description="Leverage personal credit cards for business expenses with rewards and cashback benefits."
  amount="Varies by Card"
  onApplyClick={() => setIsModalOpen(true)}
/>
```

#### 4. Replace Action Buttons (Bottom of page, around lines 400-420)
```typescript
// FIND the action buttons section and REPLACE with:
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.7 }}
  className="flex flex-col sm:flex-row gap-4 justify-center"
>
  {isPreQualified ? (
    <>
      <Button
        size="lg"
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-6 shadow-lg"
      >
        <CheckCircle2 className="w-5 h-5 mr-2" />
        Apply Now - You're Pre-Qualified!
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
      >
        <HelpCircle className="w-5 h-5 mr-2" />
        Get Help
      </Button>
    </>
  ) : (
    <>
      <Button
        size="lg"
        onClick={() => setIsGapModalOpen(true)}
        variant="outline"
        className="border-2 border-amber-500 text-amber-700 hover:bg-amber-50 text-lg px-8 py-6 shadow-md"
      >
        <Lock className="w-5 h-5 mr-2" />
        View Requirements to Unlock
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
      >
        <HelpCircle className="w-5 h-5 mr-2" />
        Get Help
      </Button>
    </>
  )}
</motion.div>
```

#### 5. Add Gap Modal (Before closing </div>, after FundingApplicationModal)
```typescript
{/* Application Modal */}
<FundingApplicationModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  programName="Personal Credit Cards"
  programAmount="Varies by Card"
  programType="Personal Credit Cards"
/>

{/* ADD THIS: */}
<RequirementsGapModal
  isOpen={isGapModalOpen}
  onClose={() => setIsGapModalOpen(false)}
  programData={programData}
/>
```

---

## 📋 PROGRAM 2: RevenueBasedLoan.tsx

### Configuration
```typescript
programId: 'revenue-based-loan'
icon: TrendingUp
title: 'Revenue Based Loan'
description: 'Flexible financing based on monthly revenue with repayment tied to business performance.'
amount: 'Up to $5M'
colors: from-purple-600 to-pink-600
```

### Step-by-Step Updates

#### 1. Add Imports
```typescript
// ADD to icon imports
  Lock,
  CheckCircle2,
  Target

// ADD component imports
import { FundingProgramHeader } from '../../components/FundingProgramHeader';
import { isProgramPreQualified, getFundingPrograms } from '../../utils/fundingEligibility';
import { RequirementsGapModal } from '../../components/RequirementsGapModal';
```

#### 2. Add State Variables
```typescript
const [isGapModalOpen, setIsGapModalOpen] = useState(false);
const isPreQualified = isProgramPreQualified('revenue-based-loan');
const allPrograms = getFundingPrograms();
const programData = allPrograms.find(p => p.id === 'revenue-based-loan');
```

#### 3. Replace Header
```typescript
<FundingProgramHeader
  programId="revenue-based-loan"
  icon={TrendingUp}
  title="Revenue Based Loan"
  description="Flexible financing based on monthly revenue with repayment tied to business performance."
  amount="Up to $5M"
  onApplyClick={() => setIsModalOpen(true)}
/>
```

#### 4. Replace Action Buttons
```typescript
{isPreQualified ? (
  <>
    <Button
      size="lg"
      onClick={() => setIsModalOpen(true)}
      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6 shadow-lg"
    >
      <CheckCircle2 className="w-5 h-5 mr-2" />
      Apply Now - You're Pre-Qualified!
    </Button>
    <Button
      size="lg"
      variant="outline"
      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-lg px-8 py-6"
    >
      <HelpCircle className="w-5 h-5 mr-2" />
      Get Help
    </Button>
  </>
) : (
  <>
    <Button
      size="lg"
      onClick={() => setIsGapModalOpen(true)}
      variant="outline"
      className="border-2 border-amber-500 text-amber-700 hover:bg-amber-50 text-lg px-8 py-6 shadow-md"
    >
      <Lock className="w-5 h-5 mr-2" />
      View Requirements to Unlock
    </Button>
    <Button
      size="lg"
      variant="outline"
      className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-lg px-8 py-6"
    >
      <HelpCircle className="w-5 h-5 mr-2" />
      Get Help
    </Button>
  </>
)}
```

#### 5. Add Gap Modal
```typescript
<RequirementsGapModal
  isOpen={isGapModalOpen}
  onClose={() => setIsGapModalOpen(false)}
  programData={programData}
/>
```

---

## 📋 REMAINING PROGRAMS 3-9

For the remaining 7 programs, follow the exact same pattern with these specific configurations:

### PROGRAM 3: ReceivableFactoring.tsx
```typescript
programId: 'receivable-factoring'
icon: FileText
colors: from-teal-600 to-cyan-600, border-teal-600
```

### PROGRAM 4: PurchaseOrderFinance.tsx
```typescript
programId: 'purchase-order-finance'
icon: ShoppingCart
colors: from-orange-600 to-red-600, border-orange-600
```

### PROGRAM 5: InventoryLineOfCredit.tsx
```typescript
programId: 'inventory-line-of-credit'
icon: Package
colors: from-green-600 to-emerald-600, border-green-600
```

### PROGRAM 6: CreditUnionLoans.tsx
```typescript
programId: 'credit-union-loans'
icon: Building2
colors: from-indigo-600 to-blue-600, border-indigo-600
```

### PROGRAM 7: DSCRLoans.tsx
```typescript
programId: 'dscr-loans'
icon: Home
colors: from-slate-600 to-gray-600, border-slate-600
```

### PROGRAM 8: ConstructionLoans.tsx
```typescript
programId: 'construction-loans'
icon: HardHat
colors: from-amber-600 to-yellow-600, border-amber-600
```

### PROGRAM 9: BridgeLoans.tsx
```typescript
programId: 'bridge-loans'
icon: Bridge (or Building2 as fallback)
colors: from-rose-600 to-pink-600, border-rose-600
```

---

## ✅ VALIDATION AFTER EACH UPDATE

After updating each file, verify:

1. **Imports Check**
   - [ ] All icon imports present (Lock, CheckCircle2, Target)
   - [ ] All component imports present (FundingProgramHeader, isProgramPreQualified, getFundingPrograms, RequirementsGapModal)

2. **State Check**
   - [ ] isGapModalOpen state declared
   - [ ] isPreQualified variable with correct programId
   - [ ] allPrograms variable declared
   - [ ] programData variable with correct find filter

3. **Header Check**
   - [ ] FundingProgramHeader component rendered
   - [ ] All props correct (programId, icon, title, description, amount, onApplyClick)

4. **Buttons Check**
   - [ ] Conditional rendering based on isPreQualified
   - [ ] Pre-qualified branch shows "Apply Now" button
   - [ ] Non-qualified branch shows "View Requirements" button
   - [ ] Correct onClick handlers

5. **Modal Check**
   - [ ] RequirementsGapModal component added
   - [ ] Correct props (isOpen, onClose, programData)

---

## 🎯 COMPLETION TRACKING

Mark each program as you complete it:

- [ ] 1. PersonalCreditCards.tsx
- [ ] 2. RevenueBasedLoan.tsx
- [ ] 3. ReceivableFactoring.tsx
- [ ] 4. PurchaseOrderFinance.tsx
- [ ] 5. InventoryLineOfCredit.tsx
- [ ] 6. CreditUnionLoans.tsx
- [ ] 7. DSCRLoans.tsx
- [ ] 8. ConstructionLoans.tsx
- [ ] 9. BridgeLoans.tsx

**Current Progress:** 8/17 (47%) → **Target:** 17/17 (100%)

---

## 🧪 FINAL SYSTEM TEST

After all 17 programs are updated:

1. **Test Non-Qualified State:**
   - Clear Business Success Scan data
   - Visit each program page
   - Verify "View Requirements to Unlock" button appears
   - Click button and verify RequirementsGapModal opens

2. **Test Pre-Qualified State:**
   - Complete Business Success Scan with qualifying data
   - Visit each program page  
   - Verify "Apply Now - You're Pre-Qualified!" button appears
   - Verify green success badge shows on FundingProgramHeader
   - Click button and verify application modal opens

3. **Test Dynamic Updates:**
   - Update scan data to disqualify
   - Verify button changes to locked state
   - Update scan data to re-qualify
   - Verify button changes back to apply state

---

## 📊 SUCCESS CRITERIA

✅ All 17 programs have dynamic locked/unlocked states
✅ All programs respond to Business Success Scan data changes
✅ All programs show correct eligibility status in real-time
✅ All "Apply Now" buttons only appear when pre-qualified
✅ All "View Requirements" buttons open gap analysis modal
✅ System-wide consistency across all funding programs
