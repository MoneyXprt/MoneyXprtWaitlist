// app/planner/recommendations/page.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';
import { toEngineSnapshot, usePlannerSnapshot } from '@/lib/strategy/ui/plannerStore';
import { fmtUSD } from '@/lib/ui/format';
import RiskBadge from '@/lib/ui/RiskBadge';
import StrategyCard from '@/components/planner/StrategyCard';
import Link from 'next/link';


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
  const [sortKey, setSortKey] = useState<'impact' | 'risk'>('impact');
  const [toast, setToast] = useState<string | null>(null);

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

  const sorted = useMemo(() => {
    const copy = [...rows];
    if (sortKey === 'impact') copy.sort((a, b) => (b.savingsEst || 0) - (a.savingsEst || 0));
    else copy.sort((a, b) => (b.risk || 0) - (a.risk || 0));
    return copy;
  }, [rows, sortKey]);

  const selectedItems = useMemo(() => {
    const byId: Record<string, Row> = {};
    for (const r of rows) byId[(r as any).code || (r as any).strategyId] = r as any;
    return state.selectedStrategies.map((c) => byId[c]).filter(Boolean) as Row[];
  }, [rows, state.selectedStrategies]);

  const selectedTotal = selectedItems.reduce((a, r) => a + (r?.savingsEst || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recommendations {state.includeHighRisk && <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">High-Risk enabled</span>}</h1>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <span>Sort</span>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="border rounded px-2 py-1">
              <option value="impact">Impact</option>
              <option value="risk">Risk</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.includeHighRisk}
              onChange={(e) => dispatch({ type: 'toggleHighRisk', value: e.target.checked })}
            />
            High-Risk
          </label>
        </div>
      </div>
      <div className="rounded border p-3 text-xs text-neutral-600">
        Snapshot (pass‑3): year {snapshotPass3.settings.year || new Date().getFullYear()}, state(s) {snapshotPass3.settings.states.join(', ') || '—'}
      </div>
      {loading && <p>Running engine…</p>}
      {err && <p className="text-red-700">{err}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {!loading && rows.length === 0 && (
            <div className="rounded border p-6 text-center text-sm text-neutral-700">
              <p>No recommendations yet. Try loading demo data to see how it works.</p>
              <Link href="/planner/intake?demo=ca300k1rental" className="mt-3 inline-block rounded bg-emerald-700 text-white px-3 py-2">Load demo data</Link>
            </div>
          )}
          {!loading && rows.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {sorted.map((r) => (
                <StrategyCard
                  key={(r as any).code || (r as any).strategyId}
                  item={{ ...r, docs: (r as any).docs }}
                  onAdd={() => {
                    dispatch({ type: 'select', code: (r as any).code || r.strategyId });
                    setToast('Added to Scenario');
                    setTimeout(() => setToast(null), 1500);
                  }}
                />
              ))}
            </div>
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
            <div className="mt-3 text-sm text-neutral-700">Total Savings: <span className="font-semibold">{fmtUSD(selectedTotal)}</span></div>
            <div className="mt-3">
              <a href="/planner/scenario" className="rounded bg-emerald-700 text-white px-3 py-2 inline-block">
                Build Scenario
              </a>
            </div>
          </div>
        </aside>
      </div>
      {toast && (
        <div className="fixed bottom-4 right-4 rounded bg-neutral-900 text-white px-3 py-2 text-sm shadow">
          {toast}
        </div>
      )}
    </div>
  );
}
