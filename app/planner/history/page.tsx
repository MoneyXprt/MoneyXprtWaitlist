export { dynamic, revalidate, fetchCache } from '@/lib/next/dynamic-config'
import SafeSuspense from '@/components/system/SafeSuspense'
import ErrorBoundary from '@/components/system/ErrorBoundary'
import HistoryClient from '@/components/planner/history/HistoryClient'

export default function Page({ searchParams }:{ searchParams?: Record<string,string|undefined> }){
  const initialPlanId = searchParams?.planId
  return (
    <ErrorBoundary label="History">
      <SafeSuspense fallback={<div className="p-6 text-sm text-neutral-500">Loading history…</div>}>
        <HistoryClient initialPlanId={typeof initialPlanId === 'string' ? initialPlanId : undefined} />
      </SafeSuspense>
    </ErrorBoundary>
  )
}
