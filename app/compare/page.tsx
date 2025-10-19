'use client';
import { useEffect, useState } from 'react';

type RunLite = { id: string; created_at: string; tax_year: number | null };
type FullRun = RunLite & { scenario_data: any; user_message: string | null; answer: string | null };

export default function ComparePage() {
  const [runs, setRuns] = useState<RunLite[]>([]);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState<{ runs: FullRun[] } | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/scenarios/recent').then((res) => res.json());
      if (r.ok) setRuns(r.runs || []);
    })();
  }, []);

  async function compare() {
    setErr('');
    setResult(null);
    if (!a || !b || a === b) {
      setErr('Pick two different runs.');
      return;
    }
    const r = await fetch(`/api/scenarios/compare?a=${a}&b=${b}`).then((res) => res.json());
    if (!r.ok) {
      setErr(r.error || 'Failed');
      return;
    }
    setResult(r);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Compare Scenarios</h1>
      <div className="grid md:grid-cols-2 gap-3">
        <select className="border rounded p-2" value={a} onChange={(e) => setA(e.target.value)}>
          <option value="">Select baseline…</option>
          {runs.map((r) => (
            <option key={r.id} value={r.id}>
              {new Date(r.created_at).toLocaleString()} — {r.tax_year ?? '—'}
            </option>
          ))}
        </select>
        <select className="border rounded p-2" value={b} onChange={(e) => setB(e.target.value)}>
          <option value="">Select what-if…</option>
          {runs.map((r) => (
            <option key={r.id} value={r.id}>
              {new Date(r.created_at).toLocaleString()} — {r.tax_year ?? '—'}
            </option>
          ))}
        </select>
      </div>
      <button onClick={compare} className="btn-primary">Compare</button>
      {err && <div className="text-red-600">{err}</div>}

      {result?.runs?.length === 2 && (
        <div className="grid md:grid-cols-2 gap-4">
          {result.runs.map((r: any, idx: number) => (
            <div key={r.id} className="border rounded p-4">
              <h2 className="font-semibold mb-1">{idx === 0 ? 'Baseline' : 'What-If'}</h2>
              <div className="text-xs text-gray-500 mb-2">
                {new Date(r.created_at).toLocaleString()} • Tax Year {r.tax_year ?? '—'}
              </div>
              <h3 className="font-medium">Intake</h3>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(r.scenario_data, null, 2)}</pre>
              <h3 className="font-medium mt-2">Answer</h3>
              <div className="text-sm whitespace-pre-wrap">{r.answer || '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
