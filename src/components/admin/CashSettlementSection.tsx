import React, { useState, useEffect, useMemo } from 'react';
import { DailySession, DailyPayout, DailyInventoryItem, DailyExpense } from '../../types';
import { 
  Wallet, 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Trash2, 
  ShieldCheck,
  Coins,
  Download,
  Check,
  ChevronDown,
  Edit3
} from 'lucide-react';
import { downloadDailySummaryImage } from '../../utils/generateSummaryImage';
import { LockConfirmationModal } from './LockConfirmationModal';

interface CashSettlementSectionProps {
  session: DailySession;
  items: DailyInventoryItem[];
  expenses: DailyExpense[];
  payouts: DailyPayout[];
  onAddPayout: (payout: Omit<DailyPayout, 'id' | 'createdAt'>) => void;
  onDeletePayout: (id: string) => void;
  onUpdateKhuchra: (amount: number) => void;
  onSaveDrawerCash: (actualCount: number) => void;
  onToggleLock: () => void;
  onBack: () => void;
  isSuperAdmin: boolean;
  staffNames?: string[];
}

export const CashSettlementSection: React.FC<CashSettlementSectionProps> = ({
  session,
  items,
  expenses,
  payouts,
  onAddPayout,
  onDeletePayout,
  onUpdateKhuchra,
  onSaveDrawerCash,
  onToggleLock,
  onBack,
  isSuperAdmin,
  staffNames = [],
}) => {
  // Available payout recipients derived strictly from real registered accounts (no dummy names or tags)
  const availableRecipients = useMemo(() => {
    const list: string[] = [];
    if (staffNames && staffNames.length > 0) {
      staffNames.forEach((n) => list.push(n));
    } else {
      list.push('Tamjid');
    }
    list.push('Other Person');
    return list;
  }, [staffNames]);

  // Payout input states
  const [recipient, setRecipient] = useState(availableRecipients[0] || 'Other Person');
  const [customRecipient, setCustomRecipient] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('500');
  const [payoutType, setPayoutType] = useState<DailyPayout['payoutType']>('Staff Daily Pay');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [confirmDeletePayoutId, setConfirmDeletePayoutId] = useState<string | null>(null);

  // Khuchra cash state
  const khuchraVal = session.khuchraTakenFromReserve ?? session.openingCash ?? 0;
  const [khuchraInput, setKhuchraInput] = useState(khuchraVal === 0 ? '' : khuchraVal.toString());

  // Closing drawer cash modal state
  const [isDrawerModalOpen, setIsDrawerModalOpen] = useState(false);
  const [drawerModalInput, setDrawerModalInput] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  useEffect(() => {
    const kVal = session.khuchraTakenFromReserve ?? session.openingCash ?? 0;
    setKhuchraInput(kVal === 0 ? '' : kVal.toString());
  }, [session.sessionDate, session.khuchraTakenFromReserve, session.openingCash]);

  const rawExpectedClosingCash = khuchraVal + session.netEstimatedRevenue - session.totalExpenses - session.totalPayouts;
  const isNegativeExpected = rawExpectedClosingCash < 0;
  const expectedClosingCash = Math.max(0, rawExpectedClosingCash);
  const currentDiff = session.actualCashCounted - expectedClosingCash;
  const isMatch = currentDiff === 0 && !isNegativeExpected;
  const isShortage = currentDiff < 0;
  const isEditable = !session.isLocked || isSuperAdmin;
  const hasSavedDrawer = (session.transferredToReserve || 0) > 0 || session.isLocked;

  const handleKhuchraBlur = () => {
    const parsed = parseFloat(khuchraInput);
    const val = isNaN(parsed) ? 0 : Math.max(0, parsed);
    onUpdateKhuchra(val);
  };

  const handleOpenDrawerModal = () => {
    if (!isEditable) return;
    setDrawerModalInput((session.actualCashCounted ?? 0).toString());
    setIsDrawerModalOpen(true);
  };

  const handleConfirmDrawerModal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(drawerModalInput);
    const val = isNaN(parsed) ? 0 : Math.max(0, parsed);
    onSaveDrawerCash(val);
    setIsDrawerModalOpen(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleAddPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRecipient = recipient === 'Other Person' ? customRecipient.trim() : recipient;
    const amountNum = parseFloat(payoutAmount);
    if (!finalRecipient || isNaN(amountNum) || amountNum <= 0) return;

    onAddPayout({
      sessionDate: session.sessionDate,
      recipientName: finalRecipient,
      amount: amountNum,
      payoutType: payoutType,
      notes: payoutNotes || undefined,
    });

    setPayoutNotes('');
    if (recipient === 'Other Person') setCustomRecipient('');
  };

  const handleDownloadSlip = () => {
    setIsDownloading(true);
    try {
      downloadDailySummaryImage(session, items, expenses, payouts);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  return (
    <div className="space-y-2.5">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold flex items-center gap-1 transition shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-orange-500" />
          <span>Cash & Payouts</span>
        </span>

        <button
          onClick={handleDownloadSlip}
          disabled={isDownloading}
          className="px-2 py-1 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-bold flex items-center gap-1 transition shadow-xs"
          title="Download 1-Image Summary"
        >
          <Download className="w-3 h-3 text-orange-600" />
          <span>Slip</span>
        </button>
      </div>

      {session.isLocked && (
        <div className={`rounded-xl p-2 text-[11px] font-semibold text-center border ${
          isSuperAdmin 
            ? 'bg-amber-50 border-amber-200 text-amber-900' 
            : 'bg-zinc-100 border-zinc-200 text-zinc-600'
        }`}>
          {isSuperAdmin 
            ? '🔒 Day is locked for staff • Super Admin edit access enabled' 
            : 'Day is locked. All records are view-only.'}
        </div>
      )}

      {/* 1. KHUCHRA (Morning Change Taken From Reserve) */}
      <div className="bg-white rounded-xl p-3 border border-zinc-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-orange-500" />
              <span>Khuchra</span>
            </span>
            <span className="text-[10px] text-zinc-500 block">
              Cash taken from reserve for cart opening
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-zinc-400">৳</span>
            <input
              type="number"
              min="0"
              disabled={!isEditable}
              value={khuchraInput}
              onChange={(e) => setKhuchraInput(e.target.value)}
              onBlur={handleKhuchraBlur}
              placeholder="0"
              className="w-20 h-7 rounded-lg border border-zinc-300 bg-zinc-50 text-center font-bold text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* 2. DAILY PAYOUTS (STAFF SHIFT PAY & OWNER WITHDRAWALS) */}
      <div className="bg-white rounded-xl p-3 border border-zinc-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-zinc-900 block">
              Daily Payouts
            </span>
            <span className="text-[10px] text-zinc-500">
              Staff shift wages & owner profit divides
            </span>
          </div>
          <span className="text-sm font-black text-red-600">
            -৳{session.totalPayouts.toLocaleString()}
          </span>
        </div>

        {/* Add Payout Form */}
        {isEditable && (
          <form onSubmit={handleAddPayoutSubmit} className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-200 space-y-2 text-xs">
            {/* Recipient Dropdown (Polished) */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">
                Recipient (Person)
              </label>
              <div className="relative">
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full h-8 rounded-lg bg-white border border-zinc-300 hover:border-zinc-400 px-2.5 pr-8 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 appearance-none shadow-2xs cursor-pointer transition"
                >
                  {availableRecipients.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {recipient === 'Other Person' && (
              <div>
                <input
                  type="text"
                  required
                  placeholder="Enter person's name..."
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                  className="w-full h-7 rounded-lg bg-white border border-zinc-300 px-2 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            )}

            {/* Quick amounts */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-zinc-500">Quick:</span>
              {[200, 300, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPayoutAmount(amt.toString())}
                  className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-700 font-bold text-[10px] hover:bg-zinc-100"
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">Amount (৳)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="500"
                  className="w-full h-8 rounded-lg bg-white border border-zinc-300 px-2 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">Note (Optional)</label>
                <input
                  type="text"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. Daily shift pay..."
                  className="w-full h-8 rounded-lg bg-white border border-zinc-300 px-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5 rounded-lg text-xs active:scale-98 transition shadow-xs"
            >
              + Record Payout
            </button>
          </form>
        )}

        {/* Payouts list with Delete Confirmation */}
        <div className="space-y-1 pt-1">
          {payouts.length === 0 ? (
            <div className="text-center py-2 text-xs text-zinc-400">
              No payouts recorded today yet.
            </div>
          ) : (
            payouts.map((p) => {
              const isConfirming = confirmDeletePayoutId === p.id;

              return (
                <div key={p.id} className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-900 block">{p.recipientName}</span>
                    <span className="text-[10px] text-zinc-500">{p.notes || 'Daily Payout'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600 text-xs">-৳{p.amount}</span>

                    {isEditable && (
                      <>
                        {isConfirming ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-0.5 rounded">
                            <span className="text-[9px] text-red-700 font-bold px-0.5">Sure?</span>
                            <button
                              onClick={() => {
                                onDeletePayout(p.id);
                                setConfirmDeletePayoutId(null);
                              }}
                              className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeletePayoutId(null)}
                              className="bg-zinc-200 text-zinc-700 px-1 py-0.5 rounded text-[9px]"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmDeletePayoutId(p.id)} 
                            className="text-zinc-400 hover:text-red-600 p-1 rounded transition"
                            title="Delete Payout"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. CLOSING DRAWER CASH & RECONCILIATION */}
      <div className="bg-white rounded-xl p-3 border border-zinc-200 shadow-xs space-y-2.5">
        <span className="text-xs font-bold text-zinc-900 block">
          Closing Drawer Cash & Reconciliation
        </span>

        {/* Step-by-step arithmetic */}
        <div className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-zinc-600">
            <span>+ Khuchra Cash (Morning change)</span>
            <span className="font-semibold text-zinc-900">৳{khuchraVal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-emerald-700">
            <span>+ Net Food Sales</span>
            <span className="font-bold">+৳{session.netEstimatedRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>− Bazaar Expenses</span>
            <span className="font-bold">−৳{session.totalExpenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>− Payouts (Taken by staff/owner)</span>
            <span className="font-bold">−৳{session.totalPayouts.toLocaleString()}</span>
          </div>
          <div className="pt-1.5 border-t border-zinc-200 flex justify-between items-baseline font-bold text-zinc-900">
            <span>= Expected Closing Drawer Cash:</span>
            <span className="text-base font-extrabold text-orange-600">৳{expectedClosingCash.toLocaleString()}</span>
          </div>
        </div>

        {/* Warning if expenses exceeded cash in drawer */}
        {isNegativeExpected && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-2.5 text-xs text-red-900 flex items-start gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">⚠️ সতর্কতা: খরচ মোট ড্রয়ার ক্যাশ অতিক্রম করেছে!</span>
              <span className="text-[11px] text-red-700 block mt-0.5">
                বাজার খরচ ও পেআউট (৳{(session.totalExpenses + session.totalPayouts).toLocaleString()}) মোট ড্রয়ার সংগ্রহ (৳{(khuchraVal + session.netEstimatedRevenue).toLocaleString()}) থেকে ৳{Math.abs(rawExpectedClosingCash).toLocaleString()} বেশি হয়েছে। ড্রয়ার প্রত্যাশিত ক্যাশ ৳০ তে সীমাবদ্ধ রাখা হয়েছে।
              </span>
            </div>
          </div>
        )}

        {/* Closing Drawer Cash Box / Tap to Count */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-800">
              Closing Drawer Cash (Counted Tonight):
            </label>
            {(hasSavedDrawer || justSaved) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Saved</span>
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!isEditable}
            onClick={handleOpenDrawerModal}
            className={`w-full group rounded-xl p-3 border text-left transition relative flex items-center justify-between ${
              isEditable
                ? 'bg-zinc-50 hover:bg-orange-50/30 border-zinc-300 hover:border-orange-400 cursor-pointer shadow-2xs active:scale-[0.99]'
                : 'bg-zinc-100/70 border-zinc-200 cursor-not-allowed opacity-90'
            } ${justSaved ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                justSaved 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-white border border-zinc-200 text-zinc-700 group-hover:text-orange-600 group-hover:border-orange-300'
              }`}>
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-zinc-900 tracking-tight flex items-baseline gap-0.5">
                <span className="text-xs font-bold text-zinc-400">৳</span>
                <span>{(session.actualCashCounted ?? 0).toLocaleString()}</span>
              </div>
            </div>

            {isEditable && (
              <div className="flex items-center gap-1 text-zinc-500 group-hover:text-orange-600 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 group-hover:border-orange-300 shadow-2xs transition">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Enter</span>
              </div>
            )}
          </button>
        </div>

        {/* Discrepancy Alert Callout (Shortage / Surplus Warning Kept) */}
        <div className={`rounded-lg p-2.5 flex items-center justify-between text-xs font-semibold border ${
          isMatch 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : isShortage 
            ? 'bg-red-50 border-red-200 text-red-900' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            {isMatch ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className={`w-4 h-4 shrink-0 ${isShortage ? 'text-red-600' : 'text-amber-600'}`} />
            )}
            <div>
              <span className="block font-bold">
                {isMatch ? 'Drawer Matches Perfectly!' : isShortage ? 'Cash Shortage Warning!' : 'Cash Surplus Detected!'}
              </span>
              <span className="block text-[10px] font-normal text-zinc-600">
                {isMatch 
                  ? 'All cash & sales accounted for' 
                  : `Diff: ${currentDiff > 0 ? '+' : ''}৳${currentDiff.toLocaleString()}`}
              </span>
            </div>
          </div>
          <span className="text-sm font-black">
            {currentDiff > 0 ? '+' : ''}৳${currentDiff.toLocaleString()}
          </span>
        </div>

        {/* Reserve Settlement Summary */}
        {(() => {
          const isDrawerSaved = (session.transferredToReserve || 0) > 0 || session.isLocked || justSaved;
          const safeCash = Math.max(0, session.openingSavedCash - khuchraVal);

          return (
            <div className="bg-orange-50/60 border border-orange-200 rounded-lg p-2.5 text-[11px] space-y-1.5">
              <span className="font-bold text-orange-950 block text-xs">
                End of Day Reserve Settlement
              </span>
              <div className="flex justify-between text-zinc-600">
                <span>Safe Cash in Reserve (Remaining):</span>
                <span className="font-bold text-zinc-800">৳{safeCash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Drawer Cash Deposited Tonight:</span>
                <span className={`font-bold ${isDrawerSaved ? 'text-emerald-700' : 'text-zinc-500'}`}>
                  {isDrawerSaved 
                    ? `+৳${(session.actualCashCounted ?? 0).toLocaleString()}` 
                    : session.actualCashCounted > 0 
                    ? `+৳${session.actualCashCounted.toLocaleString()}` 
                    : 'Pending Drawer Count'}
                </span>
              </div>
              <div className="flex justify-between border-t border-orange-200 pt-1.5 font-bold text-orange-900">
                <span>Total Cash Reserve Now:</span>
                <span className="font-black text-sm text-orange-600">
                  ৳{(isDrawerSaved ? session.closingSavedCash : (safeCash + (session.actualCashCounted || 0))).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })()}

      </div>

      {/* 4. FINALIZE & LOCK TODAY */}
      <div className="bg-white rounded-xl p-3 border border-zinc-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-xs text-zinc-900 block">
              {session.isLocked ? 'Shift is Locked & Closed' : 'Close & Lock Shift'}
            </span>
            <span className="text-[10px] text-zinc-500 block">
              {session.isLocked ? 'Shift verified and sealed' : 'Lock shift to prevent tampering'}
            </span>
          </div>

          <button
            onClick={() => {
              if (session.isLocked) {
                if (isSuperAdmin) onToggleLock();
              } else {
                setIsLockModalOpen(true);
              }
            }}
            disabled={!isSuperAdmin && session.isLocked}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
              session.isLocked
                ? 'bg-zinc-100 text-zinc-700 border border-zinc-300 hover:bg-zinc-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
            }`}
          >
            {session.isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-zinc-600" />
                <span>{isSuperAdmin ? 'Unlock Day' : 'Locked'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>Lock Shift</span>
              </>
            )}
          </button>
        </div>

        {/* Download Cash Slip (PNG) */}
        <button
          type="button"
          onClick={handleDownloadSlip}
          disabled={isDownloading}
          className="w-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 font-bold py-2 rounded-xl text-xs transition active:scale-98 shadow-xs flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-orange-600" />
          <span>{isDownloading ? 'Generating Cash Slip...' : 'Download Cash Slip (PNG)'}</span>
        </button>
      </div>

      {/* Lock Confirmation Modal with Summary */}
      <LockConfirmationModal
        isOpen={isLockModalOpen}
        session={session}
        onConfirm={onToggleLock}
        onClose={() => setIsLockModalOpen(false)}
      />

      {/* Drawer Cash Input Modal */}
      {isDrawerModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsDrawerModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl p-5 w-full max-w-xs sm:max-w-sm border border-zinc-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-zinc-900">Closing Drawer Cash</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDrawerModal} className="space-y-4">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400 select-none">
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  autoFocus
                  value={drawerModalInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^0[0-9]+/.test(val)) {
                      setDrawerModalInput(val.replace(/^0+/, ''));
                    } else {
                      setDrawerModalInput(val);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full h-13 pl-9 pr-3 rounded-xl bg-zinc-50 border-2 border-zinc-300 focus:border-orange-500 focus:bg-white text-center font-black text-2xl text-zinc-900 focus:outline-none transition shadow-inner"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>OK</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
