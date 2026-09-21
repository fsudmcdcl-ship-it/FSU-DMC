import React, { useState } from "react";
import { ref, update } from "firebase/database";
import { auth, rtdb } from "../lib/firebase";
import { GeneralSettings } from "../types";
import { Shield, Lock, CheckCircle, Edit3, Save, ExternalLink } from "lucide-react";

interface PrivacyPolicyPageProps {
  settings: GeneralSettings;
  onGoToCMS: () => void;
}

export default function PrivacyPolicyPage({ settings, onGoToCMS }: PrivacyPolicyPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [policyContent, setPolicyContent] = useState(
    settings?.privacyPolicyEn ||
      "This Privacy Policy outlines how the Free Student Union - DMC at Darchula Multiple Campus collects, protects, and handles student information submitted through this website. We respect student confidentiality and ensure that data is safeguarded with encrypted storage and restricted administrative access."
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check if current session has an authenticated Firebase user
  const currentUser = auth.currentUser;

  const handleSaveInline = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const settingsRef = ref(rtdb, "generalSettings");
      await update(settingsRef, {
        privacyPolicyEn: policyContent,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to update privacy policy inline:", err);
      alert("Failed to save. You may need to log in to the CMS panel first.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-10 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Legal & Governance
          </div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-blue-100/90 text-xs md:text-sm">
            Official data protection guidelines for Free Student Union - DMC (Darchula Multiple Campus, base domain:{" "}
            <span className="font-mono text-amber-300">https://fsudmc.com</span>).
          </p>
        </div>

        {/* CMS Control action */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {currentUser ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Cancel Editing" : "Quick Edit Policy"}</span>
            </button>
          ) : (
            <button
              onClick={onGoToCMS}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Login / Edit in CMS</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Privacy Policy content updated successfully across the platform!</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8 text-slate-700 text-sm leading-relaxed">
        {/* If in edit mode */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Edit Privacy Policy Overview Text
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Live synced with Firebase database</span>
            </div>
            <textarea
              rows={8}
              value={policyContent}
              onChange={(e) => setPolicyContent(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-300 text-sm font-sans focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInline}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-950 hover:bg-blue-900 transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100/90 text-slate-800 italic whitespace-pre-line text-sm leading-relaxed">
            "{settings?.privacyPolicyEn || policyContent}"
          </div>
        )}

        {/* Structured Sections */}
        <section className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            1. Scope and Domain Applicability
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            This Privacy Policy applies to all digital services, inquiries, feedback desks, and student resources hosted under the domain <a href="https://fsudmc.com" className="font-semibold text-blue-900 hover:underline">https://fsudmc.com</a>, operated by the Free Student Union - DMC at Darchula Multiple Campus, an academic institution affiliated with <a href="https://fwu.edu.np" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-900 hover:underline">Farwestern University</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            2. Information We Collect
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We collect information strictly necessary to provide student representation, academic inquiries, and grievance redressal:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>Contact and Feedback Forms:</strong> Full Name, Roll Number, Faculty, Email, and Phone Number (unless submitted via the Anonymous Feedback option).</li>
            <li><strong>Helpdesk and Grievance Tickets:</strong> Academic concerns, exam roll numbers, and description of student issues.</li>
            <li><strong>Student Blogs:</strong> Author names, program year, and submitted articles for student publication.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            3. Purpose and Use of Data
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Collected data is strictly utilized for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Facilitating direct communication between students and the FSU Secretariat.</li>
            <li>Advocating student cases with Darchula Multiple Campus Administration and Farwestern University.</li>
            <li>Informing students of examination dates, scholarships, and academic notices.</li>
            <li>We do NOT sell, lease, or monetize any student contact details or data to third-party marketing entities.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            4. Data Security & Storage
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Data is stored in authenticated Firebase databases protected by cryptographic rules. Only authorized FSU administrative officers possessing verified Google authentication credentials can access incoming messages.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            5. Affiliation and External Academic Links
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our platform contains hyperlinks to external educational websites, notably <a href="https://fwu.edu.np" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-900 hover:underline">Farwestern University (https://fwu.edu.np)</a> and the University Grants Commission (UGC Nepal). We are not responsible for the privacy practices of external websites.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            6. Contact Data Controller
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            For questions or requests to modify or delete personal data submitted through this portal, please contact:
          </p>
          <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700">
            <p><strong>Free Student Union - DMC Secretariat</strong></p>
            <p>Darchula Multiple Campus, Khalanga, Darchula, Nepal</p>
            <p>Official Email: <a href="mailto:info@fsudmc.com" className="font-bold text-blue-900 hover:underline">info@fsudmc.com</a></p>
            <p>Portal Domain: <span className="font-mono font-semibold">https://fsudmc.com</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
