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
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, plan } = body;
    if (!userId || !plan) return NextResponse.json({ error: 'userId and plan required' }, { status: 400 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Simple one-time checkout for demo. In production use Product/Price and subscription mode.
    // If Stripe is not configured, create a dev subscription immediately so local testing works without keys
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('STRIPE_SECRET_KEY not set - using dev fallback for checkout session');
      const startDate = new Date().toISOString();
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      try {
        await adminDb.collection('subscriptions').add({
          userId,
          plan,
          startDate,
          expiryDate: expiry.toISOString(),
          status: 'active',
          stripeSessionId: 'dev_fallback_' + Date.now(),
          metadata: { source: 'dev_fallback' },
        });
      } catch (err) {
        // Admin SDK may not be configured in local dev; fallback to client SDK write for convenience
        console.warn('Admin DB write failed, falling back to client SDK write:', err);
        try {
          await addDoc(collection(db, 'subscriptions'), {
            userId,
            plan,
            startDate,
            expiryDate: expiry.toISOString(),
            status: 'active',
            stripeSessionId: 'dev_fallback_' + Date.now(),
            metadata: { source: 'dev_fallback' },
          });
        } catch (err2) {
          console.warn('Fallback client write also failed:', err2);
        }
      }
      const url = `${baseUrl}/matrimony?dev_session=1&status=success`;
      return NextResponse.json({ url });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: 'Bari Samaj Matrimony Premium' },
            unit_amount: 99900, // ₹999.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/matrimony?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${baseUrl}/matrimony/plans?status=cancel`,
      metadata: { userId, plan },
    });

    // Optionally create a lightweight pending subscription record to aid reconciliation (not final until webhook)
    try {
      await adminDb.collection('subscriptions_pending').add({
        userId,
        plan,
        stripeSessionId: session.id,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
    } catch (err) {
      console.warn('Failed to write pending subscription record:', err);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
