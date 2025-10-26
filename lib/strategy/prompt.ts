import type { AssessmentInput } from '@/lib/strategy/types'

/**
 * System instructions for MoneyXprt strategy generation.
 * Keep it short but strict: JSON-only output, no prose, no markdown.
 */
export const systemPrompt = [
  'You are MoneyXprt, a tax-planning strategist. Output JSON ONLY — strictly valid and parseable. No markdown, no comments.',
  'Follow CA and 2025 US federal rules where relevant. Assume CA SALT cap workaround via PTET is available; personal SALT cap is $40,000 for CA homeowners in 2025 context (planning assumption).',
  'Before advanced strategies, gate on debt/liquidity: if weighted APR is high or EF < 3 months, prioritize debt/EF actions first.',
  'Return 6-section strategy cards with fields: code, title, plain, why[], savings{amount,currency, cadence, confidence?}, actions[], guardrails[], nuance[], example?. Quantify savings and include timing (one_time/annual/monthly).',
  'Include a debt plan when debts are present (avalanche). Include a five-year plan when applicable. Keep numbers realistic and internally consistent.',
  'STRICT: The entire response must be valid JSON matching the provided schema hint. Do not include code fences or explanations.'
].join(' ')

/**
 * User message builder: embeds the assessment and precomputed metrics to guide the model.
 */
export function userPrompt(input: AssessmentInput, precomputed: any): string {
  // Keep JSON compact; no indentation to discourage the model from extra prose.
  const assessment = JSON.stringify(input)
  const metrics = JSON.stringify(precomputed || {})
  return [
    'Generate a complete strategist result as JSON (no prose).',
    'Use the following assessment and precomputed metrics:',
    `"assessment": ${assessment}`,
    `"metrics": ${metrics}`,
    'Return a single JSON object only.'
  ].join('\n')
}

/**
 * Concise schema hint so the LLM returns compliant JSON for the TypeScript type StrategistResult.
 */
export const jsonSchemaHint = [
  '{',
  '  "assessment": AssessmentInput,',
  '  "strategies": [',
  '    {',
  '      "code": string,',
  '      "title": string,',
  '      "plain": string,',
  '      "why": [string],',
  '      "savings": { "amount": number|null, "currency": "USD", "cadence": "one_time"|"annual"|"monthly", "confidence"?: number },',
  '      "actions": [{ "label": string, "detail"?: string, "link"?: string }],',
  '      "guardrails": [string],',
  '      "nuance": [string],',
  '      "example"?: string,',
  '      "references"?: [{ "title": string, "url": string }]',
  '    }',
  '  ],',
  '  "debtPlan"?: {',
  '    "method": "avalanche",',
  '    "monthlyBudget": number,',
  '    "items": [ { "id": string, "name": string, "kind": string, "balance": number, "aprPercent": number, "minPayment": number, "payoffOrder": number, "monthsToPayoff": number, "interestSaved": number } ],',
  '    "totalInterestSaved": number,',
  '    "debtFreeBy": string,',
  '    "guardrails"?: [string],',
  '    "unlockedMonthly"?: number',
  '  },',
  '  "fiveYear"?: {',
  '    "startYear": number,',
  '    "milestones": [ { "year": number, "summary": string, "actions": [string], "expectedTaxSavings"?: number, "expectedNetWorthChange"?: number, "notes"?: [string] } ],',
  '    "narrative"?: string',
  '  },',
  '  "meta"?: { "generatedAt": string, "version": string, "model"?: string }',
  '}',
  '',
  'Enums: FilingStatus = "Single"|"MFJ"|"MFS"|"HOH"|"QW". Savings cadence = "one_time"|"annual"|"monthly".',
  'Notes: JSON only. No markdown. All numbers must be bare numbers.',
].join('\n')

export default { systemPrompt, userPrompt, jsonSchemaHint }
