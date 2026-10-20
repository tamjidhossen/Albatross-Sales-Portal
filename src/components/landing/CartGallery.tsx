import React from 'react';

export const CartGallery: React.FC = () => {
  return (
    <section id="gallery" className="relative py-20 sm:py-28 overflow-hidden">
      
      {/* Giant Background Outline Word */}
      <div className="absolute top-10 inset-x-0 text-center mega-outline-text select-none">
        FLAVOR FLIES
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="font-hand text-2xl sm:text-3xl text-yellow-300 block mb-1">
            Real Photos, Real Street Flavor
          </span>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl uppercase tracking-wide text-white drop-shadow">
            STRAIGHT FROM THE <span className="text-yellow-300">RED CART</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          
          {/* Gallery Card 1: The Cart */}
          <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col justify-between shadow-2xl hover:-translate-y-2 transition duration-300">
            <div className="rounded-2xl overflow-hidden aspect-square mb-4 bg-orange-950/40">
              <img 
                src="/assets/images/food-cart-sliders.jpeg" 
                alt="Albatross Food Cart" 
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-yellow-300">
                The Albatross Cart
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl mt-0.5 text-white">
                Freshly Fried & Assembled Live
              </h3>
              <p className="text-xs text-white/80 mt-1 font-medium leading-relaxed">
                Spot our bright red winged cart at Circuit House Field every afternoon & evening.
              </p>
            </div>
          </div>

          {/* Gallery Card 2: 6" Bread Pizza (Tilted Up) */}
          <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col justify-between md:-translate-y-6 shadow-2xl hover:-translate-y-8 transition duration-300 border-2 border-yellow-300/40">
            <div className="rounded-2xl overflow-hidden aspect-square mb-4 bg-orange-950/40">
              <img 
                src="/assets/images/bread-pizza.jpeg" 
                alt="Albatross Bread Pizza" 
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-yellow-300">
                100 TK Street Legend
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl mt-0.5 text-white">
                6" Cheesy Chicken Bread Pizza
              </h3>
              <p className="text-xs text-white/80 mt-1 font-medium leading-relaxed">
                Served hot on a silver foil plate, loaded with spiced chicken chunks & signature sauce.
              </p>
            </div>
          </div>

          {/* Gallery Card 3: Meat Box & Sliders */}
          <div className="glass-card p-4 sm:p-5 rounded-3xl flex flex-col justify-between shadow-2xl hover:-translate-y-2 transition duration-300">
            <div className="rounded-2xl overflow-hidden aspect-square mb-4 bg-orange-950/40">
              <img 
                src="/assets/images/special-combo-poster.jpeg" 
                alt="Albatross Meatbox and Mini Burgers" 
                className="w-full h-full object-cover hover:scale-105 transition duration-500"
              />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-yellow-300">
                Evening Hangout Fuel
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl mt-0.5 text-white">
                Loaded Meat Box & Sliders
              </h3>
              <p className="text-xs text-white/80 mt-1 font-medium leading-relaxed">
                Made for sharing with friends on the grassy lawn of Circuit House.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

