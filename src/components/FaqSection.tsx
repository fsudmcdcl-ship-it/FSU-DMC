import React, { useState, useMemo } from "react";
import { FaqItem } from "../types";
import { DEFAULT_DB_STATE } from "../lib/defaults";
import {
  ChevronDown,
  HelpCircle,
  Search,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Send,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface FaqSectionProps {
  faqs?: Record<string, FaqItem>;
  onNavigateSecretariat?: () => void;
  onOpenTracker?: () => void;
  onTrackClick?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function FaqSection({
  faqs,
  onNavigateSecretariat,
  onOpenTracker,
  onTrackClick,
  title = "Frequently Asked Questions",
  subtitle = "Quick answers regarding academic syllabi, admissions, examination schedules, and FSU student services at Darchula Multiple Campus.",
  className = "",
}: FaqSectionProps) {
  const handleOpenTracker = onOpenTracker || onTrackClick;
  const [openId, setOpenId] = useState<string | null>("faq_1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Merge provided faqs or fallback to defaults
  const faqList: FaqItem[] = useMemo(() => {
    const source = faqs && Object.keys(faqs).length > 0 ? faqs : DEFAULT_DB_STATE.faqs || {};
    return Object.values(source)
      .filter((item) => item.isPublished !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [faqs]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    faqList.forEach((item) => {
      if (item.category?.trim()) cats.add(item.category.trim());
    });
    return ["All", ...Array.from(cats)];
  }, [faqList]);

  // Filtered FAQs based on category and search query
  const filteredFaqs = useMemo(() => {
    return faqList.filter((item) => {
      const matchesCat =
        selectedCategory === "All" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.questionEn.toLowerCase().includes(query) ||
        item.answerEn.toLowerCase().includes(query) ||
        (item.category && item.category.toLowerCase().includes(query));
      return matchesCat && matchesSearch;
    });
  }, [faqList, selectedCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faqs" className={`py-12 md:py-16 ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
            Student Inquiries & Knowledge Base
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-900">
            {title}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions by keyword (e.g. syllabus, complaint, tracking, exams)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none bg-white text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-bold px-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Categories Pills */}
          {categories.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-blue-950 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accordion Items List */}
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-2">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Matching Questions Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't find an answer matching "{searchQuery}". You can submit a direct inquiry
              to the FSU Secretariat below.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "bg-white border-blue-900/30 shadow-md ring-1 ring-blue-900/10"
                      : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="space-y-1.5 pr-2">
                      {faq.category && (
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-100">
                          {faq.category}
                        </span>
                      )}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {faq.questionEn}
                      </h3>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? "bg-blue-950 text-white rotate-180"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                      <p className="whitespace-pre-line">{faq.answerEn}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Support Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-base sm:text-lg font-serif font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Did not find your answer?
            </h4>
            <p className="text-xs sm:text-sm text-blue-200/90 max-w-xl">
              Submit your specific question, complaint, or appointment request directly to the Free
              Student Union Secretariat. You will get a Tracking ID to check status anytime.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigateSecretariat && (
              <button
                type="button"
                onClick={onNavigateSecretariat}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Contact Secretariat
              </button>
            )}
            {handleOpenTracker && (
              <button
                type="button"
                onClick={handleOpenTracker}
                className="px-4 py-2.5 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider border border-blue-600/60 transition-colors cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                Track Complaint
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
