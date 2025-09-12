// app/planner/steps/Profile.tsx
'use client';

import * as React from 'react';
import type { PlanInput, ResidencyItem, FilingStatus } from '@/lib/types';

type Props = {
  value: PlanInput;
  onChange: (next: PlanInput) => void;
  onNext?: () => void;
  onBack?: () => void;
};

const FILING_STATUSES: FilingStatus[] = ['single', 'married_joint', 'married_separate', 'head'];

export default function Profile({ value, onChange, onNext, onBack }: Props) {
  const v = value;
  const update = (patch: Partial<PlanInput>) => onChange({ ...v, ...patch });

  // helpers for residency array ----------------------------------------------
  const addResidency = () => {
    const row: ResidencyItem = { state: '', startDate: '', endDate: '', primary: false };
    update({ residency: [...(v.residency ?? []), row] });
  };

  const setResidency = (i: number, patch: Partial<ResidencyItem>) => {
    const arr = [...(v.residency ?? [])];
    const current = arr[i] ?? { state: '', startDate: '' };
    arr[i] = { ...current, ...patch };
    update({ residency: arr });
  };

  const removeResidency = (i: number) => {
    const arr = [...(v.residency ?? [])];
    arr.splice(i, 1);
    update({ residency: arr });
  };

  // Ensure only one "primary" flag at a time
  const setPrimaryResidency = (i: number, primary: boolean) => {
    const arr = (v.residency ?? []).map((r, idx) => ({ ...r, primary: primary && idx === i }));
    update({ residency: arr });
    // also mirror to top-level domicile state if this row has a state
    const chosen = arr[i];
    if (primary && chosen?.state) {
      update({ state: chosen.state });
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Profile & Residency</h2>
      <p className="text-sm text-gray-600">
        Light profile (no sensitive PII). Residency helps the 50-state tax engine pick the right rules.
      </p>

      {/* Basic profile */}
      <div className="rounded border p-4 grid md:grid-cols-3 gap-4">
        <Field label="First name (optional)">
          <input
            className="w-full border rounded px-3 py-2"
            type="text"
            value={v.firstName ?? ''}
            onChange={(e) => update({ firstName: e.target.value })}
            placeholder="e.g., Alex"
          />
        </Field>
        <Field label="Last name (optional)">
          <input
            className="w-full border rounded px-3 py-2"
            type="text"
            value={v.lastName ?? ''}
            onChange={(e) => update({ lastName: e.target.value })}
            placeholder="e.g., Morgan"
          />
        </Field>
        <Field label="Email (optional)">
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            value={v.email ?? ''}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Filing status">
          <select
            className="w-full border rounded px-3 py-2"
            value={v.filingStatus}
            onChange={(e) => update({ filingStatus: e.target.value as FilingStatus })}
          >
            {FILING_STATUSES.map((fs) => (
              <option key={fs} value={fs}>
                {labelFiling(fs)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Domicile / current state">
          <input
            className="w-full border rounded px-3 py-2"
            type="text"
            value={v.state ?? ''}
            onChange={(e) => update({ state: e.target.value })}
            placeholder="e.g., CA, NY, TX"
          />
          <p className="text-[12px] text-gray-500 mt-1">
            This mirrors the row you mark as <em>Primary</em> in the residency list below.
          </p>
        </Field>
      </div>

      {/* Residency history */}
      <div className="rounded border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Residency history (this tax year)</h3>
          <button
            type="button"
            className="text-sm rounded border px-3 py-1 hover:bg-gray-50"
            onClick={addResidency}
          >
            + Add state period
          </button>
        </div>

        {(v.residency ?? []).length === 0 ? (
          <p className="text-sm text-gray-600">
            Add any states you lived in this year (helpful for part-year / multi-state filing).
          </p>
        ) : (
          <div className="space-y-3">
            {(v.residency ?? []).map((r, i) => (
              <div key={i} className="grid md:grid-cols-5 gap-3 items-end border rounded p-3">
                <Field label="State">
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={r.state ?? ''}
                    onChange={(e) => setResidency(i, { state: e.target.value })}
                    placeholder="e.g., CA"
                  />
                </Field>
                <Field label="Start date">
                  <input
                    className="w-full border rounded px-3 py-2"
                    type="date"
                    value={r.startDate ?? ''}
                    onChange={(e) => setResidency(i, { startDate: e.target.value })}
                  />
                </Field>
                <Field label="End date (optional)">
                  <input
                    className="w-full border rounded px-3 py-2"
                    type="date"
                    value={r.endDate ?? ''}
                    onChange={(e) => setResidency(i, { endDate: e.target.value })}
                  />
                </Field>
                <Field label="Primary?">
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={String(!!r.primary)}
                    onChange={(e) => setPrimaryResidency(i, e.target.value === 'true')}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </Field>
                <div className="flex md:justify-end">
                  <button
                    type="button"
                    className="text-sm rounded border px-3 py-2 hover:bg-gray-50"
                    onClick={() => removeResidency(i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button type="button" className="rounded border px-4 py-2" onClick={onBack}>
          Back
        </button>
        <button type="button" className="inline-flex px-4 py-2 rounded bg-black text-white" onClick={onNext}>
          Continue
        </button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block font-medium mb-1">{label}</span>
      {children}
    </label>
  );
}

function labelFiling(fs: FilingStatus) {
  switch (fs) {
    case 'single':
      return 'Single';
    case 'married_joint':
      return 'Married filing jointly';
    case 'married_separate':
      return 'Married filing separately';
    case 'head':
      return 'Head of household';
    default:
      return fs;
  }
}