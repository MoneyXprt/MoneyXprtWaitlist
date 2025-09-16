// app/planner/steps/Review.tsx
'use client';

import * as React from 'react';
import type { PlanInput } from '../../../lib/types';
import { recommend } from '../../../lib/recommend';
import WhatIfPanel from '../components/WhatIfPanel';
import NarrativeButton from '../components/NarrativeButton';

/** ---------- Helpers ---------- */
const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
const sum = (...vals: unknown[]) => vals.reduce<number>((a, b) => a + n(b), 0);
const fmt = (x: number) => x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type Props = { value: PlanInput; onBack: () => void };

export default function Review({ value, onBack }: Props) {
  // Income & spend
  const grossIncome = sum(
    value.salary, value.bonus, value.selfEmployment, value.rsuVesting,
    value.k1Active, value.k1Passive, value.otherIncome, value.rentNOI
  );
  const spendAnnual = n(value.fixedMonthlySpend) * 12 + n(value.lifestyleMonthlySpend) * 12;
  const impliedSavings = Math.max(0, grossIncome - spendAnnual);
  const savingsRate = grossIncome > 0 ? (impliedSavings / grossIncome) * 100 : 0;

  // Balance sheet from properties[] + alts
  const propertyEquity = (value.properties || []).reduce(
    (acc, p) => acc + (n(p.estimatedValue) - n(p.mortgageBalance)),
    0
  );
  const altAssets = n(value.alts?.privateEquityVC) + n(value.alts?.collectibles) + n(value.alts?.other);

  const totalAssets = sum(value.cash, value.brokerage, value.retirement, value.hsa, value.crypto, propertyEquity, altAssets);
  const totalDebts = sum(value.mortgageDebt, value.studentLoans, value.autoLoans, value.creditCards, value.otherDebt);
  const netWorth = totalAssets - totalDebts;

  // EF
  const targetEFMonths = Math.max(3, n(value.emergencyFundMonths));
  const monthlyBurn = Math.max(1000, n(value.fixedMonthlySpend) + n(value.lifestyleMonthlySpend));
  const efTarget = monthlyBurn * targetEFMonths;
  const efCoverageMonths = monthlyBurn > 0 ? n(value.cash) / monthlyBurn : 0;
  const efPct = efTarget > 0 ? Math.min(100, (n(value.cash) / efTarget) * 100) : 0;

  // Recs & grouping
  const recs = React.useMemo(() => recommend(value), [value]);

  const buckets: Record<'cash' | 'invest' | 'debt' | 'risk' | 'tax' | 'estate' | 'goals' | 'other', string[]> = {
    cash: [], invest: [], debt: [], risk: [], tax: [], estate: [], goals: [], other: [],
  };

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

  const top3 = React.useMemo(() => {
    const scored = recs.map((r) => {
      const l = r.toLowerCase();
      let score = 0;
      if (/increase emergency fund|credit card|under-?withhold|umbrella|disability/.test(l)) score += 3;
      if (/max|backdoor|roth|mega/.test(l)) score += 2;
      if (/snapshot|implied savings/.test(l)) score += 1;
      if (/consider/.test(l)) score -= 0.5;
      return { r, score };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.r);
  }, [recs]);

  // ---------- Action slices: This week / 30d / 90d ----------
  const { weekActions, monthActions, quarterActions } = React.useMemo(() => {
    const wk: string[] = [];
    const mo: string[] = [];
    const qr: string[] = [];

    if (buckets.cash.length) {
      wk.push('Open/confirm HYSA or T-bill account');
      wk.push('Set up auto-transfer on payday for emergency fund');
      mo.push('Validate emergency fund target and adjust transfer amount');
    }
    if (buckets.tax.length) {
      wk.push('Turn on paycheck “additional withholding” or RSU tax set-aside');
      mo.push('Run itemized vs standard deduction check for this year');
      qr.push('Quarterly: review RSU withholding set-aside vs vests');
    }
    if (buckets.invest.length) {
      wk.push('Set target allocation and auto-invest schedule');
      mo.push('Enroll 1% annual auto-increase on 401(k) deferral');
      qr.push('Rebalance and harvest losses/gains as appropriate');
    }
    if (buckets.debt.length) {
      wk.push('List all debts with APR and minimums');
      mo.push('Start avalanche payments on highest-APR debt');
      qr.push('If mortgage & cash allow, add small extra principal monthly');
    }
    if (buckets.risk.length) {
      wk.push('Get quotes: disability, term life, umbrella');
      mo.push('Bind umbrella policy ($1–2M)');
    }
    if (buckets.estate.length) {
      wk.push('List beneficiaries on 401k/IRA/HSA and life insurance');
      mo.push('Schedule will/trust consult; add POA/health directives');
    }

    // ensure uniqueness and cap lengths to avoid overwhelm
    const uniq = (arr: string[], cap: number) => Array.from(new Set(arr)).slice(0, cap);
    return {
      weekActions: uniq(wk, 5),
      monthActions: uniq(mo, 6),
      quarterActions: uniq(qr, 6),
    };
  }, [buckets]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* LEFT 2/3 */}
      <div className="lg:col-span-2">
        <div className="rounded-lg border p-4 mb-6">
          <h2 className="text-lg font-semibold">Review & Finalize</h2>
          <p className="text-sm text-gray-600 mt-1">
            Here’s a first pass of your plan. Tweak inputs on the right—numbers and recommendations update live. You can generate a written narrative any time.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Badge>Income {fmt(grossIncome)}/yr</Badge>
            <Badge>Spend {fmt(spendAnnual)}/yr</Badge>
            <Badge>Savings {fmt(impliedSavings)} ({Math.round(savingsRate)}%)</Badge>
            <Badge>Net worth {fmt(netWorth)}</Badge>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <Progress label="Emergency Fund Coverage" hint={`${Math.max(0, Math.floor(efCoverageMonths))} / ${targetEFMonths} months`} percent={efPct} />
                <Progress label="Savings Rate" hint={`${Math.round(savingsRate)}% (target 20–30%)`} percent={Math.max(0, Math.min(100, savingsRate))} />
          </div>
        </div>

        <div className="rounded-lg border p-4 mb-6">
          <h3 className="font-semibold mb-2">🚀 Your Top 3 Priorities</h3>
          <ol className="list-decimal ml-5 space-y-2">
            {top3.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </div>

        <RoadmapCard title="This Week" items={weekActions.length ? weekActions : ['Set up HYSA auto-transfer', 'List debts with APRs', 'Pick a 401(k) target allocation']} />
        <RoadmapCard title="Next 30 Days" items={monthActions.length ? monthActions : top3} />
        <RoadmapCard title="Next 90 Days" items={quarterActions.length ? quarterActions : ['Rebalance portfolio', 'Quarterly: check RSU set-aside vs. vests.']} />

        <Accordion title="💰 Cash & Savings" items={buckets.cash} defaultOpen />
        <Accordion title="📈 Investing & Retirement" items={buckets.invest} />
        <Accordion title="🏡 Debt & Real Estate" items={buckets.debt} />
        <Accordion title="🛡️ Risk Protection" items={buckets.risk} />
        <Accordion title="🧾 Taxes & Charitable" items={buckets.tax} />
        <Accordion title="⚖️ Estate & Legacy" items={buckets.estate} />
        <Accordion title="🎯 Your Goals" items={buckets.goals} />
        {buckets.other.length > 0 && <Accordion title="🧩 Other" items={buckets.other} />}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={onBack} className="rounded border px-4 py-2 hover:bg-gray-50">Back</button>
          <button type="submit" className="inline-flex items-center px-4 py-2 rounded bg-black text-white hover:opacity-90">
            Generate Final Plan
          </button>
          <NarrativeButton input={value} className="inline-flex items-center px-4 py-2 rounded border hover:bg-gray-50" />
        </div>
      </div>

      {/* RIGHT */}
      <div>
        <WhatIfPanel value={value} />
      </div>
    </div>
  );
}

/** ---------- Small UI primitives ---------- */
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs bg-white">{children}</span>;
}

function Progress({ label, hint, percent }: { label: string; hint?: string; percent: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        {hint && <span className="text-gray-600">{hint}</span>}
      </div>
      <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
        <div className="h-2 rounded bg-black transition-all" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  );
}

function Accordion({ title, items, defaultOpen = false }: { title: string; items: string[]; defaultOpen?: boolean }) {
  if (!items || items.length === 0) return null;
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="rounded-lg border mb-3">
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full px-4 py-3 text-left flex justify-between items-center">
        <span className="font-medium">{title}</span>
        <span className="text-gray-500">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <ul className="list-disc ml-5 space-y-2">
            {items.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function RoadmapCard({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-lg border p-4 mb-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="list-disc ml-5 space-y-2">
        {items.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}