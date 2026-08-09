import React, { useState } from 'react';
import { BusinessProfile } from '../types';

interface VatReportScreenProps {
  profile: BusinessProfile;
  onBack: () => void;
}

export const VatReportScreen: React.FC<VatReportScreenProps> = ({ profile, onBack }) => {
  const [activeModal, setActiveModal] = useState<
    'prep' | 'benefits' | 'checklist' | null
  >(null);

  const [checklistItems, setChecklistItems] = useState<{ id: string; label: string; checked: boolean }[]>([
    { id: '1', label: 'Valid UAE Trade License copy', checked: true },
    { id: '2', label: 'Passport & Emirates ID of owner / manager', checked: true },
    { id: '3', label: 'Company Bank account details & IBAN letter', checked: false },
    { id: '4', label: '12-month Turnover financial statement (Audited or ledger)', checked: false },
    { id: '5', label: 'Customs registration code (if importing stock)', checked: false },
  ]);

  const toggleCheck = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const currentTurnover = 350200; // As depicted in the design screenshot
  const mandatoryThreshold = profile.vatThreshold || 375000;
  const voluntaryThreshold = profile.voluntaryThreshold || 187500;

  const mandatoryPercent = Math.min(100, Math.round((currentTurnover / mandatoryThreshold) * 100));
  const voluntaryPercent = Math.min(100, Math.round((currentTurnover / voluntaryThreshold) * 100));

  return (
    <div className="flex flex-col w-full pb-24 bg-background animate-fadeIn">
      <div className="px-container-margin pt-stack-md flex flex-col gap-section-gap">
        {/* Header Section */}
        <section>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-1">
            VAT Alerts
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Stay on top of your registration thresholds and important tax reminders.
          </p>
        </section>

        {/* Alerts List */}
        <div className="flex flex-col gap-stack-md">
          {/* Critical Alert: Approaching Threshold */}
          <article className="bg-surface-container-highest rounded-2xl p-card-padding flex gap-gutter shadow-sm relative overflow-hidden border border-outline-variant/30">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" />
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-stack-sm flex-wrap gap-2">
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-semibold">
                  Registration Required Soon
                </h3>
                <span className="font-label-sm text-label-sm text-error bg-error-container px-2.5 py-0.5 rounded-full font-bold">
                  High Priority
                </span>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md text-sm">
                You are approaching the mandatory registration threshold of AED{' '}
                {mandatoryThreshold.toLocaleString()}. Your current turnover is AED{' '}
                {currentTurnover.toLocaleString()}.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-surface-variant rounded-full h-2 mb-stack-md overflow-hidden">
                <div
                  className="bg-error h-2 rounded-full transition-all duration-500"
                  style={{ width: `${mandatoryPercent}%` }}
                />
              </div>

              <button
                onClick={() => setActiveModal('prep')}
                className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2.5 rounded-xl w-full flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors shadow-sm font-semibold active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">app_registration</span>
                Start Registration Prep
              </button>
            </div>
          </article>

          {/* Warning Alert: Voluntary Registration */}
          <article className="bg-surface-container-high rounded-2xl p-card-padding flex gap-gutter shadow-sm relative overflow-hidden border border-outline-variant/30">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary" />
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-stack-sm flex-wrap gap-2">
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-semibold">
                  Voluntary Registration
                </h3>
                <span className="font-label-sm text-label-sm text-tertiary bg-tertiary-fixed px-2.5 py-0.5 rounded-full font-bold">
                  Opportunity
                </span>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md text-sm">
                Your turnover has exceeded AED {voluntaryThreshold.toLocaleString()}. You are now eligible to register for VAT voluntarily, which might allow you to claim back VAT on expenses.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-surface-variant rounded-full h-2 mb-stack-md overflow-hidden">
                <div
                  className="bg-tertiary h-2 rounded-full transition-all duration-500"
                  style={{ width: '55%' }}
                />
              </div>

              <button
                onClick={() => setActiveModal('benefits')}
                className="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-4 py-2.5 rounded-xl w-full flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-colors font-semibold active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">read_more</span>
                Learn About Benefits
              </button>
            </div>
          </article>

          {/* Informational Alert: Document Prep */}
          <article className="bg-surface-container rounded-2xl p-card-padding flex gap-gutter shadow-sm border border-outline-variant/30">
            <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                description
              </span>
            </div>

            <div className="flex-1">
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-semibold mb-stack-sm">
                Get Your Documents Ready
              </h3>

              <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md text-sm">
                To ensure a smooth registration process when the time comes, start gathering your trade license, passport copies, and bank letters now.
              </p>

              <button
                onClick={() => setActiveModal('checklist')}
                className="text-primary font-label-md text-label-md font-semibold flex items-center gap-1 hover:text-surface-tint transition-colors"
              >
                View Document Checklist
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </article>
        </div>
      </div>

      {/* Modal 1: Registration Prep */}
      {activeModal === 'prep' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-[24px] shadow-2xl relative z-10 p-6 flex flex-col gap-4 animate-slideUp">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified</span>
                VAT Registration Steps (Emirates)
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-sm text-on-surface-variant">
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                <p className="font-semibold text-on-surface mb-1">1. FTA EmaraTax Portal Account</p>
                Create a login on the Federal Tax Authority (FTA) portal using your UAE PASS or email.
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                <p className="font-semibold text-on-surface mb-1">2. Financial Turnover Proof</p>
                GrowthShop can generate a 12-month turnover report PDF matching your ledger entries.
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                <p className="font-semibold text-on-surface mb-1">3. TRN Issuance</p>
                After submitting documents on EmaraTax, your Tax Registration Number (TRN) is generated within 3-5 business days.
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="mt-2 bg-primary text-on-primary py-3 rounded-xl font-bold font-label-md"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Learn About Benefits */}
      {activeModal === 'benefits' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-[24px] shadow-2xl relative z-10 p-6 flex flex-col gap-4 animate-slideUp">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
                Voluntary Registration Benefits
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                <span><strong>Claim Back Input VAT:</strong> Recover 5% VAT paid on store rent, stock purchases, electricity bills, and equipment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                <span><strong>B2B Credibility:</strong> Wholesale suppliers and corporate clients prefer registered shopkeepers who issue official Tax Invoices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check_circle</span>
                <span><strong>Seamless Growth:</strong> Avoid last-minute rush penalties when your turnover reaches AED 375,000.</span>
              </li>
            </ul>

            <button
              onClick={() => setActiveModal(null)}
              className="mt-2 bg-secondary-container text-on-secondary-container py-3 rounded-xl font-bold font-label-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal 3: Document Checklist */}
      {activeModal === 'checklist' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-[24px] shadow-2xl relative z-10 p-6 flex flex-col gap-4 animate-slideUp">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
                Document Checklist
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {checklistItems.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    item.checked
                      ? 'bg-primary-container/30 border-primary/40 text-on-surface font-medium'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheck(item.id)}
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="mt-2 bg-primary text-on-primary py-3 rounded-xl font-bold font-label-md"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
