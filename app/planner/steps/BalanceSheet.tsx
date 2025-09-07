'use client';
import type { PlanInput } from '@/lib/types';

export default function BalanceSheet({
  value, onChange, onNext, onBack,
}: {
  value: PlanInput; onChange:(v:PlanInput)=>void; onNext:()=>void; onBack:()=>void;
}) {
  const set = (k:keyof PlanInput, v:number)=>onChange({ ...value, [k]: v });

  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold mb-1">Step 3 — Assets & liabilities</h2>
      <p className="text-sm text-gray-600 mb-4">We compute net worth & liquidity. No account numbers needed.</p>

      <h3 className="font-medium">Assets</h3>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <Num label="Cash" v={value.cash} set={n=>set('cash',n)} />
        <Num label="Brokerage" v={value.brokerage} set={n=>set('brokerage',n)} />
        <Num label="Retirement (401k/IRA/Roth)" v={value.retirement} set={n=>set('retirement',n)} />
        <Num label="HSA" v={value.hsa} set={n=>set('hsa',n)} />
        <Num label="Real-estate equity" v={value.realEstateEquity} set={n=>set('realEstateEquity',n)} />
        <Num label="Private equity / VC" v={value.privateEquityVC} set={n=>set('privateEquityVC',n)} />
        <Num label="Crypto" v={value.crypto} set={n=>set('crypto',n)} />
      </div>

      <h3 className="font-medium">Debts</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <Num label="Mortgage" v={value.mortgageDebt} set={n=>set('mortgageDebt',n)} />
        <Num label="Student loans" v={value.studentLoans} set={n=>set('studentLoans',n)} />
        <Num label="Auto loans" v={value.autoLoans} set={n=>set('autoLoans',n)} />
        <Num label="Credit cards" v={value.creditCards} set={n=>set('creditCards',n)} />
        <Num label="Other debt" v={value.otherDebt} set={n=>set('otherDebt',n)} />
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
function Nav({ onBack, onNext }:{onBack:()=>void; onNext:()=>void}) {
  return <div className="mt-6 flex justify-between">
    <button type="button" className="rounded border px-3 py-2" onClick={onBack}>Back</button>
    <button type="button" className="rounded bg-black text-white px-4 py-2" onClick={onNext}>Continue</button>
  </div>
}