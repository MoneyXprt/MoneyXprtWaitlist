'use client';
import * as React from 'react';

type Props = {
  items: string[];
  title?: string;
};

export default function ActionChecklist({ items, title = '12-month action plan' }: Props) {
  const [done, setDone] = React.useState<Record<number, boolean>>({});

  const toggle = (i: number) => setDone((d) => ({ ...d, [i]: !d[i] }));

  if (!items || items.length === 0) return null;

  // keep the list short: top 6 actions
  const list = items.slice(0, 6);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold mb-2">✅ {title}</h3>
      <ul className="space-y-2">
        {list.map((line, i) => (
          <li key={i} className="flex items-start gap-3">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={!!done[i]}
                onChange={() => toggle(i)}
              />
              <span className={done[i] ? 'line-through text-gray-500' : ''}>{line}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-sm text-gray-600">
        Tip: schedule calendar nudges (quarterly review, savings auto-increase) when you check items off.
      </div>
    </div>
  );
}