import React from 'react';
import { Flame, Sparkles, Clock } from 'lucide-react';

export const CartVibeSection: React.FC = () => {
  return (
    <section id="vibe" className="py-10 sm:py-16 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="frost-card-solid rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 shadow-2xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* 2 Square Images */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-2.5 sm:gap-3.5">
              <div className="rounded-2xl overflow-hidden aspect-square bg-orange-100 shadow">
                <img 
                  src="/assets/images/bread-pizza.jpeg" 
                  alt="Cheesy Bread Pizza" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="rounded-2xl overflow-hidden aspect-square bg-orange-100 shadow">
                <img 
                  src="/assets/images/food-cart-sliders.jpeg" 
                  alt="Albatross Sliders" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Quality Points */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] uppercase text-[#ff5400] block mb-1">
                  The Albatross Standard
                </span>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-[#180802] tracking-tight">
                  FRESH INGREDIENTS. ZERO COMPROMISE.
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5400] flex items-center justify-center flex-shrink-0 mt-0.5 border border-orange-200">
                    <Flame className="w-4 h-4 fill-[#ff5400]" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#180802] text-xs sm:text-sm">দৈনিক ফ্রেশ বাজার</h4>
                    <p className="text-zinc-600 text-[11px] sm:text-xs font-medium">প্রতিদিন বিকেল ৩টায় টাটকা তৈরি করে ৪টায় লাইভ কার্ট চালু করি। বাসি বা ফ্রোজেন নয়।</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff5400] flex items-center justify-center flex-shrink-0 mt-0.5 border border-orange-200">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#180802] text-xs sm:text-sm">সার্কিট হাউস মাঠ আড্ডা</h4>
                    <p className="text-zinc-600 text-[11px] sm:text-xs font-medium">খোলামেলা মনোরম পরিবেশে ফ্রেন্ডস ও ফ্যামিলির সাথে সন্ধ্যার আসল ফুড হ্যাঙ্গআউট।</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-200">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-[#180802] text-xs sm:text-sm">৫-৮ মিনিটে লাইভ সার্ভ ও ফ্রি সদর ডেলিভারি</h4>
                    <p className="text-zinc-600 text-[11px] sm:text-xs font-medium">মেসেঞ্জারে নক করলেই তাত্ক্ষণিক কনফার্মেশন। জয়পুরহাট সদরে ডেলিভারি চার্জ ফ্রি!</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
