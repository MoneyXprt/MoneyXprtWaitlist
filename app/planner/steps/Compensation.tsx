// app/planner/steps/Compensation.tsx
'use client';

import * as React from 'react';
import type { PlanInput, DeferredDistribution, Month } from '@/lib/types';

type Props = {
  value: PlanInput;
  onChange: (next: PlanInput) => void;
  onNext?: () => void;
  onBack?: () => void;
};

// Numeric Month values with human labels
const MONTHS: { label: string; value: Month }[] = [
  { label: 'Jan', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Aug', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dec', value: 12 },
];
export default function Compensation({ value, onChange, onNext, onBack }: Props) {
  const v = value;
  const update = (patch: Partial<PlanInput>) => onChange({ ...v, ...patch });

  // keep legacy mirrors in sync for existing review/recommend usage
  const setW2 = (n: number) => update({ w2BaseAnnual: n, salary: n });
  const setBonusAnnual = (n: number) => update({ bonusPlanAnnual: n, bonus: n });
  const setRSUYear = (n: number) => update({ rsu: { ...v.rsu, yearVestingTotal: n }, rsuVesting: n });

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Compensation (Full-Year & YTD)</h2>
      <p className="text-sm text-gray-600">
        Enter full-year expected amounts and what’s happened year-to-date. We’ll use this to generate mid-year actions (e.g., bonus planning).
      </p>

      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">W-2 & Cash Bonuses</h3>
        <Row label="W-2 Base salary (annual)" tip="Your base pay before bonuses.">
          <Num value={v.w2BaseAnnual} onChange={setW2} />
        </Row>
        <Row label="Cash bonuses (annual plan)" tip="Total expected cash bonuses this year (sign-on, performance, retention).">
          <Num value={v.bonusPlanAnnual} onChange={setBonusAnnual} />
        </Row>
        <Row label="Cash bonuses (YTD received)" tip="Cash bonuses already received this year.">
          <Num value={v.bonusYTD} onChange={(n) => update({ bonusYTD: n })} />
        </Row>
      </div>

      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">Deferred Compensation</h3>
        <Row label="Eligible?" tip="Plans that let you defer current income to a future payout (reduces current taxable income).">
          <YesNo value={v.deferredComp.eligible} onChange={(b) => update({ deferredComp: { ...v.deferredComp, eligible: b } })} />
        </Row>
        {v.deferredComp.eligible && (
          <>
            <Row label="Elected % of eligible pay">
              <Num value={v.deferredComp.electedPercent ?? 0} onChange={(n) => update({ deferredComp: { ...v.deferredComp, electedPercent: n } })} />
            </Row>
            <Row label="Company match % (if any)">
              <Num value={v.deferredComp.companyMatchPercent ?? 0} onChange={(n) => update({ deferredComp: { ...v.deferredComp, companyMatchPercent: n } })} />
            </Row>
            <Row label="Distribution style">
              <select
                className="w-full border rounded px-3 py-2"
                value={v.deferredComp.distribution ?? ''}
                onChange={(e) => update({ deferredComp: { ...v.deferredComp, distribution: (e.target.value || undefined) as DeferredDistribution } })}
              >
                <option value="">Select…</option>
                <option value="lump">Lump sum</option>
                <option value="schedule">Installments / schedule</option>
              </select>
            </Row>
            <Row label="First payout year (if known)">
              <Num value={v.deferredComp.firstPayoutYear ?? 0} onChange={(n) => update({ deferredComp: { ...v.deferredComp, firstPayoutYear: n || undefined } })} />
            </Row>
          </>
        )}
      </div>

      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">Equity — RSU & ESPP</h3>
        <Row label="RSU eligible?" tip="RSU = Restricted Stock Units (taxed as they vest).">
          <YesNo value={v.rsu.eligible} onChange={(b) => update({ rsu: { ...v.rsu, eligible: b } })} />
        </Row>
        {v.rsu.eligible && (
          <>
            <Row label="Company ticker (optional)">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., AAPL"
                value={v.rsu.ticker ?? ''}
                onChange={(e) => update({ rsu: { ...v.rsu, ticker: e.target.value.toUpperCase() } })}
              />
            </Row>
            <Row label="RSU vesting (YTD $)">
              <Num value={v.rsu.ytdVestedValue ?? 0} onChange={(n) => update({ rsu: { ...v.rsu, ytdVestedValue: n } })} />
            </Row>
            <Row label="RSU vesting (expected total this year $)">
              <Num value={v.rsu.yearVestingTotal ?? 0} onChange={setRSUYear} />
            </Row>
          </>
        )}

        <Row label="ESPP eligible?" tip="ESPP = Employee Stock Purchase Plan; buy your company stock via payroll at a discount.">
          <YesNo value={v.espp.eligible} onChange={(b) => update({ espp: { ...v.espp, eligible: b } })} />
        </Row>
        {v.espp.eligible && (
          <>
            <Row label="Discount %">
              <Num value={v.espp.discountPercent ?? 0} onChange={(n) => update({ espp: { ...v.espp, discountPercent: n } })} />
            </Row>
            <Row label="Contribution % (payroll)">
              <Num value={v.espp.contributionPercent ?? 0} onChange={(n) => update({ espp: { ...v.espp, contributionPercent: n } })} />
            </Row>
            <Row label="Purchase months">
              <div className="flex flex-wrap gap-2">
                {months.map((m) => {
                  const selected = (v.espp.purchaseMonths ?? []).includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`px-2 py-1 rounded border text-sm ${selected ? 'bg-black text-white' : ''}`}
                      onClick={() => {
                        const curr = new Set(v.espp.purchaseMonths ?? []);
                        if (curr.has(m)) curr.delete(m); else curr.add(m);
                        update({ espp: { ...v.espp, purchaseMonths: Array.from(curr) as Month[] } });
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </Row>
          </>
        )}
      </div>

      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">Other Income</h3>
        <Row label="Self-employment (annual)">
          <Num value={v.selfEmployment ?? 0} onChange={(n) => update({ selfEmployment: n })} />
        </Row>
        <Row label="K-1 (active)">
          <Num value={v.k1Active ?? 0} onChange={(n) => update({ k1Active: n, k1ActiveLegacy: n })} />
        </Row>
        <Row label="K-1 (passive)">
          <Num value={v.k1Passive ?? 0} onChange={(n) => update({ k1Passive: n, k1PassiveLegacy: n })} />
        </Row>
        <Row label="Other income (interest/dividends, annual)">
          <Num value={v.otherIncome ?? 0} onChange={(n) => update({ otherIncome: n })} />
        </Row>
        <Row label="Rental NOI (annual)" tip="Net operating income from rentals (income minus operating expenses).">
          <Num value={v.rentNOI ?? 0} onChange={(n) => update({ rentNOI: n })} />
        </Row>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" className="rounded border px-4 py-2" onClick={onBack}>
          Back
        </button>
        <button type="button" className="inline-flex px-4 py-2 rounded bg-black text-white" onClick={onNext}>
          Continue
        </button>
      </div>
    </section>
  );
}

// ---- Small primitives ----
function Row({ label, tip, children }: { label: string; tip?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block font-medium mb-1">
        {label} {tip && <span className="ml-2 text-gray-500">({tip})</span>}
      </span>
      {children}
    </label>
  );
}

function Num({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      className="w-full border rounded px-3 py-2"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
    />
  );
}

function YesNo({ value, onChange }: { value: boolean; onChange: (b: boolean) => void }) {
  return (
    <select className="w-full border rounded px-3 py-2" value={String(value)} onChange={(e) => onChange(e.target.value === 'true')}>
      <option value="false">No</option>
      <option value="true">Yes</option>
    </select>
  );
}