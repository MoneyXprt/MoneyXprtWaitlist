import type { ScoreInput } from './index'

type AnyRow = Record<string, any>

const STATE_TOP_RATES: Record<string, number> = {
  CA: 0.133,
  NY: 0.109,
  MN: 0.0985,
  NJ: 0.1075,
  OR: 0.099,
  DC: 0.1075,
  HI: 0.11,
  VT: 0.0875,
  IL: 0.0495,
  TX: 0,
  FL: 0,
  WY: 0,
  WA: 0,
  NV: 0,
}

function num(v: unknown | undefined): number | undefined {
  if (v === null || v === undefined) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function bool(v: unknown | undefined): boolean | undefined {
  if (v === null || v === undefined) return undefined
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return v === 'true' || v === '1'
  if (typeof v === 'number') return v !== 0
  return undefined
}

function pick<T = any>(row: AnyRow, keys: string[]): T | undefined {
  for (const k of keys) if (row && row[k] !== undefined) return row[k]
  return undefined
}

function normalizeEntityType(v?: string): 'none' | 'llc' | 'scorp' | undefined {
  if (!v) return undefined
  const s = v.toLowerCase()
  if (s.includes('s') && s.includes('corp')) return 'scorp'
  if (s.includes('llc')) return 'llc'
  return 'none'
}

function stateRateFromProfile(profile?: AnyRow): number | undefined {
  const st = (pick<string>(profile || {}, ['primary_state', 'state', 'domicileState']) || '').toUpperCase()
  return STATE_TOP_RATES[st]
}

export function getAdvancedCodes(planItems: Array<AnyRow> | undefined): string[] {
  if (!Array.isArray(planItems)) return []
  const known = new Set([
    'augusta_280a',
    'augusta',
    'cost_seg_bonus',
    'cost_seg',
    'rep_status',
    'daf_bunching',
    'daf',
    'qsbs_awareness',
    'backdoor_roth',
    'mega_backdoor_roth',
  ])
  const norm = (c: string) => c.trim().toLowerCase()
  const codes: string[] = []
  for (const it of planItems) {
    const raw = (it?.code || it?.strategyId || it?.strategy_id || it?.id || '') as string
    if (!raw) continue
    const c = norm(raw)
    if (known.has(c)) codes.push(c)
  }
  return codes
}

export function mapToScoreInput({
  profile,
  household,
  planItems,
}: {
  profile?: AnyRow
  household?: AnyRow
  planItems?: Array<AnyRow>
}): ScoreInput {
  const p = profile || {}
  const h = household || {}

  const filingStatus = (pick<string>(p, ['filingStatus', 'filing_status']) || undefined) as ScoreInput['filingStatus']

  const w2Income = num(pick(p, ['w2BaseAnnual', 'w2_income', 'salary', 'w2Income'])) || 0
  const selfEmploymentIncome = num(pick(p, ['selfEmployment', 'self_employment', 'self_employment_net', 'seIncome'])) || 0
  const capShort = num(pick(p, ['capGainsShort', 'capital_gains_short'])) || 0
  const capLong = num(pick(p, ['capGainsLong', 'capital_gains_long'])) || 0
  const capitalGains = num(pick(p, ['capitalGains'])) ?? (capShort + capLong)

  // Deductions: sum up common buckets if present
  const mortgage = num(pick(p, ['mortgageInterest', 'mortgage_interest'])) || 0
  const propertyTax = num(pick(p, ['propertyTax', 'property_tax'])) || 0
  const stateTax = num(pick(p, ['stateIncomeTaxPaid', 'state_income_tax'])) || 0
  const charity = num(pick(p, ['charityCash', 'charityNonCash', 'charity_cash', 'charity_non_cash'])) || 0
  const itemizedDeductions = num(pick(p, ['itemizedDeductions'])) ?? (mortgage + propertyTax + stateTax + charity)

  // State tax rate heuristic
  const stateTaxRate = num(pick(p, ['stateTaxRate'])) ?? stateRateFromProfile(p)

  // Contributions
  const k401 = num(pick(p, ['employee401k', 'k401', 'contrib401k'])) || 0
  const hsa = num(pick(p, ['hsaContrib', 'hsa'])) || 0
  const ira = num(pick(p, ['iraContrib', 'ira'])) || 0
  const megaBackdoor = bool(pick(p, ['usingMegaBackdoor', 'mega_backdoor_roth', 'megaBackdoorRoth'])) || false

  // Entity
  const entType = normalizeEntityType(
    (pick<string>(p, ['entityType', 'entity_type']) || pick<string>(h, ['entityType', 'entity_type']) || 'none') as string
  )
  const reasonableSalary = num(pick(h, ['reasonable_salary', 'reasonableSalary'])) || num(pick(p, ['reasonableCompEst'])) || 0

  // Investment hygiene
  const taxLossHarvestReady = !!bool(pick(p, ['taxLossHarvestReady', 'tlh_ready']))
  const assetLocationOK = !!bool(pick(p, ['assetLocationOK', 'asset_location_ok']))

  // Strategies from plan items
  const allCodes: string[] = Array.isArray(planItems)
    ? planItems.map((it) => String(it?.code || it?.strategyId || it?.strategy_id || '')).filter(Boolean)
    : []

  const input: ScoreInput = {
    filingStatus,
    w2Income,
    selfEmploymentIncome,
    capitalGains: capitalGains || 0,
    itemizedDeductions: itemizedDeductions || 0,
    stateTaxRate,
    contributions: { k401, hsa, ira, megaBackdoor },
    entity: { type: entType || 'none', reasonableSalary },
    investmentHygiene: { taxLossHarvestReady, assetLocationOK },
    strategies: allCodes.map((code) => ({ code })),
  }

  return input
}

export default mapToScoreInput

