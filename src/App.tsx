import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb, seedInitialDataIfEmpty } from "./lib/firebase";
import { DatabaseState, GeneralSettings, ImportantNotice, SlideItem, NewsItem, DownloadItem, TeamMember, BlogItem } from "./types";
import { DEFAULT_DB_STATE } from "./lib/defaults";

// Components
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

import { GraduationCap, ArrowDown, HelpCircle, Facebook, Info } from "lucide-react";

type RouteState = "home" | "cms" | "messages";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [dbState, setDbState] = useState<DatabaseState>(DEFAULT_DB_STATE);
  
  // Routing and languages
  const [route, setRoute] = useState<RouteState>("home");
  const [lang, setLang] = useState<"en" | "np">("en");
  
  // Notice and focus items
  const [forceNoticeTrigger, setForceNoticeTrigger] = useState(0);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  // Active scrolled section (Home, About, etc.)
  const [activeSection, setActiveSection] = useState("home");

  // Router listener
  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get("page");

      if (path.endsWith("/campuslogin") || hash === "#campuslogin" || pageParam === "campuslogin") {
        setRoute("cms");
      } else if (path.endsWith("/databasemessage2083") || hash === "#messages" || pageParam === "messages") {
        setRoute("messages");
      } else {
        setRoute("home");
      }
    };

    handleRouting();
    window.addEventListener("popstate", handleRouting);
    window.addEventListener("hashchange", handleRouting);

    return () => {
      window.removeEventListener("popstate", handleRouting);
      window.removeEventListener("hashchange", handleRouting);
    };
  }, []);

  // Update navigation history pathname dynamically (subdirectory-safe for GitHub Pages)
  const navigateTo = (targetRoute: RouteState) => {
    setRoute(targetRoute);
    const newUrl = new URL(window.location.href);
    
    // Clean query params and hash
    newUrl.searchParams.delete("page");
    newUrl.hash = "";

    // Extract any repository subdirectory prefix (e.g., /repository-name) from current path
    const currentPath = window.location.pathname;
    let repoPrefix = "";
    
    if (currentPath.toLowerCase().endsWith("/campuslogin")) {
      repoPrefix = currentPath.substring(0, currentPath.length - "/campuslogin".length);
    } else if (currentPath.toLowerCase().endsWith("/databasemessage2083")) {
      repoPrefix = currentPath.substring(0, currentPath.length - "/databasemessage2083".length);
    } else {
      repoPrefix = currentPath;
    }
    
    // Clean trailing slash of prefix
    if (repoPrefix.endsWith("/")) {
      repoPrefix = repoPrefix.slice(0, -1);
    }

    if (targetRoute === "cms") {
      newUrl.pathname = repoPrefix + "/campuslogin";
      window.history.pushState({}, "", newUrl.toString());
    } else if (targetRoute === "messages") {
      newUrl.pathname = repoPrefix + "/databasemessage2083";
      window.history.pushState({}, "", newUrl.toString());
    } else {
      newUrl.pathname = repoPrefix + "/";
      window.history.pushState({}, "", newUrl.toString());
    }
  };

  // Sync DB and Seed if empty
  useEffect(() => {
    const rootRef = ref(rtdb);

    const checkAndSeed = async () => {
      await seedInitialDataIfEmpty();
    };
    checkAndSeed();

    const unsubscribe = onValue(rootRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDbState(data as DatabaseState);
      }
      setLoading(false);
    }, (err) => {
      console.error("Database read rejected or failed: ", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Scroll Spy to highlight active section on nav tab
  useEffect(() => {
    if (route !== "home") return;

    const handleScroll = () => {
      const sections = ["home", "about", "syllabus", "team", "blogs", "contact"];
      const scrollPos = window.scrollY + 160;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const offsetTop = el.offsetTop;
          const offsetHeight = el.offsetHeight;
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [route]);

  const handleNavClick = (sectionId: string) => {
    if (sectionId === "cms") {
      navigateTo("cms");
      return;
    }

    if (route !== "home") {
      navigateTo("home");
      // Delayed scroll after navigation completes
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };



  // Safe variables derived from State
  const settings: GeneralSettings = dbState?.generalSettings || {} as GeneralSettings;
  const slides: SlideItem[] = dbState?.slides ? Object.values(dbState.slides) : [];
  const news: NewsItem[] = dbState?.news ? Object.values(dbState.news) : [];
  const downloads: DownloadItem[] = dbState?.downloads ? Object.values(dbState.downloads) : [];
  const blogs: BlogItem[] = dbState?.blogs ? Object.values(dbState.blogs) : [];
  const team: TeamMember[] = dbState?.team ? Object.values(dbState.team) : [];
  const importantNotice: ImportantNotice = dbState?.importantNotice || { active: false } as ImportantNotice;

  // ROUTE 1: CMS PANEL
  if (route === "cms") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        <CMSPanel
          state={dbState!}
          lang={lang}
          onGoHome={() => navigateTo("home")}
          onGoMessages={() => navigateTo("messages")}
        />
        <Footer settings={settings} lang={lang} />
      </div>
    );
  }

  // ROUTE 2: MESSAGES / INBOX VIEWER
  if (route === "messages") {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        <MessagesViewer
          lang={lang}
          onGoHome={() => navigateTo("home")}
        />
        <Footer settings={settings} lang={lang} />
      </div>
    );
  }

  // ROUTE 3: MAIN PUBLIC SINGLE PAGE
  return (
    <div className="min-h-screen bg-neutral-50/30 text-gray-800 flex flex-col justify-between selection:bg-emerald-200">
      
      {/* Dynamic Important Alert Overlay shown on load */}
      <PopupNotice
        notice={importantNotice}
        lang={lang}
        forceOpenTrigger={forceNoticeTrigger}
      />

      {/* Main Bilingual Header */}
      <Header
        settings={settings}
        lang={lang}
        setLang={setLang}
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onOpenImportantNotice={() => setForceNoticeTrigger((prev) => prev + 1)}
      />

      {/* Sliding announcements ticker */}
      <Marquee
        news={news}
        lang={lang}
        onNewsClick={(id) => {
          setSelectedNewsId(id);
        }}
      />

      {/* Primary body contents structured in different scrollable sections */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-24 w-full">
        
        {/* SECTION 1: HOME PAGE HERO / SLIDER / NEWS SCREEN */}
        <section id="home" className="scroll-mt-16 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Campus slider */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <Slider slides={slides} lang={lang} />
            </div>

            {/* Right Column: Mini Intro card */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-slate-100/80 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-2">
                  {lang === "en" ? "WELCOME TO DARCHULA" : "सुदूरपश्चिमको प्रसिद्ध शैक्षिक केन्द्र"}
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-4">
                  {lang === "en"
                    ? "Welcome to Free Student Union (FSU) Portal"
                    : "स्वतन्त्र विद्यार्थी युनियन डिजिटल पोर्टलमा स्वागत छ"}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {lang === "en"
                    ? "Darchula Multiple Campus is affiliate to Tribhuvan University. The FSU represents the unified voice of progressive students working to safeguard academic excellence and campus welfare."
                    : "दार्चुला बहुमुखी क्याम्पस त्रिभुवन विश्वविद्यालयबाट सम्बन्धन प्राप्त सुदूरपश्चिमकै अग्रणी क्याम्पस हो। यहाँका विद्यार्थीहरूको हकहित संरक्षण, गुणस्तरीय शिक्षा प्राप्ति र रचनात्मक नेतृत्व विकासका लागि स्ववियु सदैव समर्पित छ।"}
                </p>
              </div>

              <div className="border-t border-slate-50 pt-4 mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleNavClick("about")}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-900 transition shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>{lang === "en" ? "Explore About FSU" : "स्ववियुबारे विस्तृतमा"}</span>
                  <ArrowDown className="w-4 h-4 animate-bounce" />
                </button>

                <a
                  href={settings?.fbCampusPage || "https://facebook.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition flex items-center gap-1 text-xs font-bold shadow-sm"
                  title="Official FB Page"
                >
                  <Facebook className="w-4 h-4" />
                  <span className="hidden sm:inline">Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Core Recent News details and Scrolling Notice deck */}
          <NewsSection
            news={news}
            lang={lang}
            selectedNewsId={selectedNewsId}
            setSelectedNewsId={setSelectedNewsId}
          />
        </section>

        {/* SECTION 2: ABOUT FSU & ABOUT CAMPUS SCREEN */}
        <section id="about" className="scroll-mt-16 border-t border-gray-100/80 pt-16">
          <AboutSection settings={settings} lang={lang} />
          
          <div className="mt-16">
            {/* Split messages from President & Campus chief */}
            <MessagesSection settings={settings} lang={lang} />
          </div>
        </section>

        {/* SECTION 3: ACADEMIC FILES AND SYLLABUS SCREEN */}
        <section id="syllabus" className="scroll-mt-16 border-t border-gray-100/80 pt-16">
          <DownloadsSection downloads={downloads} lang={lang} />
        </section>

        {/* SECTION 4: MEET FSU EXECUTIVE BOARD MEMBERS */}
        <section id="team" className="scroll-mt-16 border-t border-gray-100/80 pt-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
              {lang === "en" ? "FSU COMMITTEE" : "कार्यकारिणी समिति"}
            </span>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
              {lang === "en" ? "Meet Our Student Representatives" : "हाम्रो कार्यसमितिका सदस्यहरू"}
            </h3>
            <p className="text-sm text-gray-500">
              {lang === "en"
                ? "Democratically elected FSU members working for the welfare, rights, and standard higher education of Darchula Multiple Campus."
                : "दार्चुला बहुमुखी क्याम्पसका विद्यार्थीहरूको प्रतिनिधित्व गर्ने निर्वाचित पदाधिकारी तथा स्ववियु सदस्यहरू।"}
            </p>
          </div>
          <TeamSection team={team} lang={lang} />
        </section>

        {/* SECTION 5: STUDENT WRITINGS / BLOGS SCREEN */}
        <section id="blogs" className="scroll-mt-16 border-t border-gray-100/80 pt-16">
          <BlogsSection
            blogs={blogs}
            lang={lang}
            selectedBlogId={selectedBlogId}
            setSelectedBlogId={setSelectedBlogId}
          />
        </section>

        {/* SECTION 6: COMPLAINTS / FEEDBACK CONTACT SCREEN */}
        <section id="contact" className="scroll-mt-16 border-t border-gray-100/80 pt-16">
          <ContactSection lang={lang} />
        </section>

      </main>

      {/* Main Footer layout */}
      <Footer settings={settings} lang={lang} />
    </div>
  );
}
