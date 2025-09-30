export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';

export type AssetType = 'real_estate' | 'stocks' | 'business' | 'other';
export type EntityType = 'none' | 'llc' | 'trust' | 'flp';
export type InvestmentStrategyType = 'long_term' | 'qsbs' | 'mixed';
export type CollateralType = 'securities' | 'real_estate' | 'mixed';

export interface TaxScenario {
  name: string;
  federalTax: number;
  stateTax: number;
  estateTax: number;
  totalTax: number;
  savings: number;
  strategies: string[];
  assumptions?: string[];
}

export interface TaxEfficiencyState {
  scenarios: TaxScenario[];
  selectedScenario: string | null;
  inputs: TaxEfficiencyInputs;
}

export interface TaxEfficiencyInputs {
  filingStatus: FilingStatus;
  assets: Asset[];
  currentEntities: EntityStructure[];
  stateResidence: 'CA' | 'NY' | 'TX' | 'FL' | 'WY';
  plannedGifts: GiftPlan;
  investmentStrategy: InvestmentStrategyType;
  annualExpenses: ExpenseStructure;
  debtPlans: DebtStructure;
  estateSize: number;
}

export interface Asset {
  id: string;
  value: number;
  type: AssetType;
  basis?: number;
  annualReturn?: number;
  holdingPeriod?: number;
}

export interface EntityStructure {
  type: EntityType;
  expenses?: number;
  assets?: string[]; // Asset IDs
  beneficiaries?: string[];
}

export interface GiftPlan {
  amount: number;
  recipients: number;
  timing?: 'immediate' | 'phased' | 'testamentary';
}

export interface ExpenseStructure {
  fees: number;
  donations: number;
  other: number;
}

export interface DebtStructure {
  existingDebt: number;
  plannedBorrowing: number;
  collateralType: CollateralType;
  interestRate?: number;
}

export interface TaxRates {
  federal: {
    brackets: Array<{
      threshold: number;
      rate: number;
    }>;
    estateExemption: number;
    estateRate: number;
    capitalGains: {
      short: number;
      long: number;
    };
  };
  state: Record<string, number>;
}

export interface QSBSAnalysis {
  eligible: boolean;
  potentialExclusion: number;
  requirements: {
    holdingPeriod: boolean;
    acquisitionDate: boolean;
    stockType: boolean;
    assetTest: boolean;
  };
}