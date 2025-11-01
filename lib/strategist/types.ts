export type EstFormula =
  | 'llc-qbi'
  | 'augusta'
  | 'str'
  | 'cost-seg'
  | 'megabackdoor'
  | 'nqdc';

export type StrategyCategory = 'business' | 'real-estate' | 'retirement' | 'compensation' | 'other';

export interface StrategyRule {
  code: string;
  title: string;
  category: StrategyCategory;
  /**
   * Simple boolean triggers derived from intake/state (e.g., hasSideIncomeOrConsulting, ownsHome, interestedInSTR, has401k, planAllowsAfterTax, hasNQDC)
   */
  trigger: Record<string, boolean>;
  /** Minimum liquid cash suggested before pursuing (e.g., STR ~ 40000) */
  liquidityMin: number;
  /** Optional: maximum debt-to-income ratio threshold for leverage-sensitive plays */
  debtMaxDTI?: number;
  /** Identifier for the estimator function used by the strategist */
  estFormula: EstFormula;
  /** Practical cautions and implementation nuances */
  cautions: string[];
  /** Relevant IRS code/regs/publications */
  irsRefs: string[];
  /** Timeline or sequencing hints for execution */
  timelineHints: string[];
  /** Version of the rule schema */
  version: number;
}

