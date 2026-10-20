import React from 'react';
import { MessageCircle, Navigation, MapPin, Bike, Clock, Phone } from 'lucide-react';

export const LocationBanner: React.FC = () => {
  return (
    <section id="location" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="glass-card rounded-[2.5rem] p-6 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
              <MapPin className="w-3.5 h-3.5 text-red-950" />
              <span>Find Our Cart Today</span>
            </div>

            <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl uppercase leading-none text-white drop-shadow">
              CIRCUIT HOUSE FIELD
            </h2>

            <p className="font-bengali text-2xl sm:text-3xl font-extrabold text-yellow-300">
              লোকেশন: সার্কিট হাউজ মাঠে, জয়পুরহাট সদর
            </p>

            <p className="text-white/95 text-xs sm:text-base max-w-xl font-medium leading-relaxed">
              Swing by the field with your friends for hot momos and burgers right off the stove!
            </p>

            <div className="pt-2 flex flex-wrap gap-3.5">
              <div className="glass-dark px-4 sm:px-5 py-3 rounded-2xl flex items-center gap-3 shadow">
                <Bike className="w-6 h-6 text-yellow-300 shrink-0" />
                <div>
                  <div className="text-[10px] sm:text-xs text-yellow-300 font-bold uppercase tracking-wider">Local Delivery</div>
                  <div className="font-bengali font-bold text-xs sm:text-sm text-white">Joypurhat Sadar এ ডেলিভারি চার্জ ফ্রি!</div>
                </div>
              </div>

              <div className="glass-dark px-4 sm:px-5 py-3 rounded-2xl flex items-center gap-3 shadow">
                <Clock className="w-6 h-6 text-yellow-300 shrink-0" />
                <div>
                  <div className="text-[10px] sm:text-xs text-yellow-300 font-bold uppercase tracking-wider">Cart Hours</div>
                  <div className="font-bold text-xs sm:text-sm text-white">Every Day • 3:30 PM – 10:00 PM</div>
                </div>
              </div>

              <a 
                href="tel:+8801778739191" 
                className="glass-dark px-4 sm:px-5 py-3 rounded-2xl flex items-center gap-3 shadow hover:bg-white/10 transition active:scale-95"
              >
                <Phone className="w-6 h-6 text-yellow-300 shrink-0" />
                <div>
                  <div className="text-[10px] sm:text-xs text-yellow-300 font-bold uppercase tracking-wider">Direct Hotline</div>
                  <div className="font-bold text-xs sm:text-sm text-white">+880 1778-739191</div>
                </div>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
            <div className="glass-dark p-6 rounded-3xl w-full max-w-sm text-center border border-yellow-400/40 shadow-2xl">
              <img 
                src="/assets/images/logo.jpeg" 
                alt="Albatross" 
                className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-yellow-300 object-cover shadow-lg"
              />
              <h3 className="font-display text-2xl sm:text-3xl uppercase text-white">
                Connect On Facebook
              </h3>
              <p className="text-xs text-white/80 mt-1 font-medium">
                Visit our official page for daily combo drops, order inquiries & instant support.
              </p>
              
              <a 
                href="https://www.facebook.com/profile.php?id=61588185748001"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black py-3.5 px-6 rounded-2xl transition text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-red-950" />
                <span>Visit Facebook Page</span>
              </a>

              <a 
                href="tel:+8801778739191"
                className="mt-2.5 w-full inline-flex items-center justify-center gap-2 glass-pill hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-xl transition"
              >
                <Phone className="w-3.5 h-3.5 text-yellow-300" />
                <span>Call +8801778739191</span>
              </a>

              <a
                href="https://maps.google.com/?q=Circuit+House+Field+Joypurhat"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full inline-flex items-center justify-center gap-1.5 glass-pill hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-xl transition"
              >
                <Navigation className="w-3.5 h-3.5 text-yellow-300" />
                <span>Google Maps Directions</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
