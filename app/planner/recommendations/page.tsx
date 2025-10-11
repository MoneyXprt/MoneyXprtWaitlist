// app/planner/recommendations/page.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toEngineSnapshot, usePlannerSnapshot } from '@/lib/strategy/ui/snapshots';
import { fmtUSD } from '@/lib/ui/format';
import RiskBadge from '@/lib/ui/RiskBadge';
import RecommendationCard from '@/components/RecommendationCard';
import Link from 'next/link';
import { usePlannerStore } from '@/lib/store/planner';


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
  const data = usePlannerStore((s) => s.data);
  const includeHighRisk = usePlannerStore((s) => s.includeHighRisk);
  const toggleHighRisk = usePlannerStore((s) => s.toggleHighRisk);
  const setRecoItems = usePlannerStore((s) => s.setRecoItems);
  const snapshotPass3 = usePlannerSnapshot();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<'impact' | 'risk'>('impact');
  const [toast, setToast] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const scenario = usePlannerStore();
  const params = useSearchParams();

  const snapshot = useMemo(() => toEngineSnapshot(data), [data]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch('/api/plan/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snapshot, includeHighRisk }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed');
        if (mounted) {
          setRows(json.items || []);
          setRecoItems(json.items || []);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Failed');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    // If nothing loads, auto-try demo once
    // Wait a tick to let first fetch complete
    const t = setTimeout(async () => {
      if (!mounted) return;
      if (rows.length === 0 || params?.get('demo') === '1') {
        const demo = {
          settings: { states: ['CA'], year: new Date().getFullYear() },
          profile: { filingStatus: 'Single' },
          income: { w2: 300000, k1: 120000 },
          entities: [{ type: 'S-Corp' }],
          properties: [{ type: 'rental', basis: 450000 }],
        };
        try {
          const resp = await fetch('/api/plan/recommend', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ snapshot: demo })
          });
          const data = await resp.json();
          if (resp.ok && (data?.items || []).length > 0) {
            setRows(data.items);
            setRecoItems(data.items);
          }
        } catch {}
      }
    }, 400);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [snapshot, includeHighRisk, setRecoItems]);

  const filtered = useMemo(() => {
    let list = [...rows];
    if (stateFilter !== 'all') list = list.filter((r: any) => (r.states || []).includes(stateFilter));
    if (categoryFilter !== 'all') list = list.filter((r) => r.category === categoryFilter);
    return list;
  }, [rows, stateFilter, categoryFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortKey === 'impact') copy.sort((a, b) => (b.savingsEst || 0) - (a.savingsEst || 0));
    else if (sortKey === 'risk') copy.sort((a, b) => (b.risk || 0) - (a.risk || 0));
    else copy.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    return copy;
  }, [filtered, sortKey]);

  const selectedItems = useMemo(() => {
    const byId: Record<string, Row> = {};
    for (const r of rows) byId[(r as any).code || (r as any).strategyId] = r as any;
    const codes = scenario.selected.map((s) => s.code);
    return codes.map((c) => byId[c]).filter(Boolean) as Row[];
  }, [rows, scenario.selected]);

  const selectedTotal = selectedItems.reduce((a, r) => a + (r?.savingsEst || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recommendations {includeHighRisk && <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">High-Risk enabled</span>}</h1>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <span>Sort</span>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="border rounded px-2 py-1">
              <option value="impact">Impact</option>
              <option value="risk">Risk</option>
              <option value="category">Category</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span>State</span>
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="border rounded px-2 py-1">
              <option value="all">All</option>
              {['CA','NY','IL','MN'].map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span>Category</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded px-2 py-1">
              <option value="all">All</option>
              {Array.from(new Set(rows.map((r) => r.category))).map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={includeHighRisk} onChange={(e) => toggleHighRisk(e.target.checked)} />
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
                <RecommendationCard
                  key={(r as any).code || (r as any).strategyId}
                  item={{ ...(r as any), code: (r as any).code || (r as any).strategyId }}
                />
              ))}
            </div>
          )}
        </div>
        <aside className="md:col-span-1">
          <div className="rounded border p-3 text-sm">
            <div className="font-semibold mb-2">Selected ({scenario.selected.length})</div>
            {scenario.selected.length === 0 ? (
              <p className="text-neutral-600">No strategies selected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {scenario.selected.map((it) => (
                  <span key={it.code} className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {it.name}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 text-sm text-neutral-700">Total Savings: <span className="font-semibold">{fmtUSD(scenario.total())}</span></div>
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
