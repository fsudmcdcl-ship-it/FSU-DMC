import React from "react";
import { NewsItem } from "../types";
import { Radio } from "lucide-react";

interface MarqueeProps {
  news: NewsItem[];
  lang: "en" | "np";
  onNewsClick: (newsId: string) => void;
}

export default function Marquee({ news, lang, onNewsClick }: MarqueeProps) {
  if (!news || news.length === 0) return null;

  // Combine news headings to form a continuous string for scrolling
  return (
    <div className="bg-slate-900 text-white py-2 shadow-inner border-y border-slate-800 flex items-center relative overflow-hidden select-none">
      {/* Badge fixed on the left */}
      <div className="bg-red-700 font-extrabold text-xs uppercase px-3 py-1 flex items-center gap-1 shrink-0 z-10 shadow-lg ml-4 rounded-md tracking-wider">
        <Radio className="w-3.5 h-3.5 text-amber-400" />
        <span>{lang === "en" ? "Recent Alerts" : "ताजा अपडेट"}</span>
      </div>

      {/* Marquee Wrapper */}
      <div className="w-full overflow-hidden flex items-center">
        <div className="flex animate-marquee whitespace-nowrap gap-12 pl-4 py-0.5">
          {news.map((item) => (
            <button
              key={item.id}
              onClick={() => onNewsClick(item.id)}
              className="text-xs md:text-sm font-bold tracking-wide hover:text-amber-400 transition-colors text-white font-sans flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>{lang === "en" ? item.headingEn : item.headingNp}</span>
            </button>
          ))}
          {/* Duplicate to ensure seamless looping */}
          {news.map((item) => (
            <button
              key={`${item.id}-dup`}
              onClick={() => onNewsClick(item.id)}
              className="text-xs md:text-sm font-bold tracking-wide hover:text-amber-400 transition-colors text-white font-sans flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              <span>{lang === "en" ? item.headingEn : item.headingNp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom animation to index.css if not present, we will declare standard keyframes in index.css */}
    </div>
  );
}
