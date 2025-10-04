// app/planner/playbook/page.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';
import { fmtUSD } from '@/lib/ui/format';
import { toEngineSnapshot } from '@/lib/strategy/ui/plannerStore';


export default function PlaybookPage() {
  const { state } = usePlanner();
  const snapshot = useMemo(() => toEngineSnapshot(state.data), [state.data]);
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
          body: JSON.stringify({ snapshot, selected: state.selectedStrategies, includeHighRisk: state.includeHighRisk }),
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
  }, [snapshot, state.selectedStrategies, state.includeHighRisk]);

  async function exportFile() {
    if (!playbook) return;
    const res = await fetch('/api/plan/playbook.export', {
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
          <div className="flex items-center gap-3">
            <button onClick={exportFile} className="rounded bg-emerald-700 text-white px-3 py-2">Export</button>
            <a href="/planner/intake" className="underline text-sm">Start Over</a>
          </div>
        </div>
      )}
    </div>
  );
}
