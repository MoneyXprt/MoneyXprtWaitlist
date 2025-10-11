import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env, assertEnv } from '@/lib/config/env';

// Use the SDK's pinned API version; require your secret key from env
const stripe = new Stripe(env.server.STRIPE_SECRET_KEY || '');

export async function POST(req: Request) {
  try {
    const { priceId, success_url, cancel_url } = await req.json();

    if (!env.server.STRIPE_SECRET_KEY) {
      assertEnv(["STRIPE_SECRET_KEY"]);
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY is not set' },
        { status: 500 }
      );
    }
    if (!priceId || !success_url || !cancel_url) {
      return NextResponse.json(
        { error: 'Missing priceId, success_url, or cancel_url' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',                   // change to 'payment' if needed
      line_items: [{ price: priceId, quantity: 1 }],
      success_url,
      cancel_url,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create checkout session: ' + (error?.message ?? '') },
      { status: 500 }
    );
  }
}
