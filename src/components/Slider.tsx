import React, { useState, useEffect } from "react";
import { SlideItem } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SliderProps {
  slides: SlideItem[];
  lang: "en" | "np";
}

export default function Slider({ slides, lang }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-80 bg-gray-100 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-300">
        <p className="text-gray-500 font-mono text-sm">
          No slides uploaded yet. Please login to the CMS to add slides.
        </p>
      </div>
    );
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-xl border border-gray-100 group aspect-[16/10] bg-gray-950">
      {/* Slider Images */}
      <div className="w-full h-full relative">
        <img
          src={currentSlide.imageUrl}
          alt={lang === "en" ? currentSlide.titleEn : currentSlide.titleNp}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-100"
          referrerPolicy="no-referrer"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16 flex flex-col justify-end" />
      </div>

      {/* Caption bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
        <p className="text-sm md:text-base font-serif font-black tracking-tight text-amber-400 transition-all duration-300 drop-shadow-md">
          {lang === "en" ? currentSlide.titleEn : currentSlide.titleNp}
        </p>
        <span className="text-[10px] uppercase tracking-widest text-slate-300 font-mono mt-1 block">
          Photo {currentIndex + 1} of {slides.length}
        </span>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 transition text-white flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300 shadow-md backdrop-blur-sm cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 active:scale-90 transition text-white flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300 shadow-md backdrop-blur-sm cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicator dots */}
          <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? "bg-amber-400 scale-125 shadow" : "bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
