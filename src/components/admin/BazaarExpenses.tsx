import React, { useState } from 'react';
import { BazaarExpense, DynamicCategory, Role } from '../../types';
import { Plus, Edit2, Trash2, History, ShoppingBag, Store, Tag, AlertCircle } from 'lucide-react';

interface BazaarExpensesProps {
  bazaar: BazaarExpense[];
  dynamicCategories: DynamicCategory[];
  onAddBazaarExpense: (expense: Omit<BazaarExpense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateBazaarExpense: (id: string, updatedFields: Partial<BazaarExpense>, reason: string) => void;
  onDeleteBazaarExpense: (id: string, reason: string) => void;
  onOpenCategoryManager: () => void;
  onViewHistory: (recordId: string, itemName: string) => void;
  userRole: Role;
  currentDate: string;
}

export const BazaarExpenses: React.FC<BazaarExpensesProps> = ({
  bazaar,
  dynamicCategories,
  onAddBazaarExpense,
  onUpdateBazaarExpense,
  onDeleteBazaarExpense,
  onOpenCategoryManager,
  onViewHistory,
  userRole,
  currentDate,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BazaarExpense | null>(null);
  const [editCost, setEditCost] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('');

  // Add Expense form
  const [newCategory, setNewCategory] = useState<string>(
    dynamicCategories.find((c) => c.type === 'bazaar')?.name || 'Meat & Poultry'
  );
  const [newItemName, setNewItemName] = useState('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newUnit, setNewUnit] = useState('kg');
  const [newTotalCost, setNewTotalCost] = useState<number>(0);
  const [newVendorShop, setNewVendorShop] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const bazaarCategories = dynamicCategories.filter((c) => c.type === 'bazaar');

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    if (newTotalCost <= 0) {
      alert('Error: Total expense amount must be positive.');
      return;
    }

    onAddBazaarExpense({
      date: currentDate,
      category: newCategory,
      itemName: newItemName.trim(),
      quantity: newQuantity,
      unit: newUnit,
      totalCost: newTotalCost,
      purchasedBy: userRole === 'super_admin' ? 'Super Admin' : 'Admin Staff',
      vendorShop: newVendorShop.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setNewItemName('');
    setNewTotalCost(0);
    setNewVendorShop('');
    setNewNotes('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    if (editCost <= 0) {
      alert('Validation Error: Expense must be positive.');
      return;
    }
    if (!editReason.trim()) {
      alert('Audit Trail Requirement: Please specify the reason for modifying this expense receipt.');
      return;
    }

    onUpdateBazaarExpense(
      editingExpense.id,
      { totalCost: editCost },
      editReason.trim()
    );

    setEditingExpense(null);
    setEditReason('');
  };

  const handleDelete = (expense: BazaarExpense) => {
    const reason = window.prompt(
      `Confirm Deletion: Please enter the audit reason for removing expense receipt #${expense.id} (${expense.itemName}):`
    );
    if (reason && reason.trim()) {
      onDeleteBazaarExpense(expense.id, reason.trim());
    }
  };

  const totalBazaarSpent = bazaar.reduce((acc, curr) => acc + curr.totalCost, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">Raw Materials & Daily Bazaar</span>
          <h2 className="text-xl sm:text-2xl font-black text-white">দৈনিক বাজার ও সাপ্লাই খরচ</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            চিকেন, বার্গার বান, সস, ডাস্টার কাপড়, টিস্যু পেপার ও গ্যাস সিলিন্ডার খরচের হিসাব।
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Category button */}
          <button
            onClick={onOpenCategoryManager}
            className="px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700 flex items-center gap-1.5 transition-colors"
            title="Manage dynamic categories"
          >
            <Tag className="w-3.5 h-3.5 text-brand" />
            <span>Manage Categories</span>
          </button>

          {/* Add Expense Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-brand to-orange-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-brand/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Bazaar (+ বাজার এন্ট্রি)</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-zinc-400 block">Total Supplies Purchased Today:</span>
            <span className="text-white font-bold">{bazaar.length} receipts recorded</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-zinc-400 block text-[11px]">Total Outflow</span>
          <span className="text-xl font-black text-rose-400">৳{totalBazaarSpent}</span>
        </div>
      </div>

      {/* Bazaar Expenses Table */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Item Name / Supplies</th>
                <th className="py-3.5 px-4 text-center">Quantity</th>
                <th className="py-3.5 px-4 text-right">Total Cost (৳)</th>
                <th className="py-3.5 px-4">Shop / Vendor</th>
                <th className="py-3.5 px-4 text-center">Audit History</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {bazaar.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-brand border border-zinc-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    <div>{item.itemName}</div>
                    {item.notes && (
                      <span className="text-[10px] text-zinc-500 font-normal">{item.notes}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-mono whitespace-nowrap">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-white text-sm whitespace-nowrap">
                    ৳{item.totalCost}
                  </td>
                  <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                    {item.vendorShop || 'Local Bazaar'}
                  </td>

                  {/* History Button */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => onViewHistory(item.id, item.itemName)}
                      className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-brand text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                      title="View change history for this expense"
                    >
                      <History className="w-3.5 h-3.5 text-brand group-hover:text-white" />
                      <span>Log</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingExpense(item);
                          setEditCost(item.totalCost);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        title="Edit expense cost"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Delete expense voucher"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Bazaar Expense */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#141722] border border-brand/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand" />
              <span>Record Daily Bazaar Purchase</span>
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-300 font-semibold">Expense Category:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      onOpenCategoryManager();
                    }}
                    className="text-[10px] text-brand hover:underline font-bold"
                  >
                    + Add New Category
                  </button>
                </div>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand"
                >
                  {bazaarCategories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Item / Supply Description:</label>
                <input
                  type="text"
                  placeholder="e.g. Broiler Chicken 8kg, 3 Duster cloths, 2 Tissue boxes..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(parseFloat(e.target.value) || 1)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Unit:</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand"
                  >
                    <option value="kg">kg (কেজি)</option>
                    <option value="packet">packet (প্যাকেট)</option>
                    <option value="pcs">pcs (পিস)</option>
                    <option value="box">box (বক্স)</option>
                    <option value="jar">jar / can</option>
                    <option value="set">set</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Total Cost Paid (৳):</label>
                <input
                  type="number"
                  min="1"
                  value={newTotalCost}
                  onChange={(e) => setNewTotalCost(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-black text-sm focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Shop / Vendor Name (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Bakery, Sadar Kacha Bazaar..."
                  value={newVendorShop}
                  onChange={(e) => setNewVendorShop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Receipt Notes (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Morning fresh cut, voucher #41..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-brand hover:bg-orange-600 text-white font-bold shadow-md shadow-brand/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Expense with Audit Reason */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#141722] border border-brand/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-brand" />
              <span>Modify Expense #{editingExpense.id}</span>
            </h3>

            <p className="text-xs text-zinc-400">
              Item: <strong className="text-white">{editingExpense.itemName}</strong> ({editingExpense.quantity} {editingExpense.unit})
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Total Cost Paid (৳):</label>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 line-through">৳{editingExpense.totalCost}</span>
                  <input
                    type="number"
                    min="1"
                    value={editCost}
                    onChange={(e) => setEditCost(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="w-36 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audit Reason for Adjustment (বাধ্যতামূলক কারণ):</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Receipt recalculation showed total was 160 Tk instead of 180 Tk..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-brand hover:bg-orange-600 text-white font-bold shadow-md shadow-brand/20"
                >
                  Save & Log History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

