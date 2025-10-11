import { describe, it, expect, beforeEach } from 'vitest'
import { usePlannerStore } from '@/lib/store/planner'
import { findConflicts } from '@/lib/strategy/conflicts'

describe('planner zustand store', () => {
  beforeEach(() => {
    const api = usePlannerStore.getState()
    // reset core slices
    usePlannerStore.setState({
      data: api.data, // leave as-is
      includeHighRisk: false,
      lastRecoItems: [],
      selected: [],
    })
  })

  it('adds and removes strategies, computes total', () => {
    const s = usePlannerStore.getState()
    s.add({ code: 'qbi_199a', name: 'QBI deduction optimization', savingsEst: 5000 })
    s.add({ code: 'ptet_state', name: 'PTET election', savingsEst: 8000 })
    expect(usePlannerStore.getState().selected.map(i => i.code)).toEqual(['qbi_199a', 'ptet_state'])
    expect(usePlannerStore.getState().total()).toEqual(13000)

    s.remove('qbi_199a')
    expect(usePlannerStore.getState().selected.map(i => i.code)).toEqual(['ptet_state'])
    expect(usePlannerStore.getState().total()).toEqual(8000)
  })

  it('reorders selected strategies', () => {
    const s = usePlannerStore.getState()
    s.add({ code: 'a', name: 'A', savingsEst: 1 })
    s.add({ code: 'b', name: 'B', savingsEst: 2 })
    s.add({ code: 'c', name: 'C', savingsEst: 3 })
    expect(usePlannerStore.getState().selected.map(i => i.code)).toEqual(['a', 'b', 'c'])
    s.reorder(2, 0) // move c to front
    expect(usePlannerStore.getState().selected.map(i => i.code)).toEqual(['c', 'a', 'b'])
  })

  it('detects conflicts using selected codes', () => {
    const s = usePlannerStore.getState()
    s.add({ code: '475f_trader', name: 'Trader election', savingsEst: 0 })
    s.add({ code: 'tlh', name: 'Tax loss harvesting', savingsEst: 0 })
    const codes = usePlannerStore.getState().selected.map(i => i.code)
    const conflicts = findConflicts(codes)
    expect(conflicts.some(c => (c.a === '475f_trader' && c.b === 'tlh') || (c.a === 'tlh' && c.b === '475f_trader'))).toBe(true)
  })
})

