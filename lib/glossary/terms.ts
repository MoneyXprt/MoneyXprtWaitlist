export type TaxTerm = {
  label: string
  aka: string[]
  oneLiner: string
  whenItApplies?: string
  caveats?: string
}

/**
 * Glossary of technical tax terms used in the app.
 * Keep plain‑English, one‑sentence explanations.
 */
export const TERMS: Record<string, TaxTerm> = {
  qbi_199a: {
    label: 'Qualified Business Income (QBI §199A)',
    aka: ['QBI', 'QBI §199A', '§199A', '199A'],
    oneLiner: 'A deduction that can reduce federal tax on some pass‑through business income within IRS limits.',
    whenItApplies: 'Owners of pass‑throughs (LLC, S‑Corp, partnership) with qualifying income.',
    caveats: 'Subject to wage/UBIA, SSTB, and income thresholds; confirm with a CPA.',
  },
  ptet: {
    label: 'Pass‑Through Entity Tax (PTET)',
    aka: ['PTET', 'Elective pass‑through tax'],
    oneLiner: 'A state election where the business pays state tax so owners can bypass the $10k SALT cap.',
    whenItApplies: 'States that offer PTET for pass‑through entities.',
    caveats: 'Rules vary by state; coordination with owners’ returns is required.',
  },
  augusta_280a: {
    label: 'Augusta rule (§280A)',
    aka: ['Augusta rule', '§280A', '280A'],
    oneLiner: 'Allows a business to rent your home for up to 14 days per year tax‑free.',
    whenItApplies: 'Business owners hosting bona fide meetings/events at home.',
    caveats: 'Document market rates and meeting purpose; not for personal use.',
  },
  cost_seg: {
    label: 'Cost segregation',
    aka: ['Cost segregation', 'Cost seg'],
    oneLiner: 'A study that accelerates depreciation on parts of a building to lower near‑term taxes.',
    whenItApplies: 'Rental/real estate owners with significant basis.',
    caveats: 'Engage a qualified engineer; impacts recapture on sale.',
  },
  cost_seg_bonus: {
    label: 'Cost segregation + bonus depreciation',
    aka: ['Bonus depreciation', 'Cost segregation + bonus'],
    oneLiner: 'Accelerates depreciation with bonus rules to reduce taxable income in early years.',
    whenItApplies: 'Rentals placed in service and eligible property components.',
    caveats: 'Bonus phase‑down; confirm eligibility and state conformity.',
  },
  rep: {
    label: 'Real Estate Professional (REP)',
    aka: ['REP', 'Real Estate Professional'],
    oneLiner: 'A status that can let certain rental losses offset other income if strict tests are met.',
    whenItApplies: 'Material participation and hours tests in real estate activities.',
    caveats: 'Strict recordkeeping; high audit scrutiny; confirm with a CPA.',
  },
  str: {
    label: 'Short‑term rental (STR)',
    aka: ['STR', 'Short‑term rental'],
    oneLiner: 'Rentals averaging 7 days or less per stay; special tax rules may apply.',
    whenItApplies: 'Short‑term rentals on platforms or direct bookings.',
    caveats: 'Grouping and participation rules are nuanced; check a CPA.',
  },
}

/** quick lookup by display text to canonical key */
export const TEXT_TO_KEY: Array<{ re: RegExp; key: keyof typeof TERMS }> = [
  { re: /\bQBI\b|§?199A|Qualified Business Income/i, key: 'qbi_199a' },
  { re: /\bPTET\b|Pass[- ]?Through Entity Tax|Elective pass[- ]through tax/i, key: 'ptet' },
  { re: /Augusta|§?280A/i, key: 'augusta_280a' },
  { re: /cost seg(mentation)?|cost segregation/i, key: 'cost_seg' },
  { re: /bonus depreciation/i, key: 'cost_seg_bonus' },
  { re: /\bREP\b|Real Estate Professional/i, key: 'rep' },
  { re: /\bSTR\b|Short[- ]term rental/i, key: 'str' },
]

