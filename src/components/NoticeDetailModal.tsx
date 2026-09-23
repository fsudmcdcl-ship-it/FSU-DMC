import React, { useState } from "react";
import { NewsItem } from "../types";
import ExpandableText from "./ExpandableText";
import { createNoticeSlug } from "../utils/noticeSlug";
import {
  X,
  Calendar,
  Share2,
  Check,
  ImageIcon,
  ExternalLink,
  FileText,
  AlertCircle,
} from "lucide-react";

interface NoticeDetailModalProps {
  notice: NewsItem | null;
  onClose: () => void;
}

export default function NoticeDetailModal({
  notice,
  onClose,
}: NoticeDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  if (!notice) return null;

  const allImages =
    notice.images && notice.images.length > 0
      ? notice.images
      : notice.imageUrl
      ? [notice.imageUrl]
      : [];

  const handleShare = () => {
    const slug = createNoticeSlug(notice.headingEn, notice.id);
    const shareUrl = `${window.location.origin}/notices?notice=${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            <span>OFFICIAL CAMPUS NOTICE</span>
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close Notice"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* Attached Images Gallery - Natural Aspect Ratio */}
          {allImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 font-mono">
                  <ImageIcon className="w-4 h-4 text-blue-900" />
                  <span>Notice Attachments & Circular Flyers</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {allImages.length} Document{allImages.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-4">
                {allImages.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center overflow-hidden"
                  >
                    <img
                      src={imgUrl}
                      alt={`${notice.headingEn} - Attachment ${idx + 1}`}
                      className="max-h-[550px] w-auto max-w-full object-contain rounded-xl shadow-xs cursor-pointer hover:opacity-95 transition"
                      referrerPolicy="no-referrer"
                      onClick={() => setFullscreenImage(imgUrl)}
                    />
                    <div className="w-full flex items-center justify-between pt-2 px-1 text-[11px]">
                      <span className="text-slate-400 font-mono">Document #{idx + 1}</span>
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
                <span>Published: {new Date(notice.createdAt).toLocaleString()}</span>
              </span>
              {allImages.length > 1 && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full font-mono">
                  {allImages.length} Images Attached
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-slate-900 leading-snug">
              {notice.headingEn}
            </h2>
          </div>

          {/* Notice Body with 11-line rule */}
          <div className="text-sm md:text-base text-slate-700 leading-relaxed bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/80 font-sans">
            <ExpandableText text={notice.bodyEn} maxLines={11} />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition hover:bg-slate-100 cursor-pointer"
          >
            {copied ? (
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
            onClick={onClose}
            className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
          >
            Close Notice
          </button>
        </div>
      </div>

      {/* Fullscreen Image Preview */}
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
            alt="Fullscreen Document Preview"
            className="max-h-[95vh] max-w-[95vw] object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      )}
    </div>
  );
}
