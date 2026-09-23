import React, { useState } from "react";
import { FaqItem } from "../../types";
import { DEFAULT_DB_STATE } from "../../lib/defaults";
import { saveSubItem, updateSubItem, deleteSubItem } from "../../lib/dataService";
import RichTextEditor from "./RichTextEditor";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  Save,
} from "lucide-react";

interface FaqManagerProps {
  faqs?: Record<string, FaqItem>;
  onShowToast: (msg: string) => void;
}

export default function FaqManager({ faqs, onShowToast }: FaqManagerProps) {
  // Use state faqs or fallback to defaults
  const faqSource = faqs && Object.keys(faqs).length > 0 ? faqs : DEFAULT_DB_STATE.faqs || {};
  const faqList: FaqItem[] = Object.values(faqSource).sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  // New FAQ form state
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("Academic & Syllabus");
  const [newOrder, setNewOrder] = useState(faqList.length + 1);
  const [newPublished, setNewPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit FAQ state
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert("Please provide both a Question and an Answer.");
      return;
    }

    setIsSubmitting(true);
    try {
      const id = `faq_${Date.now()}`;
      const newFaq: FaqItem = {
        id,
        questionEn: newQuestion.trim(),
        answerEn: newAnswer.trim(),
        category: newCategory.trim() || "General",
        order: Number(newOrder) || faqList.length + 1,
        isPublished: newPublished,
      };

      const result = await saveSubItem("faqs", id, newFaq);
      onShowToast(result.message || "New FAQ item saved!");

      // Reset form
      setNewQuestion("");
      setNewAnswer("");
      setNewCategory("Academic & Syllabus");
      setNewOrder(faqList.length + 2);
      setNewPublished(true);
    } catch (err: any) {
      alert("Failed to save FAQ: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;

    try {
      const result = await updateSubItem("faqs", editingFaq.id, {
        questionEn: editingFaq.questionEn.trim(),
        answerEn: editingFaq.answerEn.trim(),
        category: editingFaq.category?.trim() || "General",
        order: Number(editingFaq.order) || 1,
        isPublished: editingFaq.isPublished !== false,
      });

      onShowToast(result.message || "FAQ item updated successfully!");
      setEditingFaq(null);
    } catch (err: any) {
      alert("Failed to update FAQ: " + err.message);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ item?")) return;
    try {
      const result = await deleteSubItem("faqs", id);
      onShowToast(result.message || "FAQ item removed from portal.");
    } catch (err: any) {
      alert("Failed to delete FAQ: " + err.message);
    }
  };

  const handleTogglePublished = async (faq: FaqItem) => {
    const nextStatus = !faq.isPublished;
    try {
      const result = await updateSubItem("faqs", faq.id, {
        isPublished: nextStatus,
      });
      onShowToast(result.message || `FAQ ${nextStatus ? "Published" : "Hidden from Public"}`);
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/70 border border-blue-200/80 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
            <HelpCircle className="w-4 h-4 text-blue-700" />
            <span>Frequently Asked Questions (Accordion) Management</span>
          </div>
          <p className="text-xs text-slate-600">
            Create, edit, reorder, and publish FAQ items displayed across the public portal. Helps
            reduce common message board inquiries.
          </p>
        </div>
        <span className="px-3 py-1 bg-white border border-blue-200 text-blue-950 font-bold text-xs rounded-xl shadow-xs shrink-0">
          Total Items: {faqList.length}
        </span>
      </div>

      {/* Add New FAQ Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-900" />
          <span>Add New FAQ Item</span>
        </h4>

        <form onSubmit={handleCreateFaq} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Question Text *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. How can I obtain FWU course syllabi and lecture notes?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="e.g. Academic & Syllabus"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <RichTextEditor
              label="Answer Description *"
              value={newAnswer}
              onChange={setNewAnswer}
              placeholder="Provide a clear, detailed answer for students (supports formatting, bullet points, tables, and links)..."
              helpText="Use formatting buttons or shortcuts (Ctrl+B, Ctrl+I, Ctrl+K) to style the answer."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mr-2">Display Order:</label>
                <input
                  type="number"
                  min={1}
                  value={newOrder}
                  onChange={(e) => setNewOrder(Number(e.target.value))}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50 text-center"
                />
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={newPublished}
                  onChange={(e) => setNewPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-950 focus:ring-blue-950 accent-blue-950"
                />
                <span>Published on Website</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create FAQ Item</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing FAQs List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Published FAQ Items ({faqList.length})
        </h4>

        {faqList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
            No FAQ items found. Add the first question using the form above.
          </div>
        ) : (
          <div className="space-y-3">
            {faqList.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-950 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{faq.order}
                    </span>
                    {faq.category && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {faq.category}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        faq.isPublished !== false
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {faq.isPublished !== false ? "Visible" : "Hidden"}
                    </span>
                  </div>

                  <h5 className="text-sm font-bold text-slate-900">{faq.questionEn}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {faq.answerEn}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleTogglePublished(faq)}
                    title={faq.isPublished !== false ? "Hide from website" : "Make visible"}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    {faq.isPublished !== false ? (
                      <Eye className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingFaq(faq)}
                    title="Edit FAQ"
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-900 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(faq.id)}
                    title="Delete FAQ"
                    className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit FAQ Modal */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">Edit FAQ Item</h4>
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFaq} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Question Text
                </label>
                <input
                  type="text"
                  required
                  value={editingFaq.questionEn}
                  onChange={(e) => setEditingFaq({ ...editingFaq, questionEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={editingFaq.category || ""}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <RichTextEditor
                  label="Answer Text *"
                  value={editingFaq.answerEn}
                  onChange={(val) => setEditingFaq({ ...editingFaq, answerEn: val })}
                  placeholder="Provide a clear, detailed answer..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingFaq.order}
                    onChange={(e) =>
                      setEditingFaq({ ...editingFaq, order: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-center"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editingFaq.isPublished !== false}
                      onChange={(e) =>
                        setEditingFaq({ ...editingFaq, isPublished: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-950 focus:ring-blue-950 accent-blue-950"
                    />
                    <span>Visible</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
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
