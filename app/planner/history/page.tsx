import React, { Suspense } from 'react'
import HistoryClient from './_components/HistoryClient'

export const dynamic = "force-dynamic";

export const metadata = { title: 'Plan History • MoneyXprt' }

export default async function Page() {
  // If you need a value, compute it on the server (cookie, headers, db) – but not via useSearchParams.
  const initialPlanId: string | undefined = undefined;
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading history…</div>}>
      <HistoryClient initialPlanId={initialPlanId} />
    </Suspense>
  )
}
