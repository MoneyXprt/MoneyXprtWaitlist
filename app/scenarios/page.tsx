'use client';
import { useEffect, useState } from 'react';

type RunRow = { id: string; tax_year: number | null; created_at: string; model: string | null };

export default function HistoryPage() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  // load saved profileId from localStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mx_profile_id') : null;
    if (saved) setProfileId(saved);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const qs = profileId ? `?profileId=${encodeURIComponent(profileId)}` : '';
        const r = await fetch(`/api/scenarios/recent${qs}`).then(res => res.json());
        if (!r.ok) throw new Error(r.error || 'Failed to load');
        setRuns(r.runs || []);
      } catch (e: any) {
        setError(e.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId]);

  async function openDetail(id: string) {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const r = await fetch(`/api/scenarios/${id}`).then(res => res.json());
      if (!r.ok) throw new Error(r.error || 'Failed to load run');
      setDetail(r.run);
    } catch (e:any) {
      setDetail({ error: e.message || 'Error' });
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Scenario History</h1>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      {!loading && !error && (
        <div className="border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Created</th>
                <th className="text-left p-3">Tax Year</th>
                <th className="text-left p-3">Model</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-3">{r.tax_year ?? '—'}</td>
                  <td className="p-3">{r.model ?? '—'}</td>
                  <td className="p-3">
                    <button
                      onClick={() => openDetail(r.id)}
                      className="px-3 py-1 rounded bg-black text-white"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr><td className="p-3" colSpan={4}>No runs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel */}
      {selectedId && (
        <div className="border rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Run Details</h2>
            <button onClick={() => setSelectedId(null)} className="text-sm underline">Close</button>
          </div>
          {detailLoading && <div>Loading details…</div>}
          {!detailLoading && detail && !detail.error && (
            <>
              <div className="text-xs text-gray-500">
                <div>ID: {detail.id}</div>
                <div>Created: {new Date(detail.created_at).toLocaleString()}</div>
                <div>Tax Year: {detail.tax_year ?? '—'}</div>
                <div>Model: {detail.model ?? '—'}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Intake (scenario_data)</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                    {JSON.stringify(detail.scenario_data, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">User Message</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                    {detail.user_message || '—'}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Answer</h3>
                <div className="text-sm whitespace-pre-wrap border rounded p-3 bg-white">
                  {detail.answer || '—'}
                </div>
              </div>
            </>
          )}
          {!detailLoading && detail?.error && (
            <div className="text-red-600">Error: {detail.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
