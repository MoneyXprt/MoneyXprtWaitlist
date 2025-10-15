// app/planner/playbook/page.tsx
import React, { Suspense } from 'react';
import PlaybookClient from './_components/PlaybookClient';

export const dynamic = "force-dynamic";
export const metadata = { title: 'Playbook • MoneyXprt' };

export default async function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading…</div>}>
      <PlaybookClient />
    </Suspense>
  );
}
