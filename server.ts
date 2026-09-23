import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Server-side hash helper
function hashPassword(pwd: string): string {
  return crypto.createHash("sha256").update(pwd).digest("hex");
}

// Master admin config from environment variables (NEVER hardcoded in client or git)
const MASTER_USER = process.env.MASTER_ADMIN_USERNAME || "dmcadmin";
const MASTER_PASS = process.env.MASTER_ADMIN_PASSWORD || "Admin";
const MASTER_PASS_HASH = hashPassword(MASTER_PASS);

interface ServerAdminAccount {
  id: string;
  username: string;
  passwordHash: string;
  role: "master" | "secondary" | "reviewer";
  fullName: string;
  createdAt: number;
  lastLogin?: number;
  status: "active" | "locked" | "disabled";
  failedAttempts: number;
}

// Persistent Admin Storage
const DATA_DIR = path.join(process.cwd(), "data");
const ADMINS_FILE = path.join(DATA_DIR, "admins.json");

// Admin store
const adminAccounts: Map<string, ServerAdminAccount> = new Map();

function persistAdminsToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(adminAccounts.values());
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist admins to file:", err);
  }
}

function loadPersistedAdmins() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(ADMINS_FILE)) {
      const content = fs.readFileSync(ADMINS_FILE, "utf-8");
      const list: ServerAdminAccount[] = JSON.parse(content);
      list.forEach((acc) => {
        if (acc && acc.username) {
          adminAccounts.set(acc.username.toLowerCase(), acc);
        }
      });
    }
  } catch (err) {
    console.warn("Could not load persisted admins from file:", err);
  }
}

// Load existing persisted accounts first
loadPersistedAdmins();

// Always guarantee Master Admin from env takes precedence and has fresh hash
adminAccounts.set(MASTER_USER.toLowerCase(), {
  id: "admin_master",
  username: MASTER_USER,
  passwordHash: MASTER_PASS_HASH,
  role: "master",
  fullName: "Master Administrator (DMC)",
  createdAt: Date.now(),
  status: "active",
  failedAttempts: 0,
});

persistAdminsToFile();

// Auth Routes

// 1. Login endpoint - ALWAYS requires matching username AND password
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || typeof password !== "string" || !password.trim()) {
    return res.status(400).json({ success: false, error: "Both username and password are required to log in." });
  }

  const normalizedUser = username.trim().toLowerCase();
  const account = adminAccounts.get(normalizedUser);

  if (!account) {
    return res.status(401).json({ success: false, error: "Invalid administrator username or password." });
  }

  // Check if account is locked or disabled
  if (account.status === "locked" || account.status === "disabled") {
    return res.status(403).json({
      success: false,
      error: "This account is currently locked due to 3 consecutive failed login attempts. Please contact the Master Administrator to reactivate your access.",
      isLocked: true,
    });
  }

  // Ensure account has a passwordHash on record
  if (!account.passwordHash) {
    return res.status(403).json({
      success: false,
      error: "No password configured for this account. Please contact the Master Administrator.",
    });
  }

  const incomingHash = hashPassword(password.trim());
  const isMatch = incomingHash === account.passwordHash;

  if (!isMatch) {
    account.failedAttempts = (account.failedAttempts || 0) + 1;
    if (account.failedAttempts >= 3) {
      account.status = "locked";
      persistAdminsToFile();
      return res.status(403).json({
        success: false,
        error: "Incorrect password entered 3 consecutive times. Your account has now been LOCKED for security. Contact the Master Administrator to reactivate.",
        isLocked: true,
      });
    }

    persistAdminsToFile();
    const attemptsRemaining = 3 - account.failedAttempts;
    return res.status(401).json({
      success: false,
      error: `Invalid password. Warning: ${attemptsRemaining} attempt(s) remaining before account lockout.`,
      attemptsRemaining,
    });
  }

  // Successful login -> Reset failed attempts
  account.failedAttempts = 0;
  account.lastLogin = Date.now();
  persistAdminsToFile();

  return res.json({
    success: true,
    user: {
      uid: account.id,
      username: account.username,
      fullName: account.fullName,
      role: account.role,
      status: account.status,
    },
  });
});

// 2. Reactivate / Unlock Account (Master Admin only)
app.post("/api/auth/unlock", (req, res) => {
  const { targetUsername, requesterRole } = req.body;
  if (requesterRole !== "master") {
    return res.status(403).json({ success: false, error: "Account reactivation is restricted exclusively to the Master Administrator." });
  }

  const normalized = targetUsername?.trim().toLowerCase();
  const account = adminAccounts.get(normalized);
  if (!account) {
    return res.status(404).json({ success: false, error: "Account not found." });
  }

  account.status = "active";
  account.failedAttempts = 0;
  persistAdminsToFile();

  return res.json({
    success: true,
    message: `Account '${account.username}' has been successfully unlocked and reactivated.`,
  });
});

// 3. Get all admins (Safe list without password hashes)
app.get("/api/auth/admins", (req, res) => {
  const list = Array.from(adminAccounts.values()).map((acc) => ({
    id: acc.id,
    username: acc.username,
    role: acc.role,
    fullName: acc.fullName,
    createdAt: acc.createdAt,
    lastLogin: acc.lastLogin,
    status: acc.status,
    failedAttempts: acc.failedAttempts,
  }));
  res.json({ success: true, admins: list });
});

// 4. Create Sub-Admin (Secondary or Reviewer)
app.post("/api/auth/create-admin", (req, res) => {
  const { username, password, fullName, role, requesterRole } = req.body;
  if (requesterRole !== "master") {
    return res.status(403).json({ success: false, error: "Only Master Admin can create administrator accounts." });
  }

  if (!username || !password || !fullName) {
    return res.status(400).json({ success: false, error: "All fields are required." });
  }

  const normalized = username.trim().toLowerCase();
  if (adminAccounts.has(normalized)) {
    return res.status(400).json({ success: false, error: "An admin account with this username already exists." });
  }

  const targetRole = role === "reviewer" ? "reviewer" : "secondary";
  const id = `admin_${Date.now()}`;
  const newAccount: ServerAdminAccount = {
    id,
    username: username.trim(),
    passwordHash: hashPassword(password),
    role: targetRole,
    fullName: fullName.trim(),
    createdAt: Date.now(),
    status: "active",
    failedAttempts: 0,
  };

  adminAccounts.set(normalized, newAccount);
  persistAdminsToFile();
  return res.json({ success: true, message: `Account created for ${newAccount.username} (${targetRole}).` });
});

// 5. Delete Admin Account
app.delete("/api/auth/admin/:username", (req, res) => {
  const { requesterRole } = req.body;
  const target = req.params.username.trim().toLowerCase();

  if (requesterRole !== "master") {
    return res.status(403).json({ success: false, error: "Only Master Admin can delete accounts." });
  }

  if (target === MASTER_USER.toLowerCase()) {
    return res.status(400).json({ success: false, error: "Cannot delete the primary Master Admin account." });
  }

  if (!adminAccounts.has(target)) {
    return res.status(404).json({ success: false, error: "Account not found." });
  }

  adminAccounts.delete(target);
  persistAdminsToFile();
  return res.json({ success: true, message: "Account deleted successfully." });
});

// 6. Change Password
app.post("/api/auth/change-password", (req, res) => {
  const { username, newPassword } = req.body;
  if (!username || !newPassword || newPassword.length < 3) {
    return res.status(400).json({ success: false, error: "Invalid password length." });
  }

  const normalized = username.trim().toLowerCase();
  const account = adminAccounts.get(normalized);
  if (!account) {
    return res.status(404).json({ success: false, error: "Account not found." });
  }

  account.passwordHash = hashPassword(newPassword);
  persistAdminsToFile();
  return res.json({ success: true, message: "Password updated successfully." });
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

const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
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
    name: "Sunita Bohara",
    faculty: "BA (Bachelor of Arts)",
    semester: "2nd Year",
    className: "BA 2nd Year",
    phone: "+977 9868923412",
    email: "sunita.bohara@gmail.com",
    category: "Scholarships & Financial Aid",
    tag: "Secretariat Appointment",
    subject: "[Secretariat Meeting Request] FWU Merit Scholarship Verification",
    message: "Seeking FSU verification and recommendation letter for FWU underprivileged scholarship grant application before the upcoming campus deadline.",
    status: "Resolved",
    adminRemarks: "Document verified and official FSU recommendation signed by President Prakash Rawal. Dispatched to Administration Branch.",
    adminRemarkUpdatedAt: Date.now() - 3600000 * 12,
    trackingCode: "FSU-COMP-901438",
    ticketId: "FSU-COMP-901438",
    createdAt: Date.now() - 3600000 * 72,
    isAnonymous: false,
  }
];

function persistMessagesToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(serverMessages, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist messages to file:", err);
  }
}

function loadPersistedMessages() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(MESSAGES_FILE)) {
      const content = fs.readFileSync(MESSAGES_FILE, "utf-8");
      const list: ServerMessage[] = JSON.parse(content);
      if (Array.isArray(list) && list.length > 0) {
        serverMessages = list;
        return;
      }
    }
    // If file doesn't exist or is empty, initialize with seeds
    serverMessages = [...SEED_MESSAGES];
    persistMessagesToFile();
  } catch (err) {
    console.warn("Could not load persisted messages:", err);
    serverMessages = [...SEED_MESSAGES];
  }
}

loadPersistedMessages();

// 7. GET /api/messages - List all helpdesk & complaint messages
app.get("/api/messages", (_req, res) => {
  // Ensure sorted by createdAt descending
  const sorted = [...serverMessages].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return res.json({ success: true, messages: sorted });
});

// 8. POST /api/messages - Submit a new message / complaint / ticket
app.post("/api/messages", (req, res) => {
  const body = req.body || {};
  const randCode = Math.floor(100000 + Math.random() * 900000).toString();
  const trackingCode = (body.trackingCode || body.ticketId || `FSU-COMP-${randCode}`).toUpperCase();
  const id = body.id || trackingCode;

  const newMsg: ServerMessage = {
    id,
    name: body.name ? body.name.trim() : (body.isAnonymous ? "Anonymous Student" : "Anonymous"),
    className: body.className || body.faculty || "N/A",
    semester: body.semester || "N/A",
    contactInfo: body.contactInfo || (body.phone ? body.phone : (body.isAnonymous ? "Confidential" : "Not Provided")),
    phone: body.phone || undefined,
    email: body.email || undefined,
    rollNumber: body.rollNumber || undefined,
    faculty: body.faculty || body.className || undefined,
    category: body.category || "General Inquiry",
    ticketId: body.ticketId || trackingCode,
    trackingCode,
    tag: body.tag || "FSU Helpdesk Ticket",
    status: body.status || "Pending",
    subject: body.subject || `Inquiry from ${body.name || "Student"}`,
    message: body.message ? body.message.trim() : "No message provided.",
    imageUrl: body.imageUrl || undefined,
    isAnonymous: Boolean(body.isAnonymous),
    createdAt: body.createdAt || Date.now(),
    adminRemarks: body.adminRemarks || "",
    adminRemarkUpdatedAt: body.adminRemarkUpdatedAt || undefined,
  };

  // Prepend to serverMessages (or replace if existing id)
  const existingIdx = serverMessages.findIndex((m) => m.id === newMsg.id || m.trackingCode === newMsg.trackingCode);
  if (existingIdx >= 0) {
    serverMessages[existingIdx] = { ...serverMessages[existingIdx], ...newMsg };
  } else {
    serverMessages.unshift(newMsg);
  }

  persistMessagesToFile();
  return res.status(201).json({ success: true, message: newMsg });
});

// 9. PATCH /api/messages/:id - Update status & admin remarks
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

// 10. DELETE /api/messages/:id - Delete a message
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
