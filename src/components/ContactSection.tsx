import React, { useState } from "react";
import { push, ref } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { Mail, CheckCircle, AlertTriangle, Send, UserCheck, ShieldCheck } from "lucide-react";

interface ContactSectionProps {
  lang: "en" | "np";
}

export default function ContactSection({ lang }: ContactSectionProps) {
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
      setErrorMsg(lang === "en" ? "Please enter a message." : "कृपया सन्देश प्रविष्ट गर्नुहोस्।");
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
      setErrorMsg(
        lang === "en"
          ? "Failed to send message. Please check connection and try again."
          : "सन्देश पठाउन असफल भयो। कृपया पुनः प्रयास गर्नुहोस्।"
      );
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
            {lang === "en" ? "FSU HELPDESK" : "स्ववियु सहायता कक्ष"}
          </span>
          <h3 className="text-2xl font-serif font-black mb-6 leading-tight">
            {lang === "en" ? "Contact FSU Secretariat" : "स्ववियु सचिवालयमा सम्पर्क गर्नुहोस्"}
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            {lang === "en"
              ? "Do you have questions, complaints, suggestions or syllabus requests? Write to us directly. You can choose to send messages standardly or complete anonymously to ensure absolute privacy."
              : "के तपाईंसँग क्याम्पस वा शैक्षिक सुधारका लागि रचनात्मक सुझाव, गुनासो वा प्रश्नहरू छन्? हामीलाई सन्देश पठाउनुहोस्। गोपनीयता कायम राख्नं तपाईंले आफ्नो नाम गोप्य (अनामित) राखेर पनि सन्देश पठाउन सक्नुहुन्छ।"}
          </p>
        </div>

        <div className="space-y-4 border-t border-slate-800/60 pt-6">
          <p className="text-xs text-slate-400 italic font-mono">
            Official Address:<br />
            FSU Office, Darchula Multiple Campus, Khalanga
          </p>
        </div>
      </div>

      {/* Column 2: Form */}
      <div className="lg:col-span-7 p-8 md:p-10 relative">
        {success && (
          <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
            <CheckCircle className="w-16 h-16 text-red-700 animate-bounce mb-4" />
            <h4 className="text-xl font-serif font-black text-slate-900">
              {lang === "en" ? "Message Sent Successfully!" : "सन्देश सफलतापूर्वक पठाइयो!"}
            </h4>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              {lang === "en"
                ? "Thank you for reaching out. The Free Student Union executive board has received your report securely."
                : "तपाईंको रचनात्मक सुझाव वा गुनासो प्राप्त भएको छ। स्ववियु सचिवालयले यसलाई गोप्य रूपमा सम्बोधन गर्नेछ।"}
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-6 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              {lang === "en" ? "Send Another Message" : "अर्को सन्देश पठाउनुहोस्"}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Anonymous toggle option */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5 text-red-700" />
              <div>
                <label className="text-sm font-bold text-slate-900 block">
                  {lang === "en" ? "Send Anonymously" : "गोपनीय (अनामित) रूपमा पठाउनुहोस्"}
                </label>
                <span className="text-[10px] text-slate-400 block font-sans">
                  {lang === "en" ? "Hides your name and contact info from records" : "तपाईंको पहिचान गोप्य राख्छ"}
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {lang === "en" ? "Full Name" : "पूरा नाम"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amit Joshi"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {lang === "en" ? "Contact Info (Phone/Email)" : "सम्पर्क नम्बर वा इमेल"}
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="e.g. +977-9848xxxxxx"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {lang === "en" ? "Class (e.g. BBS, B.Ed)" : "तह/संकाय (उदा. बिबिएस)"}
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="BBS 3rd Year"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  {lang === "en" ? "Semester/Year" : "सेमेस्टर/वर्ष"}
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="e.g. First Semester"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              {lang === "en" ? "Your Message/Complaint" : "तपाईंको सन्देश वा सुझाव"} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                lang === "en"
                  ? "Write details of your problem, complaints or request..."
                  : "आफ्नो समस्या, माग वा रचनात्मक सुझाव यहाँ प्रष्टसँग लेख्नुहोस्..."
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-700 focus:outline-none bg-slate-50/50 resize-none"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>{lang === "en" ? "Submitting securely..." : "पठाउँदै..."}</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{lang === "en" ? "Send Secure Message" : "सुरक्षित सन्देश पठाउनुहोस्"}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
