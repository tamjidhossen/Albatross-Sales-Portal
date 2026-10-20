import { Product, DailySession, DailyInventoryItem, DailyExpense, DailyPayout, AuditLog } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'momo-chicken', name: 'Chicken Momo (8 pcs)', bengaliName: 'চিকেন মোমো (৮ পিস)', defaultPrice: 120, isActive: true, canCarryover: true, sortOrder: 1 },
  { id: 'burger-tuni', name: 'Tuni Burger Box (3 pcs)', bengaliName: 'টুনি বার্গার (৩ পিস)', defaultPrice: 60, isActive: true, canCarryover: true, sortOrder: 2 },
  { id: 'pizza-bread', name: 'Cheesy Bread Pizza 6"', bengaliName: 'চিজি ব্রেড পিৎজা ৬ ইঞ্চি', defaultPrice: 100, isActive: true, canCarryover: true, sortOrder: 3 },
  { id: 'snack-meatbox', name: 'Loaded Meat Box', bengaliName: 'লোডেড মিট বক্স', defaultPrice: 120, isActive: true, canCarryover: true, sortOrder: 4 },
  { id: 'snack-hotdog', name: 'Chicken Hot Dog', bengaliName: 'চিকেন হট ডগ', defaultPrice: 60, isActive: true, canCarryover: true, sortOrder: 5 },
  { id: 'snack-roll', name: 'Crispy Chicken Roll', bengaliName: 'চিকেন রোল', defaultPrice: 60, isActive: true, canCarryover: true, sortOrder: 6 },
  { id: 'burger-arabian', name: 'Tuni Arabian Box (3 pcs)', bengaliName: 'টুনি এরাবিয়ান (৩ পিস)', defaultPrice: 60, isActive: true, canCarryover: true, sortOrder: 7 },
];

export const EXPENSE_CATEGORIES = [
  'Chicken',
  'Bread & Buns',
  'Cooking Oil & Spices',
  'Packaging & Disposables',
  'Cylinder Gas',
  'Transport',
  'Cart Maintenance',
  'Other',
] as const;

export const FREQUENT_PAYOUT_RECIPIENTS = [
  'Tamjid (Owner)',
  'Rabiul (Chef)',
  'Sohag (Staff)',
  'Other Person',
];

export interface DayData {
  session: DailySession;
  items: DailyInventoryItem[];
  expenses: DailyExpense[];
  payouts: DailyPayout[];
}

export const createDefaultSessionForDate = (dateStr: string, openingReserve: number = 0, openingCash: number = 1000): DayData => {
  return {
    session: {
      sessionDate: dateStr,
      status: 'open',
      isLocked: false,
      openingCash,
      khuchraTakenFromReserve: openingCash,
      openingSavedCash: openingReserve,
      totalProductsPrepared: 0,
      totalProductsSold: 0,
      totalProductsWasted: 0,
      grossEstimatedRevenue: 0,
      estimatedDiscounts: 0,
      netEstimatedRevenue: 0,
      totalExpenses: 0,
      totalPayouts: 0,
      expectedClosingCash: openingCash,
      actualCashCounted: openingCash,
      cashDifference: 0,
      transferredToReserve: 0,
      closingCartCash: openingCash,
      closingSavedCash: openingReserve,
      notes: '',
    },
    items: INITIAL_PRODUCTS.map((prod) => ({
      id: `inv-${dateStr}-${prod.id}`,
      sessionDate: dateStr,
      productId: prod.id,
      productName: prod.name,
      unitPrice: prod.defaultPrice,
      morningCarriedOver: 0,
      morningNewPrepared: 0,
      totalAvailable: 0,
      closingCounted: 0,
      closingUsableLeftover: 0,
      closingWasted: 0,
      quantitySold: 0,
      estimatedRevenue: 0,
    })),
    expenses: [],
    payouts: [],
  };
};

// Clean default states without fake historical numbers
export const HISTORICAL_DAYS: Record<string, DayData> = {};
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
