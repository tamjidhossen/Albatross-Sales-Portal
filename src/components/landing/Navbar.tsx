import React, { useState } from 'react';
import { MessageCircle, Menu, X, Utensils, Camera, MapPin } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-2 sm:top-3 inset-x-0 z-50 px-2 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <nav className="glass-card rounded-full px-3 sm:px-6 py-1.5 sm:py-2.5 flex items-center justify-between shadow-2xl">
        
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-orange-600 border border-yellow-300 overflow-hidden flex items-center justify-center shadow-lg group-hover:scale-105 transition shrink-0">
            <img 
              src="/assets/images/logo.jpeg" 
              alt="Albatross Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-display text-base sm:text-xl tracking-wider block leading-none text-white drop-shadow">
              ALBATROSS
            </span>
            <span className="text-[7.5px] sm:text-[9.5px] uppercase tracking-[0.2em] text-yellow-300 font-bold block">
              Flavor That Flies
            </span>
          </div>
        </a>

        {/* Desktop Nav Links (No offer) */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-white/95">
          <a href="#menu" className="hover:text-yellow-300 transition">Official Menu</a>
          <a href="#combos" className="hover:text-yellow-300 transition">Combos</a>
          <a href="#gallery" className="hover:text-yellow-300 transition">Food Cart</a>
          <a href="#location" className="hover:text-yellow-300 transition">Location</a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Direct Order Button to Facebook - Always single line on mobile */}
          <a 
            href="https://www.facebook.com/profile.php?id=61588185748001"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black text-[11px] sm:text-xs md:text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg transition flex items-center gap-1.5 active:scale-95 uppercase tracking-wider whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-red-950 shrink-0" />
            <span className="whitespace-nowrap">Order Now</span>
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-white hover:text-yellow-300 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </nav>

      {/* Mobile Menu Dropdown (Clean, compact, icons instead of emojis) */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-1.5 glass-card rounded-2xl p-3 text-[11px] font-bold uppercase tracking-wider space-y-1.5 animate-in slide-in-from-top-2 shadow-2xl">
          <a 
            href="#menu" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-white"
          >
            <Utensils className="w-3.5 h-3.5 text-yellow-300" />
            <span>Official Cart Menu</span>
          </a>
          <a 
            href="#combos" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-white"
          >
            <Utensils className="w-3.5 h-3.5 text-yellow-300" />
            <span>Signature Combos</span>
          </a>
          <a 
            href="#gallery" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-white"
          >
            <Camera className="w-3.5 h-3.5 text-yellow-300" />
            <span>Food Cart & Sliders</span>
          </a>
          <a 
            href="#location" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-white"
          >
            <MapPin className="w-3.5 h-3.5 text-yellow-300" />
            <span>Circuit House Field Spot</span>
          </a>
          <a 
            href="https://www.facebook.com/profile.php?id=61588185748001" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-yellow-400 text-red-950 font-black text-center mt-1"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-red-950" />
            <span>Order on Facebook Page</span>
          </a>
        </div>
      )}
    </header>
  );
};
