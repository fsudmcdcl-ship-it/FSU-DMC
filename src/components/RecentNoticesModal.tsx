import React, { useState } from "react";
import { NewsItem, ImportantNotice } from "../types";
import ExpandableText from "./ExpandableText";
import { createNoticeSlug } from "../utils/noticeSlug";
import {
  Bell,
  X,
  Calendar,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  FileText,
  ImageIcon,
  Share2,
  Check,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";

interface RecentNoticesModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsItem[];
  importantNotice?: ImportantNotice;
  onSelectNotice: (noticeId: string) => void;
  onViewAllNotices: () => void;
}

export default function RecentNoticesModal({
  isOpen,
  onClose,
  news,
  importantNotice,
  onSelectNotice,
  onViewAllNotices,
}: RecentNoticesModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ["All", "Exams", "Admissions", "Circulars", "Events"];

  // Sort by latest
  const sortedNews = [...news].sort((a, b) => b.createdAt - a.createdAt);

  const filteredNews = sortedNews.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.headingEn.toLowerCase().includes(term) ||
      item.bodyEn.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (selectedCategory === "All") return true;

    const lowerHeading = item.headingEn.toLowerCase();
    const lowerBody = item.bodyEn.toLowerCase();

    if (selectedCategory === "Exams") {
      return (
        lowerHeading.includes("exam") ||
        lowerHeading.includes("routine") ||
        lowerHeading.includes("schedule") ||
        lowerBody.includes("exam")
      );
    }
    if (selectedCategory === "Admissions") {
      return (
        lowerHeading.includes("admiss") ||
        lowerHeading.includes("enroll") ||
        lowerHeading.includes("intake") ||
        lowerBody.includes("admiss")
      );
    }
    if (selectedCategory === "Circulars") {
      return (
        lowerHeading.includes("circular") ||
        lowerHeading.includes("notice") ||
        lowerHeading.includes("meeting") ||
        lowerBody.includes("circular")
      );
    }
    if (selectedCategory === "Events") {
      return (
        lowerHeading.includes("sport") ||
        lowerHeading.includes("program") ||
        lowerHeading.includes("event") ||
        lowerBody.includes("program")
      );
    }
    return true;
  });

  const handleShare = (e: React.MouseEvent, item: NewsItem) => {
    e.stopPropagation();
    const slug = createNoticeSlug(item.headingEn, item.id);
    const shareUrl = `${window.location.origin}/notices?notice=${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const getNoticeCategoryTag = (heading: string, body: string) => {
    const text = (heading + " " + body).toLowerCase();
    if (text.includes("exam") || text.includes("routine") || text.includes("schedule")) {
      return { label: "EXAM ROUTINE", bg: "bg-red-50 text-red-700 border-red-200" };
    }
    if (text.includes("admiss") || text.includes("enroll") || text.includes("intake")) {
      return { label: "ADMISSION", bg: "bg-blue-50 text-blue-800 border-blue-200" };
    }
    if (text.includes("circular") || text.includes("decision") || text.includes("meeting")) {
      return { label: "CIRCULAR", bg: "bg-purple-50 text-purple-800 border-purple-200" };
    }
    if (text.includes("scholarship") || text.includes("quota")) {
      return { label: "SCHOLARSHIP", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
    return { label: "CAMPUS NOTICE", bg: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl flex flex-col relative border border-slate-200/90 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-5 sm:p-6 border-b border-blue-900 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-red-600 text-white shadow-sm">
                <Bell className="w-4 h-4 text-amber-300 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-serif font-black tracking-tight text-white">
                    Recent News & Campus Notices
                  </h2>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full font-mono">
                    {news.length} Total
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/90 font-medium">
                  Official announcements from Free Student Union & Darchula Multiple Campus (FWU)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search & Filter in Header */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search recent notices by keyword..."
                className="w-full pl-9 pr-8 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-amber-400 text-slate-950 font-black shadow-xs"
                      : "bg-white/10 text-slate-200 hover:bg-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
          {/* Pinned / Critical Announcement Alert if active */}
          {importantNotice?.active && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 border-2 border-red-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded-md font-mono">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span>{importantNotice.bannerTextEn || "CRITICAL CAMPUS ANNOUNCEMENT"}</span>
                </span>
                <span className="text-[10px] font-bold text-amber-800 font-mono">
                  PINNED NOTICE
                </span>
              </div>

              <h3 className="font-serif font-black text-slate-900 text-base leading-snug">
                {importantNotice.titleEn}
              </h3>

              {importantNotice.bodyEn && (
                <div className="text-xs text-slate-700 leading-relaxed">
                  <ExpandableText text={importantNotice.bodyEn} maxLines={4} />
                </div>
              )}

              {importantNotice.imageUrl && (
                <div className="pt-1">
                  <img
                    src={importantNotice.imageUrl}
                    alt="Notice"
                    className="max-h-48 rounded-xl object-contain border border-red-200 bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {/* Structured List of Recent News & Notices */}
          {filteredNews.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No notices match your criteria</p>
              <p className="text-[11px] text-slate-400">
                {searchTerm ? "Try searching for a different keyword or reset filters." : "No notices have been posted yet."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono px-1">
                <span className="font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-900" />
                  <span>Showing {filteredNews.length} Notice{filteredNews.length > 1 ? "s" : ""}</span>
                </span>
                <span>Sorted by Most Recent</span>
              </div>

              {filteredNews.map((item, index) => {
                const tag = getNoticeCategoryTag(item.headingEn, item.bodyEn);
                const allImages = item.images && item.images.length > 0
                  ? item.images
                  : (item.imageUrl ? [item.imageUrl] : []);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onClose();
                      onSelectNotice(item.id);
                    }}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group space-y-3"
                  >
                    {/* Top Row: Category tag, Date, and Attachment count */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border font-mono ${tag.bg}`}>
                          {tag.label}
                        </span>

                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400 text-slate-950 font-mono animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-900" />
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </span>

                        {allImages.length > 0 && (
                          <span className="flex items-center gap-1 text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                            <ImageIcon className="w-3 h-3 text-amber-600" />
                            <span>{allImages.length} photo{allImages.length > 1 ? "s" : ""}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Notice Headline */}
                    <h3 className="font-serif font-black text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-900 transition-colors">
                      {item.headingEn}
                    </h3>

                    {/* Notice Body Preview */}
                    <div
                      className="text-xs text-slate-600 leading-relaxed"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExpandableText text={item.bodyEn} maxLines={4} />
                    </div>

                    {/* Attached Image Thumbnails Strip if present */}
                    {allImages.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 scrollbar-none">
                        {allImages.slice(0, 3).map((imgUrl, i) => (
                          <img
                            key={i}
                            src={imgUrl}
                            alt="Attachment"
                            className="w-14 h-14 object-cover rounded-lg border border-slate-200 bg-slate-100 group-hover:border-blue-400 transition"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                        {allImages.length > 3 && (
                          <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-mono font-bold text-slate-600">
                            +{allImages.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 group-hover:text-blue-950 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Read Full Notice & Documents</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleShare(e, item)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-900 hover:bg-slate-100 transition cursor-pointer"
                        title="Copy direct notice link with slug"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onViewAllNotices();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
          >
            <span>Go to All Notices Page</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
