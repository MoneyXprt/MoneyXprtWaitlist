'use client';

import { useState } from 'react';
import { TaxScanForm } from '@/components/tax/TaxScanForm';
import type { TaxInfo } from '@/lib/taxStrategies';

export default function TaxScanPage() {
  const [loading, setLoading] = useState(false);

  const handleTaxScan = async (taxInfo: TaxInfo) => {
    setLoading(true);
    try {
      // TODO: Implement tax strategy analysis
      console.log('Tax Info:', taxInfo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Strategy Scan</h1>
          <p className="text-muted-foreground mt-2">
            Enter your financial details below to discover personalized tax-saving opportunities.
          </p>
        </div>

        <TaxScanForm onSubmit={handleTaxScan} loading={loading} />
      </div>
    </div>
  );
}