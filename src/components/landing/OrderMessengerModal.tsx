import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { MENU_ITEMS } from '../../data/menuData';
import { X, MessageCircle, Plus, Minus, Trash2, Send, Bike, ShoppingBag, CheckCircle } from 'lucide-react';

interface OrderMessengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: { item: MenuItem; quantity: number }[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export const OrderMessengerModal: React.FC<OrderMessengerModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [copiedNote, setCopiedNote] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
  const MESSENGER_URL = 'https://m.me/albatrossflavor'; 

  const handleLaunchMessenger = () => {
    let orderText = `*Albatross Food Cart Order*\n\n`;
    if (customerName) orderText += `Name: ${customerName}\n`;
    if (customerPhone) orderText += `Phone: ${customerPhone}\n`;
    orderText += `Service: ${deliveryType === 'delivery' ? 'Home Delivery (Joypurhat Sadar Free)' : 'Cart Pickup at Circuit House Field'}\n`;
    if (deliveryType === 'delivery' && deliveryAddress) {
      orderText += `Address: ${deliveryAddress}\n`;
    }
    orderText += `\n*Selected Items:*\n`;
    if (cartItems.length > 0) {
      cartItems.forEach((ci) => {
        orderText += `- ${ci.item.name} x${ci.quantity} = ৳${ci.item.price * ci.quantity}\n`;
      });
      orderText += `\n*Total: ৳${totalAmount}* (Sadar Delivery Free)\n`;
    } else {
      orderText += `Hi! I want to order from Albatross.\n`;
    }
    orderText += `\nPlease confirm my order!`;

    try {
      navigator.clipboard.writeText(orderText);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 3000);
    } catch {
      // ignore
    }

    window.open(MESSENGER_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      <div 
        className="w-full sm:max-w-md bg-white text-zinc-900 rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#ff5400] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#ff5400] flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5 fill-[#ff5400]" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-white">Order on Messenger</h3>
              <p className="text-[11px] text-orange-100 font-bold">ফেসবুক মেসেঞ্জারে সরাসরি দ্রুত অর্ডার</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Quick Direct Chat */}
          <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-[#180802]">Direct Chat?</p>
              <p className="text-[11px] text-zinc-600">মেসেঞ্জারে সরাসরি নক দিতে পারেন</p>
            </div>
            <button
              onClick={() => window.open(MESSENGER_URL, '_blank')}
              className="bg-[#ff5400] text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm hover:bg-[#ea4900]"
            >
              Open Chat
            </button>
          </div>

          {/* Delivery Type */}
          <div>
            <label className="font-bold text-[#180802] block mb-1.5">সার্ভিস টাইপ:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  deliveryType === 'pickup'
                    ? 'bg-[#ff5400] text-white border-transparent shadow-md'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>কার্ট পিকআপ</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  deliveryType === 'delivery'
                    ? 'bg-[#ff5400] text-white border-transparent shadow-md'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                }`}
              >
                <Bike className="w-3.5 h-3.5 text-emerald-600" />
                <span>সদর ফ্রি ডেলিভারি</span>
              </button>
            </div>
          </div>

          {/* Items selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5 font-bold text-[#180802]">
              <span>সিলেক্ট করা আইটেম ({cartItems.reduce((acc, i) => acc + i.quantity, 0)}):</span>
              {cartItems.length > 0 && (
                <button onClick={onClearCart} className="text-[10px] text-zinc-500 hover:text-red-500 flex items-center gap-1">
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-center space-y-2">
                <p className="text-zinc-500 text-xs font-medium">কোনো আইটেম যোগ করেননি। দ্রুত কম্বো বেছে নিন:</p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      const item = MENU_ITEMS.find((m) => m.id === 'combo-special');
                      if (item) onUpdateQuantity(item.id, 1);
                    }}
                    className="text-[11px] px-3 py-1 rounded-full bg-orange-100 text-[#ff5400] font-bold border border-orange-200"
                  >
                    + স্পেশাল কম্বো (220৳)
                  </button>
                  <button
                    onClick={() => {
                      const item = MENU_ITEMS.find((m) => m.id === 'combo-gulte');
                      if (item) onUpdateQuantity(item.id, 1);
                    }}
                    className="text-[11px] px-3 py-1 rounded-full bg-orange-100 text-[#ff5400] font-bold border border-orange-200"
                  >
                    + গুলটে কম্বো (160৳)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {cartItems.map((ci) => (
                  <div
                    key={ci.item.id}
                    className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#180802] truncate">{ci.item.name}</h4>
                      <p className="text-[10px] text-[#ff5400] font-bold">৳{ci.item.price} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white rounded-lg p-0.5 border border-zinc-200">
                        <button
                          onClick={() => onUpdateQuantity(ci.item.id, -1)}
                          className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-black"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-zinc-900 text-xs">
                          {ci.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(ci.item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-black"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-black text-[#180802] w-12 text-right">
                        ৳{ci.item.price * ci.quantity}
                      </span>

                      <button onClick={() => onRemoveItem(ci.item.id)} className="text-zinc-400 hover:text-red-500 p-1">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info Inputs */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="আপনার নাম (ঐচ্ছিক)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#ff5400]"
              />
              <input
                type="tel"
                placeholder="ফোন নম্বর (ঐচ্ছিক)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#ff5400]"
              />
            </div>

            {deliveryType === 'delivery' && (
              <input
                type="text"
                placeholder="জয়পুরহাট সদরের ঠিকানা..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#ff5400]"
              />
            )}
          </div>

          {copiedNote && (
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 justify-center">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>অর্ডার বিবরণী কপি হয়েছে!</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 space-y-3 bg-zinc-50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-bold">Total Estimation:</span>
            <span className="font-display font-black text-2xl text-[#ff5400]">৳{totalAmount}</span>
          </div>

          <button
            onClick={handleLaunchMessenger}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#ff5400] hover:bg-[#ea4900] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 active:scale-95 transition-transform"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Send Order to Messenger</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
