import React, { useState } from "react";
import { push, ref } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { Mail, CheckCircle, Send, UserCheck, ShieldCheck, ExternalLink, MapPin } from "lucide-react";

interface ContactSectionProps {
  lang?: "en" | "np";
}

export default function ContactSection() {
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [semester, setSemester] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg("Please enter your message before submitting.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const submission = {
      name: isAnonymous ? "Anonymous Student" : name || "Not Specified",
      className: isAnonymous ? "Anonymous" : className || "Not Specified",
      semester: isAnonymous ? "Anonymous" : semester || "Not Specified",
      contactInfo: isAnonymous ? "Confidential" : contactInfo || "Not Specified",
      message: message.trim(),
      isAnonymous,
      createdAt: Date.now(),
    };

    try {
      const contactsRef = ref(rtdb, "contacts");
      await push(contactsRef, submission);

      // Clear fields
      setName("");
      setClassName("");
      setSemester("");
      setContactInfo("");
      setMessage("");
      setIsAnonymous(false);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error("Error saving message to database:", err);
      setErrorMsg("Failed to send message. Please check your connection and try again.");
    } finally {
      setLoading(false);
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

        <div className="border-t border-slate-800/80 pt-6 mt-6">
          <p className="text-[11px] text-slate-400 font-mono">
            Base Domain: https://fsudmc.com<br />
            Securely encrypted and received by verified FSU administrators.
          </p>
        </div>
      </div>

      {/* Column 2: Form */}
      <div className="lg:col-span-7 p-8 md:p-10 relative">
        {success && (
          <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
            <CheckCircle className="w-16 h-16 text-red-700 animate-bounce mb-4" />
            <h4 className="text-xl font-serif font-black text-slate-900">
              Message Sent Successfully!
            </h4>
            <p className="text-xs text-slate-500 mt-2 max-w-sm">
              Thank you for reaching out. The Free Student Union executive board has received your message securely.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Anonymous toggle option */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-red-700" />
              <div>
                <label className="text-xs font-bold text-slate-900 block">
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
              className="w-5 h-5 rounded text-red-700 focus:ring-red-700 border-slate-300 transition cursor-pointer accent-red-700"
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
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-700 focus:outline-none bg-slate-50/50"
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
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-700 focus:outline-none bg-slate-50/50"
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
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-700 focus:outline-none bg-slate-50/50"
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
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-700 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Your Message / Feedback *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Type your message, suggestion, or question for the FSU committee..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-700 focus:outline-none bg-slate-50/50"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-700 font-bold bg-red-50 p-2.5 rounded-xl border border-red-100">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Sending Message...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit to Free Student Union</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
