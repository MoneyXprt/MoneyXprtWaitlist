"use client";

import * as React from 'react';

// Updated RiskBadge to a labeled pill (Low/Med/High) for clarity.
export function RiskBadge({ score }: { score?: number | null }) {
  const s = typeof score === 'number' && isFinite(score) ? Math.max(1, Math.min(5, Math.round(score))) : null;
  const label = s === null ? '—' : s <= 1 ? 'Low' : s <= 3 ? 'Med' : 'High';
  const tone =
    s === null
      ? 'bg-neutral-200 text-neutral-700'
      : s <= 1
      ? 'bg-green-100 text-green-800'
      : s <= 3
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-red-100 text-red-800';
  return (
    <span
      title={`Risk: ${label}${s ? ` (${s}/5)` : ''}`}
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        tone,
      ].join(' ')}
      aria-label={`Risk ${label}`}
    >
      {label}
    </span>
  );
}

export default RiskBadge;
