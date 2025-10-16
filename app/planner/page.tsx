export const dynamic = "force-dynamic"
import React, { Suspense } from 'react'
import { getStr, type SParams } from "@/lib/utils/search"
import IntakeClient from "./IntakeClient"

export default async function Page({ searchParams }: { searchParams: SParams }) {
  const profileId = getStr(searchParams, "profileId", "")
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading…</div>}>
      <IntakeClient profileId={profileId || undefined} />
    </Suspense>
  )
}
