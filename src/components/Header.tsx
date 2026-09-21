import React, { useEffect, useState } from "react";
import { getNepaliDate } from "../utils/nepaliDate";
import { GeneralSettings } from "../types";
import { Bell, Menu, X, Clock, Calendar, ExternalLink } from "lucide-react";

interface HeaderProps {
  settings: GeneralSettings;
  activeSection: string;
  onNavClick: (sectionId: string) => void;
  onOpenImportantNotice: () => void;
}

export default function Header({
  settings,
  activeSection,
  onNavClick,
  onOpenImportantNotice,
}: HeaderProps) {
  const [nepaliDateTime, setNepaliDateTime] = useState(getNepaliDate());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Digital clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setNepaliDateTime(getNepaliDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sticky scroll listener (scrollY > 50px)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { id: "home", label: "HOME", slug: "/home" },
    { id: "about", label: "ABOUT", slug: "/about" },
    { id: "syllabus-notes", label: "SYLLABUS/NOTES", slug: "/syllabus-notes" },
    { id: "fsu-team", label: "FSU TEAM", slug: "/fsu-team" },
    { id: "student-blogs", label: "STUDENT BLOGS", slug: "/student-blogs" },
    { id: "contact", label: "CONTACT", slug: "/contact" },
  ];

  // On scroll > 50px, collapse/hide all secondary items, keeping ONLY HOME and ABOUT
  const visibleDesktopItems = isScrolled
    ? menuItems.filter((item) => item.id === "home" || item.id === "about")
    : menuItems;

  return (
    <header className="w-full">
      {/* Top Bar: Brand, Logo, Clock & Notice Button */}
      <div className="w-full border-b border-gray-200/80 bg-white shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-4">
            <a
              href="/home"
              onClick={(e) => {
                e.preventDefault();
                onNavClick("home");
              }}
              className="flex items-center gap-3.5 group cursor-pointer"
            >
              <img
                id="header-logo"
                src={
                  settings?.logoUrl ||
                  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200"
                }
                alt="Free Student Union - DMC Logo"
                className="w-14 h-14 object-cover rounded-full shadow-md border-2 border-red-700 ring-2 ring-red-50 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-serif font-black tracking-tight text-blue-950">
                  {settings?.titleEn || "Free Student Union - DMC"}
                </h1>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">
                  {settings?.subtitleEn || "Darchula Multiple Campus, Khalanga"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-semibold text-red-700">
                  <span>Affiliated to</span>
                  <a
                    href="https://fwu.edu.np"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="underline hover:text-red-900 inline-flex items-center gap-0.5"
                  >
                    <span>Farwestern University</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </a>
          </div>

          {/* Clock & Action Controls */}
          <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
            {/* Clock/Date widget */}
            <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-xl shadow-md border border-slate-800 select-none">
              <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-mono text-xs md:text-sm font-black tracking-wider text-amber-400">
                  {nepaliDateTime.timeString}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-sans text-xs font-bold text-slate-200 whitespace-nowrap">
                  {nepaliDateTime.bsDateStringText}
                </span>
              </div>
            </div>

            {/* Critical Announcement Alert Button */}
            <button
              id="btn-important-notice"
              onClick={onOpenImportantNotice}
              className="relative px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl text-white bg-red-700 hover:bg-red-800 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Notices !</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Sticky Dark-Blue Navigation Bar */}
      <nav
        className={`bg-blue-950 text-white transition-all duration-300 ${
          isScrolled
            ? "sticky top-0 z-50 shadow-xl border-b border-blue-900/80 backdrop-blur-md"
            : "relative shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12">
          {/* Desktop Navigation items */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {visibleDesktopItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.slug}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavClick(item.id);
                  }}
                  className={`h-12 px-3.5 flex items-center text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer ${
                    isActive
                      ? "text-amber-400 bg-blue-900/80"
                      : "text-blue-100 hover:text-white hover:bg-blue-900/50"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400" />
                  )}
                </a>
              );
            })}

            {isScrolled && (
              <span className="text-[11px] font-mono text-blue-300/80 italic pl-2">
                (Scroll up to expand all tabs)
              </span>
            )}
          </div>

          {/* Right side info / domain */}
          <div className="text-xs text-blue-200 font-mono hidden lg:flex items-center gap-2">
            <span className="font-semibold text-amber-300">fsudmc.com</span>
            <span>|</span>
            <span>Darchula, Nepal</span>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex w-full justify-between items-center">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-200 font-mono">
              {isScrolled ? "FSU - DMC (Sticky)" : "Navigation Menu"}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900 transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-900 border-t border-blue-800 px-3 pt-2 pb-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.slug}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavClick(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left block px-3 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition ${
                    isActive
                      ? "text-amber-400 bg-blue-950 font-black"
                      : "text-blue-100 hover:text-white hover:bg-blue-800"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <div className="pt-2 border-t border-blue-800/80 text-[11px] text-blue-300 font-mono">
              fsudmc.com | info@fsudmc.com
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
