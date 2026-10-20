import React from 'react';
import { MapPin, Clock, Bike, MessageCircle, Navigation, ArrowRight } from 'lucide-react';

interface LocationHoursProps {
  onOpenOrderModal: () => void;
}

export const LocationHours: React.FC<LocationHoursProps> = ({ onOpenOrderModal }) => {
  return (
    <section id="spot" className="py-10 sm:py-16 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        <div className="frost-card-solid rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-2xl space-y-6">
          
          <div className="text-center sm:text-left space-y-1">
            <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase text-[#ff5400] block">
              Visit The Spot
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#180802] tracking-tight">
              CIRCUIT HOUSE FIELD, JOYPURHAT.
            </h2>
            <p className="text-xs text-zinc-600 font-medium">
              সার্কিট হাউস মাঠের মনোরম প্রাকৃতিক পরিবেশে আমাদের ফুড কার্ট।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            
            <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-[#ff5400] text-xs font-black uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Opening Hours</span>
              </div>
              <p className="font-display font-black text-lg text-[#180802]">4:00 PM – 10:30 PM</p>
              <p className="text-[11px] text-zinc-600 font-medium">প্রতিদিন বিকেল ও সন্ধ্যায় লাইভ ওপেন</p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-wider">
                <Bike className="w-4 h-4" />
                <span>Free Sadar Delivery</span>
              </div>
              <p className="font-display font-black text-lg text-[#180802]">ডেলিভারি চার্জ ০৳</p>
              <p className="text-[11px] text-zinc-600 font-medium">জয়পুরহাট সদর এরিয়ায় সম্পূর্ণ ফ্রি</p>
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <button
              onClick={onOpenOrderModal}
              className="w-full sm:w-auto bg-[#ff5400] hover:bg-[#ea4900] text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Order on Messenger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href="https://maps.google.com/?q=Circuit+House+Field+Joypurhat"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-orange-100 hover:bg-orange-200 text-[#ff5400] text-xs sm:text-sm font-black px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Navigation className="w-4 h-4 text-[#ff5400]" />
              <span>Get Directions (ম্যাপ)</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
