import React from 'react';
import { MessageCircle, ArrowRight, Flame, Star, Bike, Phone } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen pt-24 sm:pt-36 pb-16 flex flex-col justify-center items-center overflow-hidden">
      
      {/* MASSIVE BACKGROUND TEXT LAYER (Covers 65-70% of Viewport) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0">
        <div className="mega-bg-text tracking-tight leading-none text-center">ALBATROSS</div>
        <div className="mega-outline-text tracking-tight leading-none text-center -mt-4 sm:-mt-8 md:-mt-12">STREET CART</div>
      </div>

      {/* FOREGROUND HERO CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Floating Polaroid Pizza + Review Chip */}
          <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6 order-2 lg:order-1">
            
            {/* Floating Food Card 1: Bread Pizza */}
            <div className="glass-card p-3.5 rounded-3xl rotate-[-3deg] hover:rotate-0 transition duration-500 animate-float-slow max-w-sm mx-auto lg:mx-0 shadow-2xl">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/4.3] bg-orange-950/40">
                <img 
                  src="/assets/images/bread-pizza.jpeg" 
                  alt="6 inch Cheesy Bread Pizza" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Best Seller</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-yellow-400 text-red-950 font-display text-2xl px-3.5 py-1 rounded-xl shadow-lg font-black">
                  100 TK
                </div>
              </div>
              <div className="pt-3 px-2 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white leading-tight">6" Cheesy Bread Pizza</h3>
                  <p className="text-xs text-white/80">Spiced chicken chunks & melting cheese</p>
                </div>
                <a 
                  href="https://www.facebook.com/profile.php?id=61588185748001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black text-xs uppercase tracking-wider transition active:scale-95 shadow flex items-center gap-1" 
                  title="Order on Facebook"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-red-950" />
                  <span>Order</span>
                </a>
              </div>
            </div>

            {/* Floating Glass Review Chip */}
            <div className="glass-card rounded-2xl p-4 flex items-center gap-3.5 rotate-[2deg] animate-float-reverse max-w-xs mx-auto lg:ml-6 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-yellow-400 text-red-950 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-red-950 text-red-950" />
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-300 text-xs font-bold">
                  <div className="flex text-yellow-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                    ))}
                  </div>
                  <span className="text-white/80 ml-1">• Circuit House Crowd</span>
                </div>
                <p className="text-xs text-white font-medium mt-1 leading-snug">
                  "The 3-pc Tuni Burger for 60 tk & hot Chicken Momos are unbeatable in Joypurhat!"
                </p>
              </div>
            </div>

          </div>

          {/* Center Column: Official Brand Centerpiece & Call to Action */}
          <div className="lg:col-span-4 text-center flex flex-col items-center order-1 lg:order-2">
            <div className="font-hand text-3xl sm:text-4xl text-yellow-300 -rotate-3 mb-2 drop-shadow">
              Good Food, Good Mood
            </div>

            {/* Official Logo Centerpiece with Pulsing Glow */}
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-full p-2 glass-card animate-glow mb-5 sm:mb-6 flex items-center justify-center shadow-2xl">
              <img 
                src="/assets/images/logo.jpeg" 
                alt="Albatross Logo" 
                className="w-full h-full object-contain rounded-full shadow-inner"
              />
              <span className="absolute -bottom-3 bg-yellow-400 text-red-950 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] px-3.5 py-1 rounded-full shadow-lg border-2 border-white">
                Flavor That Flies
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl uppercase tracking-wide leading-[0.95] drop-shadow-xl text-white">
              JOYPURHAT'S <span className="text-yellow-300">FIERIEST</span> STREET BITES
            </h1>

            <p className="mt-3 sm:mt-4 text-white/95 text-xs sm:text-sm max-w-md font-medium leading-relaxed">
              Steaming Chicken Momos, saucy Tuni Burgers, loaded Meat Boxes & cheesy Bread Pizzas served fresh off our fiery red cart at <strong className="text-yellow-300">Circuit House Field</strong>.
            </p>

            {/* Main Order & Call Buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a 
                href="https://www.facebook.com/profile.php?id=61588185748001" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition flex items-center gap-2 text-xs sm:text-sm uppercase tracking-wider"
              >
                <MessageCircle className="w-4 h-4 fill-red-950" />
                <span>Order on Facebook</span>
              </a>

              <a 
                href="tel:+8801778739191" 
                className="glass-card hover:bg-white/25 text-white font-extrabold px-5 sm:px-6 py-3 sm:py-3.5 rounded-full transition text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-yellow-300" />
                <span>01778-739191</span>
              </a>

              <a 
                href="#menu" 
                className="glass-card hover:bg-white/25 text-white/90 font-bold px-4 py-3 sm:py-3.5 rounded-full transition text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5"
              >
                <span>View Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Cart Photo & Tuni Burgers */}
          <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6 order-3">
            
            {/* Floating Glass Delivery Badge */}
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between rotate-[-2deg] animate-float-delayed max-w-xs mx-auto lg:mr-4 shadow-xl">
              <div>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-yellow-300 font-extrabold block font-bengali">
                  সার্কিট হাউজ মাঠে
                </span>
                <span className="font-black text-xs sm:text-sm text-white">
                  Free Delivery in Joypurhat Sadar!
                </span>
              </div>
              <Bike className="w-7 h-7 text-yellow-300 shrink-0" />
            </div>

            {/* Floating Food Card 2: The Cart & Tuni Burgers */}
            <div className="glass-card p-3.5 rounded-3xl rotate-[3deg] hover:rotate-0 transition duration-500 animate-float-reverse max-w-sm mx-auto lg:mx-0 shadow-2xl">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/4.3] bg-orange-950/40">
                <img 
                  src="/assets/images/food-cart-sliders.jpeg" 
                  alt="Albatross Cart and Tuni Burgers" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-yellow-300 text-xs font-bold px-3 py-1 rounded-full">
                  6 Pcs Box Shown
                </div>
                <div className="absolute bottom-3 left-3 bg-yellow-400 text-red-950 font-display text-xl px-3.5 py-1 rounded-xl shadow-lg font-black">
                  60 TK / 3 PCS
                </div>
              </div>
              <div className="pt-3 px-2 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-white leading-tight">Signature Tuni Burgers</h3>
                  <p className="text-xs text-white/80">Soft sesame buns, crispy chicken & mayo drizzle</p>
                </div>
                <a 
                  href="https://www.facebook.com/profile.php?id=61588185748001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black text-xs uppercase tracking-wider transition active:scale-95 shadow flex items-center gap-1" 
                  title="Order on Facebook"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-red-950" />
                  <span>Order</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
