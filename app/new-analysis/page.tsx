"use client";

import * as React from 'react'
import type { StrategistResult, Strategy as UiStrategy } from '@/types/strategist'
import { TAX_BRACKETS } from '@/lib/taxStrategies'
import { computeSaltDeduction } from '@/lib/tax/salt'

export default function NewAnalysisPage() {
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string>('')
  const [result, setResult] = React.useState<StrategistResult | null>(null)

  function filingMap(fs: 'Single' | 'MFJ' | 'MFS' | 'HOH' | 'QW'): 'single' | 'married' | 'head_of_household' {
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

  function stdDeduction(fs: 'Single' | 'MFJ' | 'MFS' | 'HOH' | 'QW', ages?: { primary?: number; spouse?: number }) {
    const base = (fs === 'MFJ' || fs === 'QW') ? 29200 : fs === 'HOH' ? 21900 : 14600
    const addl = (fs === 'MFJ')
      ? ((ages?.primary && ages.primary >= 65 ? 1550 : 0) + (ages?.spouse && ages.spouse >= 65 ? 1550 : 0))
      : ((ages?.primary && ages.primary >= 65 ? 1950 : 0))
    return base + (addl || 0)
  }

  function calcBracketTax(taxable: number, status: 'single' | 'married' | 'head_of_household') {
    const brackets = TAX_BRACKETS[status]
    let tax = 0
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

  async function handleSubmit() {
    setSubmitting(true); setError(''); setResult(null)
    try {
      // Build a normalized UserProfile-like payload (demo values)
      const profile = {
        taxYear: new Date().getFullYear(),
        filingStatus: 'MFJ',
        state: 'CA',
        dependents: 1,
        income: { w2: 240000, side: 20000 },
        deductions: { stateTax: 9000, propertyTax: 8000, mortgageInterest: 12000, charityCash: 3000 },
        housing: { ownHome: true },
        liquidity: { cashOnHand: 25000, monthlySurplus: 2000 },
        debts: [{ type: 'cc', balance: 15000, apr: 0.24, minPmt: 300 }],
        goals: ['reduce taxes', 'start LLC', 'buy STR'],
      }

      const res = await fetch('/api/strategist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (!res.ok) {
        const txt = await res.text().catch(()=>'')
        throw new Error(txt || `Error ${res.status}`)
      }

      const data = await res.json().catch(()=>({}))

      // Compute snapshot values from simple W-2 baseline to show “see value”
      const year = profile.taxYear
      const d = profile.deductions as any
      const salt = computeSaltDeduction({
        taxYear: year,
        filingStatus: profile.filingStatus as any,
        useSalesTaxInsteadOfIncome: Boolean(d?.useSalesTaxInsteadOfIncome),
        stateIncomeTaxPaid: Number(d?.stateIncomeTaxPaid || d?.stateTax || 0),
        stateSalesTaxPaid: Number(d?.stateSalesTaxPaid || 0),
        realEstatePropertyTax: Number(d?.realEstatePropertyTax || d?.propertyTax || 0),
        personalPropertyTax: Number(d?.personalPropertyTax || 0),
        pteTaxPaid: 0,
      })
      const itemized = Number(salt.allowed || 0) + Number(d?.charityCash || 0) + Number(d?.charityNonCash || 0) + Number(d?.mortgageInterestPrimary || profile.deductions?.mortgageInterest || 0)
      const std = stdDeduction(profile.filingStatus as any, undefined)
      const allowItemize = itemized > std

      const agi = Number(profile.income?.w2 || 0)
      const taxable = Math.max(0, agi - (allowItemize ? itemized : std))
      const estTax = calcBracketTax(taxable, filingMap(profile.filingStatus as any))
      const effRate = agi > 0 ? estTax / agi : 0

      // Build a lightweight result view using API ranked results
      const ranked = Array.isArray(data?.ranked) ? data.ranked.slice(0, 5) : []
      const json: any = { snapshot: { estTax, effRate, allowItemize }, ranked }
      setResult(json as any)
    } catch (e: any) {
      setError(e?.message || 'Failed to run analysis')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Analysis</h1>
      </header>

      <div className="rounded-lg border p-4">
        <div className="font-medium">Run Analysis</div>
        <p className="text-sm text-gray-600">We’ll estimate taxes and propose top strategies.</p>
        <button onClick={handleSubmit} disabled={submitting} className="btn mt-3">{submitting ? 'Analyzing…' : 'Run with Demo Profile'}</button>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Estimated Tax</div>
            <div className="text-2xl font-semibold">${result.snapshot.estTax.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Effective Rate</div>
            <div className="text-2xl font-semibold">{(result.snapshot.effRate * 100).toFixed(1)}%</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {result.ranked.map((r: any) => {
              const eligible = Boolean(r.eligible)
              const firstReason = Array.isArray(r.reasons) && r.reasons.length > 0 ? r.reasons[0] : ''
              const warn = Array.isArray(r.warnings) ? r.warnings.slice(0, 3) : []
              return (
                <div key={r.code} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{r.title}</h4>
                    <span className={eligible ? 'text-green-600' : 'text-gray-500'}>
                      {eligible ? 'Eligible' : 'Deferred'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <b>Est. Savings:</b> ${Number(r.savingsEst || 0).toLocaleString()}
                  </div>
                  {!eligible && firstReason && (
                    <div className="mt-2 text-sm text-gray-600">
                      <b>Why deferred:</b> {firstReason}
                    </div>
                  )}
                  {!!warn.length && (
                    <ul className="mt-3 text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 rounded p-2 list-disc pl-5">
                      {warn.map((w: string, i: number) => (<li key={i}>{w}</li>))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
