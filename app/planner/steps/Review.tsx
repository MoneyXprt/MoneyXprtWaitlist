// app/planner/steps/Review.tsx
'use client';

import * as React from 'react';
import type { PlanInput } from '@/lib/types';

type Props = {
  value: PlanInput;
  onBack: () => void;
};

export default function Review({ value, onBack }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [narrative, setNarrative] = React.useState<string>('');
  const [bullets, setBullets] = React.useState<string[]>([]);
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState<string>('');

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });
        const json = await res.json();
        if (!cancelled) {
          setNarrative(json?.narrative ?? '');
          setBullets(Array.isArray(json?.recommendations) ? json.recommendations : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [value]);

  async function ask() {
    setAnswer('');
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: value, question }),
    });
    const json = await res.json();
    setAnswer(json?.answer ?? '');
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Plan</h2>
        <button onClick={onBack} className="px-3 py-1.5 border rounded hover:bg-gray-50">Back</button>
      </div>

      {loading ? <p>Generating your plan…</p> : (
        <>
          {narrative ? (
            <article className="prose max-w-none">
              {narrative.split('\n').map((p, i) => <p key={i}>{p}</p>)}
            </article>
          ) : (
            <>
              <p className="mb-3 text-gray-700">AI narrative is unavailable; here are rule-based recommendations:</p>
              <ul className="list-disc pl-5 space-y-1">
                {bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </>
          )}

          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold mb-2">Ask a follow-up</h3>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder="e.g., What if I increase savings by $2,000/mo?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button onClick={ask} className="px-4 py-2 rounded bg-black text-white hover:opacity-90">Ask</button>
            </div>
            {answer && (
              <div className="mt-4 p-3 border rounded bg-gray-50 whitespace-pre-wrap">{answer}</div>
            )}
          </div>
        </>
      )}
    </section>
  );
}