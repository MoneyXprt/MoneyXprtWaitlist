'use client';

import { useState } from 'react';
import { TaxScanForm } from '@/components/tax/TaxScanForm';
import { TaxAnalysisResults } from '@/components/tax/TaxAnalysisResults';
import type { TaxInfo } from '@/lib/taxStrategies';
import type { Strategy } from '@/lib/taxStrategies';

export default function TaxScanPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Strategy[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTaxScan = async (taxInfo: TaxInfo) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taxInfo),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to analyze tax strategies');
      }

      const data = await response.json();
      setResults(data.strategies);
    } catch (err) {
      console.error('Error analyzing tax strategies:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze tax strategies');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        {!results ? (
          <>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tax Strategy Scan</h1>
              <p className="text-muted-foreground mt-2">
                Enter your financial details below to discover personalized tax-saving opportunities.
              </p>
            </div>

            <TaxScanForm onSubmit={handleTaxScan} loading={loading} />

            {error && (
              <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
          </>
        ) : (
          <TaxAnalysisResults 
            strategies={results} 
            onReset={handleReset} 
          />
        )}
      </div>
    </div>
  );
}