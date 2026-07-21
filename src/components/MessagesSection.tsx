import React, { useState } from "react";
import { GeneralSettings } from "../types";
import { Quote, X } from "lucide-react";

interface MessagesSectionProps {
  settings: GeneralSettings;
  lang: "en" | "np";
}

export default function MessagesSection({ settings, lang }: MessagesSectionProps) {
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalPhoto, setModalPhoto] = useState("");

  const handleReadMore = (title: string, name: string, body: string, photo: string) => {
    setModalTitle(title);
    setModalName(name);
    setModalBody(body);
    setModalPhoto(photo);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Box 1: Message from FSU President */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-lg transition relative overflow-hidden">
        {/* Subtle decorative quotation mark */}
        <Quote className="absolute right-6 top-6 w-16 h-16 text-emerald-100 -z-0 pointer-events-none" />

        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 block mb-3">
            {lang === "en" ? "FSU MESSAGE BOARD" : "स्ववियु सन्देश स्तम्भ"}
          </span>
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
            {lang === "en" ? "Message From FSU President" : "स्ववियु सभापतिको सन्देश"}
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={settings?.presidentPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"}
              alt="FSU President"
              className="w-16 h-16 rounded-full object-cover shadow-inner border-2 border-emerald-500"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="font-extrabold text-gray-900">
                {lang === "en" ? settings?.presidentNameEn : settings?.presidentNameNp}
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                {lang === "en" ? "President, Free Student Union" : "सभापति, स्वतन्त्र विद्यार्थी युनियन"}
              </p>
            </div>
          </div>

          {/* Clamped to exactly 5 lines of preview */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-[5] mb-6 font-sans whitespace-pre-line italic">
            "{lang === "en" ? settings?.presidentMessageEn : settings?.presidentMessageNp}"
          </p>
        </div>

        <button
          onClick={() =>
            handleReadMore(
              lang === "en" ? "Message From FSU President" : "स्ववियु सभापतिको सन्देश",
              lang === "en" ? settings?.presidentNameEn : settings?.presidentNameNp,
              lang === "en" ? settings?.presidentMessageEn : settings?.presidentMessageNp,
              settings?.presidentPhoto
            )
          }
          className="self-start px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 font-bold text-xs uppercase tracking-wider transition-all"
        >
          {lang === "en" ? "Read Message" : "सन्देश पढ्नुहोस्"}
        </button>
      </div>

      {/* Box 2: Message from Campus Chief */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-lg transition relative overflow-hidden">
        {/* Subtle decorative quotation mark */}
        <Quote className="absolute right-6 top-6 w-16 h-16 text-blue-100 -z-0 pointer-events-none" />

        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mb-3">
            {lang === "en" ? "CAMPUS EXECUTIVE CHIEF BOARD" : "क्याम्पस प्रमुख सन्देश स्तम्भ"}
          </span>
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
            {lang === "en" ? "Message From Campus Chief" : "क्याम्पस प्रमुखको सन्देश"}
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={settings?.chiefPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"}
              alt="Campus Chief"
              className="w-16 h-16 rounded-full object-cover shadow-inner border-2 border-blue-500"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="font-extrabold text-gray-900">
                {lang === "en" ? settings?.chiefNameEn : settings?.chiefNameNp}
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                {lang === "en" ? "Campus Chief, DMC" : "क्याम्पस प्रमुख, दार्चुला बहुमुखी क्याम्पस"}
              </p>
            </div>
          </div>

          {/* Clamped to exactly 5 lines of preview */}
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-[5] mb-6 font-sans whitespace-pre-line italic">
            "{lang === "en" ? settings?.chiefMessageEn : settings?.chiefMessageNp}"
          </p>
        </div>

        <button
          onClick={() =>
            handleReadMore(
              lang === "en" ? "Message From Campus Chief" : "क्याम्पस प्रमुखको सन्देश",
              lang === "en" ? settings?.chiefNameEn : settings?.chiefNameNp,
              lang === "en" ? settings?.chiefMessageEn : settings?.chiefMessageNp,
              settings?.chiefPhoto
            )
          }
          className="self-start px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-100 font-bold text-xs uppercase tracking-wider transition-all"
        >
          {lang === "en" ? "Read Message" : "सन्देश पढ्नुहोस्"}
        </button>
      </div>

      {/* DETAILED MESSAGE POPUP MODAL */}
      {modalTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative border border-gray-100">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h4 className="text-xs font-bold font-mono text-gray-500 uppercase tracking-widest">
                ✉️ {modalTitle}
              </h4>
              <button
                onClick={() => setModalTitle("")}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Message Details */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={modalPhoto}
                  alt={modalName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-50 shadow-md mb-3"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-lg font-extrabold text-gray-900">{modalName}</h3>
                <p className="text-xs text-gray-500 font-mono italic">
                  {modalTitle} | Darchula Multiple Campus
                </p>
              </div>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed font-sans whitespace-pre-line bg-gray-50 p-5 rounded-2xl border border-gray-100 italic">
                "{modalBody}"
              </p>
            </div>

            {/* Footer Closure */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalTitle("")}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
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
