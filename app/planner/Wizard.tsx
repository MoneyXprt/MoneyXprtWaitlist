'use client';

import { useState } from 'react';
import type { PlanInput } from '../../lib/types';
import { EMPTY_PLAN } from '../../lib/types';
import Discovery from './steps/Discovery';

type Step = 'discovery' | 'cashflow'; // we'll add more later

export default function Wizard() {
  const [data, setData] = useState<PlanInput>(EMPTY_PLAN);
  const [step, setStep] = useState<Step>('discovery');

  const steps: Step[] = ['discovery', 'cashflow'];
  const stepIdx = steps.indexOf(step);

  // Only show debug if explicitly enabled
  const canDebug =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SHOW_DEBUG === '1') ||
    (typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('debug') === '1');

  function scrollTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goNext() {
    // Optional: persist between steps
    try {
      localStorage.setItem('moneyxprt.plan', JSON.stringify(data));
    } catch {}
    setStep('cashflow');
    scrollTop();
  }

  function goPrev() {
    setStep('discovery');
    scrollTop();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="text-sm text-gray-600">Step {stepIdx + 1} of 7</div>
        <h1 className="text-2xl font-semibold">Financial Planner</h1>
        <p className="text-sm text-gray-600 mt-1">
          {step === 'discovery'
            ? 'We’ll start with your goals. Approximations are okay—you can refine later.'
            : 'Next we’ll capture cash flow and income basics.'}
        </p>
      </header>

      {step === 'discovery' && (
        <Discovery value={data} onChange={setData} onNext={goNext} />
      )}

      {step === 'cashflow' && (
        <section className="rounded border p-4">
          <h2 className="text-lg font-medium mb-2">Step 2 — Cash flow & income</h2>
          <p className="text-gray-700 mb-4">
            Placeholder for the next step. Your Discovery answers are saved. We’ll add the
            cash-flow form next.
          </p>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={goPrev}
              className="rounded border px-3 py-2 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => alert('Next step coming soon')}
              className="inline-flex items-center px-4 py-2 rounded bg-black text-white hover:opacity-90"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {canDebug && (
        <div className="mt-6">
          <details>
            <summary className="cursor-pointer underline">Show raw data (debug)</summary>
            <pre className="mt-3 p-3 border rounded bg-gray-50 text-sm overflow-x-auto">
{JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}