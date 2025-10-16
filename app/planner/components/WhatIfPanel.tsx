"use client";
// app/planner/components/WhatIfPanel.tsx

import * as React from 'react';
import type { PlanInput } from '../../../lib/types';
import { recommend } from '../../../lib/recommend';

type Props = {
  value: PlanInput;
  onChange?: (next: PlanInput) => void; // optional live sync to parent
};

const n = (v: unknown) => (typeof v === 'number' && isFinite(v as number) ? (v as number) : 0);

export default function WhatIfPanel({ value, onChange }: Props) {
  // Local overrides (don’t mutate parent unless onChange is provided)
  const [over, setOver] = React.useState<Partial<PlanInput>>({});
  const v = { ...value, ...over } as PlanInput;

  const set = <K extends keyof PlanInput>(k: K, val: PlanInput[K]) => {
    setOver((o) => ({ ...o, [k]: val }));
    if (onChange) onChange({ ...value, [k]: val });
  };

  const reset = () => setOver({});

  const preview = React.useMemo<string[]>(() => {
    const r = recommend(v) as unknown;
    return Array.isArray(r) ? r.filter(Boolean) : [];
  }, [v]);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">What-If (quick tweaks)</h3>
        {Object.keys(over).length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-xs underline text-gray-600 hover:text-gray-800"
          >
            Reset
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Adjust a few levers and see the plan update instantly. These don’t overwrite your saved inputs
        unless you’re on the main steps.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Salary ($/yr)">
          <Num value={n(v.salary)} onChange={(x) => set('salary', x)} />
        </Field>
        <Field label="Bonus ($/yr)">
          <Num value={n(v.bonus)} onChange={(x) => set('bonus', x)} />
        </Field>

        <Field label="RSU vesting ($/yr)">
          <Num value={n(v.rsuVesting)} onChange={(x) => set('rsuVesting', x)} />
        </Field>
        <Field label="Rent NOI ($/yr)">
          <Num value={n(v.rentNOI)} onChange={(x) => set('rentNOI', x)} />
        </Field>

        <Field label="Fixed spend ($/mo)">
          <Num value={n(v.fixedMonthlySpend)} onChange={(x) => set('fixedMonthlySpend', x)} />
        </Field>
        <Field label="Lifestyle spend ($/mo)">
          <Num value={v.lifestyleMonthlySpend} onChange={(x) => set('lifestyleMonthlySpend', x)} />
        </Field>

        <Field label="Cash / HYSA ($)">
          <Num value={v.cash} onChange={(x) => set('cash', x)} />
        </Field>
        <Field label="Retirement (401k/IRA) ($)">
          <Num value={v.retirement} onChange={(x) => set('retirement', x)} />
        </Field>
      </div>

      <div className="mt-4">
        <details>
          <summary className="cursor-pointer text-sm underline">Previewed recommendations</summary>
          {preview.length === 0 ? (
            <p className="text-sm text-gray-600 mt-2">No changes reflected yet.</p>
          ) : (
            <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
              {preview.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
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

interface NumProps {
  value?: number;
  onChange: (n: number) => void;
  step?: number;
}

function Num({
  value,
  onChange,
  step = 100,
}: NumProps) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className="w-full border rounded px-2 py-1"
      min={0}
      step={step}
      value={n(value)}
      onChange={(e) => {
        const raw = e.target.value;
        const parsed = Number(raw);
        onChange(Number.isFinite(parsed) ? parsed : 0);
      }}
    />
  );
}
