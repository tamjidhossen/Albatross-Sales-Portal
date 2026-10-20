import React, { useState, useMemo } from 'react';
import { DailyExpense, ExpenseCategory } from '../../types';
import { EXPENSE_CATEGORIES } from '../../data/mockDailyData';
import { Receipt, ArrowLeft, Plus, Trash2, X, ChevronDown } from 'lucide-react';

interface ExpensesSectionProps {
  expenses: DailyExpense[];
  onAddExpense: (expense: Omit<DailyExpense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
  onBack: () => void;
  isLocked: boolean;
  staffNames?: string[];
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
  onBack,
  isLocked,
  staffNames = [],
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('Chicken');
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  
  const availablePayers = useMemo(() => {
    const list = ['Cart Drawer Cash'];
    if (staffNames && staffNames.length > 0) {
      staffNames.forEach((n) => list.push(n));
    } else {
      list.push('Tamjid');
    }
    list.push('Other Person');
    return list;
  }, [staffNames]);

  const [paidByName, setPaidByName] = useState(availablePayers[0] || 'Cart Drawer Cash');
  const [customPayer, setCustomPayer] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const finalItemName = itemName.trim() || category;
    const finalPayer = paidByName === 'Other Person' ? (customPayer.trim() || 'Other Person') : paidByName;

    onAddExpense({
      sessionDate: expenses[0]?.sessionDate || new Date().toISOString().slice(0, 10),
      category,
      itemName: finalItemName,
      amount: parsedAmount,
      paidByName: finalPayer,
      notes: notes || undefined,
    });

    setItemName('');
    setAmount('');
    setCustomPayer('');
    setNotes('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-2.5">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
          <Receipt className="w-4 h-4 text-orange-500" />
          <span>Expenses</span>
        </span>

        {!isLocked && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 transition shadow-2xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* Aggregate Banner (Compact) */}
      <div className="bg-white rounded-xl p-2.5 border border-zinc-200 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] text-zinc-500 font-medium block">
            Total Spent Today
          </span>
          <span className="text-lg font-black text-red-600 block mt-0.5">
            ৳{totalSpent.toLocaleString()}
          </span>
        </div>

        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
          {expenses.length} entries
        </span>
      </div>

      {/* Add Expense Form (Clean & Sleek Dropdowns) */}
      {isAdding && !isLocked && (
        <form onSubmit={handleSubmit} className="bg-orange-50/70 border border-orange-200 rounded-xl p-3 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-950 flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-orange-600" />
              <span>Record Bazaar Expense</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {/* Category Dropdown (Polished) */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full h-8 rounded-lg bg-white border border-zinc-300 hover:border-zinc-400 px-2.5 pr-8 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 appearance-none shadow-2xs cursor-pointer transition"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Direct Item Name Input (Optional) */}
            <div>
              <label className="block text-[10px] font-semibold text-zinc-600 mb-1">
                Item Description (Optional)
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Optional (e.g. Broiler chicken, Soybean oil...)"
                className="w-full h-8 rounded-lg bg-white border border-zinc-300 hover:border-zinc-400 px-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 shadow-2xs transition"
              />
            </div>

            {/* Amount & Paid By */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-600 mb-1">
                  Amount (৳)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setAmount(e.target.value.replace(/^0+(?=\d)/, ''))}
                  placeholder="e.g. 450"
                  className="w-full h-8 rounded-lg bg-white border border-zinc-300 hover:border-zinc-400 px-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 shadow-2xs transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-600 mb-1">
                  Paid By
                </label>
                <div className="relative">
                  <select
                    value={paidByName}
                    onChange={(e) => setPaidByName(e.target.value)}
                    className="w-full h-8 rounded-lg bg-white border border-zinc-300 hover:border-zinc-400 px-2.5 pr-8 text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 appearance-none shadow-2xs cursor-pointer transition"
                  >
                    {availablePayers.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {paidByName === 'Other Person' && (
              <div>
                <label className="block text-[10px] font-semibold text-zinc-600 mb-0.5">
                  Enter Payer Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delivery Partner"
                  value={customPayer}
                  onChange={(e) => setCustomPayer(e.target.value)}
                  className="w-full h-8 rounded-lg bg-white border border-zinc-300 px-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 font-medium text-xs hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs active:scale-98 transition"
            >
              Save Expense
            </button>
          </div>
        </form>
      )}

      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[11px] text-amber-900 font-semibold text-center">
          Day is locked. Unlock to modify expenses.
        </div>
      )}

      {/* Expenses Ledger List (High Density with Delete Confirmation) */}
      <div className="space-y-1.5">
        {expenses.length === 0 ? (
          <div className="bg-white rounded-xl p-4 text-center border border-zinc-200 text-xs text-zinc-400">
            No expenses recorded today.
          </div>
        ) : (
          expenses.map((item) => {
            const isConfirming = confirmDeleteId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl p-2.5 border border-zinc-200 shadow-2xs flex items-center justify-between text-xs"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-zinc-400">{item.createdAt}</span>
                  </div>
                  <span className="font-bold text-zinc-900 block mt-0.5">{item.itemName}</span>
                  <span className="text-[10px] text-zinc-500">Paid by {item.paidByName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600 text-sm">-৳{item.amount}</span>

                  {!isLocked && (
                    <>
                      {isConfirming ? (
                        <div className="flex items-center gap-1 bg-red-50 border border-red-200 p-1 rounded-lg">
                          <span className="text-[10px] text-red-700 font-bold px-1">Sure?</span>
                          <button
                            onClick={() => {
                              onDeleteExpense(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.5 rounded text-[10px] font-bold"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-1 py-0.5 rounded text-[10px]"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="text-zinc-400 hover:text-red-600 p-1 rounded-md transition"
                          title="Delete expense"
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
  );
};
