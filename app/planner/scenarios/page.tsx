export const dynamic = "force-dynamic"
import React, { Suspense } from 'react'
import { getStr, type SParams } from "@/lib/utils/search"
import ScenariosClient from "./ScenariosClient"

export default async function Page({ searchParams }: { searchParams: SParams }) {
  const q = getStr(searchParams, "q")
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading scenarios…</div>}>
      <ScenariosClient q={q || undefined} />
    </Suspense>
  )
}
