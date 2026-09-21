import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb, seedInitialDataIfEmpty } from "./lib/firebase";
import {
  DatabaseState,
  GeneralSettings,
  ImportantNotice,
  SlideItem,
  NewsItem,
  DownloadItem,
  TeamMember,
  BlogItem,
  StaffItem,
  ProfessorItem,
} from "./types";
import { DEFAULT_DB_STATE } from "./lib/defaults";

// Core Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import Slider from "./components/Slider";
import Marquee from "./components/Marquee";
import NewsSection from "./components/NewsSection";
import AboutSection from "./components/AboutSection";
import MessagesSection from "./components/MessagesSection";
import TeamSection from "./components/TeamSection";
import DownloadsSection from "./components/DownloadsSection";
import BlogsSection from "./components/BlogsSection";
import ContactSection from "./components/ContactSection";
import PopupNotice from "./components/PopupNotice";
import CMSPanel from "./components/CMSPanel";
import MessagesViewer from "./components/MessagesViewer";

// Page Views
import AboutPage from "./pages/AboutPage";
import SyllabusPage from "./pages/SyllabusPage";
import TeamPage from "./pages/TeamPage";
import BlogsPage from "./pages/BlogsPage";
import ContactPage from "./pages/ContactPage";
import CampusStaffPage from "./pages/CampusStaffPage";
import ProfessorsPage from "./pages/ProfessorsPage";
import HelpdeskPage from "./pages/HelpdeskPage";
import SecretariatPage from "./pages/SecretariatPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";

import { ArrowDown, Facebook, GraduationCap, ShieldCheck, ExternalLink } from "lucide-react";

export type RouteType =
  | "home"
  | "about"
  | "syllabus-notes"
  | "fsu-team"
  | "student-blogs"
  | "contact"
  | "campuslogin"
  | "databasemessage2083"
  | "privacy-policy"
  | "terms-and-conditions"
  | "campus-staff"
  | "professors"
  | "fsu-helpdesk"
  | "contact-secretariat"
  | "not-found";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [dbState, setDbState] = useState<DatabaseState>(DEFAULT_DB_STATE);

  // Active Route
  const [currentRoute, setCurrentRoute] = useState<RouteType>("home");
  const [attemptedSlug, setAttemptedSlug] = useState<string>("");

  // Notice and modal focus states
  const [forceNoticeTrigger, setForceNoticeTrigger] = useState(0);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  // Router parsing logic
  const parsePathToRoute = (): { route: RouteType; slug?: string } => {
    const rawPath = window.location.pathname;
    const path = rawPath.toLowerCase();
    const rawHash = window.location.hash;
    const hash = rawHash.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get("page")?.toLowerCase();

    // Check query params
    if (pageParam) {
      if (pageParam === "home") return { route: "home" };
      if (pageParam === "campuslogin") return { route: "campuslogin" };
      if (pageParam === "messages" || pageParam === "databasemessage2083") return { route: "databasemessage2083" };
      if (pageParam === "about") return { route: "about" };
      if (pageParam === "syllabus-notes") return { route: "syllabus-notes" };
      if (pageParam === "fsu-team") return { route: "fsu-team" };
      if (pageParam === "student-blogs") return { route: "student-blogs" };
      if (pageParam === "contact") return { route: "contact" };
      if (pageParam === "privacy-policy") return { route: "privacy-policy" };
      if (pageParam === "terms-and-conditions") return { route: "terms-and-conditions" };
      if (pageParam === "campus-staff") return { route: "campus-staff" };
      if (pageParam === "professors") return { route: "professors" };
      if (pageParam === "fsu-helpdesk") return { route: "fsu-helpdesk" };
      if (pageParam === "contact-secretariat") return { route: "contact-secretariat" };
      return { route: "not-found", slug: `?page=${params.get("page")}` };
    }

    // Check hash
    if (hash && hash !== "#" && hash !== "#/") {
      if (hash === "#home" || hash === "#/home") return { route: "home" };
      if (hash === "#campuslogin" || hash === "#/campuslogin") return { route: "campuslogin" };
      if (hash === "#messages" || hash === "#/messages" || hash === "#databasemessage2083" || hash === "#/databasemessage2083")
        return { route: "databasemessage2083" };
      if (hash === "#about" || hash === "#/about") return { route: "about" };
      if (hash === "#syllabus-notes" || hash === "#/syllabus-notes") return { route: "syllabus-notes" };
      if (hash === "#fsu-team" || hash === "#/fsu-team") return { route: "fsu-team" };
      if (hash === "#student-blogs" || hash === "#/student-blogs") return { route: "student-blogs" };
      if (hash === "#contact" || hash === "#/contact") return { route: "contact" };
      if (hash === "#privacy-policy" || hash === "#/privacy-policy") return { route: "privacy-policy" };
      if (hash === "#terms-and-conditions" || hash === "#/terms-and-conditions") return { route: "terms-and-conditions" };
      if (hash === "#campus-staff" || hash === "#/campus-staff") return { route: "campus-staff" };
      if (hash === "#professors" || hash === "#/professors") return { route: "professors" };
      if (hash === "#fsu-helpdesk" || hash === "#/fsu-helpdesk") return { route: "fsu-helpdesk" };
      if (hash === "#contact-secretariat" || hash === "#/contact-secretariat") return { route: "contact-secretariat" };
      return { route: "not-found", slug: rawHash };
    }

    // Check pathname
    if (
      path === "/" ||
      path === "" ||
      path.endsWith("/home") ||
      path.endsWith("/index.html")
    ) {
      return { route: "home" };
    }

    if (path.endsWith("/campuslogin")) return { route: "campuslogin" };
    if (path.endsWith("/messages") || path.endsWith("/databasemessage2083")) return { route: "databasemessage2083" };
    if (path.endsWith("/about")) return { route: "about" };
    if (path.endsWith("/syllabus-notes")) return { route: "syllabus-notes" };
    if (path.endsWith("/fsu-team")) return { route: "fsu-team" };
    if (path.endsWith("/student-blogs")) return { route: "student-blogs" };
    if (path.endsWith("/contact")) return { route: "contact" };
    if (path.endsWith("/privacy-policy")) return { route: "privacy-policy" };
    if (path.endsWith("/terms-and-conditions")) return { route: "terms-and-conditions" };
    if (path.endsWith("/campus-staff")) return { route: "campus-staff" };
    if (path.endsWith("/professors")) return { route: "professors" };
    if (path.endsWith("/fsu-helpdesk")) return { route: "fsu-helpdesk" };
    if (path.endsWith("/contact-secretariat")) return { route: "contact-secretariat" };

    // Any other pathname is unrecognized
    return { route: "not-found", slug: rawPath };
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const result = parsePathToRoute();
      setCurrentRoute(result.route);
      if (result.slug) {
        setAttemptedSlug(result.slug);
      } else {
        setAttemptedSlug("");
      }
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const navigateTo = (route: RouteType) => {
    setCurrentRoute(route);
    const newUrl = new URL(window.location.href);

    // Clean query params & hash
    newUrl.searchParams.delete("page");
    newUrl.hash = "";

    // Retain root prefix
    if (route === "home") {
      newUrl.pathname = "/home";
    } else if (route === "campuslogin") {
      newUrl.hash = "#campuslogin";
      newUrl.pathname = "/";
    } else if (route === "databasemessage2083") {
      newUrl.hash = "#messages";
      newUrl.pathname = "/";
    } else if (route === "not-found") {
      newUrl.pathname = "/404";
    } else {
      newUrl.pathname = `/${route}`;
    }

    try {
      window.history.pushState({}, "", newUrl.toString());
    } catch {
      // Fallback to hash if pushState fails in preview environment
      window.location.hash = `#/${route}`;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Sync DB and Seed if empty
  useEffect(() => {
    const checkAndSeed = async () => {
      await seedInitialDataIfEmpty();
    };
    checkAndSeed();

    const publicKeys: (keyof DatabaseState)[] = [
      "generalSettings",
      "importantNotice",
      "slides",
      "news",
      "downloads",
      "blogs",
      "team",
      "staff",
      "professors",
    ];

    let loadedCount = 0;
    const unsubscribes = publicKeys.map((key) => {
      const nodeRef = ref(rtdb, key);
      return onValue(
        nodeRef,
        (snapshot) => {
          const val = snapshot.val();
          setDbState((prev) => ({
            ...prev,
            [key]: val || DEFAULT_DB_STATE[key],
          }));

          loadedCount++;
          if (loadedCount >= publicKeys.length) {
            setLoading(false);
          }
        },
        (err) => {
          console.error(`Failed to read node ${key}: `, err);
          loadedCount++;
          if (loadedCount >= publicKeys.length) {
            setLoading(false);
          }
        }
      );
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, []);

  // Safe variables derived from State
  const settings: GeneralSettings = dbState?.generalSettings || ({} as GeneralSettings);
  const slides: SlideItem[] = dbState?.slides ? Object.values(dbState.slides) : [];
  const news: NewsItem[] = dbState?.news ? Object.values(dbState.news) : [];
  const downloads: DownloadItem[] = dbState?.downloads ? Object.values(dbState.downloads) : [];
  const blogs: BlogItem[] = dbState?.blogs ? Object.values(dbState.blogs) : [];
  const team: TeamMember[] = dbState?.team ? Object.values(dbState.team) : [];
  const staff: StaffItem[] | undefined = dbState?.staff ? (Object.values(dbState.staff) as StaffItem[]) : undefined;
  const professors: ProfessorItem[] | undefined = dbState?.professors ? (Object.values(dbState.professors) as ProfessorItem[]) : undefined;
  const importantNotice: ImportantNotice = dbState?.importantNotice || ({ active: false } as ImportantNotice);

  const president = team.find((m) => m.order === 1);

  // ROUTE 1: CMS PANEL
  if (currentRoute === "campuslogin") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        <CMSPanel
          state={dbState!}
          onGoHome={() => navigateTo("home")}
          onGoMessages={() => navigateTo("databasemessage2083")}
        />
        <Footer settings={settings} onNavigate={(slug) => navigateTo(slug as RouteType)} />
      </div>
    );
  }

  // ROUTE 2: MESSAGES / INBOX VIEWER
  if (currentRoute === "databasemessage2083") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        <MessagesViewer onGoHome={() => navigateTo("home")} />
        <Footer settings={settings} onNavigate={(slug) => navigateTo(slug as RouteType)} />
      </div>
    );
  }

  // RENDER MAIN PUBLIC PLATFORM
  return (
    <div className="min-h-screen bg-neutral-50/30 text-gray-800 flex flex-col justify-between selection:bg-red-200">
      {/* Dynamic Important Alert Overlay shown on load */}
      <PopupNotice
        notice={importantNotice}
        forceOpenTrigger={forceNoticeTrigger}
      />

      {/* Main Clean English Header with Sticky Behavior */}
      <Header
        settings={settings}
        activeSection={currentRoute}
        onNavClick={(sectionId) => navigateTo(sectionId as RouteType)}
        onOpenImportantNotice={() => setForceNoticeTrigger((prev) => prev + 1)}
      />

      {/* Sliding announcements ticker */}
      <Marquee
        news={news}
        onNewsClick={(id) => {
          setSelectedNewsId(id);
        }}
      />

      {/* Primary body contents rendered conditionally based on route */}
      <main className="flex-1 w-full flex flex-col items-center">
        {currentRoute === "home" && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-20 w-full">
            {/* HERO SECTION */}
            <section id="home" className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Column: Campus slider */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <Slider slides={slides} />
                </div>

                {/* Right Column: Intro card */}
                <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest block">
                      WELCOME TO DARCHULA MULTIPLE CAMPUS
                    </span>
                    <h2 className="text-2xl font-serif font-black text-slate-900 leading-tight">
                      Free Student Union - DMC
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Affiliated to{" "}
                      <a
                        href="https://fwu.edu.np"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-700 font-bold underline hover:text-red-800 inline-flex items-center gap-0.5"
                      >
                        <span>Farwestern University</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-2">
                      Darchula Multiple Campus stands as the leading higher educational institution in the far-western district of Darchula. The Free Student Union (FSU) represents the united, democratic voice of students striving to foster academic quality, research culture, student rights, and progressive leadership.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-5 mt-5 flex items-center justify-between">
                    <button
                      onClick={() => navigateTo("about")}
                      className="px-5 py-2.5 rounded-xl bg-red-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-800 transition shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <span>Explore Institutional Profile</span>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={settings?.fbCampusPage || "https://facebook.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
                      title="Official Facebook Page"
                    >
                      <Facebook className="w-4 h-4 text-blue-800" />
                      <span className="hidden sm:inline">Facebook</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* News & Scrolling Deck */}
              <NewsSection
                news={news}
                selectedNewsId={selectedNewsId}
                setSelectedNewsId={setSelectedNewsId}
              />
            </section>

            {/* MESSAGES SECTION */}
            <section id="messages-deck" className="border-t border-slate-100 pt-16">
              <MessagesSection settings={settings} president={president} />
            </section>

            {/* QUICK DIRECTORY SHORTCUTS */}
            <section className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-8 md:p-10 rounded-3xl shadow-md grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h3 className="font-serif font-black text-amber-400 text-lg">Campus Portal</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Quick access to all essential directories, syllabus archives, grievance channels, and academic administration.
                </p>
              </div>

              <div
                onClick={() => navigateTo("campus-staff")}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Directory</span>
                  <h4 className="font-bold text-sm text-white mt-1">Campus Staff Directory</h4>
                </div>
                <span className="text-[11px] text-blue-200 mt-2">View 8 key administrative staff →</span>
              </div>

              <div
                onClick={() => navigateTo("professors")}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Faculty</span>
                  <h4 className="font-bold text-sm text-white mt-1">Professors & Academic Directory</h4>
                </div>
                <span className="text-[11px] text-blue-200 mt-2">BBS, B.Ed, BA faculty members →</span>
              </div>

              <div
                onClick={() => navigateTo("fsu-helpdesk")}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Student Support</span>
                  <h4 className="font-bold text-sm text-white mt-1">Unique FSU Helpdesk</h4>
                </div>
                <span className="text-[11px] text-blue-200 mt-2">FAQs & student ticket submission →</span>
              </div>
            </section>

            {/* SYLLABUS & NOTES PREVIEW */}
            <section id="syllabus" className="border-t border-slate-100 pt-16">
              <DownloadsSection downloads={downloads} />
            </section>

            {/* FSU TEAM SECTION */}
            <section id="team" className="border-t border-slate-100 pt-16">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-red-700 block mb-1">
                  EXECUTIVE COMMITTEE
                </span>
                <h3 className="text-2xl font-serif font-black text-slate-900 mb-2">
                  Meet Our Student Representatives
                </h3>
                <p className="text-xs text-slate-500">
                  Democratically elected FSU members working for the welfare, rights, and higher education standards of Darchula Multiple Campus.
                </p>
              </div>
              <TeamSection team={team} />
            </section>

            {/* STUDENT BLOGS PREVIEW */}
            <section id="blogs" className="border-t border-slate-100 pt-16">
              <BlogsSection
                blogs={blogs}
                selectedBlogId={selectedBlogId}
                setSelectedBlogId={setSelectedBlogId}
              />
            </section>

            {/* CONTACT SECTION */}
            <section id="contact" className="border-t border-slate-100 pt-16">
              <ContactSection />
            </section>
          </div>
        )}

        {/* INDIVIDUAL SUB-PAGES */}
        {currentRoute === "about" && <AboutPage settings={settings} president={president} />}
        {currentRoute === "syllabus-notes" && <SyllabusPage downloads={downloads} />}
        {currentRoute === "fsu-team" && <TeamPage team={team} />}
        {currentRoute === "student-blogs" && (
          <BlogsPage
            blogs={blogs}
            selectedBlogId={selectedBlogId}
            setSelectedBlogId={setSelectedBlogId}
          />
        )}
        {currentRoute === "contact" && <ContactPage />}
        {currentRoute === "campus-staff" && <CampusStaffPage staff={staff} />}
        {currentRoute === "professors" && <ProfessorsPage professors={professors} />}
        {currentRoute === "fsu-helpdesk" && <HelpdeskPage />}
        {currentRoute === "contact-secretariat" && <SecretariatPage />}
        {currentRoute === "privacy-policy" && (
          <PrivacyPolicyPage
            settings={settings}
            onGoToCMS={() => navigateTo("campuslogin")}
          />
        )}
        {currentRoute === "terms-and-conditions" && (
          <TermsPage
            settings={settings}
            onGoToCMS={() => navigateTo("campuslogin")}
          />
        )}
        {currentRoute === "not-found" && (
          <NotFoundPage
            attemptedSlug={attemptedSlug}
            onNavigate={navigateTo}
          />
        )}
      </main>

      {/* Main Footer layout */}
      <Footer settings={settings} onNavigate={(slug) => navigateTo(slug as RouteType)} />
    </div>
  );
}
