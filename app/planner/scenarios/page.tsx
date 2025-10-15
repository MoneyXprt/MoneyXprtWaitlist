import React, { Suspense } from 'react';
import ScenariosClient from './_components/ScenariosClient';

export const dynamic = "force-dynamic";

export const metadata = { title: 'Scenarios • MoneyXprt' };

export default async function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading…</div>}>
      <ScenariosClient />
    </Suspense>
  );
}
