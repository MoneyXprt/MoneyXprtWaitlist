import { describe, it, expect } from 'vitest';
import { evalPredicate } from '../../lib/strategy/dsl';

describe('DSL evaluator', () => {
  const ctx = {
    profile: { agiEstimate: 450000, primaryState: 'CA' },
    incomeTotal: { qbi: 120000, passThru: 180000 },
  };

  it('handles and/or/not and comparisons', () => {
    const pred = {
      and: [
        { gt: ['profile.agiEstimate', 200000] },
        { in: ['profile.primaryState', ['CA', 'NY']] },
        { or: [{ gt: ['incomeTotal.qbi', 0] }, { gt: ['incomeTotal.passThru', 0] }] },
      ],
    } as any;
    expect(evalPredicate(pred, ctx)).toBe(true);
  });

  it('respects not and exists', () => {
    const pred = {
      and: [
        { exists: ['profile.agiEstimate'] },
        { not: { lt: ['incomeTotal.qbi', 1] } },
      ],
    } as any;
    expect(evalPredicate(pred, ctx)).toBe(true);
  });
});

