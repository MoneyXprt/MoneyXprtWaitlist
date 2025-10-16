import React from 'react'

/**
 * LoadingBlock
 * Animated block skeleton for content placeholders.
 */
export interface LoadingBlockProps {
  /** Tailwind width/height via className */
  className?: string
  /** Rounded radius, defaults to md */
  radius?: 'sm'|'md'|'lg'|'xl'|'2xl'
}

export default function LoadingBlock({ className = 'h-20 w-full', radius = 'md' }: LoadingBlockProps) {
  const r = radius === '2xl' ? 'rounded-2xl' : radius === 'xl' ? 'rounded-xl' : radius === 'lg' ? 'rounded-lg' : radius === 'sm' ? 'rounded' : 'rounded-md'
  return <div aria-busy="true" aria-live="polite" className={`animate-pulse bg-neutral-200 dark:bg-neutral-800 ${r} ${className}`} />
}

