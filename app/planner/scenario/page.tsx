// app/planner/scenario/page.tsx
"use client";

import { useMemo } from 'react';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';
import { findConflicts } from '@/lib/strategy/conflicts';
import Link from 'next/link';


export default function ScenarioPage() {
  const { state, dispatch } = usePlanner();
  const itemsById: Record<string, any> = useMemo(() => {
    const out: Record<string, any> = {};
    for (const it of state.lastRecoItems || []) out[(it as any).code || it.strategyId] = it;
    return out;
  }, [state.lastRecoItems]);

  const codes = state.selectedStrategies;
  const rows = codes.map((c) => itemsById[c]).filter(Boolean);
  const totals = rows.reduce(
    (acc, r) => ({ savings: acc.savings + (r?.savingsEst || 0), cash: acc.cash + (r?.cashOutlayEst || 0), risk: acc.risk + (r?.risk || 0) }),
    { savings: 0, cash: 0, risk: 0 }
  );
  const conflicts = findConflicts(codes);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Scenario Builder</h1>
      {conflicts.length > 0 && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm">
          Potential conflicts: {conflicts.map((c) => `${c.a} ↔ ${c.b}`).join(', ')}
        </div>
      )}
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-600">No strategies selected yet. Go to <Link href="/planner/recommendations" className="underline">Recommendations</Link> and add some.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Strategy</th>
              <th>Est. Savings</th>
              <th>Cash Outlay</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, idx: number) => (
              <tr key={r.strategyId} className="border-b">
                <td className="py-2">{r.name}</td>
                <td>${Math.round(r.savingsEst).toLocaleString()}</td>
                <td>${Math.round(r.cashOutlayEst || 0).toLocaleString()}</td>
                <td className="space-x-2">
                  <button className="underline" onClick={() => dispatch({ type: 'reorder', from: idx, to: Math.max(0, idx - 1) })}>Up</button>
                  <button className="underline" onClick={() => dispatch({ type: 'reorder', from: idx, to: Math.min(rows.length - 1, idx + 1) })}>Down</button>
                  <button className="underline text-red-700" onClick={() => dispatch({ type: 'deselect', code: r.strategyId })}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium">
              <td className="py-2">Totals</td>
              <td>${Math.round(totals.savings).toLocaleString()}</td>
              <td>${Math.round(totals.cash).toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      )}

      <div>
        <Link href="/planner/playbook" className="rounded bg-emerald-700 text-white px-3 py-2">Generate Playbook</Link>
      </div>
    </div>
  );
}
