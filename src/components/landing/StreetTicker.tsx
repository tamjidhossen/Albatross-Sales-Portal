import React from 'react';
import { Flame, Sandwich, Pizza, Sparkles, MapPin } from 'lucide-react';

export const StreetTicker: React.FC = () => {
  return (
    <div className="relative z-20 py-3 sm:py-4 bg-red-950/85 backdrop-blur-md border-y border-white/20 overflow-hidden rotate-[-1deg] scale-105 shadow-2xl my-6">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-8 sm:gap-10 font-display text-lg sm:text-2xl tracking-wider uppercase text-yellow-300">
        
        {/* Set 1 */}
        <span className="inline-flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          CHICKEN MOMO (8 PCS) — 120 TK
        </span>
        <span className="text-white/40">•</span>
        <span className="inline-flex items-center gap-1.5">
          <Sandwich className="w-4 h-4 text-yellow-400" />
          TUNI BURGER (3 PCS) — 60 TK
        </span>
        <span className="text-white/40">•</span>
        <span className="inline-flex items-center gap-1.5">
          <Pizza className="w-4 h-4 text-yellow-400" />
          BREAD PIZZA 6" — 100 TK
        </span>
        <span className="text-white/40">•</span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          LOADED MEAT BOX — 120 TK
        </span>
        <span className="text-white/40">•</span>
        <span className="font-bengali font-bold inline-flex items-center gap-1.5 text-white">
          <MapPin className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          সার্কিট হাউজ মাঠে, জয়পুরহাট সদর
        </span>
        <span className="text-white/40">•</span>

        {/* Set 2 (for smooth infinite scroll loop) */}
        <span className="inline-flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          CHICKEN MOMO (8 PCS) — 120 TK
        </span>
        <span className="text-white/40">•</span>
        <span className="inline-flex items-center gap-1.5">
          <Sandwich className="w-4 h-4 text-yellow-400" />
          TUNI BURGER (3 PCS) — 60 TK
        </span>
        <span className="text-white/40">•</span>
        <span className="inline-flex items-center gap-1.5">
          <Pizza className="w-4 h-4 text-yellow-400" />
          BREAD PIZZA 6" — 100 TK
        </span>
        <span className="text-white/40">•</span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          LOADED MEAT BOX — 120 TK
        </span>
        <span className="text-white/40">•</span>
        <span className="font-bengali font-bold inline-flex items-center gap-1.5 text-white">
          <MapPin className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          সার্কিট হাউজ মাঠে, জয়পুরহাট সদর
        </span>
        <span className="text-white/40">•</span>

      </div>
    </div>
  );
};
