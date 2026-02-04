import { addDoc, collection, doc, getDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Subscription } from '@/lib/matrimony-types';

export async function createSubscription(sub: Omit<Subscription, 'id'>) {
  try {
    // NOTE: In production this should be created/verified by a server-side process after a successful payment gateway webhook.
    // The Firestore security rules in `firestore.rules` assume subscriptions are managed server-side.
    const docRef = await addDoc(collection(db, 'subscriptions'), sub);
    return { id: docRef.id, ...sub } as Subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function getActiveSubscriptionByUser(userId: string) {
  try {
    const q = query(collection(db, 'subscriptions'), where('userId', '==', userId), where('status', '==', 'active'));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0].data() as any;
    return { id: snap.docs[0].id, ...d } as Subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
}

export async function downgradeToFree(userId: string) {
  try {
    const active = await getActiveSubscriptionByUser(userId);
    if (!active) return null;
    const subRef = doc(db, 'subscriptions', active.id as string);
    await updateDoc(subRef, { status: 'expired', updatedAt: new Date().toISOString() });
    // Create a free subscription record for audit
    const freeSub = {
      userId,
      plan: 'free',
      startDate: new Date().toISOString(),
      expiryDate: null,
      status: 'active',
    } as Subscription;
    return await createSubscription(freeSub);
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    throw error;
  }
}

export async function initiateCheckout(userId: string, plan: 'paid' | 'free' = 'paid') {
  try {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error('Failed to create checkout session: ' + text);
    }
    const data = await res.json();
    return data as { url?: string };
  } catch (error) {
    console.error('Error initiating checkout:', error);
    throw error;
  }
}
