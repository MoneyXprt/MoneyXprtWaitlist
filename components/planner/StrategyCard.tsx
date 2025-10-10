"use client";

import { fmtUSD } from '@/lib/ui/format';
import RiskBadge from '@/lib/ui/RiskBadge';

export type StrategyCardItem = {
  code?: string;
  strategyId?: string;
  name: string;
  category: string;
  savingsEst: number;
  cashOutlayEst?: number;
  risk: number;
  stepsPreview?: { label: string; due?: string }[];
  docs?: string[];
  states?: string[];
};

const BLURBS: Record<string, string> = {
  cost_seg_bonus: 'Accelerate depreciation with a cost segregation study and bonus rules.',
  qbi_199a: '20% deduction for qualified business income (subject to limits).',
  ptet_state: 'Entity-level state tax election to preserve SALT deduction.',
  ppli_wrapper: 'Insurance wrapper for tax deferral; high complexity & risk.',
};

export default function StrategyCard({ item, onAdd, onExplain }: { item: StrategyCardItem; onAdd: () => void; onExplain?: () => void }) {
  const code = (item as any).code || item.strategyId || '';
  const blurb = BLURBS[code] || 'Potentially valuable depending on eligibility and facts.';
  const steps = (item.stepsPreview || []).slice(0, 2);
  const docCount = Array.isArray((item as any).docs) ? (item as any).docs.length : 0;
  return (
    <article className="rounded border p-4 shadow-sm hover:shadow transition-shadow bg-white">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold leading-snug" title={/PTET|§199A/.test(item.name) ? 'Hover glossary: PTET = Pass-Through Entity Tax; §199A = Qualified Business Income deduction' : undefined}>{item.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
              {item.category}
            </span>
            {(item.states || []).map((s) => (
              <span key={s} className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 border border-emerald-200">
                {s}
              </span>
            ))}
          </div>
        </div>
        <RiskBadge score={item.risk} />
      </header>
      <div className="mt-3">
        <div className="text-sm text-neutral-600">Est. Savings</div>
        <div className="text-2xl font-bold">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800 text-sm mr-2">Est.</span>
          {fmtUSD(item.savingsEst)}
        </div>
        {typeof item.cashOutlayEst === 'number' && (
          <div className="text-xs text-neutral-500">Cash outlay {fmtUSD(item.cashOutlayEst)}</div>
        )}
        <p className="mt-2 text-sm text-neutral-700" title={/PTET|§199A/.test(blurb) ? 'PTET = Pass-Through Entity Tax; §199A = Qualified Business Income deduction' : undefined}>{blurb}</p>
      </div>
      {steps.length > 0 && (
        <ul className="mt-3 list-disc pl-5 text-sm text-neutral-700 space-y-1">
          {steps.map((s, i) => (
            <li key={i}>{s.label}</li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-neutral-500">
          {docCount > 0 && <span className="inline-flex items-center rounded bg-neutral-100 px-2 py-0.5">Docs ({docCount})</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-50"
            onClick={onExplain}
            aria-label={`Explain ${item.name}`}
          >
            Explain
          </button>
          <button
            className="rounded bg-emerald-700 text-white px-3 py-1.5 text-sm"
            onClick={onAdd}
            aria-label={`Add ${item.name} to scenario`}
          >
            Add to Scenario
          </button>
        </div>
      </div>
    </article>
  );
}
