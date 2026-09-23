import React, { useState } from "react";
import { NewsItem, GeneralSettings } from "../types";
import ExpandableText from "./ExpandableText";
import {
  Calendar,
  FileText,
  ChevronRight,
  Eye,
  X,
  Landmark,
  GraduationCap,
  Award,
  Facebook,
  ExternalLink,
  ImageIcon,
} from "lucide-react";

interface NewsSectionProps {
  news: NewsItem[];
  settings?: GeneralSettings;
  lang?: "en" | "np";
  selectedNewsId: string | null;
  setSelectedNewsId: (id: string | null) => void;
}

export default function NewsSection({
  news,
  settings,
  selectedNewsId,
  setSelectedNewsId,
}: NewsSectionProps) {
  const [showAllModal, setShowAllModal] = useState(false);

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

      {/* Right Side: History of DMC Box */}
      <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          {/* Header with Landmark Icon and Established Year Badge */}
          <div className="flex items-center justify-between gap-2 mb-4 border-l-4 border-red-700 pl-3">
            <h3 className="text-lg font-serif font-black text-slate-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-red-700 shrink-0" />
              <span>{settings?.dmcHistoryHeading || "History of DMC"}</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/80 px-2.5 py-1 rounded-full shrink-0">
              {settings?.dmcEstYear || "Est. 2062 B.S."}
            </span>
          </div>

          {/* History Narrative */}
          <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
            <p className="whitespace-pre-line text-slate-700">
              {settings?.dmcHistoryText ||
                "Darchula Multiple Campus (DMC), established in 2062 B.S. (2005 A.D.), stands as the premier higher education beacon in the far-western Himalayan district of Darchula, Nepal. Affiliated with Farwestern University (FWU), the campus was established through the collective vision and commitment of dedicated local educators, social pioneers, and intellectuals to bring accessible university education to remote mountain youth.\n\nOver the past two decades, DMC has cultivated hundreds of graduates in Education, Humanities, and Management streams, transforming academic access across Darchula and surrounding Himalayan regions."}
            </p>
          </div>

          {/* Institutional Highlights */}
          <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-slate-100 text-[11px] font-medium text-slate-700">
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-900 shrink-0" />
              <span className="truncate">FWU Affiliation</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-2">
              <Award className="w-4 h-4 text-red-700 shrink-0" />
              <span className="truncate">Mountain Pioneer</span>
            </div>
          </div>
        </div>

        {/* Facebook Profile Connection Card / Link */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Connect & Campus Updates
          </div>
          <a
            id="link-dmc-facebook-profile"
            href={
              settings?.dmcFacebookProfileUrl ||
              settings?.fbCampusPage ||
              "https://facebook.com/DarchulaMultipleCampusOfficial"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-3.5 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-200/80 hover:border-blue-300 rounded-2xl transition-all duration-200 group text-blue-950 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <Facebook className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-950 flex items-center gap-1">
                  <span>
                    {settings?.dmcFacebookButtonText || "DMC Official Facebook"}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-900" />
                </div>
                <div className="text-[10px] text-slate-500">
                  Daily announcements, events & student notices
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#1877F2] px-2.5 py-1 bg-white rounded-lg border border-blue-100 shadow-2xs shrink-0 group-hover:translate-x-0.5 transition-transform">
              Visit &rarr;
            </span>
          </a>
        </div>
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

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Attached Images Gallery - Natural Aspect Ratio */}
              {((selectedNews.images && selectedNews.images.length > 0) || selectedNews.imageUrl) && (
                <div className="space-y-3">
                  {(selectedNews.images && selectedNews.images.length > 0
                    ? selectedNews.images
                    : [selectedNews.imageUrl!]
                  ).map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2 flex items-center justify-center overflow-hidden"
                    >
                      <img
                        src={imgUrl}
                        alt={`${selectedNews.headingEn} - Image ${idx + 1}`}
                        className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-xs"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-blue-900" />
                  {new Date(selectedNews.createdAt).toLocaleString()}
                </span>
                {selectedNews.images && selectedNews.images.length > 1 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full font-mono">
                    {selectedNews.images.length} Attached Images
                  </span>
                )}
              </div>

              <h3 className="text-xl md:text-2xl font-serif font-black text-slate-900 leading-tight">
                {selectedNews.headingEn}
              </h3>

              <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100/80 font-sans">
                <ExpandableText text={selectedNews.bodyEn} maxLines={11} />
              </div>
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
