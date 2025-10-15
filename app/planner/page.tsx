// app/planner/page.tsx
import React, { Suspense } from 'react';
import PlannerClient from './_components/PlannerClient';

export const metadata = { title: 'Planner • MoneyXprt' };

export default async function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <PlannerClient />
    </Suspense>
  );
}
