import express from "express";
import path from "path";
import crypto from "crypto";
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

// In-memory admin store with initial master admin
const adminAccounts: Map<string, ServerAdminAccount> = new Map();

// Initialize Master Admin from env
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

// Auth Routes

// 1. Login endpoint
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Username and password are required." });
  }

  const normalizedUser = username.trim().toLowerCase();
  const account = adminAccounts.get(normalizedUser);

  if (!account) {
    return res.status(401).json({ success: false, error: "Invalid username or password." });
  }

  // Check if account is locked or disabled
  if (account.status === "locked" || account.status === "disabled") {
    return res.status(403).json({
      success: false,
      error: "This account is currently locked or disabled due to 3 consecutive failed login attempts. Please contact the Master Administrator to reactivate your access.",
      isLocked: true,
    });
  }

  const incomingHash = hashPassword(password);
  const isMatch = incomingHash === account.passwordHash;

  if (!isMatch) {
    account.failedAttempts = (account.failedAttempts || 0) + 1;
    if (account.failedAttempts >= 3) {
      account.status = "locked";
      return res.status(403).json({
        success: false,
        error: "Incorrect password entered 3 consecutive times. Your account has now been LOCKED for security. Contact the Master Administrator to reactivate.",
        isLocked: true,
      });
    }

    const attemptsRemaining = 3 - account.failedAttempts;
    return res.status(401).json({
      success: false,
      error: `Invalid credentials. Warning: ${attemptsRemaining} attempt(s) remaining before account lockout.`,
      attemptsRemaining,
    });
  }

  // Successful login -> Reset failed attempts
  account.failedAttempts = 0;
  account.lastLogin = Date.now();

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
  return res.json({ success: true, message: "Password updated successfully." });
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
