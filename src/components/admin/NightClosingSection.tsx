import React, { useState } from 'react';
import { DailyInventoryItem } from '../../types';
import { Moon, ArrowLeft, Check } from 'lucide-react';

interface NightClosingSectionProps {
  items: DailyInventoryItem[];
  estimatedDiscounts: number;
  onUpdateNightCount: (
    productId: string, 
    sold: number, 
    waste: number
  ) => void;
  onUpdateDiscounts: (discounts: number) => void;
  onBack: () => void;
  isLocked: boolean;
}

export const NightClosingSection: React.FC<NightClosingSectionProps> = ({
  items,
  estimatedDiscounts,
  onUpdateNightCount,
  onUpdateDiscounts,
  onBack,
  isLocked,
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalSold = items.reduce((sum, item) => sum + item.quantitySold, 0);
  const grossRevenue = items.reduce((sum, item) => sum + item.estimatedRevenue, 0);
  const netRevenue = Math.max(0, grossRevenue - estimatedDiscounts);

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
          <Moon className="w-4 h-4 text-amber-500" />
          <span>Closing Count</span>
        </span>

        <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
          ৳{netRevenue.toLocaleString()}
        </span>
      </div>

      {/* Aggregate Banner (Compact) */}
      <div className="bg-white rounded-xl p-2.5 border border-zinc-200 shadow-xs">
        <div className="grid grid-cols-3 gap-1 text-center divide-x divide-zinc-100">
          <div>
            <span className="text-[10px] text-zinc-500 block">Total Sold</span>
            <span className="text-sm font-bold text-zinc-900 block mt-0.5">{totalSold} pcs</span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block">Gross Sales</span>
            <span className="text-sm font-bold text-zinc-900 block mt-0.5">৳{grossRevenue.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-orange-600 block">Net Revenue</span>
            <span className="text-sm font-black text-orange-600 block mt-0.5">৳{netRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[11px] text-amber-900 font-semibold text-center">
          Day is locked. Unlock to modify closing counts.
        </div>
      )}

      {/* Products Closing Count List (High Density) */}
      <div className="space-y-2">
        {items.map((item) => {
          const leftoverTomorrow = Math.max(0, item.totalAvailable - item.quantitySold - item.closingWasted);

          return (
            <div
              key={item.productId}
              className="bg-white rounded-xl p-2.5 border border-zinc-200 shadow-xs space-y-2"
            >
              {/* Header: Product & Available */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-zinc-900 block">{item.productName}</span>
                  <span className="text-[10px] text-zinc-500">
                    Available: <strong className="text-zinc-800">{item.totalAvailable} pcs</strong> @ ৳{item.unitPrice}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-black text-orange-600 block">
                    ৳{item.estimatedRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Inputs: Sold & Waste (Compact Side-by-Side) */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-100">
                
                {/* Sold Pieces */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-zinc-600 font-bold">Sold (pcs)</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={item.totalAvailable}
                    disabled={isLocked}
                    value={item.quantitySold}
                    onChange={(e) => {
                      const soldVal = Math.max(0, parseInt(e.target.value, 10) || 0);
                      onUpdateNightCount(item.productId, soldVal, item.closingWasted);
                    }}
                    className="w-full h-7 rounded bg-white border border-zinc-300 text-center font-bold text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Wasted Pieces */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-zinc-600 font-bold">Waste (pcs)</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={item.totalAvailable}
                    disabled={isLocked}
                    value={item.closingWasted}
                    onChange={(e) => {
                      const wasteVal = Math.max(0, parseInt(e.target.value, 10) || 0);
                      onUpdateNightCount(item.productId, item.quantitySold, wasteVal);
                    }}
                    className="w-full h-7 rounded bg-white border border-zinc-300 text-center font-bold text-sm text-red-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

              </div>

              {/* Derived Auto Reusable Status */}
              <div className="flex items-center justify-between text-[10px] bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">
                <span className="text-zinc-500">Reusable for tomorrow:</span>
                <span className={`font-bold ${leftoverTomorrow > 0 ? 'text-emerald-700' : 'text-zinc-500'}`}>
                  {leftoverTomorrow} pcs leftover
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Estimated Discounts Adjustment Card (Compact) */}
      <div className="bg-white rounded-xl p-2.5 border border-zinc-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="font-bold text-xs text-zinc-900 block">
            Discounts Given Today
          </span>
          <span className="text-[10px] text-zinc-400">
            Rough estimate of total discounts given
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-zinc-400">৳</span>
          <input
            type="number"
            min="0"
            disabled={isLocked}
            value={estimatedDiscounts}
            onChange={(e) => onUpdateDiscounts(Math.max(0, parseInt(e.target.value, 10) || 0))}
            placeholder="0"
            className="w-16 h-7 rounded-lg border border-zinc-300 bg-white text-center font-bold text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Save Button */}
      {!isLocked && (
        <button
          onClick={handleSave}
          className="w-full bg-zinc-900 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-[0.99] shadow-xs flex items-center justify-center gap-1.5"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Closing Count Saved</span>
            </>
          ) : (
            <span>Save Closing Count</span>
          )}
        </button>
      )}

    </div>
  );
};
