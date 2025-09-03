'use client';

import { useState } from 'react';
import type { PlanInput } from '../../lib/types';
import { EMPTY_PLAN } from '../../lib/types';
import Discovery from './steps/Discovery';

export default function Wizard() {
  const [data, setData] = useState<PlanInput>(EMPTY_PLAN);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="text-sm text-gray-600">Step 1 of 7</div>
        <h1 className="text-2xl font-semibold">Financial Planner</h1>
        <p className="text-sm text-gray-600 mt-1">
          We’ll start with your goals. Approximations are okay—you can refine later.
        </p>
      </header>

      <Discovery value={data} onChange={setData} />

      {/* Temporary preview so you can see state changing */}
      <div className="mt-6">
        <details>
          <summary className="cursor-pointer underline">Show raw data (debug)</summary>
          <pre className="mt-3 p-3 border rounded bg-gray-50 text-sm overflow-x-auto">
{JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}