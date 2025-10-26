/**
 * Tax-planning agent shared types.
 * These are used to describe assessment inputs, strategy outputs,
 * debt payoff plans, and a five-year roadmap.
 */

/** Filing status for federal income tax. */
export type FilingStatus = 'Single' | 'MFJ' | 'MFS' | 'HOH' | 'QW'

/** Business entity type if applicable. */
export type EntityType = 'None' | 'SoleProp' | 'LLC' | 'S-Corp' | 'C-Corp' | 'Partnership'

/** Supported debt categories for payoff planning. */
export type DebtType =
  | 'credit_card'
  | 'student_loan'
  | 'auto'
  | 'mortgage'
  | 'personal'
  | 'heloc'
  | 'medical'
  | 'other'

/** Savings recurrence cadence. */
export type SavingsCadence = 'one_time' | 'annual' | 'monthly'

/** Currency code for money values. */
export type Currency = 'USD'

/**
 * A single debt item for payoff planning (e.g., Avalanche).
 */
export interface DebtItem {
  /** Unique identifier (client-generated ok). */
  id: string
  /** Friendly name, e.g. “Amex Blue Cash”. */
  name: string
  /** Category of the debt (used for ordering/UX). */
  kind: DebtType
  /** Current outstanding principal balance (in dollars). */
  balance: number
  /** Annual Percentage Rate (APR), in percent (e.g., 22.49 for 22.49%). */
  aprPercent: number
  /** Minimum required monthly payment (dollars). */
  minPayment: number
  /** Whether this debt is secured (mortgage, auto) vs. unsecured. */
  secured?: boolean
  /** Fixed-rate vs variable-rate indicator. */
  fixedRate?: boolean
  /** Optional note for context. */
  note?: string
}

/**
 * Core assessment inputs collected from the user to drive tax planning.
 */
export interface AssessmentInput {
  /** Filing status (explicit union). */
  filingStatus: FilingStatus
  /** Primary residence state (two-letter code preferred). */
  state: string
  /** Number of dependents (including children/qualifying relatives). */
  dependents: number

  /** Income breakdown. Values are annual dollars unless stated. */
  income: {
    /** W-2 wage income. */ w2Wages: number
    /** Withholding amounts (optional granularity). */
    w2Withholding?: number
    /** Self-employment/1099 net profit (Schedule C). */
    seNetProfit?: number
    /** Employer W-2 from passthrough entity (for QBI wage limits). */
    w2FromEntity?: number
    /** Whether the business income likely qualifies for QBI. */
    isQBIEligible?: boolean
    /** Business entity type if applicable. */
    entityType?: EntityType
    /** Investment income components (optional). */
    interestIncome?: number
    dividendsOrdinary?: number
    dividendsQualified?: number
    capGainsShort?: number
    capGainsLong?: number
    rsuTaxableComp?: number
    otherIncome?: number
    /**
     * Rentals summary (optional). Each item represents an activity
     * with net income and participation indicators for STR rules.
     */
    rentals?: Array<{
      type: 'LTR' | 'STR'
      /** Net income (income - expenses). */
      netIncome: number
      state?: string
      /** Whether materially participates (relevant for STR treatment). */
      materiallyParticipates?: boolean
    }>
  }

  /** Above-the-line and itemized deduction inputs. */
  deductions?: {
    /** State and local tax components (SALT). */
    stateIncomeTaxPaid?: number
    stateSalesTaxPaid?: number
    realEstatePropertyTax?: number
    personalPropertyTax?: number
    /** Charitable giving amounts. */
    charityCash?: number
    charityNonCash?: number
    /** Mortgage interest on primary residence. */
    mortgageInterestPrimary?: number
    /** Medical expenses (for 7.5% AGI threshold). */
    medicalExpenses?: number
    /** Use sales tax instead of income tax for SALT deduction. */
    useSalesTaxInsteadOfIncome?: boolean
  }

  /**
   * Household liquidity and cash-flow.
   */
  cashflow: {
    /** Months of core expenses covered by emergency fund. */
    emergencyFundMonths: number
    /** Estimated monthly surplus (cash left after expenses). */
    monthlySurplus: number
  }

  /**
   * User preferences that influence strategies.
   */
  preferences?: {
    /** Annual charitable giving intent (planning signal). */
    givingAnnual?: number
    /** Wants to consider Short-Term Rental strategies. */
    wantsSTR?: boolean
    /** Willing to self-manage an STR to meet participation thresholds. */
    willingSelfManageSTR?: boolean
    /** Primary financial goal (e.g., “minimize tax”, “debt free”, “buy home”). */
    primaryGoal?: string
    /** Risk tolerance for recommendations. */
    riskTolerance?: 'low' | 'medium' | 'high'
  }

  /**
   * Debts considered for payoff sequencing (Avalanche/Snowball).
   */
  debts?: DebtItem[]
}

/**
 * A concise, user-friendly strategy recommendation card.
 */
export interface StrategyCard {
  /** Stable machine code for the strategy (used for dedupe/telemetry). */
  code: string
  /** Human-friendly title. */
  title: string
  /** Plain-English one-liner summary. */
  plain: string
  /** Why this matters (talk tracks or bullet reminders). */
  why: string[]
  /** Estimated savings impact. */
  savings?: {
    /** Amount in dollars (or null if qualitative only). */ amount: number | null
    /** Currency (USD). */ currency: Currency
    /** Cadence of savings. */ cadence: SavingsCadence
    /** Confidence level 0–1. */ confidence?: number
  }
  /** Concrete next actions. */
  actions: Array<{
    /** Short actionable label. */ label: string
    /** Details, instructions, or eligibility explanation. */ detail?: string
    /** Optional supporting link (IRS pub, calculator, tool). */ link?: string
  }>
  /** Guardrails or eligibility constraints to check first. */
  guardrails: string[]
  /** Nuances, caveats, phase-outs, or coordination notes. */
  nuance: string[]
  /** Optional illustrative example or quick calculation. */
  example?: string
  /** Supporting references (IRS code, publications). */
  references?: Array<{ title: string; url: string }>
}

/**
 * Detailed plan for accelerated debt payoff using the Avalanche method.
 */
export interface DebtPlanItem extends DebtItem {
  /** Order index in the payoff sequence (0 = first). */
  payoffOrder: number
  /** Months required to pay this item with the provided budget. */
  monthsToPayoff: number
  /** Estimated interest saved vs. minimums-only baseline. */
  interestSaved: number
}

/**
 * Overall debt payoff plan.
 */
export interface DebtPlan {
  /** Method used (explicit union). */
  method: 'avalanche'
  /** Monthly budget allocated to debt payoff (beyond minimums). */
  monthlyBudget: number
  /** Ordered items with payoff projections. */
  items: DebtPlanItem[]
  /** Total interest saved across all debts. */
  totalInterestSaved: number
  /** ISO date string when debt-free is achieved (estimate). */
  debtFreeBy: string
  /** Optional plan-level guardrail recommendations. */
  guardrails?: string[]
  /** Optional surplus unlocked for investing after payoff. */
  unlockedMonthly?: number
}

/**
 * A milestone for the five-year financial plan.
 */
export interface FiveYearMilestone {
  /** Calendar year of the milestone. */
  year: number
  /** Narrative summary of the milestone. */
  summary: string
  /** Key actions for the year. */
  actions: string[]
  /** Expected annual tax savings realized this year (if any). */
  expectedTaxSavings?: number
  /** Target net worth delta for the year (if modeled). */
  expectedNetWorthChange?: number
  /** Optional notes and caveats. */
  notes?: string[]
}

/**
 * Five-year plan across milestones.
 */
export interface FiveYearPlan {
  /** First year of the plan. */
  startYear: number
  /** Milestones in chronological order. */
  milestones: FiveYearMilestone[]
  /** High-level narrative for the plan. */
  narrative?: string
}

/**
 * The full strategist response payload aggregating all components.
 */
export interface StrategistResult {
  /** Echo of the input used for transparency/auditing. */
  assessment: AssessmentInput
  /** Ranked strategy cards. */
  strategies: StrategyCard[]
  /** Optional debt payoff plan (Avalanche). */
  debtPlan?: DebtPlan
  /** Optional five-year roadmap. */
  fiveYear?: FiveYearPlan
  /** Metadata about generation. */
  meta?: {
    /** ISO timestamp when generated. */ generatedAt: string
    /** Semantic version of the strategist. */ version: string
    /** Model or source identifiers. */ model?: string
  }
}

// If you need stricter enums or additional fields, consider refining the
// types above. If something important is missing, regenerate with stricter
// types: use 'MFJ'|'Single' etc., and include givingAnnual, wantsSTR, willingSelfManageSTR.

/**
 * Minimal snapshot shape consumed by the legacy strategy engine.
 * Kept for back-compat with lib/strategy/engine.ts and API calculators.
 */
export interface Snapshot {
  profile?: { filingStatus?: string }
  settings?: { year?: number; states?: string[] }
  income?: { w2?: number; se?: number; k1?: number }
  entities?: Array<{ type: 'S-Corp' | 'C-Corp' | 'Partnership' | 'LLC' | 'SoleProp' | 'Other' }>
  properties?: Array<{ type: 'rental' | 'primary' | 'other'; basis?: number; bonusEligible?: boolean }>
  dependents?: number
}

/**
 * Minimal strategy item returned by the legacy engine.
 */
export interface StrategyItem {
  code: string
  name: string
  category: string
  /** Estimated federal/state tax savings (dollars). */
  savingsEst: number
  /** Relative risk or complexity (1=low, 3=high). */
  risk: 1 | 2 | 3
  /** Implementation steps. */
  steps: string[]
  /** Supporting documents/checklists. */
  docs: string[]
  /** States where applicable (for state strategies). */
  states?: string[]
  /** Flag for high-risk items (used for filtering). */
  highRisk?: boolean
}
