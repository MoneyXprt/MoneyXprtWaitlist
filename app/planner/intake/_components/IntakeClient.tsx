"use client"
import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import SectionCard from '@/components/ui/SectionCard'
import PageShell from '@/components/ui/PageShell'
import InfoTooltip from '@/components/ui/InfoTooltip'
import EmptyState from '@/components/ui/EmptyState'

const IntakeSchema = z.object({
  filingStatus: z.enum(['single','mfj','mfs','hoh'], { required_error: 'Select a filing status' }),
  state: z.string().min(2, 'Enter your state code'),
  w2: z.coerce.number().nonnegative().default(0),
  k1: z.coerce.number().nonnegative().default(0),
  se: z.coerce.number().nonnegative().default(0),
  entityType: z.enum(['','S-Corp','Partnership','LLC','C-Corp']).default(''),

  rentals: z.coerce.number().int().min(0).default(0),
  avgBasis: z.coerce.number().min(0).default(0),
  daysRented: z.coerce.number().int().min(0).max(365).default(0),
  selfManaged: z.coerce.boolean().default(false),

  k401: z.coerce.number().min(0).default(0),
  hsa: z.coerce.number().min(0).default(0),
  dependents: z.coerce.number().int().min(0).default(0),
  healthSource: z.enum(['employer','marketplace','medicare','none']).default('employer'),
})

type IntakeValues = z.infer<typeof IntakeSchema>

function Label({ children, tip }: { children: React.ReactNode; tip: string }){
  return (
    <label className="text-sm font-medium flex items-center gap-2">
      <span>{children}</span>
      <InfoTooltip content={tip} />
    </label>
  )
}

export default function IntakeClient(){
  const [preview, setPreview] = React.useState<any[] | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm<IntakeValues>({
    resolver: zodResolver(IntakeSchema),
    defaultValues: { filingStatus: 'single', state: 'CA', w2: 0, k1: 0, se: 0, entityType: '', rentals: 0, avgBasis: 0, daysRented: 0, selfManaged: false, k401: 0, hsa: 0, dependents: 0, healthSource: 'employer' },
  })

  async function onQuickEstimate(){
    setPreview(null)
    const v = getValues()
    const res = await fetch('/api/plan/calculate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(v) })
    if (!res.ok) { setPreview([]); return }
    const j = await res.json()
    setPreview(j?.items ?? [])
  }

  async function onSaveProfile(){
    setSaving(true); setMessage(null)
    try {
      const v = getValues()
      const res = await fetch('/api/planner/intake/save', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ filingStatus: v.filingStatus, state: v.state, dependents: v.dependents }) })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || `Failed (${res.status})`)
      setMessage('Saved!')
    } catch (e: any) { setMessage(e?.message || 'Failed to save') } finally { setSaving(false) }
  }

  const nameMap: Record<string, { friendly: string; also: string }> = {
    cost_seg_bonus: { friendly: 'Bonus depreciation on property', also: 'Cost segregation + bonus' },
    qbi_199a: { friendly: 'Pass‑through deduction', also: 'QBI §199A' },
    ptet_state: { friendly: 'Elective pass‑through tax', also: 'PTET' },
    augusta_280a: { friendly: 'Rent your home to your business', also: 'Augusta rule (§280A)' },
    employ_kids: { friendly: 'Family payroll', also: 'Employ your children' },
  }

  return (
    <PageShell title="Planner Intake" description="A few details help us personalize ideas. You can update these anytime.">
      <form onSubmit={handleSubmit(() => onQuickEstimate())} className="space-y-6">
        <SectionCard title="Step 1: You & income" subtitle="Tell us about your filing status and income sources.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label tip="How you file your annual tax return.">Filing status</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2" {...register('filingStatus')}>
                <option value="single">Single</option>
                <option value="mfj">Married filing jointly</option>
                <option value="mfs">Married filing separately</option>
                <option value="hoh">Head of household</option>
              </select>
              {errors.filingStatus && <p className="text-xs text-red-600 mt-1">{errors.filingStatus.message}</p>}
            </div>
            <div>
              <Label tip="Your primary state of residence.">State</Label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., CA" {...register('state')} />
              {errors.state && <p className="text-xs text-red-600 mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <Label tip="W‑2 wages from employment.">W‑2 income</Label>
              <input type="number" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., 320000" {...register('w2',{valueAsNumber:true})} />
              {errors.w2 && <p className="text-xs text-red-600 mt-1">{errors.w2.message}</p>}
            </div>
            <div>
              <Label tip="Income from pass‑throughs like partnerships.">K‑1 income</Label>
              <input type="number" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., 50000" {...register('k1',{valueAsNumber:true})} />
              {errors.k1 && <p className="text-xs text-red-600 mt-1">{errors.k1.message}</p>}
            </div>
            <div>
              <Label tip="Self‑employment income from 1099 or your own business.">1099 / Self‑employment</Label>
              <input type="number" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., 90000" {...register('se',{valueAsNumber:true})} />
              {errors.se && <p className="text-xs text-red-600 mt-1">{errors.se.message}</p>}
            </div>
            <div>
              <Label tip="If applicable, the type of business entity.">Business entity</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2" {...register('entityType')}>
                <option value="">None</option>
                <option value="S-Corp">S‑Corp</option>
                <option value="Partnership">Partnership</option>
                <option value="LLC">LLC</option>
                <option value="C-Corp">C‑Corp</option>
              </select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Step 2: Real estate" subtitle="Rentals you own and manage.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label tip="Number of residential rentals."># of rentals</Label>
              <input type="number" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., 2" {...register('rentals',{valueAsNumber:true})} />
            </div>
            <div>
              <Label tip="Average purchase price (basis) excluding land.">Average basis</Label>
              <input type="number" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., 450000" {...register('avgBasis',{valueAsNumber:true})} />
            </div>
            <div>
              <Label tip="Approximate total days rented across properties.">Days rented</Label>
              <input type="number" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., 250" {...register('daysRented',{valueAsNumber:true})} />
            </div>
            <div>
              <Label tip="Do you manage rentals yourself?">Self‑managed</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2" {...register('selfManaged', { setValueAs: (v) => v === 'true' })}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Step 3: Retirement & benefits" subtitle="Contributions and coverage.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label tip="Your annual 401(k) contributions.">401(k)</Label>
              <input type="number" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., 23000" {...register('k401',{valueAsNumber:true})} />
            </div>
            <div>
              <Label tip="Your annual HSA contributions.">HSA</Label>
              <input type="number" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., 3300" {...register('hsa',{valueAsNumber:true})} />
            </div>
            <div>
              <Label tip="Number of dependents you claim.">Dependents</Label>
              <input type="number" className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., 2" {...register('dependents',{valueAsNumber:true})} />
            </div>
            <div>
              <Label tip="Where your health coverage comes from.">Health insurance</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2" {...register('healthSource')}>
                <option value="employer">Employer</option>
                <option value="marketplace">Marketplace</option>
                <option value="medicare">Medicare</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        </SectionCard>

        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-md border px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700">Quick estimate</button>
          <button type="button" onClick={onSaveProfile} disabled={saving} className="rounded-md border px-4 py-2 bg-white hover:bg-neutral-50">Save profile</button>
          {message && <span className="text-sm text-neutral-600">{message}</span>}
        </div>
      </form>

      <div className="mt-6">
        {!preview && <EmptyState title="No estimate yet" description="Fill in a few basics above, then select Quick estimate." />}
        {preview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {preview.map((it, idx) => {
              const map = nameMap[it.code] || { friendly: it.name, also: it.name }
              return (
                <div key={idx} className="rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="font-medium">{map.friendly}</div>
                  <div className="text-xs text-neutral-600">Also called: {map.also}</div>
                  <div className="mt-2 text-sm">Estimated savings: ${Number(it.savingsEst || 0).toLocaleString()}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageShell>
  )
}

