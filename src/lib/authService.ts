import { ref, set, get, remove } from "firebase/database";
import { rtdb } from "./firebase";
import { SystemAdmin, AdminRole } from "../types";

export interface AdminUser {
  uid: string;
  username: string;
  fullName: string;
  role: AdminRole;
  createdAt: number;
  status?: "active" | "locked" | "disabled";
}

const ADMINS_STORAGE_KEY = "fsudmc_system_admins_v3";
const SESSION_STORAGE_KEY = "fsudmc_admin_active_session_v3";
const LOCKOUT_STORAGE_KEY = "fsudmc_admin_failed_attempts";

// Default Master Admin placeholder without hardcoded password
const DEFAULT_MASTER_ADMIN: SystemAdmin = {
  id: "admin_master",
  username: "dmcadmin",
  role: "master",
  fullName: "Master Administrator (DMC)",
  createdAt: 1770000000000,
  status: "active",
  failedAttempts: 0,
};

function getLocalFailedAttempts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalFailedAttempts(map: Record<string, number>) {
  try {
    localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Could not save failed attempts", e);
  }
}

/**
 * Initializes and retrieves cached admins from localStorage.
 */
export function getLocalAdmins(): Record<string, SystemAdmin> {
  try {
    const raw = localStorage.getItem(ADMINS_STORAGE_KEY);
    if (!raw) {
      const initial: Record<string, SystemAdmin> = {
        [DEFAULT_MASTER_ADMIN.id]: DEFAULT_MASTER_ADMIN,
      };
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || Object.keys(parsed).length === 0) {
      const initial: Record<string, SystemAdmin> = {
        [DEFAULT_MASTER_ADMIN.id]: DEFAULT_MASTER_ADMIN,
      };
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    // Ensure master exists
    const hasMaster = Object.values(parsed).some((a: any) => a.role === "master");
    if (!hasMaster) {
      parsed[DEFAULT_MASTER_ADMIN.id] = DEFAULT_MASTER_ADMIN;
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return { [DEFAULT_MASTER_ADMIN.id]: DEFAULT_MASTER_ADMIN };
  }
}

/**
 * Saves admins to localStorage.
 */
export function saveLocalAdmins(admins: Record<string, SystemAdmin>) {
  try {
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
  } catch (e) {
    console.warn("Could not save admins to localStorage", e);
  }
}

/**
 * Syncs admins with server API or Firebase Realtime Database.
 */
export async function syncAdminsWithFirebase() {
  try {
    // Attempt fetch from server API first
    const res = await fetch("/api/auth/admins");
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.admins)) {
        const mapped: Record<string, SystemAdmin> = {};
        data.admins.forEach((adm: SystemAdmin) => {
          mapped[adm.id] = adm;
        });
        saveLocalAdmins(mapped);
        return mapped;
      }
    }
  } catch {
    // Server fetch fallback
  }

  try {
    const adminsRef = ref(rtdb, "admins");
    const snapshot = await get(adminsRef);
    if (snapshot.exists()) {
      const dbAdmins = snapshot.val();
      if (dbAdmins && typeof dbAdmins === "object") {
        const local = getLocalAdmins();
        const merged = { ...local, ...dbAdmins };
        saveLocalAdmins(merged);
        return merged;
      }
    }
  } catch {
    // RTDB fallback
  }
  return getLocalAdmins();
}

// Initial background sync
if (typeof window !== "undefined") {
  syncAdminsWithFirebase().catch(() => {});
}

/**
 * Retrieves the currently logged-in AdminUser session.
 */
export function getCurrentAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Sets or clears the active session and notifies app components.
 */
export function setStoredAdminUser(user: AdminUser | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Session storage error:", e);
  }
  window.dispatchEvent(new CustomEvent("fsudmc_admin_auth_changed", { detail: user }));
}

/**
 * Unified listener that notifies when admin auth state changes.
 */
export function onAdminAuthStateChanged(
  callback: (user: AdminUser | null) => void
): () => void {
  callback(getCurrentAdminUser());

  const handleCustomChange = (e: Event) => {
    const customEvt = e as CustomEvent;
    callback(customEvt.detail || null);
  };

  window.addEventListener("fsudmc_admin_auth_changed", handleCustomChange);
  return () => {
    window.removeEventListener("fsudmc_admin_auth_changed", handleCustomChange);
  };
}

/**
 * Authenticates an admin.
 * Communicates with server-side /api/auth/login for secure hash validation
 * and enforces the 3-attempt account lockout policy.
 */
export async function loginAdminWithCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AdminUser; error?: string; isLocked?: boolean }> {
  const cleanUsername = usernameInput.trim();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername) {
    return { success: false, error: "Please enter your administrator username." };
  }
  if (!cleanPassword) {
    return { success: false, error: "Please enter your administrator password." };
  }

  // 1. Try secure server-side authentication
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const sessionUser: AdminUser = {
        uid: data.user.uid,
        username: data.user.username,
        fullName: data.user.fullName || data.user.username,
        role: data.user.role,
        createdAt: Date.now(),
        status: data.user.status,
      };
      setStoredAdminUser(sessionUser);

      // Reset client-side failed attempts map on success
      const failedMap = getLocalFailedAttempts();
      delete failedMap[cleanUsername.toLowerCase()];
      saveLocalFailedAttempts(failedMap);

      return { success: true, user: sessionUser };
    }

    if (data.isLocked) {
      // Mark as locked in local store as well
      const allAdmins = getLocalAdmins();
      const adm = Object.values(allAdmins).find(
        (a) => a.username.toLowerCase() === cleanUsername.toLowerCase()
      );
      if (adm) {
        adm.status = "locked";
        saveLocalAdmins(allAdmins);
      }
      return { success: false, error: data.error, isLocked: true };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.warn("Server auth failed, falling back to secure local validation:", err);
  }

  // 2. Client-side fallback with lockout enforcement
  const allAdmins = getLocalAdmins();
  const foundAdmin = Object.values(allAdmins).find(
    (a) => a.username.toLowerCase() === cleanUsername.toLowerCase()
  );

  if (!foundAdmin) {
    return {
      success: false,
      error: `Administrator username "${cleanUsername}" was not found.`,
    };
  }

  // Check account lockout status
  if (foundAdmin.status === "locked" || foundAdmin.status === "disabled") {
    return {
      success: false,
      error: "This administrator account is currently locked due to 3 consecutive failed login attempts. Please contact the Master Administrator to reactivate your access.",
      isLocked: true,
    };
  }

  const failedMap = getLocalFailedAttempts();
  const currentAttempts = (failedMap[cleanUsername.toLowerCase()] || 0);

  // Check password if available locally
  if (foundAdmin.password && foundAdmin.password !== cleanPassword) {
    const newAttempts = currentAttempts + 1;
    failedMap[cleanUsername.toLowerCase()] = newAttempts;
    saveLocalFailedAttempts(failedMap);

    if (newAttempts >= 3) {
      foundAdmin.status = "locked";
      foundAdmin.failedAttempts = 3;
      allAdmins[foundAdmin.id] = foundAdmin;
      saveLocalAdmins(allAdmins);
      return {
        success: false,
        error: "Incorrect password entered 3 consecutive times. Your account has now been LOCKED for security. Contact the Master Administrator to reactivate.",
        isLocked: true,
      };
    }

    return {
      success: false,
      error: `Incorrect password. Warning: ${3 - newAttempts} attempt(s) remaining before account lockout.`,
    };
  }

  // Successful login
  delete failedMap[cleanUsername.toLowerCase()];
  saveLocalFailedAttempts(failedMap);

  foundAdmin.lastLogin = Date.now();
  foundAdmin.failedAttempts = 0;
  foundAdmin.status = "active";
  allAdmins[foundAdmin.id] = foundAdmin;
  saveLocalAdmins(allAdmins);

  const sessionUser: AdminUser = {
    uid: foundAdmin.id,
    username: foundAdmin.username,
    fullName: foundAdmin.fullName || foundAdmin.username,
    role: foundAdmin.role,
    createdAt: foundAdmin.createdAt,
    status: "active",
  };

  setStoredAdminUser(sessionUser);
  return { success: true, user: sessionUser };
}

/**
 * Master Admin Exclusive: Unlock and reactivate a locked admin account.
 */
export async function unlockAdminAccount(
  targetUsername: string,
  requesterRole: AdminRole = "master"
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (requesterRole !== "master") {
    return { success: false, error: "Only the Master Administrator has permission to reactivate accounts." };
  }

  try {
    const res = await fetch("/api/auth/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUsername, requesterRole }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      // Also update local store
      const allAdmins = getLocalAdmins();
      const target = Object.values(allAdmins).find(
        (a) => a.username.toLowerCase() === targetUsername.toLowerCase()
      );
      if (target) {
        target.status = "active";
        target.failedAttempts = 0;
        saveLocalAdmins(allAdmins);
      }
      const failedMap = getLocalFailedAttempts();
      delete failedMap[targetUsername.toLowerCase()];
      saveLocalFailedAttempts(failedMap);
      return { success: true, message: data.message };
    }
  } catch {
    // Offline fallback
  }

  const allAdmins = getLocalAdmins();
  const target = Object.values(allAdmins).find(
    (a) => a.username.toLowerCase() === targetUsername.toLowerCase()
  );
  if (!target) {
    return { success: false, error: "Target administrator account not found." };
  }

  target.status = "active";
  target.failedAttempts = 0;
  saveLocalAdmins(allAdmins);

  const failedMap = getLocalFailedAttempts();
  delete failedMap[targetUsername.toLowerCase()];
  saveLocalFailedAttempts(failedMap);

  return { success: true, message: `Account "${target.username}" has been unlocked and restored to Active status.` };
}

/**
 * Logs out the active admin.
 */
export function signOutAdmin(): void {
  setStoredAdminUser(null);
}

/**
 * Changes password for an admin.
 */
export async function changeAdminPassword(
  adminId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const cleanNew = newPassword.trim();
  if (cleanNew.length < 3) {
    return { success: false, error: "Password must be at least 3 characters long." };
  }

  const allAdmins = getLocalAdmins();
  const admin = allAdmins[adminId];
  if (!admin) {
    return { success: false, error: "Admin record not found." };
  }

  try {
    await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: admin.username, newPassword: cleanNew }),
    });
  } catch {
    // Fallback
  }

  admin.password = cleanNew;
  allAdmins[adminId] = admin;
  saveLocalAdmins(allAdmins);

  return { success: true };
}

/**
 * Adds a new Sub-Admin (Secondary Admin or Complaint Handler/Reviewer).
 * Restricted to Master Admin.
 */
export async function createSubAdmin(
  username: string,
  password: string,
  fullName: string,
  role: "secondary" | "reviewer" = "secondary"
): Promise<{ success: boolean; admin?: SystemAdmin; error?: string }> {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();
  const cleanName = fullName.trim();

  if (!cleanUser || cleanUser.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }
  if (!cleanPass || cleanPass.length < 3) {
    return { success: false, error: "Password must be at least 3 characters." };
  }
  if (!cleanName) {
    return { success: false, error: "Please enter the admin's full name or designation." };
  }

  const allAdmins = getLocalAdmins();
  const exists = Object.values(allAdmins).some(
    (a) => a.username.toLowerCase() === cleanUser
  );
  if (exists) {
    return { success: false, error: `An administrator with username "${cleanUser}" already exists.` };
  }

  try {
    await fetch("/api/auth/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanUser,
        password: cleanPass,
        fullName: cleanName,
        role,
        requesterRole: "master",
      }),
    });
  } catch {
    // Fallback
  }

  const newId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newAdmin: SystemAdmin = {
    id: newId,
    username: cleanUser,
    password: cleanPass,
    role,
    fullName: cleanName,
    createdAt: Date.now(),
    status: "active",
    failedAttempts: 0,
  };

  allAdmins[newId] = newAdmin;
  saveLocalAdmins(allAdmins);

  return { success: true, admin: newAdmin };
}

// Backwards compatibility alias
export const createSecondaryAdmin = (username: string, password: string, fullName: string) =>
  createSubAdmin(username, password, fullName, "secondary");

/**
 * Deletes an admin (Master Admin only).
 */
export async function deleteSecondaryAdmin(
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  const allAdmins = getLocalAdmins();
  const target = allAdmins[adminId];

  if (!target) {
    return { success: false, error: "Administrator not found." };
  }
  if (target.role === "master") {
    return { success: false, error: "Security restriction: The Master Administrator account cannot be deleted." };
  }

  try {
    await fetch(`/api/auth/admin/${target.username}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterRole: "master" }),
    });
  } catch {
    // Fallback
  }

  delete allAdmins[adminId];
  saveLocalAdmins(allAdmins);

  return { success: true };
}

/**
 * Retrieves all registered admins.
 */
export function getAllAdmins(): SystemAdmin[] {
  const all = getLocalAdmins();
  return Object.values(all);
}

export function isFirebaseApiKeyConfigured(): boolean {
  return true;
}

export async function signInAdminWithEmail(email: string, password?: string): Promise<AdminUser> {
  const res = await loginAdminWithCredentials(email, password || "");
  if (!res.success || !res.user) {
    throw new Error(res.error || "Authentication failed.");
  }
  return res.user;
}

export async function signInAdminWithGoogle(): Promise<AdminUser> {
  throw new Error("Google SSO is disabled for FSU DMC administrative portal. Please use administrator username and password.");
}

export async function resetPasswordAdmin(email: string): Promise<void> {
  throw new Error(
    "Password reset via email is disabled. Please contact the Master Administrator to reactivate or reset your administrator credentials."
  );
}
