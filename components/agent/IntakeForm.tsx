"use client";
import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { intakeSchema, type IntakeForm as IntakeFormType } from '@/schemas/intake'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import Results from '@/components/Results'
import type { ResultsV1 } from '@/types/results'
import type { StrategistResult as UiStrategistResult, Strategy as UiStrategy } from '@/types/strategist'
import { TAX_BRACKETS } from '@/lib/taxStrategies'
import { useSession } from '@/lib/useSession'
import { computeSaltDeduction } from '@/lib/tax/salt'

export default function AgentIntakeForm() {
  const session = useSession()
  const [results, setResults] = React.useState<ResultsV1 | null>(null)
  const [err, setErr] = React.useState('')
  const [shareUrl, setShareUrl] = React.useState<string | null>(null)
  const [showRentals, setShowRentals] = React.useState(false)
  const [showSE, setShowSE] = React.useState(false)
  const [showPaywall, setShowPaywall] = React.useState<{ open: boolean; reason: 'daily' | 'monthly' | null }>({ open: false, reason: null })
  const [strategist, setStrategist] = React.useState<UiStrategistResult | null>(null)
  const router = useRouter()

  const form = useForm<IntakeFormType>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      profile: { taxYear: new Date().getFullYear(), filingStatus: 'Single', state: 'CA', dependents: 0 },
      wages: { w2Wages: 0, w2Withholding: 0 },
      otherIncome: {},
      deductions: {
        useSalesTaxInsteadOfIncome: false,
        stateIncomeTaxPaid: 0,
        stateSalesTaxPaid: 0,
        realEstatePropertyTax: 0,
        personalPropertyTax: 0,
      },
      aboveLine: {},
    },
    mode: 'onChange',
  })
  const { register, handleSubmit, formState: { isSubmitting }, setValue } = form

  const num = (path: any) => register(path, {
    valueAsNumber: true,
    setValueAs: (v: any) => (v === '' || v == null ? undefined : Number(v)),
  })

  function filingMap(fs: IntakeFormType['profile']['filingStatus']): 'single' | 'married' | 'head_of_household' {
    switch (fs) {
      case 'MFJ':
        return 'married'
      case 'HOH':
        return 'head_of_household'
      case 'MFS':
      case 'QW':
      case 'Single':
      default:
        return 'single'
    }
  }

  function stdDeduction(fs: IntakeFormType['profile']['filingStatus'], ages?: { primary?: number; spouse?: number }) {
    const base = (fs === 'MFJ' || fs === 'QW') ? 29200 : fs === 'HOH' ? 21900 : 14600
    const addl = (fs === 'MFJ')
      ? ((ages?.primary && ages.primary >= 65 ? 1550 : 0) + (ages?.spouse && ages.spouse >= 65 ? 1550 : 0))
      : ((ages?.primary && ages.primary >= 65 ? 1950 : 0))
    return base + (addl || 0)
  }

  function calcBracketTax(taxable: number, status: 'single' | 'married' | 'head_of_household') {
    const brackets = TAX_BRACKETS[status]
    let tax = 0
    let remaining = taxable
    let prevMax = 0
    for (const b of brackets) {
      const lower = Math.max(b.min, prevMax)
      const upper = Math.min(b.max, taxable)
      if (upper > lower) {
        const slice = upper - lower
        tax += slice * b.rate
        prevMax = b.max
      }
      if (taxable <= b.max) break
    }
    return Math.max(0, Math.round(tax))
  }

  async function onSubmit(intake: IntakeFormType) {
    setErr(''); setResults(null); setShareUrl(null)
    setStrategist(null)
    try {
      // Normalize a couple of toggled sections for a minimal payload
      if (showRentals && (!intake.rentals || intake.rentals.length === 0)) {
        intake.rentals = [{ type: 'LTR', income: 0, expenses: 0, considerCostSeg: false } as any]
      }
      if (!showSE) {
        (intake as any).selfEmployment = undefined
      }

      const res = await fetch('/api/strategist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake }),
      })

      if (res.status === 401) {
        alert('Please sign in to run strategies.')
        window.location.href = '/login'
        return
      }

      if (res.status === 402) {
        // Quota exceeded — kick off checkout
        const data = await res.json().catch(() => ({}))
        alert('Quota exceeded. Opening checkout…')
        const chk = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // eslint-disable-next-line no-undef
            priceId: (process as any)?.env?.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? 'PRICE_ID',
            success_url: `${window.location.origin}/history`,
            cancel_url: window.location.href,
          }),
        }).then(r => r.json()).catch(() => ({}))
        if (chk?.url) window.location.href = chk.url as string
        return
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        console.error('Strategist error', res.status, txt)
        alert(`Error ${res.status}: ${txt || 'failed'}`)
        return
      }

      const data = await res.json().catch(() => ({}))

      // Build UI strategist snapshot from intake and response
      // 1) Compute AGI-ish and deductions to estimate tax and effective rate
      const incomes = intake.otherIncome || {}
      const se = intake.selfEmployment || ({} as any)
      const rentals = (intake.rentals || []).map(r => Number(r.income || 0) - Number(r.expenses || 0))
      const totalIncome =
        Number(intake.wages?.w2Wages || 0) +
        Number(incomes.interestIncome || 0) +
        Number(incomes.dividendsOrdinary || 0) +
        Number(incomes.dividendsQualified || 0) +
        Number(incomes.capGainsShort || 0) +
        Number(incomes.capGainsLong || 0) +
        Number(incomes.otherIncome || 0) +
        Number(incomes.rsuTaxableComp || 0) +
        Number(se.seNetProfit || 0) +
        rentals.reduce((a,b)=>a+b, 0)

      const d = intake.deductions || ({} as any)
      const salt = computeSaltDeduction({
        taxYear: Number(intake.profile.taxYear || new Date().getFullYear()),
        filingStatus: intake.profile.filingStatus as any,
        useSalesTaxInsteadOfIncome: Boolean(d.useSalesTaxInsteadOfIncome),
        stateIncomeTaxPaid: Number(d.stateIncomeTaxPaid || 0),
        stateSalesTaxPaid: Number(d.stateSalesTaxPaid || 0),
        realEstatePropertyTax: Number(d.realEstatePropertyTax || 0),
        personalPropertyTax: Number(d.personalPropertyTax || 0),
        pteTaxPaid: 0,
      })
      const itemized =
        Number(salt.allowed || 0) +
        Number(d.charityCash || 0) +
        Number(d.charityNonCash || 0) +
        Number(d.mortgageInterestPrimary || 0) +
        Number(d.medicalExpenses || 0)
      const std = stdDeduction(intake.profile.filingStatus, intake.profile.ages)
      const allowItemize = itemized > std
      const deduction = allowItemize ? itemized : std
      const agi = Math.max(0, totalIncome)
      const taxable = Math.max(0, agi - deduction)
      const statusKey = filingMap(intake.profile.filingStatus)
      const estTax = calcBracketTax(taxable, statusKey)
      const effRate = agi > 0 ? estTax / agi : 0

      // 2) Map strategies from API to the simplified UI Strategy[] shape
      const ranked: UiStrategy[] = Array.isArray(data?.strategies) ? data.strategies.map((s: any) => {
        const savings = (s?.savings && typeof s.savings.amount === 'number') ? Number(s.savings.amount) : 0
        const warnings = [
          ...(Array.isArray(s?.guardrails) ? s.guardrails : []),
          ...(Array.isArray(s?.nuance) ? s.nuance : []),
        ]
        const steps = Array.isArray(s?.actions) ? s.actions.map((a: any) => a?.label || '').filter(Boolean) : []
        return {
          code: String(s?.code || ''),
          name: String(s?.title || s?.name || 'Strategy'),
          why: Array.isArray(s?.why) ? String(s.why[0] || s?.plain || '') : String(s?.plain || ''),
          savingsEst: savings,
          risk: 'med' as const,
          steps,
          warnings: warnings.filter(Boolean),
        }
      }) : []

      // Sort by savings descending if not already
      ranked.sort((a, b) => (b.savingsEst || 0) - (a.savingsEst || 0))

      setStrategist({
        snapshot: { estTax, effRate, allowItemize },
        ranked,
        notes: [],
      })
    } catch (err: any) {
      console.error(err)
      alert(`Submit failed: ${err?.message ?? err}`)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Analysis</h1>
        <Link href="/history" className="btn btn-outline">View History</Link>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* A. Profile */}
          <div className="rounded-2xl border p-6">
            <div className="text-lg font-semibold mb-2">Profile</div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Tax Year</label>
                <Input type="number" {...num('profile.taxYear')} />
              </div>
              <div>
                <label className="text-sm font-medium">Filing Status</label>
                <Select defaultValue="Single" onValueChange={(v)=> setValue('profile.filingStatus', v as any, { shouldDirty: true, shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {['Single','MFJ','MFS','HOH','QW'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input placeholder="CA" {...register('profile.state')} />
              </div>
              <div>
                <label className="text-sm font-medium">Dependents</label>
                <Input type="number" {...num('profile.dependents')} />
              </div>
              <div>
                <label className="text-sm font-medium">Age (Primary)</label>
                <Input type="number" {...num('profile.ages.primary')} />
              </div>
              <div>
                <label className="text-sm font-medium">Age (Spouse)</label>
                <Input type="number" {...num('profile.ages.spouse')} />
              </div>
            </div>
          </div>

          {/* B. Wages & Withholding */}
          <div className="rounded-2xl border p-6">
            <div className="text-lg font-semibold mb-2">Wages & Withholding</div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">W‑2 Wages</label><Input type="number" {...num('wages.w2Wages')} /></div>
              <div><label className="text-sm font-medium">Fed Withholding (YTD)</label><Input type="number" {...num('wages.w2Withholding')} /></div>
              <div><label className="text-sm font-medium">State Withholding (YTD)</label><Input type="number" {...num('wages.stateWithholding')} /></div>
              <div><label className="text-sm font-medium">Other Withholding</label><Input type="number" {...num('wages.otherWithholding')} /></div>
              <div><label className="text-sm font-medium">Estimated Taxes Paid</label><Input type="number" {...num('wages.estTaxPaid')} /></div>
            </div>
          </div>

          {/* C. Other Income (core) */}
          <div className="rounded-2xl border p-6">
            <div className="text-lg font-semibold mb-2">Other Income</div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                ['otherIncome.interestIncome','Interest income'],
                ['otherIncome.dividendsOrdinary','Dividends (ordinary)'],
                ['otherIncome.dividendsQualified','Dividends (qualified)'],
                ['otherIncome.capGainsShort','Cap gains (short)'],
                ['otherIncome.capGainsLong','Cap gains (long)'],
                ['otherIncome.capLossCarryforward','Cap loss carryforward'],
                ['otherIncome.rsuTaxableComp','RSU taxable comp'],
                ['otherIncome.otherIncome','Other income'],
              ].map(([path, label]) => (
                <div key={path}>
                  <label className="text-sm font-medium">{label}</label>
                  <Input type="number" {...num(path)} />
                </div>
              ))}
            </div>
          </div>

          {/* D. Self‑Employment */}
          <div className="rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">Self‑Employment</div>
              <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={showSE} onChange={(e)=>setShowSE(e.target.checked)} /> I have 1099/self‑employment</label>
            </div>
            {showSE && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div><label className="text-sm font-medium">SE net profit</label><Input type="number" {...num('selfEmployment.seNetProfit')} /></div>
                <div><label className="text-sm font-medium">SE health insurance</label><Input type="number" {...num('selfEmployment.seHealthInsurance')} /></div>
                <div><label className="text-sm font-medium">Solo 401(k) employee</label><Input type="number" {...num('selfEmployment.retirementSolo401kEmployee')} /></div>
                <div><label className="text-sm font-medium">Solo 401(k) employer/SEP</label><Input type="number" {...num('selfEmployment.retirementSolo401kEmployer')} /></div>
                <div className="sm:col-span-3"><label className="text-sm font-medium">QBI eligible?</label> <input type="checkbox" defaultChecked {...register('selfEmployment.isQBIEligible' as any)} /></div>
              </div>
            )}
          </div>

          {/* Rentals (minimal) */}
          <div className="rounded-2xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold">Rentals & Real Estate</div>
              <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={showRentals} onChange={(e)=>setShowRentals(e.target.checked)} /> I own rentals/STR</label>
            </div>
            {showRentals && (
              <div className="grid sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select className="input" {...register('rentals.0.type' as any)} defaultValue="LTR">
                    <option value="LTR">LTR</option>
                    <option value="STR">STR</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Income</label>
                  <Input type="number" {...num('rentals.0.income')} />
                </div>
                <div>
                  <label className="text-sm font-medium">Expenses</label>
                  <Input type="number" {...num('rentals.0.expenses')} />
                </div>
                <div className="flex items-end gap-2">
                  <input type="checkbox" {...register('rentals.0.considerCostSeg' as any)} />
                  <span className="text-sm">Consider cost seg</span>
                </div>
                <p className="sm:col-span-4 text-xs text-zinc-500">STR participation thresholds to consider: 100/500/750 hours depending on safe harbor.</p>
              </div>
            )}
          </div>

          {/* G. Deductions */}
          <div className="rounded-2xl border p-6">
            <div className="text-lg font-semibold mb-2">Deductions</div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3 flex items-center gap-2">
                <input type="checkbox" {...register('deductions.useSalesTaxInsteadOfIncome' as any)} />
                <span className="text-sm">Use sales tax instead of income tax for SALT</span>
              </div>
              <div><label className="text-sm font-medium">State income tax paid</label><Input type="number" {...num('deductions.stateIncomeTaxPaid')} /></div>
              <div><label className="text-sm font-medium">State sales tax paid</label><Input type="number" {...num('deductions.stateSalesTaxPaid')} /></div>
              <div><label className="text-sm font-medium">Real estate property tax</label><Input type="number" {...num('deductions.realEstatePropertyTax')} /></div>
              <div><label className="text-sm font-medium">Personal property tax</label><Input type="number" {...num('deductions.personalPropertyTax')} /></div>

              <div><label className="text-sm font-medium">Charity (cash)</label><Input type="number" {...num('deductions.charityCash')} /></div>
              <div><label className="text-sm font-medium">Charity (non‑cash)</label><Input type="number" {...num('deductions.charityNonCash')} /></div>
              <div><label className="text-sm font-medium">Mortgage interest (primary)</label><Input type="number" {...num('deductions.mortgageInterestPrimary')} /></div>
              <div><label className="text-sm font-medium">Medical expenses</label><Input type="number" {...num('deductions.medicalExpenses')} /></div>
            </div>
            {(() => {
              const taxYear = useWatch({ control: form.control, name: 'profile.taxYear' }) as unknown as number
              const filing = useWatch({ control: form.control, name: 'profile.filingStatus' }) as unknown as any
              const d = useWatch({ control: form.control, name: 'deductions' }) as any
              const salt = computeSaltDeduction({
                taxYear: Number(taxYear || new Date().getFullYear()),
                filingStatus: (filing || 'Single') as any,
                useSalesTaxInsteadOfIncome: Boolean(d?.useSalesTaxInsteadOfIncome),
                stateIncomeTaxPaid: Number(d?.stateIncomeTaxPaid || 0),
                stateSalesTaxPaid: Number(d?.stateSalesTaxPaid || 0),
                realEstatePropertyTax: Number(d?.realEstatePropertyTax || 0),
                personalPropertyTax: Number(d?.personalPropertyTax || 0),
                pteTaxPaid: Number(d?.pteTaxPaid || 0),
              })
              const capCopy = Number(taxYear) <= 2025
                ? 'Federal SALT itemized deduction is capped at $10,000 (or $5,000 if MFS).'
                : 'Under current law, the TCJA SALT cap sunsets—no federal SALT cap applies.'
              return (
                <div className="mt-3 space-y-1 text-xs text-zinc-500">
                  <p>
                    SALT cap: {salt.cap === Infinity ? 'No cap (current law ≥ 2026)' : `$${salt.cap.toLocaleString()}`} · Allowable now: <b>${salt.allowed.toLocaleString()}</b>
                  </p>
                  <p>{capCopy}</p>
                  <p>SALT applies only if you itemize; otherwise the standard deduction is used.</p>
                  {salt.note && <p>{salt.note}</p>}
                </div>
              )
            })()}
          </div>

          {/* H. Above‑the‑line & Retirement */}
          <div className="rounded-2xl border p-6">
            <div className="text-lg font-semibold mb-2">Above‑the‑line & Retirement</div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">HSA contribution</label><Input type="number" {...num('aboveLine.hsaContribution')} /></div>
              <div><label className="text-sm font-medium">Traditional IRA</label><Input type="number" {...num('aboveLine.traditionalIRAContribution')} /></div>
              <div><label className="text-sm font-medium">Roth IRA</label><Input type="number" {...num('aboveLine.rothIRAContribution')} /></div>
              <div><label className="text-sm font-medium">FSA contribution</label><Input type="number" {...num('aboveLine.fsaContribution')} /></div>
              <div><label className="text-sm font-medium">Student loan interest</label><Input type="number" {...num('aboveLine.studentLoanInterest')} /></div>
            </div>
          </div>
        </div>

        {/* Right: Actions + Results */}
        <div className="space-y-4">
          <div className="rounded-2xl border p-6">
            <div className="font-medium">Run Analysis</div>
            <p className="text-sm text-zinc-600">We’ll estimate taxes and propose top strategies.</p>
            <button type="submit" disabled={isSubmitting} className="btn mt-3">{isSubmitting ? 'Analyzing…' : 'Get Strategies'}</button>
            {err && <div className="mt-2 text-sm text-red-600">{err}</div>}
          </div>
          {strategist && (
            <div className="rounded-2xl border p-6 space-y-4">
              <div>
                <div className="text-lg font-semibold mb-1">Summary</div>
                <div className="text-sm grid grid-cols-2 gap-2">
                  <div>Est. Tax: <b>${strategist.snapshot.estTax.toLocaleString()}</b></div>
                  <div>Effective Rate: <b>{(strategist.snapshot.effRate * 100).toFixed(1)}%</b></div>
                  <div>Itemize: <b>{strategist.snapshot.allowItemize ? 'Likely' : 'Standard Deduction'}</b></div>
                  <div>
                    Total Potential Savings: <b>${strategist.ranked.reduce((a, s) => a + (s.savingsEst || 0), 0).toLocaleString()}</b>
                  </div>
                </div>
              </div>

              {strategist.ranked.length > 0 && (
                <div>
                  <div className="text-lg font-semibold mb-2">Ranked Strategies</div>
                  <ol className="space-y-3 list-decimal ml-5">
                    {strategist.ranked.map((s, i) => (
                      <li key={`${s.code}-${i}`} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-sm">Savings: <b>${(s.savingsEst || 0).toLocaleString()}</b></div>
                        </div>
                        {s.why && <div className="text-sm text-muted-foreground">{s.why}</div>}
                        {s.steps?.length > 0 && (
                          <ul className="text-xs list-disc ml-5">
                            {s.steps.map((st, j) => <li key={j}>{st}</li>)}
                          </ul>
                        )}
                        {s.warnings && s.warnings.length > 0 && (
                          <ul className="text-xs text-amber-700 list-disc ml-5">
                            {s.warnings.map((w, j) => <li key={j}>{w}</li>)}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </form>

      {/* Paywall Modal */}
      {showPaywall.open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Upgrade Required">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPaywall({ open: false, reason: null })} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-2xl border shadow-soft max-w-md w-[92vw] p-5">
            <h3 className="text-lg font-semibold">
              {showPaywall.reason === 'monthly' ? 'Monthly limit reached' : 'Daily limit reached'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upgrade to Pro or buy a Top‑Up to continue.
            </p>
            <div className="flex gap-2 mt-4">
              <button type="button" className="btn" onClick={() => goCheckout('pro')}>Upgrade to Pro</button>
              <button type="button" className="btn btn-outline" onClick={() => goCheckout('topup')}>Top‑Up 50</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getPublicEnv(key: string): string | undefined {
  // eslint-disable-next-line no-undef
  return (process as any)?.env?.[key]
}

async function goToCheckout(priceId: string) {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      success_url: `${window.location.origin}/billing/success`,
      cancel_url: `${window.location.origin}/agent/new`,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (data?.url) window.location.href = data.url as string
}

function goCheckout(kind: 'pro' | 'topup') {
  const priceId = kind === 'pro'
    ? getPublicEnv('NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY')
    : getPublicEnv('NEXT_PUBLIC_STRIPE_PRICE_TOPUP_50')
  if (!priceId) return alert('Pricing is not configured.')
  return goToCheckout(priceId)
}
