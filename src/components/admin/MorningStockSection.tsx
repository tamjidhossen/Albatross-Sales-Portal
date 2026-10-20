import React, { useState } from 'react';
import { DailyInventoryItem } from '../../types';
import { Plus, Minus, Sun, Check, ArrowLeft, PlusCircle, X, Trash2 } from 'lucide-react';

interface MorningStockSectionProps {
  items: DailyInventoryItem[];
  onUpdateItem: (productId: string, morningNewPrepared: number) => void;
  onAddProduct: (name: string, price: number, prepared: number) => void;
  onDeleteItem: (productId: string) => void;
  onBack: () => void;
  isLocked: boolean;
}

export const MorningStockSection: React.FC<MorningStockSectionProps> = ({
  items,
  onUpdateItem,
  onAddProduct,
  onDeleteItem,
  onBack,
  isLocked,
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdPrepared, setNewProdPrepared] = useState('20');

  const totalPrepared = items.reduce((sum, item) => sum + item.morningNewPrepared, 0);
  const totalLeftovers = items.reduce((sum, item) => sum + item.morningCarriedOver, 0);
  const totalAvailable = items.reduce((sum, item) => sum + item.totalAvailable, 0);
  const totalStockValue = items.reduce((sum, item) => sum + (item.totalAvailable * item.unitPrice), 0);

  const handleAdjust = (productId: string, current: number, delta: number) => {
    if (isLocked) return;
    const nextVal = Math.max(0, current + delta);
    onUpdateItem(productId, nextVal);
  };

  const handleDirectInput = (productId: string, val: string) => {
    if (isLocked) return;
    const parsed = parseInt(val, 10);
    onUpdateItem(productId, isNaN(parsed) ? 0 : Math.max(0, parsed));
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(newProdPrice);
    const prepNum = parseInt(newProdPrepared, 10) || 0;
    if (!newProdName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    onAddProduct(newProdName.trim(), priceNum, Math.max(0, prepNum));
    setNewProdName('');
    setNewProdPrice('');
    setNewProdPrepared('20');
    setIsAddingProduct(false);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-2.5">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold flex items-center gap-1 transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-orange-500" />
          <span>Opening Stock</span>
        </span>

        {!isLocked && (
          <button
            onClick={() => setIsAddingProduct(!isAddingProduct)}
            className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        )}
      </div>

      {/* Inline Add Product Form */}
      {isAddingProduct && !isLocked && (
        <form onSubmit={handleAddProductSubmit} className="bg-orange-50/70 border border-orange-200 rounded-xl p-3 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-900 flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5 text-orange-600" />
              <span>Add New Food Item</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAddingProduct(false)}
              className="text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">Product Name</label>
              <input
                type="text"
                required
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                placeholder="e.g. Chicken Shawarma Box"
                className="w-full h-8 rounded-lg bg-white border border-zinc-300 px-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">Unit Price (৳)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newProdPrice}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setNewProdPrice(e.target.value.replace(/^0+(?=\d)/, ''))}
                  placeholder="120"
                  className="w-full h-8 rounded-lg bg-white border border-zinc-300 px-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">Prepared Morning</label>
                <input
                  type="number"
                  min="0"
                  value={newProdPrepared}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setNewProdPrepared(e.target.value.replace(/^0+(?=\d)/, ''))}
                  placeholder="20"
                  className="w-full h-8 rounded-lg bg-white border border-zinc-300 px-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingProduct(false)}
              className="flex-1 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 font-medium text-xs hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs"
            >
              Add to Menu
            </button>
          </div>
        </form>
      )}

      {/* Aggregate Banner (Compact) */}
      <div className="bg-white rounded-xl p-2.5 border border-zinc-200 shadow-xs">
        <div className="grid grid-cols-4 gap-1 text-center divide-x divide-zinc-100">
          <div>
            <span className="text-[10px] text-zinc-500 block">Leftover</span>
            <span className="text-sm font-bold text-zinc-700 block mt-0.5">+{totalLeftovers}</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block">Prepared</span>
            <span className="text-sm font-bold text-zinc-900 block mt-0.5">+{totalPrepared}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-700 block">Available</span>
            <span className="text-sm font-black text-zinc-900 block mt-0.5">{totalAvailable}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-orange-600 block">Food Value</span>
            <span className="text-sm font-black text-orange-600 block mt-0.5">৳{totalStockValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[11px] text-amber-900 font-semibold text-center">
          Day is locked. Unlock to modify stock counts.
        </div>
      )}

      {/* Products Opening Entry List (High Density) */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-xl p-2.5 border border-zinc-200 shadow-xs space-y-2"
          >
            {/* Title & Price */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-900 block">{item.productName}</span>
                <span className="text-[10px] text-zinc-500">৳{item.unitPrice} each</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.morningCarriedOver > 0 && (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    +{item.morningCarriedOver} leftover
                  </span>
                )}

                {!isLocked && (
                  confirmDeleteId === item.productId ? (
                    <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-0.5 rounded-lg">
                      <span className="text-[9px] text-red-700 font-bold px-1">Delete?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteItem(item.productId);
                          setConfirmDeleteId(null);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.5 rounded text-[9px] font-bold"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-1 py-0.5 rounded text-[9px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.productId)}
                      className="p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete item from day"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Stepper & Counter */}
            <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100">
              <span className="text-[11px] text-zinc-600 font-medium">New Made:</span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isLocked || item.morningNewPrepared <= 0}
                  onClick={() => handleAdjust(item.productId, item.morningNewPrepared, -5)}
                  className="w-7 h-7 rounded-md border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold text-[10px] flex items-center justify-center transition disabled:opacity-40"
                  title="Minus 5"
                >
                  -5
                </button>

                <button
                  type="button"
                  disabled={isLocked || item.morningNewPrepared <= 0}
                  onClick={() => handleAdjust(item.productId, item.morningNewPrepared, -1)}
                  className="w-7 h-7 rounded-md border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition disabled:opacity-40"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <input
                  type="number"
                  disabled={isLocked}
                  value={item.morningNewPrepared}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleDirectInput(item.productId, e.target.value.replace(/^0+(?=\d)/, ''))}
                  className="w-12 h-7 rounded-md border border-zinc-300 bg-white text-center font-bold text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />

                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleAdjust(item.productId, item.morningNewPrepared, 1)}
                  className="w-7 h-7 rounded-md border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition"
                >
                  <Plus className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleAdjust(item.productId, item.morningNewPrepared, 5)}
                  className="w-7 h-7 rounded-md border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold text-[10px] flex items-center justify-center transition"
                  title="Plus 5"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Total Available Bar */}
            <div className="flex items-center justify-between text-[11px] bg-zinc-50 border border-zinc-100 px-2 py-1 rounded-lg">
              <span className="text-zinc-500">Available to sell:</span>
              <span className="font-bold text-zinc-900">
                {item.totalAvailable} pcs <span className="text-orange-600 font-semibold">(৳{item.totalAvailable * item.unitPrice})</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      {!isLocked && (
        <button
          onClick={handleSave}
          className="w-full bg-zinc-900 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-[0.99] shadow-xs flex items-center justify-center gap-1.5"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Opening Stock Saved</span>
            </>
          ) : (
            <span>Save Opening Stock</span>
          )}
        </button>
      )}

    </div>
  );
};
