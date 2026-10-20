import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  DailySession, 
  DailyInventoryItem, 
  DailyExpense, 
  DailyPayout, 
  AuditLog, 
  Product 
} from '../types';
import { DayData, INITIAL_PRODUCTS } from '../data/mockDailyData';

export const getTodayDateString = (): string => {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
};

// -------------------------------------------------------------
// Database Mappers: snake_case (Supabase) <-> camelCase (TypeScript)
// -------------------------------------------------------------

export const mapSessionFromDB = (row: any): DailySession => ({
  sessionDate: row.session_date,
  status: row.status,
  isLocked: Boolean(row.is_locked),
  openingCash: Number(row.opening_cash) || 0,
  khuchraTakenFromReserve: Number(row.khuchra_taken_from_reserve || row.opening_cash) || 0,
  openingSavedCash: Number(row.opening_saved_cash) || 0,
  totalProductsPrepared: Number(row.total_products_prepared) || 0,
  totalProductsSold: Number(row.total_products_sold) || 0,
  totalProductsWasted: Number(row.total_products_wasted) || 0,
  grossEstimatedRevenue: Number(row.gross_estimated_revenue) || 0,
  estimatedDiscounts: Number(row.estimated_discounts) || 0,
  netEstimatedRevenue: Number(row.net_estimated_revenue) || 0,
  totalExpenses: Number(row.total_expenses) || 0,
  totalPayouts: Number(row.total_payouts) || 0,
  expectedClosingCash: Number(row.expected_closing_cash) || 0,
  actualCashCounted: Number(row.actual_cash_counted) || 0,
  cashDifference: Number(row.cash_difference) || 0,
  transferredToReserve: Number(row.transferred_to_reserve) || 0,
  closingCartCash: Number(row.closing_cart_cash) || 0,
  closingSavedCash: Number(row.closing_saved_cash) || 0,
  notes: row.notes || '',
  createdBy: row.created_by,
  closedBy: row.closed_by,
  closedAt: row.closed_at,
});

export const mapSessionToDB = (session: DailySession) => ({
  session_date: session.sessionDate,
  status: session.status,
  is_locked: session.isLocked,
  opening_cash: session.openingCash,
  khuchra_taken_from_reserve: session.khuchraTakenFromReserve ?? session.openingCash,
  opening_saved_cash: session.openingSavedCash,
  total_products_prepared: session.totalProductsPrepared,
  total_products_sold: session.totalProductsSold,
  total_products_wasted: session.totalProductsWasted,
  gross_estimated_revenue: session.grossEstimatedRevenue,
  estimated_discounts: session.estimatedDiscounts,
  net_estimated_revenue: session.netEstimatedRevenue,
  total_expenses: session.totalExpenses,
  total_payouts: session.totalPayouts,
  expected_closing_cash: session.expectedClosingCash,
  actual_cash_counted: session.actualCashCounted,
  cash_difference: session.cashDifference,
  transferred_to_reserve: session.transferredToReserve,
  closing_cart_cash: session.closingCartCash,
  closing_saved_cash: session.closingSavedCash,
  notes: session.notes,
  closed_at: session.closedAt,
});

export const mapInventoryFromDB = (row: any): DailyInventoryItem => ({
  id: row.id,
  sessionDate: row.session_date,
  productId: row.product_id,
  productName: row.product_name,
  unitPrice: Number(row.unit_price),
  morningCarriedOver: Number(row.morning_carried_over) || 0,
  morningNewPrepared: Number(row.morning_new_prepared) || 0,
  totalAvailable: Number(row.total_available) || (Number(row.morning_carried_over) + Number(row.morning_new_prepared)) || 0,
  closingCounted: Number(row.closing_counted) || 0,
  closingUsableLeftover: Number(row.closing_usable_leftover) || 0,
  closingWasted: Number(row.closing_wasted) || 0,
  quantitySold: Number(row.quantity_sold) || 0,
  estimatedRevenue: Number(row.estimated_revenue) || 0,
});

export const mapInventoryToDB = (item: DailyInventoryItem) => ({
  id: item.id.includes('-') && item.id.length > 20 ? item.id : undefined,
  session_date: item.sessionDate,
  product_id: item.productId,
  product_name: item.productName,
  unit_price: item.unitPrice,
  morning_carried_over: item.morningCarriedOver,
  morning_new_prepared: item.morningNewPrepared,
  closing_counted: item.closingCounted,
  closing_usable_leftover: item.closingUsableLeftover,
  closing_wasted: item.closingWasted,
});

export const mapExpenseFromDB = (row: any): DailyExpense => ({
  id: row.id,
  sessionDate: row.session_date,
  category: row.category,
  itemName: row.item_name,
  amount: Number(row.amount) || 0,
  paidByName: row.paid_by_name || 'Staff Member',
  notes: row.notes || '',
  createdAt: row.created_at,
});

export const mapExpenseToDB = (exp: DailyExpense) => ({
  id: exp.id.includes('-') && exp.id.length > 20 ? exp.id : undefined,
  session_date: exp.sessionDate,
  category: exp.category,
  item_name: exp.itemName,
  amount: exp.amount,
  paid_by_name: exp.paidByName,
  notes: exp.notes,
});

export const mapPayoutFromDB = (row: any): DailyPayout => ({
  id: row.id,
  sessionDate: row.session_date,
  recipientName: row.recipient_name,
  amount: Number(row.amount) || 0,
  payoutType: row.payout_type,
  notes: row.notes || '',
  createdAt: row.created_at,
});

export const mapPayoutToDB = (p: DailyPayout) => ({
  id: p.id.includes('-') && p.id.length > 20 ? p.id : undefined,
  session_date: p.sessionDate,
  recipient_name: p.recipientName,
  amount: p.amount,
  payout_type: p.payoutType,
  notes: p.notes,
});

export const mapAuditLogFromDB = (row: any): AuditLog => ({
  id: row.id,
  recordId: row.record_id,
  entityType: row.entity_type,
  action: row.action,
  changedField: row.changed_field,
  oldValue: row.old_value,
  newValue: row.new_value,
  changedByName: row.changed_by_name,
  changedByRole: row.changed_by_role,
  reason: row.reason,
  createdAt: row.created_at,
});

export const mapAuditLogToDB = (log: AuditLog) => ({
  record_id: log.recordId,
  entity_type: log.entityType,
  action: log.action,
  changed_field: log.changedField,
  old_value: log.oldValue !== undefined && log.oldValue !== null ? String(log.oldValue) : null,
  new_value: log.newValue !== undefined && log.newValue !== null ? String(log.newValue) : null,
  changed_by_name: log.changedByName || 'Staff Member',
  changed_by_role: log.changedByRole || 'admin',
  reason: log.reason,
});

// -------------------------------------------------------------
// Live Operations API Services
// -------------------------------------------------------------

/**
 * Fetch all master street menu products from database
 */
export const fetchProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return INITIAL_PRODUCTS;
  try {
    // Check total products count in master products table
    const { count, error: countErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // If completely fresh table (count is 0), seed initial products once
    if (!countErr && count === 0) {
      const seedPayload = INITIAL_PRODUCTS.map((p) => ({
        id: p.id,
        name: p.name,
        bengali_name: p.bengaliName || null,
        default_price: p.defaultPrice,
        is_active: true,
        can_carryover: p.canCarryover ?? true,
        sort_order: p.sortOrder ?? 0,
      }));
      await supabase.from('products').insert(seedPayload);
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.warn('Failed to fetch products from Supabase, using fallback:', error);
      return INITIAL_PRODUCTS;
    }

    if (!data || data.length === 0) {
      // If table exists and has rows, but none are active, return empty list (user archived all)
      if (count !== null && count > 0) {
        return [];
      }
      return INITIAL_PRODUCTS;
    }

    return data.map((p) => ({
      id: p.id,
      name: p.name,
      bengaliName: p.bengali_name,
      defaultPrice: Number(p.default_price),
      isActive: p.is_active,
      canCarryover: p.can_carryover,
      sortOrder: p.sort_order,
    }));
  } catch {
    return INITIAL_PRODUCTS;
  }
};

/**
 * Add a new product to master products catalog
 * Persists for all future days and shift openings
 */
export const createProductInDB = async (product: Product): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('products').upsert({
      id: product.id,
      name: product.name,
      bengali_name: product.bengaliName || null,
      default_price: product.defaultPrice,
      is_active: true,
      can_carryover: product.canCarryover ?? true,
      sort_order: product.sortOrder ?? 99,
    });
  } catch (err) {
    console.error('Failed to create product in DB:', err);
  }
};

/**
 * Soft-delete (archive) a product in master products catalog
 * Ensures the product NEVER appears in future shifts or opening stock,
 * while leaving past daily_inventory records, sales history, and range summaries 100% intact.
 */
export const archiveProductInDB = async (productId: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);
  } catch (err) {
    console.error('Failed to archive product in DB:', err);
  }
};

/**
 * Fetch all operating days, inventory items, expenses, and payouts
 */
export const fetchAllDaysData = async (): Promise<Record<string, DayData>> => {
  if (!isSupabaseConfigured()) return {};
  try {
    const [sessionsRes, invRes, expRes, payRes] = await Promise.all([
      supabase.from('daily_sessions').select('*').order('session_date', { ascending: false }),
      supabase.from('daily_inventory').select('*'),
      supabase.from('daily_expenses').select('*').order('created_at', { ascending: true }),
      supabase.from('daily_payouts').select('*').order('created_at', { ascending: true }),
    ]);

    const result: Record<string, DayData> = {};

    if (sessionsRes.data) {
      sessionsRes.data.forEach((sRow) => {
        const s = mapSessionFromDB(sRow);
        result[s.sessionDate] = {
          session: s,
          items: [],
          expenses: [],
          payouts: [],
        };
      });
    }

    if (invRes.data) {
      invRes.data.forEach((iRow) => {
        const item = mapInventoryFromDB(iRow);
        if (result[item.sessionDate]) {
          result[item.sessionDate].items.push(item);
        }
      });
    }

    if (expRes.data) {
      expRes.data.forEach((eRow) => {
        const exp = mapExpenseFromDB(eRow);
        if (result[exp.sessionDate]) {
          result[exp.sessionDate].expenses.push(exp);
        }
      });
    }

    if (payRes.data) {
      payRes.data.forEach((pRow) => {
        const pay = mapPayoutFromDB(pRow);
        if (result[pay.sessionDate]) {
          result[pay.sessionDate].payouts.push(pay);
        }
      });
    }

    return result;
  } catch (err) {
    console.error('Failed to fetch days data from Supabase:', err);
    return {};
  }
};

/**
 * Fetch recent audit trail logs
 */
export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return [];
    return data.map(mapAuditLogFromDB);
  } catch {
    return [];
  }
};

/**
 * Record an audit log entry
 */
export const insertAuditLog = async (log: AuditLog): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('audit_logs').insert(mapAuditLogToDB(log));
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
};

/**
 * Start/open a shift for a given date in Supabase
 */
export const startShiftSession = async (
  sessionDate: string, 
  openingCash: number = 1000,
  activeProducts: Product[] = []
): Promise<DayData | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // 1. Get latest closing saved cash and date from previous day
    const { data: latestSessions } = await supabase
      .from('daily_sessions')
      .select('closing_saved_cash, session_date')
      .lt('session_date', sessionDate)
      .order('session_date', { ascending: false })
      .limit(1);

    const prevSaved = Number(latestSessions?.[0]?.closing_saved_cash) || 0;
    const prevDate = latestSessions?.[0]?.session_date;

    // 2. Fetch yesterday's closing usable leftovers for carryover
    const prevLeftovers: Record<string, number> = {};
    if (prevDate) {
      const { data: prevInv } = await supabase
        .from('daily_inventory')
        .select('product_id, closing_usable_leftover')
        .eq('session_date', prevDate);
      if (prevInv) {
        prevInv.forEach((row) => {
          prevLeftovers[row.product_id] = Number(row.closing_usable_leftover) || 0;
        });
      }
    }

    const newSession: DailySession = {
      sessionDate,
      status: 'open',
      isLocked: false,
      openingCash,
      khuchraTakenFromReserve: openingCash,
      openingSavedCash: prevSaved,
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
      closingSavedCash: prevSaved,
      notes: '',
    };

    // Insert session into Supabase
    await supabase.from('daily_sessions').insert(mapSessionToDB(newSession));

    // Preload inventory items for each active product with carryover
    const inventoryItems: DailyInventoryItem[] = activeProducts.map((p) => {
      const carried = p.canCarryover ? (prevLeftovers[p.id] || 0) : 0;
      return {
        id: `${sessionDate}-${p.id}`,
        sessionDate,
        productId: p.id,
        productName: p.name,
        unitPrice: p.defaultPrice,
        morningCarriedOver: carried,
        morningNewPrepared: 0,
        totalAvailable: carried,
        closingCounted: carried,
        closingUsableLeftover: carried,
        closingWasted: 0,
        quantitySold: 0,
        estimatedRevenue: 0,
      };
    });

    if (inventoryItems.length > 0) {
      const invPayload = inventoryItems.map((item) => ({
        session_date: item.sessionDate,
        product_id: item.productId,
        product_name: item.productName,
        unit_price: item.unitPrice,
        morning_carried_over: item.morningCarriedOver,
        morning_new_prepared: 0,
        closing_counted: item.closingCounted,
        closing_usable_leftover: item.closingUsableLeftover,
        closing_wasted: 0,
      }));
      await supabase.from('daily_inventory').upsert(invPayload, { onConflict: 'session_date,product_id' });
    }

    return {
      session: newSession,
      items: inventoryItems,
      expenses: [],
      payouts: [],
    };
  } catch (err) {
    console.error('Failed to start shift session in Supabase:', err);
    return null;
  }
};

/**
 * Persist updated session counts and settlement to Supabase
 */
export const persistSession = async (session: DailySession): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('daily_sessions').upsert(mapSessionToDB(session));
  } catch (err) {
    console.error('Failed to persist session:', err);
  }
};

/**
 * Persist inventory items to Supabase
 */
export const persistInventoryItems = async (items: DailyInventoryItem[]): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    const payload = items.map((i) => ({
      session_date: i.sessionDate,
      product_id: i.productId,
      product_name: i.productName,
      unit_price: i.unitPrice,
      morning_carried_over: i.morningCarriedOver,
      morning_new_prepared: i.morningNewPrepared,
      closing_counted: i.closingCounted,
      closing_usable_leftover: i.closingUsableLeftover,
      closing_wasted: i.closingWasted,
    }));
    await supabase.from('daily_inventory').upsert(payload, { onConflict: 'session_date,product_id' });
  } catch (err) {
    console.error('Failed to persist inventory items:', err);
  }
};

/**
 * Persist expense addition/deletion
 */
export const persistExpense = async (expense: DailyExpense): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('daily_expenses').insert(mapExpenseToDB(expense));
  } catch (err) {
    console.error('Failed to persist expense:', err);
  }
};

export const deleteExpenseFromDB = async (expenseId: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('daily_expenses').delete().eq('id', expenseId);
  } catch (err) {
    console.error('Failed to delete expense:', err);
  }
};

export const deleteInventoryItemFromDB = async (sessionDate: string, productId: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase
      .from('daily_inventory')
      .delete()
      .eq('session_date', sessionDate)
      .eq('product_id', productId);
  } catch (err) {
    console.error('Failed to delete inventory item:', err);
  }
};

/**
 * Persist payout addition/deletion
 */
export const persistPayout = async (payout: DailyPayout): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('daily_payouts').insert(mapPayoutToDB(payout));
  } catch (err) {
    console.error('Failed to persist payout:', err);
  }
};

export const deletePayoutFromDB = async (payoutId: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase.from('daily_payouts').delete().eq('id', payoutId);
  } catch (err) {
    console.error('Failed to delete payout:', err);
  }
};

/**
 * Lock or Unlock a shift session in Supabase
 */
export const updateSessionLock = async (sessionDate: string, isLocked: boolean): Promise<void> => {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase
      .from('daily_sessions')
      .update({ is_locked: isLocked })
      .eq('session_date', sessionDate);
  } catch (err) {
    console.error('Failed to update session lock:', err);
  }
};
