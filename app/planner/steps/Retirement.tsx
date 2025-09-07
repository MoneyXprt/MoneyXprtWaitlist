'use client';
import type { PlanInput } from '@/lib/types';

export default function Retirement({
  value, onChange, onNext, onBack,
}:{ value:PlanInput; onChange:(v:PlanInput)=>void; onNext:()=>void; onBack:()=>void }) {
  const set = (k:keyof PlanInput, v:any)=>onChange({ ...value, [k]: v });

  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold mb-1">Step 5 — Retirement & wealth building</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Num label="Target retire age" v={value.targetRetireAge} set={n=>set('targetRetireAge',n)} />
        <Num label="Desired retirement income / mo" v={value.targetRetireIncomeMonthly} set={n=>set('targetRetireIncomeMonthly',n)} />
        <Check label="Using backdoor Roth" v={value.usingRothBackdoor} set={b=>set('usingRothBackdoor',b)} />
        <Check label="Using mega backdoor Roth" v={value.usingMegaBackdoor} set={b=>set('usingMegaBackdoor',b)} />
        <Check label="Have pension or deferred comp" v={value.hasPensionOrDeferredComp} set={b=>set('hasPensionOrDeferredComp',b)} />
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