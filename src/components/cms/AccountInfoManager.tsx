import React, { useState } from "react";
import { AdminUser, resetPasswordAdmin, signOutAdmin } from "../../lib/authService";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  UserCheck,
  Server,
  Sparkles,
} from "lucide-react";

interface AccountInfoManagerProps {
  currentUser: AdminUser;
  onShowToast: (msg: string) => void;
}

export default function AccountInfoManager({
  currentUser,
  onShowToast,
}: AccountInfoManagerProps) {
  const [resetLoading, setResetLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSendPasswordReset = async () => {
    if (!currentUser.email) return;
    setResetLoading(true);
    setFeedback(null);
    try {
      await resetPasswordAdmin(currentUser.email);
      setFeedback({
        type: "success",
        text: `Password reset instructions sent to ${currentUser.email}. Check your inbox.`,
      });
      onShowToast("Password reset link emailed successfully.");
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Could not send password reset email.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Firebase Authentication Profile
          </div>
          <h3 className="text-xl font-serif font-black text-slate-900">
            Administrator Credentials &amp; Access Control
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Official FSU DMC administrative session managed securely via Google Firebase Authentication.
          </p>
        </div>

        <button
          onClick={() => signOutAdmin()}
          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Admin</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 border ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Active Session Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-white flex items-center justify-center shadow-md">
              <UserCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Active Administrator Account
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                {currentUser.email || "Authenticated User"}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Administrator Email:</span>
              <span className="font-mono font-bold text-slate-800">{currentUser.email}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Firebase UID:</span>
              <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {currentUser.uid}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Authentication Authority:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Google Firebase Auth
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500 font-medium">Global Access Level:</span>
              <span className="bg-blue-100 text-blue-900 font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase">
                Full CMS Administrator
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSendPasswordReset}
              disabled={resetLoading}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-slate-600" />
              <span>{resetLoading ? "Sending Link..." : "Send Password Reset Email"}</span>
            </button>
          </div>
        </div>

        {/* Access Provisioning & Security Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Owner-Only Admin Provisioning
              </h4>
              <p className="text-xs text-slate-500">
                No public registration on #campuslogin
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2 leading-relaxed">
            <p className="font-medium text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <strong>How to add or invite new administrators:</strong>
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
              <li>Open your <strong>Google Firebase Console</strong>.</li>
              <li>Select your project (<strong>fsu-bdbf6</strong>).</li>
              <li>Navigate to <strong>Authentication &rarr; Users</strong>.</li>
              <li>Click <strong>&quot;Add user&quot;</strong> and set their official email and password.</li>
              <li>They can now sign in at <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono">/campuslogin</code>.</li>
            </ol>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
            <span className="text-blue-900 font-medium">Open Firebase Authentication:</span>
            <a
              href="https://console.firebase.google.com/project/fsu-bdbf6/authentication/users"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold underline"
            >
              <span>Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Global Cloud Persistence Status */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-3xl text-white shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400">
              Global Synchronization Active
            </span>
          </div>
          <h4 className="text-base font-serif font-black">
            Dual-Layer Realtime Cloud &amp; Server Persistence
          </h4>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Every update made to notices, hero sliders, faculty, courses, syllabus, and settings is automatically broadcast live to all visitor devices worldwide and stored permanently.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Synced Worldwide</span>
          </div>
        </div>
      </div>
    </div>
  );
}
