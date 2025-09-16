// app/planner/steps/Compensation.tsx
'use client';

import * as React from 'react';
import type { PlanInput } from '@/lib/types';

type Props = {
  value: PlanInput;
  onChange: (next: PlanInput) => void;
  onNext?: () => void;
  onBack?: () => void;
};

/** Local fallback types so this file compiles even if lib/types.ts
 *  doesn't yet define these. You can move them to lib/types later. */
type Month = 1|2|3|4|5|6|7|8|9|10|11|12;
type DeferredDistribution = 'lump' | 'schedule';

// Numeric month values with human labels
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

  // Safe accessors for nested optional objects with defaults.
  const dc = (v as any).deferredComp ?? {};
  const rsu = (v as any).rsu ?? {};
  const espp = (v as any).espp ?? {};

  // Keep legacy mirrors in sync for existing review/recommend usage.
  // We ONLY mirror to fields that are known to exist on PlanInput today.
  const setW2 = (n: number) => update({ salary: n });
  const setBonusAnnual = (n: number) => update({ bonus: n });
  const setRSUYear = (n: number) =>
    update({ rsuVesting: n, ...( { rsu: { ...rsu, yearVestingTotal: n } } as any ) });

  // Convenience helpers for YTD → remaining
  const bonusYTD = Number((v as any).bonusYTD) || 0;
  const bonusPlanAnnual = Number(v.bonus) || 0;
  const bonusRemaining = Math.max(0, bonusPlanAnnual - bonusYTD);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Compensation (Full-Year & YTD)</h2>
      <p className="text-sm text-gray-600">
        Enter full-year expected amounts and what’s happened year-to-date. We’ll use this to generate
        mid-year actions (e.g., bonus planning).
      </p>

      {/* W-2 & Bonuses */}
      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">W-2 & Cash Bonuses</h3>
        <Row label="W-2 Base salary (annual)" help={<>
          Your guaranteed pay before bonuses. If you changed jobs mid-year, enter the total you expect
          for this calendar year across all W‑2s.
        </>}>
          <Num value={Number(v.salary) || 0} onChange={setW2} />
        </Row>
        <Row label="Cash bonuses (annual plan)" help={<>
          Total cash bonuses you expect <em>this year</em> (performance/retention/sign‑on). If unsure,
          use your target bonus (e.g., 20% of base) or your offer letter.
        </>}>
          <Num value={Number(v.bonus) || 0} onChange={setBonusAnnual} />
        </Row>
        <Row label="Cash bonuses (YTD received)" help={<>
          Sum of bonus cash you’ve already been paid this year. We use this to estimate remaining
          supplemental‑wage withholding and mid‑year moves.
        </>}>
          <div className="flex gap-2 items-center">
            <Num value={bonusYTD} onChange={(n) => update({ ...( { bonusYTD: n } as any ) })} />
            <small className="text-gray-600">Remaining est.: <strong>${bonusRemaining.toLocaleString()}</strong></small>
          </div>
        </Row>
      </div>

      {/* Deferred comp */}
      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">Deferred Compensation</h3>
        <Row
          label="Eligible?"
          help={<>
            Some plans let you defer current income to a future year (often at retirement), reducing
            current taxable income. Ask HR/benefits for your plan’s SPD (Summary Plan Description).
          </>}
        >
          <YesNo
            value={!!dc.eligible}
            onChange={(b) => update({ ...( { deferredComp: { ...dc, eligible: b } } as any ) })}
          />
        </Row>

        {dc.eligible && (
          <>
            <Row label="Elected % of eligible pay" help={<>
              Percent of eligible comp you chose to defer this year (e.g., 10). Enter 0–100.
            </>}>
              <NumPercent value={Number(dc.electedPercent) || 0}
                onChange={(n) => update({ ...( { deferredComp: { ...dc, electedPercent: clampPct(n) } } as any ) })}
              />
            </Row>
            <Row label="Company match % (if any)">
              <NumPercent value={Number(dc.companyMatchPercent) || 0}
                onChange={(n) => update({ ...( { deferredComp: { ...dc, companyMatchPercent: clampPct(n) } } as any ) })}
              />
            </Row>
            <Row label="Distribution style" help={<>
              How you’ll receive payouts later: a single lump sum or installments over multiple years.
              This generally must be elected in advance.
            </>}>
              <select
                className="w-full border rounded px-3 py-2"
                value={dc.distribution ?? ''}
                onChange={(e) =>
                  update({ ...( { deferredComp: { ...dc, distribution: (e.target.value || undefined) as DeferredDistribution } } as any ) })
                }
              >
                <option value="">Select…</option>
                <option value="lump">Lump sum</option>
                <option value="schedule">Installments / schedule</option>
              </select>
            </Row>
            <Row label="First payout year (if known)">
              <Num value={Number(dc.firstPayoutYear) || 0}
                onChange={(n) => update({ ...( { deferredComp: { ...dc, firstPayoutYear: n || undefined } } as any ) })}
              />
            </Row>
          </>
        )}
      </div>

      {/* Equity */}
      <div className="rounded border p-4 space-y-3">
        <h3 className="font-medium">Equity — RSU & ESPP</h3>

        {/* RSU */}
        <Row label="RSU eligible?" help={<>
          <strong>RSU</strong> = Restricted Stock Units. They’re taxed as ordinary income when they vest.
          Many employers withhold ~22% by default; high earners often owe more. We’ll estimate any shortfall.
        </>}>
          <YesNo
            value={!!rsu.eligible}
            onChange={(b) => update({ ...( { rsu: { ...rsu, eligible: b } } as any ) })}
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
                  update({ ...( { rsu: { ...rsu, ticker: e.target.value.toUpperCase() } } as any ) })}
                }
              />
            </Row>
            <Row label="RSU vesting (YTD $)">
              <Num
                value={Number(rsu.ytdVestedValue) || 0}
                onChange={(n) => update({ ...( { rsu: { ...rsu, ytdVestedValue: n } } as any ) })}
              />
            </Row>
            <Row label="RSU vesting (expected total this year $)">
              <Num value={Number(rsu.yearVestingTotal) || 0} onChange={setRSUYear} />
            </Row>
          </>
        )}

        {/* ESPP */}
        <Row label="ESPP eligible?" help={<>
          <strong>ESPP</strong> = Employee Stock Purchase Plan. Buy company stock via payroll at a discount
          (often 10–15%). Many plans have two purchase dates per year.
        </>}>
          <YesNo
            value={!!espp.eligible}
            onChange={(b) => update({ ...( { espp: { ...espp, eligible: b } } as any ) })}
          />
        </Row>
        {!!espp.eligible && (
          <>
            <Row label="Discount %">
              <NumPercent
                value={Number(espp.discountPercent) || 0}
                onChange={(n) => update({ ...( { espp: { ...espp, discountPercent: clampPct(n) } } as any ) })}
              />
            </Row>
            <Row label="Contribution % (payroll)">
              <NumPercent
                value={Number(espp.contributionPercent) || 0}
                onChange={(n) => update({ ...( { espp: { ...espp, contributionPercent: clampPct(n) } } as any ) })}
              />
            </Row>
            <Row label="Purchase months">
              <div className="flex flex-wrap gap-2">
                {MONTHS.map(({ label, value }) => {
                  const selected = Array.isArray(espp.purchaseMonths)
                    ? (espp.purchaseMonths as Month[]).includes(value)
                    : false;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={`px-2 py-1 rounded border text-sm ${selected ? 'bg-black text-white' : ''}`}
                      onClick={() => {
                        const curr = new Set<Month>(Array.isArray(espp.purchaseMonths) ? espp.purchaseMonths : []);
                        if (curr.has(value)) curr.delete(value); else curr.add(value);
                        update({ ...( { espp: { ...espp, purchaseMonths: Array.from(curr) as Month[] } } as any ) });
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
        <Row label="Self‑employment (annual)" help="Net income after expenses from 1099 or Schedule C.">
          <Num value={Number(v.selfEmployment) || 0} onChange={(n) => update({ selfEmployment: n })} />
        </Row>
        <Row label="K‑1 (active)" help="K‑1 income from businesses where you materially participate.">
          <Num value={Number(v.k1Active) || 0} onChange={(n) => update({ k1Active: n })} />
        </Row>
        <Row label="K‑1 (passive)" help="K‑1 income/loss where you are a passive investor.">
          <Num value={Number(v.k1Passive) || 0} onChange={(n) => update({ k1Passive: n })} />
        </Row>
        <Row label="Other income (interest/dividends, annual)">
          <Num value={Number(v.otherIncome) || 0} onChange={(n) => update({ otherIncome: n })} />
        </Row>
        <Row label="Rental NOI (annual)" help="Net operating income from rentals (income minus operating expenses).">
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
function Row({ label, help, children }: { label: string; help?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="flex items-start justify-between gap-3 mb-1">
        <span className="block font-medium">{label}</span>
        {help ? <HelpBubble>{help}</HelpBubble> : null}
      </div>
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

function NumPercent({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={100}
        className="w-full border rounded px-3 py-2"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
      />
      <span className="text-gray-600">%</span>
    </div>
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

function HelpBubble({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative select-none">
      <button
        type="button"
        aria-label="Help"
        className="h-6 w-6 rounded-full border text-xs leading-6 text-center"
        onClick={() => setOpen((o) => !o)}
      >
        i
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded border bg-white p-3 text-xs shadow">
          <div className="whitespace-pre-wrap text-gray-700">{children}</div>
          <div className="mt-2 text-right">
            <button type="button" className="text-gray-600 underline" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function clampPct(n: number) { return Math.max(0, Math.min(100, isFinite(n) ? n : 0)); }