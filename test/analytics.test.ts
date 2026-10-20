import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DayData } from '../src/data/mockDailyData';

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

    // Range: 7 days (2026-10-14 to 2026-10-20)
    const calcStartDate = '2026-10-14';
    const calcEndDate = '2026-10-20';

    const rangeSessions: DayData[] = [];
    Object.keys(allSessionsData).forEach((dateKey) => {
      if (dateKey >= calcStartDate && dateKey <= calcEndDate) {
        rangeSessions.push(allSessionsData[dateKey]);
      }
    });

    assert.strictEqual(rangeSessions.length, 1, 'Only 1 day operated in range');

    let grossSales = 0;
    let discounts = 0;
    let netSales = 0;
    let totalExp = 0;
    let totalPay = 0;
    let totalPrepared = 0;
    let totalSold = 0;
    let totalWaste = 0;
    let totalStockValue = 0;

    rangeSessions.forEach((day) => {
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
      totalStockValue += day.items.reduce((sum, item) => sum + (item.totalAvailable * item.unitPrice), 0);
    });

    // Verification: MUST NOT BE SCALED BY 7!
    assert.strictEqual(totalPrepared, 40, 'Total prepared must be exactly 40, NOT 280');
    assert.strictEqual(totalSold, 25, 'Total sold must be exactly 25, NOT 175');
    assert.strictEqual(totalWaste, 2, 'Total waste must be exactly 2, NOT 14');
    assert.strictEqual(grossSales, 3000, 'Gross sales must be exactly 3000, NOT 21000');
    assert.strictEqual(discounts, 100, 'Discounts must be 100');
    assert.strictEqual(netSales, 2900, 'Net sales must be 2900');
    assert.strictEqual(totalExp, 600, 'Total expenses must be 600');
    assert.strictEqual(totalPay, 500, 'Total payouts must be 500');
    assert.strictEqual(totalStockValue, 40 * 120, 'Total stock value must be exactly 4800');

    const netProfit = netSales - totalExp - totalPay;
    // 2900 - 600 - 500 = 1800
    assert.strictEqual(netProfit, 1800);
  });

  it('correctly aggregates multiple actual operating days', () => {
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

    const allSessionsData = {
      '2026-10-18': day1,
      '2026-10-19': day2,
    };

    const rangeSessions = [day1, day2];
    let totalSold = 0;
    let totalGross = 0;
    let totalStockValue = 0;

    rangeSessions.forEach((d) => {
      totalSold += d.items.reduce((s, i) => s + i.quantitySold, 0);
      totalGross += d.items.reduce((s, i) => s + i.estimatedRevenue, 0);
      totalStockValue += d.items.reduce((s, i) => s + (i.totalAvailable * i.unitPrice), 0);
    });

    assert.strictEqual(totalSold, 20 + 35); // 55
    assert.strictEqual(totalGross, 2400 + 4200); // 6600
    assert.strictEqual(totalStockValue, (30 * 120) + (40 * 120)); // 3600 + 4800 = 8400
  });
});
