"use client";

import React from 'react'

type Breakdown = { retirement: number; entity: number; deductions: number; investments: number; hygiene: number; advanced: number }
type ScoreResult = { score: number; breakdown: Breakdown; notes: string[] }
type ScenarioResult = { scoreResult: ScoreResult; narrative: { title: string; summary: string }; delta?: { scorePct?: number; sections?: Record<string, number> } }

function Bar({ label, value, max = 20 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-neutral-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-neutral-200 rounded">
        <div className="h-2 bg-emerald-600 rounded" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

async function runScenario(): Promise<ScenarioResult> {
  const res = await fetch('/api/planner/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error || 'Failed')
  return json
}

export default function ScenariosClient() {
  const [a, setA] = React.useState<ScenarioResult | null>(null)
  const [b, setB] = React.useState<ScenarioResult | null>(null)
  const [loadingA, setLoadingA] = React.useState(false)
  const [loadingB, setLoadingB] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  async function recalc(which: 'A' | 'B') {
    which === 'A' ? setLoadingA(true) : setLoadingB(true)
    setErr(null)
    try {
      const out = await runScenario()
      if (which === 'A') setA(out)
      else setB(out)
    } catch (e: any) {
      setErr(e?.message || 'Failed to recalculate scenario')
    } finally {
      which === 'A' ? setLoadingA(false) : setLoadingB(false)
    }
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Scenario Comparison</h1>
      </div>

      {err && <div className="text-sm text-red-700">{err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl shadow p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Scenario A</h2>
            <button className="rounded px-3 py-1.5 bg-black text-white text-sm disabled:opacity-60" onClick={() => recalc('A')} disabled={loadingA}>
              {loadingA ? 'Recalculating…' : 'Recalculate Scenario'}
            </button>
          </div>
          {!a ? (
            <p className="text-sm text-neutral-600">No data yet. Click “Recalculate Scenario”.</p>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl font-semibold">{Math.round(a.scoreResult.score)}</div>
              <div className="text-xs text-neutral-600">{a.narrative?.summary || ''}</div>
              <div className="grid gap-2">
                <Bar label="Retirement" value={a.scoreResult.breakdown.retirement} />
                <Bar label="Entity" value={a.scoreResult.breakdown.entity} />
                <Bar label="Deductions" value={a.scoreResult.breakdown.deductions} />
                <Bar label="Investments" value={a.scoreResult.breakdown.investments} />
                <Bar label="Hygiene" value={a.scoreResult.breakdown.hygiene} />
                <Bar label="Advanced" value={a.scoreResult.breakdown.advanced} />
              </div>
              {a.delta?.scorePct !== undefined && (
                <div className="text-xs text-neutral-600">Δ vs last: {a.delta.scorePct}%</div>
              )}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Scenario B</h2>
            <button className="rounded px-3 py-1.5 bg-black text-white text-sm disabled:opacity-60" onClick={() => recalc('B')} disabled={loadingB}>
              {loadingB ? 'Recalculating…' : 'Recalculate Scenario'}
            </button>
          </div>
          {!b ? (
            <p className="text-sm text-neutral-600">No data yet. Click “Recalculate Scenario”.</p>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl font-semibold">{Math.round(b.scoreResult.score)}</div>
              <div className="text-xs text-neutral-600">{b.narrative?.summary || ''}</div>
              <div className="grid gap-2">
                <Bar label="Retirement" value={b.scoreResult.breakdown.retirement} />
                <Bar label="Entity" value={b.scoreResult.breakdown.entity} />
                <Bar label="Deductions" value={b.scoreResult.breakdown.deductions} />
                <Bar label="Investments" value={b.scoreResult.breakdown.investments} />
                <Bar label="Hygiene" value={b.scoreResult.breakdown.hygiene} />
                <Bar label="Advanced" value={b.scoreResult.breakdown.advanced} />
              </div>
              {b.delta?.scorePct !== undefined && (
                <div className="text-xs text-neutral-600">Δ vs last: {b.delta.scorePct}%</div>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="text-xs text-neutral-500">Tip: Adjust your selections, recalc each scenario, and compare scores and summaries.</div>
    </main>
  )
}

