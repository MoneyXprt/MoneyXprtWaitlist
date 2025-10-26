import type { AssessmentInput, FiveYearMilestone, FiveYearPlan } from '@/lib/strategy/types'
import { gates } from '@/lib/strategy/rules'

function round(n: number): number { return Math.round(Number(n || 0)) }
function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, n)) }

/**
 * Build a pragmatic 5-year roadmap based on the user's assessment.
 * - Year 1: Foundation
 * - Year 2: Entity & Giving
 * - Year 3: Asset Growth (STR)
 * - Year 4: Optimization (CBP, PTE)
 * - Year 5: Scale & Estate
 */
export function buildFiveYear(input: AssessmentInput, now = new Date()): FiveYearPlan {
  const startYear = now.getFullYear()
  const g = gates(input)

  const efMonths = input.cashflow?.emergencyFundMonths ?? 0
  const monthlySurplus = Math.max(0, input.cashflow?.monthlySurplus ?? 0)
  const cashAvailable = monthlySurplus * 12
  const givingAnnual = Math.max(0, input?.preferences?.givingAnnual ?? 0)
  const state = (input.state || '').toUpperCase()
  const se = Math.max(0, input.income?.seNetProfit ?? 0)
  const w2FromEntity = Math.max(0, input.income?.w2FromEntity ?? 0)
  const passThroughBase = se + w2FromEntity

  const milestones: FiveYearMilestone[] = []

  // Year 1 — Foundation
  const y1Savings = round(clamp(monthlySurplus, 0, 5000) * 0.25) // rough from optimizing benefits
  milestones.push({
    year: startYear,
    summary: 'Foundation: build EF (3–6 mo), max 401(k), clean deductions',
    actions: [
      g.liquidityOK ? 'Maintain 3–6 months emergency fund' : 'Direct surplus to emergency fund until 3–6 months saved',
      'Maximize pre-tax 401(k)/403(b) or Roth as applicable',
      'Validate HSA/FSA eligibility and fund appropriately',
      'Audit itemized vs standard deduction (SALT, mortgage interest, charity)'
    ],
    expectedTaxSavings: y1Savings,
    expectedNetWorthChange: round(monthlySurplus * 12),
    notes: [
      `Current EF months: ${round(efMonths)}`,
      g.liquidityOK ? 'Liquidity is OK; proceed to entity/strategy work in Y2.' : 'Prioritize liquidity before aggressive debt payoff or investing.'
    ]
  })

  // Year 2 — Entity & Giving
  const sCorpEst = g.sCorpNow ? round(clamp((se - 40000) * 0.0765, 0, 8000)) : 0
  const dafSavings = givingAnnual > 0 ? round(givingAnnual * 0.32) : 0
  const y2Savings = sCorpEst + dafSavings
  milestones.push({
    year: startYear + 1,
    summary: 'Entity & Giving: adopt S‑Corp if warranted; consider DAF bunching',
    actions: [
      g.sCorpNow ? 'Form or convert to S‑Corp; implement reasonable comp' : 'If no entity, implement an accountable plan for reimbursements',
      givingAnnual > 0 ? 'Establish Donor‑Advised Fund; bunch 2–3 years of giving' : 'Document charitable giving strategy (DAF optional)'
    ],
    expectedTaxSavings: y2Savings || undefined,
    expectedNetWorthChange: y2Savings ? round(y2Savings * 1.2) : undefined,
    notes: [
      g.sCorpNow ? 'S‑Corp can reduce SE tax on distributions; coordinate payroll and distributions.' : 'Accountable plan can make reimbursements tax‑free.',
      givingAnnual > 0 ? 'Bunching can increase itemized deductions in DAF year(s); use appreciated assets if possible.' : 'If giving increases, consider DAF structure to smooth deductions.'
    ]
  })

  // Year 3 — Asset Growth (STR)
  const strEligible = g.strNow
  const strCashRequired = strEligible ? 100_000 : 0 // rough target equity + reserves
  const strSavings = strEligible ? 20_000 : 0 // rough cost seg / bonus benefit proxy
  milestones.push({
    year: startYear + 2,
    summary: 'Asset Growth: acquire STR and evaluate cost segregation (if eligible)',
    actions: [
      strEligible ? 'Source STR in target market; underwrite with conservative ADR/occupancy' : 'If not pursuing STR, increase index portfolio contributions',
      strEligible ? 'Plan material participation (self‑manage) to enable loss treatment' : 'Automate monthly investing across tax‑advantaged and brokerage accounts',
      strEligible ? 'Engage engineer for cost segregation study post‑acquisition' : 'Rebalance portfolio and review IPS'
    ],
    expectedTaxSavings: strSavings || undefined,
    expectedNetWorthChange: strEligible ? 30_000 : round(monthlySurplus * 12),
    notes: [
      strEligible ? `Cash required (down + closing + reserves): ~$${strCashRequired.toLocaleString()}` : 'Focus on liquid investments if STR is deferred.',
      strEligible ? 'Confirm STR participation hours (100/500/750 safe harbors) and local regs.' : 'Consider tax‑loss harvesting thresholds and asset location.'
    ]
  })

  // Year 4 — Optimization (Cash Balance, PTE)
  const cbpSavings = g.cbpSoon ? 25_000 : 0
  const isCA = state === 'CA'
  const pteSavings = (isCA && g.pteEligible) ? round(clamp(passThroughBase * 0.09 * 0.37, 0, 50_000)) : 0
  const y4Savings = cbpSavings + pteSavings
  milestones.push({
    year: startYear + 3,
    summary: 'Optimization: add Cash Balance Plan; elect CA PTE if eligible',
    actions: [
      g.cbpSoon ? 'Implement Cash Balance defined benefit plan; coordinate with 401(k)' : 'Increase deferred savings via Mega‑backdoor Roth if available',
      (isCA && g.pteEligible) ? 'Elect CA PTE; manage quarterly estimates and owner credits' : 'Explore state SALT workarounds if available'
    ],
    expectedTaxSavings: y4Savings || undefined,
    expectedNetWorthChange: y4Savings ? round(y4Savings * 1.1) : undefined,
    notes: [
      g.cbpSoon ? 'CBP allows large pre‑tax contributions for high earners nearing retirement.' : 'Backdoor/Mega‑backdoor Roth can add tax‑free growth capacity.',
      (isCA && g.pteEligible) ? 'PTE can convert non‑deductible SALT into deductible entity tax with owner credit.' : 'State PTET availability varies; check your state.'
    ]
  })

  // Year 5 — Scale & Estate
  milestones.push({
    year: startYear + 4,
    summary: 'Scale: second rental or business expansion; implement estate plan',
    actions: [
      g.strNow ? 'Acquire second rental (diversify market/asset class)' : 'Expand advisory/business operations with capital discipline',
      'Establish or update estate documents (will, POA, healthcare proxy)',
      'Review insurance (umbrella, term life) and asset protection'
    ],
    expectedTaxSavings: undefined,
    expectedNetWorthChange: 50_000,
    notes: [
      'Consider trust structures and beneficiary designations as net worth grows.',
      'Revisit the plan annually; adjust to tax law and personal changes.'
    ]
  })

  return {
    startYear,
    milestones,
    narrative: 'Five‑year roadmap sequencing foundation, entity optimization, asset growth, advanced deferrals, and estate planning.'
  }
}

export default { buildFiveYear }

