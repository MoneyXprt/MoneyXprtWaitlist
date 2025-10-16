export const dynamic = "force-dynamic"
import { getStr, type SParams } from "@/lib/utils/search"
import ScenariosClient from "./ScenariosClient"
import SafeSuspense from "@/components/common/SafeSuspense"
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

export default async function Page({ searchParams }: { searchParams: SParams }) {
  const q = getStr(searchParams, "q")
  return (
    <ErrorBoundary>
      <SafeSuspense>
        <ScenariosClient q={q || undefined} />
      </SafeSuspense>
    </ErrorBoundary>
  )
}
