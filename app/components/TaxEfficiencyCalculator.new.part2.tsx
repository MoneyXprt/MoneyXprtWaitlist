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
  savingsPercent: number;
  strategies: string[];
}

export default function TaxEfficiencyCalculator() {
  const [activeSection, setActiveSection] = useState<string>('basics');
  const [formInputs, setFormInputs] = useState<FormInputs>({
    filingStatus: 'married_joint',
    stateResidence: 'CA',
    annualIncome: 350000,
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

  useEffect(() => {
    calculateScenarios();
  }, [formInputs]);

  const calculateScenarios = () => {
    // Base calculations
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
      savingsPercent: 0,
      strategies: ['Standard deductions only']
    };

    const scenarios = [baseline];

    // LLC Scenario
    if (formInputs.startLLC) {
      const totalExpenses = formInputs.existingExpenses + formInputs.expectedExpenses;
      const llcTaxableIncome = baseTaxableIncome - totalExpenses;
      const llcStateTaxableIncome = baseStateTaxableIncome - totalExpenses;
      
      const llcFederalTax = calculateFederalTax(llcTaxableIncome);
      const llcStateTax = calculateCATax(llcStateTaxableIncome);
      const llcEstateTax = baselineEstateTax;
      const llcTotalTax = llcFederalTax + llcStateTax + llcEstateTax;

      scenarios.push({
        name: 'LLC Structure',
        federalTax: llcFederalTax,
        stateTax: llcStateTax,
        estateTax: llcEstateTax,
        totalTax: llcTotalTax,
        savings: baselineTotalTax - llcTotalTax,
        savingsPercent: ((baselineTotalTax - llcTotalTax) / baselineTotalTax) * 100,
        strategies: [
          'Business expense deductions',
          'Pass-through taxation',
          'Asset protection',
          `$${totalExpenses.toLocaleString()} total deductible expenses`
        ]
      });
    }

    // FLP/Trust Scenario
    if (formInputs.addTrust) {
      const trustFederalTax = calculateFederalTax(baseTaxableIncome);
      const trustStateTax = calculateCATax(baseStateTaxableIncome);
      const trustEstateTax = calculateEstateTax(formInputs.estateValue - formInputs.transferAmount, true);
      const trustTotalTax = trustFederalTax + trustStateTax + trustEstateTax;

      scenarios.push({
        name: 'FLP/Trust Structure',
        federalTax: trustFederalTax,
        stateTax: trustStateTax,
        estateTax: trustEstateTax,
        totalTax: trustTotalTax,
        savings: baselineTotalTax - trustTotalTax,
        savingsPercent: ((baselineTotalTax - trustTotalTax) / baselineTotalTax) * 100,
        strategies: [
          '30% valuation discount',
          'Enhanced asset protection',
          `$${formInputs.transferAmount.toLocaleString()} planned transfer`,
          `${formInputs.heirCount} beneficiaries`
        ]
      });
    }

    // Buy-Borrow-Die Scenario
    if (formInputs.adoptBBD) {
      const borrowingCost = formInputs.borrowAmount * (formInputs.interestRate / 100);
      const deferredGains = formInputs.borrowAmount * TAX_CONSTANTS.CAPITAL_GAINS_RATE;
      
      const bbdFederalTax = calculateFederalTax(baseTaxableIncome - deferredGains);
      const bbdStateTax = calculateCATax(baseStateTaxableIncome);
      const bbdEstateTax = formInputs.addTrust 
        ? calculateEstateTax(formInputs.estateValue - formInputs.transferAmount, true)
        : baselineEstateTax;
      const bbdTotalTax = bbdFederalTax + bbdStateTax + bbdEstateTax + borrowingCost;

      scenarios.push({
        name: 'Buy-Borrow-Die Strategy',
        federalTax: bbdFederalTax,
        stateTax: bbdStateTax,
        estateTax: bbdEstateTax,
        totalTax: bbdTotalTax,
        savings: baselineTotalTax - bbdTotalTax,
        savingsPercent: ((baselineTotalTax - bbdTotalTax) / baselineTotalTax) * 100,
        strategies: [
          'Tax-free liquidity through borrowing',
          'Capital gains deferral',
          'Step-up basis potential',
          `Interest cost: $${borrowingCost.toLocaleString()}/year`
        ]
      });
    }

    // QSBS Scenario
    if (formInputs.isQSBS) {
      const qsbsExclusion = Math.min(formInputs.qsbsAmount, TAX_CONSTANTS.QSBS_MAX_EXCLUSION);
      const qsbsFederalTax = calculateFederalTax(baseTaxableIncome - qsbsExclusion);
      const qsbsStateTax = baselineStateTax; // CA doesn't conform to federal QSBS
      const qsbsEstateTax = baselineEstateTax;
      const qsbsTotalTax = qsbsFederalTax + qsbsStateTax + qsbsEstateTax;

      scenarios.push({
        name: 'QSBS Strategy',
        federalTax: qsbsFederalTax,
        stateTax: qsbsStateTax,
        estateTax: qsbsEstateTax,
        totalTax: qsbsTotalTax,
        savings: baselineTotalTax - qsbsTotalTax,
        savingsPercent: ((baselineTotalTax - qsbsTotalTax) / baselineTotalTax) * 100,
        strategies: [
          'QSBS gain exclusion',
          `$${qsbsExclusion.toLocaleString()} excluded from federal tax`,
          'State tax treatment varies'
        ]
      });
    }

    setScenarios(scenarios);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tax Efficiency Calculator</h2>
        <Button 
          onClick={calculateScenarios}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
        >
          Analyze Tax Strategies
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Basic Information */}
          <section className={`space-y-4 p-6 bg-white rounded-lg shadow ${activeSection !== 'basics' && 'opacity-75'}`}>
            <h3 
              className="text-lg font-semibold cursor-pointer hover:text-emerald-600 flex items-center"
              onClick={() => setActiveSection('basics')}
            >
              Basic Information
            </h3>
            {(activeSection === 'basics' || true) && (
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

                <Slider
                  label="Annual Income"
                  value={formInputs.annualIncome}
                  onChange={(value) => handleInputChange('annualIncome', value)}
                  min={0}
                  max={10000000}
                  step={10000}
                  tooltip="Your total annual income from all sources"
                />
              </div>
            )}
          </section>

          {/* Entity Structure */}
          <section className={`space-y-4 p-6 bg-white rounded-lg shadow ${activeSection !== 'entity' && 'opacity-75'}`}>
            <h3 
              className="text-lg font-semibold cursor-pointer hover:text-emerald-600"
              onClick={() => setActiveSection('entity')}
            >
              Entity Structure
            </h3>
            {(activeSection === 'entity' || true) && (
              <div className="space-y-6">
                {/* LLC Option */}
                <div className="space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formInputs.startLLC}
                      onChange={(e) => handleInputChange('startLLC', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">Start LLC this year</span>
                  </label>
                  
                  {formInputs.startLLC && (
                    <Slider
                      label="Expected Business Expenses"
                      value={formInputs.expectedExpenses}
                      onChange={(value) => handleInputChange('expectedExpenses', value)}
                      min={0}
                      max={500000}
                      step={5000}
                      tooltip="Projected deductible business expenses"
                    />
                  )}
                </div>

                {/* Trust/FLP Option */}
                <div className="space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formInputs.addTrust}
                      onChange={(e) => handleInputChange('addTrust', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">Add Trust/FLP this year</span>
                  </label>
                  
                  {formInputs.addTrust && (
                    <>
                      <Slider
                        label="Transfer Amount"
                        value={formInputs.transferAmount}
                        onChange={(value) => handleInputChange('transferAmount', value)}
                        min={0}
                        max={10000000}
                        step={100000}
                        tooltip="Amount to transfer to trust/FLP"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          <Tooltip content="Number of beneficiaries for trust/FLP planning">
                            Number of Heirs
                          </Tooltip>
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={formInputs.heirCount}
                          onChange={(e) => handleInputChange('heirCount', Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Buy-Borrow-Die Option */}
                <div className="space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formInputs.adoptBBD}
                      onChange={(e) => handleInputChange('adoptBBD', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">Adopt Buy-Borrow-Die strategy</span>
                  </label>
                  
                  {formInputs.adoptBBD && (
                    <>
                      <Slider
                        label="Borrowing Amount"
                        value={formInputs.borrowAmount}
                        onChange={(value) => handleInputChange('borrowAmount', value)}
                        min={0}
                        max={5000000}
                        step={100000}
                        tooltip="Amount to borrow against assets"
                      />
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          <Tooltip content="Annual interest rate on borrowed amount">
                            Interest Rate (%)
                          </Tooltip>
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={15}
                          step={0.25}
                          value={formInputs.interestRate}
                          onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* QSBS Option */}
                <div className="space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formInputs.isQSBS}
                      onChange={(e) => handleInputChange('isQSBS', e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium">QSBS Eligible Investment</span>
                  </label>
                  
                  {formInputs.isQSBS && (
                    <Slider
                      label="QSBS Amount"
                      value={formInputs.qsbsAmount}
                      onChange={(value) => handleInputChange('qsbsAmount', value)}
                      min={0}
                      max={10000000}
                      step={100000}
                      tooltip="Amount of QSBS eligible gains"
                    />
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Estate Planning */}
          <section className={`space-y-4 p-6 bg-white rounded-lg shadow ${activeSection !== 'estate' && 'opacity-75'}`}>
            <h3 
              className="text-lg font-semibold cursor-pointer hover:text-emerald-600"
              onClick={() => setActiveSection('estate')}
            >
              Estate Planning
            </h3>
            {(activeSection === 'estate' || true) && (
              <div className="space-y-4">
                <Slider
                  label="Estate Value"
                  value={formInputs.estateValue}
                  onChange={(value) => handleInputChange('estateValue', value)}
                  min={0}
                  max={50000000}
                  step={1000000}
                  tooltip="Total estimated estate value"
                />
              </div>
            )}
          </section>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Tax Optimization Scenarios</h3>
            <div className="space-y-6">
              {scenarios.map((scenario, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <h4 className="text-lg font-medium">{scenario.name}</h4>
                  
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-gray-600">Federal Tax</dt>
                      <dd className="font-medium">${scenario.federalTax.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">State Tax</dt>
                      <dd className="font-medium">${scenario.stateTax.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Estate Tax</dt>
                      <dd className="font-medium">${scenario.estateTax.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Total Tax</dt>
                      <dd className="font-medium">${scenario.totalTax.toLocaleString()}</dd>
                    </div>
                  </dl>

                  {scenario.savings > 0 && (
                    <div className="mt-2 text-emerald-600">
                      <p className="font-semibold">
                        Potential Savings: ${scenario.savings.toLocaleString()} ({scenario.savingsPercent.toFixed(1)}%)
                      </p>
                    </div>
                  )}

                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-2">Key Strategies:</h5>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {scenario.strategies.map((strategy, i) => (
                        <li key={i} className="text-gray-600">{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="mb-2">
              Calculations use projected 2025 tax rates including TCJA sunset changes.
              Federal brackets: 10% (0-$23,850), 12% ($23,851-$96,950), 22% ($96,951-$206,700),
              24% ($206,701-$394,600), 32% ($394,601-$501,050), 35% ($501,051-$751,600), 37% (over $751,600).
            </p>
            <p>
              Estate tax exemption: $15M with 40% rate. CA rates from 1% to 13.3%.
              QSBS exclusion limited to $10M per issuer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}