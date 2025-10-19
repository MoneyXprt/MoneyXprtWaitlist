'use client';

import { useState } from 'react';
import { callStrategist } from '@/lib/callStrategist';
import type { MoneyXprtIntake } from '@/types/moneyxprt';
import { toStrategistPayload } from '@/types/moneyxprt';

export default function Intake() {
  const [form, setForm] = useState<MoneyXprtIntake>({
    filingStatus: 'mfj', state: 'CA', dependents: 1,
  } as MoneyXprtIntake);
  const [answer, setAnswer] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  function up<K extends keyof MoneyXprtIntake>(k: K, v: MoneyXprtIntake[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function run() {
    setLoading(true); setErr(''); setAnswer('');
    try {
      const payload = toStrategistPayload(form);
      const r = await callStrategist({
        userMessage: 'Use this structured intake to estimate my current-year taxes and recommend strategies.',
        payload
      });
      // Note: current callStrategist returns { ok, answer } without throwing on error
      setAnswer((r as any).answer || '');
    } catch (e: any) { setErr(e.message || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">MoneyXprt — Quick Intake</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basics */}
        <label className="block">
          <span className="text-sm">Filing status</span>
          <select className="w-full border rounded p-2"
            value={form.filingStatus || 'mfj'}
            onChange={(e)=>up('filingStatus', e.target.value as any)}>
            <option value="single">Single</option>
            <option value="mfj">Married Filing Jointly</option>
            <option value="mfs">Married Filing Separately</option>
            <option value="hoh">Head of Household</option>
            <option value="qw">Qualifying Widow(er)</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">State</span>
          <input className="w-full border rounded p-2" placeholder="CA"
            value={form.state || ''} onChange={(e)=>up('state', e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm">Dependents</span>
          <input type="number" min={0} className="w-full border rounded p-2"
            value={form.dependents ?? 0} onChange={(e)=>up('dependents', Number(e.target.value||0))}/>
        </label>

        {/* Income */}
        <label className="block">
          <span className="text-sm">W-2 wages (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.w2Income ?? 0} onChange={(e)=>up('w2Income', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">Fed withholding (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.w2FedWithheld ?? 0} onChange={(e)=>up('w2FedWithheld', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">State withholding (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.w2StateWithheld ?? 0} onChange={(e)=>up('w2StateWithheld', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">Business income (SE/K-1 active)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.seIncome ?? 0} onChange={(e)=>up('seIncome', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">Real estate net (passive)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.realEstateIncome ?? 0} onChange={(e)=>up('realEstateIncome', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">Capital gains</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.capitalGains ?? 0} onChange={(e)=>up('capitalGains', Number(e.target.value||0))}/>
        </label>

        {/* Deductions */}
        <label className="block">
          <span className="text-sm">Mortgage interest (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.mortgageInterest ?? 0} onChange={(e)=>up('mortgageInterest', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">SALT paid (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.salt ?? 0} onChange={(e)=>up('salt', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">Charitable giving (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.charity ?? 0} onChange={(e)=>up('charity', Number(e.target.value||0))}/>
        </label>

        {/* Accounts */}
        <label className="block">
          <span className="text-sm">401(k) pre-tax deferral (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.preTax401k ?? 0} onChange={(e)=>up('preTax401k', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">IRA contribution (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.iraContribution ?? 0} onChange={(e)=>up('iraContribution', Number(e.target.value||0))}/>
        </label>
      </div>

      <button onClick={run} disabled={loading}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
        {loading ? 'Calculating…' : 'Get My Estimate & Strategies'}
      </button>

      {err && <div className="text-red-600">Error: {err}</div>}

      {answer && (
        <div className="border rounded p-4 whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </div>
  );
}

