'use client';

import * as React from 'react';
import type { PlanInput } from '@/lib/types';
import { recommend } from '@/lib/recommend';
import WhatIfPanel from '@/app/planner/components/WhatIfPanel';

type Props = {
  value: PlanInput;
  /** Optional: allow edits from the Review step (via What-If panel) */
  onChange?: (next: PlanInput) => void;
  onBack: () => void;
  /** Not used here — submission is handled by the parent <form> in Wizard via type="submit" */
  onNext?: () => void;
};

export default function Review({ value, onChange, onBack }: Props) {
  const recs = React.useMemo(() => recommend(value), [value]);

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Review & Finalize</h2>
      <p className="text-sm text-gray-600 mb-4">
        Here’s a first pass of your plan. Tweak inputs on the right and re-run the preview to tailor it further.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Recommendations */}
        <div className="rounded border p-4">
          <h3 className="font-semibold mb-2">Personalized Recommendations</h3>
          {recs.length === 0 ? (
            <p>No recommendations yet.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {recs.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}

          {/* Footer actions */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded border px-4 py-2 hover:bg-gray-50"
            >
              Back
            </button>

            {/* This submits the parent <form> in Wizard.tsx */}
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 rounded bg-black text-white hover:opacity-90"
            >
              Generate Final Plan
            </button>
          </div>
        </div>

        {/* Right: What-If panel for quick adjustments */}
        <div className="rounded border p-4">
          <h3 className="font-semibold mb-2">What-If Adjustments</h3>
          <WhatIfPanel
            value={value}
            onChange={onChange ?? (() => {})}
          />
          <p className="text-xs text-gray-500 mt-3">
            Adjust a few numbers to see how your recommendations shift. Changes are applied live.
          </p>
        </div>
      </div>
    </section>
  );
}