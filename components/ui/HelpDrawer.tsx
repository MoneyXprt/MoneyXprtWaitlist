"use client"
import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * HelpDrawer
 * Lightweight right-side drawer for contextual help. Keyboard- and screen-reader friendly.
 */
export interface HelpDrawerProps {
  /** Button label for the opener */
  label?: string
  /** Drawer title */
  title?: string
  /** Drawer content */
  children?: React.ReactNode
}

export default function HelpDrawer({ label = 'Help', title = 'Help', children }: HelpDrawerProps) {
  const [open, setOpen] = React.useState(false)
  useEffect(() => {
    function onKey(e: KeyboardEvent){ if (e.key === 'Escape') setOpen(false) }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm rounded-md border px-3 py-1 bg-white hover:bg-neutral-50 focus-visible:ring-2 ring-emerald-600"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
      </button>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50" aria-modal="true" role="dialog" aria-label={title}>
            <motion.div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} />
            <motion.div
              initial={{ x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-neutral-900 shadow-soft p-4 overflow-y-auto focus-visible:ring-2 ring-emerald-600"
              tabIndex={-1}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{title}</h2>
                <button aria-label="Close" className="rounded px-2 py-1 border focus-visible:ring-2 ring-emerald-600" onClick={() => setOpen(false)}>Close</button>
              </div>
              <div className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
