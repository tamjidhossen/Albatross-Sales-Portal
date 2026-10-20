import React from 'react';
import { MapPin, Clock, Award, ShieldCheck, Heart } from 'lucide-react';

export const CartStory: React.FC = () => {
  return (
    <section id="story" className="py-16 sm:py-24 relative overflow-hidden bg-gradient-to-b from-[#0b0d13] via-[#11141c] to-[#0b0d13]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Authentic Photography Grid */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
              <img 
                src="/assets/images/food-cart-sliders.jpeg" 
                alt="Albatross Food Cart in Joypurhat" 
                className="w-full h-80 sm:h-96 object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand animate-ping"></div>
                  <span className="text-xs font-bold tracking-wide">সার্কিট হাউস মাঠ স্পট</span>
                </div>
                <span className="text-xs bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  Daily 4:00 PM - 10:30 PM
                </span>
              </div>
            </div>

            {/* Sub-banner: Cheesy Pizza and Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] group">
                <img 
                  src="/assets/images/bread-pizza.jpeg" 
                  alt="Cheesy Bread Pizza Freshly Baked" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <span className="absolute bottom-2.5 left-2.5 text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded">
                  ১০০৳ ব্রেড পিজ্জা
                </span>
              </div>

              <div className="rounded-2xl p-4 bg-zinc-900/90 border border-brand/30 flex flex-col justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-brand/20 text-brand flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">১৫০+</div>
                <div className="text-xs text-zinc-400 font-medium">প্রতিদিন হ্যাপি কাস্টমার</div>
              </div>
            </div>

          </div>

          {/* Right Column: Story & Quality Promise */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand/15 border border-brand/30 text-brand text-xs font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-brand" />
              <span>Behind The Cart • আমাদের গল্প</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              স্ট্রিট ফুডের আসল মজা, <br />
              <span className="text-gradient-orange">হাইজেনিক পরিচ্ছন্নতায় বিশ্বাসী!</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              জয়পুরহাট সার্কিট হাউস মাঠে আমরা যখন <strong>Albatross Food Cart</strong> শুরু করি, আমাদের একটিই লক্ষ্য ছিল — স্ট্রিট ফুড হবে অত্যন্ত সুস্বাদু, খাঁটি উপাদানে ভরপুর এবং দাম থাকবে সবার নাগালের মধ্যে।
            </p>

            <p className="text-sm text-zinc-400 leading-relaxed">
              আমরা প্রতিদিন বাজার থেকে সরাসরি ফ্রেশ ব্রয়লার চিকেন কিনে ম্যারিনেট করি। স্পেশাল সসগুলো আমাদের নিজেদের রেসিপিতে তৈরি। প্রতিটি বার্গার বান নরম তুলতুলে আর মোমোর পুরে থাকে ভরপুর মাংসের জুসিনেস।
            </p>

            {/* Quality Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">দৈনিক ফ্রেশ বাজার ও প্রিপারেশন</h4>
                  <p className="text-xs text-zinc-400">বাসি উপাদান বা ফ্রোজেন মিট নয়, প্রতিদিন বিকেল ৩টায় টাটকা তৈরি করে ৪টায় কার্ট ওপেন করি।</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand/20 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">সার্কিট হাউস মাঠের প্রাণবন্ত মিলনমেলা</h4>
                  <p className="text-xs text-zinc-400">বন্ধুদের সাথে গল্প, হাওয়া খাওয়া আর গরম গরম ফুডের পারফেক্ট কম্বিনেশন।</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">সুপারফাস্ট সার্ভিস</h4>
                  <p className="text-xs text-zinc-400">অর্ডার করার মাত্র ৫ থেকে ৮ মিনিটের মধ্যে লাইভ হট সার্ভ করা হয়।</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

