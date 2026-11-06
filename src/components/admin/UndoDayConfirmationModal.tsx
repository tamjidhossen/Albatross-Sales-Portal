import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface UndoDayConfirmationModalProps {
  isOpen: boolean;
  sessionDate: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export const UndoDayConfirmationModal: React.FC<UndoDayConfirmationModalProps> = ({
  isOpen,
  sessionDate,
  onConfirm,
  onClose,
}) => {
  const [targetCode, setTargetCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setTargetCode(code);
      setInputCode('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatched = inputCode.trim() === targetCode;

  const handleConfirm = async () => {
    if (!isMatched || isDeleting) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-red-200 shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-zinc-900 leading-tight">
                Undo Day & Reset Shift
              </h3>
              <p className="text-[11px] text-red-600 font-semibold">
                Super Admin Danger Zone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="bg-red-50/80 border border-red-200 rounded-xl p-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-zinc-600 text-[11px]">
            <span>Date to delete:</span>
            <span className="font-bold text-zinc-900">{sessionDate}</span>
          </div>
          <p className="text-[11px] text-red-800 leading-relaxed">
            This will <strong>permanently delete</strong> all session records, inventory counts, bazaar expenses, and staff payouts for this day.
          </p>
          <p className="text-[10px] text-zinc-500">
            The cart will return to the unstarted state (Cart Closed) as if this day never began.
          </p>
        </div>

        {/* 4-Digit Challenge Box */}
        <div className="space-y-2 text-center">
          <label className="block text-[11px] font-bold text-zinc-700">
            Type this 4-digit code to confirm:
          </label>
          <div className="inline-block bg-zinc-100 border border-zinc-300 rounded-xl px-4 py-1.5">
            <span className="font-mono text-2xl font-black tracking-widest text-red-600 select-all">
              {targetCode}
            </span>
          </div>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
            placeholder="----"
            autoFocus
            disabled={isDeleting}
            className="w-full text-center font-mono font-black text-xl tracking-[0.4em] border border-zinc-300 rounded-xl h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none transition"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 transition active:scale-98"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isMatched || isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Undoing Day...' : 'Confirm & Delete'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

