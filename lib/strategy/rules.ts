import type { AssessmentInput, DebtPlan, StrategyCard } from '@/lib/strategy/types'
import { weightedAPR, buildDebtPlan } from '@/lib/debt/plan'

/**
 * Build a debt payoff plan (Avalanche) from user assessment.
 */
export function evaluateDebt(input: AssessmentInput): DebtPlan | undefined {
  const debts = input.debts || []
  const monthlySurplus = input.cashflow?.monthlySurplus ?? 0
  if (!debts.length || monthlySurplus <= 0) return undefined
  return buildDebtPlan(debts, monthlySurplus)
}

/** Result of gating rules for strategy eligibility/priority. */
export type Gates = ReturnType<typeof gates>

/**
 * Derive boolean/metric gates used to prioritize strategies.
 */
export function gates(input: AssessmentInput) {
  const debts = input.debts || []
  const efMonths = input.cashflow?.emergencyFundMonths ?? 0
  const monthlySurplus = input.cashflow?.monthlySurplus ?? 0
  const wantsSTR = Boolean(input.preferences?.wantsSTR)
  const willingSelfManageSTR = Boolean(input.preferences?.willingSelfManageSTR)

  // Weighted APR across open balances
  const wAPR = weightedAPR(debts)

  // Simple liquidity rule of thumb
  const liquidityOK = efMonths >= 3

  // Very rough business revenue proxy from available inputs (profit as proxy)
  const se = Math.max(0, input.income?.seNetProfit ?? 0)
  const w2FromEntity = Math.max(0, input.income?.w2FromEntity ?? 0)
  const rentalsNet = (input.income?.rentals || []).reduce((s, r) => s + Math.max(0, r.netIncome || 0), 0)
  const businessRevenue = se + w2FromEntity + rentalsNet

  // Cash available proxy (annualized surplus)
  const cashAvailable = Math.max(0, monthlySurplus * 12)

  // Entity presence
  const hasEntity = (input.income?.entityType ?? 'None') !== 'None'

  // Itemize likelihood from property tax + mortgage interest
  const d = input.deductions || {}
  const propertyTax = Math.max(0, (d.realEstatePropertyTax ?? 0) + (d.personalPropertyTax ?? 0))
  const mortgageInterest = Math.max(0, d.mortgageInterestPrimary ?? 0)
  const itemizeLikely = propertyTax + mortgageInterest >= 20_000

  // Gated signals
  const sCorpNow = businessRevenue >= 50_000 && cashAvailable >= 20_000
  const augustaNow = hasEntity
  const cbpSoon = businessRevenue >= 150_000 && cashAvailable >= 30_000
  const strNow = cashAvailable >= 100_000 && willingSelfManageSTR && wantsSTR
  const pteEligible = hasEntity && businessRevenue >= 100_000
  const rothOK = true

  return {
    wAPR,
    liquidityOK,
    sCorpNow,
    augustaNow,
    cbpSoon,
    strNow,
    pteEligible,
    rothOK,
    itemizeLikely,
  }
}

/**
 * Rank strategy cards: eligible first, then by savings (descending).
 * Without external gates context, approximate eligibility as having a non-null savings amount.
 */
export function rankStrategies(cards: StrategyCard[]): StrategyCard[] {
  const annualized = (c: StrategyCard) => {
    const s = c.savings
    if (!s || s.amount == null) return 0
    if (s.cadence === 'monthly') return (s.amount || 0) * 12
    return s.amount || 0
  }
  return [...(cards || [])].sort((a, b) => {
    const aElig = a.savings?.amount != null ? 1 : 0
    const bElig = b.savings?.amount != null ? 1 : 0
    if (aElig !== bElig) return bElig - aElig
    const da = annualized(a)
    const db = annualized(b)
    return db - da
  })
}

export default { evaluateDebt, gates, rankStrategies }

