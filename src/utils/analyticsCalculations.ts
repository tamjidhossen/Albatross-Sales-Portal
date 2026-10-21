import { DailySession, DailyInventoryItem, DailyExpense, DailyPayout } from '../types';
import { DayData } from '../data/mockDailyData';

export interface AggregatedAnalyticsResult {
  calcStartDate: string;
  calcEndDate: string;
  days: number;
  isSalesLocked: boolean;
  grossSales: number;
  discounts: number;
  netSales: number;
  totalExp: number;
  totalPay: number;
  netProfit: number;
  profitMargin: number;
  avgDailySales: number;
  avgDailyProfit: number;
  totalPrepared: number;
  totalSold: number;
  totalWaste: number;
  totalStockValue: number;
  closingReserve: number;
  products: {
    name: string;
    unitPrice: number;
    sold: number;
    wasted: number;
    revenue: number;
  }[];
  expenseCategories: {
    category: string;
    amount: number;
    percentShare: number;
  }[];
  payouts: {
    recipientName: string;
    payoutType: string;
    amount: number;
  }[];
}

export interface CalculateAnalyticsParams {
  calcStartDate: string;
  calcEndDate: string;
  allSessionsData: Record<string, DayData>;
  fallbackSession?: DailySession | null;
  fallbackItems?: DailyInventoryItem[];
  fallbackExpenses?: DailyExpense[];
  fallbackPayouts?: DailyPayout[];
  selectedDate?: string;
}

export function calculateAggregatedAnalytics({
  calcStartDate,
  calcEndDate,
  allSessionsData,
  fallbackSession,
  fallbackItems = [],
  fallbackExpenses = [],
  fallbackPayouts = [],
  selectedDate,
}: CalculateAnalyticsParams): AggregatedAnalyticsResult {
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

  // Sort range chronologically to properly trace rollover carryover across consecutive days
  const sortedRange = [...rangeSessions].sort((a, b) =>
    a.session.sessionDate.localeCompare(b.session.sessionDate)
  );

  let grossSales = 0;
  let discounts = 0;
  let netSales = 0;
  let totalExp = 0;
  let totalPay = 0;
  let totalPrepared = 0;
  let totalSold = 0;
  let totalWaste = 0;
  let totalStockValue = 0;

  const productMap: Record<string, { name: string; unitPrice: number; sold: number; wasted: number; revenue: number }> = {};
  const expenseCategoryMap: Record<string, number> = {};
  const payoutMap: Record<string, { recipientName: string; payoutType: string; amount: number }> = {};
  const seenProductIds = new Set<string>();

  if (sortedRange.length > 0) {
    sortedRange.forEach((day, dayIndex) => {
      // Gross sales derived directly from items to guarantee exact matching
      const dayGross = day.items.reduce((sum, item) => sum + item.estimatedRevenue, 0);
      const dayDiscounts = day.session.estimatedDiscounts || 0;
      const dayExp = day.expenses.reduce((sum, e) => sum + e.amount, 0);
      const dayPay = day.payouts.reduce((sum, p) => sum + p.amount, 0);

      grossSales += dayGross;
      discounts += dayDiscounts;
      netSales += Math.max(0, dayGross - dayDiscounts);
      totalExp += dayExp;
      totalPay += dayPay;
      totalSold += day.items.reduce((sum, item) => sum + item.quantitySold, 0);
      totalWaste += day.items.reduce((sum, item) => sum + item.closingWasted, 0);

      // Multi-day inventory prepared & stock value calculation:
      // Rollover inventory carried over between days is NOT double-counted.
      day.items.forEach((item) => {
        if (!seenProductIds.has(item.productId)) {
          // First time this product appears in this date window:
          // Count initial total available (opening carryover into period + morning prepared)
          totalPrepared += item.totalAvailable;
          totalStockValue += (item.totalAvailable * item.unitPrice);
          seenProductIds.add(item.productId);
        } else {
          // Product was already active earlier in this date window:
          // Morning carryover is yesterday's leftover (already counted).
          // Only newly prepared items added to the cart today increase the period total!
          const prevDay = sortedRange[dayIndex - 1];
          const prevItem = prevDay?.items.find((pi) => pi.productId === item.productId);
          const prevLeftover = prevItem ? prevItem.closingUsableLeftover : 0;
          const extraCarryover = Math.max(0, item.morningCarriedOver - prevLeftover);

          const newlyAdded = item.morningNewPrepared + extraCarryover;
          totalPrepared += newlyAdded;
          totalStockValue += (newlyAdded * item.unitPrice);
        }
      });

      // Products breakdown
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
  } else if (fallbackSession && selectedDate && selectedDate >= calcStartDate && selectedDate <= calcEndDate) {
    // Single active session fallback
    grossSales = fallbackItems.reduce((sum, item) => sum + item.estimatedRevenue, 0);
    discounts = fallbackSession.estimatedDiscounts || 0;
    netSales = Math.max(0, grossSales - discounts);
    totalExp = fallbackExpenses.reduce((sum, e) => sum + e.amount, 0);
    totalPay = fallbackPayouts.reduce((sum, p) => sum + p.amount, 0);
    totalPrepared = fallbackItems.reduce((sum, item) => sum + item.totalAvailable, 0);
    totalSold = fallbackItems.reduce((sum, item) => sum + item.quantitySold, 0);
    totalWaste = fallbackItems.reduce((sum, item) => sum + item.closingWasted, 0);
    totalStockValue = fallbackItems.reduce((sum, item) => sum + (item.totalAvailable * item.unitPrice), 0);

    fallbackItems.forEach((item) => {
      productMap[item.productId] = {
        name: item.productName,
        unitPrice: item.unitPrice,
        sold: item.quantitySold,
        wasted: item.closingWasted,
        revenue: item.estimatedRevenue,
      };
    });

    fallbackExpenses.forEach((exp) => {
      expenseCategoryMap[exp.category] = (expenseCategoryMap[exp.category] || 0) + exp.amount;
    });

    fallbackPayouts.forEach((p) => {
      const key = `${p.recipientName}-${p.payoutType}`;
      payoutMap[key] = {
        recipientName: p.recipientName,
        payoutType: p.payoutType,
        amount: p.amount,
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

  // Closing cash reserve for latest day in range
  let closingReserve = fallbackSession?.closingSavedCash || 21000;
  if (sortedRange.length > 0) {
    const latestDay = sortedRange[sortedRange.length - 1];
    const isSaved = (latestDay.session.transferredToReserve || 0) > 0;
    const khuchra = latestDay.session.khuchraTakenFromReserve || latestDay.session.openingCash || 0;
    const safeCash = Math.max(0, latestDay.session.openingSavedCash - khuchra);
    closingReserve = isSaved ? latestDay.session.closingSavedCash : (safeCash + khuchra);
  }

  // Shift Lock status:
  // If operating days exist in the range, ALL of them must be closed & locked.
  // If viewing a single active session fallback, that session must be locked.
  let isSalesLocked = false;
  if (sortedRange.length > 0) {
    isSalesLocked = sortedRange.every((d) => Boolean(d.session.isLocked));
  } else if (fallbackSession) {
    isSalesLocked = Boolean(fallbackSession.isLocked);
  }

  return {
    calcStartDate,
    calcEndDate,
    days,
    isSalesLocked,
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
    totalStockValue,
    closingReserve,
    products,
    expenseCategories,
    payouts: aggregatedPayouts,
  };
}

