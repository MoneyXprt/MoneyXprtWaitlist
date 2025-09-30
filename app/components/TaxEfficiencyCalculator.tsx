'use client';

import { useState, useEffect } from 'react';
import { 
  calculateFederalTax, 
  calculateCATax, 
  calculateEstateTax,
  TAX_CONSTANTS 
} from './tax/TaxBrackets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, Slider } from './tax/TaxComponents';

type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';
type StateCode = 'CA' | 'WY' | 'TX' | 'FL' | 'NY';

const STATE_TAX_RATES: Record<StateCode, number> = {
  CA: 0.133,
  NY: 0.109,
  TX: 0,
  FL: 0,
  WY: 0
};

interface FormInputs {
  filingStatus: FilingStatus;
  stateResidence: StateCode;
  annualIncome: number;
  assetTypes: ('real_estate' | 'stocks' | 'business')[];
  
  // Business/LLC
  startLLC: boolean;
  expectedExpenses: number;
  
  // Trust/FLP
  addTrust: boolean;
  transferAmount: number;
  heirCount: number;
  
  // Buy-Borrow-Die
  adoptBBD: boolean;
  borrowAmount: number;
  interestRate: number;
  
  // QSBS
  isQSBS: boolean;
  qsbsAmount: number;
  
  // Base amounts
  estateValue: number;
  existingExpenses: number;
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

export default function TaxEfficiencyCalculator() {
  const [activeSection, setActiveSection] = useState<string>('income');
  const [formInputs, setFormInputs] = useState<FormInputs>({
    filingStatus: 'married_joint',
    stateResidence: 'CA',
    annualIncome: 500000,
    assetTypes: [],
    
    // Business/LLC
    startLLC: false,
    expectedExpenses: 50000,
    
    // Trust/FLP
    addTrust: false,
    transferAmount: 1000000,
    heirCount: 2,
    
    // Buy-Borrow-Die
    adoptBBD: false,
    borrowAmount: 1000000,
    interestRate: 5,
    
    // QSBS
    isQSBS: false,
    qsbsAmount: 0,
    
    // Base amounts
    estateValue: 5000000,
    existingExpenses: 50000
  });

  const [scenarios, setScenarios] = useState<TaxScenario[]>([]);

  const handleInputChange = (field: keyof FormInputs, value: any) => {
    setFormInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAssetTypeToggle = (type: 'real_estate' | 'stocks' | 'business') => {
    setFormInputs(prev => ({
      ...prev,
      assetTypes: prev.assetTypes.includes(type)
        ? prev.assetTypes.filter(t => t !== type)
        : [...prev.assetTypes, type]
    }));
  };

  useEffect(() => {
    calculateScenarios();
  }, [formInputs]);

  const calculateScenarios = () => {
    // Base taxable income calculation
    const baseTaxableIncome = formInputs.annualIncome - TAX_CONSTANTS.FEDERAL_STD_DEDUCTION;
    const baseStateTaxableIncome = formInputs.annualIncome - TAX_CONSTANTS.CA_STD_DEDUCTION;

    // Baseline scenario (no structure)
    const baselineFederalTax = calculateFederalTax(baseTaxableIncome);
    const baselineStateTax = calculateCATax(baseStateTaxableIncome);
    const baselineEstateTax = calculateEstateTax(formInputs.estateValue);
    const baselineTotalTax = baselineFederalTax + baselineStateTax + baselineEstateTax;

    const baseline: TaxScenario = {
      name: 'Baseline (No Structure)',
      federalTax: baselineFederalTax,
      stateTax: baselineStateTax,
      estateTax: baselineEstateTax,
      totalTax: baselineTotalTax,
      savings: 0,
      strategies: ['Standard deductions only', 'No entity optimization']
    };

    // LLC Scenario
    const totalExpenses = formInputs.existingExpenses + (formInputs.startLLC ? formInputs.expectedExpenses : 0);
    const llcTaxableIncome = baseTaxableIncome - totalExpenses;
    const llcStateTaxableIncome = baseStateTaxableIncome - totalExpenses;
    const llcFederalTax = calculateFederalTax(llcTaxableIncome);
    const llcStateTax = calculateCATax(llcStateTaxableIncome);
    const llcEstateTax = baselineEstateTax; // Same as baseline
    const llcTotalTax = llcFederalTax + llcStateTax + llcEstateTax;

    const llc: TaxScenario = {
      name: 'LLC Structure',
      federalTax: llcFederalTax,
      stateTax: llcStateTax,
      estateTax: llcEstateTax,
      totalTax: llcTotalTax,
      savings: baselineTotalTax - llcTotalTax,
      strategies: ['Business expense deductions', 'Pass-through taxation', 'Asset protection']
    };

    // FLP/Trust Scenario
    const flpFederalTax = llcFederalTax; // Same as LLC for income
    const flpStateTax = llcStateTax;
    const flpEstateTax = calculateEstateTax(formInputs.estateValue, true); // Apply 30% discount
    const flpTotalTax = flpFederalTax + flpStateTax + flpEstateTax;

    const flp: TaxScenario = {
      name: 'FLP/Trust Structure',
      federalTax: flpFederalTax,
      stateTax: flpStateTax,
      estateTax: flpEstateTax,
      totalTax: flpTotalTax,
      savings: baselineTotalTax - flpTotalTax,
      strategies: ['30% valuation discount', 'Enhanced asset protection', 'Succession planning']
    };

    // Buy-Borrow-Die Scenario
    const borrowingCost = formInputs.borrowAmount * (formInputs.interestRate / 100);
    const deferredGains = formInputs.borrowAmount * TAX_CONSTANTS.CAPITAL_GAINS_RATE;
    
    const bbdFederalTax = llcFederalTax - deferredGains;
    const bbdStateTax = llcStateTax;
    const bbdEstateTax = flpEstateTax; // Use discounted estate value
    const bbdTotalTax = bbdFederalTax + bbdStateTax + bbdEstateTax + borrowingCost;

    const bbd: TaxScenario = {
      name: 'Buy-Borrow-Die Strategy',
      federalTax: bbdFederalTax,
      stateTax: bbdStateTax,
      estateTax: bbdEstateTax,
      totalTax: bbdTotalTax,
      savings: baselineTotalTax - bbdTotalTax,
      strategies: [
        'Tax-free liquidity through borrowing',
        'Capital gains deferral',
        'Step-up basis potential',
        `Interest cost: $${borrowingCost.toLocaleString()}/year`
      ]
    };

    setScenarios([baseline, llc, flp, bbd]);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6">
        {/* Income & Expenses Section */}
        <section className={`space-y-4 ${activeSection !== 'income' && 'opacity-60'}`}>
          <h3 
            className="text-lg font-semibold cursor-pointer hover:text-emerald-600"
            onClick={() => setActiveSection('income')}
          >
            Income & Expenses
          </h3>
          {activeSection === 'basics' && (
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content="Your filing status affects tax brackets and standard deduction amounts">
                    Filing Status
                  </Tooltip>
                </label>
                <select
                  value={formInputs.filingStatus}
                  onChange={(e) => handleInputChange('filingStatus', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="single">Single</option>
                  <option value="married_joint">Married Filing Jointly</option>
                  <option value="married_separate">Married Filing Separately</option>
                  <option value="head">Head of Household</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content="Your state of residence determines state tax rates and treatment of various items">
                    State of Residence
                  </Tooltip>
                </label>
                <select
                  value={formInputs.stateResidence}
                  onChange={(e) => handleInputChange('stateResidence', e.target.value as StateCode)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {Object.entries(STATE_TAX_RATES).map(([state, rate]) => (
                    <option key={state} value={state}>
                      {state} ({(rate * 100).toFixed(1)}% max rate)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content="Your total annual income from all sources">
                    Annual Income ($)
                  </Tooltip>
                </label>
                <Slider
                  label="Annual Income"
                  value={formInputs.annualIncome}
                  onChange={(value) => handleInputChange('annualIncome', value)}
                  min={0}
                  max={2000000}
                  step={10000}
                  tooltip="Your total annual income from all sources"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content="Current annual deductible expenses, not including potential new business expenses">
                    Existing Deductible Expenses ($)
                  </Tooltip>
                </label>
                <Input
                  type="number"
                  value={formInputs.existingExpenses}
                  onChange={(e) => handleInputChange('existingExpenses', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </section>

        {/* Assets & Entity Section */}
        <section className={`space-y-4 ${activeSection !== 'assets' && 'opacity-60'}`}>
          <h3 
            className="text-lg font-semibold cursor-pointer hover:text-emerald-600"
            onClick={() => setActiveSection('assets')}
          >
            Assets & Entity Structure
          </h3>
          {activeSection === 'assets' && (
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Asset Types</label>
                <div className="flex gap-3">
                  {['real_estate', 'stocks', 'business'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formInputs.assetTypes.includes(type as any)}
                        onChange={() => handleAssetTypeToggle(type as any)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm">{type.replace('_', ' ').toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="space-y-4">
                  {/* LLC Option */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formInputs.startLLC}
                      onChange={(e) => handleInputChange('startLLC', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm">Start LLC this year</span>
                  </label>
                  
                  {/* Trust/FLP Option */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formInputs.addTrust}
                      onChange={(e) => handleInputChange('addTrust', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm">Add Trust/FLP this year</span>
                  </label>
                  
                  {/* Buy-Borrow-Die Option */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formInputs.adoptBBD}
                      onChange={(e) => handleInputChange('adoptBBD', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm">Adopt Buy-Borrow-Die strategy</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Estate Planning Section */}
        <section className={`space-y-4 ${activeSection !== 'estate' && 'opacity-60'}`}>
          <h3 
            className="text-lg font-semibold cursor-pointer hover:text-emerald-600"
            onClick={() => setActiveSection('estate')}
          >
            Estate Planning
          </h3>
          {activeSection === 'estate' && (
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Estate Value ($)</label>
                <Input
                  type="number"
                  value={formInputs.estateValue}
                  onChange={(e) => handleInputChange('estateValue', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content="Amount planned to transfer to trust or family limited partnership">
                    Planned Transfers ($)
                  </Tooltip>
                </label>
                <Input
                  type="number"
                  value={formInputs.transferAmount}
                  onChange={(e) => handleInputChange('transferAmount', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Tooltip content="Number of heirs for trust/FLP planning">
                    Number of Heirs
                  </Tooltip>
                </label>
                <Input
                  type="number"
                  value={formInputs.heirCount}
                  onChange={(e) => handleInputChange('heirCount', Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </section>

        {/* Strategy Section */}
        <section className={`space-y-4 ${activeSection !== 'strategy' && 'opacity-60'}`}>
          <h3 
            className="text-lg font-semibold cursor-pointer hover:text-emerald-600"
            onClick={() => setActiveSection('strategy')}
          >
            Investment Strategy
          </h3>
          {activeSection === 'strategy' && (
            <div className="grid gap-4">
              <div className="space-y-4">
                {/* QSBS Option */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formInputs.isQSBS}
                    onChange={(e) => handleInputChange('isQSBS', e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm">QSBS Eligible Investment</span>
                </label>
                
                {formInputs.isQSBS && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      <Tooltip content="Amount of QSBS eligible gains (max $10M per issuer)">
                        QSBS Amount ($)
                      </Tooltip>
                    </label>
                    <Input
                      type="number"
                      value={formInputs.qsbsAmount}
                      onChange={(e) => handleInputChange('qsbsAmount', Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
                
                {formInputs.adoptBBD && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <Tooltip content="Amount to borrow against assets">
                          Borrowing Amount ($)
                        </Tooltip>
                      </label>
                      <Input
                        type="number"
                        value={formInputs.borrowAmount}
                        onChange={(e) => handleInputChange('borrowAmount', Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <Tooltip content="Annual interest rate on borrowed amount">
                          Interest Rate (%)
                        </Tooltip>
                      </label>
                      <Input
                        type="number"
                        value={formInputs.interestRate}
                        onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <Button 
          onClick={() => calculateScenarios()}
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3"
        >
          Analyze Tax Strategies
        </Button>
        <p className="text-sm text-center text-gray-500 mt-2">
          Results will update automatically as you make changes
        </p>
      </div>

      {/* Results Section */}
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
                    <div className="flex justify-between text-emerald-600 font-semibold">
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
            <p className="mb-2">
              These calculations are based on projected 2025 tax rates including TCJA sunset changes.
              All scenarios assume married filing jointly status and California residency.
            </p>
            <p>
              DISCLAIMER: These calculations are estimates based on simplified assumptions and current tax laws.
              Actual results may vary significantly. Please consult with qualified tax and legal professionals
              before implementing any tax planning strategies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}