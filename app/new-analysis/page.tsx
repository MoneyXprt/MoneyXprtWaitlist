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
      // Minimal valid intake for the strategist API
      const intake = {
        filingStatus: 'Single',
        state: 'CA',
        dependents: 0,
        income: { w2Wages: 200000 },
        deductions: { stateIncomeTaxPaid: 12000, realEstatePropertyTax: 8000 },
        cashflow: { emergencyFundMonths: 6, monthlySurplus: 2000 },
      }

      const res = await fetch('/api/strategist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intake),
      })

      if (!res.ok) {
        const txt = await res.text().catch(()=>'')
        throw new Error(txt || `Error ${res.status}`)
      }

      const data = await res.json().catch(()=>({}))

      // Compute snapshot values
      const year = new Date().getFullYear()
      const d = intake.deductions as any
      const salt = computeSaltDeduction({
        taxYear: year,
        filingStatus: intake.filingStatus as any,
        useSalesTaxInsteadOfIncome: Boolean(d?.useSalesTaxInsteadOfIncome),
        stateIncomeTaxPaid: Number(d?.stateIncomeTaxPaid || 0),
        stateSalesTaxPaid: Number(d?.stateSalesTaxPaid || 0),
        realEstatePropertyTax: Number(d?.realEstatePropertyTax || 0),
        personalPropertyTax: Number(d?.personalPropertyTax || 0),
        pteTaxPaid: 0,
      })
      const itemized = Number(salt.allowed || 0) + Number(d?.charityCash || 0) + Number(d?.charityNonCash || 0) + Number(d?.mortgageInterestPrimary || 0)
      const std = stdDeduction(intake.filingStatus as any, undefined)
      const allowItemize = itemized > std

      const agi = Number(intake.income.w2Wages || 0)
      const taxable = Math.max(0, agi - (allowItemize ? itemized : std))
      const estTax = calcBracketTax(taxable, filingMap(intake.filingStatus as any))
      const effRate = agi > 0 ? estTax / agi : 0

      const ranked: UiStrategy[] = Array.isArray(data?.strategies) ? data.strategies.map((s: any) => {
        const savings = (s?.savings && typeof s.savings.amount === 'number') ? Number(s.savings.amount) : 0
        const steps = Array.isArray(s?.actions) ? s.actions.map((a: any) => a?.label || '').filter(Boolean) : []
        const warnings = [
          ...(Array.isArray(s?.guardrails) ? s.guardrails : []),
          ...(Array.isArray(s?.nuance) ? s.nuance : []),
        ].filter(Boolean)
        return {
          code: String(s?.code || ''),
          name: String(s?.title || s?.name || 'Strategy'),
          why: Array.isArray(s?.why) ? String(s.why[0] || s?.plain || '') : String(s?.plain || ''),
          savingsEst: savings,
          risk: 'med',
          steps,
          warnings,
        }
      }) : []

      ranked.sort((a, b) => (b.savingsEst || 0) - (a.savingsEst || 0))

      const json: StrategistResult = {
        snapshot: { estTax, effRate, allowItemize },
        ranked,
        notes: [],
      }

      setResult(json as StrategistResult)
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
            <div className="text-2xl font-semibold">{result.snapshot.effRate.toFixed(1)}%</div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {result.ranked.map((s) => (
              <div key={s.code} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{s.name}</h4>
                  <span className="text-green-600 font-semibold">${s.savingsEst.toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{s.why}</p>
                <ol className="mt-3 list-decimal pl-5 text-sm space-y-1">
                  {s.steps.map((t,i)=><li key={i}>{t}</li>)}
                </ol>
                {!!s.warnings?.length && (
                  <div className="mt-3 rounded bg-yellow-50 border border-yellow-200 p-2 text-xs text-yellow-800">
                    <b>Warnings:</b> {s.warnings.join(' • ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

