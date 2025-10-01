// Types for tax strategy calculations
export type Strategy = {
  strategyId: string;
  title: string;
  savings: number | "varies";
  complexity: "Easy" | "Medium" | "Advanced";
  requiresCPA: boolean;
  plainExplanation: string;
  details: string;
};

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

export type TaxInputs = {
  filingStatus: FilingStatus;
  annualIncome: number;
  stateCode: StateCode;
  current401kContribution: number;
  hsaEligible: boolean;
  sideBusinessIncome: number;
  hasRealEstate: boolean;
  propertyCost?: number;
  age: number;
  capitalGains?: number;
};

// Base strategies with detailed explanations
export const strategies: Strategy[] = [
  {
    strategyId: "401k",
    title: "Maximize Your 401(k) Contribution",
    savings: "varies",
    complexity: "Easy",
    requiresCPA: false,
    plainExplanation: "Every dollar you put in your 401(k) reduces your taxable income by the same amount. If you're in a high tax bracket, this can mean big savings.",
    details: "For 2025, you can contribute up to $23,000 to your 401(k), or $30,500 if you're 50 or older. This money comes out of your paycheck before taxes, which means you pay less in taxes now. For example, if you're in the 32% tax bracket, contributing $10,000 more to your 401(k) could save you $3,200 in taxes this year."
  },
  {
    strategyId: "hsa",
    title: "Use a Health Savings Account (HSA)",
    savings: "varies",
    complexity: "Easy",
    requiresCPA: false,
    plainExplanation: "An HSA is like a special savings account that gives you three tax breaks: the money goes in tax-free, grows tax-free, and comes out tax-free when used for health costs.",
    details: "For 2025, you can put up to $4,150 in an HSA if you're single, or $8,300 for family coverage. If you're 55 or older, you can add an extra $1,000. Unlike FSAs, the money rolls over each year and can be invested. Think of it as a medical 401(k) with better tax benefits."
  },
  {
    strategyId: "roth",
    title: "Backdoor Roth IRA Strategy",
    savings: "varies",
    complexity: "Medium",
    requiresCPA: true,
    plainExplanation: "Even if you make too much for a regular Roth IRA, you can still get money into one through the 'backdoor' - converting a traditional IRA contribution.",
    details: "First, you make a non-deductible contribution to a traditional IRA (up to $7,000 in 2025). Then, you convert it to a Roth IRA. There's usually no tax on the conversion if you do it right away. The money then grows tax-free and comes out tax-free in retirement."
  },
  {
    strategyId: "solo401k",
    title: "Open a Solo 401(k) for Side Income",
    savings: "varies",
    complexity: "Medium",
    requiresCPA: true,
    plainExplanation: "If you have self-employed income, you can save way more for retirement with a Solo 401(k) than a regular 401(k) - potentially reducing your taxes by thousands.",
    details: "With a Solo 401(k), you can contribute both as employee AND employer. In 2025, you could potentially put away up to $69,000 total ($76,500 if 50+). This dramatically reduces your taxable income from self-employment."
  },
  {
    strategyId: "realEstate",
    title: "Real Estate Tax Benefits",
    savings: "varies",
    complexity: "Advanced",
    requiresCPA: true,
    plainExplanation: "Real estate can provide multiple tax benefits through depreciation, mortgage interest deductions, and property tax deductions.",
    details: "The IRS lets you deduct the theoretical 'wear and tear' on rental properties over 27.5 years (called depreciation). This creates a paper loss that reduces your taxable income, even if the property is actually gaining value. Plus, you can deduct mortgage interest and property taxes."
  },
  {
    strategyId: "scorp",
    title: "S-Corporation Tax Strategy",
    savings: "varies",
    complexity: "Advanced",
    requiresCPA: true,
    plainExplanation: "If you have significant self-employment income, an S-Corp can help you save on self-employment taxes by splitting your income between salary and distributions.",
    details: "Instead of paying 15.3% self-employment tax on all your business profit, you only pay it on your 'reasonable salary.' The rest can be taken as distributions, which aren't subject to self-employment tax. This could save thousands, but you need a CPA to do it right."
  },
  {
    strategyId: "costSeg",
    title: "Cost Segregation Study",
    savings: "varies",
    complexity: "Advanced",
    requiresCPA: true,
    plainExplanation: "A cost segregation study lets you depreciate parts of your commercial property faster, creating bigger tax deductions sooner rather than later.",
    details: "Instead of depreciating the entire building over 39 years, you identify components that can be depreciated over 5, 7, or 15 years. This accelerates your tax deductions, putting more money in your pocket now instead of decades later."
  },
  {
    strategyId: "qoz",
    title: "Qualified Opportunity Zone Investment",
    savings: "varies",
    complexity: "Advanced",
    requiresCPA: true,
    plainExplanation: "If you have capital gains, you can defer paying taxes on them by investing in certain low-income neighborhoods (Opportunity Zones). You might also reduce or eliminate taxes on the new investment's gains.",
    details: "You can defer capital gains taxes until 2026 by investing in a Qualified Opportunity Zone. If you hold the investment for 10 years, any appreciation in the QOZ investment becomes tax-free. This is complex but could save significant taxes on large capital gains."
  },
  {
    strategyId: "cashBalance",
    title: "Cash Balance Pension Plan",
    savings: "varies",
    complexity: "Advanced",
    requiresCPA: true,
    plainExplanation: "A cash balance plan lets high-earners save way more for retirement than a 401(k) - sometimes over $200,000 per year tax-deferred, depending on your age.",
    details: "Think of it as a super-charged 401(k). Contributions are age-based and can be very large. If you're over 50 and earning high income, you might be able to contribute $100,000+ per year tax-deferred. This requires an actuary and CPA to set up and maintain."
  }
];

// === Calculation Functions ===

// Calculate federal marginal tax rate
function getMarginalRate(income: number, filingStatus: FilingStatus): number {
  // 2025 tax brackets
  if (filingStatus === "married") {
    if (income > 693750) return 0.37;
    if (income > 462500) return 0.35;
    if (income > 364200) return 0.32;
    if (income > 190750) return 0.24;
    if (income > 89450) return 0.22;
    return 0.12;
  } else {
    if (income > 578100) return 0.37;
    if (income > 231250) return 0.35;
    if (income > 182100) return 0.32;
    if (income > 95375) return 0.24;
    if (income > 44725) return 0.22;
    return 0.12;
  }
}

// 401k tax savings: pre-tax contribution * marginal tax rate
export function calculate401kSavings(income: number, currentContribution: number, filingStatus: FilingStatus): Strategy {
  const maxContribution = income > 50 ? 30500 : 23000; // 2025 limits
  const additionalPossible = Math.max(0, maxContribution - currentContribution);
  const marginalRate = getMarginalRate(income, filingStatus);
  const savings = additionalPossible * marginalRate;
  
  return {
    ...strategies.find(s => s.strategyId === "401k")!,
    savings: Math.round(savings)
  };
}

// HSA savings: contribution * marginal tax rate
export function calculateHSASavings(income: number, filingStatus: FilingStatus): Strategy {
  const maxContribution = filingStatus === "married" ? 8300 : 4150; // 2025 limits
  const marginalRate = getMarginalRate(income, filingStatus);
  const savings = maxContribution * marginalRate;
  
  return {
    ...strategies.find(s => s.strategyId === "hsa")!,
    savings: Math.round(savings)
  };
}

// Backdoor Roth: no immediate tax savings, mark as "varies"
export function calculateBackdoorRothEligibility(income: number, filingStatus: FilingStatus): Strategy {
  const eligible = filingStatus === "married" ? income > 228000 : income > 153000;
  return {
    ...strategies.find(s => s.strategyId === "roth")!,
    savings: eligible ? "varies" : 0
  };
}

// Solo 401k: assume 20% of side income can be contributed
export function calculateSolo401kContribution(sideBusinessIncome: number, income: number, filingStatus: FilingStatus): Strategy {
  const contribution = Math.min(sideBusinessIncome * 0.20, 69000);
  const marginalRate = getMarginalRate(income, filingStatus);
  return {
    ...strategies.find(s => s.strategyId === "solo401k")!,
    savings: Math.round(contribution * marginalRate)
  };
}

// Real Estate Depreciation: ~3.6% of property cost annually
export function calculateRealEstateDepreciation(propertyCost: number, income: number, filingStatus: FilingStatus): Strategy {
  const depreciation = propertyCost * 0.036;
  const marginalRate = getMarginalRate(income, filingStatus);
  return {
    ...strategies.find(s => s.strategyId === "realEstate")!,
    savings: Math.round(depreciation * marginalRate)
  };
}

// Advanced strategies return "varies" until refined
export function estimateSCorpSavings(sideBusinessIncome: number): Strategy {
  const savings = sideBusinessIncome > 100000 ? "varies" : 0;
  return {
    ...strategies.find(s => s.strategyId === "scorp")!,
    savings
  };
}

export function estimateCostSegregation(propertyCost: number): Strategy {
  const savings = propertyCost > 500000 ? "varies" : 0;
  return {
    ...strategies.find(s => s.strategyId === "costSeg")!,
    savings
  };
}

export function estimateQOZDeferral(capitalGains: number = 0): Strategy {
  const savings = capitalGains > 100000 ? "varies" : 0;
  return {
    ...strategies.find(s => s.strategyId === "qoz")!,
    savings
  };
}

export function estimateCashBalancePlanContribution(income: number, age: number): Strategy {
  const savings = (income > 300000 && age > 45) ? "varies" : 0;
  return {
    ...strategies.find(s => s.strategyId === "cashBalance")!,
    savings
  };
}

// Main function to analyze all strategies
export function analyzeAllStrategies(inputs: TaxInputs): Strategy[] {
  const strategies = [
    calculate401kSavings(inputs.annualIncome, inputs.current401kContribution, inputs.filingStatus),
    inputs.hsaEligible ? calculateHSASavings(inputs.annualIncome, inputs.filingStatus) : null,
    calculateBackdoorRothEligibility(inputs.annualIncome, inputs.filingStatus),
    inputs.sideBusinessIncome ? calculateSolo401kContribution(inputs.sideBusinessIncome, inputs.annualIncome, inputs.filingStatus) : null,
    inputs.hasRealEstate && inputs.propertyCost ? calculateRealEstateDepreciation(inputs.propertyCost, inputs.annualIncome, inputs.filingStatus) : null,
    inputs.sideBusinessIncome ? estimateSCorpSavings(inputs.sideBusinessIncome) : null,
    inputs.hasRealEstate && inputs.propertyCost ? estimateCostSegregation(inputs.propertyCost) : null,
    inputs.capitalGains ? estimateQOZDeferral(inputs.capitalGains) : null,
    estimateCashBalancePlanContribution(inputs.annualIncome, inputs.age)
  ].filter((strategy): strategy is Strategy => strategy !== null);

  // Sort by complexity (Easy first) and then by savings (highest first)
  return strategies.sort((a, b) => {
    const complexityOrder = { "Easy": 0, "Medium": 1, "Advanced": 2 };
    if (complexityOrder[a.complexity] !== complexityOrder[b.complexity]) {
      return complexityOrder[a.complexity] - complexityOrder[b.complexity];
    }
    if (typeof a.savings === "number" && typeof b.savings === "number") {
      return b.savings - a.savings;
    }
    return 0;
  });
}