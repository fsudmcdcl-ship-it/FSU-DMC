import React, { useState } from "react";
import { DownloadItem } from "../types";
import DownloadsSection from "../components/DownloadsSection";
import { BookOpen, Search, Download, ExternalLink, GraduationCap, ShieldCheck } from "lucide-react";

interface SyllabusPageProps {
  downloads: DownloadItem[];
}

export default function SyllabusPage({ downloads }: SyllabusPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Curriculum & Study Materials
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white">
            Syllabus, Curriculum & Notes Deck
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Directly access and download accredited syllabus course outlines, model question papers, semester guides, and lecture notes for BBS, B.Ed, and BA degrees under{" "}
            <a
              href="https://fwu.edu.np"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 font-semibold underline decoration-amber-400/60 transition-colors"
            >
              Farwestern University
            </a>
            .
          </p>
        </div>
      </div>

      {/* Main Downloads Deck */}
      <DownloadsSection downloads={downloads} />

      {/* Direct Curriculum Resources */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-red-700" />
          <h2 className="text-xl font-serif font-black text-slate-900">
            Farwestern University Examination & Curriculum Resources
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Faculty of Management (BBS / MBS)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              4-Year Bachelor of Business Studies curriculum, accounting guidelines, taxation laws, and internship manuals.
            </p>
            <a
              href="https://fwu.edu.np"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:underline pt-2"
            >
              <span>FWU Management Board</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Faculty of Education (B.Ed / M.Ed)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Teaching practice manuals, pedagogy course guides, educational evaluation frameworks, and lesson planning templates.
            </p>
            <a
              href="https://fwu.edu.np"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:underline pt-2"
            >
              <span>FWU Education Board</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Humanities & Social Sciences (BA)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              English literature anthologies, economics references, rural development readings, and sociology course papers.
            </p>
            <a
              href="https://fwu.edu.np"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:underline pt-2"
            >
              <span>FWU Humanities Board</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
