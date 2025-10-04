"use client";
import React from "react";
import Link from "next/link";

const usd = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * Tiny interactive estimator (client-side only) to prove the app is alive:
 *  - W-2 income drives PTET/QBI eligibility
 *  - Rental basis drives bonus depreciation estimate
 *  - Numbers are rough; the Planner does the real math later
 */
export default function LiveEstimator() {
  const year = new Date().getFullYear();
  const [w2, setW2] = React.useState(300_000);
  const [rentals, setRentals] = React.useState(1);
  const [basis, setBasis] = React.useState(450_000);
  const [state, setState] = React.useState("CA");

  const marginalFed = 0.37;
  const bonusRate = 0.60; // rough for demo
  const ptetRates: Record<string, number> = { CA: 0.095, NY: 0.10, TX: 0, FL: 0, WA: 0, IL: 0.04975, MN: 0.0985 };

  const bonusSav = Math.max(0, rentals) * Math.max(0, basis) * 0.8 * bonusRate * marginalFed; // ignore land 20%
  const ptetBase = w2 > 200_000 ? Math.min(w2 - 200_000, 400_000) : 0; // crude
  const ptetSav = ptetBase * ptetRates[state] * marginalFed;
  const qbiSav = w2 > 200_000 ? Math.min(w2 * 0.2, 50_000) : 0; // crude cap

  const total = Math.round(bonusSav + ptetSav + qbiSav);

  return (
    <section className="rounded-2xl border bg-white/60 p-6 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Instant Savings Preview</h2>
        <span className="text-xs text-gray-500">Year {year}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-gray-600">W-2 Income</label>
          <input
            type="range"
            min={120000}
            max={900000}
            step={10000}
            value={w2}
            onChange={(e) => setW2(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 text-sm font-medium">{usd(w2)}</div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">Rental properties</label>
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={rentals}
            onChange={(e) => setRentals(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 text-sm font-medium">{rentals}</div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">Average rental basis</label>
          <input
            type="range"
            min={100000}
            max={1000000}
            step={10000}
            value={basis}
            onChange={(e) => setBasis(Number(e.target.value))}
            className="w-full"
          />
          <div className="mt-1 text-sm font-medium">{usd(basis)}</div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">State</label>
          <select
            className="w-full rounded-md border p-2"
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            {["CA", "NY", "TX", "FL", "WA", "IL", "MN"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Bonus depreciation (rough)" value={usd(Math.round(bonusSav))} />
        <Metric label="PTET federal benefit (rough)" value={usd(Math.round(ptetSav))} />
        <Metric label="QBI §199A (rough)" value={usd(Math.round(qbiSav))} />
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border bg-white/70 p-4">
        <div>
          <div className="text-sm text-gray-600">Estimated total strategies (rough)</div>
          <div className="text-2xl font-semibold">{usd(total)}</div>
        </div>
        <Link
          href="/planner/intake?demo=ca300k1rental"
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          Run full scan →
        </Link>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white/70 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

