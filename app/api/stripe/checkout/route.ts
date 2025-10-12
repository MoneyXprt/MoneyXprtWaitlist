import { NextResponse } from 'next/server';
import { env, assertEnv } from '@/lib/config/env';

export async function POST(req: Request) {
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(env.server.STRIPE_SECRET_KEY || '');
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
