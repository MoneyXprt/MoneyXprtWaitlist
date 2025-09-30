// app/planner/components/NarrativeButton.tsx
'use client';
import * as React from 'react';
import type { PlanInput } from '@/lib/types';

interface NarrativeButtonProps {
  input: PlanInput;
  className?: string;
}

export default function NarrativeButton({ input, className = '' }: NarrativeButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [narrative, setNarrative] = React.useState<string>('');

  const fetchNarrative = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, wantNarrative: true }),
      });
      const data = await res.json();
      setNarrative(data?.narrative || 'No narrative available.');
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`inline-flex items-center px-3 py-2 rounded border hover:bg-gray-50 ${className}`}
        onClick={fetchNarrative}
        disabled={loading}
      >
        {loading ? 'Generating…' : 'View Narrative Summary'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative max-w-3xl w-[92vw] bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Narrative Summary</h3>
              <button onClick={() => setOpen(false)} className="text-gray-600 hover:opacity-80">✕</button>
            </div>
            <div className="prose max-w-none text-sm whitespace-pre-wrap">
              {narrative}
            </div>
          </div>
        </div>
      )}
    </>
  );
}