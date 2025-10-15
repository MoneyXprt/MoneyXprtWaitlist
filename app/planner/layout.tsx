// app/planner/layout.tsx
import React, { Suspense } from 'react';
import SubNavClient from './_components/SubNavClient';

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="p-3 text-sm text-neutral-500">Loading…</div>}>
        <SubNavClient />
      </Suspense>
      <div role="note" className="bg-amber-50 border-b text-amber-900 text-sm">
        <div className="container mx-auto p-3">
          This Planner provides educational insights only and is not legal or tax advice. Consult a qualified CPA/attorney before implementing strategies.
        </div>
      </div>
      {children}
    </div>
  );
}
