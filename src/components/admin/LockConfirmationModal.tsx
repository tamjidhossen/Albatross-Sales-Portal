import React from 'react';
import { DailySession } from '../../types';
import { ShieldCheck, AlertTriangle, X } from 'lucide-react';

interface LockConfirmationModalProps {
  isOpen: boolean;
  session: DailySession;
  onConfirm: () => void;
  onClose: () => void;
}

export const LockConfirmationModal: React.FC<LockConfirmationModalProps> = ({
  isOpen,
  session,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const khuchra = session.khuchraTakenFromReserve || session.openingCash || 0;
  const expectedClosing = khuchra + session.netEstimatedRevenue - session.totalExpenses - session.totalPayouts;
  const currentDiff = session.actualCashCounted - expectedClosing;
  const isMatch = currentDiff === 0;
  const isShortage = currentDiff < 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xl space-y-3 font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 leading-tight">
                Lock & Close Shift?
              </h3>
              <p className="text-[11px] text-zinc-500">
                Are you sure? Once locked, all counts become view-only.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Small Summary Card */}
        <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-zinc-500 text-[11px]">
            <span>Session Date:</span>
            <span className="font-bold text-zinc-800">{session.sessionDate}</span>
          </div>

          <div className="flex justify-between text-emerald-700">
            <span>Net Food Sales:</span>
            <span className="font-bold">+৳{session.netEstimatedRevenue.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-zinc-600">
            <span>Khuchra Cash:</span>
            <span className="font-semibold text-zinc-800">৳{khuchra.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-red-600">
            <span>Bazaar Expenses:</span>
            <span className="font-bold">−৳{session.totalExpenses.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-red-600">
            <span>Staff Payouts:</span>
            <span className="font-bold">−৳{session.totalPayouts.toLocaleString()}</span>
          </div>

          <div className="border-t border-zinc-200 pt-1.5 flex justify-between font-bold text-zinc-900">
            <span>Closing Drawer Cash:</span>
            <span className="font-extrabold text-orange-600">
              ৳{session.actualCashCounted.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-zinc-500">Cash Discrepancy:</span>
            <span className={`font-bold ${isMatch ? 'text-emerald-600' : isShortage ? 'text-red-600' : 'text-amber-600'}`}>
              {isMatch 
                ? 'Balanced (৳0)' 
                : `${isShortage ? 'Shortage: −৳' : 'Surplus: +৳'}${Math.abs(currentDiff).toLocaleString()}`}
            </span>
          </div>

          <div className="flex justify-between border-t border-zinc-200 pt-1 text-[11px] font-bold text-zinc-800">
            <span>New Cash Reserve Total:</span>
            <span className="text-orange-600 font-extrabold">৳{session.closingSavedCash.toLocaleString()}</span>
          </div>
        </div>

        {/* Shortage notice if applicable */}
        {!isMatch && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-1.5 text-[11px] text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Note: Cash difference is {session.cashDifference > 0 ? '+' : ''}৳{session.cashDifference}. This will be logged in the audit trail.</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs active:scale-98 transition flex items-center justify-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Yes, Lock Shift</span>
          </button>
        </div>

      </div>
    </div>
  );
};

