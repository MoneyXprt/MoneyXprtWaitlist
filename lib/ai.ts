import OpenAI from 'openai'
import { env } from '@/lib/config/env'
import { sha256Hex } from './crypto'
import { redactPII, sanitizeForAI, safeLog } from './redact'

/**
 * Secure server-side AI utility with no logging of prompts/outputs
 * Designed for privacy-compliant financial AI interactions
 */

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

export interface AIRequest {
  prompt: string
  context?: string
  systemPrompt?: string
  userId?: string
  maxTokens?: number
  temperature?: number
}

export interface AIResponse {
  response: string
  requestHash: string
  hasPII: boolean
  sanitized: boolean
  error?: string
}

/**
 * Make a secure AI request with automatic PII protection
 * No logging of actual prompts or responses for privacy
 */
// Simple chat function for direct OpenAI calls
export async function chat(messages: Array<{role: string, content: string}>): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.2
    })
    
    return response.choices[0]?.message?.content || 'No response generated'
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return `Error: ${error.message || 'Failed to generate response'}`
  }
}

export async function secureAIRequest(request: AIRequest): Promise<AIResponse> {
  const {
    prompt,
    context = '',
    systemPrompt = getDefaultSystemPrompt(),
    userId,
    maxTokens = 500,
    temperature = 0.2
  } = request

  // Generate request hash for tracking without storing content
  const requestHash = sha256Hex(`${prompt}:${context}:${Date.now()}`)

  try {
    // Validate API key
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    // Sanitize inputs for PII
    const { sanitized: sanitizedPrompt, hasPII: promptHasPII } = sanitizeForAI(prompt)
    const { sanitized: sanitizedContext, hasPII: contextHasPII } = sanitizeForAI(context)
    
    const hasPII = promptHasPII || contextHasPII
    const sanitized = hasPII

    // Log request metadata only (no content)
    safeLog('info', `AI request initiated`, {
      requestHash,
      userId: userId ? sha256Hex(userId).substring(0, 8) : undefined,
      hasPII,
      sanitized,
      promptLength: prompt.length,
      contextLength: context.length
    })

    // Prepare messages
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system' as const, content: systemPrompt },
      ...(sanitizedContext ? [{ role: 'system' as const, content: `Context: ${sanitizedContext}` }] : []),
      { role: 'user' as const, content: sanitizedPrompt }
    ]

    // Make OpenAI request
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      temperature,
      max_tokens: maxTokens,
      messages
    })

    const response = completion.choices[0]?.message?.content?.trim() || ''

    // Log completion metadata only (no content)
    safeLog('info', `AI request completed`, {
      requestHash,
      responseLength: response.length,
      tokensUsed: completion.usage?.total_tokens || 0,
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0
    })

    return {
      response,
      requestHash,
      hasPII,
      sanitized
    }

  } catch (error: any) {
    // Log error metadata only
    safeLog('error', `AI request failed`, {
      requestHash,
      error: error.message,
      userId: userId ? sha256Hex(userId).substring(0, 8) : undefined
    })

    return {
      response: '',
      requestHash,
      hasPII: false,
      sanitized: false,
      error: error.message || 'Unknown error'
    }
  }
}

/**
 * Get default MoneyXprt system prompt
 */
function getDefaultSystemPrompt(): string {
  return `
You are **MoneyXprt**, an AI financial co-pilot for high-income W-2 earners and real estate investors.

Follow these rules, always:
- Be concise, step-by-step, and actionable.
- Never present generated, inferred, or speculative content as fact. Label with [Unverified] or [Inference] when applicable.
- Ask targeted clarifying questions if info is missing.
- Avoid guarantees or absolutes ("prevents," "ensures," "guarantees"). If the user asks for certainty, explain limits.
- Prefer Next.js + Supabase + Tailwind + Vercel patterns in code suggestions.
- When code is needed, provide copy-paste blocks with minimal explanation.

Output format:
- Short paragraphs, bullets when helpful.
- If advice depends on missing inputs, start with "Assumptions:" and label them [Unverified].
- Always include appropriate disclaimers for financial advice.

Privacy Notice: User data has been automatically sanitized to protect PII.
`
}

/**
 * Specialized AI request for tax optimization
 */
export async function taxScanRequest(prompt: string, userContext?: string, userId?: string): Promise<AIResponse> {
  const systemPrompt = `
You are **MoneyXprt Tax Scanner**, specializing in tax optimization for high-income earners.

Core function: Analyze tax situations and identify optimization opportunities.

Rules:
- Focus on legitimate tax strategies: retirement contributions, HSAs, tax-loss harvesting, entity structures
- Never guarantee tax savings amounts
- Always include "consult a tax professional" disclaimers
- Prioritize highest-impact strategies first
- Label estimates with [Estimated] tags

Specialties: High-income tax brackets, real estate investor benefits, business entity optimization, retirement strategies.
`

  return secureAIRequest({
    prompt,
    context: userContext,
    systemPrompt,
    userId,
    maxTokens: 600
  })
}

/**
 * Specialized AI request for entity optimization
 */
export async function entityOptRequest(prompt: string, userContext?: string, userId?: string): Promise<AIResponse> {
  const systemPrompt = `
You are **MoneyXprt Entity Optimizer**, specializing in business structure optimization.

Core function: Recommend optimal entity formations for tax efficiency and liability protection.

Rules:
- Compare 2-3 most relevant entity options with pros/cons
- Include setup costs and compliance requirements with [Estimated] labels
- Never guarantee legal protection or tax savings
- Always include "consult an attorney and CPA" disclaimers
- Focus on legitimate structures: LLC, S-Corp, Solo 401k, real estate holding companies

Specialties: Real estate holding structures, high-income optimization, multi-state considerations, self-employment tax.
`

  return secureAIRequest({
    prompt,
    context: userContext,
    systemPrompt,
    userId,
    maxTokens: 600
  })
}

/**
 * Specialized AI request for fee analysis
 */
export async function feeCheckRequest(prompt: string, userContext?: string, userId?: string): Promise<AIResponse> {
  const systemPrompt = `
You are **MoneyXprt Fee Checker**, specializing in investment and financial service fee analysis.

Core function: Analyze fees and identify cost optimization opportunities.

Rules:
- Calculate annual fee impact with [Estimated] labels
- Provide specific low-cost alternatives
- Show long-term compounding impact of fee reductions
- Never guarantee savings amounts
- Include "review all fee disclosures" disclaimers
- Emphasize low-cost index funds and fee-only advisors

Specialties: Investment management fees, real estate costs, advisor structures, high-net-worth fee negotiation.
`

  return secureAIRequest({
    prompt,
    context: userContext,
    systemPrompt,
    userId,
    maxTokens: 600
  })
}

/**
 * Batch process multiple AI requests with rate limiting
 */
export async function batchAIRequests(requests: AIRequest[], delayMs: number = 1000): Promise<AIResponse[]> {
  const responses: AIResponse[] = []
  
  for (const request of requests) {
    const response = await secureAIRequest(request)
    responses.push(response)
    
    // Rate limiting delay
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  return responses
}
