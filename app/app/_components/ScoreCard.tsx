"use client";
import React from 'react'
import { recalcScore } from '@/lib/score/client'
import ExplainDrawer from './ExplainDrawer'
import { useEffect } from 'react'

type Breakdown = { retirement: number; entity: number; deductions: number; investments: number; hygiene: number; advanced: number }

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-neutral-600">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-neutral-200 rounded">
        <div className="h-2 bg-emerald-600 rounded" style={{ width: `${Math.min(100, Math.max(0, (value / 20) * 100))}%` }} />
      </div>
    </div>
  )
}

export default function ScoreCard() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [score, setScore] = React.useState<number | null>(null)
  const [breakdown, setBreakdown] = React.useState<Breakdown | null>(null)
  const [updatedAt, setUpdatedAt] = React.useState<string | null>(null)
  const [showExplain, setShowExplain] = React.useState(false)
  const [weights, setWeights] = React.useState<{ [k: string]: number } | null>(null)
  const [savingWeights, setSavingWeights] = React.useState(false)

  // Load user weights
  useEffect(() => {
    fetch('/api/settings/weights').then(async (r) => {
      const j = await r.json()
      if (r.ok) setWeights(j.weights || { retirement: 20, entity: 20, deductions: 15, investments: 15, hygiene: 10, advanced: 20 })
    })
  }, [])

  async function saveWeights(next: any) {
    setSavingWeights(true)
    setWeights(next)
    try {
      await fetch('/api/settings/weights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weights: next }) })
      // Trigger a rescore so UI reflects new weights
      await recalc()
    } finally {
      setSavingWeights(false)
    }
  }

  async function load() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/score/latest', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed')
      setScore(json.score)
      setBreakdown(json.breakdown)
      setUpdatedAt(json.updatedAt)
    } catch (e: any) {
      setError(e?.message || 'Failed to load score')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [])

  async function recalc() {
    setSaving(true); setError(null)
    try {
      // TODO: analytics event score_calculated
      const { score, breakdown } = await recalcScore()
      setScore(score)
      setBreakdown(breakdown)
      setUpdatedAt(new Date().toISOString())
    } catch (e: any) {
      setError(e?.message || 'Failed to recalculate')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="bg-white shadow p-4 rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">Keep‑More Score</h2>
          <p className="text-xs text-neutral-600" title="What drives this score? Retirement, entity optimization, deductions, investment hygiene, and advanced strategies.">
            What drives this score?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded px-3 py-1.5 border text-sm" onClick={() => setShowExplain(true)}>
            Explain my score
          </button>
          <button className="rounded px-3 py-1.5 bg-black text-white text-sm disabled:opacity-60" onClick={recalc} disabled={saving}>
            {saving ? 'Recalculating…' : 'Recalculate'}
          </button>
        </div>
      </div>

      {/* Weights controls */}
      {weights && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 border rounded p-3">
          {['retirement','entity','deductions','investments','hygiene','advanced'].map((k) => (
            <label key={k} className="text-xs text-neutral-700">
              <div className="flex items-center justify-between mb-1">
                <span className="capitalize">{k}</span>
                <span className="text-neutral-500">{weights[k] ?? 0}</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={weights[k] ?? 0}
                onChange={(e) => saveWeights({ ...weights, [k]: Number(e.target.value) })}
              />
            </label>
          ))}
          <div className="md:col-span-3 text-right text-xs text-neutral-500">{savingWeights ? 'Saving preferences…' : 'Adjust category weights to reflect your priorities'}</div>
        </div>
      )}

      {loading ? (
        <div className="mt-4 text-sm text-neutral-600">Loading score…</div>
      ) : error ? (
        <div className="mt-4 text-sm text-red-700">{error}</div>
      ) : score == null ? (
        <div className="mt-4 text-sm text-neutral-700">
          No score yet. Click “Recalculate” to compute your current Keep‑More Score.
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="text-5xl font-semibold">{Math.round(score)}</div>
            <div className="text-xs text-neutral-600 mt-1">out of 100</div>
            {updatedAt && <div className="text-xs text-neutral-500 mt-2">Updated {new Date(updatedAt).toLocaleString()}</div>}
          </div>
          <div className="md:col-span-2 grid gap-3">
            {breakdown && (
              <>
                <Bar label="Retirement" value={breakdown.retirement} />
                <Bar label="Entity" value={breakdown.entity} />
                <Bar label="Deductions" value={breakdown.deductions} />
                <Bar label="Investments" value={breakdown.investments} />
                <Bar label="Hygiene" value={breakdown.hygiene} />
                <Bar label="Advanced" value={breakdown.advanced} />
              </>
            )}
          </div>
        </div>
      )}
      <ExplainDrawer open={showExplain} onClose={() => setShowExplain(false)} />
    </section>
  )
}
