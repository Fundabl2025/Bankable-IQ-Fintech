# Funding Program Page Update Pattern

This document provides the pattern for updating all individual funding program pages to support dynamic locked/unlocked states based on pre-qualification status.

## ✅ COMPLETED Programs (5 of 17)
- ✅ BusinessCreditCards.tsx
- ✅ BusinessCreditLine.tsx  
- ✅ BusinessTermLoan.tsx
- ✅ AccountsReceivableFinance.tsx
- ✅ EquipmentFinancing.tsx

## ⏳ REMAINING Programs (12 of 17)
- ⏳ BridgeLoans.tsx
- ⏳ ConstructionLoans.tsx
- ⏳ CreditUnionLoans.tsx
- ⏳ DSCRLoans.tsx
- ⏳ InventoryLineOfCredit.tsx
- ⏳ MerchantAdvance.tsx
- ⏳ PersonalCreditCards.tsx
- ⏳ PurchaseOrderFinance.tsx
- ⏳ ReceivableFactoring.tsx
- ⏳ RevenueBasedLoan.tsx
- ⏳ SBABusinessLoan.tsx
- ⏳ WorkingCapitalLoans.tsx

## Update Pattern

### 1. Add Imports
```typescript
import { Lock, Target } from 'lucide-react';
import { FundingProgramHeader } from '../../components/FundingProgramHeader';
import { isProgramPreQualified, getFundingPrograms } from '../../utils/fundingEligibility';
import { RequirementsGapModal } from '../../components/RequirementsGapModal';
```

### 2. Add State Variables
```typescript
const [isGapModalOpen, setIsGapModalOpen] = useState(false);

// Check if user is pre-qualified
const isPreQualified = isProgramPreQualified('PROGRAM_ID_HERE');
const allPrograms = getFundingPrograms();
const programData = allPrograms.find(p => p.id === 'PROGRAM_ID_HERE');
```

### 3. Replace Header Section
Replace the hardcoded header `<motion.div>` with:
```typescript
<FundingProgramHeader
  programId="PROGRAM_ID_HERE"
  icon={IconComponent}
  title="Program Title"
  description="Program description"
  amount="Funding Amount"
  onApplyClick={() => setIsModalOpen(true)}
/>
```

### 4. Replace Action Buttons
Replace the bottom action buttons with:
```typescript
{isPreQualified ? (
  <>
    <Button
      size="lg"
      onClick={() => setIsModalOpen(true)}
      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-lg px-8 py-6 shadow-lg"
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
```

### 5. Add Gap Modal Before Closing
```typescript
<RequirementsGapModal
  isOpen={isGapModalOpen}
  onClose={() => setIsGapModalOpen(false)}
  programData={programData}
/>
```

## Program ID Mapping
- business-credit-cards → BusinessCreditCards.tsx
- business-credit-line → BusinessCreditLine.tsx
- business-term-loan → BusinessTermLoan.tsx
- credit-union-loans → CreditUnionLoans.tsx
- equipment-financing → EquipmentFinancing.tsx
- merchant-advance → MerchantAdvance.tsx
- personal-credit-cards → PersonalCreditCards.tsx
- receivable-factoring → ReceivableFactoring.tsx
- revenue-based-loan → RevenueBasedLoan.tsx
- working-capital-loans → WorkingCapitalLoans.tsx
- sba-business-loan → SBABusinessLoan.tsx
- accounts-receivable-finance → AccountsReceivableFinance.tsx
- purchase-order-finance → PurchaseOrderFinance.tsx
- inventory-line-of-credit → InventoryLineOfCredit.tsx
- bridge-loans → BridgeLoans.tsx
- dscr-loans → DSCRLoans.tsx
- construction-loans → ConstructionLoans.tsx