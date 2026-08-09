import React from 'react';
import { BusinessProfile, Customer, Employee, Transaction } from '../types';

interface AdminDashboardScreenProps {
  profile: BusinessProfile;
  transactions: Transaction[];
  customers: Customer[];
  employees: Employee[];
  onNavigate: (tab: any) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  profile,
  transactions,
  customers,
  employees,
  onNavigate,
  onSelectTransaction,
}) => {
  // Financial Calculations
  const salesTx = transactions.filter((t) => t.type === 'sale');
  const expenseTx = transactions.filter((t) => t.type === 'expense');

  const totalSales = salesTx.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : '0.0';

  const totalKhataOutstanding = customers.reduce((sum, c) => sum + c.creditBalance, 0);

  // Category Breakdown
  const categorySales: Record<string, number> = {};
  salesTx.forEach((t) => {
    const cat = t.category || 'Grocery';
    categorySales[cat] = (categorySales[cat] || 0) + t.amount;
  });

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="px-4 py-5 max-w-7xl mx-auto space-y-6 pb-24 animate-fadeIn">
      {/* UAE Executive Admin Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-700/50 relative overflow-hidden">
        {/* Subtle decorative UAE flag accent stripe */}
        <div className="absolute top-0 right-0 w-32 h-full opacity-15 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:12px_12px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
                UAE TRN Certified
              </span>
              <span className="text-emerald-200 text-xs font-medium">
                TRN: {profile.trn}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {profile.shopName}
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">
              {profile.shopNameArabic || 'المقر الرئيسي لإدارة المتجر'} • Executive Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('pos')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
              Launch POS Cashier
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="bg-white/10 hover:bg-white/20 text-white font-medium p-2.5 rounded-xl text-xs sm:text-sm border border-white/20 transition-all"
              title="Store Settings"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards (Profit = GREEN, Expense = RED) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales (Green Theme) */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Total Sales Income
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 tracking-tight">
            AED {totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {salesTx.length} Completed Invoices
          </div>
        </div>

        {/* Total Expenses (Red Theme) */}
        <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 tracking-tight">
            AED {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">receipt</span>
            {expenseTx.length} Expense Logs Recorded
          </div>
        </div>

        {/* Net Profit (Highlighted Green for Profit, Red for Loss) */}
        <div
          className={`rounded-2xl p-4 border shadow-sm relative overflow-hidden ${
            netProfit >= 0
              ? 'bg-emerald-900 text-white border-emerald-800'
              : 'bg-rose-900 text-white border-rose-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              Net Business Profit
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              {profitMargin}% Margin
            </span>
          </div>
          <div className="text-2xl font-black tracking-tight text-white">
            {netProfit >= 0 ? '+' : ''}AED {netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="mt-2 text-[11px] opacity-80 font-medium">
            Calculated: Sales Income minus Operating Stock & Expense
          </p>
        </div>

        {/* Outstanding Receivables / Khata (Gold Theme) */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Customer Udhar (Khata)
            </span>
            <button
              onClick={() => onNavigate('customers')}
              className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center hover:bg-amber-100 transition-colors"
              title="Open Khata Ledger"
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
            </button>
          </div>
          <div className="text-2xl font-black text-amber-900 tracking-tight">
            AED {totalKhataOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">pending_actions</span>
            {customers.filter((c) => c.creditBalance > 0).length} Customers Pending Payment
          </div>
        </div>
      </div>

      {/* Visual Income vs Expense Ratio & UAE VAT Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Financial Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-[20px]">
                  analytics
                </span>
                Financial Cash Flow Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visual Comparison of Sales Revenue (Green) vs Shop Operating Cost (Red)
              </p>
            </div>
            <button
              onClick={() => onNavigate('ledger')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
            >
              Full Ledger <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Visual Ratio Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-emerald-800 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                Sales: AED {totalSales.toFixed(2)} ({totalSales + totalExpenses > 0 ? ((totalSales / (totalSales + totalExpenses)) * 100).toFixed(0) : 0}%)
              </span>
              <span className="text-rose-700 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-600 inline-block" />
                Expenses: AED {totalExpenses.toFixed(2)} ({totalSales + totalExpenses > 0 ? ((totalExpenses / (totalSales + totalExpenses)) * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-emerald-600 transition-all duration-500"
                style={{
                  width: `${
                    totalSales + totalExpenses > 0
                      ? (totalSales / (totalSales + totalExpenses)) * 100
                      : 50
                  }%`,
                }}
              />
              <div
                className="bg-rose-600 transition-all duration-500"
                style={{
                  width: `${
                    totalSales + totalExpenses > 0
                      ? (totalExpenses / (totalSales + totalExpenses)) * 100
                      : 50
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Sales by Category Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Sales by Grocery Category
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(categorySales).map(([cat, amt]) => (
                <div key={cat} className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                  <div className="text-[11px] font-medium text-slate-500 truncate">{cat}</div>
                  <div className="text-sm font-bold text-emerald-800">AED {amt.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* UAE FTA Mandatory VAT Threshold Tracker */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">
                  verified_user
                </span>
                UAE FTA Tax Status
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rolling 12-Month Threshold Monitor
              </p>
            </div>
            <button
              onClick={() => onNavigate('vat-report')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              Filing Report
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>12-Mo Turnover: AED {profile.rollingTurnover.toLocaleString()}</span>
                <span>Limit: AED 375,000</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (profile.rollingTurnover / profile.vatThreshold) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-amber-700">info</span>
                Mandatory Registration Threshold
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                You are at {((profile.rollingTurnover / profile.vatThreshold) * 100).toFixed(0)}% of the mandatory AED 375,000 limit. Tax Invoice 5% VAT rate is applied automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff / Cashier Shift Performance & Sales Tracker */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700 text-[20px]">
                badge
              </span>
              Cashier & Employee Today's Sales
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live shift activity and register totals per staff member
            </p>
          </div>
          <button
            onClick={() => onNavigate('employees')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            Manage Staff & PINs <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs"
                  style={{ backgroundColor: emp.avatarColor || '#007a3d' }}
                >
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">{emp.name}</div>
                  <div className="text-[11px] text-slate-500">{emp.role}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    {emp.activeShift ? '🟢 Shift Active' : '⚪ Off Duty'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-slate-900">
                  AED {emp.totalSalesToday.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500">{emp.salesCountToday} Bills</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Ledger Audit Trail */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-700 text-[20px]">
              history
            </span>
            Recent Store Transactions
          </h3>
          <button
            onClick={() => onNavigate('ledger')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === 'sale'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {tx.type === 'sale' ? 'add_shopping_cart' : 'payments'}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm text-slate-900">
                    {tx.title}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {tx.date} • {tx.paymentMethod}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`font-bold text-xs sm:text-sm ${
                    tx.type === 'sale' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {tx.type === 'sale' ? '+' : '-'}AED {tx.amount.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">VAT: AED {tx.vatAmount.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
