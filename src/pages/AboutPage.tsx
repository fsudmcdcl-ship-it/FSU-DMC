import React from "react";
import { GeneralSettings, TeamMember } from "../types";
import AboutSection from "../components/AboutSection";
import MessagesSection from "../components/MessagesSection";
import { GraduationCap, Award, Building, ExternalLink, BookOpen, HeartHandshake } from "lucide-react";

interface AboutPageProps {
  settings: GeneralSettings;
  president?: TeamMember;
}

export default function AboutPage({ settings, president }: AboutPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            Institutional Profile
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white">
            About Free Student Union - DMC
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Representing the collective student body of Darchula Multiple Campus, Khalanga, Darchula — in proud academic affiliation with{" "}
            <a
              href="https://fwu.edu.np"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:text-amber-200 font-semibold underline decoration-amber-400/60 transition-colors"
            >
              Farwestern University
            </a>
            .
          </p>
        </div>
      </div>

      {/* Core About Sections */}
      <AboutSection settings={settings} />

      {/* Institutional Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-black text-slate-900 text-lg">Our Mission</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            To champion students' academic, economic, and democratic welfare; provide equal access to quality higher education; and nurture youth leadership in far-western Nepal.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-black text-slate-900 text-lg">University Affiliation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Operating in close academic synergy with <a href="https://fwu.edu.np" target="_blank" rel="noopener noreferrer" className="text-blue-900 font-bold underline">Farwestern University (FWU)</a>, ensuring recognized degrees, updated curricula, and standard examination procedures.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-black text-slate-900 text-lg">Student Solidarity</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Committed to zero discrimination, proactive emergency student stipends, transparent union funds, and open door dialogue with campus leadership.
          </p>
        </div>
      </div>

      {/* Official Executive Messages */}
      <div className="pt-4">
        <MessagesSection settings={settings} president={president} />
      </div>
    </div>
  );
}
