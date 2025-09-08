'use client';

import * as React from 'react';
import type { PlanInput } from '../../../lib/types';

type Props = {
  value: PlanInput;
  onChange: (next: PlanInput) => void;
  onNext?: () => void;
};

export default function Discovery({ value, onChange, onNext }: Props) {
  const set = <K extends keyof PlanInput>(k: K, v: PlanInput[K]) =>
    onChange({ ...value, [k]: v });

  // Safe, length-3 helpers for the goals arrays
  const goals5y = React.useMemo(
    () => (Array.isArray(value.goals5y) ? [...value.goals5y, '', '', ''].slice(0, 3) : ['', '', '']),
    [value.goals5y]
  );
  const goals20y = React.useMemo(
    () => (Array.isArray(value.goals20y) ? [...value.goals20y, '', '', ''].slice(0, 3) : ['', '', '']),
    [value.goals20y]
  );

  const setGoal5 = (i: number, v: string) => {
    const next = [...goals5y];
    next[i] = v;
    set('goals5y', next);
  };

  const setGoal20 = (i: number, v: string) => {
    const next = [...goals20y];
    next[i] = v;
    set('goals20y', next);
  };

  return (
    <section>
      {/* First name (NEW) */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          First name
          <HelpTip>Totally optional — we’ll use it to personalize your plan.</HelpTip>
        </label>
        <input
          className="w-full border rounded px-3 py-2"
          type="text"
          value={value.firstName || ''}
          onChange={(e) => set('firstName', e.target.value)}
          placeholder="e.g., Alex"
        />
      </div>

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
            value={goals5y[0]}
            onChange={(e) => setGoal5(0, e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="5-year goal #2"
            value={goals5y[1]}
            onChange={(e) => setGoal5(1, e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="5-year goal #3"
            value={goals5y[2]}
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
            value={goals20y[0]}
            onChange={(e) => setGoal20(0, e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="20-year goal #2"
            value={goals20y[1]}
            onChange={(e) => setGoal20(1, e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="20-year goal #3"
            value={goals20y[2]}
            onChange={(e) => setGoal20(2, e.target.value)}
          />
        </div>
      </div>

      {/* Financial freedom */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          What does “financial freedom” look like to you?
          <HelpTip>Write a sentence or two. This frames trade-offs (risk, liquidity, timeline).</HelpTip>
        </label>
        <textarea
          className="w-full min-h-[140px] border rounded px-3 py-2"
          placeholder="Write a sentence or two…"
          value={value.freedomDef || ''}
          onChange={(e) => set('freedomDef', e.target.value)}
        />
      </div>

      {/* Confidence */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          How confident are you in your current financial path? (1–10)
          <HelpTip>Gut check. We’ll use this to tune aggressiveness vs. safety.</HelpTip>
        </label>
        <select
          className="border rounded px-3 py-2"
          value={value.confidence ?? 5}
          onChange={(e) => set('confidence', Number(e.target.value))}
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

/** Minimal tooltip (same style you’ve been using) */
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