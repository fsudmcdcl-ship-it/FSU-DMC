import React, { useState, useEffect } from "react";
import { ref, set, remove, push } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { saveNode, saveSubItem, deleteSubItem } from "../lib/dataService";
import {
  AdminUser,
  onAdminAuthStateChanged,
  signInAdminWithEmail,
  signInAdminWithGoogle,
  signOutAdmin,
  resetPasswordAdmin,
  getCurrentAdminUser,
  isFirebaseApiKeyConfigured,
  loginAdminWithCredentials
} from "../lib/authService";
import ImageUploadInput from "./ImageUploadInput";
import FaqManager from "./cms/FaqManager";
import AdminAccountsManager from "./cms/AdminAccountsManager";
import TrackingSettingsManager from "./cms/TrackingSettingsManager";
import {
  DatabaseState,
  GeneralSettings,
  SlideItem,
  NewsItem,
  TeamMember,
  DownloadItem,
  BlogItem,
  ImportantNotice,
  StaffItem,
  ProfessorItem
} from "../types";
import {
  Lock,
  Edit,
  Trash2,
  Plus,
  Save,
  Settings,
  Sliders,
  FileText,
  Users,
  Download,
  PenTool,
  AlertOctagon,
  LogOut,
  CheckCircle,
  Upload,
  Inbox,
  Mail,
  Eye,
  EyeOff,
  Globe,
  Radio,
  GraduationCap,
  Briefcase,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Landmark,
  Facebook
} from "lucide-react";

interface CMSPanelProps {
  state: DatabaseState;
  lang?: "en" | "np";
  onGoHome: () => void;
  onGoMessages: () => void;
}

type CMSTab =
  | "general"
  | "slides"
  | "news"
  | "team"
  | "downloads"
  | "blogs"
  | "popup"
  | "staff"
  | "professors"
  | "helpdesk"
  | "faqs"
  | "tracking"
  | "admins";

export default function CMSPanel({ state, onGoHome, onGoMessages }: CMSPanelProps) {
  const [user, setUser] = useState<AdminUser | null>(getCurrentAdminUser());
  const [activeTab, setActiveTab] = useState<CMSTab>("general");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<"draft" | "live" | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Admin Login States (Master: dmcadmin / Admin)
  const [username, setUsername] = useState("dmcadmin");
  const [password, setPassword] = useState("Admin");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Form states
  const [genSettingsForm, setGenSettingsForm] = useState<GeneralSettings>(state?.generalSettings || ({} as GeneralSettings));
  const [importantNoticeForm, setImportantNoticeForm] = useState<ImportantNotice>(state?.importantNotice || ({} as ImportantNotice));

  // Lists from state
  const slides = state?.slides ? Object.values(state.slides) : [];
  const news = state?.news ? Object.values(state.news) : [];
  const team = state?.team ? Object.values(state.team) : [];
  const downloads = state?.downloads ? Object.values(state.downloads) : [];
  const blogs = state?.blogs ? Object.values(state.blogs) : [];
  const staff = state?.staff ? Object.values(state.staff) : [];
  const professors = state?.professors ? Object.values(state.professors) : [];

  // Temporary item forms
  const [newSlide, setNewSlide] = useState({ titleEn: "", imageUrl: "" });
  const [newNews, setNewNews] = useState({ headingEn: "", bodyEn: "", imageUrl: "" });
  const [newMember, setNewMember] = useState({ nameEn: "", roleEn: "", imageUrl: "", order: 6 });
  const [newDownload, setNewDownload] = useState({ titleEn: "", fileUrl: "", isDriveLink: true });
  const [newBlog, setNewBlog] = useState({ headingEn: "", bodyEn: "", imageUrl: "", authorEn: "" });
  const [newStaff, setNewStaff] = useState<Omit<StaffItem, "id">>({
    name: "",
    designation: "",
    department: "Administration",
    email: "",
    phone: "",
    office: "",
    workingHours: "Sunday – Friday: 10:00 AM – 5:00 PM",
    imageUrl: ""
  });
  const [newProf, setNewProf] = useState<Omit<ProfessorItem, "id">>({
    name: "",
    title: "",
    faculty: "Faculty of Management",
    department: "",
    qualification: "",
    subjects: [],
    researchInterests: "",
    email: "",
    officeHours: "Sunday – Thursday: 11:00 AM – 1:00 PM",
    imageUrl: ""
  });
  const [profSubjectsInput, setProfSubjectsInput] = useState("");

  useEffect(() => {
    const unsubscribe = onAdminAuthStateChanged((currUser) => {
      setUser(currUser);
      if (currUser) {
        setAuthError("");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (state?.generalSettings) setGenSettingsForm(state.generalSettings);
    if (state?.importantNotice) setImportantNoticeForm(state.importantNotice);
  }, [state]);

  const showToast = (txt: string) => {
    setToastMessage(txt);
    setTimeout(() => setToastMessage(""), 5000);
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    setAuthSuccess("");
    setLoginLoading(true);
    try {
      const loggedUser = await signInAdminWithGoogle();
      setUser(loggedUser);
      setAuthError("");
      showToast("Successfully signed in to FSU CMS Control Center!");
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setUser(null);
    setAuthError("");
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setAuthError("Please provide both administrator username and password.");
      return;
    }

    setLoginLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await loginAdminWithCredentials(username.trim(), password);
      if (res.success && res.user) {
        setUser(res.user);
        setAuthError("");
        showToast(`Welcome back, ${res.user.fullName || res.user.username}!`);
      } else {
        setAuthError(res.error || "Authentication failed. Invalid username or password.");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setAuthError(err.message || "Failed to authenticate.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError("Please enter both authorized admin email and password.");
      return;
    }

    const trimmedEmail = email.trim();
    setLoginLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const loggedUser = await signInAdminWithEmail(trimmedEmail, password);
      setUser(loggedUser);
      setAuthError("");
      showToast("Successfully signed in to FSU CMS Control Center!");
    } catch (err: any) {
      console.error("Auth Error:", err);
      let errMsg = "Failed to authenticate. Please check your credentials.";
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        errMsg = "Admin user not found or invalid credentials. If you need access, contact the FSU system administrator.";
      } else if (err.code === "auth/wrong-password") {
        errMsg = "Incorrect password. Click 'Forgot Password?' to reset it.";
      } else if (err.code === "auth/too-many-requests") {
        errMsg = "Access temporarily blocked due to repeated failed attempts. Please try again later or reset your password.";
      } else if (err.message && !err.message.includes("api-key-not-valid")) {
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
      setAuthError("Please enter your registered admin email address.");
      return;
    }

    setResetLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const successMsg = await resetPasswordAdmin(targetEmail);
      setAuthSuccess(successMsg);
      setShowForgotPassword(false);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setAuthError("No registered administrator found with this email.");
      } else {
        setAuthError(err.message || "Failed to dispatch password reset email. Please try again.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  // Convert uploaded image file to lightweight Base64 string for direct DB storage
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      alert("Please upload images smaller than 800KB to ensure smooth database operations.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        callback(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------
  // TWO SAVE OPTIONS:
  // 1) SAVE DATA (Local Staging / Draft Cache)
  // 2) GLOBAL LIVE (Direct Commit to Firebase Realtime Database)
  // -------------------------------------------------------------

  const handleSaveGeneral = async (mode: "draft" | "live") => {
    setSaving(true);
    setSaveMode(mode);

    if (mode === "draft") {
      try {
        localStorage.setItem("fsudmc_draft_generalSettings", JSON.stringify(genSettingsForm));
        showToast("General Settings saved to Local Draft Cache! (Staged)");
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
        setSaveMode(null);
      }
      return;
    }

    // Global Live via dataService (local persistence + RTDB sync)
    try {
      const res = await saveNode("generalSettings", genSettingsForm);
      showToast(res.message || "General settings saved successfully!");
    } catch (err: any) {
      alert("Failed to save settings: " + (err?.message || err));
    } finally {
      setSaving(false);
      setSaveMode(null);
    }
  };

  const handleSaveImportantNotice = async (mode: "draft" | "live") => {
    setSaving(true);
    setSaveMode(mode);

    if (mode === "draft") {
      try {
        localStorage.setItem("fsudmc_draft_importantNotice", JSON.stringify(importantNoticeForm));
        showToast("Notice popup configuration saved to Local Draft Cache! (Staged)");
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
        setSaveMode(null);
      }
      return;
    }

    // Global Live via dataService
    try {
      const res = await saveNode("importantNotice", importantNoticeForm);
      showToast(res.message || "Notice popup saved successfully!");
    } catch (err: any) {
      alert("Failed to save notice: " + (err?.message || err));
    } finally {
      setSaving(false);
      setSaveMode(null);
    }
  };

  // Adding items to lists
  const addSlide = async () => {
    if (!newSlide.imageUrl) return alert("Please specify or upload an image for the slide.");
    try {
      const id = `slide_${Date.now()}`;
      await saveSubItem("slides", id, { id, ...newSlide });
      setNewSlide({ titleEn: "", imageUrl: "" });
      showToast("Hero carousel slide published live!");
    } catch (err: any) { alert(err?.message || err); }
  };

  const addNews = async () => {
    if (!newNews.headingEn || !newNews.bodyEn) return alert("Please specify news title and body text.");
    try {
      const id = `news_${Date.now()}`;
      await saveSubItem("news", id, { id, ...newNews, createdAt: Date.now() });
      setNewNews({ headingEn: "", bodyEn: "", imageUrl: "" });
      showToast("Announcement published live!");
    } catch (err: any) { alert(err?.message || err); }
  };

  const addMember = async () => {
    if (!newMember.nameEn || !newMember.roleEn) return alert("Please specify representative name and role.");
    if (team.length >= 30) return alert("FSU Committee displays a maximum of 30 cards. Please delete an existing card first.");
    try {
      const id = `member_${Date.now()}`;
      await saveSubItem("team", id, { id, ...newMember, order: Number(newMember.order) });
      setNewMember({ nameEn: "", roleEn: "", imageUrl: "", order: 6 });
      showToast("FSU Team member card published live!");
    } catch (err: any) { alert(err?.message || err); }
  };

  const addDownload = async () => {
    if (!newDownload.titleEn || !newDownload.fileUrl) return alert("Please specify document title and resource link.");
    try {
      const id = `dl_${Date.now()}`;
      await saveSubItem("downloads", id, { id, ...newDownload });
      setNewDownload({ titleEn: "", fileUrl: "", isDriveLink: true });
      showToast("Syllabus resource published live!");
    } catch (err: any) { alert(err?.message || err); }
  };

  const addBlog = async () => {
    if (!newBlog.headingEn || !newBlog.bodyEn) return alert("Please specify article heading and content.");
    try {
      const id = `blog_${Date.now()}`;
      await saveSubItem("blogs", id, { id, ...newBlog, createdAt: Date.now() });
      setNewBlog({ headingEn: "", bodyEn: "", imageUrl: "", authorEn: "" });
      showToast("Student blog article published live!");
    } catch (err: any) { alert(err?.message || err); }
  };

  const addStaff = async () => {
    if (!newStaff.name || !newStaff.designation) return alert("Please specify staff name and designation.");
    try {
      const id = `staff_${Date.now()}`;
      await saveSubItem("staff", id, { id, ...newStaff });
      setNewStaff({
        name: "",
        designation: "",
        department: "Administration",
        email: "",
        phone: "",
        office: "",
        workingHours: "Sunday – Friday: 10:00 AM – 5:00 PM",
        imageUrl: ""
      });
      showToast("Campus staff member saved!");
    } catch (err: any) { alert(err?.message || err); }
  };

  const addProfessor = async () => {
    if (!newProf.name || !newProf.title) return alert("Please specify professor name and academic title.");
    try {
      const id = `prof_${Date.now()}`;
      const subjectsArray = profSubjectsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await saveSubItem("professors", id, { id, ...newProf, subjects: subjectsArray });
      setNewProf({
        name: "",
        title: "",
        faculty: "Faculty of Management",
        department: "",
        qualification: "",
        subjects: [],
        researchInterests: "",
        email: "",
        officeHours: "Sunday – Thursday: 11:00 AM – 1:00 PM",
        imageUrl: ""
      });
      setProfSubjectsInput("");
      showToast("Professor published live!");
    } catch (err: any) { alert(err?.message || err); }
  };

  // Deleting items
  const deleteItem = async (node: string, id: string) => {
    if (!window.confirm("Permanently delete this item?")) return;
    try {
      await deleteSubItem(node as keyof DatabaseState, id);
      showToast("Item removed.");
    } catch (err: any) { alert(err?.message || err); }
  };

  // Master Save All Functionality
  const handleMasterAction = async (mode: "draft" | "live") => {
    setSaving(true);
    setSaveMode(mode);

    if (mode === "draft") {
      try {
        localStorage.setItem("fsudmc_draft_generalSettings", JSON.stringify(genSettingsForm));
        localStorage.setItem("fsudmc_draft_importantNotice", JSON.stringify(importantNoticeForm));
        showToast("All current settings & notices saved to Local Staging Cache!");
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
        setSaveMode(null);
      }
      return;
    }

    try {
      await saveNode("generalSettings", genSettingsForm);
      await saveNode("importantNotice", importantNoticeForm);
      showToast("All settings & notices saved successfully!");
    } catch (err: any) {
      alert("Failed to save: " + (err?.message || err));
    } finally {
      setSaving(false);
      setSaveMode(null);
    }
  };

  // Login Screen Gate
  if (!user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-xl border border-slate-200 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-inner">
            <Lock className="w-8 h-8 text-blue-950" />
          </div>

          <h3 className="text-xl font-extrabold text-gray-900 mb-1 font-serif text-center">
            FSU CMS Control Center
          </h3>
          <p className="text-xs text-blue-900 font-mono tracking-wider uppercase mb-4 font-semibold">
            https://www.fsudmc.com/#campuslogin
          </p>

          <p className="text-xs text-gray-500 mb-6 text-center leading-relaxed">
            Authorized administrator portal for Free Student Union - DMC. Manage all website content, hero sliders, news, faculty, staff, syllabus, and emergency notices.
          </p>

          {authSuccess && (
            <div className="w-full p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold mb-5 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{authSuccess}</span>
            </div>
          )}

          {authError && (
            <div className="w-full p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold mb-5 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Master / Secondary Admin Login Form */}
          <form onSubmit={handleCredentialsLogin} className="w-full space-y-4">
            <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-[11px] text-amber-950 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Master Admin Credentials:</span>
                <span>Username: <strong className="font-mono text-blue-950">dmcadmin</strong> &bull; Password: <strong className="font-mono text-blue-950">Admin</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Users className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="dmcadmin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Case-sensitive</span>
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
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
              <span>Log In to CMS Panel</span>
            </button>
          </form>

          {/* Separator */}
          <div className="w-full flex items-center my-5">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-xs text-gray-400 font-medium">OR FIREBASE AUTH</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loginLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Users className="w-4 h-4 text-emerald-400" />
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
              className="w-full py-2 text-gray-500 hover:text-gray-800 text-xs font-bold transition mt-2 flex items-center justify-center gap-1"
            >
              ← Back to Main Public Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast feedback notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-blue-950 text-white rounded-2xl shadow-2xl border border-blue-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Admin header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 p-6 md:p-8 rounded-3xl text-white mb-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Live Firebase CMS &bull; Encrypted Session
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-black">
            FSU CMS Control Center
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-blue-200/90 font-mono">
              Admin: <strong className="text-emerald-300 font-bold">{user.fullName || user.username || user.email}</strong>
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-mono ${
              user.role === "master"
                ? "bg-amber-400 text-slate-950 font-bold"
                : "bg-blue-300 text-blue-950 font-bold"
            }`}>
              {user.role === "master" ? "Master Admin" : "Secondary Admin"}
            </span>
          </div>
        </div>

        {/* Master Control Buttons: Save Data & Global Live */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleMasterAction("draft")}
            disabled={saving}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-600 shadow-sm cursor-pointer disabled:opacity-50"
            title="Save changes to local staging cache for review"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving && saveMode === "draft" ? "Saving..." : "Save Data (Draft)"}</span>
          </button>

          <button
            onClick={() => handleMasterAction("live")}
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
            title="Commit changes live to Firebase Realtime Database across the world"
          >
            <Globe className="w-4 h-4 text-white animate-spin-slow" />
            <span>{saving && saveMode === "live" ? "Publishing..." : "Publish Global Live"}</span>
          </button>

          <button
            onClick={onGoMessages}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            title="Access incoming student Helpdesk tickets & inquiries"
          >
            <Inbox className="w-4 h-4 text-amber-300" />
            <span>Helpdesk Inbox</span>
          </button>

          <button
            onClick={onGoHome}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition"
          >
            Public Site
          </button>

          <button
            onClick={handleSignOut}
            className="p-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation and Editors layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Tabs list */}
        <div className="lg:col-span-3 bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-3 mb-2 block">
            MANAGE WEBSITE CONTENT
          </span>

          <button
            onClick={() => setActiveTab("general")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "general" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>General Setup & Branding</span>
          </button>

          <button
            onClick={() => setActiveTab("slides")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "slides" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Homepage Hero Sliders</span>
          </button>

          <button
            onClick={() => setActiveTab("news")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "news" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>News, Notices & Tickers</span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "team" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>FSU Executive Committee</span>
          </button>

          <button
            onClick={() => setActiveTab("downloads")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "downloads" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Syllabus, Notes & Archives</span>
          </button>

          <button
            onClick={() => setActiveTab("blogs")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "blogs" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Student Blogs & Articles</span>
          </button>

          <button
            onClick={() => setActiveTab("popup")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "popup" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <span>Urgent Popup Modal Notice</span>
          </button>

          <button
            onClick={() => setActiveTab("staff")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "staff" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-700" />
            <span>Campus Staff Directory</span>
          </button>

          <button
            onClick={() => setActiveTab("professors")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "professors" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-purple-700" />
            <span>Professors & Faculty</span>
          </button>

          <button
            onClick={() => setActiveTab("faqs")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "faqs" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>FAQs (Accordion) Manager</span>
          </button>

          <button
            onClick={() => setActiveTab("tracking")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "tracking" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Complaint Tracker Setup</span>
          </button>

          <button
            onClick={() => setActiveTab("helpdesk")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "helpdesk" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Helpdesk & Hotline Settings</span>
          </button>

          <div className="pt-2 mt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-3 mb-1 block">
              ACCESS CONTROL
            </span>
            <button
              onClick={() => setActiveTab("admins")}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                activeTab === "admins" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Admin Accounts & Roles</span>
              </div>
              {user.role === "master" && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold text-[9px] uppercase font-mono">
                  Master
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="lg:col-span-9 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[550px]">
          
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-serif font-black text-slate-900">General Portal & Leadership Setup</h3>
                  <p className="text-xs text-gray-500">Edit core titles, leadership messages, about campus, social links, and legal text.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveGeneral("draft")}
                    disabled={saving}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-300"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-600" />
                    <span>Save Data (Draft)</span>
                  </button>
                  <button
                    onClick={() => handleSaveGeneral("live")}
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Global Live</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">FSU Portal Title</label>
                  <input
                    type="text"
                    value={genSettingsForm.titleEn || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, titleEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Campus Subtitle / Location</label>
                  <input
                    type="text"
                    value={genSettingsForm.subtitleEn || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, subtitleEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Official Institutional Logo URL</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={genSettingsForm.logoUrl || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, logoUrl: e.target.value })}
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-xs"
                    placeholder="https://..."
                  />
                  <label className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 border border-slate-200 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (b64) => setGenSettingsForm({ ...genSettingsForm, logoUrl: b64 }))}
                    />
                  </label>
                </div>
              </div>

              {/* FSU President Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">FSU President Message & Details</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">President Full Name</label>
                    <input
                      type="text"
                      value={genSettingsForm.presidentNameEn || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, presidentNameEn: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">President Photo URL</label>
                    <input
                      type="text"
                      value={genSettingsForm.presidentPhoto || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, presidentPhoto: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">President Official Message</label>
                  <textarea
                    rows={3}
                    value={genSettingsForm.presidentMessageEn || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, presidentMessageEn: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Campus Chief Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">Campus Chief Message & Details</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Campus Chief Full Name & Title</label>
                    <input
                      type="text"
                      value={genSettingsForm.chiefNameEn || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, chiefNameEn: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">Chief Photo URL</label>
                    <input
                      type="text"
                      value={genSettingsForm.chiefPhoto || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, chiefPhoto: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Campus Chief Official Message</label>
                  <textarea
                    rows={3}
                    value={genSettingsForm.chiefMessageEn || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, chiefMessageEn: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* About FSU & About Campus */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">About FSU Overview</label>
                  <textarea
                    rows={4}
                    value={genSettingsForm.aboutFsuEn || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, aboutFsuEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">About Darchula Multiple Campus</label>
                  <textarea
                    rows={4}
                    value={genSettingsForm.aboutCampusEn || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, aboutCampusEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Social Pages & Affiliation Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Campus Facebook Page</label>
                  <input
                    type="text"
                    value={genSettingsForm.fbCampusPage || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, fbCampusPage: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">FSU Facebook Page</label>
                  <input
                    type="text"
                    value={genSettingsForm.fbFsuPage || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, fbFsuPage: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>

              {/* History of DMC Box & Facebook Profile Settings */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Landmark className="w-4 h-4 text-red-700" />
                  <h4 className="text-sm font-bold text-slate-800">
                    History of DMC Box & Facebook Profile Link
                  </h4>
                  <span className="text-[10px] bg-red-100 text-red-800 font-mono px-2 py-0.5 rounded-full font-bold ml-auto">
                    Homepage Widget
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Box Heading
                    </label>
                    <input
                      type="text"
                      value={genSettingsForm.dmcHistoryHeading || ""}
                      onChange={(e) =>
                        setGenSettingsForm({
                          ...genSettingsForm,
                          dmcHistoryHeading: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                      placeholder="History of DMC"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Established Year / Badge Text
                    </label>
                    <input
                      type="text"
                      value={genSettingsForm.dmcEstYear || ""}
                      onChange={(e) =>
                        setGenSettingsForm({
                          ...genSettingsForm,
                          dmcEstYear: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                      placeholder="Est. 2062 B.S. (2005 A.D.)"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                    History of DMC Description / Narrative
                  </label>
                  <textarea
                    rows={4}
                    value={genSettingsForm.dmcHistoryText || ""}
                    onChange={(e) =>
                      setGenSettingsForm({
                        ...genSettingsForm,
                        dmcHistoryText: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none"
                    placeholder="Enter the detailed history of Darchula Multiple Campus..."
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Displayed on the homepage next to the Recent News & Notices list.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                      <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                      <span>Facebook Profile / Page URL</span>
                    </label>
                    <input
                      type="text"
                      value={genSettingsForm.dmcFacebookProfileUrl || ""}
                      onChange={(e) =>
                        setGenSettingsForm({
                          ...genSettingsForm,
                          dmcFacebookProfileUrl: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">
                      Facebook Button Label
                    </label>
                    <input
                      type="text"
                      value={genSettingsForm.dmcFacebookButtonText || ""}
                      onChange={(e) =>
                        setGenSettingsForm({
                          ...genSettingsForm,
                          dmcFacebookButtonText: e.target.value,
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                      placeholder="Visit Official Facebook Profile"
                    />
                  </div>
                </div>
              </div>

              {/* Legal: Privacy Policy & Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Privacy Policy Text</label>
                  <textarea
                    rows={3}
                    value={genSettingsForm.privacyPolicyEn || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, privacyPolicyEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Terms & Conditions Text</label>
                  <textarea
                    rows={3}
                    value={genSettingsForm.termsEn || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, termsEn: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SLIDES */}
          {activeTab === "slides" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif font-black text-slate-900">Homepage Hero Image Slider</h3>
                <p className="text-xs text-gray-500">Add, view, and delete full-width carousel banners on the homepage.</p>
              </div>

              {/* Add slide form */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add New Banner Slide</span>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Banner Slide Caption</label>
                  <input
                    type="text"
                    value={newSlide.titleEn}
                    onChange={(e) => setNewSlide({ ...newSlide, titleEn: e.target.value })}
                    placeholder="Welcome to Darchula Multiple Campus FSU"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Slide Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSlide.imageUrl}
                      onChange={(e) => setNewSlide({ ...newSlide, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (b64) => setNewSlide({ ...newSlide, imageUrl: b64 }))}
                      />
                    </label>
                  </div>
                </div>
                <button
                  onClick={addSlide}
                  className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Slide Live</span>
                </button>
              </div>

              {/* Existing Slides List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slides.map((s) => (
                  <div key={s.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <img src={s.imageUrl} alt={s.titleEn} className="w-full h-32 object-cover rounded-xl mb-2" />
                      <h4 className="font-bold text-sm text-slate-900">{s.titleEn}</h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => deleteItem("slides", s.id)}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NEWS & NOTICES */}
          {activeTab === "news" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif font-black text-slate-900">News, Announcements & Tickers</h3>
                <p className="text-xs text-gray-500">Publish urgent notices, exam schedules, and institutional campus updates.</p>
              </div>

              {/* Add News */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Publish New Announcement</span>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">News Headline</label>
                  <input
                    type="text"
                    value={newNews.headingEn}
                    onChange={(e) => setNewNews({ ...newNews, headingEn: e.target.value })}
                    placeholder="BBS / B.Ed Exam Center Published"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Announcement Body Text</label>
                  <textarea
                    rows={3}
                    value={newNews.bodyEn}
                    onChange={(e) => setNewNews({ ...newNews, bodyEn: e.target.value })}
                    placeholder="Full announcement details..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Optional Feature Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNews.imageUrl}
                      onChange={(e) => setNewNews({ ...newNews, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (b64) => setNewNews({ ...newNews, imageUrl: b64 }))}
                      />
                    </label>
                  </div>
                </div>
                <button
                  onClick={addNews}
                  className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Notice Live</span>
                </button>
              </div>

              {/* List */}
              <div className="space-y-3">
                {news.map((item) => (
                  <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{item.headingEn}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.bodyEn}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-2 block">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteItem("news", item.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEET FSU TEAM */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif font-black text-slate-900">FSU Executive Committee</h3>
                <p className="text-xs text-gray-500">Manage elected student union representatives and executive board members.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add Representative Card</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Representative Name</label>
                    <input
                      type="text"
                      value={newMember.nameEn}
                      onChange={(e) => setNewMember({ ...newMember, nameEn: e.target.value })}
                      placeholder="e.g., Amit Joshi"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">FSU Position / Role</label>
                    <input
                      type="text"
                      value={newMember.roleEn}
                      onChange={(e) => setNewMember({ ...newMember, roleEn: e.target.value })}
                      placeholder="e.g., FSU President"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Order Index (1 = President)</label>
                    <input
                      type="number"
                      value={newMember.order}
                      onChange={(e) => setNewMember({ ...newMember, order: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Photo URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMember.imageUrl}
                      onChange={(e) => setNewMember({ ...newMember, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (b64) => setNewMember({ ...newMember, imageUrl: b64 }))}
                      />
                    </label>
                  </div>
                </div>
                <button
                  onClick={addMember}
                  className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Team Member Live</span>
                </button>
              </div>

              {/* Committee grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {team.sort((a, b) => a.order - b.order).map((m) => (
                  <div key={m.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={m.imageUrl} alt={m.nameEn} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{m.nameEn}</h4>
                        <span className="text-[10px] text-red-700 font-bold block">{m.roleEn}</span>
                        <span className="text-[9px] text-slate-400 font-mono">Order: #{m.order}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem("team", m.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SYLLABUS & DOWNLOADS */}
          {activeTab === "downloads" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif font-black text-slate-900">Syllabus, Notes & Downloads</h3>
                <p className="text-xs text-gray-500">Provide academic curriculum, notes, and Google Drive resource links.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add Document / Notes Link</span>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Document Title</label>
                  <input
                    type="text"
                    value={newDownload.titleEn}
                    onChange={(e) => setNewDownload({ ...newDownload, titleEn: e.target.value })}
                    placeholder="BBS 1st Year Complete Notes"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Direct Download URL or Google Drive Link</label>
                  <input
                    type="text"
                    value={newDownload.fileUrl}
                    onChange={(e) => setNewDownload({ ...newDownload, fileUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <button
                  onClick={addDownload}
                  className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Resource Live</span>
                </button>
              </div>

              <div className="space-y-3">
                {downloads.map((d) => (
                  <div key={d.id} className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{d.titleEn}</h4>
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-900 underline font-mono flex items-center gap-1 mt-0.5">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-sm">{d.fileUrl}</span>
                      </a>
                    </div>
                    <button
                      onClick={() => deleteItem("downloads", d.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BLOGS */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif font-black text-slate-900">Student Blogs & Articles</h3>
                <p className="text-xs text-gray-500">Publish articles, essays, and opinion pieces authored by campus students.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add New Student Blog</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Article Heading</label>
                    <input
                      type="text"
                      value={newBlog.headingEn}
                      onChange={(e) => setNewBlog({ ...newBlog, headingEn: e.target.value })}
                      placeholder="Title of the article"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Author Name & Class</label>
                    <input
                      type="text"
                      value={newBlog.authorEn}
                      onChange={(e) => setNewBlog({ ...newBlog, authorEn: e.target.value })}
                      placeholder="e.g., Amit Joshi, BBS 3rd Year"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Article Body Content</label>
                  <textarea
                    rows={4}
                    value={newBlog.bodyEn}
                    onChange={(e) => setNewBlog({ ...newBlog, bodyEn: e.target.value })}
                    placeholder="Full article content..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Header Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBlog.imageUrl}
                      onChange={(e) => setNewBlog({ ...newBlog, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (b64) => setNewBlog({ ...newBlog, imageUrl: b64 }))}
                      />
                    </label>
                  </div>
                </div>
                <button
                  onClick={addBlog}
                  className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Blog Live</span>
                </button>
              </div>

              <div className="space-y-3">
                {blogs.map((b) => (
                  <div key={b.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{b.headingEn}</h4>
                      <span className="text-[11px] text-red-700 font-bold block mt-0.5">Author: {b.authorEn}</span>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{b.bodyEn}</p>
                    </div>
                    <button
                      onClick={() => deleteItem("blogs", b.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: POPUP NOTICE */}
          {activeTab === "popup" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-serif font-black text-slate-900">Urgent Popup Notice Modal</h3>
                  <p className="text-xs text-gray-500">Configure modal alert that pops up when visitors land on the portal.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveImportantNotice("draft")}
                    disabled={saving}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-300"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-600" />
                    <span>Save Data (Draft)</span>
                  </button>
                  <button
                    onClick={() => handleSaveImportantNotice("live")}
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Global Live</span>
                  </button>
                </div>
              </div>

              {/* Toggle active */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Enable Urgent Popup Alert</h4>
                  <p className="text-xs text-slate-500">When enabled, visitors will see this modal immediately on page load.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setImportantNoticeForm({ ...importantNoticeForm, active: !importantNoticeForm.active })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    importantNoticeForm.active ? "bg-red-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {importantNoticeForm.active ? "POPUP IS ACTIVE" : "POPUP IS DISABLED"}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Top Ticker Banner Text</label>
                <input
                  type="text"
                  value={importantNoticeForm.bannerTextEn || ""}
                  onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, bannerTextEn: e.target.value })}
                  placeholder="e.g., URGENT: FSU Helpdesk Admission Counters Open"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Popup Modal Title</label>
                <input
                  type="text"
                  value={importantNoticeForm.titleEn || ""}
                  onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, titleEn: e.target.value })}
                  placeholder="Modal Title"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Popup Modal Detailed Message</label>
                <textarea
                  rows={4}
                  value={importantNoticeForm.bodyEn || ""}
                  onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, bodyEn: e.target.value })}
                  placeholder="Detailed instructions for students..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Modal Flyer / Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={importantNoticeForm.imageUrl || ""}
                    onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <label className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 border border-slate-200 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Flyer</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, (b64) => setImportantNoticeForm({ ...importantNoticeForm, imageUrl: b64 }))}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CAMPUS STAFF DIRECTORY */}
          {activeTab === "staff" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif font-black text-slate-900">Campus Staff Directory</h3>
                <p className="text-xs text-gray-500">Manage administrative, examination, finance, and library staff members.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add New Staff Member</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      placeholder="e.g., Janak Raj Pant"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Designation</label>
                    <input
                      type="text"
                      value={newStaff.designation}
                      onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                      placeholder="e.g., Campus Administrator"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Department</label>
                    <select
                      value={newStaff.department}
                      onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="Administration">Administration</option>
                      <option value="Examination & Evaluation">Examination & Evaluation</option>
                      <option value="Finance & Accounts">Finance & Accounts</option>
                      <option value="Library & Information Center">Library & Information Center</option>
                      <option value="ICT & Technical Support">ICT & Technical Support</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Official Email</label>
                    <input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      placeholder="admin@fsudmc.com"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                      placeholder="+977-9848712345"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Office Room</label>
                    <input
                      type="text"
                      value={newStaff.office}
                      onChange={(e) => setNewStaff({ ...newStaff, office: e.target.value })}
                      placeholder="Main Admin Block, Room 101"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Photo URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStaff.imageUrl}
                      onChange={(e) => setNewStaff({ ...newStaff, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (b64) => setNewStaff({ ...newStaff, imageUrl: b64 }))}
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={addStaff}
                  className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff Member Live</span>
                </button>
              </div>

              {/* Staff List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {staff.map((s) => (
                  <div key={s.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img src={s.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"} alt={s.name} className="w-12 h-12 rounded-xl object-cover border" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                        <span className="text-xs text-blue-900 font-bold block">{s.designation}</span>
                        <span className="text-[11px] text-slate-500 block">{s.department}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">{s.email} &bull; {s.phone}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem("staff", s.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: PROFESSORS & FACULTY */}
          {activeTab === "professors" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif font-black text-slate-900">Professors & Academic Faculty</h3>
                <p className="text-xs text-gray-500">Manage academic professors, lecturers, and heads of departments.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add Faculty Member</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Full Name with Prefix</label>
                    <input
                      type="text"
                      value={newProf.name}
                      onChange={(e) => setNewProf({ ...newProf, name: e.target.value })}
                      placeholder="e.g., Assoc. Prof. Dr. Dinesh Bhatt"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Academic Title</label>
                    <input
                      type="text"
                      value={newProf.title}
                      onChange={(e) => setNewProf({ ...newProf, title: e.target.value })}
                      placeholder="Campus Chief & Associate Professor"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Faculty Stream</label>
                    <select
                      value={newProf.faculty}
                      onChange={(e) => setNewProf({ ...newProf, faculty: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="Faculty of Management">Faculty of Management</option>
                      <option value="Faculty of Education">Faculty of Education</option>
                      <option value="Faculty of Humanities & Social Sciences">Faculty of Humanities & Social Sciences</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Department</label>
                    <input
                      type="text"
                      value={newProf.department}
                      onChange={(e) => setNewProf({ ...newProf, department: e.target.value })}
                      placeholder="Business Administration"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Qualification</label>
                    <input
                      type="text"
                      value={newProf.qualification}
                      onChange={(e) => setNewProf({ ...newProf, qualification: e.target.value })}
                      placeholder="Ph.D. in Management, M.Phil"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Subjects (Comma-separated)</label>
                    <input
                      type="text"
                      value={profSubjectsInput}
                      onChange={(e) => setProfSubjectsInput(e.target.value)}
                      placeholder="Strategic Management, Research Methods"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Photo URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProf.imageUrl}
                      onChange={(e) => setNewProf({ ...newProf, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                    <label className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (b64) => setNewProf({ ...newProf, imageUrl: b64 }))}
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={addProfessor}
                  className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Professor Live</span>
                </button>
              </div>

              {/* Professor List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {professors.map((p) => (
                  <div key={p.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img src={p.imageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"} alt={p.name} className="w-12 h-12 rounded-xl object-cover border" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                        <span className="text-xs text-purple-900 font-bold block">{p.title}</span>
                        <span className="text-[11px] text-slate-500 block">{p.faculty} &bull; {p.department}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">{p.qualification}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem("professors", p.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: HELPDESK & EMERGENCY HOTLINE SETTINGS */}
          {activeTab === "helpdesk" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif font-black text-slate-900">Helpdesk & Emergency Hotline Console</h3>
                <p className="text-xs text-gray-500">Quickly review incoming tickets, manage emergency numbers, and student support configurations.</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-950 to-slate-900 rounded-3xl text-white space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/80 text-xs font-bold uppercase tracking-wider text-white">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                  Live Helpdesk Channel
                </div>
                <h4 className="text-xl font-serif font-black text-white">
                  Student Helpdesk & Grievance Tickets
                </h4>
                <p className="text-xs text-blue-200/90 leading-relaxed max-w-xl">
                  Incoming tickets submitted by students for admissions, exam center queries, scholarship counseling, and grievance redressal are stored securely in the Helpdesk Inbox.
                </p>

                <div className="pt-2">
                  <button
                    onClick={onGoMessages}
                    className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-950/40"
                  >
                    <Inbox className="w-4 h-4" />
                    <span>Open Helpdesk Messages Tab (https://www.fsudmc.com/#messages)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Emergency Helpline</span>
                  <p className="text-sm font-bold text-slate-900">9741823122</p>
                  <span className="text-[11px] text-slate-500">Available 24/7 for urgent assistance</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Official Email</span>
                  <p className="text-sm font-bold text-slate-900">info@fsudmc.com</p>
                  <span className="text-[11px] text-slate-500">Secretariat correspondence</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Physical Desk</span>
                  <p className="text-sm font-bold text-slate-900">FSU Secretariat Office</p>
                  <span className="text-[11px] text-slate-500">Khalanga, Darchula Multiple Campus</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: FAQS ACCORDION CRUD MANAGER */}
          {activeTab === "faqs" && (
            <FaqManager faqs={state?.faqs} onShowToast={showToast} />
          )}

          {/* TAB 12: COMPLAINT TRACKER SETTINGS */}
          {activeTab === "tracking" && (
            <TrackingSettingsManager settings={state?.trackingSettings} onShowToast={showToast} />
          )}

          {/* TAB 13: ADMIN ACCOUNTS & ROLE PERMISSIONS */}
          {activeTab === "admins" && (
            <AdminAccountsManager currentUser={user} onShowToast={showToast} />
          )}

        </div>
      </div>
    </div>
  );
}
