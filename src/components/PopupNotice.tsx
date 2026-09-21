import React, { useState, useEffect } from "react";
import { ImportantNotice } from "../types";
import { X, BellRing } from "lucide-react";

interface PopupNoticeProps {
  notice: ImportantNotice;
  lang?: "en" | "np";
  forceOpenTrigger: number;
}

export default function PopupNotice({ notice, forceOpenTrigger }: PopupNoticeProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Open on load if active, or when forced by header button trigger
  useEffect(() => {
    if (notice?.active) {
      setIsOpen(true);
    }
  }, [notice]);

  // Re-open when trigger increments
  useEffect(() => {
    if (forceOpenTrigger > 0) {
      setIsOpen(true);
    }
  }, [forceOpenTrigger]);

  if (!isOpen || !notice) return null;

  const showImage = notice.type === "image" || notice.type === "both";
  const showText = notice.type === "text" || notice.type === "both";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl relative border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Banner header */}
        <div className="bg-gradient-to-r from-red-700 via-orange-600 to-red-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-300 animate-bounce shrink-0" />
            <span className="font-extrabold uppercase tracking-widest text-xs">
              {notice.bannerTextEn || "⚠️ CRITICAL CAMPUS ANNOUNCEMENT"}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white transition active:scale-95 focus:outline-none cursor-pointer"
            title="Close Notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <h3 className="text-xl font-black text-slate-900 leading-tight border-b border-gray-100 pb-3 font-serif">
            {notice.titleEn || "Official Notice"}
          </h3>

          {/* Render Text details */}
          {showText && notice.bodyEn && (
            <p className="text-sm text-slate-700 leading-relaxed font-sans bg-amber-50/50 p-4 rounded-xl border border-amber-100/60 whitespace-pre-line">
              {notice.bodyEn}
            </p>
          )}

          {/* Render Notice Image */}
          {showImage && notice.imageUrl && (
            <div className="w-full flex justify-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
              <img
                src={notice.imageUrl}
                alt="Notice Attachment"
                className="w-full max-h-[480px] object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Close Notice
          </button>
        </div>
      </div>
    </div>
  );
}
