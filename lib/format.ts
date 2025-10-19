export const money = (v: number, locale = 'en-US', currency = 'USD') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v || 0);

export const pct = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(v);

