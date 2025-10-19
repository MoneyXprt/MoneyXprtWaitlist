'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import type { MoneyXprtIntake } from '@/types/moneyxprt';
import { toStrategistPayload } from '@/types/moneyxprt';
import { callStrategist } from '@/lib/callStrategist';

const AnswerViewer = dynamic(() => import('@/components/AnswerViewer'), { ssr: false });

type ProfileRow = { id: string; user_id: string | null; created_at: string };

export default function Intake() {
  const [form, setForm] = useState<MoneyXprtIntake>({ filingStatus: 'mfj', state: 'CA', dependents: 1 });
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

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
        userMessage: 'Use this structured intake to estimate my current-year taxes and recommend strategies with sections: Profile Snapshot, Tax Estimate, Top Strategies, Action Plan, References & Disclaimer.',
        payload,
        profileId
      } as any);
      if ((r as any)?.meta?.fallback) {
        setErr('AI capacity limit hit. Showing a quick fallback plan. Try again in a minute for the full analysis.');
      }
      setAnswer((r as any).answer || '(empty)');
    } catch (e:any) { setErr(e.message || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card><CardContent className="p-5 space-y-4">
          <h2 className="text-xl font-semibold mb-1">Profile</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Filing Status</Label>
              <Select value={form.filingStatus || 'mfj'} onValueChange={(v)=>up('filingStatus', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="mfj">Married Filing Jointly</SelectItem>
                  <SelectItem value="mfs">Married Filing Separately</SelectItem>
                  <SelectItem value="hoh">Head of Household</SelectItem>
                  <SelectItem value="qw">Qualifying Widow(er)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>State</Label>
              <Input value={form.state || ''} onChange={(e)=>up('state', e.target.value)} placeholder="CA" />
            </div>
            <div>
              <Label>Dependents</Label>
              <Input type="number" value={form.dependents ?? 0} onChange={(e)=>up('dependents', Number(e.target.value||0))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Attach to Profile</Label>
              <Select
                value={profileId ?? 'none'}
                onValueChange={(v) => {
                  const next = v === 'none' ? null : v
                  setProfileId(next)
                  if (next) localStorage.setItem('mx_profile_id', next)
                  else localStorage.removeItem('mx_profile_id')
                }}
              >
                <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">(none)</SelectItem>
                  {profiles.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.user_id || 'profile'} — {new Date(p.created_at).toLocaleDateString()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-5 space-y-4">
          <h2 className="text-xl font-semibold mb-1">Income</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div><Label>W-2 wages (YTD)</Label><Input type="number" value={form.w2Income ?? 0} onChange={(e)=>up('w2Income', Number(e.target.value||0))} /></div>
            <div><Label>Fed withholding (YTD)</Label><Input type="number" value={form.w2FedWithheld ?? 0} onChange={(e)=>up('w2FedWithheld', Number(e.target.value||0))} /></div>
            <div><Label>State withholding (YTD)</Label><Input type="number" value={form.w2StateWithheld ?? 0} onChange={(e)=>up('w2StateWithheld', Number(e.target.value||0))} /></div>
            <div><Label>Business income (SE/K-1 active)</Label><Input type="number" value={form.seIncome ?? 0} onChange={(e)=>up('seIncome', Number(e.target.value||0))} /></div>
            <div><Label>Real estate net (passive)</Label><Input type="number" value={form.realEstateIncome ?? 0} onChange={(e)=>up('realEstateIncome', Number(e.target.value||0))} /></div>
            <div><Label>Capital gains</Label><Input type="number" value={form.capitalGains ?? 0} onChange={(e)=>up('capitalGains', Number(e.target.value||0))} /></div>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-5 space-y-4">
          <h2 className="text-xl font-semibold mb-1">Deductions & Retirement</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div><Label>Mortgage interest (YTD)</Label><Input type="number" value={form.mortgageInterest ?? 0} onChange={(e)=>up('mortgageInterest', Number(e.target.value||0))} /></div>
            <div><Label>SALT paid (YTD)</Label><Input type="number" value={form.salt ?? 0} onChange={(e)=>up('salt', Number(e.target.value||0))} /></div>
            <div><Label>Charitable giving (YTD)</Label><Input type="number" value={form.charity ?? 0} onChange={(e)=>up('charity', Number(e.target.value||0))} /></div>
            <div><Label>401(k) pre-tax (YTD)</Label><Input type="number" value={form.preTax401k ?? 0} onChange={(e)=>up('preTax401k', Number(e.target.value||0))} /></div>
            <div><Label>IRA contribution (YTD)</Label><Input type="number" value={form.iraContribution ?? 0} onChange={(e)=>up('iraContribution', Number(e.target.value||0))} /></div>
          </div>
        </CardContent></Card>
      </div>

      {/* Right: Actions + Result */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="sticky top-20"><CardContent className="p-5 space-y-3">
          <h2 className="text-lg font-semibold">Run Analysis</h2>
          <p className="text-sm text-slate-600">We’ll estimate your current year (assume 2025 unless specified) and rank 3–5 compliant strategies.</p>
          <Button onClick={run} disabled={loading} className="w-full">{loading ? 'Calculating…' : 'Get My Estimate & Strategies'}</Button>
          {err && <div className="text-red-600 text-sm">Error: {err}</div>}
          <div className="text-[11px] text-slate-500">
            Educational use only. Coordinate execution with a CPA, tax attorney, or fiduciary.
          </div>
        </CardContent></Card>

        {answer && (
          <Card><CardContent className="p-5 space-y-3">
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>window.print()}>Print / Save PDF</Button>
              <Button variant="outline" onClick={()=>navigator.clipboard.writeText(answer)}>Copy Text</Button>
            </div>
            <AnswerViewer answer={answer} />
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}
