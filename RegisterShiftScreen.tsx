import React, { useState, useRef, useEffect } from 'react';
import { Employee, Transaction } from '../types';

interface RegisterShiftScreenProps {
  activeEmployee: Employee;
  transactions: Transaction[];
  onToggleShift: (empId: string) => void;
  onOpenPos: () => void;
}

export const RegisterShiftScreen: React.FC<RegisterShiftScreenProps> = ({
  activeEmployee,
  transactions,
  onToggleShift,
  onOpenPos,
}) => {
  const [openingFloat, setOpeningFloat] = useState(200.0); // 200 AED opening cash float
  const [printedReport, setPrintedReport] = useState(false);
  const printTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (printTimeoutRef.current) {
        clearTimeout(printTimeoutRef.current);
      }
    };
  }, []);

  // Calculate shift transactions
  const todaySales = transactions.filter((t) => t.type === 'sale');
  const cashSales = todaySales
    .filter((t) => t.paymentMethod === 'Cash')
    .reduce((sum, t) => sum + t.amount, 0);
  const cardSales = todaySales
    .filter((t) => t.paymentMethod === 'Card')
    .reduce((sum, t) => sum + t.amount, 0);
  const khataSales = todaySales
    .filter((t) => t.paymentMethod === 'Credit / Khata')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSalesAmount = todaySales.reduce((sum, t) => sum + t.amount, 0);
  const totalCashInDrawer = openingFloat + cashSales;

  return (
    <div className="px-4 py-5 max-w-4xl mx-auto space-y-6 pb-24 animate-fadeIn">
      {/* Cashier Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-900 text-white rounded-2xl p-5 shadow-lg border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white shadow-md"
              style={{ backgroundColor: activeEmployee.avatarColor || '#007a3d' }}
            >
              {activeEmployee.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs text-emerald-300 font-medium">Cashier Shift Register</div>
              <h2 className="text-lg font-bold text-white">{activeEmployee.name}</h2>
              <p className="text-xs text-slate-300">{activeEmployee.role} • Terminal #01</p>
            </div>
          </div>

          <button
            onClick={() => onToggleShift(activeEmployee.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              activeEmployee.activeShift
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-700 text-slate-300 border-slate-600'
            }`}
          >
            {activeEmployee.activeShift ? '🟢 Shift Open' : '⚪ Shift Closed'}
          </button>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-300">Register Opening Cash Float:</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">AED {openingFloat.toFixed(2)}</span>
            <button
              onClick={() => {
                const val = prompt('Set Opening Cash Float (AED):', openingFloat.toString());
                if (val && !isNaN(Number(val))) setOpeningFloat(Number(val));
              }}
              className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-emerald-200 hover:bg-white/20"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Cash Drawer Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Cash In Drawer */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-300 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-900 uppercase">
              💵 Total Cash in Drawer
            </span>
            <span className="material-symbols-outlined text-emerald-700 text-[20px]">
              payments
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-900">
            AED {totalCashInDrawer.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Float (AED {openingFloat.toFixed(2)}) + Cash Sales (AED {cashSales.toFixed(2)})
          </div>
        </div>

        {/* Card Payments */}
        <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-blue-900 uppercase">
              💳 Card / Digital Sales
            </span>
            <span className="material-symbols-outlined text-blue-700 text-[20px]">
              credit_card
            </span>
          </div>
          <div className="text-2xl font-black text-blue-900">
            AED {cardSales.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Direct terminal card settlements</div>
        </div>

        {/* Khata Udhar Issued */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-900 uppercase">
              📖 Udhar / Khata Booked
            </span>
            <span className="material-symbols-outlined text-amber-700 text-[20px]">
              pending
            </span>
          </div>
          <div className="text-2xl font-black text-amber-900">
            AED {khataSales.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Customer credit balances added</div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-700 text-[20px]">
            point_of_sale
          </span>
          Terminal Actions & Printing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onOpenPos}
            className="p-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
            Open POS Billing Terminal
          </button>

          <button
            onClick={() => {
              if (printTimeoutRef.current) {
                clearTimeout(printTimeoutRef.current);
              }
              setPrintedReport(true);
              printTimeoutRef.current = setTimeout(() => {
                setPrintedReport(false);
                printTimeoutRef.current = null;
              }, 4000);
            }}
            className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
            Print Shift Z-Report (Summary)
          </button>
        </div>

        {printedReport && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-700 text-[18px]">
              check_circle
            </span>
            Shift Z-Report printed successfully on POS Thermal Printer!
          </div>
        )}
      </div>
    </div>
  );
};
