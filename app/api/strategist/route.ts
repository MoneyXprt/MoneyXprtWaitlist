import { NextResponse } from 'next/server';
import { loadRules } from '@/lib/strategist/rules';
import { checkEligibility, type UserProfile } from '@/lib/strategist/gates';
import { estimate } from '@/lib/strategist/savings';
import { buildRoadmap } from '@/lib/strategist/roadmap';
import { attachWarnings } from '@/lib/strategist/warnings';
import { rankScore } from '@/lib/strategist/score';

function toNumber(x: any, d = 0): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

function normalizeProfile(payload: any): UserProfile {
  const intake = payload?.intake ?? payload ?? {};

  // Derive a few hints when possible; provide safe fallbacks everywhere
  const se = intake?.selfEmployment || {};
  const deductions = intake?.deductions || {};
  const incomeBlock = intake?.income || {};
  const liquidity = intake?.liquidity || {};
  const housing = intake?.housing || {};

  const profile: UserProfile = {
    cashOnHand: toNumber(liquidity?.cashOnHand ?? intake?.cashOnHand ?? intake?.cash, 0),
    monthlySurplus: Math.max(1, toNumber(liquidity?.monthlySurplus ?? intake?.monthlySurplus, 1000)),
    debts: Array.isArray(intake?.debts)
      ? intake.debts.map((d: any) => ({
          name: String(d?.name || d?.type || ''),
          minPayment: toNumber(d?.minPayment ?? d?.minPmt, 0),
          apr: toNumber(d?.apr),
        }))
      : [],
    income: { side: toNumber(se?.seNetProfit ?? incomeBlock?.side ?? intake?.income?.side, 0) },
    housing: { ownHome: Boolean(housing?.ownHome ?? deductions?.mortgageInterestPrimary ?? deductions?.realEstatePropertyTax ?? deductions?.propertyTax) },
    goals: Array.isArray(payload?.goals) ? payload.goals : [],
    retirement: {
      has401k: Boolean(intake?.retirement?.has401k),
      planAllowsAfterTax: Boolean(intake?.retirement?.planAllowsAfterTax),
      hasNQDC: Boolean(intake?.retirement?.hasNQDC),
    },
  } as any;

  // Attach simple taxes info for SALT warning heuristic
  (profile as any).taxes = {
    stateIncomeTaxPaid: toNumber(deductions?.stateIncomeTaxPaid ?? deductions?.stateTax, 0),
    realEstatePropertyTax: toNumber(deductions?.realEstatePropertyTax ?? deductions?.propertyTax, 0),
  };

  return profile;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const profile = normalizeProfile(body);

    const rules = await loadRules();

    const results = rules.map((rule) => {
      const elig = checkEligibility(profile, rule);

      const savingsEst = elig.ok ? estimate(rule.estFormula, profile) : 0;
      const roadmap = buildRoadmap(rule);

      const base = attachWarnings(profile, rule, { warnings: [] });
      const warnings = base.warnings ?? [];

      const score = rankScore(profile, { savingsEst, eligible: elig.ok }, rule);

      return {
        code: rule.code,
        title: rule.title,
        category: rule.category,
        eligible: elig.ok,
        reasons: elig.reasons,
        savingsEst,
        score,
        roadmap,
        warnings,
      };
    });

    // Sort by score desc, then savingsEst desc
    results.sort((a, b) => (b.score - a.score) || (b.savingsEst - a.savingsEst));

    // Debug log top results (limit 2)
    console.log('[strategist] top results', results.slice(0, 2).map(r => ({ code: r.code, savings: r.savingsEst, score: r.score, eligible: r.eligible })));

    // Also map a UI-compatible array for the current client (back-compat)
    const strategies = results.map((r) => ({
      code: r.code,
      title: r.title,
      category: r.category,
      savings: { amount: r.savingsEst },
      guardrails: r.warnings,
      nuance: r.reasons,
      actions: Array.isArray(r?.roadmap?.next12mo)
        ? r.roadmap.next12mo.map((s: any) => ({ label: `${s.month}: ${s.action}` }))
        : [],
      why: r.reasons,
      plain: r.title,
    }));

    return NextResponse.json({ snapshot: {}, ranked: results, strategies }, { status: 200 });
  } catch (err: any) {
    console.error('[strategist] error', err);
    return new NextResponse(err?.message || 'Failed', { status: 500 });
  }
}
