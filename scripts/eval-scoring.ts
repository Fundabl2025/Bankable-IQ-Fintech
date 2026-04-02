// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Fixture-Based Scoring Eval Harness
//
// Usage:
//   npm run eval
//
// What it does:
//   1. Loads each JSON fixture from fixtures/assessments/
//   2. Strips _meta before passing to computeScore()
//   3. Asserts actual score is within expected_score_range
//   4. Asserts actual band name matches expected_band
//   5. Asserts derived readiness state matches expected_readiness_state
//   6. Prints pass/fail per persona with score details
//   7. Exits with code 1 if any persona fails
//
// Notes:
//   - expected_readiness_state in _meta is a human descriptor with no
//     corresponding runtime function in engine.ts. It is derived here from
//     band name via BAND_TO_READINESS_STATE. If engine adds a dedicated
//     getReadinessState() function, replace the derivation with that call.
//   - This script has zero impact on the production bundle. vite-node is
//     a devDependency only.
// ════════════════════════════════════════════════════════════════════════════════

import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { computeScore, getBand, SCORING_VERSION } from '../src/app/pages/business-assessment/engine';
import type { UnifiedAnswers } from '../src/app/pages/business-assessment/types';

// ── Band → readiness state mapping ───────────────────────────────────────────
// Derived from _meta values across all 5 fixtures. No runtime function exists.
// Update this map if new bands are added to getBand() in engine.ts.
const BAND_TO_READINESS_STATE: Record<string, string> = {
  'Critical':   'needs_foundation',
  'Low':        'needs_repair',
  'Developing': 'foundation_building',
  'Approaching':'momentum_building',
  'Ready':      'bankable_or_near',
  'Prime':      'bankable_or_near',
};

// ── Fixture meta type ─────────────────────────────────────────────────────────
interface FixtureMeta {
  persona_name: string;
  description: string;
  expected_score_range: [number, number];
  expected_band: string;
  expected_readiness_state: string;
}

interface Fixture extends UnifiedAnswers {
  _meta: FixtureMeta;
}

// ── Result tracking ───────────────────────────────────────────────────────────
interface EvalResult {
  persona: string;
  pass: boolean;
  actualScore: number;
  expectedRange: [number, number];
  rangePass: boolean;
  actualBand: string;
  expectedBand: string;
  bandPass: boolean;
  actualReadiness: string;
  expectedReadiness: string;
  readinessPass: boolean;
  scoringVersion: string;
}

// ── Run eval ──────────────────────────────────────────────────────────────────
const fixtureDir = resolve(process.cwd(), 'fixtures/assessments');
const files = readdirSync(fixtureDir)
  .filter(f => f.endsWith('.json'))
  .sort();

const results: EvalResult[] = [];

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`  FundReady™ Scoring Eval — SCORING_VERSION: ${SCORING_VERSION}`);
console.log(`  ${files.length} fixtures\n`);

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(fixtureDir, file), 'utf-8')) as Fixture;

  // Strip _meta before passing to computeScore
  const { _meta, ...answers } = raw;
  const meta = _meta as FixtureMeta;

  // Run scoring
  const scoreResult = computeScore(answers as UnifiedAnswers);
  const band = getBand(scoreResult.score);

  // Derive readiness state from band
  const derivedReadiness = BAND_TO_READINESS_STATE[band.name] ?? 'unknown';

  // Assertions
  const [lo, hi] = meta.expected_score_range;
  const rangePass = scoreResult.score >= lo && scoreResult.score <= hi;
  const bandPass = band.name === meta.expected_band;
  const readinessPass = derivedReadiness === meta.expected_readiness_state;
  const pass = rangePass && bandPass && readinessPass;

  const result: EvalResult = {
    persona:          meta.persona_name,
    pass,
    actualScore:      scoreResult.score,
    expectedRange:    meta.expected_score_range,
    rangePass,
    actualBand:       band.name,
    expectedBand:     meta.expected_band,
    bandPass,
    actualReadiness:  derivedReadiness,
    expectedReadiness: meta.expected_readiness_state,
    readinessPass,
    scoringVersion:   scoreResult.scoringVersion,
  };
  results.push(result);

  // ── Per-persona output ──
  const status = pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}  ${meta.persona_name}`);
  console.log(`       score:     ${scoreResult.score} ${rangePass ? '✓' : '✗'} (expected [${lo}–${hi}])`);
  console.log(`       band:      ${band.name} ${bandPass ? '✓' : '✗'} (expected ${meta.expected_band})`);
  console.log(`       readiness: ${derivedReadiness} ${readinessPass ? '✓' : '✗'} (expected ${meta.expected_readiness_state})`);
  console.log(`       version:   ${scoreResult.scoringVersion}`);
  if (!pass) {
    if (!rangePass)     console.log(`       ⚠ RANGE FAIL — score ${scoreResult.score} outside [${lo}, ${hi}]`);
    if (!bandPass)      console.log(`       ⚠ BAND FAIL  — got "${band.name}", expected "${meta.expected_band}"`);
    if (!readinessPass) console.log(`       ⚠ STATE FAIL — got "${derivedReadiness}", expected "${meta.expected_readiness_state}"`);
  }
  console.log('');
}

// ── Summary ───────────────────────────────────────────────────────────────────
const passed = results.filter(r => r.pass).length;
const failed = results.filter(r => !r.pass).length;

console.log('════════════════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed out of ${results.length} fixtures`);

if (failed > 0) {
  console.log('\n  Failed personas:');
  results
    .filter(r => !r.pass)
    .forEach(r => {
      console.log(`    • ${r.persona}: score=${r.actualScore} band=${r.actualBand}`);
    });
  console.log('\n  To investigate: check _meta.expected_score_range in the fixture');
  console.log('  and compare against engine.ts getBand() thresholds.\n');
  process.exit(1);
}

console.log('\n  All fixtures pass. Scoring engine output is within expected ranges.\n');
process.exit(0);
