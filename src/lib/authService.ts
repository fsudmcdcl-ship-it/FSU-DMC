import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";
import { AdminUser, SystemAdmin } from "../types";

export type { AdminUser };

/**
 * Transforms a Firebase User into standard AdminUser structure.
 */
function mapFirebaseUser(user: FirebaseUser): AdminUser {
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || user.email?.split("@")[0] || "Administrator",
    fullName: user.displayName || user.email?.split("@")[0] || "Administrator",
    username: user.email?.split("@")[0] || "admin",
    photoURL: user.photoURL || undefined,
    emailVerified: user.emailVerified,
    role: "admin",
    status: "active",
    createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now(),
  };
}

/**
 * Retrieves the currently authenticated Firebase User.
 */
export function getCurrentAdminUser(): AdminUser | null {
  const current = auth.currentUser;
  if (!current) return null;
  return mapFirebaseUser(current);
}

/**
 * Global reactive listener for Firebase Authentication state changes.
 */
export function onAdminAuthStateChanged(
  callback: (user: AdminUser | null) => void
): () => void {
  return fbOnAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(mapFirebaseUser(firebaseUser));
    } else {
      callback(null);
    }
  });
}

/**
 * Authenticates an administrator via Firebase Authentication with Email and Password.
 * Only pre-registered administrators created in Firebase Console can log in.
 */
export async function signInAdminWithEmail(
  emailInput: string,
  passwordInput: string
): Promise<AdminUser> {
  const cleanEmail = emailInput.trim();
  const cleanPassword = passwordInput.trim();

  if (!cleanEmail) {
    throw new Error("Please enter your administrator email address.");
  }
  if (!cleanPassword) {
    throw new Error("Please enter your administrator password.");
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    return mapFirebaseUser(cred.user);
  } catch (err: any) {
    console.error("[Firebase Auth Error]:", err);
    let friendlyMessage = "Authentication failed. Please verify your administrator credentials.";
    
    if (
      err.code === "auth/user-not-found" ||
      err.code === "auth/wrong-password" ||
      err.code === "auth/invalid-credential"
    ) {
      friendlyMessage =
        "Invalid administrator email or password. Self-registration is disabled; accounts must be provisioned in the Firebase Console.";
    } else if (err.code === "auth/invalid-email") {
      friendlyMessage = "Please enter a valid administrator email address.";
    } else if (err.code === "auth/too-many-requests") {
      friendlyMessage =
        "Access temporarily blocked due to repeated failed attempts. Please wait a few minutes or reset your password.";
    } else if (err.code === "auth/user-disabled") {
      friendlyMessage = "This administrator account has been disabled in the Firebase Console.";
    } else if (err.code === "auth/network-request-failed") {
      friendlyMessage = "Network error. Please check your internet connection.";
    } else if (err.message) {
      friendlyMessage = err.message;
    }
    
    throw new Error(friendlyMessage);
  }
}

/**
 * Authenticates an administrator via Google Sign-In with Firebase Auth.
 */
export async function signInAdminWithGoogle(): Promise<AdminUser> {
  const provider = new GoogleAuthProvider();
  try {
    const cred = await signInWithPopup(auth, provider);
    return mapFirebaseUser(cred.user);
  } catch (err: any) {
    console.error("[Google Auth Error]:", err);
    throw new Error(err.message || "Google sign-in failed.");
  }
}

/**
 * Sends a password reset link to the registered administrator email using Firebase Auth.
 */
export async function resetPasswordAdmin(emailInput: string): Promise<void> {
  const cleanEmail = emailInput.trim();
  if (!cleanEmail) {
    throw new Error("Please enter your registered administrator email address.");
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (err: any) {
    console.error("[Password Reset Error]:", err);
    let friendlyMessage = "Failed to send password reset email.";
    if (err.code === "auth/user-not-found") {
      friendlyMessage = "No administrator account was found with that email address.";
    } else if (err.code === "auth/invalid-email") {
      friendlyMessage = "Please enter a valid email address.";
    } else if (err.message) {
      friendlyMessage = err.message;
    }
    throw new Error(friendlyMessage);
  }
}

/**
 * Signs out the currently authenticated Firebase administrator.
 */
export async function signOutAdmin(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.error("Sign out error:", err);
  }
}

/**
 * Alias compatibility function for login with credentials.
 */
export async function loginAdminWithCredentials(
  emailOrUser: string,
  pass: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const user = await signInAdminWithEmail(emailOrUser, pass);
    return { success: true, user };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to log in." };
  }
}

export function isFirebaseApiKeyConfigured(): boolean {
  return true;
}

// Deprecated mock admin helpers maintained as stubs for any remaining legacy calls
export function getLocalAdmins(): Record<string, SystemAdmin> {
  return {};
}

export function getAllAdmins(): SystemAdmin[] {
  const current = getCurrentAdminUser();
  if (!current) return [];
  return [
    {
      id: current.uid,
      username: current.username || current.email,
      email: current.email,
      fullName: current.fullName || current.displayName || "Administrator",
      createdAt: current.createdAt || Date.now(),
      role: "admin",
    },
  ];
}

export async function syncAdminsWithFirebase(): Promise<Record<string, SystemAdmin>> {
  return {};
}
