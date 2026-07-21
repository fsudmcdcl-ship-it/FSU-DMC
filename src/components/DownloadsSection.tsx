import React, { useState } from "react";
import { DownloadItem } from "../types";
import { FileText, Download, Search, ExternalLink } from "lucide-react";

interface DownloadsSectionProps {
  downloads: DownloadItem[];
  lang: "en" | "np";
}

export default function DownloadsSection({ downloads, lang }: DownloadsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDownloads = downloads.filter((item) => {
    const title = lang === "en" ? item.titleEn : item.titleNp;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-700 block mb-1">
            {lang === "en" ? "ACADEMIC PORTAL" : "शैक्षिक सामग्री"}
          </span>
          <h3 className="text-xl font-serif font-black text-slate-900">
            {lang === "en" ? "Syllabus, Curriculum & Notes Deck" : "पाठ्यक्रम, निर्देशिका तथा नोटहरू"}
          </h3>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={lang === "en" ? "Search resources..." : "सामाग्री खोज्नुहोस्..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-700 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Downloads List Table/Deck */}
      {filteredDownloads.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
          <p className="text-gray-500 font-mono text-sm">
            {searchQuery
              ? (lang === "en" ? "No matches found." : "कुनै नतिजा भेटिएन।")
              : (lang === "en" ? "No syllabus or notes uploaded yet." : "कुनै सामग्री उपलब्ध छैन।")}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">{lang === "en" ? "Document Title" : "शीर्षक"}</th>
                  <th className="py-3 px-4">{lang === "en" ? "Source Type" : "स्रोत प्रकार"}</th>
                  <th className="py-3 px-4 text-right">{lang === "en" ? "Action" : "कार्य"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDownloads.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-blue-900 shrink-0" />
                      <span>{lang === "en" ? item.titleEn : item.titleNp}</span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">
                      {item.isDriveLink ? (
                        <span className="bg-blue-50 text-blue-900 px-2.5 py-1 rounded-md font-sans font-bold uppercase tracking-wider text-[9px] border border-blue-100">
                          Google Drive Link
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md font-sans font-bold uppercase tracking-wider text-[9px] border border-red-100">
                          PDF / Attachment
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 active:scale-95 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        {item.isDriveLink ? (
                          <>
                            <span>Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>Download</span>
                            <Download className="w-3.5 h-3.5" />
                          </>
                        )}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warning Tip */}
      <div className="mt-4 text-[11px] text-gray-400 italic">
        {lang === "en"
          ? "* Note: Google Drive folders are public. If a link fails, contact the FSU Helpdesk."
          : "* नोट: सार्वजनिक सामग्री तथा नोटहरू आधिकारिक गुगल ड्राइभबाट सोझै हेर्न सकिन्छ।"}
      </div>
    </div>
  );
}
