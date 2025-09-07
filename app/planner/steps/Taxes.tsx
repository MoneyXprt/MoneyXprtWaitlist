'use client';
import type { PlanInput, FilingStatus } from '@/lib/types';

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'];

export default function Taxes({
  value, onChange, onNext, onBack,
}:{ value:PlanInput; onChange:(v:PlanInput)=>void; onNext:()=>void; onBack:()=>void }) {
  const set = (k:keyof PlanInput, v:any)=>onChange({ ...value, [k]: v });

  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold mb-1">Step 4 — Taxes (just the essentials)</h2>
      <p className="text-sm text-gray-600 mb-4">No SSNs or filings needed—just planning inputs.</p>

      <div className="grid md:grid-cols-3 gap-4">
        <label className="block"><span className="block text-sm mb-1">Filing status</span>
          <select className="w-full border rounded px-3 py-2" value={value.filingStatus}
            onChange={e=>set('filingStatus', e.target.value as FilingStatus)}>
            <option value="single">Single</option>
            <option value="married_joint">Married filing jointly</option>
            <option value="married_separate">Married filing separately</option>
            <option value="head">Head of household</option>
          </select>
        </label>

        <label className="block"><span className="block text-sm mb-1">State</span>
          <select className="w-full border rounded px-3 py-2" value={value.state}
            onChange={e=>set('state', e.target.value)}>
            {STATES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <Check label="Likely to itemize deductions" v={value.itemizeLikely} set={b=>set('itemizeLikely',b)} />
        <Check label="Charitable giving likely this year" v={value.charitableInclination} set={b=>set('charitableInclination',b)} />
        <Check label="Have side-biz or consider entity optimization" v={value.entityOrSideBiz} set={b=>set('entityOrSideBiz',b)} />
      </div>

      <Nav onBack={onBack} onNext={onNext} />
    </section>
  );
}
function Check({label,v,set}:{label:string;v:boolean;set:(b:boolean)=>void}) {
  return <label className="inline-flex items-center gap-2">
    <input type="checkbox" checked={v} onChange={e=>set(e.target.checked)} />
    <span>{label}</span>
  </label>;
}
function Nav({ onBack, onNext }:{onBack:()=>void; onNext:()=>void}) {
  return <div className="mt-6 flex justify-between">
    <button type="button" className="rounded border px-3 py-2" onClick={onBack}>Back</button>
    <button type="button" className="rounded bg-black text-white px-4 py-2" onClick={onNext}>Continue</button>
  </div>;
}