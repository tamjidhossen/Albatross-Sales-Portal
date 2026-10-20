import React, { useState, useEffect } from 'react';
import { REVIEWS } from '../../data/reviewsData';
import { Star, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

export const ReviewSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const current = REVIEWS[currentIndex];

  return (
    <section id="reviews" className="py-10 sm:py-16 px-3 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-sm mx-auto mb-6 sm:mb-8 space-y-1">
          <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase text-white/90 block">
            Customer Love
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white drop-shadow-sm">
            WORDS FROM JOYPURHAT.
          </h2>
        </div>

        {/* Review Card (Solid Crisp White) */}
        <div className="frost-card-solid rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 shadow-2xl relative">
          <div className="flex flex-col justify-between min-h-[170px]">
            
            {/* Top row */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-400" />
                ))}
                <span className="text-xs font-black text-amber-600 ml-1.5">5.0</span>
              </div>

              <div className="bg-orange-50 border border-orange-200 px-3 py-1 rounded-full text-[10px] font-black text-[#ff5400] flex items-center gap-1">
                <Heart className="w-3 h-3 fill-[#ff5400] text-[#ff5400]" />
                <span className="truncate max-w-[140px]">{current.favoriteDish}</span>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="font-semibold text-base sm:text-xl text-[#180802] leading-relaxed mb-4">
              "{current.bengaliComment || current.comment}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${current.avatarBg} text-white font-black flex items-center justify-center text-xs shadow-md`}>
                  {current.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display font-black text-[#180802] leading-tight">{current.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">{current.location}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length)}
                  className="w-7 h-7 rounded-full bg-orange-100 hover:bg-orange-200 text-[#ff5400] flex items-center justify-center active:scale-90 font-bold"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % REVIEWS.length)}
                  className="w-7 h-7 rounded-full bg-orange-100 hover:bg-orange-200 text-[#ff5400] flex items-center justify-center active:scale-90 font-bold"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1 mt-4">
            {REVIEWS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-6 bg-[#ff5400]' : 'w-2 bg-orange-200'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
