import React, { useState } from "react";
import { ref, update } from "firebase/database";
import { auth, rtdb } from "../lib/firebase";
import { GeneralSettings } from "../types";
import { FileText, Lock, CheckCircle, Edit3, Save, ExternalLink } from "lucide-react";

interface TermsPageProps {
  settings: GeneralSettings;
  onGoToCMS: () => void;
}

export default function TermsPage({ settings, onGoToCMS }: TermsPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [termsContent, setTermsContent] = useState(
    settings?.termsEn ||
      "By accessing and using this official Free Student Union - DMC portal at https://fsudmc.com, you agree to comply with campus regulations, respect academic integrity, and use student resources responsibly. Unauthorized disruption, malicious submissions, or violation of campus ethics is strictly prohibited."
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentUser = auth.currentUser;

  const handleSaveInline = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const settingsRef = ref(rtdb, "generalSettings");
      await update(settingsRef, {
        termsEn: termsContent,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to update terms inline:", err);
      alert("Failed to save. Please log into the CMS panel first.");
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
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Terms of Service
          </div>
          <h1 className="text-3xl font-serif font-black tracking-tight text-white">
            Terms and Conditions
          </h1>
          <p className="text-blue-100/90 text-xs md:text-sm">
            Official charter and acceptable usage rules for Free Student Union - DMC (Darchula Multiple Campus, base domain:{" "}
            <span className="font-mono text-amber-300">https://fsudmc.com</span>).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {currentUser ? (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "Cancel Editing" : "Quick Edit Terms"}</span>
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
          <span>Terms and Conditions content saved successfully!</span>
        </div>
      )}

      {/* Main Terms Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8 text-slate-700 text-sm leading-relaxed">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Edit Terms & Conditions Charter
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Live synced with Firebase database</span>
            </div>
            <textarea
              rows={8}
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
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
            "{settings?.termsEn || termsContent}"
          </div>
        )}

        <section className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            1. Acceptance of Terms
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            By visiting <a href="https://fsudmc.com" className="font-semibold text-blue-900 hover:underline">https://fsudmc.com</a>, you agree to comply with all applicable policies of Darchula Multiple Campus, Farwestern University guidelines, and these terms. If you do not accept these terms, please discontinue using the portal.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            2. Permitted Use of Syllabus & Academic Materials
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All course outlines, exam question papers, and downloadable syllabus notes available through this portal are intended solely for educational and non-commercial student study. Commercial reproduction, unauthorized modification, or paid resale of academic materials is strictly forbidden.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            3. Conduct on Communication & Feedback Desks
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            When submitting inquiries, messages, helpdesk tickets, or student blogs:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Users must provide truthful and accurate academic records.</li>
            <li>Defamatory, obscene, abusive, or politically partisan harassment is strictly prohibited.</li>
            <li>Submissions containing malicious scripts or automated spam will lead to IP blocking and disciplinary reporting.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            4. Affiliation to Farwestern University
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Darchula Multiple Campus is an affiliated constituent institution of <a href="https://fwu.edu.np" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-900 hover:underline">Farwestern University (FWU)</a>. All official academic curricula, degree conferrals, and examination rules are governed by Farwestern University Senate and Controller of Examinations.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            5. Modifications to Portal Terms
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Free Student Union - DMC Executive Committee reserves the right to amend these terms at any time. Active updates will be immediately reflected on this page and published through the campus notice board.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h3 className="font-serif font-black text-slate-900 text-lg">
            6. Contact the Secretariat
          </h3>
          <div className="p-4 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700">
            <p><strong>Free Student Union - DMC</strong></p>
            <p>Darchula Multiple Campus, Khalanga, Darchula</p>
            <p>Email: <a href="mailto:info@fsudmc.com" className="font-bold text-blue-900 hover:underline">info@fsudmc.com</a></p>
            <p>Official Website: <span className="font-mono font-semibold">https://fsudmc.com</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
