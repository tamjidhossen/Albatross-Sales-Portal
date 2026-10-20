import React from 'react';
import { Sparkles, Utensils, HeartHandshake, Zap, ShieldCheck } from 'lucide-react';

export const QuickHighlights: React.FC = () => {
  const highlights = [
    {
      icon: Utensils,
      title: 'ফ্রেশ ও স্বাস্থ্যকর প্রিপারেশন',
      subtitle: 'Daily Fresh Ingredients',
      description: 'প্রতিদিন সকালের ফ্রেশ চিকেন ও সফট বান। কোন ফ্রোজেন বা বাসি প্রিজারভেটিভ ব্যবহার করা হয় না।',
      tag: '100% Fresh',
      color: 'from-orange-500/20 to-amber-500/10',
      border: 'border-orange-500/30',
      iconColor: 'text-orange-400',
    },
    {
      icon: Sparkles,
      title: 'সেরা কম্বো অফার',
      subtitle: 'Unbeatable Value Combos',
      description: '১৬০৳ গুলটে ও ২২০৳ স্পেশাল কম্বো দিয়ে এক প্লেটেই মিট বক্স, বার্গার আর জুসি মোমো একসাথে!',
      tag: 'Best Value',
      color: 'from-brand/20 to-rose-500/10',
      border: 'border-brand/30',
      iconColor: 'text-brand',
    },
    {
      icon: HeartHandshake,
      title: 'সন্ধ্যায় সার্কিট হাউস মাঠ আড্ডা',
      subtitle: 'Joypurhat Hangout Spot',
      description: 'খোলামেলা মনোরম পরিবেশে ফ্রেন্ডস বা ফ্যামিলি নিয়ে বসে গরম গরম ফাস্টফুডের আসল আনন্দ।',
      tag: 'Open Vibes',
      color: 'from-rose-500/20 to-purple-500/10',
      border: 'border-rose-500/30',
      iconColor: 'text-rose-400',
    },
    {
      icon: Zap,
      title: 'মেসেঞ্জারে সুপারফাস্ট অর্ডার',
      subtitle: 'Instant Delivery & Pickup',
      description: 'মেসেঞ্জারে চ্যাট করেই নিমিষে অর্ডার কনফার্ম করুন। জয়পুরহাট সদর এলাকায় ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!',
      tag: 'Free Sadar Delivery',
      color: 'from-amber-500/20 to-yellow-500/10',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <section className="py-12 border-y border-white/5 bg-zinc-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand px-3 py-1 rounded-full bg-brand/10 border border-brand/20">
            Why Albatross Food Cart
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            স্বাদ, কোয়ালিটি আর আড্ডা — এক সাথে বেশি মজা!
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`relative rounded-2xl p-5 sm:p-6 bg-gradient-to-b ${item.color} ${item.border} border backdrop-blur-md hover:scale-[1.02] transition-transform duration-300 group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-zinc-900/90 flex items-center justify-center ${item.iconColor} shadow-inner`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1 group-hover:text-brand transition-colors">
                  {item.title}
                </h3>
                <p className="text-[11px] font-semibold text-zinc-400 mb-2">
                  {item.subtitle}
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

