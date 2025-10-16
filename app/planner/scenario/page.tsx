export const dynamic = "force-dynamic"
import React, { Suspense } from 'react'
import { getStr, type SParams } from "@/lib/utils/search"
import ScenarioClient from "./ScenarioClient"

export default async function Page({ searchParams }: { searchParams: SParams }) {
  const scenarioId = getStr(searchParams, "id")
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading scenario…</div>}>
      <ScenarioClient scenarioId={scenarioId || undefined} />
    </Suspense>
  )
}
