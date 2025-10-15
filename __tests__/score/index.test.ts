import { describe, it, expect } from 'vitest'
import { calculateKeepMoreScore, type ScoreInput } from '@/lib/score'

describe('Keep‑More Score heuristics', () => {
  // Case A: empty/low data → ~25–40
  it('A) empty input returns modest baseline', () => {
    const res = calculateKeepMoreScore({})
    expect(res.score).toBeGreaterThanOrEqual(25)
    expect(res.score).toBeLessThanOrEqual(40)
    Object.values(res.breakdown).forEach((v) => expect(v).toBeGreaterThanOrEqual(0))
    expect(res.score).toBeLessThanOrEqual(100)
  })

  // Case B: W2 high earner maxing 401k/HSA, no SE
  it('B) high W2 with strong retirement contributions', () => {
    const input: ScoreInput = {
      filingStatus: 'single',
      w2Income: 350000,
      selfEmploymentIncome: 0,
      contributions: { k401: 23000, hsa: 3300, ira: 6500 },
      investmentHygiene: { taxLossHarvestReady: false, assetLocationOK: true },
      strategies: [],
    }
    const res = calculateKeepMoreScore(input)
    // retirement should be strong; total in 55–70
    expect(res.breakdown.retirement).toBeGreaterThanOrEqual(16)
    expect(res.score).toBeGreaterThanOrEqual(55)
    expect(res.score).toBeLessThanOrEqual(70)
  })

  // Case C: SE ≥ 120k, S‑Corp with reasonable salary, good investments, advanced
  it('C) optimized S‑Corp with insurance & planning', () => {
    const input: ScoreInput = {
      filingStatus: 'mfj',
      w2Income: 120000,
      selfEmploymentIncome: 180000,
      itemizedDeductions: 32000,
      stateTaxRate: 0.06,
      contributions: { k401: 23000, hsa: 3300, ira: 6500, megaBackdoor: true },
      entity: { type: 'scorp', reasonableSalary: 80000 }, // ~44%
      investmentHygiene: { taxLossHarvestReady: true, assetLocationOK: true, withholdingsOK: true, estimatesOK: true },
      strategies: [
        { code: 'cost_seg_bonus' },
        { code: 'augusta_280a' },
        { code: 'qsbs_awareness' },
        { code: 'backdoor_roth' },
      ],
    }
    const res = calculateKeepMoreScore(input)
    expect(res.score).toBeGreaterThanOrEqual(80)
    expect(res.score).toBeLessThanOrEqual(95)
    expect(res.breakdown.entity).toBeGreaterThanOrEqual(18)
    expect(res.breakdown.investments).toBe(15)
    expect(res.breakdown.insurance).toBe(10)
  })

  // Case D: near-threshold itemized with high state tax
  it('D) near-threshold itemized with SALT headwind', () => {
    const input: ScoreInput = {
      filingStatus: 'single',
      w2Income: 150000,
      itemizedDeductions: 12000, // near 13k threshold
      stateTaxRate: 0.11, // > 10%
      contributions: { k401: 8000 },
      investmentHygiene: {},
      strategies: [],
    }
    const res = calculateKeepMoreScore(input)
    expect(res.breakdown.deductions).toBeGreaterThanOrEqual(4)
    expect(res.breakdown.deductions).toBeLessThanOrEqual(12)
  })

  // Case E: advanced strategies cap
  it('E) advanced strategies capped at 20', () => {
    const input: ScoreInput = {
      strategies: [
        { code: 'cost_seg' },
        { code: 'daf' },
        { code: 'qsbs_awareness' },
        { code: 'augusta' },
        { code: 'rep_status' },
        { code: 'mega_backdoor_roth' },
        { code: 'backdoor_roth' },
      ],
    }
    const res = calculateKeepMoreScore(input)
    expect(res.breakdown.planning).toBeLessThanOrEqual(20)
    // Category clamping and total bounds
    Object.values(res.breakdown).forEach((v) => expect(v).toBeGreaterThanOrEqual(0))
    expect(res.score).toBeGreaterThanOrEqual(0)
    expect(res.score).toBeLessThanOrEqual(100)
  })
})
