"use client";

import { useEffect, useMemo, useState } from 'react';
import { usePlannerStore } from '@/lib/store/planner';
import { fmtUSD } from '@/lib/ui/format';
import { toEngineSnapshot } from '@/lib/strategy/ui/snapshots';

export default function PlaybookClient() {
  const data = usePlannerStore((s) => s.data);
  const selected = usePlannerStore((s) => s.selected);
  const includeHighRisk = usePlannerStore((s) => s.includeHighRisk);
  const snapshot = useMemo(() => toEngineSnapshot(data), [data]);
  const [playbook, setPlaybook] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch('/api/plan/playbook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ snapshot, selected: selected.map((s) => s.code), includeHighRisk }),
        });
        const json = await res.json();
        if (mounted) setPlaybook(json);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [snapshot, selected, includeHighRisk]);

  async function exportFile() {
    if (!playbook) return;
    const year = playbook?.summary?.year || snapshot.profile?.year || new Date().getFullYear();
    const res = await fetch(`/api/plan/playbook.export?filename=playbook-${year}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playbook }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = res.headers.get('Content-Type')?.includes('pdf') ? 'playbook.pdf' : 'playbook.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if ((selected || []).length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Playbook</h1>
        <div className="rounded border p-6 text-center text-sm text-neutral-700">
          <p>No strategies selected. Start in Recommendations and add a few items.</p>
          <a href="/planner/recommendations" className="mt-3 inline-block rounded bg-emerald-700 text-white px-3 py-2">Go to Recommendations</a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Playbook</h1>
      {loading && <p>Compiling…</p>}
      {playbook && (
        <div className="space-y-6">
          <div>
            <div className="text-sm text-neutral-700">Summary</div>
            <div className="text-sm">Strategies: {playbook.summary?.count ?? playbook.summary?.strategies}</div>
            <div className="text-sm">Estimated Savings: {fmtUSD(playbook.summary?.totalSavings ?? playbook.summary?.estSavings)}</div>
            <div className="text-xs text-neutral-600">Year: {playbook.summary?.year ?? snapshot.profile?.year}</div>
          </div>
          <div className="space-y-4">
            <h2 className="font-semibold">Strategy Steps</h2>
            {playbook.items?.map((it: any) => (
              <div key={it.code} className="rounded border p-3">
                <h3 className="font-medium">{it.name}</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {(it.steps || []).map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
                {(it.docs?.length || 0) > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="font-medium">Docs</div>
                    <ul className="list-disc pl-5">
                      {it.docs.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(it.deadlines?.length || 0) > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="font-medium">Deadlines</div>
                    <ul className="list-disc pl-5">
                      {it.deadlines.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(it.riskNotes?.length || 0) > 0 && (
                  <div className="mt-2 text-sm text-amber-800">
                    <div className="font-medium">Risk</div>
                    <ul className="list-disc pl-5">
                      {it.riskNotes.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
          {(playbook.docs?.length || 0) > 0 && (
            <div>
              <h2 className="font-semibold">Overall Documents</h2>
              <ul className="list-disc pl-5 text-sm">
                {playbook.docs.map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          {(playbook.deadlines?.length || 0) > 0 && (
            <div>
              <h2 className="font-semibold">Overall Deadlines</h2>
              <ul className="list-disc pl-5 text-sm">
                {playbook.deadlines.map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button onClick={exportFile} className="rounded bg-emerald-700 text-white px-3 py-2">Export</button>
            <a href="/planner/intake" className="underline text-sm">Start Over</a>
          </div>
        </div>
      )}
    </div>
  );
}

