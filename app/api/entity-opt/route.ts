import { NextResponse } from 'next/server'
import { entityOptRequest } from '@/lib/ai'
import { redactPII } from '@/lib/redact'

// Removed - now using secure AI utilities

// Fake user for now - will be replaced with real auth
const fakeUser = {
  id: 'temp-user-123',
  income: 250000,
  businessType: 'consulting',
  businessRevenue: 75000,
  state: 'California',
  hasEmployees: false,
  hasRealEstate: true
}

export async function POST(req: Request) {
  try {
    // Check for JWT token in header
    const authToken = req.headers.get('x-supabase-auth')
    if (!authToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { prompt, context } = await req.json().catch(() => ({ }))
    const userPrompt = String(prompt ?? '').trim()
    let extra = String(context ?? '').trim()

    if (!userPrompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    // Use authenticated user ID from JWT (simplified for now)
    const userId = `auth-user-${authToken.slice(-8)}`

    // Add fake user context for now (will be replaced with real auth)
    const userContext = `User Profile: W-2 Income $${fakeUser.income}, Business: ${fakeUser.businessType} ($${fakeUser.businessRevenue}/year), State: ${fakeUser.state}, Employees: ${fakeUser.hasEmployees ? 'Yes' : 'No'}, Real Estate: ${fakeUser.hasRealEstate ? 'Yes' : 'No'}`
    extra = extra ? `${extra}\n${userContext}` : userContext

    // Use secure AI request with automatic PII protection
    const result = await entityOptRequest(userPrompt, extra, userId)

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