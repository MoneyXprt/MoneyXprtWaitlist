// app/planner/steps/Compensation.tsx
'use client';

import * as React from 'react';
import type { PlanInput } from '@/lib/types';

// Local fallbacks so this file compiles even if lib/types doesn't yet export these.
type Month = 1|2|3|4|5|6|7|8|9|10|11|12;
type DeferredDistribution = 'lump' | 'schedule';

const MONTHS: { label: string; value: Month }[] = [
  { label: 'Jan', value: 1 }, { label: 'Feb', value: 2 }, { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 }, { label: 'May', value: 5 }, { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 }, { label: 'Aug', value: 8 }, { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 }, { label: 'Nov', value: 11 }, { label: 'Dec', value: 12 },
];

type DeferredComp = {
  eligible?: boolean;
  electedPercent?: number;
  companyMatchPercent?: number;
  distribution?: DeferredDistribution;
  firstPayoutYear?: number;
};

type RSU = {
  eligible?: boolean;
  ticker?: string;
  ytdVestedValue?: number;
  yearVestingTotal?: number;
};

type ESPP = {
  eligible?: boolean;
  discountPercent?: number;
  contributionPercent?: number;
  purchaseMonths?: Month[];
};

type Props = {
  value: PlanInput;
  onChange: (next: PlanInput) => void;
  onNext?: () => void;
  onBack?: () => void;
};

export default function Compensation({ value, onChange, onNext, onBack }: Props) {
  const v = value;
  const update = (patch: Partial<PlanInput>) => onChange({ ...v, ...patch });

  // Safe accessors for nested optional objects with defaults.
  const dc: DeferredComp = (v.deferredComp ?? {});
  const rsu: RSU = (v.rsu ?? {});
  const espp: ESPP = (v.espp ?? {});

  // Legacy mirrors to keep review/recommend logic happy.
  const setW2 = (n: number) => update({ salary: n });
  const setBonusAnnual = (n: number) => update({ bonus: n });
  const setRSUYear = (n: number) =>
    update({
      rsuVesting: n,
      rsu: { ...rsu, yearVestingTotal: n },
    });

  // Derived hints (purely UI)
  const bonusPlanAnnual = Number(v.bonus) || 0;
  const bonusYTD = Number((v as any).bonusYTD) || 0;
  const bonusRemaining = Math.max(0, bonusPlanAnnual - bonusYTD);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Compensation (Full-Year &amp; YTD)</h2>
      <p className="text-sm text-gray-600">
        Enter full-year expected amounts and what’s happened year-to-date. We’ll use this to generate
        mid-year actions (e.g., bonus planning).
      </p>

      {/* W-2 & Bonuses */}
      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">W-2 &amp; Cash Bonuses</h3>
        <Row label="W-2 Base salary (annual)" tip="Your base pay before bonuses.">
          <Num value={Number(v.salary) || 0} onChange={setW2} />
        </Row>
        <Row label="Cash bonuses (annual plan)" tip="Total expected cash bonuses this year (sign-on, performance, retention).">
          <Num value={bonusPlanAnnual} onChange={setBonusAnnual} />
        </Row>
        <Row label="Cash bonuses (YTD received)" tip="Cash bonuses already received this year.">
          <Num value={bonusYTD} onChange={(n) => update({ bonusYTD: n })} />
        </Row>
        <Hint>
          Planned: ${bonusPlanAnnual.toLocaleString()} · YTD: ${bonusYTD.toLocaleString()} · Remaining: ${bonusRemaining.toLocaleString()}
        </Hint>
      </div>

      {/* Deferred comp */}
      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">Deferred Compensation</h3>
        <Row
          label="Eligible?"
          tip="Plans that let you defer current income to a future payout (reduces current taxable income)."
        >
          <YesNo
            value={!!dc.eligible}
            onChange={(b) => update({ deferredComp: { ...dc, eligible: b } })}
          />
        </Row>

        {!!dc.eligible && (
          <>
            <Row label="Elected % of eligible pay">
              <Num
                value={Number(dc.electedPercent) || 0}
                onChange={(n) => update({ deferredComp: { ...dc, electedPercent: n } })}
              />
            </Row>
            <Row label="Company match % (if any)">
              <Num
                value={Number(dc.companyMatchPercent) || 0}
                onChange={(n) => update({ deferredComp: { ...dc, companyMatchPercent: n } })}
              />
            </Row>
            <Row label="Distribution style">
              <select
                className="w-full border rounded px-3 py-2"
                value={dc.distribution ?? ''}
                onChange={(e) =>
                  update({ deferredComp: { ...dc, distribution: (e.target.value || undefined) as DeferredDistribution } })
                }
              >
                <option value="">Select…</option>
                <option value="lump">Lump sum</option>
                <option value="schedule">Installments / schedule</option>
              </select>
            </Row>
            <Row label="First payout year (if known)">
              <Num
                value={Number(dc.firstPayoutYear) || 0}
                onChange={(n) => update({ deferredComp: { ...dc, firstPayoutYear: n || undefined } })}
              />
            </Row>
          </>
        )}
      </div>

      {/* Equity */}
      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">Equity — RSU &amp; ESPP</h3>

        {/* RSU */}
        <Row label="RSU eligible?" tip="RSU = Restricted Stock Units (taxed as they vest).">
          <YesNo
            value={!!rsu.eligible}
            onChange={(b) => update({ rsu: { ...rsu, eligible: b } })}
          />
        </Row>
        {!!rsu.eligible && (
          <>
            <Row label="Company ticker (optional)">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., AAPL"
                value={rsu.ticker ?? ''}
                onChange={(e) =>
                  update({ rsu: { ...rsu, ticker: e.target.value.toUpperCase() } })
                }
              />
            </Row>
            <Row label="RSU vesting (YTD $)">
              <Num
                value={Number(rsu.ytdVestedValue) || 0}
                onChange={(n) => update({ rsu: { ...rsu, ytdVestedValue: n } })}
              />
            </Row>
            <Row label="RSU vesting (expected total this year $)">
              <Num value={Number(rsu.yearVestingTotal) || 0} onChange={setRSUYear} />
            </Row>
          </>
        )}

        {/* ESPP */}
        <Row label="ESPP eligible?" tip="ESPP = Employee Stock Purchase Plan; buy company stock via payroll at a discount.">
          <YesNo
            value={!!espp.eligible}
            onChange={(b) => update({ espp: { ...espp, eligible: b } })}
          />
        </Row>
        {!!espp.eligible && (
          <>
            <Row label="Discount %">
              <Num
                value={Number(espp.discountPercent) || 0}
                onChange={(n) => update({ espp: { ...espp, discountPercent: n } })}
              />
            </Row>
            <Row label="Contribution % (payroll)">
              <Num
                value={Number(espp.contributionPercent) || 0}
                onChange={(n) => update({ espp: { ...espp, contributionPercent: n } })}
              />
            </Row>
            <Row label="Purchase months">
              <div className="flex flex-wrap gap-2">
                {MONTHS.map(({ label, value }) => {
                  const selected = Array.isArray(espp.purchaseMonths)
                    ? espp.purchaseMonths.includes(value)
                    : false;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`px-2 py-1 rounded border text-sm ${selected ? 'bg-black text-white' : ''}`}
                      onClick={() => {
                        const curr = new Set<Month>(Array.isArray(espp.purchaseMonths) ? espp.purchaseMonths : []);
                        if (curr.has(value)) curr.delete(value); else curr.add(value);
                        update({ espp: { ...espp, purchaseMonths: Array.from(curr) } });
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </Row>
          </>
        )}
      </div>

      {/* Other income */}
      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">Other Income</h3>
        <Row label="Self-employment (annual)">
          <Num value={Number(v.selfEmployment) || 0} onChange={(n) => update({ selfEmployment: n })} />
        </Row>
        <Row label="K-1 (active)">
          <Num value={Number(v.k1Active) || 0} onChange={(n) => update({ k1Active: n })} />
        </Row>
        <Row label="K-1 (passive)">
          <Num value={Number(v.k1Passive) || 0} onChange={(n) => update({ k1Passive: n })} />
        </Row>
        <Row label="Other income (interest/dividends, annual)">
          <Num value={Number(v.otherIncome) || 0} onChange={(n) => update({ otherIncome: n })} />
        </Row>
        <Row label="Rental NOI (annual)" tip="Net operating income from rentals (income minus operating expenses).">
          <Num value={Number(v.rentNOI) || 0} onChange={(n) => update({ rentNOI: n })} />
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

/* ---------- Small primitives ---------- */
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

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-600">{children}</p>;
}

function Num({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      className="w-full border rounded px-3 py-2"
      value={Number.isFinite(value) ? value : ''}
      onChange={(e) => {
        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
        onChange(Number.isNaN(val) ? 0 : val);
      }}
    />
  );
}

function YesNo({ value, onChange }: { value: boolean; onChange: (b: boolean) => void }) {
  return (
    <select
      className="w-full border rounded px-3 py-2"
      value={String(value)}
      onChange={(e) => onChange(e.target.value === 'true')}
    >
      <option value="false">No</option>
      <option value="true">Yes</option>
    </select>
  );
}