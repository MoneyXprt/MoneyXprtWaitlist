'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Info, Play, Upload } from 'lucide-react';
import Hint from '@/components/Hint';
import ResultSkeleton from '@/components/ResultSkeleton';
import { toStrategistPayload } from '@/types/moneyxprt';
import { callStrategist } from '@/lib/callStrategist';

type Intake = {
  filingStatus?: 'single'|'mfj'|'mfs'|'hoh'|'qw';
  state?: string;
  dependents?: number;
  w2Income?: number; w2FedWithheld?: number; w2StateWithheld?: number;
  seIncome?: number; realEstateIncome?: number; capitalGains?: number;
  mortgageInterest?: number; salt?: number; charity?: number;
  preTax401k?: number; iraContribution?: number;
};

export default function AgentPage() {
  const [form, setForm] = useState<Intake>({ filingStatus: 'mfj', state: 'CA', dependents: 1 });
  const [answer, setAnswer] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  function up<K extends keyof Intake>(k: K, v: Intake[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function run() {
    setLoading(true); setErr(''); setAnswer('');
    try {
      const payload = toStrategistPayload(form as any);
      const r = await callStrategist({
        userMessage: 'Use this structured intake to estimate my current-year taxes and recommend 3–5 ranked strategies with action steps and references.',
        payload,
        profileId: null,
      } as any);
      if ((r as any)?.meta?.fallback) setErr('AI capacity limit hit — showing a quick fallback. Try again in a minute for full analysis.');
      setAnswer((r as any).answer || '(empty)');
    } catch (e: any) {
      setErr(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero intro */}
      <section className="text-center animate-fadeUp">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--mx-primary)]">Ask the AI Strategist</h1>
        <p className="mt-2 text-zinc-600 max-w-2xl mx-auto">
          Enter your basics below. We’ll assume the current tax year and return an estimate and a ranked, compliance-first strategy plan.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Form */}
        <section className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <div className="card p-6 animate-fadeUp">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-[var(--mx-accent)]" />
              <h2 className="text-lg font-semibold">Profile</h2>
            </div>
            <Hint>Filing status drives thresholds, credits, and deduction phaseouts.</Hint>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Filing Status</label>
                <select
                  className="mt-1 w-full rounded-xl border border-[var(--mx-border)] bg-white px-3 py-2 text-sm"
                  value={form.filingStatus}
                  onChange={(e)=>up('filingStatus', e.target.value as any)}
                >
                  <option value="single">Single</option>
                  <option value="mfj">Married Filing Jointly</option>
                  <option value="mfs">Married Filing Separately</option>
                  <option value="hoh">Head of Household</option>
                  <option value="qw">Qualifying Widow(er)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <input
                  className="mt-1 w-full rounded-xl border border-[var(--mx-border)] bg-white px-3 py-2 text-sm"
                  placeholder="CA"
                  value={form.state || ''}
                  onChange={(e)=>up('state', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dependents</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-[var(--mx-border)] bg-white px-3 py-2 text-sm"
                  value={form.dependents ?? 0}
                  onChange={(e)=>up('dependents', Number(e.target.value || 0))}
                />
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="card p-6 animate-fadeUp">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-[var(--mx-accent)]" />
              <h2 className="text-lg font-semibold">Income</h2>
            </div>
            <Hint>YTD numbers are fine. If not sure, rough estimates are okay — we’ll be conservative.</Hint>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="W-2 wages (YTD)">
                <Num value={form.w2Income} onChange={(v)=>up('w2Income', v)} />
              </Field>
              <Field label="Fed withholding (YTD)">
                <Num value={form.w2FedWithheld} onChange={(v)=>up('w2FedWithheld', v)} />
              </Field>
              <Field label="State withholding (YTD)">
                <Num value={form.w2StateWithheld} onChange={(v)=>up('w2StateWithheld', v)} />
              </Field>
              <Field label="Business income (active)">
                <Num value={form.seIncome} onChange={(v)=>up('seIncome', v)} />
              </Field>
              <Field label="Real estate net (passive)">
                <Num value={form.realEstateIncome} onChange={(v)=>up('realEstateIncome', v)} />
              </Field>
              <Field label="Capital gains">
                <Num value={form.capitalGains} onChange={(v)=>up('capitalGains', v)} />
              </Field>
            </div>
          </div>

          {/* Deductions & Retirement */}
          <div className="card p-6 animate-fadeUp">
            <div className="flex items-center gap-2 mb-1">
              <Info className="h-4 w-4 text-[var(--mx-accent)]" />
              <h2 className="text-lg font-semibold">Deductions & Retirement</h2>
            </div>
            <Hint>We’ll compare itemized vs. standard and flag SALT/charitable timing opportunities.</Hint>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Mortgage interest (YTD)"><Num value={form.mortgageInterest} onChange={(v)=>up('mortgageInterest', v)} /></Field>
              <Field label="SALT paid (YTD)"><Num value={form.salt} onChange={(v)=>up('salt', v)} /></Field>
              <Field label="Charitable giving (YTD)"><Num value={form.charity} onChange={(v)=>up('charity', v)} /></Field>
              <Field label="401(k) pre-tax (YTD)"><Num value={form.preTax401k} onChange={(v)=>up('preTax401k', v)} /></Field>
              <Field label="IRA contribution (YTD)"><Num value={form.iraContribution} onChange={(v)=>up('iraContribution', v)} /></Field>
            </div>
          </div>

          {/* Actions */}
          <div className="card p-6 flex items-center justify-between animate-fadeUp">
            <div>
              <div className="font-medium">Run Analysis</div>
              <Hint>Assumes current tax year unless specified in your message.</Hint>
            </div>
            <button
              type="button"
              onClick={run}
              disabled={loading}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {loading ? 'Calculating…' : 'Get My Estimate & Strategies'}
            </button>
          </div>
        </section>

        {/* RIGHT: Results */}
        <aside className="lg:col-span-1">
          <div className="card p-6 sticky top-20 animate-fadeUp">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--mx-accent)]" />
              <h2 className="text-lg font-semibold">Results</h2>
            </div>

            {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

            {!answer && !err && !loading && (
              <p className="mt-3 text-sm text-zinc-600">
                Click <span className="font-medium">Get My Estimate & Strategies</span> to see your plan here.
              </p>
            )}

            {loading && (
              <div className="mt-4">
                <ResultSkeleton />
              </div>
            )}

            {answer && (
              <>
                <pre className="mt-4 text-sm whitespace-pre-wrap">{answer}</pre>
                <div className="mt-4 flex gap-2">
                  <button className="rounded-xl border px-3 py-2 text-sm" onClick={()=>navigator.clipboard.writeText(answer)}>Copy</button>
                  <button className="rounded-xl border px-3 py-2 text-sm" onClick={()=>window.print()}>Print / Save PDF</button>
                </div>
              </>
            )}

            <div className="mt-6 text-xs text-zinc-500">
              Educational only — coordinate execution with a CPA, tax attorney, or fiduciary.
            </div>
          </div>

          {/* Optional: import/export profile CSV */}
          <div className="card p-6 mt-6 animate-fadeUp">
            <div className="flex items-center gap-2 mb-1">
              <Upload className="h-4 w-4 text-[var(--mx-accent)]" />
              <div className="font-semibold">Bulk import (optional)</div>
            </div>
            <Hint>Bring in YTD wages/withholding from payroll CSVs to prefill fields faster.</Hint>
            <div className="mt-3">
              <button className="rounded-xl border px-3 py-2 text-sm">Upload CSV</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* small presentational subcomponents */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function Num({ value, onChange }: { value?: number; onChange: (v:number)=>void }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className="w-full rounded-xl border border-[var(--mx-border)] bg-white px-3 py-2 text-sm"
      value={value ?? 0}
      onChange={(e)=>onChange(Number(e.target.value || 0))}
    />
  );
}
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Play, Info } from 'lucide-react';
import Hint from '@/components/Hint';
import ResultSkeleton from '@/components/ResultSkeleton';

// ---------------- Schema ----------------
const schema = z.object({
  filingStatus: z.enum(['single', 'mfj', 'mfs', 'hoh', 'qw'], { required_error: 'Required' }),
  state: z.string().min(2, 'Enter state code'),
  dependents: z.number().min(0).max(10, 'Too many dependents?'),
  w2Income: z.number().min(0),
  seIncome: z.number().min(0),
  realEstateIncome: z.number().min(0),
  capitalGains: z.number().min(0),
  mortgageInterest: z.number().min(0),
  salt: z.number().min(0),
  charity: z.number().min(0),
  preTax401k: z.number().min(0),
  iraContribution: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

export default function AgentPage() {
  const [answer, setAnswer] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      filingStatus: 'mfj',
      state: 'CA',
      dependents: 1,
      w2Income: 0, seIncome: 0, realEstateIncome: 0, capitalGains: 0,
      mortgageInterest: 0, salt: 0, charity: 0, preTax401k: 0, iraContribution: 0,
    },
  });

  async function onSubmit(form: FormData) {
    setLoading(true); setErr(''); setAnswer('');
    try {
      const payload = { meta: { taxYear: new Date().getFullYear() }, intake: form };
      const res = await fetch('/api/strategist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage:
            'Use this structured intake to estimate my taxes and recommend 3–5 strategies with IRS references and action steps.',
          payload,
          profileId: null
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setAnswer(json.answer || '(no answer)');
    } catch (e: any) {
      setErr(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  // Currency formatter
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const numField = (field: keyof FormData) => ({
    value: watch(field) || 0,
    onChange: (e: any) => setValue(field, Number(e.target.value.replace(/[^\d.]/g, ''))),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="text-center animate-fadeUp">
        <h1 className="text-4xl font-semibold text-[var(--mx-primary)]">AI Tax Strategist</h1>
        <p className="mt-1 text-zinc-600">Enter your details — we’ll calculate and suggest your top strategies.</p>
      </section>

      {/* Profile */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-[var(--mx-accent)]" />
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>
        <Hint>Used for standard deduction and credit thresholds.</Hint>

        <div className="grid sm:grid-cols-3 gap-4 mt-3">
          <div>
            <label className="text-sm font-medium">Filing Status</label>
            <select {...register('filingStatus')} className="input">
              <option value="single">Single</option>
              <option value="mfj">Married Joint</option>
              <option value="mfs">Married Separate</option>
              <option value="hoh">Head of Household</option>
              <option value="qw">Qualifying Widow(er)</option>
            </select>
            {errors.filingStatus && <p className="text-xs text-red-600">{errors.filingStatus.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">State</label>
            <input {...register('state')} className="input" placeholder="CA" />
            {errors.state && <p className="text-xs text-red-600">{errors.state.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Dependents</label>
            <input type="number" {...register('dependents', { valueAsNumber: true })} className="input" />
            {errors.dependents && <p className="text-xs text-red-600">{errors.dependents.message}</p>}
          </div>
        </div>
      </div>

      {/* Income */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2">Income</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            ['w2Income', 'W-2 wages (YTD)'],
            ['seIncome', 'Business income'],
            ['realEstateIncome', 'Real estate net'],
            ['capitalGains', 'Capital gains'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-medium">{label}</label>
              <input type="number" className="input" {...numField(key as keyof FormData)} />
              <p className="text-xs text-zinc-500">{fmt.format(watch(key as keyof FormData) || 0)}</p>
              {errors[key as keyof FormData] && (
                <p className="text-xs text-red-600">{(errors as any)[key]?.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Run */}
      <div className="card p-6 flex justify-between items-center">
        <div>
          <div className="font-medium">Run Analysis</div>
          <Hint>We’ll model the current year unless you specify otherwise.</Hint>
        </div>
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <Play className="h-4 w-4" />
          {loading ? 'Analyzing…' : 'Get Strategies'}
        </button>
      </div>

      {/* Results */}
      <div className="card p-6">
        {err && <p className="text-sm text-red-600">{err}</p>}
        {loading && <ResultSkeleton />}
        {answer && <pre className="whitespace-pre-wrap text-sm mt-2">{answer}</pre>}
      </div>
    </form>
  );
}
