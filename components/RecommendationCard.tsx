// components/RecommendationCard.tsx
"use client";
import React from "react";
import { Badge } from "./Badge";
import { usePlannerStore } from "@/lib/store/planner";
import { pickGlossary } from "@/lib/strategy/glossary";

type Item = {
  code: string;
  name: string;
  savingsEst: number;
  risk?: number;
  states?: string[];
  category?: string;
  notes?: string[];
};

export default function RecommendationCard({ item, onAdd }: { item: Item; onAdd?: () => void }) {
  const add = usePlannerStore((s) => s.add);
  const glossary = pickGlossary(item.code);
  const riskLabel = item.risk && item.risk >= 3 ? "High" : item.risk === 2 ? "Medium" : "Low";
  const plainTitle = glossary?.term || item.name;
  const plainSubtitle = glossary?.plain || "Potential tax savings if applied to your situation.";

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">
            <span title={glossary?.plain}>{plainTitle}</span>
          </h3>
          <p className="text-sm text-gray-600">{plainSubtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">
            Est. ${item.savingsEst?.toLocaleString()}
          </div>
          <div className="mt-1 flex gap-1 justify-end">
            {item.states?.map((s) => (
              <Badge key={s} title={`State specific: ${s}`}>{s}</Badge>
            ))}
            <Badge title="Relative risk (1 low – 3 high)">{riskLabel}</Badge>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <ExplainButton item={item} />
        <button
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          onClick={() => {
            if (onAdd) return onAdd();
            add({
              code: item.code,
              name: plainTitle,
              savingsEst: item.savingsEst,
              states: item.states,
              risk: item.risk,
            });
          }}
        >
          Add to Scenario
        </button>
      </div>
    </div>
  );
}

function ExplainButton({ item }: { item: Item }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        className="rounded-md bg-black text-white px-3 py-1.5 text-sm hover:bg-black/90"
        onClick={() => setOpen(true)}
      >
        Explain
      </button>
      {open && (
        <React.Suspense fallback={null}>
          {/* dynamic import keeps bundle small */}
          <DynamicExplain open={open} onClose={() => setOpen(false)} item={item} />
        </React.Suspense>
      )}
    </>
  );
}

function DynamicExplain({ open, onClose, item }: any) {
  const ExplainDrawer = React.useMemo(() => require("./ExplainDrawer").default, []);
  return (
    <ExplainDrawer
      open={open}
      onClose={onClose}
      payload={{
        code: item.code,
        name: item.name,
        savingsEst: item.savingsEst,
        states: item.states,
      }}
    />
  );
}
