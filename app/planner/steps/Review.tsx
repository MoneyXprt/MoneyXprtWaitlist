// app/planner/steps/Review.tsx
'use client';

import * as React from 'react';
import type { PlanInput } from '../../../lib/types';
import { recommend } from '../../../lib/recommend';
import WhatIfPanel from '../components/WhatIfPanel';

/** ---------- Helpers (no external deps) ---------- */
const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const sum = (...vals: unknown[]) =>
  vals.reduce<number>((a: number, b: unknown) => a + n(b), 0);
const fmt = (x: number) =>
  x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = {
  value: PlanInput;
  onBack: () => void;
};

export default function Review({ value, onBack }: Props) {
  /** ---------- Snapshot metrics shown up top ---------- */
  const grossIncome = sum(
    value.salary,
    value.bonus,
    value.selfEmployment,
    value.rsuVesting,
    value.k1Active,
    value.k1Passive,
    value.otherIncome,
    value.rentNOI
  );
  const spendAnnual = n(value.fixedMonthlySpend) * 12 + n(value.lifestyleMonthlySpend) * 12;
  const impliedSavings = Math.max(0, grossIncome - spendAnnual);
  const savingsRate = grossIncome > 0 ? (impliedSavings / grossIncome) * 100 : 0;

  const totalAssets = sum(
    value.cash,
    value.brokerage,
    value.retirement,
    value.hsa,
    value.realEstateEquity,
    value.privateEquityVC,
    value.crypto
  );
  const totalDebts = sum(
    value.mortgageDebt,
    value.studentLoans,
    value.autoLoans,
    value.creditCards,
    value.otherDebt
  );
  const netWorth = totalAssets - totalDebts;

  const targetEFMonths = Math.max(3, n(value.emergencyFundMonths)); // user preference / floor 3
  const monthlyBurn = Math.max(1000, n(value.fixedMonthlySpend) + n(value.lifestyleMonthlySpend));
  const efTarget = monthlyBurn * targetEFMonths;
  const efCoverageMonths = monthlyBurn > 0 ? n(value.cash) / monthlyBurn : 0;
  const efPct = efTarget > 0 ? Math.min(100, (n(value.cash) / efTarget) * 100) : 0;

  /** ---------- Recommendations (array of strings) ---------- */
  const recs = React.useMemo(() => recommend(value), [value]);

  /** ---------- Categorize recs (super light-weight keyword bucketing) ---------- */
  const buckets: Record<
    'cash' | 'invest' | 'debt' | 'risk' | 'tax' | 'estate' | 'goals' | 'other',
    string[]
  > = { cash: [], invest: [], debt: [], risk: [], tax: [], estate: [], goals: [], other: [] };

  recs.forEach((line) => {
    const l = line.toLowerCase();
    if (/(emergency|hysa|t-?bill|cash)/.test(l)) buckets.cash.push(line);
    else if (/(401|ira|roth|invest|portfolio|rebalance|diversif)/.test(l)) buckets.invest.push(line);
    else if (/(debt|credit card|loan|mortgage|principal)/.test(l)) buckets.debt.push(line);
    else if (/(disability|term life|umbrella|insurance|risk)/.test(l)) buckets.risk.push(line);
    else if (/(tax|charit|itemiz|da?f|withhold)/.test(l)) buckets.tax.push(line);
    else if (/(will|trust|estate|inherit)/.test(l)) buckets.estate.push(line);
    else if (/(goal|freedom|roadmap)/.test(l)) buckets.goals.push(line);
    else buckets.other.push(line);
  });

  /** ---------- Pick Top 3 priorities (naive scoring by keywords & urgency) ---------- */
  const scored = recs.map((r) => {
    const l = r.toLowerCase();
    let score = 0;
    if (/increase emergency fund|credit card|under-?withhold|umbrella|disability/.test(l)) score += 3;
    if (/max|backdoor|roth|mega/.test(l)) score += 2;
    if (/snapshot|implied savings/.test(l)) score += 1;
    if (/consider/.test(l)) score -= 0.5;
    return { r, score };
  });
  const top3 = scored.sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.r);

  /** ---------- UI ---------- */
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* LEFT: Summary + prioritized recs + accordion details */}
      <div>
        {/* Summary header card */}
        <div className="rounded-lg border p-4 mb-6">
          <h2 className="text-lg font-semibold">Review & Finalize</h2>
          <p className="text-sm text-gray-600 mt-1">
            Here’s a first pass of your plan. Tweak inputs on the right and re-run the preview to
            tailor it further.
          </p>

          {/* Snapshot chips */}
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Badge>Income {fmt(grossIncome)}/yr</Badge>
            <Badge>Spend {fmt(spendAnnual)}/yr</Badge>
            <Badge>Savings {fmt(impliedSavings)} ({Math.round(savingsRate)}%)</Badge>
            <Badge>Net worth {fmt(netWorth)}</Badge>
          </div>

          {/* Progress bars */}
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <Progress
              label="Emergency Fund Coverage"
              hint={`${Math.max(0, Math.floor(efCoverageMonths))} / ${targetEFMonths} months`}
              percent={efPct}
            />
            <Progress
              label="Savings Rate"
              hint={`${Math.round(savingsRate)}% (target 20–30%)`}
              percent={Math.max(0, Math.min(100, savingsRate))}
            />
          </div>
        </div>

        {/* Top 3 quick wins */}
        <div className="rounded-lg border p-4 mb-6">
          <h3 className="font-semibold mb-2">🚀 Your Top 3 Priorities</h3>
          <ol className="list-decimal ml-5 space-y-2">
            {top3.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </div>

        {/* Accordion sections */}
        <Accordion title="💰 Cash & Savings" items={buckets.cash} defaultOpen />
        <Accordion title="📈 Investing & Retirement" items={buckets.invest} />
        <Accordion title="🏡 Debt & Real Estate" items={buckets.debt} />
        <Accordion title="🛡️ Risk Protection" items={buckets.risk} />
        <Accordion title="🧾 Taxes & Charitable" items={buckets.tax} />
        <Accordion title="⚖️ Estate & Legacy" items={buckets.estate} />
        <Accordion title="🎯 Your Goals" items={buckets.goals} />
        {buckets.other.length > 0 && <Accordion title="🧩 Other" items={buckets.other} />}

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 rounded bg-black text-white hover:opacity-90"
          >
            Generate Final Plan
          </button>
        </div>
      </div>

      {/* RIGHT: What-If panel (live preview) */}
      <div>
        <WhatIfPanel value={value} />
      </div>
    </div>
  );
}

/** ---------- Small UI primitives ---------- */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs bg-white">
      {children}
    </span>
  );
}

function Progress({
  label,
  hint,
  percent,
}: {
  label: string;
  hint?: string;
  percent: number; // 0..100
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        {hint && <span className="text-gray-600">{hint}</span>}
      </div>
      <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
        <div
          className="h-2 rounded bg-black transition-all"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </div>
  );
}

function Accordion({
  title,
  items,
  defaultOpen = false,
}: {
  title: string;
  items: string[];
  defaultOpen?: boolean;
}) {
  if (!items || items.length === 0) return null;
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-lg border mb-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 text-left flex justify-between items-center"
      >
        <span className="font-medium">{title}</span>
        <span className="text-gray-500">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <ul className="list-disc ml-5 space-y-2">
            {items.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}