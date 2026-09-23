import React, { useState, useRef } from "react";
import { CourseItem } from "../types";
import ExpandableText from "./ExpandableText";
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
} from "lucide-react";

interface CoursesCarouselProps {
  courses: CourseItem[];
  onSelectCourse: (course: CourseItem) => void;
  onNavigateToCourses?: () => void;
}

export default function CoursesCarousel({
  courses,
  onSelectCourse,
  onNavigateToCourses,
}: CoursesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sortedCourses = [...courses].sort((a, b) => (a.order || 0) - (b.order || 0));

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (courses.length === 0) return null;

  return (
    <div className="w-full bg-slate-50/60 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      {/* Carousel Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-950 font-bold text-xs uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Academic Programs</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
            Offered Academic Courses & Faculties
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Undergraduate and postgraduate degree programs affiliated with Farwestern University, designed for academic excellence.
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onNavigateToCourses && (
            <button
              onClick={onNavigateToCourses}
              className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 mr-3 hover:underline cursor-pointer"
            >
              <span>View All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-blue-950 transition shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Courses"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-blue-950 transition shadow-2xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Next Courses"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sliding Track */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {sortedCourses.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectCourse(c)}
            className="w-[290px] sm:w-[330px] shrink-0 snap-start bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
          >
            {/* Image Header */}
            <div className="relative h-44 overflow-hidden bg-slate-100">
              {c.imageUrl ? (
                <img
                  src={c.imageUrl}
                  alt={c.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 flex flex-col items-center justify-center text-amber-400 gap-2">
                  <GraduationCap className="w-12 h-12" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                    {c.level || "Degree Program"}
                  </span>
                </div>
              )}

              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                {c.level && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-sm text-white font-mono">
                    {c.level}
                  </span>
                )}
              </div>

              {c.duration && (
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs font-mono">
                  <Clock className="w-3 h-3 text-blue-900" />
                  <span>{c.duration}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                {c.faculty && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                    {c.faculty}
                  </span>
                )}
                <h4 className="font-serif font-black text-slate-900 text-base leading-snug group-hover:text-blue-900 transition line-clamp-2">
                  {c.titleEn}
                </h4>
                {c.titleNp && (
                  <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {c.titleNp}
                  </p>
                )}

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2.5">
                  {c.descriptionEn}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 group-hover:text-blue-950 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Course Info</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-slate-400 font-mono">FWU Affiliated</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
