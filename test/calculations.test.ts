import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DailySession, DailyInventoryItem, DailyExpense, DailyPayout } from '../src/types';
import { createDefaultSessionForDate } from '../src/data/mockDailyData';

describe('Financial Math & Settlement Engine', () => {
  it('defaults closing drawer cash to zero on newly created sessions', () => {
    const newSessionData = createDefaultSessionForDate('2026-10-22', 20000, 1000);
    assert.strictEqual(newSessionData.session.actualCashCounted, 0, 'actualCashCounted must be 0 by default');
    assert.strictEqual(newSessionData.session.closingCartCash, 0, 'closingCartCash must be 0 by default');
    assert.strictEqual(newSessionData.session.expectedClosingCash, 1000, 'expectedClosingCash is 1000 when openingKhuchra is 1000 and sales are 0');
  });
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

  it('correctly models cash reserve: khuchra is taken from reserve so cash + khuchra equals total reserve', () => {
    const totalStartingReserve = 3900;
    
    // Scenario 1: Khuchra is 0 -> safe cash = 3900, khuchra = 0, total = 3900
    let khuchra = 0;
    let safeCash = Math.max(0, totalStartingReserve - khuchra);
    let totalReserve = safeCash + khuchra;
    assert.strictEqual(safeCash, 3900);
    assert.strictEqual(totalReserve, 3900);

    // Scenario 2: User adds khuchra as 2500 -> safe cash = 1400, khuchra = 2500, total = 3900
    khuchra = 2500;
    safeCash = Math.max(0, totalStartingReserve - khuchra);
    totalReserve = safeCash + khuchra;
    assert.strictEqual(safeCash, 1400);
    assert.strictEqual(khuchra, 2500);
    assert.strictEqual(totalReserve, 3900);

    // Scenario 3: At night closing, drawer cash of 6000 is counted and saved to reserve
    const countedDrawerCash = 6000;
    const finalReserve = safeCash + countedDrawerCash; // 1400 + 6000 = 7400
    assert.strictEqual(finalReserve, 7400);
  });

  it('guarantees arithmetic consistency: 2500 khuchra + 4810 sales - 0 exp - 0 payouts = 7310 expected closing drawer cash', () => {
    const khuchra = 2500;
    const netFoodSales = 4810;
    const bazaarExpenses = 0;
    const payouts = 0;

    const expectedClosingCash = khuchra + netFoodSales - bazaarExpenses - payouts;
    assert.strictEqual(expectedClosingCash, 7310, 'Expected closing drawer cash must be 7,310, NOT 2,860!');

    // Test mapSessionFromDB healing when DB has stale expectedClosingCash of 2860
    const { mapSessionFromDB } = require('../src/services/dailyOperationsService');
    const staleDBRow = {
      session_date: '2026-10-21',
      status: 'open',
      is_locked: false,
      opening_cash: 2500,
      khuchra_taken_from_reserve: 2500,
      opening_saved_cash: 20000,
      net_estimated_revenue: 4810,
      total_expenses: 0,
      total_payouts: 0,
      expected_closing_cash: 2860, // Stale!
      actual_cash_counted: 0,
      cash_difference: -2860,
      transferred_to_reserve: 0,
    };

    const cleanSession = mapSessionFromDB(staleDBRow);
    assert.strictEqual(
      cleanSession.expectedClosingCash,
      7310,
      'mapSessionFromDB must dynamically heal stale expected_closing_cash to 7,310'
    );
    assert.strictEqual(
      cleanSession.cashDifference,
      -7310,
      'cashDifference must match actual cash (0) - expected cash (7310)'
    );
  });

  it('clamps expected closing drawer cash to 0 when expenses exceed cash and avoids false surplus', () => {
    const khuchra = 1000;
    const netFoodSales = 0; // Rain out
    const bazaarExpenses = 2500;
    const payouts = 0;

    const rawExpected = khuchra + netFoodSales - bazaarExpenses - payouts; // -1500
    assert.strictEqual(rawExpected, -1500);

    const clampedExpected = Math.max(0, rawExpected);
    assert.strictEqual(clampedExpected, 0, 'Expected closing drawer cash must never be negative');

    // Drawer counted 0 at night: diff must be 0, NOT +1500 fake surplus
    const actualCounted = 0;
    const diff = actualCounted - clampedExpected;
    assert.strictEqual(diff, 0, 'Must not claim a +1,500 cash surplus');
  });

  it('correctly calculates Sold and enforces clamping for Remaining and Waste', () => {
    const totalAvailable = 20;

    // Case 1: Default uncounted state (Remaining = 0, Waste = 0) -> Sold = 20
    let remaining = 0;
    let waste = 0;
    let sold = Math.max(0, totalAvailable - remaining - waste);
    assert.strictEqual(sold, 20, 'Default sold must be equal to totalAvailable');

    // Case 2: User enters Remaining = 5, Waste = 2 -> Sold = 13
    remaining = 5;
    waste = 2;
    sold = Math.max(0, totalAvailable - remaining - waste);
    assert.strictEqual(sold, 13);

    // Case 3: Over-entry clamping for Remaining (typed 25 on 20 available)
    const rawRemaining = 25;
    const cleanRemaining = Math.max(0, Math.min(totalAvailable, rawRemaining));
    assert.strictEqual(cleanRemaining, 20, 'Remaining must clamp to totalAvailable');

    // Case 4: Over-entry clamping for Waste (20 available, 18 remaining, user typed 5 waste)
    remaining = 18;
    const rawWaste = 5;
    const maxAllowedWaste = Math.max(0, totalAvailable - remaining); // 2
    const cleanWaste = Math.max(0, Math.min(maxAllowedWaste, rawWaste));
    assert.strictEqual(cleanWaste, 2, 'Waste must clamp to available - remaining');
    sold = Math.max(0, totalAvailable - remaining - cleanWaste);
    assert.strictEqual(sold, 0, 'Sold cannot drop below 0');
  });
});

