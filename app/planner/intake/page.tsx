export const dynamic = 'force-dynamic'
import React, { Suspense } from 'react'
import IntakeClient from './_components/IntakeClient'

export default function Page(){
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Loading intake…</div>}>
      <IntakeClient />
    </Suspense>
  )
}
