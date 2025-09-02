'use client';

import { useState } from 'react';

export default function PlannerClient() {
  const [w2Income, setW2Income] = useState('');
  const [rentalUnits, setRentalUnits] = useState('');
  const [sideIncome, setSideIncome] = useState('');
  const [results, setResults] = useState<string | null>(null);

  const handleRun = () => {
    // For now just simulate output
    setResults(
      `Plan created: W-2 Income $${w2Income}, Rentals ${rentalUnits}, Side Income $${sideIncome}`
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block">W-2 Income ($)</label>
        <input
          type="number"
          className="border px-2 py-1 w-full"
          value={w2Income}
          onChange={(e) => setW2Income(e.target.value)}
        />
      </div>

      <div>
        <label className="block">Rental Units (#)</label>
        <input
          type="number"
          className="border px-2 py-1 w-full"
          value={rentalUnits}
          onChange={(e) => setRentalUnits(e.target.value)}
        />
      </div>

      <div>
        <label className="block">Side Income ($)</label>
        <input
          type="number"
          className="border px-2 py-1 w-full"
          value={sideIncome}
          onChange={(e) => setSideIncome(e.target.value)}
        />
      </div>

      <button
        onClick={handleRun}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Run Planner
      </button>

      {results && (
        <div className="mt-4 p-2 border rounded bg-gray-100">{results}</div>
      )}
    </div>
  );
}