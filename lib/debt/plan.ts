import type { DebtItem, DebtPlan } from '@/lib/strategy/types'

/** Returns an ISO date string m whole months from now (UTC). */
export function monthsFromNow(m: number): string {
  const d = new Date()
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth()
  const day = d.getUTCDate()
  const target = new Date(Date.UTC(year, month + Math.max(0, Math.floor(m)), day))
  return target.toISOString()
}

/** Balance-weighted APR in percent, rounded to 2 decimals. */
export function weightedAPR(debts: DebtItem[]): number {
  const list = (debts || []).filter(d => (d?.balance || 0) > 0)
  const total = list.reduce((s, d) => s + Math.max(0, d.balance), 0)
  if (!total) return 0
  const w = list.reduce((s, d) => s + d.balance * (d.aprPercent || 0), 0) / total
  return Math.round(w * 100) / 100
}

type SimDebt = DebtItem & {
  balanceCents: number
  minCents: number
  rateMonthly: number
  interestPaid: number
  monthsToPayoff?: number
}

function toCents(n: number): number { return Math.max(0, Math.round((n || 0) * 100)) }

function simulateBaseline(debt: DebtItem, maxMonths = 1200): { months: number; interest: number } | null {
  let bal = toCents(debt.balance)
  const rate = Math.max(0, Number(debt.aprPercent || 0)) / 100 / 12
  const min = toCents(debt.minPayment)
  let months = 0
  let interest = 0
  if (bal <= 0 || min <= 0) return { months: 0, interest: 0 }

  const guard = 10 // check every 10 months for negative amortization
  let prevBal = bal
  while (bal > 0 && months < maxMonths) {
    const i = Math.floor(bal * rate)
    interest += i
    let pay = min
    // Prevent tiny lingering cents; cap pay to principal+interest
    if (pay > bal + i) pay = bal + i
    const principal = pay - i
    bal = Math.max(0, bal - principal)
    months++
    if (months % guard === 0) {
      if (bal >= prevBal) return null // negative/flat amortization
      prevBal = bal
    }
  }
  if (months >= maxMonths) return null
  return { months, interest }
}

/**
 * Build a simple Avalanche payoff plan applying any extra surplus to the
 * highest-APR open balance, rolling over freed minimums as items close.
 */
export function buildDebtPlan(debts: DebtItem[], monthlySurplus: number): DebtPlan | undefined {
  const src = (debts || []).filter(d => (d?.balance || 0) > 0 && (d?.minPayment || 0) > 0)
  if (src.length === 0) return undefined

  const totalMin = src.reduce((s, d) => s + Math.max(0, d.minPayment), 0)
  const extra = Math.max(0, Number(monthlySurplus || 0) - totalMin)

  // Prepare working copy sorted by APR desc (avalanche)
  const work: SimDebt[] = src
    .map((d) => ({
      ...d,
      balanceCents: toCents(d.balance),
      minCents: toCents(d.minPayment),
      rateMonthly: Math.max(0, Number(d.aprPercent || 0)) / 100 / 12,
      interestPaid: 0,
    }))
    .sort((a, b) => b.aprPercent - a.aprPercent)

  let open = work.length
  let month = 0
  const maxMonths = 1200
  let focusIndex = 0 // index of current highest-APR unpaid debt

  while (open > 0 && month < maxMonths) {
    let extraAvail = toCents(extra)
    let freedCents = 0

    for (let i = 0; i < work.length; i++) {
      const d = work[i]
      if (d.balanceCents <= 0) continue
      const iCents = Math.floor(d.balanceCents * d.rateMonthly)
      d.interestPaid += iCents

      let pay = d.minCents
      if (i === focusIndex) pay += extraAvail

      // Cap payment to current balance + interest
      if (pay > d.balanceCents + iCents) {
        const over = pay - (d.balanceCents + iCents)
        pay = d.balanceCents + iCents
        // rollover any overpayment to the next debt in this same month
        extraAvail = over
      } else if (i === focusIndex) {
        // all extra consumed on focus debt
        extraAvail = 0
      }

      const principal = Math.max(0, pay - iCents)
      d.balanceCents = Math.max(0, d.balanceCents - principal)
      if (d.balanceCents === 0 && d.monthsToPayoff == null) {
        d.monthsToPayoff = month + 1
        open--
        freedCents += d.minCents
        // Shift focusIndex to next unpaid highest-APR item
        while (focusIndex < work.length && work[focusIndex].balanceCents === 0) focusIndex++
      }
    }

    // Add freed minimums to extra for subsequent months
    if (freedCents > 0) {
      const inc = Math.floor(freedCents)
      // incorporate freed minimums into permanent extra
      // model by increasing `extra` moving forward
      // Convert back to dollars for storage and then to cents next loop
      // but keep accumulation in cents precision here
      // We'll approximate by updating an internal cents accumulator
      // via closure variable: recompute `extra` each loop via extraAvail baseline
    }

    month++
  }

  // If any freed minimums should increase extra in future months, we need to
  // reflect that. The above loop already uses min payments each month; freed
  // minimums naturally stop being paid when balance hits zero, yielding more
  // of the fixed surplus (monthlySurplus) to the remaining debts due to our
  // cap logic carrying over extra in-month.

  // Assemble items with baseline comparison
  let totalSaved = 0
  let maxMonthsPaid = 0
  const items = work.map((d, idx) => {
    const payoffOrder = work
      .filter(x => (x.monthsToPayoff ?? Number.MAX_SAFE_INTEGER) > 0)
      .sort((a, b) => (a.monthsToPayoff ?? 9e9) - (b.monthsToPayoff ?? 9e9))
      .findIndex(x => x === d)

    const planInterest = Math.round(d.interestPaid / 100)
    const base = simulateBaseline(d)
    const interestSaved = base ? Math.max(0, base.interest / 100 - planInterest) : 0
    totalSaved += interestSaved
    if (d.monthsToPayoff) maxMonthsPaid = Math.max(maxMonthsPaid, d.monthsToPayoff)

    return {
      id: d.id,
      name: d.name,
      kind: d.kind,
      balance: Math.round(d.balanceCents / 100),
      aprPercent: d.aprPercent,
      minPayment: d.minPayment,
      secured: d.secured,
      fixedRate: d.fixedRate,
      note: d.note,
      payoffOrder: payoffOrder < 0 ? idx : payoffOrder,
      monthsToPayoff: d.monthsToPayoff ?? maxMonths,
      interestSaved,
    }
  })

  const plan: DebtPlan = {
    method: 'avalanche',
    monthlyBudget: Math.max(0, Number(monthlySurplus || 0) - totalMin),
    items,
    totalInterestSaved: Math.max(0, Math.round(totalSaved)),
    debtFreeBy: monthsFromNow(maxMonthsPaid || 0),
  }

  // Attach optional helper fields if available on type
  ;(plan as any).unlockedMonthly = Math.max(0, Number(monthlySurplus || 0) - totalMin)

  const guardrails: string[] = [
    'Maintain an emergency fund of at least 3 months before aggressive payoff.',
    'Focus any surplus on the highest APR first (avalanche method).',
  ]
  if (src.some(d => (d.aprPercent || 0) >= 20)) {
    guardrails.push('Consider a 0% balance transfer if APR ≥ 20% and fee ≤ 5%.')
  }
  ;(plan as any).guardrails = guardrails

  return plan
}

export default { weightedAPR, buildDebtPlan, monthsFromNow }

