import { describe, it, expect } from 'vitest'
import { calculateKeepMoreScore, type ScoreInput } from '@/lib/score'

describe('Keep-More Score', () => {
  it('returns a modest baseline when no data is provided', () => {
    const res = calculateKeepMoreScore({})
    expect(res.score).toBeGreaterThanOrEqual(25)
    expect(res.score).toBeLessThanOrEqual(40)
  })

  it('scores highly for well-optimized scenario', () => {
    const input: ScoreInput = {
      filingStatus: 'single',
      w2Income: 300000,
      selfEmploymentIncome: 120000,
      itemizedDeductions: 40000,
      stateTaxRate: 0.1,
      contributions: { k401: 23000, hsa: 4150, ira: 0, megaBackdoor: true },
      entity: { type: 'scorp', reasonableSalary: 50000 },
      investmentHygiene: { taxLossHarvestReady: true, assetLocationOK: true },
      strategies: [
        { code: 'cost_seg_bonus' },
        { code: 'augusta_280a' },
        { code: 'qsbs_awareness' },
      ],
    }
    const res = calculateKeepMoreScore(input)
    expect(res.score).toBeGreaterThanOrEqual(80)
    expect(res.score).toBeLessThanOrEqual(100)
    // sanity: main buckets should be non-trivial
    expect(res.breakdown.retirement).toBeGreaterThan(10)
    expect(res.breakdown.entity).toBeGreaterThan(12)
    expect(res.breakdown.investments).toBe(15)
  })
})

