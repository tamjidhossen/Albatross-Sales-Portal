import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  DailySession, 
  DailyInventoryItem, 
  DailyExpense, 
  DailyPayout, 
  AuditLog, 
  Role,
  Product
} from '../../types';
import { 
  INITIAL_AUDIT_LOGS,
  HISTORICAL_DAYS,
  DayData,
  createDefaultSessionForDate,
  INITIAL_PRODUCTS
} from '../../data/mockDailyData';
import { DailyDashboardOverview } from './DailyDashboardOverview';
import { MorningStockSection } from './MorningStockSection';
import { NightClosingSection } from './NightClosingSection';
import { ExpensesSection } from './ExpensesSection';
import { CashSettlementSection } from './CashSettlementSection';
import { AdminLogin } from './AdminLogin';
import { StaffAccountsModal } from './StaffAccountsModal';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { supabase, fetchStaffProfiles } from '../../lib/supabase';
import { 
  getTodayDateString, 
  fetchAllDaysData, 
  fetchProducts, 
  createProductInDB,
  archiveProductInDB,
  fetchAuditLogs, 
  startShiftSession, 
  persistSession, 
  persistInventoryItems, 
  persistExpense, 
  deleteExpenseFromDB, 
  deleteInventoryItemFromDB,
  persistPayout, 
  deletePayoutFromDB, 
  updateSessionLock, 
  insertAuditLog,
  cascadeInventoryCarryover 
} from '../../services/dailyOperationsService';
import { useAuth, AuthProvider } from '../../contexts/AuthContext';
import { 
  LogOut, 
  LayoutGrid, 
  Sun, 
  Moon, 
  Receipt, 
  Wallet,
  History,
  Store,
  Users,
  Calendar
} from 'lucide-react';

interface AdminLayoutProps {
  onBackToLanding?: () => void;
}

const AdminLayoutInner: React.FC<AdminLayoutProps> = ({ onBackToLanding }) => {
  const { user, profile, isLoading, signOut, setDemoUser, isConfigured } = useAuth();

  // Navigation tab with sessionStorage persistence
  const [activeTab, setActiveTab] = useState<'overview' | 'opening' | 'closing' | 'expenses' | 'cash' | 'audit'>(() => {
    try {
      const saved = sessionStorage.getItem('albatross_active_tab');
      if (saved && ['overview', 'opening', 'closing', 'expenses', 'cash', 'audit'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'overview';
  });
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Multi-day sessions dictionary and date selection with sessionStorage persistence
  const [allDays, setAllDays] = useState<Record<string, DayData>>(HISTORICAL_DAYS);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem('albatross_selected_date');
      if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) {
        return saved;
      }
    } catch {}
    return getTodayDateString();
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [staffProfiles, setStaffProfiles] = useState<any[]>([]);

  // Refs to avoid realtime race conditions and debounce network writes
  const lastLocalEditTimeRef = useRef<number>(0);
  const saveTimeoutRef = useRef<any>(null);

  // Clean up debounced save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Sync active tab to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('albatross_active_tab', activeTab);
    } catch {}
  }, [activeTab]);

  // Sync selected date to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('albatross_selected_date', selectedDate);
    } catch {}
  }, [selectedDate]);

  // Load live data from Supabase on mount and listen to realtime updates
  useEffect(() => {
    let isMounted = true;
    const loadSupabaseData = async () => {
      try {
        const [daysData, logs, staffRes] = await Promise.all([
          fetchAllDaysData(),
          fetchAuditLogs(),
          fetchStaffProfiles(),
        ]);
        if (isMounted) {
          if (daysData && Object.keys(daysData).length > 0) {
            const { updatedDays, changedDays } = cascadeInventoryCarryover(daysData);
            setAllDays((prev) => ({ ...prev, ...updatedDays }));
            if (changedDays.length > 0) {
              changedDays.forEach((cd) => {
                persistSession(cd.session);
                persistInventoryItems(cd.items);
              });
            }
          }
          if (logs && logs.length > 0) {
            setAuditLogs(logs);
          }
          if (staffRes?.data && staffRes.data.length > 0) {
            setStaffProfiles(staffRes.data);
          }
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      }
    };
    loadSupabaseData();

    // Guarded handler: Do NOT reload if user recently edited locally or is actively typing in an input
    const handleRealtimeRemoteUpdate = () => {
      if (Date.now() - lastLocalEditTimeRef.current < 4000) {
        return;
      }
      if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }
      loadSupabaseData();
    };

    // Subscribe to Supabase Realtime for instant multi-device live updates
    const channel = supabase
      .channel('daily_ops_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_sessions' },
        handleRealtimeRemoteUpdate
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_inventory' },
        handleRealtimeRemoteUpdate
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_expenses' },
        handleRealtimeRemoteUpdate
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_payouts' },
        handleRealtimeRemoteUpdate
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        handleRealtimeRemoteUpdate
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Names of existing registered accounts (strictly no dummy names like Rabiul/Shohag and no tags)
  const staffNames = useMemo(() => {
    const names = new Set<string>();
    if (profile?.full_name && profile.full_name.trim()) {
      names.add(profile.full_name.trim());
    }
    if (staffProfiles && staffProfiles.length > 0) {
      staffProfiles.forEach((p) => {
        if (p.full_name && p.full_name.trim()) {
          names.add(p.full_name.trim());
        }
      });
    }
    if (names.size === 0 && user?.email) {
      names.add(user.email.split('@')[0]);
    }
    return Array.from(names);
  }, [profile, staffProfiles, user]);

  // Clean user display name for the top bar header (no role tags)
  const displayName = useMemo(() => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name.trim();
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  }, [profile, user]);

  // Clean date string for top bar header (date of operation)
  const formattedSelectedDate = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Show clean spinner while Supabase authentication is restoring from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-9 h-9 rounded-full border-3 border-orange-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-bold text-zinc-600 tracking-tight">Loading Albatross Portal...</span>
      </div>
    );
  }

  // If user is not authenticated, show Admin Login
  if (!user) {
    return <AdminLogin onBackToLanding={onBackToLanding} />;
  }

  // Active day data for currently selected date (or null if cart not operated)
  const activeDay = allDays[selectedDate] || null;
  const session = activeDay?.session || null;
  const inventoryItems = activeDay?.items || [];
  const expenses = activeDay?.expenses || [];
  const payouts = activeDay?.payouts || [];

  const userRole: Role = profile?.role || 'admin';
  const isSuperAdmin = userRole === 'super_admin';

  // Helper: Append Audit Log
  const logAudit = (
    entityType: AuditLog['entityType'],
    recordId: string,
    action: AuditLog['action'],
    changedField?: string,
    oldValue?: string | number | null,
    newValue?: string | number | null,
    reason?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      recordId,
      entityType,
      action,
      changedField,
      oldValue,
      newValue,
      changedByName: profile?.full_name || user.email?.split('@')[0] || 'Staff Member',
      changedByRole: userRole,
      reason,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    insertAuditLog(newLog);
  };

  // Helper: Mutate the current active day
  const updateCurrentDay = (updater: (prevDay: DayData) => DayData) => {
    setAllDays((prevAll) => {
      const cur = prevAll[selectedDate];
      if (!cur) return prevAll;
      return {
        ...prevAll,
        [selectedDate]: updater(cur),
      };
    });
  };

  // Start Shift for Today / Selected Date
  const handleStartShift = async (openingCash: number = 1000) => {
    const prods = await fetchProducts();
    const started = await startShiftSession(selectedDate, openingCash, prods);
    const newDay = started || createDefaultSessionForDate(selectedDate, 0, openingCash, prods);
    
    setAllDays((prev) => {
      const nextMap = {
        ...prev,
        [selectedDate]: newDay,
      };
      const { updatedDays, changedDays } = cascadeInventoryCarryover(nextMap, selectedDate);
      if (changedDays.length > 0) {
        changedDays.forEach((cd) => {
          persistSession(cd.session);
          persistInventoryItems(cd.items);
        });
      }
      return updatedDays;
    });

    logAudit('session', selectedDate, 'INSERT', 'status', null, 'open', `Started shift for ${selectedDate} with ৳${openingCash} opening cash`);
  };

  // Recalculate Session Totals Helper (Instant local state update + Debounced Supabase sync)
  const recalculateSession = (
    nextInventory: DailyInventoryItem[],
    nextExpenses: DailyExpense[],
    nextPayouts: DailyPayout[],
    discounts: number,
    actualCash: number
  ) => {
    lastLocalEditTimeRef.current = Date.now();
    let sessionSnapshot: DailySession | null = null;
    let inventorySnapshot = nextInventory;
    let cascadedChangedDays: DayData[] = [];

    setAllDays((prevAll) => {
      const cur = prevAll[selectedDate];
      if (!cur) return prevAll;

      const totalPrepared = nextInventory.reduce((sum, i) => sum + i.totalAvailable, 0);
      const totalSold = nextInventory.reduce((sum, i) => sum + i.quantitySold, 0);
      const totalWasted = nextInventory.reduce((sum, i) => sum + i.closingWasted, 0);
      const grossRevenue = nextInventory.reduce((sum, i) => sum + i.estimatedRevenue, 0);
      const netRevenue = Math.max(0, grossRevenue - discounts);
      const totalExp = nextExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalPay = nextPayouts.reduce((sum, p) => sum + p.amount, 0);
      const expected = cur.session.openingCash + netRevenue - totalExp - totalPay;
      const diff = actualCash - expected;

      const updatedSession: DailySession = {
        ...cur.session,
        totalProductsPrepared: totalPrepared,
        totalProductsSold: totalSold,
        totalProductsWasted: totalWasted,
        grossEstimatedRevenue: grossRevenue,
        estimatedDiscounts: discounts,
        netEstimatedRevenue: netRevenue,
        totalExpenses: totalExp,
        totalPayouts: totalPay,
        expectedClosingCash: expected,
        actualCashCounted: actualCash,
        cashDifference: diff,
      };

      sessionSnapshot = updatedSession;

      const updatedCurDay: DayData = {
        ...cur,
        items: nextInventory,
        expenses: nextExpenses,
        payouts: nextPayouts,
        session: updatedSession,
      };

      const initialMap = {
        ...prevAll,
        [selectedDate]: updatedCurDay,
      };

      // Cascade closing leftovers and reserve cash forward to subsequent days immediately!
      const { updatedDays, changedDays } = cascadeInventoryCarryover(initialMap, selectedDate);
      cascadedChangedDays = changedDays;

      return updatedDays;
    });

    // Debounce Supabase writes by 600ms so rapid keystrokes never trigger feedback loops or DB flooding
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (sessionSnapshot) {
        persistSession(sessionSnapshot);
      }
      persistInventoryItems(inventorySnapshot);

      // Also persist any subsequent days that were updated by the carryover cascade!
      if (cascadedChangedDays.length > 0) {
        cascadedChangedDays.forEach((cd) => {
          persistSession(cd.session);
          persistInventoryItems(cd.items);
        });
      }
    }, 600);
  };

  // Morning Stock Update Handler
  const handleUpdateMorningItem = (productId: string, morningNewPrepared: number) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    const updated = inventoryItems.map((item) => {
      if (item.productId === productId) {
        const totalAvail = item.morningCarriedOver + morningNewPrepared;
        const sold = Math.max(0, totalAvail - item.closingUsableLeftover - item.closingWasted);
        return {
          ...item,
          morningNewPrepared,
          totalAvailable: totalAvail,
          quantitySold: sold,
          estimatedRevenue: sold * item.unitPrice,
        };
      }
      return item;
    });

    recalculateSession(updated, expenses, payouts, activeDay.session.estimatedDiscounts, activeDay.session.actualCashCounted);
    logAudit('inventory', productId, 'UPDATE', 'morningNewPrepared', undefined, morningNewPrepared, `${activeDay.session.isLocked ? '[Super Admin Override] ' : ''}Updated morning production`);
  };

  // Add New Product to Menu & Session (Persisted to Master Catalog for All Future Days)
  const handleAddProduct = async (name: string, price: number, prepared: number) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'item';
    const newId = `prod-${slug}-${Date.now()}`;

    const newProduct: Product = {
      id: newId,
      name: cleanName,
      bengaliName: cleanName,
      defaultPrice: price,
      isActive: true,
      canCarryover: true,
      sortOrder: 99,
    };

    // 1. Persist to master products table in Supabase (so it persists for all future dates)
    await createProductInDB(newProduct);

    // 2. Add to today's active session
    const newItem: DailyInventoryItem = {
      id: `inv-${selectedDate}-${newId}`,
      sessionDate: selectedDate,
      productId: newId,
      productName: cleanName,
      unitPrice: price,
      morningCarriedOver: 0,
      morningNewPrepared: prepared,
      totalAvailable: prepared,
      closingCounted: 0,
      closingUsableLeftover: 0,
      closingWasted: 0,
      quantitySold: 0,
      estimatedRevenue: 0,
    };

    const next = [...inventoryItems, newItem];
    recalculateSession(next, expenses, payouts, activeDay.session.estimatedDiscounts, activeDay.session.actualCashCounted);
    logAudit('product', newId, 'INSERT', 'name', null, cleanName, `${activeDay.session.isLocked ? '[Super Admin Override] ' : ''}Added product ${cleanName} @ ৳${price}`);
  };

  // Delete Product from Daily Inventory & Archive from Future Menus
  const handleDeleteMorningItem = async (productId: string) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    const target = inventoryItems.find((item) => item.productId === productId);
    if (!target) return;

    // 1. Delete from current day's daily_inventory in Supabase
    await deleteInventoryItemFromDB(selectedDate, productId);

    // 2. Archive from master products catalog so it NEVER appears in future shifts,
    // while keeping past daily_inventory records & range summaries 100% intact!
    await archiveProductInDB(productId);

    // 3. Remove from current session state and recalculate
    const updated = inventoryItems.filter((item) => item.productId !== productId);
    recalculateSession(updated, expenses, payouts, activeDay.session.estimatedDiscounts, activeDay.session.actualCashCounted);
    logAudit('product', productId, 'DELETE', 'isActive', 'active', 'archived', `${activeDay.session.isLocked ? '[Super Admin Override] ' : ''}Archived product ${target.productName} from menu`);
  };

  // Night Stock Count Handler (Simplified: Sold & Waste)
  const handleUpdateNightCount = (
    productId: string,
    sold: number,
    waste: number
  ) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    const updated = inventoryItems.map((item) => {
      if (item.productId === productId) {
        const reusable = Math.max(0, item.totalAvailable - sold - waste);
        return {
          ...item,
          closingUsableLeftover: reusable,
          closingWasted: waste,
          closingCounted: reusable + waste,
          quantitySold: sold,
          estimatedRevenue: sold * item.unitPrice,
        };
      }
      return item;
    });

    recalculateSession(updated, expenses, payouts, activeDay.session.estimatedDiscounts, activeDay.session.actualCashCounted);
    logAudit('inventory', productId, 'UPDATE', 'nightCount', undefined, `${sold} sold, ${waste} waste`, `${activeDay.session.isLocked ? '[Super Admin Override] ' : ''}Updated closing counts`);
  };

  // Discounts Update
  const handleUpdateDiscounts = (discounts: number) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    updateCurrentDay((cur) => ({
      ...cur,
      session: { ...cur.session, estimatedDiscounts: discounts },
    }));
    recalculateSession(inventoryItems, expenses, payouts, discounts, activeDay.session.actualCashCounted);
    logAudit('session', selectedDate, 'UPDATE', 'estimatedDiscounts', activeDay.session.estimatedDiscounts, discounts, `${activeDay.session.isLocked ? '[Super Admin Override] ' : ''}Updated estimated discounts`);
  };

  // Expense Handlers
  const handleAddExpense = (newExp: Omit<DailyExpense, 'id' | 'createdAt'>) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    const created: DailyExpense = {
      ...newExp,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    persistExpense(created);
    const updated = [created, ...expenses];
    recalculateSession(inventoryItems, updated, payouts, activeDay.session.estimatedDiscounts, activeDay.session.actualCashCounted);
    logAudit('expense', created.id, 'INSERT', 'amount', null, newExp.amount, `${activeDay.session.isLocked ? '[Super Admin Override] ' : ''}Added expense for ${newExp.itemName}`);
  };

  const handleDeleteExpense = (id: string) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    const target = expenses.find((e) => e.id === id);
    if (!target) return;
    deleteExpenseFromDB(id);
    const updated = expenses.filter((e) => e.id !== id);
    recalculateSession(inventoryItems, updated, payouts, activeDay.session.estimatedDiscounts, activeDay.session.actualCashCounted);
    logAudit('expense', id, 'DELETE', 'amount', target.amount, null, `${activeDay.session.isLocked ? '[Super Admin Override] ' : ''}Deleted expense: ${target.itemName}`);
  };

  // Payout Handlers
  const handleAddPayout = (newPayout: Omit<DailyPayout, 'id' | 'createdAt'>) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    const created: DailyPayout = {
      ...newPayout,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    persistPayout(created);
    const updated = [created, ...payouts];
    recalculateSession(inventoryItems, expenses, updated, activeDay.session.estimatedDiscounts, activeDay.session.actualCashCounted);
    logAudit('payout', created.id, 'INSERT', 'amount', null, newPayout.amount, `${activeDay.session.isLocked ? '[Super Admin Override] ' : ''}Paid ${newPayout.recipientName} ৳${newPayout.amount}`);
  };

  const handleDeletePayout = (id: string) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    const target = payouts.find((p) => p.id === id);
    if (!target) return;
    deletePayoutFromDB(id);
    const updated = payouts.filter((p) => p.id !== id);
    recalculateSession(inventoryItems, expenses, updated, activeDay.session.estimatedDiscounts, activeDay.session.actualCashCounted);
    logAudit('payout', id, 'DELETE', 'amount', target.amount, null, `${activeDay.session.isLocked ? '[Super Admin Override] ' : ''}Removed payout to ${target.recipientName}`);
  };

  // Khuchra Cash Handler
  const handleUpdateKhuchra = (khuchra: number) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    lastLocalEditTimeRef.current = Date.now();
    updateCurrentDay((cur) => {
      const exp = khuchra + cur.session.netEstimatedRevenue - cur.session.totalExpenses - cur.session.totalPayouts;
      const hasSavedDrawer = (cur.session.transferredToReserve || 0) > 0;
      const safeCash = Math.max(0, cur.session.openingSavedCash - khuchra);
      const closingSaved = hasSavedDrawer
        ? safeCash + cur.session.actualCashCounted
        : safeCash;

      const updatedSession: DailySession = {
        ...cur.session,
        openingCash: khuchra,
        khuchraTakenFromReserve: khuchra,
        expectedClosingCash: exp,
        cashDifference: cur.session.actualCashCounted - exp,
        closingSavedCash: closingSaved,
      };
      persistSession(updatedSession);
      return {
        ...cur,
        session: updatedSession,
      };
    });
    logAudit('session', selectedDate, 'UPDATE', 'khuchra', activeDay.session.openingCash, khuchra, `${activeDay.session.isLocked ? '[Super Admin Override] ' : ''}Adjusted morning khuchra cash to ৳${khuchra}`);
  };

  // Save Drawer Cash to Reserve Handler
  const handleSaveDrawerCash = (countedDrawerCash: number) => {
    if (!activeDay || (activeDay.session.isLocked && !isSuperAdmin)) return;
    lastLocalEditTimeRef.current = Date.now();
    setAllDays((prevAll) => {
      const cur = prevAll[selectedDate];
      if (!cur) return prevAll;
      const khuchra = cur.session.khuchraTakenFromReserve || cur.session.openingCash;
      const safeCash = Math.max(0, cur.session.openingSavedCash - khuchra);
      const nextReserve = safeCash + countedDrawerCash;
      const diff = countedDrawerCash - cur.session.expectedClosingCash;
      const updatedSession: DailySession = {
        ...cur.session,
        actualCashCounted: countedDrawerCash,
        cashDifference: diff,
        closingSavedCash: nextReserve,
        transferredToReserve: countedDrawerCash,
      };
      persistSession(updatedSession);

      const initialMap = {
        ...prevAll,
        [selectedDate]: { ...cur, session: updatedSession },
      };

      const { updatedDays, changedDays } = cascadeInventoryCarryover(initialMap, selectedDate);
      if (changedDays.length > 0) {
        changedDays.forEach((cd) => {
          persistSession(cd.session);
          persistInventoryItems(cd.items);
        });
      }
      return updatedDays;
    });
    logAudit('session', selectedDate, 'UPDATE', 'closingDrawerCash', activeDay.session.actualCashCounted, countedDrawerCash, `Saved closing drawer cash: ৳${countedDrawerCash}`);
  };

  // Lock / Unlock Toggle
  const handleToggleLock = () => {
    if (!activeDay) return;
    const nextLocked = !activeDay.session.isLocked;
    updateSessionLock(selectedDate, nextLocked);
    updateCurrentDay((cur) => {
      const updatedSession: DailySession = {
        ...cur.session,
        isLocked: nextLocked,
        status: nextLocked ? 'closed' : 'open',
        closedAt: nextLocked ? new Date().toISOString() : undefined,
      };
      persistSession(updatedSession);
      return {
        ...cur,
        session: updatedSession,
      };
    });
    logAudit('session', selectedDate, nextLocked ? 'LOCK' : 'UNLOCK', 'isLocked', activeDay.session.isLocked ? 'locked' : 'unlocked', nextLocked ? 'locked' : 'unlocked', `${nextLocked ? 'Locked' : 'Unlocked'} day session`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* Top Header (Clean, Minimal, White) */}
      <header className="sticky top-0 z-30 bg-white/95 border-b border-zinc-200 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        
        {/* Left: Cart Mark & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-zinc-900 overflow-hidden shrink-0 border border-zinc-300">
            <img src="/assets/images/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
          </div>

          <div>
            <span className="font-bold text-sm tracking-tight text-zinc-900 block leading-none">
              Albatross
            </span>
            <span className="text-[11px] text-zinc-500 font-medium block mt-0.5">
              {displayName}
            </span>
          </div>
        </div>

        {/* Center: Selected Operating Date */}
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100/90 hover:bg-zinc-200/80 border border-zinc-200/90 text-zinc-800 shadow-2xs transition active:scale-95 cursor-pointer"
          title="Selected operating date (tap to open overview)"
        >
          <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span className="text-[11px] font-bold tracking-tight">
            {formattedSelectedDate}
          </span>
        </button>

        {/* Right: Team Management & Logout */}
        <div className="flex items-center gap-1.5">
          
          {/* Super Admin Staff Management Button */}
          {isSuperAdmin && (
            <button
              onClick={() => setIsStaffModalOpen(true)}
              className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-[11px] font-bold flex items-center gap-1 transition shadow-2xs active:scale-95"
              title="Manage Staff & Team Accounts"
            >
              <Users className="w-3.5 h-3.5 text-orange-600" />
              <span>Staff</span>
            </button>
          )}

          {/* Logout button */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-red-50 text-zinc-500 hover:text-red-600 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </header>

      {/* Main Content Area (Mobile Viewport) */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 pb-24">
        
        {activeTab === 'overview' && (
          <DailyDashboardOverview
            session={session}
            items={inventoryItems}
            expenses={expenses}
            payouts={payouts}
            selectedDate={selectedDate}
            onSelectDate={(date) => setSelectedDate(date)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onToggleLock={handleToggleLock}
            onStartShift={handleStartShift}
            isSuperAdmin={isSuperAdmin}
            allSessionsData={allDays}
          />
        )}

        {/* If cart was not operated on this date and user visits an operational tab */}
        {!session && activeTab !== 'overview' && activeTab !== 'audit' && (
          <div className="bg-white rounded-2xl p-6 border border-zinc-200 text-center space-y-3 shadow-xs font-sans">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <Store className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-zinc-900">
                {selectedDate >= getTodayDateString() ? "Food Cart Not Started Yet" : "Food Cart Closed"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                {selectedDate >= getTodayDateString()
                  ? "This shift has not been started yet. Start the shift to record opening inventory and cash drawer."
                  : `The food cart was not opened on ${selectedDate}. No inventory, expenses, or cash drawer records exist for this day.`}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs transition"
              >
                Back to Overview
              </button>
              {(selectedDate >= getTodayDateString() || isSuperAdmin) && (
                <button
                  onClick={() => handleStartShift(1000)}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs active:scale-98"
                >
                  <Sun className="w-3.5 h-3.5 text-white" />
                  <span>Start Shift (৳1,000 Khuchra)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {session && activeTab === 'opening' && (
          <MorningStockSection
            items={inventoryItems}
            onUpdateItem={handleUpdateMorningItem}
            onAddProduct={handleAddProduct}
            onDeleteItem={handleDeleteMorningItem}
            onBack={() => setActiveTab('overview')}
            isLocked={session.isLocked && !isSuperAdmin}
          />
        )}

        {session && activeTab === 'closing' && (
          <NightClosingSection
            items={inventoryItems}
            estimatedDiscounts={session.estimatedDiscounts}
            onUpdateNightCount={handleUpdateNightCount}
            onUpdateDiscounts={handleUpdateDiscounts}
            onBack={() => setActiveTab('overview')}
            isLocked={session.isLocked && !isSuperAdmin}
          />
        )}

        {session && activeTab === 'expenses' && (
          <ExpensesSection
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onBack={() => setActiveTab('overview')}
            isLocked={session.isLocked && !isSuperAdmin}
            staffNames={staffNames}
          />
        )}

        {session && activeTab === 'cash' && (
          <CashSettlementSection
            session={session}
            items={inventoryItems}
            expenses={expenses}
            payouts={payouts}
            onAddPayout={handleAddPayout}
            onDeletePayout={handleDeletePayout}
            onUpdateKhuchra={handleUpdateKhuchra}
            onSaveDrawerCash={handleSaveDrawerCash}
            onToggleLock={handleToggleLock}
            onBack={() => setActiveTab('overview')}
            isSuperAdmin={isSuperAdmin}
            staffNames={staffNames}
          />
        )}

        {activeTab === 'audit' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
              <span className="font-bold text-sm text-zinc-900">
                Audit Trail (Change History)
              </span>
              <button
                onClick={() => setActiveTab('overview')}
                className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
              >
                Done
              </button>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="bg-white rounded-xl p-3 border border-zinc-200 text-xs shadow-sm">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span className="font-semibold text-zinc-700">{log.action} • {log.entityType}</span>
                    <span>{log.createdAt}</span>
                  </div>
                  <div className="font-medium text-zinc-900">{log.reason || 'Record updated'}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    By: <strong className="text-zinc-800">{log.changedByName}</strong> ({log.changedByRole})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation Bar (Minimal, Clean White with Orange Accent) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-zinc-200 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-sm">
        
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
            activeTab === 'overview' 
              ? 'text-orange-600 font-bold bg-orange-50 border border-orange-200/60 shadow-2xs' 
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('opening')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
            activeTab === 'opening' 
              ? 'text-orange-600 font-bold bg-orange-50 border border-orange-200/60 shadow-2xs' 
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Opening</span>
        </button>

        <button
          onClick={() => setActiveTab('closing')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
            activeTab === 'closing' 
              ? 'text-orange-600 font-bold bg-orange-50 border border-orange-200/60 shadow-2xs' 
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Closing</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
            activeTab === 'expenses' 
              ? 'text-orange-600 font-bold bg-orange-50 border border-orange-200/60 shadow-2xs' 
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Expenses</span>
        </button>

        <button
          onClick={() => setActiveTab('cash')}
          className={`flex flex-col items-center py-1 px-3 rounded-lg transition ${
            activeTab === 'cash' 
              ? 'text-orange-600 font-bold bg-orange-50 border border-orange-200/60 shadow-2xs' 
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Cash</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition ${
            activeTab === 'audit' 
              ? 'text-orange-600 font-bold bg-orange-50 border border-orange-200/60 shadow-2xs' 
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 border border-transparent'
          }`}
          title="Audit Trail"
        >
          <History className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Audit</span>
        </button>

      </nav>

      {/* Staff Accounts Management Modal (Super Admin only) */}
      {isSuperAdmin && (
        <StaffAccountsModal
          isOpen={isStaffModalOpen}
          onClose={async () => {
            setIsStaffModalOpen(false);
            const staffRes = await fetchStaffProfiles();
            if (staffRes?.data && staffRes.data.length > 0) {
              setStaffProfiles(staffRes.data);
            }
          }}
          currentUserEmail={user.email || ''}
        />
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 leading-tight">
                  Sign Out?
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Are you sure you want to log out of the admin portal?
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs transition active:scale-98"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsLogoutModalOpen(false);
                  await signOut();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminLayoutInner {...props} />
      </AuthProvider>
    </ErrorBoundary>
  );
};
