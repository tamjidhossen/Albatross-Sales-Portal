export type Role = 'super_admin' | 'admin';
export type UserRole = Role;

export interface UserProfile {
  id: string;
  name?: string;
  full_name?: string;
  role: Role;
  email: string;
  phone?: string;
  createdAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  bengaliName?: string;
  price: number;
  portion?: string;
  category: 'combos' | 'burgers' | 'momos' | 'snacks';
  description: string;
  image?: string;
  isPopular?: boolean;
  isHot?: boolean;
}

export interface CustomerReview {
  id: string;
  name: string;
  handle: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  bengaliComment?: string;
  favoriteDish: string;
  avatarBg: string;
}

// -------------------------------------------------------------
// Daily Operations & Business Settlement Types (Central Unit)
// -------------------------------------------------------------

export interface Product {
  id: string;
  name: string;
  bengaliName?: string;
  defaultPrice: number;
  isActive: boolean;
  canCarryover: boolean;
  sortOrder: number;
}

export interface DailySession {
  sessionDate: string; // YYYY-MM-DD
  status: 'open' | 'closed';
  isLocked: boolean;
  
  // Starting cash (Khuchra)
  openingCash: number; // Khuchra taken for change
  khuchraTakenFromReserve?: number; // Change money taken from cash reserve
  openingSavedCash: number;
  
  // Stock aggregates
  totalProductsPrepared: number;
  totalProductsSold: number;
  totalProductsWasted: number;
  
  // Revenue calculations
  grossEstimatedRevenue: number;
  estimatedDiscounts: number;
  netEstimatedRevenue: number;
  
  // Expenses & Payouts
  totalExpenses: number;
  totalPayouts: number;
  
  // Cash Reconciliation & Anti-Theft
  expectedClosingCash: number;
  actualCashCounted: number;
  cashDifference: number; // actual - expected
  
  // Business Reserve Settlement
  transferredToReserve: number;
  closingCartCash: number;
  closingSavedCash: number;
  
  notes?: string;
  createdBy?: string;
  closedBy?: string;
  closedAt?: string;
}

export interface DailyInventoryItem {
  id: string;
  sessionDate: string;
  productId: string;
  productName: string;
  unitPrice: number;
  
  // Morning prep
  morningCarriedOver: number; // Approved from previous night
  morningNewPrepared: number;  // Freshly made this morning
  totalAvailable: number;      // morningCarriedOver + morningNewPrepared
  
  // Nightly closing count
  closingCounted: number;
  closingUsableLeftover: number; // Safe to carry over to tomorrow
  closingWasted: number;         // Discarded / expired
  
  // Automatically derived
  quantitySold: number;          // totalAvailable - closingUsable - closingWasted
  estimatedRevenue: number;      // quantitySold * unitPrice
}

export type ExpenseCategory = 
  | 'Chicken'
  | 'Bread & Buns'
  | 'Cooking Oil & Spices'
  | 'Packaging & Disposables'
  | 'Cylinder Gas'
  | 'Transport'
  | 'Cart Maintenance'
  | 'Other'
  | string;

export interface DailyExpense {
  id: string;
  sessionDate: string;
  category: ExpenseCategory;
  itemName: string;
  amount: number;
  paidByName: string;
  notes?: string;
  createdAt: string;
}

export interface DailyPayout {
  id: string;
  sessionDate: string;
  recipientName: string; // Tamjid, Staff A, Staff B
  amount: number;
  payoutType: 
    | 'Staff Daily Pay'
    | 'Owner Withdrawal'
    | 'Profit Share'
    | 'Emergency Cart Expense';
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  recordId: string;
  entityType: 'session' | 'inventory' | 'expense' | 'payout' | 'product' | 'sales' | 'bazaar' | 'settings';
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOCK' | 'UNLOCK';
  changedField?: string;
  oldValue?: string | number | null;
  newValue?: string | number | null;
  changedByName?: string;
  changedBy?: string;
  changedByRole?: Role;
  userRole?: Role;
  reason?: string;
  createdAt?: string;
  timestamp?: string;
}

// Deprecated legacy aliases for backward compatibility if needed
export type SalesRecord = any;
export type InventoryRecord = any;
export type BazaarExpense = any;
export type DynamicCategory = any;
export type AuditHistoryLog = AuditLog;
export type DailyLedgerSummary = any;
