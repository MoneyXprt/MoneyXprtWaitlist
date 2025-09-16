// app/planner/components/HelpTip.tsx
'use client';
import * as React from 'react';

export default function HelpTip({
  title,
  what,
  where,
  how,
}: {
  title: string;
  what: string;
  where?: string;
  how?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label={`Help: ${title}`}
        className="ml-2 text-gray-500 hover:text-black align-middle"
        onClick={() => setOpen((o) => !o)}
      >
        ⓘ
      </button>
      {open && (
        <div
          className="absolute z-40 mt-2 w-80 max-w-[80vw] rounded-lg border bg-white p-3 shadow-md text-sm"
          role="dialog"
          aria-label={title}
        >
          <div className="font-medium">{title}</div>
          <ul className="mt-1 space-y-1">
            <li><span className="font-medium">What:</span> {what}</li>
            {where && <li><span className="font-medium">Where to find:</span> {where}</li>}
            {how && <li><span className="font-medium">How to estimate:</span> {how}</li>}
          </ul>
          <div className="text-right mt-2">
            <button
              className="text-xs text-gray-600 hover:text-black"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </span>
  );
}