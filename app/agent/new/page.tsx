"use client";
import * as React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { intakeSchema, type IntakeForm } from '@/schemas/intake'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import Results from '@/components/Results'
import type { ResultsV1 } from '@/types/results'
import { useSession } from '@/lib/useSession'
import { computeSaltDeduction, saltCap } from '@/lib/tax/salt'

export default function NewAnalysisPage() {
  const session = useSession()
  const [results, setResults] = React.useState<ResultsV1 | null>(null)
  const [err, setErr] = React.useState('')
  const [shareUrl, setShareUrl] = React.useState<string | null>(null)
  const [showRentals, setShowRentals] = React.useState(false)
  const [showSE, setShowSE] = React.useState(false)

  const form = useForm<IntakeForm>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      profile: { taxYear: new Date().getFullYear(), filingStatus: 'Single', state: 'CA', dependents: 0 },
      wages: { w2Wages: 0, w2Withholding: 0 },
      otherIncome: {},
      deductions: {},
      aboveLine: {},
    },
  })
  const { register, handleSubmit, formState: { isSubmitting }, watch, setValue } = form

  const num = (path: any) => register(path, {
    valueAsNumber: true,
    setValueAs: (v: any) => (v === '' || v == null ? undefined : Number(v)),
  })

  async function onSubmit(intake: IntakeForm) {
    setErr(''); setResults(null); setShareUrl(null)
    try {
      // If rentals are toggled on but missing, initialize single row
      if (showRentals && (!intake.rentals || intake.rentals.length === 0)) {
        intake.rentals = [{ type: 'LTR', income: 0, expenses: 0, considerCostSeg: false }]
      }
      // If SE shown, ensure object exists (otherwise keep undefined)
      if (!showSE) {
        intake.selfEmployment = undefined
      }

      const meta = { taxYear: intake.profile.taxYear }
      const res = await fetch('/api/strategist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user?.email ?? null, payload: { meta, intake } }),
      })

      if (res.status === 402) {
        setErr('Quota exceeded — upgrade or top‑up to continue.')
        return
      }

      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) throw new Error(json?.error || `HTTP ${res.status}`)

      if (json.results) {
        setResults(json.results as ResultsV1)
        // Save public result and capture share URL
        try {
          const saveRes = await fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results: json.results }),
          })
          const saved = await saveRes.json().catch(() => ({}))
          if (saveRes.ok && saved?.url) setShareUrl(saved.url as string)
        } catch {}
      }
    } catch (e: any) {
      setErr(e?.message || 'Failed')
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
          {results && (
            <div className="rounded-2xl border p-6 space-y-2">
              <Results data={results} />
              {shareUrl && (
                <div className="flex items-center gap-2">
                  <button className="btn" onClick={() => navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}${shareUrl}`)}>Copy Share Link</button>
                  <Link className="btn btn-outline" href={shareUrl}>Open Shared View</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
