import React, { useState, useEffect, useRef } from "react";
import { NewsItem } from "../types";
import { Calendar, FileText, ChevronRight, Eye, X } from "lucide-react";

interface NewsSectionProps {
  news: NewsItem[];
  lang?: "en" | "np";
  selectedNewsId: string | null;
  setSelectedNewsId: (id: string | null) => void;
}

export default function NewsSection({
  news,
  selectedNewsId,
  setSelectedNewsId,
}: NewsSectionProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the horizontal deck
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || news.length <= 1) return;

    let animId: number;
    const scrollSpeed = 0.5;

    const step = () => {
      if (el) {
        el.scrollLeft += scrollSpeed;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [news]);

  const sortedNews = [...news].sort((a, b) => b.createdAt - a.createdAt);
  const verticalNewsList = sortedNews.slice(0, 6);
  const selectedNews = news.find((n) => n.id === selectedNewsId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left / Main Side: 6 Recent News List (Vertical) */}
      <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-serif font-black text-slate-900 mb-6 flex items-center gap-2 border-l-4 border-blue-900 pl-3">
          <FileText className="w-5 h-5 text-blue-900" />
          <span>Recent News & Notices</span>
        </h3>

        {news.length === 0 ? (
          <p className="text-gray-500 font-mono text-xs py-4">
            No news or notices published yet.
          </p>
        ) : (
          <div className="space-y-4">
            {verticalNewsList.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedNewsId(item.id)}
                className="group p-4 bg-slate-50/60 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200/50 rounded-2xl transition duration-200 cursor-pointer flex flex-col sm:flex-row gap-4 items-start"
              >
                <div className="bg-red-50 text-red-700 border border-red-100 font-bold px-3 py-1.5 rounded-xl text-xs font-mono self-start shrink-0">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-900 transition line-clamp-2">
                    {item.headingEn}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.bodyEn}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-900 transition shrink-0 hidden sm:block self-center animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Show More Button */}
        {news.length > 6 && (
          <button
            onClick={() => setShowAllModal(true)}
            className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-blue-900" />
            <span>Show All Announcements</span>
          </button>
        )}
      </div>

      {/* Right Side / Horizontal Scrolling Preview Deck */}
      <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-serif font-black text-slate-900 mb-4 flex items-center gap-2 border-l-4 border-red-700 pl-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-700 animate-pulse" />
          <span>Notice Preview Deck</span>
        </h3>

        <div
          ref={scrollRef}
          className="w-full flex flex-col gap-4 overflow-x-auto select-none max-h-[360px] overflow-y-hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {news.length === 0 ? (
            <p className="text-gray-400 text-xs py-4 font-mono">No notices.</p>
          ) : (
            <div className="flex gap-4 w-max py-2">
              {[...news, ...news].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => setSelectedNewsId(item.id)}
                  className="w-56 bg-slate-50/60 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200/50 p-4 rounded-2xl shrink-0 transition duration-200 cursor-pointer shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] text-red-700 font-bold uppercase tracking-wider block mb-1">
                      🔔 NOTICE BOARD
                    </span>
                    <h5 className="font-bold text-xs text-slate-800 line-clamp-3 leading-snug">
                      {item.headingEn}
                    </h5>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-2 font-mono block">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-[11px] text-center text-gray-400 mt-3 italic">
          ← Auto-sliding deck. Click cards to view details →
        </p>
      </div>

      {/* FULL NEWS ARCHIVE MODAL */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="text-xl font-serif font-black text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-400" />
                <span>FSU Notices & Announcements Archive</span>
              </h3>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {sortedNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedNewsId(item.id);
                    setShowAllModal(false);
                  }}
                  className="p-4 border border-slate-100 bg-slate-50 hover:bg-blue-50/40 rounded-2xl cursor-pointer transition flex justify-between items-start"
                >
                  <div>
                    <span className="text-xs text-gray-400 font-mono block mb-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <h4 className="font-bold text-slate-900 leading-snug">
                      {item.headingEn}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {item.bodyEn}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL NEWS DETAILS MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-widest">
                📰 NOTICE DETAILS
              </span>
              <button
                onClick={() => setSelectedNewsId(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {selectedNews.imageUrl && (
                <img
                  src={selectedNews.imageUrl}
                  alt={selectedNews.headingEn}
                  className="w-full max-h-80 object-cover rounded-2xl shadow-sm border border-slate-100"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(selectedNews.createdAt).toLocaleString()}
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-black text-slate-900 leading-tight">
                {selectedNews.headingEn}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100/60 font-sans">
                {selectedNews.bodyEn}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
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
    </div>
  );
}
