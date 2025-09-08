'use client';
import * as React from 'react';
import type { PlanInput } from '@/lib/types';
import { recommend } from '@/lib/recommend';

type Props = {
  value: PlanInput;
  onChange: (next: PlanInput) => void;
};

export default function WhatIfPanel({ value, onChange }: Props) {
  const [over, setOver] = React.useState<Partial<PlanInput>>({});

  const set = <K extends keyof PlanInput>(k: K, v: PlanInput[K]) => {
    setOver(o => ({ ...o, [k]: v }));
    // immediately push merged value up so Review/Wizard state stays in sync
    onChange({ ...value, [k]: v });
  };

  // Live preview of recommendations (optional)
  const preview = React.useMemo(() => recommend({ ...value, ...over } as PlanInput), [value, over]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Salary ($/yr)</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={over.salary ?? value.salary ?? 0}
          onChange={(e) => set('salary', parseFloat(e.target.value || '0'))}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Monthly Lifestyle Spend ($/mo)</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={over.lifestyleMonthlySpend ?? value.lifestyleMonthlySpend ?? 0}
          onChange={(e) => set('lifestyleMonthlySpend', parseFloat(e.target.value || '0'))}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Target Retire Income ($/mo)</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          value={over.targetRetireIncomeMonthly ?? value.targetRetireIncomeMonthly ?? 0}
          onChange={(e) => set('targetRetireIncomeMonthly', parseFloat(e.target.value || '0'))}
        />
      </div>

      {/* Optional: show a tiny live preview */}
      {preview?.length ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm underline">Preview updated recs</summary>
          <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
            {preview.slice(0, 6).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </details>
      ) : null}
    </div>
  );
}