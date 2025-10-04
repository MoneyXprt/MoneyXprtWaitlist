import { describe, it, expect } from 'vitest';
import { buildRecommendations } from '../../lib/strategy/engine';

describe('Strategy engine (MVP)', () => {
  it('produces PTET and QBI recs when eligible', () => {
    const profile = {
      filingStatus: 'married_joint',
      primaryState: 'CA',
      year: 2025,
      agiEstimate: 600000,
      itemize: true,
    } as any;
    const entities: any[] = [{ type: 's_corp' }];
    const income = [
      { source: 'k1', amount: 200000, qbiFlag: true },
      { source: 'w2', amount: 300000, qbiFlag: false },
    ] as any;
    const properties: any[] = [];

    const recs = buildRecommendations(profile, entities, income, properties);
    const ids = recs.map((r) => r.strategyId);
    expect(ids).toContain('state_ptet');
    expect(ids).toContain('qbi_199a');
  });

  it('includes cost seg when property qualifies', () => {
    const profile = { filingStatus: 'single', primaryState: 'NY', year: 2025, agiEstimate: 350000 } as any;
    const entities: any[] = [];
    const income: any[] = [];
    const properties = [
      { use: 'rental_res', placedInService: '2022-06-01', costBasis: 900000, landAllocPct: 20, bonusEligible: true },
    ] as any;
    const recs = buildRecommendations(profile, entities, income, properties);
    const ids = recs.map((r) => r.strategyId);
    expect(ids).toContain('re_cost_seg_bonus');
  });
});

