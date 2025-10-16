export const dynamic = "force-dynamic"
import { getStr, type SParams } from "@/lib/utils/search"
import IntakeClient from "./IntakeClient"
import SafeSuspense from "@/components/common/SafeSuspense"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

export default async function Page({ searchParams }: { searchParams: SParams }) {
  const profileId = getStr(searchParams, "profileId", "")
  return (
    <ErrorBoundary>
      <SafeSuspense>
        <IntakeClient profileId={profileId || undefined} />
      </SafeSuspense>
    </ErrorBoundary>
  )
}
