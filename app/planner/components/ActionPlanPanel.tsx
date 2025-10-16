// app/planner/components/ActionPlanPanel.tsx
"use client";
import * as React from 'react';
import type { ActionPlan, Action, CalcTrace } from '@/lib/plan';

export default function ActionPlanPanel({
  plan,
  onShowNarrative
}: {
  plan: ActionPlan;
  onShowNarrative?: () => void;
}) {
  if (!plan) return null;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Your Action Plan</h3>
        <div className="flex items-center gap-2">
          {onShowNarrative && (
            <button
              className="px-3 py-1.5 rounded border"
              onClick={onShowNarrative}
              title="Generate a readable narrative summary"
            >
              Narrative summary
            </button>
          )}
        </div>
      </div>

      {plan.flags && plan.flags.length > 0 && (
        <div className="mt-3 text-sm">
          {plan.flags.map((f, i) => (
            <span key={i} className="inline-block mr-2 mb-2 rounded-full border px-2 py-1 bg-white">
              ⚑ {f}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        {plan.checklists.map((list) => (
          <ChecklistSection
            key={list.title}
            title={list.title}
            actions={list.actions.map((id) => plan.actions[id]).filter(Boolean)}
            traces={plan.traces}
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-500">{plan.assumptionsNote}</p>
    </div>
  );
}

function ChecklistSection({
  title,
  actions,
  traces
}: {
  title: string;
  actions: Action[];
  traces: CalcTrace[];
}) {
  return (
    <div className="rounded border p-3">
      <h4 className="font-medium mb-2">{title}</h4>
      <ul className="space-y-2">
        {actions.map((a) => (
          <li key={a.id} className="border rounded p-2">
            <div className="flex items-start justify-between">
              <div className="pr-2">
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-gray-600">
                  {a.bucket} · Priority {a.priority} · Impact {a.impact} · Effort {a.effort}
                </div>
                {a.rationale && <div className="text-sm mt-1">{a.rationale}</div>}
                {a.estDollars && (
                  <div className="text-xs text-gray-700 mt-1">
                    {a.estDollars.annualTaxSavings ? (
                      <span className="mr-2">Tax savings (est): ${Math.round(a.estDollars.annualTaxSavings).toLocaleString()}</span>
                    ) : null}
                    {a.estDollars.annualCashFlowChange ? (
                      <span className="mr-2">Cash flow Δ (est): ${Math.round(a.estDollars.annualCashFlowChange).toLocaleString()}/yr</span>
                    ) : null}
                    {a.estDollars.oneTimeCostOrFunding ? (
                      <span>One-time funding: ${Math.round(a.estDollars.oneTimeCostOrFunding).toLocaleString()}</span>
                    ) : null}
                  </div>
                )}
                {a.links?.length ? (
                  <div className="text-xs mt-1">
                    {a.links.map((l, i) => (
                      <a key={i} className="underline mr-3" href={l.href}>
                        {l.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
              {/* Why this? */}
              <WhyThis traces={traces} calcRefs={a.calcRefs} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhyThis({ traces, calcRefs }: { traces?: CalcTrace[]; calcRefs?: string[] }) {
  const [open, setOpen] = React.useState(false);
  if (!calcRefs || !calcRefs.length) return null;
  const used = traces?.filter((t) => calcRefs.includes(t.id)) ?? [];
  if (!used.length) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs underline px-2 py-1 border rounded"
        title="Show calculation details"
      >
        Why this?
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded border bg-white p-2 shadow">
          <div className="text-xs text-gray-500 mb-1">Inputs & reasoning</div>
          {used.map((t) => (
            <div key={t.id} className="mb-2">
              <div className="font-medium text-sm">{t.label}</div>
              <pre className="text-xs bg-gray-50 rounded p-2 overflow-auto">
                {JSON.stringify(t.inputs, null, 2)}
                {t.result !== undefined ? `\n\nresult: ${String(t.result)}` : ''}
              </pre>
              {t.note && <div className="text-xs mt-1">{t.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
