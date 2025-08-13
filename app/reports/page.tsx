'use client';

import { useEffect, useState } from 'react';
import { sbBrowser } from '@/lib/supabase';

type Report = {
  id: string;
  kind: string;
  created_at: string;
  sha256_hex: string | null;
  output_summary: any;
  raw_output: string | null;
};

export default function ReportsPage() {
  const supabase = sbBrowser();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from('reports')
        .select('id, kind, created_at, sha256_hex, output_summary, raw_output')
        .order('created_at', { ascending: false });
      if (!error && data) setReports(data as Report[]);
      setLoading(false);
    };
    fetchReports();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Your Reports</h1>
      {reports.length === 0 ? (
        <p className="text-neutral-600">No reports yet. Run a scan on the home page.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map(r => (
            <li key={r.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{r.kind}</div>
                  <div className="text-sm text-neutral-600">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                {r.sha256_hex ? (
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                    Verified Hash: {r.sha256_hex.slice(0, 10)}…
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 rounded bg-neutral-200 text-neutral-700">
                    No hash
                  </span>
                )}
              </div>
              {r.raw_output && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-blue-700">Show output</summary>
                  <pre className="mt-2 whitespace-pre-wrap text-sm">{r.raw_output}</pre>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}