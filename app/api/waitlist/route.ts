import { NextResponse } from 'next/server'
import { sbAdmin } from '@/lib/supabase'
import { redactPII } from '@/lib/redact'
import { sha256Hex } from '@/lib/crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}))
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Log request with PII protection
    const requestHash = sha256Hex(`waitlist:${email}:${Date.now()}`)
    console.log(`Waitlist signup request: ${requestHash}`)

    const supabase = sbAdmin()
    const { error } = await supabase
      .from('waitlist')
      .insert({ address: email })

    if (error) {
      // Check for duplicate email
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'Email already registered for waitlist' 
        }, { status: 409 })
      }
      
      console.error('Waitlist insert error:', error.message)
      return NextResponse.json({ 
        error: 'Failed to join waitlist' 
      }, { status: 500 })
    }

    console.log(`Waitlist signup successful: ${requestHash}`)
    return NextResponse.json({ 
      success: true,
      message: 'Successfully joined waitlist!'
    })

  } catch (error: any) {
    console.error('Waitlist API error:', error.message)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}