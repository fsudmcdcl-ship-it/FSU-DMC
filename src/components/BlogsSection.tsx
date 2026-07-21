import React, { useState, useEffect } from "react";
import { BlogItem } from "../types";
import { Calendar, User, Share2, Eye, X, Check } from "lucide-react";

interface BlogsSectionProps {
  blogs: BlogItem[];
  lang: "en" | "np";
  selectedBlogId: string | null;
  setSelectedBlogId: (id: string | null) => void;
}

export default function BlogsSection({
  blogs,
  lang,
  selectedBlogId,
  setSelectedBlogId,
}: BlogsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Deep linking logic on mount and whenever URL query param changes
  useEffect(() => {
    const handleUrlQuery = () => {
      const params = new URLSearchParams(window.location.search);
      const blogId = params.get("blog");
      if (blogId && blogs.some((b) => b.id === blogId)) {
        setSelectedBlogId(blogId);
      }
    };

    handleUrlQuery();
    window.addEventListener("popstate", handleUrlQuery);
    return () => window.removeEventListener("popstate", handleUrlQuery);
  }, [blogs, setSelectedBlogId]);

  // Update URL parameter when selectedBlogId changes
  const handleSelectBlog = (id: string | null) => {
    setSelectedBlogId(id);
    const newUrl = new URL(window.location.href);
    if (id) {
      newUrl.searchParams.set("blog", id);
    } else {
      newUrl.searchParams.delete("blog");
    }
    window.history.pushState({}, "", newUrl.toString());
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?blog=${id}`;
    
    // Copy to Clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const selectedBlog = blogs.find((b) => b.id === selectedBlogId);

  return (
    <div className="w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-red-700 block mb-1">
          {lang === "en" ? "STUDENT VOICES" : "विद्यार्थी विचार स्तम्भ"}
        </span>
        <h3 className="text-2xl font-serif font-black text-slate-900 mb-3">
          {lang === "en" ? "Student Blogs & Articles" : "विद्यार्थीका रचना तथा ब्लगहरू"}
        </h3>
        <p className="text-sm text-slate-500">
          {lang === "en"
            ? "Creative writings, socio-economic essays, and border-mountain literature written by students of Darchula Multiple Campus."
            : "दार्चुला बहुमुखी क्याम्पसका विद्यार्थीहरूद्वारा लिखित समसामयिक, सांस्कृतिक तथा विविध विधाका रचनाहरू।"}
        </p>
      </div>

      {blogs.length === 0 ? (
        <p className="text-center text-slate-500 font-mono text-sm py-12 bg-white rounded-3xl border border-slate-100">
          No blog articles written by students yet. Upload articles using the CMS.
        </p>
      ) : (
        /* Grid displaying Heading and Image only in preview as requested! */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => handleSelectBlog(blog.id)}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Image Preview */}
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                <img
                  src={blog.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600"}
                  alt={blog.headingEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>

              {/* Title / Heading Preview only */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900 group-hover:text-red-700 transition line-clamp-2 leading-snug mb-4">
                    {lang === "en" ? blog.headingEn : blog.headingNp}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    By {lang === "en" ? blog.authorEn : blog.authorNp}
                  </span>

                  {/* Share button */}
                  <button
                    onClick={(e) => handleShare(e, blog.id)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-700 border border-slate-100 transition flex items-center gap-1 text-xs font-semibold relative cursor-pointer"
                    title="Copy Shareable Deep Link"
                  >
                    {copiedId === blog.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-red-700" />
                        <span className="text-red-700 text-[10px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] text-slate-600">Share</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL BLOG DETAIL MODAL */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative border border-slate-100">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-widest">
                📝 STUDENT ARTICLE VIEW
              </span>
              <button
                onClick={() => handleSelectBlog(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Blog details */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {selectedBlog.imageUrl && (
                <img
                  src={selectedBlog.imageUrl}
                  alt={selectedBlog.headingEn}
                  className="w-full max-h-[320px] object-cover rounded-2xl shadow-sm border border-slate-100"
                  referrerPolicy="no-referrer"
                />
              )}

              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-950 leading-tight">
                  {lang === "en" ? selectedBlog.headingEn : selectedBlog.headingNp}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-700">
                    <User className="w-3.5 h-3.5 text-red-700" />
                    By: {lang === "en" ? selectedBlog.authorEn : selectedBlog.authorNp}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-red-700" />
                    {new Date(selectedBlog.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-sm md:text-base text-slate-700 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100/60">
                {lang === "en" ? selectedBlog.bodyEn : selectedBlog.bodyNp}
              </p>
            </div>

            {/* Modal Footer (with Share option) */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={(e) => handleShare(e, selectedBlog.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200 cursor-pointer"
              >
                {copiedId === selectedBlog.id ? (
                  <>
                    <Check className="w-4 h-4 text-red-700 animate-bounce" />
                    <span>Deep Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copy Shareable Link</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleSelectBlog(null)}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                {lang === "en" ? "Done" : "भयो"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
