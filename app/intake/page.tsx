'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Play, Info } from 'lucide-react';
import Hint from '@/components/Hint';
import ResultSkeleton from '@/components/ResultSkeleton';
import Results from '@/components/Results';
import type { ResultsV1 } from '@/types/results';
import Toast from '@/components/Toast';
import NumericInput from '@/components/forms/fields/NumericInput';
// Vercel Analytics and Speed Insights
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useSession } from '@/lib/useSession';

// ---------------- Schema ----------------
const schema = z.object({
  // A. Profile
  taxYear: z.coerce.number().int().min(2000).max(2100).default(new Date().getFullYear()),
  filingStatus: z.enum(['single', 'mfj', 'mfs', 'hoh', 'qw'], { required_error: 'Required' }),
  state: z.string().min(2, 'Enter state code'),
  residentStates: z.string().optional(),
  primaryAge: z.coerce.number().int().min(0).max(120).default(0),
  spouseAge: z.coerce.number().int().min(0).max(120).default(0),
  dependents: z.coerce.number().int().min(0).max(10, 'Too many dependents?'),

  // B. Wages & Withholding
  w2Wages: z.coerce.number().nonnegative().default(0),
  w2Withholding: z.coerce.number().nonnegative().default(0),
  stateWithholding: z.coerce.number().nonnegative().default(0),
  otherWithholding: z.coerce.number().nonnegative().default(0),
  estTaxPaid: z.coerce.number().nonnegative().default(0),

  // C. Other Income (core)
  interestIncome: z.coerce.number().nonnegative().default(0),
  dividendsOrdinary: z.coerce.number().nonnegative().default(0),
  dividendsQualified: z.coerce.number().nonnegative().default(0),
  capGainsShort: z.coerce.number().nonnegative().default(0),
  capGainsLong: z.coerce.number().nonnegative().default(0),
  capLossCarryforward: z.coerce.number().nonnegative().default(0),
  rsuTaxableComp: z.coerce.number().nonnegative().default(0),
  otherIncome: z.coerce.number().nonnegative().default(0),

  // D. Self-Employment
  hasSE: z.coerce.boolean().default(false),
  seNetProfit: z.coerce.number().nonnegative().default(0),
  seHealthInsurance: z.coerce.number().nonnegative().default(0),
  retirementSolo401kEmployee: z.coerce.number().nonnegative().default(0),
  retirementSolo401kEmployer: z.coerce.number().nonnegative().default(0),
  isQBIEligible: z.coerce.boolean().default(true),

  // E. Pass-Through K-1s (optional list)
  hasK1s: z.coerce.boolean().default(false),
  k1s: z
    .array(
      z.object({
        type: z.enum(['SCorp', 'Partnership']).default('SCorp'),
        ordinaryBusinessIncome: z.coerce.number().default(0),
        w2WagesFromEntity: z.coerce.number().default(0),
        state: z.string().max(2).optional(),
      })
    )
    .default([]),

  // F. Rentals (minimal)
  hasRentals: z.coerce.boolean().default(false),
  rentalIncomeTotal: z.coerce.number().nonnegative().default(0),
  rentalExpensesTotal: z.coerce.number().nonnegative().default(0),

  // G. Deductions
  charityCash: z.coerce.number().nonnegative().default(0),
  charityNonCash: z.coerce.number().nonnegative().default(0),
  saltTax: z.coerce.number().nonnegative().default(0),
  mortgageInterestPrimary: z.coerce.number().nonnegative().default(0),
  medicalExpenses: z.coerce.number().nonnegative().default(0),

  // H. Above-the-line & retirement
  hsaContribution: z.coerce.number().nonnegative().default(0),
  traditionalIRAContribution: z.coerce.number().nonnegative().default(0),
  rothIRAContribution: z.coerce.number().nonnegative().default(0),
  fsaContribution: z.coerce.number().nonnegative().default(0),
  studentLoanInterest: z.coerce.number().nonnegative().default(0),

  // Legacy fields required by current strategist API schema (derived on submit)
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
  const session = useSession();
  const [answer, setAnswer] = React.useState('');
  const [err, setErr] = React.useState('');
  const [results, setResults] = React.useState<ResultsV1 | null>(null);
  const [shareUrl, setShareUrl] = React.useState<string | null>(null);
  const [showPaywall, setShowPaywall] = React.useState<{ open: boolean; reason: 'daily' | 'monthly' | null }>({ open: false, reason: null });
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      taxYear: new Date().getFullYear(),
      filingStatus: 'mfj',
      state: 'CA',
      residentStates: '',
      primaryAge: 0, spouseAge: 0,
      dependents: 1,
      // wages & withholding
      w2Wages: 0, w2Withholding: 0, stateWithholding: 0, otherWithholding: 0, estTaxPaid: 0,
      // other income core
      interestIncome: 0, dividendsOrdinary: 0, dividendsQualified: 0,
      capGainsShort: 0, capGainsLong: 0, capLossCarryforward: 0,
      rsuTaxableComp: 0, otherIncome: 0,
      // SE
      hasSE: false, seNetProfit: 0, seHealthInsurance: 0,
      retirementSolo401kEmployee: 0, retirementSolo401kEmployer: 0, isQBIEligible: true,
      // K-1s
      hasK1s: false,
      k1s: [],
      // Rentals minimal
      hasRentals: false, rentalIncomeTotal: 0, rentalExpensesTotal: 0,
      // Deductions
      charityCash: 0, charityNonCash: 0, saltTax: 0, mortgageInterestPrimary: 0, medicalExpenses: 0,
      // H
      hsaContribution: 0, traditionalIRAContribution: 0, rothIRAContribution: 0, fsaContribution: 0, studentLoanInterest: 0,
      // legacy
      w2Income: 0, seIncome: 0, realEstateIncome: 0, capitalGains: 0,
      mortgageInterest: 0, salt: 0, charity: 0, preTax401k: 0, iraContribution: 0,
    },
  });
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue, control } = form

  const { fields: k1Fields, append: appendK1, remove: removeK1 } = useFieldArray({
    name: 'k1s',
    control,
  })

  async function onSubmit(form: FormData) {
    setErr(''); setAnswer(''); setResults(null); setShareUrl(null);
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

      // Derive legacy fields expected by strategist API from the richer intake
      const derived = {
        w2Income: Math.round((form as any).w2Wages || 0),
        seIncome: Math.round((form as any).seNetProfit || 0),
        realEstateIncome: Math.round(((form as any).hasRentals ? ((form as any).rentalIncomeTotal || 0) - ((form as any).rentalExpensesTotal || 0) : 0) || 0),
        capitalGains: Math.round(((form as any).capGainsShort || 0) + ((form as any).capGainsLong || 0)),
        mortgageInterest: Math.round((form as any).mortgageInterestPrimary || 0),
        salt: Math.round((form as any).saltTax || 0),
        charity: Math.round(((form as any).charityCash || 0) + ((form as any).charityNonCash || 0)),
        preTax401k: Math.round((form as any).retirementSolo401kEmployee || 0),
        iraContribution: Math.round((form as any).traditionalIRAContribution || 0),
      }

      const payload = {
        meta: { taxYear: Math.round((form as any).taxYear || new Date().getFullYear()) },
        intake: { ...rounded, ...derived },
      };
      const res = await fetch('/api/strategist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user?.email ?? null,
          userMessage:
            'Use this structured intake to estimate my taxes and recommend 3–5 strategies with IRS references and action steps.',
          payload,
          profileId: null,
        }),
      });
      if (res.status === 402) {
        const data = await res.json().catch(() => ({}));
        setShowPaywall({ open: true, reason: (data?.reason === 'daily' || data?.reason === 'monthly') ? data.reason : 'daily' });
        return;
      }
      if (res.status === 401) {
        setErr('Please log in to continue.');
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setAnswer(json.answer || '(no answer)');
      if (json.results) {
        setResults(json.results as ResultsV1);
        // Save public result and capture share URL
        try {
          const saveRes = await fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results: json.results }),
          });
          const saved = await saveRes.json().catch(() => ({}));
          if (saveRes.ok && saved?.url) setShareUrl(saved.url as string);
        } catch {}
      }
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

  async function goCheckout(kind: 'pro' | 'topup') {
    try {
      const priceId = kind === 'pro'
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY as string | undefined)
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_50 as string | undefined);

      if (!priceId) {
        alert('Pricing is not configured.');
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          success_url: `${window.location.origin}/billing/success`,
          cancel_url: `${window.location.origin}/intake`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.url) window.location.href = data.url as string;
      else if (!res.ok) throw new Error(data?.error || 'Failed to start checkout');
    } catch (e: any) {
      alert(e?.message || 'Checkout failed');
    }
  }

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
            <label className="text-sm font-medium">Tax Year</label>
            <NumericInput register={register as any} name="taxYear" className="input" />
          </div>
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
            <label className="text-sm font-medium">Resident States (comma-separated)</label>
            <input {...register('residentStates')} className="input" placeholder="CA, NY" />
          </div>
          <div>
            <label className="text-sm font-medium">Primary Age</label>
            <NumericInput register={register as any} name="primaryAge" className="input" />
          </div>
          <div>
            <label className="text-sm font-medium">Spouse Age</label>
            <NumericInput register={register as any} name="spouseAge" className="input" />
          </div>
          <div>
            <label className="text-sm font-medium">Dependents</label>
            <NumericInput register={register as any} name="dependents" className="input" />
            {errors.dependents && <p className="text-xs text-red-600">{errors.dependents.message}</p>}
          </div>
        </div>
      </div>

      {/* Wages & Withholding */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2">Wages & Withholding</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            ['w2Wages', 'W-2 wages (YTD)'],
            ['w2Withholding', 'Federal withholding (YTD)'],
            ['stateWithholding', 'State withholding (YTD)'],
            ['otherWithholding', 'Other withholding'],
            ['estTaxPaid', 'Estimated taxes paid (sum)'],
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
            </div>
          ))}
        </div>
      </div>

      {/* Other Income */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2">Other Income</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            ['interestIncome', 'Interest income'],
            ['dividendsOrdinary', 'Dividends (ordinary)'],
            ['dividendsQualified', 'Dividends (qualified)'],
            ['capGainsShort', 'Capital gains (short-term)'],
            ['capGainsLong', 'Capital gains (long-term)'],
            ['capLossCarryforward', 'Capital loss carryforward'],
            ['rsuTaxableComp', 'RSU taxable comp'],
            ['otherIncome', 'Other income'],
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
            </div>
          ))}
        </div>
      </div>

      {/* Self-Employment */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Self-Employment</h2>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" {...register('hasSE')} /> I have 1099/self-employment
          </label>
        </div>
        {watch('hasSE') && (
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              ['seNetProfit', 'SE net profit'],
              ['seHealthInsurance', 'SE health insurance'],
              ['retirementSolo401kEmployee', 'Solo 401(k) employee'],
              ['retirementSolo401kEmployer', 'Solo 401(k) employer/SEP'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm font-medium">{label}</label>
                <NumericInput register={register as any} name={key as any} className="input" />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium">QBI eligible?</label>
              <input type="checkbox" className="ml-2" {...register('isQBIEligible')} />
            </div>
          </div>
        )}
      </div>

      {/* K-1s (optional, simple list) */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Pass-Through K‑1s</h2>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" {...register('hasK1s')} /> I have K‑1s
          </label>
        </div>
        {watch('hasK1s') && (
          <div className="space-y-3">
            {k1Fields.length === 0 && (
              <div className="text-sm text-zinc-600">No entities yet.</div>
            )}
            {k1Fields.map((f, idx) => (
              <div key={f.id} className="grid sm:grid-cols-5 gap-3 items-end border rounded-xl p-3">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select className="input" {...register(`k1s.${idx}.type` as any)}>
                    <option value="SCorp">S‑Corp</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Ord. business income</label>
                  <NumericInput register={register as any} name={`k1s.${idx}.ordinaryBusinessIncome`} className="input" />
                </div>
                <div>
                  <label className="text-sm font-medium">W‑2 from entity</label>
                  <NumericInput register={register as any} name={`k1s.${idx}.w2WagesFromEntity`} className="input" />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <input className="input" placeholder="CA" {...register(`k1s.${idx}.state` as any)} />
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-outline" onClick={() => removeK1(idx)}>Remove</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn" onClick={() => appendK1({ type: 'SCorp', ordinaryBusinessIncome: 0, w2WagesFromEntity: 0 })}>
              Add entity
            </button>
          </div>
        )}
      </div>

      {/* Rentals (minimal) */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Rentals & Real Estate</h2>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" {...register('hasRentals')} /> I own rentals/STR
          </label>
        </div>
        {watch('hasRentals') && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Rental income (total)</label>
              <NumericInput register={register as any} name="rentalIncomeTotal" className="input" />
            </div>
            <div>
              <label className="text-sm font-medium">Rental expenses (total)</label>
              <NumericInput register={register as any} name="rentalExpensesTotal" className="input" />
            </div>
            <p className="sm:col-span-3 text-xs text-zinc-500">Short‑Term Rental participation thresholds to consider: 100/500/750 hours depending on the safe harbor used.</p>
          </div>
        )}
      </div>

      {/* Deductions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2">Deductions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            ['charityCash', 'Charity (cash)'],
            ['charityNonCash', 'Charity (non-cash)'],
            ['saltTax', 'SALT (capped at $10k)'],
            ['mortgageInterestPrimary', 'Mortgage interest (primary)'],
            ['medicalExpenses', 'Medical expenses'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-medium">{label}</label>
              <NumericInput register={register as any} name={key as any} className="input" />
              {key === 'saltTax' && (
                <p className="text-xs text-zinc-500">Hint: SALT deduction capped at $10,000 when itemizing.</p>
              )}
            </div>
          ))}
        </div>
        {/* Standard deduction vs. itemizing banner (rough) */}
        {(() => {
          const fs = watch('filingStatus')
          const salt = Math.min(Number(watch('saltTax') || 0), 10000)
          const charity = Number(watch('charityCash') || 0) + Number(watch('charityNonCash') || 0)
          const mort = Number(watch('mortgageInterestPrimary') || 0)
          const itemized = salt + charity + mort
          const age1 = Number(watch('primaryAge') || 0)
          const age2 = Number(watch('spouseAge') || 0)
          const base = fs === 'mfj' || fs === 'qw' ? 29200 : fs === 'hoh' ? 21900 : 14600
          const addl = (fs === 'mfj' ? (age1 >= 65 ? 1550 : 0) + (age2 >= 65 ? 1550 : 0) : (age1 >= 65 ? 1950 : 0))
          const stdDed = base + addl
          if (itemized > 0 && itemized < stdDed) {
            return (
              <div className="mt-3 rounded-lg border bg-amber-50 text-amber-900 p-3 text-sm">
                Standard deduction likely better — still enter charity for strategy ideas.
              </div>
            )
          }
          return null
        })()}
      </div>

      {/* Above-the-line & Retirement */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2">Above-the-line & Retirement</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            ['hsaContribution', 'HSA contribution'],
            ['traditionalIRAContribution', 'Traditional IRA contribution'],
            ['rothIRAContribution', 'Roth IRA contribution'],
            ['fsaContribution', 'FSA contribution'],
            ['studentLoanInterest', 'Student loan interest'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-medium">{label}</label>
              <NumericInput register={register as any} name={key as any} className="input" />
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
      <div className="card p-6 space-y-2 relative">
        {err && <p className="text-sm text-red-600">{err}</p>}
        {isSubmitting && <ResultSkeleton />}
        {results && <Results data={results} />}
        {results && shareUrl && (
          <div className="mt-4 flex items-center gap-2">
            <button
              className="btn"
              onClick={() => navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}${shareUrl}`)}
            >
              Copy Share Link
            </button>
            <a className="btn btn-outline" href={shareUrl} target="_blank" rel="noreferrer">
              Open Shared View
            </a>
          </div>
        )}
        {!results && answer && <pre className="whitespace-pre-wrap text-sm mt-2">{answer}</pre>}
        {/* Error toast */}
        {err && <Toast message={err} onClose={() => setErr('')} />}
      </div>
      {/* Observability for this page */}
      {typeof window !== 'undefined' && (
        <>
          {/* Render only on this route as requested */}
          <Analytics />
          <SpeedInsights />
        </>
      )}
      {/* Paywall Modal */}
      {showPaywall.open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Upgrade Required">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPaywall({ open: false, reason: null })} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-2xl border shadow-soft max-w-md w-[92vw] p-5">
            <h3 className="text-lg font-semibold">
              {showPaywall.reason === 'monthly' ? 'Monthly limit reached' : 'Daily limit reached'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upgrade to Pro or buy a Top-Up to continue.
            </p>
            <div className="flex gap-2 mt-4">
              <button type="button" className="btn" onClick={() => goCheckout('pro')}>Upgrade to Pro</button>
              <button type="button" className="btn btn-outline" onClick={() => goCheckout('topup')}>Top-Up 50</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
