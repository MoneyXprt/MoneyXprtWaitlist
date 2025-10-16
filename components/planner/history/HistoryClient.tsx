"use client"
import { useEffect } from 'react'
export default function HistoryClient({ initialPlanId }: { initialPlanId?: string }){
  useEffect(()=>{ console.debug('HistoryClient mounted', { initialPlanId }) },[initialPlanId])
  // existing UI...
  return <div className="p-6">{/* …history table… */}</div>
}

