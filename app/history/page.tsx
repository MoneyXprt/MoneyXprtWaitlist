'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import LoadingRows from '@/components/LoadingRows';

type RunRow = { id: string; tax_year: number | null; created_at: string; model: string | null; profile_id: string | null };
type ProfileRow = { id: string; user_id: string | null; created_at: string };

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return {}; }
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [profileId, setProfileId] = useState<string | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // load profiles + remembered profile
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/profiles/recent', { cache: 'no-store' });
        const json: any = await safeJson(res);
        if (res.ok && json?.ok) setProfiles(json.profiles || []);
        const saved = localStorage.getItem('mx_profile_id');
        if (saved) setProfileId(saved);
      } catch (e: any) {
        // just log; don’t crash the page
        console.warn('[history] profiles error:', e?.message || e);
      }
    })();
  }, []);

  // load runs (filtered by profile)
  useEffect(() => {
    setLoading(true); setErr('');
    (async () => {
      try {
        const qs = profileId ? `?profileId=${encodeURIComponent(profileId)}` : '';
        const res = await fetch(`/api/scenarios/recent${qs}`, { cache: 'no-store' });
        const json: any = await safeJson(res);
        if (!res.ok || !json?.ok) throw new Error(json?.error || `HTTP ${res.status}`);
        setRuns(json.runs || []);
      } catch (e: any) {
        setErr(e.message || 'Failed to load scenarios');
      } finally {
        setLoading(false);
      }
    })();
  }, [profileId]);

  const filtered = useMemo(() => {
    if (!search) return runs;
    const s = search.toLowerCase();
    return runs.filter(r =>
      (r.model || '').toLowerCase().includes(s) ||
      (r.tax_year ? String(r.tax_year) : '').includes(s) ||
      new Date(r.created_at).toLocaleString().toLowerCase().includes(s)
    );
  }, [runs, search]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">Scenario History</h1>
            <div className="flex gap-2">
              <Link href="/intake"><Button>New Scenario</Button></Link>
              <Link href="/compare"><Button variant="outline">Compare</Button></Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <div className="text-sm mb-1">Filter by Profile</div>
              <Select
                value={profileId || 'all'}
                onValueChange={(v) => {
                  const next = v === 'all' ? '' : v;
                  setProfileId(next);
                  if (next) localStorage.setItem('mx_profile_id', next);
                  else localStorage.removeItem('mx_profile_id');
                }}
              >
                <SelectTrigger><SelectValue placeholder="All profiles" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All profiles</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {(p.user_id || 'profile')} — {new Date(p.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm mb-1">Search</div>
              <Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search model, year, or date…" />
            </div>
          </div>

          <div className="border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-sm font-medium">
              <div className="col-span-4">Created</div>
              <div className="col-span-2">Tax Year</div>
              <div className="col-span-3">Model</div>
              <div className="col-span-3 text-right pr-1">Actions</div>
            </div>

            <div className="p-4">
              {loading && <LoadingRows rows={5} />}

              {!loading && err && (
                <div className="text-red-600">{err}</div>
              )}

              {!loading && !err && filtered.length === 0 && (
                <div className="text-sm text-slate-600">
                  No scenarios found. <Link href="/intake" className="underline">Create your first run</Link>.
                </div>
              )}

              {!loading && !err && filtered.length > 0 && (
                <div className="space-y-2">
                  {filtered.map((r) => (
                    <div key={r.id} className="grid grid-cols-12 items-center border rounded-xl px-4 py-2">
                      <div className="col-span-4">{new Date(r.created_at).toLocaleString()}</div>
                      <div className="col-span-2">{r.tax_year ?? '—'}</div>
                      <div className="col-span-3">{r.model ?? '—'}</div>
                      <div className="col-span-3 text-right flex justify-end gap-2">
                        <Link href={`/compare?a=${r.id}`}><Button variant="outline" size="sm">Compare</Button></Link>
                        <Link href="/intake"><Button size="sm">New</Button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
