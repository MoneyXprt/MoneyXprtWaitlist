import { describe, it, expect } from 'vitest'
import { buildNarrativePrompt } from '@/lib/ai/narrative'

describe('narrative prompt builder', () => {
  it('includes guardrails and schema hints', () => {
    const { system, user } = buildNarrativePrompt({
      profile: { filingStatus: 'single' },
      scoreResult: { score: 72, breakdown: { retirement: 15, entity: 10, deductions: 12, investments: 14, hygiene: 8, advanced: 13 }, notes: ['test'] },
      strategies: [{ code: 'cost_seg_bonus', name: 'Cost Segregation + Bonus' }],
      year: 2025,
    })
    expect(system).toMatch(/educational/i)
    expect(system).toMatch(/disclaimer/i)
    expect(user).toMatch(/Create a narrative using this context/)
    expect(user).toMatch(/selectedStrategies/)
    expect(user).toMatch(/schema/)
  })
})

