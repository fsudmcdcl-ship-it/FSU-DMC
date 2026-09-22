import React, { useState, useEffect } from "react";
import { ref, onValue, remove, update } from "firebase/database";
import { rtdb } from "../lib/firebase";
import {
  AdminUser,
  onAdminAuthStateChanged,
  loginAdminWithCredentials,
  signOutAdmin,
  getCurrentAdminUser,
} from "../lib/authService";
import { ContactSubmission } from "../types";
import {
  Lock,
  MailOpen,
  Trash2,
  ShieldCheck,
  LogOut,
  Loader2,
  Calendar,
  User,
  Eye,
  EyeOff,
  Mail,
  HelpCircle,
  Phone,
  Tag,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  MessageSquare,
  Image as ImageIcon,
  Copy,
  Check,
  Save,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react";

interface MessagesViewerProps {
  lang?: "en" | "np";
  onGoHome: () => void;
}

export default function MessagesViewer({ onGoHome }: MessagesViewerProps) {
  const [user, setUser] = useState<AdminUser | null>(getCurrentAdminUser());
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Username and Password Login States (Custom Admin System)
  const [username, setUsername] = useState("dmcadmin");
  const [password, setPassword] = useState("Admin");
  const [showPassword, setShowPassword] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Remarks editing per message: { [messageId]: string }
  const [remarksDrafts, setRemarksDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAdminAuthStateChanged((currUser) => {
      setUser(currUser);
      if (currUser) {
        setLoading(true);
        setAuthError("");
        fetchMessages();
      } else {
        setMessages([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMessages = () => {
    const contactsRef = ref(rtdb, "contacts");
    return onValue(contactsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })) as ContactSubmission[];
        // Newest messages first
        const sorted = list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setMessages(sorted);

        // Prepopulate draft values
        const rMap: Record<string, string> = {};
        const sMap: Record<string, string> = {};
        sorted.forEach((m) => {
          rMap[m.id] = m.adminRemarks || "";
          sMap[m.id] = m.status || "Pending";
        });
        setRemarksDrafts((prev) => ({ ...rMap, ...prev }));
        setStatusDrafts((prev) => ({ ...sMap, ...prev }));
      } else {
        setMessages([]);
      }
      setLoading(false);
    });
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await loginAdminWithCredentials(username, password);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this message record?")) return;
    try {
      await remove(ref(rtdb, `contacts/${id}`));
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert("Failed to delete record. Please check database permissions.");
    }
  };

  const handleSaveRemarksAndStatus = async (messageItem: ContactSubmission) => {
    const id = messageItem.id;
    const newRemarks = remarksDrafts[id] !== undefined ? remarksDrafts[id] : messageItem.adminRemarks || "";
    const newStatus = statusDrafts[id] !== undefined ? statusDrafts[id] : messageItem.status || "Pending";

    setSavingId(id);
    try {
      await update(ref(rtdb, `contacts/${id}`), {
        adminRemarks: newRemarks.trim(),
        status: newStatus,
        adminRemarkUpdatedAt: Date.now(),
      });

      // Update in local state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, adminRemarks: newRemarks.trim(), status: newStatus, adminRemarkUpdatedAt: Date.now() }
            : m
        )
      );

      setSavedSuccessId(id);
      setTimeout(() => setSavedSuccessId(null), 3000);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save changes to database.");
    } finally {
      setSavingId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    const s = (m.status || "Pending").toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && s === "pending") ||
      (statusFilter === "review" && (s.includes("review") || s.includes("verified"))) ||
      (statusFilter === "progress" && (s.includes("progress") || s.includes("action"))) ||
      (statusFilter === "resolved" && (s.includes("resolved") || s.includes("closed")));

    const query = searchQuery.trim().toLowerCase();
    const code = (m.trackingCode || m.ticketId || m.id).toLowerCase();
    const name = (m.name || "").toLowerCase();
    const msg = (m.message || "").toLowerCase();
    const cat = (m.category || m.tag || "").toLowerCase();

    const matchesSearch = !query || code.includes(query) || name.includes(query) || msg.includes(query) || cat.includes(query);
    return matchesStatus && matchesSearch;
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
              FSU SECURE INBOX
            </span>
            <h2 className="text-2xl font-serif font-black text-slate-900">
              Admin Messages & Complaints
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your authorized credentials to manage student grievances and inquiries.
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

          {/* Custom Admin Login Form */}
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
                  placeholder="e.g. dmcadmin"
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
              <span>Log In to Messages Inbox</span>
            </button>
          </form>

          {/* Helpful default credentials reminder */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-700 block">Default Master Admin</span>
            <span className="text-xs font-mono text-blue-950 block">
              Username: <strong className="font-black">dmcadmin</strong> &bull; Password: <strong className="font-black">Admin</strong>
            </span>
          </div>

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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
              FSU DMC INBOX
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
              {user.role === "master" ? "Master Admin" : "Secondary Admin"}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-black">
            Student Helpdesk & Complaint Tracking
          </h2>
          <p className="text-xs text-blue-200/80 mt-1 font-mono">
            Logged in as: <strong className="text-white">{user.fullName || user.username}</strong> ({user.username}) &bull; URL: <span className="text-amber-300">fsudmc.com/#messages</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Public Website
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {[
            { id: "all", label: `All (${messages.length})` },
            { id: "pending", label: "Pending" },
            { id: "review", label: "In Review" },
            { id: "progress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
          ].map((tab) => (
            <button
              key={tab.id}
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

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, name, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/70"
          />
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-950 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Syncing messages from database...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <MailOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Messages Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {messages.length === 0
              ? "No student complaints or inquiries have been registered yet."
              : "No records match your selected filter criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredMessages.map((item) => {
            const trackingId = item.trackingCode || item.ticketId || item.id;
            const currentStatus = statusDrafts[item.id] || item.status || "Pending";
            const currentRemarks = remarksDrafts[item.id] !== undefined ? remarksDrafts[item.id] : item.adminRemarks || "";
            const isSaving = savingId === item.id;
            const isSuccess = savedSuccessId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-6 sm:p-7 space-y-5"
              >
                {/* Header row: Tracking Code, Student, Date, Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Unique Tracking Code */}
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                      <span className="text-[10px] font-bold text-blue-900 uppercase">Tracking ID:</span>
                      <span className="font-mono font-black text-xs text-blue-950">{trackingId}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(trackingId, item.id)}
                        className="text-blue-700 hover:text-blue-950 cursor-pointer p-0.5"
                        title="Copy tracking code"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {item.isAnonymous ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        Anonymous Student
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-800">
                        {item.name || "Student"}
                        {item.className ? ` • ${item.className}` : ""}
                        {item.semester ? ` (${item.semester})` : ""}
                      </span>
                    )}

                    {item.contactInfo && item.contactInfo !== "Confidential" && (
                      <span className="text-xs text-slate-500 font-mono">
                        ({item.contactInfo})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.createdAt || Date.now()).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Body & Image Attachment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Student Grievance / Inquiry Details
                    </span>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                      {item.message}
                    </div>

                    {/* Image Attachment (Requirement #3) */}
                    {item.imageUrl && (
                      <div className="flex items-center gap-3 p-2.5 bg-slate-100/70 rounded-2xl border border-slate-200 w-fit">
                        <img
                          src={item.imageUrl}
                          alt="Attachment"
                          className="w-14 h-14 object-cover rounded-xl cursor-pointer hover:opacity-90"
                          onClick={() => setPreviewImage(item.imageUrl!)}
                        />
                        <div className="space-y-0.5 pr-2">
                          <span className="text-xs font-bold text-slate-800 block">
                            Attached Photo Evidence
                          </span>
                          <button
                            type="button"
                            onClick={() => setPreviewImage(item.imageUrl!)}
                            className="text-[11px] text-blue-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Full Resolution
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status & Admin Remarks Box (Requirement #3) */}
                  <div className="bg-blue-50/60 rounded-2xl border border-blue-200/80 p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-900" />
                          <span>Condition & Remarks</span>
                        </label>
                      </div>

                      {/* Condition / Status Selector */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          Current Status:
                        </span>
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            setStatusDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          className="w-full px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold bg-white text-slate-800 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                        >
                          <option value="Pending">Pending Review</option>
                          <option value="In Review">In Review by Secretariat</option>
                          <option value="In Progress">In Progress / Committee Action</option>
                          <option value="Resolved">Resolved & Closed</option>
                        </select>
                      </div>

                      {/* Admin Remarks Input */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                          FSU Remarks (Visible to Student on Tracker):
                        </span>
                        <textarea
                          rows={3}
                          value={currentRemarks}
                          onChange={(e) =>
                            setRemarksDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Add official resolution notes, committee decision, or instructions for the student..."
                          className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      {isSuccess ? (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Updated!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {item.adminRemarkUpdatedAt
                            ? `Updated ${new Date(item.adminRemarkUpdatedAt).toLocaleDateString()}`
                            : "No remarks yet"}
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveRemarksAndStatus(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>Save Updates</span>
                      </button>
                    </div>
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
