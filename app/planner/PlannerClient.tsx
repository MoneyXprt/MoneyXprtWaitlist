'use client';

import { useMemo, useState, ReactNode } from 'react';

type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head';
const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT',
  'NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV','WY'
];

type PlannerInput = {
  // 1) Profile
  firstName: string;
  filingStatus: FilingStatus;
  state: string;
  dependents: number;
  age: number;
  spouseAge?: number;
  hdhpEligible: boolean;

  // 2) Income (annual, pre-tax unless noted)
  w2Income: number;
  bonusIncome: number;
  rsuVestedValue: number;
  isoExerciseBargain: number;
  selfEmploymentNet: number;
  k1Active: number;
  k1Passive: number;
  capGainsShort: number;
  capGainsLong: number;
  qualifiedDividends: number;
  ordinaryDividends: number;
  cryptoGains: number;
  interestIncome: number;
  otherIncome: number;
  rentalUnits: number;
  rentalNOI: number;
  niitSubject: boolean;

  // 3) Pretax deductions / savings
  employee401k: number;
  employer401k: number;
  hsaContrib: number;
  fsaContrib: number;
  solo401kSEP: number;
  contrib529: number;

  // 4) Itemized deductions (federal)
  mortgageInterest: number;
  propertyTax: number;
  stateIncomeTaxPaid: number;
  charityCash: number;
  charityNonCash: number;
  medicalExpenses: number;

  // 5) Goals / constraints (for recs)
  targetEffRate: number;
  retireAge: number;
  liquidityNeed12mo: number;
};

const empty: PlannerInput = {
  firstName: '',
  filingStatus: 'single',
  state: 'CA',
  dependents: 0,
  age: 40,
  spouseAge: undefined,
  hdhpEligible: false,

  w2Income: 0,
  bonusIncome: 0,
  rsuVestedValue: 0,
  isoExerciseBargain: 0,
  selfEmploymentNet: 0,
  k1Active: 0,
  k1Passive: 0,
  capGainsShort: 0,
  capGainsLong: 0,
  qualifiedDividends: 0,
  ordinaryDividends: 0,
  cryptoGains: 0,
  interestIncome: 0,
  otherIncome: 0,
  rentalUnits: 0,
  rentalNOI: 0,
  niitSubject: true,

  employee401k: 0,
  employer401k: 0,
  hsaContrib: 0,
  fsaContrib: 0,
  solo401kSEP: 0,
  contrib529: 0,

  mortgageInterest: 0,
  propertyTax: 0,
  stateIncomeTaxPaid: 0,
  charityCash: 0,
  charityNonCash: 0,
  medicalExpenses: 0,

  targetEffRate: 28,
  retireAge: 55,
  liquidityNeed12mo: 0,
};

/** ---------- UI Primitives ---------- **/

function HelpTip({
  title,
  children,
  side = 'right',
}: {
  title: string;
  children: ReactNode;
  side?: 'right' | 'left';
}): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        aria-label={`Help: ${title}`}
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs leading-none hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        ?
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={title}
          className={`absolute z-30 mt-2 w-80 rounded border bg-white p-3 text-sm shadow-lg ${
            side === 'right' ? 'left-6' : 'right-6'
          }`}
        >
          <div className="mb-1 font-medium">{title}</div>
          <div className="text-gray-700">{children}</div>
          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

function SectionTitle({
  children,
  help,
}: {
  children: ReactNode;
  help?: ReactNode;
}) {
  return (
    <h2 className="text-xl font-medium mb-3 flex items-center">
      <span>{children}</span>
      {help && <HelpTip title={`${children}`}>{help}</HelpTip>}
    </h2>
  );
}

function FieldHint({ children }: { children: ReactNode }) {
  return <div className="mt-1 text-xs text-gray-500">{children}</div>;
}

function Num({
  label,
  value,
  onChange,
  step = 1,
  suffix = '$',
  help,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  suffix?: string;
  help?: ReactNode;
}) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium mb-1">
        {label}
        {help && <HelpTip title={label}>{help}</HelpTip>}
      </span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
        className="w-full border rounded px-3 py-2"
        placeholder={suffix}
      />
    </label>
  );
}

function Txt({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  help?: ReactNode;
}) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium mb-1">
        {label}
        {help && <HelpTip title={label}>{help}</HelpTip>}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
    </label>
  );
}

/** ---------- Planner Client ---------- **/

export default function PlannerClient() {
  const [data, setData] = useState<PlannerInput>(empty);
  const [recs, setRecs] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const set = <K extends keyof PlannerInput>(key: K, val: PlannerInput[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const showSpouseAge = useMemo(
    () =>
      data.filingStatus === 'married_joint' ||
      data.filingStatus === 'married_separate',
    [data.filingStatus]
  );

  // ── 3.1: Sticky-section helpers (for a section nav we’ll add next) ─────────
  const sectionList = [
    { id: 'profile',  label: 'Profile' },
    { id: 'income',   label: 'Income' },
    { id: 'pretax',   label: 'Pretax' },
    { id: 'itemized', label: 'Itemized' },
    { id: 'goals',    label: 'Goals' },
  ];

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
  // ─────────────────────────────────────────────────────────────────────────────

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecs(null);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Request failed: ${res.status}`);
      }
      const json = await res.json();
      setRecs(Array.isArray(json.recommendations) ? json.recommendations : []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to get recommendations.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Financial Planner</h1>
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-2">
          {sectionList.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(s.id)}
              className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* 1) Profile */}
        <section id="profile" className="scroll-mt-24">
          <SectionTitle
            help={
              <>
                This tells us who we’re planning for and how you file taxes.
                Your filing status and state drive many thresholds (brackets,
                credits, SALT limits, etc.).
              </>
            }
          >
            1) Profile
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-4">
            <Txt
              label="First name"
              value={data.firstName}
              onChange={(v) => set('firstName', v)}
              help="Used to personalize recommendations."
            />

            <label className="block">
              <span className="block text-sm font-medium mb-1">
                Filing status
                <HelpTip title="Filing status">
                  Your IRS filing status (single, married filing jointly,
                  married filing separately, head of household). This affects
                  brackets, deductions, credits, and phase-outs.
                </HelpTip>
              </span>
              <select
                className="w-full border rounded px-3 py-2"
                value={data.filingStatus}
                onChange={(e) =>
                  set('filingStatus', e.target.value as FilingStatus)
                }
              >
                <option value="single">Single</option>
                <option value="married_joint">Married filing jointly</option>
                <option value="married_separate">Married filing separately</option>
                <option value="head">Head of household</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-sm font-medium mb-1">
                State
                <HelpTip title="State">
                  Your resident state for tax purposes. States differ on
                  income tax rates, deductions, and 529 plan rules.
                </HelpTip>
              </span>
              <select
                className="w-full border rounded px-3 py-2"
                value={data.state}
                onChange={(e) => set('state', e.target.value)}
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <Num
              label="Your age"
              value={data.age}
              onChange={(n) => set('age', n)}
              help="Age gates catch-up contributions for retirement plans and Medicare timing."
            />

            {showSpouseAge && (
              <Num
                label="Spouse age"
                value={data.spouseAge ?? 0}
                onChange={(n) => set('spouseAge', n)}
                help="If you file as married, spouse age helps with retirement and HSA planning."
              />
            )}

            <Num
              label="Dependents (#)"
              value={data.dependents}
              onChange={(n) => set('dependents', n)}
              help="People you can claim, which can influence credits and tax strategy."
            />

            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={data.hdhpEligible}
                onChange={(e) => set('hdhpEligible', e.target.checked)}
              />
              <span>HDHP / HSA Eligible</span>
              <HelpTip title="HDHP / HSA">
                If your health plan qualifies as a High-Deductible Health Plan,
                you may contribute to a Health Savings Account (HSA), which is
                triple tax-advantaged.
              </HelpTip>
            </label>
          </div>
        </section>

        {/* 2) Income */}
        <section id="income" className="scroll-mt-24">
          <SectionTitle
            help={
              <>
                Enter income you expect this year. Ballpark is fine — the tool
                will suggest strategies (withholding, deductions, timing) to
                hit your goals.
              </>
            }
          >
            2) Income
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-4">
            <Num label="W-2 income ($)" value={data.w2Income} onChange={(n) => set('w2Income', n)} step={1000}
              help="Your salary/wages reported on a W-2 from your employer."/>
            <Num label="Bonus ($)" value={data.bonusIncome} onChange={(n) => set('bonusIncome', n)} step={1000}
              help="Expected cash bonuses for the year."/>
            <Num label="RSU vesting value ($)" value={data.rsuVestedValue} onChange={(n) => set('rsuVestedValue', n)} step={1000}
              help="Value of stock units vesting this year; employers typically withhold taxes but gaps are common."/>
            <Num label="ISO bargain element ($)" value={data.isoExerciseBargain} onChange={(n) => set('isoExerciseBargain', n)} step={1000}
              help="For incentive stock options: spread at exercise; can trigger AMT."/>
            <Num label="Self-employment net profit ($)" value={data.selfEmploymentNet} onChange={(n) => set('selfEmploymentNet', n)} step={1000}
              help="Schedule C profit after expenses; drives SE tax and retirement plan options (Solo-401k/SEP)."/>
            <Num label="K-1 ordinary (active) ($)" value={data.k1Active} onChange={(n) => set('k1Active', n)} step={1000}
              help="Active partnership/S-corp pass-through income reported on a K-1."/>
            <Num label="K-1 ordinary (passive) ($)" value={data.k1Passive} onChange={(n) => set('k1Passive', n)} step={1000}
              help="Passive K-1 income (e.g., rentals/limited partnerships)."/>
            <Num label="Short-term cap gains ($)" value={data.capGainsShort} onChange={(n) => set('capGainsShort', n)} step={1000}
              help="Net short-term trading gains (taxed like ordinary income)."/>
            <Num label="Long-term cap gains ($)" value={data.capGainsLong} onChange={(n) => set('capGainsLong', n)} step={1000}
              help="Net long-term gains (preferential capital gains rates)."/>
            <Num label="Qualified dividends ($)" value={data.qualifiedDividends} onChange={(n) => set('qualifiedDividends', n)} step={1000}
              help="Dividends that get capital-gains-like treatment if holding period met."/>
            <Num label="Ordinary dividends ($)" value={data.ordinaryDividends} onChange={(n) => set('ordinaryDividends', n)} step={1000}
              help="Dividends taxed as ordinary income (not qualified)."/>
            <Num label="Interest income ($)" value={data.interestIncome} onChange={(n) => set('interestIncome', n)} step={1000}
              help="Bank/CD/bond interest (taxed as ordinary income)."/>
            <Num label="Crypto gains ($)" value={data.cryptoGains} onChange={(n) => set('cryptoGains', n)} step={1000}
              help="Taxable crypto disposals or staking income."/>
            <Num label="Other income ($)" value={data.otherIncome} onChange={(n) => set('otherIncome', n)} step={1000}
              help="Anything material not listed above (e.g., royalties)."/>
            <Num label="Rental units (#)" value={data.rentalUnits} onChange={(n) => set('rentalUnits', n)}
              help="Count of rental doors/units owned."/>
            <Num label="Rental NOI (all units) ($)" value={data.rentalNOI} onChange={(n) => set('rentalNOI', n)} step={1000}
              help="Annual net operating income across rentals (rents minus expenses, before depreciation)."/>
          </div>

          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={data.niitSubject}
              onChange={(e) => set('niitSubject', e.target.checked)}
            />
            <span>Investment income likely subject to NIIT (3.8%)</span>
            <HelpTip title="NIIT (3.8%)">
              High-income households may owe the Net Investment Income Tax on
              investment income (gains/dividends/interest/rental). We’ll
              factor that in if this is checked.
            </HelpTip>
          </label>
        </section>

        {/* 3) Pretax deductions / savings */}
        <section id="pretax" className="scroll-mt-24">
          <SectionTitle
            help={
              <>
                These reduce taxable income before it’s calculated. We’ll
                check for contribution limits, catch-ups (50+), and HSA
                eligibility based on your profile.
              </>
            }
          >
            3) Pretax Deductions / Savings
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Num
                label="Employee 401(k) deferral ($)"
                value={data.employee401k}
                onChange={(n) => set('employee401k', n)}
                step={500}
                help="What you choose to defer from paychecks into your 401(k). Plans often allow Roth or pre-tax."
              />
              <FieldHint>
                Typical annual limit exists and can have a catch-up if age 50+ (varies by year).
              </FieldHint>
            </div>

            <Num
              label="Employer 401(k) match/profit share ($)"
              value={data.employer401k}
              onChange={(n) => set('employer401k', n)}
              step={500}
              help="Company match and/or profit sharing. Not your deferral, but helps total retirement savings."
            />

            <div>
              <Num
                label="HSA contribution ($)"
                value={data.hsaContrib}
                onChange={(n) => set('hsaContrib', n)}
                step={500}
                help="Available only if you have an HSA-eligible HDHP. Contributions are triple tax-advantaged."
              />
              {!data.hdhpEligible && (
                <FieldHint>Only available if HDHP/HSA-eligible is checked.</FieldHint>
              )}
            </div>

            <Num
              label="Health FSA ($)"
              value={data.fsaContrib}
              onChange={(n) => set('fsaContrib', n)}
              step={250}
              help="Use-it-or-lose-it medical FSA through your employer. Not the same as an HSA."
            />

            <Num
              label="Solo-401k / SEP ($)"
              value={data.solo401kSEP}
              onChange={(n) => set('solo401kSEP', n)}
              step={500}
              help="For self-employment income. Contribution space is tied to net profit and plan type."
            />

            <Num
              label="529 contribution ($)"
              value={data.contrib529}
              onChange={(n) => set('contrib529', n)}
              step={500}
              help="Education savings. Federal tax-free growth; some states offer tax deductions/credits."
            />
          </div>
        </section>

        {/* 4) Itemized deductions */}
        <section id="itemized" className="scroll-mt-24">
          <SectionTitle
            help={
              <>
                If itemized deductions exceed the standard deduction, you
                benefit from itemizing. SALT (state + local tax) deductions
                face a federal cap; we’ll compare scenarios for you.
              </>
            }
          >
            4) Itemized Deductions
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-4">
            <Num
              label="Mortgage interest ($)"
              value={data.mortgageInterest}
              onChange={(n) => set('mortgageInterest', n)}
              step={500}
              help="Interest paid on qualified home loans. Subject to mortgage balance limits."
            />
            <div>
              <Num
                label="Property tax ($)"
                value={data.propertyTax}
                onChange={(n) => set('propertyTax', n)}
                step={500}
                help="Real estate taxes paid."
              />
              <FieldHint>SALT (state + local) deductions face a federal cap when itemizing.</FieldHint>
            </div>
            <Num
              label="State income tax paid ($)"
              value={data.stateIncomeTaxPaid}
              onChange={(n) => set('stateIncomeTaxPaid', n)}
              step={500}
              help="Withholding and estimated payments to your state/local income tax."
            />
            <Num
              label="Charitable cash ($)"
              value={data.charityCash}
              onChange={(n) => set('charityCash', n)}
              step={500}
              help="Cash gifts to qualified charities. Bunching can improve value in some years."
            />
            <Num
              label="Charitable non-cash ($)"
              value={data.charityNonCash}
              onChange={(n) => set('charityNonCash', n)}
              step={500}
              help="Donations of appreciated securities or property can avoid capital gains."
            />
            <Num
              label="Medical (unreimbursed) ($)"
              value={data.medicalExpenses}
              onChange={(n) => set('medicalExpenses', n)}
              step={500}
              help="Out-of-pocket medical expenses; only the amount above an AGI % floor is deductible."
            />
          </div>
        </section>

        {/* 5) Goals */}
        <section id="goals" className="scroll-mt-24">
          <SectionTitle
            help={
              <>
                These preferences guide trade-offs. For example, if you want a
                lower effective rate, we’ll look harder at deferrals and timing;
                liquidity needs push us toward cash-friendly options.
              </>
            }
          >
            5) Goals & Constraints
          </SectionTitle>

          <div className="grid md:grid-cols-3 gap-4">
            <Num
              label="Target effective tax rate (%)"
              value={data.targetEffRate}
              onChange={(n) => set('targetEffRate', n)}
              step={0.5}
              suffix="%"
              help="Your end-of-year target: total tax ÷ total income."
            />
            <Num
              label="Retirement age"
              value={data.retireAge}
              onChange={(n) => set('retireAge', n)}
              help="Used to frame savings horizon and Roth vs. pre-tax trade-offs."
            />
            <Num
              label="Liquidity needed next 12 months ($)"
              value={data.liquidityNeed12mo}
              onChange={(n) => set('liquidityNeed12mo', n)}
              step={1000}
              help="Cash you’ll need soon (house down payment, education, large purchases)."
            />
          </div>
        </section>

        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 rounded bg-black text-white hover:opacity-90 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Generating…' : 'Continue to Recommendations'}
        </button>
      </form>

      {/* Errors */}
      {error && (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}

      {/* Recommendations */}
      {recs && (
        <div className="mt-6 rounded border p-4">
          <h3 className="font-semibold mb-2">Personalized Recommendations</h3>
          {recs.length === 0 ? (
            <p>No recommendations returned.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {recs.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}

          {/* Debug toggle */}
          <div className="mt-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={showDebug}
                onChange={(e) => setShowDebug(e.target.checked)}
              />
              <span className="text-sm">Show inputs (debug)</span>
            </label>
          </div>

          {showDebug && (
            <textarea
              className="mt-3 w-full h-64 border rounded p-3 font-mono text-sm"
              value={JSON.stringify(data, null, 2)}
              readOnly
            />
          )}
        </div>
      )}
    </div>
  );
}