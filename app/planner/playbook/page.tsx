// app/planner/playbook/page.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';
import { toEngineSnapshot } from '@/lib/strategy/ui/plannerStore';

export const dynamic = 'force-dynamic';

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

  async function exportPdf() {
    if (!playbook) return;
    const res = await fetch('/api/plan/playbook.pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playbook }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playbook.pdf';
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
            <div className="text-sm">Strategies: {playbook.summary?.strategies}</div>
            <div className="text-sm">Estimated Savings: ${Math.round(playbook.summary?.estSavings || 0).toLocaleString()}</div>
          </div>
          <div>
            <h2 className="font-semibold">Strategy Steps</h2>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {playbook.items?.flatMap((it: any) => (
                <li key={it.id}>
                  <span className="font-medium">{it.name}:</span> {(it.steps || []).slice(0, 5).map((s: any) => s.label).join('; ')}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={exportPdf} className="rounded bg-emerald-700 text-white px-3 py-2">Export PDF</button>
        </div>
      )}
    </div>
  );
}
