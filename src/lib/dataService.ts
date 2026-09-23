import { ref, set, get, remove, update } from "firebase/database";
import { rtdb } from "./firebase";
import {
  DatabaseState,
  FaqItem,
  StaffItem,
  ProfessorItem,
  ComplaintTrackingSettings,
  ContactSubmission,
} from "../types";
import { DEFAULT_DB_STATE } from "./defaults";

const STORAGE_PREFIX = "fsudmc_store_v2_";
const DATA_CHANGE_EVENT = "fsudmc_datastore_changed";
const TRACKED_COMPLAINTS_KEY = "fsudmc_tracked_complaints_v2";

/**
 * Retrieves cached data from localStorage for a specific node,
 * falling back to DEFAULT_DB_STATE if uninitialized.
 */
export function getLocalNodeData<K extends keyof DatabaseState>(
  key: K
): DatabaseState[K] {
  if (typeof window === "undefined") {
    return DEFAULT_DB_STATE[key];
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed !== undefined && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    // Fall back to default state on parse error
  }
  return DEFAULT_DB_STATE[key];
}

/**
 * Saves data for a node in localStorage and notifies any reactive listeners.
 */
export function setLocalNodeData<K extends keyof DatabaseState>(
  key: K,
  data: DatabaseState[K]
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
    window.dispatchEvent(
      new CustomEvent(DATA_CHANGE_EVENT, {
        detail: { key, data },
      })
    );
  } catch (e) {
    console.warn(`[DataService] Could not persist node "${key}" locally:`, e);
  }
}

/**
 * Loads the complete initial database state instantly from local storage
 * merged with defaults, ensuring zero wait time and zero missing keys on first render.
 */
export function loadInitialDbState(): DatabaseState {
  const result: any = { ...DEFAULT_DB_STATE };
  const keys: (keyof DatabaseState)[] = [
    "generalSettings",
    "importantNotice",
    "slides",
    "news",
    "courses",
    "downloads",
    "blogs",
    "team",
    "staff",
    "professors",
    "faqs",
    "trackingSettings",
    "admins",
    "contacts",
    "portalEntries",
    "upcomingEvents",
  ];

  for (const key of keys) {
    const local = getLocalNodeData(key);
    if (local !== undefined && local !== null) {
      result[key] = local;
    }
  }

  return result as DatabaseState;
}

/**
 * Subscribes to local storage data changes for instant cross-component updates.
 */
export function onLocalDataChanged(
  callback: (detail: { key: keyof DatabaseState; data: any }) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  window.addEventListener(DATA_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener(DATA_CHANGE_EVENT, handler);
  };
}

/**
 * Saves an entire node (e.g. generalSettings, importantNotice, trackingSettings).
 * Stores locally first, then attempts Firebase RTDB sync.
 * Handles permission/network issues gracefully.
 */
export async function saveNode<K extends keyof DatabaseState>(
  key: K,
  data: DatabaseState[K]
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  // 1. Save locally and broadcast
  setLocalNodeData(key, data);

  // 2. Attempt RTDB sync
  try {
    await set(ref(rtdb, key), data);
    return {
      success: true,
      cloudSynced: true,
      message: "Published live to cloud database and saved locally.",
    };
  } catch (err: any) {
    console.warn(
      `[DataService] Cloud sync skipped for node "${key}" (${err?.message || "permission restricted"}). Saved locally.`
    );
    return {
      success: true,
      cloudSynced: false,
      message:
        "Saved successfully to local storage. (To sync with cloud across all devices, deploy database.rules.json in Firebase Console).",
    };
  }
}

/**
 * Saves a sub-item in a collection node (e.g. faqs, staff, professors, news, team).
 */
export async function saveSubItem(
  node: keyof DatabaseState,
  id: string,
  item: any
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  const currentCollection = { ...((getLocalNodeData(node) as any) || {}) };
  currentCollection[id] = item;
  setLocalNodeData(node, currentCollection);

  try {
    await set(ref(rtdb, `${node}/${id}`), item);
    return {
      success: true,
      cloudSynced: true,
      message: "Published live to cloud database.",
    };
  } catch (err: any) {
    console.warn(
      `[DataService] Cloud sync skipped for ${node}/${id} (${err?.message || "permission restricted"}). Saved locally.`
    );
    return {
      success: true,
      cloudSynced: false,
      message: "Saved to local storage.",
    };
  }
}

/**
 * Updates specific fields of a sub-item in a collection node.
 */
export async function updateSubItem(
  node: keyof DatabaseState,
  id: string,
  updates: Record<string, any>
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  const currentCollection = { ...((getLocalNodeData(node) as any) || {}) };
  if (currentCollection[id]) {
    currentCollection[id] = { ...currentCollection[id], ...updates };
    setLocalNodeData(node, currentCollection);
  }

  try {
    await update(ref(rtdb, `${node}/${id}`), updates);
    return {
      success: true,
      cloudSynced: true,
      message: "Updated in cloud database.",
    };
  } catch (err: any) {
    console.warn(
      `[DataService] Cloud update skipped for ${node}/${id} (${err?.message || "permission restricted"}). Updated locally.`
    );
    return {
      success: true,
      cloudSynced: false,
      message: "Updated in local storage.",
    };
  }
}

/**
 * Deletes a sub-item from a collection node.
 */
export async function deleteSubItem(
  node: keyof DatabaseState,
  id: string
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  const currentCollection = { ...((getLocalNodeData(node) as any) || {}) };
  delete currentCollection[id];
  setLocalNodeData(node, currentCollection);

  try {
    await remove(ref(rtdb, `${node}/${id}`));
    return {
      success: true,
      cloudSynced: true,
      message: "Removed from cloud database.",
    };
  } catch (err: any) {
    console.warn(
      `[DataService] Cloud delete skipped for ${node}/${id} (${err?.message || "permission restricted"}). Removed locally.`
    );
    return {
      success: true,
      cloudSynced: false,
      message: "Removed from local storage.",
    };
  }
}

/**
 * Saves a student complaint to local cache so the student can track it immediately,
 * even before administrative review or if public read permissions are restricted.
 */
export function saveTrackedComplaint(complaint: ContactSubmission): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(TRACKED_COMPLAINTS_KEY);
    const existing: Record<string, ContactSubmission> = raw ? JSON.parse(raw) : {};
    const key = complaint.trackingCode || complaint.ticketId || complaint.id || `comp_${Date.now()}`;
    existing[key] = complaint;
    if (complaint.id) existing[complaint.id] = complaint;
    localStorage.setItem(TRACKED_COMPLAINTS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn("[DataService] Could not cache tracked complaint locally:", e);
  }
}

/**
 * Finds a complaint by tracking code or ID from local cache.
 */
export function getTrackedComplaint(codeOrId: string): ContactSubmission | null {
  if (typeof window === "undefined" || !codeOrId) return null;
  try {
    const raw = localStorage.getItem(TRACKED_COMPLAINTS_KEY);
    if (!raw) return null;
    const items: Record<string, ContactSubmission> = JSON.parse(raw);
    const normalized = codeOrId.trim().toUpperCase().replace(/\s+/g, "");

    for (const [key, val] of Object.entries(items)) {
      const code = (val.trackingCode || val.ticketId || val.id || key).toUpperCase();
      if (code === normalized || key === codeOrId || val.id === codeOrId) {
        return val;
      }
    }
  } catch {
    // Return null on lookup failure
  }
  return null;
}
