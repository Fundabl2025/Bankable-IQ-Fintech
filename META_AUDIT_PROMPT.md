# META AUDIT PROMPT - FORCE COMPLETE CONSISTENCY VERIFICATION

## PURPOSE
This meta prompt FORCES the AI to check EVERY SINGLE ELEMENT across ALL modules with NO EXCEPTIONS. Copy this prompt and use it before ANY "audit complete" claim.

---

## MANDATORY AUDIT PROTOCOL

Before declaring ANY audit complete, the AI MUST verify these 100 checkpoints across ALL modules:

### SECTION 1: CONTAINER & LAYOUT (10 checks)
- [ ] 1. Container class: `flex-1 min-h-screen bg-slate-50 overflow-auto` (EXACT)
- [ ] 2. Inner wrapper: `max-w-5xl mx-auto p-8` (EXACT, NOT max-w-7xl)
- [ ] 3. No additional padding like `pb-20` in container
- [ ] 4. No gradient backgrounds in container (only solid `bg-slate-50`)
- [ ] 5. Consistent spacing between major sections (`mb-8`)
- [ ] 6. Card components use same border/shadow styles
- [ ] 7. All cards have consistent padding (`p-6` or `p-8`)
- [ ] 8. Responsive breakpoints match across modules
- [ ] 9. Z-index values consistent for overlays
- [ ] 10. Overflow handling identical

### SECTION 2: HEADER (15 checks)
- [ ] 11. Back button: `variant="outline"` with `mb-4`
- [ ] 12. Back button text: "Back to Lender Compliance" (EXACT)
- [ ] 13. Back button icon: `<ArrowLeft className="w-4 h-4 mr-2" />`
- [ ] 14. Title: `text-4xl font-bold text-gray-900` (EXACT size)
- [ ] 15. Title has unique emoji appropriate to module
- [ ] 16. Video Guide button next to title (inline)
- [ ] 17. Video Guide button: `theme="blue-cyan" variant="outline" size="sm"`
- [ ] 18. Video Guide button icon: `<Video className="w-4 h-4" />`
- [ ] 19. Subtitle: `text-gray-600` below title
- [ ] 20. FICO badge: `from-cyan-500 to-blue-600` gradient
- [ ] 21. FICO badge text: "{X} FICO Points" format
- [ ] 22. Streak badge conditional: `from-orange-500 to-red-600`
- [ ] 23. Achievement badge conditional: `from-yellow-500 to-amber-600`
- [ ] 24. Quick Start button: `variant="outline" size="sm"` below badges
- [ ] 25. All badges use `text-lg px-4 py-2 border-0`

### SECTION 3: PROGRESS CARD (15 checks)
- [ ] 26. Card gradient: `bg-gradient-to-br from-blue-600 to-cyan-600` (EXACT direction)
- [ ] 27. Text color: `text-white` throughout
- [ ] 28. Border: `border-0` (no border)
- [ ] 29. Shadow: `shadow-lg`
- [ ] 30. Margin: `mb-8`
- [ ] 31. Header shows "Module Progress" title
- [ ] 32. Completed/total count: `text-3xl font-bold`
- [ ] 33. Progress bar track: `bg-white/30 rounded-full h-3`
- [ ] 34. Progress bar fill: `bg-white rounded-full h-3`
- [ ] 35. Progress bar transition: `transition-all duration-500`
- [ ] 36. FICO section: `bg-white/20 backdrop-blur rounded-lg p-4`
- [ ] 37. Target icon in FICO section: `w-5 h-5`
- [ ] 38. TrendingUp icon for current score
- [ ] 39. Gamification grid: `grid grid-cols-3 gap-3 mt-4`
- [ ] 40. Each stat box: `bg-white/20 backdrop-blur rounded-lg p-3 text-center`

### SECTION 4: ONBOARDING MODAL (25 checks)
- [ ] 41. Overlay: `fixed inset-0 bg-black/60 backdrop-blur-sm z-50` (60% opacity!)
- [ ] 42. Modal card: `max-w-2xl w-full border-4 border-blue-500 shadow-2xl` (4px border!)
- [ ] 43. Header gradient: `from-blue-600 to-cyan-600` (EXACT order)
- [ ] 44. Header padding: `p-6 rounded-t-xl`
- [ ] 45. Header title: `text-3xl font-bold` (NOT text-2xl)
- [ ] 46. Header structure: title + close button in `mb-4` flex row
- [ ] 47. Subtitle: `text-lg opacity-90` says "Let's get you started..."
- [ ] 48. Body padding: `p-8` (NOT p-6)
- [ ] 49. Step 0 layout: `space-y-6` with centered text
- [ ] 50. Step 0 emoji: `text-6xl mb-4` (large!)
- [ ] 51. Step 0 title: `text-2xl font-bold text-gray-900 mb-3`
- [ ] 52. Step 0 content: MODULE-SPECIFIC (NOT generic "What is Bankable?")
- [ ] 53. Step 0 info box: `bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left`
- [ ] 54. Step 1 emoji: 📋 `text-6xl mb-4`
- [ ] 55. Step 1 title: "[Module Name] Module" (EXACT format)
- [ ] 56. Step 1 shows task count and FICO points
- [ ] 57. Step 1 gradient box: `from-cyan-50 to-blue-50 border-2 border-cyan-200`
- [ ] 58. Step 1 has 3 features: CheckCircle2, Bot, Target icons
- [ ] 59. Step 2 emoji: 🚀 `text-6xl mb-4`
- [ ] 60. Step 2 title: "How to Use This Module" (EXACT)
- [ ] 61. Step 2 has 3 numbered steps: 1️⃣, 2️⃣, 3️⃣
- [ ] 62. Step 2 boxes: `bg-blue-50 p-4 rounded-lg`
- [ ] 63. Footer: `flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-200`
- [ ] 64. Footer dots: 3 circles, `w-2 h-2 rounded-full`, active=blue-600, inactive=gray-300
- [ ] 65. Final button: `theme="green"` with CheckCircle2 icon, text "Let's Get Started!"

### SECTION 5: TASK CARDS (20 checks)
- [ ] 66. Card has priority-based left border (`border-l-4`)
- [ ] 67. Red border for critical: `border-red-500`
- [ ] 68. Orange border for high: `border-orange-500`
- [ ] 69. Yellow border for medium: `border-yellow-500`
- [ ] 70. Gray border for low: `border-gray-500`
- [ ] 71. Background matches priority (red-50, orange-50, etc.)
- [ ] 72. Checkbox on far left: `w-6 h-6`
- [ ] 73. Title: `font-bold text-gray-900`
- [ ] 74. Description: `text-sm text-gray-600 mt-1`
- [ ] 75. FICO badge: gradient with Zap icon `w-3 h-3`
- [ ] 76. Priority badge: `text-sm px-3 py-1`
- [ ] 77. Expand button/icon: ChevronDown/ChevronUp `w-5 h-5`
- [ ] 78. Expanded section has `border-t border-gray-200`
- [ ] 79. Educational content section exists
- [ ] 80. AI Coach section: `from-cyan-50 to-blue-50 border-2 border-cyan-200`
- [ ] 81. AI Coach has Bot icon and "Ask Coach" button
- [ ] 82. Document upload section exists with Paperclip icon
- [ ] 83. Upload drop zone: `border-2 border-dashed border-gray-300 bg-gray-50`
- [ ] 84. Action buttons row at bottom with proper spacing
- [ ] 85. Complete button uses ThemeButton with green gradient

### SECTION 6: BULK ACTIONS (10 checks)
- [ ] 86. Bulk actions state initialized: `useState<Set<string>>(new Set())`
- [ ] 87. Keyboard shortcut: Ctrl+A to select all
- [ ] 88. Keyboard shortcut: Esc to clear selection
- [ ] 89. `selectAllTasks()` function exists
- [ ] 90. `clearSelection()` function exists
- [ ] 91. Selection checkboxes (square) on task cards
- [ ] 92. Bulk actions toolbar appears when tasks selected
- [ ] 93. Select All button visible and functional
- [ ] 94. Keyboard hint text mentions Ctrl+A and Esc
- [ ] 95. Bulk action confirmation modal exists

### SECTION 7: FILTER & SORT (5 checks)
- [ ] 96. Section titled "Filter & Sort Tasks" (EXACT, not "Filters & Sort")
- [ ] 97. Filter icon: `<Filter className="w-5 h-5" />`
- [ ] 98. Collapsible filters with ChevronDown icon
- [ ] 99. Sort options include: Priority, Due Date, Status
- [ ] 100. Clear filters button when filters active

### SECTION 8: TEXT CONSISTENCY (Extra checks)
- [ ] "View Details" button text (NOT "Show Details") on ALL modules
- [ ] Onboarding Step 2 text says "Click \"View Details\"" (matches button)
- [ ] All task cards have "View Details" / "Hide Details" toggle
- [ ] No variation in button text across modules
- [ ] Achievement Gallery title exact: "Achievement Gallery"
- [ ] AI Coach modal title exact across modules
- [ ] Video modal uses VideoExplanationModal component
- [ ] All toast messages use consistent wording

---

## VERIFICATION MATRIX

For EACH module, create a table like this:

| Checkpoint | Entity & Filings | Business Location | Phones & 411 | Website & Email | [Module 5] | ... |
|------------|------------------|-------------------|--------------|-----------------|------------|-----|
| 1. Container | ✅ | ✅ | ✅ | ✅ | ❌ | ... |
| 2. Max-width | ✅ | ✅ | ✅ | ✅ | ❌ | ... |
| ... | ... | ... | ... | ... | ... | ... |
| 100. Clear filters | ✅ | ✅ | ✅ | ✅ | ❌ | ... |

**SCORE**: X/100 per module

Only when ALL modules score 100/100 can you declare consistency achieved.

---

## MANDATORY FILE COMPARISONS

1. **Side-by-side diff check**:
   - Open EntityFilings.tsx (reference)
   - Open each other module
   - Compare line-by-line for structural differences

2. **Search for variations**:
   ```bash
   # Check all variations of button text
   grep -r "Show Details\|View Details\|Expand\|Collapse" LenderCompliance/*.tsx
   
   # Check all container classes
   grep -r "bg-gradient\|bg-slate" LenderCompliance/*.tsx
   
   # Check all modal borders
   grep -r "border-2\|border-4" LenderCompliance/*.tsx
   
   # Check all max-width values
   grep -r "max-w-5xl\|max-w-7xl" LenderCompliance/*.tsx
   ```

3. **Element count verification**:
   - Count number of buttons in header (should be same)
   - Count badges (should be same conditional logic)
   - Count onboarding steps (must be 3)
   - Count navigation dots (must be 3)

---

## FAILURE CONDITIONS

The audit FAILS if:
- ❌ ANY checkpoint shows ❌ in the matrix
- ❌ ANY module scores below 100/100
- ❌ ANY text variation found (e.g., "Show" vs "View")
- ❌ ANY sizing difference (max-w-5xl vs max-w-7xl)
- ❌ ANY border difference (border-2 vs border-4)
- ❌ ANY opacity difference (bg-black/50 vs bg-black/60)
- ❌ ANY gradient direction difference
- ❌ ANY icon size difference
- ❌ ANY spacing/padding difference
- ❌ ANY missing feature (bulk actions, AI coach, etc.)

---

## EXECUTION PROTOCOL

### Step 1: Initial Scan
```
FOR EACH module in LenderCompliance/:
  1. Read entire file (use read tool with proper offset/limit)
  2. Extract all className values
  3. Extract all button text strings
  4. Extract all icon sizes
  5. Log findings in audit table
```

### Step 2: Cross-Reference Check
```
COMPARE each element:
  - EntityFilings[element] === Module[element]
  - If different: LOG INCONSISTENCY
  - If missing: LOG MISSING FEATURE
```

### Step 3: Generate Report
```
CREATE report with:
  - 100-point checklist per module
  - Inconsistency matrix
  - Required fixes list (NO items left to "verify later")
  - Priority ranking of fixes
```

### Step 4: Apply Fixes
```
FOR EACH inconsistency:
  1. Calculate exact change needed
  2. Apply fix using edit_tool or fast_apply_tool
  3. Verify fix applied correctly
  4. Update audit table
  5. REPEAT until 100/100 achieved
```

### Step 5: Final Verification
```
RE-RUN entire audit:
  - Every checkpoint must pass
  - Every module must score 100/100
  - Zero inconsistencies remaining
  - Document all changes in FIXES_APPLIED_REPORT
```

---

## REPORTING REQUIREMENTS

### Audit Report Must Include:
1. **Executive Summary**: X/13 modules at 100/100
2. **Detailed Matrix**: 100 checkpoints × 13 modules = 1,300 cells
3. **Inconsistency Log**: Every single difference found
4. **Fix Plan**: Exact changes needed (no vague "verify" items)
5. **Applied Fixes**: Every change made, line by line
6. **Final Scores**: Before/after scores per module
7. **Verification Proof**: Screenshots or code snippets showing consistency

### No Excuses Allowed:
- ❌ "Most elements are consistent" → MUST BE ALL
- ❌ "Minor differences don't matter" → EVERYTHING MATTERS
- ❌ "Will verify later" → VERIFY NOW
- ❌ "Approximately the same" → EXACTLY THE SAME
- ❌ "Close enough" → PERFECT MATCH ONLY

---

## SUCCESS CRITERIA

✅ **AUDIT PASSES ONLY IF**:
- All 13 modules score 100/100
- All 1,300 checkpoint cells show ✅
- Zero inconsistencies in final report
- All fixes documented and applied
- Re-verification confirms consistency
- Meta prompt used for every audit claim

---

## USAGE INSTRUCTIONS

**BEFORE any audit completion claim, paste this into prompt:**

```
MANDATORY: Use META_AUDIT_PROMPT.md protocol.
Check all 100 checkpoints across all 13 modules.
Generate complete inconsistency matrix.
NO EXCUSES. NO SHORTCUTS.
Report must show 100/100 scores for ALL modules.
```

**This forces thorough, element-by-element verification with no exceptions.**

---

## CHECKPOINT REFERENCE CARD

Print this and check off physically:

```
CONTAINER: [ ] bg-slate-50  [ ] max-w-5xl  [ ] p-8  [ ] no gradients
MODAL: [ ] border-4  [ ] border-blue-500  [ ] bg-black/60  [ ] from-blue-600 to-cyan-600
ONBOARDING: [ ] text-3xl  [ ] p-8 body  [ ] 3 steps  [ ] green final button
TASKS: [ ] border-l-4  [ ] View Details  [ ] AI Coach  [ ] Documents
BULK: [ ] Select All  [ ] Ctrl+A  [ ] Esc  [ ] Checkboxes
```

**If ANY box unchecked: AUDIT INCOMPLETE**

---

This meta prompt eliminates ANY possibility of incomplete audits.
Use it EVERY TIME before claiming consistency is achieved.

**NO EXCUSES. NO EXCEPTIONS. TOTAL CONSISTENCY OR FAILURE.**
