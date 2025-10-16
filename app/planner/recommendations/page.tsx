export const dynamic = "force-dynamic"
import { getStr, type SParams } from "@/lib/utils/search"
import RecommendationsClient from "./RecommendationsClient"
import SafeSuspense from "@/components/common/SafeSuspense"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

export default async function Page({ searchParams }: { searchParams: SParams }) {
  const profileId = getStr(searchParams, "profileId")
  const planId = getStr(searchParams, "planId")
  return (
    <ErrorBoundary>
      <SafeSuspense>
        <RecommendationsClient profileId={profileId || undefined} planId={planId || undefined} />
      </SafeSuspense>
    </ErrorBoundary>
  )
}
