import React from "react";
import {
  FileQuestion,
  Home,
  ArrowLeft,
  BookOpen,
  Users,
  MessageSquare,
  PhoneCall,
  GraduationCap,
  FileText,
  LifeBuoy,
  Search,
} from "lucide-react";
import { RouteType } from "../App";

interface NotFoundPageProps {
  attemptedSlug?: string;
  onNavigate: (route: RouteType) => void;
}

export default function NotFoundPage({ attemptedSlug, onNavigate }: NotFoundPageProps) {
  const currentPath =
    attemptedSlug ||
    (typeof window !== "undefined"
      ? window.location.pathname + window.location.hash
      : "/unknown");

  const quickLinks: {
    title: string;
    description: string;
    route: RouteType;
    icon: React.ElementType;
  }[] = [
    {
      title: "Homepage",
      description: "Return to the main campus and FSU landing hub",
      route: "home",
      icon: Home,
    },
    {
      title: "Syllabus & Notes",
      description: "Curriculums, lecture notes & academic downloads",
      route: "syllabus-notes",
      icon: BookOpen,
    },
    {
      title: "FSU Executive Team",
      description: "Meet current student union representatives",
      route: "fsu-team",
      icon: Users,
    },
    {
      title: "Student Blogs",
      description: "Read articles, opinions & campus publications",
      route: "student-blogs",
      icon: FileText,
    },
    {
      title: "FSU Helpdesk",
      description: "Student admission, exam & inquiry assistance",
      route: "fsu-helpdesk",
      icon: LifeBuoy,
    },
    {
      title: "Professors & Faculty",
      description: "Academic department heads & teaching faculty",
      route: "professors",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="min-h-[75vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full mx-auto text-center">
        {/* Visual Badge & Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100/80 text-red-700 shadow-inner mb-6 border border-red-200">
          <FileQuestion className="w-10 h-10 stroke-[2.2]" />
        </div>

        {/* 404 Headline */}
        <div className="inline-block px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-black uppercase tracking-widest rounded-full mb-3">
          Error 404 &bull; Page Not Found
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-blue-950 tracking-tight mb-4">
          Oops! That page doesn't exist.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-5 leading-relaxed">
          The requested address or slug could not be located on the official
          Darchula Multiple Campus Free Student Union portal.
        </p>

        {/* Slug Display Pill */}
        {currentPath && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl shadow-sm text-xs md:text-sm font-mono text-slate-700 mb-8 max-w-full overflow-hidden text-ellipsis">
            <span className="text-slate-400 font-sans font-medium">Attempted URL:</span>
            <span className="font-bold text-red-700 truncate">{currentPath}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            type="button"
            id="btn-404-home"
            onClick={() => onNavigate("home")}
            className="px-6 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Go to Homepage</span>
          </button>

          <button
            type="button"
            id="btn-404-back"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                onNavigate("home");
              }
            }}
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-sm tracking-wide shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <button
            type="button"
            id="btn-404-helpdesk"
            onClick={() => onNavigate("fsu-helpdesk")}
            className="px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Contact Helpdesk</span>
          </button>
        </div>

        {/* Suggested Helpful Sections */}
        <div className="border-t border-slate-200/80 pt-10 text-left">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 text-center sm:text-left">
            Popular & Valid Campus Directory Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.route}
                  type="button"
                  id={`link-404-${item.route}`}
                  onClick={() => onNavigate(item.route)}
                  className="p-4 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200/90 hover:border-blue-300 transition-all text-left shadow-xs hover:shadow-sm group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-blue-950 group-hover:text-red-700 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-blue-950 group-hover:text-red-700 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
