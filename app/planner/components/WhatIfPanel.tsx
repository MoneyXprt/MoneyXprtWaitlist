// app/planner/components/WhatIfPanel.tsx
'use client';

import * as React from 'react';
import type { PlanInput } from '../../../lib/types';
import { recommend } from '../../../lib/recommend';

type Props = {
  value: PlanInput;
  /** Optional: if provided, we’ll push the edited plan up to the parent */
  onChange?: (next: PlanInput) => void;
};

/**
 * Lightweight what-if editor:
 * - Lets user tweak a few high-leverage fields
 * - Previews recommendations live (no network)
 * - If parent provides onChange, we sync edits upward too
 */
export default function WhatIfPanel({ value, onChange }: Props) {
  // Local overrides live only in this panel unless onChange is provided
  const [over, setOver] = React.useState<Partial<PlanInput>>({});

  const set = <K extends keyof PlanInput>(k: K, v: PlanInput[K]) => {
    setOver((o) => ({ ...o, [k]: v }));
    if (onChange) {
      onChange({ ...value, ...over, [k]: v } as PlanInput);
    }
  };

  const current = React.useMemo(() => ({ ...value, ...over }) as PlanInput, [value, over]);
  const preview = React.useMemo(() => recommend(current), [current]);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">What-If Panel</h3>
      <p className="text-sm text-gray-600 mb-3">
        Tweak a few inputs and see the plan update instantly.
      </p>

      <div className="space-y-3">
        <NumberField
          label="Monthly Savings"
          hint="Dollars you set aside each month"
          value={current.savingsMonthly}
          step={100}
          onChange={(n) => set('savingsMonthly', n)}
        />
        <NumberField
          label="Fixed Monthly Spend"
          value={current.fixedMonthlySpend}
          step={100}
          onChange={(n) => set('fixedMonthlySpend', n)}
        />
        <NumberField
          label="Lifestyle Monthly Spend"
          value={current.lifestyleMonthlySpend}
          step={100}
          onChange={(n) => set('lifestyleMonthlySpend', n)}
        />
        <NumberField
          label="Target Retirement Age"
          value={current.targetRetireAge}
          step={1}
          onChange={(n) => set('targetRetireAge', n)}
        />
        <NumberField
          label="Target Retirement Income (monthly)"
          value={current.targetRetireIncomeMonthly}
          step={500}
          onChange={(n) => set('targetRetireIncomeMonthly', n)}
        />
        <Toggle
          label="Using Backdoor Roth"
          checked={current.usingRothBackdoor}
          onChange={(b) => set('usingRothBackdoor', b)}
        />
        <Toggle
          label="Using Mega-Backdoor Roth"
          checked={current.usingMegaBackdoor}
          onChange={(b) => set('usingMegaBackdoor', b)}
        />
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Preview</h4>
        {preview.length === 0 ? (
          <p className="text-sm text-gray-600">No specific recommendations yet.</p>
        ) : (
          <ul className="list-disc ml-5 space-y-1 text-sm">
            {preview.slice(0, 8).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** --- tiny UI helpers --- */
function NumberField({
  label,
  value,
  onChange,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium">{label}</span>
      {hint && <span className="block text-xs text-gray-600 mb-1">{hint}</span>}
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
        className="w-full border rounded px-3 py-2"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm">{label}</span>
    </label>
  );
}