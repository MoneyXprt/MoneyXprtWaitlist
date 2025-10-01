'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TaxInputField,
  FilingStatusSelect,
  StateSelect,
  MoneyInput,
  ToggleSwitch,
  PercentageSlider
} from './TaxFormComponents';
import type { FilingStatus, StateCode, TaxInfo } from '@/lib/taxStrategies';

interface TaxScanFormProps {
  onSubmit: (taxInfo: TaxInfo) => void;
  loading?: boolean;
}

export function TaxScanForm({ onSubmit, loading = false }: TaxScanFormProps) {
  const [filingStatus, setFilingStatus] = React.useState<FilingStatus>("single");
  const [state, setState] = React.useState<StateCode>("CA");
  const [income, setIncome] = React.useState(0);
  const [hasRetirementPlan, setHasRetirementPlan] = React.useState(false);
  const [currentRetirementContribution, setCurrentRetirementContribution] = React.useState(0);
  const [hasHSA, setHasHSA] = React.useState(false);
  const [hasDependents, setHasDependents] = React.useState(false);
  const [isHomeowner, setIsHomeowner] = React.useState(false);
  const [mortgageInterest, setMortgageInterest] = React.useState(0);
  const [propertyTaxes, setPropertyTaxes] = React.useState(0);
  const [hasBusinessIncome, setHasBusinessIncome] = React.useState(false);
  const [businessIncome, setBusinessIncome] = React.useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      filingStatus,
      state,
      income,
      hasRetirementPlan,
      currentRetirementContribution,
      hasHSA,
      hasDependents,
      isHomeowner,
      mortgageInterest,
      propertyTaxes,
      hasBusinessIncome,
      businessIncome
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TaxInputField label="Filing Status">
              <FilingStatusSelect
                value={filingStatus}
                onChange={setFilingStatus}
              />
            </TaxInputField>

            <TaxInputField label="State">
              <StateSelect
                value={state}
                onChange={setState}
              />
            </TaxInputField>

            <TaxInputField 
              label="Annual Income" 
              hint="Enter your total annual income before taxes"
            >
              <MoneyInput
                value={income}
                onChange={setIncome}
                placeholder="75000"
              />
            </TaxInputField>

            <TaxInputField label="Retirement Plan">
              <ToggleSwitch
                value={hasRetirementPlan}
                onChange={setHasRetirementPlan}
                label="I have access to a retirement plan"
              />
            </TaxInputField>

            {hasRetirementPlan && (
              <TaxInputField 
                label="Current Retirement Contribution" 
                hint="What percentage of your income do you currently contribute?"
              >
                <PercentageSlider
                  value={currentRetirementContribution}
                  onChange={setCurrentRetirementContribution}
                  max={30}
                />
              </TaxInputField>
            )}

            <TaxInputField label="Health Savings Account">
              <ToggleSwitch
                value={hasHSA}
                onChange={setHasHSA}
                label="I have access to an HSA"
              />
            </TaxInputField>

            <TaxInputField label="Dependents">
              <ToggleSwitch
                value={hasDependents}
                onChange={setHasDependents}
                label="I have qualifying dependents"
              />
            </TaxInputField>

            <TaxInputField label="Home Ownership">
              <ToggleSwitch
                value={isHomeowner}
                onChange={setIsHomeowner}
                label="I own a home"
              />
            </TaxInputField>

            {isHomeowner && (
              <>
                <TaxInputField 
                  label="Annual Mortgage Interest" 
                  hint="Enter the total mortgage interest paid last year"
                >
                  <MoneyInput
                    value={mortgageInterest}
                    onChange={setMortgageInterest}
                    placeholder="12000"
                  />
                </TaxInputField>

                <TaxInputField 
                  label="Property Taxes" 
                  hint="Enter your annual property taxes"
                >
                  <MoneyInput
                    value={propertyTaxes}
                    onChange={setPropertyTaxes}
                    placeholder="6000"
                  />
                </TaxInputField>
              </>
            )}

            <TaxInputField label="Business Income">
              <ToggleSwitch
                value={hasBusinessIncome}
                onChange={setHasBusinessIncome}
                label="I have business income"
              />
            </TaxInputField>

            {hasBusinessIncome && (
              <TaxInputField 
                label="Annual Business Income" 
                hint="Enter your total business income before expenses"
              >
                <MoneyInput
                  value={businessIncome}
                  onChange={setBusinessIncome}
                  placeholder="50000"
                />
              </TaxInputField>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Tax Strategies"}
        </Button>
      </div>
    </form>
  );
}