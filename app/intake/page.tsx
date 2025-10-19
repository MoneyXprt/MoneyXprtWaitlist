'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { callStrategist } from '@/lib/callStrategist';
import type { MoneyXprtIntake } from '@/types/moneyxprt';
import { toStrategistPayload } from '@/types/moneyxprt';
const AnswerViewer = dynamic(() => import('@/components/AnswerViewer'), { ssr: false });
type ProfileRow = { id: string; user_id: string | null; created_at: string };

export default function Intake() {
  const [form, setForm] = useState<MoneyXprtIntake>({
    filingStatus: 'mfj', state: 'CA', dependents: 1,
  } as MoneyXprtIntake);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [answer, setAnswer] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [title, setTitle] = useState('');

  // load profiles + last selection
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/profiles/recent').then(res => res.json());
        if (r.ok) setProfiles(r.profiles || []);
      } catch {}
      const saved = localStorage.getItem('mx_profile_id');
      if (saved) setProfileId(saved);
    })();
  }, []);

  function up<K extends keyof MoneyXprtIntake>(k: K, v: MoneyXprtIntake[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function run() {
    setLoading(true); setErr(''); setAnswer('');
    try {
      const payload = toStrategistPayload(form);
      const r = await callStrategist({
        userMessage: 'Use this structured intake to estimate my current-year taxes and recommend strategies.',
        payload,
        profileId,
      });
      // Note: current callStrategist returns { ok, answer } without throwing on error
      setAnswer((r as any).answer || '');
    } catch (e: any) { setErr(e.message || 'Error'); }
    finally { setLoading(false); }
  }

  async function saveStrategy(titleArg?: string) {
    try {
      const t = (titleArg ?? title)?.trim();
      if (!t) {
        alert('Please enter a strategy title.');
        return;
      }
      const pid = typeof window !== 'undefined' ? localStorage.getItem('mx_profile_id') : null;
      const scenarioId = null; // not available on intake page
      const res = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: pid, scenarioId, title: t, notes: '' }),
      });
      const json = await res.json().catch(() => ({} as any));
      if (!res.ok || !json?.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      alert('Saved 👍');
    } catch (e: any) {
      alert(`Save failed: ${e?.message || 'Error'}`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">MoneyXprt — Quick Intake</h1>

      {/* Profile selector */}
      <div className="border rounded p-3 space-y-2">
        <label className="block">
          <span className="text-sm">Attach to Profile</span>
          <div className="flex gap-2">
            <select
              className="w-full border rounded p-2"
              value={profileId || ''}
              onChange={(e) => {
                const val = e.target.value || null;
                setProfileId(val);
                if (val) localStorage.setItem('mx_profile_id', val);
                else localStorage.removeItem('mx_profile_id');
              }}
            >
              <option value="">(none)</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.user_id || 'profile'} — {new Date(p.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
            {profileId && (
              <button
                className="px-3 py-2 border rounded"
                onClick={() => { setProfileId(null); localStorage.removeItem('mx_profile_id'); }}
              >
                Clear
              </button>
            )}
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basics */}
        <label className="block">
          <span className="text-sm">Filing status</span>
          <select className="w-full border rounded p-2"
            value={form.filingStatus || 'mfj'}
            onChange={(e)=>up('filingStatus', e.target.value as any)}>
            <option value="single">Single</option>
            <option value="mfj">Married Filing Jointly</option>
            <option value="mfs">Married Filing Separately</option>
            <option value="hoh">Head of Household</option>
            <option value="qw">Qualifying Widow(er)</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm">State</span>
          <input className="w-full border rounded p-2" placeholder="CA"
            value={form.state || ''} onChange={(e)=>up('state', e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm">Dependents</span>
          <input type="number" min={0} className="w-full border rounded p-2"
            value={form.dependents ?? 0} onChange={(e)=>up('dependents', Number(e.target.value||0))}/>
        </label>

        {/* Income */}
        <label className="block">
          <span className="text-sm">W-2 wages (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.w2Income ?? 0} onChange={(e)=>up('w2Income', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">Fed withholding (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.w2FedWithheld ?? 0} onChange={(e)=>up('w2FedWithheld', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">State withholding (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.w2StateWithheld ?? 0} onChange={(e)=>up('w2StateWithheld', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">Business income (SE/K-1 active)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.seIncome ?? 0} onChange={(e)=>up('seIncome', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">Real estate net (passive)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.realEstateIncome ?? 0} onChange={(e)=>up('realEstateIncome', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">Capital gains</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.capitalGains ?? 0} onChange={(e)=>up('capitalGains', Number(e.target.value||0))}/>
        </label>

        {/* Deductions */}
        <label className="block">
          <span className="text-sm">Mortgage interest (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.mortgageInterest ?? 0} onChange={(e)=>up('mortgageInterest', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">SALT paid (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.salt ?? 0} onChange={(e)=>up('salt', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">Charitable giving (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.charity ?? 0} onChange={(e)=>up('charity', Number(e.target.value||0))}/>
        </label>

        {/* Accounts */}
        <label className="block">
          <span className="text-sm">401(k) pre-tax deferral (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.preTax401k ?? 0} onChange={(e)=>up('preTax401k', Number(e.target.value||0))}/>
        </label>
        <label className="block">
          <span className="text-sm">IRA contribution (YTD)</span>
          <input type="number" className="w-full border rounded p-2"
            value={form.iraContribution ?? 0} onChange={(e)=>up('iraContribution', Number(e.target.value||0))}/>
        </label>
      </div>

      <button onClick={run} disabled={loading}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
        {loading ? 'Calculating…' : 'Get My Estimate & Strategies'}
      </button>

      {err && <div className="text-red-600">{err}</div>}

      {answer && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              className="border rounded p-2"
              placeholder="Strategy title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              onClick={() => saveStrategy(title)}
              className="px-3 py-2 border rounded"
            >
              Save Strategy
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded border"
              title="Print or Save as PDF"
            >
              Print / Save PDF
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(answer)}
              className="px-3 py-2 rounded border"
            >
              Copy Text
            </button>
          </div>

          {/* Render the tidy sections */}
          <AnswerViewer answer={answer} />
        </div>
      )}
    </div>
  );
}
