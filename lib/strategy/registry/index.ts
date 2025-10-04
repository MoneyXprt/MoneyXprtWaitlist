// lib/strategy/registry/index.ts
import { StrategyRegistryItem } from '../types';

// Registry for MVP: a few representative strategies. Expand iteratively.
export const STRATEGY_REGISTRY: StrategyRegistryItem[] = [
  {
    id: 'qbi_199a',
    name: '§199A Qualified Business Income (QBI)',
    category: 'Entity/Comp',
    description: '20% deduction for qualified pass-through business income, subject to limits.',
    active: true,
    riskLevel: 2,
    eligibility: {
      and: [
        { exists: ['profile.agiEstimate'] },
        { gt: ['profile.agiEstimate', 200000] },
        { exists: ['income'] },
        { gt: ['incomeTotal.qbi', 0] },
      ],
    },
    calc: 'qbi_199a_basic',
  },
  {
    id: 'state_ptet',
    name: 'PTET election (state pass-through)',
    category: 'State/Local',
    description: 'Entity-level tax election to preserve SALT deductibility in conforming states.',
    active: true,
    riskLevel: 2,
    eligibility: {
      and: [
        { in: ['profile.primaryState', ['CA', 'NY', 'TX', 'FL', 'WA', 'IL', 'MN']] },
        { gt: ['incomeTotal.passThru', 0] },
      ],
    },
    calc: 'state_ptet_basic',
  },
  {
    id: 're_cost_seg_bonus',
    name: 'Real Estate: Cost Segregation + Bonus',
    category: 'Real Estate',
    description: 'Accelerate depreciation via cost segregation study and bonus depreciation (phase-down).',
    active: true,
    riskLevel: 3,
    highRiskToggle: false,
    eligibility: {
      and: [
        { gt: ['propertiesTotal.depreciableBasis', 250000] },
        { exists: ['properties'] },
      ],
    },
    calc: 're_cost_seg_bonus_basic',
  },
];

export default STRATEGY_REGISTRY;

