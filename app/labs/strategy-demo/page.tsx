"use client";

import { useMemo } from 'react';
import { runEngine } from '@/lib/strategy';

export default function StrategyDemoPage() {
  const { recs } = useMemo(() => {
    const snapshot = {
      settings: { states: ['CA'], year: 2025 },
      profile: { filingStatus: 'MFJ' },
      income: { w2: 300000, k1: 220000 },
      entities: [{ type: 'S-Corp' }],
      properties: [{ type: 'rental', basis: 900000 }],
    } as any;

    const recs = runEngine(snapshot);
    return { recs };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Strategy Demo</h1>
      <p className="text-sm text-neutral-600">
        This demo runs the Tax Strategy Engine locally with sample inputs and shows the recommendation items.
      </p>
      <div className="rounded border p-4">
        {recs.length === 0 ? (
          <p>No recommendations returned for sample data.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {recs.map((r: any) => (
              <li key={r.code}>
                <span className="font-medium">{r.code}</span> — est. savings ${r.savingsEst.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="text-xs text-neutral-600">
        The engine is pure and runs client-side for this demo. Production will compute on the server.
      </div>
    </div>
  );
}
