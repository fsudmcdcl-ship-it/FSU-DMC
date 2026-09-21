import React, { useState } from "react";
import { GeneralSettings, TeamMember } from "../types";
import { Quote, X } from "lucide-react";

interface MessagesSectionProps {
  settings: GeneralSettings;
  president?: TeamMember;
  lang?: "en" | "np";
}

export default function MessagesSection({ settings, president }: MessagesSectionProps) {
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

  const presidentName = president?.nameEn || settings?.presidentNameEn || "Amit Joshi";
  const presidentPhoto = president?.imageUrl || settings?.presidentPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Box 1: Message from FSU President */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition relative overflow-hidden">
        <Quote className="absolute right-6 top-6 w-16 h-16 text-emerald-100 pointer-events-none" />

        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-2">
            FSU MESSAGE BOARD
          </span>
          <h3 className="text-xl font-serif font-black text-slate-900 mb-6 pb-2 border-b border-slate-100">
            Message From FSU President
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={presidentPhoto}
              alt="FSU President"
              className="w-16 h-16 rounded-full object-cover shadow-inner border-2 border-emerald-600"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="font-extrabold text-slate-900">{presidentName}</h4>
              <p className="text-xs text-slate-500 font-medium">
                President, Free Student Union - DMC
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed line-clamp-[5] mb-6 font-sans whitespace-pre-line italic">
            "{settings?.presidentMessageEn ||
              "Dear fellow students, as the President of Free Student Union - DMC, I extend my heartfelt welcome. Our union remains firmly dedicated to upholding academic transparency, equal opportunity for all, student welfare funds, and active engagement with campus leadership."}"
          </p>
        </div>

        <button
          onClick={() =>
            handleReadMore(
              "Message From FSU President",
              presidentName,
              settings?.presidentMessageEn ||
                "Dear fellow students, as the President of Free Student Union - DMC, I extend my heartfelt welcome. Our union remains firmly dedicated to upholding academic transparency, equal opportunity for all, student welfare funds, and active engagement with campus leadership.",
              presidentPhoto
            )
          }
          className="self-start px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Read Full Message
        </button>
      </div>

      {/* Box 2: Message from Campus Chief */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition relative overflow-hidden">
        <Quote className="absolute right-6 top-6 w-16 h-16 text-blue-100 pointer-events-none" />

        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-900 block mb-2">
            CAMPUS EXECUTIVE BOARD
          </span>
          <h3 className="text-xl font-serif font-black text-slate-900 mb-6 pb-2 border-b border-slate-100">
            Message From Campus Chief
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <img
              src={settings?.chiefPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"}
              alt="Campus Chief"
              className="w-16 h-16 rounded-full object-cover shadow-inner border-2 border-blue-900"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="font-extrabold text-slate-900">{settings?.chiefNameEn || "Campus Chief"}</h4>
              <p className="text-xs text-slate-500 font-medium">
                Campus Chief, Darchula Multiple Campus
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed line-clamp-[5] mb-6 font-sans whitespace-pre-line italic">
            "{settings?.chiefMessageEn ||
              "Darchula Multiple Campus stands proud as a beacon of learning in Sudurpashchim. We encourage intellectual curiosity, academic rigor, and democratic student participation in all campus affairs."}"
          </p>
        </div>

        <button
          onClick={() =>
            handleReadMore(
              "Message From Campus Chief",
              settings?.chiefNameEn || "Campus Chief",
              settings?.chiefMessageEn ||
                "Darchula Multiple Campus stands proud as a beacon of learning in Sudurpashchim. We encourage intellectual curiosity, academic rigor, and democratic student participation in all campus affairs.",
              settings?.chiefPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
            )
          }
          className="self-start px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/80 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Read Full Message
        </button>
      </div>

      {/* DETAILED MESSAGE POPUP MODAL */}
      {modalTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col relative border border-slate-100">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h4 className="text-xs font-bold font-mono text-amber-300 uppercase tracking-widest">
                ✉️ {modalTitle}
              </h4>
              <button
                onClick={() => setModalTitle("")}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
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
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md mb-3"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-lg font-serif font-black text-slate-900">{modalName}</h3>
                <p className="text-xs text-slate-500 font-mono italic">
                  {modalTitle} | Darchula Multiple Campus
                </p>
              </div>

              <p className="text-sm md:text-base text-slate-700 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100 italic">
                "{modalBody}"
              </p>
            </div>

            {/* Footer Closure */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalTitle("")}
                className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
