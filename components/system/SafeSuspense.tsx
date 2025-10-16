import { Suspense } from 'react'

export default function SafeSuspense({children, fallback}:{children: React.ReactNode, fallback?: React.ReactNode}){
  return <Suspense fallback={fallback ?? <div className="p-6 text-sm text-neutral-500">Loading…</div>}>{children}</Suspense>
}

