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
import RichTextEditor from "./cms/RichTextEditor";
import FaqManager from "./cms/FaqManager";
import AccountInfoManager from "./cms/AccountInfoManager";
import TrackingSettingsManager from "./cms/TrackingSettingsManager";
import CampusPortalManager from "./cms/CampusPortalManager";
import UpcomingEventsManager from "./cms/UpcomingEventsManager";
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
  ProfessorItem,
  CourseItem
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
  Facebook,
  Archive,
  Check,
  Search,
  AlertTriangle,
  X,
  Clock,
  BookOpen,
  Phone,
  RefreshCw,
  LayoutGrid,
  Calendar
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
  | "portal"
  | "upcoming-events"
  | "helpdesk"
  | "faqs"
  | "tracking"
  | "admins";

export default function CMSPanel({ state, onGoHome, onGoMessages }: CMSPanelProps) {
  // Always start in logged-out state so username and password are required every time
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<CMSTab>("general");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMode, setSaveMode] = useState<"draft" | "live" | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  // Admin Login States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
  const courses = state?.courses ? Object.values(state.courses) : [];

  // Temporary item forms
  const [newSlide, setNewSlide] = useState({ titleEn: "", imageUrl: "" });
  const [newNews, setNewNews] = useState<{
    headingEn: string;
    bodyEn: string;
    imageUrl: string;
    images: string[];
  }>({ headingEn: "", bodyEn: "", imageUrl: "", images: [] });
  const [tempNoticeImage, setTempNoticeImage] = useState("");

  const [newCourse, setNewCourse] = useState<Omit<CourseItem, "id">>({
    titleEn: "",
    titleNp: "",
    level: "Bachelor's Degree",
    faculty: "Faculty of Management",
    duration: "4 Years",
    descriptionEn: "",
    eligibilityEn: "",
    careerProspects: "",
    imageUrl: "",
    order: 1
  });
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({ nameEn: "", roleEn: "", imageUrl: "", order: 6 });
  const [newDownload, setNewDownload] = useState({ titleEn: "", fileUrl: "", isDriveLink: true });
  // In-app Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    confirmStyle?: "danger" | "warning";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Blogs CRUD State
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [newBlog, setNewBlog] = useState<{
    headingEn: string;
    authorEn: string;
    bodyEn: string;
    imageUrl: string;
    status: "published" | "draft" | "archived";
  }>({
    headingEn: "",
    authorEn: "",
    bodyEn: "",
    imageUrl: "",
    status: "published",
  });
  const [blogSearchQuery, setBlogSearchQuery] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");

  // Staff CRUD State
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState<Omit<StaffItem, "id">>({
    name: "",
    designation: "",
    department: "Administration",
    email: "",
    phone: "",
    office: "",
    workingHours: "Sunday – Friday: 10:00 AM – 5:00 PM",
    imageUrl: "",
    status: "active",
    order: 1,
  });
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [staffDeptFilter, setStaffDeptFilter] = useState("all");

  // Professors CRUD State
  const [editingProfId, setEditingProfId] = useState<string | null>(null);
  const [newProf, setNewProf] = useState<Omit<ProfessorItem, "id">>({
    name: "",
    title: "",
    faculty: "Faculty of Management",
    department: "",
    qualification: "",
    subjects: [],
    researchInterests: "",
    bio: "",
    email: "",
    phone: "",
    officeHours: "Sunday – Thursday: 11:00 AM – 1:00 PM",
    imageUrl: "",
    status: "active",
    order: 1,
  });
  const [profSubjectsInput, setProfSubjectsInput] = useState("");
  const [profSearchQuery, setProfSearchQuery] = useState("");
  const [profFacultyFilter, setProfFacultyFilter] = useState("all");

  useEffect(() => {
    // Synchronize with Firebase Auth session state
    const unsubscribe = onAdminAuthStateChanged((activeUser) => {
      setUser(activeUser);
      if (activeUser) {
        setAuthError("");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state?.generalSettings) setGenSettingsForm(state.generalSettings);
    if (state?.importantNotice) setImportantNoticeForm(state.importantNotice);
  }, [state]);

  const showToast = (txt: string) => {
    setToastMessage(txt);
    setTimeout(() => setToastMessage(""), 5000);
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setUser(null);
    setEmail("");
    setPassword("");
    setAuthError("");
    setAuthSuccess("");
  };

  const handleExitToHome = () => {
    onGoHome();
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setAuthError("Please provide both administrator email and password.");
      return;
    }

    setLoginLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const loggedUser = await signInAdminWithEmail(email.trim(), password);
      setUser(loggedUser);
      setPassword("");
      showToast(`Welcome back, ${loggedUser.displayName || loggedUser.email}!`);
    } catch (err: any) {
      console.error("Auth Error:", err);
      setAuthError(err.message || "Failed to authenticate.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const loggedUser = await signInAdminWithGoogle();
      setUser(loggedUser);
      showToast(`Welcome, ${loggedUser.displayName || loggedUser.email}!`);
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setAuthError(err.message || "Google sign-in failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail) {
      setAuthError("Please enter your registered administrator email address.");
      return;
    }

    setResetLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      await resetPasswordAdmin(targetEmail);
      setAuthSuccess(`Password reset instructions have been sent to ${targetEmail}. Please check your inbox.`);
      setShowForgotPassword(false);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setAuthError(err.message || "Failed to dispatch password reset email. Please try again.");
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
      const primaryImage = newNews.images.length > 0 ? newNews.images[0] : newNews.imageUrl;
      await saveSubItem("news", id, {
        id,
        headingEn: newNews.headingEn,
        bodyEn: newNews.bodyEn,
        imageUrl: primaryImage || "",
        images: newNews.images.length > 0 ? newNews.images : (primaryImage ? [primaryImage] : []),
        createdAt: Date.now()
      });
      setNewNews({ headingEn: "", bodyEn: "", imageUrl: "", images: [] });
      setTempNoticeImage("");
      showToast("Announcement published live with notice images!");
    } catch (err: any) { alert(err?.message || err); }
  };

  const handleAddNoticeImage = (url: string) => {
    if (!url) return;
    setNewNews((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
      imageUrl: prev.imageUrl || url
    }));
    setTempNoticeImage("");
  };

  const handleRemoveNoticeImage = (indexToRemove: number) => {
    setNewNews((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updated,
        imageUrl: updated.length > 0 ? updated[0] : ""
      };
    });
  };

  const addCourse = async () => {
    if (!newCourse.titleEn || !newCourse.descriptionEn) return alert("Please specify course title and description.");
    try {
      const id = editingCourseId || `course_${Date.now()}`;
      await saveSubItem("courses", id, {
        id,
        ...newCourse,
        order: Number(newCourse.order) || (courses.length + 1)
      });
      setNewCourse({
        titleEn: "",
        titleNp: "",
        level: "Bachelor's Degree",
        faculty: "Faculty of Management",
        duration: "4 Years",
        descriptionEn: "",
        eligibilityEn: "",
        careerProspects: "",
        imageUrl: "",
        order: (courses.length || 0) + 1
      });
      setEditingCourseId(null);
      showToast(editingCourseId ? "Academic course updated live!" : "Academic course added and published live!");
    } catch (err: any) { alert(err?.message || err); }
  };

  const startEditCourse = (item: CourseItem) => {
    setEditingCourseId(item.id);
    setNewCourse({
      titleEn: item.titleEn,
      titleNp: item.titleNp || "",
      level: item.level || "Bachelor's Degree",
      faculty: item.faculty || "Faculty of Management",
      duration: item.duration || "4 Years",
      descriptionEn: item.descriptionEn,
      eligibilityEn: item.eligibilityEn || "",
      careerProspects: item.careerProspects || "",
      imageUrl: item.imageUrl || "",
      order: item.order || 1
    });
  };

  const cancelEditCourse = () => {
    setEditingCourseId(null);
    setNewCourse({
      titleEn: "",
      titleNp: "",
      level: "Bachelor's Degree",
      faculty: "Faculty of Management",
      duration: "4 Years",
      descriptionEn: "",
      eligibilityEn: "",
      careerProspects: "",
      imageUrl: "",
      order: (courses.length || 0) + 1
    });
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

  // ==========================================
  // BLOGS CRUD HANDLERS
  // ==========================================
  const startEditBlog = (item: BlogItem) => {
    setEditingBlogId(item.id);
    setNewBlog({
      headingEn: item.headingEn,
      authorEn: item.authorEn || "",
      bodyEn: item.bodyEn,
      imageUrl: item.imageUrl || "",
      status: item.status || "published",
    });
    const el = document.getElementById("blogs-crud-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEditBlog = () => {
    setEditingBlogId(null);
    setNewBlog({
      headingEn: "",
      authorEn: "",
      bodyEn: "",
      imageUrl: "",
      status: "published",
    });
  };

  const saveOrUpdateBlog = async () => {
    if (!newBlog.headingEn.trim()) {
      alert("Please specify the blog article heading/title.");
      return;
    }
    if (!newBlog.bodyEn.trim()) {
      alert("Please write the content for the blog article.");
      return;
    }

    try {
      if (editingBlogId) {
        const existing = blogs.find((b) => b.id === editingBlogId);
        await saveSubItem("blogs", editingBlogId, {
          id: editingBlogId,
          createdAt: existing?.createdAt || Date.now(),
          ...newBlog,
        });
        showToast("Blog article updated live successfully!");
      } else {
        const id = `blog_${Date.now()}`;
        await saveSubItem("blogs", id, {
          id,
          createdAt: Date.now(),
          ...newBlog,
        });
        showToast("New student blog article published live!");
      }
      cancelEditBlog();
    } catch (err: any) {
      alert(err?.message || err);
    }
  };

  const toggleBlogStatus = async (blog: BlogItem) => {
    const nextStatus = blog.status === "archived" ? "published" : "archived";
    try {
      await saveSubItem("blogs", blog.id, {
        ...blog,
        status: nextStatus,
      });
      showToast(nextStatus === "archived" ? "Blog archived (hidden from live site)." : "Blog published live!");
    } catch (err: any) {
      alert(err?.message || err);
    }
  };

  const requestDeleteBlog = (blog: BlogItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Blog Article?",
      message: `Are you sure you want to permanently delete "${blog.headingEn}"? This action cannot be undone.`,
      confirmLabel: "Permanently Delete",
      confirmStyle: "danger",
      onConfirm: async () => {
        try {
          await deleteSubItem("blogs", blog.id);
          if (editingBlogId === blog.id) cancelEditBlog();
          showToast("Blog article deleted successfully.");
        } catch (err: any) {
          alert(err?.message || err);
        }
      },
    });
  };

  // ==========================================
  // STAFF CRUD HANDLERS
  // ==========================================
  const startEditStaff = (member: StaffItem) => {
    setEditingStaffId(member.id);
    setNewStaff({
      name: member.name,
      designation: member.designation,
      department: member.department,
      email: member.email,
      phone: member.phone,
      office: member.office,
      workingHours: member.workingHours || "Sunday – Friday: 10:00 AM – 5:00 PM",
      imageUrl: member.imageUrl || "",
      status: member.status || "active",
      order: member.order || 1,
    });
    const el = document.getElementById("staff-crud-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEditStaff = () => {
    setEditingStaffId(null);
    setNewStaff({
      name: "",
      designation: "",
      department: "Administration",
      email: "",
      phone: "",
      office: "",
      workingHours: "Sunday – Friday: 10:00 AM – 5:00 PM",
      imageUrl: "",
      status: "active",
      order: (staff.length || 0) + 1,
    });
  };

  const saveOrUpdateStaff = async () => {
    if (!newStaff.name.trim()) {
      alert("Please specify the staff member's full name.");
      return;
    }
    if (!newStaff.designation.trim()) {
      alert("Please specify the staff designation/role.");
      return;
    }

    try {
      const id = editingStaffId || `staff_${Date.now()}`;
      await saveSubItem("staff", id, {
        id,
        ...newStaff,
      });
      showToast(editingStaffId ? "Campus staff profile updated live!" : "New staff member added live to directory!");
      cancelEditStaff();
    } catch (err: any) {
      alert(err?.message || err);
    }
  };

  const requestDeleteStaff = (member: StaffItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Staff Member?",
      message: `Are you sure you want to remove ${member.name} (${member.designation}) from the campus directory?`,
      confirmLabel: "Delete Member",
      confirmStyle: "danger",
      onConfirm: async () => {
        try {
          await deleteSubItem("staff", member.id);
          if (editingStaffId === member.id) cancelEditStaff();
          showToast(`Staff record for ${member.name} deleted.`);
        } catch (err: any) {
          alert(err?.message || err);
        }
      },
    });
  };

  // ==========================================
  // PROFESSORS & FACULTY CRUD HANDLERS
  // ==========================================
  const startEditProf = (prof: ProfessorItem) => {
    setEditingProfId(prof.id);
    setNewProf({
      name: prof.name,
      title: prof.title,
      faculty: prof.faculty,
      department: prof.department,
      qualification: prof.qualification,
      subjects: prof.subjects || [],
      researchInterests: prof.researchInterests || "",
      bio: prof.bio || "",
      email: prof.email,
      phone: prof.phone || "",
      officeHours: prof.officeHours || "Sunday – Thursday: 11:00 AM – 1:00 PM",
      imageUrl: prof.imageUrl || "",
      status: prof.status || "active",
      order: prof.order || 1,
    });
    setProfSubjectsInput((prof.subjects || []).join(", "));
    const el = document.getElementById("prof-crud-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEditProf = () => {
    setEditingProfId(null);
    setNewProf({
      name: "",
      title: "",
      faculty: "Faculty of Management",
      department: "",
      qualification: "",
      subjects: [],
      researchInterests: "",
      bio: "",
      email: "",
      phone: "",
      officeHours: "Sunday – Thursday: 11:00 AM – 1:00 PM",
      imageUrl: "",
      status: "active",
      order: (professors.length || 0) + 1,
    });
    setProfSubjectsInput("");
  };

  const saveOrUpdateProf = async () => {
    if (!newProf.name.trim()) {
      alert("Please specify the professor/faculty member's name.");
      return;
    }
    if (!newProf.title.trim()) {
      alert("Please specify the academic title or designation.");
      return;
    }

    try {
      const subjectsArray = profSubjectsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const id = editingProfId || `prof_${Date.now()}`;
      await saveSubItem("professors", id, {
        id,
        ...newProf,
        subjects: subjectsArray,
      });
      showToast(editingProfId ? "Faculty academic record updated live!" : "New professor added live to faculty directory!");
      cancelEditProf();
    } catch (err: any) {
      alert(err?.message || err);
    }
  };

  const requestDeleteProf = (prof: ProfessorItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Faculty Record?",
      message: `Are you sure you want to remove ${prof.name} (${prof.title}) from the academic faculty directory?`,
      confirmLabel: "Delete Faculty",
      confirmStyle: "danger",
      onConfirm: async () => {
        try {
          await deleteSubItem("professors", prof.id);
          if (editingProfId === prof.id) cancelEditProf();
          showToast(`Faculty record for ${prof.name} deleted.`);
        } catch (err: any) {
          alert(err?.message || err);
        }
      },
    });
  };

  // Safe In-App Delete Handler for general nodes
  const deleteItem = async (node: string, id: string, label?: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm Deletion",
      message: label
        ? `Are you sure you want to delete "${label}"? This action cannot be undone.`
        : "Are you sure you want to permanently delete this item? This action cannot be undone.",
      confirmLabel: "Permanently Delete",
      confirmStyle: "danger",
      onConfirm: async () => {
        try {
          await deleteSubItem(node as keyof DatabaseState, id);
          showToast("Item permanently removed.");
        } catch (err: any) {
          alert(err?.message || err);
        }
      },
    });
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

  // Login Screen Gate - Firebase Authentication
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
            Authorized administrator portal for Free Student Union - DMC. Authenticate using your provisioned Google Firebase administrator credentials.
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

          {/* Firebase Auth Email & Password Login Form */}
          <form onSubmit={handleEmailPasswordLogin} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Administrator Email
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
                  placeholder="admin@fsudmc.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(!showForgotPassword)}
                  className="text-[11px] text-blue-800 hover:text-blue-950 font-bold hover:underline cursor-pointer"
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
              <span>Sign In with Firebase Auth</span>
            </button>

            {/* Optional Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loginLoading}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>
          </form>

          {/* Forgot password collapsible section */}
          {showForgotPassword && (
            <div className="w-full mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in text-left">
              <h4 className="text-xs font-bold text-slate-800 mb-1">Reset Password</h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Enter your admin email to receive a password reset link from Firebase.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-2">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@fsudmc.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security & Owner Provisioning Notice */}
          <div className="w-full mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Restricted Administrator Access</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Public self-registration is permanently disabled. Administrator accounts can only be created and authorized by the site owner directly inside the Google Firebase Console.
            </p>
          </div>

          <div className="w-full space-y-3 mt-4">
            <button
              onClick={handleExitToHome}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
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
              Admin: <strong className="text-emerald-300 font-bold">{user.email || user.fullName || user.displayName}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider font-mono bg-emerald-400 text-slate-950 font-bold">
              Firebase Admin
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
            onClick={handleExitToHome}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition"
          >
            Public Site
          </button>

          <button
            onClick={handleSignOut}
            className="p-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
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
            onClick={() => setActiveTab("courses")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "courses" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <span>Offered Academic Courses</span>
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
            onClick={() => setActiveTab("portal")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "portal" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-amber-500" />
            <span>Campus Portal Shortcuts</span>
          </button>

          <button
            onClick={() => setActiveTab("upcoming-events")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "upcoming-events" ? "bg-blue-950 text-white shadow-sm" : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Upcoming Events (/upcoming-event)</span>
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
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Admin Profile &amp; Auth</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 font-bold text-[9px] uppercase font-mono">
                Firebase
              </span>
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
              <ImageUploadInput
                label="Official Institutional Logo"
                value={genSettingsForm.logoUrl || ""}
                onChange={(url) => setGenSettingsForm({ ...genSettingsForm, logoUrl: url })}
                placeholder="Institutional logo URL or upload image file..."
                helpText="Displayed in the header and footer branding across the portal."
              />

              {/* FSU President Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">FSU President Message & Details</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
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
                    <ImageUploadInput
                      label="President Photo"
                      value={genSettingsForm.presidentPhoto || ""}
                      onChange={(url) => setGenSettingsForm({ ...genSettingsForm, presidentPhoto: url })}
                      placeholder="President photo URL or upload..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
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
                    <ImageUploadInput
                      label="Campus Chief Photo"
                      value={genSettingsForm.chiefPhoto || ""}
                      onChange={(url) => setGenSettingsForm({ ...genSettingsForm, chiefPhoto: url })}
                      placeholder="Chief photo URL or upload..."
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
                <ImageUploadInput
                  label="Slide Image *"
                  value={newSlide.imageUrl}
                  onChange={(url) => setNewSlide({ ...newSlide, imageUrl: url })}
                  placeholder="https://images.unsplash.com/... or upload photo"
                  helpText="Recommended dimensions: 1920x800 for optimal carousel appearance."
                />
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
                <p className="text-xs text-gray-500">Publish urgent notices, exam schedules, circulars, and institutional campus updates with multiple images.</p>
              </div>

              {/* Add News */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Publish New Notice / Circular</span>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Notice Headline</label>
                  <input
                    type="text"
                    value={newNews.headingEn}
                    onChange={(e) => setNewNews({ ...newNews, headingEn: e.target.value })}
                    placeholder="BBS / B.Ed 1st Semester Exam Schedule & Centers"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Notice Body Text</label>
                  <textarea
                    rows={4}
                    value={newNews.bodyEn}
                    onChange={(e) => setNewNews({ ...newNews, bodyEn: e.target.value })}
                    placeholder="Full announcement details..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                {/* Multiple Images Upload Support */}
                <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Notice Images & Document Attachments (Multiple Uploads Allowed)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    You can upload multiple high-resolution photos, flyers, or circular documents for this notice. They will be rendered in their full aspect ratio without cropping.
                  </p>

                  <div className="flex flex-col sm:flex-row items-end gap-2 pt-2">
                    <div className="flex-1 w-full">
                      <ImageUploadInput
                        label="Upload Notice Image"
                        value={tempNoticeImage}
                        onChange={(url) => setTempNoticeImage(url)}
                        placeholder="Upload or enter notice image URL"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddNoticeImage(tempNoticeImage)}
                      disabled={!tempNoticeImage}
                      className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add To Notice</span>
                    </button>
                  </div>

                  {newNews.images && newNews.images.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-600 block mb-2">
                        Staged Images ({newNews.images.length}):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {newNews.images.map((imgUrl, idx) => (
                          <div key={idx} className="relative group border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                            <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-24 object-contain" />
                            <button
                              type="button"
                              onClick={() => handleRemoveNoticeImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={addNews}
                  className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Notice Live</span>
                </button>
              </div>

              {/* List */}
              <div className="space-y-3">
                {news.map((item) => (
                  <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <h4 className="font-bold text-sm text-slate-900">{item.headingEn}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.bodyEn}</p>
                      
                      {/* Attached images preview */}
                      {(item.images && item.images.length > 0) || item.imageUrl ? (
                        <div className="flex items-center gap-2 pt-1">
                          {(item.images || [item.imageUrl!]).map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt="Attachment"
                              className="w-12 h-12 object-contain bg-slate-100 rounded-lg border border-slate-200"
                            />
                          ))}
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(item.images?.length || 1)} photo(s)
                          </span>
                        </div>
                      ) : null}

                      <span className="text-[10px] text-slate-400 font-mono block">
                        Published: {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteItem("news", item.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition cursor-pointer self-start sm:self-center"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ACADEMIC COURSES */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-serif font-black text-slate-900">Offered Academic Courses Management</h3>
                  <p className="text-xs text-gray-500">Create, edit, and manage degree courses offered by Darchula Multiple Campus under Farwestern University.</p>
                </div>
                {editingCourseId && (
                  <button
                    onClick={cancelEditCourse}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              {/* Add / Edit Course Form */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    {editingCourseId ? "Edit Academic Course" : "Add New Academic Course"}
                  </span>
                  {editingCourseId && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md font-mono">
                      Editing: {editingCourseId}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Course Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={newCourse.titleEn}
                      onChange={(e) => setNewCourse({ ...newCourse, titleEn: e.target.value })}
                      placeholder="Bachelor of Business Studies (BBS)"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Course Title (Nepali)</label>
                    <input
                      type="text"
                      value={newCourse.titleNp || ""}
                      onChange={(e) => setNewCourse({ ...newCourse, titleNp: e.target.value })}
                      placeholder="व्यवसाय अध्ययनमा स्नातक (BBS)"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Degree Level</label>
                    <select
                      value={newCourse.level || "Bachelor's Degree"}
                      onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                    >
                      <option value="Bachelor's Degree">Bachelor's Degree (Undergraduate)</option>
                      <option value="Master's Degree (Postgraduate)">Master's Degree (Postgraduate)</option>
                      <option value="+2 Higher Secondary">+2 Higher Secondary</option>
                      <option value="Diploma / Certificate">Diploma / Certificate</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Faculty / Stream</label>
                    <input
                      type="text"
                      value={newCourse.faculty || ""}
                      onChange={(e) => setNewCourse({ ...newCourse, faculty: e.target.value })}
                      placeholder="Faculty of Management / Education / Humanities"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Course Duration</label>
                    <input
                      type="text"
                      value={newCourse.duration || ""}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      placeholder="4 Years (Annual System) / 2 Years (Semester)"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Display Order</label>
                    <input
                      type="number"
                      value={newCourse.order || 1}
                      onChange={(e) => setNewCourse({ ...newCourse, order: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Course Details & Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={newCourse.descriptionEn}
                    onChange={(e) => setNewCourse({ ...newCourse, descriptionEn: e.target.value })}
                    placeholder="Comprehensive description of the curriculum, objectives, academic environment, and learning outcomes..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Eligibility Criteria</label>
                    <textarea
                      rows={2}
                      value={newCourse.eligibilityEn || ""}
                      onChange={(e) => setNewCourse({ ...newCourse, eligibilityEn: e.target.value })}
                      placeholder="Minimum +2 or equivalent score recognized by FWU..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Career Prospects & Scope</label>
                    <textarea
                      rows={2}
                      value={newCourse.careerProspects || ""}
                      onChange={(e) => setNewCourse({ ...newCourse, careerProspects: e.target.value })}
                      placeholder="Banking, corporate sector, civil services, school leadership..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <ImageUploadInput
                  label="Course Image / Poster"
                  value={newCourse.imageUrl || ""}
                  onChange={(url) => setNewCourse({ ...newCourse, imageUrl: url })}
                  placeholder="Upload or enter course image URL"
                />

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={addCourse}
                    className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {editingCourseId ? <Save className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4" />}
                    <span>{editingCourseId ? "Update Course Details" : "Publish New Course"}</span>
                  </button>

                  {editingCourseId && (
                    <button
                      onClick={cancelEditCourse}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Existing Courses List */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Currently Offered Courses ({courses.length})
                </span>
                {courses.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No academic courses added yet. Use the form above to add your first course.
                  </div>
                ) : (
                  courses
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {c.imageUrl ? (
                            <img
                              src={c.imageUrl}
                              alt={c.titleEn}
                              className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-blue-100 text-blue-900 rounded-xl flex items-center justify-center shrink-0">
                              <GraduationCap className="w-8 h-8" />
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{c.titleEn}</h4>
                              {c.level && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-100">
                                  {c.level}
                                </span>
                              )}
                              {c.duration && (
                                <span className="text-[11px] text-slate-500 font-mono">
                                  • {c.duration}
                                </span>
                              )}
                            </div>
                            {c.faculty && (
                              <p className="text-xs text-slate-500 font-medium">{c.faculty}</p>
                            )}
                            <p className="text-xs text-slate-600 line-clamp-2">{c.descriptionEn}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => startEditCourse(c)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Edit Course"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => deleteItem("courses", c.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
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
                <ImageUploadInput
                  label="Representative Photo"
                  value={newMember.imageUrl}
                  onChange={(url) => setNewMember({ ...newMember, imageUrl: url })}
                  placeholder="https://... or upload portrait photo"
                />
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

          {/* TAB 6: BLOGS - FULL CRUD EDITORIAL MANAGEMENT */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              {/* Header & Overview Stats */}
              <div className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-serif font-black text-slate-900 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-blue-900" />
                    Student Blogs & Editorial Management
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Create, edit, publish, archive, and manage articles authored by campus students and scholars.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold">
                    Total: {blogs.length}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                    Published: {blogs.filter((b) => !b.status || b.status === "published").length}
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold">
                    Archived: {blogs.filter((b) => b.status === "archived").length}
                  </span>
                </div>
              </div>

              {/* Blog Create / Edit Form */}
              <div id="blogs-crud-form" className={`p-5 rounded-2xl border transition-all ${
                editingBlogId 
                  ? "bg-amber-50/50 border-amber-300 shadow-md ring-2 ring-amber-400/20" 
                  : "bg-slate-50 border-slate-200"
              } space-y-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {editingBlogId ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-600 text-white text-xs font-bold uppercase tracking-wider">
                        <Edit className="w-3.5 h-3.5" />
                        Editing Blog Article
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Write & Publish New Student Blog
                      </span>
                    )}
                    {editingBlogId && (
                      <span className="text-xs text-slate-500 font-mono">
                        (ID: {editingBlogId})
                      </span>
                    )}
                  </div>
                  {editingBlogId && (
                    <button
                      type="button"
                      onClick={cancelEditBlog}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel Edit</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Article Heading / Title *
                    </label>
                    <input
                      type="text"
                      value={newBlog.headingEn}
                      onChange={(e) => setNewBlog({ ...newBlog, headingEn: e.target.value })}
                      placeholder="e.g., Reflections on Higher Education in Far-Western Nepal"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Publication Status
                    </label>
                    <select
                      value={newBlog.status || "published"}
                      onChange={(e) => setNewBlog({ ...newBlog, status: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    >
                      <option value="published">Published (Visible on Live Website)</option>
                      <option value="draft">Draft (Saved in CMS Only)</option>
                      <option value="archived">Archived (Hidden from Public)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">
                    Author Name & Class / Faculty *
                  </label>
                  <input
                    type="text"
                    value={newBlog.authorEn}
                    onChange={(e) => setNewBlog({ ...newBlog, authorEn: e.target.value })}
                    placeholder="e.g., Amit Joshi, BBS 3rd Year"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <RichTextEditor
                    label="Article Body Content *"
                    value={newBlog.bodyEn}
                    onChange={(val) => setNewBlog({ ...newBlog, bodyEn: val })}
                    placeholder="Write or paste full article content (supports formatting, headings, bullet lists, blockquotes, and links)..."
                  />
                </div>

                <ImageUploadInput
                  label="Header Feature Image"
                  value={newBlog.imageUrl}
                  onChange={(url) => setNewBlog({ ...newBlog, imageUrl: url })}
                  placeholder="https://... or upload header photo"
                />

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={saveOrUpdateBlog}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm text-white cursor-pointer ${
                      editingBlogId
                        ? "bg-emerald-700 hover:bg-emerald-800"
                        : "bg-blue-950 hover:bg-blue-900"
                    }`}
                  >
                    {editingBlogId ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Update Blog Article Live</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Publish Blog Live</span>
                      </>
                    )}
                  </button>

                  {editingBlogId && (
                    <button
                      type="button"
                      onClick={cancelEditBlog}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Blogs Directory List / Table Preview */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  {/* Search bar */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search blogs by title or author..."
                      value={blogSearchQuery}
                      onChange={(e) => setBlogSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>

                  {/* Status filter tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {(["all", "published", "draft", "archived"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setBlogStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                          blogStatusFilter === status
                            ? "bg-blue-950 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blog Rows */}
                {blogs
                  .filter((b) => {
                    const matchesSearch =
                      b.headingEn.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                      (b.authorEn || "").toLowerCase().includes(blogSearchQuery.toLowerCase());
                    const currentStatus = b.status || "published";
                    const matchesStatus =
                      blogStatusFilter === "all" || currentStatus === blogStatusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((b) => {
                    const status = b.status || "published";
                    const isEditing = editingBlogId === b.id;

                    return (
                      <div
                        key={b.id}
                        className={`p-4 bg-white rounded-2xl border transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          isEditing
                            ? "border-amber-400 bg-amber-50/20 ring-2 ring-amber-300/30"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          {b.imageUrl ? (
                            <img
                              src={b.imageUrl}
                              alt={b.headingEn}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                              <PenTool className="w-6 h-6 text-blue-800" />
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{b.headingEn}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  status === "published"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : status === "archived"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {status}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="font-semibold text-red-700">Author: {b.authorEn}</span>
                              {b.createdAt && (
                                <>
                                  <span>•</span>
                                  <span className="text-[11px] font-mono">
                                    {new Date(b.createdAt).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                              {b.bodyEn.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => startEditBlog(b)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Edit Blog"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleBlogStatus(b)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                              status === "archived"
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-700"
                            }`}
                            title={status === "archived" ? "Publish blog live" : "Archive blog"}
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>{status === "archived" ? "Publish" : "Archive"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDeleteBlog(b)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition cursor-pointer"
                            title="Delete Blog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {blogs.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No student blogs currently found. Write and publish your first article above.
                  </div>
                )}
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

              <ImageUploadInput
                label="Modal Flyer / Image"
                value={importantNoticeForm.imageUrl || ""}
                onChange={(url) => setImportantNoticeForm({ ...importantNoticeForm, imageUrl: url })}
                placeholder="https://... or upload flyer image"
              />
            </div>
          )}

          {/* TAB 8: CAMPUS STAFF DIRECTORY */}
          {activeTab === "staff" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif font-black text-slate-900">Campus Staff Directory</h3>
                <p className="text-xs text-gray-500">Manage administrative, examination, finance, and library staff members.</p>
              </div>

              <div id="staff-crud-form" className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {editingStaffId ? "Edit Staff Member" : "Add New Staff Member"}
                </span>
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

                <ImageUploadInput
                  label="Staff Photo"
                  value={newStaff.imageUrl}
                  onChange={(url) => setNewStaff({ ...newStaff, imageUrl: url })}
                  placeholder="https://... or upload staff member photo"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={saveOrUpdateStaff}
                    className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    {editingStaffId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingStaffId ? "Update Staff Member Live" : "Add Staff Member Live"}</span>
                  </button>
                  {editingStaffId && (
                    <button
                      type="button"
                      onClick={cancelEditStaff}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditStaff(s)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg transition"
                        title="Edit Staff"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => requestDeleteStaff(s)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition"
                        title="Delete Staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: PROFESSORS & FACULTY */}
          {activeTab === "professors" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif font-black text-slate-900">Professors &amp; Academic Faculty Directory</h3>
                <p className="text-xs text-gray-500">
                  Manage academic records, designations, departments, qualifications, subjects, and biographical profiles for faculty members.
                </p>
              </div>

              {/* Professor Form */}
              <div id="prof-crud-form" className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    {editingProfId ? "Edit Faculty Member Record" : "Add New Faculty Member"}
                  </span>
                  {editingProfId && (
                    <span className="text-[11px] font-mono bg-blue-100 text-blue-950 font-bold px-2 py-0.5 rounded-md">
                      Editing: {editingProfId}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      Full Name with Prefix <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newProf.name}
                      onChange={(e) => setNewProf({ ...newProf, name: e.target.value })}
                      placeholder="e.g., Assoc. Prof. Dr. Dinesh Kumar Bhatt"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      Academic Designation / Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newProf.title}
                      onChange={(e) => setNewProf({ ...newProf, title: e.target.value })}
                      placeholder="Campus Chief & Associate Professor"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Faculty Stream</label>
                    <select
                      value={newProf.faculty}
                      onChange={(e) => setNewProf({ ...newProf, faculty: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Faculty of Management">Faculty of Management</option>
                      <option value="Faculty of Education">Faculty of Education</option>
                      <option value="Faculty of Humanities & Social Sciences">Faculty of Humanities & Social Sciences</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Academic Department</label>
                    <input
                      type="text"
                      value={newProf.department}
                      onChange={(e) => setNewProf({ ...newProf, department: e.target.value })}
                      placeholder="Business Administration & Strategy"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Qualification & Degrees</label>
                    <input
                      type="text"
                      value={newProf.qualification}
                      onChange={(e) => setNewProf({ ...newProf, qualification: e.target.value })}
                      placeholder="Ph.D. in Management, M.Phil, MBS"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Subjects (Comma-separated)</label>
                    <input
                      type="text"
                      value={profSubjectsInput}
                      onChange={(e) => setProfSubjectsInput(e.target.value)}
                      placeholder="Strategic Management, Research Methods"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Official Email</label>
                    <input
                      type="email"
                      value={newProf.email}
                      onChange={(e) => setNewProf({ ...newProf, email: e.target.value })}
                      placeholder="faculty@fsudmc.com"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Phone / Extension</label>
                    <input
                      type="text"
                      value={newProf.phone || ""}
                      onChange={(e) => setNewProf({ ...newProf, phone: e.target.value })}
                      placeholder="+977-9848712345"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Office Hours / Consultation</label>
                    <input
                      type="text"
                      value={newProf.officeHours || ""}
                      onChange={(e) => setNewProf({ ...newProf, officeHours: e.target.value })}
                      placeholder="Sunday – Thursday: 11:00 AM – 1:00 PM"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Research Interests &amp; Specialization
                  </label>
                  <input
                    type="text"
                    value={newProf.researchInterests || ""}
                    onChange={(e) => setNewProf({ ...newProf, researchInterests: e.target.value })}
                    placeholder="Higher Education Leadership, Mountain Regional Economic Development..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Faculty Biography &amp; Academic Background
                  </label>
                  <textarea
                    rows={3}
                    value={newProf.bio || ""}
                    onChange={(e) => setNewProf({ ...newProf, bio: e.target.value })}
                    placeholder="Enter professor's academic biography, scholarly accomplishments, awards, and contributions to Darchula Multiple Campus..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <ImageUploadInput
                  label="Faculty / Professor Portrait Photo"
                  value={newProf.imageUrl}
                  onChange={(url) => setNewProf({ ...newProf, imageUrl: url })}
                  placeholder="https://... or upload professor portrait"
                />

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={saveOrUpdateProf}
                    className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {editingProfId ? <Check className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
                    <span>{editingProfId ? "Update Professor Live" : "Add Professor Live"}</span>
                  </button>
                  {editingProfId && (
                    <button
                      type="button"
                      onClick={cancelEditProf}
                      className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* CLEAN TABLE PREVIEW (TASK 3B) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-serif font-black text-slate-900">
                      Active Faculty Table Preview ({professors.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Direct Edit and Delete actions with instant database synchronization.
                    </p>
                  </div>

                  {/* Filter and Search */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={profSearchQuery}
                        onChange={(e) => setProfSearchQuery(e.target.value)}
                        placeholder="Search name, title, dept..."
                        className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-900"
                      />
                    </div>

                    <select
                      value={profFacultyFilter}
                      onChange={(e) => setProfFacultyFilter(e.target.value)}
                      className="py-1.5 px-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-900"
                    >
                      <option value="all">All Faculties</option>
                      <option value="Faculty of Management">Management</option>
                      <option value="Faculty of Education">Education</option>
                      <option value="Faculty of Humanities & Social Sciences">Humanities</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Faculty Member</th>
                          <th className="py-3 px-4">Title / Role</th>
                          <th className="py-3 px-4">Department &amp; Faculty</th>
                          <th className="py-3 px-4">Qualification &amp; Bio</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {professors
                          .filter((p) => {
                            const matchesFaculty =
                              profFacultyFilter === "all" || p.faculty === profFacultyFilter;
                            const matchesSearch =
                              !profSearchQuery ||
                              p.name.toLowerCase().includes(profSearchQuery.toLowerCase()) ||
                              p.title.toLowerCase().includes(profSearchQuery.toLowerCase()) ||
                              p.department.toLowerCase().includes(profSearchQuery.toLowerCase());
                            return matchesFaculty && matchesSearch;
                          })
                          .map((p) => (
                            <tr
                              key={p.id}
                              className={`hover:bg-slate-50/80 transition-colors ${
                                editingProfId === p.id ? "bg-amber-50/30" : ""
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      p.imageUrl ||
                                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
                                    }
                                    alt={p.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-slate-900 block leading-tight">
                                      {p.name}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-mono font-bold">
                                      Active Faculty
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4 font-semibold text-purple-950">
                                {p.title}
                              </td>

                              <td className="py-3 px-4">
                                <span className="font-medium text-slate-800 block">
                                  {p.department}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {p.faculty}
                                </span>
                              </td>

                              <td className="py-3 px-4 max-w-xs">
                                <span className="font-mono text-[11px] text-slate-700 block font-semibold">
                                  {p.qualification}
                                </span>
                                {p.bio ? (
                                  <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                                    &ldquo;{p.bio}&rdquo;
                                  </p>
                                ) : (
                                  p.researchInterests && (
                                    <span className="text-[10px] text-slate-400 line-clamp-1">
                                      Res: {p.researchInterests}
                                    </span>
                                  )
                                )}
                              </td>

                              <td className="py-3 px-4 text-slate-500">
                                <span className="block font-mono text-[10px] text-slate-600">
                                  {p.email}
                                </span>
                                {p.phone && (
                                  <span className="block font-mono text-[10px] text-slate-400">
                                    {p.phone}
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => startEditProf(p)}
                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg transition cursor-pointer"
                                    title="Edit Professor Record"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => requestDeleteProf(p)}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition cursor-pointer"
                                    title="Delete Professor Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {professors.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No professors or faculty members found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CAMPUS PORTAL SHORTCUTS MANAGER */}
          {activeTab === "portal" && (
            <CampusPortalManager
              state={state}
              onShowToast={showToast}
              onRequestConfirmDelete={(options) =>
                setConfirmModal({
                  isOpen: true,
                  confirmStyle: "danger",
                  ...options,
                })
              }
            />
          )}

          {/* TAB: UPCOMING EVENTS MANAGER */}
          {activeTab === "upcoming-events" && (
            <UpcomingEventsManager
              state={state}
              onShowToast={showToast}
              onRequestConfirmDelete={(options) =>
                setConfirmModal({
                  isOpen: true,
                  confirmStyle: "danger",
                  ...options,
                })
              }
            />
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
            <FaqManager
              faqs={state?.faqs}
              onShowToast={showToast}
              onRequestConfirmDelete={(options) =>
                setConfirmModal({
                  isOpen: true,
                  confirmStyle: "danger",
                  ...options,
                })
              }
            />
          )}

          {/* TAB 12: COMPLAINT TRACKER SETTINGS */}
          {activeTab === "tracking" && (
            <TrackingSettingsManager settings={state?.trackingSettings} onShowToast={showToast} />
          )}

          {/* TAB 13: ADMIN PROFILE & AUTHENTICATION */}
          {activeTab === "admins" && (
            <AccountInfoManager
              currentUser={user}
              onShowToast={showToast}
            />
          )}

        </div>
      </div>

      {/* GLOBAL REUSABLE CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-slate-900 leading-snug">
                      {confirmModal.title || "Confirm Deletion"}
                    </h4>
                    <span className="text-[11px] font-mono text-red-600 font-semibold uppercase tracking-wider">
                      Permanent Action
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed font-sans">
                {confirmModal.message ||
                  "Are you sure you want to permanently delete this item? This action cannot be undone."}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const action = confirmModal.onConfirm;
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                    if (action) {
                      try {
                        await action();
                      } catch (err: any) {
                        alert(err?.message || "Failed to complete deletion");
                      }
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmModal.confirmLabel || "Delete Permanently"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
