// app/planner/steps/Profile.tsx
'use client';

import * as React from 'react';
import type { PlanInput, ResidencyItem, FilingStatus } from '@/lib/types';

type Props = {
  value: PlanInput;
  onChange: (next: PlanInput) => void;
  onNext?: () => void;
};

export default function Profile({ value, onChange, onNext }: Props) {
  const v = value;

  const update = (patch: Partial<PlanInput>) =>
    onChange({ ...v, ...patch });

  const setOther = (i: number, patch: Partial<ResidencyItem>) => {
    const arr = [...v.otherStates];
    const item = { ...(arr[i] ?? { state: '', days: 0 }), ...patch };
    arr[i] = item;
    update({ otherStates: arr });
  };

  const addOther = () => update({ otherStates: [...v.otherStates, { state: '', days: 0 }] });
  const removeOther = (i: number) =>
    update({ otherStates: v.otherStates.filter((_, idx) => idx !== i) });

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Profile & Residency</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Filing status" tip="Your federal filing status affects brackets and deductions.">
          <select
            className="w-full border rounded px-3 py-2"
            value={v.filingStatus}
            onChange={(e) => update({ filingStatus: e.target.value as FilingStatus })}
          >
            <option value="single">Single</option>
            <option value="married_joint">Married filing jointly</option>
            <option value="married_separate">Married filing separately</option>
            <option value="head">Head of household</option>
          </select>
        </Field>

        <Field label="Primary state" tip="Where you primarily live for this tax year (e.g., CA, NY, TX).">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="CA"
            value={v.primaryState}
            onChange={(e) => update({ primaryState: e.target.value.toUpperCase() })}
          />
        </Field>

        <Field label="Dependents" tip="Number of dependents you claim.">
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={v.dependents}
            onChange={(e) => update({ dependents: parseInt(e.target.value || '0', 10) })}
          />
        </Field>

        <Field label="Birth year" tip="Used for age-based thresholds (catch-ups, Medicare, etc.).">
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={v.birthYear ?? 0}
            onChange={(e) => update({ birthYear: parseInt(e.target.value || '0', 10) })}
          />
        </Field>

        <Field label="Accredited investor?" tip="Typically $200k+ income single / $300k+ joint or $1M+ net worth (excludes home).">
          <select
            className="w-full border rounded px-3 py-2"
            value={String(v.accreditedInvestor ?? false)}
            onChange={(e) => update({ accreditedInvestor: e.target.value === 'true' })}
          >
            <option value="false">No / Not sure</option>
            <option value="true">Yes</option>
          </select>
        </Field>
      </div>

      {/* Multi-state */}
      <div className="rounded border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Other States (optional)</div>
          <p className="text-sm text-gray-600">
            If you lived or worked in multiple states, list them with approximate days and (if known) wages allocated.
          </p>
        </div>

        {v.otherStates.map((s, i) => (
          <div key={i} className="grid sm:grid-cols-4 gap-3 mb-3">
            <input
              className="border rounded px-3 py-2"
              placeholder="State (e.g., NY)"
              value={s.state}
              onChange={(e) => setOther(i, { state: e.target.value.toUpperCase() })}
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Days"
              value={s.days ?? 0}
              onChange={(e) => setOther(i, { days: parseInt(e.target.value || '0', 10) })}
            />
            <input
              type="number"
              className="border rounded px-3 py-2"
              placeholder="Wages allocated (optional)"
              value={s.wagesAllocated ?? 0}
              onChange={(e) => setOther(i, { wagesAllocated: parseFloat(e.target.value || '0') })}
            />
            <div className="flex items-center">
              <button type="button" className="text-sm underline" onClick={() => removeOther(i)}>
                Remove
              </button>
            </div>
          </div>
        ))}

        <button type="button" className="rounded border px-3 py-1 text-sm" onClick={addOther}>
          + Add state
        </button>
      </div>

      <div className="flex justify-end">
        <button type="button" className="inline-flex px-4 py-2 rounded bg-black text-white" onClick={onNext}>
          Continue
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  tip,
  children,
}: {
  label: string;
  tip?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="block font-medium mb-1">
        {label}
        {tip && <span className="ml-2 text-gray-500">({tip})</span>}
      </span>
      {children}
    </label>
  );
}