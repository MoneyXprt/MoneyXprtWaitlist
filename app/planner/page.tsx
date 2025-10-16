import type { Metadata } from 'next'
export { dynamic, revalidate, fetchCache } from '@/lib/next/dynamic-config'
import SafeSuspense from '@/components/system/SafeSuspense'
import ErrorBoundary from '@/components/system/ErrorBoundary'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Planner • MoneyXprt' }

export default async function PlannerIndex(_:{ searchParams?: Record<string,string|undefined> }){
  return (
    <div className="p-6 space-y-6">
      <div className="text-sm text-neutral-600">Planner</div>
      <ErrorBoundary label="Planner index">
        <SafeSuspense>
          <div className="grid gap-4 md:grid-cols-2">
            <Link className="rounded-xl border p-4 hover:bg-neutral-50" href="/planner/intake">Intake →</Link>
            <Link className="rounded-xl border p-4 hover:bg-neutral-50" href="/planner/recommendations">Recommendations →</Link>
            <Link className="rounded-xl border p-4 hover:bg-neutral-50" href="/planner/scenario">Scenario →</Link>
            <Link className="rounded-xl border p-4 hover:bg-neutral-50" href="/planner/playbook">Playbook →</Link>
            <Link className="rounded-xl border p-4 hover:bg-neutral-50" href="/planner/history">History →</Link>
          </div>
        </SafeSuspense>
      </ErrorBoundary>
    </div>
  )
}
