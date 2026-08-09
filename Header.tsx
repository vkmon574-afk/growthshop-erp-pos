import React from 'react';
import { LOGO_URL } from './initialData';
import { UserRole } from '../types';

interface HeaderProps {
  title: string;
  activeRole: UserRole;
  activeEmployeeName?: string;
  showBack?: boolean;
  onBack?: () => void;
  onRoleSwitchClick?: () => void;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  activeRole,
  activeEmployeeName = 'Staff',
  showBack = false,
  onBack,
  onRoleSwitchClick,
  onProfileClick,
}) => {
  const isAdmin = activeRole === 'admin';

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-sm pt-safe">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full transition-colors active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          ) : null}
          
          <img
            src={LOGO_URL}
            alt="GrowthShop Logo"
            className="h-8 w-auto object-contain shrink-0"
          />
          
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm sm:text-base truncate leading-tight">
                {title}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 truncate">
              {isAdmin ? '🛡️ Admin Access' : `🛒 Cashier: ${activeEmployeeName}`}
            </span>
          </div>
        </div>

        {/* Right side role badge and settings button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRoleSwitchClick}
            title="Switch User Role (Admin / Employee)"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs border ${
              isAdmin
                ? 'bg-emerald-800 text-white border-emerald-700 hover:bg-emerald-900'
                : 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isAdmin ? 'admin_panel_settings' : 'badge'}
            </span>
            <span className="hidden sm:inline">
              {isAdmin ? 'Admin Mode' : 'Cashier Mode'}
            </span>
            <span className="material-symbols-outlined text-[14px]">unfold_more</span>
          </button>

          <button
            onClick={onProfileClick}
            aria-label="User Profile"
            className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-xs border border-slate-700"
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};

