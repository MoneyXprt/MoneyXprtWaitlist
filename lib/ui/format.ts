// lib/ui/format.ts
export const fmtUSD = (n: number | undefined | null) =>
  typeof n === 'number'
    ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : '—';

export const fmtUSDcents = (n: number | undefined | null) =>
  typeof n === 'number' ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : '—';

export const fmtPct = (n: number | undefined | null) =>
  typeof n === 'number' ? `${(n * 100).toFixed(1)}%` : '—';

