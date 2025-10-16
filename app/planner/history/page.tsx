export const dynamic = 'force-dynamic'
import React, { Suspense } from 'react'
import HistoryClient from '@/components/planner/history/HistoryClient'

export default function Page({ searchParams }:{ searchParams?: Record<string,string|undefined> }){
  const initialPlanId = searchParams?.planId
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading history…</div>}>
      <HistoryClient initialPlanId={typeof initialPlanId === 'string' ? initialPlanId : undefined} />
    </Suspense>
  )
}
