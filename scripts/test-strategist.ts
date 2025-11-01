import { POST } from '@/app/api/strategist/route';

async function main() {
  const payload = {
    taxYear: 2025,
    filingStatus: 'MFJ',
    state: 'CA',
    dependents: 1,
    income: { w2: 260000, side: 20000 },
    withholding: { federalYTD: 50000, stateYTD: 25000 },
    deductions: { stateTax: 9000, propertyTax: 8000, mortgageInterest: 13500, charityCash: 5000 },
    housing: { ownHome: true },
    liquidity: { cashOnHand: 25000, monthlySurplus: 2000 },
    debts: [{ type: 'cc', balance: 18000, apr: 0.24, minPmt: 360 }],
    goals: ['reduce taxes', 'start LLC', 'buy STR'],
    riskTolerance: 'medium',
  };

  const req = new Request('http://local/api/strategist', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const res = await POST(req as any);
  const json = await res.json();
  console.log(JSON.stringify(json.ranked.slice(0, 5), null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

