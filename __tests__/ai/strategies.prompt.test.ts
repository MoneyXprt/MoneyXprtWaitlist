import { describe, it, expect } from 'vitest'
import { buildStrategiesPrompt } from '@/lib/ai/strategies'

describe('strategies prompt builder', () => {
  it('includes guardrails and JSON-only instruction', () => {
    const { system, user } = buildStrategiesPrompt({ profile: { filingStatus: 'single', state: 'CA' }, plan: { sample: true }, year: 2025 })
    expect(system).toMatch(/educational/i)
    expect(system).toMatch(/strict JSON/i)
    expect(user).toMatch(/profileSummary/)
    expect(user).toMatch(/plan/)
  })
})

