import React, { useState } from 'react';
import { Customer, Transaction } from '../types';

interface CustomersScreenProps {
  customers: Customer[];
  transactions: Transaction[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'totalSpent'>) => void;
  onUpdateCustomerBalance: (customerId: string, newBalance: number) => void;
  onSelectCustomerForPOS: (customer: Customer) => void;
}

export const CustomersScreen: React.FC<CustomersScreenProps> = ({
  customers,
  transactions,
  onAddCustomer,
  onUpdateCustomerBalance,
  onSelectCustomerForPOS,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Add customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTrn, setNewTrn] = useState('');
  const [initialCredit, setInitialCredit] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const totalCreditOwed = customers.reduce((sum, c) => sum + (c.creditBalance > 0 ? c.creditBalance : 0), 0);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddCustomer({
      name: newName,
      phone: newPhone || 'N/A',
      email: newEmail || undefined,
      address: newAddress || undefined,
      trn: newTrn || undefined,
      creditBalance: parseFloat(initialCredit) || 0,
      lastPurchaseDate: 'Just now',
    });

    // Reset form
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewTrn('');
    setInitialCredit('');
    setShowAddModal(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const paid = parseFloat(paymentAmount) || 0;
    if (paid <= 0) return;

    const newBal = Math.max(0, selectedCustomer.creditBalance - paid);
    onUpdateCustomerBalance(selectedCustomer.id, newBal);

    setSelectedCustomer((prev) => (prev ? { ...prev, creditBalance: newBal } : null));
    setShowPaymentModal(false);
    setPaymentAmount('');
  };

  const customerTransactions = selectedCustomer
    ? transactions.filter((t) => t.customerId === selectedCustomer.id || t.customerName === selectedCustomer.name)
    : [];

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-container-margin pt-stack-md pb-28 animate-fadeIn gap-section-gap">
      {/* Header Banner */}
      <div className="bg-surface-container-lowest rounded-2xl p-card-padding shadow-[0_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex items-center justify-between">
        <div>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Customer Credit (Khata / Udhar)
          </span>
          <div className="font-display-sm text-error font-bold mt-0.5">
            AED {totalCreditOwed.toFixed(2)}
          </div>
          <span className="font-label-sm text-on-surface-variant text-xs">
            Total pending receivables from {customers.filter(c => c.creditBalance > 0).length} customers
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-on-primary p-3 rounded-xl shadow-md flex items-center gap-1.5 font-label-md font-semibold active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add New
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-3 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customer name or mobile number..."
          className="w-full pl-11 pr-4 py-2.5 bg-surface-container rounded-xl text-sm outline-none border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest transition-all"
        />
      </div>

      {/* Customers List */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-headline-lg-mobile text-on-surface font-bold text-sm">
            All Customers ({filteredCustomers.length})
          </h3>
          <span className="text-xs text-on-surface-variant">Tap to view ledger & history</span>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">
              person_search
            </span>
            <p className="font-semibold text-slate-900 text-sm">No customer found</p>
            <p className="text-xs text-slate-500 mt-1">
              Add a customer to track credit (Khata) and issue official Tax Invoices.
            </p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const hasKhata = cust.creditBalance > 0;
            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between cursor-pointer hover:border-emerald-600/50 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border ${
                      hasKhata
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {cust.name.substring(0, 1).toUpperCase()}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {cust.name}
                    </span>
                    <span className="text-slate-500 text-xs truncate">
                      📱 {cust.phone} {cust.trn ? `• TRN: ${cust.trn}` : ''}
                    </span>
                    <span className="text-slate-400 text-[11px] mt-0.5">
                      Total Bought: AED {cust.totalSpent.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {hasKhata ? (
                    <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-200">
                      <span className="text-[10px] uppercase font-bold block text-red-800">Khata Pending</span>
                      <span className="font-bold text-sm">AED {cust.creditBalance.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <span className="text-[10px] uppercase font-bold block text-emerald-900">Balance</span>
                      <span className="font-bold text-sm">AED 0.00</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <form
            onSubmit={handleCreateCustomer}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col gap-4 animate-slideUp border border-slate-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700">person_add</span>
                New Customer Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Customer / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Al Madina Supermarket LLC"
                  className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                  className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  TRN (Tax Registration No. - Optional)
                </label>
                <input
                  type="text"
                  value={newTrn}
                  onChange={(e) => setNewTrn(e.target.value)}
                  placeholder="100345987600003"
                  className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white font-mono text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Initial Credit / Opening Khata Balance (AED)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={initialCredit}
                  onChange={(e) => setInitialCredit(e.target.value)}
                  placeholder="0.00"
                  className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white font-bold text-red-600"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-sm shadow-md transition-colors"
              >
                Save Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selected Customer Detail Modal */}
      {selectedCustomer && !showPaymentModal && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedCustomer(null)}
          />
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col gap-4 animate-slideUp max-h-[85vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-slate-500">
                  📱 {selectedCustomer.phone} {selectedCustomer.address ? `• ${selectedCustomer.address}` : ''}
                </p>
                {selectedCustomer.trn && (
                  <p className="text-xs font-mono text-emerald-700 mt-0.5">TRN: {selectedCustomer.trn}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Balance Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Pending Credit Balance
                </span>
                <div
                  className={`text-2xl font-bold ${
                    selectedCustomer.creditBalance > 0 ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  AED {selectedCustomer.creditBalance.toFixed(2)}
                </div>
              </div>

              {selectedCustomer.creditBalance > 0 && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors"
                >
                  Clear Payment
                </button>
              )}
            </div>

            {/* Quick POS Action */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onSelectCustomerForPOS(selectedCustomer);
                  setSelectedCustomer(null);
                }}
                className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
                Create New Sale Bill
              </button>

              <button
                onClick={() => {
                  const text = `Hello ${selectedCustomer.name}, your current store balance at Al Noor Grocery is AED ${selectedCustomer.creditBalance.toFixed(2)}. Thank you!`;
                  window.open(`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="bg-[#25D366] text-white hover:bg-[#20ba5a] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                WhatsApp
              </button>
            </div>

            {/* History Table */}
            <div>
              <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">
                Recent Purchase Invoices ({customerTransactions.length})
              </h4>
              {customerTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded-xl border border-slate-100">No past orders found for this customer.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {customerTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs border border-slate-200"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{tx.title}</span>
                        <span className="text-slate-500">{tx.date} • {tx.paymentMethod}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-700 text-sm block">AED {tx.amount.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500">VAT: AED {tx.vatAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowPaymentModal(false)}
          />
          <form
            onSubmit={handleRecordPayment}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col gap-4 animate-fadeIn border border-slate-200"
          >
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-2">
              Record Udhar / Credit Clearing
            </h3>
            <p className="text-xs text-slate-600">
              Customer: <span className="font-bold text-slate-900">{selectedCustomer.name}</span> (Current Balance: AED {selectedCustomer.creditBalance.toFixed(2)})
            </p>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Received Payment Amount (AED)
              </label>
              <input
                type="number"
                step="0.01"
                required
                max={selectedCustomer.creditBalance}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={selectedCustomer.creditBalance.toFixed(2)}
                className="p-3 bg-slate-50 rounded-xl text-lg font-bold outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white text-emerald-700"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-sm shadow-md transition-colors"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
