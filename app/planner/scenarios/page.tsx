export { dynamic, revalidate, fetchCache } from '@/lib/next/dynamic-config'
import SafeSuspense from '@/components/system/SafeSuspense'
import ErrorBoundary from '@/components/system/ErrorBoundary'
import ScenariosClient from './_components/ScenariosClient'

export const metadata = { title: 'Scenarios • MoneyXprt' };

export default function Page(){
  return (
    <ErrorBoundary label="Scenarios">
      <SafeSuspense fallback={<div className="p-6 text-sm text-neutral-500">Loading scenarios…</div>}>
        <ScenariosClient />
      </SafeSuspense>
    </ErrorBoundary>
  );
}
