// app/planner/recommendations/page.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';
import { toEngineSnapshot, usePlannerSnapshot } from '@/lib/strategy/ui/plannerStore';
import { fmtUSD } from '@/lib/ui/format';
import RiskBadge from '@/lib/ui/RiskBadge';


type Row = {
  code?: string;
  strategyId?: string;
  name: string;
  category: string;
  savingsEst: number;
  cashOutlayEst?: number;
  risk: number;
  flags?: any;
  stepsPreview: { label: string; due?: string }[];
};

export default function RecommendationsPage() {
  const { state, dispatch } = usePlanner();
  const snapshotPass3 = usePlannerSnapshot();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const snapshot = useMemo(() => toEngineSnapshot(state.data), [state.data]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch('/api/plan/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snapshot, includeHighRisk: state.includeHighRisk }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed');
        if (mounted) {
          setRows(json.items || []);
          dispatch({ type: 'setRecoItems', items: json.items || [] });
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Failed');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [snapshot, state.includeHighRisk, dispatch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recommendations</h1>
        <label className="text-sm flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.includeHighRisk}
            onChange={(e) => dispatch({ type: 'toggleHighRisk', value: e.target.checked })}
          />
          Show high-risk strategies
        </label>
      </div>
      <div className="rounded border p-3 text-xs text-neutral-600">
        Snapshot (pass‑3): year {snapshotPass3.settings.year || new Date().getFullYear()}, state(s) {snapshotPass3.settings.states.join(', ') || '—'}
      </div>
      {loading && <p>Running engine…</p>}
      {err && <p className="text-red-700">{err}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {!loading && rows.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Strategy</th>
                  <th>Est. Savings</th>
                  <th>Cash Outlay</th>
                  <th>Risk</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
            {rows.map((r) => (
              <tr key={r.code || r.strategyId} className="border-b hover:bg-neutral-50">
                <td className="py-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-neutral-600">{r.category}</div>
                </td>
                <td>{fmtUSD(r.savingsEst)}</td>
                <td>{fmtUSD(r.cashOutlayEst || 0)}</td>
                <td><RiskBadge score={r.risk} /></td>
                <td>
                  <button
                    className="underline text-emerald-700"
                    onClick={() => {
                      dispatch({ type: 'select', code: (r as any).code || r.strategyId });
                    }}
                  >
                    Add to Scenario
                  </button>
                </td>
              </tr>
            ))}
              </tbody>
            </table>
          )}
        </div>
        <aside className="md:col-span-1">
          <div className="rounded border p-3 text-sm">
            <div className="font-semibold mb-2">Selected ({state.selectedStrategies.length})</div>
            {state.selectedStrategies.length === 0 ? (
              <p className="text-neutral-600">No strategies selected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {state.selectedStrategies.map((c) => (
                  <span key={c} className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {c}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3">
              <a href="/planner/scenario" className="rounded bg-emerald-700 text-white px-3 py-2 inline-block">
                Build Scenario
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
