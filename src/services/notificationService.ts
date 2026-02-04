import { messaging } from "@/lib/firebase";
import {
  getToken,
  onMessage,
  Unsubscribe,
} from "firebase/messaging";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Request permission and get FCM token for the current user
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) {
    console.warn("Firebase Messaging not supported in this browser");
    return null;
  }

  try {
    // Check if permission is already granted
    const permission = Notification.permission;

    if (permission === "granted") {
      return await getFCMToken();
    } else if (permission === "default") {
      // Request permission
      const result = await Notification.requestPermission();
      if (result === "granted") {
        return await getFCMToken();
      }
    }
    // If permission is "denied", return null
    return null;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
}

/**
 * Get FCM token for the current device
 */
export async function getFCMToken(): Promise<string | null> {
  if (!messaging) {
    console.warn("Firebase Messaging not supported");
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (token) {
      // Store token in Firestore for the current user
      const user = auth.currentUser;
      if (user) {
        await saveFCMToken(user.uid, token);
      }
      return token;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
  return null;
}

/**
 * Save FCM token to Firestore for a user
 */
export async function saveFCMToken(userId: string, token: string) {
  try {
    const userTokenRef = doc(db, "userNotificationTokens", userId);
    await setDoc(
      userTokenRef,
      {
        token,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving FCM token:", error);
  }
}

/**
 * Listen for incoming messages when app is in foreground
 */
export function listenForMessages(
  callback: (payload: any) => void
): Unsubscribe | null {
  if (!messaging) {
    console.warn("Firebase Messaging not supported");
    return null;
  }

  return onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    callback(payload);
  });
}

/**
 * Get all FCM tokens for a list of users (for admin sending notifications)
 */
export async function getUserTokens(userIds: string[]): Promise<string[]> {
  try {
    const tokens: string[] = [];

    for (const userId of userIds) {
      const docRef = doc(db, "userNotificationTokens", userId);
      const docSnap = await getDocs(query(collection(db, "userNotificationTokens"), where("__name__", "==", userId)));
      
      docSnap.forEach((doc) => {
        if (doc.data().token) {
          tokens.push(doc.data().token);
        }
      });
    }

    return tokens;
  } catch (error) {
    console.error("Error getting user tokens:", error);
    return [];
  }
}

/**
 * Delete FCM token when user logs out
 */
export async function removeFCMToken(userId: string) {
  try {
    const userTokenRef = doc(db, "userNotificationTokens", userId);
    await updateDoc(userTokenRef, {
      token: null,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error removing FCM token:", error);
  }
}

/**
 * Create an in-app notification record for a user
 */
export async function createNotification(userId: string, type: string, payload: Record<string, any>) {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      payload,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}
