import React, { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { ContactSubmission, DatabaseState } from "../types";
import { DEFAULT_DB_STATE } from "../lib/defaults";
import { getTrackedComplaint } from "../lib/dataService";
import {
  Search,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  X,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Phone,
  Mail,
} from "lucide-react";

interface ComplaintTrackerProps {
  isOpen?: boolean;
  onClose?: () => void;
  isStandalonePage?: boolean;
  state?: DatabaseState;
  initialTrackingCode?: string;
  onNavigateHome?: () => void;
}

export default function ComplaintTracker({
  isOpen = true,
  onClose,
  isStandalonePage = false,
  state,
  initialTrackingCode = "",
  onNavigateHome,
}: ComplaintTrackerProps) {
  const [searchCode, setSearchCode] = useState(initialTrackingCode);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [foundComplaint, setFoundComplaint] = useState<ContactSubmission | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Settings from CMS
  const settings = state?.trackingSettings || DEFAULT_DB_STATE.trackingSettings!;

  useEffect(() => {
    if (initialTrackingCode) {
      setSearchCode(initialTrackingCode);
      handleTrack(initialTrackingCode);
    }
  }, [initialTrackingCode]);

  const handleTrack = async (codeToSearch?: string) => {
    const rawCode = (codeToSearch || searchCode).trim();
    if (!rawCode) {
      setErrorMsg("Please enter your Tracking Code (e.g., FSU-COMP-XXXXXX).");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setHasSearched(true);
    setFoundComplaint(null);

    const normalized = rawCode.toUpperCase().replace(/\s+/g, "");

    try {
      // First check local state if already hydrated
      let matched: ContactSubmission | null = null;
      if (state?.contacts) {
        for (const [key, item] of Object.entries(state.contacts)) {
          const itemCode = (item.trackingCode || item.ticketId || item.id || "").toUpperCase();
          if (itemCode === normalized || item.id === rawCode) {
            matched = { ...item, id: key };
            break;
          }
        }
      }

      // If not in state, check local tracked cache
      if (!matched) {
        matched = getTrackedComplaint(rawCode);
      }

      // If still not found, query Firebase RTDB contacts node
      if (!matched) {
        try {
          const contactsRef = ref(rtdb, "contacts");
          const snapshot = await get(contactsRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            for (const [key, val] of Object.entries<any>(data)) {
              const itemCode = (val.trackingCode || val.ticketId || val.id || "").toUpperCase();
              if (itemCode === normalized || key === rawCode || val.id === rawCode) {
                matched = { ...val, id: key };
                break;
              }
            }
          }
        } catch {
          // RTDB contacts read may be restricted to authenticated admins
        }
      }

      if (matched) {
        setFoundComplaint(matched);
      } else {
        setErrorMsg(
          `No complaint or inquiry found matching tracking code "${rawCode}". Please check your code or contact the FSU Secretariat.`
        );
      }
    } catch (err) {
      console.warn("Tracker query error:", err);
      setErrorMsg("Unable to retrieve complaint record. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine stage progression
  const getStageInfo = (status?: string) => {
    const s = (status || "Pending").toLowerCase();
    if (s.includes("resolve") || s.includes("closed") || s.includes("completed")) {
      return { step: 4, label: "Resolved & Closed", color: "emerald", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    }
    if (s.includes("progress") || s.includes("action") || s.includes("forward")) {
      return { step: 3, label: "In Progress / Committee Action", color: "purple", badge: "bg-purple-100 text-purple-800 border-purple-200" };
    }
    if (s.includes("review") || s.includes("verified")) {
      return { step: 2, label: "In Review by Secretariat", color: "blue", badge: "bg-blue-100 text-blue-800 border-blue-200" };
    }
    return { step: 1, label: "Pending Official Review", color: "amber", badge: "bg-amber-100 text-amber-800 border-amber-200" };
  };

  const content = (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-amber-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified FSU DMC Grievance & Secretariat Tracker
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
            {settings.headingEn || "FSU Student Complaint & Inquiry Tracker"}
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm leading-relaxed max-w-2xl">
            {settings.subtitleEn ||
              "Track the official status and administrative remarks of your submitted grievances and appointments in real-time."}
          </p>
        </div>
      </div>

      {/* Search Bar Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Enter Your Tracking Code *
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTrack();
          }}
          className="flex flex-col sm:flex-row items-stretch gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="e.g. FSU-COMP-7A9B2C"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono uppercase tracking-wider focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/70"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <span>Searching...</span>
            ) : (
              <>
                <Search className="w-4 h-4 text-amber-400" />
                <span>Track Complaint</span>
              </>
            )}
          </button>
        </form>
        <p className="text-[11px] text-slate-500">
          {settings.instructionsEn ||
            "Enter your unique 10-character Tracking Code (e.g., FSU-COMP-XXXXXX) assigned upon submission."}
        </p>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Found Complaint Details Card */}
      {foundComplaint && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden space-y-6 p-6 sm:p-8 animate-fade-in">
          {/* Card Top: Code and Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Official Tracking ID
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-mono font-black text-blue-950">
                  {foundComplaint.trackingCode || foundComplaint.ticketId || foundComplaint.id}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCode(
                      foundComplaint.trackingCode || foundComplaint.ticketId || foundComplaint.id
                    )
                  }
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-950 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Live Status Badge */}
            {(() => {
              const stage = getStageInfo(foundComplaint.status);
              return (
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border shadow-xs ${stage.badge}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span>Condition: {foundComplaint.status || stage.label}</span>
                </div>
              );
            })()}
          </div>

          {/* 4-Step Progress Indicator */}
          {(() => {
            const stage = getStageInfo(foundComplaint.status);
            const steps = [
              { num: 1, label: "Submitted" },
              { num: 2, label: "In Review" },
              { num: 3, label: "Action" },
              { num: 4, label: "Resolved" },
            ];
            return (
              <div className="space-y-2 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Resolution Progress Workflow
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {steps.map((st) => {
                    const isDone = stage.step >= st.num;
                    const isCurrent = stage.step === st.num;
                    return (
                      <div key={st.num} className="text-center space-y-1.5">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isDone ? "bg-blue-900" : "bg-slate-200"
                          } ${isCurrent ? "ring-2 ring-blue-900/30" : ""}`}
                        />
                        <span
                          className={`text-[10px] sm:text-xs font-bold block ${
                            isDone ? "text-blue-950" : "text-slate-400"
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Official Admin Remarks / Resolution Box (Requirement #3) */}
          <div className="rounded-2xl border-2 border-blue-900/20 bg-blue-50/50 p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-950">
                <MessageSquare className="w-4 h-4 text-blue-900" />
                <span>Official FSU Secretariat Remarks & Directives</span>
              </div>
              {foundComplaint.adminRemarkUpdatedAt && (
                <span className="text-[10px] text-slate-500 font-mono">
                  Updated: {new Date(foundComplaint.adminRemarkUpdatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            {foundComplaint.adminRemarks?.trim() ? (
              <div className="bg-white p-4 rounded-xl border border-blue-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                <p className="whitespace-pre-line">{foundComplaint.adminRemarks}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic bg-white/70 p-3.5 rounded-xl border border-blue-100">
                The FSU Secretariat is currently assessing your submission. Official remarks, scheduled
                hearing dates, or resolution directives will appear here as soon as verified by the
                executive board.
              </p>
            )}
          </div>

          {/* Submission Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Applicant Information
              </span>
              <p className="font-bold text-slate-900">
                {foundComplaint.isAnonymous
                  ? "Anonymous Student (Protected Identity)"
                  : foundComplaint.name || "Student / Visitor"}
              </p>
              {foundComplaint.className && (
                <p className="text-slate-600">
                  {foundComplaint.className}
                  {foundComplaint.semester ? ` - ${foundComplaint.semester}` : ""}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Submission Date & Category
              </span>
              <p className="font-bold text-slate-900">
                {foundComplaint.category || foundComplaint.tag || "General Inquiry / Complaint"}
              </p>
              <p className="text-slate-500 font-mono">
                {new Date(foundComplaint.createdAt || Date.now()).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Original Message / Grievance Details */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Grievance / Appointment Description
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {foundComplaint.message}
            </div>
          </div>

          {/* Optional Image Attachment (Requirement #3) */}
          {foundComplaint.imageUrl && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Submitted Proof / Attachment
              </span>
              <div className="inline-block relative rounded-2xl overflow-hidden border border-slate-200 group max-w-xs">
                <img
                  src={foundComplaint.imageUrl}
                  alt="Complaint proof"
                  className="w-full max-h-48 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setPreviewImage(foundComplaint.imageUrl!)}
                />
                <button
                  type="button"
                  onClick={() => setPreviewImage(foundComplaint.imageUrl!)}
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-semibold backdrop-blur-xs flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Full
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Support Info */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div>
          <span className="font-bold text-slate-900 block">Need Urgent Assistance?</span>
          <span>Contact the FSU Help Desk or visit Room 101 on campus.</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
          {settings.supportPhone && (
            <a
              href={`tel:${settings.supportPhone}`}
              className="flex items-center gap-1.5 text-blue-950 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              {settings.supportPhone}
            </a>
          )}
          {settings.supportEmail && (
            <a
              href={`mailto:${settings.supportEmail}`}
              className="flex items-center gap-1.5 text-blue-950 hover:underline"
            >
              <Mail className="w-3.5 h-3.5" />
              {settings.supportEmail}
            </a>
          )}
        </div>
      </div>

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

  // If used as standalone page (e.g., at /my-complaint or slug fsudmc.com/my-complaint)
  if (isStandalonePage) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-950 hover:text-blue-800 cursor-pointer"
          >
            ← Back to Homepage
          </button>
        )}
        {content}
      </div>
    );
  }

  // If used as popup/modal
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors shadow-sm cursor-pointer"
            title="Close tracker"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {content}
      </div>
    </div>
  );
}
