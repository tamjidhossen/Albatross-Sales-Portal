import React, { useState } from 'react';
import { SalesRecord, Role } from '../../types';
import { MENU_ITEMS } from '../../data/menuData';
import { Plus, Edit2, Trash2, History, AlertCircle, Check, Search, Calendar, DollarSign } from 'lucide-react';

interface SalesManagementProps {
  sales: SalesRecord[];
  onAddSale: (newSale: Omit<SalesRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSale: (id: string, updatedFields: Partial<SalesRecord>, reason: string) => void;
  onDeleteSale: (id: string, reason: string) => void;
  onViewHistory: (recordId: string, itemName: string) => void;
  userRole: Role;
  currentDate: string;
}

export const SalesManagement: React.FC<SalesManagementProps> = ({
  sales,
  onAddSale,
  onUpdateSale,
  onDeleteSale,
  onViewHistory,
  userRole,
  currentDate,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SalesRecord | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editReason, setEditReason] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // New Sale Form State
  const [selectedMenuItemId, setSelectedMenuItemId] = useState(MENU_ITEMS[0].id);
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad'>('Cash');
  const [newNotes, setNewNotes] = useState('');
  const [customUnitPrice, setCustomUnitPrice] = useState<number>(MENU_ITEMS[0].price);

  const handleMenuItemChange = (itemId: string) => {
    setSelectedMenuItemId(itemId);
    const item = MENU_ITEMS.find((m) => m.id === itemId);
    if (item) {
      setCustomUnitPrice(item.price);
    }
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuantity <= 0) {
      alert('Error: Quantity sold must be greater than zero! No negative or zero values permitted.');
      return;
    }
    if (customUnitPrice <= 0) {
      alert('Error: Unit price must be positive.');
      return;
    }

    const item = MENU_ITEMS.find((m) => m.id === selectedMenuItemId);
    const itemName = item ? item.name : 'Custom Item';
    const totalAmount = newQuantity * customUnitPrice;

    onAddSale({
      date: currentDate,
      itemId: selectedMenuItemId,
      itemName,
      category: item ? item.category : 'General',
      unitPrice: customUnitPrice,
      quantitySold: newQuantity,
      totalAmount,
      paymentMethod: newPaymentMethod,
      notes: newNotes.trim() || undefined,
      createdBy: userRole === 'super_admin' ? 'Super Admin' : 'Admin Staff',
    });

    setIsAddModalOpen(false);
    setNewQuantity(1);
    setNewNotes('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale) return;
    if (editQuantity <= 0) {
      alert('Error: Quantity must be positive.');
      return;
    }
    if (!editReason.trim()) {
      alert('Mandatory Audit Requirement: Please state a reason for modifying this sales record.');
      return;
    }

    const newTotal = editQuantity * editingSale.unitPrice;
    onUpdateSale(
      editingSale.id,
      {
        quantitySold: editQuantity,
        totalAmount: newTotal,
      },
      editReason.trim()
    );

    setEditingSale(null);
    setEditReason('');
  };

  const handleDelete = (sale: SalesRecord) => {
    const reason = window.prompt(
      `Confirm Deletion: Please enter the audit reason for deleting sale #${sale.id} (${sale.itemName}):`
    );
    if (reason && reason.trim()) {
      onDeleteSale(sale.id, reason.trim());
    }
  };

  const filteredSales = sales.filter((s) => 
    s.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.date.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">Daily Sales Entry</span>
          <h2 className="text-xl sm:text-2xl font-black text-white">সেলস ম্যানেজমেন্ট ও পরিবর্তন হিস্ট্রি</h2>
          <p className="text-xs text-zinc-400 mt-0.5">সব বিক্রয় এন্ট্রি সংরক্ষিত থাকে এবং প্রতিটি এডিট অডিট ট্রেইলে যুক্ত হয়।</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Sale Entry (+ নতুন বিক্রয়)</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search sales by item name or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
          />
        </div>
        <span className="text-xs text-zinc-400 font-semibold">
          Showing {filteredSales.length} records
        </span>
      </div>

      {/* Sales Table / Cards */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Food Item</th>
                <th className="py-3.5 px-4 text-right">Unit Price</th>
                <th className="py-3.5 px-4 text-center">Qty Sold</th>
                <th className="py-3.5 px-4 text-right">Total (৳)</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-center">Audit History</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                    {sale.date}
                  </td>
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    <div>{sale.itemName}</div>
                    {sale.notes && (
                      <span className="text-[10px] text-zinc-500 font-normal">{sale.notes}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    ৳{sale.unitPrice}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-white">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                      {sale.quantitySold}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-black text-white text-sm">
                    ৳{sale.totalAmount}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      sale.paymentMethod === 'Cash'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  
                  {/* Clickable History Button */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => onViewHistory(sale.id, sale.itemName)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-brand text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                      title="View change history for this sale"
                    >
                      <History className="w-3.5 h-3.5 text-brand group-hover:text-white" />
                      <span>History</span>
                    </button>
                  </td>

                  {/* Actions: Edit & Delete */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingSale(sale);
                          setEditQuantity(sale.quantitySold);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        title="Edit quantity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(sale)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Delete sale record"
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

      {/* Modal: Add New Sale */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#141722] border border-brand/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand" />
              <span>Record New Sale (বিক্রয় যুক্ত করুন)</span>
            </h3>

            <form onSubmit={handleCreateSale} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Select Menu Item:</label>
                <select
                  value={selectedMenuItemId}
                  onChange={(e) => handleMenuItemChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand"
                >
                  {MENU_ITEMS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} — ৳{item.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Quantity Sold (Pieces):</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Unit Price (৳):</label>
                  <input
                    type="number"
                    min="1"
                    value={customUnitPrice}
                    onChange={(e) => setCustomUnitPrice(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400">Total Calculation:</span>
                <span className="text-base font-black text-white">৳{newQuantity * customUnitPrice}</span>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Payment Method:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cash', 'bKash', 'Nagad'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setNewPaymentMethod(method)}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        newPaymentMethod === method
                          ? 'bg-brand/20 border-brand text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Notes (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. bKash TrxID, group order..."
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
                  Save Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Sale with Mandatory Audit Reason */}
      {editingSale && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#141722] border border-brand/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-brand">
              <Edit2 className="w-5 h-5" />
              <h3 className="text-base sm:text-lg font-bold text-white">Modify Sale #{editingSale.id}</h3>
            </div>
            
            <p className="text-xs text-zinc-400">
              Editing: <strong className="text-white">{editingSale.itemName}</strong> on {editingSale.date}
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Quantity Sold:</label>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">Current: {editingSale.quantitySold}</span>
                  <input
                    type="number"
                    min="1"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="w-32 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold focus:outline-none focus:border-brand"
                  />
                  <span className="font-bold text-white">→ ৳{editQuantity * editingSale.unitPrice}</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audit Reason for Change (বাধ্যতামূলক কারণ):</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cash drawer recount showed 51 burgers sold instead of 50..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSale(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-brand hover:bg-orange-600 text-white font-bold shadow-md shadow-brand/20"
                >
                  Commit & Log Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

