import React, { useEffect, useState } from "react";
import { getNepaliDate, toNepaliDigits } from "../utils/nepaliDate";
import { GeneralSettings } from "../types";
import { Bell, Globe, Languages, Menu, X, Clock, Calendar } from "lucide-react";

interface HeaderProps {
  settings: GeneralSettings;
  lang: "en" | "np";
  setLang: (lang: "en" | "np") => void;
  activeSection: string;
  onNavClick: (sectionId: string) => void;
  onOpenImportantNotice: () => void;
}

export default function Header({
  settings,
  lang,
  setLang,
  activeSection,
  onNavClick,
  onOpenImportantNotice,
}: HeaderProps) {
  const [nepaliDateTime, setNepaliDateTime] = useState(getNepaliDate());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNepaliDateTime(getNepaliDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: "home", labelEn: "Home", labelNp: "गृहपृष्ठ" },
    { id: "about", labelEn: "About", labelNp: "हाम्रो बारेमा" },
    { id: "syllabus", labelEn: "Syllabus/Notes", labelNp: "पाठ्यक्रम/नोटहरू" },
    { id: "team", labelEn: "FSU Team", labelNp: "स्ववियु कार्यसमिति" },
    { id: "blogs", labelEn: "Student Blogs", labelNp: "विद्यार्थी ब्लग" },
    { id: "contact", labelEn: "Contact", labelNp: "सम्पर्क" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md shadow-sm">
      {/* Paper grain subtle background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      {/* Top Bar for Logo, Titles, Language and RGB clock */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand Logo & Text */}
        <div className="flex items-center gap-4">
          <img
            id="header-logo"
            src={settings?.logoUrl || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200"}
            alt="FSU Logo"
            className="w-16 h-16 object-cover rounded-full shadow-md border-2 border-emerald-600 ring-2 ring-emerald-50"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-black tracking-tight text-blue-950">
              {lang === "en" ? (settings?.titleEn || "FREE STUDENT UNION") : (settings?.titleNp || "स्वतन्त्र विद्यार्थी युनियन")}
            </h1>
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500 font-sans">
              {lang === "en" ? (settings?.subtitleEn || "Darchula Multiple Campus") : (settings?.subtitleNp || "दार्चुला बहुमुखी क्याम्पस, दार्चुला")}
            </p>
          </div>
        </div>

        {/* Dynamic Controls / Clock and Language Switch */}
        <div className="flex flex-wrap items-center gap-4 justify-between md:justify-end">
          {/* Beautiful Upgraded Clock/Date widget */}
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl shadow-lg border border-slate-800/80 select-none">
            <div className="flex items-center gap-1.5 border-r border-slate-800/60 pr-3">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-mono text-sm md:text-base font-black tracking-wider text-amber-400">
                {lang === "np" ? toNepaliDigits(nepaliDateTime.timeString) : nepaliDateTime.timeString}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-sans text-xs font-bold text-slate-200 whitespace-nowrap">
                {lang === "np" ? toNepaliDigits(nepaliDateTime.bsDateStringNumeric) : nepaliDateTime.bsDateStringText}
              </span>
            </div>
          </div>

          {/* Call-to-action Highlights button & Language Swap */}
          <div className="flex items-center gap-2">
            <button
              id="btn-important-notice"
              onClick={onOpenImportantNotice}
              className="relative px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-white bg-red-700 hover:bg-red-800 active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 animate-ring text-amber-400" />
              <span>{lang === "en" ? "Notices !" : "सूचनाहरू !"}</span>
            </button>

            {/* Language Switch button */}
            <button
              id="btn-language-swap"
              onClick={() => setLang(lang === "en" ? "np" : "en")}
              className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-900 transition-all text-slate-700 border border-slate-200 flex items-center gap-1.5 text-xs font-bold uppercase cursor-pointer"
              title="Switch Language"
            >
              <Languages className="w-4 h-4 text-slate-500" />
              <span>{lang === "en" ? "नेपाली" : "English"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-blue-950 text-white shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          {/* Desktop Navigation items */}
          <div className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavClick(item.id)}
                className={`h-12 px-3 flex items-center text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
                  activeSection === item.id
                    ? "text-amber-400 bg-blue-900/60"
                    : "text-blue-100 hover:text-white hover:bg-blue-900"
                }`}
              >
                {lang === "en" ? item.labelEn : item.labelNp}
                {activeSection === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400" />
                )}
              </button>
            ))}
          </div>

          <div className="text-xs italic text-blue-200 font-mono hidden lg:block">
            fsudmc.edu.np | Darchula, Nepal
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex w-full justify-between items-center">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-100 font-mono">
              {lang === "en" ? "Menu" : "मेनु"}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-md text-blue-200 hover:text-white hover:bg-blue-900 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-900 border-t border-blue-800 px-2 pt-2 pb-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavClick(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left block px-3 py-2 rounded-md text-base font-semibold transition ${
                  activeSection === item.id
                    ? "text-amber-400 bg-blue-950"
                    : "text-blue-100 hover:text-white hover:bg-blue-800"
                }`}
              >
                {lang === "en" ? item.labelEn : item.labelNp}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
