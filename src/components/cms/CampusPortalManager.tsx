import React, { useState } from "react";
import { CampusPortalEntry, DatabaseState } from "../../types";
import { saveSubItem, deleteSubItem } from "../../lib/dataService";
import { Plus, Edit, Trash2, Check, ExternalLink, Globe, LayoutGrid, CheckCircle2, Eye, EyeOff } from "lucide-react";

interface CampusPortalManagerProps {
  state: DatabaseState;
  onShowToast: (message: string) => void;
  onRequestConfirmDelete: (options: {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  }) => void;
}

const DEFAULT_ROUTE_OPTIONS = [
  { value: "campus-staff", label: "Campus Staff Directory (/campus-staff)" },
  { value: "professors", label: "Professors & Academic Faculty (/professors)" },
  { value: "upcoming-event", label: "Upcoming Campus Events (/upcoming-event)" },
  { value: "fsu-helpdesk", label: "Unique FSU Helpdesk & FAQs (/fsu-helpdesk)" },
  { value: "syllabus-notes", label: "Syllabus, Notes & Downloads (/syllabus-notes)" },
  { value: "courses", label: "Offered Academic Programs (/courses)" },
  { value: "notices", label: "Campus Notices & News (/notices)" },
  { value: "fsu-team", label: "FSU Executive Committee (/fsu-team)" },
  { value: "student-blogs", label: "Student Blogs & Articles (/student-blogs)" },
  { value: "contact", label: "Contact Campus & Secretariat (/contact)" },
  { value: "my-complaint", label: "Track Grievance Ticket (/my-complaint)" },
];

export default function CampusPortalManager({
  state,
  onShowToast,
  onRequestConfirmDelete,
}: CampusPortalManagerProps) {
  const portalEntries = state?.portalEntries ? Object.values(state.portalEntries) : [];
  portalEntries.sort((a, b) => (a.order || 0) - (b.order || 0));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CampusPortalEntry, "id">>({
    title: "",
    badge: "Directory",
    description: "",
    targetRoute: "campus-staff",
    order: (portalEntries.length || 0) + 1,
    isPublished: true,
  });

  const [customRouteInput, setCustomRouteInput] = useState("");
  const [isCustomRoute, setIsCustomRoute] = useState(false);

  const startEdit = (entry: CampusPortalEntry) => {
    setEditingId(entry.id);
    const matchesPreset = DEFAULT_ROUTE_OPTIONS.some((opt) => opt.value === entry.targetRoute);
    setIsCustomRoute(!matchesPreset);
    if (!matchesPreset) {
      setCustomRouteInput(entry.targetRoute);
    }
    setFormData({
      title: entry.title,
      badge: entry.badge || "Portal",
      description: entry.description || "",
      targetRoute: entry.targetRoute,
      order: entry.order ?? 1,
      isPublished: entry.isPublished !== false,
    });

    const formEl = document.getElementById("portal-form");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCustomRoute(false);
    setCustomRouteInput("");
    setFormData({
      title: "",
      badge: "Directory",
      description: "",
      targetRoute: "campus-staff",
      order: (portalEntries.length || 0) + 1,
      isPublished: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please provide a title for the Campus Portal card.");
      return;
    }

    const finalRoute = isCustomRoute ? customRouteInput.trim() : formData.targetRoute.trim();
    if (!finalRoute) {
      alert("Please specify a target route or URL destination.");
      return;
    }

    const id = editingId || `portal_${Date.now()}`;
    const payload: CampusPortalEntry = {
      id,
      title: formData.title.trim(),
      badge: formData.badge.trim() || "Portal",
      description: formData.description.trim(),
      targetRoute: finalRoute,
      order: Number(formData.order) || 1,
      isPublished: formData.isPublished,
    };

    try {
      const res = await saveSubItem("portalEntries", id, payload);
      onShowToast(res.message || "Campus Portal entry saved live!");
      cancelEdit();
    } catch (err: any) {
      alert(err?.message || "Failed to save entry");
    }
  };

  const handleDelete = (entry: CampusPortalEntry) => {
    onRequestConfirmDelete({
      title: "Delete Campus Portal Entry?",
      message: `Are you sure you want to delete "${entry.title}"? This shortcut card will no longer appear on the public homepage.`,
      confirmLabel: "Delete Entry",
      onConfirm: async () => {
        try {
          await deleteSubItem("portalEntries", entry.id);
          if (editingId === entry.id) cancelEdit();
          onShowToast(`Campus Portal card "${entry.title}" removed.`);
        } catch (err: any) {
          alert(err?.message || "Failed to delete entry");
        }
      },
    });
  };

  const togglePublish = async (entry: CampusPortalEntry) => {
    const updated = {
      ...entry,
      isPublished: entry.isPublished === false ? true : false,
    };
    try {
      await saveSubItem("portalEntries", entry.id, updated);
      onShowToast(
        updated.isPublished
          ? `"${entry.title}" published live to homepage!`
          : `"${entry.title}" hidden (draft).`
      );
    } catch (err: any) {
      alert(err?.message || "Failed to toggle status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2 text-blue-950 font-serif font-black text-xl">
          <LayoutGrid className="w-5 h-5 text-amber-500" />
          <h3>Campus Portal Shortcuts Manager</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Configure the quick-access navigation cards displayed in the dark-navy &quot;Campus Portal&quot; section of the homepage.
        </p>
      </div>

      {/* Add / Edit Form */}
      <form
        id="portal-form"
        onSubmit={handleSave}
        className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {editingId ? "Edit Campus Portal Shortcut Card" : "Add New Campus Portal Shortcut Card"}
          </span>
          {editingId && (
            <span className="text-[11px] font-mono bg-blue-100 text-blue-950 font-bold px-2 py-0.5 rounded-md">
              Editing: {editingId}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Card Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Campus Staff Directory"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Badge / Category Tag</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              placeholder="e.g., Directory, Faculty, Support"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Description / Action Cue
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., View key administrative staff →"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Display Order</label>
            <input
              type="number"
              min={1}
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Target Destination / Route
          </label>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustomRoute(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  !isCustomRoute ? "bg-blue-950 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                Standard Campus Routes
              </button>
              <button
                type="button"
                onClick={() => setIsCustomRoute(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  isCustomRoute ? "bg-blue-950 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                Custom URL / External Link
              </button>
            </div>

            {!isCustomRoute ? (
              <select
                value={formData.targetRoute}
                onChange={(e) => setFormData({ ...formData, targetRoute: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-900 outline-none"
              >
                {DEFAULT_ROUTE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customRouteInput}
                onChange={(e) => setCustomRouteInput(e.target.value)}
                placeholder="https://example.com/portal or /custom-route"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-900 outline-none"
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 text-blue-950 rounded border-gray-300 focus:ring-blue-900"
            />
            <span>Active & Published on Public Homepage</span>
          </label>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {editingId ? <Check className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
            <span>{editingId ? "Update Campus Portal Live" : "Add Campus Portal Live"}</span>
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Portal Entries List Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-serif font-black text-slate-900">
            Active Campus Portal Cards ({portalEntries.length})
          </h4>
          <span className="text-[11px] text-slate-500">
            Sorted by Display Order
          </span>
        </div>

        {portalEntries.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
            No Campus Portal cards found. Add your first shortcut card above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portalEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 rounded-2xl border transition-all ${
                  entry.isPublished !== false
                    ? "bg-white border-slate-200 shadow-sm"
                    : "bg-slate-100/70 border-slate-300 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono">
                        {entry.badge || "Portal"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Order: #{entry.order ?? 1}
                      </span>
                      {entry.isPublished !== false ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                          <EyeOff className="w-3 h-3" /> Hidden (Draft)
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-sm text-slate-900">{entry.title}</h5>
                    <p className="text-xs text-slate-600">{entry.description}</p>
                    <div className="pt-1 flex items-center gap-1 text-[11px] text-blue-900 font-mono">
                      <span>Target: {entry.targetRoute}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => togglePublish(entry)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      title={entry.isPublished !== false ? "Hide this card" : "Publish this card"}
                    >
                      {entry.isPublished !== false ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(entry)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg transition cursor-pointer"
                      title="Edit Shortcut Card"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition cursor-pointer"
                      title="Delete Shortcut Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
