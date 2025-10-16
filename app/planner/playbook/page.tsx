export { dynamic, revalidate, fetchCache } from '@/lib/next/dynamic-config'
import SafeSuspense from '@/components/system/SafeSuspense'
import ErrorBoundary from '@/components/system/ErrorBoundary'
import PlaybookClient from './_components/PlaybookClient'

export const metadata = { title: 'Playbook • MoneyXprt' };

export default function Page(){
  return (
    <ErrorBoundary label="Playbook">
      <SafeSuspense fallback={<div className="p-6 text-sm text-neutral-500">Preparing playbook…</div>}>
        <PlaybookClient />
      </SafeSuspense>
    </ErrorBoundary>
  );
}
