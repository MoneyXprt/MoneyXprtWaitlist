export * from './types';
export { evalPredicate } from './dsl';
export { runEngine } from './engine';

// Legacy compatibility wrapper: buildRecommendations(profile, entities, income, properties, options)
// Maps legacy inputs to the simple Snapshot used by runEngine and adapts output shape.
export function buildRecommendations(profile: any, entities: any[] = [], income: any[] = [], properties: any[] = [], _opts?: any) {
  const snapshot: any = {
    income: {
      w2: income.filter((i: any) => i?.source === 'w2').reduce((a: number, b: any) => a + (b?.amount || 0), 0),
      k1: income.filter((i: any) => i?.source === 'k1').reduce((a: number, b: any) => a + (b?.amount || 0), 0),
      se: income.filter((i: any) => i?.source === '1099' || i?.source === 'schc').reduce((a: number, b: any) => a + (b?.amount || 0), 0),
    },
    properties: (properties || []).map((p: any) => ({ type: (p?.use?.includes('rental') ? 'rental' : 'primary'), basis: p?.costBasis || p?.estimatedValue || 0 })),
    entities: (entities || []).map((e: any) => ({ type: String(e?.type || '').toLowerCase().includes('s') ? 'S-Corp' : String(e?.type || '').toLowerCase().includes('part') ? 'Partnership' : 'LLC' })),
    settings: { year: profile?.year || new Date().getFullYear(), states: profile?.primaryState ? [profile.primaryState] : [] },
  };
  const items = require('./engine').runEngine(snapshot);
  return items.map((i: any) => ({ strategyId: i.code, savingsEst: i.savingsEst, steps: i.steps }));
}
