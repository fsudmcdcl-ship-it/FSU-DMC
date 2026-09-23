import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "site-content.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==========================================
// GLOBAL PERSISTENT SITE CONTENT STORE
// ==========================================
let siteContent: Record<string, any> = {};

function initSiteContent() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const raw = fs.readFileSync(CONTENT_FILE, "utf-8");
      siteContent = JSON.parse(raw);
    } else {
      // Seed from rtdb-seed.json if available
      const seedPath = path.join(process.cwd(), "rtdb-seed.json");
      if (fs.existsSync(seedPath)) {
        const seedRaw = fs.readFileSync(seedPath, "utf-8");
        siteContent = JSON.parse(seedRaw);
      }
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(siteContent, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to initialize site content store:", err);
    siteContent = {};
  }
}

function persistContentToFile() {
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(siteContent, null, 2), "utf-8");
  } catch (err) {
    console.error("Could not persist site content to disk:", err);
  }
}

initSiteContent();

// GET /api/content - Retrieve all site content for global device synchronization
app.get("/api/content", (_req, res) => {
  res.json({ success: true, data: siteContent });
});

// GET /api/content/:key - Retrieve a specific node
app.get("/api/content/:key", (req, res) => {
  const { key } = req.params;
  const nodeData = siteContent[key] || null;
  res.json({ success: true, data: nodeData });
});

// POST /api/content/:key - Update an entire node (e.g., generalSettings, importantNotice, faqs)
app.post("/api/content/:key", (req, res) => {
  const { key } = req.params;
  const { data } = req.body;
  if (data === undefined) {
    return res.status(400).json({ success: false, error: "Missing 'data' in request body." });
  }

  siteContent[key] = data;
  persistContentToFile();
  console.log(`[Global Sync] Saved node "${key}" to server persistence across all devices.`);
  res.json({ success: true, data: siteContent[key] });
});

// POST /api/content/:node/:id - Add or update a sub-item in a collection (e.g. news, slides, team, downloads)
app.post("/api/content/:node/:id", (req, res) => {
  const { node, id } = req.params;
  const { item } = req.body;
  if (item === undefined) {
    return res.status(400).json({ success: false, error: "Missing 'item' in request body." });
  }

  if (!siteContent[node] || typeof siteContent[node] !== "object") {
    siteContent[node] = {};
  }

  siteContent[node][id] = item;
  persistContentToFile();
  console.log(`[Global Sync] Saved item "${node}/${id}" to server persistence.`);
  res.json({ success: true, item: siteContent[node][id] });
});

// DELETE /api/content/:node/:id - Delete a sub-item from a collection
app.delete("/api/content/:node/:id", (req, res) => {
  const { node, id } = req.params;
  if (siteContent[node] && siteContent[node][id]) {
    delete siteContent[node][id];
    persistContentToFile();
    console.log(`[Global Sync] Deleted item "${node}/${id}" from server persistence.`);
    return res.json({ success: true, message: "Item deleted successfully." });
  }
  res.json({ success: true, message: "Item was not found or already deleted." });
});

// ==========================================
// PERSISTENT HELPDESK & COMPLAINT MESSAGES
// ==========================================
interface ServerMessage {
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
    message: "Requesting FWU revised model questions and updated reference book list for Business Statistics and Financial Management for BBS 3rd Year semester exams.",
    status: "In Progress",
    adminRemarks: "FSU Academic Secretary has collected the updated question bank from the Central Library. Physical copies are now kept at Help Desk Room 104.",
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
    message: "There has been an intermittent drinking water purifier disruption and 2 fluorescent lights are non-functional in the 2nd-floor study room of Wing B. Kindly arrange maintenance.",
    status: "In Review",
    adminRemarks: "Noted and dispatched to DMC Campus Maintenance Overseer. Electrician scheduled for inspection.",
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
    message: "Could the student union clarify if the recommendation letter from the local ward office needs to be notarized for the underprivileged Himalayan scholarship scheme?",
    status: "Resolved",
    adminRemarks: "Official ward letter with verified seal is sufficient. Notarization is not required per campus administration guidelines.",
    adminRemarkUpdatedAt: Date.now() - 3600000 * 12,
    trackingCode: "FSU-COMP-901438",
    ticketId: "FSU-COMP-901438",
    createdAt: Date.now() - 3600000 * 72,
    isAnonymous: false,
  }
];

function persistMessagesToFile() {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(serverMessages, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist messages to file:", err);
  }
}

function loadPersistedMessages() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const content = fs.readFileSync(MESSAGES_FILE, "utf-8");
      const list: ServerMessage[] = JSON.parse(content);
      if (Array.isArray(list) && list.length > 0) {
        serverMessages = list;
        return;
      }
    }
  } catch (err) {
    console.warn("Could not load messages from file:", err);
  }
  serverMessages = [...SEED_MESSAGES];
  persistMessagesToFile();
}

loadPersistedMessages();

// GET /api/messages - Retrieve all messages
app.get("/api/messages", (_req, res) => {
  res.json({ success: true, messages: serverMessages });
});

// GET /api/messages/track/:code - Student ticket lookup
app.get("/api/messages/track/:code", (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const match = serverMessages.find(
    (m) =>
      (m.trackingCode && m.trackingCode.toUpperCase() === code) ||
      (m.ticketId && m.ticketId.toUpperCase() === code) ||
      (m.id && m.id.toUpperCase() === code)
  );

  if (!match) {
    return res.status(404).json({ success: false, error: "Complaint tracking code not found." });
  }

  return res.json({
    success: true,
    complaint: {
      id: match.id,
      trackingCode: match.trackingCode || match.ticketId || match.id,
      category: match.category || match.tag || "General Inquiry",
      subject: match.subject || "Student Inquiry / Grievance",
      status: match.status || "In Review",
      createdAt: match.createdAt,
      adminRemarks: match.adminRemarks || "Your inquiry is in the institutional queue. The FSU Executive Committee is reviewing the matter.",
      adminRemarkUpdatedAt: match.adminRemarkUpdatedAt || match.createdAt,
      name: match.isAnonymous ? "Anonymous Student" : match.name,
    },
  });
});

// POST /api/messages - Submit a new inquiry or complaint
app.post("/api/messages", (req, res) => {
  const {
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
  } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, error: "Message content cannot be empty." });
  }

  const generatedNum = Math.floor(100000 + Math.random() * 900000);
  const trackingCode = `FSU-COMP-${generatedNum}`;
  const now = Date.now();

  const newMsg: ServerMessage = {
    id: trackingCode,
    ticketId: trackingCode,
    trackingCode,
    name: isAnonymous ? "Anonymous Student" : (name ? name.trim() : "Guest Student"),
    className: className || undefined,
    semester: semester || undefined,
    contactInfo: contactInfo || undefined,
    phone: phone || undefined,
    email: email || undefined,
    rollNumber: rollNumber || undefined,
    faculty: faculty || undefined,
    category: category || "General Helpdesk",
    subject: subject || (category ? `[Helpdesk] ${category}` : "Student Inquiry"),
    message: message.trim(),
    imageUrl: imageUrl || undefined,
    isAnonymous: !!isAnonymous,
    tag: tag || (isAnonymous ? "Confidential Grievance" : "FSU Helpdesk Ticket"),
    status: "Pending",
    createdAt: now,
    adminRemarks: "Received and registered in the FSU Helpdesk registry.",
    adminRemarkUpdatedAt: now,
  };

  serverMessages.unshift(newMsg);
  if (serverMessages.length > 500) {
    serverMessages = serverMessages.slice(0, 500);
  }

  persistMessagesToFile();
  return res.status(201).json({ success: true, message: newMsg });
});

// PATCH /api/messages/:id - Update status & admin remarks
app.patch("/api/messages/:id", (req, res) => {
  const targetId = req.params.id;
  const { status, adminRemarks } = req.body;

  const msgIndex = serverMessages.findIndex(
    (m) => m.id === targetId || m.trackingCode === targetId || m.ticketId === targetId
  );

  if (msgIndex === -1) {
    return res.status(404).json({ success: false, error: "Message record not found." });
  }

  if (status !== undefined) {
    serverMessages[msgIndex].status = status;
  }
  if (adminRemarks !== undefined) {
    serverMessages[msgIndex].adminRemarks = adminRemarks;
  }
  serverMessages[msgIndex].adminRemarkUpdatedAt = Date.now();

  persistMessagesToFile();
  return res.json({ success: true, message: serverMessages[msgIndex] });
});

// DELETE /api/messages/:id - Delete a message
app.delete("/api/messages/:id", (req, res) => {
  const targetId = req.params.id;
  const initialLength = serverMessages.length;
  serverMessages = serverMessages.filter(
    (m) => m.id !== targetId && m.trackingCode !== targetId && m.ticketId !== targetId
  );

  if (serverMessages.length === initialLength) {
    return res.status(404).json({ success: false, error: "Message record not found." });
  }

  persistMessagesToFile();
  return res.json({ success: true, message: "Record deleted successfully." });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
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
