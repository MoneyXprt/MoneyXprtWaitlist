"use client"
import React from 'react'
import Toolbar from '@/components/ui/Toolbar'
import { usePlannerStore } from '@/lib/store/planner'

export default function ContextBarClient() {
  const profile = usePlannerStore((s) => (s.data as any)?.profile)
  const assumptions = usePlannerStore((s) => (s.data as any)?.assumptions)

  const name: string = (profile as any)?.name || (profile as any)?.fullName || 'Your profile'
  const year: number = (assumptions as any)?.year || new Date().getFullYear()

  return (
    <Toolbar
      aria-label="Planner context"
      left={
        <div className="truncate text-sm">
          <span className="font-medium">{name}</span>
          <span className="mx-2 text-neutral-400">•</span>
          <span className="text-neutral-600 dark:text-neutral-300">{year}</span>
        </div>
      }
      right={
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-sm rounded-md border px-3 py-1 bg-white dark:bg-neutral-900 hover:bg-neutral-50 focus-visible:ring-2 ring-emerald-600"
            aria-label="Undo changes"
            onClick={() => console.debug('planner:undo')}
          >
            Undo changes
          </button>
          <button
            type="button"
            className="text-sm rounded-md border px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-2 ring-emerald-600"
            aria-label="Save planner changes"
            onClick={() => console.debug('planner:save')}
          >
            Save
          </button>
        </div>
      }
    />
  )
}

