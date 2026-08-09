import React, { useState } from 'react';
import { BusinessProfile, CartItem, Customer, GroceryItem, Transaction } from '../types';

interface PosBillingScreenProps {
  items: GroceryItem[];
  customers: Customer[];
  profile: BusinessProfile;
  initialSelectedCustomer?: Customer | null;
  onSaveTransaction: (tx: Omit<Transaction, 'id'>) => Transaction;
  onOpenScanner: () => void;
  onOpenAddCustomerModal: () => void;
}

export const PosBillingScreen: React.FC<PosBillingScreenProps> = ({
  items,
  customers,
  profile,
  initialSelectedCustomer,
  onSaveTransaction,
  onOpenScanner,
  onOpenAddCustomerModal,
}) => {
  const [activeMode, setActiveMode] = useState<'itemized' | 'keypad'>('itemized');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialSelectedCustomer || customers[0] || null
  );

  // Cart state for itemized billing
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Credit / Khata' | 'Bank Transfer'>('Cash');
  const [searchItemQuery, setSearchItemQuery] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Keypad state
  const [keypadAmount, setKeypadAmount] = useState('0.00');
  const [keypadType, setKeypadType] = useState<'sale' | 'expense'>('sale');
  const [keypadNotes, setKeypadNotes] = useState('');

  // Calculations for Itemized Cart
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const calculatedDiscount =
    discountType === 'percent'
      ? (subtotal * (discountValue || 0)) / 100
      : Math.min(subtotal, discountValue || 0);
  const taxableAmount = Math.max(0, subtotal - calculatedDiscount);
  const vatAmount = taxableAmount * 0.05; // 5% UAE VAT
  const grandTotal = taxableAmount + vatAmount;

  // Cart helper functions
  const addToCart = (item: GroceryItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.itemId === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.itemId === item.id
            ? { ...ci, quantity: ci.quantity + 1, total: (ci.quantity + 1) * ci.unitPrice }
            : ci
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          unitPrice: item.price,
          quantity: 1,
          unit: item.unit,
          itemDiscount: 0,
          total: item.price,
        },
      ];
    });
  };

  const addCustomItemToCart = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(customItemPrice) || 0;
    if (!customItemName.trim() || priceNum <= 0) return;

    const newItem: CartItem = {
      itemId: `custom-${Date.now()}`,
      name: customItemName,
      unitPrice: priceNum,
      quantity: 1,
      unit: 'pcs',
      itemDiscount: 0,
      total: priceNum,
    };

    setCart((prev) => [...prev, newItem]);
    setCustomItemName('');
    setCustomItemPrice('');
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.itemId === itemId) {
            const newQty = ci.quantity + delta;
            if (newQty <= 0) return null;
            return { ...ci, quantity: newQty, total: newQty * ci.unitPrice };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.itemId !== itemId));
  };

  const handleCheckoutItemized = () => {
    if (cart.length === 0) return;

    const now = new Date();
    const invNum = `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const custName = selectedCustomer ? selectedCustomer.name : 'Walk-in Customer';

    onSaveTransaction({
      type: 'sale',
      invoiceNumber: invNum,
      title: `Grocery Sale - ${custName}`,
      customerId: selectedCustomer?.id,
      customerName: custName,
      customerPhone: selectedCustomer?.phone,
      items: cart,
      subtotal,
      discountType,
      discountValue,
      discountAmount: calculatedDiscount,
      vatAmount,
      amount: grandTotal,
      category: 'Grocery',
      paymentMethod,
      date: `Today, ${timeFormatted}`,
      rawDate: now.toISOString(),
      time: timeFormatted,
    });

    // Reset cart
    setCart([]);
    setDiscountValue(0);
  };

  const handleCheckoutKeypad = () => {
    const val = parseFloat(keypadAmount) || 0;
    if (val <= 0) return;

    const now = new Date();
    const invNum = `${keypadType === 'sale' ? 'INV' : 'EXP'}-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const vat = val * 0.05;

    onSaveTransaction({
      type: keypadType,
      invoiceNumber: invNum,
      title: keypadNotes || `${keypadType === 'sale' ? 'Quick Sale' : 'Quick Expense'}`,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      subtotal: val - vat,
      discountAmount: 0,
      vatAmount: vat,
      amount: val,
      category: keypadType === 'sale' ? 'Grocery' : 'Stock',
      paymentMethod,
      date: `Today, ${timeFormatted}`,
      rawDate: now.toISOString(),
      time: timeFormatted,
      notes: keypadNotes || undefined,
    });

    setKeypadAmount('0.00');
    setKeypadNotes('');
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(searchItemQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-container-margin pt-stack-md pb-28 animate-fadeIn gap-section-gap">
      {/* Header Mode Switcher */}
      <div className="bg-surface-container-lowest rounded-2xl p-2 shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div className="flex bg-surface-container rounded-xl p-1 w-full gap-1">
          <button
            onClick={() => setActiveMode('itemized')}
            className={`flex-1 py-2 rounded-lg font-label-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'itemized'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            Itemized POS Bill
          </button>

          <button
            onClick={() => setActiveMode('keypad')}
            className={`flex-1 py-2 rounded-lg font-label-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeMode === 'keypad'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">dialpad</span>
            Quick Keypad
          </button>
        </div>
      </div>

      {/* Customer Selection Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-3 shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm shrink-0">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-on-surface-variant font-semibold uppercase block">
              Billing Customer
            </span>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value);
                setSelectedCustomer(found || null);
              }}
              className="font-bold text-sm text-on-surface bg-transparent outline-none cursor-pointer truncate max-w-[180px]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.creditBalance > 0 ? `(Owes AED ${c.creditBalance})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onOpenAddCustomerModal}
          className="text-primary text-xs font-bold flex items-center gap-1 bg-primary-container/20 px-2.5 py-1.5 rounded-xl hover:bg-primary-container/40"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          + Customer
        </button>
      </div>

      {/* MODE 1: ITEMIZED CART POS */}
      {activeMode === 'itemized' ? (
        <div className="flex flex-col gap-4">
          {/* Quick Grocery Search & Add */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">search</span>
                Select Grocery Products
              </h3>
              <span className="text-xs text-on-surface-variant">Tap item to add to bill</span>
            </div>

            <input
              type="text"
              value={searchItemQuery}
              onChange={(e) => setSearchItemQuery(e.target.value)}
              placeholder="Search Basmati Rice, Fresh Milk, Water..."
              className="p-2.5 bg-surface-container rounded-xl text-xs outline-none border border-outline-variant/30 focus:border-primary"
            />

            {/* Catalog Grid Horizontal Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {filteredItems.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-surface-container-low hover:bg-primary-container/30 border border-outline-variant/20 rounded-xl p-2.5 text-left shrink-0 w-36 transition-all flex flex-col justify-between"
                >
                  <span className="font-bold text-xs text-on-surface line-clamp-1">{item.name}</span>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-primary text-xs">AED {item.price.toFixed(2)}</span>
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">+</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Entry Row */}
            <form onSubmit={addCustomItemToCart} className="flex gap-2 pt-2 border-t border-outline-variant/15">
              <input
                type="text"
                placeholder="Custom item name (e.g. Loose Sugar)"
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="flex-2 p-2 bg-surface-container rounded-lg text-xs outline-none border border-outline-variant/30"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price AED"
                value={customItemPrice}
                onChange={(e) => setCustomItemPrice(e.target.value)}
                className="flex-1 p-2 bg-surface-container rounded-lg text-xs font-bold outline-none border border-outline-variant/30 w-20"
              />
              <button
                type="submit"
                className="bg-primary text-on-primary px-3 py-2 rounded-lg text-xs font-bold shrink-0"
              >
                + Add
              </button>
            </form>
          </div>

          {/* Cart Table */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-outline-variant/30 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-2">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">shopping_cart</span>
                Invoice Items ({cart.length})
              </h3>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-error font-semibold">
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-[36px] text-outline-variant mb-1 block">
                  add_shopping_cart
                </span>
                No items added yet. Tap items above or use custom pricing.
              </div>
            ) : (
              <div className="flex flex-col gap-2 divide-y divide-outline-variant/10">
                {cart.map((ci) => (
                  <div key={ci.itemId} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className="font-bold text-on-surface block truncate">{ci.name}</span>
                      <span className="text-on-surface-variant text-[11px]">
                        AED {ci.unitPrice.toFixed(2)} x {ci.quantity} {ci.unit}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-surface-container rounded-lg border border-outline-variant/30">
                        <button
                          onClick={() => updateQuantity(ci.itemId, -1)}
                          className="w-7 h-7 flex items-center justify-center text-on-surface font-bold hover:bg-surface-variant rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold text-xs">{ci.quantity}</span>
                        <button
                          onClick={() => updateQuantity(ci.itemId, 1)}
                          className="w-7 h-7 flex items-center justify-center text-on-surface font-bold hover:bg-surface-variant rounded-r-lg"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-primary text-sm w-16 text-right">
                        AED {ci.total.toFixed(2)}
                      </span>

                      <button onClick={() => removeFromCart(ci.itemId)} className="text-error/70 hover:text-error p-1">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount & Payment Options */}
          {cart.length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-outline-variant/30 flex flex-col gap-3">
              {/* Discount Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">sell</span>
                  Apply Discount
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex bg-surface-container rounded-lg p-0.5 border border-outline-variant/30">
                    <button
                      onClick={() => setDiscountType('fixed')}
                      className={`px-2 py-1 text-[11px] font-bold rounded ${
                        discountType === 'fixed' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      AED
                    </button>
                    <button
                      onClick={() => setDiscountType('percent')}
                      className={`px-2 py-1 text-[11px] font-bold rounded ${
                        discountType === 'percent' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      %
                    </button>
                  </div>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-20 p-1.5 bg-surface-container rounded-lg text-xs font-bold text-right outline-none border border-outline-variant/30"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-on-surface-variant">Payment Mode</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['Cash', 'Card', 'Credit / Khata'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        paymentMethod === mode
                          ? 'bg-primary/10 border-primary text-primary shadow-xs'
                          : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Invoice Total Summary */}
              <div className="bg-surface-container/60 p-3 rounded-xl flex flex-col gap-1 text-xs border border-outline-variant/20 mt-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal:</span>
                  <span>AED {subtotal.toFixed(2)}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount:</span>
                    <span>- AED {calculatedDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant">
                  <span>UAE 5% VAT:</span>
                  <span>AED {vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-on-surface pt-1 border-t border-outline-variant/20">
                  <span>Grand Total:</span>
                  <span className="text-primary">AED {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Save & Generate Tax Invoice Button */}
              <button
                onClick={handleCheckoutItemized}
                className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all mt-1"
              >
                <span className="material-symbols-outlined text-[20px]">print</span>
                Complete Sale & Generate Tax Invoice
              </button>
            </div>
          )}
        </div>
      ) : (
        /* MODE 2: QUICK KEYPAD SALE / EXPENSE */
        <div className="flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-outline-variant/30 flex flex-col items-center justify-center">
            <div className="flex gap-2 mb-3 w-full">
              <button
                onClick={() => setKeypadType('sale')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                  keypadType === 'sale' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                ↑ Quick Sale
              </button>
              <button
                onClick={() => setKeypadType('expense')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                  keypadType === 'expense' ? 'bg-error text-on-error' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                ↓ Quick Expense
              </button>
            </div>

            <div className="text-3xl font-black text-on-surface my-2">
              AED {keypadAmount}
            </div>

            <span className="text-xs text-on-surface-variant font-medium">
              Includes AED {((parseFloat(keypadAmount) || 0) * 0.05).toFixed(2)} UAE 5% VAT
            </span>

            {keypadType === 'expense' && (
              <button
                onClick={onOpenScanner}
                className="mt-3 text-xs bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                Scan Receipt Photo
              </button>
            )}
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/30">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
              <button
                key={num}
                onClick={() => {
                  if (num === '.') {
                    if (keypadAmount.includes('.')) return;
                    setKeypadAmount(keypadAmount === '0.00' ? '0.' : keypadAmount + '.');
                  } else {
                    if (keypadAmount === '0.00' || keypadAmount === '0') {
                      setKeypadAmount(num);
                    } else {
                      setKeypadAmount(keypadAmount + num);
                    }
                  }
                }}
                className="h-12 bg-surface-container rounded-xl text-base font-bold text-on-surface hover:bg-surface-variant"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => {
                if (keypadAmount.length <= 1) setKeypadAmount('0.00');
                else setKeypadAmount(keypadAmount.slice(0, -1));
              }}
              className="h-12 bg-surface-container rounded-xl text-base font-bold text-on-surface hover:bg-surface-variant flex items-center justify-center"
            >
              <span className="material-symbols-outlined">backspace</span>
            </button>
          </div>

          <input
            type="text"
            placeholder="Add note (e.g. Electricity bill / Stock purchase)"
            value={keypadNotes}
            onChange={(e) => setKeypadNotes(e.target.value)}
            className="p-3 bg-surface-container-lowest rounded-xl text-xs outline-none border border-outline-variant/30"
          />

          <button
            onClick={handleCheckoutKeypad}
            disabled={parseFloat(keypadAmount) <= 0}
            className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Save Quick {keypadType === 'sale' ? 'Sale' : 'Expense'}
          </button>
        </div>
      )}
    </div>
  );
};
