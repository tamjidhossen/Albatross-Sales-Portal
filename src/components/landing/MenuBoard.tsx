import React from 'react';
import { MessageCircle, Phone, Sparkles } from 'lucide-react';

export const MenuBoard: React.FC = () => {
  return (
    <section id="menu" className="relative py-20 sm:py-28 overflow-hidden">
      
      {/* Massive Background Fading Typography */}
      <div className="absolute top-6 inset-x-0 text-center mega-bg-text select-none">
        OFFICIAL MENU
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="font-hand text-2xl sm:text-3xl text-yellow-300 block mb-1">
            Everything Fresh & Hot off the Cart
          </span>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl uppercase tracking-wide leading-none text-white drop-shadow">
            OFFICIAL <span className="text-yellow-300">CART MENU</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-white/90 font-medium">
            Check out our complete menu card straight from our cart at Circuit House Field.
          </p>
        </div>

        {/* Centered Menu Card Poster Showcase */}
        <div className="flex flex-col items-center">
          <div className="glass-card p-4 sm:p-7 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border-2 border-yellow-300/40 relative group hover:border-yellow-300 transition duration-500">
            
            {/* Top Pill Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs uppercase tracking-widest text-yellow-300 font-extrabold">
                  Albatross Food Cart Joypurhat
                </span>
              </div>
              <span className="font-bengali text-xs text-white/80 font-bold">
                সার্কিট হাউজ মাঠ
              </span>
            </div>

            {/* Scanned Official Menu Image */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/30 bg-orange-950/40 shadow-inner">
              <img 
                src="/assets/images/menu-card-poster.jpeg" 
                alt="Albatross Official Street Cart Menu" 
                className="w-full h-auto object-cover group-hover:scale-[1.01] transition duration-500"
              />
            </div>

            {/* Bottom Caption & Order CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="font-hand text-2xl text-yellow-300 block leading-tight">
                  Want to order from this menu?
                </span>
                <p className="text-xs text-white/80 font-medium">
                  Send us the items you'd like on Facebook or call directly!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <a 
                  href="https://www.facebook.com/profile.php?id=61588185748001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black px-5 py-3 rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider text-xs sm:text-sm shrink-0"
                >
                  <MessageCircle className="w-4 h-4 fill-red-950" />
                  <span>Order on Facebook</span>
                </a>

                <a 
                  href="tel:+8801778739191"
                  className="glass-pill hover:bg-white/20 text-white font-bold px-4 py-3 rounded-2xl transition active:scale-95 flex items-center justify-center gap-1.5 text-xs sm:text-sm shrink-0"
                  title="Call Albatross: +8801778739191"
                >
                  <Phone className="w-4 h-4 text-yellow-300" />
                  <span>Call</span>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
