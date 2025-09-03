'use client';

import { useState } from 'react';

type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';
const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT',
  'NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'
];

type PlannerInput = {
  // 1) Profile
  firstName: string;
  filingStatus: FilingStatus;
  state: string;
  dependents: number;
  age: number;
  spouseAge?: number;
  hdhpEligible: boolean; // HSA eligible?

  // 2) Income (annual, pre-tax unless noted)
  w2Income: number;
  bonusIncome: number;
  rsuVestedValue: number;          // value of shares vesting this year
  isoExerciseBargain: number;      // bargain element from ISOs (AMT driver)
  selfEmploymentNet: number;       // Schedule C net profit (pre-SE tax)
  k1Active: number;                // K-1 ordinary (active)
  k1Passive: number;               // K-1 ordinary (passive)
  capGainsShort: number;           // net ST capital gains
  capGainsLong: number;            // net LT capital gains
  qualifiedDividends: number;
  ordinaryDividends: number;
  cryptoGains: number;
  interestIncome: number;
  otherIncome: number;
  rentalUnits: number;
  rentalNOI: number;               // net operating income across rentals
  niitSubject: boolean;            // likely subject to 3.8% NIIT

  // 3) Pretax deductions / savings
  employee401k: number;            // employee deferrals
  employer401k: number;            // employer match/profit share (context)
  hsaContrib: number;
  fsaContrib: number;              // health FSA
  solo401kSEP: number;             // self-employed retirement contrib
  contrib529: number;

  // 4) Itemized deductions (federal)
  mortgageInterest: number;
  propertyTax: number;
  stateIncomeTaxPaid: number;      // state/local income taxes (SALT)
  charityCash: number;
  charityNonCash: number;
  medicalExpenses: number;         // unreimbursed

  // 5) Goals / constraints (for recs)
  targetEffRate: number;           // goal effective tax rate
  retireAge: number;
  liquidityNeed12mo: number;       // cash need next 12 months
};

const empty: PlannerInput = {
  firstName: '',
  filingStatus: 'single',
  state: 'CA',
  dependents: 0,
  age: 40,
  spouseAge: undefined,
  hdhpEligible: false,

  w2Income: 0,
  bonusIncome: 0,
  rsuVestedValue: 0,
  isoExerciseBargain: 0,
  selfEmploymentNet: 0,
  k1Active: 0,
  k1Passive: 0,
  capGainsShort: 0,
  capGainsLong: 0,
  qualifiedDividends: 0,
  ordinaryDividends: 0,
  cryptoGains: 0,
  interestIncome: 0,
  otherIncome: 0,
  rentalUnits: 0,
  rentalNOI: 0,
  niitSubject: true,

  employee401k: 0,
  employer401k: 0,
  hsaContrib: 0,
  fsaContrib: 0,
  solo401kSEP: 0,
  contrib529: 0,

  mortgageInterest: 0,
  propertyTax: 0,
  stateIncomeTaxPaid: 0,
  charityCash: 0,
  charityNonCash: 0,
  medicalExpenses: 0,

  targetEffRate: 28,
  retireAge: 55,
  liquidityNeed12mo: 0,
};

function Num({
  label, value, onChange, step = 1, suffix = '$'
}: { label: string; value: number; onChange: (n:number)=>void; step?: number; suffix?: string }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e)=>onChange(parseFloat(e.target.value || '0'))}
        className="w-full border rounded px-3 py-2"
        placeholder={suffix}
      />
    </label>
  );
}

function Txt({ label, value, onChange }: { label: string; value: string; onChange: (s:string)=>void }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
    </label>
  );
}

export default function PlannerClient() {
  const [data, setData] = useState<PlannerInput>(empty);
  const [preview, setPreview] = useState<string>('');

  const set = <K extends keyof PlannerInput>(key: K, val: PlannerInput[K]) =>
    setData(d => ({ ...d, [key]: val }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // For now, just preview the payload we’ll send to our planner engine.
    setPreview(JSON.stringify(data, null, 2));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Financial Planner</h1>

      <form onSubmit={onSubmit} className="space-y-8">

        {/* 1) Profile */}
        <section>
          <h2 className="text-xl font-medium mb-3">1) Profile</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Txt label="First name" value={data.firstName} onChange={(v)=>set('firstName', v)} />

            <label className="block">
              <span className="block text-sm font-medium mb-1">Filing status</span>
              <select
                className="w-full border rounded px-3 py-2"
                value={data.filingStatus}
                onChange={(e)=>set('filingStatus', e.target.value as FilingStatus)}
              >
                <option value="single">Single</option>
                <option value="married_joint">Married filing jointly</option>
                <option value="married_separate">Married filing separately</option>
                <option value="head">Head of household</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-sm font-medium mb-1">State</span>
              <select
                className="w-full border rounded px-3 py-2"
                value={data.state}
                onChange={(e)=>set('state', e.target.value)}
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <Num label="Your age" value={data.age} onChange={(n)=>set('age', n)} />
            <Num label="Spouse age (if any)" value={data.spouseAge ?? 0} onChange={(n)=>set('spouseAge', n)} />
            <Num label="Dependents (#)" value={data.dependents} onChange={(n)=>set('dependents', n)} />

            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={data.hdhpEligible}
                onChange={(e)=>set('hdhpEligible', e.target.checked)}
              />
              <span>HDHP / HSA Eligible</span>
            </label>
          </div>
        </section>

        {/* 2) Income */}
        <section>
          <h2 className="text-xl font-medium mb-3">2) Income</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Num label="W-2 income ($)" value={data.w2Income} onChange={(n)=>set('w2Income', n)} step={1000}/>
            <Num label="Bonus ($)" value={data.bonusIncome} onChange={(n)=>set('bonusIncome', n)} step={1000}/>
            <Num label="RSU vesting value ($)" value={data.rsuVestedValue} onChange={(n)=>set('rsuVestedValue', n)} step={1000}/>
            <Num label="ISO bargain element ($)" value={data.isoExerciseBargain} onChange={(n)=>set('isoExerciseBargain', n)} step={1000}/>
            <Num label="Self-employment net profit ($)" value={data.selfEmploymentNet} onChange={(n)=>set('selfEmploymentNet', n)} step={1000}/>
            <Num label="K-1 ordinary (active) ($)" value={data.k1Active} onChange={(n)=>set('k1Active', n)} step={1000}/>
            <Num label="K-1 ordinary (passive) ($)" value={data.k1Passive} onChange={(n)=>set('k1Passive', n)} step={1000}/>
            <Num label="Short-term cap gains ($)" value={data.capGainsShort} onChange={(n)=>set('capGainsShort', n)} step={1000}/>
            <Num label="Long-term cap gains ($)" value={data.capGainsLong} onChange={(n)=>set('capGainsLong', n)} step={1000}/>
            <Num label="Qualified dividends ($)" value={data.qualifiedDividends} onChange={(n)=>set('qualifiedDividends', n)} step={1000}/>
            <Num label="Ordinary dividends ($)" value={data.ordinaryDividends} onChange={(n)=>set('ordinaryDividends', n)} step={1000}/>
            <Num label="Interest income ($)" value={data.interestIncome} onChange={(n)=>set('interestIncome', n)} step={1000}/>
            <Num label="Crypto gains ($)" value={data.cryptoGains} onChange={(n)=>set('cryptoGains', n)} step={1000}/>
            <Num label="Other income ($)" value={data.otherIncome} onChange={(n)=>set('otherIncome', n)} step={1000}/>
            <Num label="Rental units (#)" value={data.rentalUnits} onChange={(n)=>set('rentalUnits', n)} />
            <Num label="Rental NOI (all units) ($)" value={data.rentalNOI} onChange={(n)=>set('rentalNOI', n)} step={1000}/>
          </div>

          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={data.niitSubject}
              onChange={(e)=>set('niitSubject', e.target.checked)}
            />
            <span>Investment income likely subject to NIIT (3.8%)</span>
          </label>
        </section>

        {/* 3) Pretax deductions / savings */}
        <section>
          <h2 className="text-xl font-medium mb-3">3) Pretax Deductions / Savings</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Num label="Employee 401(k) deferral ($)" value={data.employee401k} onChange={(n)=>set('employee401k', n)} step={500}/>
            <Num label="Employer 401(k) match/profit share ($)" value={data.employer401k} onChange={(n)=>set('employer401k', n)} step={500}/>
            <Num label="HSA contribution ($)" value={data.hsaContrib} onChange={(n)=>set('hsaContrib', n)} step={500}/>
            <Num label="Health FSA ($)" value={data.fsaContrib} onChange={(n)=>set('fsaContrib', n)} step={250}/>
            <Num label="Solo-401k / SEP ($)" value={data.solo401kSEP} onChange={(n)=>set('solo401kSEP', n)} step={500}/>
            <Num label="529 contribution ($)" value={data.contrib529} onChange={(n)=>set('529Contrib', n)} step={500}/>
          </div>
        </section>

        {/* 4) Itemized deductions */}
        <section>
          <h2 className="text-xl font-medium mb-3">4) Itemized Deductions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Num label="Mortgage interest ($)" value={data.mortgageInterest} onChange={(n)=>set('mortgageInterest', n)} step={500}/>
            <Num label="Property tax ($)" value={data.propertyTax} onChange={(n)=>set('propertyTax', n)} step={500}/>
            <Num label="State income tax paid ($)" value={data.stateIncomeTaxPaid} onChange={(n)=>set('stateIncomeTaxPaid', n)} step={500}/>
            <Num label="Charitable cash ($)" value={data.charityCash} onChange={(n)=>set('charityCash', n)} step={500}/>
            <Num label="Charitable non-cash ($)" value={data.charityNonCash} onChange={(n)=>set('charityNonCash', n)} step={500}/>
            <Num label="Medical (unreimbursed) ($)" value={data.medicalExpenses} onChange={(n)=>set('medicalExpenses', n)} step={500}/>
          </div>
        </section>

        {/* 5) Goals */}
        <section>
          <h2 className="text-xl font-medium mb-3">5) Goals & Constraints</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Num label="Target effective tax rate (%)" value={data.targetEffRate} onChange={(n)=>set('targetEffRate', n)} step={0.5} suffix="%"/>
            <Num label="Retirement age" value={data.retireAge} onChange={(n)=>set('retireAge', n)} />
            <Num label="Liquidity needed next 12 months ($)" value={data.liquidityNeed12mo} onChange={(n)=>set('liquidityNeed12mo', n)} step={1000}/>
          </div>
        </section>

        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 rounded bg-black text-white hover:opacity-90"
        >
          Continue to Recommendations
        </button>
      </form>

      {preview && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Inputs captured</h3>
          <textarea
            className="w-full h-64 border rounded p-3 font-mono text-sm"
            value={preview}
            readOnly
          />
        </div>
      )}
    </div>
  );
}