import React, { useState } from 'react';
import { TimeFilter, Transaction } from '../types';

interface LedgerScreenProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenInvoiceModal: (tx: Transaction) => void;
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({
  transactions,
  onDeleteTransaction,
  onOpenInvoiceModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('This Month');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'expense'>('all');

  const filters: TimeFilter[] = ['Today', 'This Week', 'This Month', 'This Year'];

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchInv = tx.invoiceNumber?.toLowerCase().includes(q) || false;
      const matchCust = tx.customerName?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchCat && !matchInv && !matchCust) return false;
    }

    return true;
  });

  const totalSales = filteredTransactions
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalVatCollected = filteredTransactions
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + t.vatAmount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group by day label
  const grouped: { [key: string]: Transaction[] } = {};
  filteredTransactions.forEach((tx) => {
    let dayKey = 'Earlier';
    if (tx.date.startsWith('Today')) dayKey = 'Today';
    else if (tx.date.startsWith('Yesterday')) dayKey = 'Yesterday';
    else dayKey = tx.date.split(',')[0] || 'Earlier';

    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(tx);
  });

  return (
    <div className="flex flex-col w-full h-full gap-section-gap px-container-margin pt-stack-md pb-28 animate-fadeIn max-w-lg mx-auto">
      {/* Time Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              activeFilter === f
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Ledger Totals Banner */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block">
            Filter Net Turnover
          </span>
          <div className="text-xl font-bold text-on-surface mt-0.5">
            AED {totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-teal-700 font-semibold block mt-0.5">
            Output VAT: AED {totalVatCollected.toFixed(2)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold block">
            Expenses
          </span>
          <div className="text-lg font-bold text-error mt-0.5">
            AED {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Search & Sub-filters */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice # or customer..."
            className="w-full pl-9 pr-3 py-2 bg-surface-container rounded-xl text-xs outline-none border border-outline-variant/30 focus:border-primary"
          />
        </div>

        <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant/20 shrink-0">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              typeFilter === 'all' ? 'bg-surface-container-lowest text-on-surface shadow-xs' : 'text-on-surface-variant'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTypeFilter('sale')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              typeFilter === 'sale' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant'
            }`}
          >
            Sales
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              typeFilter === 'expense' ? 'bg-error text-on-error shadow-xs' : 'text-on-surface-variant'
            }`}
          >
            Expenses
          </button>
        </div>
      </div>

      {/* Grouped Transaction List */}
      <div className="flex flex-col gap-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] opacity-40 mb-2">receipt_long</span>
            <p className="font-bold text-sm text-on-surface">No tax invoices found</p>
            <p className="text-xs mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dayLabel, items]) => (
            <div key={dayLabel} className="flex flex-col gap-2">
              <h3 className="font-bold text-xs text-on-surface-variant uppercase px-1">
                {dayLabel}
              </h3>

              <div className="flex flex-col gap-2">
                {items.map((tx) => {
                  const isSale = tx.type === 'sale';
                  return (
                    <div
                      key={tx.id}
                      onClick={() => onOpenInvoiceModal(tx)}
                      className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-outline-variant/20 flex items-center justify-between active:scale-[0.99] transition-transform cursor-pointer hover:border-primary/40"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isSale
                              ? 'bg-primary-container text-on-primary-container'
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {isSale ? 'receipt' : 'payments'}
                          </span>
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-on-surface truncate">
                            {tx.title}
                          </span>
                          <span className="text-[11px] text-on-surface-variant truncate mt-0.5">
                            {tx.invoiceNumber || tx.id} • {tx.paymentMethod}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-bold text-sm block ${
                            isSale ? 'text-primary' : 'text-on-surface'
                          }`}
                        >
                          {isSale ? '+' : '-'} AED {tx.amount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-teal-700 font-semibold block">
                          VAT: AED {tx.vatAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
