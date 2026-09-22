import React from "react";
import ContactSection from "../components/ContactSection";
import { Mail, Phone, MapPin, Clock, ExternalLink, ShieldCheck, Building2 } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 w-full">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            Communication & Liaison
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-white">
            Contact Free Student Union - DMC
          </h1>
          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Have a question, feedback, academic grievance, or institutional inquiry? Connect with the FSU executive office at Darchula Multiple Campus, affiliated with{" "}
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

      {/* Main Contact Section (Form + Information) */}
      <ContactSection />

      {/* Campus Map & Directions */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-950" />
          <h2 className="text-xl font-serif font-black text-slate-900">
            Campus Physical Location & Directions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <p>
              Darchula Multiple Campus is located along the bank of the historic Mahakali River in Khalanga, the district headquarters of Darchula in Sudurpashchim Province, Nepal.
            </p>
            <div className="space-y-2 font-mono bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p><strong>Physical Address:</strong> Khalanga, Mahakali Municipality, Darchula District, Sudurpashchim Province, Nepal</p>
              <p><strong>Urgent Helpline:</strong> <a href="tel:9741823122" className="text-emerald-700 underline font-bold font-mono">9741823122</a></p>
              <p><strong>Official Base Domain:</strong> <a href="https://fsudmc.com" className="text-blue-900 underline">https://fsudmc.com</a></p>
              <p><strong>Official Contact Email:</strong> <a href="mailto:info@fsudmc.com" className="text-blue-900 underline">info@fsudmc.com</a></p>
              <p><strong>University Affiliation:</strong> <a href="https://fwu.edu.np" target="_blank" rel="noopener noreferrer" className="text-red-700 underline font-bold">Farwestern University (fwu.edu.np)</a></p>
            </div>
            <p className="text-[11px] text-slate-500">
              Visiting hours: Sunday through Friday from 7:00 AM to 5:00 PM during regular academic semester periods.
            </p>
          </div>

          <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 text-center flex flex-col items-center justify-center min-h-[220px]">
            <MapPin className="w-10 h-10 text-red-700 mb-3" />
            <h4 className="font-serif font-black text-slate-900 text-base">Darchula Multiple Campus</h4>
            <p className="text-xs text-slate-500 mt-1">Khalanga, Darchula District, Nepal</p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://maps.google.com/?q=Darchula+Multiple+Campus+Khalanga"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
