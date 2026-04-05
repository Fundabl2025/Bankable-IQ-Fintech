# MIGRATIONS.md — FundReady Schema and Scoring Migration Standards

> A schema change without a migration plan is a data integrity risk. A scoring change without a version bump is a trust risk.

---

## Two Types of Migrations

1. **Assessment Schema Migrations** — changes to `UnifiedAnswers` in `types.ts`
2. **Scoring Migrations** — changes to `computeScore()` or `computeExtendedResults()` semantics

Both require explicit review before implementation. Never skip this.

---

## Assessment Schema Migration Protocol

### Current schema state

`UnifiedAnswers` is a flat object. The target architecture (roadmap) is a grouped schema aligned to the 6 C's lender framework:

```typescript
// Target grouped schema (not yet implemented)
interface UnifiedAnswers {
  character: CharacterDomain;    // credit score, utilization, derogatory history
  capacity: CapacityDomain;      // DSCR, DTI, revenue trends
  capital: CapitalDomain;        // reserves, liquidity, equity
  collateral: CollateralDomain;  // assets, property, equipment
  conditions: ConditionsDomain;  // business age, industry, entity type
  cashFlow: CashFlowDomain;      // bank statements, revenue stability
}
```

**Until this migration is executed, new fields must be added to the flat `UnifiedAnswers` with:**
1. An optional type (`fieldName?: type`)
2. A backward-compatibility default in `engine.ts` (`answers.fieldName ?? defaultValue`)
3. A migration entry in this file

### Before adding any new field to `UnifiedAnswers`

Answer these questions:
1. Does a similar field already exist? (check types.ts before adding)
2. Will existing users with saved assessments be affected?
3. Does `computeScore()` need to handle the missing field gracefully?
4. Does the field need to appear in `TESTING.md` fixtures?

### Migration Entry Format

```markdown
## SCHEMA-[number] — [field name]
- **Date:**
- **Field added:** `fieldName: type` (optional)
- **Default value:** what engine uses when field is missing
- **Affects scoring:** yes / no
- **Backward compatible:** yes / no — explain if no
- **Tested with:** weak / strong / borderline fixture profiles
```

---

## Scoring Version Protocol

### When to bump the scoring version

A scoring version bump is **required** when any of the following change:

- Score band thresholds (0–199, 200–399, etc.)
- Weight of any scoring dimension
- New dimension added to score calculation
- Removal of any scoring input
- Change to bankable status logic
- Change to readiness state definitions

A scoring version bump is **not required** for:
- Copy changes that describe the score
- UI changes to how the score is displayed
- New tools that don't affect the engine
- Bug fixes that correct wrong behavior to match documented intent

### Version constant location

```typescript
// engine.ts
export const SCORING_VERSION = 'v1.0';
```

### Version bump format: `vMAJOR.MINOR`

- Major bump: score semantics change (existing stored scores may be reinterpreted differently)
- Minor bump: new dimension added or weight adjusted (stored scores remain valid but incomplete)

### Version log

```markdown
## v1.0 — Initial scoring engine
- Date: 2024 (approximate)
- Dimensions: credit score band, utilization, entity age, derogatory history
- Bankable threshold: FundScore 600+
- Notes: Character-heavy. Capacity, Capital, Collateral, Conditions, Cash Flow not yet weighted.

## v1.1 — DSCR dimension added (roadmap)
- Adds net operating income / debt service ratio as Capacity signal
- Backward compat: missing DSCR field defaults to neutral (no penalty, no boost)
- Score semantics: unchanged for users without DSCR data

## v1.2 — DTI dimension added (roadmap)
- Adds debt-to-income ratio as secondary Capacity signal
- Backward compat: missing DTI defaults to neutral
```

---

## localStorage Migration Handling

When `UnifiedAnswers` schema changes, users with old saved data will have partial objects. The engine must always handle this gracefully.

**Rule:** Every new field access in `engine.ts` must use a nullish coalescing default:
```typescript
const dscr = answers.dscr ?? null;
const hasCapacityData = dscr !== null;
```

Never assume a field exists. Never throw on missing fields. Degrade gracefully.

---

## Supabase Migration Protocol (when live)

For database schema changes:
1. Write the migration SQL in `/migrations/` folder (timestamped filename)
2. Test in Supabase staging branch before applying to production
3. Run `generate_typescript_types` after migration to keep types in sync
4. Confirm localStorage and Supabase schemas remain compatible

---

## Schema Migration Log

---

### SCHEMA-001 — NOI and Debt Service fields (Capacity)
- **Date:** 2025-02-23
- **Fields added:** `noi?: number`, `debtService?: number`, `noiBand?: string`, `debtServiceBand?: string`
- **Default value:** Engine skips DSCR calculation if either field is null
- **Affects scoring:** Adds Capacity dimension when present; neutral when absent
- **Backward compatible:** Yes — optional fields, graceful defaults

---

*Add new schema entries below this line.*

---

*See also: ENGINEERING.md · TESTING.md · RELEASES.md*
