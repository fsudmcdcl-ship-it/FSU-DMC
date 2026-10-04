import { ref, set, remove, update } from "firebase/database";
import { rtdb } from "./firebase";
import {
  DatabaseState,
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
  } catch {
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
    "portalEntries",
    "upcomingEvents",
    "admins",
    "contacts",
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
 * Fetches server-persisted site content & messages via GET /api/content and GET /api/messages
 * so all visitors and admin sessions have the latest server state.
 */
export async function fetchServerContentState(): Promise<Partial<DatabaseState> | null> {
  try {
    const [contentRes, messagesRes] = await Promise.all([
      fetch("/api/content", { method: "GET", headers: { Accept: "application/json" } }),
      fetch("/api/messages", { method: "GET", headers: { Accept: "application/json" } }),
    ]);

    const mergedState: Partial<DatabaseState> = {};

    if (contentRes.ok) {
      const contentJson = await contentRes.json();
      if (contentJson?.success && contentJson.data && typeof contentJson.data === "object") {
        Object.assign(mergedState, contentJson.data);
      }
    }

    if (messagesRes.ok) {
      const msgJson = await messagesRes.json();
      const list: ContactSubmission[] = Array.isArray(msgJson?.messages)
        ? msgJson.messages
        : Array.isArray(msgJson?.data)
        ? msgJson.data
        : [];
      if (list.length > 0) {
        const contactsMap: Record<string, ContactSubmission> = {
          ...(mergedState.contacts || {}),
        };
        for (const item of list) {
          if (item && (item.id || item.trackingCode)) {
            const idKey = item.id || item.trackingCode!;
            contactsMap[idKey] = { ...item, id: idKey };
          }
        }
        mergedState.contacts = contactsMap;
      }
    }

    // Hydrate local storage with server state
    for (const [k, v] of Object.entries(mergedState)) {
      if (v !== undefined && v !== null) {
        setLocalNodeData(k as keyof DatabaseState, v as any);
      }
    }

    return mergedState;
  } catch {
    return null;
  }
}

/**
 * Fetches all helpdesk/grievance messages from the backend API (`GET /api/messages`)
 * and merges them into the local contacts store.
 */
export async function fetchServerMessages(): Promise<Record<string, ContactSubmission>> {
  const localContacts = getAllLocalContacts();
  try {
    const res = await fetch("/api/messages", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const json = await res.json();
      const list: ContactSubmission[] = Array.isArray(json?.messages)
        ? json.messages
        : Array.isArray(json?.data)
        ? json.data
        : [];
      for (const item of list) {
        if (item && (item.id || item.trackingCode)) {
          const idKey = item.id || item.trackingCode!;
          localContacts[idKey] = {
            ...localContacts[idKey],
            ...item,
            id: idKey,
          };
        }
      }
      setLocalNodeData("contacts", localContacts);
    }
  } catch {
    // Fallback to local contacts if offline
  }
  return localContacts;
}

/**
 * Queries a single complaint by tracking code or ID from the backend API (`GET /api/messages/track/:code`).
 */
export async function fetchTrackedComplaintFromServer(
  codeOrId: string
): Promise<ContactSubmission | null> {
  if (!codeOrId || !codeOrId.trim()) return null;
  const clean = codeOrId.trim();
  try {
    const res = await fetch(`/api/messages/track/${encodeURIComponent(clean)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.success && json.complaint) {
        saveTrackedComplaint(json.complaint);
        return json.complaint as ContactSubmission;
      }
    }
  } catch {
    // Ignore network error and fall back to local/RTDB
  }
  return null;
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
 * Stores locally first, syncs with backend API via POST, then attempts Firebase RTDB sync.
 */
export async function saveNode<K extends keyof DatabaseState>(
  key: K,
  data: DatabaseState[K]
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  // 1. Save locally and broadcast
  setLocalNodeData(key, data);

  // 2. Sync with persistent server API via POST
  let serverSynced = false;
  try {
    const res = await fetch(`/api/content/${encodeURIComponent(String(key))}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    serverSynced = res.ok;
  } catch {
    // Non-blocking server sync fallback
  }

  // 3. Attempt RTDB sync
  try {
    await set(ref(rtdb, String(key)), data);
    return {
      success: true,
      cloudSynced: true,
      message: "Published live to cloud database and saved locally.",
    };
  } catch (err: any) {
    console.warn(
      `[DataService] Cloud sync skipped for node "${String(key)}" (${err?.message || "permission restricted"}).`
    );
    return {
      success: true,
      cloudSynced: serverSynced,
      message: serverSynced
        ? "Saved and published to server storage."
        : "Saved successfully to local storage.",
    };
  }
}

/**
 * Saves a sub-item in a collection node (e.g. contacts, faqs, staff, professors, news, team).
 * Uses POST requests for full proxy compatibility (avoids 404/405 errors).
 */
export async function saveSubItem(
  node: keyof DatabaseState,
  id: string,
  item: any
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  const currentCollection = { ...((getLocalNodeData(node) as any) || {}) };
  const recordWithId = typeof item === "object" && item !== null ? { ...item, id: item.id || id } : item;
  currentCollection[id] = recordWithId;
  setLocalNodeData(node, currentCollection);

  let serverSynced = false;

  if (node === "contacts") {
    syncTrackedComplaintUpdate(id, recordWithId);
    try {
      const msgRes = await fetch(`/api/messages/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recordWithId),
      });
      serverSynced = msgRes.ok;
    } catch {
      // Non-blocking fallback
    }
  }

  try {
    const contentRes = await fetch(
      `/api/content/${encodeURIComponent(String(node))}/${encodeURIComponent(id)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: recordWithId }),
      }
    );
    if (contentRes.ok) serverSynced = true;
  } catch {
    // Non-blocking server sync fallback
  }

  try {
    await set(ref(rtdb, `${String(node)}/${id}`), recordWithId);
    return {
      success: true,
      cloudSynced: true,
      message: "Published live to cloud database.",
    };
  } catch (err: any) {
    console.warn(
      `[DataService] Cloud sync skipped for ${String(node)}/${id} (${err?.message || "permission restricted"}).`
    );
    return {
      success: true,
      cloudSynced: serverSynced,
      message: serverSynced ? "Saved to server storage." : "Saved to local storage.",
    };
  }
}

/**
 * Updates specific fields of a sub-item in a collection node.
 * Uses POST to `/api/messages/:id` and `/api/content/:node/:id` to prevent 404 and 405 errors.
 */
export async function updateSubItem(
  node: keyof DatabaseState,
  id: string,
  updates: Record<string, any>
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  const currentCollection = { ...((getLocalNodeData(node) as any) || {}) };
  if (currentCollection[id]) {
    currentCollection[id] = { ...currentCollection[id], ...updates, id };
  } else {
    // Also check if contact exists in tracked complaints cache
    const existingContact = node === "contacts" ? getTrackedComplaint(id) : null;
    currentCollection[id] = { ...(existingContact || {}), id, ...updates };
  }
  const fullRecord = currentCollection[id];
  setLocalNodeData(node, currentCollection);

  let serverSynced = false;

  if (node === "contacts") {
    syncTrackedComplaintUpdate(id, fullRecord);
    try {
      const res = await fetch(`/api/messages/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullRecord),
      });
      if (res.ok) serverSynced = true;
    } catch {
      // ignore fallback
    }
  }

  try {
    const res = await fetch(
      `/api/content/${encodeURIComponent(String(node))}/${encodeURIComponent(id)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: fullRecord }),
      }
    );
    if (res.ok) serverSynced = true;
  } catch {
    // Non-blocking server sync fallback
  }

  try {
    await update(ref(rtdb, `${String(node)}/${id}`), updates);
    return {
      success: true,
      cloudSynced: true,
      message: "Updated in cloud database.",
    };
  } catch (err: any) {
    console.warn(
      `[DataService] Cloud update skipped for ${String(node)}/${id} (${err?.message || "permission restricted"}).`
    );
    return {
      success: true,
      cloudSynced: serverSynced,
      message: serverSynced ? "Updated on server." : "Updated in local storage.",
    };
  }
}

/**
 * Deletes a sub-item from a collection node.
 * Uses POST with `{ _action: "delete" }` to avoid 405 Method Not Allowed on strict proxies,
 * while backend also supports standard DELETE.
 */
export async function deleteSubItem(
  node: keyof DatabaseState,
  id: string
): Promise<{ success: boolean; cloudSynced: boolean; message: string }> {
  const currentCollection = { ...((getLocalNodeData(node) as any) || {}) };
  delete currentCollection[id];
  setLocalNodeData(node, currentCollection);

  let serverSynced = false;

  if (node === "contacts") {
    syncTrackedComplaintUpdate(id, null);
    try {
      const res = await fetch(`/api/messages/${encodeURIComponent(id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "delete", id }),
      });
      if (res.ok) serverSynced = true;
    } catch {
      // ignore fallback
    }
  }

  try {
    const res = await fetch(
      `/api/content/${encodeURIComponent(String(node))}/${encodeURIComponent(id)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "delete", id }),
      }
    );
    if (res.ok) serverSynced = true;
  } catch {
    // Non-blocking server sync fallback
  }

  try {
    await remove(ref(rtdb, `${String(node)}/${id}`));
    return {
      success: true,
      cloudSynced: true,
      message: "Removed from cloud database.",
    };
  } catch (err: any) {
    console.warn(
      `[DataService] Cloud delete skipped for ${String(node)}/${id} (${err?.message || "permission restricted"}).`
    );
    return {
      success: true,
      cloudSynced: serverSynced,
      message: serverSynced ? "Removed from server." : "Removed from local storage.",
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

    // Also persist inside contacts node so #messages portal sees it immediately
    const currentContacts = { ...((getLocalNodeData("contacts") as any) || {}) };
    const itemId = complaint.id || key;
    currentContacts[itemId] = { ...complaint, id: itemId };
    setLocalNodeData("contacts", currentContacts);
  } catch (e) {
    console.warn("[DataService] Could not cache tracked complaint locally:", e);
  }
}

/**
 * Synchronizes updates/deletions on a contact record with TRACKED_COMPLAINTS_KEY
 */
export function syncTrackedComplaintUpdate(
  id: string,
  updates: Partial<ContactSubmission> | null
): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(TRACKED_COMPLAINTS_KEY);
    const existing: Record<string, ContactSubmission> = raw ? JSON.parse(raw) : {};
    let modified = false;

    for (const [k, v] of Object.entries(existing)) {
      if (k === id || v.id === id || v.trackingCode === id || v.ticketId === id) {
        if (updates === null) {
          delete existing[k];
        } else {
          existing[k] = { ...v, ...updates };
        }
        modified = true;
      }
    }

    if (!modified && updates !== null && (updates.id || updates.trackingCode || id)) {
      const targetKey = updates.trackingCode || updates.id || id;
      existing[targetKey] = { ...(existing[targetKey] || {}), ...(updates as ContactSubmission), id: updates.id || id };
      modified = true;
    }

    if (modified) {
      localStorage.setItem(TRACKED_COMPLAINTS_KEY, JSON.stringify(existing));
    }
  } catch (e) {
    console.warn("[DataService] Could not sync tracked complaint:", e);
  }
}

/**
 * Returns all merged contacts from local node storage + tracked complaints cache.
 */
export function getAllLocalContacts(): Record<string, ContactSubmission> {
  const fromNode = { ...((getLocalNodeData("contacts") as Record<string, ContactSubmission>) || {}) };
  if (typeof window === "undefined") return fromNode;
  try {
    const raw = localStorage.getItem(TRACKED_COMPLAINTS_KEY);
    if (raw) {
      const tracked: Record<string, ContactSubmission> = JSON.parse(raw);
      for (const [, item] of Object.entries(tracked)) {
        if (item && (item.id || item.trackingCode)) {
          const itemKey = item.id || item.trackingCode!;
          // Deduplicate by trackingCode if another record with same trackingCode already exists
          const existingKey = Object.keys(fromNode).find(
            (k) =>
              k === itemKey ||
              (item.trackingCode &&
                (fromNode[k]?.trackingCode === item.trackingCode ||
                  fromNode[k]?.ticketId === item.trackingCode))
          );
          if (existingKey) {
            fromNode[existingKey] = { ...item, ...fromNode[existingKey], id: existingKey };
          } else {
            fromNode[itemKey] = { ...item, id: itemKey };
          }
        }
      }
    }
  } catch {
    // ignore parse error
  }
  return fromNode;
}

/**
 * Finds a complaint by tracking code or ID from local cache or contacts node.
 */
export function getTrackedComplaint(codeOrId: string): ContactSubmission | null {
  if (typeof window === "undefined" || !codeOrId) return null;
  const normalized = codeOrId.trim().toUpperCase().replace(/\s+/g, "");

  try {
    const allContacts = getAllLocalContacts();
    for (const [key, val] of Object.entries(allContacts)) {
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
