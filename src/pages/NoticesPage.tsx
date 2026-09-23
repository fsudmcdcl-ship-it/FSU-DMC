import React, { useState } from "react";
import { NewsItem, GeneralSettings } from "../types";
import ExpandableText from "../components/ExpandableText";
import {
  FileText,
  Calendar,
  Search,
  Filter,
  Eye,
  X,
  ExternalLink,
  ChevronRight,
  Share2,
  Check,
  Download,
  AlertCircle,
  Tag,
  ImageIcon,
} from "lucide-react";

interface NoticesPageProps {
  news: NewsItem[];
  settings?: GeneralSettings;
  selectedNewsId: string | null;
  setSelectedNewsId: (id: string | null) => void;
}

export default function NoticesPage({
  news,
  settings,
  selectedNewsId,
  setSelectedNewsId,
}: NoticesPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const categories = [
    "All",
    "Exams",
    "Admissions",
    "Circulars",
    "Scholarships",
    "Events",
  ];

  const sortedNews = [...news].sort((a, b) => b.createdAt - a.createdAt);

  const filteredNews = sortedNews.filter((item) => {
    const matchesSearch =
      item.headingEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bodyEn.toLowerCase().includes(searchTerm.toLowerCase());

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
    if (selectedCategory === "Scholarships") {
      return (
        lowerHeading.includes("scholarship") ||
        lowerHeading.includes("quota") ||
        lowerBody.includes("scholarship")
      );
    }
    if (selectedCategory === "Events") {
      return (
        lowerHeading.includes("sports") ||
        lowerHeading.includes("program") ||
        lowerHeading.includes("day") ||
        lowerBody.includes("event")
      );
    }
    return true;
  });

  const selectedNews = news.find((n) => n.id === selectedNewsId);

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/notices?notice=${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10 w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            Official Campus Notices & Circulars
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white">
            Campus Notices & Announcements
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Official announcements, examination routines, enrollment notices, and university circulars from Darchula Multiple Campus, Farwestern University.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notices by keyword, exam name, program..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs font-mono font-bold text-slate-500 self-center">
            Found: <span className="text-blue-950 font-black">{filteredNews.length}</span> notices
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-950 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {filteredNews.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Notices Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== "All"
              ? "No notices match your search criteria. Try a different query or select 'All'."
              : "No notices have been published yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => {
            const allImages = (item.images && item.images.length > 0)
              ? item.images
              : (item.imageUrl ? [item.imageUrl] : []);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
                onClick={() => setSelectedNewsId(item.id)}
              >
                {/* Images Preview if available */}
                {allImages.length > 0 && (
                  <div className="relative bg-slate-100 border-b border-slate-100 flex items-center justify-center overflow-hidden h-48">
                    <img
                      src={allImages[0]}
                      alt={item.headingEn}
                      className="max-h-full max-w-full object-contain p-2 group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {allImages.length > 1 && (
                      <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-amber-400" />
                        <span>+{allImages.length - 1} more</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-900" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </span>

                      {allImages.length > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-mono">
                          <ImageIcon className="w-3 h-3" />
                          <span>{allImages.length} image{allImages.length > 1 ? "s" : ""}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-900 transition">
                      {item.headingEn}
                    </h3>

                    {/* Notice body with 11-line auto-trimming rule */}
                    <div
                      className="text-xs text-slate-600 leading-relaxed pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExpandableText text={item.bodyEn} maxLines={11} />
                    </div>
                  </div>

                  {/* Card Action footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNewsId(item.id);
                      }}
                      className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1.5 cursor-pointer group-hover:translate-x-0.5 transition-transform"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Notice & Attachments</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleShare(e, item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-900 hover:bg-slate-100 transition cursor-pointer"
                      title="Copy Notice Link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INDIVIDUAL NOTICE DETAILS MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>OFFICIAL CAMPUS NOTICE</span>
              </span>
              <button
                onClick={() => setSelectedNewsId(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
              {/* Attached Images with Natural Aspect Ratio */}
              {((selectedNews.images && selectedNews.images.length > 0) || selectedNews.imageUrl) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-900" />
                      <span>Official Notice Attachments & Flyers</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {(selectedNews.images?.length || 1)} Document(s)
                    </span>
                  </div>

                  <div className="space-y-4">
                    {(selectedNews.images && selectedNews.images.length > 0
                      ? selectedNews.images
                      : [selectedNews.imageUrl!]
                    ).map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col items-center justify-center overflow-hidden"
                      >
                        <img
                          src={imgUrl}
                          alt={`${selectedNews.headingEn} - Document ${idx + 1}`}
                          className="max-h-[550px] w-auto max-w-full object-contain rounded-xl shadow-xs cursor-pointer hover:opacity-95 transition"
                          referrerPolicy="no-referrer"
                          onClick={() => setFullscreenImage(imgUrl)}
                        />
                        <div className="w-full flex items-center justify-between pt-2 px-1 text-[11px]">
                          <span className="text-slate-400 font-mono">Attachment #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setFullscreenImage(imgUrl)}
                            className="font-bold text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Zoom Fullscreen</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp & Headline */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-blue-900" />
                  <span>Published: {new Date(selectedNews.createdAt).toLocaleString()}</span>
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 leading-snug">
                  {selectedNews.headingEn}
                </h2>
              </div>

              {/* Notice Body Text with 11-line rule */}
              <div className="text-sm md:text-base text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100/90 font-sans">
                <ExpandableText text={selectedNews.bodyEn} maxLines={11} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={(e) => handleShare(e, selectedNews.id)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition hover:bg-slate-100 cursor-pointer"
              >
                {copiedId === selectedNews.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Notice</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedNewsId(null)}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Zoom Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={fullscreenImage}
            alt="Fullscreen Preview"
            className="max-h-[95vh] max-w-[95vw] object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}
