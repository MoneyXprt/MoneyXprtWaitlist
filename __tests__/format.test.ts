import { describe, it, expect } from 'vitest'

describe('currency formatter', () => {
  it('formats numeric strings as USD with cents', () => {
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
    const out = fmt.format(Number('123') ?? 0)
    expect(out).toBe('$123.00')
  })
})

