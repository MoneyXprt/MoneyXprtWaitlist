"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePlannerStore as usePlanner } from "@/lib/store/planner"
import SectionCard from '@/components/ui/SectionCard'

type Assumptions = Record<string, any>

export default function ScenarioClient({ scenarioId }: { scenarioId?: string }) {
  const data = usePlanner(s => s.data)
  const selected = usePlanner(s => s.selected)
  const reorder = usePlanner(s => s.reorder)
  const remove = usePlanner(s => s.remove)
  const patch = usePlanner(s => s.patch)
  const total = usePlanner(s => s.total)

  const [assumptions, setAssumptions] = useState<Assumptions>({})
  const [lastCalc, setLastCalc] = useState<any[] | null>(null)
  const [calc, setCalc] = useState<any[] | null>(null)
  const [openDelta, setOpenDelta] = useState(false)
  const dragIndex = useRef<number | null>(null)

  // Drag & drop handlers (HTML5)
  function onDragStart(index: number){ dragIndex.current = index }
  function onDragEnter(index: number){ const from = dragIndex.current; if (from==null || from===index) return; reorder(from, index); dragIndex.current = index }
  function onDragEnd(){ dragIndex.current = null }

  const conflicts = useMemo(() => {
    const codes = selected.map(s => s.code)
    const hasSTRPro = codes.includes('str_professional')
    const hasSTRGroup = codes.includes('short_term_rental_grouping') || codes.includes('str_grouping')
    return hasSTRPro && hasSTRGroup ? ['Short‑term rental professional status conflicts with grouping elections. Choose one path.'] : []
  }, [selected])

  const sumSavings = useMemo(() => total(), [selected, total])
  const confidence = useMemo(() => {
    const risks = selected.map((s:any)=>Number(s.risk||3))
    if (risks.length===0) return '—'
    const avg = risks.reduce((a,b)=>a+b,0)/risks.length
    return avg<=2? 'High' : avg<=3? 'Medium' : 'Lower'
  }, [selected])
  const complexity = useMemo(() => {
    // rough proxy: item count + time hints from assumptions
    return selected.length<=2? 'Low' : selected.length<=4? 'Medium' : 'Higher'
  }, [selected])

  async function recalc(){
    setLastCalc(calc)
    const p = data?.profile || {}
    const body = {
      filingStatus: p?.filingStatus,
      state: p?.state,
      w2: p?.income?.w2,
      se: p?.income?.self,
      k1: 0,
      entityType: '',
      rentals: p?.realEstate?.count || 0,
      avgBasis: p?.realEstate?.avgBasis || 0,
    }
    const res = await fetch('/api/plan/calculate', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body) })
    const j = await res.json().catch(()=>({}))
    setCalc(j?.items || [])
  }

  async function saveSnapshot(){
    const year = new Date().getFullYear()
    const version = (selected?.length||0) >= 3 ? 'v3' : 'v1'
    const suffix = (data?.profile?.realEstate?.count || 0) > 0 ? 'rentals active' : 'baseline'
    const title = `${year} Plan ${version} – ${suffix}`
    const payload = { selected, assumptions }
    const res = await fetch('/api/scenario/save', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ title, payload }) })
    const j = await res.json().catch(()=>({}))
    if (res.ok) {
      // noop: toast could be added; simple console for now
      console.debug('scenario saved', j?.id)
    }
  }

  function editAssumption(code: string, key: string, value: any){
    setAssumptions((a)=> ({ ...a, [code]: { ...(a[code]||{}), [key]: value } }))
  }

  return (
    <div className="p-6 space-y-4">
      <div className="text-sm text-neutral-600">Scenario {scenarioId ?? "(new)"}</div>

      {conflicts.length>0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 p-3 text-sm">
          {conflicts.map((c,i)=>(<div key={i}>{c}</div>))}
        </div>
      )}

      <div className="grid gap-3">
        {selected.map((s, idx) => (
          <div key={s.code}
            draggable
            onDragStart={()=>onDragStart(idx)}
            onDragEnter={()=>onDragEnter(idx)}
            onDragEnd={onDragEnd}
          >
            <SectionCard
              title={<div className="flex items-center gap-3"><span className="cursor-grab select-none" aria-label="Drag to reorder">☰</span> {s.name}</div>}
              subtitle={<div className="text-xs text-neutral-600">Estimated savings: ${Number(s.savingsEst||0).toLocaleString()}</div>}
              aside={<button className="text-sm rounded-md border px-3 py-1" onClick={()=>remove(s.code)} aria-label={`Remove ${s.name}`}>Remove</button>}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <label className="flex flex-col">
                  <span className="font-medium">Assumption A</span>
                  <input className="mt-1 border rounded-md px-2 py-1" value={assumptions[s.code]?.a ?? ''} onChange={(e)=>editAssumption(s.code,'a', e.target.value)} placeholder="e.g., percent or days" />
                </label>
                <label className="flex flex-col">
                  <span className="font-medium">Assumption B</span>
                  <input className="mt-1 border rounded-md px-2 py-1" value={assumptions[s.code]?.b ?? ''} onChange={(e)=>editAssumption(s.code,'b', e.target.value)} placeholder="e.g., amount" />
                </label>
                <label className="flex flex-col">
                  <span className="font-medium">Notes</span>
                  <input className="mt-1 border rounded-md px-2 py-1" value={assumptions[s.code]?.notes ?? ''} onChange={(e)=>editAssumption(s.code,'notes', e.target.value)} placeholder="e.g., conditions" />
                </label>
              </div>
            </SectionCard>
          </div>
        ))}
      </div>

      {/* Sticky summary bar */}
      <div className="sticky bottom-0 z-20 bg-white/80 dark:bg-neutral-950/70 backdrop-blur border-t">
        <div className="container py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div><span className="text-neutral-500">Estimated total:</span> <span className="font-medium">${sumSavings.toLocaleString()}</span></div>
            <div><span className="text-neutral-500">Confidence:</span> <span className="font-medium">{confidence}</span></div>
            <div><span className="text-neutral-500">Complexity:</span> <span className="font-medium">{complexity}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-sm rounded-md border px-3 py-1" onClick={()=>{ setOpenDelta(true) }}>What changed?</button>
            <button className="text-sm rounded-md border px-3 py-1" onClick={recalc}>Recalculate</button>
            <button className="text-sm rounded-md border px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={saveSnapshot}>Save scenario</button>
          </div>
        </div>
      </div>

      {openDelta && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="What changed">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setOpenDelta(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-900 rounded-2xl border shadow-soft max-w-2xl w-[92vw] p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">What changed</div>
              <button className="rounded px-2 py-1 border" onClick={()=>setOpenDelta(false)} aria-label="Close">Close</button>
            </div>
            <div className="mt-3 text-sm">
              <DeltaView before={lastCalc} after={calc} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DeltaView({ before, after }: { before: any[] | null; after: any[] | null }){
  if (!before || !after) return <div className="text-neutral-600">Run Recalculate to see changes.</div>
  const toMap = (arr: any[]) => Object.fromEntries(arr.map((i)=>[i.code, Number(i.savingsEst||0)]))
  const a = toMap(before), b = toMap(after)
  const codes = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]))
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {codes.map((c)=>{
        const delta = (b[c]||0) - (a[c]||0)
        return (
          <div key={c} className="rounded-md border p-3">
            <div className="text-sm font-medium">{c}</div>
            <div className={delta>=0? 'text-emerald-700' : 'text-rose-700'}>
              {delta>=0? '+' : ''}{delta.toLocaleString()}
            </div>
          </div>
        )
      })}
    </div>
  )
}
