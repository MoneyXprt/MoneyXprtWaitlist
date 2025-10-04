"use client";

import { fmtUSD } from '@/lib/ui/format';
import RiskBadge from '@/lib/ui/RiskBadge';

export type SelectedItem = {
  code?: string;
  strategyId?: string;
  name: string;
  savingsEst: number;
  risk?: number;
};

export default function SelectedList({
  items,
  selected,
  onMove,
  onRemove,
  total,
  onContinue,
  disabled,
}: {
  items: SelectedItem[];
  selected: string[];
  onMove: (index: number, dir: -1 | 1) => void;
  onRemove: (code: string) => void;
  total: number;
  onContinue: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded border p-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Selected ({selected.length})</div>
        <div>
          Total Savings: <span className="font-semibold">{fmtUSD(total)}</span>
        </div>
      </div>
      {selected.length === 0 ? (
        <p className="text-neutral-600">No strategies selected.</p>
      ) : (
        <ul className="divide-y">
          {items.map((it, idx) => {
            const key = (it as any).code || (it as any).strategyId || String(idx);
            return (
              <li key={key} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{it.name}</div>
                  <div className="text-xs text-neutral-600">{fmtUSD(it.savingsEst)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge score={it.risk ?? 0} />
                  <button className="px-2 py-0.5 border rounded" aria-label="Move up" onClick={() => onMove(idx, -1)}>
                    ↑
                  </button>
                  <button className="px-2 py-0.5 border rounded" aria-label="Move down" onClick={() => onMove(idx, 1)}>
                    ↓
                  </button>
                  <button
                    className="px-2 py-0.5 border rounded text-red-700"
                    aria-label="Remove"
                    onClick={() => onRemove(key)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-3">
        <button
          className="rounded bg-emerald-700 text-white px-3 py-2 w-full disabled:opacity-50"
          onClick={onContinue}
          disabled={selected.length === 0 || disabled}
        >
          Generate Playbook
        </button>
      </div>
    </div>
  );
}

