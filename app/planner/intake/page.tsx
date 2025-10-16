export { dynamic, revalidate, fetchCache } from '@/lib/next/dynamic-config'
import SafeSuspense from '@/components/system/SafeSuspense'
import ErrorBoundary from '@/components/system/ErrorBoundary'
import IntakeClient from './_components/IntakeClient'

export default function Page(){
  return (
    <ErrorBoundary label="Intake">
      <SafeSuspense fallback={<div className="p-6 text-sm text-neutral-500">Loading intake…</div>}>
        <IntakeClient />
      </SafeSuspense>
    </ErrorBoundary>
  )
}
