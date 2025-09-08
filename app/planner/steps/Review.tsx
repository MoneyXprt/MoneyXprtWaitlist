'use client';

import * as React from 'react';
import type { PlanInput } from '../../../lib/types';
import { recommend } from '../../../lib/recommend';
import WhatIfPanel from '../components/WhatIfPanel';

type Props = {
  value: PlanInput;
  onChange: (next: PlanInput) => void;
  onBack?: () => void;
};

export default function Review({ value, onChange, onBack }: Props) {
  const plan = React.useMemo(() => recommend(value), [value]);

  const applyOverrides = (patch: Partial<PlanInput>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <section>
      <div className="mb-3 text-sm text-gray-600">Step 7 of 7</div>
      <h2 className="text-xl font-semibold mb-1">Financial Planner</h2>
      <p className="text-sm text-gray-600 mb-4">
        Tune the levers below and see your plan update instantly — no sensitive data required.
      </p>

      {/* Snapshot + base recs */}
      <div className="rounded border p-4">
        <h3 className="font-semibold mb-2">Personalized Recommendations</h3>
        <div className="text-sm text-gray-700 mb-3">{plan.greeting}</div>
        <ul className="text-sm text-gray-700 mb-4">
          <li>Gross income: <strong>${Math.round(plan.snapshot.grossIncome).toLocaleString()}</strong></li>
          <li>Annual spend: <strong>${Math.round(plan.snapshot.annualSpend).toLocaleString()}</strong></li>
          <li>Implied savings rate: <strong>{Math.round(plan.snapshot.impliedSavingsRate * 100)}%</strong></li>
          <li>Emergency fund target: <strong>${Math.round(plan.snapshot.efTarget).toLocaleString()}</strong></li>
          <li>Emergency fund gap: <strong>${Math.round(plan.snapshot.efGap).toLocaleString()}</strong></li>
          <li>Net worth: <strong>${Math.round(plan.snapshot.netWorth).toLocaleString()}</strong></li>
        </ul>

        <ol className="list-decimal pl-5 space-y-2 text-sm">
          {plan.recs.map((r, i) => <li key={i}>{r}</li>)}
        </ol>

        <div className="mt-4 flex gap-2">
          {onBack && (
            <button type="button" onClick={onBack} className="rounded border px-3 py-2 hover:bg-gray-50">
              Back
            </button>
          )}
          {/* You can wire this to export/share later */}
          <button type="button" className="rounded bg-black text-white px-3 py-2 hover:opacity-90">
            Save / Export (coming soon)
          </button>
        </div>
      </div>

      {/* Live what-if controls with preview */}
      <WhatIfPanel value={value} onApply={applyOverrides} />
    </section>
  );
}