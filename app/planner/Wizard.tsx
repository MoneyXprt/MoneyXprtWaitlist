'use client';

import { useMemo, useState } from 'react';
import type { PlanInput } from '@/lib/types';
import { EMPTY_PLAN } from '@/lib/types';

import Discovery from './steps/Discovery';
import CashFlow from './steps/CashFlow';
import BalanceSheet from './steps/BalanceSheet';
import Taxes from './steps/Taxes';
import Retirement from './steps/Retirement';
import Risk from './steps/Risk';
import Review from './steps/Review';

const SECTIONS = [
  { id: 1, label: 'Goals' },
  { id: 2, label: 'Cash Flow' },
  { id: 3, label: 'Balance Sheet' },
  { id: 4, label: 'Taxes' },
  { id: 5, label: 'Retirement' },
  { id: 6, label: 'Risk' },
  { id: 7, label: 'Review & Plan' },
];

const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const sum = (...vals: unknown[]) => vals.reduce<number>((a, b) => a + n(b), 0);
const fmt = (x: number) =>
  x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function Wizard() {
  const [data, setData] = useState<PlanInput>(EMPTY_PLAN);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const next = () => setStep((s) => Math.min(7, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));
  const go = (s: number) => setStep(Math.min(7, Math.max(1, s)));

  // Right-panel snapshot (keeps users oriented)
  const { grossIncome, spendAnnual, impliedSavings, savingsRate, netWorth } = useMemo(() => {
    const gi = sum(
      data.salary,
      data.bonus,
      data.selfEmployment,
      data.rsuVesting,
      data.k1Active,
      data.k1Passive,
      data.otherIncome,
      data.rentNOI
    );
    const spend = n(data.fixedMonthlySpend) * 12 + n(data.lifestyleMonthlySpend) * 12;
    const imp = Math.max(0, gi - spend);
    const sr = gi > 0 ? (imp / gi) * 100 : 0;

    const assets = sum(
      data.cash,
      data.brokerage,
      data.retirement,
      data.hsa,
      data.realEstateEquity,
      data.privateEquityVC,
      data.crypto
    );
    const debts = sum(
      data.mortgageDebt,
      data.studentLoans,
      data.autoLoans,
      data.creditCards,
      data.otherDebt
    );
    return { grossIncome: gi, spendAnnual: spend, impliedSavings: imp, savingsRate: sr, netWorth: assets - debts };
  }, [data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 7) return;

    setLoading(true);
    setError(null);
    setRecs(null);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setRecs(Array.isArray(json?.recommendations) ? json.recommendations : []);
      requestAnimationFrame(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to generate plan.');
    } finally {
      setLoading(false);
    }
  }

  // Per-step explainer (right panel)
  const explainer: Record<number, { title: string; text: string }> = {
    1: {
      title: 'Why Goals?',
      text: 'Your goals set the prioritization logic (liquidity vs. growth, risk tolerance, and time horizon).',
    },
    2: {
      title: 'Cash Flow',
      text: 'Income and spending drive savings rate—the biggest wealth lever. Approximate is fine.',
    },
    3: {
      title: 'Balance Sheet',
      text: 'Assets and debts determine net worth and where dollars should go next.',
    },
    4: {
      title: 'Taxes',
      text: 'Filing status, state, and deductions guide tax strategy (Roth/backdoor, bunching, entity use).',
    },
    5: {
      title: 'Retirement',
      text: 'Target income & age help size the nest egg and the pre-tax vs. Roth mix.',
    },
    6: {
      title: 'Risk',
      text: 'Emergency fund and insurance keep the plan resilient to shocks.',
    },
    7: {
      title: 'Review',
      text: 'Tweak assumptions on the right, then generate your final plan.',
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="text-sm text-gray-600">Step {step} of 7</div>
        <h1 className="text-2xl font-semibold">Financial Planner</h1>
        <p className="text-sm text-gray-600 mt-1">
          We’ll ask only what’s needed—no sensitive identifiers.
        </p>
      </header>

      <div className="grid lg:grid-cols-[220px_1fr_300px] gap-6">
        {/* LEFT: Stepper */}
        <aside className="lg:sticky lg:top-4 h-max">
          <div className="rounded-lg border p-3">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Sections</div>
            <nav className="space-y-1">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(s.id)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    step === s.id ? 'bg-black text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* CENTER: Steps (form wraps so Review can submit) */}
        <main>
          <form onSubmit={onSubmit} className="space-y-6">
            {step === 1 && <Discovery value={data} onChange={setData} onNext={next} />}

            {step === 2 && <CashFlow value={data} onChange={setData} onNext={next} onBack={back} />}

            {step === 3 && <BalanceSheet value={data} onChange={setData} onNext={next} onBack={back} />}

            {step === 4 && <Taxes value={data} onChange={setData} onNext={next} onBack={back} />}

            {step === 5 && <Retirement value={data} onChange={setData} onNext={next} onBack={back} />}

            {step === 6 && <Risk value={data} onChange={setData} onNext={next} onBack={back} />}

            {step === 7 && <Review value={data} onBack={back} />}
          </form>

          {loading && <p className="mt-6">Generating plan…</p>}
          {error && (
            <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-red-800">{error}</div>
          )}
          {recs && (
            <section id="results" className="mt-8 rounded border p-4">
              <h3 className="font-semibold mb-2">Personalized Recommendations</h3>
              {recs.length === 0 ? (
                <p>No recommendations returned.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {recs.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </main>

        {/* RIGHT: Explainer + Snapshot */}
        <aside className="lg:sticky lg:top-4 h-max space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">{explainer[step].title}</h3>
            <p className="text-sm text-gray-700 mt-1">{explainer[step].text}</p>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-semibold mb-2">Snapshot</h4>
            <ul className="text-sm space-y-2">
              <li><span className="font-medium">Income:</span> {fmt(grossIncome)}/yr</li>
              <li><span className="font-medium">Spend:</span> {fmt(spendAnnual)}/yr</li>
              <li>
                <span className="font-medium">Savings:</span> {fmt(impliedSavings)} ({Math.round(savingsRate)}%)
              </li>
              <li><span className="font-medium">Net worth:</span> {fmt(netWorth)}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}