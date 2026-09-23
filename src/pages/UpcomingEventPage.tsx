import React, { useState, useEffect } from "react";
import { UpcomingEvent } from "../types";
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Users,
  ShieldCheck,
  Radio
} from "lucide-react";
import { getNepaliDate } from "../utils/nepaliDate";

interface UpcomingEventPageProps {
  events?: UpcomingEvent[];
  onNavigateHome?: () => void;
}

interface CountdownState {
  status: "TODAY" | "COMPLETED" | "COUNTDOWN";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateCountdown(eventDateStr: string): CountdownState {
  if (!eventDateStr) {
    return { status: "COMPLETED", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const target = new Date(eventDateStr);
  const now = new Date();

  if (isNaN(target.getTime())) {
    return { status: "COMPLETED", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  // 1. Check if calendar date matches TODAY in local date
  const isSameDay =
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate();

  if (isSameDay) {
    return { status: "TODAY", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  // 2. Check if date is in the PAST (from tomorrow onwards / past event completion)
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { status: "COMPLETED", days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  // 3. FUTURE: Live countdown timer (Days : Hrs : Mins : Secs)
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    status: "COUNTDOWN",
    days,
    hours,
    minutes,
    seconds,
  };
}

export default function UpcomingEventPage({ events = [] }: UpcomingEventPageProps) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [, setTick] = useState(0);

  // Live timer tick every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter only published events
  const publishedEvents = events.filter((e) => e.isPublished !== false);

  // Sort: Today first, then future nearest to furthest, then past
  const sortedEvents = [...publishedEvents].sort((a, b) => {
    const aCountdown = calculateCountdown(a.eventDate);
    const bCountdown = calculateCountdown(b.eventDate);

    if (aCountdown.status === "TODAY" && bCountdown.status !== "TODAY") return -1;
    if (bCountdown.status === "TODAY" && aCountdown.status !== "TODAY") return 1;

    if (aCountdown.status === "COUNTDOWN" && bCountdown.status === "COMPLETED") return -1;
    if (bCountdown.status === "COUNTDOWN" && aCountdown.status === "COMPLETED") return 1;

    return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
  });

  // Featured Event: The primary active event (TODAY or nearest upcoming)
  const featuredEvent = sortedEvents.find(
    (e) => calculateCountdown(e.eventDate).status !== "COMPLETED"
  ) || sortedEvents[0];

  const filteredList = sortedEvents.filter((e) => {
    const { status } = calculateCountdown(e.eventDate);
    if (filter === "upcoming") return status === "TODAY" || status === "COUNTDOWN";
    if (filter === "past") return status === "COMPLETED";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10 w-full animate-fade-in">
      {/* Page Header matching Portal Aesthetics */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-800/60 border border-blue-700/60 text-xs font-bold uppercase tracking-wider text-blue-200">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Campus Events Calendar</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight text-white leading-tight">
            Upcoming Campus Events &amp; Assemblies
          </h1>

          <p className="text-blue-100/90 text-sm md:text-base leading-relaxed">
            Stay informed on sports meets, academic conferences, cultural assemblies, and student union workshops organized at Darchula Multiple Campus, Farwestern University.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-amber-300">
            <span className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>BS Date: {getNepaliDate().bsDateStringText}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Student Union Secretariat</span>
            </span>
          </div>
        </div>
      </div>

      {/* FEATURED / HERO EVENT CARD */}
      {featuredEvent ? (
        (() => {
          const countdown = calculateCountdown(featuredEvent.eventDate);
          const eventDateObj = new Date(featuredEvent.eventDate);

          return (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Top Banner Region with Status & Countdown */}
              <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 md:p-8 border-b border-blue-900/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-mono">
                        FEATURED EVENT
                      </span>

                      {/* SMART STATUS BADGES */}
                      {countdown.status === "TODAY" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500 text-white text-xs font-black uppercase tracking-wider animate-pulse shadow-md">
                          <Radio className="w-3.5 h-3.5" />
                          TODAY
                        </span>
                      )}

                      {countdown.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                          COMPLETED
                        </span>
                      )}

                      {countdown.status === "COUNTDOWN" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-800/80 text-blue-200 border border-blue-700/60 text-xs font-bold uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          UPCOMING
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-serif font-black text-white tracking-tight">
                      {featuredEvent.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {eventDateObj.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>

                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        {eventDateObj.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {featuredEvent.location && (
                        <span className="flex items-center gap-1.5 font-medium text-amber-300">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          {featuredEvent.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* SMART COUNTDOWN DISPLAY (DAYS : HRS : MINS : SECS) */}
                  <div className="shrink-0">
                    {countdown.status === "COUNTDOWN" && (
                      <div className="bg-slate-950/80 border border-amber-500/30 p-4 rounded-2xl shadow-inner">
                        <div className="text-[10px] font-mono font-bold uppercase text-amber-400/90 tracking-wider mb-2 text-center flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Event Starts In
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="bg-blue-950/80 border border-white/10 px-2.5 py-2 rounded-xl min-w-[56px]">
                            <span className="block text-xl sm:text-2xl font-mono font-black text-amber-400 leading-none">
                              {String(countdown.days).padStart(2, "0")}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-slate-300 tracking-wider">
                              Days
                            </span>
                          </div>

                          <div className="bg-blue-950/80 border border-white/10 px-2.5 py-2 rounded-xl min-w-[56px]">
                            <span className="block text-xl sm:text-2xl font-mono font-black text-amber-400 leading-none">
                              {String(countdown.hours).padStart(2, "0")}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-slate-300 tracking-wider">
                              Hrs
                            </span>
                          </div>

                          <div className="bg-blue-950/80 border border-white/10 px-2.5 py-2 rounded-xl min-w-[56px]">
                            <span className="block text-xl sm:text-2xl font-mono font-black text-amber-400 leading-none">
                              {String(countdown.minutes).padStart(2, "0")}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-slate-300 tracking-wider">
                              Mins
                            </span>
                          </div>

                          <div className="bg-blue-950/80 border border-white/10 px-2.5 py-2 rounded-xl min-w-[56px]">
                            <span className="block text-xl sm:text-2xl font-mono font-black text-amber-400 leading-none">
                              {String(countdown.seconds).padStart(2, "0")}
                            </span>
                            <span className="text-[9px] uppercase font-bold text-slate-300 tracking-wider">
                              Secs
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {countdown.status === "TODAY" && (
                      <div className="bg-emerald-950/60 border border-emerald-500/40 p-5 rounded-2xl text-center space-y-1">
                        <span className="text-2xl font-black text-emerald-400 uppercase tracking-widest font-mono block">
                          TODAY
                        </span>
                        <p className="text-xs text-emerald-200 font-medium">
                          Active campus event happening today!
                        </p>
                      </div>
                    )}

                    {countdown.status === "COMPLETED" && (
                      <div className="bg-slate-950/60 border border-slate-700 p-5 rounded-2xl text-center space-y-1">
                        <span className="text-lg font-bold text-slate-400 uppercase tracking-widest font-mono block">
                          COMPLETED
                        </span>
                        <p className="text-xs text-slate-400">
                          This event has concluded.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Body: Description, Media Images (Max 2), and CTA */}
              <div className="p-6 md:p-8 space-y-6">
                {featuredEvent.description && (
                  <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm md:text-base">
                    {featuredEvent.description}
                  </div>
                )}

                {/* Media Gallery / Grid (Up to 2 images) */}
                {featuredEvent.images && featuredEvent.images.length > 0 && (
                  <div className={`grid gap-4 ${featuredEvent.images.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                    {featuredEvent.images.slice(0, 2).map((img, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm max-h-96"
                      >
                        <img
                          src={img}
                          alt={`${featuredEvent.title} image ${idx + 1}`}
                          className="w-full h-full object-cover hover:scale-102 transition duration-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Action CTA & Resource Button */}
                {featuredEvent.resourceLink && (
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <a
                      href={featuredEvent.resourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer group"
                    >
                      <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                      <span>{featuredEvent.resourceLinkLabel || "Download Event Notice & Rulebook (PDF)"}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })()
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Events Scheduled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no active public events scheduled. Please check back later or view official circulars on the Notices board.
          </p>
        </div>
      )}

      {/* ALL EVENTS LIST / ARCHIVE */}
      {sortedEvents.length > 1 && (
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-2xl font-serif font-black text-blue-950">
                All Campus Events &amp; Program Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Browse both active schedules and recent campus program archives.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === "all" ? "bg-white text-blue-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({sortedEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("upcoming")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === "upcoming" ? "bg-white text-blue-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setFilter("past")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === "past" ? "bg-white text-blue-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Past / Completed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((ev) => {
              const countdown = calculateCountdown(ev.eventDate);
              const evDate = new Date(ev.eventDate);

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      {ev.images && ev.images.length > 0 ? (
                        <img
                          src={ev.images[0]}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Calendar className="w-12 h-12" />
                        </div>
                      )}

                      {/* Status Overlay Badge */}
                      <div className="absolute top-3 right-3">
                        {countdown.status === "TODAY" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow animate-pulse">
                            TODAY
                          </span>
                        )}
                        {countdown.status === "COMPLETED" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-200 shadow">
                            COMPLETED
                          </span>
                        )}
                        {countdown.status === "COUNTDOWN" && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow font-mono">
                            {countdown.days}d {countdown.hours}h left
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {evDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span>
                          {evDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <h4 className="font-serif font-black text-slate-900 text-base leading-snug line-clamp-2">
                        {ev.title}
                      </h4>

                      {ev.location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </p>
                      )}

                      {ev.description && (
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer with CTA */}
                  {ev.resourceLink && (
                    <div className="p-5 pt-0">
                      <a
                        href={ev.resourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-blue-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-800" />
                        <span className="truncate">{ev.resourceLinkLabel || "Event Resources"}</span>
                        <ExternalLink className="w-3 h-3 text-blue-600 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
