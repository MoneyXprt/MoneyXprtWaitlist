// Tax brackets and constants for 2025
export const FEDERAL_BRACKETS_2025_MFJ = [
  { threshold: 0, rate: 0.10 },
  { threshold: 23850, rate: 0.12 },
  { threshold: 96950, rate: 0.22 },
  { threshold: 206700, rate: 0.24 },
  { threshold: 394600, rate: 0.32 },
  { threshold: 501050, rate: 0.35 },
  { threshold: 751600, rate: 0.37 }
];

export const CA_BRACKETS_2025 = [
  { threshold: 0, rate: 0.01 },
  { threshold: 20952, rate: 0.02 },
  { threshold: 49646, rate: 0.04 },
  { threshold: 78384, rate: 0.06 },
  { threshold: 108726, rate: 0.08 },
  { threshold: 139384, rate: 0.093 },
  { threshold: 349846, rate: 0.103 },
  { threshold: 419708, rate: 0.113 },
  { threshold: 698350, rate: 0.123 }
];

export const TAX_CONSTANTS = {
  FEDERAL_ESTATE_EXEMPTION: 15000000,
  ESTATE_TAX_RATE: 0.40,
  FEDERAL_STD_DEDUCTION: 30000,
  CA_STD_DEDUCTION: 11080,
  CA_MHST_THRESHOLD: 1000000,
  CA_MHST_RATE: 0.01,
  CAPITAL_GAINS_RATE: 0.20,
  FLP_DISCOUNT: 0.30
};

export function calculateFederalTax(taxableIncome: number): number {
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (let i = 0; i < FEDERAL_BRACKETS_2025_MFJ.length; i++) {
    const bracket = FEDERAL_BRACKETS_2025_MFJ[i];
    const nextBracket = FEDERAL_BRACKETS_2025_MFJ[i + 1];
    
    const taxableInThisBracket = nextBracket 
      ? Math.min(remainingIncome, nextBracket.threshold - bracket.threshold)
      : remainingIncome;

    if (taxableInThisBracket <= 0) break;

    tax += taxableInThisBracket * bracket.rate;
    remainingIncome -= taxableInThisBracket;
  }

  return tax;
}

export function calculateCATax(taxableIncome: number): number {
  let tax = 0;
  let remainingIncome = taxableIncome;

  // Regular CA tax brackets
  for (let i = 0; i < CA_BRACKETS_2025.length; i++) {
    const bracket = CA_BRACKETS_2025[i];
    const nextBracket = CA_BRACKETS_2025[i + 1];
    
    const taxableInThisBracket = nextBracket 
      ? Math.min(remainingIncome, nextBracket.threshold - bracket.threshold)
      : remainingIncome;

    if (taxableInThisBracket <= 0) break;

    tax += taxableInThisBracket * bracket.rate;
    remainingIncome -= taxableInThisBracket;
  }

  // Mental Health Services Tax (MHST) for income over $1M
  if (taxableIncome > TAX_CONSTANTS.CA_MHST_THRESHOLD) {
    tax += (taxableIncome - TAX_CONSTANTS.CA_MHST_THRESHOLD) * TAX_CONSTANTS.CA_MHST_RATE;
  }

  return tax;
}

export function calculateEstateTax(estateValue: number, applyDiscount = false): number {
  const discountedValue = applyDiscount 
    ? estateValue * (1 - TAX_CONSTANTS.FLP_DISCOUNT) 
    : estateValue;
    
  const taxableEstate = Math.max(0, discountedValue - TAX_CONSTANTS.FEDERAL_ESTATE_EXEMPTION);
  return taxableEstate * TAX_CONSTANTS.ESTATE_TAX_RATE;
}