'use client';

import * as React from 'react';

/** ---------- Tiny primitives (no deps) ---------- */
function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className = '', ...rest } = props;
  return <div className={`rounded-xl border bg-white p-4 ${className}`} {...rest} />;
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium mb-1">{children}</label>;
}
function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-600 mt-1">{children}</p>;
}
function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className="w-full rounded-md border px-3 py-2"
      {...props}
    />
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs bg-white">{children}</span>;
}
function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span className="relative inline-block ml-2 align-middle">
      <button
        type="button"
        className="h-5 w-5 rounded-full border text-xs leading-none hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
        aria-label="Help"
      >
        ?
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-80 rounded border bg-white p-3 text-sm shadow-lg">
          {text}
          <div className="text-right mt-2">
            <button onClick={() => setOpen(false)} className="rounded border px-2 py-1 text-xs hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

/** ---------- Demo state (local only) ---------- */
type Step = 1|2|3|4|5|6|7;

export default function UiConcept() {
  const [step, setStep] = React.useState<Step>(1);
  const [salary, setSalary] = React.useState<number>(200000);
  const [bonus, setBonus] = React.useState<number>(50000);
  const [rsu, setRsu] = React.useState<number>(100000);
  const [rsuWH, setRsuWH] = React.useState<number>(22); // %
  const [marginal, setMarginal] = React.useState<number>(37); // %

  const gross = salary + bonus + rsu;
  const rsuTrue = rsu * (marginal/100);
  const rsuWithheld = rsu * (rsuWH/100);
  const rsuGap = Math.max(0, rsuTrue - rsuWithheld);

  const steps: { id: Step; title: string }[] = [
    { id:1, title:'Discovery' },
    { id:2, title:'Income' },
    { id:3, title:'Spending' },
    { id:4, title:'Investments' },
    { id:5, title:'Taxes' },
    { id:6, title:'Protection' },
    { id:7, title:'Review' },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <header className="mb-6">
        <div className="text-sm text-gray-600">Step {step} of 7</div>
        <h1 className="text-2xl font-semibold">Financial Planner</h1>
        <p className="text-sm text-gray-600 mt-1">We’ll ask only what’s needed—no sensitive identifiers.</p>
      </header>

      {/* 3-column layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: stepper */}
        <aside className="col-span-12 md:col-span-3">
          <Card className="p-3">
            <nav className="space-y-1">
              {steps.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm hover:bg-gray-50
                    ${step===s.id ? 'bg-gray-100 font-medium' : ''}`}
                >
                  {s.id}. {s.title}
                </button>
              ))}
            </nav>
          </Card>
        </aside>

        {/* Center: form card (example shows Step 2: Income) */}
        <main className="col-span-12 md:col-span-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">
              {step === 2 ? 'Income (W-2, bonus, equity)'
               : step === 3 ? 'Spending & Savings'
               : step === 7 ? 'Review & Finalize'
               : steps.find(x=>x.id===step)?.title}
            </h2>

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <Label>Base Salary (W-2)</Label>
                  <NumberInput value={salary} onChange={(e)=>setSalary(parseFloat(e.target.value||'0'))} />
                  <Hint>Annual base pay before taxes and deductions.</Hint>
                </div>

                <div>
                  <Label>Annual Cash Bonus</Label>
                  <NumberInput value={bonus} onChange={(e)=>setBonus(parseFloat(e.target.value||'0'))} />
                  <Hint>If variable, enter an average/expected value.</Hint>
                </div>

                <div>
                  <div className="flex items-center">
                    <Label>RSU Vesting (this year)</Label>
                    <Tooltip text="Estimated dollar value of RSUs vesting this year. Employers often withhold only 22%, which is below the top marginal rate—plan for a tax gap." />
                  </div>
                  <NumberInput value={rsu} onChange={(e)=>setRsu(parseFloat(e.target.value||'0'))} />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <Label>Employer RSU Withholding %</Label>
                      <NumberInput value={rsuWH} onChange={(e)=>setRsuWH(parseFloat(e.target.value||'0'))} />
                      <Hint>Common default is 22%.</Hint>
                    </div>
                    <div>
                      <Label>Your Marginal Tax Rate %</Label>
                      <NumberInput value={marginal} onChange={(e)=>setMarginal(parseFloat(e.target.value||'0'))} />
                      <Hint>Top bracket you expect this year (e.g., 35–37%).</Hint>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <Badge>Gross income {formatMoney(gross)}/yr</Badge>
                  <Badge>RSU withheld ~{formatMoney(rsuWithheld)}</Badge>
                  <Badge>RSU true tax ~{formatMoney(rsuTrue)}</Badge>
                  {rsuGap > 0 && <Badge>Set aside extra ~{formatMoney(rsuGap)}</Badge>}
                </div>
              </div>
            )}

            {step !== 2 && (
              <div className="text-sm text-gray-600">
                This middle column is the **focused form** for the current step. Keep it to 3–6
                inputs with clear help. The right column explains why each field matters and gives a small
                preview of likely recommendations.
              </div>
            )}
          </Card>
        </main>

        {/* Right: coach/explain/what-if */}
        <aside className="col-span-12 md:col-span-3">
          <Card>
            <h3 className="font-semibold">Why we ask</h3>
            {step === 2 ? (
              <>
                <p className="text-sm text-gray-700 mt-2">
                  Income inputs help us estimate cash flow and tax-sensitive strategies. RSUs
                  often under-withhold taxes—if you’re in a higher bracket, we’ll remind you to earmark cash so
                  April isn’t painful.
                </p>
                <ul className="text-sm list-disc ml-5 mt-3 space-y-1">
                  <li>W-2 base + bonus = your stable cash flow.</li>
                  <li>RSU vesting adds taxable income that may be under-withheld.</li>
                  <li>We’ll compute a likely RSU tax gap to set aside now.</li>
                </ul>
                <div className="mt-4 text-sm">
                  <h4 className="font-medium mb-1">Likely actions</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Automate savings to 20–30% of gross.</li>
                    {rsuGap>0 && <li>Hold back ~{formatMoney(rsuGap)} for RSU taxes.</li>}
                    <li>Max 401(k)/HSA; check backdoor/mega-backdoor eligibility.</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-700 mt-2">
                This panel adapts per step with plain-English explanations, examples, and a mini
                preview of likely actions. It’s your “coach” while you fill the form.
              </p>
            )}
          </Card>
        </aside>
      </div>

      {/* Sticky footer actions */}
      <div className="sticky bottom-0 mt-8 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            {step===7 ? 'Ready to generate your plan.' : 'Progress is saved automatically.'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep((s)=> (s>1 ? ((s-1) as Step) : s))}
              className="rounded border px-4 py-2 hover:bg-gray-50"
            >
              Back
            </button>
            {step<7 ? (
              <button
                onClick={() => setStep((s)=> (s<7 ? ((s+1) as Step) : s))}
                className="rounded bg-black text-white px-4 py-2 hover:opacity-90"
              >
                Continue
              </button>
            ) : (
              <button className="rounded bg-black text-white px-4 py-2 hover:opacity-90">
                Generate Final Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMoney(n:number) {
  return n.toLocaleString('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 });
}