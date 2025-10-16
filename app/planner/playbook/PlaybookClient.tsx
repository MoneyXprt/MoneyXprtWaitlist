"use client"
import { useEffect, useMemo, useState } from "react"
import { loadSnapshot } from "@/lib/planner/snapshotStore"
import { usePlannerStore } from "@/lib/store/planner"
import PageShell from '@/components/ui/PageShell'
import SectionCard from '@/components/ui/SectionCard'
import Glossy from '@/components/Glossy'
import { TERMS } from '@/lib/glossary/terms'

export default function PlaybookClient({ planVersionId }: { planVersionId?: string }) {
  const [data, setData] = useState<any | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const selected = usePlannerStore(s => s.selectedStrategies())
  const includeHighRisk = usePlannerStore(s => s.includeHighRisk)
  const snapshot = useMemo(()=> loadSnapshot() ?? {}, [])

  useEffect(() => {
    // Prefer client-side snapshot + selected strategies. planVersionId is optional.
    const controller = new AbortController()
    ;(async () => {
      try {
        const snap = loadSnapshot() ?? {}
        if (!snap || (Array.isArray(selected) && selected.length === 0)) {
          setErr(null)
          setData(null)
          return
        }
        const body = { snapshot: snap, selected, includeHighRisk }
        const res = await fetch(`/api/plan/playbook`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: controller.signal })
        if (!res.ok) throw new Error(`playbook failed: ${res.status}`)
        setData(await res.json())
      } catch (e: any) { setErr(e?.message ?? String(e)) }
    })()
    return () => controller.abort()
  }, [planVersionId, selected.join('|'), includeHighRisk])

  const exportPdf = async () => {
    if (!data) return
    const res = await fetch(`/api/plan/playbook.export`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ playbook: data }) })
    if (!res.ok) return alert("Export failed")
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `playbook-${planVersionId ?? "latest"}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  const saveHistory = async () => {
    if (!data) return
    try {
      const res = await fetch('/api/planner/snapshot', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ payload: { playbook: data } }) })
      if (!res.ok) throw new Error('Failed to save')
      alert('Saved to history')
    } catch (e:any) { alert(e?.message || 'Failed to save') }
  }

  if (!planVersionId && (!data && (!selected || selected.length === 0))) return <div className="p-6 text-sm">No plan selected yet — run Intake/Recommendations first.</div>
  if (err) return <div className="p-6 text-sm text-red-600">{err}</div>
  if (!data) return <div className="p-6 text-sm text-neutral-500">Building playbook…</div>

  const prof = snapshot?.profile || {}
  const incomeBand = (() => {
    const w2 = Number(prof?.income?.w2||0) + Number(prof?.income?.self||0)
    if (w2 < 120_000) return 'Lower'
    if (w2 < 350_000) return 'Mid'
    return 'Higher'
  })()
  const chips = [
    prof?.state ? `State: ${prof.state}` : null,
    `Income: ${incomeBand}`,
    (prof?.realEstate?.count||0) > 0 ? 'Rentals: yes' : 'Rentals: no',
    prof?.entity ? `Entity: ${prof.entity}` : null,
  ].filter(Boolean) as string[]

  return (
    <PageShell title="Your 2025 Tax Savings Plan" description={<span className="text-sm">A personalized checklist with steps and paperwork. Share with your CPA to confirm fit.</span>}>
      <div className="flex flex-wrap gap-2 mb-4">
        {chips.map((c,i)=>(<span key={i} className="text-xs px-2 py-1 rounded-full border bg-neutral-50">{c}</span>))}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <button className="text-sm rounded-md border px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={exportPdf}>Download Playbook (PDF)</button>
        <button className="text-sm rounded-md border px-3 py-1" onClick={saveHistory}>Save to History</button>
      </div>

      <div className="space-y-3">
        {(data.items||[]).map((it: any, idx: number) => (
          <details key={idx} className="rounded-2xl border bg-white open:shadow-sm">
            <summary className="cursor-pointer select-none px-5 py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-neutral-600">Estimated savings: ${Number(it.savingsEst||0).toLocaleString()}</div>
                <div className="text-xs text-neutral-500 mt-0.5">Also called: {akaFor(it.code)} <span className="ml-2 inline-flex">{micro(it.code)}</span></div>
              </div>
              <span className="text-neutral-500">▾</span>
            </summary>
            <div className="px-5 pb-4">
              <div className="text-sm text-neutral-700 mb-2"><Glossy>{explain(it.code)}</Glossy></div>
              <SectionCard title="Steps" subtitle="Checklist to get this done.">
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  {(it.steps||[]).map((s:string, i:number)=>(<li key={i}>{s}</li>))}
                </ol>
              </SectionCard>
              {it.docs?.length ? (
                <SectionCard title="Required paperwork" subtitle="Gather these documents.">
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {it.docs.map((d:string, i:number)=>(<li key={i}>{d}</li>))}
                  </ul>
                </SectionCard>
              ) : null}
              {it.deadlines?.length ? (
                <SectionCard title="Dates" subtitle="Important timing.">
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {it.deadlines.map((d:string, i:number)=>(<li key={i}>{d}</li>))}
                  </ul>
                </SectionCard>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </PageShell>
  )
}

function explain(code?: string): string {
  switch (code) {
    case 'ptet_state':
      return 'Your business pays state tax so you can bypass the $10k SALT cap — often lowers federal taxes for pass‑through owners.'
    case 'qbi_199a':
      return 'Potential deduction on qualifying pass‑through business income within IRS limits.'
    case 'cost_seg_bonus':
      return 'Accelerates depreciation on parts of a property to reduce near‑term taxable income.'
    case 'augusta_280a':
      return 'Allows your business to rent your home for meetings for up to 14 days tax‑free.'
    case 'employ_kids':
      return 'Paying your children reasonable wages for real work can lower family taxes and fund Roth IRAs.'
    default:
      return 'Plain‑English summary of how this can reduce taxes for your situation.'
  }
}

function akaFor(code?: string): string {
  switch (code) {
    case 'ptet_state': return TERMS.ptet.label
    case 'qbi_199a': return TERMS.qbi_199a.label
    case 'cost_seg_bonus': return TERMS.cost_seg_bonus.label
    case 'augusta_280a': return TERMS.augusta_280a.label
    default: return '—'
  }
}

function micro(code?: string) {
  const key = code === 'ptet_state' ? 'ptet' : code === 'qbi_199a' ? 'qbi_199a' : code === 'cost_seg_bonus' ? 'cost_seg_bonus' : code === 'augusta_280a' ? 'augusta_280a' : undefined
  if (!key) return null
  const term = TERMS[key]
  return <span className="text-xs underline underline-offset-2 text-emerald-700">What this means
    <span className="sr-only">: {term.oneLiner}</span>
  </span>
}
