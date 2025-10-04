// app/planner/recommendations/page.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';
import { toEngineSnapshot } from '@/lib/strategy/ui/plannerStore';


type Row = {
  strategyId: string;
  name: string;
  category: string;
  savingsEst: number;
  cashOutlayEst: number;
  risk: number;
  flags: any;
  stepsPreview: { label: string; due?: string }[];
};

export default function RecommendationsPage() {
  const { state, dispatch } = usePlanner();
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
      {loading && <p>Running engine…</p>}
      {err && <p className="text-red-700">{err}</p>}
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
              <tr key={r.strategyId} className="border-b hover:bg-neutral-50">
                <td className="py-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-neutral-600">{r.category}</div>
                </td>
                <td>${Math.round(r.savingsEst).toLocaleString()}</td>
                <td>${Math.round(r.cashOutlayEst || 0).toLocaleString()}</td>
                <td>{r.risk}</td>
                <td>
                  <button
                    className="underline text-emerald-700"
                    onClick={() => dispatch({ type: 'select', code: r.strategyId })}
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
  );
}
