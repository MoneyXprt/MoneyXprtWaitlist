import { z } from 'zod';

const filing = z.enum(['Single','MFJ','MFS','HOH','QW']);
const positive = z.coerce.number().min(0).default(0);
const money = z.coerce.number().min(0).default(0);

export const rentalSchema = z.object({
  type: z.enum(['LTR','STR']),
  income: positive,
  expenses: positive,
  placedInServiceYear: z.coerce.number().int().min(1980).max(new Date().getFullYear()).optional(),
  improvementsBasis: positive.optional(),
  materialParticipationHours: positive.optional(),
  mortgageInterest: positive.optional(),
  propertyTax: positive.optional(),
  insurance: positive.optional(),
  considerCostSeg: z.boolean().default(false).optional(),
});

export const k1Schema = z.object({
  type: z.enum(['SCorp','Partnership']),
  ordinaryBusinessIncome: z.coerce.number(),
  w2WagesFromEntity: positive.optional(),
  section199AInfo: z.object({ w2: positive.optional(), ubia: positive.optional() }).optional(),
  state: z.string().max(2).optional(),
});

export const intakeSchema = z.object({
  profile: z.object({
    taxYear: z.coerce.number().int(),
    filingStatus: filing,
    state: z.string().length(2),
    residentStates: z.array(z.string().length(2)).optional(),
    ages: z.object({ primary: z.coerce.number().int().min(18).max(100), spouse: z.coerce.number().int().min(18).max(100).optional() }).optional(),
    dependents: z.coerce.number().int().min(0).default(0),
  }),
  wages: z.object({
    w2Wages: positive,
    w2Withholding: positive,
    stateWithholding: positive.optional(),
    otherWithholding: positive.optional(),
    estTaxPaid: positive.optional(),
  }),
  otherIncome: z.object({
    interestIncome: positive.optional(),
    dividendsOrdinary: positive.optional(),
    dividendsQualified: positive.optional(),
    capGainsShort: positive.optional(),
    capGainsLong: positive.optional(),
    capLossCarryforward: z.coerce.number().default(0).optional(),
    rsuTaxableComp: positive.optional(),
    otherIncome: positive.optional(),
  }),
  selfEmployment: z.object({
    seNetProfit: z.coerce.number(),
    seHealthInsurance: positive.optional(),
    retirementSolo401kEmployee: positive.optional(),
    retirementSolo401kEmployer: positive.optional(),
    isQBIEligible: z.boolean().default(true).optional(),
  }).optional(),
  k1s: z.array(k1Schema).optional(),
  rentals: z.array(rentalSchema).optional(),
  deductions: z.object({
    // SALT components
    useSalesTaxInsteadOfIncome: z.boolean().default(false),
    stateIncomeTaxPaid: money,          // withholding + estimates – refunds
    stateSalesTaxPaid: money,           // used only if toggle is true
    realEstatePropertyTax: money,
    personalPropertyTax: money,

    // other itemized lines
    charityCash: money.optional(),
    charityNonCash: money.optional(),
    mortgageInterestPrimary: money.optional(),
    medicalExpenses: money.optional(),
  }),
  aboveLine: z.object({
    hsaContribution: positive.optional(),
    traditionalIRAContribution: positive.optional(),
    rothIRAContribution: positive.optional(),
    fsaContribution: positive.optional(),
    studentLoanInterest: positive.optional(),
  }),
  credits: z.object({
    childCountUnder17: z.coerce.number().int().min(0).default(0).optional(),
    dependentCareExpenses: positive.optional(),
    evCreditEligible: z.boolean().optional(),
    educationTuition: positive.optional(),
  }).optional(),
  carryforwards: z.object({
    capLossCF: z.coerce.number().default(0).optional(),
    nolCF: z.coerce.number().default(0).optional(),
    amtnCreditCF: z.coerce.number().default(0).optional(),
  }).optional(),
  elections: z.object({
    electBonusDepreciation: z.boolean().optional(),
    elect179: z.boolean().optional(),
    safeHarborDeMinimis: z.boolean().optional(),
    groupingElectionRE: z.boolean().optional(),
    isREProfessional: z.boolean().optional(),
  }).optional(),
});
export type IntakeForm = z.infer<typeof intakeSchema>;
