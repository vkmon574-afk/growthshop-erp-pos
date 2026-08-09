import React from 'react';
import { ActiveTab, BusinessProfile, Transaction } from '../types';

interface HomeScreenProps {
  profile: BusinessProfile;
  transactions: Transaction[];
  onNavigate: (tab: ActiveTab) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  transactions,
  onNavigate,
  onSelectTransaction,
}) => {
  // Compute totals
  const totalSales = transactions
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const displaySales = totalSales > 0 ? totalSales : profile.salesThisMonth;
  const displayExpenses = totalExpenses > 0 ? totalExpenses : profile.expensesThisMonth;
  const netSaved = displaySales - displayExpenses;

  // Gauge calculation (percentage of 375,000 AED)
  const turnoverK = Math.round(profile.rollingTurnover / 1000);
  const gaugePercent = Math.min(100, Math.round((profile.rollingTurnover / profile.vatThreshold) * 100));
  const dashOffset = 125.6 - (125.6 * (gaugePercent / 100));

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="flex flex-col w-full gap-section-gap px-container-margin pt-stack-md pb-28 animate-fadeIn max-w-lg mx-auto">
      {/* Greeting Banner */}
      <section className="bg-gradient-to-r from-teal-800 to-teal-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-xs text-teal-200 font-medium">Assalamu Alaikum,</p>
            <h1 className="text-xl font-bold font-display-sm tracking-tight mt-0.5">
              {profile.shopName}
            </h1>
            <p className="text-xs text-teal-100/80 mt-1 font-mono">TRN: {profile.trn}</p>
          </div>

          <button
            onClick={() => onNavigate('settings')}
            className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px] text-white">store</span>
          </button>
        </div>

        {/* Sales & Expenses Row */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-teal-700/60">
          <div>
            <span className="text-[11px] text-teal-200 uppercase font-semibold block">
              Sales (This Month)
            </span>
            <span className="text-lg font-black font-display-sm">
              AED {displaySales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-teal-200 uppercase font-semibold block">
              Expenses
            </span>
            <span className="text-lg font-bold font-display-sm text-teal-100">
              AED {displayExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </section>

      {/* Main ERP Navigation Grid */}
      <section className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onNavigate('pos')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-primary text-on-primary shadow-md active:scale-95 transition-all text-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[26px]">point_of_sale</span>
          <span className="font-bold text-[11px] leading-tight">POS Bill</span>
        </button>

        <button
          onClick={() => onNavigate('inventory')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-container-lowest text-on-surface border border-outline-variant/30 shadow-sm active:scale-95 transition-all text-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[26px] text-primary">inventory_2</span>
          <span className="font-bold text-[11px] leading-tight">Catalog</span>
        </button>

        <button
          onClick={() => onNavigate('customers')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-container-lowest text-on-surface border border-outline-variant/30 shadow-sm active:scale-95 transition-all text-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[26px] text-primary">group</span>
          <span className="font-bold text-[11px] leading-tight">Customers</span>
        </button>

        <button
          onClick={() => onNavigate('vat-report')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-container-lowest text-on-surface border border-outline-variant/30 shadow-sm active:scale-95 transition-all text-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[26px] text-primary">verified</span>
          <span className="font-bold text-[11px] leading-tight">VAT Report</span>
        </button>
      </section>

      {/* VAT Threshold Gauge */}
      <section
        onClick={() => onNavigate('vat-report')}
        className="bg-surface-container-lowest rounded-2xl p-card-padding shadow-md border border-outline-variant/30 flex flex-col gap-stack-md items-center text-center cursor-pointer hover:border-primary/40 transition-all active:scale-[0.99] group relative overflow-hidden"
      >
        <div className="flex justify-between items-start w-full text-left">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-semibold group-hover:text-primary transition-colors flex items-center gap-1.5">
              UAE VAT Registration Meter
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                chevron_right
              </span>
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant text-xs">
              Rolling 12-Month Sales Turnover
            </p>
          </div>
        </div>

        <div className="relative w-48 h-24 overflow-hidden mt-1">
          <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 50">
            <path
              className="text-surface-variant"
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
          <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 100 50">
            <path
              className="text-primary drop-shadow-[0_2px_4px_rgba(15,118,110,0.3)]"
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray="125.6"
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
            {turnoverK}k AED
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 bg-secondary-container/60 px-3 py-0.5 rounded-full border border-secondary/20">
            <span className="material-symbols-outlined text-[14px] text-on-secondary-container">
              check_circle
            </span>
            <span className="font-label-sm text-xs text-on-secondary-container font-semibold">
              Below AED 375,000 Mandatory Threshold
            </span>
          </div>
        </div>
      </section>

      {/* Recent Entries */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="font-headline-lg-mobile text-on-surface font-bold text-sm">
            Recent Tax Invoices & Bills
          </h2>
          <button
            onClick={() => onNavigate('ledger')}
            className="font-label-sm text-xs text-primary font-bold hover:underline"
          >
            View All Ledger
          </button>
        </div>

        <div className="flex flex-col bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden divide-y divide-outline-variant/20">
          {recentTransactions.map((tx) => {
            const isSale = tx.type === 'sale';
            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="flex items-center justify-between p-3.5 active:bg-surface-variant/40 hover:bg-surface-container-low/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isSale ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isSale ? 'receipt_long' : 'payments'}
                    </span>
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-xs text-on-surface truncate">
                      {tx.title}
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {tx.invoiceNumber || tx.id} • {tx.date}
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
                  <span className="text-[10px] text-on-surface-variant">
                    VAT: AED {tx.vatAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
