"use client";
import React from "react";

type HistoryItem = {
  id: string;
  createdAt: string | null;
  score?: string | null;
  scoreTotal?: string | null;
};

export type HistoryClientProps = {
  initialPlanId?: string;
};

export default function HistoryClient({ initialPlanId }: HistoryClientProps) {
  const [items, setItems] = React.useState<HistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/planner/history?limit=20`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed (${res.status})`);
        const json = await res.json();
        if (alive) setItems(json.items ?? []);
      } catch (e: any) {
        if (alive) setError(e?.message ?? 'Failed to load');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [initialPlanId]);

  const rows = React.useMemo(() => {
    const out: Array<{ id: string; createdAt: string; score: number | null; delta: number | null }> = [];
    let prev: number | null = null;
    for (const it of items) {
      const scoreVal = it.score ?? it.scoreTotal ?? null;
      const score = scoreVal !== null && scoreVal !== undefined ? Number(scoreVal) : null;
      const created = it.createdAt ? new Date(it.createdAt).toLocaleString() : '';
      const delta = score !== null && prev !== null ? Number((score - prev).toFixed(2)) : null;
      out.push({ id: it.id, createdAt: created, score, delta });
      if (score !== null) prev = score;
    }
    return out;
  }, [items]);

  return (
    <div data-testid="history-client-root" className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Plan History</h1>
      {loading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-neutral-500">No history yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2">Δ vs prior</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b hover:bg-neutral-50">
                  <td className="py-2 pr-4 whitespace-nowrap">{r.createdAt}</td>
                  <td className="py-2 pr-4">{r.score !== null ? r.score.toFixed(2) : '-'}</td>
                  <td className={`py-2 ${r.delta === null ? '' : r.delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {r.delta === null ? '-' : r.delta >= 0 ? `+${r.delta.toFixed(2)}` : r.delta.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
