'use client';

import * as React from 'react';
import type { PlanInput } from '../../../lib/types';
import { recommend } from '../../../lib/recommend';

type Props = {
  value: PlanInput;
  onApply: (patch: Partial<PlanInput>) => void;
};

export default function WhatIfPanel({ value, onApply }: Props) {
  // local overrides that do NOT mutate the plan until "Apply to plan" is clicked
  const [over, setOver] = React.useState<Partial<PlanInput>>({
    savingsMonthly: value.savingsMonthly,
    emergencyFundMonths: value.emergencyFundMonths,
    itemizeLikely: value.itemizeLikely,
    charitableInclination: value.charitableInclination,
    confidence: value.confidence,
  });

  const set = <K extends keyof PlanInput>(k: K, v: PlanInput[K]) =>
    setOver((o) => ({ ...o, [k]: v }));

  const preview = React.useMemo(() => recommend(value, over), [value, over]);

  return (
    <div className="mt-8 grid md:grid-cols-2 gap-6">
      {/* Controls */}
      <div className="rounded border p-4">
        <h4 className="font-semibold mb-3">What-If Controls</h4>

        <label className="block text-sm font-medium mb-1">Savings per month ($)</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2 mb-3"
          value={over.savingsMonthly ?? 0}
          onChange={(e) => set('savingsMonthly', Number(e.target.value || 0))}
          step={250}
        />

        <label className="block text-sm font-medium mb-1">Emergency fund target (months)</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2 mb-3"
          value={over.emergencyFundMonths ?? 3}
          onChange={(e) => set('emergencyFundMonths', Number(e.target.value || 0))}
          min={0}
          max={24}
          step={0.5}
        />

        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={!!over.itemizeLikely}
            onChange={(e) => set('itemizeLikely', e.target.checked)}
          />
          <span className="text-sm">Likely to itemize deductions</span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={!!over.charitableInclination}
            onChange={(e) => set('charitableInclination', e.target.checked)}
          />
          <span className="text-sm">Charitable / giving intent</span>
        </div>

        <label className="block text-sm font-medium mb-1">Confidence (1–10)</label>
        <select
          className="border rounded px-3 py-2"
          value={over.confidence ?? 5}
          onChange={(e) => set('confidence', Number(e.target.value))}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onApply(over)}
            className="inline-flex items-center px-3 py-2 rounded bg-black text-white hover:opacity-90"
          >
            Apply to plan
          </button>
          <button
            type="button"
            onClick={() =>
              setOver({
                savingsMonthly: value.savingsMonthly,
                emergencyFundMonths: value.emergencyFundMonths,
                itemizeLikely: value.itemizeLikely,
                charitableInclination: value.charitableInclination,
                confidence: value.confidence,
              })
            }
            className="inline-flex items-center px-3 py-2 rounded border hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="rounded border p-4">
        <h4 className="font-semibold mb-3">Live Preview</h4>
        <div className="text-sm text-gray-700 mb-3">
          {preview.greeting}
        </div>
        <ul className="text-sm text-gray-700 mb-4">
          <li>Gross income: <strong>${Math.round(preview.snapshot.grossIncome).toLocaleString()}</strong></li>
          <li>Annual spend: <strong>${Math.round(preview.snapshot.annualSpend).toLocaleString()}</strong></li>
          <li>Implied savings rate: <strong>{Math.round(preview.snapshot.impliedSavingsRate * 100)}%</strong></li>
          <li>Emergency fund target: <strong>${Math.round(preview.snapshot.efTarget).toLocaleString()}</strong></li>
          <li>Emergency fund gap: <strong>${Math.round(preview.snapshot.efGap).toLocaleString()}</strong></li>
          <li>Net worth: <strong>${Math.round(preview.snapshot.netWorth).toLocaleString()}</strong></li>
        </ul>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          {preview.recs.map((r, i) => <li key={i}>{r}</li>)}
        </ol>
      </div>
    </div>
  );
}