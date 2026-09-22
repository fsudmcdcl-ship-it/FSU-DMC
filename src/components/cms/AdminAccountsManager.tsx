import React, { useState, useEffect } from "react";
import {
  AdminUser,
  getAllAdmins,
  changeAdminPassword,
  createSecondaryAdmin,
  deleteSecondaryAdmin,
  syncAdminsWithFirebase,
} from "../../lib/authService";
import { SystemAdmin } from "../../types";
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
} from "lucide-react";

interface AdminAccountsManagerProps {
  currentUser: AdminUser;
  onShowToast: (msg: string) => void;
}

export default function AdminAccountsManager({
  currentUser,
  onShowToast,
}: AdminAccountsManagerProps) {
  const isMaster = currentUser.role === "master";

  const [adminsList, setAdminsList] = useState<SystemAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  // Master Admin change password state
  const [newMasterPassword, setNewMasterPassword] = useState("");
  const [confirmMasterPassword, setConfirmMasterPassword] = useState("");
  const [masterPassSuccess, setMasterPassSuccess] = useState("");
  const [masterPassError, setMasterPassError] = useState("");

  // Create Secondary Admin state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
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

  const handleCreateSecondaryAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccess("");
    setCreateError("");
    setIsCreating(true);

    try {
      const res = await createSecondaryAdmin(newUsername, newPassword, newFullName);
      if (res.success && res.admin) {
        setCreateSuccess(
          `Secondary admin "${res.admin.username}" created successfully with full website modification permissions!`
        );
        setNewUsername("");
        setNewPassword("");
        setNewFullName("");
        onShowToast(`Secondary admin "${res.admin.username}" created!`);
        refreshAdmins();
      } else {
        setCreateError(res.error || "Failed to create secondary admin.");
      }
    } catch (err: any) {
      setCreateError(err.message || "Failed to create admin.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAdmin = async (admin: SystemAdmin) => {
    if (admin.role === "master") {
      alert("Security restriction: The Master Administrator account (dmcadmin) cannot be deleted.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to remove administrator "${admin.username}" (${admin.fullName})? They will lose CMS access immediately.`
      )
    ) {
      return;
    }

    const res = await deleteSecondaryAdmin(admin.id);
    if (res.success) {
      onShowToast(`Administrator "${admin.username}" removed.`);
      refreshAdmins();
    } else {
      alert(res.error || "Failed to delete administrator.");
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

  // If a secondary admin is logged in, they can view their own profile and change their password,
  // but CANNOT add or manage other admins!
  if (!isMaster) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900">
              Secondary Administrator Privilege Level
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              You are signed in as a <strong>Secondary Administrator</strong> ({currentUser.username}).
              You have full authorization to modify website notices, slides, news, blogs, downloads, and
              view student inquiries. However, adding or managing administrator accounts is strictly
              reserved for the <strong>Master Administrator (dmcadmin)</strong>.
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

  // Master Admin View: Full control
  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Master Administrator Security Control</span>
          </div>
          <h3 className="text-xl font-serif font-black text-white">
            Administrator Accounts & Role Management
          </h3>
          <p className="text-xs text-blue-200/90 max-w-2xl leading-relaxed">
            As Master Admin (<strong>dmcadmin</strong>), you can change your master password anytime and
            create secondary administrators. Secondary admins can modify website content and view
            student complaints, but cannot create or remove administrators.
          </p>
        </div>
        <div className="bg-white/10 border border-white/20 p-3 rounded-2xl text-center shrink-0">
          <span className="text-[10px] text-blue-200 font-mono block">Active Role</span>
          <span className="text-xs font-bold text-amber-300 font-mono">MASTER ADMIN</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Change Master Admin Password */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-900" />
            <span>Change Master Admin Password</span>
          </h4>
          <p className="text-xs text-slate-500">
            Update the password for username <strong>dmcadmin</strong>. This change updates immediately
            in database storage.
          </p>

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
                New Master Password *
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
                Confirm Master Password *
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
              Update Master Password
            </button>
          </form>
        </div>

        {/* Box 2: Create Secondary Admin */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-700" />
            <span>Add Secondary Administrator</span>
          </h4>
          <p className="text-xs text-slate-500">
            Secondary admins can edit website content and view student complaints, but cannot add
            other administrators.
          </p>

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

          <form onSubmit={handleCreateSecondaryAdmin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name / Designation *
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
                  placeholder="e.g. editor_dmc"
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

            <button
              type="submit"
              disabled={isCreating}
              className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Provision Secondary Admin</span>
            </button>
          </form>
        </div>
      </div>

      {/* Existing Administrators List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Registered Administrators ({adminsList.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminsList.map((adm) => {
            const isMasterAdm = adm.role === "master" || adm.username === "dmcadmin";
            return (
              <div
                key={adm.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isMasterAdm
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-blue-100 text-blue-900 border border-blue-200"
                      }`}
                    >
                      {isMasterAdm ? "Master Administrator" : "Secondary Administrator"}
                    </span>
                    {adm.lastLogin && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Active {new Date(adm.lastLogin).toLocaleDateString()}
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

                  <p className="text-[11px] text-slate-500">
                    {isMasterAdm
                      ? "Full unrestricted permissions: Website modification, complaints inbox, password changes, admin management."
                      : "Delegated permissions: Website content editing and viewing student complaints. Cannot manage admins."}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
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
                  {isMasterAdm && (
                    <span className="text-[11px] text-slate-400 font-mono italic">
                      Protected Master Account
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Secondary Admin Password Modal */}
      {selectedAdminForPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              Reset Password for {selectedAdminForPassword.username}
            </h4>
            <p className="text-xs text-slate-500">
              Assign a new password for {selectedAdminForPassword.fullName}.
            </p>

            <form onSubmit={handleUpdateSecondaryPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  New Password
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
                  Save New Password
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdminForPassword(null)}
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
