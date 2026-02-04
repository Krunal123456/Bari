import { 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider,
  User,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with Google using popup
 * Stores user profile in Firestore on first login
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    // Enable persistence so user stays logged in
    await setPersistence(auth, browserLocalPersistence);
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user profile exists, if not create it
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email,
        photoURL: user.photoURL,
        provider: "google",
        role: "member",
        onboardingComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return user;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    
    // Handle specific errors
    if (error.code === "auth/popup-blocked") {
      throw new Error("Pop-up was blocked. Please enable pop-ups and try again.");
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in was cancelled.");
    } else if (error.code === "auth/network-request-failed") {
      throw new Error("Network error. Please check your internet connection.");
    }
    
    throw error;
  }
}

/**
 * Sign in with Google using redirect (for mobile or pop-up issues)
 */
export async function signInWithGoogleRedirect(): Promise<void> {
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    console.error("Google sign-in redirect error:", error);
    throw error;
  }
}

/**
 * Get Google auth provider (for linking/reauthentication)
 */
export function getGoogleProvider(): GoogleAuthProvider {
  return googleProvider;
}
