import React, { useState } from 'react';
import { BusinessProfile, Language } from '../types';

interface SettingsScreenProps {
  profile: BusinessProfile;
  onUpdateProfile: (updated: Partial<BusinessProfile>) => void;
  onSignOut: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  onUpdateProfile,
  onSignOut,
}) => {
  const [showLangModal, setShowLangModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showShopsModal, setShowShopsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Edit profile form state
  const [editShopName, setEditShopName] = useState(profile.shopName);
  const [editTRN, setEditTRN] = useState(profile.trn);

  const languages: Language[] = [
    'English',
    'Arabic (العربية)',
    'Hindi (हिंदी)',
    'Urdu (اردو)',
    'Malayalam (മലയാളം)',
  ];

  const handleSelectLanguage = (lang: Language) => {
    onUpdateProfile({ language: lang });
    setShowLangModal(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ shopName: editShopName, trn: editTRN });
    setShowEditProfileModal(false);
  };

  // Download simulation
  const handleExport = (format: 'pdf' | 'excel') => {
    const filename = `GrowthShop_VAT_Return_Q3_${profile.shopName.replace(/\s+/g, '_')}.${format === 'pdf' ? 'pdf' : 'csv'}`;
    const content = `GrowthShop VAT Report - ${profile.shopName}\nTRN: ${profile.trn}\nPeriod: Q3\nSales: AED ${profile.salesThisMonth}\nExpenses: AED ${profile.expensesThisMonth}\nVAT Payable: AED ${(profile.salesThisMonth * 0.05).toFixed(2)}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
  };

  return (
    <div className="flex flex-col w-full px-container-margin gap-section-gap pb-28 animate-fadeIn">
      {/* Business Profile Card */}
      <div className="flex flex-col gap-4 mt-stack-md">
        <div className="flex items-center justify-between bg-surface-container rounded-2xl p-card-padding shadow-[0_4px_20px_rgba(15,23,42,0.05)] relative overflow-hidden border border-outline-variant/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[32px] text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                storefront
              </span>
            </div>
            <div className="flex flex-col">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
                {profile.shopName}
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                TRN: {profile.trn}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditShopName(profile.shopName);
              setEditTRN(profile.trn);
              setShowEditProfileModal(true);
            }}
            className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors z-10 shrink-0"
            title="Edit Store Profile"
          >
            <span className="material-symbols-outlined text-[22px]">edit</span>
          </button>
        </div>
      </div>

      {/* PREFERENCES */}
      <div className="flex flex-col gap-3">
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider pl-2 font-semibold">
          Preferences
        </h3>
        <div className="bg-surface-container rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/20 overflow-hidden divide-y divide-outline-variant/20">
          {/* Language Selector */}
          <button
            onClick={() => setShowLangModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary-container text-[20px]">
                  language
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-lg text-body-lg text-on-surface font-medium">
                  Language
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant text-sm">
                  {profile.language}
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">
              chevron_right
            </span>
          </button>

          {/* WhatsApp Reminders */}
          <div className="w-full flex items-center justify-between p-4 bg-surface-container">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E0F2F1] flex items-center justify-center shrink-0">
                <svg
                  className="text-[#00BFA5]"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M17.472 14.38c-.297-.149-1.758-.867-2.03-.967-.273-.099-.47-.148-.668.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.574-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413-.074-.124-.272-.198-.569-.347z"
                    fill="currentColor"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12c0 1.76.45 3.4 1.25 4.83L2 22l5.28-1.21C8.65 21.57 10.28 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18.17c-1.48 0-2.9-.38-4.14-1.07l-.3-.17-3.08.71.72-3-.19-.32C4.38 15.11 4 13.6 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-body-lg text-body-lg text-on-surface font-medium">
                  WhatsApp Reminders
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant text-sm">
                  Tax deadlines & alerts
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateProfile({ whatsappReminders: !profile.whatsappReminders })
              }
              className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                profile.whatsappReminders ? 'bg-primary' : 'bg-surface-variant'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full absolute top-1 transition-transform duration-300 ${
                  profile.whatsappReminders
                    ? 'translate-x-6 bg-on-primary'
                    : 'translate-x-1 bg-outline'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* BUSINESS & REPORTS */}
      <div className="flex flex-col gap-3">
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider pl-2 font-semibold">
          Business & Reports
        </h3>
        <div className="bg-surface-container rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/20 overflow-hidden divide-y divide-outline-variant/20">
          {/* Export Reports */}
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary-container text-[20px]">
                  download
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-lg text-body-lg text-on-surface font-medium">
                  Export Reports
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant text-sm">
                  PDF, Excel for Accountant
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">
              chevron_right
            </span>
          </button>

          {/* Manage Shops */}
          <button
            onClick={() => setShowShopsModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary-container text-[20px]">
                  add_home
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-lg text-body-lg text-on-surface font-medium">
                  Manage Shops
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant text-sm">
                  2 Shops connected
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      {/* SUPPORT */}
      <div className="flex flex-col gap-3">
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider pl-2 font-semibold">
          Support
        </h3>
        <div className="bg-surface-container rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/20 overflow-hidden">
          <button
            onClick={() => setShowHelpModal(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-secondary-container text-[20px]">
                  help
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-lg text-body-lg text-on-surface font-medium">
                  Help & Support
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant text-sm">
                  FAQs & Contact
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-2 flex justify-center">
        <button
          onClick={() => setShowSignOutConfirm(true)}
          className="flex items-center gap-2 text-error font-label-md text-label-md font-semibold px-6 py-3 rounded-full hover:bg-error-container transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </button>
      </div>

      {/* Language Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowLangModal(false)}
          />
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden animate-slideUp border border-slate-200">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">
                Select Language
              </h3>
              <button
                onClick={() => setShowLangModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col p-2 gap-1 overflow-y-auto max-h-[400px]">
              {languages.map((lang) => {
                const isSelected = profile.language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => handleSelectLanguage(lang)}
                    className={`p-4 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-800'
                    }`}
                  >
                    <span className="text-sm">
                      {lang}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-emerald-700">check</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowExportModal(false)}
          />
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 flex flex-col p-6 gap-6 animate-slideUp border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                Export Data & Reports
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-600 font-medium">
                Choose format for Q3 (Jul-Sep) VAT Return & Accounting Summary
              </p>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 transition-colors shadow-xs border border-slate-200 group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 font-bold text-sm">
                  PDF
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-800">
                    PDF Summary
                  </span>
                  <span className="text-xs text-slate-500">
                    Best for quick review and store filing
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleExport('excel')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 transition-colors shadow-xs border border-slate-200 group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-sm">
                  XLS
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-sm group-hover:text-emerald-800">
                    Excel Detail
                  </span>
                  <span className="text-xs text-slate-500">
                    Full line-item ledger for accountant
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowEditProfileModal(false)}
          />
          <form
            onSubmit={handleSaveProfile}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col gap-4 animate-fadeIn border border-slate-200"
          >
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
              Edit Business Details
            </h3>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Shop Name
              </label>
              <input
                type="text"
                value={editShopName}
                onChange={(e) => setEditShopName(e.target.value)}
                required
                className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">
                Tax Registration Number (TRN)
              </label>
              <input
                type="text"
                value={editTRN}
                onChange={(e) => setEditTRN(e.target.value)}
                required
                className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white font-mono text-slate-900"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-sm shadow-xs transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manage Shops Modal */}
      {showShopsModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowShopsModal(false)}
          />
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col gap-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                Connected Stores
              </h3>
              <button
                onClick={() => setShowShopsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-600 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{profile.shopName} (Main)</p>
                  <p className="text-xs text-slate-500">TRN: {profile.trn}</p>
                </div>
                <span className="text-xs bg-emerald-700 text-white px-2.5 py-1 rounded-full font-bold">
                  Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">Deira Branch Store</p>
                  <p className="text-xs text-slate-500">TRN: 100456789099999</p>
                </div>
                <button
                  onClick={() => {
                    onUpdateProfile({ shopName: 'Deira Branch Store', trn: '100456789099999' });
                    setShowShopsModal(false);
                  }}
                  className="text-xs bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl font-bold hover:bg-amber-200 transition-colors"
                >
                  Switch
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowShopsModal(false)}
              className="bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm mt-2 hover:bg-emerald-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowHelpModal(false)}
          />
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col gap-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                GrowthShop Support
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="font-bold text-slate-900">How is VAT calculated?</p>
                <p className="text-xs">UAE VAT is standard 5%. It is automatically computed for sales and expenses in accordance with FTA regulations.</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Contact FTA Support Agent</p>
                <p className="text-xs">Need help filing your quarterly return? Chat with our WhatsApp advisor at +971 50 123 4567.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm mt-2 hover:bg-emerald-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirm */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowSignOutConfirm(false)}
          />
          <div className="w-full max-w-xs bg-white rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col items-center gap-4 text-center border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">logout</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Sign Out?</h3>
            <p className="text-xs text-slate-500">Are you sure you want to sign out of GrowthShop?</p>
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSignOutConfirm(false);
                  onSignOut();
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold text-sm shadow-xs transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
