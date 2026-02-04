import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function getUserDoc(uid: string) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) };
}

export async function setOnboardingComplete(uid: string) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { onboardingComplete: true, updatedAt: new Date().toISOString() });
}
