export const dynamic = "force-dynamic"
import React, { Suspense } from 'react'
import { getStr, type SParams } from "@/lib/utils/search"
import PlaybookClient from "./PlaybookClient"

export default async function Page({ searchParams }: { searchParams: SParams }) {
  const planVersionId = getStr(searchParams, "planVersionId")
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Preparing playbook…</div>}>
      <PlaybookClient planVersionId={planVersionId || undefined} />
    </Suspense>
  )
}
