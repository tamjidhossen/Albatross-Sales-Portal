import React, { useState } from 'react';
import { DynamicCategory, Role } from '../../types';
import { Plus, X, Tag, Trash2, ShieldCheck, Check } from 'lucide-react';

interface DynamicCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: DynamicCategory[];
  onAddCategory: (newCategory: Omit<DynamicCategory, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  userRole: Role;
}

export const DynamicCategoryModal: React.FC<DynamicCategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  userRole,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [catType, setCatType] = useState<'bazaar' | 'inventory_unit' | 'vendor'>('bazaar');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddCategory({
      type: catType,
      name: newCatName.trim(),
      description: newCatDescription.trim() || undefined,
      createdBy: userRole === 'super_admin' ? 'Super Admin' : 'Admin',
      isSystem: false,
    });

    setNewCatName('');
    setNewCatDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#141722] border border-brand/30 rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand/20 text-brand flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Dynamic Dropdown Categories</h3>
              <p className="text-xs text-zinc-400">Add or manage categories for Bazaar, Units & Vendors</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Add Category Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>নতুন ক্যাটাগরি তৈরি করুন (Add New Option)</span>
            </h4>

            <div>
              <label className="text-xs text-zinc-300 block mb-1">Target Dropdown:</label>
              <select
                value={catType}
                onChange={(e) => setCatType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-brand"
              >
                <option value="bazaar">Bazaar Expense Category (বাজার ক্যাটাগরি)</option>
                <option value="inventory_unit">Inventory Unit (একক যেমন: kg, pcs, box)</option>
                <option value="vendor">Vendor / Shop Name (দোকান বা ভেন্ডর)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-300 block mb-1">Category / Item Name:</label>
              <input
                type="text"
                placeholder="e.g. Cleaning Supplies, Duster, Cooking Oil..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-300 block mb-1">Description (Optional):</label>
              <input
                type="text"
                placeholder="Brief note about this category"
                value={newCatDescription}
                onChange={(e) => setNewCatDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Dropdown</span>
            </button>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Active Dropdown Categories ({categories.length})
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{cat.name}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {cat.type}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-[11px] text-zinc-400 mt-0.5">{cat.description}</p>
                    )}
                  </div>

                  {userRole === 'super_admin' && !cat.isSystem ? (
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete custom category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : cat.isSystem ? (
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-brand" />
                      <span>System</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500">Custom</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

