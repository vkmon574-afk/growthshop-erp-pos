import React from 'react';
import { ActiveTab, UserRole } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  activeRole: UserRole;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, activeRole, onTabChange }) => {
  if (activeTab === 'camera-scan') {
    return null;
  }

  const adminNavItems: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'admin-dashboard', label: 'Admin Board', icon: 'monitoring' },
    { id: 'pos', label: 'POS Billing', icon: 'point_of_sale' },
    { id: 'inventory', label: 'Stock & Price', icon: 'inventory_2' },
    { id: 'customers', label: 'Khata Udhar', icon: 'group' },
    { id: 'ledger', label: 'Ledger', icon: 'receipt_long' },
    { id: 'employees', label: 'Staff', icon: 'badge' },
  ];

  const employeeNavItems: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'pos', label: 'POS Billing', icon: 'point_of_sale' },
    { id: 'inventory', label: 'Price Catalog', icon: 'search' },
    { id: 'customers', label: 'Khata Lookup', icon: 'person_search' },
    { id: 'register-shift', label: 'Cash Shift', icon: 'payments' },
  ];

  const navItems = activeRole === 'admin' ? adminNavItems : employeeNavItems;

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-slate-200">
      <div className="h-16 flex items-center justify-around px-2 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive =
            activeTab === item.id || (item.id === 'admin-dashboard' && activeTab === 'home');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-1.5 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`w-9 h-6 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-emerald-100 text-emerald-900 shadow-xs' : ''
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {item.icon}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

