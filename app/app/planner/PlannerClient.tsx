'use client';

import { useState } from 'react';

type Inputs = {
  filingStatus: 'single' | 'married' | 'hoh';
  w2Income: number;
  sideIncome: number;
  state: string;
  dependents: number;
  businessOwner: boolean;
  llcElection: 'none' | 's' | 'c';
  rentalUnits: number;
  max401k: boolean;
  backdoorRothOk: boolean;
  hsaEligible: boolean;
  equityComp: 'none' | 'iso' | 'nso' | 'rsu';
  charitable: number;
};

export default function PlannerClient() {
  const [data, setData] = useState<Inputs>({
    filingStatus: 'single',
    w2Income: 0,
    sideIncome: 0,
    state: 'CA',
    dependents: 0,
    businessOwner: false,
    llcElection: 'none',
    rentalUnits: 0,
    max401k: true,
    backdoorRothOk: true,
    hsaEligible: false,
    equityComp: 'none',
    charitable: 0,
  });

  const [ideas, setIdeas] = useState<string[]>([]);
  const n = (v: string) => Number(v.replace(/[^0-9.-]/g, '')) || 0;

  function analyze() {
    const recs: string[] = [];
    const agi = data.w2Income + data.sideIncome;

    if (agi > 200_000 && data.max401k) {
      recs.push('Max 401(k); consider mega backdoor Roth if plan allows after-tax + in-plan Roth.');
    }
    if (agi > 200_000 && data.backdoorRothOk) {
      recs.push('Backdoor Roth IRA — avoid pro-rata by rolling pre-tax IRA into (Solo) 401(k).');
    }
    if (data.hsaEligible) recs.push('Use HSA; invest funds and treat as “stealth retirement”.');

    if (data.businessOwner) {
      recs.push('Solo 401(k) for side business (add employer contribution ≈20% of net SE income).');
      if (agi > 160_000 && data.llcElection === 'none') {
        recs.push('Evaluate S-Corp election (reasonable salary + distributions to cut SE tax).');
      }
      if (data.llcElection === 's') {
        recs.push('S-Corp hygiene: reasonable salary study, accountable plan, health-ins on W-2.');
      }
    }

    if (data.rentalUnits > 0) {
      recs.push('Real estate: consider cost seg + bonus depreciation (RE pro/STVR rules).');
      recs.push('Track mileage, safe-harbor home office; repairs vs improvements policy.');
    }

    if (data.equityComp === 'iso') recs.push('ISOs: model AMT before exercise; plan QD vs DQ dispositions.');
    if (data.equityComp === 'rsu') recs.push('RSUs: withholdings often short — plan quarterly estimates.');

    if (data.dependents > 0) {
      recs.push('Dependent Care FSA / Credit (subject to phaseouts).');
      recs.push('529 front-load; use low-cost age-based portfolios; check state deductions.');
    }

    if (data.charitable > 0) {
      recs.push('Donor-Advised Fund; gift appreciated securities to avoid cap-gains and bunch deductions.');
    }

    if (['CA','NY','NJ','MA','CT','OR','MN'].includes(data.state)) {
      recs.push('High-tax state: residency rules, sourcing, SALT cap workarounds.');
    }

    if (agi > 400_000) recs.push('Bracket management: loss harvesting, timing income/deductions, QSBS check.');

    if (recs.length === 0) recs.push('No obvious moves from current inputs. Add more details to refine.');
    setIdeas(recs);
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm">Filing status</span>
          <select
            className="border rounded p-2"
            value={data.filingStatus}
            onChange={(e) => setData({ ...data, filingStatus: e.target.value as Inputs['filingStatus'] })}
          >
            <option value="single">Single</option>
            <option value="married">Married filing jointly</option>
            <option value="hoh">Head of household</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm">State</span>
          <input
            className="border rounded p-2"
            value={data.state}
            onChange={(e) => setData({ ...data, state: e.target.value.toUpperCase() })}
            placeholder="CA"
          />
        </label>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <label className="grid gap-1">
          <span className="text-sm">W-2 income ($)</span>
          <input className="border rounded p-2" inputMode="numeric"
                 onChange={(e) => setData({ ...data, w2Income: n(e.target.value) })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Side/business income ($)</span>
          <input className="border rounded p-2" inputMode="numeric"
                 onChange={(e) => setData({ ...data, sideIncome: n(e.target.value) })} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Dependents (#)</span>
          <input className="border rounded p-2" inputMode="numeric"
                 onChange={(e) => setData({ ...data, dependents: n(e.target.value) })} />
        </label>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={data.businessOwner}
                 onChange={(e) => setData({ ...data, businessOwner: e.target.checked })} />
          <span className="text-sm">I own a business</span>
        </label>

        <label className="grid gap-1">
          <span className="text-sm">LLC tax election</span>
          <select className="border rounded p-2" value={data.llcElection}
                  onChange={(e) => setData({ ...data, llcElection: e.target.value as Inputs['llcElection'] })}>
            <option value="none">None</option>
            <option value="s">S-Corp</option>
            <option value="c">C-Corp</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Rental units (#)</span>
          <input className="border rounded p-2" inputMode="numeric"
                 onChange={(e) => setData({ ...data, rentalUnits: n(e.target.value) })} />
        </label>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={data.max401k}
                 onChange={(e) => setData({ ...data, max401k: e.target.checked })} />
          <span className="text-sm">Max 401(k)</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={data.backdoorRothOk}
                 onChange={(e) => setData({ ...data, backdoorRothOk: e.target.checked })} />
          <span className="text-sm">Backdoor Roth allowed</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={data.hsaEligible}
                 onChange={(e) => setData({ ...data, hsaEligible: e.target.checked })} />
          <span className="text-sm">HSA eligible</span>
        </label>
        <label className="grid gap-1">
          <span className="text-sm">Equity comp</span>
          <select className="border rounded p-2" value={data.equityComp}
                  onChange={(e) => setData({ ...data, equityComp: e.target.value as Inputs['equityComp'] })}>
            <option value="none">None</option>
            <option value="iso">ISOs</option>
            <option value="nso">NSOs</option>
            <option value="rsu">RSUs</option>
          </select>
        </label>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm">Planned charitable giving ($)</span>
          <input className="border rounded p-2" inputMode="numeric"
                 onChange={(e) => setData({ ...data, charitable: n(e.target.value) })} />
        </label>
      </div>

      <button className="self-start rounded-lg px-4 py-2 bg-emerald-700 text-white hover:bg-emerald-800"
              onClick={analyze}>
        Analyze & Recommend
      </button>

      {ideas.length > 0 && (
        <div className="rounded-lg border p-4 bg-white">
          <h3 className="font-semibold mb-2">Suggested strategies</h3>
          <ul className="list-disc pl-6 space-y-1">
            {ideas.map((x, i) => <li key={i} className="text-sm">{x}</li>)}
          </ul>
          <p className="text-xs text-neutral-500 mt-3">
            Educational only — not tax, legal, or investment advice.
          </p>
        </div>
      )}
    </div>
  );
}