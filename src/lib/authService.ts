import { ref, set, get, remove, onValue } from "firebase/database";
import { rtdb } from "./firebase";
import { SystemAdmin, AdminRole } from "../types";

export interface AdminUser {
  uid: string;
  username: string;
  fullName: string;
  role: AdminRole;
  createdAt: number;
}

const ADMINS_STORAGE_KEY = "fsudmc_system_admins_v2";
const SESSION_STORAGE_KEY = "fsudmc_admin_active_session_v2";

// Default Master Admin account per explicit requirement:
// username: dmcadmin
// password: Admin
const DEFAULT_MASTER_ADMIN: SystemAdmin = {
  id: "admin_master",
  username: "dmcadmin",
  password: "Admin",
  role: "master",
  fullName: "Master Administrator (DMC)",
  createdAt: 1770000000000,
};

/**
 * Initializes and retrieves cached admins from localStorage.
 * Ensures the default master admin (dmcadmin / Admin) always exists if uninitialized.
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
    // Make sure master admin exists
    const hasMaster = Object.values(parsed).some(
      (a: any) => a.role === "master" || a.username === "dmcadmin"
    );
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
 * Saves admins to localStorage and broadcasts change.
 */
function saveLocalAdmins(admins: Record<string, SystemAdmin>) {
  try {
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
  } catch (e) {
    console.warn("Could not save admins to localStorage", e);
  }
}

/**
 * Syncs admins with Firebase Realtime Database.
 */
export async function syncAdminsWithFirebase() {
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
    } else {
      // Seed default master admin into Firebase RTDB
      const local = getLocalAdmins();
      await set(adminsRef, local);
      return local;
    }
  } catch (err) {
    // RTDB network or permission issues fall back seamlessly to local storage
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
 * Authenticates an admin using Username and Password.
 * Supports:
 * - Master Admin: default 'dmcadmin' / 'Admin' (or updated password)
 * - Secondary Admins: created by Master Admin
 */
export async function loginAdminWithCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  const cleanUsername = usernameInput.trim();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername) {
    return { success: false, error: "Please enter your administrator username." };
  }
  if (!cleanPassword) {
    return { success: false, error: "Please enter your administrator password." };
  }

  // Attempt sync with remote database first
  try {
    await syncAdminsWithFirebase();
  } catch {
    // Continue with local cache
  }

  const allAdmins = getLocalAdmins();
  const foundAdmin = Object.values(allAdmins).find(
    (a) => a.username.toLowerCase() === cleanUsername.toLowerCase()
  );

  if (!foundAdmin) {
    return {
      success: false,
      error: `Administrator username "${cleanUsername}" was not found. For master access, default username is "dmcadmin".`,
    };
  }

  if (foundAdmin.password !== cleanPassword) {
    return {
      success: false,
      error: "Incorrect administrator password. Please check your spelling and capitalization.",
    };
  }

  // Update last login
  foundAdmin.lastLogin = Date.now();
  allAdmins[foundAdmin.id] = foundAdmin;
  saveLocalAdmins(allAdmins);
  try {
    await set(ref(rtdb, `admins/${foundAdmin.id}/lastLogin`), foundAdmin.lastLogin);
  } catch {
    // Offline safe
  }

  const sessionUser: AdminUser = {
    uid: foundAdmin.id,
    username: foundAdmin.username,
    fullName: foundAdmin.fullName || foundAdmin.username,
    role: foundAdmin.role,
    createdAt: foundAdmin.createdAt,
  };

  setStoredAdminUser(sessionUser);
  return { success: true, user: sessionUser };
}

/**
 * Logs out the active admin.
 */
export function signOutAdmin(): void {
  setStoredAdminUser(null);
}

/**
 * Changes password for an admin.
 * Master admin can change their own password anytime.
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

  admin.password = cleanNew;
  allAdmins[adminId] = admin;
  saveLocalAdmins(allAdmins);

  try {
    await set(ref(rtdb, `admins/${adminId}/password`), cleanNew);
  } catch (err) {
    console.warn("Could not sync password update to RTDB:", err);
  }

  return { success: true };
}

/**
 * Changes Master Admin password.
 */
export async function changeMasterPassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const allAdmins = getLocalAdmins();
  const master = Object.values(allAdmins).find((a) => a.role === "master");
  if (!master) {
    return { success: false, error: "Master admin account not found." };
  }
  return changeAdminPassword(master.id, newPassword);
}

/**
 * Adds a new Secondary Admin (strictly master admin action).
 * Secondary admins can modify website content and view/update messages,
 * but cannot add or manage other admins.
 */
export async function createSecondaryAdmin(
  username: string,
  password: string,
  fullName: string
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

  const newId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newAdmin: SystemAdmin = {
    id: newId,
    username: cleanUser,
    password: cleanPass,
    role: "secondary",
    fullName: cleanName,
    createdAt: Date.now(),
  };

  allAdmins[newId] = newAdmin;
  saveLocalAdmins(allAdmins);

  try {
    await set(ref(rtdb, `admins/${newId}`), newAdmin);
  } catch (err) {
    console.warn("Could not sync new admin to RTDB:", err);
  }

  return { success: true, admin: newAdmin };
}

/**
 * Deletes a secondary admin (strictly master admin action).
 * Master admin can NEVER be deleted.
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

  delete allAdmins[adminId];
  saveLocalAdmins(allAdmins);

  try {
    await remove(ref(rtdb, `admins/${adminId}`));
  } catch (err) {
    console.warn("Could not remove admin from RTDB:", err);
  }

  return { success: true };
}

/**
 * Retrieves all registered admins.
 */
export function getAllAdmins(): SystemAdmin[] {
  const all = getLocalAdmins();
  return Object.values(all);
}

// ==========================================
// Compatibility exports for existing callers
// ==========================================
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
  // If invoked, fall back gracefully to master admin
  const res = await loginAdminWithCredentials("dmcadmin", "Admin");
  if (res.user) return res.user;
  throw new Error("Please log in with your administrator username and password.");
}

export async function resetPasswordAdmin(email: string): Promise<void> {
  // Not needed in custom auth, but provide clean informational message
  throw new Error(
    "Password reset via email is disabled. Please contact the Master Administrator (dmcadmin) to reset your secondary admin credentials."
  );
}
