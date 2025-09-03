'use client';

import type { PlanInput } from '../../../lib/types';

type Props = {
  value: PlanInput;
  onChange: (v: PlanInput) => void;
};

function Help({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="ml-2 inline-block align-middle">
      <summary className="inline-flex items-center text-xs px-2 py-0.5 rounded border cursor-pointer">
        ?
      </summary>
      <div className="mt-2 p-3 border rounded bg-white shadow-sm text-sm max-w-lg">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-gray-700">{children}</div>
      </div>
    </details>
  );
}

function GoalList({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium mb-1">
        {label}
        <Help title={label}>
          Add up to three short statements. Examples: “Pay off student loans”, “Buy a rental property”,
          “Fund kids’ 529s”, “Start a business”, “Retire at 50 with $12k/mo after tax”.
        </Help>
      </span>
      <div className="space-y-2">
        {value.map((g, i) => (
          <input
            key={i}
            className="w-full border rounded px-3 py-2"
            placeholder={`${placeholder} #${i + 1}`}
            value={g}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
        ))}
      </div>
    </label>
  );
}

export default function Discovery({ value, onChange }: Props) {
  const d = value.discovery;
  const set = (key: keyof typeof d, v: any) =>
    onChange({ ...value, discovery: { ...d, [key]: v } });

  return (
    <section aria-label="Discovery">
      <h2 className="text-xl font-medium mb-3">1) Discovery</h2>

      <GoalList
        label="Your top goals in the next 12 months"
        value={d.goalsY1}
        onChange={(v) => set('goalsY1', v)}
        placeholder="1-year goal"
      />

      <GoalList
        label="Your top goals in ~5 years"
        value={d.goalsY5}
        onChange={(v) => set('goalsY5', v)}
        placeholder="5-year goal"
      />

      <GoalList
        label="Your top goals in ~20 years"
        value={d.goalsY20}
        onChange={(v) => set('goalsY20', v)}
        placeholder="20-year goal"
      />

      <label className="block mb-4">
        <span className="block text-sm font-medium mb-1">
          What does “financial freedom” look like to you?
          <Help title="Financial freedom">
            Describe the life you want when money friction is minimized.
            Examples: “Work optional at 50”, “6 months per year traveling”,
            “Own a business that runs without me”.
          </Help>
        </span>
        <textarea
          className="w-full border rounded px-3 py-2 h-24"
          value={d.freedomDef ?? ''}
          onChange={(e) => set('freedomDef', e.target.value)}
          placeholder="Write a sentence or two…"
        />
      </label>

      <label className="block mb-2">
        <span className="block text-sm font-medium mb-1">
          How confident are you in your current financial path? (1–10)
          <Help title="Confidence (1–10)">
            A gut-check rating helps us gauge urgency and where to focus first.
          </Help>
        </span>
        <input
          type="number"
          min={1}
          max={10}
          className="w-32 border rounded px-3 py-2"
          value={d.confidence10}
          onChange={(e) => set('confidence10', Number(e.target.value || 1))}
        />
      </label>
    </section>
  );
}