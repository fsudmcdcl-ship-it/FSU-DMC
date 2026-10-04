import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../lib/firebase";
import {
  AdminUser,
  onAdminAuthStateChanged,
  loginAdminWithCredentials,
  signOutAdmin,
  getCurrentAdminUser,
} from "../lib/authService";
import {
  getAllLocalContacts,
  saveSubItem,
  updateSubItem,
  deleteSubItem,
  saveTrackedComplaint,
  onLocalDataChanged,
} from "../lib/dataService";
import { ContactSubmission } from "../types";
import ExpandableText from "./ExpandableText";
import ImageUploadInput from "./ImageUploadInput";
import {
  Lock,
  MailOpen,
  Trash2,
  ShieldCheck,
  LogOut,
  Loader2,
  User,
  Eye,
  EyeOff,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  MessageSquare,
  Copy,
  Check,
  Save,
  ExternalLink,
  X,
  GraduationCap,
  BookOpen,
  Clock,
  FileText,
  Edit,
  Plus,
  Download,
  RefreshCw,
  AlertTriangle,
  Settings,
  CheckCircle,
  Tag,
  ArrowUpRight,
} from "lucide-react";

interface MessagesViewerProps {
  lang?: "en" | "np";
  onGoHome: () => void;
  onGoCMS?: () => void;
}

const QUICK_REMARK_TEMPLATES = [
  {
    label: "Acknowledge & Review",
    status: "In Review",
    text: "Your submission has been received and logged by the FSU Secretariat. Our committee is currently reviewing the details and will update you shortly.",
  },
  {
    label: "Forwarded to Dept",
    status: "In Progress",
    text: "This matter has been officially forwarded to the Campus Administration / Examination Section by the Free Student Union for immediate action.",
  },
  {
    label: "Schedule Meeting",
    status: "In Progress",
    text: "Please visit the FSU Secretariat Office (Room 101/102) during working hours (10:00 AM – 4:00 PM) with supporting documents for verification.",
  },
  {
    label: "Mark Resolved",
    status: "Resolved",
    text: "This grievance/inquiry has been successfully addressed and resolved in coordination with the concerned campus department. Thank you for reaching out to FSU DMC.",
  },
];

export default function MessagesViewer({ onGoHome, onGoCMS }: MessagesViewerProps) {
  const [user, setUser] = useState<AdminUser | null>(getCurrentAdminUser());
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Username and Password Login States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Filter & Search state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Remarks & status editing per message: { [messageId]: string }
  const [remarksDrafts, setRemarksDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Create / Edit Ticket Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState<{
    name: string;
    className: string;
    semester: string;
    rollNumber: string;
    phone: string;
    email: string;
    category: string;
    subject: string;
    message: string;
    status: string;
    adminRemarks: string;
    imageUrl: string;
    isAnonymous: boolean;
  }>({
    name: "",
    className: "",
    semester: "",
    rollNumber: "",
    phone: "",
    email: "",
    category: "Academic & Syllabus Inquiries",
    subject: "",
    message: "",
    status: "Pending",
    adminRemarks: "",
    imageUrl: "",
    isAnonymous: false,
  });

  // In-App Delete Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Normalize and sort a record map of ContactSubmissions
  const hydrateMessagesFromMap = (mapData: Record<string, ContactSubmission>) => {
    const list = Object.entries(mapData).map(([key, val]) => ({
      ...val,
      id: val.id || key,
    }));
    const sorted = list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    setMessages(sorted);

    const rMap: Record<string, string> = {};
    const sMap: Record<string, string> = {};
    sorted.forEach((m) => {
      rMap[m.id] = m.adminRemarks || "";
      sMap[m.id] = normalizeStatusValue(m.status);
    });
    setRemarksDrafts((prev) => ({ ...rMap, ...prev }));
    setStatusDrafts((prev) => ({ ...sMap, ...prev }));
  };

  const normalizeStatusValue = (raw?: string): string => {
    if (!raw) return "Pending";
    const s = raw.toLowerCase();
    if (s.includes("resolve") || s.includes("close") || s.includes("complete")) return "Resolved";
    if (s.includes("reject") || s.includes("deni")) return "Rejected";
    if (s.includes("progress") || s.includes("action")) return "In Progress";
    if (s.includes("review") || s.includes("verif")) return "In Review";
    return "Pending";
  };

  // Load local + RTDB messages and keep them in sync
  const loadAndSyncMessages = () => {
    // 1. Immediately hydrate from local storage + tracked complaints cache
    const localMerged = getAllLocalContacts();
    hydrateMessagesFromMap(localMerged);
    setLoading(false);

    // 2. Subscribe to Firebase RTDB contacts node with error resilience
    const contactsRef = ref(rtdb, "contacts");
    const unsubRtdb = onValue(
      contactsRef,
      (snapshot) => {
        const remoteData = snapshot.val();
        const currentLocal = getAllLocalContacts();
        if (remoteData && typeof remoteData === "object") {
          const combined: Record<string, ContactSubmission> = { ...currentLocal };
          for (const [key, val] of Object.entries<any>(remoteData)) {
            if (val && typeof val === "object") {
              const idKey = val.id || key;
              combined[idKey] = {
                ...currentLocal[idKey],
                ...val,
                id: idKey,
              };
            }
          }
          hydrateMessagesFromMap(combined);
        } else {
          hydrateMessagesFromMap(currentLocal);
        }
        setLoading(false);
      },
      (err) => {
        console.warn("[MessagesViewer] RTDB read fallback to local contacts store:", err?.message);
        hydrateMessagesFromMap(getAllLocalContacts());
        setLoading(false);
      }
    );

    // 3. Subscribe to local data changes
    const unsubLocal = onLocalDataChanged(({ key }) => {
      if (key === "contacts") {
        hydrateMessagesFromMap(getAllLocalContacts());
      }
    });

    return () => {
      unsubRtdb();
      unsubLocal();
    };
  };

  // Monitor auth state changes
  useEffect(() => {
    let cleanupSync: (() => void) | undefined;

    const unsubscribeAuth = onAdminAuthStateChanged((currUser) => {
      setUser(currUser);
      if (cleanupSync) {
        cleanupSync();
        cleanupSync = undefined;
      }
      if (currUser) {
        setAuthError("");
        cleanupSync = loadAndSyncMessages();
      } else {
        setMessages([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (cleanupSync) cleanupSync();
    };
  }, []);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await loginAdminWithCredentials(username.trim(), password);
      if (res.success && res.user) {
        setUser(res.user);
        setAuthSuccess(`Welcome, ${res.user.fullName || res.user.username}!`);
      } else {
        setAuthError(res.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to log in.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = () => {
    signOutAdmin();
    setUser(null);
  };

  // Quick 1-click status update + remark save
  const handleQuickStatusChange = async (messageItem: ContactSubmission, newStatus: string) => {
    const id = messageItem.id;
    setStatusDrafts((prev) => ({ ...prev, [id]: newStatus }));
    const currentRemarks =
      remarksDrafts[id] !== undefined ? remarksDrafts[id] : messageItem.adminRemarks || "";

    setSavingId(id);
    try {
      const updatedFields = {
        status: newStatus,
        adminRemarks: currentRemarks.trim(),
        adminRemarkUpdatedAt: Date.now(),
      };
      await updateSubItem("contacts", id, updatedFields);

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m))
      );
      setSavedSuccessId(id);
      showToast(`Ticket ${messageItem.trackingCode || id} marked as "${newStatus}"`);
      setTimeout(() => setSavedSuccessId(null), 3000);
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setSavingId(null);
    }
  };

  // Apply quick response template
  const handleApplyTemplate = (
    messageItem: ContactSubmission,
    template: { label: string; status: string; text: string }
  ) => {
    const id = messageItem.id;
    setStatusDrafts((prev) => ({ ...prev, [id]: template.status }));
    setRemarksDrafts((prev) => ({ ...prev, [id]: template.text }));
  };

  // Save Remarks & Status
  const handleSaveRemarksAndStatus = async (messageItem: ContactSubmission) => {
    const id = messageItem.id;
    const newRemarks =
      remarksDrafts[id] !== undefined ? remarksDrafts[id] : messageItem.adminRemarks || "";
    const newStatus =
      statusDrafts[id] !== undefined
        ? statusDrafts[id]
        : normalizeStatusValue(messageItem.status);

    setSavingId(id);
    try {
      const updatedFields = {
        adminRemarks: newRemarks.trim(),
        status: newStatus,
        adminRemarkUpdatedAt: Date.now(),
      };

      await updateSubItem("contacts", id, updatedFields);

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m))
      );

      setSavedSuccessId(id);
      showToast(`Saved remarks & status (${newStatus}) for ${messageItem.trackingCode || id}`);
      setTimeout(() => setSavedSuccessId(null), 3000);
    } catch (err) {
      console.error("Save error:", err);
      showToast("Error saving changes.");
    } finally {
      setSavingId(null);
    }
  };

  // Request Delete with in-app confirmation modal
  const requestDeleteMessage = (item: ContactSubmission) => {
    const label = item.trackingCode || item.ticketId || item.id;
    setConfirmModal({
      isOpen: true,
      title: "Delete Message / Grievance Record?",
      message: `Are you sure you want to permanently delete ticket "${label}" from ${
        item.name || "Anonymous Student"
      }? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteSubItem("contacts", item.id);
          setMessages((prev) => prev.filter((m) => m.id !== item.id));
          showToast(`Ticket ${label} permanently deleted.`);
        } catch (err) {
          console.error("Delete error:", err);
          showToast("Failed to delete ticket.");
        }
      },
    });
  };

  // Open Modal to Create New Ticket
  const openCreateTicketModal = () => {
    setEditingTicketId(null);
    setTicketForm({
      name: "",
      className: "Bachelor of Business Studies (BBS)",
      semester: "1st Year",
      rollNumber: "",
      phone: "",
      email: "",
      category: "Academic & Syllabus Inquiries",
      subject: "",
      message: "",
      status: "Pending",
      adminRemarks: "",
      imageUrl: "",
      isAnonymous: false,
    });
    setShowFormModal(true);
  };

  // Open Modal to Edit Existing Ticket
  const openEditTicketModal = (item: ContactSubmission) => {
    setEditingTicketId(item.id);
    setTicketForm({
      name: item.name || "",
      className: item.className || item.faculty || "",
      semester: item.semester || "",
      rollNumber: item.rollNumber || "",
      phone: item.phone || (item.contactInfo && item.contactInfo !== "Confidential" ? item.contactInfo : ""),
      email: item.email || "",
      category: item.category || item.tag || "General Inquiry",
      subject: item.subject || "",
      message: item.message || "",
      status: normalizeStatusValue(item.status),
      adminRemarks: remarksDrafts[item.id] ?? item.adminRemarks ?? "",
      imageUrl: item.imageUrl || "",
      isAnonymous: Boolean(item.isAnonymous),
    });
    setShowFormModal(true);
  };

  const handleSaveTicketModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.message.trim()) {
      showToast("Please provide the message or grievance description.");
      return;
    }

    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const id = editingTicketId || `FSU-COMP-${randomSuffix}`;
    const existing = messages.find((m) => m.id === editingTicketId);

    const record: ContactSubmission = {
      ...(existing || {}),
      id,
      trackingCode: existing?.trackingCode || existing?.ticketId || id,
      ticketId: existing?.ticketId || existing?.trackingCode || id,
      name: ticketForm.isAnonymous
        ? "Anonymous Student"
        : ticketForm.name.trim() || "Student / Applicant",
      className: ticketForm.isAnonymous ? "Anonymous" : ticketForm.className.trim() || "Not Specified",
      faculty: ticketForm.isAnonymous ? "Anonymous" : ticketForm.className.trim() || "Not Specified",
      semester: ticketForm.isAnonymous ? "Anonymous" : ticketForm.semester.trim() || "Not Specified",
      rollNumber: ticketForm.rollNumber.trim() || "N/A",
      phone: ticketForm.isAnonymous ? "Confidential" : ticketForm.phone.trim() || "Not Provided",
      email: ticketForm.isAnonymous ? "Confidential" : ticketForm.email.trim() || "Not Provided",
      contactInfo: ticketForm.isAnonymous
        ? "Confidential"
        : `${ticketForm.phone.trim()}${ticketForm.email.trim() ? ` / ${ticketForm.email.trim()}` : ""}` ||
          "Not Provided",
      category: ticketForm.category,
      tag: existing?.tag || "FSU Helpdesk Ticket",
      subject: ticketForm.subject.trim() || `[${ticketForm.category}]`,
      message: ticketForm.message.trim(),
      status: ticketForm.status,
      adminRemarks: ticketForm.adminRemarks.trim(),
      adminRemarkUpdatedAt: Date.now(),
      imageUrl: ticketForm.imageUrl.trim() || undefined,
      isAnonymous: ticketForm.isAnonymous,
      createdAt: existing?.createdAt || Date.now(),
    };

    try {
      saveTrackedComplaint(record);
      await saveSubItem("contacts", id, record);
      setRemarksDrafts((prev) => ({ ...prev, [id]: record.adminRemarks || "" }));
      setStatusDrafts((prev) => ({ ...prev, [id]: record.status || "Pending" }));
      hydrateMessagesFromMap(getAllLocalContacts());
      setShowFormModal(false);
      showToast(
        editingTicketId
          ? `Ticket ${record.trackingCode} updated successfully!`
          : `New ticket ${record.trackingCode} created!`
      );
    } catch (err) {
      console.error("Failed to save ticket:", err);
      showToast("Failed to save ticket.");
    }
  };

  // Export filtered messages to CSV
  const handleExportCSV = () => {
    if (filteredMessages.length === 0) {
      showToast("No messages to export.");
      return;
    }
    const headers = [
      "Tracking ID",
      "Status",
      "Student Name",
      "Class/Faculty",
      "Semester/Year",
      "Phone",
      "Email",
      "Category",
      "Message",
      "Admin Remarks",
      "Submitted Date",
    ];
    const rows = filteredMessages.map((m) => [
      m.trackingCode || m.ticketId || m.id,
      normalizeStatusValue(statusDrafts[m.id] || m.status),
      m.name || "Anonymous",
      m.className || m.faculty || "",
      m.semester || "",
      m.phone || m.contactInfo || "",
      m.email || "",
      m.category || m.tag || "",
      `"${(m.message || "").replace(/"/g, '""')}"`,
      `"${(remarksDrafts[m.id] ?? m.adminRemarks ?? "").replace(/"/g, '""')}"`,
      new Date(m.createdAt || Date.now()).toISOString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fsu_dmc_helpdesk_tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredMessages.length} records to CSV.`);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ID: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Counts per status
  const statusCounts = {
    all: messages.length,
    pending: messages.filter((m) => normalizeStatusValue(statusDrafts[m.id] || m.status) === "Pending").length,
    review: messages.filter((m) => normalizeStatusValue(statusDrafts[m.id] || m.status) === "In Review").length,
    progress: messages.filter((m) => normalizeStatusValue(statusDrafts[m.id] || m.status) === "In Progress").length,
    resolved: messages.filter((m) => normalizeStatusValue(statusDrafts[m.id] || m.status) === "Resolved").length,
    rejected: messages.filter((m) => normalizeStatusValue(statusDrafts[m.id] || m.status) === "Rejected").length,
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    const normStatus = normalizeStatusValue(statusDrafts[m.id] || m.status);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && normStatus === "Pending") ||
      (statusFilter === "review" && normStatus === "In Review") ||
      (statusFilter === "progress" && normStatus === "In Progress") ||
      (statusFilter === "resolved" && normStatus === "Resolved") ||
      (statusFilter === "rejected" && normStatus === "Rejected");

    const cat = (m.category || m.tag || "General").toLowerCase();
    const matchesCategory =
      categoryFilter === "all" || cat.includes(categoryFilter.toLowerCase());

    const query = searchQuery.trim().toLowerCase();
    const code = (m.trackingCode || m.ticketId || m.id || "").toLowerCase();
    const name = (m.name || "").toLowerCase();
    const msg = (m.message || "").toLowerCase();
    const phone = (m.phone || m.contactInfo || "").toLowerCase();
    const email = (m.email || "").toLowerCase();

    const matchesSearch =
      !query ||
      code.includes(query) ||
      name.includes(query) ||
      msg.includes(query) ||
      cat.includes(query) ||
      phone.includes(query) ||
      email.includes(query);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Not logged in UI
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-950 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-950 font-mono block mb-1">
              FSU SECURE INBOX &bull; /#messages
            </span>
            <h2 className="text-2xl font-serif font-black text-slate-900">
              Admin Messages & Grievance Portal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your authorized administrator credentials to manage student complaints, helpdesk tickets, and secretariat appointments.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 text-left font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 text-left font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{authSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter authorized admin username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admin Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              )}
              <span>Log In to Messages Workstation</span>
            </button>
          </form>

          <button
            onClick={onGoHome}
            className="w-full py-2 text-slate-500 hover:text-slate-900 text-xs font-bold transition cursor-pointer"
          >
            ← Return to Main Public Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 w-full">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-blue-950 text-white rounded-2xl shadow-2xl border border-blue-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-bold text-slate-900">{confirmModal.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = confirmModal.onConfirm;
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                  fn();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Ticket Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900 font-mono block">
                  {editingTicketId ? `EDITING RECORD: ${editingTicketId}` : "MANUAL HELPDESK ENTRY"}
                </span>
                <h3 className="text-xl font-serif font-black text-slate-900">
                  {editingTicketId ? "Edit Student Ticket / Grievance" : "Log New Helpdesk Ticket"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTicketModal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student / Applicant Name</label>
                  <input
                    type="text"
                    value={ticketForm.name}
                    onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                    placeholder="e.g., Bipin Singh Dhami"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Class / Faculty</label>
                  <input
                    type="text"
                    value={ticketForm.className}
                    onChange={(e) => setTicketForm({ ...ticketForm, className: e.target.value })}
                    placeholder="e.g., BBS / B.Ed / BA"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Year / Semester</label>
                  <input
                    type="text"
                    value={ticketForm.semester}
                    onChange={(e) => setTicketForm({ ...ticketForm, semester: e.target.value })}
                    placeholder="e.g., 3rd Year"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={ticketForm.phone}
                    onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                    placeholder="98487xxxxx"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="text"
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Academic & Syllabus Inquiries">Academic & Syllabus Inquiries</option>
                    <option value="Examination & Admit Card Issues">Examination & Admit Card Issues</option>
                    <option value="Scholarship & Fee Concession">Scholarship & Fee Concession</option>
                    <option value="Campus Hostel & Infrastructure">Campus Hostel & Infrastructure</option>
                    <option value="Student Rights & Grievance Cell">Student Rights & Grievance Cell</option>
                    <option value="Secretariat Appointment">Secretariat Appointment</option>
                    <option value="Other General Assistance">Other General Assistance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Headline</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="Brief subject of the grievance or inquiry"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ticket Status</label>
                  <select
                    value={ticketForm.status}
                    onChange={(e) => setTicketForm({ ...ticketForm, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-950"
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="In Review">In Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Message / Grievance Details *</label>
                <textarea
                  rows={4}
                  required
                  value={ticketForm.message}
                  onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                  placeholder="Enter full student message or grievance statement..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Admin Remarks / Resolution Directive</label>
                <textarea
                  rows={3}
                  value={ticketForm.adminRemarks}
                  onChange={(e) => setTicketForm({ ...ticketForm, adminRemarks: e.target.value })}
                  placeholder="Enter official FSU Secretariat response or action taken..."
                  className="w-full p-3 bg-blue-50/50 border border-blue-200 rounded-xl text-xs leading-relaxed"
                />
              </div>

              <ImageUploadInput
                label="Attachment / Evidence Photo (Optional)"
                value={ticketForm.imageUrl}
                onChange={(url) => setTicketForm({ ...ticketForm, imageUrl: url })}
                placeholder="https://... or upload attachment image"
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>{editingTicketId ? "Save Ticket Changes" : "Create & Log Ticket"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
              FSU DMC COMMAND INBOX &bull; /#messages
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                user.role === "master"
                  ? "bg-amber-400 text-slate-950"
                  : user.role === "reviewer"
                  ? "bg-purple-300 text-purple-950"
                  : "bg-blue-300 text-blue-950"
              }`}
            >
              {user.role === "master"
                ? "Master Admin"
                : user.role === "reviewer"
                ? "Complaint Handler / Reviewer"
                : "Secondary Admin"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-black">
            Student Helpdesk & Grievance Management
          </h2>
          <p className="text-xs text-blue-200/80 mt-1 font-mono">
            Operator: <strong className="text-white">{user.fullName || user.username}</strong> ({user.username}) &bull; Real-time Complaint & Ticket Control
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openCreateTicketModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Ticket</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Export filtered tickets to CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Export CSV</span>
          </button>

          {user.role !== "reviewer" && onGoCMS && (
            <button
              type="button"
              onClick={onGoCMS}
              className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>CMS Panel</span>
            </button>
          )}

          <button
            type="button"
            onClick={onGoHome}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Public Site
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Interactive Status Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: "all", label: "Total Tickets", count: statusCounts.all, color: "bg-slate-900 text-white border-slate-900" },
          { id: "pending", label: "Pending Review", count: statusCounts.pending, color: "bg-amber-50 text-amber-900 border-amber-200" },
          { id: "review", label: "In Review", count: statusCounts.review, color: "bg-purple-50 text-purple-900 border-purple-200" },
          { id: "progress", label: "In Progress", count: statusCounts.progress, color: "bg-blue-50 text-blue-900 border-blue-200" },
          { id: "resolved", label: "Resolved", count: statusCounts.resolved, color: "bg-emerald-50 text-emerald-900 border-emerald-200" },
          { id: "rejected", label: "Rejected", count: statusCounts.rejected, color: "bg-red-50 text-red-900 border-red-200" },
        ].map((stat) => {
          const isSelected = statusFilter === stat.id;
          return (
            <button
              key={stat.id}
              type="button"
              onClick={() => setStatusFilter(stat.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "ring-2 ring-blue-950 shadow-md scale-[1.01] " + stat.color
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block">
                {stat.label}
              </span>
              <span className="text-2xl font-serif font-black mt-1 block">
                {stat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter, Category & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {[
            { id: "all", label: `All (${statusCounts.all})` },
            { id: "pending", label: `Pending (${statusCounts.pending})` },
            { id: "review", label: `In Review (${statusCounts.review})` },
            { id: "progress", label: `In Progress (${statusCounts.progress})` },
            { id: "resolved", label: `Resolved (${statusCounts.resolved})` },
            { id: "rejected", label: `Rejected (${statusCounts.rejected})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-blue-950 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:ring-2 focus:ring-blue-900 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Academic">Academic & Syllabus</option>
            <option value="Examination">Examination & Admit Card</option>
            <option value="Scholarship">Scholarship & Fee</option>
            <option value="Hostel">Hostel & Infrastructure</option>
            <option value="Grievance">Student Rights & Grievance</option>
            <option value="Appointment">Secretariat Appointments</option>
          </select>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, student name, phone, text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/70"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              hydrateMessagesFromMap(getAllLocalContacts());
              showToast("Inbox refreshed & synchronized.");
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0 flex items-center justify-center"
            title="Refresh Inbox"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-950 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Syncing messages from database...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <MailOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Matching Tickets Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {messages.length === 0
                ? "No student complaints or inquiries have been registered yet."
                : "No records match your selected status or search filter."}
            </p>
          </div>
          {statusFilter !== "all" || categoryFilter !== "all" || searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setCategoryFilter("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-blue-950 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Reset All Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={openCreateTicketModal}
              className="px-4 py-2 bg-blue-950 text-white rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log First Ticket</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {filteredMessages.map((item) => {
            const trackingId = item.trackingCode || item.ticketId || item.id;
            const currentStatus =
              statusDrafts[item.id] !== undefined
                ? statusDrafts[item.id]
                : normalizeStatusValue(item.status);
            const currentRemarks =
              remarksDrafts[item.id] !== undefined
                ? remarksDrafts[item.id]
                : item.adminRemarks || "";
            const isSaving = savingId === item.id;
            const isSuccess = savedSuccessId === item.id;

            const studentName =
              item.name || (item.isAnonymous ? "Anonymous Student" : "Not Provided");
            const classFaculty =
              (item as any).faculty || item.className || "Not Specified";
            const yearSemester =
              item.semester || (item as any).year || (item as any).preferredDate || "Not Specified";
            const rawPhone =
              item.phone ||
              (item.contactInfo && item.contactInfo !== "Confidential"
                ? item.contactInfo.split("/")[0].trim()
                : "");
            const phoneDisplay = rawPhone || "Not Provided";
            const rawEmail =
              item.email && item.email !== "N/A" && item.email !== "Not Provided"
                ? item.email
                : item.contactInfo && item.contactInfo.includes("@")
                ? item.contactInfo
                    .split("/")
                    .find((p) => p.includes("@"))
                    ?.trim() || ""
                : "";
            const emailDisplay = rawEmail || "Not Provided";
            const attachmentUrl =
              item.imageUrl || (item as any).fileUrl || (item as any).attachmentUrl;

            const getStatusBadge = (st: string) => {
              const lower = st.toLowerCase();
              if (lower.includes("resolved") || lower.includes("closed")) {
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
              }
              if (lower.includes("reject")) {
                return "bg-red-50 text-red-700 border-red-200";
              }
              if (lower.includes("progress")) {
                return "bg-blue-50 text-blue-800 border-blue-200";
              }
              if (lower.includes("review")) {
                return "bg-purple-50 text-purple-800 border-purple-200";
              }
              return "bg-amber-50 text-amber-800 border-amber-200";
            };

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top: Tracking ID, Status, Date, Actions */}
                <div className="bg-slate-50/90 px-5 py-3.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        ID:
                      </span>
                      <span className="font-mono font-black text-xs text-blue-950">
                        {trackingId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(trackingId, item.id)}
                        className="text-slate-400 hover:text-blue-900 cursor-pointer p-0.5"
                        title="Copy tracking ID"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        currentStatus
                      )}`}
                    >
                      {currentStatus}
                    </span>

                    {(item.category || item.tag) && (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[140px]">
                          {item.category || item.tag}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mr-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => openEditTicketModal(item)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Edit full ticket details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {user.role !== "reviewer" && (
                      <button
                        type="button"
                        onClick={() => requestDeleteMessage(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-4 flex-1">
                  {/* Detailed Student Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/70 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Student / Sender
                      </span>
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span>{studentName}</span>
                        {item.rollNumber && item.rollNumber !== "N/A" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded">
                            Roll: {item.rollNumber}
                          </span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Class / Faculty
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span className="truncate">{classFaculty}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Year / Semester / Slot
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span>{yearSemester}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Contact Phone
                      </span>
                      <div className="font-mono text-slate-800 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <span>{phoneDisplay}</span>
                        {rawPhone && rawPhone !== "Confidential" && (
                          <a
                            href={`tel:${rawPhone}`}
                            className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-sans font-bold inline-flex items-center gap-0.5"
                            title="Call Student"
                          >
                            <span>Call</span>
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Email Address
                        </span>
                        <span className="font-mono text-slate-800 flex items-center gap-1.5 break-all">
                          <Mail className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                          <span>{emailDisplay}</span>
                        </span>
                      </div>
                      {rawEmail && rawEmail !== "Confidential" && (
                        <a
                          href={`mailto:${rawEmail}?subject=${encodeURIComponent(
                            `Regarding Your FSU DMC Ticket (${trackingId})`
                          )}`}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 shrink-0"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Reply via Email</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-slate-400" />
                        <span>
                          {item.subject ? item.subject : "Submitted Message / Grievance"}
                        </span>
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed shadow-2xs">
                      <ExpandableText text={item.message} maxLines={11} />
                    </div>
                  </div>

                  {/* Attachment link/preview if present */}
                  {attachmentUrl && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt="Student Attachment"
                          className="w-12 h-12 object-cover rounded-xl cursor-pointer hover:opacity-90 border border-slate-200 shrink-0"
                          onClick={() => setPreviewImage(item.imageUrl!)}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          Attached Evidence / Document
                        </span>
                        <div className="flex items-center gap-3 mt-0.5">
                          {item.imageUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(item.imageUrl!)}
                              className="text-[11px] font-bold text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Preview Full Image</span>
                            </button>
                          )}
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open Link</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Quick Actions, Status Pipeline & Editable Admin Remarks */}
                <div className="bg-blue-50/50 p-5 border-t border-blue-100/80 space-y-3.5">
                  {/* 1-Click Quick Status Pipeline Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                      <span>Quick Status Action:</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {["Pending", "In Review", "In Progress", "Resolved", "Rejected"].map(
                        (stOption) => {
                          const active = currentStatus === stOption;
                          return (
                            <button
                              key={stOption}
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleQuickStatusChange(item, stOption)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                active
                                  ? "bg-blue-950 text-white shadow-2xs"
                                  : "bg-white hover:bg-blue-100 text-slate-700 border border-blue-200/80"
                              }`}
                            >
                              {stOption}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Quick Remark Templates */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 mr-1">
                      Quick Reply Templates:
                    </span>
                    {QUICK_REMARK_TEMPLATES.map((tpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(item, tpl)}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200/90 text-[10px] font-semibold transition cursor-pointer"
                      >
                        + {tpl.label}
                      </button>
                    ))}
                  </div>

                  {/* Status Dropdown + Editable Remarks Textarea */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Selected Status
                      </span>
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          setStatusDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value="Pending">Pending Review</option>
                        <option value="In Review">In Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Official Admin Remarks (Visible on Student Tracker)
                      </span>
                      <textarea
                        rows={2}
                        value={currentRemarks}
                        onChange={(e) =>
                          setRemarksDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        placeholder="Write official FSU Secretariat remarks, hearing schedule, or resolution notes..."
                        className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Save Button & Timestamp */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {isSuccess ? (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Saved & Synced Live!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.adminRemarkUpdatedAt
                            ? `Updated: ${new Date(item.adminRemarkUpdatedAt).toLocaleString()}`
                            : "No remarks saved yet"}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveRemarksAndStatus(item)}
                      className="px-4 py-2 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Save Status & Remarks</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Enlarged attachment"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
