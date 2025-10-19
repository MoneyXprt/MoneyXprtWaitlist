'use client';
import * as React from 'react';
import type { ResultsV1 } from '@/types/results';
import { ResultCard } from './ResultCard';
import { money } from '@/lib/format';

export default function Results({ data }: { data: ResultsV1 }) {
  const { summary, top3Actions, taxImpact, cashPlan, riskFlags, assumptions, confidence, disclaimers } = data;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 break-words">
      <div className="lg:col-span-2 space-y-4">
        <ResultCard title="Executive Summary">
          <ul className="text-sm list-disc ml-5">
            <li>AGI: <b>{money(summary.householdAGI)}</b> · Filing: {summary.filingStatus}</li>
            <li>Goal: {summary.primaryGoal}</li>
            <li>Confidence: <b>{(confidence*100).toFixed(0)}%</b></li>
          </ul>
        </ResultCard>

        <ResultCard title="Top 3 Actions">
          <ol className="space-y-3 list-decimal ml-5">
            {top3Actions.map((a, i) => (
              <li key={i} className="space-y-1">
                <div className="font-medium">{a.title}</div>
                <div className="text-sm text-muted-foreground">{a.whyItMatters}</div>
                <div className="text-sm">
                  Tax impact: <b>{money(a.estTaxImpact)}</b> · Cash needed: <b>{money(a.cashNeeded)}</b> ·
                  Difficulty: {a.difficulty} · Timeline: {a.timeToImplement}
                </div>
                {a.risks.length > 0 && (
                  <ul className="text-xs text-amber-700 list-disc ml-5">
                    {a.risks.map((r, j) => <li key={j}>{r}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </ResultCard>

        <ResultCard title="Risk Flags">
          <ul className="text-sm list-disc ml-5">{riskFlags.map((r,i)=><li key={i}>{r}</li>)}</ul>
        </ResultCard>

        <ResultCard title="Assumptions">
          <ul className="text-sm list-disc ml-5">{assumptions.map((r,i)=><li key={i}>{r}</li>)}</ul>
        </ResultCard>

        <ResultCard title="Disclaimers">
          <ul className="text-xs text-muted-foreground list-disc ml-5">{disclaimers.map((d,i)=><li key={i}>{d}</li>)}</ul>
        </ResultCard>
      </div>

      <div className="space-y-4">
        <ResultCard title="Tax Impact (Estimates)">
          <div className="text-sm space-y-1">
            <div>This Year: <b>{money(taxImpact.thisYear)}</b></div>
            <div>Next Year: <b>{money(taxImpact.nextYear)}</b></div>
            <div>5-Year: <b>{money(taxImpact['5Year'])}</b></div>
          </div>
        </ResultCard>

        <ResultCard title="Cash Plan">
          <div className="text-sm space-y-1">
            <div>Upfront: <b>{money(cashPlan.upfront)}</b></div>
            <div>Monthly Carry: <b>{money(cashPlan.monthlyCarry)}</b></div>
          </div>
        </ResultCard>
      </div>
    </div>
  );
}
