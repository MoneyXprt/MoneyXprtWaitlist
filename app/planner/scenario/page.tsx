// app/planner/scenario/page.tsx
"use client";

import { useMemo } from 'react';
import { usePlanner } from '@/lib/strategy/ui/plannerStore';
import { findConflicts, detectConflicts } from '@/lib/strategy/conflicts';
import { usePlannerSnapshot } from '@/lib/strategy/ui/plannerStore';
import Link from 'next/link';
import { fmtUSD } from '@/lib/ui/format';
import RiskBadge from '@/lib/ui/RiskBadge';
import SelectedList from '@/components/planner/SelectedList';
import { useRouter } from 'next/navigation';


export default function ScenarioPage() {
  const { state, dispatch } = usePlanner();
  const itemsById: Record<string, any> = useMemo(() => {
    const out: Record<string, any> = {};
    for (const it of state.lastRecoItems || []) out[(it as any).code || it.strategyId] = it;
    return out;
  }, [state.lastRecoItems]);

  const codes = state.selectedStrategies;
  const rows = codes.map((c) => itemsById[c]).filter(Boolean);
  const totals = rows.reduce(
    (acc, r) => ({ savings: acc.savings + (r?.savingsEst || 0), cash: acc.cash + (r?.cashOutlayEst || 0), risk: acc.risk + (r?.risk || 0) }),
    { savings: 0, cash: 0, risk: 0 }
  );
  const avgRisk = rows.length ? Math.round(totals.risk / rows.length) : 0;
  const conflicts = findConflicts(codes);
  const snapshot = usePlannerSnapshot();
  const conflictRes = detectConflicts(codes, rows as any, snapshot);
  const router = useRouter();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Scenario Builder</h1>
      {conflicts.length > 0 && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm space-y-1" aria-live="polite">
          <div className="font-medium">Potential conflicts</div>
          <ul className="list-disc pl-5">
            {conflicts.map((c, i) => (
              <li key={i}>{c.b ? `${c.a} ↔ ${c.b}` : c.a}: {c.reason}</li>
            ))}
          </ul>
        </div>
      )}
      {conflictRes.warnings.length > 0 && (
        <div className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm" aria-live="polite">
          <ul className="list-disc pl-5">
            {conflictRes.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      {conflictRes.invalid.length > 0 && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800 text-sm" aria-live="polite">
          The following selections are invalid for your inputs: {conflictRes.invalid.join(', ')}
        </div>
      )}
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-600">No strategies selected yet. Go to <Link href="/planner/recommendations" className="underline">Recommendations</Link> and add some.</p>
      ) : (
        <SelectedList
          items={rows as any}
          selected={codes}
          total={totals.savings}
          onMove={(i, dir) => {
            const to = Math.max(0, Math.min(rows.length - 1, i + dir));
            dispatch({ type: 'reorder', from: i, to });
          }}
          onRemove={(code) => dispatch({ type: 'deselect', code })}
          onContinue={() => router.push('/planner/playbook')}
          disabled={conflictRes.invalid.length > 0}
        />
      )}
    </div>
  );
}
