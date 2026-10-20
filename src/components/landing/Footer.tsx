import React from 'react';
import { Shield, MessageCircle, Phone } from 'lucide-react';

interface FooterProps {
  onNavigateToAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToAdmin }) => {
  return (
    <footer className="relative z-10 py-10 sm:py-12 text-center text-xs text-white/85 border-t border-white/20 pb-20 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img 
            src="/assets/images/logo.jpeg" 
            alt="Albatross Logo" 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-yellow-300 shadow-md"
          />
          <div className="text-left">
            <span className="font-display text-lg sm:text-xl tracking-wider text-white block leading-none">
              ALBATROSS — FLAVOR THAT FLIES
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-yellow-300 font-bold">
              Circuit House Field, Joypurhat Sadar
            </span>
          </div>
        </div>

        {/* Bengali Motto */}
        <div className="font-bengali text-xs sm:text-sm text-white/95 font-medium">
          সার্কিট হাউজ মাঠে, জয়পুরহাট সদর • Good Food, Good Mood
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
          <a
            href="https://www.facebook.com/profile.php?id=61588185748001"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-pill px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold flex items-center gap-1.5 hover:bg-white/30 text-white transition active:scale-95 shadow"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>Facebook Page</span>
          </a>

          <a
            href="tel:+8801778739191"
            className="glass-pill px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold flex items-center gap-1.5 hover:bg-white/30 text-yellow-300 transition active:scale-95 shadow"
          >
            <Phone className="w-3.5 h-3.5 fill-yellow-300" />
            <span>01778-739191</span>
          </a>

          <button
            onClick={onNavigateToAdmin}
            className="glass-pill px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-white/60 hover:text-white hover:bg-white/20 transition flex items-center gap-1 text-[11px]"
            title="Sales, Inventory & Bazaar Ledger"
          >
            <Shield className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-[10px] sm:text-[11px] text-white/60">
        © {new Date().getFullYear()} Albatross Fast Food Cart. All Rights Reserved.
      </div>
    </footer>
  );
};
