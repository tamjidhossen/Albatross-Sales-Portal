import React from 'react';
import { MessageCircle, Flame, Star, Utensils, Sandwich, Sparkles, CheckCircle2 } from 'lucide-react';

export const ComboShowcase: React.FC = () => {
  return (
    <section id="combos" className="relative py-20 sm:py-28 overflow-hidden">
      
      {/* Giant Background Fading Word */}
      <div className="absolute top-6 inset-x-0 text-center mega-bg-text select-none">
        COMBOS
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-14">
          <div>
            <span className="font-hand text-2xl sm:text-3xl text-yellow-300 block mb-1">
              Eat. Repeat. Be Happy
            </span>
            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl uppercase tracking-wide leading-none text-white drop-shadow">
              HEADLINE <span className="text-yellow-300">COMBO</span> DEALS
            </h2>
          </div>
          <p className="text-white/90 max-w-md text-xs sm:text-sm mt-3 md:mt-0 font-bengali font-semibold">
            এক সাথে বেশি মজা এক প্লেটে! Grab our signature crowd-favorite combos straight from our authentic posters.
          </p>
        </div>

        {/* 3 Combo Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* COMBO 1: GULTE COMBO (160 TK) */}
          <div className="glass-card rounded-[2rem] p-5 flex flex-col justify-between hover:-translate-y-2 transition duration-300 group shadow-2xl">
            <div>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/4.5] mb-5 border border-white/25 bg-orange-950/40">
                <img 
                  src="/assets/images/gulte-combo-poster.jpeg" 
                  alt="Gulte Combo 160 TK" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-yellow-400 text-red-950 font-bengali font-black text-xs sm:text-sm px-3.5 py-1 rounded-full shadow">
                  গুলটে COMBO
                </div>
                <div className="absolute bottom-3 right-3 bg-red-950/90 backdrop-blur-md text-yellow-300 font-display text-2xl sm:text-3xl px-4 py-1.5 rounded-2xl border border-yellow-400/40 font-black">
                  160 TK
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow-300 mb-1">
                <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>Most Popular</span>
                <span>•</span>
                <span className="font-bengali">সেরা কম্বো!</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl tracking-wide uppercase text-white">The "Gulte" Combo</h3>
              
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-white font-medium">
                <li className="flex items-center justify-between glass-pill px-3.5 py-2 rounded-xl">
                  <span className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-yellow-300 shrink-0" />
                    <span>Chicken Momo <span className="font-bengali text-yellow-300">(চিকেন মোম)</span></span>
                  </span>
                  <span className="font-extrabold">8 Pcs</span>
                </li>
                <li className="flex items-center justify-between glass-pill px-3.5 py-2 rounded-xl">
                  <span className="flex items-center gap-2">
                    <Sandwich className="w-4 h-4 text-yellow-300 shrink-0" />
                    <span>Tuni Burger <span className="font-bengali text-yellow-300">(টুনি বার্গার)</span></span>
                  </span>
                  <span className="font-extrabold">3 Pcs</span>
                </li>
              </ul>
            </div>

            <a 
              href="https://www.facebook.com/profile.php?id=61588185748001"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black py-3.5 rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-wider text-xs sm:text-sm"
            >
              <MessageCircle className="w-4 h-4 fill-red-950" />
              <span>Order Gulte Combo — 160 TK</span>
            </a>
          </div>

          {/* COMBO 2: SPECIAL COMBO (220 TK) */}
          <div className="glass-card rounded-[2rem] p-5 flex flex-col justify-between border-2 border-yellow-300 relative hover:-translate-y-2 transition duration-300 group shadow-2xl">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-red-950 font-black text-xs uppercase tracking-widest px-4 py-1 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-red-950 text-red-950" />
              <span>Squad Feast Special</span>
              <Star className="w-3.5 h-3.5 fill-red-950 text-red-950" />
            </div>

            <div>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/4.5] mb-5 border border-white/25 bg-orange-950/40">
                <img 
                  src="/assets/images/special-combo-poster.jpeg" 
                  alt="Special Combo 220 TK" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white font-bengali font-black text-xs sm:text-sm px-3.5 py-1 rounded-full shadow">
                  স্পেশাল COMBO
                </div>
                <div className="absolute bottom-3 right-3 bg-red-950/90 backdrop-blur-md text-yellow-300 font-display text-2xl sm:text-3xl px-4 py-1.5 rounded-2xl border border-yellow-400/40 font-black">
                  220 TK
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-yellow-300 mb-1">
                <span className="font-bengali font-bold">এক সাথে বেশি মজা এক প্লেটে!</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl tracking-wide uppercase text-white">220 TK Special Combo</h3>
              
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-white font-medium">
                <li className="flex items-center justify-between glass-pill px-3.5 py-2 rounded-xl">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-300 shrink-0" />
                    <span>Loaded Meat Box <span className="font-bengali text-yellow-300">(মিট বক্স)</span></span>
                  </span>
                  <span className="font-extrabold">1 Pc</span>
                </li>
                <li className="flex items-center justify-between glass-pill px-3.5 py-2 rounded-xl">
                  <span className="flex items-center gap-2">
                    <Sandwich className="w-4 h-4 text-yellow-300 shrink-0" />
                    <span>Chicken Mini Burgers <span className="font-bengali text-yellow-300">(চিকেন বার্গার)</span></span>
                  </span>
                  <span className="font-extrabold">6 Pcs</span>
                </li>
              </ul>
            </div>

            <a 
              href="https://www.facebook.com/profile.php?id=61588185748001"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full bg-white hover:bg-yellow-300 text-red-950 font-black py-3.5 rounded-2xl shadow-lg active:scale-95 transition flex items-center justify-center gap-2 uppercase tracking-wider text-xs sm:text-sm"
            >
              <MessageCircle className="w-4 h-4 fill-red-950" />
              <span>Order Special Combo — 220 TK</span>
            </a>
          </div>

          {/* COMBO 3: PIZZA & MEGA COMBOS */}
          <div className="glass-card rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between hover:-translate-y-2 transition duration-300 shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-white/20 text-yellow-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Pizza Lovers
                </span>
                <span className="font-hand text-2xl text-yellow-300">Freshly Baked!</span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl tracking-wide uppercase mb-4 text-white">
                Menu Combo Deals
              </h3>

              {/* Sub-Combo 150 TK */}
              <div className="glass-dark rounded-2xl p-4 mb-4 border border-white/15">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-base text-yellow-300">Pizza + Tuni Combo</h4>
                    <p className="text-xs text-white/85 mt-1 leading-relaxed">
                      • Bread Pizza 6" (1 pc)<br />
                      • Tuni Burger (3 pcs)
                    </p>
                  </div>
                  <span className="font-display text-2xl sm:text-3xl text-white font-black">150 TK</span>
                </div>
                <a 
                  href="https://www.facebook.com/profile.php?id=61588185748001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full glass-pill hover:bg-yellow-400 hover:text-red-950 text-white text-xs font-black py-2.5 rounded-xl transition uppercase tracking-wider active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Order 150 TK Combo</span>
                </a>
              </div>

              {/* Sub-Combo 260 TK */}
              <div className="glass-dark rounded-2xl p-4 border border-yellow-400/40">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest bg-yellow-400 text-red-950 font-black px-2 py-0.5 rounded">
                      Ultimate Feast
                    </span>
                    <h4 className="font-extrabold text-base text-yellow-300 mt-1">Triple Threat Combo</h4>
                    <p className="text-xs text-white/85 mt-1 leading-relaxed">
                      • Bread Pizza 6"<br />
                      • Tuni Arabian (3 pcs)<br />
                      • Chicken Momo (8 pcs)
                    </p>
                  </div>
                  <span className="font-display text-2xl sm:text-3xl text-yellow-300 font-black">260 TK</span>
                </div>
                <a 
                  href="https://www.facebook.com/profile.php?id=61588185748001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full bg-yellow-400 hover:bg-yellow-300 text-red-950 text-xs font-black py-2.5 rounded-xl transition uppercase tracking-wider active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-red-950" />
                  <span>Order 260 TK Mega Combo</span>
                </a>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/85">
              <span>All combos made fresh to order</span>
              <span className="font-bold text-yellow-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-300" />
                <span>100% Halal</span>
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
