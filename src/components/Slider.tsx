import React, { useState, useEffect } from "react";
import { SlideItem } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SliderProps {
  slides: SlideItem[];
  lang?: "en" | "np";
}

export default function Slider({ slides }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-80 bg-slate-100 flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-300">
        <p className="text-gray-500 font-mono text-xs">
          No campus banners uploaded yet.
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
    <div className="relative w-full overflow-hidden rounded-3xl shadow-xl border border-slate-100 group aspect-[16/10] bg-slate-950">
      {/* Slider Images */}
      <div className="w-full h-full relative">
        <img
          src={currentSlide.imageUrl}
          alt={currentSlide.titleEn || "Campus Highlights"}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-100"
          referrerPolicy="no-referrer"
        />
        {/* Dark gradient for text readability */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 pt-16 flex flex-col justify-end" />
      </div>

      {/* Caption bar */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
        <p className="text-sm md:text-base font-serif font-black tracking-tight text-amber-300 drop-shadow-md">
          {currentSlide.titleEn}
        </p>
        <span className="text-[10px] uppercase tracking-widest text-slate-300 font-mono mt-1 block">
          Campus Gallery | Photo {currentIndex + 1} of {slides.length}
        </span>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 transition text-white flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300 shadow-md backdrop-blur-sm cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 transition text-white flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300 shadow-md backdrop-blur-sm cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-4 flex space-x-1.5 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? "w-6 bg-amber-400" : "w-2 bg-white/50"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
