import React, { useState, useEffect } from "react";
import {
  AdminUser,
  getAllAdmins,
  changeAdminPassword,
  createSubAdmin,
  deleteSecondaryAdmin,
  unlockAdminAccount,
  syncAdminsWithFirebase,
} from "../../lib/authService";
import { SystemAdmin, AdminRole } from "../../types";
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Unlock,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";

interface AdminAccountsManagerProps {
  currentUser: AdminUser;
  onShowToast: (msg: string) => void;
  onRequestConfirmDelete?: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void | Promise<void>;
  }) => void;
}

export default function AdminAccountsManager({
  currentUser,
  onShowToast,
  onRequestConfirmDelete,
}: AdminAccountsManagerProps) {
  const isMaster = currentUser.role === "master";

  const [adminsList, setAdminsList] = useState<SystemAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  // Master Admin change password state
  const [newMasterPassword, setNewMasterPassword] = useState("");
  const [confirmMasterPassword, setConfirmMasterPassword] = useState("");
  const [masterPassSuccess, setMasterPassSuccess] = useState("");
  const [masterPassError, setMasterPassError] = useState("");

  // Create Sub-Admin state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState<"secondary" | "reviewer">("secondary");
  const [createSuccess, setCreateSuccess] = useState("");
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Quick edit password for secondary admin modal/state
  const [selectedAdminForPassword, setSelectedAdminForPassword] = useState<SystemAdmin | null>(null);
  const [secondaryNewPass, setSecondaryNewPass] = useState("");

  const refreshAdmins = async () => {
    setLoading(true);
    await syncAdminsWithFirebase();
    const list = getAllAdmins();
    setAdminsList(list);
    setLoading(false);
  };

  useEffect(() => {
    refreshAdmins();
  }, []);

  const handleChangeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMasterPassSuccess("");
    setMasterPassError("");

    if (newMasterPassword.length < 3) {
      setMasterPassError("New password must be at least 3 characters long.");
      return;
    }
    if (newMasterPassword !== confirmMasterPassword) {
      setMasterPassError("Passwords do not match. Please re-enter.");
      return;
    }

    try {
      const res = await changeAdminPassword(currentUser.uid, newMasterPassword);
      if (res.success) {
        setMasterPassSuccess("Your administrator password was updated successfully!");
        setNewMasterPassword("");
        setConfirmMasterPassword("");
        onShowToast("Administrator password updated successfully!");
        refreshAdmins();
      } else {
        setMasterPassError(res.error || "Failed to update password.");
      }
    } catch (err: any) {
      setMasterPassError(err.message || "Failed to update password.");
    }
  };

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccess("");
    setCreateError("");
    setIsCreating(true);

    try {
      const res = await createSubAdmin(newUsername, newPassword, newFullName, newRole);
      if (res.success && res.admin) {
        const roleLabel = newRole === "reviewer" ? "Complaint Handler / Reviewer" : "Secondary Administrator";
        setCreateSuccess(`Account "${res.admin.username}" created successfully with ${roleLabel} privileges!`);
        setNewUsername("");
        setNewPassword("");
        setNewFullName("");
        setNewRole("secondary");
        onShowToast(`Administrator "${res.admin.username}" provisioned!`);
        refreshAdmins();
      } else {
        setCreateError(res.error || "Failed to create administrator.");
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create admin.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUnlockAdmin = async (admin: SystemAdmin) => {
    if (!isMaster) {
      alert("Only the Master Administrator can reactivate locked accounts.");
      return;
    }

    try {
      const res = await unlockAdminAccount(admin.username, "master");
      if (res.success) {
        onShowToast(`Account "${admin.username}" has been unlocked and reactivated.`);
        refreshAdmins();
      } else {
        alert(res.error || "Failed to unlock account.");
      }
    } catch (err: any) {
      alert("Error unlocking account: " + err.message);
    }
  };

  const handleDeleteAdmin = async (admin: SystemAdmin) => {
    if (admin.role === "master") {
      alert("Security restriction: The Master Administrator account (dmcadmin) cannot be deleted.");
      return;
    }

    const doDelete = async () => {
      const res = await deleteSecondaryAdmin(admin.id);
      if (res.success) {
        onShowToast(`Administrator "${admin.username}" removed.`);
        refreshAdmins();
      } else {
        alert(res.error || "Failed to delete administrator.");
      }
    };

    if (onRequestConfirmDelete) {
      onRequestConfirmDelete({
        title: "Remove Administrator?",
        message: `Are you sure you want to remove administrator "${admin.username}" (${admin.fullName})? They will lose CMS access immediately.`,
        confirmLabel: "Remove Admin",
        onConfirm: doDelete,
      });
    } else {
      await doDelete();
    }
  };

  const handleUpdateSecondaryPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminForPassword) return;

    if (secondaryNewPass.length < 3) {
      alert("Password must be at least 3 characters.");
      return;
    }

    const res = await changeAdminPassword(selectedAdminForPassword.id, secondaryNewPass);
    if (res.success) {
      onShowToast(`Password for ${selectedAdminForPassword.username} updated!`);
      setSelectedAdminForPassword(null);
      setSecondaryNewPass("");
      refreshAdmins();
    } else {
      alert(res.error || "Failed to update password.");
    }
  };

  // If a secondary or reviewer admin is logged in, show restricted view
  if (!isMaster) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900">
              {currentUser.role === "reviewer" ? "Complaint Handler / Reviewer Access" : "Secondary Administrator Access"}
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              You are signed in as a <strong>{currentUser.role === "reviewer" ? "Complaint Handler / Reviewer" : "Secondary Administrator"}</strong> ({currentUser.username}).
              Adding, configuring, or unlocking administrator accounts is strictly reserved for the <strong>Master Administrator</strong>.
            </p>
          </div>
        </div>

        {/* Change Own Password Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4 max-w-lg">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-900" />
            <span>Change Your Password</span>
          </h4>

          {masterPassSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{masterPassSuccess}</span>
            </div>
          )}

          {masterPassError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{masterPassError}</span>
            </div>
          )}

          <form onSubmit={handleChangeOwnPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newMasterPassword}
                onChange={(e) => setNewMasterPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmMasterPassword}
                onChange={(e) => setConfirmMasterPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Master Admin full view
  return (
    <div className="space-y-8">
      {/* Security & Lockout Policy Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-6 sm:p-7 rounded-3xl shadow-md space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>Master Administrator Security Control</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-black text-white">
          Admin Accounts & Security Lockout Policy
        </h3>
        <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed max-w-3xl">
          Account Lockout Policy: If a user enters an incorrect password <strong>3 consecutive times</strong>,
          their account status is automatically set to <strong>Locked</strong>. Account reactivation is restricted
          <strong> exclusively to the Master Administrator</strong> via this dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Change Master Password */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-900" />
            <span>Update Master Admin Password</span>
          </h4>

          {masterPassSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{masterPassSuccess}</span>
            </div>
          )}

          {masterPassError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{masterPassError}</span>
            </div>
          )}

          <form onSubmit={handleChangeOwnPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                New Master Password
              </label>
              <input
                type="password"
                required
                value={newMasterPassword}
                onChange={(e) => setNewMasterPassword(e.target.value)}
                placeholder="Enter new master password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm Master Password
              </label>
              <input
                type="password"
                required
                value={confirmMasterPassword}
                onChange={(e) => setConfirmMasterPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              Save New Master Password
            </button>
          </form>
        </div>

        {/* Right Column: Provision Sub-Admin */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-700" />
            <span>Provision Sub-Admin Account</span>
          </h4>

          {createSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{createSuccess}</span>
            </div>
          )}

          {createError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name / Staff Designation *
              </label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="e.g. Sub-Secretary Bipin Joshi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Login Username *
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. reviewer_dmc"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium font-mono lowercase focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Assign Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Administrative Role & Permissions *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "secondary" | "reviewer")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white text-slate-800"
              >
                <option value="secondary">
                  Secondary Admin (Full Website Content & Complaints Management)
                </option>
                <option value="reviewer">
                  Complaint Handler / Reviewer (Strictly Complaints Inbox & Remarks Only)
                </option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {newRole === "reviewer"
                  ? "Complaint Handlers can only view, review, and add remarks to student complaints in #messages. They cannot edit website content or manage accounts."
                  : "Secondary Admins can edit notices, blogs, faculty, syllabus, and student complaints, but cannot manage admin accounts."}
              </p>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Provision Administrator Account</span>
            </button>
          </form>
        </div>
      </div>

      {/* Existing Administrators List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Registered Administrators ({adminsList.length})
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            Lockout Policy: 3 failed attempts = auto-lock
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminsList.map((adm) => {
            const isMasterAdm = adm.role === "master";
            const isReviewer = adm.role === "reviewer";
            const isLocked = adm.status === "locked" || adm.status === "disabled";

            return (
              <div
                key={adm.id}
                className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between gap-4 transition-all ${
                  isLocked
                    ? "bg-red-50/50 border-red-300 ring-2 ring-red-400/30"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isMasterAdm
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : isReviewer
                          ? "bg-purple-100 text-purple-900 border border-purple-300"
                          : "bg-blue-100 text-blue-900 border border-blue-300"
                      }`}
                    >
                      {isMasterAdm
                        ? "Master Administrator"
                        : isReviewer
                        ? "Complaint Handler"
                        : "Secondary Administrator"}
                    </span>

                    {/* Status Pill */}
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white shadow-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Locked (3 Attempts)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <BadgeCheck className="w-3 h-3 text-emerald-600" />
                        Active
                      </span>
                    )}
                  </div>

                  <div>
                    <h5 className="text-sm font-bold text-slate-900">
                      {adm.fullName || adm.username}
                    </h5>
                    <p className="text-xs font-mono text-slate-500">
                      Username: <strong className="text-blue-950 font-bold">{adm.username}</strong>
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isMasterAdm
                      ? "Full unrestricted permissions: Website modification, complaints inbox, password changes, admin management & account unlocks."
                      : isReviewer
                      ? "Restricted permission: Exclusively reviews, updates status, and adds internal remarks to student complaints in #messages."
                      : "Delegated permissions: Website content editing and viewing student complaints. Cannot manage admins."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  {/* Unlock button if locked (Master Admin exclusive) */}
                  {isLocked && isMaster && (
                    <button
                      type="button"
                      onClick={() => handleUnlockAdmin(adm)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock & Reactivate</span>
                    </button>
                  )}

                  {!isMasterAdm && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedAdminForPassword(adm)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <KeyRound className="w-3 h-3 text-slate-500" />
                        Reset Password
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAdmin(adm)}
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Edit Password Modal */}
      {selectedAdminForPassword && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h4 className="text-base font-bold text-slate-900">
              Reset Password for {selectedAdminForPassword.username}
            </h4>

            <form onSubmit={handleUpdateSecondaryPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  New Password (min 3 chars)
                </label>
                <input
                  type="password"
                  required
                  value={secondaryNewPass}
                  onChange={(e) => setSecondaryNewPass(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-900 cursor-pointer"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAdminForPassword(null);
                    setSecondaryNewPass("");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
