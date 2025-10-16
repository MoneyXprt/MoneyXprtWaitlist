"use client";
// app/planner/steps/BalanceSheet.tsx

import * as React from 'react';
import type { PlanInput, Property } from '../../../lib/types';

type Props = {
  value: PlanInput;
  onChange: (next: PlanInput) => void;
  onNext: () => void;
  onBack: () => void;
};

const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? Number(v) : 0);

export default function BalanceSheet({ value, onChange, onNext, onBack }: Props) {
  const set = <K extends keyof PlanInput>(k: K, val: PlanInput[K]) => onChange({ ...value, [k]: val });

  const addProperty = () => {
    const p: Property = {
      id: String(Date.now()),
      nickname: '',
      use: 'primary_home',
      estimatedValue: 0,
      mortgageBalance: 0,
      interestRate: undefined,
      monthlyRent: undefined,
      monthlyCosts: undefined,
      state: '',
    };
    set('properties', [...value.properties, p]);
  };

  const updateProperty = (id: string, patch: Partial<Property>) => {
    set('properties', value.properties.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeProperty = (id: string) => {
    set('properties', value.properties.filter(p => p.id !== id));
  };

  const totalPropertyEquity = value.properties.reduce((acc, p) => acc + (n(p.estimatedValue) - n(p.mortgageBalance)), 0);
  const altTotal =
    n(value.alts?.privateEquityVC) +
    n(value.alts?.collectibles) +
    n(value.alts?.other);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Balance Sheet</h2>

      {/* Liquid / Retirement / Crypto */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Num label="Cash (HYSA)" v={value.cash} set={v => set('cash', v)} />
        <Num label="Brokerage (taxable)" v={value.brokerage} set={v => set('brokerage', v)} />
        <Num label="Retirement (401k/IRA/Roth)" v={value.retirement} set={v => set('retirement', v)} />
        <Num label="HSA" v={value.hsa} set={v => set('hsa', v)} />
        <Num label="Crypto" v={value.crypto} set={v => set('crypto', v)} />
      </div>

      {/* Properties */}
      <div className="rounded border">
        <div className="flex items-center justify-between p-3">
          <div className="font-medium">Properties & Real Estate</div>
          <button type="button" onClick={addProperty} className="px-3 py-1 rounded border hover:bg-gray-50 text-sm">
            + Add property
          </button>
        </div>
        <div className="border-t">
          {value.properties.length === 0 ? (
            <div className="p-3 text-sm text-gray-600">No properties yet. Add your home, rentals, or land.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                  <th>Nickname</th>
                  <th>Use</th>
                  <th>State</th>
                  <th>Est. value</th>
                  <th>Mortgage bal.</th>
                  <th>Rate</th>
                  <th>Rent/mo</th>
                  <th>Costs/mo</th>
                  <th>Equity</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {value.properties.map(p => {
                  const equity = n(p.estimatedValue) - n(p.mortgageBalance);
                  return (
                    <tr key={p.id} className="[&>td]:px-3 [&>td]:py-2 border-t">
                      <td>
                        <input
                          className="border rounded px-2 py-1 w-40"
                          value={p.nickname ?? ''}
                          onChange={e => updateProperty(p.id, { nickname: e.target.value })}
                        />
                      </td>
                      <td>
                        <select
                          className="border rounded px-2 py-1"
                          value={p.use}
                          onChange={e => updateProperty(p.id, { use: e.target.value as Property['use'] })}
                        >
                          <option value="primary_home">Primary</option>
                          <option value="second_home">Second home</option>
                          <option value="rental">Rental</option>
                          <option value="land">Land</option>
                        </select>
                      </td>
                      <td>
                        <input
                          className="border rounded px-2 py-1 w-24"
                          placeholder="e.g., CA"
                          value={p.state ?? ''}
                          onChange={e => updateProperty(p.id, { state: e.target.value })}
                        />
                      </td>
                      <td>
                        <NumInline value={p.estimatedValue} onChange={v => updateProperty(p.id, { estimatedValue: v })} />
                      </td>
                      <td>
                        <NumInline value={p.mortgageBalance} onChange={v => updateProperty(p.id, { mortgageBalance: v })} />
                      </td>
                      <td>
                        <NumInline value={p.interestRate ?? 0} onChange={v => updateProperty(p.id, { interestRate: v })} />
                      </td>
                      <td>
                        <NumInline value={p.monthlyRent ?? 0} onChange={v => updateProperty(p.id, { monthlyRent: v })} />
                      </td>
                      <td>
                        <NumInline value={p.monthlyCosts ?? 0} onChange={v => updateProperty(p.id, { monthlyCosts: v })} />
                      </td>
                      <td>{fmt(equity)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeProperty(p.id)}
                          className="text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {/* Summary row */}
                <tr className="[&>td]:px-3 [&>td]:py-2 border-t font-medium">
                  <td colSpan={8} className="text-right">Total property equity</td>
                  <td>{fmt(totalPropertyEquity)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Alternative assets */}
      <div className="rounded border p-4">
        <div className="font-medium mb-3">Other / Alternative Assets (optional)</div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Num label="Private Equity / VC" v={n(value.alts?.privateEquityVC)} set={v => set('alts', { ...value.alts, privateEquityVC: v })} />
          <Num label="Collectibles" v={n(value.alts?.collectibles)} set={v => set('alts', { ...value.alts, collectibles: v })} />
          <Num label="Other" v={n(value.alts?.other)} set={v => set('alts', { ...value.alts, other: v })} />
        </div>
        <div className="text-sm text-gray-600 mt-2">Alt total: {fmt(altTotal)}</div>
      </div>

      {/* Debts (non-property) */}
      <div className="rounded border p-4">
        <div className="font-medium mb-3">Debts (non-property)</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Num label="Mortgage debt (other, if any)" v={value.mortgageDebt} set={v => set('mortgageDebt', v)} />
          <Num label="Student loans" v={value.studentLoans} set={v => set('studentLoans', v)} />
          <Num label="Auto loans" v={value.autoLoans} set={v => set('autoLoans', v)} />
          <Num label="Credit cards" v={value.creditCards} set={v => set('creditCards', v)} />
          <Num label="Other debt" v={value.otherDebt} set={v => set('otherDebt', v)} />
        </div>
      </div>

      {/* Nav */}
      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="rounded border px-4 py-2 hover:bg-gray-50">Back</button>
        <button type="button" onClick={onNext} className="rounded bg-black text-white px-4 py-2 hover:opacity-90">Next</button>
      </div>
    </div>
  );
}

function Num({
  label,
  v,
  set,
}: {
  label: string;
  v: number;
  set: (n: number) => void;
}) {
  return (
    <label className="text-sm block">
      <span className="block text-[12px] text-gray-600 mb-1">{label}</span>
      <input
        type="number"
        className="w-full border rounded px-2 py-1"
        value={Number.isFinite(v) ? v : 0}
        onChange={(e) => set(parseFloat(e.target.value || '0'))}
      />
    </label>
  );
}

function NumInline({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      className="w-28 border rounded px-2 py-1"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
    />
  );
}

function fmt(x: number) {
  return x.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}
