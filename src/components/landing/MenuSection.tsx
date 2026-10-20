import React, { useState } from 'react';
import { MENU_ITEMS } from '../../data/menuData';
import { MenuItem } from '../../types';
import { Flame, Plus, Sparkles, Image, Check, Search } from 'lucide-react';

interface MenuSectionProps {
  onAddItemToCart: (item: MenuItem) => void;
  onOpenMenuPoster: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ 
  onAddItemToCart, 
  onOpenMenuPoster 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemIds, setAddedItemIds] = useState<{ [id: string]: boolean }>({});

  const categories = [
    { id: 'all', label: 'All Items (সব)' },
    { id: 'combos', label: 'Combos (কম্বো)' },
    { id: 'burgers', label: 'Burgers (বার্গার)' },
    { id: 'momos', label: 'Momos & Pizza (মোমো ও পিজ্জা)' },
    { id: 'snacks', label: 'Snacks & Meat Box' },
  ];

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.bengaliName && item.bengaliName.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  const handleAdd = (item: MenuItem) => {
    onAddItemToCart(item);
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  return (
    <section id="menu" className="py-16 sm:py-24 bg-zinc-950/80 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Menu & Prices</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              আমাদের অফিসিয়াল <span className="text-gradient-orange">মেনু তালিকা</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              প্রতিটি আইটেম ফ্রেশ উপাদানে তৈরি। আপনার পছন্দের আইটেম বেছে নিয়ে অর্ডারে যোগ করুন।
            </p>
          </div>

          {/* Quick action: View original Menu Card Poster */}
          <button
            onClick={onOpenMenuPoster}
            className="self-start md:self-end px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Image className="w-4 h-4 text-brand" />
            <span>অরিজিনাল মেনু কার্ড দেখুন (Menu Poster)</span>
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-brand text-white shadow-lg shadow-brand/25'
                    : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="আইটেম খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-brand focus:outline-none text-xs sm:text-sm text-white placeholder-zinc-500 transition-colors"
            />
          </div>

        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => {
            const isAdded = addedItemIds[item.id];

            return (
              <div
                key={item.id}
                className="rounded-2xl p-4 sm:p-5 bg-[#141721] border border-white/5 hover:border-brand/40 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800/80 px-2.5 py-0.5 rounded-md border border-zinc-700/60">
                      {item.portion || '1 portion'}
                    </span>
                    
                    {item.isHot && (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3 fill-red-400" />
                        <span>Hot</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Price */}
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand transition-colors">
                        {item.name}
                      </h3>
                      {item.bengaliName && (
                        <p className="text-xs text-brand font-medium">
                          {item.bengaliName}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xl font-black text-white">৳{item.price}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-2 font-normal leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Add to Order Button */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500">
                    Sadar Free Delivery
                  </span>
                  <button
                    onClick={() => handleAdd(item)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-brand/15 hover:bg-brand text-brand hover:text-white border border-brand/30'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>অর্ডারে যোগ করুন</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm">
            কোনো আইটেম পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে ট্রাই করুন।
          </div>
        )}

      </div>
    </section>
  );
};

