import React, { Suspense } from 'react'
import HistoryClient from './_components/HistoryClient'

export const dynamic = "force-dynamic";

export const metadata = { title: 'Plan History • MoneyXprt' }

export default async function Page() {
  const initialPlanId = undefined
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading history…</div>}>
      <HistoryClient initialPlanId={initialPlanId} />
    </Suspense>
  )
}
