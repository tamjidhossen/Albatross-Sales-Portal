import React from 'react';
import { Lock, AlertTriangle, ArrowLeft, CheckCircle2, X } from 'lucide-react';

interface PreviousDayLockAlertModalProps {
  isOpen: boolean;
  unlockedDate: string;
  onGoToDate: (date: string) => void;
  onLockNow: (date: string) => void;
  onDismiss: () => void;
}

export const PreviousDayLockAlertModal: React.FC<PreviousDayLockAlertModalProps> = ({
  isOpen,
  unlockedDate,
  onGoToDate,
  onLockNow,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900 leading-tight">
                আগের দিনের শিফট লক করা হয়নি!
              </h3>
              <p className="text-[11px] text-zinc-500 font-medium">
                তারিখ: <strong className="text-zinc-800">{unlockedDate}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-950 space-y-2">
          <p className="leading-relaxed">
            <strong className="text-amber-900">{unlockedDate}</strong> তারিখের শিফট এখনও খোলা রয়েছে। ক্যাশ ড্রয়ার ও মজুদ পণ্যের সঠিক হিসাব সংরক্ষণ এবং পরবর্তী দিনের ক্যাশ রিজার্ভের সুরক্ষার জন্য আগের দিনের শিফট লক করা প্রয়োজন।
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-amber-800 font-semibold bg-white/70 p-2 rounded-lg border border-amber-200">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>লক না করলে সমাপনী রিজার্ভ স্বয়ংক্রিয়ভাবে স্থানান্তরিত হবে না।</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => onLockNow(unlockedDate)}
            className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>এখনই আগের শিফট লক করুন</span>
          </button>

          <button
            onClick={() => onGoToDate(unlockedDate)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>আগের দিনের হিসাবে যান (যাচাই করতে)</span>
          </button>

          <button
            onClick={onDismiss}
            className="w-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 font-semibold py-1.5 rounded-xl text-xs transition"
          >
            পরে করব
          </button>
        </div>

      </div>
    </div>
  );
};

