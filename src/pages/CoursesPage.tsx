import React, { useState, useEffect } from "react";
import { CourseItem } from "../types";
import ExpandableText from "../components/ExpandableText";
import {
  GraduationCap,
  Clock,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
  X,
  Briefcase,
} from "lucide-react";

interface CoursesPageProps {
  courses: CourseItem[];
  onSelectCourse: (course: CourseItem) => void;
}

export default function CoursesPage({
  courses,
  onSelectCourse,
}: CoursesPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");

  const levels = ["All", "Bachelor's Degree", "Master's Degree", "+2 Higher Secondary"];

  // URL query check on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("course");
    if (courseId) {
      const match = courses.find((c) => c.id === courseId);
      if (match) onSelectCourse(match);
    }
  }, [courses, onSelectCourse]);

  const sortedCourses = [...courses].sort((a, b) => (a.order || 0) - (b.order || 0));

  const filteredCourses = sortedCourses.filter((course) => {
    const matchesSearch =
      course.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.titleNp && course.titleNp.includes(searchTerm)) ||
      (course.faculty && course.faculty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      course.descriptionEn.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedLevel === "All") return true;
    return course.level?.toLowerCase().includes(selectedLevel.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            Curriculum & Degree Programs
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white">
            Academic Courses & Faculties
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Discover undergraduate and graduate degree courses offered at Darchula Multiple Campus, Khalanga, Darchula. Affiliated with Farwestern University (FWU).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses by degree title, faculty, keywords..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs font-mono font-bold text-slate-500 self-center">
            Showing <span className="text-blue-950 font-black">{filteredCourses.length}</span> programs
          </div>
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Level:
          </span>
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedLevel === lvl
                  ? "bg-blue-950 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200 space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Courses Match Your Search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or select "All" from the level filter above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCourse(c)}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
            >
              {/* Image & Badges */}
              <div className="relative h-52 overflow-hidden bg-slate-100">
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 flex flex-col items-center justify-center text-amber-400 gap-2">
                    <GraduationCap className="w-14 h-14" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
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
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs font-mono">
                    <Clock className="w-3 h-3 text-blue-900" />
                    <span>{c.duration}</span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {c.faculty && (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                      {c.faculty}
                    </span>
                  )}
                  <h3 className="font-serif font-black text-slate-900 text-lg leading-snug group-hover:text-blue-900 transition">
                    {c.titleEn}
                  </h3>
                  {c.titleNp && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                      {c.titleNp}
                    </p>
                  )}

                  {/* Description preview */}
                  <div
                    className="text-xs text-slate-600 leading-relaxed mt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExpandableText text={c.descriptionEn} maxLines={11} />
                  </div>
                </div>

                {/* Eligibility preview tag if present */}
                {c.eligibilityEn && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 line-clamp-2">
                    <span className="font-bold text-slate-800">Eligibility: </span>
                    {c.eligibilityEn}
                  </div>
                )}

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 group-hover:text-blue-950 flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>Full Program Curriculum & Info</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">FWU</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admission Helpdesk Banner */}
      <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white p-8 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-900">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Sparkles className="w-4 h-4" />
            Admissions & Counseling Open
          </div>
          <h3 className="text-2xl font-serif font-black">
            Want to Enroll in Farwestern University Programs at DMC?
          </h3>
          <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
            Contact the Free Student Union Helpdesk or DMC Academic Administration Desk for entrance examination preparation, fee structures, and scholarship criteria.
          </p>
        </div>

        <a
          href="tel:9741823122"
          className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-sm shrink-0"
        >
          Call Helpdesk: 9741823122
        </a>
      </div>
    </div>
  );
}
