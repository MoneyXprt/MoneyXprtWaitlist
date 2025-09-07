'use client';

import { useState } from 'react';
import type { PlanInput } from '@/lib/types';
import { EMPTY_PLAN } from '@/lib/types';

import Discovery from './steps/Discovery';
import CashFlow from './steps/CashFlow';
import BalanceSheet from './steps/BalanceSheet';
import Taxes from './steps/Taxes';
import Retirement from './steps/Retirement';
import Risk from './steps/Risk';
import Estate from './steps/Estate';

export default function Wizard() {
  const [data, setData] = useState<PlanInput>(EMPTY_PLAN);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = () => setStep(s => Math.min(7, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 7) return; // submit only at the end

    setLoading(true);
    setError(null); setRecs(null);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setRecs(json?.recommendations ?? []);
      // Scroll to results
      setTimeout(()=>document.getElementById('results')?.scrollIntoView({behavior:'smooth'}), 50);
    } catch (err:any) {
      setError(err?.message || 'Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="text-sm text-gray-600">Step {step} of 7</div>
        <h1 className="text-2xl font-semibold">Financial Planner</h1>
        <p className="text-sm text-gray-600 mt-1">
          We’ll ask only what’s needed—no sensitive identifiers.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6">
        {step === 1 && (
          <Discovery value={data} onChange={setData} onNext={next} />
        )}
        {step === 2 && (
          <CashFlow value={data} onChange={setData} onNext={next} onBack={back} />
        )}
        {step === 3 && (
          <BalanceSheet value={data} onChange={setData} onNext={next} onBack={back} />
        )}
        {step === 4 && (
          <Taxes value={data} onChange={setData} onNext={next} onBack={back} />
        )}
        {step === 5 && (
          <Retirement value={data} onChange={setData} onNext={next} onBack={back} />
        )}
        {step === 6 && (
          <Risk value={data} onChange={setData} onNext={next} onBack={back} />
        )}
        {step === 7 && (
          <Estate value={data} onChange={setData} onNext={next} onBack={back} />
        )}
      </form>

      {loading && <p className="mt-6">Generating plan…</p>}
      {error && <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-red-800">{error}</div>}

      {recs && (
        <section id="results" className="mt-8 rounded border p-4">
          <h3 className="font-semibold mb-2">Personalized Recommendations</h3>
          {recs.length === 0 ? <p>No recommendations returned.</p> : (
            <ul className="list-disc pl-5 space-y-2">
              {recs.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}