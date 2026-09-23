import React, { useState } from "react";
import { UpcomingEvent, DatabaseState } from "../../types";
import { saveSubItem, deleteSubItem } from "../../lib/dataService";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Check,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  FileText
} from "lucide-react";
import ImageUploadInput from "../ImageUploadInput";

interface UpcomingEventsManagerProps {
  state: DatabaseState;
  onShowToast: (message: string) => void;
  onRequestConfirmDelete: (options: {
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  }) => void;
}

export function getEventStatus(eventDateStr: string): {
  status: "TODAY" | "COMPLETED" | "COUNTDOWN";
  diffMs: number;
} {
  if (!eventDateStr) return { status: "COMPLETED", diffMs: 0 };
  const target = new Date(eventDateStr);
  const now = new Date();

  // Check if calendar date matches TODAY in local date
  const isSameDay =
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate();

  if (isSameDay) {
    return { status: "TODAY", diffMs: 0 };
  }

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { status: "COMPLETED", diffMs: 0 };
  }

  return { status: "COUNTDOWN", diffMs };
}

export default function UpcomingEventsManager({
  state,
  onShowToast,
  onRequestConfirmDelete,
}: UpcomingEventsManagerProps) {
  const events = state?.upcomingEvents ? Object.values(state.upcomingEvents) : [];
  // Sort with nearest future first, then today, then past
  events.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<UpcomingEvent, "id">>({
    title: "",
    images: [],
    resourceLink: "",
    resourceLinkLabel: "Download Event Notice & Rulebook (PDF)",
    eventDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16), // 7 days ahead default
    location: "Campus Main Auditorium",
    description: "",
    isPublished: true,
  });

  const [tempImageUrl, setTempImageUrl] = useState("");

  const startEdit = (ev: UpcomingEvent) => {
    setEditingId(ev.id);
    let formattedDate = ev.eventDate;
    try {
      const d = new Date(ev.eventDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().slice(0, 16);
      }
    } catch {
      // keep raw string
    }

    setFormData({
      title: ev.title,
      images: ev.images ? [...ev.images] : [],
      resourceLink: ev.resourceLink || "",
      resourceLinkLabel: ev.resourceLinkLabel || "Download Event Notice & Rulebook (PDF)",
      eventDate: formattedDate,
      location: ev.location || "",
      description: ev.description || "",
      isPublished: ev.isPublished !== false,
    });

    const formEl = document.getElementById("event-form");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTempImageUrl("");
    setFormData({
      title: "",
      images: [],
      resourceLink: "",
      resourceLinkLabel: "Download Event Notice & Rulebook (PDF)",
      eventDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      location: "Campus Main Auditorium",
      description: "",
      isPublished: true,
    });
  };

  const handleAddImage = (url: string) => {
    if (!url) return;
    if (formData.images.length >= 2) {
      alert("Maximum 2 media/images allowed per event.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setTempImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please provide the event title.");
      return;
    }
    if (!formData.eventDate) {
      alert("Please specify the event date & time.");
      return;
    }

    const id = editingId || `event_${Date.now()}`;
    const payload: UpcomingEvent = {
      id,
      title: formData.title.trim(),
      images: formData.images.slice(0, 2),
      resourceLink: formData.resourceLink?.trim() || "",
      resourceLinkLabel: formData.resourceLinkLabel?.trim() || "Download Notice & Registration (PDF)",
      eventDate: formData.eventDate,
      location: formData.location?.trim() || "",
      description: formData.description?.trim() || "",
      isPublished: formData.isPublished,
      createdAt: Date.now(),
    };

    try {
      const res = await saveSubItem("upcomingEvents", id, payload);
      onShowToast(res.message || "Upcoming event published live!");
      cancelEdit();
    } catch (err: any) {
      alert(err?.message || "Failed to save upcoming event");
    }
  };

  const handleDelete = (ev: UpcomingEvent) => {
    onRequestConfirmDelete({
      title: "Delete Event Record?",
      message: `Are you sure you want to permanently delete "${ev.title}"? This cannot be undone.`,
      confirmLabel: "Delete Event",
      onConfirm: async () => {
        try {
          await deleteSubItem("upcomingEvents", ev.id);
          if (editingId === ev.id) cancelEdit();
          onShowToast(`Event "${ev.title}" deleted.`);
        } catch (err: any) {
          alert(err?.message || "Failed to delete event");
        }
      },
    });
  };

  const togglePublish = async (ev: UpcomingEvent) => {
    const updated = {
      ...ev,
      isPublished: ev.isPublished === false ? true : false,
    };
    try {
      await saveSubItem("upcomingEvents", ev.id, updated);
      onShowToast(
        updated.isPublished ? `"${ev.title}" published live!` : `"${ev.title}" set to draft.`
      );
    } catch (err: any) {
      alert(err?.message || "Failed to toggle event visibility");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2 text-blue-950 font-serif font-black text-xl">
          <Calendar className="w-5 h-5 text-amber-500" />
          <h3>Upcoming Events Manager (/upcoming-event)</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Publish, edit, and schedule official campus events with live countdown clocks, today alerts, completed statuses, and up to 2 media images.
        </p>
      </div>

      {/* Add / Edit Form */}
      <form
        id="event-form"
        onSubmit={handleSave}
        className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {editingId ? "Edit Campus Event" : "Create New Campus Event"}
          </span>
          {editingId && (
            <span className="text-[11px] font-mono bg-blue-100 text-blue-950 font-bold px-2 py-0.5 rounded-md">
              Editing ID: {editingId}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Inter-College Cricket & Sports Meet 2083"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Event Date & Time (ISO DateTime) <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Event Location / Venue
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Campus Sports Ground & Main Auditorium"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Resource Link (PDF download or Registration form)
            </label>
            <input
              type="url"
              value={formData.resourceLink}
              onChange={(e) => setFormData({ ...formData, resourceLink: e.target.value })}
              placeholder="https://example.com/event-registration-or-rules.pdf"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Resource Button Label
          </label>
          <input
            type="text"
            value={formData.resourceLinkLabel}
            onChange={(e) => setFormData({ ...formData, resourceLinkLabel: e.target.value })}
            placeholder="e.g., Download Event Notice & Rulebook (PDF) or Register Now"
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Event Description & Details
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Comprehensive description of the event, eligibility, timetable, schedule, and guidelines..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-900 outline-none"
          />
        </div>

        {/* Media / Images Section (Max 2) */}
        <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              Event Media / Images (Max 2 URLs)
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              {formData.images.length}/2 Images
            </span>
          </div>

          {formData.images.length < 2 && (
            <div className="space-y-2">
              <ImageUploadInput
                label="Upload or Paste Event Image"
                value={tempImageUrl}
                onChange={setTempImageUrl}
                placeholder="https://images.unsplash.com/... or upload image"
              />
              {tempImageUrl && (
                <button
                  type="button"
                  onClick={() => handleAddImage(tempImageUrl)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Attach Image to Event
                </button>
              )}
            </div>
          )}

          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-28"
                >
                  <img
                    src={img}
                    alt={`Event asset ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold shadow hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">
                    Image #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 text-blue-950 rounded border-gray-300 focus:ring-blue-900"
            />
            <span>Active & Published on Public Events Page (/upcoming-event)</span>
          </label>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {editingId ? <Check className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-amber-400" />}
            <span>{editingId ? "Update Event Live" : "Publish Event Live"}</span>
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

      {/* Events List Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-serif font-black text-slate-900">
            Registered Campus Events ({events.length})
          </h4>
          <span className="text-[11px] text-slate-500">
            Live Countdown &amp; Status Synced
          </span>
        </div>

        {events.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
            No campus events registered yet. Create your first event using the form above.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => {
              const { status } = getEventStatus(ev.eventDate);
              return (
                <div
                  key={ev.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    ev.isPublished !== false
                      ? "bg-white border-slate-200 shadow-sm"
                      : "bg-slate-100/70 border-slate-300 opacity-70"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {ev.images && ev.images.length > 0 ? (
                        <img
                          src={ev.images[0]}
                          alt={ev.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
                          <Calendar className="w-6 h-6" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-bold text-sm text-slate-900">{ev.title}</h5>
                          {/* Smart Status Badge */}
                          {status === "TODAY" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white animate-pulse">
                              TODAY
                            </span>
                          )}
                          {status === "COMPLETED" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-300 text-slate-700">
                              COMPLETED
                            </span>
                          )}
                          {status === "COUNTDOWN" && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 font-mono">
                              UPCOMING
                            </span>
                          )}
                          {ev.isPublished === false && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                              Draft / Hidden
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(ev.eventDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-red-500" />
                              {ev.location}
                            </span>
                          )}
                          {ev.resourceLink && (
                            <span className="flex items-center gap-1 text-blue-900">
                              <FileText className="w-3 h-3" />
                              Has Resource
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => togglePublish(ev)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                        title={ev.isPublished !== false ? "Hide event" : "Publish event"}
                      >
                        {ev.isPublished !== false ? (
                          <Eye className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(ev)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-xl transition cursor-pointer"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ev)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
