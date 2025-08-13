import { NextResponse } from 'next/server'
import { taxScanRequest } from '@/lib/ai'
import { redactPII } from '@/lib/redact'

// Removed - now using secure AI utilities

// Fake user for now - will be replaced with real auth
const fakeUser = {
  id: 'temp-user-123',
  income: 250000,
  filingStatus: 'married',
  state: 'California',
  hasRealEstate: true
}

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json().catch(() => ({ }))
    const userPrompt = String(prompt ?? '').trim()
    let extra = String(context ?? '').trim()

    if (!userPrompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    // Add fake user context for now (will be replaced with real auth)
    const userContext = `User Profile: Income $${fakeUser.income}, Filing Status: ${fakeUser.filingStatus}, State: ${fakeUser.state}, Real Estate Investor: ${fakeUser.hasRealEstate ? 'Yes' : 'No'}`
    extra = extra ? `${extra}\n${userContext}` : userContext

    // Use secure AI request with automatic PII protection
    const result = await taxScanRequest(userPrompt, extra, fakeUser.id)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ 
      response: result.response,
      metadata: {
        requestHash: result.requestHash,
        hasPII: result.hasPII,
        sanitized: result.sanitized
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}