// ================================================================================
// T-13: Bankable Items Eval — verify computeBankableItems() output per persona
// Usage: pnpm run eval:bankable
// ================================================================================

import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { computeExtendedResults, SCORING_VERSION } from '../src/app/pages/business-assessment/engine';
import type { UnifiedAnswers } from '../src/app/pages/business-assessment/types';

const fixtureDir = resolve(process.cwd(), 'fixtures/assessments');
const files = readdirSync(fixtureDir).filter(f => f.endsWith('.json')).sort();

console.log('\n================================================================');
console.log(`  Bankable Items Eval -- SCORING_VERSION: ${SCORING_VERSION}`);
console.log(`  ${files.length} fixtures\n`);

let allPassed = true;

for (const file of files) {
  const raw = JSON.parse(readFileSync(join(fixtureDir, file), 'utf-8')) as any;
  const { _meta, ...answers } = raw;
  const extended = computeExtendedResults(answers as UnifiedAnswers);

  const items = extended.bankableItems;
  const passCount    = items.filter(i => i.status === 'pass').length;
  const partialCount = items.filter(i => i.status === 'partial').length;
  const failCount    = items.filter(i => i.status === 'fail').length;

  console.log(`  ${_meta.persona_name}`);
  console.log(`    Pass: ${passCount}  Partial: ${partialCount}  Fail: ${failCount}  Total: ${items.length}`);

  // Show each item with its status
  for (const item of items) {
    const icon = item.status === 'pass' ? 'PASS' : item.status === 'partial' ? 'PART' : 'FAIL';
    console.log(`      [${icon}] ${item.name}`);
  }
  console.log('');
}

console.log('================================================================');
console.log('  All 5 personas processed.\n');
