import React from "react";
import { TeamMember } from "../types";
import TeamSection from "../components/TeamSection";
import { Users, Award, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";

interface TeamPageProps {
  team: TeamMember[];
}

export default function TeamPage({ team }: TeamPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Elected Executive Body
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white">
            Free Student Union - DMC Executive Team
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            The democratically elected student representatives serving the student council of Darchula Multiple Campus, proudly affiliated with{" "}
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

      {/* Team Cards Component */}
      <TeamSection team={team} />

      {/* Executive Portfolio Structure */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-red-700" />
          <h2 className="text-xl font-serif font-black text-slate-900">
            FSU Executive Portfolios & Portfolios
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">FSU President</h3>
            <p className="leading-relaxed">
              Overall institutional leadership, student advocacy at the Campus Management Committee, representation at Farwestern University Senate, and policy coordination.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">FSU Vice President & Secretary</h3>
            <p className="leading-relaxed">
              Supervising academic grievance committees, managing official correspondence, coordinating student welfare drives, and student union administration.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Treasurer & Executive Members</h3>
            <p className="leading-relaxed">
              Management of transparent student union budgets, extracurricular event logistics, sports competitions, cultural events, and library advocacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
