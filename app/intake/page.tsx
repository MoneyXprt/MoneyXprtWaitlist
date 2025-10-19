'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Play, Info } from 'lucide-react';
import Hint from '@/components/Hint';
import ResultSkeleton from '@/components/ResultSkeleton';
import NumericInput from '@/components/forms/fields/NumericInput';
// Vercel Analytics and Speed Insights
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// ---------------- Schema ----------------
const schema = z.object({
  filingStatus: z.enum(['single', 'mfj', 'mfs', 'hoh', 'qw'], { required_error: 'Required' }),
  state: z.string().min(2, 'Enter state code'),
  dependents: z.coerce.number().int().min(0).max(10, 'Too many dependents?'),
  w2Income: z.coerce.number().nonnegative().default(0),
  seIncome: z.coerce.number().nonnegative().default(0),
  realEstateIncome: z.coerce.number().nonnegative().default(0),
  capitalGains: z.coerce.number().nonnegative().default(0),
  mortgageInterest: z.coerce.number().nonnegative().default(0),
  salt: z.coerce.number().nonnegative().default(0),
  charity: z.coerce.number().nonnegative().default(0),
  preTax401k: z.coerce.number().nonnegative().default(0),
  iraContribution: z.coerce.number().nonnegative().default(0),
});

type FormData = z.infer<typeof schema>;

export default function AgentPage() {
  const [answer, setAnswer] = React.useState('');
  const [err, setErr] = React.useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<FormData>({
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
    setErr(''); setAnswer('');
    try {
      // Normalize currency fields on submit (round to whole dollars)
      const rounded: FormData = {
        ...form,
        w2Income: Math.round(form.w2Income || 0),
        seIncome: Math.round(form.seIncome || 0),
        realEstateIncome: Math.round(form.realEstateIncome || 0),
        capitalGains: Math.round(form.capitalGains || 0),
        mortgageInterest: Math.round(form.mortgageInterest || 0),
        salt: Math.round(form.salt || 0),
        charity: Math.round(form.charity || 0),
        preTax401k: Math.round(form.preTax401k || 0),
        iraContribution: Math.round(form.iraContribution || 0),
      };

      const payload = { meta: { taxYear: new Date().getFullYear() }, intake: rounded };
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
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureException(e);
      } catch {}
    }
  }

  // Currency formatter
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

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
            <NumericInput register={register as any} name="dependents" className="input" />
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
              <NumericInput
                register={register as any}
                name={key as any}
                className="input"
                onBlur={(e) => {
                  const raw = e.currentTarget.value;
                  const num = raw === '' ? 0 : Number(raw);
                  const rounded = isNaN(num) ? 0 : Math.round(num);
                  setValue(key as any, rounded, { shouldValidate: true, shouldDirty: true });
                  e.currentTarget.value = String(rounded);
                }}
              />
              <p className="text-xs text-zinc-500">{fmt.format((watch(key as keyof FormData) ?? 0) as number)}</p>
              {(errors as any)[key] && (
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
        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
          <Play className="h-4 w-4" />
          {isSubmitting ? 'Analyzing…' : 'Get Strategies'}
        </button>
      </div>

      {/* Results */}
      <div className="card p-6">
        {err && <p className="text-sm text-red-600">{err}</p>}
        {isSubmitting && <ResultSkeleton />}
        {answer && <pre className="whitespace-pre-wrap text-sm mt-2">{answer}</pre>}
      </div>
      {/* Observability for this page */}
      {typeof window !== 'undefined' && (
        <>
          {/* Render only on this route as requested */}
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </form>
  );
}
