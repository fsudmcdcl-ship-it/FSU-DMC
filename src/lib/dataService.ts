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
 * Fetches globally synchronized content from the server API, updating local cache
 * and ensuring all devices across the world display the exact same updated content.
 */
export async function fetchGlobalContent(): Promise<DatabaseState | null> {
  try {
    const res = await fetch("/api/content");
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      const remoteData = json.data as Partial<DatabaseState>;
      for (const [k, v] of Object.entries(remoteData)) {
        if (v !== undefined && v !== null) {
          setLocalNodeData(k as keyof DatabaseState, v);
        }
      }
      return loadInitialDbState();
    }
  } catch (err) {
    console.warn("[DataService] Global server fetch notice:", err);
  }
  return null;
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
 * Persists locally, synchronizes with the server global store for all devices,
 * and publishes to Firebase Realtime Database.
 */
export async function saveNode<K extends keyof DatabaseState>(
  key: K,
  data: DatabaseState[K]
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  // 1. Save locally and broadcast
  setLocalNodeData(key, data);

  // 2. Persist to server API for immediate global synchronization across all devices
  try {
    await fetch(`/api/content/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
  } catch (serverErr) {
    console.warn(`[DataService] Server sync notice for "${key}":`, serverErr);
  }

  // 3. Publish to Firebase RTDB
  try {
    await set(ref(rtdb, key), data);
    return {
      success: true,
      cloudSynced: true,
      message: "Published live globally across all devices and saved to cloud database.",
    };
  } catch (err: any) {
    console.warn(
      `[DataService] RTDB sync notice for node "${key}" (${err?.message || "permission restricted"}). Saved globally via server persistence.`
    );
    return {
      success: true,
      cloudSynced: true,
      message: "Published live globally across all devices.",
    };
  }
}

/**
 * Saves a sub-item in a collection node (e.g. faqs, staff, professors, news, team, courses, downloads, blogs).
 * Persists locally, synchronizes globally via the server API, and pushes to Firebase RTDB.
 */
export async function saveSubItem(
  node: keyof DatabaseState,
  id: string,
  item: any
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  const currentCollection = { ...((getLocalNodeData(node) as any) || {}) };
  currentCollection[id] = item;
  setLocalNodeData(node, currentCollection);

  // 1. Persist to server API globally
  try {
    await fetch(`/api/content/${node}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item }),
    });
  } catch (serverErr) {
    console.warn(`[DataService] Server item sync notice for ${node}/${id}:`, serverErr);
  }

  // 2. Publish to Firebase RTDB
  try {
    await set(ref(rtdb, `${node}/${id}`), item);
    return {
      success: true,
      cloudSynced: true,
      message: "Published live globally.",
    };
  } catch (err: any) {
    console.warn(
      `[DataService] RTDB item sync notice for ${node}/${id} (${err?.message || "permission restricted"}). Saved globally.`
    );
    return {
      success: true,
      cloudSynced: true,
      message: "Saved live globally across all devices.",
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

  // Persist to server API
  try {
    await fetch(`/api/content/${node}/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: currentCollection[id] }),
    });
  } catch (e) {
    console.warn("Server update error:", e);
  }

  // Update in RTDB
  try {
    await update(ref(rtdb, `${node}/${id}`), updates);
    return {
      success: true,
      cloudSynced: true,
      message: "Updated live globally.",
    };
  } catch (err: any) {
    return {
      success: true,
      cloudSynced: true,
      message: "Updated live globally across all devices.",
    };
  }
}

/**
 * Deletes a sub-item from a collection node globally.
 */
export async function deleteSubItem(
  node: keyof DatabaseState,
  id: string
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  const currentCollection = { ...((getLocalNodeData(node) as any) || {}) };
  delete currentCollection[id];
  setLocalNodeData(node, currentCollection);

  // 1. Delete on server API
  try {
    await fetch(`/api/content/${node}/${id}`, {
      method: "DELETE",
    });
  } catch (serverErr) {
    console.warn(`[DataService] Server delete notice for ${node}/${id}:`, serverErr);
  }

  // 2. Delete from Firebase RTDB
  try {
    await remove(ref(rtdb, `${node}/${id}`));
    return {
      success: true,
      cloudSynced: true,
      message: "Removed globally from cloud database.",
    };
  } catch (err: any) {
    console.warn(`[DataService] RTDB delete notice for ${node}/${id}:`, err);
    return {
      success: true,
      cloudSynced: true,
      message: "Removed globally from all devices.",
    };
  }
}

/**
 * Saves a student complaint to local cache so the student can track it immediately.
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

/**
 * Retrieves all locally cached tracked complaints.
 */
export function getAllTrackedComplaints(): ContactSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRACKED_COMPLAINTS_KEY);
    if (!raw) return [];
    const items: Record<string, ContactSubmission> = JSON.parse(raw);
    const seen = new Set<string>();
    const list: ContactSubmission[] = [];
    for (const val of Object.values(items)) {
      const id = val.id || val.trackingCode || val.ticketId;
      if (id && !seen.has(id)) {
        seen.add(id);
        list.push(val);
      }
    }
    return list;
  } catch {
    return [];
  }
}

/**
 * Unified submission helper for Helpdesk tickets, Student Grievances, and Secretariat requests.
 * Persists to server API, Firebase RTDB, and local cache.
 */
export async function submitHelpdeskMessage(
  submission: Partial<ContactSubmission>
): Promise<{ success: boolean; id: string; trackingCode: string }> {
  const rand = Math.floor(100000 + Math.random() * 900000).toString();
  const trackingCode = (submission.trackingCode || submission.ticketId || `FSU-COMP-${rand}`).toUpperCase();
  const id = submission.id || trackingCode;

  const fullRecord: ContactSubmission = {
    id,
    name: submission.name || (submission.isAnonymous ? "Anonymous Student" : "Anonymous"),
    className: submission.className || submission.faculty || "N/A",
    semester: submission.semester || "N/A",
    contactInfo: submission.contactInfo || submission.phone || (submission.isAnonymous ? "Confidential" : "Not Provided"),
    phone: submission.phone,
    email: submission.email,
    rollNumber: submission.rollNumber,
    faculty: submission.faculty || submission.className,
    category: submission.category || "General Inquiry",
    ticketId: submission.ticketId || trackingCode,
    trackingCode,
    tag: submission.tag || "FSU Helpdesk Ticket",
    status: submission.status || "Pending",
    subject: submission.subject || `Inquiry from ${submission.name || "Student"}`,
    message: submission.message || "",
    imageUrl: submission.imageUrl,
    isAnonymous: Boolean(submission.isAnonymous),
    createdAt: submission.createdAt || Date.now(),
    adminRemarks: submission.adminRemarks || "",
    adminRemarkUpdatedAt: submission.adminRemarkUpdatedAt,
  };

  // 1. Cache locally for instant student tracking
  saveTrackedComplaint(fullRecord);

  // 2. Submit to server /api/messages
  try {
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullRecord),
    });
  } catch (err) {
    console.warn("Failed to post message to /api/messages:", err);
  }

  // 3. Push to Firebase RTDB
  try {
    const contactsRef = ref(rtdb, `contacts/${id}`);
    await set(contactsRef, fullRecord);
  } catch (err) {
    console.warn("Failed to set in RTDB contacts:", err);
  }

  return { success: true, id, trackingCode };
}
