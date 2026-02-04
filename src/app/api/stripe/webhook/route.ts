import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK on server (requires FIREBASE_SERVICE_ACCOUNT_KEY env in production or ADC locally)
if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) });
  } else {
    admin.initializeApp();
  }
}
const adminDb = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2022-11-15',
});

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  const sig = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;
  try {
    const buf = await req.arrayBuffer();
    const rawBody = Buffer.from(buf);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId as string;
      const plan = (session.metadata?.plan as string) || 'paid';

      // Idempotency check - ensure we don't duplicate subscription documents
      const existingSnap = await adminDb.collection('subscriptions').where('stripeSessionId', '==', session.id).limit(1).get();
      if (existingSnap.empty) {
        const startDate = new Date().toISOString();
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);

        await adminDb.collection('subscriptions').add({
          userId,
          plan,
          startDate,
          expiryDate: expiry.toISOString(),
          status: 'active',
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent || null,
          metadata: { checkout: session },
        });

        // Optionally remove or mark pending record
      }
    }

    // Respond to Stripe
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error handling webhook:', err);
    return new Response('Webhook handler error', { status: 500 });
  }
}
