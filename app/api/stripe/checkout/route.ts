import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Let the SDK's pinned version be used (no apiVersion option)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { priceId, success_url, cancel_url } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',                   // or 'payment' if single charge
      line_items: [{ price: priceId, quantity: 1 }],
      success_url,
      cancel_url,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Stripe error' }, { status: 500 });
  }
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
