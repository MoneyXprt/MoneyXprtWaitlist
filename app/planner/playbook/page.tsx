export const dynamic = "force-dynamic"
import { getStr, type SParams } from "@/lib/utils/search"
import PlaybookClient from "./PlaybookClient"
import SafeSuspense from "@/components/common/SafeSuspense"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

export default async function Page({ searchParams }: { searchParams: SParams }) {
  const planVersionId = getStr(searchParams, "planVersionId")
  return (
    <ErrorBoundary>
      <SafeSuspense>
        <PlaybookClient planVersionId={planVersionId || undefined} />
      </SafeSuspense>
    </ErrorBoundary>
  )
}
