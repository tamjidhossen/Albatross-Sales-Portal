import React, { useState } from 'react';
import { DailySession, DailyPayout, DailyInventoryItem, DailyExpense } from '../../types';
import { FREQUENT_PAYOUT_RECIPIENTS } from '../../data/mockDailyData';
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
  ChevronDown
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
}) => {
  // Payout input states
  const [recipient, setRecipient] = useState(FREQUENT_PAYOUT_RECIPIENTS[0]);
  const [customRecipient, setCustomRecipient] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('500');
  const [payoutType, setPayoutType] = useState<DailyPayout['payoutType']>('Staff Daily Pay');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [confirmDeletePayoutId, setConfirmDeletePayoutId] = useState<string | null>(null);

  // Khuchra cash state
  const khuchraVal = session.khuchraTakenFromReserve || session.openingCash || 0;
  const [khuchraInput, setKhuchraInput] = useState(khuchraVal.toString());

  // Closing drawer cash state
  const [closingDrawerInput, setClosingDrawerInput] = useState(session.actualCashCounted.toString());
  const [isSavedDrawer, setIsSavedDrawer] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  const isMatch = session.cashDifference === 0;
  const isShortage = session.cashDifference < 0;
  const isEditable = !session.isLocked || isSuperAdmin;

  const handleKhuchraBlur = () => {
    const val = parseFloat(khuchraInput) || 0;
    onUpdateKhuchra(val);
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
      payoutType: finalRecipient.includes('Owner') ? 'Owner Withdrawal' : payoutType,
      notes: payoutNotes || undefined,
    });

    setPayoutNotes('');
    if (recipient === 'Other Person') setCustomRecipient('');
  };

  const handleSaveDrawerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(closingDrawerInput) || 0;
    onSaveDrawerCash(val);
    setIsSavedDrawer(true);
    setTimeout(() => setIsSavedDrawer(false), 2000);
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
                  {FREQUENT_PAYOUT_RECIPIENTS.map((name) => (
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
                  placeholder="e.g. Shift pay"
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
                    <span className="text-[10px] text-zinc-500">{p.payoutType} {p.notes && `• ${p.notes}`}</span>
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
            <span className="text-base font-extrabold text-orange-600">৳{session.expectedClosingCash.toLocaleString()}</span>
          </div>
        </div>

        {/* Closing Drawer Cash Input & Save Button */}
        <form onSubmit={handleSaveDrawerSubmit} className="bg-zinc-50 rounded-lg p-2.5 border border-zinc-200 space-y-2">
          <label className="block text-xs font-bold text-zinc-800">
            Closing Drawer Cash (Counted Tonight):
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">৳</span>
            <input
              type="number"
              min="0"
              disabled={!isEditable}
              value={closingDrawerInput}
              onChange={(e) => setClosingDrawerInput(e.target.value)}
              placeholder="e.g. 7950"
              className="w-full h-9 rounded-lg bg-white border border-zinc-300 text-center font-extrabold text-base text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {isEditable && (
            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-xs transition active:scale-98 shadow-xs flex items-center justify-center gap-1.5"
            >
              {isSavedDrawer ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Drawer Cash Saved to Reserve!</span>
                </>
              ) : (
                <span>Save Drawer Cash (Adds to Reserve)</span>
              )}
            </button>
          )}
        </form>

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
                  : `Diff: ${session.cashDifference > 0 ? '+' : ''}৳${session.cashDifference.toLocaleString()}`}
              </span>
            </div>
          </div>
          <span className="text-sm font-black">
            {session.cashDifference > 0 ? '+' : ''}৳{session.cashDifference.toLocaleString()}
          </span>
        </div>

        {/* End of day breakdown */}
        <div className="bg-orange-50/60 border border-orange-200 rounded-lg p-2 text-[11px] space-y-1">
          <span className="font-bold text-orange-950 block">End of Day Settlement Summary</span>
          <div className="flex justify-between text-zinc-600">
            <span>Bazaar Purchases:</span>
            <span className="font-bold text-zinc-800">৳{session.totalExpenses}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Staff / Owner Payouts:</span>
            <span className="font-bold text-zinc-800">৳{session.totalPayouts}</span>
          </div>
          <div className="flex justify-between text-zinc-600">
            <span>Khuchra Cash Returned:</span>
            <span className="font-bold text-zinc-800">৳{khuchraVal}</span>
          </div>
          <div className="flex justify-between border-t border-orange-200 pt-1 font-bold text-orange-900">
            <span>Total Cash Reserve Now:</span>
            <span className="font-black text-xs text-orange-600">৳{session.closingSavedCash.toLocaleString()}</span>
          </div>
        </div>

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

        {/* Download Summary Slip (PNG) prominently displayed after locking */}
        {session.isLocked && (
          <button
            onClick={handleDownloadSlip}
            disabled={isDownloading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download Summary Slip (PNG)</span>
          </button>
        )}
      </div>

      {/* Lock Confirmation Modal with Summary */}
      <LockConfirmationModal
        isOpen={isLockModalOpen}
        session={session}
        onConfirm={onToggleLock}
        onClose={() => setIsLockModalOpen(false)}
      />

    </div>
  );
};
