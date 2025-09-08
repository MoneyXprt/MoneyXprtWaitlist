'use client';

import * as React from 'react';
import type { PlanInput } from '../../../lib/types';
import { recommend } from '../../../lib/recommend';

type Props = {
  value: PlanInput;
  onChange?: (next: PlanInput) => void; // <- optional now
};

const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);

export default function WhatIfPanel({ value, onChange }: Props) {
  // Local overrides (don’t mutate parent unless onChange is provided)
  const [over, setOver] = React.useState<Partial<PlanInput>>({});
  const v = { ...value, ...over } as PlanInput;

  const set = <K extends keyof PlanInput>(k: K, val: PlanInput[K]) => {
    setOver((o) => ({ ...o, [k]: val }));
    if (onChange) onChange({ ...value, [k]: val });
  };

  const preview = React.useMemo(() => recommend(v), [v]);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold mb-2">What-If (quick tweaks)</h3>
      <div className="text-sm text-gray-600 mb-4">
        Adjust a few levers and see the plan reshape instantly. These don’t overwrite your saved inputs unless you’re on the main steps.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Salary">
          <Num value={v.salary} onChange={(x) => set('salary', x)} />
        </Field>
        <Field label="Bonus">
          <Num value={v.bonus} onChange={(x) => set('bonus', x)} />
        </Field>
        <Field label="RSU vesting">
          <Num value={v.rsuVesting} onChange={(x) => set('rsuVesting', x)} />
        </Field>
        <Field label="Rent NOI">
          <Num value={v.rentNOI} onChange={(x) => set('rentNOI', x)} />
        </Field>
        <Field label="Fixed spend / mo">
          <Num value={v.fixedMonthlySpend} onChange={(x) => set('fixedMonthlySpend', x)} />
        </Field>
        <Field label="Lifestyle / mo">
          <Num value={v.lifestyleMonthlySpend} onChange={(x) => set('lifestyleMonthlySpend', x)} />
        </Field>
        <Field label="Cash (HYSA)">
          <Num value={v.cash} onChange={(x) => set('cash', x)} />
        </Field>
        <Field label="Retirement (401k/IRA)">
          <Num value={v.retirement} onChange={(x) => set('retirement', x)} />
        </Field>
      </div>

      <div className="mt-4">
        <details>
          <summary className="cursor-pointer text-sm underline">Previewed recommendations</summary>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
            {preview.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block text-[12px] text-gray-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Num({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      className="w-full border rounded px-2 py-1"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
    />
  );
}