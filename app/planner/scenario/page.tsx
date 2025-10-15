import React, { Suspense } from 'react';
import ScenarioClient from './_components/ScenarioClient';

export const dynamic = "force-dynamic";

export const metadata = { title: 'Scenario • MoneyXprt' };

export default async function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading…</div>}>
      <ScenarioClient />
    </Suspense>
  );
}
