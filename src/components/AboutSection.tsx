import React, { useState } from "react";
import { GeneralSettings } from "../types";
import { Award, GraduationCap, ArrowRight, X } from "lucide-react";

interface AboutSectionProps {
  settings: GeneralSettings;
  lang: "en" | "np";
}

export default function AboutSection({ settings, lang }: AboutSectionProps) {
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalImage, setModalImage] = useState("");

  const handleReadMore = (title: string, body: string, image: string) => {
    setModalTitle(title);
    setModalBody(body);
    setModalImage(image);
  };

  return (
    <div className="space-y-16">
      {/* Segment 1: About Free Student Union */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Campus/Union Image */}
        <div className="lg:col-span-5 relative group h-64 md:h-80 overflow-hidden rounded-2xl shadow-sm">
          <img
            src={settings?.aboutFsuImg || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800"}
            alt="About FSU"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-red-950/10 pointer-events-none" />
          <div className="absolute top-4 left-4 bg-red-700 text-white p-2.5 rounded-xl shadow-lg">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-700 block mb-2">
              {lang === "en" ? "REPRESENTATIVE BODY" : "विद्यार्थी संगठन"}
            </span>
            <h3 className="text-xl md:text-2xl font-serif font-black text-slate-900 mb-4 leading-tight">
              {lang === "en" ? "ABOUT FREE STUDENT UNION" : "स्वतन्त्र विद्यार्थी युनियन बारे"}
            </h3>
            {/* Clamped to exactly 6 lines of preview */}
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-[6] whitespace-pre-line mb-6 font-sans">
              {lang === "en"
                ? (settings?.aboutFsuEn || "No data.")
                : (settings?.aboutFsuNp || "विवरण उपलब्ध छैन।")}
            </p>
          </div>

          <button
            onClick={() =>
              handleReadMore(
                lang === "en" ? "About Free Student Union" : "स्वतन्त्र विद्यार्थी युनियन बारे",
                lang === "en" ? settings?.aboutFsuEn : settings?.aboutFsuNp,
                settings?.aboutFsuImg
              )
            }
            className="self-start px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-red-100 flex items-center gap-2 group/btn cursor-pointer"
          >
            <span>{lang === "en" ? "Read More" : "थप हेर्नुहोस्"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Segment 2: About Campus */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Campus Image */}
        <div className="lg:col-span-5 relative group h-64 md:h-80 overflow-hidden rounded-2xl shadow-sm">
          <img
            src={settings?.aboutCampusImg || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800"}
            alt="About Campus"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
          <div className="absolute top-4 left-4 bg-blue-900 text-white p-2.5 rounded-xl shadow-lg">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-900 block mb-2">
              {lang === "en" ? "ACADEMIC INSTITUTION AFFILIATED TO TU" : "शैक्षिक प्रतिष्ठान"}
            </span>
            <h3 className="text-xl md:text-2xl font-serif font-black text-slate-900 mb-4 leading-tight">
              {lang === "en" ? "ABOUT DARCHULA MULTIPLE CAMPUS" : "दार्चुला बहुमुखी क्याम्पस बारे"}
            </h3>
            {/* Clamped to exactly 6 lines of preview */}
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-[6] whitespace-pre-line mb-6 font-sans">
              {lang === "en"
                ? (settings?.aboutCampusEn || "No data.")
                : (settings?.aboutCampusNp || "विवरण उपलब्ध छैन।")}
            </p>
          </div>

          <button
            onClick={() =>
              handleReadMore(
                lang === "en" ? "About Darchula Multiple Campus" : "दार्चुला बहुमुखी क्याम्पस बारे",
                lang === "en" ? settings?.aboutCampusEn : settings?.aboutCampusNp,
                settings?.aboutCampusImg
              )
            }
            className="self-start px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-blue-100 flex items-center gap-2 group/btn cursor-pointer"
          >
            <span>{lang === "en" ? "Read More" : "थप हेर्नुहोस्"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* FULL ABOUT DETAIL MODAL */}
      {modalTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative border border-slate-100">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h4 className="text-lg font-serif font-black text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <span>{modalTitle}</span>
              </h4>
              <button
                onClick={() => setModalTitle("")}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable text details */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <img
                src={modalImage}
                alt={modalTitle}
                className="w-full h-64 object-cover rounded-2xl border border-slate-100 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line font-sans p-5 bg-slate-50 rounded-2xl border border-slate-100/60">
                {modalBody}
              </p>
            </div>

            {/* Footer closure */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalTitle("")}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                {lang === "en" ? "Close" : "बन्द गर्नुहोस्"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
