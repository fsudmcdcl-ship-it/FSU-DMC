import React, { useState, useEffect } from "react";
import { ref, update, set, remove, push, onValue } from "firebase/database";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { rtdb, auth } from "../lib/firebase";
import { DatabaseState, GeneralSettings, SlideItem, NewsItem, TeamMember, DownloadItem, BlogItem, ImportantNotice } from "../types";
import {
  Lock, ShieldAlert, Edit, Trash2, Plus, Save, Settings, Sliders, FileText, Users, Download, PenTool, AlertOctagon, LogOut, CheckCircle, Upload, Inbox
} from "lucide-react";

interface CMSPanelProps {
  state: DatabaseState;
  lang: "en" | "np";
  onGoHome: () => void;
  onGoMessages: () => void;
}

const APPROVED_CMS_USERS = [
  "fsudmcdcl@gmail.com", // Main user email
  "amitjoc@gmail.com",
  "fsudmc.edu.np@gmail.com"
];

type CMSTab = "general" | "slides" | "news" | "team" | "downloads" | "blogs" | "popup";

export default function CMSPanel({ state, lang, onGoHome, onGoMessages }: CMSPanelProps) {
  const [user, setUser] = useState(auth.currentUser);
  const [activeTab, setActiveTab] = useState<CMSTab>("general");
  const [authError, setAuthError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form states
  const [genSettingsForm, setGenSettingsForm] = useState<GeneralSettings>(state?.generalSettings || {} as GeneralSettings);
  const [importantNoticeForm, setImportantNoticeForm] = useState<ImportantNotice>(state?.importantNotice || {} as ImportantNotice);

  // Lists from state
  const slides = state?.slides ? Object.values(state.slides) : [];
  const news = state?.news ? Object.values(state.news) : [];
  const team = state?.team ? Object.values(state.team) : [];
  const downloads = state?.downloads ? Object.values(state.downloads) : [];
  const blogs = state?.blogs ? Object.values(state.blogs) : [];

  // Temporary item forms
  const [newSlide, setNewSlide] = useState({ titleEn: "", titleNp: "", imageUrl: "" });
  const [newNews, setNewNews] = useState({ headingEn: "", headingNp: "", bodyEn: "", bodyNp: "", imageUrl: "" });
  const [newMember, setNewMember] = useState({ nameEn: "", nameNp: "", roleEn: "", roleNp: "", imageUrl: "", order: 6 });
  const [newDownload, setNewDownload] = useState({ titleEn: "", titleNp: "", fileUrl: "", isDriveLink: true });
  const [newBlog, setNewBlog] = useState({ headingEn: "", headingNp: "", bodyEn: "", bodyNp: "", imageUrl: "", authorEn: "", authorNp: "" });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currUser) => {
      setUser(currUser);
      if (currUser) {
        if (currUser.email && APPROVED_CMS_USERS.includes(currUser.email.toLowerCase())) {
          setAuthError("");
        } else {
          setAuthError(`Access Denied: ${currUser.email} is not authorized to edit FSU content.`);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (state?.generalSettings) setGenSettingsForm(state.generalSettings);
    if (state?.importantNotice) setImportantNoticeForm(state.importantNotice);
  }, [state]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setAuthError("");
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setAuthError("Failed to authenticate with Google.");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const showToast = (txt: string) => {
    setMessage(txt);
    setTimeout(() => setMessage(""), 4000);
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

  // Saving General Settings
  const saveGeneralSettings = async () => {
    setSaving(true);
    try {
      await set(ref(rtdb, "generalSettings"), genSettingsForm);
      showToast("General settings updated successfully!");
    } catch (err) {
      alert("Failed to save settings: " + err);
    } finally {
      setSaving(false);
    }
  };

  // Saving Important Notice Popup settings
  const saveImportantNotice = async () => {
    setSaving(true);
    try {
      await set(ref(rtdb, "importantNotice"), importantNoticeForm);
      showToast("Important Notice popup updated successfully!");
    } catch (err) {
      alert("Failed to save notice: " + err);
    } finally {
      setSaving(false);
    }
  };

  // Adding items to lists
  const addSlide = async () => {
    if (!newSlide.imageUrl) return alert("Please specify/upload an image.");
    try {
      const slidesRef = ref(rtdb, "slides");
      const newItemRef = push(slidesRef);
      await set(newItemRef, { id: newItemRef.key, ...newSlide });
      setNewSlide({ titleEn: "", titleNp: "", imageUrl: "" });
      showToast("Slide added successfully!");
    } catch (err) { alert(err); }
  };

  const addNews = async () => {
    if (!newNews.headingEn || !newNews.bodyEn) return alert("Please specify news titles and body.");
    try {
      const newsRef = ref(rtdb, "news");
      const newItemRef = push(newsRef);
      await set(newItemRef, { id: newItemRef.key, ...newNews, createdAt: Date.now() });
      setNewNews({ headingEn: "", headingNp: "", bodyEn: "", bodyNp: "", imageUrl: "" });
      showToast("Announcement published successfully!");
    } catch (err) { alert(err); }
  };

  const addMember = async () => {
    if (!newMember.nameEn || !newMember.roleEn) return alert("Please specify name and role.");
    if (team.length >= 30) return alert("FSU Committee displays a maximum of 30 cards. Please delete an existing card first.");
    try {
      const teamRef = ref(rtdb, "team");
      const newItemRef = push(teamRef);
      await set(newItemRef, { id: newItemRef.key, ...newMember, order: Number(newMember.order) });
      setNewMember({ nameEn: "", nameNp: "", roleEn: "", roleNp: "", imageUrl: "", order: 6 });
      showToast("FSU Team member card created!");
    } catch (err) { alert(err); }
  };

  const addDownload = async () => {
    if (!newDownload.titleEn || !newDownload.fileUrl) return alert("Please specify document title and link.");
    try {
      const dlRef = ref(rtdb, "downloads");
      const newItemRef = push(dlRef);
      await set(newItemRef, { id: newItemRef.key, ...newDownload });
      setNewDownload({ titleEn: "", titleNp: "", fileUrl: "", isDriveLink: true });
      showToast("Syllabus resource added!");
    } catch (err) { alert(err); }
  };

  const addBlog = async () => {
    if (!newBlog.headingEn || !newBlog.bodyEn) return alert("Please specify heading and content.");
    try {
      const blogRef = ref(rtdb, "blogs");
      const newItemRef = push(blogRef);
      await set(newItemRef, { id: newItemRef.key, ...newBlog, createdAt: Date.now() });
      setNewBlog({ headingEn: "", headingNp: "", bodyEn: "", bodyNp: "", imageUrl: "", authorEn: "", authorNp: "" });
      showToast("Student blog post published!");
    } catch (err) { alert(err); }
  };

  // Deleting items
  const deleteItem = async (node: string, id: string) => {
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      await remove(ref(rtdb, `${node}/${id}`));
      showToast("Item deleted from database.");
    } catch (err) { alert(err); }
  };

  // Login Screen Gate
  if (!user || authError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-100">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-xl border border-slate-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1">
            FSU CMS Control Center
          </h3>
          <p className="text-xs text-gray-400 font-mono tracking-wider uppercase mb-4">
            fsudmc.edu.np/fsudmclogin
          </p>
          <p className="text-sm text-gray-600 mb-8">
            Please log in with an authorized administrator Gmail account to modify the website contents, upload slides, manage name cards, edit syllabus files, or view messages.
          </p>

          {authError && (
            <div className="w-full p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2 text-left">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="w-full space-y-3">
            <button
              onClick={handleLogin}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Log In with Google Admin</span>
            </button>

            {user && (
              <button
                onClick={handleSignOut}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
              >
                Sign Out Current Account
              </button>
            )}

            <button
              onClick={onGoHome}
              className="w-full py-2 text-gray-500 hover:text-gray-800 text-xs font-semibold transition mt-2"
            >
              ← Back to Main Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast feedback notifications */}
      {message && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-800 text-white rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-yellow-300" />
          <span className="text-sm font-bold">{message}</span>
        </div>
      )}

      {/* Admin header */}
      <div className="bg-slate-950 p-6 rounded-3xl text-white mb-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-emerald-400 tracking-widest font-mono">
            ADMIN PORTAL DIRECTORY
          </span>
          <h2 className="text-2xl font-black">FSU Website Dynamic CMS</h2>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Administrator: <span className="text-emerald-300 font-bold">{user.email}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onGoMessages}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Inbox className="w-4 h-4" />
            <span>Student Inbox Portal</span>
          </button>
          <button
            onClick={onGoHome}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 rounded-xl text-xs font-bold transition"
          >
            Public Site
          </button>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation and Editors layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Tabs list */}
        <div className="lg:col-span-3 bg-white p-4 rounded-3xl shadow-md border border-gray-100 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-3 mb-2 block">
            MANAGE CATEGORIES
          </span>
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "general" ? "bg-emerald-800 text-white" : "hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>General Setup</span>
          </button>
          <button
            onClick={() => setActiveTab("slides")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "slides" ? "bg-emerald-800 text-white" : "hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Image Slider</span>
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "news" ? "bg-emerald-800 text-white" : "hover:bg-slate-50 text-slate-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>News & notices</span>
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "team" ? "bg-emerald-800 text-white" : "hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Meet FSU Team</span>
          </button>
          <button
            onClick={() => setActiveTab("downloads")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "downloads" ? "bg-emerald-800 text-white" : "hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Syllabus & notes</span>
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "blogs" ? "bg-emerald-800 text-white" : "hover:bg-slate-50 text-slate-700"
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Student Blogs</span>
          </button>
          <button
            onClick={() => setActiveTab("popup")}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
              activeTab === "popup" ? "bg-emerald-800 text-white" : "hover:bg-slate-50 text-slate-700"
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Important notice popup</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="lg:col-span-9 bg-white p-6 md:p-8 rounded-3xl shadow-md border border-gray-100 min-h-[500px]">
          
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4 mb-4 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">General Titles & Details</h3>
                <button
                  onClick={saveGeneralSettings}
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Settings"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">FSU Title (English)</label>
                  <input
                    type="text"
                    value={genSettingsForm.titleEn || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, titleEn: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">FSU Title (Nepali)</label>
                  <input
                    type="text"
                    value={genSettingsForm.titleNp || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, titleNp: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">FSU Subtitle (English)</label>
                  <input
                    type="text"
                    value={genSettingsForm.subtitleEn || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, subtitleEn: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">FSU Subtitle (Nepali)</label>
                  <input
                    type="text"
                    value={genSettingsForm.subtitleNp || ""}
                    onChange={(e) => setGenSettingsForm({ ...genSettingsForm, subtitleNp: e.target.value })}
                    className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Logo upload */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={genSettingsForm.logoUrl || "placeholder"}
                  alt="Logo"
                  className="w-16 h-16 rounded-full object-cover border shadow"
                />
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Upload Favicon/Logo (Base64 conversion)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, (b64) => setGenSettingsForm({ ...genSettingsForm, logoUrl: b64 }))}
                    className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* About FSU Text Editors */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="font-bold text-gray-800 text-sm">About FSU Editorial Section</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">FSU About Description (English)</label>
                    <textarea
                      rows={4}
                      value={genSettingsForm.aboutFsuEn || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, aboutFsuEn: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">FSU About Description (Nepali)</label>
                    <textarea
                      rows={4}
                      value={genSettingsForm.aboutFsuNp || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, aboutFsuNp: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-12 rounded bg-gray-200 overflow-hidden shrink-0">
                    <img src={genSettingsForm.aboutFsuImg} alt="FSU Img" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Upload FSU Editorial Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (b64) => setGenSettingsForm({ ...genSettingsForm, aboutFsuImg: b64 }))}
                      className="text-xs text-gray-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* About Campus Text Editors */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="font-bold text-gray-800 text-sm">About Campus Description Section</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Campus Description (English)</label>
                    <textarea
                      rows={4}
                      value={genSettingsForm.aboutCampusEn || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, aboutCampusEn: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Campus Description (Nepali)</label>
                    <textarea
                      rows={4}
                      value={genSettingsForm.aboutCampusNp || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, aboutCampusNp: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-12 rounded bg-gray-200 overflow-hidden shrink-0">
                    <img src={genSettingsForm.aboutCampusImg} alt="Campus Img" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Upload Campus Institution Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (b64) => setGenSettingsForm({ ...genSettingsForm, aboutCampusImg: b64 }))}
                      className="text-xs text-gray-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Message from FSU President */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="font-bold text-gray-800 text-sm">Message From FSU President</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">President Name (English)</label>
                    <input
                      type="text"
                      value={genSettingsForm.presidentNameEn || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, presidentNameEn: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">President Name (Nepali)</label>
                    <input
                      type="text"
                      value={genSettingsForm.presidentNameNp || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, presidentNameNp: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">President Message (English)</label>
                    <textarea
                      rows={4}
                      value={genSettingsForm.presidentMessageEn || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, presidentMessageEn: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">President Message (Nepali)</label>
                    <textarea
                      rows={4}
                      value={genSettingsForm.presidentMessageNp || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, presidentMessageNp: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <img src={genSettingsForm.presidentPhoto} alt="President" className="w-12 h-12 rounded-full object-cover border shadow" />
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">President Photo (Circle)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (b64) => setGenSettingsForm({ ...genSettingsForm, presidentPhoto: b64 }))}
                      className="text-xs text-gray-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Message from Campus Chief */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="font-bold text-gray-800 text-sm">Message From Campus Chief</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Campus Chief Name (English)</label>
                    <input
                      type="text"
                      value={genSettingsForm.chiefNameEn || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, chiefNameEn: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Campus Chief Name (Nepali)</label>
                    <input
                      type="text"
                      value={genSettingsForm.chiefNameNp || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, chiefNameNp: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Chief Message (English)</label>
                    <textarea
                      rows={4}
                      value={genSettingsForm.chiefMessageEn || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, chiefMessageEn: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Chief Message (Nepali)</label>
                    <textarea
                      rows={4}
                      value={genSettingsForm.chiefMessageNp || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, chiefMessageNp: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <img src={genSettingsForm.chiefPhoto} alt="Chief" className="w-12 h-12 rounded-full object-cover border shadow" />
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Campus Chief Photo (Circle)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (b64) => setGenSettingsForm({ ...genSettingsForm, chiefPhoto: b64 }))}
                      className="text-xs text-gray-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Social embeds */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="font-bold text-gray-800 text-sm">Social Embed URLs</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Campus Facebook Page Link</label>
                    <input
                      type="text"
                      value={genSettingsForm.fbCampusPage || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, fbCampusPage: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">FSU Facebook Page Link</label>
                    <input
                      type="text"
                      value={genSettingsForm.fbFsuPage || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, fbFsuPage: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Legal footer */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h4 className="font-bold text-gray-800 text-sm">Terms & Privacy Content</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Privacy Policy (English)</label>
                    <textarea
                      rows={3}
                      value={genSettingsForm.privacyPolicyEn || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, privacyPolicyEn: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Privacy Policy (Nepali)</label>
                    <textarea
                      rows={3}
                      value={genSettingsForm.privacyPolicyNp || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, privacyPolicyNp: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Terms & Conditions (English)</label>
                    <textarea
                      rows={3}
                      value={genSettingsForm.termsEn || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, termsEn: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Terms & Conditions (Nepali)</label>
                    <textarea
                      rows={3}
                      value={genSettingsForm.termsNp || ""}
                      onChange={(e) => setGenSettingsForm({ ...genSettingsForm, termsNp: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 flex justify-end">
                <button
                  onClick={saveGeneralSettings}
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-1 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Changes..." : "Save All General Settings"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SLIDER ITEMS */}
          {activeTab === "slides" && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-gray-100 pb-3">
                Manage Home Photo Slider
              </h3>

              {/* Add form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Upload New Slide Photo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Caption Title (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Campus Football Ground Tournament"
                      value={newSlide.titleEn}
                      onChange={(e) => setNewSlide({ ...newSlide, titleEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Caption Title (Nepali)</label>
                    <input
                      type="text"
                      placeholder="e.g. खेलकुद मैदान"
                      value={newSlide.titleNp}
                      onChange={(e) => setNewSlide({ ...newSlide, titleNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <div className="w-24 h-16 bg-gray-100 border rounded flex items-center justify-center shrink-0">
                    {newSlide.imageUrl ? (
                      <img src={newSlide.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (b64) => setNewSlide({ ...newSlide, imageUrl: b64 }))}
                      className="text-xs text-gray-500 cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={addSlide}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Slide</span>
                  </button>
                </div>
              </div>

              {/* Slides lists */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Active Slides List</span>
                {slides.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No slides uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {slides.map((slide) => (
                      <div key={slide.id} className="p-3 border border-gray-100 rounded-2xl flex gap-3 items-center justify-between">
                        <img src={slide.imageUrl} alt="slide" className="w-20 h-14 object-cover rounded-lg shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 truncate">{slide.titleEn}</p>
                          <p className="text-xs text-gray-500 truncate">{slide.titleNp}</p>
                        </div>
                        <button
                          onClick={() => deleteItem("slides", slide.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RECENT NEWS & NOTICES */}
          {activeTab === "news" && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-gray-100 pb-3">
                Publish News and Notices
              </h3>

              {/* Add News */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Write Announcement Notice</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Heading Title (English)</label>
                    <input
                      type="text"
                      value={newNews.headingEn}
                      onChange={(e) => setNewNews({ ...newNews, headingEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Heading Title (Nepali)</label>
                    <input
                      type="text"
                      value={newNews.headingNp}
                      onChange={(e) => setNewNews({ ...newNews, headingNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Body Context (English)</label>
                    <textarea
                      rows={3}
                      value={newNews.bodyEn}
                      onChange={(e) => setNewNews({ ...newNews, bodyEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Body Context (Nepali)</label>
                    <textarea
                      rows={3}
                      value={newNews.bodyNp}
                      onChange={(e) => setNewNews({ ...newNews, bodyNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <div className="w-16 h-12 bg-gray-100 border rounded flex items-center justify-center shrink-0">
                    {newNews.imageUrl ? (
                      <img src={newNews.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 block mb-1 font-bold uppercase">Optional Attachment Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (b64) => setNewNews({ ...newNews, imageUrl: b64 }))}
                      className="text-xs text-gray-500 cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={addNews}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Announcement</span>
                  </button>
                </div>
              </div>

              {/* News list */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Published Notices</span>
                <div className="space-y-3">
                  {news.map((item) => (
                    <div key={item.id} className="p-4 border border-gray-100 rounded-2xl flex items-start gap-4 justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 font-mono">{new Date(item.createdAt).toLocaleString()}</span>
                        <h5 className="font-extrabold text-sm text-gray-900 mt-0.5">{item.headingEn}</h5>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-1">{item.bodyEn}</p>
                      </div>
                      <button
                        onClick={() => deleteItem("news", item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEET FSU TEAM */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-gray-100 pb-3">
                FSU Committee Name Cards (Max 30)
              </h3>

              {/* Add form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Create Team Member Card</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Member Name (English)</label>
                    <input
                      type="text"
                      value={newMember.nameEn}
                      onChange={(e) => setNewMember({ ...newMember, nameEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Member Name (Nepali)</label>
                    <input
                      type="text"
                      value={newMember.nameNp}
                      onChange={(e) => setNewMember({ ...newMember, nameNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Role (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Joint Secretary"
                      value={newMember.roleEn}
                      onChange={(e) => setNewMember({ ...newMember, roleEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Role (Nepali)</label>
                    <input
                      type="text"
                      placeholder="e.g. सह-सचिव"
                      value={newMember.roleNp}
                      onChange={(e) => setNewMember({ ...newMember, roleNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Priority Order (1=President, 2=VP, etc.)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={newMember.order}
                      onChange={(e) => setNewMember({ ...newMember, order: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <div className="w-16 h-16 bg-gray-100 border rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                    {newMember.imageUrl ? (
                      <img src={newMember.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 block mb-1 font-bold uppercase">Circle Profile Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (b64) => setNewMember({ ...newMember, imageUrl: b64 }))}
                      className="text-xs text-gray-500 cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={addMember}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Card</span>
                  </button>
                </div>
              </div>

              {/* Members grid list */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Active FSU Members ({team.length}/30)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {team.map((member) => (
                    <div key={member.id} className="p-3 border border-gray-100 rounded-2xl flex items-center justify-between gap-3">
                      <img src={member.imageUrl} alt={member.nameEn} className="w-12 h-12 rounded-full object-cover border" />
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-gray-900 truncate">{member.nameEn} ({member.order})</p>
                        <p className="text-xs text-gray-500 truncate">{member.roleEn}</p>
                      </div>
                      <button
                        onClick={() => deleteItem("team", member.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SYLLABUS & DOWNLOADS */}
          {activeTab === "downloads" && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-gray-100 pb-3">
                Syllabus & notes files
              </h3>

              {/* Add form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Add New File Resource</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Document Title (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. BBS 1st Year Syllabus"
                      value={newDownload.titleEn}
                      onChange={(e) => setNewDownload({ ...newDownload, titleEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Document Title (Nepali)</label>
                    <input
                      type="text"
                      placeholder="e.g. बिबिएस प्रथम वर्ष"
                      value={newDownload.titleNp}
                      onChange={(e) => setNewDownload({ ...newDownload, titleNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Google Drive URL or PDF base64 Link</label>
                    <input
                      type="text"
                      placeholder="e.g. https://drive.google.com/..."
                      value={newDownload.fileUrl}
                      onChange={(e) => setNewDownload({ ...newDownload, fileUrl: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDriveLink"
                      checked={newDownload.isDriveLink}
                      onChange={(e) => setNewDownload({ ...newDownload, isDriveLink: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded"
                    />
                    <label htmlFor="isDriveLink" className="text-xs font-bold text-gray-600">
                      Is this a Google Drive link?
                    </label>
                  </div>
                  <button
                    onClick={addDownload}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add File</span>
                  </button>
                </div>
              </div>

              {/* Downloads list */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Active Downloads</span>
                <div className="space-y-2">
                  {downloads.map((item) => (
                    <div key={item.id} className="p-3 border border-gray-100 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-gray-900 truncate">{item.titleEn}</p>
                        <p className="text-[10px] text-gray-400 truncate">{item.fileUrl}</p>
                      </div>
                      <button
                        onClick={() => deleteItem("downloads", item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: STUDENT BLOGS */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 border-b border-gray-100 pb-3">
                Student Blog & Articles
              </h3>

              {/* Add form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Write Blog Post</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Article Title (English)</label>
                    <input
                      type="text"
                      value={newBlog.headingEn}
                      onChange={(e) => setNewBlog({ ...newBlog, headingEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Article Title (Nepali)</label>
                    <input
                      type="text"
                      value={newBlog.headingNp}
                      onChange={(e) => setNewBlog({ ...newBlog, headingNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Author Name (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. Amit Joshi, BBS 3rd"
                      value={newBlog.authorEn}
                      onChange={(e) => setNewBlog({ ...newBlog, authorEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Author Name (Nepali)</label>
                    <input
                      type="text"
                      placeholder="e.g. अमित जोशी, बिबिएस तेस्रो"
                      value={newBlog.authorNp}
                      onChange={(e) => setNewBlog({ ...newBlog, authorNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Story (English)</label>
                    <textarea
                      rows={4}
                      value={newBlog.bodyEn}
                      onChange={(e) => setNewBlog({ ...newBlog, bodyEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Full Story (Nepali)</label>
                    <textarea
                      rows={4}
                      value={newBlog.bodyNp}
                      onChange={(e) => setNewBlog({ ...newBlog, bodyNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <div className="w-16 h-12 bg-gray-100 border rounded flex items-center justify-center shrink-0">
                    {newBlog.imageUrl ? (
                      <img src={newBlog.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 block mb-1 font-bold uppercase">Blog Hero Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (b64) => setNewBlog({ ...newBlog, imageUrl: b64 }))}
                      className="text-xs text-gray-500 cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={addBlog}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Blog</span>
                  </button>
                </div>
              </div>

              {/* Blogs list */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Active Blogs</span>
                <div className="space-y-3">
                  {blogs.map((item) => (
                    <div key={item.id} className="p-3 border border-gray-100 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-gray-900 truncate">{item.headingEn}</p>
                        <p className="text-xs text-gray-400 truncate">By: {item.authorEn}</p>
                      </div>
                      <button
                        onClick={() => deleteItem("blogs", item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: IMPORTANT NOTICE POPUP */}
          {activeTab === "popup" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4 mb-4 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">Configure Important Popup Announcement</h3>
                <button
                  onClick={saveImportantNotice}
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Announcement"}</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Active Toggle */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-gray-900 block">Enable Notice Popup on load</label>
                    <span className="text-[10px] text-gray-400 block font-sans">
                      Toggle whether visitors immediately see this overlay when loading the homepage
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={importantNoticeForm.active || false}
                    onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, active: e.target.checked })}
                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Display Type */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Notice Display Format</label>
                  <select
                    value={importantNoticeForm.type || "both"}
                    onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, type: e.target.value as any })}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="both">Both (A4 Image + Context Description)</option>
                    <option value="image">A4 Image Only</option>
                    <option value="text">Text Only</option>
                  </select>
                </div>

                {/* Banner Customization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Banner / Top Tagline (English)</label>
                    <input
                      type="text"
                      placeholder="e.g. ⚠️ CRITICAL CAMPUS ANNOUNCEMENT"
                      value={importantNoticeForm.bannerTextEn || ""}
                      onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, bannerTextEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Banner / Top Tagline (Nepali)</label>
                    <input
                      type="text"
                      placeholder="e.g. ⚠️ स्वतन्त्र विद्यार्थी युनियन विशेष सूचना"
                      value={importantNoticeForm.bannerTextNp || ""}
                      onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, bannerTextNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Notice Header (English)</label>
                    <input
                      type="text"
                      value={importantNoticeForm.titleEn || ""}
                      onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, titleEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Notice Header (Nepali)</label>
                    <input
                      type="text"
                      value={importantNoticeForm.titleNp || ""}
                      onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, titleNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Bodies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Notice Context Body (English)</label>
                    <textarea
                      rows={4}
                      value={importantNoticeForm.bodyEn || ""}
                      onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, bodyEn: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Notice Context Body (Nepali)</label>
                    <textarea
                      rows={4}
                      value={importantNoticeForm.bodyNp || ""}
                      onChange={(e) => setImportantNoticeForm({ ...importantNoticeForm, bodyNp: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* A4 Image attachment */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-20 bg-gray-200 overflow-hidden shrink-0 border rounded">
                    {importantNoticeForm.imageUrl && (
                      <img src={importantNoticeForm.imageUrl} alt="notice" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Upload Notice Image (A4 Format)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (b64) => setImportantNoticeForm({ ...importantNoticeForm, imageUrl: b64 }))}
                      className="text-xs text-gray-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 flex justify-end">
                <button
                  onClick={saveImportantNotice}
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-1 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Notice..." : "Save Announcement Setting"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
