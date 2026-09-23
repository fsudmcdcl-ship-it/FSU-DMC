import React, { useState, useEffect } from "react";
import { BlogItem } from "../types";
import ExpandableText from "./ExpandableText";
import { Calendar, User, Share2, Eye, X, Check } from "lucide-react";

interface BlogsSectionProps {
  blogs: BlogItem[];
  lang?: "en" | "np";
  selectedBlogId: string | null;
  setSelectedBlogId: (id: string | null) => void;
}

export default function BlogsSection({
  blogs,
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

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const activeBlogs = blogs.filter((b) => !b.status || b.status === "published");
  const selectedBlog = blogs.find((b) => b.id === selectedBlogId);

  return (
    <div className="w-full">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-red-700 block mb-1">
          STUDENT VOICES
        </span>
        <h3 className="text-2xl font-serif font-black text-slate-900 mb-3">
          Student Blogs & Articles
        </h3>
        <p className="text-sm text-slate-500">
          Original essays, research notes, and creative perspectives from the student body of Darchula Multiple Campus.
        </p>
      </div>

      {/* 3-Column Grid of Blogs */}
      {activeBlogs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200">
          <p className="text-gray-400 font-mono text-xs">No blogs or articles published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBlogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => handleSelectBlog(blog.id)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={
                      blog.imageUrl ||
                      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600"
                    }
                    alt={blog.headingEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 font-medium">
                    <User className="w-3.5 h-3.5 text-red-700" />
                    <span>{blog.authorEn}</span>
                  </div>
                  <h4 className="font-serif font-black text-slate-900 text-lg leading-snug group-hover:text-red-700 transition line-clamp-2 mb-3">
                    {blog.headingEn}
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                    {blog.bodyEn}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read Article</span>
                </span>

                <button
                  onClick={(e) => handleShare(e, blog.id)}
                  title="Share link"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                >
                  {copiedId === blog.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL BLOG DETAIL MODAL */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative border border-slate-100">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-red-700" />
                <span>Published: {new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleShare(e, selectedBlog.id)}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedId === selectedBlog.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied URL!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3" />
                      <span>Share</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleSelectBlog(null)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
              <img
                src={
                  selectedBlog.imageUrl ||
                  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600"
                }
                alt={selectedBlog.headingEn}
                className="w-full h-64 object-cover rounded-2xl shadow-sm"
                referrerPolicy="no-referrer"
              />

              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-serif font-black text-slate-900 text-2xl md:text-3xl leading-tight">
                  {selectedBlog.headingEn}
                </h3>
                <div className="flex items-center gap-2 mt-3 text-xs text-red-700 font-bold uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  <span>Author: {selectedBlog.authorEn}</span>
                </div>
              </div>

              <div className="text-sm md:text-base text-slate-700 leading-relaxed font-sans">
                <ExpandableText text={selectedBlog.bodyEn} maxLines={11} />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSelectBlog(null)}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
