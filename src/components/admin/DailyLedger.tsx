import React, { useState } from 'react';
import { SalesRecord, BazaarExpense, InventoryRecord } from '../../types';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  PieChart
} from 'lucide-react';

interface DailyLedgerProps {
  sales: SalesRecord[];
  bazaar: BazaarExpense[];
  inventory: InventoryRecord[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onRolloverInventory: () => void;
}

export const DailyLedger: React.FC<DailyLedgerProps> = ({
  sales,
  bazaar,
  inventory,
  selectedDate,
  onDateChange,
  onRolloverInventory,
}) => {
  const [dateFilterMode, setDateFilterMode] = useState<'today' | 'custom'>('today');
  const [isDayClosed, setIsDayClosed] = useState(false);

  // Filter sales and bazaar for current date
  const filteredSales = sales.filter((s) => s.date === selectedDate);
  const filteredBazaar = bazaar.filter((b) => b.date === selectedDate);

  // Calculations
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalBazaarExpense = filteredBazaar.reduce((acc, b) => acc + b.totalCost, 0);
  const netDailyProfit = totalSalesRevenue - totalBazaarExpense;

  const cashSales = filteredSales
    .filter((s) => s.paymentMethod === 'Cash')
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const bKashSales = filteredSales
    .filter((s) => s.paymentMethod === 'bKash' || s.paymentMethod === 'Nagad')
    .reduce((acc, s) => acc + s.totalAmount, 0);

  const totalItemsSold = filteredSales.reduce((acc, s) => acc + s.quantitySold, 0);

  // Breakdown of Bazaar expenses by Category
  const expenseByCategory: { [cat: string]: number } = {};
  filteredBazaar.forEach((item) => {
    expenseByCategory[item.category] = (expenseByCategory[item.category] || 0) + item.totalCost;
  });

  const handleCloseDay = () => {
    if (window.confirm(`Are you sure you want to CLOSE the ledger for ${selectedDate}? This will roll over remaining unsold inventory (${inventory.length} items) into tomorrow's opening stock.`)) {
      onRolloverInventory();
      setIsDayClosed(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Date Header & Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">Daily Accounts & Ledger</span>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>দৈনিক হিসাব ও লেজার</span>
            {isDayClosed && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Day Closed & Rolled
              </span>
            )}
          </h2>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Calendar className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-bold text-white focus:outline-none focus:border-brand"
            />
          </div>

          <button
            onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold whitespace-nowrap"
          >
            Today
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Sales */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#141722] to-[#12151d] border border-white/5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Sales</span>
            <div className="w-9 h-9 rounded-xl bg-brand/20 text-brand flex items-center justify-center font-bold">
              ৳
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">৳{totalSalesRevenue}</div>
            <p className="text-xs text-zinc-400 mt-1">{totalItemsSold} food portions sold</p>
          </div>
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Cash: <strong className="text-white">৳{cashSales}</strong></span>
            <span>bKash: <strong className="text-emerald-400">৳{bKashSales}</strong></span>
          </div>
        </div>

        {/* Total Bazaar Expenses */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#141722] to-[#12151d] border border-white/5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Bazaar & Supplies</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">৳{totalBazaarExpense}</div>
            <p className="text-xs text-zinc-400 mt-1">{filteredBazaar.length} purchase vouchers</p>
          </div>
          <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400">
            Chicken, Buns, Sauce, Tissue, Duster, Gas
          </div>
        </div>

        {/* Net Daily Profit */}
        <div className={`p-5 rounded-2xl bg-gradient-to-br from-[#141722] to-[#12151d] border ${
          netDailyProfit >= 0 ? 'border-emerald-500/30' : 'border-red-500/40'
        } shadow-xl space-y-3`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Net Day Profit</span>
            <div className={`w-9 h-9 rounded-xl ${
              netDailyProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            } flex items-center justify-center`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-black ${
              netDailyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              ৳{netDailyProfit}
            </div>
            <p className="text-xs text-zinc-400 mt-1">Sales − Raw Expenses</p>
          </div>
          <div className="pt-2 border-t border-zinc-800 text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            {netDailyProfit >= 0 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Healthy profit margin today</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-300">Expense exceeded revenue</span>
              </>
            )}
          </div>
        </div>

        {/* Day Close & Inventory Rollover Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1c1815] to-[#141722] border border-brand/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Day End Rollover</span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse"></span>
            </div>
            <h4 className="text-sm font-bold text-white">ইনভেন্টরি রোলওভার</h4>
            <p className="text-xs text-zinc-400 mt-1">
              দিনের শেষে অবিক্রীত স্টক স্বয়ংক্রিয়ভাবে আগামীকালের ওপেনিং স্টকে যুক্ত হবে।
            </p>
          </div>

          <button
            onClick={handleCloseDay}
            className="w-full mt-4 py-2.5 px-3 rounded-xl bg-brand hover:bg-orange-600 text-white font-extrabold text-xs shadow-md shadow-brand/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <span>Close Day & Rollover</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Two Column Breakdown: Bazaar Expense Breakdown & Sales Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bazaar Expense Categories */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand" />
              <span>আজকের বাজার খরচের খাতসমূহ (Bazaar Breakdown)</span>
            </h3>
            <span className="text-xs font-black text-brand">৳{totalBazaarExpense}</span>
          </div>

          {Object.keys(expenseByCategory).length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">আজকের কোনো বাজার এন্ট্রি নেই।</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(expenseByCategory).map(([cat, amount], idx) => {
                const percentage = totalBazaarExpense > 0 
                  ? Math.round((amount / totalBazaarExpense) * 100) 
                  : 0;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">{cat}</span>
                      <span className="font-bold text-white">৳{amount} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's Sales Items Summary */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>আজকের বিক্রিত আইটেম (Sales Breakdown)</span>
            </h3>
            <span className="text-xs font-black text-emerald-400">৳{totalSalesRevenue}</span>
          </div>

          {filteredSales.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">আজকে এখনো কোনো সেলস রেকর্ড হয়নি।</p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {filteredSales.map((s) => (
                <div 
                  key={s.id}
                  className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white">{s.itemName}</h5>
                    <p className="text-[11px] text-zinc-400">
                      {s.quantitySold} pcs @ ৳{s.unitPrice} • <span className="text-brand font-medium">{s.paymentMethod}</span>
                    </p>
                  </div>
                  <span className="font-black text-white text-sm">৳{s.totalAmount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

