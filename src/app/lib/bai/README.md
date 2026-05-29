# BAI — Bankable Adaptive Intelligence Engine

Module 7 of BANKABLE IQ per Blueprint v1.8 §XII Part 13.

## What is BAI

The personalization layer that makes Bankable adapt to every business, every industry, every geography, every lender, every market moment in real time. Without BAI, Bankable is a great tool. With BAI, Bankable is infrastructure.

## Structure

```
src/app/lib/bai/
├── README.md             this file
├── index.ts              top-level evaluate() coordinator + re-exports
├── types.ts              shared TypeScript types
├── sub-systems/
│   ├── blin.ts           Bankable Lender Intelligence Network
│   ├── bii.ts            Bankable Industry Intelligence
│   ├── bms.ts            Bankable Market Sensor
│   ├── bpfs.ts           Bankable Predictive Funding Score
│   ├── adaptive-wheel.ts Wheel rebalancing per business profile
│   └── adaptive-coaching.ts  Industry/geo/market-aware coaching hints
├── cam.ts                Capital Access Matrix (powers Outcomes 1 + 3)
├── gbb.ts                Goal-Backwards Build-Out (powers Outcome 2)
└── bcm.ts                Bankable Capital Marketplace (lender-facing API)
```

## v0 scope (this PR)

Every function returns deterministic placeholder payloads. The shape, types, and contracts match Blueprint v1.8 exactly. The actual ML models (BPFS XGBoost), live lender intelligence (BLIN scraping), industry models (BII), macro signals (BMS), and Pinecone vector retrieval (Adaptive Coaching) land in Phase 2.

## How consumers use BAI

```ts
import { evaluate } from '@lib/bai';

const envelope = await evaluate({
  org_id: 'uuid-here',
  assessment_id: 'uuid-here',
  bankability_score: 67,
  credit_position_score: 72,
  naics_code: '722511',
  state: 'NY',
});

// envelope.outcomes.capital_today.matches → bridge funding options
// envelope.outcomes.bankability_built.plan_id → personalized 30-60-90 sprint
// envelope.outcomes.institutional_access.matches → SBA / bank options when score >= 76
// envelope.next_best_action → single most impactful next move
```

## Acceptance for v1

- [ ] BPFS model trained on funded outcomes (~6 months of production data needed)
- [ ] BLIN ingest pipeline collecting daily lender criteria updates
- [ ] BII profile coverage across 25+ NAICS codes
- [ ] BMS pulling FRED + SBA + BLS APIs hourly
- [ ] Adaptive Coaching wired to Pinecone with similar-business case studies
- [ ] CAM joined to live lender_products schema
- [ ] GBB plans pulling from real assessment + credit_position_scores history
- [ ] BCM lender plug-in API exposed under /partner/v1/* per Spec §5.5

Owner: bot-bai (per .github/agents/bot-bai.md)
