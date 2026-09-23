import React, { useState, useEffect } from "react";
import { NewsItem, GeneralSettings } from "../types";
import ExpandableText from "../components/ExpandableText";
import { createNoticeSlug, findNoticeBySlugOrId } from "../utils/noticeSlug";
import {
  FileText,
  Calendar,
  Search,
  Filter,
  Eye,
  X,
  ExternalLink,
  Share2,
  Check,
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

  // Deep-linking: On mount and popstate, check URL query param ?notice=...
  useEffect(() => {
    const handleUrlQuery = () => {
      const params = new URLSearchParams(window.location.search);
      const queryNotice = params.get("notice") || params.get("id") || params.get("slug");
      if (queryNotice && news.length > 0) {
        const found = findNoticeBySlugOrId(news, queryNotice);
        if (found) {
          setSelectedNewsId(found.id);
        }
      }
    };

    handleUrlQuery();
    window.addEventListener("popstate", handleUrlQuery);
    return () => window.removeEventListener("popstate", handleUrlQuery);
  }, [news, setSelectedNewsId]);

  // Handler to select/open notice and update custom slug in browser address/search bar
  const handleSelectNotice = (item: NewsItem | null) => {
    if (item) {
      setSelectedNewsId(item.id);
      const slug = createNoticeSlug(item.headingEn, item.id);
      const newUrl = `${window.location.origin}/notices?notice=${encodeURIComponent(slug)}`;
      window.history.pushState({ noticeId: item.id }, "", newUrl);
    } else {
      setSelectedNewsId(null);
      // Revert address bar cleanly back to /notices
      window.history.pushState({}, "", `${window.location.origin}/notices`);
    }
  };

  // Handler to copy link with custom slug
  const handleShare = (e: React.MouseEvent, item: NewsItem) => {
    e.stopPropagation();
    const slug = createNoticeSlug(item.headingEn, item.id);
    const shareUrl = `${window.location.origin}/notices?notice=${encodeURIComponent(slug)}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const getNoticeCategory = (heading: string, body: string): string => {
    const text = (heading + " " + body).toLowerCase();
    if (text.includes("exam") || text.includes("routine") || text.includes("schedule")) {
      return "EXAM ROUTINE";
    }
    if (text.includes("admiss") || text.includes("enroll") || text.includes("intake")) {
      return "ADMISSION";
    }
    if (text.includes("scholarship") || text.includes("quota")) {
      return "SCHOLARSHIP";
    }
    if (text.includes("circular") || text.includes("decision") || text.includes("meeting")) {
      return "CIRCULAR";
    }
    if (text.includes("sport") || text.includes("program") || text.includes("event")) {
      return "CAMPUS EVENT";
    }
    return "CAMPUS NOTICE";
  };

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

      {/* Notices Cards Grid (Styled like Blog cards in BlogsSection) */}
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
            const allImages =
              item.images && item.images.length > 0
                ? item.images
                : item.imageUrl
                ? [item.imageUrl]
                : [];

            const categoryTag = getNoticeCategory(item.headingEn, item.bodyEn);
            const hasImages = allImages.length > 0;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectNotice(item)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/90 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              >
                <div>
                  {/* Top Image / Flyer banner with badges (like blog) */}
                  <div className="h-52 overflow-hidden relative bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center">
                    {hasImages ? (
                      <img
                        src={allImages[0]}
                        alt={item.headingEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                        <FileText className="w-12 h-12 text-amber-400/80 mb-2" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">
                          {categoryTag}
                        </span>
                      </div>
                    )}

                    {/* Category badge top-left */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/65 backdrop-blur-md text-white font-mono shadow-xs border border-white/10">
                        {categoryTag}
                      </span>
                    </div>

                    {/* Date badge top-right exactly like blog */}
                    <div className="absolute top-3.5 right-3.5 bg-slate-950/85 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1.5 shadow-xs border border-white/10">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Multi-image attachment counter */}
                    {allImages.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs font-mono">
                        <ImageIcon className="w-3 h-3 text-blue-900" />
                        <span>+{allImages.length - 1} more</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content like Blog */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 font-medium">
                      <Tag className="w-3.5 h-3.5 text-blue-900" />
                      <span className="font-mono uppercase font-bold text-[11px] text-blue-900">
                        {categoryTag}
                      </span>
                    </div>

                    <h4 className="font-serif font-black text-slate-900 text-lg leading-snug group-hover:text-blue-900 transition line-clamp-2 mb-3">
                      {item.headingEn}
                    </h4>

                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {item.bodyEn}
                    </p>
                  </div>
                </div>

                {/* Bottom Bar like Blog */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Notice</span>
                  </span>

                  <button
                    onClick={(e) => handleShare(e, item)}
                    title="Copy link with slug"
                    className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-blue-900 border border-transparent hover:border-slate-200 transition cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* INDIVIDUAL NOTICE DETAILS POPUP (Opened with custom slug in search bar) */}
      {selectedNews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => handleSelectNotice(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>OFFICIAL CAMPUS NOTICE</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  /notices?notice={createNoticeSlug(selectedNews.headingEn, selectedNews.id)}
                </span>
              </div>
              <button
                onClick={() => handleSelectNotice(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Close Notice"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
              {/* Attached Images Gallery with Natural Aspect Ratio */}
              {((selectedNews.images && selectedNews.images.length > 0) || selectedNews.imageUrl) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-blue-900" />
                      <span>Official Notice Attachments & Flyers</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
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
                        className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center overflow-hidden"
                      >
                        <img
                          src={imgUrl}
                          alt={`${selectedNews.headingEn} - Attachment ${idx + 1}`}
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
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-blue-900" />
                    <span>Published: {new Date(selectedNews.createdAt).toLocaleString()}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full font-mono">
                    {getNoticeCategory(selectedNews.headingEn, selectedNews.bodyEn)}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-slate-900 leading-snug">
                  {selectedNews.headingEn}
                </h2>
              </div>

              {/* Notice Body with 11-line auto-trimming rule */}
              <div className="text-sm md:text-base text-slate-700 leading-relaxed bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80 font-sans">
                <ExpandableText text={selectedNews.bodyEn} maxLines={11} />
              </div>
            </div>

            {/* Modal Footer with Share Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={(e) => handleShare(e, selectedNews)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition hover:bg-slate-100 cursor-pointer shadow-xs"
              >
                {copiedId === selectedNews.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-blue-900" />
                    <span>Share Notice Link</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleSelectNotice(null)}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Zoom Overlay */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition cursor-pointer"
            aria-label="Close Fullscreen"
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
