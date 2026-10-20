import React, { useState, useMemo } from 'react';
import { DailySession, DailyInventoryItem, DailyExpense, DailyPayout } from '../../types';
import { DayData } from '../../data/mockDailyData';
import { 
  Sun, 
  Moon, 
  Receipt, 
  Wallet, 
  Lock, 
  Unlock, 
  PiggyBank, 
  Download, 
  BarChart3, 
  Calendar, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Store,
  Plus
} from 'lucide-react';
import { downloadAnalyticsReportImage } from '../../utils/generateAnalyticsImage';
import { LockConfirmationModal } from './LockConfirmationModal';
import { getTodayDateString } from '../../services/dailyOperationsService';

interface DailyDashboardOverviewProps {
  session: DailySession | null;
  items: DailyInventoryItem[];
  expenses: DailyExpense[];
  payouts: DailyPayout[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onNavigateTab: (tab: 'opening' | 'closing' | 'expenses' | 'cash') => void;
  onToggleLock?: () => void;
  onStartShift?: (openingCash: number) => void;
  isSuperAdmin: boolean;
  allSessionsData: Record<string, DayData>;
}

export const DailyDashboardOverview: React.FC<DailyDashboardOverviewProps> = ({
  session,
  items,
  expenses,
  payouts,
  selectedDate,
  onSelectDate,
  onNavigateTab,
  onToggleLock,
  onStartShift,
  isSuperAdmin,
  allSessionsData,
}) => {
  // Analytics state
  const [analyticsPreset, setAnalyticsPreset] = useState<'today' | '7days' | '30days' | 'custom'>('today');
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  const [isDownloadingAnalytics, setIsDownloadingAnalytics] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState('1000');

  const isOperated = Boolean(session);
  const todayStr = useMemo(() => getTodayDateString(), []);
  const isViewingToday = selectedDate === todayStr;

  // Format date display (e.g. 19 Oct 2026, Mon)
  const formattedDate = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const parts = selectedDate.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setDate(d.getDate() - 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${yr}-${mo}-${day}`);
  };

  const handleNextDay = () => {
    const parts = selectedDate.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    d.setDate(d.getDate() + 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onSelectDate(`${yr}-${mo}-${day}`);
  };

  // Full Analytics Calculation Engine
  const analyticsData = useMemo(() => {
    let calcStartDate = selectedDate;
    let calcEndDate = selectedDate;

    if (analyticsPreset === 'today') {
      calcStartDate = selectedDate;
      calcEndDate = selectedDate;
    } else if (analyticsPreset === '7days') {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() - 6);
      calcStartDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      calcEndDate = selectedDate;
    } else if (analyticsPreset === '30days') {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      d.setDate(d.getDate() - 29);
      calcStartDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      calcEndDate = selectedDate;
    } else if (analyticsPreset === 'custom') {
      calcStartDate = startDate;
      calcEndDate = endDate;
    }

    const d1 = new Date(calcStartDate).getTime();
    const d2 = new Date(calcEndDate).getTime();
    const days = Math.max(1, Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1);

    // Aggregate sessions in range from allSessionsData
    const rangeSessions: DayData[] = [];
    Object.keys(allSessionsData).forEach((dateKey) => {
      if (dateKey >= calcStartDate && dateKey <= calcEndDate) {
        rangeSessions.push(allSessionsData[dateKey]);
      }
    });

    let grossSales = 0;
    let discounts = 0;
    let netSales = 0;
    let totalExp = 0;
    let totalPay = 0;
    let totalPrepared = 0;
    let totalSold = 0;
    let totalWaste = 0;

    const productMap: Record<string, { name: string; unitPrice: number; sold: number; wasted: number; revenue: number }> = {};
    const expenseCategoryMap: Record<string, number> = {};
    const payoutMap: Record<string, { recipientName: string; payoutType: string; amount: number }> = {};

    if (rangeSessions.length > 0) {
      rangeSessions.forEach((day) => {
        // Derive gross sales directly from items so breakdown and gross sales ALWAYS match 100%
        const dayGross = day.items.reduce((sum, item) => sum + item.estimatedRevenue, 0);
        const dayDiscounts = day.session.estimatedDiscounts || 0;
        const dayExp = day.expenses.reduce((sum, e) => sum + e.amount, 0);
        const dayPay = day.payouts.reduce((sum, p) => sum + p.amount, 0);

        grossSales += dayGross;
        discounts += dayDiscounts;
        netSales += Math.max(0, dayGross - dayDiscounts);
        totalExp += dayExp;
        totalPay += dayPay;
        totalPrepared += day.items.reduce((sum, item) => sum + item.totalAvailable, 0);
        totalSold += day.items.reduce((sum, item) => sum + item.quantitySold, 0);
        totalWaste += day.items.reduce((sum, item) => sum + item.closingWasted, 0);

        // Products
        day.items.forEach((item) => {
          if (!productMap[item.productId]) {
            productMap[item.productId] = { name: item.productName, unitPrice: item.unitPrice, sold: 0, wasted: 0, revenue: 0 };
          }
          productMap[item.productId].sold += item.quantitySold;
          productMap[item.productId].wasted += item.closingWasted;
          productMap[item.productId].revenue += item.estimatedRevenue;
        });

        // Expenses
        day.expenses.forEach((exp) => {
          expenseCategoryMap[exp.category] = (expenseCategoryMap[exp.category] || 0) + exp.amount;
        });

        // Payouts
        day.payouts.forEach((p) => {
          const key = `${p.recipientName}-${p.payoutType}`;
          if (!payoutMap[key]) {
            payoutMap[key] = { recipientName: p.recipientName, payoutType: p.payoutType, amount: 0 };
          }
          payoutMap[key].amount += p.amount;
        });
      });

      // If simulated multi-day range exceeds the available historical sessions count, scale proportionally
      if (days > rangeSessions.length && rangeSessions.length > 0) {
        const factor = days / rangeSessions.length;
        grossSales = Math.round(grossSales * factor);
        discounts = Math.round(discounts * factor);
        netSales = Math.round(netSales * factor);
        totalExp = Math.round(totalExp * factor);
        totalPay = Math.round(totalPay * factor);
        totalPrepared = Math.round(totalPrepared * factor);
        totalSold = Math.round(totalSold * factor);
        totalWaste = Math.round(totalWaste * factor);

        Object.keys(productMap).forEach((id) => {
          productMap[id].sold = Math.round(productMap[id].sold * factor);
          productMap[id].wasted = Math.round(productMap[id].wasted * factor);
          productMap[id].revenue = Math.round(productMap[id].revenue * factor);
        });

        Object.keys(expenseCategoryMap).forEach((cat) => {
          expenseCategoryMap[cat] = Math.round(expenseCategoryMap[cat] * factor);
        });

        Object.keys(payoutMap).forEach((k) => {
          payoutMap[k].amount = Math.round(payoutMap[k].amount * factor);
        });
      }
    } else if (session) {
      const activeGross = items.reduce((sum, item) => sum + item.estimatedRevenue, 0);
      grossSales = activeGross * days;
      discounts = (session.estimatedDiscounts || 0) * days;
      netSales = Math.max(0, grossSales - discounts);
      totalExp = expenses.reduce((sum, e) => sum + e.amount, 0) * days;
      totalPay = payouts.reduce((sum, p) => sum + p.amount, 0) * days;
      totalPrepared = items.reduce((sum, item) => sum + item.totalAvailable, 0) * days;
      totalSold = items.reduce((sum, item) => sum + item.quantitySold, 0) * days;
      totalWaste = items.reduce((sum, item) => sum + item.closingWasted, 0) * days;

      items.forEach((item) => {
        productMap[item.productId] = {
          name: item.productName,
          unitPrice: item.unitPrice,
          sold: item.quantitySold * days,
          wasted: item.closingWasted * days,
          revenue: item.estimatedRevenue * days,
        };
      });

      expenses.forEach((exp) => {
        expenseCategoryMap[exp.category] = (expenseCategoryMap[exp.category] || 0) + (exp.amount * days);
      });

      payouts.forEach((p) => {
        const key = `${p.recipientName}-${p.payoutType}`;
        payoutMap[key] = {
          recipientName: p.recipientName,
          payoutType: p.payoutType,
          amount: p.amount * days,
        };
      });
    }

    const netProfit = netSales - totalExp - totalPay;
    const profitMargin = netSales > 0 ? Math.round((netProfit / netSales) * 1000) / 10 : 0;
    const avgDailySales = Math.round(netSales / days);
    const avgDailyProfit = Math.round(netProfit / days);

    // Products list
    const products = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);

    // Expense categories list
    const totalExpSum = Object.values(expenseCategoryMap).reduce((s, v) => s + v, 0) || 1;
    const expenseCategories = Object.entries(expenseCategoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentShare: Math.round((amount / totalExpSum) * 1000) / 10,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Payouts list
    const aggregatedPayouts = Object.values(payoutMap).sort((a, b) => b.amount - a.amount);

    // Closing cash reserve for the latest day in range
    let closingReserve = session?.closingSavedCash || 21000;
    if (rangeSessions.length > 0) {
      const sortedRange = [...rangeSessions].sort((a, b) => a.session.sessionDate.localeCompare(b.session.sessionDate));
      closingReserve = sortedRange[sortedRange.length - 1].session.closingSavedCash || 0;
    }

    return {
      calcStartDate,
      calcEndDate,
      days,
      grossSales,
      discounts,
      netSales,
      totalExp,
      totalPay,
      netProfit,
      profitMargin,
      avgDailySales,
      avgDailyProfit,
      totalPrepared,
      totalSold,
      totalWaste,
      closingReserve,
      products,
      expenseCategories,
      payouts: aggregatedPayouts,
    };
  }, [selectedDate, analyticsPreset, startDate, endDate, allSessionsData, session, items, expenses, payouts]);

  // Download Comprehensive Date-Range Analytics Report Image
  const handleDownloadAnalyticsImage = () => {
    setIsDownloadingAnalytics(true);
    try {
      const presetLabel =
        analyticsPreset === 'today'
          ? 'Today'
          : analyticsPreset === '7days'
          ? 'Last 7 Days'
          : analyticsPreset === '30days'
          ? 'Last 30 Days'
          : `Custom (${analyticsData.days} Days)`;

      downloadAnalyticsReportImage({
        startDate: analyticsData.calcStartDate,
        endDate: analyticsData.calcEndDate,
        days: analyticsData.days,
        presetLabel,
        grossSales: analyticsData.grossSales,
        discounts: analyticsData.discounts,
        netSales: analyticsData.netSales,
        totalExp: analyticsData.totalExp,
        totalPay: analyticsData.totalPay,
        netProfit: analyticsData.netProfit,
        profitMargin: analyticsData.profitMargin,
        avgDailySales: analyticsData.avgDailySales,
        avgDailyProfit: analyticsData.avgDailyProfit,
        totalPrepared: analyticsData.totalPrepared,
        totalSold: analyticsData.totalSold,
        totalWaste: analyticsData.totalWaste,
        closingReserve: analyticsData.closingReserve,
        products: analyticsData.products,
        expenseCategories: analyticsData.expenseCategories,
        payouts: analyticsData.payouts,
      });
    } finally {
      setTimeout(() => setIsDownloadingAnalytics(false), 800);
    }
  };

  const khuchra = session?.khuchraTakenFromReserve || session?.openingCash || 0;

  return (
    <div className="space-y-3 font-sans">
      
      {/* 1. DAILY OPERATIONS DATE HEADER (Clean, intuitive) */}
      <div className="bg-white rounded-xl p-3 border border-zinc-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider block">
            Daily Operations
          </span>

          <div className="flex items-center gap-1.5">
            {isOperated ? (
              session?.isLocked ? (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-bold">
                  <Lock className="w-3 h-3 text-zinc-600" />
                  <span>Locked</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  <Unlock className="w-3 h-3 text-emerald-600" />
                  <span>Shift Open</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 text-[10px] font-bold">
                <span>Cart Closed</span>
              </div>
            )}

            {isOperated && isSuperAdmin && onToggleLock && (
              <button
                onClick={() => {
                  if (session?.isLocked) {
                    onToggleLock();
                  } else {
                    setIsLockModalOpen(true);
                  }
                }}
                className="text-[10px] px-2 py-0.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold transition"
              >
                {session?.isLocked ? 'Unlock' : 'Lock'}
              </button>
            )}
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevDay}
              className="w-7 h-7 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition active:scale-95"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Tap-to-pick Native Date Input */}
            <label className="relative flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg px-2.5 py-1 cursor-pointer transition active:scale-98">
              <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span className="text-xs font-extrabold text-zinc-900 tracking-tight">
                {formattedDate}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && onSelectDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>

            <button
              onClick={handleNextDay}
              className="w-7 h-7 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition active:scale-95"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isViewingToday && (
            <button
              onClick={() => onSelectDate(todayStr)}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 transition"
            >
              Back to Today
            </button>
          )}
        </div>

        {/* Notice for Locked historical view */}
        {isOperated && session?.isLocked && (
          <div className={`rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[11px] border ${
            isSuperAdmin
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-zinc-100/90 border border-zinc-200 text-zinc-600'
          }`}>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isSuperAdmin
                  ? '🔒 Shift locked for staff • Super Admin edit access enabled'
                  : 'Shift sealed. All calculations view-only.'}
              </span>
            </div>
            {isSuperAdmin && onToggleLock && (
              <button
                type="button"
                onClick={onToggleLock}
                className="font-bold text-[10px] underline hover:text-amber-950 ml-2 shrink-0"
              >
                Unlock Day
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. IF CART WAS NOT OPERATED ON THIS DAY */}
      {!session ? (
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 text-center space-y-3 shadow-xs font-sans">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-200">
            <Store className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-900">
              {isViewingToday ? "Food Cart Not Started Today" : "Food Cart Closed"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
              {isViewingToday 
                ? "Start today's shift to begin recording morning stock, sales, expenses, and cash drawer counts."
                : `No business operations were recorded for ${formattedDate}.`}
            </p>
          </div>

          {isViewingToday ? (
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => setIsStartModalOpen(true)}
                className="w-full max-w-xs py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Sun className="w-4 h-4 text-white" />
                <span>Start Today's Shift</span>
              </button>
            </div>
          ) : (
            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2">
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setIsStartModalOpen(true)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Add Shift Record for {formattedDate}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => onSelectDate(todayStr)}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs transition"
              >
                Back to Today
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Cash Reserve Block (Clean: Big Total + Bottom Text only) */}
          <div className="bg-gradient-to-br from-[#EA4300] to-orange-600 rounded-2xl p-3.5 text-white shadow-sm">
            <div className="flex items-center gap-1.5 text-orange-100 text-[11px] font-bold uppercase tracking-wider">
              <PiggyBank className="w-4 h-4 text-yellow-300" />
              <span>Total Cash Reserve</span>
            </div>
            <div className="text-2xl font-black tracking-tight mt-0.5">
              ৳{(session.closingSavedCash + khuchra).toLocaleString()}
            </div>
            <span className="text-[11px] text-orange-100/90 font-medium block mt-1">
              Saved Cash (৳{session.closingSavedCash.toLocaleString()}) + Khuchra (৳{khuchra.toLocaleString()})
            </span>
          </div>

          {/* 2x2 High-Density Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* Opening */}
            <button
              onClick={() => onNavigateTab('opening')}
              className="bg-white hover:border-orange-300 border border-zinc-200 text-left p-3 rounded-xl transition active:scale-[0.98] shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
                  <Sun className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                  {session.totalProductsPrepared} pcs
                </span>
              </div>
              <div className="mt-2 font-bold text-xs text-zinc-900 group-hover:text-orange-600 transition">
                Opening Stock
              </div>
            </button>

            {/* Closing */}
            <button
              onClick={() => onNavigateTab('closing')}
              className="bg-white hover:border-orange-300 border border-zinc-200 text-left p-3 rounded-xl transition active:scale-[0.98] shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <Moon className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                  {session.totalProductsSold} sold
                </span>
              </div>
              <div className="mt-2 font-bold text-xs text-zinc-900 group-hover:text-orange-600 transition">
                Closing Count
              </div>
            </button>

            {/* Expenses */}
            <button
              onClick={() => onNavigateTab('expenses')}
              className="bg-white hover:border-orange-300 border border-zinc-200 text-left p-3 rounded-xl transition active:scale-[0.98] shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
                  <Receipt className="w-3.5 h-3.5 text-red-600" />
                </div>
                <span className="text-[10px] font-bold bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                  ৳{session.totalExpenses}
                </span>
              </div>
              <div className="mt-2 font-bold text-xs text-zinc-900 group-hover:text-orange-600 transition">
                Expenses
              </div>
            </button>

            {/* Cash & Payouts */}
            <button
              onClick={() => onNavigateTab('cash')}
              className="bg-white hover:border-orange-300 border border-zinc-200 text-left p-3 rounded-xl transition active:scale-[0.98] shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <span className="text-[10px] font-bold bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
                  ৳{session.actualCashCounted}
                </span>
              </div>
              <div className="mt-2 font-bold text-xs text-zinc-900 group-hover:text-orange-600 transition">
                Cash & Drawer
              </div>
            </button>

          </div>
        </>
      )}

      {/* 3. ANALYTICS SECTION (Minimal & Focused) */}
      <div className="bg-white rounded-xl p-3 border border-zinc-200 shadow-xs space-y-2.5">
        
        {/* Header & Presets */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
            <BarChart3 className="w-3.5 h-3.5 text-orange-600" />
            <span>Analytics</span>
          </div>

          <div className="flex items-center gap-1 text-[10px]">
            {(['today', '7days', '30days', 'custom'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setAnalyticsPreset(preset)}
                className={`px-2 py-0.5 rounded-md font-bold transition ${
                  analyticsPreset === preset
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {preset === 'today' ? 'Today' : preset === '7days' ? '7D' : preset === '30days' ? '30D' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Pickers (Single clean box with no extra download button) */}
        {analyticsPreset === 'custom' && (
          <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-200">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[10px] text-zinc-500 font-medium block mb-0.5">From Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-7 rounded-lg border border-zinc-300 px-2 text-[11px] text-zinc-800 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-medium block mb-0.5">To Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-7 rounded-lg border border-zinc-300 px-2 text-[11px] text-zinc-800 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4 Core Info Cards ONLY */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-200">
            <span className="text-[10px] text-zinc-500 font-medium block">Net Sales</span>
            <span className="text-sm font-extrabold text-zinc-900 block mt-0.5">
              ৳{analyticsData.netSales.toLocaleString()}
            </span>
            <span className="text-[9px] text-emerald-600 font-medium">{analyticsData.totalSold} items sold</span>
          </div>

          <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-200">
            <span className="text-[10px] text-zinc-500 font-medium block">Total Expenses</span>
            <span className="text-sm font-extrabold text-red-600 block mt-0.5">
              ৳{analyticsData.totalExp.toLocaleString()}
            </span>
            <span className="text-[9px] text-zinc-400">Bazaar</span>
          </div>

          <div className="bg-zinc-50 rounded-lg p-2 border border-zinc-200">
            <span className="text-[10px] text-zinc-500 font-medium block">Staff Payouts</span>
            <span className="text-sm font-extrabold text-zinc-800 block mt-0.5">
              ৳{analyticsData.totalPay.toLocaleString()}
            </span>
            <span className="text-[9px] text-zinc-400">Takes</span>
          </div>

          <div className="bg-orange-50/80 rounded-lg p-2 border border-orange-200">
            <span className="text-[10px] text-orange-700 font-bold block flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Net Profit</span>
            </span>
            <span className="text-sm font-black text-orange-600 block mt-0.5">
              ৳{analyticsData.netProfit.toLocaleString()}
            </span>
            <span className="text-[9px] text-orange-700 font-medium">Margin: {analyticsData.profitMargin}%</span>
          </div>
        </div>

        {/* Single Bottom Button to Download Full Analytics */}
        <button
          onClick={handleDownloadAnalyticsImage}
          disabled={isDownloadingAnalytics}
          className="w-full bg-zinc-900 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs transition active:scale-98 shadow-xs flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>
            {isDownloadingAnalytics 
              ? 'Generating Report...' 
              : 'Download Full Analytics (PNG)'}
          </span>
        </button>

      </div>

      {/* Lock Confirmation Modal with Summary */}
      {session && onToggleLock && (
        <LockConfirmationModal
          isOpen={isLockModalOpen}
          session={session}
          onConfirm={onToggleLock}
          onClose={() => setIsLockModalOpen(false)}
        />
      )}

      {/* Start Shift Modal */}
      {isStartModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Sun className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900 leading-tight">
                    {isViewingToday ? "Start Today's Shift" : `Add Shift Record for ${formattedDate}`}
                  </h3>
                  <p className="text-[10px] text-zinc-500">
                    {formattedDate} • {isViewingToday ? 'Open drawer & begin cart day' : 'Retroactive operations entry'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStartModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                Opening Khuchra Cash (৳ Taken from Reserve for Drawer Change)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-3.5 py-2.5 text-zinc-900 font-bold text-sm focus:outline-none transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  BDT
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 block mt-1">
                Default cart starting change money is ৳1,000.
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsStartModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = parseFloat(openingCashInput) || 1000;
                  if (onStartShift) {
                    onStartShift(val);
                  }
                  setIsStartModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Sun className="w-3.5 h-3.5 text-white" />
                <span>{isViewingToday ? 'Open Cart' : 'Create Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
