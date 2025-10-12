import Stripe from "stripe";
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { env, assertEnv } from '@/lib/config/env';

export const runtime = 'nodejs';        // ensure Node runtime (not Edge)
export const dynamic = 'force-dynamic'; // webhooks shouldn't be cached

export async function POST(req: Request) {
  try {
    assertEnv(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]);

    const stripe = new Stripe(env.server.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    });

    const sig = headers().get('stripe-signature') ?? '';
    if (!sig) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    // IMPORTANT: use raw text, not JSON
    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        env.server.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err?.message || ''}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // TODO: update Supabase subscription table
        break;
      default:
        // no-op
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Webhook error' }, { status: 500 });
  }
}
