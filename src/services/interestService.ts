import { collection, addDoc, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function sendInterest(fromUserId: string, toProfileId: string, message?: string) {
  // Basic write - server should enforce rate limits in production
  const docRef = await addDoc(collection(db, 'interests'), {
    fromUserId,
    toProfileId,
    message: message || '',
    createdAt: new Date().toISOString(),
  });

  try {
    // Notify the profile owner about the interest
    const profileRef = doc(db, 'matrimony_profiles', toProfileId);
    const snap = await getDoc(profileRef);
    const ownerId = snap.data()?.userId;
    if (ownerId) {
      const { createNotification } = await import('@/services/notificationService');
      await createNotification(ownerId, 'interest_received', { fromUserId, toProfileId, interestId: docRef.id });
    }
  } catch (err) {
    console.error('Failed to send interest notification:', err);
  }

  return { id: docRef.id };
}

export async function countInterestsToday(userId: string) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const q = query(collection(db, 'interests'), where('fromUserId','==', userId), orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  const count = snap.docs.filter(d => new Date(d.data().createdAt) >= today).length;
  return count;
}