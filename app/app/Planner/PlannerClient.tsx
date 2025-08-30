'use client';

import { useState } from 'react';

type PlanInput = {
  filingStatus: 'single' | 'married';
  state: string;
  marginalRatePct: number;

  w2Income: number;
  selfEmploymentIncome: number;      // 1099 gross
  businessProfit: number;            // Schedule C/K-1 profit (after expenses)

  k401Contrib: number;               // employee deferral to 401(k)
  hsaContrib: number;
  hsaCoverage: 'single' | 'family';

  rentalUnits: number;
  charitableGiving: number;

  portfolioValue: number;
  advisorFeePct: number;
};

type Rec = { title: string; why: string; estSavings?: number };

export default function PlannerClient() {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<{recs: Rec[]; totalSavings?: number} | null>(null);

  const [form, setForm] = useState<PlanInput>({
    filingStatus: 'single',
    state: '',
    marginalRatePct: 37,

    w2Income: 0,
    selfEmploymentIncome: 0,
    businessProfit: 0,

    k401Contrib: 0,
    hsaContrib: 0,
    hsaCoverage: 'single',

    rentalUnits: 0,
    charitableGiving: 0,

    portfolioValue: 0,
    advisorFeePct: 1.0,
  });

  function num(v: string) { return Number((v || '0').replace(/[^0-9.]/g,'')) || 0; }

  async function runPlan() {
    setBusy(true); setOut(null);
    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setOut(data);
    setBusy(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-semibold">High-Income Planning Wizard (MVP)</h1>
      <p className="text-sm text-neutral-600">
        Enter a few numbers and we’ll surface tax & investing moves. Estimates are rough; verify with a CPA/FA.
      </p>

      {/* STEP 1 */}
      {step === 1 && (
        <section className="bg-white rounded-xl shadow p-4 space-y-4">
          <h2 className="text-lg font-semibold">Basics</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm">Filing status</span>
              <select
                className="border rounded p-2"
                value={form.filingStatus}
                onChange={e=>setForm(s=>({...s, filingStatus: e.target.value as any}))}>
                <option value="single">Single</option>
                <option value="married">Married filing jointly</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">State (for state-tax ideas)</span>
              <input className="border rounded p-2" value={form.state}
                     onChange={e=>setForm(s=>({...s, state: e.target.value}))}/>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Marginal tax rate (%)</span>
              <input className="border rounded p-2" inputMode="decimal"
                     value={form.marginalRatePct}
                     onChange={e=>setForm(s=>({...s, marginalRatePct: num(e.target.value)}))}/>
            </label>
          </div>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section className="bg-white rounded-xl shadow p-4 space-y-4">
          <h2 className="text-lg font-semibold">Income & Deductions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm">W-2 income ($)</span>
              <input className="border rounded p-2" inputMode="decimal"
                     value={form.w2Income}
                     onChange={e=>setForm(s=>({...s, w2Income: num(e.target.value)}))}/>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">1099 income (gross) ($)</span>
              <input className="border rounded p-2" inputMode="decimal"
                     value={form.selfEmploymentIncome}
                     onChange={e=>setForm(s=>({...s, selfEmploymentIncome: num(e.target.value)}))}/>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Business profit (Sched C/K-1) ($)</span>
              <input className="border rounded p-2" inputMode="decimal"
                     value={form.businessProfit}
                     onChange={e=>setForm(s=>({...s, businessProfit: num(e.target.value)}))}/>
            </label>

            <label className="grid gap-1">
              <span className="text-sm">401(k) employee contribution so far ($)</span>
              <input className="border rounded p-2" inputMode="decimal"
                     value={form.k401Contrib}
                     onChange={e=>setForm(s=>({...s, k401Contrib: num(e.target.value)}))}/>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">HSA contribution so far ($)</span>
              <input className="border rounded p-2" inputMode="decimal"
                     value={form.hsaContrib}
                     onChange={e=>setForm(s=>({...s, hsaContrib: num(e.target.value)}))}/>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">HSA coverage</span>
              <select className="border rounded p-2"
                      value={form.hsaCoverage}
                      onChange={e=>setForm(s=>({...s, hsaCoverage: e.target.value as any}))}>
                <option value="single">Single</option>
                <option value="family">Family</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm">Rental units (#)</span>
              <input className="border rounded p-2" inputMode="numeric"
                     value={form.rentalUnits}
                     onChange={e=>setForm(s=>({...s, rentalUnits: num(e.target.value)}))}/>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Charitable giving YTD ($)</span>
              <input className="border rounded p-2" inputMode="decimal"
                     value={form.charitableGiving}
                     onChange={e=>setForm(s=>({...s, charitableGiving: num(e.target.value)}))}/>
            </label>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section className="bg-white rounded-xl shadow p-4 space-y-4">
          <h2 className="text-lg font-semibold">Investments</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm">Portfolio value ($)</span>
              <input className="border rounded p-2" inputMode="decimal"
                     value={form.portfolioValue}
                     onChange={e=>setForm(s=>({...s, portfolioValue: num(e.target.value)}))}/>
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Advisor fee (%)</span>
              <input className="border rounded p-2" inputMode="decimal"
                     value={form.advisorFeePct}
                     onChange={e=>setForm(s=>({...s, advisorFeePct: num(e.target.value)}))}/>
            </label>
          </div>
        </section>
      )}

      {/* Nav / Submit */}
      <div className="flex items-center justify-between">
        <button
          className="px-3 py-2 rounded-lg border"
          disabled={step===1 || busy}
          onClick={()=>setStep(s=>Math.max(1, s-1))}
        >Back</button>

        {step < 3 ? (
          <button className="px-3 py-2 rounded-lg bg-black text-white"
                  onClick={()=>setStep(s=>Math.min(3, s+1))}
                  disabled={busy}>
            Next
          </button>
        ) : (
          <button className="px-3 py-2 rounded-lg bg-emerald-700 text-white disabled:opacity-50"
                  onClick={runPlan} disabled={busy}>
            {busy ? 'Calculating…' : 'Get Plan'}
          </button>
        )}
      </div>

      {/* Output */}
      {out && (
        <section className="bg-white rounded-xl shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold">Recommended moves</h2>
          <ol className="list-decimal pl-5 space-y-2">
            {out.recs.map((r, i)=>(
              <li key={i}>
                <div className="font-medium">{r.title}</div>
                <div className="text-sm text-neutral-700">{r.why}</div>
                {typeof r.estSavings === 'number' && (
                  <div className="text-sm text-emerald-700">
                    Est. annual savings: ${r.estSavings.toLocaleString()}
                  </div>
                )}
              </li>
            ))}
          </ol>
          {typeof out.totalSavings === 'number' && (
            <p className="text-sm font-medium">
              Rough total (not additive if overlaps): ${out.totalSavings.toLocaleString()}
            </p>
          )}
          <p className="text-xs text-neutral-500">
            These are heuristics for exploration only—not tax, legal, or investment advice.
          </p>
        </section>
      )}
    </div>
  );
}