'use client';

import { useState } from 'react';
import TaxEfficiencyCalculator from '@/app/components/TaxEfficiencyCalculator';
import { TaxScenario } from '@/lib/types/tax-efficiency';

export default function TaxEfficiencyPage() {
  const [scenarios, setScenarios] = useState<TaxScenario[]>([]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Tax Efficiency Planning</h1>
          <p className="text-gray-600">
            Optimize your tax structure with advanced planning strategies including entity formation,
            estate planning, and investment optimization. Input your financial details below to receive
            personalized recommendations.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg">
          <TaxEfficiencyCalculator />
        </div>

        <footer className="mt-8 text-sm text-gray-500">
          <p className="mb-2">
            This tax efficiency calculator provides estimates based on current tax laws and simplified
            assumptions. The calculations are for educational purposes only and should not be considered
            tax, legal, or investment advice.
          </p>
          <p>
            Please consult with qualified tax, legal, and financial professionals before implementing
            any tax planning strategies. Tax laws are subject to change and actual results may vary
            significantly based on individual circumstances.
          </p>
        </footer>
      </div>
    </div>
  );
}