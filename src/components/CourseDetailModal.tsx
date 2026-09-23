import React from "react";
import { CourseItem } from "../types";
import ExpandableText from "./ExpandableText";
import {
  X,
  GraduationCap,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  Briefcase,
  HelpCircle,
  ExternalLink,
  Share2,
  Check,
} from "lucide-react";

interface CourseDetailModalProps {
  course: CourseItem | null;
  onClose: () => void;
}

export default function CourseDetailModal({
  course,
  onClose,
}: CourseDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!course) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/courses?course=${course.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative border border-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-400 text-slate-950">
              <GraduationCap className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-widest">
              ACADEMIC DEGREE PROGRAM
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Top Banner with Image and Meta */}
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {course.imageUrl ? (
              <img
                src={course.imageUrl}
                alt={course.titleEn}
                className="w-full sm:w-56 h-48 sm:h-56 object-cover rounded-2xl border border-slate-200 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-full sm:w-56 h-48 sm:h-56 bg-gradient-to-br from-blue-900 to-slate-900 text-amber-400 rounded-2xl flex flex-col items-center justify-center gap-2 shrink-0 border border-slate-200">
                <GraduationCap className="w-16 h-16" />
                <span className="text-xs font-bold text-white font-mono">DMC Academic</span>
              </div>
            )}

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {course.level && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                    {course.level}
                  </span>
                )}
                {course.faculty && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    {course.faculty}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 leading-tight">
                  {course.titleEn}
                </h2>
                {course.titleNp && (
                  <p className="text-base text-slate-600 font-medium mt-1">
                    {course.titleNp}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-blue-900 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Duration</span>
                    <span className="font-bold text-slate-800">{course.duration || "4 Years"}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Affiliation</span>
                    <span className="font-bold text-slate-800">Farwestern University</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Overview */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-900" />
              <span>Program Overview & Academic Structure</span>
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 font-sans">
              <ExpandableText text={course.descriptionEn} maxLines={11} />
            </div>
          </div>

          {/* Eligibility Criteria */}
          {course.eligibilityEn && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Admission Eligibility Criteria</span>
              </h3>
              <div className="text-sm text-slate-700 leading-relaxed bg-emerald-50/40 p-5 rounded-2xl border border-emerald-200/70 font-sans">
                <ExpandableText text={course.eligibilityEn} maxLines={11} />
              </div>
            </div>
          )}

          {/* Career Prospects & Scope */}
          {course.careerProspects && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-700" />
                <span>Career Prospects & Industry Scope</span>
              </h3>
              <div className="text-sm text-slate-700 leading-relaxed bg-purple-50/40 p-5 rounded-2xl border border-purple-200/70 font-sans">
                <ExpandableText text={course.careerProspects} maxLines={11} />
              </div>
            </div>
          )}

          {/* Admissions Assistance Note */}
          <div className="bg-blue-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm">Need Admission Information or Syllabus?</h4>
              <p className="text-xs text-blue-100 mt-0.5">
                Contact the FSU Helpdesk or DMC Academic Administration at 9741823122 / 9848792083.
              </p>
            </div>
            <a
              href="#contact"
              onClick={onClose}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition shrink-0"
            >
              Inquire Now
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition hover:bg-slate-100 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Program</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
