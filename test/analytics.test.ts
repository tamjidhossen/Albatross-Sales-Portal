import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DayData } from '../src/data/mockDailyData';
import { calculateAggregatedAnalytics } from '../src/utils/analyticsCalculations';

describe('Analytics Aggregation Engine', () => {
  it('correctly aggregates 1 operating day in a 7-day range without artificial multipliers', () => {
    // Cart only operated on 2026-10-20
    const dayData: DayData = {
      session: {
        sessionDate: '2026-10-20',
        status: 'closed',
        isLocked: true,
        openingCash: 1000,
        khuchraTakenFromReserve: 1000,
        openingSavedCash: 20000,
        totalProductsPrepared: 40,
        totalProductsSold: 25,
        totalProductsWasted: 2,
        grossEstimatedRevenue: 25 * 120, // 3000
        estimatedDiscounts: 100,
        netEstimatedRevenue: 2900,
        totalExpenses: 600,
        totalPayouts: 500,
        expectedClosingCash: 1000 + 2900 - 600 - 500, // 2800
        actualCashCounted: 2800,
        cashDifference: 0,
        transferredToReserve: 2800,
        closingCartCash: 2800,
        closingSavedCash: 22800,
      },
      items: [
        {
          id: '1',
          sessionDate: '2026-10-20',
          productId: 'burger',
          productName: 'Burger',
          unitPrice: 120,
          morningCarriedOver: 0,
          morningNewPrepared: 40,
          totalAvailable: 40,
          closingCounted: 15,
          closingUsableLeftover: 13,
          closingWasted: 2,
          quantitySold: 25,
          estimatedRevenue: 3000,
        },
      ],
      expenses: [
        { id: 'e1', sessionDate: '2026-10-20', category: 'Raw Materials', itemName: 'Meat', amount: 600, paidByName: 'Tamjid' },
      ],
      payouts: [
        { id: 'p1', sessionDate: '2026-10-20', recipientName: 'Tamjid', payoutType: 'Staff Daily Pay', amount: 500 },
      ],
    };

    const allSessionsData: Record<string, DayData> = {
      '2026-10-20': dayData,
    };

    const result = calculateAggregatedAnalytics({
      calcStartDate: '2026-10-14',
      calcEndDate: '2026-10-20',
      allSessionsData,
    });

    // Verification: MUST NOT BE SCALED BY 7!
    assert.strictEqual(result.totalPrepared, 40, 'Total prepared must be exactly 40, NOT 280');
    assert.strictEqual(result.totalSold, 25, 'Total sold must be exactly 25, NOT 175');
    assert.strictEqual(result.totalWaste, 2, 'Total waste must be exactly 2, NOT 14');
    assert.strictEqual(result.grossSales, 3000, 'Gross sales must be exactly 3000, NOT 21000');
    assert.strictEqual(result.discounts, 100, 'Discounts must be 100');
    assert.strictEqual(result.netSales, 2900, 'Net sales must be 2900');
    assert.strictEqual(result.totalExp, 600, 'Total expenses must be 600');
    assert.strictEqual(result.totalPay, 500, 'Total payouts must be 500');
    assert.strictEqual(result.totalStockValue, 40 * 120, 'Total stock value must be exactly 4800');
    assert.strictEqual(result.netProfit, 1800);
  });

  it('correctly handles user reported rollover bug: 124 items on 18th rolled over to 19th with 0 sales must report 124 in 7-day analysis, NOT 248', () => {
    // 18th Oct: 124 burgers prepared, 0 sold, 124 rollover
    const day18: DayData = {
      session: {
        sessionDate: '2026-10-18',
        status: 'closed',
        isLocked: true,
        openingCash: 1000,
        khuchraTakenFromReserve: 1000,
        openingSavedCash: 20000,
        totalProductsPrepared: 124,
        totalProductsSold: 0,
        totalProductsWasted: 0,
        grossEstimatedRevenue: 0,
        estimatedDiscounts: 0,
        netEstimatedRevenue: 0,
        totalExpenses: 0,
        totalPayouts: 0,
        expectedClosingCash: 1000,
        actualCashCounted: 1000,
        cashDifference: 0,
        transferredToReserve: 0,
        closingCartCash: 1000,
        closingSavedCash: 20000,
      },
      items: [
        {
          id: 'b-18',
          sessionDate: '2026-10-18',
          productId: 'burger',
          productName: 'Burger',
          unitPrice: 100,
          morningCarriedOver: 0,
          morningNewPrepared: 124,
          totalAvailable: 124,
          closingCounted: 124,
          closingUsableLeftover: 124,
          closingWasted: 0,
          quantitySold: 0,
          estimatedRevenue: 0,
        },
      ],
      expenses: [],
      payouts: [],
    };

    // 19th Oct: 124 rollover from 18th, 0 new prepared, 0 sold
    const day19: DayData = {
      session: {
        sessionDate: '2026-10-19',
        status: 'closed',
        isLocked: true,
        openingCash: 1000,
        khuchraTakenFromReserve: 1000,
        openingSavedCash: 20000,
        totalProductsPrepared: 124,
        totalProductsSold: 0,
        totalProductsWasted: 0,
        grossEstimatedRevenue: 0,
        estimatedDiscounts: 0,
        netEstimatedRevenue: 0,
        totalExpenses: 0,
        totalPayouts: 0,
        expectedClosingCash: 1000,
        actualCashCounted: 1000,
        cashDifference: 0,
        transferredToReserve: 0,
        closingCartCash: 1000,
        closingSavedCash: 20000,
      },
      items: [
        {
          id: 'b-19',
          sessionDate: '2026-10-19',
          productId: 'burger',
          productName: 'Burger',
          unitPrice: 100,
          morningCarriedOver: 124,
          morningNewPrepared: 0,
          totalAvailable: 124,
          closingCounted: 124,
          closingUsableLeftover: 124,
          closingWasted: 0,
          quantitySold: 0,
          estimatedRevenue: 0,
        },
      ],
      expenses: [],
      payouts: [],
    };

    const allSessionsData: Record<string, DayData> = {
      '2026-10-18': day18,
      '2026-10-19': day19,
    };

    // User runs 7-day analysis on 19th (2026-10-13 to 2026-10-19)
    const result = calculateAggregatedAnalytics({
      calcStartDate: '2026-10-13',
      calcEndDate: '2026-10-19',
      allSessionsData,
    });

    // Verification: Rollover stock MUST NOT BE DOUBLED to 248!
    assert.strictEqual(result.totalPrepared, 124, 'Total prepared must be exactly 124, NOT 248');
    assert.strictEqual(result.totalStockValue, 124 * 100, 'Total stock value must be 12,400 (124 * 100), NOT 24,800');
    assert.strictEqual(result.totalSold, 0);
    assert.strictEqual(result.totalWaste, 0);
  });

  it('correctly aggregates multiple operating days with newly added inventory batches', () => {
    // Day 1 (18th): 30 prepared, 20 sold, 10 leftover
    const day1: DayData = {
      session: {
        sessionDate: '2026-10-18',
        status: 'closed',
        isLocked: true,
        openingCash: 1000,
        khuchraTakenFromReserve: 1000,
        openingSavedCash: 20000,
        totalProductsPrepared: 30,
        totalProductsSold: 20,
        totalProductsWasted: 0,
        grossEstimatedRevenue: 2400,
        estimatedDiscounts: 0,
        netEstimatedRevenue: 2400,
        totalExpenses: 500,
        totalPayouts: 300,
        expectedClosingCash: 2600,
        actualCashCounted: 2600,
        cashDifference: 0,
        transferredToReserve: 0,
        closingCartCash: 2600,
        closingSavedCash: 22000,
      },
      items: [
        {
          id: '1',
          sessionDate: '2026-10-18',
          productId: 'burger',
          productName: 'Burger',
          unitPrice: 120,
          morningCarriedOver: 0,
          morningNewPrepared: 30,
          totalAvailable: 30,
          closingCounted: 10,
          closingUsableLeftover: 10,
          closingWasted: 0,
          quantitySold: 20,
          estimatedRevenue: 2400,
        },
      ],
      expenses: [{ id: 'e1', sessionDate: '2026-10-18', category: 'Raw Materials', itemName: 'Meat', amount: 500, paidByName: 'Tamjid' }],
      payouts: [{ id: 'p1', sessionDate: '2026-10-18', recipientName: 'Tamjid', payoutType: 'Staff Daily Pay', amount: 300 }],
    };

    // Day 2 (19th): 10 rollover + 30 newly prepared = 40 available, 35 sold, 1 waste, 4 leftover
    const day2: DayData = {
      session: {
        sessionDate: '2026-10-19',
        status: 'closed',
        isLocked: true,
        openingCash: 1000,
        khuchraTakenFromReserve: 1000,
        openingSavedCash: 22000,
        totalProductsPrepared: 40,
        totalProductsSold: 35,
        totalProductsWasted: 1,
        grossEstimatedRevenue: 4200,
        estimatedDiscounts: 0,
        netEstimatedRevenue: 4200,
        totalExpenses: 700,
        totalPayouts: 400,
        expectedClosingCash: 4100,
        actualCashCounted: 4100,
        cashDifference: 0,
        transferredToReserve: 0,
        closingCartCash: 4100,
        closingSavedCash: 24000,
      },
      items: [
        {
          id: '2',
          sessionDate: '2026-10-19',
          productId: 'burger',
          productName: 'Burger',
          unitPrice: 120,
          morningCarriedOver: 10,
          morningNewPrepared: 30,
          totalAvailable: 40,
          closingCounted: 5,
          closingUsableLeftover: 4,
          closingWasted: 1,
          quantitySold: 35,
          estimatedRevenue: 4200,
        },
      ],
      expenses: [{ id: 'e2', sessionDate: '2026-10-19', category: 'Raw Materials', itemName: 'Buns', amount: 700, paidByName: 'Tamjid' }],
      payouts: [{ id: 'p2', sessionDate: '2026-10-19', recipientName: 'Tamjid', payoutType: 'Staff Daily Pay', amount: 400 }],
    };

    const allSessionsData: Record<string, DayData> = {
      '2026-10-18': day1,
      '2026-10-19': day2,
    };

    const result = calculateAggregatedAnalytics({
      calcStartDate: '2026-10-18',
      calcEndDate: '2026-10-19',
      allSessionsData,
    });

    assert.strictEqual(result.totalSold, 20 + 35); // 55 sold
    assert.strictEqual(result.grossSales, 2400 + 4200); // 6600
    // Total unique burgers introduced: 30 (Day 1) + 30 (Day 2 new) = 60 burgers!
    assert.strictEqual(result.totalPrepared, 60, 'Total unique burgers prepared must be 60, NOT 70');
    assert.strictEqual(result.totalStockValue, 60 * 120, 'Total stock value must be 7,200 (60 * 120), NOT 8,400');
    assert.strictEqual(result.totalWaste, 1);
  });
});
