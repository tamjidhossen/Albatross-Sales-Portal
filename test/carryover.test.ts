import { describe, it } from 'node:test';
import assert from 'node:assert';
import { cascadeInventoryCarryover } from '../src/services/dailyOperationsService';
import { DayData } from '../src/data/mockDailyData';
import { DailySession, DailyInventoryItem } from '../src/types';

function createMockDay(
  sessionDate: string,
  burgerAvailable: number,
  burgerSold: number,
  burgerWaste: number,
  isLocked: boolean = false,
  closingSavedCash: number = 20000
): DayData {
  const burgerLeftover = Math.max(0, burgerAvailable - burgerSold - burgerWaste);
  const session: DailySession = {
    sessionDate,
    status: isLocked ? 'closed' : 'open',
    isLocked,
    openingCash: 1000,
    khuchraTakenFromReserve: 1000,
    openingSavedCash: 20000,
    totalProductsPrepared: burgerAvailable,
    totalProductsSold: burgerSold,
    totalProductsWasted: burgerWaste,
    grossEstimatedRevenue: burgerSold * 120,
    estimatedDiscounts: 0,
    netEstimatedRevenue: burgerSold * 120,
    totalExpenses: 0,
    totalPayouts: 0,
    expectedClosingCash: 1000 + (burgerSold * 120),
    actualCashCounted: 1000 + (burgerSold * 120),
    cashDifference: 0,
    transferredToReserve: 0,
    closingCartCash: 1000 + (burgerSold * 120),
    closingSavedCash,
  };

  const items: DailyInventoryItem[] = [
    {
      id: `inv-${sessionDate}-burger`,
      sessionDate,
      productId: 'prod-burger',
      productName: 'Classic Burger',
      unitPrice: 120,
      morningCarriedOver: 0,
      morningNewPrepared: burgerAvailable,
      totalAvailable: burgerAvailable,
      closingCounted: burgerLeftover + burgerWaste,
      closingUsableLeftover: burgerLeftover,
      closingWasted: burgerWaste,
      quantitySold: burgerSold,
      estimatedRevenue: burgerSold * 120,
    },
  ];

  return {
    session,
    items,
    expenses: [],
    payouts: [],
  };
}

describe('Inventory Carryover & Multi-Day Cascade Engine', () => {
  it('correctly handles the user reported bug: Day 1 sold changed from 1 to 0 updates Day 2 carryover from 39 to 40', () => {
    // 1. Initial State: Day 1 had 40 available, sold 1 -> 39 leftover
    const day1 = createMockDay('2026-10-20', 40, 1, 0, true);
    assert.strictEqual(day1.items[0].closingUsableLeftover, 39);

    // Day 2 was initialized with 39 carried over, 0 new prepared -> 39 available, 0 sold -> 39 leftover
    const day2 = createMockDay('2026-10-21', 39, 0, 0, false);
    day2.items[0].morningCarriedOver = 39;
    day2.items[0].morningNewPrepared = 0;
    day2.items[0].totalAvailable = 39;
    day2.items[0].closingUsableLeftover = 39;

    const allDays: Record<string, DayData> = {
      '2026-10-20': day1,
      '2026-10-21': day2,
    };

    // 2. User unlocks Day 1, corrects sold from 1 back to 0
    day1.items[0].quantitySold = 0;
    day1.items[0].closingUsableLeftover = 40;
    day1.items[0].closingCounted = 40;
    day1.session.totalProductsSold = 0;

    // 3. Run cascade carryover
    const { updatedDays, changedDays } = cascadeInventoryCarryover(allDays, '2026-10-20');

    // Verify Day 2 was updated
    assert.strictEqual(changedDays.length, 1);
    const updatedDay2 = updatedDays['2026-10-21'];
    assert.ok(updatedDay2);

    // Day 2 must now have morningCarriedOver = 40 (NOT 39!)
    assert.strictEqual(updatedDay2.items[0].morningCarriedOver, 40);
    // Day 2 totalAvailable must now be 40
    assert.strictEqual(updatedDay2.items[0].totalAvailable, 40);
    // Day 2 closingUsableLeftover must be 40
    assert.strictEqual(updatedDay2.items[0].closingUsableLeftover, 40);
    // Day 2 session totalProductsPrepared must be 40
    assert.strictEqual(updatedDay2.session.totalProductsPrepared, 40);
  });

  it('cascades changes across 3 consecutive days (Day 1 -> Day 2 -> Day 3)', () => {
    // Day 1: 50 prepared, 10 sold -> 40 leftover
    const day1 = createMockDay('2026-10-01', 50, 10, 0, true);
    // Day 2: 40 carried, 20 prepared (total 60), 10 sold -> 50 leftover
    const day2 = createMockDay('2026-10-02', 60, 10, 0, true);
    day2.items[0].morningCarriedOver = 40;
    day2.items[0].morningNewPrepared = 20;
    day2.items[0].totalAvailable = 60;
    day2.items[0].closingUsableLeftover = 50;

    // Day 3: 50 carried, 0 prepared (total 50), 0 sold -> 50 leftover
    const day3 = createMockDay('2026-10-03', 50, 0, 0, false);
    day3.items[0].morningCarriedOver = 50;
    day3.items[0].morningNewPrepared = 0;
    day3.items[0].totalAvailable = 50;
    day3.items[0].closingUsableLeftover = 50;

    const allDays: Record<string, DayData> = {
      '2026-10-01': day1,
      '2026-10-02': day2,
      '2026-10-03': day3,
    };

    // User updates Day 1: sold count changes from 10 to 5 -> Day 1 leftover becomes 45
    day1.items[0].quantitySold = 5;
    day1.items[0].closingUsableLeftover = 45;

    const { updatedDays } = cascadeInventoryCarryover(allDays, '2026-10-01');

    // Day 2 checks:
    const updatedDay2 = updatedDays['2026-10-02'];
    assert.strictEqual(updatedDay2.items[0].morningCarriedOver, 45); // was 40
    assert.strictEqual(updatedDay2.items[0].totalAvailable, 65);     // 45 + 20
    assert.strictEqual(updatedDay2.items[0].closingUsableLeftover, 55); // 65 - 10 sold

    // Day 3 checks:
    const updatedDay3 = updatedDays['2026-10-03'];
    assert.strictEqual(updatedDay3.items[0].morningCarriedOver, 55); // was 50
    assert.strictEqual(updatedDay3.items[0].totalAvailable, 55);     // 55 + 0
    assert.strictEqual(updatedDay3.items[0].closingUsableLeftover, 55);
  });

  it('automatically carries over a newly added product from Day 1 to Day 2 if Day 2 is missing it', () => {
    const day1 = createMockDay('2026-10-10', 30, 5, 0, true);
    // Add a new product to Day 1
    day1.items.push({
      id: 'inv-2026-10-10-shawarma',
      sessionDate: '2026-10-10',
      productId: 'prod-shawarma',
      productName: 'Chicken Shawarma',
      unitPrice: 150,
      morningCarriedOver: 0,
      morningNewPrepared: 20,
      totalAvailable: 20,
      closingCounted: 12,
      closingUsableLeftover: 12,
      closingWasted: 0,
      quantitySold: 8,
      estimatedRevenue: 1200,
    });

    // Day 2 only had burger
    const day2 = createMockDay('2026-10-11', 25, 0, 0, false);

    const allDays = {
      '2026-10-10': day1,
      '2026-10-11': day2,
    };

    const { updatedDays } = cascadeInventoryCarryover(allDays, '2026-10-10');
    const updatedDay2 = updatedDays['2026-10-11'];

    // Day 2 must now contain Chicken Shawarma with 12 carried over!
    const shawarma = updatedDay2.items.find((i) => i.productId === 'prod-shawarma');
    assert.ok(shawarma, 'Shawarma must be present in Day 2');
    assert.strictEqual(shawarma.morningCarriedOver, 12);
    assert.strictEqual(shawarma.totalAvailable, 12);
    assert.strictEqual(shawarma.closingUsableLeftover, 12);
  });

  it('cascades closing reserve cash changes from Day 1 to Day 2', () => {
    // Day 1 closed with 25,000 saved cash
    const day1 = createMockDay('2026-10-20', 40, 10, 0, true, 25000);
    // Day 2 initialized with openingSavedCash = 20,000
    const day2 = createMockDay('2026-10-21', 30, 0, 0, false, 20000);
    day2.session.openingSavedCash = 20000;

    const allDays = {
      '2026-10-20': day1,
      '2026-10-21': day2,
    };

    const { updatedDays } = cascadeInventoryCarryover(allDays, '2026-10-20');
    const updatedDay2 = updatedDays['2026-10-21'];

    assert.strictEqual(updatedDay2.session.openingSavedCash, 25000);
  });

  it('defaults sold box in closing to total in opening (carryover + newly prepared), NOT just current day new stuff', () => {
    // Day 1 has 10 leftover
    const day1 = createMockDay('2026-10-18', 20, 10, 0, true);
    assert.strictEqual(day1.items[0].closingUsableLeftover, 10);

    // Day 2 starts with 10 carried over, then prepares 10 fresh burgers
    // Total opening available = 10 carried + 10 fresh = 20 burgers
    const day2 = createMockDay('2026-10-19', 20, 20, 0, false);
    day2.items[0].morningCarriedOver = 10;
    day2.items[0].morningNewPrepared = 10;
    day2.items[0].totalAvailable = 20;
    day2.items[0].closingUsableLeftover = 0;
    day2.items[0].closingWasted = 0;
    day2.items[0].quantitySold = 20; // Default: all 20 sold!

    const allDays = {
      '2026-10-18': day1,
      '2026-10-19': day2,
    };

    // Verify closing sold box shows 20 by default (NOT just 10 new stuff)
    assert.strictEqual(
      day2.items[0].quantitySold,
      20,
      'Closing sold box must show 20 (10 new + 10 leftover) by default'
    );
    assert.strictEqual(
      day2.items[0].closingUsableLeftover,
      0,
      'Leftover tomorrow must default to 0 unless changed by user'
    );

    // Now Day 1 carryover is updated from 10 to 15 (e.g. Day 1 sold fewer)
    day1.items[0].quantitySold = 5;
    day1.items[0].closingUsableLeftover = 15;

    const { updatedDays } = cascadeInventoryCarryover(allDays, '2026-10-18');
    const updatedDay2 = updatedDays['2026-10-19'];

    // Day 2 total available is now 15 carried + 10 fresh = 25
    // In default mode, sold box must now show 25 (NOT 10!)
    assert.strictEqual(updatedDay2.items[0].morningCarriedOver, 15);
    assert.strictEqual(updatedDay2.items[0].totalAvailable, 25);
    assert.strictEqual(
      updatedDay2.items[0].quantitySold,
      25,
      'Closing sold box must automatically default to 25 when carryover updates'
    );
    assert.strictEqual(updatedDay2.items[0].closingUsableLeftover, 0);
  });

  it('preserves user modified closing count when user explicitly changes sold', () => {
    // Day 1 has 10 leftover
    const day1 = createMockDay('2026-10-18', 20, 10, 0, true);

    // Day 2 has 10 carried + 10 new = 20 available.
    // User explicitly changed closing sold from 20 to 18 (so 2 leftover)
    const day2 = createMockDay('2026-10-19', 20, 18, 0, false);
    day2.items[0].morningCarriedOver = 10;
    day2.items[0].morningNewPrepared = 10;
    day2.items[0].totalAvailable = 20;
    day2.items[0].quantitySold = 18;
    day2.items[0].closingUsableLeftover = 2; // User changed closing count!

    const allDays = {
      '2026-10-18': day1,
      '2026-10-19': day2,
    };

    // User updates Day 1 leftover from 10 to 12
    day1.items[0].quantitySold = 8;
    day1.items[0].closingUsableLeftover = 12;

    const { updatedDays } = cascadeInventoryCarryover(allDays, '2026-10-18');
    const updatedDay2 = updatedDays['2026-10-19'];

    // Day 2 total available is now 12 + 10 = 22
    // User explicitly entered 18 sold, so 18 sold must be preserved, and reusable adjusts to 22 - 18 = 4
    assert.strictEqual(updatedDay2.items[0].morningCarriedOver, 12);
    assert.strictEqual(updatedDay2.items[0].totalAvailable, 22);
    assert.strictEqual(updatedDay2.items[0].quantitySold, 18, 'User specified sold count of 18 must be preserved');
    assert.strictEqual(updatedDay2.items[0].closingUsableLeftover, 4, 'Leftover must adjust to 22 - 18 = 4');
  });
});

