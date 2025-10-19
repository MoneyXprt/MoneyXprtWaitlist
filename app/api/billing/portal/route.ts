// Node runtime for Stripe + Supabase
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE) as string
    )

    const { data: bp, error: sbErr } = await supabase
      .from('billing_profiles')
      .select('stripe_customer_id')
      .eq('email', email)
      .maybeSingle()

    if (sbErr) {
      return NextResponse.json({ error: sbErr.message }, { status: 500 })
    }
    if (!bp?.stripe_customer_id) {
      return NextResponse.json({ error: 'customer not found' }, { status: 404 })
    }

    const Stripe = (await import('stripe')).default
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not set' }, { status: 500 })
    }
    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' })

    const origin = new URL(req.url).origin
    const session = await stripe.billingPortal.sessions.create({
      customer: bp.stripe_customer_id,
      return_url: `${origin}/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    try {
      const Sentry = await import('@sentry/nextjs')
      Sentry.captureException(e)
    } catch {}
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 })
  }
}

