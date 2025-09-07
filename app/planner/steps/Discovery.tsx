'use client';

import * as React from 'react';
import type { PlanInput } from '../../../lib/types';

type Props = {
  value: PlanInput;
  onChange: (next: PlanInput) => void;
  /** optional: parent can pass a handler to move to the next step */
  onNext?: () => void;
};

/**
 * This component reads/writes `value.discovery`.
 * To be resilient to type shape changes, it falls back to sane defaults
 * if `value.discovery` is missing.
 */
export default function Discovery({ value, onChange, onNext }: Props) {
  // Pull discovery safely with fallbacks
  const discovery = React.useMemo(() => {
    const d: any = (value as any).discovery ?? {};
    return {
      goals5: Array.isArray(d.goals5) ? [...d.goals5, '', '', ''].slice(0, 3) : ['', '', ''],
      goals20: Array.isArray(d.goals20) ? [...d.goals20, '', '', ''].slice(0, 3) : ['', '', ''],
      freedom: typeof d.freedom === 'string' ? d.freedom : '',
      confidence: Number.isFinite(d.confidence) ? d.confidence : 5,
    };
  }, [value]);

  function updateDiscovery(nextPartial: Partial<typeof discovery>) {
    const next = {
      ...(value as any),
      discovery: {
        ...discovery,
        ...nextPartial,
      },
    } as PlanInput;
    onChange(next);
  }

  const setGoal5 = (i: number, v: string) => {
    const arr = [...discovery.goals5];
    arr[i] = v;
    updateDiscovery({ goals5: arr });
  };

  const setGoal20 = (i: number, v: string) => {
    const arr = [...discovery.goals20];
    arr[i] = v;
    updateDiscovery({ goals20: arr });
  };

  return (
    <section>
      {/* 5-year goals */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Your top goals in ~5 years
          <HelpTip>Short-term priorities. Examples: buy a home, start a business, take a sabbatical.</HelpTip>
        </label>
        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="5-year goal #1"
            value={discovery.goals5[0]}
            onChange={(e) => setGoal5(0, e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="5-year goal #2"
            value={discovery.goals5[1]}
            onChange={(e) => setGoal5(1, e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="5-year goal #3"
            value={discovery.goals5[2]}
            onChange={(e) => setGoal5(2, e.target.value)}
          />
        </div>
      </div>

      {/* 20-year goals */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Your top goals in ~20 years
          <HelpTip>Long-term targets. Examples: financial independence, second home, college funding, philanthropy.</HelpTip>
        </label>
        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="20-year goal #1"
            value={discovery.goals20[0]}
            onChange={(e) => setGoal20(0, e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="20-year goal #2"
            value={discovery.goals20[1]}
            onChange={(e) => setGoal20(1, e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="20-year goal #3"
            value={discovery.goals20[2]}
            onChange={(e) => setGoal20(2, e.target.value)}
          />
        </div>
      </div>

      {/* Financial freedom */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          What does “financial freedom” look like to you?
          <HelpTip>Write a sentence or two. This frames how we prioritize trade-offs (risk, liquidity, timeline).</HelpTip>
        </label>
        <textarea
          className="w-full min-h-[140px] border rounded px-3 py-2"
          placeholder="Write a sentence or two…"
          value={discovery.freedom}
          onChange={(e) => updateDiscovery({ freedom: e.target.value })}
        />
      </div>

      {/* Confidence slider/select */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          How confident are you in your current financial path? (1–10)
          <HelpTip>Gut check. We’ll use this to tune the plan’s aggressiveness vs. safety.</HelpTip>
        </label>
        <select
          className="border rounded px-3 py-2"
          value={discovery.confidence}
          onChange={(e) => updateDiscovery({ confidence: Number(e.target.value) })}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => onNext?.()}
          className="inline-flex items-center px-4 py-2 rounded bg-black text-white hover:opacity-90"
        >
          Continue
        </button>
      </div>
    </section>
  );
}

/** Minimal tooltip to match your planner’s style */
function HelpTip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <span className="relative inline-block align-middle ml-2">
      <button
        type="button"
        aria-label="Help"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs leading-none hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
      >
        ?
      </button>
      {open && (
        <div className="absolute left-6 z-30 mt-2 w-80 rounded border bg-white p-3 text-sm shadow-lg">
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