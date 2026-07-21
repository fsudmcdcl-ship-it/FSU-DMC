import React, { useState, useEffect } from "react";
import { ImportantNotice } from "../types";
import { X, BellRing, Image } from "lucide-react";

interface PopupNoticeProps {
  notice: ImportantNotice;
  lang: "en" | "np";
  forceOpenTrigger: number; // A number incremented to force reopening
}

export default function PopupNotice({ notice, lang, forceOpenTrigger }: PopupNoticeProps) {
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
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-yellow-300 animate-bounce shrink-0" />
            <span className="font-extrabold uppercase tracking-widest text-xs">
              {lang === "en" 
                ? (notice.bannerTextEn || "⚠️ CRITICAL CAMPUS ANNOUNCEMENT") 
                : (notice.bannerTextNp || "⚠️ स्वतन्त्र विद्यार्थी युनियन विशेष सूचना")}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white transition active:scale-95 focus:outline-none"
            title="Close Notice"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <h3 className="text-xl font-black text-slate-900 leading-tight border-b border-gray-100 pb-3">
            {lang === "en" ? notice.titleEn : notice.titleNp}
          </h3>

          {/* Render Text details */}
          {showText && (notice.bodyEn || notice.bodyNp) && (
            <p className="text-sm text-slate-700 leading-relaxed font-sans bg-amber-50/50 p-4 rounded-xl border border-amber-100/60 whitespace-pre-line italic">
              {lang === "en" ? notice.bodyEn : notice.bodyNp}
            </p>
          )}

          {/* Render A4 size Image to fill shown screen as requested */}
          {showImage && notice.imageUrl && (
            <div className="w-full flex justify-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
              <img
                src={notice.imageUrl}
                alt="A4 Notice"
                className="w-full max-h-[480px] object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Footer Dismissal */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-md"
          >
            {lang === "en" ? "Close Notice" : "विवरण बुझें"}
          </button>
        </div>
      </div>
    </div>
  );
}
