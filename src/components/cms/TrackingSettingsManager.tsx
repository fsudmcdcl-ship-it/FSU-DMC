import React, { useState, useEffect } from "react";
import { ComplaintTrackingSettings } from "../../types";
import { DEFAULT_DB_STATE } from "../../lib/defaults";
import { saveNode } from "../../lib/dataService";
import {
  ShieldCheck,
  Save,
  Phone,
  Mail,
  FileText,
  Sparkles,
  HelpCircle,
  Eye,
} from "lucide-react";

interface TrackingSettingsManagerProps {
  settings?: ComplaintTrackingSettings;
  onShowToast: (msg: string) => void;
}

export default function TrackingSettingsManager({
  settings,
  onShowToast,
}: TrackingSettingsManagerProps) {
  const initial = settings || DEFAULT_DB_STATE.trackingSettings!;
  const [form, setForm] = useState<ComplaintTrackingSettings>(initial);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await saveNode("trackingSettings", form);
      onShowToast(result.message || "Complaint Tracker settings saved!");
    } catch (err: any) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/70 border border-blue-200/80 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Complaint Tracker Page & Modal Configuration</span>
          </div>
          <p className="text-xs text-slate-600">
            Customize the heading, subtitle, guidance instructions, and support hotline displayed on
            the <code>/my-complaint</code> page and tracking popup.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Main Page Heading
              </label>
              <input
                type="text"
                required
                value={form.headingEn}
                onChange={(e) => setForm({ ...form, headingEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Subtitle / Descriptive Notice
              </label>
              <textarea
                rows={2}
                value={form.subtitleEn}
                onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Input Instructions for Students
              </label>
              <textarea
                rows={2}
                value={form.instructionsEn}
                onChange={(e) => setForm({ ...form, instructionsEn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Support Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.supportPhone || ""}
                    onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                    placeholder="+977 9848712345"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Support Secretariat Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={form.supportEmail || ""}
                    onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                    placeholder="info@fsudmc.com"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="py-3 px-6 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{isSaving ? "Saving Live..." : "Publish Tracker Settings"}</span>
            </button>
          </form>
        </div>

        {/* Live Preview Box */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Live Preview on Student Device
          </span>

          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-5 rounded-2xl shadow-md space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-800/60 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              <ShieldCheck className="w-3 h-3" />
              FSU Grievance Tracker
            </div>
            <h4 className="text-base font-serif font-black text-white">{form.headingEn}</h4>
            <p className="text-blue-200/90 text-xs leading-relaxed">{form.subtitleEn}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-slate-600">
            <span className="font-bold text-slate-900 block">Student Guidance:</span>
            <p className="text-[11px] leading-snug">{form.instructionsEn}</p>
            <div className="pt-2 border-t border-slate-200 flex items-center gap-3 text-[11px]">
              {form.supportPhone && <span>📞 {form.supportPhone}</span>}
              {form.supportEmail && <span>✉️ {form.supportEmail}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
