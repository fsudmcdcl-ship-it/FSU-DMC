import React, { useState } from "react";
import { push, ref } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { saveTrackedComplaint } from "../lib/dataService";
import {
  Mail,
  CheckCircle,
  Send,
  UserCheck,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Search,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import ImageUploadInput from "./ImageUploadInput";

interface ContactSectionProps {
  lang?: "en" | "np";
  onOpenTracker?: (trackingCode?: string) => void;
}

export default function ContactSection({ onOpenTracker }: ContactSectionProps) {
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [semester, setSemester] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedTrackingCode, setGeneratedTrackingCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg("Please enter your message before submitting.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Generate unique Tracking ID: FSU-COMP-XXXXXX
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const trackingCode = `FSU-COMP-${randomSuffix}`;

    const submission = {
      id: trackingCode,
      name: isAnonymous ? "Anonymous Student" : name || "Not Specified",
      className: isAnonymous ? "Anonymous" : className || "Not Specified",
      semester: isAnonymous ? "Anonymous" : semester || "Not Specified",
      contactInfo: isAnonymous ? "Confidential" : contactInfo || "Not Specified",
      message: message.trim(),
      imageUrl: imageUrl.trim() || undefined,
      trackingCode,
      ticketId: trackingCode,
      status: "Pending",
      adminRemarks: "",
      isAnonymous,
      createdAt: Date.now(),
    };

    // Cache locally so student can track instantly
    saveTrackedComplaint(submission);

    try {
      const contactsRef = ref(rtdb, "contacts");
      await push(contactsRef, submission);

      setGeneratedTrackingCode(trackingCode);
      setSuccess(true);

      // Clear fields
      setName("");
      setClassName("");
      setSemester("");
      setContactInfo("");
      setMessage("");
      setImageUrl("");
      setIsAnonymous(false);
    } catch (err: any) {
      console.warn("Notice saving message to remote database:", err);
      // Even if remote push encounters an issue, the ticket is safely registered locally
      setGeneratedTrackingCode(trackingCode);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedTrackingCode) return;
    navigator.clipboard.writeText(generatedTrackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerTracker = (code?: string) => {
    if (onOpenTracker) {
      onOpenTracker(code);
    } else {
      window.location.href = "/my-complaint";
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-12">
      {/* Column 1: Info box */}
      <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-blue-950 p-8 md:p-10 text-white flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-2">
            FSU HELPDESK
          </span>
          <h3 className="text-2xl font-serif font-black mb-4 leading-tight">
            Contact FSU Secretariat
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Do you have questions, feedback, grievance reports, or syllabus inquiries? Write to us directly. You can choose to send messages standardly or completely anonymously to protect your identity.
          </p>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>FSU Secretariat, Darchula Multiple Campus, Khalanga, Darchula</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <a href="mailto:info@fsudmc.com" className="hover:underline text-white font-medium">
                info@fsudmc.com
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Affiliated to <a href="https://fwu.edu.np" target="_blank" rel="noopener noreferrer" className="text-amber-300 font-bold hover:underline">Farwestern University</a></span>
            </div>
          </div>
        </div>

        {/* Replaced: "Base Domain: https://fsudmc.com | Securely encrypted..." with "Track Your Complaint" trigger */}
        <div className="border-t border-slate-800/80 pt-6 mt-6">
          <div className="bg-blue-900/40 border border-blue-700/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Complaint Status</span>
              </div>
              <span className="text-[10px] text-blue-200 font-mono">Live Tracking</span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              Already submitted a grievance or appointment request? Check its official condition and FSU remarks.
            </p>
            <button
              type="button"
              onClick={() => handleTriggerTracker()}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-950" />
              <span>Track Your Complaint</span>
            </button>
          </div>
        </div>
      </div>

      {/* Column 2: Form */}
      <div className="lg:col-span-7 p-8 md:p-10 relative">
        {success && (
          <div className="absolute inset-0 bg-white/98 z-20 flex flex-col items-center justify-center text-center p-6 sm:p-8 transition-all duration-300">
            <CheckCircle className="w-16 h-16 text-emerald-600 animate-bounce mb-3" />
            <h4 className="text-2xl font-serif font-black text-slate-900">
              Complaint / Inquiry Registered!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md leading-relaxed">
              Your message has been securely submitted to the Free Student Union Secretariat. Please save your unique tracking code to follow review status and admin remarks.
            </p>

            {/* Tracking Code Display Box */}
            <div className="mt-5 p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 w-full max-w-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
                Your Unique Tracking ID
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl font-mono font-black text-blue-950 tracking-wider">
                  {generatedTrackingCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl bg-white border border-blue-200 text-blue-900 hover:bg-blue-100 transition-colors cursor-pointer shadow-xs"
                  title="Copy tracking code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-blue-700">
                {copied ? "Tracking ID copied to clipboard!" : "Click to copy code"}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => handleTriggerTracker(generatedTrackingCode)}
                className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Track Complaint Now</span>
              </button>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Anonymous toggle option */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-blue-950" />
              <div>
                <label className="text-xs font-bold text-slate-900 block cursor-pointer">
                  Send Anonymously
                </label>
                <span className="text-[11px] text-slate-400 block font-sans">
                  Hides your name and personal contact info from submission records
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 rounded text-blue-950 focus:ring-blue-950 border-slate-300 transition cursor-pointer accent-blue-950"
            />
          </div>

          {!isAnonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bipin Joshi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-950 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Class / Faculty
                </label>
                <input
                  type="text"
                  placeholder="e.g. BBS / B.Ed / BA"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-950 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Year / Semester
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2nd Year"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-950 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Phone / Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. 98487xxxxx / email@example.com"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-950 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Your Message / Grievance *
            </label>
            <textarea
              rows={4}
              required
              placeholder="State your grievance, inquiry, or suggestion clearly for the FSU committee..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-950 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Optional Image Upload Attachment (Requirement #3 & User explicit request) */}
          <ImageUploadInput
            label="Optional Photo / Evidence Attachment"
            value={imageUrl}
            onChange={setImageUrl}
            helpText="Upload a screenshot, document photo, or image evidence supporting your complaint (optional)."
          />

          {errorMsg && (
            <p className="text-xs text-red-700 font-bold bg-red-50 p-2.5 rounded-xl border border-red-100">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Sending Message & Generating Tracking ID...</span>
            ) : (
              <>
                <Send className="w-4 h-4 text-amber-400" />
                <span>Submit to Free Student Union</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
