export { dynamic, revalidate, fetchCache } from '@/lib/next/dynamic-config'
import SafeSuspense from '@/components/system/SafeSuspense'
import ErrorBoundary from '@/components/system/ErrorBoundary'
import ScenarioClient from './_components/ScenarioClient'

export const metadata = { title: 'Scenario • MoneyXprt' };

export default function Page({ searchParams }:{ searchParams?: Record<string,string|undefined> }){
  // ScenarioClient currently reads id via useSearchParams client-side; do not pass unsupported props.
  return (
    <ErrorBoundary label="Scenario">
      <SafeSuspense fallback={<div className="p-6 text-sm text-neutral-500">Loading scenario…</div>}>
        <ScenarioClient />
      </SafeSuspense>
    </ErrorBoundary>
  );
}
