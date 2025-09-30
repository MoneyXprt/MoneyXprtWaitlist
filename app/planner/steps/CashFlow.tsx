'use client';
import { useId } from 'react';
import type { PlanInput } from '@/lib/types';

// Helper function to safely handle numeric values
const n = (v: unknown): number => (typeof v === 'number' && isFinite(v as number) ? (v as number) : 0);

export default function CashFlow({
  value, onChange, onNext, onBack,
}: {
  value: PlanInput;
  onChange: (v: PlanInput) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const id = useId();
  const set = (k: keyof PlanInput, v: number | boolean) =>
    onChange({ ...value, [k]: v });

  return (
    <section className="rounded border p-4">
      <h2 className="text-lg font-semibold mb-1">Step 2 — Cash flow & income</h2>
      <p className="text-sm text-gray-600 mb-4">
        Ballpark is fine. This powers tax and savings recommendations.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <Number label="Salary (W-2) – yearly" val={n(value.salary)} set={(n)=>set('salary',n)} />
        <Number label="Bonus – yearly" val={n(value.bonus)} set={(n)=>set('bonus',n)} />
        <Number label="Self-employment net – yearly" val={n(value.selfEmployment)} set={(n)=>set('selfEmployment',n)} />
        <Number label="RSU vesting – yearly" val={n(value.rsuVesting)} set={(n)=>set('rsuVesting',n)} />
        <Number label="K-1 ordinary (active) – yearly" val={n(value.k1Active)} set={(n)=>set('k1Active',n)} />
        <Number label="K-1 ordinary (passive) – yearly" val={n(value.k1Passive)} set={(n)=>set('k1Passive',n)} />
        <Number label="Rental NOI – yearly" val={n(value.rentNOI)} set={(n)=>set('rentNOI',n)} />
        <Number label="Other income – yearly" val={n(value.otherIncome)} set={(n)=>set('otherIncome',n)} />
      </div>

      <h3 className="font-medium mt-6 mb-2">Monthly spending & savings</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <Number label="Fixed expenses / mo" val={n(value.fixedMonthlySpend)} set={(n)=>set('fixedMonthlySpend',n)} />
        <Number label="Lifestyle extras / mo" val={n(value.lifestyleMonthlySpend)} set={(n)=>set('lifestyleMonthlySpend',n)} />
        <Number label="Savings already / mo" val={n(value.savingsMonthly)} set={(n)=>set('savingsMonthly',n)} />
      </div>

      <Nav onBack={onBack} onNext={onNext} />
    </section>
  );
}

interface NumberProps {
  label: string;
  val?: number;
  set: (n: number) => void;
}

function Number({ label, val, set }: NumberProps) {
  return (
    <label className="block">
      <span className="block text-sm mb-1">{label}</span>
      <input 
        type="number" 
        inputMode="decimal" 
        className="w-full border rounded px-3 py-2"
        value={n(val)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const parsed = parseFloat(e.target.value || '0');
          set(isFinite(parsed) ? parsed : 0);
        }}
      />
    </label>
  );
}
function Nav({ onBack, onNext }:{onBack:()=>void; onNext:()=>void}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <button type="button" onClick={onBack} className="rounded border px-3 py-2">Back</button>
      <button type="button" onClick={onNext} className="rounded bg-black text-white px-4 py-2">Continue</button>
    </div>
  );
}