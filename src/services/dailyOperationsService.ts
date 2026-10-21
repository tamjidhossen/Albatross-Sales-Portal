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

export const mapSessionFromDB = (row: any): DailySession => {
  const transferred = Number(row.transferred_to_reserve) || 0;
  const rawActual = Number(row.actual_cash_counted) || 0;
  const openingCash = Number(row.opening_cash) || 0;
  const khuchra = Number(row.khuchra_taken_from_reserve || row.opening_cash) || 0;
  const openingSaved = Number(row.opening_saved_cash) || 0;
  const rawClosingSaved = Number(row.closing_saved_cash) || 0;

  // If drawer has not been counted & transferred to reserve tonight:
  // - actualCashCounted defaults to 0 (clean legacy uncounted default 1000 or openingCash)
  // - closingSavedCash reflects safe cash remaining after taking khuchra: openingSaved - khuchra
  const isUncounted = transferred === 0 && row.status === 'open';
  const cleanActualCash = isUncounted && (rawActual === 1000 || rawActual === openingCash) ? 0 : rawActual;
  const cleanClosingSaved = isUncounted ? Math.max(0, openingSaved - khuchra) : rawClosingSaved;

  return {
    sessionDate: row.session_date,
    status: row.status,
    isLocked: Boolean(row.is_locked),
    openingCash,
    khuchraTakenFromReserve: khuchra,
    openingSavedCash: openingSaved,
    totalProductsPrepared: Number(row.total_products_prepared) || 0,
    totalProductsSold: Number(row.total_products_sold) || 0,
    totalProductsWasted: Number(row.total_products_wasted) || 0,
    grossEstimatedRevenue: Number(row.gross_estimated_revenue) || 0,
    estimatedDiscounts: Number(row.estimated_discounts) || 0,
    netEstimatedRevenue: Number(row.net_estimated_revenue) || 0,
    totalExpenses: Number(row.total_expenses) || 0,
    totalPayouts: Number(row.total_payouts) || 0,
    expectedClosingCash: Number(row.expected_closing_cash) || 0,
    actualCashCounted: cleanActualCash,
    cashDifference: Number(row.cash_difference) || 0,
    transferredToReserve: transferred,
    closingCartCash: Number(row.closing_cart_cash) || 0,
    closingSavedCash: cleanClosingSaved,
    notes: row.notes || '',
    createdBy: row.created_by,
    closedBy: row.closed_by,
    closedAt: row.closed_at,
  };
};

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

export const mapInventoryFromDB = (row: any): DailyInventoryItem => {
  const carried = Number(row.morning_carried_over) || 0;
  const prepared = Number(row.morning_new_prepared) || 0;
  const avail = Number(row.total_available) || (carried + prepared) || 0;
  const usable = Number(row.closing_usable_leftover) || 0;
  const wasted = Number(row.closing_wasted) || 0;
  const price = Number(row.unit_price) || 0;

  // Derive sold: if explicitly stored in row use that, otherwise default to avail - usable - wasted
  const sold = row.quantity_sold !== undefined && row.quantity_sold !== null
    ? Number(row.quantity_sold)
    : Math.max(0, avail - usable - wasted);
  const rev = row.estimated_revenue !== undefined && row.estimated_revenue !== null
    ? Number(row.estimated_revenue)
    : sold * price;

  return {
    id: row.id,
    sessionDate: row.session_date,
    productId: row.product_id,
    productName: row.product_name,
    unitPrice: price,
    morningCarriedOver: carried,
    morningNewPrepared: prepared,
    totalAvailable: avail,
    closingCounted: Number(row.closing_counted) || (usable + wasted),
    closingUsableLeftover: usable,
    closingWasted: wasted,
    quantitySold: sold,
    estimatedRevenue: rev,
  };
};

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

const ARCHIVED_PRODUCTS_KEY = 'albatross_archived_product_ids';
const CUSTOM_PRODUCTS_KEY = 'albatross_custom_products';

export const getArchivedProductIds = (): string[] => {
  try {
    const raw = localStorage.getItem(ARCHIVED_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addArchivedProductId = (id: string): void => {
  try {
    const list = new Set(getArchivedProductIds());
    list.add(id);
    localStorage.setItem(ARCHIVED_PRODUCTS_KEY, JSON.stringify(Array.from(list)));
  } catch (err) {
    console.error('Failed to save archived product ID:', err);
  }
};

export const removeArchivedProductId = (id: string): void => {
  try {
    const list = new Set(getArchivedProductIds());
    list.delete(id);
    localStorage.setItem(ARCHIVED_PRODUCTS_KEY, JSON.stringify(Array.from(list)));
  } catch (err) {
    console.error('Failed to remove archived product ID:', err);
  }
};

export const removeCustomProduct = (id: string): void => {
  try {
    const existing: Product[] = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || '[]');
    const filtered = existing.filter((p) => p.id !== id);
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(filtered));
  } catch {}
};

/**
 * Fetch all master street menu products from database
 */
export const fetchProducts = async (): Promise<Product[]> => {
  const archivedIds = new Set(getArchivedProductIds());
  let prods: Product[] = [];

  if (isSupabaseConfigured()) {
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
      
      if (!error && data && data.length > 0) {
        prods = data.map((p) => ({
          id: p.id,
          name: p.name,
          bengaliName: p.bengali_name,
          defaultPrice: Number(p.default_price),
          isActive: p.is_active,
          canCarryover: p.can_carryover,
          sortOrder: p.sort_order,
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch products from Supabase:', err);
    }
  }

  // Fallback to INITIAL_PRODUCTS + custom products from local cache
  if (prods.length === 0) {
    let custom: Product[] = [];
    try {
      custom = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || '[]');
    } catch {}
    prods = [...INITIAL_PRODUCTS, ...custom];
  }

  // Strictly filter out any archived products
  return prods.filter((p) => !archivedIds.has(p.id) && p.isActive !== false);
};

/**
 * Add a new product to master products catalog
 * Persists for all future days and shift openings
 */
export const createProductInDB = async (product: Product): Promise<void> => {
  removeArchivedProductId(product.id);
  try {
    const existing: Product[] = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || '[]');
    const filtered = existing.filter((p) => p.id !== product.id);
    filtered.push(product);
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(filtered));
  } catch {}

  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('products').upsert({
      id: product.id,
      name: product.name,
      bengali_name: product.bengaliName || null,
      default_price: product.defaultPrice,
      is_active: true,
      can_carryover: product.canCarryover ?? true,
      sort_order: product.sortOrder ?? 99,
    });
    if (error) {
      console.warn('Supabase product upsert warning:', error.message);
    }
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
  addArchivedProductId(productId);
  removeCustomProduct(productId);
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);
    if (error) {
      console.warn('Supabase product archive warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to archive product in DB:', err);
  }
};

/**
 * Automatically reconciles and cascades inventory carryover stock and closing reserve cash
 * across consecutive operating days in chronological order.
 * Ensures that if Day 1's sales or leftover is corrected later, Day 2's morningCarriedOver
 * matches Day 1's updated closing usable leftover without manual re-entry.
 */
export const cascadeInventoryCarryover = (
  allDays: Record<string, DayData>,
  changedDate?: string
): { updatedDays: Record<string, DayData>; changedDays: DayData[] } => {
  const sortedDates = Object.keys(allDays).sort();
  const updatedDays: Record<string, DayData> = { ...allDays };
  const changedDays: DayData[] = [];

  const startIndex = changedDate ? Math.max(0, sortedDates.indexOf(changedDate)) : 0;

  for (let i = startIndex; i < sortedDates.length - 1; i++) {
    const curDate = sortedDates[i];
    const nextDate = sortedDates[i + 1];

    const curDay = updatedDays[curDate];
    const nextDay = updatedDays[nextDate];

    if (!curDay || !nextDay || !nextDay.session) continue;

    let nextDayModified = false;

    // 1. Map closing leftovers of curDay by productId
    const curLeftovers: Record<string, number> = {};
    curDay.items.forEach((item) => {
      curLeftovers[item.productId] = item.closingUsableLeftover;
    });

    // 2. Check and update morningCarriedOver in nextDay.items
    const nextItems = nextDay.items.map((nextItem) => {
      if (curLeftovers[nextItem.productId] !== undefined) {
        const expectedCarry = curLeftovers[nextItem.productId];
        if (nextItem.morningCarriedOver !== expectedCarry) {
          nextDayModified = true;
          const newTotalAvail = expectedCarry + nextItem.morningNewPrepared;
          // If nextDay is an open shift and closing count was not explicitly changed by user
          // (reusable === 0 && waste === 0), sold defaults to the new total available!
          const isDefaultCount = !nextDay.session.isLocked && nextItem.closingUsableLeftover === 0 && nextItem.closingWasted === 0;
          const sold = isDefaultCount ? newTotalAvail : Math.min(newTotalAvail, nextItem.quantitySold);
          const waste = nextItem.closingWasted;
          const reusable = Math.max(0, newTotalAvail - sold - waste);
          return {
            ...nextItem,
            morningCarriedOver: expectedCarry,
            totalAvailable: newTotalAvail,
            closingUsableLeftover: reusable,
            closingCounted: reusable + waste,
            quantitySold: sold,
            estimatedRevenue: sold * nextItem.unitPrice,
          };
        }
      }
      return nextItem;
    });

    // Check if curDay has items that nextDay doesn't have at all
    const nextProductIds = new Set(nextItems.map((i) => i.productId));
    curDay.items.forEach((curItem) => {
      if (!nextProductIds.has(curItem.productId) && curItem.closingUsableLeftover > 0) {
        nextDayModified = true;
        nextItems.push({
          id: `inv-${nextDate}-${curItem.productId}`,
          sessionDate: nextDate,
          productId: curItem.productId,
          productName: curItem.productName,
          unitPrice: curItem.unitPrice,
          morningCarriedOver: curItem.closingUsableLeftover,
          morningNewPrepared: 0,
          totalAvailable: curItem.closingUsableLeftover,
          closingCounted: curItem.closingUsableLeftover,
          closingUsableLeftover: curItem.closingUsableLeftover,
          closingWasted: 0,
          quantitySold: 0,
          estimatedRevenue: 0,
        });
      }
    });

    // 3. Check and update openingSavedCash from curDay's closingSavedCash
    let nextSession = nextDay.session;
    const expectedOpeningReserve = curDay.session.closingSavedCash;
    if (expectedOpeningReserve > 0 && nextSession.openingSavedCash !== expectedOpeningReserve && curDay.session.status === 'closed') {
      nextDayModified = true;
      const khuchra = nextSession.khuchraTakenFromReserve || nextSession.openingCash;
      const netCashGenerated = nextSession.actualCashCounted - khuchra;
      nextSession = {
        ...nextSession,
        openingSavedCash: expectedOpeningReserve,
        closingSavedCash: expectedOpeningReserve + netCashGenerated,
      };
    }

    if (nextDayModified) {
      const grossRevenue = nextItems.reduce((sum, item) => sum + item.estimatedRevenue, 0);
      const netRevenue = Math.max(0, grossRevenue - nextSession.estimatedDiscounts);
      const totalExp = nextDay.expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalPay = nextDay.payouts.reduce((sum, p) => sum + p.amount, 0);
      const expectedCash = nextSession.openingCash + netRevenue - totalExp - totalPay;

      const finalNextSession: DailySession = {
        ...nextSession,
        totalProductsPrepared: nextItems.reduce((sum, item) => sum + item.totalAvailable, 0),
        totalProductsSold: nextItems.reduce((sum, item) => sum + item.quantitySold, 0),
        totalProductsWasted: nextItems.reduce((sum, item) => sum + item.closingWasted, 0),
        grossEstimatedRevenue: grossRevenue,
        netEstimatedRevenue: netRevenue,
        expectedClosingCash: expectedCash,
        cashDifference: nextSession.actualCashCounted - expectedCash,
      };

      const updatedNextDay: DayData = {
        ...nextDay,
        items: nextItems,
        session: finalNextSession,
      };

      updatedDays[nextDate] = updatedNextDay;
      changedDays.push(updatedNextDay);
    }
  }

  return { updatedDays, changedDays };
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
      const archivedIds = new Set(getArchivedProductIds());
      invRes.data.forEach((iRow) => {
        const item = mapInventoryFromDB(iRow);
        // If this product was archived and has no sales/prep recorded for this session,
        // do not display it so it doesn't resurrect on page refresh
        const hasActivity = (item.morningNewPrepared > 0 || item.quantitySold > 0 || item.closingWasted > 0);
        if (archivedIds.has(item.productId) && !hasActivity) {
          return;
        }

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

    // Ensure newly added custom products in active open sessions are not lost on refresh for staff
    try {
      const customProds: Product[] = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || '[]');
      const archivedIds = new Set(getArchivedProductIds());
      Object.values(result).forEach((dayData) => {
        if (dayData.session && dayData.session.status === 'open' && !dayData.session.isLocked) {
          const existingIds = new Set(dayData.items.map((i) => i.productId));
          customProds.forEach((cp) => {
            if (!existingIds.has(cp.id) && !archivedIds.has(cp.id) && cp.isActive !== false) {
              dayData.items.push({
                id: `inv-${dayData.session.sessionDate}-${cp.id}`,
                sessionDate: dayData.session.sessionDate,
                productId: cp.id,
                productName: cp.name,
                unitPrice: cp.defaultPrice,
                morningCarriedOver: 0,
                morningNewPrepared: 0,
                totalAvailable: 0,
                closingCounted: 0,
                closingUsableLeftover: 0,
                closingWasted: 0,
                quantitySold: 0,
                estimatedRevenue: 0,
              });
            }
          });

          // Heal legacy open sessions where carryover wasn't counted as sold by default
          dayData.items.forEach((item) => {
            if (
              item.morningCarriedOver > 0 &&
              item.closingUsableLeftover === item.morningCarriedOver &&
              item.closingWasted === 0 &&
              item.quantitySold === item.morningNewPrepared
            ) {
              item.closingUsableLeftover = 0;
              item.closingCounted = 0;
              item.quantitySold = item.totalAvailable;
              item.estimatedRevenue = item.totalAvailable * item.unitPrice;
            }
          });
          const totalSold = dayData.items.reduce((s, i) => s + i.quantitySold, 0);
          const grossRev = dayData.items.reduce((s, i) => s + i.estimatedRevenue, 0);
          dayData.session.totalProductsSold = totalSold;
          dayData.session.grossEstimatedRevenue = grossRev;
          dayData.session.netEstimatedRevenue = Math.max(0, grossRev - (dayData.session.estimatedDiscounts || 0));
        }
      });
    } catch {}

    const { updatedDays } = cascadeInventoryCarryover(result);
    return updatedDays;
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
        closingCounted: 0,
        closingUsableLeftover: 0,
        closingWasted: 0,
        quantitySold: carried,
        estimatedRevenue: carried * p.defaultPrice,
      };
    });

    const initialPrepared = inventoryItems.reduce((s, i) => s + i.totalAvailable, 0);
    const initialSold = inventoryItems.reduce((s, i) => s + i.quantitySold, 0);
    const initialGross = inventoryItems.reduce((s, i) => s + i.estimatedRevenue, 0);

    const newSession: DailySession = {
      sessionDate,
      status: 'open',
      isLocked: false,
      openingCash,
      khuchraTakenFromReserve: openingCash,
      openingSavedCash: prevSaved,
      totalProductsPrepared: initialPrepared,
      totalProductsSold: initialSold,
      totalProductsWasted: 0,
      grossEstimatedRevenue: initialGross,
      estimatedDiscounts: 0,
      netEstimatedRevenue: initialGross,
      totalExpenses: 0,
      totalPayouts: 0,
      expectedClosingCash: openingCash,
      actualCashCounted: 0,
      cashDifference: -openingCash,
      transferredToReserve: 0,
      closingCartCash: 0,
      closingSavedCash: Math.max(0, prevSaved - openingCash),
      notes: '',
    };

    // Insert session into Supabase
    await supabase.from('daily_sessions').insert(mapSessionToDB(newSession));

    if (inventoryItems.length > 0) {
      const invPayload = inventoryItems.map((item) => ({
        session_date: item.sessionDate,
        product_id: item.productId,
        product_name: item.productName,
        unit_price: item.unitPrice,
        morning_carried_over: item.morningCarriedOver,
        morning_new_prepared: 0,
        closing_counted: 0,
        closing_usable_leftover: 0,
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
  addArchivedProductId(productId);
  removeCustomProduct(productId);
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase
      .from('daily_inventory')
      .delete()
      .eq('session_date', sessionDate)
      .eq('product_id', productId);
    if (error) {
      console.warn('Supabase daily_inventory delete warning (may require RLS delete policy):', error.message);
    }
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
