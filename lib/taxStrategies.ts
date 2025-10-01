// Types for tax strategy calculations
export type Strategy = {
  strategyId: string;
  title: string;
  savings: number | "varies";
  complexity: "Easy" | "Medium" | "Advanced";
  requiresCPA: boolean;
  plainExplanation: string;
  details: string;
  matchRate?: number; // For retirement account matching
};

// Constants for tax calculations
export const TAX_YEAR = 2025;

export const TAX_BRACKETS = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11601, max: 47150, rate: 0.12 },
    { min: 47151, max: 100525, rate: 0.22 },
    { min: 100526, max: 191950, rate: 0.24 },
    { min: 191951, max: 243725, rate: 0.32 },
    { min: 243726, max: 609350, rate: 0.35 },
    { min: 609351, max: Infinity, rate: 0.37 }
  ],
  married: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23201, max: 94300, rate: 0.12 },
    { min: 94301, max: 201050, rate: 0.22 },
    { min: 201051, max: 383900, rate: 0.24 },
    { min: 383901, max: 487450, rate: 0.32 },
    { min: 487451, max: 731200, rate: 0.35 },
    { min: 731201, max: Infinity, rate: 0.37 }
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16551, max: 63100, rate: 0.12 },
    { min: 63101, max: 100500, rate: 0.22 },
    { min: 100501, max: 191950, rate: 0.24 },
    { min: 191951, max: 243700, rate: 0.32 },
    { min: 243701, max: 609350, rate: 0.35 },
    { min: 609351, max: Infinity, rate: 0.37 }
  ]
} as const;

export const CONTRIBUTION_LIMITS = {
  retirementPlan: {
    basic: 23000,
    catchUp: 7500, // Age 50 or older
  },
  ira: {
    basic: 7000,
    catchUp: 1000,
  },
  hsa: {
    individual: 4150,
    family: 8300,
  },
} as const;

export type FilingStatus = "single" | "married" | "head_of_household";
export type StateCode = "CA" | "NY" | "TX" | "FL" | "Other";

export type TaxInfo = {
  filingStatus: FilingStatus;
  state: StateCode;
  income: number;
  hasRetirementPlan: boolean;
  currentRetirementContribution: number;
  hasHSA: boolean;
  hasDependents: boolean;
  isHomeowner: boolean;
  mortgageInterest: number;
  propertyTaxes: number;
  hasBusinessIncome: boolean;
  businessIncome: number;
};

// Helper functions for tax calculations
function calculateMarginalRate(income: number, filingStatus: FilingStatus): number {
  const brackets = TAX_BRACKETS[filingStatus];
  for (const bracket of brackets) {
    if (income >= bracket.min && income <= bracket.max) {
      return bracket.rate;
    }
  }
  return 0;
}

function calculateTaxSavings(amount: number, rate: number): number {
  return Math.round(amount * rate);
}

// Base strategies for 2025
const BASE_STRATEGIES = [
  {
    strategyId: "401k",
    title: "401(k) Retirement Savings",
    savings: "varies",
    complexity: "Easy" as const,
    requiresCPA: false,
    plainExplanation: "Contribute to your 401(k) to reduce taxable income and save for retirement.",
    details: "Traditional 401(k) contributions are made with pre-tax dollars, reducing your taxable income for the year. For 2025, you can contribute up to $23,000, or $30,500 if you're 50 or older."
  },
  {
    strategyId: "hsa",
    title: "Health Savings Account",
    savings: "varies",
    complexity: "Easy" as const,
    requiresCPA: false,
    plainExplanation: "Use an HSA for triple-tax-advantaged healthcare savings.",
    details: "HSAs offer tax-deductible contributions, tax-free growth, and tax-free withdrawals for qualified medical expenses. For 2025, you can contribute up to $4,150 for individual coverage or $8,300 for family coverage."
  },
  {
    strategyId: "property_deductions",
    title: "Property Tax Deductions",
    savings: "varies",
    complexity: "Medium" as const,
    requiresCPA: false,
    plainExplanation: "Deduct mortgage interest and property taxes to reduce your taxable income.",
    details: "Homeowners can deduct mortgage interest and property taxes on their federal tax return. Keep detailed records of all payments and consider bundling property tax payments in high-income years."
  },
  {
    strategyId: "business_deductions",
    title: "Business Expense Deductions",
    savings: "varies",
    complexity: "Medium" as const,
    requiresCPA: true,
    plainExplanation: "Maximize business deductions to reduce your taxable business income.",
    details: "Track and deduct legitimate business expenses including home office, equipment, travel, and professional development expenses. Working with a CPA can help ensure you claim all eligible deductions properly."
  }
] as const;

// Helper function to get base strategy by ID
function getBaseStrategy(id: string): Strategy {
  const strategy = BASE_STRATEGIES.find(s => s.strategyId === id);
  if (!strategy) {
    throw new Error(`Strategy with ID ${id} not found`);
  }
  return {...strategy};
}

// Strategy analysis functions
function analyzeRetirementStrategy(info: TaxInfo): Strategy | null {
  if (!info.hasRetirementPlan) {
    return null;
  }

  const marginalRate = calculateMarginalRate(info.income, info.filingStatus);
  const maxContribution = CONTRIBUTION_LIMITS.retirementPlan.basic;
  const currentContribution = info.currentRetirementContribution;
  
  if (currentContribution >= maxContribution) {
    return null;
  }

  const additionalContribution = maxContribution - (info.income * (currentContribution / 100));
  const savings = calculateTaxSavings(additionalContribution, marginalRate);

  return {
    ...getBaseStrategy("401k"),
    savings,
    plainExplanation: `You can save approximately $${savings.toLocaleString()} in taxes by increasing your 401(k) contribution to the maximum allowed ($${maxContribution.toLocaleString()}).`,
    details: `At your current marginal tax rate of ${(marginalRate * 100).toFixed(1)}%, contributing an additional $${additionalContribution.toLocaleString()} to your 401(k) would reduce your taxable income and save you $${savings.toLocaleString()} in taxes this year. This doesn't include potential employer matching, which would increase your benefits even further.`
  };
}

function analyzeHSAStrategy(info: TaxInfo): Strategy | null {
  if (!info.hasHSA) {
    return null;
  }

  const marginalRate = calculateMarginalRate(info.income, info.filingStatus);
  const limit = CONTRIBUTION_LIMITS.hsa.family; // Assuming family for maximum potential
  const savings = calculateTaxSavings(limit, marginalRate);

  return {
    ...getBaseStrategy("hsa"),
    savings,
    plainExplanation: `You can save approximately $${savings.toLocaleString()} in taxes by contributing to your HSA.`,
    details: `HSAs offer triple tax advantages: tax-deductible contributions, tax-free growth, and tax-free withdrawals for qualified medical expenses. At your tax rate of ${(marginalRate * 100).toFixed(1)}%, contributing the maximum of $${limit.toLocaleString()} would save you $${savings.toLocaleString()} in taxes this year.`
  };
}

function analyzePropertyStrategy(info: TaxInfo): Strategy | null {
  if (!info.isHomeowner || !info.mortgageInterest || !info.propertyTaxes) {
    return null;
  }

  const marginalRate = calculateMarginalRate(info.income, info.filingStatus);
  const totalDeductions = info.mortgageInterest + info.propertyTaxes;
  const savings = calculateTaxSavings(totalDeductions, marginalRate);

  return {
    ...getBaseStrategy("property_deductions"),
    savings,
    plainExplanation: `You could save $${savings.toLocaleString()} in taxes through mortgage interest and property tax deductions.`,
    details: `As a homeowner, you can deduct mortgage interest of $${info.mortgageInterest.toLocaleString()} and property taxes of $${info.propertyTaxes.toLocaleString()}. At your marginal tax rate of ${(marginalRate * 100).toFixed(1)}%, this results in $${savings.toLocaleString()} in tax savings.`
  };
}

function analyzeBusinessStrategy(info: TaxInfo): Strategy | null {
  if (!info.hasBusinessIncome || info.businessIncome <= 0) {
    return null;
  }

  const marginalRate = calculateMarginalRate(info.income, info.filingStatus);
  const estimatedDeductions = Math.round(info.businessIncome * 0.2); // Conservative estimate
  const savings = calculateTaxSavings(estimatedDeductions, marginalRate);

  return {
    ...getBaseStrategy("business_deductions"),
    savings,
    plainExplanation: `You could potentially save $${savings.toLocaleString()} in taxes through proper business expense tracking and deductions.`,
    details: `With business income of $${info.businessIncome.toLocaleString()}, you may be eligible for various business deductions including home office, equipment, travel, and professional development expenses. We recommend working with a CPA to maximize these deductions properly.`
  };
}

// Main strategy analysis function
export async function analyzeTaxStrategies(info: TaxInfo): Promise<Strategy[]> {
  const strategies: (Strategy | null)[] = [
    analyzeRetirementStrategy(info),
    analyzeHSAStrategy(info),
    analyzeBusinessStrategy(info),
    analyzePropertyStrategy(info)
  ];

  // Filter out null strategies and sort by savings (putting "varies" at the end)
  return strategies.filter((s): s is Strategy => s !== null)
    .sort((a, b) => {
      if (typeof a.savings === "number" && typeof b.savings === "number") {
        return b.savings - a.savings;
      }
      return typeof a.savings === "number" ? -1 : 1;
    });
}