import React, { useState } from 'react';
import { InventoryRecord, Role } from '../../types';
import { Plus, Edit3, History, Boxes, AlertTriangle, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface InventoryManagementProps {
  inventory: InventoryRecord[];
  onAddInventoryItem: (item: Omit<InventoryRecord, 'id' | 'updatedAt'>) => void;
  onUpdateInventoryStock: (id: string, updatedFields: Partial<InventoryRecord>, reason: string) => void;
  onViewHistory: (recordId: string, itemName: string) => void;
  onRollover: () => void;
  userRole: Role;
  currentDate: string;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  inventory,
  onAddInventoryItem,
  onUpdateInventoryStock,
  onViewHistory,
  onRollover,
  userRole,
  currentDate,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryRecord | null>(null);
  const [editAddedToday, setEditAddedToday] = useState<number>(0);
  const [editSoldQuantity, setEditSoldQuantity] = useState<number>(0);
  const [editReason, setEditReason] = useState<string>('');

  // Add Item state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Bakery');
  const [newItemUnit, setNewItemUnit] = useState('pcs');
  const [newOpeningStock, setNewOpeningStock] = useState<number>(0);
  const [newAddedToday, setNewAddedToday] = useState<number>(0);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    if (newOpeningStock < 0 || newAddedToday < 0) {
      alert('Error: Stock numbers cannot be negative.');
      return;
    }

    const totalStock = newOpeningStock + newAddedToday;
    const closingStock = totalStock; // Initially no items sold recorded

    onAddInventoryItem({
      date: currentDate,
      itemId: `item-${Date.now()}`,
      itemName: newItemName.trim(),
      category: newItemCategory,
      unit: newItemUnit,
      openingStock: newOpeningStock,
      addedToday: newAddedToday,
      totalStock,
      soldQuantity: 0,
      closingStock,
      status: closingStock <= 10 ? 'Low Stock' : 'In Stock',
      updatedBy: userRole === 'super_admin' ? 'Super Admin' : 'Admin',
    });

    setIsAddModalOpen(false);
    setNewItemName('');
    setNewOpeningStock(0);
    setNewAddedToday(0);
  };

  const handleSaveStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (editAddedToday < 0 || editSoldQuantity < 0) {
      alert('Validation Error: Quantities cannot be negative.');
      return;
    }

    const totalStock = editingItem.openingStock + editAddedToday;
    if (editSoldQuantity > totalStock) {
      alert(`Validation Error: Sold quantity (${editSoldQuantity}) exceeds total available stock (${totalStock})!`);
      return;
    }

    if (!editReason.trim()) {
      alert('Audit Trail Requirement: Please provide a reason for stock modification.');
      return;
    }

    const closingStock = totalStock - editSoldQuantity;
    const status = closingStock <= 5 ? 'Critical' : closingStock <= 15 ? 'Low Stock' : 'In Stock';

    onUpdateInventoryStock(
      editingItem.id,
      {
        addedToday: editAddedToday,
        totalStock,
        soldQuantity: editSoldQuantity,
        closingStock,
        status,
        updatedBy: userRole === 'super_admin' ? 'Super Admin' : 'Admin',
      },
      editReason.trim()
    );

    setEditingItem(null);
    setEditReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">Daily Inventory & Carryover</span>
          <h2 className="text-xl sm:text-2xl font-black text-white">ইনভেন্টরি ও অটোমেটিক রোলওভার</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            আজকের অবশিষ্ট ক্লোজিং স্টক স্বয়ংক্রিয়ভাবে আগামীকালের ওপেনিং স্টকে যুক্ত হয়।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-brand to-orange-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Item (+ আইটেম যুক্ত)</span>
          </button>
        </div>
      </div>

      {/* Logic Card Explainer */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand/10 via-zinc-900 to-zinc-900 border border-brand/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/20 text-brand flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="font-bold text-white block">দৈনিক অটোমেটিক রোলওভার সূত্র:</span>
            <span className="text-zinc-400">
              [গতকালের ক্লোজিং স্টক] + [আজকের নতুন প্রিপ/বাজার] − [বিক্রয়] = <strong>[আজকের ক্লোজিং স্টক ➔ আগামীকাল রোল]</strong>
            </span>
          </div>
        </div>

        <button
          onClick={onRollover}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-brand text-zinc-200 hover:text-white border border-zinc-700 font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap self-stretch md:self-auto justify-center"
        >
          <span>Simulate Next Day Rollover</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Item Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Opening Stock</th>
                <th className="py-3.5 px-4 text-center">Added Today</th>
                <th className="py-3.5 px-4 text-center">Total Avail.</th>
                <th className="py-3.5 px-4 text-center">Sold / Used</th>
                <th className="py-3.5 px-4 text-center">Closing Stock ➔ Next Day</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">History</th>
                <th className="py-3.5 px-4 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {item.itemName}
                  </td>
                  <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                    {item.category}
                  </td>
                  <td className="py-3 px-4 text-center font-mono whitespace-nowrap">
                    <span className="text-zinc-400">{item.openingStock}</span> {item.unit}
                  </td>
                  <td className="py-3 px-4 text-center font-mono whitespace-nowrap text-emerald-400">
                    +{item.addedToday} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-white whitespace-nowrap">
                    {item.totalStock} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-red-400 whitespace-nowrap">
                    -{item.soldQuantity} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-black text-amber-400 whitespace-nowrap bg-amber-500/5">
                    {item.closingStock} {item.unit}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.status === 'In Stock'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : item.status === 'Low Stock'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  {/* History Button */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => onViewHistory(item.id, item.itemName)}
                      className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-brand text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                      title="View stock change history"
                    >
                      <History className="w-3.5 h-3.5 text-brand group-hover:text-white" />
                      <span>Log</span>
                    </button>
                  </td>

                  {/* Adjust Button */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setEditAddedToday(item.addedToday);
                        setEditSoldQuantity(item.soldQuantity);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Adjust stock counts"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Inventory Item */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#141722] border border-brand/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-brand" />
              <span>Upload / Add Inventory Item</span>
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Item Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Mini Burger Buns, Raw Chicken Mince..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Category:</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand"
                  >
                    <option value="Bakery">Bakery / Buns</option>
                    <option value="Meat">Meat & Poultry</option>
                    <option value="Momos">Momos Prepped</option>
                    <option value="Sauce">Sauces & Condiments</option>
                    <option value="Disposables">Packaging / Boxes</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Unit of Count:</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-brand"
                  >
                    <option value="pcs">Pieces (পিস)</option>
                    <option value="kg">Kilograms (কেজি)</option>
                    <option value="packet">Packet (প্যাকেট)</option>
                    <option value="box">Box (বক্স)</option>
                    <option value="jar">Jar / Bottle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Opening Stock (Carryover):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newOpeningStock}
                    onChange={(e) => setNewOpeningStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Added Today:</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newAddedToday}
                    onChange={(e) => setNewAddedToday(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold focus:outline-none focus:border-brand"
                  />
                </div>
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
                  Upload Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Stock with Audit Reason */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#141722] border border-brand/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-brand" />
              <span>Adjust Stock: {editingItem.itemName}</span>
            </h3>

            <p className="text-xs text-zinc-400">
              Opening Stock: <strong className="text-white">{editingItem.openingStock} {editingItem.unit}</strong>
            </p>

            <form onSubmit={handleSaveStockUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Added Today (+):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editAddedToday}
                    onChange={(e) => setEditAddedToday(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Sold / Used (-):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editSoldQuantity}
                    onChange={(e) => setEditSoldQuantity(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">New Closing Stock (Carryover):</span>
                <span className="text-base font-black text-amber-400">
                  {editingItem.openingStock + editAddedToday - editSoldQuantity} {editingItem.unit}
                </span>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Audit Reason for Stock Adjustment:</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Extra 20 momos prepped for night rush, 1 bun damaged during prep..."
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-brand hover:bg-orange-600 text-white font-bold shadow-md shadow-brand/20"
                >
                  Commit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

