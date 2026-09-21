import React, { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { rtdb, auth } from "../lib/firebase";
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
  Filter
} from "lucide-react";

interface MessagesViewerProps {
  lang?: "en" | "np";
  onGoHome: () => void;
}

export default function MessagesViewer({ onGoHome }: MessagesViewerProps) {
  const [user, setUser] = useState(auth.currentUser);
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Email and Password Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<"all" | "helpdesk" | "contact">("all");

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currUser) => {
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
        setMessages(list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      } else {
        setMessages([]);
      }
      setLoading(false);
    });
  };

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setAuthError("");
    setAuthSuccess("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setAuthError(err.message || "Failed to authenticate with Google. Please check your credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("SignOut error:", err);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Please fill in both email and password.");
      return;
    }

    const trimmedEmail = email.trim();
    setLoginLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      let errMsg = "Failed to authenticate. Please check your credentials.";
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        errMsg = "Admin credentials not found or incorrect. If you need access, contact the FSU system administrator.";
      } else if (err.code === "auth/wrong-password") {
        errMsg = "Incorrect password. Click 'Forgot Password?' to reset your password.";
      } else if (err.code === "auth/too-many-requests") {
        errMsg = "Access temporarily disabled due to multiple failed attempts. Please try again later or reset password.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail) {
      setAuthError("Please enter your registered admin email address to receive password reset instructions.");
      return;
    }

    setResetLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setAuthSuccess(`Password reset email dispatched to ${targetEmail}. Please check your inbox or spam folder.`);
      setShowForgotPassword(false);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setAuthError("No administrator account registered with this email.");
      } else {
        setAuthError(err.message || "Failed to dispatch password reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm("Permanently delete this submission from the database?")) {
      return;
    }
    try {
      await remove(ref(rtdb, `contacts/${msgId}`));
    } catch (err) {
      alert("Failed to delete message: Permission denied.");
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === "helpdesk") {
      return m.tag === "FSU Helpdesk Ticket" || Boolean(m.ticketId);
    }
    if (activeFilter === "contact") {
      return m.tag !== "FSU Helpdesk Ticket" && !m.ticketId;
    }
    return true;
  });

  // Login Gate
  if (!user || authError) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl max-w-md w-full shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-inner">
            <Lock className="w-8 h-8 text-blue-950" />
          </div>

          <h3 className="text-xl font-extrabold text-gray-900 mb-1 text-center font-serif">
            FSU Helpdesk & Student Inbox Console
          </h3>
          <p className="text-xs text-blue-900 font-mono uppercase tracking-wider mb-4 font-semibold">
            https://www.fsudmc.com/#messages
          </p>
          <p className="text-xs text-gray-500 mb-6 text-center leading-relaxed">
            Encrypted administrator console for Free Student Union - DMC. Review student helpdesk tickets, grievances, and contact inquiries.
          </p>

          {authSuccess && (
            <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold mb-5 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{authSuccess}</span>
            </div>
          )}

          {authError && (
            <div className="w-full p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold mb-5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {!showForgotPassword ? (
            /* Email and Password Form */
            <form onSubmit={handleEmailPasswordLogin} className="w-full space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Authorized Admin Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fsudmcdcl@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setShowForgotPassword(true);
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="text-xs text-blue-900 hover:text-blue-950 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span>Log In to Messages Inbox</span>
              </button>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="w-full space-y-4 text-left">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950 leading-relaxed">
                Enter your registered admin email address below to receive an encrypted Firebase Authentication password reset email.
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@fsudmc.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>Send Reset Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setAuthError("");
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Separator */}
          <div className="w-full flex items-center my-5">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-xs text-gray-400 font-medium">OR FIREBASE AUTH</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loginLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sign In with Google Auth</span>
            </button>

            {user && (
              <button
                onClick={handleSignOut}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
              >
                Sign Out Session ({user.email})
              </button>
            )}

            <button
              onClick={onGoHome}
              className="w-full py-2 text-slate-500 hover:text-slate-900 text-xs font-bold transition mt-1"
            >
              ← Return to Main Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  const helpdeskCount = messages.filter((m) => m.tag === "FSU Helpdesk Ticket" || Boolean(m.ticketId)).length;
  const contactCount = messages.length - helpdeskCount;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 p-6 md:p-8 rounded-3xl text-white mb-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono block mb-1">
            FSU ENCRYPTED CONSOLE
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-black">
            Student Helpdesk & Inquiry Messages
          </h2>
          <p className="text-xs text-blue-200/80 mt-1 font-mono">
            Authenticated Admin: <span className="text-emerald-300 font-bold">{user.email}</span> &bull; Domain: <span className="text-amber-300 font-semibold">https://www.fsudmc.com/#messages</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition"
          >
            Public Website
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
          
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeFilter === "all" ? "bg-blue-950 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Submissions ({messages.length})
          </button>

          <button
            onClick={() => setActiveFilter("helpdesk")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === "helpdesk" ? "bg-red-700 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Helpdesk Tickets ({helpdeskCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter("contact")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === "contact" ? "bg-emerald-700 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>General Inquiries ({contactCount})</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
          Showing: {filteredMessages.length} Record(s)
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-12 h-12 text-blue-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-mono text-sm">
            Fetching secure logs from Firebase Realtime Database...
          </p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm flex flex-col items-center">
          <MailOpen className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            No Submissions Found
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            No student inquiries or tickets match the selected filter. Any incoming tickets submitted through the Helpdesk or Contact form will appear here in real time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMessages.map((item) => {
            const isHelpdesk = item.tag === "FSU Helpdesk Ticket" || Boolean(item.ticketId);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-6 shadow-sm border transition relative overflow-hidden flex flex-col justify-between ${
                  isHelpdesk
                    ? "border-blue-200 shadow-blue-50/50"
                    : item.isAnonymous
                    ? "border-amber-200 bg-amber-50/10"
                    : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          isHelpdesk
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : item.isAnonymous
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-50 text-blue-900 border border-blue-100"
                        }`}
                      >
                        {isHelpdesk ? (
                          <HelpCircle className="w-4 h-4" />
                        ) : item.isAnonymous ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-gray-900">
                            {item.isAnonymous ? "Anonymous Student" : item.name}
                          </h4>
                          {isHelpdesk && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold font-mono">
                              {item.ticketId || "Helpdesk Ticket"}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono flex items-center gap-3 mt-0.5">
                          {item.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <a href={`tel:${item.phone}`} className="hover:underline text-blue-900">
                                {item.phone}
                              </a>
                            </span>
                          )}
                          {item.email && item.email !== "N/A" && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <a href={`mailto:${item.email}`} className="hover:underline text-blue-900">
                                {item.email}
                              </a>
                            </span>
                          )}
                          {item.contactInfo && (
                            <span>Contact: {item.contactInfo}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMessage(item.id)}
                      className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition cursor-pointer"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.category && (
                      <span className="bg-blue-50 text-blue-950 border border-blue-100 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                        Category: {item.category}
                      </span>
                    )}
                    {item.faculty && (
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono">
                        Faculty: {item.faculty}
                      </span>
                    )}
                    {item.rollNumber && item.rollNumber !== "N/A" && (
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono">
                        Roll: {item.rollNumber}
                      </span>
                    )}
                    {item.className && (
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono">
                        Class: {item.className}
                      </span>
                    )}
                    {item.semester && (
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold font-mono">
                        Sem: {item.semester}
                      </span>
                    )}
                  </div>

                  {item.subject && (
                    <p className="text-xs font-bold text-slate-900 mb-2">
                      Subject: {item.subject}
                    </p>
                  )}

                  <div className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {item.message}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Submitted: {new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  {item.status && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase">
                      Status: {item.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
