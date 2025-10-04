"use client";

import { useMemo } from 'react';
import { buildRecommendations, TaxProfile, Entity, IncomeStream, Property } from '@/lib/strategy';

export default function StrategyDemoPage() {
  const { recs } = useMemo(() => {
    const profile: TaxProfile = {
      filingStatus: 'married_joint',
      primaryState: 'CA',
      year: 2025,
      agiEstimate: 650000,
      itemize: true,
    } as any;

    const entities: Entity[] = [{ type: 's_corp', ownershipPct: 100 }];
    const income: IncomeStream[] = [
      { source: 'w2', amount: 300000 },
      { source: 'k1', amount: 220000, qbiFlag: true },
    ];
    const properties: Property[] = [
      {
        use: 'rental_res',
        placedInService: '2023-01-01',
        costBasis: 900000,
        landAllocPct: 20,
        bonusEligible: true,
      },
    ];

    const recs = buildRecommendations(profile, entities, income, properties, { includeHighRisk: false });
    return { recs };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Strategy Demo</h1>
      <p className="text-sm text-neutral-600">
        This demo runs the Tax Strategy Engine locally with sample inputs and shows the recommendation items.
      </p>
      <div className="rounded border p-4">
        {recs.length === 0 ? (
          <p>No recommendations returned for sample data.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {recs.map((r) => (
              <li key={r.strategyId}>
                <span className="font-medium">{r.strategyId}</span> — est. savings ${r.savingsEst.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="text-xs text-neutral-600">
        The engine is pure and runs client-side for this demo. Production will compute on the server.
      </div>
    </div>
  );
}

