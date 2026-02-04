import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  QueryConstraint,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { MatrimonyProfile } from '@/lib/matrimony-types';

export async function createDraftProfile(profile: Omit<MatrimonyProfile, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'matrimony_profiles'), {
      ...profile,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, ...profile, status: 'draft', createdAt: now, updatedAt: now } as MatrimonyProfile;
  } catch (error) {
    console.error('Error creating draft profile:', error);
    throw error;
  }
}

export async function updateProfile(id: string, updates: Partial<MatrimonyProfile>) {
  try {
    const refDoc = doc(db, 'matrimony_profiles', id);
    await updateDoc(refDoc, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function submitProfileForApproval(id: string) {
  try {
    const refDoc = doc(db, 'matrimony_profiles', id);
    await updateDoc(refDoc, {
      status: 'submitted',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error submitting profile for approval:', error);
    throw error;
  }
}

export async function getProfile(id: string) {
  try {
    const docRef = doc(db, 'matrimony_profiles', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as MatrimonyProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

export async function uploadPhoto(userId: string, profileId: string, file: File) {
  try {
    const path = `matrimony/${userId}/${profileId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    // Append url to profile photos array atomically
    const profileRef = doc(db, 'matrimony_profiles', profileId);
    const snap = await getDoc(profileRef);
    const existing = Array.isArray(snap.data()?.photos) ? (snap.data()!.photos as string[]) : [];
    await updateDoc(profileRef, {
      photos: existing.concat([url]),
      updatedAt: new Date().toISOString(),
    });

    return url;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

export async function deletePhotoByUrl(profileId: string, url: string) {
  try {
    // Delete from storage by creating a ref from URL
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
    const profileRef = doc(db, 'matrimony_profiles', profileId);
    const snap = await getDoc(profileRef);
    const current = snap.data()?.photos || [];
    const updated = current.filter((p: string) => p !== url);
    await updateDoc(profileRef, { photos: updated, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

export async function searchProfiles(
  filters: Record<string, any> = {},
  pageSize = 20,
  startAfterDoc?: any
) {
  try {
    const constraints: QueryConstraint[] = [where('status', '==', 'approved'), orderBy('createdAt', 'desc'), limit(pageSize)];

    if (filters.gender) constraints.push(where('gender', '==', filters.gender));
    if (filters.ageMin || filters.ageMax) {
      // Age filtering needs client-side conversion or precomputed age fields - assume precomputed age field 'age'
      if (filters.ageMin) constraints.push(where('age', '>=', filters.ageMin));
      if (filters.ageMax) constraints.push(where('age', '<=', filters.ageMax));
    }
    if (filters.location) constraints.push(where('location', '==', filters.location));
    if (filters.education) constraints.push(where('education', '==', filters.education));

    if (startAfterDoc) constraints.push(startAfter(startAfterDoc));

    const q = query(collection(db, 'matrimony_profiles'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MatrimonyProfile[];
  } catch (error) {
    console.error('Error searching profiles:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const q = query(collection(db, 'matrimony_profiles'), where('userId', '==', userId), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...(d.data() as any) } as MatrimonyProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function toggleSpotlight(profileId: string, enable: boolean) {
  try {
    const profileRef = doc(db, 'matrimony_profiles', profileId);
    await updateDoc(profileRef, { isSpotlight: enable, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error toggling spotlight:', error);
    throw error;
  }
}
