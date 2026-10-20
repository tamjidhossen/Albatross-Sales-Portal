import React from 'react';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';

export const FloatingMobileBar: React.FC = () => {
  return (
    <div className="fixed bottom-2.5 inset-x-0 z-40 md:hidden flex items-center justify-center px-3 pointer-events-none animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-1.5 pointer-events-auto shadow-2xl">
        
        {/* Main Facebook Order Button (Compact, Sleek, Single-line) */}
        <a
          href="https://www.facebook.com/profile.php?id=61588185748001"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-dark border border-yellow-300/50 hover:border-yellow-300 text-white px-3.5 py-2 rounded-full flex items-center gap-2 active:scale-95 transition-all shadow-xl backdrop-blur-xl whitespace-nowrap"
        >
          <span className="w-5 h-5 rounded-full bg-yellow-400 text-red-950 flex items-center justify-center shrink-0 shadow">
            <MessageCircle className="w-3 h-3 fill-red-950" />
          </span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-yellow-300">
            Order Now
          </span>
          <span className="text-[10px] text-white/80 font-medium hidden xs:inline">
            • Facebook
          </span>
          <ArrowRight className="w-3 h-3 text-yellow-300 shrink-0" />
        </a>

        {/* Quick Phone Call Button */}
        <a
          href="tel:+8801778739191"
          className="w-9 h-9 rounded-full bg-yellow-400 hover:bg-yellow-300 text-red-950 flex items-center justify-center font-black shrink-0 shadow-xl active:scale-95 transition border border-white"
          title="Call Albatross: +8801778739191"
        >
          <Phone className="w-3.5 h-3.5 fill-red-950" />
        </a>

      </div>
    </div>
  );
};
