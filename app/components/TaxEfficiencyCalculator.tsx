'use client';

import { useState } from 'react';
import type { FilingStatus } from '@/lib/types';

interface AssetBase {
  value: number;
  type: 'real_estate' | 'stocks' | 'business' | 'other';
}

interface EntityStructure {
  type: 'none' | 'llc' | 'trust' | 'flp';
  expenses?: number;
}

interface TaxEfficiencyInputs {
  filingStatus: FilingStatus;
  assets: AssetBase[];
  currentEntities: EntityStructure[];
  stateResidence: string;
  plannedGifts: {
    amount: number;
    recipients: number;
  };
  investmentStrategy: 'long_term' | 'qsbs' | 'mixed';
  annualExpenses: {
    fees: number;
    donations: number;
    other: number;
  };
  debtPlans: {
    existingDebt: number;
    plannedBorrowing: number;
    collateralType: 'securities' | 'real_estate' | 'mixed';
  };
  estateSize: number;
}

interface TaxScenario {
  name: string;
  federalTax: number;
  stateTax: number;
  estateTax: number;
  totalTax: number;
  savings: number;
  strategies: string[];
}

const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.133,
  NY: 0.109,
  TX: 0,
  FL: 0,
  WY: 0,
  // Add more states
};

const FEDERAL_BRACKETS_2025 = [
  { threshold: 0, rate: 0.10 },
  { threshold: 11600, rate: 0.12 },
  { threshold: 47150, rate: 0.22 },
  { threshold: 100525, rate: 0.24 },
  { threshold: 191950, rate: 0.32 },
  { threshold: 243725, rate: 0.35 },
  { threshold: 609350, rate: 0.37 }
];

export default function TaxEfficiencyCalculator() {
  const [inputs, setInputs] = useState<TaxEfficiencyInputs>({
    filingStatus: 'single',
    assets: [],
    currentEntities: [],
    stateResidence: 'CA',
    plannedGifts: { amount: 0, recipients: 0 },
    investmentStrategy: 'long_term',
    annualExpenses: { fees: 0, donations: 0, other: 0 },
    debtPlans: { existingDebt: 0, plannedBorrowing: 0, collateralType: 'securities' },
    estateSize: 0
  });

  const [scenarios, setScenarios] = useState<TaxScenario[]>([]);

  // Calculate baseline scenario (no structuring)
  const calculateBaselineTax = () => {
    const totalIncome = inputs.assets.reduce((sum, asset) => {
      // Simplified income calculation
      const incomeRate = asset.type === 'business' ? 0.25 : 0.04;
      return sum + (asset.value * incomeRate);
    }, 0);

    const federalTax = calculateFederalTax(totalIncome);
    const stateTax = totalIncome * (STATE_TAX_RATES[inputs.stateResidence] || 0);
    const estateTax = calculateEstateTax(inputs.estateSize);

    return {
      name: 'Baseline',
      federalTax,
      stateTax,
      estateTax,
      totalTax: federalTax + stateTax + estateTax,
      savings: 0,
      strategies: ['Current structure without optimization']
    };
  };

  // Calculate LLC scenario
  const calculateLLCScenario = () => {
    const totalExpenses = inputs.annualExpenses.fees + 
                         inputs.annualExpenses.donations + 
                         inputs.annualExpenses.other;
    const netIncome = inputs.assets.reduce((sum, asset) => {
      const incomeRate = asset.type === 'business' ? 0.25 : 0.04;
      return sum + (asset.value * incomeRate);
    }, 0) - totalExpenses;

    const federalTax = calculateFederalTax(netIncome);
    const stateTax = netIncome * (STATE_TAX_RATES[inputs.stateResidence] || 0);
    const estateTax = calculateEstateTax(inputs.estateSize);

    const baselineTax = calculateBaselineTax();
    const savings = baselineTax.totalTax - (federalTax + stateTax + estateTax);

    return {
      name: 'LLC Structure',
      federalTax,
      stateTax,
      estateTax,
      totalTax: federalTax + stateTax + estateTax,
      savings,
      strategies: [
        'Expense deductions through LLC',
        'Business asset protection',
        'Pass-through taxation benefits'
      ]
    };
  };

  // Calculate FLP/Trust scenario
  const calculateFLPTrustScenario = () => {
    const discountedEstateValue = inputs.estateSize * 0.7; // 30% valuation discount
    const estateTax = calculateEstateTax(discountedEstateValue);
    
    const baselineTax = calculateBaselineTax();
    const savings = baselineTax.estateTax - estateTax;

    return {
      name: 'FLP/Trust Structure',
      federalTax: baselineTax.federalTax,
      stateTax: baselineTax.stateTax,
      estateTax,
      totalTax: baselineTax.federalTax + baselineTax.stateTax + estateTax,
      savings,
      strategies: [
        '30% valuation discount for estate tax',
        'Asset protection benefits',
        'Streamlined wealth transfer'
      ]
    };
  };

  // Calculate Buy-Borrow-Die scenario
  const calculateBBDScenario = () => {
    const borrowingRate = 0.05;
    const borrowingCost = inputs.debtPlans.plannedBorrowing * borrowingRate;
    const deferredGains = inputs.debtPlans.plannedBorrowing * 0.20; // Assumed capital gains rate

    const baselineTax = calculateBaselineTax();
    const savings = deferredGains - borrowingCost;

    return {
      name: 'Buy-Borrow-Die Strategy',
      federalTax: baselineTax.federalTax - deferredGains,
      stateTax: baselineTax.stateTax,
      estateTax: baselineTax.estateTax,
      totalTax: baselineTax.totalTax - deferredGains + borrowingCost,
      savings,
      strategies: [
        'Tax-free liquidity through borrowing',
        'Capital gains deferral',
        'Step-up basis potential'
      ]
    };
  };

  // Helper function to calculate federal tax
  const calculateFederalTax = (income: number) => {
    let tax = 0;
    let remainingIncome = income;

    for (let i = 0; i < FEDERAL_BRACKETS_2025.length; i++) {
      const bracket = FEDERAL_BRACKETS_2025[i];
      const nextBracket = FEDERAL_BRACKETS_2025[i + 1];
      
      const taxableInThisBracket = nextBracket 
        ? Math.min(remainingIncome, nextBracket.threshold - bracket.threshold)
        : remainingIncome;

      if (taxableInThisBracket <= 0) break;

      tax += taxableInThisBracket * bracket.rate;
      remainingIncome -= taxableInThisBracket;
    }

    return tax;
  };

  // Helper function to calculate estate tax
  const calculateEstateTax = (estateValue: number) => {
    const exemption = 15000000; // $15M exemption post-OBBBA 2025
    const taxableEstate = Math.max(0, estateValue - exemption);
    return taxableEstate * 0.40; // 40% estate tax rate
  };

  // Calculate all scenarios
  const calculateScenarios = () => {
    const newScenarios = [
      calculateBaselineTax(),
      calculateLLCScenario(),
      calculateFLPTrustScenario(),
      calculateBBDScenario()
    ];
    setScenarios(newScenarios);
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-semibold">Tax Efficiency Calculator</h2>
      
      {/* Input Form */}
      <form className="space-y-6" onSubmit={(e) => {
        e.preventDefault();
        calculateScenarios();
      }}>
        {/* Filing Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Filing Status</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={inputs.filingStatus}
            onChange={(e) => setInputs({
              ...inputs,
              filingStatus: e.target.value as FilingStatus
            })}
          >
            <option value="single">Single</option>
            <option value="married_joint">Married Filing Jointly</option>
            <option value="married_separate">Married Filing Separately</option>
            <option value="head">Head of Household</option>
          </select>
        </div>

        {/* State Residence */}
        <div>
          <label className="block text-sm font-medium text-gray-700">State of Residence</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={inputs.stateResidence}
            onChange={(e) => setInputs({
              ...inputs,
              stateResidence: e.target.value
            })}
          >
            {Object.keys(STATE_TAX_RATES).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Estate Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Estate Value</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={inputs.estateSize}
            onChange={(e) => setInputs({
              ...inputs,
              estateSize: Number(e.target.value)
            })}
          />
        </div>

        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Calculate Scenarios
        </button>
      </form>

      {/* Results Display */}
      {scenarios.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Tax Optimization Scenarios</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {scenarios.map((scenario, index) => (
              <div key={index} className="border rounded-lg p-4 shadow">
                <h4 className="text-lg font-medium mb-2">{scenario.name}</h4>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt>Federal Tax:</dt>
                    <dd>${scenario.federalTax.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>State Tax:</dt>
                    <dd>${scenario.stateTax.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Estate Tax:</dt>
                    <dd>${scenario.estateTax.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <dt>Total Tax:</dt>
                    <dd>${scenario.totalTax.toLocaleString()}</dd>
                  </div>
                  {scenario.savings > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <dt>Potential Savings:</dt>
                      <dd>${scenario.savings.toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Recommended Strategies:</h5>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {scenario.strategies.map((strategy, i) => (
                      <li key={i}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <p>Disclaimer: These calculations are estimates based on current tax laws and simplified assumptions. 
            Actual results may vary. Please consult with qualified tax and legal professionals before implementing any strategies.</p>
          </div>
        </div>
      )}
    </div>
  );
}