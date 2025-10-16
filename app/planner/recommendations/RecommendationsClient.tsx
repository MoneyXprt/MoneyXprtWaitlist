"use client"
import { useEffect, useMemo, useState } from "react"
import { loadSnapshot } from "@/lib/planner/snapshotStore"
import { usePlannerStore } from "@/lib/store/planner"
import SectionCard from '@/components/ui/SectionCard'
import EmptyState from '@/components/ui/EmptyState'
import HelpDrawer from '@/components/ui/HelpDrawer'

type Item = { code: string; name?: string; category?: string; savingsEst?: number; risk?: number }

const NAME_MAP: Record<string, { friendly: string; also: string; what: string; time: 'quick'|'medium'|'long' }>= {
  ptet_state: { friendly: 'Elective pass‑through tax', also: 'PTET', what: 'Lets your business pay state tax so you can bypass the $10k SALT cap.', time: 'medium' },
  qbi_199a: { friendly: 'Business owner income deduction', also: 'Qualified Business Income (QBI §199A)', what: 'Can reduce federal tax on eligible pass‑through business income.', time: 'medium' },
  cost_seg_bonus: { friendly: 'Bonus depreciation on property', also: 'Cost segregation + bonus', what: 'Accelerates depreciation on parts of a building to reduce near‑term taxes.', time: 'long' },
  augusta_280a: { friendly: 'Rent your home to your business', also: 'Augusta rule (§280A)', what: 'Allows your business to rent your home for up to 14 days tax‑free.', time: 'quick' },
  employ_kids: { friendly: 'Family payroll', also: 'Employ your children', what: 'Pay your kids reasonable wages for real work and reduce family taxes.', time: 'medium' },
}

export default function RecommendationsClient({ profileId, planId }: { profileId?: string; planId?: string }) {
  const [data, setData] = useState<any[] | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const includeHighRisk = usePlannerStore(s => s.includeHighRisk)
  const addScenario = usePlannerStore(s => s.add)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'impact'|'confidence'|'complexity'>('impact')
  const [riskMax, setRiskMax] = useState<number | null>(null)
  const [time, setTime] = useState<'all'|'quick'|'medium'|'long'>('all')

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const snapshot = loadSnapshot() ?? {}
        const body = { snapshot, includeHighRisk }
        const res = await fetch(`/api/plan/recommend`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: controller.signal })
        if (!res.ok) throw new Error(`recommend failed: ${res.status}`)
        const j = await res.json()
        setData(j?.items ?? j?.recommendations ?? [])
      } catch (e: any) { setErr(e?.message ?? String(e)) }
    })()
    return () => controller.abort()
  }, [profileId, planId, includeHighRisk])

  if (err) return <div className="p-6 text-sm text-red-600">{err}</div>
  if (!data) return <div className="p-6 text-sm text-neutral-500">Finding strategies…</div>

  const filtered = useMemo(() => {
    let items: Item[] = (data || [])
    if (q) items = items.filter((it) => {
      const map = NAME_MAP[it.code] || { friendly: it.name || '', also: it.name || '', what: '', time: 'medium' as const }
      const text = `${map.friendly} ${map.also} ${it.name || ''}`.toLowerCase()
      return text.includes(q.toLowerCase())
    })
    if (riskMax != null) items = items.filter((it) => (it.risk ?? 3) <= riskMax)
    if (time !== 'all') items = items.filter((it) => (NAME_MAP[it.code]?.time || 'medium') === time)
    const sorters: Record<typeof sort, (a: Item, b: Item) => number> = {
      impact: (a,b) => (b.savingsEst||0) - (a.savingsEst||0),
      confidence: (a,b) => (a.risk||3) - (b.risk||3),
      complexity: (a,b) => ( (NAME_MAP[a.code]?.time==='long'?3:NAME_MAP[a.code]?.time==='medium'?2:1) - (NAME_MAP[b.code]?.time==='long'?3:NAME_MAP[b.code]?.time==='medium'?2:1) ),
    }
    return items.sort(sorters[sort])
  }, [data, q, riskMax, time, sort])

  return (
    <div className="p-6 space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium">Find strategies</label>
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by name" className="mt-1 w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Sort by</label>
          <select value={sort} onChange={(e)=>setSort(e.target.value as any)} className="mt-1 w-full border rounded-md px-3 py-2">
            <option value="impact">Impact (estimated savings)</option>
            <option value="confidence">Confidence (lower risk)</option>
            <option value="complexity">Complexity (quicker first)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Risk level</label>
          <select value={riskMax ?? ''} onChange={(e)=>setRiskMax(e.target.value? Number(e.target.value): null)} className="mt-1 w-full border rounded-md px-3 py-2">
            <option value="">All</option>
            <option value="1">Up to 1</option>
            <option value="2">Up to 2</option>
            <option value="3">Up to 3</option>
            <option value="4">Up to 4</option>
            <option value="5">Up to 5</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Time to implement</label>
          <select value={time} onChange={(e)=>setTime(e.target.value as any)} className="mt-1 w-full border rounded-md px-3 py-2">
            <option value="all">All</option>
            <option value="quick">Quick</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>
      </div>

      {/* Masonry-esque grid */}
      {filtered.length === 0 ? (
        <EmptyState title="No matching strategies" description="Try adjusting filters or updating your intake details." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r: Item, i: number) => {
            const map = NAME_MAP[r.code] || { friendly: r.name || `Strategy ${i+1}`, also: r.name || '', what: r.category || '', time: 'medium' as const }
            return (
              <SectionCard
                key={`${r.code}-${i}`}
                title={map.friendly}
                subtitle={<span className="text-xs text-neutral-600">Also called: {map.also}</span>}
                footer={
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">${Number(r.savingsEst||0).toLocaleString()}</div>
                    <button
                      className="text-sm rounded-md border px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => addScenario({ code: r.code, name: map.friendly, savingsEst: Number(r.savingsEst||0) })}
                      aria-label={`Add ${map.friendly} to plan`}
                    >
                      Add to plan
                    </button>
                  </div>
                }
              >
                <div className="text-sm text-neutral-700">{map.what}</div>
                <div className="mt-2">
                  <HelpDrawer label="Why this fits you" title="Why this fits you">
                    <Reason code={r.code} />
                  </HelpDrawer>
                </div>
              </SectionCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Reason({ code }: { code: string }){
  const [text, setText] = useState<string>('Loading…')
  useEffect(() => {
    let alive = true
    fetch(`/api/explain?code=${encodeURIComponent(code)}`).then(async (res)=>{
      const j = await res.json().catch(()=>({}))
      if (alive) setText(j?.reason || 'This strategy may fit based on your answers.')
    }).catch(()=>{ if (alive) setText('This strategy may fit based on your answers.') })
    return ()=>{ alive = false }
  }, [code])
  return <div className="text-sm text-neutral-700">{text}</div>
}
