'use client';
import type { PlanInput } from '@/lib/types';

export default function Estate({
  value, onChange, onNext, onBack,
}:{ value:PlanInput; onChange:(v:PlanInput)=>void; onNext:()=>void; onBack:()=>void }) {
  const set = (k:keyof PlanInput, v:any)=>onChange({ ...value, [k]: v });

  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold mb-1">Step 7 — Estate & legacy</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Check label="Have a will or trust" v={value.hasWillOrTrust} set={b=>set('hasWillOrTrust',b)} />
        <Check label="Expect to receive an inheritance" v={value.expectsInheritance} set={b=>set('expectsInheritance',b)} />
        <Check label="Charitable / giving intent (DAF, gifts)" v={value.givingIntent} set={b=>set('givingIntent',b)} />
      </div>

      <div className="mt-6 flex justify-between">
        <button type="button" className="rounded border px-3 py-2" onClick={onBack}>Back</button>
        <button type="submit" className="rounded bg-black text-white px-4 py-2">Generate Plan</button>
      </div>
    </section>
  );
}
function Check({label,v,set}:{label:string;v:boolean;set:(b:boolean)=>void}) {
  return <label className="inline-flex items-center gap-2"><input type="checkbox" checked={v} onChange={e=>set(e.target.checked)}/><span>{label}</span></label>;
}