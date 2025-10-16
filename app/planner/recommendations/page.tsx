export { dynamic, revalidate, fetchCache } from '@/lib/next/dynamic-config'
import SafeSuspense from '@/components/system/SafeSuspense'
import ErrorBoundary from '@/components/system/ErrorBoundary'
import RecommendationsClient from './_components/RecommendationsClient'

export const metadata = { title: 'Recommendations • MoneyXprt' };

export default function Page(){
  return (
    <ErrorBoundary label="Recommendations">
      <SafeSuspense fallback={<div className="p-6 text-sm text-neutral-500">Loading recommendations…</div>}>
        <RecommendationsClient />
      </SafeSuspense>
    </ErrorBoundary>
  );
}
