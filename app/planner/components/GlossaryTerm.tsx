"use client";
// app/planner/components/GlossaryTerm.tsx
import * as React from 'react';

const DICT: Record<string, string> = {
  RSU: 'Restricted Stock Units – company stock that vests over time and is taxed when it vests.',
  ESPP: 'Employee Stock Purchase Plan – buy company stock via payroll at a discount.',
  NOI: 'Net Operating Income – rental income minus operating expenses (before mortgage).',
  HYSA: 'High-Yield Savings Account – FDIC/NCUA insured savings paying higher interest.',
  DAF: 'Donor-Advised Fund – contribute now (deductible), grant to charities later.',
};

export default function GlossaryTerm({ term }: { term: keyof typeof DICT }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span className="relative">
      <abbr
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="underline decoration-dotted cursor-help"
        title={DICT[term]}
      >
        {term}
      </abbr>
      {open && (
        <div className="absolute z-40 mt-1 w-72 rounded-md border bg-white p-2 shadow text-xs">
          {DICT[term]}
        </div>
      )}
    </span>
  );
}
