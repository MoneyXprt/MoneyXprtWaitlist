export type FilingStatus = 'Single' | 'MFJ' | 'MFS' | 'HOH' | 'QW';

export function saltCap(filingStatus: FilingStatus, taxYear: number): number {
  // TCJA cap applies 2018–2025; sunsets from 2026 unless Congress changes law.
  if (taxYear <= 2025) return filingStatus === 'MFS' ? 5_000 : 10_000;
  return Number.POSITIVE_INFINITY; // no cap under current law from 2026
}

/**
 * Compute the allowable SALT amount for Schedule A.
 * Choose either income tax OR sales tax (not both), per IRS rule.
 * `pteTaxPaid` is entity-level and does NOT increase Schedule A SALT.
 */
export function computeSaltDeduction(params: {
  taxYear: number;
  filingStatus: FilingStatus;
  useSalesTaxInsteadOfIncome?: boolean;
  stateIncomeTaxPaid?: number;        // personal payments/withholding/estimates
  stateSalesTaxPaid?: number;         // if electing sales tax instead of income tax
  realEstatePropertyTax?: number;     // non-business property
  personalPropertyTax?: number;       // vehicles/boats etc
  pteTaxPaid?: number;                // informational—ignored for Schedule A
}): { allowed: number; cap: number; components: Record<string, number>; note?: string } {
  const {
    taxYear, filingStatus, useSalesTaxInsteadOfIncome = false,
    stateIncomeTaxPaid = 0, stateSalesTaxPaid = 0,
    realEstatePropertyTax = 0, personalPropertyTax = 0, pteTaxPaid = 0,
  } = params;

  const cap = saltCap(filingStatus, taxYear);

  // Pick income OR sales tax component
  const chosenStateTax = useSalesTaxInsteadOfIncome ? stateSalesTaxPaid : stateIncomeTaxPaid;

  const subtotal = Math.max(0,
    chosenStateTax + realEstatePropertyTax + personalPropertyTax
  );

  const allowed = Math.min(subtotal, cap);

  const note = pteTaxPaid > 0
    ? 'PTE taxes are deducted at the entity level and do not increase Schedule A SALT.'
    : undefined;

  return {
    allowed,
    cap,
    components: {
      chosenStateTax,
      realEstatePropertyTax,
      personalPropertyTax,
    },
    note,
  };
}

