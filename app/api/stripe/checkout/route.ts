import { NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required environment variable: STRIPE_SECRET_KEY')
}

if (!process.env.STRIPE_PRICE_ID_STARTER) {
  throw new Error('Missing required environment variable: STRIPE_PRICE_ID_STARTER')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
})

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    const origin = req.headers.get('origin') || 'http://localhost:5000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_STARTER,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?success=1`,
      cancel_url: `${origin}/pricing?canceled=1`,
      client_reference_id: userId, // Store user ID for webhook processing
      metadata: {
        user_id: userId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session: ' + error.message },
      { status: 500 }
    )
  }
}