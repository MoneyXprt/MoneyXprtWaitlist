export type FilingStatus = 'Single' | 'MFJ' | 'MFS' | 'HOH' | 'QW';
export type EntityType = 'SCorp' | 'Partnership';
export type RentalType = 'LTR' | 'STR';

export type K1 = {
  type: EntityType;
  ordinaryBusinessIncome: number;
  w2WagesFromEntity?: number;
  section199AInfo?: { w2?: number; ubia?: number };
  state?: string;
};

export type Rental = {
  type: RentalType;
  income: number;
  expenses: number;
  placedInServiceYear?: number;
  improvementsBasis?: number;
  materialParticipationHours?: number;
  mortgageInterest?: number;
  propertyTax?: number;
  insurance?: number;
  considerCostSeg?: boolean;
};

export type Intake = {
  profile: {
    taxYear: number;
    filingStatus: FilingStatus;
    state: string;
    residentStates?: string[];
    ages?: { primary: number; spouse?: number };
    dependents: number;
  };
  wages: {
    w2Wages: number;
    w2Withholding: number;
    stateWithholding?: number;
    otherWithholding?: number;
    estTaxPaid?: number;
  };
  otherIncome: {
    interestIncome?: number;
    dividendsOrdinary?: number;
    dividendsQualified?: number;
    capGainsShort?: number;
    capGainsLong?: number;
    capLossCarryforward?: number;
    rsuTaxableComp?: number;
    otherIncome?: number;
  };
  selfEmployment?: {
    seNetProfit: number;
    seHealthInsurance?: number;
    retirementSolo401kEmployee?: number;
    retirementSolo401kEmployer?: number;
    isQBIEligible?: boolean;
  };
  k1s?: K1[];
  rentals?: Rental[];
  deductions: {
    // SALT components
    useSalesTaxInsteadOfIncome?: boolean;
    stateIncomeTaxPaid: number;
    stateSalesTaxPaid: number;
    realEstatePropertyTax: number;
    personalPropertyTax: number;
    // other itemized lines
    charityCash?: number;
    charityNonCash?: number;
    mortgageInterestPrimary?: number;
    medicalExpenses?: number;
  };
  aboveLine: {
    hsaContribution?: number;
    traditionalIRAContribution?: number;
    rothIRAContribution?: number;
    fsaContribution?: number;
    studentLoanInterest?: number;
  };
  credits?: {
    childCountUnder17?: number;
    dependentCareExpenses?: number;
    evCreditEligible?: boolean;
    educationTuition?: number;
  };
  carryforwards?: {
    capLossCF?: number; // alias of otherIncome.capLossCarryforward if you prefer single source
    nolCF?: number;
    amtnCreditCF?: number;
  };
  elections?: {
    electBonusDepreciation?: boolean;
    elect179?: boolean;
    safeHarborDeMinimis?: boolean;
    groupingElectionRE?: boolean;
    isREProfessional?: boolean;
  };
};
