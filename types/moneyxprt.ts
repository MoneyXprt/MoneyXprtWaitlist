export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh' | 'qw'

export interface MoneyXprtIntake {
  taxYear?: number
  filingStatus?: FilingStatus
  state?: string
  dependents?: number

  // incomes
  w2Income?: number
  w2FedWithheld?: number
  w2StateWithheld?: number
  seIncome?: number // Schedule C or K-1 active
  realEstateIncome?: number // net passive (can be negative)
  capitalGains?: number

  // deductions (itemized)
  mortgageInterest?: number
  salt?: number // state+local tax you plan to claim
  charity?: number

  // accounts
  preTax401k?: number // employee deferral
  iraContribution?: number

  notes?: string
}

export function toStrategistPayload(f: MoneyXprtIntake) {
  const year = f.taxYear ?? new Date().getFullYear()
  return {
    meta: { taxYear: year, source: 'web-intake-v0' },
    profile: {
      filingStatus: f.filingStatus ?? 'mfj',
      state: (f.state || 'CA').toUpperCase(),
      dependents: f.dependents ?? 1,
    },
    income: {
      w2: { wages: f.w2Income ?? 0, fedWithheld: f.w2FedWithheld ?? 0, stateWithheld: f.w2StateWithheld ?? 0 },
      business: { seIncome: f.seIncome ?? 0 },
      realEstate: { net: f.realEstateIncome ?? 0 },
      capitalGains: f.capitalGains ?? 0,
    },
    deductions: {
      itemized: {
        mortgageInterest: f.mortgageInterest ?? 0,
        salt: f.salt ?? 0,
        charity: f.charity ?? 0,
      },
      retirement: {
        preTax401k: f.preTax401k ?? 0,
        iraContribution: f.iraContribution ?? 0,
      },
    },
    notes: f.notes ?? '',
  }
}
