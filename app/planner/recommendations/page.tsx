export const dynamic = "force-dynamic"
import React, { Suspense } from 'react'
import { getStr, type SParams } from "@/lib/utils/search"
import RecommendationsClient from "./RecommendationsClient"

export default async function Page({ searchParams }: { searchParams: SParams }) {
  const profileId = getStr(searchParams, "profileId")
  const planId = getStr(searchParams, "planId")
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading recommendations…</div>}>
      <RecommendationsClient profileId={profileId || undefined} planId={planId || undefined} />
    </Suspense>
  )
}
