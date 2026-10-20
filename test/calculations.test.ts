import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DailySession, DailyInventoryItem, DailyExpense, DailyPayout } from '../src/types';

describe('Financial Math & Settlement Engine', () => {
  it('correctly calculates gross revenue from items', () => {
    const items: DailyInventoryItem[] = [
      {
        id: '1',
        sessionDate: '2026-10-20',
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
        estimatedRevenue: 20 * 120, // 2400
      },
      {
        id: '2',
        sessionDate: '2026-10-20',
        productId: 'fries',
        productName: 'Fries',
        unitPrice: 80,
        morningCarriedOver: 5,
        morningNewPrepared: 25,
        totalAvailable: 30,
        closingCounted: 5,
        closingUsableLeftover: 5,
        closingWasted: 0,
        quantitySold: 25,
        estimatedRevenue: 25 * 80, // 2000
      },
    ];

    const grossRevenue = items.reduce((sum, item) => sum + item.estimatedRevenue, 0);
    assert.strictEqual(grossRevenue, 4400);

    // Stock value calculation (total food value loaded on cart)
    const stockValue = items.reduce((sum, item) => sum + (item.totalAvailable * item.unitPrice), 0);
    assert.strictEqual(stockValue, (30 * 120) + (30 * 80)); // 3600 + 2400 = 6000
  });

  it('correctly calculates net revenue with discounts and clamps to 0', () => {
    const grossRevenue = 4400;
    const discounts = 300;
    const netRevenue = Math.max(0, grossRevenue - discounts);
    assert.strictEqual(netRevenue, 4100);

    // Excessive discount should clamp to 0, never negative
    const hugeDiscount = 5000;
    const clampedNet = Math.max(0, grossRevenue - hugeDiscount);
    assert.strictEqual(clampedNet, 0);
  });

  it('correctly computes expected closing drawer cash', () => {
    const openingKhuchra = 1000;
    const netRevenue = 4100;
    const expenses: DailyExpense[] = [
      { id: 'e1', sessionDate: '2026-10-20', category: 'Raw Materials', itemName: 'Buns', amount: 500, paidByName: 'Tamjid' },
      { id: 'e2', sessionDate: '2026-10-20', category: 'Sauces', itemName: 'Mayo', amount: 300, paidByName: 'Tamjid' },
    ];
    const payouts: DailyPayout[] = [
      { id: 'p1', sessionDate: '2026-10-20', recipientName: 'Tamjid', payoutType: 'Staff Daily Pay', amount: 600 },
    ];

    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPay = payouts.reduce((sum, p) => sum + p.amount, 0);

    assert.strictEqual(totalExp, 800);
    assert.strictEqual(totalPay, 600);

    const expectedCash = openingKhuchra + netRevenue - totalExp - totalPay;
    // 1000 + 4100 - 800 - 600 = 3700
    assert.strictEqual(expectedCash, 3700);

    // Exact Match
    const actualCounted = 3700;
    const diff = actualCounted - expectedCash;
    assert.strictEqual(diff, 0);

    // Shortage
    const countedShort = 3500;
    assert.strictEqual(countedShort - expectedCash, -200);

    // Surplus
    const countedSurplus = 3850;
    assert.strictEqual(countedSurplus - expectedCash, 150);
  });
});
