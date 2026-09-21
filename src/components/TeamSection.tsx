import React from "react";
import { TeamMember } from "../types";

interface TeamSectionProps {
  team: TeamMember[];
  lang?: "en" | "np";
}

export default function TeamSection({ team }: TeamSectionProps) {
  // Sort members by order
  const sortedTeam = [...team].sort((a, b) => a.order - b.order);

  // President is typically order 1
  const president = sortedTeam.find((member) => member.order === 1);
  const otherMembers = sortedTeam.filter((member) => member.order !== 1);

  return (
    <div className="w-full">
      {/* Centered President Card */}
      {president && (
        <div className="flex justify-center mb-12">
          <div className="bg-gradient-to-br from-red-50/40 via-white to-amber-50/20 p-6 rounded-3xl shadow-md border border-red-100/60 max-w-sm w-full text-center flex flex-col items-center hover:shadow-lg transition-all duration-300 relative group">
            <span className="absolute -top-3 px-4 py-1 bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md">
              🏆 FSU PRESIDENT
            </span>
            <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-red-700 shadow-md relative shrink-0">
              <img
                src={president.imageUrl}
                alt={president.nameEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <h4 className="text-lg font-serif font-black text-slate-900">
              {president.nameEn}
            </h4>
            <p className="text-xs font-bold text-red-700 uppercase tracking-widest mt-1">
              {president.roleEn}
            </p>
            <div className="mt-4 text-[11px] font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              Free Student Union - DMC | Executive Chair
            </div>
          </div>
        </div>
      )}

      {/* Grid for other team members */}
      {otherMembers.length === 0 ? (
        <p className="text-center text-gray-500 text-xs font-mono mt-4">
          No other team members added yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {otherMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-slate-200 shadow-inner shrink-0">
                <img
                  src={
                    member.imageUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
                  }
                  alt={member.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h5 className="font-bold text-slate-900 text-sm tracking-tight leading-snug line-clamp-1">
                {member.nameEn}
              </h5>
              <p className="text-xs font-bold text-red-700 mt-0.5 uppercase tracking-wider line-clamp-1">
                {member.roleEn}
              </p>
              <span className="text-[10px] text-slate-400 font-mono mt-3">
                Order priority: {member.order}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
