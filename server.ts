import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// CORS & Method preflight support so no browser or proxy rejects PUT/PATCH/DELETE/POST with 405
app.use("/api", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "site-content.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==========================================
// PERSISTENT HELPDESK & COMPLAINT MESSAGES
// ==========================================
export interface ServerMessage {
  id: string;
  name: string;
  className?: string;
  semester?: string;
  contactInfo?: string;
  phone?: string;
  email?: string;
  rollNumber?: string;
  faculty?: string;
  category?: string;
  ticketId?: string;
  trackingCode?: string;
  tag?: string;
  status?: string;
  subject?: string;
  message: string;
  imageUrl?: string;
  isAnonymous?: boolean;
  createdAt: number;
  adminRemarks?: string;
  adminRemarkUpdatedAt?: number;
}

let serverMessages: ServerMessage[] = [];

const SEED_MESSAGES: ServerMessage[] = [
  {
    id: "FSU-COMP-782194",
    name: "Aayush Bhatta",
    faculty: "BBS (Bachelor of Business Studies)",
    semester: "3rd Year",
    className: "BBS 3rd Year",
    phone: "+977 9848712345",
    email: "aayush.bhatta@student.dmc.edu.np",
    category: "Academic & Syllabus",
    tag: "FSU Helpdesk Ticket",
    subject: "[Helpdesk] Academic & Syllabus",
    message:
      "Requesting FWU revised model questions and updated reference book list for Business Statistics and Financial Management for BBS 3rd Year semester exams.",
    status: "In Progress",
    adminRemarks:
      "FSU Academic Secretary has collected the updated question bank from the Central Library. Physical copies are now kept at Help Desk Room 104.",
    adminRemarkUpdatedAt: Date.now() - 3600000 * 5,
    trackingCode: "FSU-COMP-782194",
    ticketId: "FSU-COMP-782194",
    createdAt: Date.now() - 3600000 * 24,
    isAnonymous: false,
  },
  {
    id: "FSU-COMP-640182",
    name: "Anonymous Student",
    faculty: "B.Ed (Bachelor of Education)",
    semester: "4th Semester",
    className: "B.Ed 4th Sem",
    phone: "Confidential",
    contactInfo: "Confidential",
    category: "Hostel & Facilities",
    tag: "Confidential Grievance",
    subject: "Water supply and study hall lighting in Girls' Hostel Wing B",
    message:
      "There has been an intermittent drinking water purifier disruption and 2 fluorescent lights are non-functional in the 2nd-floor study room of Wing B. Kindly arrange maintenance.",
    status: "In Review",
    adminRemarks:
      "Noted and dispatched to DMC Campus Maintenance Overseer. Electrician scheduled for inspection.",
    adminRemarkUpdatedAt: Date.now() - 3600000 * 2,
    trackingCode: "FSU-COMP-640182",
    ticketId: "FSU-COMP-640182",
    createdAt: Date.now() - 3600000 * 48,
    isAnonymous: true,
  },
  {
    id: "FSU-COMP-901438",
    name: "Pooja Joshi",
    faculty: "BA (Bachelor of Arts)",
    semester: "2nd Year",
    className: "BA 2nd Year",
    phone: "+977 9868456789",
    email: "pooja.joshi@gmail.com",
    category: "Scholarship & Welfare",
    tag: "FSU Helpdesk Ticket",
    subject: "Remote Area Student Free-ship Form Submission deadline",
    message:
      "Could the student union clarify if the recommendation letter from the local ward office needs to be notarized for the underprivileged Himalayan scholarship scheme?",
    status: "Resolved",
    adminRemarks:
      "Official ward letter with verified seal is sufficient. Notarization is not required per campus administration guidelines.",
    adminRemarkUpdatedAt: Date.now() - 3600000 * 12,
    trackingCode: "FSU-COMP-901438",
    ticketId: "FSU-COMP-901438",
    createdAt: Date.now() - 3600000 * 72,
    isAnonymous: false,
  },
  {
    id: "contact_1",
    trackingCode: "FSU-COMP-84K2M9",
    ticketId: "FSU-COMP-84K2M9",
    name: "Bipin Singh Dhami",
    className: "Bachelor of Business Studies (BBS)",
    faculty: "Faculty of Management",
    semester: "3rd Year",
    rollNumber: "BBS-2080-14",
    phone: "+977-9848811223",
    contactInfo: "+977-9848811223",
    email: "bipin.dhami@dmcdarchula.edu.np",
    category: "Library & Study Materials",
    tag: "Library & Study Materials",
    subject: "Request for Additional BBS 3rd Year Taxation & Auditing Reference Books",
    message:
      "Respected FSU Committee, the central library currently has limited copies of the latest FWU edition Taxation and Auditing textbooks for BBS 3rd Year. Kindly coordinate with the campus administration to add at least 15 more copies before the upcoming internal assessment.",
    status: "In Review",
    adminRemarks:
      "The FSU Academic Committee has submitted a formal requisition to the Campus Library Section. Additional copies are being procured this week.",
    adminRemarkUpdatedAt: 1784540000000,
    isAnonymous: false,
    createdAt: 1784534400000,
  },
];

// ==========================================
// GLOBAL PERSISTENT SITE CONTENT STORE
// ==========================================
let siteContent: Record<string, any> = {};

function persistContentToFile() {
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(siteContent, null, 2), "utf-8");
  } catch (err) {
    console.error("Could not persist site content to disk:", err);
  }
}

function persistMessagesToFile() {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(serverMessages, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist messages to file:", err);
  }
}

function syncMessagesIntoSiteContent() {
  if (!siteContent.contacts || typeof siteContent.contacts !== "object") {
    siteContent.contacts = {};
  }
  for (const msg of serverMessages) {
    const key = msg.id || msg.trackingCode || msg.ticketId;
    if (key) {
      siteContent.contacts[key] = msg;
    }
  }
}

function initStores() {
  // 1. Load messages
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const content = fs.readFileSync(MESSAGES_FILE, "utf-8");
      const list: ServerMessage[] = JSON.parse(content);
      if (Array.isArray(list) && list.length > 0) {
        serverMessages = list;
      } else {
        serverMessages = [...SEED_MESSAGES];
      }
    } else {
      serverMessages = [...SEED_MESSAGES];
    }
  } catch (err) {
    console.warn("Could not load messages from file:", err);
    serverMessages = [...SEED_MESSAGES];
  }

  // 2. Load site content
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const raw = fs.readFileSync(CONTENT_FILE, "utf-8");
      siteContent = JSON.parse(raw);
    } else {
      const seedPath = path.join(process.cwd(), "rtdb-seed.json");
      if (fs.existsSync(seedPath)) {
        const seedRaw = fs.readFileSync(seedPath, "utf-8");
        siteContent = JSON.parse(seedRaw);
      }
    }
  } catch (err) {
    console.error("Failed to initialize site content store:", err);
    siteContent = {};
  }

  // Merge contacts from siteContent into serverMessages if missing
  if (siteContent.contacts && typeof siteContent.contacts === "object") {
    for (const [k, val] of Object.entries<any>(siteContent.contacts)) {
      if (val && typeof val === "object") {
        const id = val.id || val.trackingCode || val.ticketId || k;
        const exists = serverMessages.some(
          (m) => m.id === id || m.trackingCode === id || m.ticketId === id
        );
        if (!exists) {
          serverMessages.push({ ...val, id });
        }
      }
    }
  }

  syncMessagesIntoSiteContent();
  persistMessagesToFile();
  persistContentToFile();
}

initStores();

// Helper to find a message by id, trackingCode, or ticketId (case-insensitive)
function findMessageIndex(rawParam: string): number {
  const decoded = decodeURIComponent(rawParam || "").trim();
  const upper = decoded.toUpperCase();
  return serverMessages.findIndex(
    (m) =>
      m.id === decoded ||
      (m.id && m.id.toUpperCase() === upper) ||
      (m.trackingCode && m.trackingCode.toUpperCase() === upper) ||
      (m.ticketId && m.ticketId.toUpperCase() === upper)
  );
}

// Helper to upsert a message in both serverMessages and siteContent.contacts
function upsertMessageRecord(idParam: string, payload: Partial<ServerMessage>): ServerMessage {
  const decodedId = decodeURIComponent(idParam || "").trim();
  const idx = findMessageIndex(decodedId);
  const now = Date.now();

  if (idx !== -1) {
    const existing = serverMessages[idx];
    const updated: ServerMessage = {
      ...existing,
      ...payload,
      id: existing.id || decodedId,
      trackingCode: payload.trackingCode || existing.trackingCode || existing.ticketId || existing.id || decodedId,
      ticketId: payload.ticketId || existing.ticketId || existing.trackingCode || existing.id || decodedId,
      adminRemarkUpdatedAt:
        payload.adminRemarks !== undefined || payload.status !== undefined
          ? now
          : existing.adminRemarkUpdatedAt || now,
    };
    serverMessages[idx] = updated;
    if (!siteContent.contacts || typeof siteContent.contacts !== "object") {
      siteContent.contacts = {};
    }
    siteContent.contacts[updated.id] = updated;
    persistMessagesToFile();
    persistContentToFile();
    return updated;
  }

  // Not found in array yet -> check siteContent.contacts or create new record (never 404!)
  const existingFromContacts =
    siteContent.contacts && (siteContent.contacts[decodedId] || siteContent.contacts[ decodedId.toUpperCase() ]);

  const newId = payload.id || decodedId || `FSU-COMP-${Math.floor(100000 + Math.random() * 900000)}`;
  const created: ServerMessage = {
    ...(existingFromContacts || {}),
    ...payload,
    id: newId,
    trackingCode: payload.trackingCode || payload.ticketId || existingFromContacts?.trackingCode || newId,
    ticketId: payload.ticketId || payload.trackingCode || existingFromContacts?.ticketId || newId,
    name: payload.name || existingFromContacts?.name || "Student",
    message: payload.message || existingFromContacts?.message || "",
    status: payload.status || existingFromContacts?.status || "Pending",
    createdAt: payload.createdAt || existingFromContacts?.createdAt || now,
    adminRemarks: payload.adminRemarks ?? existingFromContacts?.adminRemarks ?? "",
    adminRemarkUpdatedAt: now,
  };

  serverMessages.unshift(created);
  if (!siteContent.contacts || typeof siteContent.contacts !== "object") {
    siteContent.contacts = {};
  }
  siteContent.contacts[created.id] = created;
  persistMessagesToFile();
  persistContentToFile();
  return created;
}

// Helper to delete a message from both stores
function deleteMessageRecord(idParam: string): boolean {
  const decoded = decodeURIComponent(idParam || "").trim();
  const upper = decoded.toUpperCase();
  const beforeLen = serverMessages.length;

  serverMessages = serverMessages.filter(
    (m) =>
      m.id !== decoded &&
      (!m.id || m.id.toUpperCase() !== upper) &&
      (!m.trackingCode || m.trackingCode.toUpperCase() !== upper) &&
      (!m.ticketId || m.ticketId.toUpperCase() !== upper)
  );

  if (siteContent.contacts && typeof siteContent.contacts === "object") {
    for (const k of Object.keys(siteContent.contacts)) {
      const item = siteContent.contacts[k];
      if (
        k === decoded ||
        k.toUpperCase() === upper ||
        item?.id?.toUpperCase() === upper ||
        item?.trackingCode?.toUpperCase() === upper ||
        item?.ticketId?.toUpperCase() === upper
      ) {
        delete siteContent.contacts[k];
      }
    }
  }

  persistMessagesToFile();
  persistContentToFile();
  return serverMessages.length < beforeLen;
}

// ==========================================
// CONTENT API ROUTES (/api/content)
// ==========================================

// GET /api/content - Retrieve all site content
app.get("/api/content", (_req, res) => {
  syncMessagesIntoSiteContent();
  res.json({ success: true, data: siteContent });
});

// POST or PUT /api/content - Bulk update or merge site content
const handleBulkContentSave: express.RequestHandler = (req, res) => {
  const payload = req.body?.data !== undefined ? req.body.data : req.body;
  if (payload && typeof payload === "object") {
    siteContent = { ...siteContent, ...payload };
    persistContentToFile();
  }
  res.json({ success: true, data: siteContent });
};
app.post("/api/content", handleBulkContentSave);
app.put("/api/content", handleBulkContentSave);
app.patch("/api/content", handleBulkContentSave);

// GET /api/content/:node/:id - Retrieve a single sub-item
app.get("/api/content/:node/:id", (req, res) => {
  const { node } = req.params;
  const id = decodeURIComponent(req.params.id);
  const collection = siteContent[node];
  if (node === "contacts") {
    const idx = findMessageIndex(id);
    if (idx !== -1) {
      return res.json({ success: true, item: serverMessages[idx], data: serverMessages[idx] });
    }
  }
  const item = collection && typeof collection === "object" ? collection[id] ?? null : null;
  res.json({ success: true, item, data: item });
});

// POST / PUT / PATCH /api/content/:node/:id - Create or update a sub-item in a collection
const handleSubItemSave: express.RequestHandler = (req, res) => {
  const { node } = req.params;
  const id = decodeURIComponent(req.params.id);

  // Support { action: "delete" } via POST for environments that block DELETE
  if (req.body && req.body._action === "delete") {
    if (node === "contacts") {
      deleteMessageRecord(id);
    } else if (siteContent[node] && typeof siteContent[node] === "object") {
      delete siteContent[node][id];
      persistContentToFile();
    }
    return res.json({ success: true, message: "Item deleted successfully." });
  }

  const rawPayload =
    req.body?.item !== undefined
      ? req.body.item
      : req.body?.updates !== undefined
      ? req.body.updates
      : req.body?.data !== undefined
      ? req.body.data
      : req.body;

  if (rawPayload === undefined) {
    return res.status(400).json({ success: false, error: "Missing payload in request body." });
  }

  if (!siteContent[node] || typeof siteContent[node] !== "object") {
    siteContent[node] = {};
  }

  const existing = siteContent[node][id];
  const merged =
    existing && typeof existing === "object" && typeof rawPayload === "object"
      ? { ...existing, ...rawPayload, id: rawPayload.id || existing.id || id }
      : typeof rawPayload === "object"
      ? { ...rawPayload, id: rawPayload.id || id }
      : rawPayload;

  siteContent[node][id] = merged;

  // Keep serverMessages in sync when contacts node is modified
  if (node === "contacts" && merged && typeof merged === "object") {
    upsertMessageRecord(id, merged);
  } else {
    persistContentToFile();
  }

  res.json({ success: true, item: siteContent[node][id], data: siteContent[node][id] });
};

app.post("/api/content/:node/:id", handleSubItemSave);
app.put("/api/content/:node/:id", handleSubItemSave);
app.patch("/api/content/:node/:id", handleSubItemSave);

// DELETE /api/content/:node/:id - Delete a sub-item from a collection
app.delete("/api/content/:node/:id", (req, res) => {
  const { node } = req.params;
  const id = decodeURIComponent(req.params.id);

  if (node === "contacts") {
    deleteMessageRecord(id);
    return res.json({ success: true, message: "Contact record deleted successfully." });
  }

  if (siteContent[node] && siteContent[node][id]) {
    delete siteContent[node][id];
    persistContentToFile();
    return res.json({ success: true, message: "Item deleted successfully." });
  }
  res.json({ success: true, message: "Item was not found or already deleted." });
});

// GET /api/content/:key - Retrieve a specific node
app.get("/api/content/:key", (req, res) => {
  const key = decodeURIComponent(req.params.key);
  if (key === "contacts") {
    syncMessagesIntoSiteContent();
  }
  const nodeData = siteContent[key] !== undefined ? siteContent[key] : {};
  res.json({ success: true, data: nodeData });
});

// POST / PUT / PATCH /api/content/:key - Update an entire node
const handleNodeSave: express.RequestHandler = (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const data = req.body?.data !== undefined ? req.body.data : req.body;
  if (data === undefined) {
    return res.status(400).json({ success: false, error: "Missing 'data' in request body." });
  }

  siteContent[key] = data;
  if (key === "contacts" && data && typeof data === "object") {
    for (const [id, item] of Object.entries<any>(data)) {
      if (item && typeof item === "object") {
        upsertMessageRecord(id, item);
      }
    }
  }
  persistContentToFile();
  res.json({ success: true, data: siteContent[key] });
};

app.post("/api/content/:key", handleNodeSave);
app.put("/api/content/:key", handleNodeSave);
app.patch("/api/content/:key", handleNodeSave);

// DELETE /api/content/:key - Clear a specific node
app.delete("/api/content/:key", (req, res) => {
  const key = decodeURIComponent(req.params.key);
  siteContent[key] = {};
  persistContentToFile();
  res.json({ success: true, message: `Cleared node ${key}.` });
});

// ==========================================
// MESSAGES & TICKETS API ROUTES (/api/messages)
// ==========================================

// GET /api/messages - Retrieve all messages
app.get("/api/messages", (_req, res) => {
  res.json({ success: true, messages: serverMessages, data: serverMessages });
});

// GET /api/messages/track/:code - Student ticket lookup
app.get("/api/messages/track/:code", (req, res) => {
  const idx = findMessageIndex(req.params.code);

  if (idx === -1) {
    return res.json({
      success: false,
      found: false,
      complaint: null,
      error: "Complaint tracking code not found.",
    });
  }

  const match = serverMessages[idx];
  return res.json({
    success: true,
    found: true,
    complaint: {
      ...match,
      id: match.id,
      trackingCode: match.trackingCode || match.ticketId || match.id,
      category: match.category || match.tag || "General Inquiry",
      subject: match.subject || "Student Inquiry / Grievance",
      status: match.status || "In Review",
      createdAt: match.createdAt,
      adminRemarks:
        match.adminRemarks ||
        "Your inquiry is in the institutional queue. The FSU Executive Committee is reviewing the matter.",
      adminRemarkUpdatedAt: match.adminRemarkUpdatedAt || match.createdAt,
      name: match.isAnonymous ? "Anonymous Student" : match.name,
    },
  });
});

// POST /api/messages - Submit a new inquiry or upsert an existing ticket
app.post("/api/messages", (req, res) => {
  const body = req.body?.item || req.body?.messageRecord || req.body || {};

  // Support action-based delete or update over POST /api/messages
  if (body._action === "delete" && (body.id || body.trackingCode || body.ticketId)) {
    const target = body.id || body.trackingCode || body.ticketId;
    deleteMessageRecord(target);
    return res.json({ success: true, message: "Record deleted successfully." });
  }

  if (body._action === "update" && (body.id || body.trackingCode || body.ticketId)) {
    const target = body.id || body.trackingCode || body.ticketId;
    const updated = upsertMessageRecord(target, body);
    return res.json({ success: true, message: updated, data: updated });
  }

  const {
    id: providedId,
    name,
    className,
    semester,
    contactInfo,
    phone,
    email,
    rollNumber,
    faculty,
    category,
    subject,
    message,
    imageUrl,
    isAnonymous,
    tag,
    status,
    adminRemarks,
    trackingCode: providedTrackingCode,
    ticketId: providedTicketId,
  } = body;

  // If an ID/trackingCode is provided and already exists, upsert it cleanly
  const existingKey = providedId || providedTrackingCode || providedTicketId;
  if (existingKey && findMessageIndex(existingKey) !== -1) {
    const updated = upsertMessageRecord(existingKey, body);
    return res.status(200).json({ success: true, message: updated, data: updated });
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, error: "Message content cannot be empty." });
  }

  const generatedNum = Math.floor(100000 + Math.random() * 900000);
  const trackingCode = providedTrackingCode || providedTicketId || providedId || `FSU-COMP-${generatedNum}`;
  const now = Date.now();

  const newMsg: ServerMessage = {
    id: providedId || trackingCode,
    ticketId: providedTicketId || trackingCode,
    trackingCode,
    name: isAnonymous ? "Anonymous Student" : name ? String(name).trim() : "Guest Student",
    className: className || undefined,
    semester: semester || undefined,
    contactInfo: contactInfo || phone || undefined,
    phone: phone || contactInfo || undefined,
    email: email || undefined,
    rollNumber: rollNumber || undefined,
    faculty: faculty || undefined,
    category: category || "General Helpdesk",
    subject: subject || (category ? `[Helpdesk] ${category}` : "Student Inquiry"),
    message: message.trim(),
    imageUrl: imageUrl || undefined,
    isAnonymous: Boolean(isAnonymous),
    tag: tag || (isAnonymous ? "Confidential Grievance" : "FSU Helpdesk Ticket"),
    status: status || "Pending",
    createdAt: body.createdAt || now,
    adminRemarks:
      adminRemarks !== undefined
        ? adminRemarks
        : "Received and registered in the FSU Helpdesk registry.",
    adminRemarkUpdatedAt: now,
  };

  const saved = upsertMessageRecord(newMsg.id, newMsg);
  return res.status(201).json({ success: true, message: saved, data: saved });
});

// GET /api/messages/:id - Retrieve a single message by ID or trackingCode
app.get("/api/messages/:id", (req, res) => {
  const idx = findMessageIndex(req.params.id);
  if (idx === -1) {
    return res.json({
      success: false,
      found: false,
      message: null,
      error: "Message record not found.",
    });
  }
  return res.json({
    success: true,
    found: true,
    message: serverMessages[idx],
    complaint: serverMessages[idx],
    data: serverMessages[idx],
  });
});

// POST / PUT / PATCH /api/messages/:id - Update or upsert a message by ID or trackingCode
const handleUpdateSingleMessage: express.RequestHandler = (req, res) => {
  const targetId = decodeURIComponent(req.params.id);
  const payload =
    req.body?.updates !== undefined
      ? req.body.updates
      : req.body?.item !== undefined
      ? req.body.item
      : req.body?.data !== undefined
      ? req.body.data
      : req.body || {};

  if (payload._action === "delete") {
    deleteMessageRecord(targetId);
    return res.json({ success: true, message: "Record deleted successfully." });
  }

  const updated = upsertMessageRecord(targetId, payload);
  return res.json({ success: true, message: updated, data: updated });
};

app.post("/api/messages/:id", handleUpdateSingleMessage);
app.put("/api/messages/:id", handleUpdateSingleMessage);
app.patch("/api/messages/:id", handleUpdateSingleMessage);

// POST /api/messages/:id/delete - Explicit delete endpoint for proxies that restrict DELETE
app.post("/api/messages/:id/delete", (req, res) => {
  const targetId = decodeURIComponent(req.params.id);
  deleteMessageRecord(targetId);
  return res.json({ success: true, message: "Record deleted successfully." });
});

// DELETE /api/messages/:id - Delete a message (idempotent — returns 200 even if already removed)
app.delete("/api/messages/:id", (req, res) => {
  const targetId = decodeURIComponent(req.params.id);
  deleteMessageRecord(targetId);
  return res.json({ success: true, message: "Record deleted successfully." });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Catch-all for any unmatched /api/* routes so Express never falls through to Vite HTML or 404/405
app.all("/api/*", (req, res) => {
  res.status(200).json({
    success: false,
    error: `Unhandled API endpoint: ${req.method} ${req.originalUrl}`,
  });
});

// Mount Vite middleware (development) or Static serving (production)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
