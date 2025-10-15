// app/planner/intake/page.tsx
import React, { Suspense } from 'react';
import WithSearchParams from '../_components/WithSearchParams';
import IntakeClient from './_components/IntakeClient';

export const metadata = { title: 'Planner Intake • MoneyXprt' };

export default async function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading…</div>}>
      <WithSearchParams>
        {(params) => <IntakeClient params={params} />}
      </WithSearchParams>
    </Suspense>
  );
}
