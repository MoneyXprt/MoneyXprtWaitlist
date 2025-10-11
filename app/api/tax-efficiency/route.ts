import { NextResponse } from 'next/server';
import log from '@/lib/logger';
import type { TaxEfficiencyInputs, TaxScenario } from '@/lib/types/tax-efficiency';

const TAX_RATES_2025 = {
  federal: {
    brackets: [
      { threshold: 0, rate: 0.10 },
      { threshold: 11600, rate: 0.12 },
      { threshold: 47150, rate: 0.22 },
      { threshold: 100525, rate: 0.24 },
      { threshold: 191950, rate: 0.32 },
      { threshold: 243725, rate: 0.35 },
      { threshold: 609350, rate: 0.37 }
    ],
    estateExemption: 15000000,
    estateRate: 0.40,
    capitalGains: {
      short: 0.37,
      long: 0.20
    }
  },
  state: {
    CA: 0.133,
    NY: 0.109,
    TX: 0,
    FL: 0,
    WY: 0
  }
};

export async function POST(request: Request) {
  try {
    const inputs: TaxEfficiencyInputs = await request.json();
    
    // Calculate all scenarios
    const scenarios = await calculateAllScenarios(inputs);
    
    return NextResponse.json({ scenarios });
  } catch (error) {
    log.error('Tax calculation error', { error: (error as any)?.message || String(error) });
    return NextResponse.json(
      { error: 'Failed to calculate tax scenarios' },
      { status: 500 }
    );
  }
}

async function calculateAllScenarios(inputs: TaxEfficiencyInputs): Promise<TaxScenario[]> {
  const baseline = calculateBaselineScenario(inputs);
  const llc = calculateLLCScenario(inputs, baseline);
  const flpTrust = calculateFLPTrustScenario(inputs, baseline);
  const bbd = calculateBBDScenario(inputs, baseline);
  const qsbs = calculateQSBSScenario(inputs, baseline);

  return [baseline, llc, flpTrust, bbd, qsbs];
}

function calculateBaselineScenario(inputs: TaxEfficiencyInputs): TaxScenario {
  // Calculate total income from assets
  const totalIncome = inputs.assets.reduce((sum, asset) => {
    const incomeRate = getAssetIncomeRate(asset.type);
    return sum + (asset.value * incomeRate);
  }, 0);

  // Calculate federal income tax
  const federalTax = calculateFederalTax(totalIncome);
  
  // Calculate state tax
  const stateTax = totalIncome * TAX_RATES_2025.state[inputs.stateResidence];
  
  // Calculate estate tax
  const estateTax = calculateEstateTax(inputs.estateSize);

  return {
    name: 'Current Structure (Baseline)',
    federalTax,
    stateTax,
    estateTax,
    totalTax: federalTax + stateTax + estateTax,
    savings: 0,
    strategies: ['Current structure without optimization'],
    assumptions: [
      'Based on 2025 tax rates post-OBBBA',
      'Assumes all income is ordinary income',
      'No special deductions or credits applied'
    ]
  };
}

function calculateLLCScenario(
  inputs: TaxEfficiencyInputs,
  baseline: TaxScenario
): TaxScenario {
  const totalExpenses = 
    inputs.annualExpenses.fees +
    inputs.annualExpenses.donations +
    inputs.annualExpenses.other;

  const netIncome = inputs.assets.reduce((sum, asset) => {
    const incomeRate = getAssetIncomeRate(asset.type);
    return sum + (asset.value * incomeRate);
  }, 0) - totalExpenses;

  const federalTax = calculateFederalTax(netIncome);
  const stateTax = netIncome * TAX_RATES_2025.state[inputs.stateResidence];
  const estateTax = baseline.estateTax; // Assuming same estate tax treatment

  const totalTax = federalTax + stateTax + estateTax;
  const savings = baseline.totalTax - totalTax;

  return {
    name: 'LLC Structure',
    federalTax,
    stateTax,
    estateTax,
    totalTax,
    savings,
    strategies: [
      'Business expense deductions',
      'Asset protection',
      'Pass-through taxation'
    ],
    assumptions: [
      'All expenses qualify as business deductions',
      'LLC properly structured and maintained',
      'Operating agreement in place'
    ]
  };
}

function calculateFLPTrustScenario(
  inputs: TaxEfficiencyInputs,
  baseline: TaxScenario
): TaxScenario {
  // Apply 30% valuation discount
  const discountedEstateValue = inputs.estateSize * 0.7;
  const estateTax = calculateEstateTax(discountedEstateValue);

  const totalTax = baseline.federalTax + baseline.stateTax + estateTax;
  const savings = baseline.totalTax - totalTax;

  return {
    name: 'FLP/Trust Structure',
    federalTax: baseline.federalTax,
    stateTax: baseline.stateTax,
    estateTax,
    totalTax,
    savings,
    strategies: [
      '30% valuation discount on estate tax',
      'Asset protection',
      'Generational wealth transfer'
    ],
    assumptions: [
      'Valid business purpose for FLP',
      'Proper documentation and maintenance',
      'IRS accepts valuation discount'
    ]
  };
}

function calculateBBDScenario(
  inputs: TaxEfficiencyInputs,
  baseline: TaxScenario
): TaxScenario {
  const borrowingRate = 0.05; // 5% interest rate
  const borrowingCost = inputs.debtPlans.plannedBorrowing * borrowingRate;
  
  // Assume 20% capital gains avoided on appreciated assets
  const deferredGains = inputs.debtPlans.plannedBorrowing * 0.20;
  
  const federalTax = baseline.federalTax - deferredGains;
  const totalTax = federalTax + baseline.stateTax + baseline.estateTax + borrowingCost;
  const savings = baseline.totalTax - totalTax;

  return {
    name: 'Buy-Borrow-Die Strategy',
    federalTax,
    stateTax: baseline.stateTax,
    estateTax: baseline.estateTax,
    totalTax,
    savings,
    strategies: [
      'Leverage appreciated assets',
      'Defer capital gains',
      'Utilize step-up basis'
    ],
    assumptions: [
      '5% borrowing rate',
      'Assets appreciate faster than borrowing cost',
      'Step-up basis remains in tax code'
    ]
  };
}

function calculateQSBSScenario(
  inputs: TaxEfficiencyInputs,
  baseline: TaxScenario
): TaxScenario {
  // Only relevant for business assets
  const qsbsAssets = inputs.assets.filter(a => a.type === 'business');
  const qsbsValue = Math.min(
    qsbsAssets.reduce((sum, asset) => sum + asset.value, 0),
    10000000 // $10M QSBS exclusion cap
  );

  const excludedGains = qsbsValue * 0.20; // Assuming 20% capital gains rate
  const federalTax = baseline.federalTax - excludedGains;
  
  // Assume no state tax in qualifying jurisdictions
  const stateTax = inputs.stateResidence === 'WY' ? 0 : baseline.stateTax;
  
  const totalTax = federalTax + stateTax + baseline.estateTax;
  const savings = baseline.totalTax - totalTax;

  return {
    name: 'QSBS Strategy',
    federalTax,
    stateTax,
    estateTax: baseline.estateTax,
    totalTax,
    savings,
    strategies: [
      'QSBS $10M gain exclusion',
      'State tax optimization',
      'Early planning for qualification'
    ],
    assumptions: [
      'Meets QSBS requirements',
      'Within $10M exclusion limit',
      'Proper holding period met'
    ]
  };
}

// Helper functions
function getAssetIncomeRate(type: string): number {
  switch (type) {
    case 'business': return 0.25;  // 25% return
    case 'real_estate': return 0.06;  // 6% cap rate
    case 'stocks': return 0.04;  // 4% dividend yield
    default: return 0.02;  // 2% other
  }
}

function calculateFederalTax(income: number): number {
  let tax = 0;
  let remainingIncome = income;

  for (let i = 0; i < TAX_RATES_2025.federal.brackets.length; i++) {
    const bracket = TAX_RATES_2025.federal.brackets[i];
    const nextBracket = TAX_RATES_2025.federal.brackets[i + 1];
    
    const taxableInThisBracket = nextBracket 
      ? Math.min(remainingIncome, nextBracket.threshold - bracket.threshold)
      : remainingIncome;

    if (taxableInThisBracket <= 0) break;

    tax += taxableInThisBracket * bracket.rate;
    remainingIncome -= taxableInThisBracket;
  }

  return tax;
}

function calculateEstateTax(estateValue: number): number {
  const taxableEstate = Math.max(0, estateValue - TAX_RATES_2025.federal.estateExemption);
  return taxableEstate * TAX_RATES_2025.federal.estateRate;
}
