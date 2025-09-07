'use client';
import type { PlanInput } from '@/lib/types';

export default function Risk({
  value, onChange, onNext, onBack,
}:{ value:PlanInput; onChange:(v:PlanInput)=>void; onNext:()=>void; onBack:()=>void }) {
  const set = (k:keyof PlanInput, v:any)=>onChange({ ...value, [k]: v });

  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold mb-1">Step 6 — Risk & protection</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Num label="Emergency fund (months)" v={value.emergencyFundMonths} set={n=>set('emergencyFundMonths',n)} />
        <Check label="Term life insurance in place" v={value.hasTermLife} set={b=>set('hasTermLife',b)} />
        <Check label="Long-term disability insurance" v={value.hasDisability} set={b=>set('hasDisability',b)} />
        <Check label="Umbrella liability policy" v={value.hasUmbrella} set={b=>set('hasUmbrella',b)} />
        <Check label="Concentration risk (single stock/asset)" v={value.concentrationRisk} set={b=>set('concentrationRisk',b)} />
      </div>
      <Nav onBack={onBack} onNext={onNext} />
    </section>
  );
}
function Num({label,v,set}:{label:string;v:number;set:(n:number)=>void}) {
  return <label className="block"><span className="block text-sm mb-1">{label}</span>
    <input type="number" className="w-full border rounded px-3 py-2" value={v||0}
      onChange={e=>set(parseFloat(e.target.value||'0'))}/></label>;
}
function Check({label,v,set}:{label:string;v:boolean;set:(b:boolean)=>void}) {
  return <label className="inline-flex items-center gap-2"><input type="checkbox" checked={v} onChange={e=>set(e.target.checked)}/><span>{label}</span></label>;
}
function Nav({ onBack, onNext }:{onBack:()=>void; onNext:()=>void}) {
  return <div className="mt-6 flex justify-between"><button type="button" className="rounded border px-3 py-2" onClick={onBack}>Back</button><button type="button" className="rounded bg-black text-white px-4 py-2" onClick={onNext}>Continue</button></div>;
}