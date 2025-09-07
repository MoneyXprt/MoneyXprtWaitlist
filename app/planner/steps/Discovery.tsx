'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Discovery = {
  goals5y: string[];
  goals20y: string[];
  freedom: string;
  confidence: number;
};

const EMPTY: Discovery = {
  goals5y: ['', '', ''],
  goals20y: ['', '', ''],
  freedom: '',
  confidence: 5,
};

function HelpTip({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        aria-label={`Help: ${title}`}
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs leading-none hover:bg-gray-50"
        onClick={() => setOpen(o => !o)}
      >
        ?
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={title}
          className="absolute z-30 mt-2 w-80 rounded border bg-white p-3 text-sm shadow-lg left-6"
        >
          <div className="mb-1 font-medium">{title}</div>
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

export default function DiscoveryPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [data, setData] = useState<Discovery>(EMPTY);
  const [showDebug, setShowDebug] = useState(false);

  // Only show debug when explicitly enabled
  const canDebug =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SHOW_DEBUG === '1') ||
    params.get('debug') === '1';

  // Load any saved discovery on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('mx_discovery');
      if (raw) setData({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // ignore
    }
  }, []);

  function save() {
    try {
      localStorage.setItem('mx_discovery', JSON.stringify(data));
    } catch {
      // ignore storage issues
    }
  }

  function onContinue() {
    save();
    router.push('/planner#profile'); // jump to the next step
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Discovery</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-medium mb-2 flex items-center">
            <span>Your top goals in ~5 years</span>
            <HelpTip title="5-year goals">
              List up to three things you’d like to accomplish within about five years
              (e.g., buy a home, start a business, pay off loans, travel sabbatical).
            </HelpTip>
          </h2>
          {[0, 1, 2].map(i => (
            <input
              key={i}
              type="text"
              value={data.goals5y[i]}
              onChange={e => {
                const copy = [...data.goals5y];
                copy[i] = e.target.value;
                setData(d => ({ ...d, goals5y: copy }));
              }}
              placeholder={`5-year goal #${i + 1}`}
              className="mb-3 w-full border rounded px-3 py-2"
            />
          ))}
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2 flex items-center">
            <span>Your top goals in ~20 years</span>
            <HelpTip title="20-year goals">
              Longer-horizon aspirations (e.g., financial independence, second home,
              major philanthropy, career transition).
            </HelpTip>
          </h2>
          {[0, 1, 2].map(i => (
            <input
              key={i}
              type="text"
              value={data.goals20y[i]}
              onChange={e => {
                const copy = [...data.goals20y];
                copy[i] = e.target.value;
                setData(d => ({ ...d, goals20y: copy }));
              }}
              placeholder={`20-year goal #${i + 1}`}
              className="mb-3 w-full border rounded px-3 py-2"
            />
          ))}
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2 flex items-center">
            <span>What does “financial freedom” look like to you?</span>
            <HelpTip title="Financial freedom">
              Describe how life looks when money isn’t a constraint — activities,
              work, family, place, impact.
            </HelpTip>
          </h2>
          <textarea
            value={data.freedom}
            onChange={e => setData(d => ({ ...d, freedom: e.target.value }))}
            placeholder="Write a sentence or two..."
            className="w-full h-40 border rounded px-3 py-2"
          />
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2 flex items-center">
            <span>How confident are you in your current financial path? (1–10)</span>
            <HelpTip title="Confidence">
              A 1 means “not confident at all”; 10 means “extremely confident.”
              This helps us calibrate urgency and focus.
            </HelpTip>
          </h2>
          <select
            className="w-24 border rounded px-3 py-2"
            value={data.confidence}
            onChange={e =>
              setData(d => ({ ...d, confidence: parseInt(e.target.value, 10) || 1 }))
            }
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center px-4 py-2 rounded bg-black text-white hover:opacity-90"
          >
            Save & Continue to Profile
          </button>

          {canDebug && (
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showDebug}
                onChange={e => setShowDebug(e.target.checked)}
              />
              <span>Show raw data (debug)</span>
            </label>
          )}
        </div>

        {canDebug && showDebug && (
          <textarea
            className="mt-3 w-full h-48 border rounded p-3 font-mono text-sm"
            value={JSON.stringify(data, null, 2)}
            readOnly
          />
        )}
      </div>
    </div>
  );
}