"use client";

import { useState } from 'react';

export default function AdvisorTestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = {
        filingStatus: 'MFJ',
        state: 'CA',
        dependents: 1,
        income: {
          w2Wages: 306126,
          seNetProfit: 0,
          w2FromEntity: 0,
          entityType: 'None',
        },
        deductions: {
          mortgageInterestPrimary: 13500,
          realEstatePropertyTax: 8274,
          personalPropertyTax: 0,
        },
        cashflow: {
          emergencyFundMonths: 2,
          monthlySurplus: 1200,
        },
        // Not part of schema but included for transparency; API will ignore
        cashAvailable: 20000,
        debts: [
          { id: 'cc1', name: 'Visa Rewards', kind: 'credit_card', balance: 18000, aprPercent: 24, minPayment: 360 },
          { id: 'pl1', name: 'Personal Loan', kind: 'personal', balance: 12000, aprPercent: 12, minPayment: 240 },
        ],
        preferences: {
          wantsSTR: true,
          willingSelfManageSTR: true,
          riskTolerance: 'medium',
        },
      } as any;

      const res = await fetch('/api/strategist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
      setResult(json);
    } catch (e: any) {
      setError(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Advisor · Strategist Test</h1>
      <button
        className="btn"
        onClick={run}
        disabled={loading}
      >
        {loading ? 'Running…' : 'Run Strategist'}
      </button>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {result && (
        <pre className="text-xs whitespace-pre-wrap bg-white border rounded p-3 overflow-auto">
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}

