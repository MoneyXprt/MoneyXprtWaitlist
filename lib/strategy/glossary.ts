// lib/strategy/glossary.ts
export const GLOSSARY: Record<string, { term: string; plain: string }> = {
  ptet: {
    term: "PTET (Pass-Through Entity Tax)",
    plain:
      "A state election that lets your S-Corp or partnership pay state tax so you can effectively deduct it on your federal return (bypassing the $10k SALT cap). Owners usually get a credit on the state return.",
  },
  qbi: {
    term: "QBI (§199A deduction)",
    plain:
      "A federal deduction (up to ~20%) on qualified business income from pass-through businesses. It depends on W-2 wages, business type, and income limits.",
  },
  cost_seg: {
    term: "Cost segregation + bonus depreciation",
    plain:
      "An engineering study that splits a rental property into faster-depreciating parts so you can deduct more upfront and reduce taxes sooner.",
  },
  augusta: {
    term: "Augusta Rule (§280A)",
    plain:
      "Allows you to rent your home to your business for up to 14 days per year and deduct it at the business—tax-free to you personally if documented properly.",
  },
  employ_kids: {
    term: "Employ your children",
    plain:
      "Put your kids on payroll for real work at reasonable wages. Shifts income to a lower tax bracket and can fund a Roth IRA for them.",
  },
};
export function pickGlossary(code: string) {
  if (code?.includes("ptet")) return GLOSSARY.ptet;
  if (code?.includes("199a") || code?.includes("qbi")) return GLOSSARY.qbi;
  if (code?.includes("cost")) return GLOSSARY.cost_seg;
  if (code?.includes("augusta")) return GLOSSARY.augusta;
  if (code?.includes("employ")) return GLOSSARY.employ_kids;
  return null;
}

