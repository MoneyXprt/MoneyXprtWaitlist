import type { StrategyRule } from './types';
import type { UserProfile } from './gates';

export type WithWarnings = { warnings?: string[] };

export function attachWarnings(profile: UserProfile, rule: StrategyRule, result: WithWarnings): WithWarnings {
  const msgs = new Set<string>(result.warnings ?? []);

  // Include rule cautions
  for (const c of rule.cautions ?? []) msgs.add(String(c));

  // SALT cap / itemization guard: if state + property tax combined is high (> $10k)
  const stateTax = (profile as any)?.taxes?.stateIncomeTaxPaid ?? 0;
  const propTax = (profile as any)?.taxes?.realEstatePropertyTax ?? 0;
  if (stateTax + propTax > 10_000) {
    msgs.add('SALT cap may limit itemization; compare itemized vs standard deduction.');
  }

  // High-APR debt
  const hasHighApr = (profile.debts ?? []).some((d: any) => typeof d?.apr === 'number' && d.apr >= 0.15);
  if (hasHighApr) {
    msgs.add('High-APR debt (>=15%) detected; prioritize payoff before amplifying strategies.');
  }

  // Profit intent for LLC-QBI
  const code = String(rule.code ?? '').toLowerCase();
  const formula = String(rule.estFormula ?? '').toLowerCase();
  if (code === 'llc-qbi' || formula === 'llc-qbi') {
    msgs.add('QBI requires profit intent and businesslike operations; document activities and separate finances.');
  }

  // STR material participation reminder
  if (code.includes('str') || formula === 'str') {
    msgs.add('STR: Must meet material participation tests; keep contemporaneous hour logs.');
  }

  result.warnings = Array.from(msgs);
  return result;
}

