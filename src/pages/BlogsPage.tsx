import React from "react";
import { BlogItem } from "../types";
import BlogsSection from "../components/BlogsSection";
import { BookOpen, PenTool, ExternalLink, Sparkles } from "lucide-react";

interface BlogsPageProps {
  blogs: BlogItem[];
  selectedBlogId: string | null;
  setSelectedBlogId: (id: string | null) => void;
}

export default function BlogsPage({
  blogs,
  selectedBlogId,
  setSelectedBlogId,
}: BlogsPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            Student Literary & Editorial Column
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white">
            Student Blogs & Thought Leadership
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Essays, research articles, regional socio-economic reflections, and literary works penned by the active student scholars of Darchula Multiple Campus, affiliated with{" "}
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

      {/* Blogs Section */}
      <BlogsSection
        blogs={blogs}
        selectedBlogId={selectedBlogId}
        setSelectedBlogId={setSelectedBlogId}
      />

      {/* Write for FSU Banner */}
      <div className="bg-gradient-to-br from-red-700 to-red-800 text-white p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Call for Student Submissions
          </div>
          <h3 className="text-2xl font-serif font-black">Want to Publish Your Article or Research?</h3>
          <p className="text-xs text-red-100 max-w-xl leading-relaxed">
            All students enrolled in BBS, B.Ed, and BA are encouraged to submit original articles, field studies, poetry, or regional essays to the FSU Editorial Desk at{" "}
            <a href="mailto:info@fsudmc.com" className="font-bold underline text-white">info@fsudmc.com</a>.
          </p>
        </div>

        <a
          href="mailto:info@fsudmc.com?subject=Student Blog Article Submission"
          className="px-6 py-3 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs uppercase tracking-wider transition shadow-sm shrink-0"
        >
          Submit Article via Email
        </a>
      </div>
    </div>
  );
}
