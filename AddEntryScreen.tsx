import React, { useState } from 'react';
import { ExpenseCategory, SaleCategory, Transaction, TransactionType } from '../types';

interface AddEntryScreenProps {
  initialType?: TransactionType;
  onSaveTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onOpenScanner: () => void;
  attachedReceipt?: { amount?: number; merchant?: string; vatAmount?: number; category?: string };
}

export const AddEntryScreen: React.FC<AddEntryScreenProps> = ({
  initialType = 'expense',
  onSaveTransaction,
  onOpenScanner,
  attachedReceipt,
}) => {
  const [entryType, setEntryType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>(
    attachedReceipt?.amount ? attachedReceipt.amount.toFixed(2) : '0.00'
  );
  const [selectedExpenseCat, setSelectedExpenseCat] = useState<ExpenseCategory>(
    (attachedReceipt?.category as ExpenseCategory) || 'Stock'
  );
  const [selectedSaleCat, setSelectedSaleCat] = useState<SaleCategory>('Grocery');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [receiptAttached, setReceiptAttached] = useState<boolean>(Boolean(attachedReceipt));

  const numericValue = parseFloat(amountStr) || 0;
  const vatAmount = (numericValue * 0.05).toFixed(2); // 5% UAE VAT

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      if (amountStr.length <= 1) {
        setAmountStr('0.00');
      } else {
        const next = amountStr.slice(0, -1);
        setAmountStr(next === '' || next === '.' ? '0.00' : next);
      }
      return;
    }

    if (val === '.') {
      if (amountStr.includes('.')) return;
      setAmountStr(amountStr === '0.00' ? '0.' : amountStr + '.');
      return;
    }

    if (amountStr === '0.00' || amountStr === '0') {
      setAmountStr(val);
    } else {
      // Limit decimals to 2 places
      if (amountStr.includes('.')) {
        const parts = amountStr.split('.');
        if (parts[1] && parts[1].length >= 2) return;
      }
      if (amountStr.length < 9) {
        setAmountStr(amountStr + val);
      }
    }
  };

  const handleSave = () => {
    if (numericValue <= 0 || isSaving) return;

    setIsSaving(true);

    const isExpense = entryType === 'expense';
    const catName = isExpense ? selectedExpenseCat : selectedSaleCat;
    const title = isExpense
      ? `${selectedExpenseCat} Expense`
      : `${selectedSaleCat} Sale`;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTimeout(() => {
      onSaveTransaction({
        type: entryType,
        title: attachedReceipt?.merchant ? attachedReceipt.merchant : title,
        amount: numericValue,
        vatAmount: parseFloat(vatAmount),
        category: catName,
        date: `Today, ${timeFormatted}`,
        rawDate: now.toISOString(),
        time: timeFormatted,
        merchant: attachedReceipt?.merchant,
        notes: attachedReceipt ? `Receipt attached for ${catName}` : undefined,
      });

      setIsSaving(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setAmountStr('0.00');
        setReceiptAttached(false);
      }, 1200);
    }, 600);
  };

  const expenseCategories: { name: ExpenseCategory; icon: string }[] = [
    { name: 'Stock', icon: 'storefront' },
    { name: 'Rent', icon: 'home_work' },
    { name: 'Salary', icon: 'payments' },
    { name: 'Electricity', icon: 'bolt' },
    { name: 'Other', icon: 'more_horiz' },
  ];

  const saleCategories: { name: SaleCategory; icon: string }[] = [
    { name: 'Grocery', icon: 'shopping_basket' },
    { name: 'Beverages', icon: 'local_cafe' },
    { name: 'Dairy & Fresh', icon: 'egg' },
    { name: 'Snacks & Sweets', icon: 'cookie' },
    { name: 'Household', icon: 'cleaning_services' },
    { name: 'Personal Care', icon: 'sanitizer' },
    { name: 'Other', icon: 'category' },
  ];

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] pb-24 bg-background relative overflow-hidden animate-fadeIn">
      {/* Mode Switcher Header */}
      <div className="px-container-margin pt-stack-sm pb-2 flex justify-between items-center opacity-90 mt-2">
        <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant/30">
          <button
            onClick={() => setEntryType('expense')}
            className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-all ${
              entryType === 'expense'
                ? 'bg-error text-on-error shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            ↓ Expense
          </button>
          <button
            onClick={() => setEntryType('sale')}
            className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-all ${
              entryType === 'sale'
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            ↑ Sale
          </button>
        </div>

        <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-3 py-1 rounded-full shadow-sm border border-outline-variant/20">
          Today
        </span>
      </div>

      {/* Amount Display Area */}
      <div className="px-container-margin pt-4 pb-6 flex flex-col items-center justify-center relative">
        <div
          className={`absolute inset-0 rounded-b-[40px] -z-10 opacity-40 transition-colors ${
            entryType === 'expense'
              ? 'bg-gradient-to-b from-error/10 to-transparent'
              : 'bg-gradient-to-b from-primary/10 to-transparent'
          }`}
        />
        <span className="font-label-md text-label-md text-on-surface-variant mb-1 font-medium uppercase tracking-wider">
          {entryType === 'expense' ? 'New Expense Total' : 'New Sale Total'}
        </span>

        <div className="flex items-baseline justify-center gap-2">
          <span className="font-headline-lg-mobile text-headline-lg-mobile text-outline-variant font-semibold">
            AED
          </span>
          <span className="font-display-lg text-display-lg text-on-background font-bold tracking-tight">
            {amountStr}
          </span>
        </div>

        {numericValue > 0 && (
          <div className="mt-2 px-3 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container font-label-sm text-label-sm flex items-center gap-1 animate-fadeIn border border-secondary/20">
            <span className="material-symbols-outlined text-[14px]">receipt</span>
            Includes <span className="font-bold">AED {vatAmount}</span> VAT (5%)
          </div>
        )}
      </div>

      {/* Category Selection */}
      <div className="px-container-margin mb-6">
        <h3 className="font-label-md text-label-md text-on-surface-variant mb-2 ml-1 font-medium">
          What was it for?
        </h3>

        {entryType === 'expense' ? (
          <div className="flex flex-wrap gap-stack-sm">
            {expenseCategories.map((cat) => {
              const isSelected = selectedExpenseCat === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedExpenseCat(cat.name)}
                  className={`px-4 py-3 rounded-xl shadow-sm transition-all flex items-center gap-2 text-body-md font-body-md ${
                    isSelected
                      ? 'bg-primary-container text-on-primary-container ring-2 ring-primary shadow-md font-semibold'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isSelected ? 'text-primary-fixed' : 'text-primary'
                    }`}
                  >
                    {cat.icon}
                  </span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {saleCategories.map((cat) => {
              const isSelected = selectedSaleCat === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedSaleCat(cat.name)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl shadow-sm transition-all ${
                    isSelected
                      ? 'bg-primary/10 ring-2 ring-primary text-primary font-semibold'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-variant text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                  </div>
                  <span className="font-label-sm text-label-sm">{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Attach Receipt Card (Only shown for Expense) */}
      {entryType === 'expense' && (
        <div className="px-container-margin mb-6">
          <button
            onClick={() => {
              if (receiptAttached) {
                setReceiptAttached(false);
              } else {
                onOpenScanner();
              }
            }}
            className={`w-full p-card-padding rounded-[20px] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] ${
              receiptAttached
                ? 'bg-secondary-container text-on-secondary-container border-secondary'
                : 'bg-secondary-container/30 text-on-secondary-container border-secondary/30 hover:border-secondary/60'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                receiptAttached ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {receiptAttached ? 'check' : 'photo_camera'}
              </span>
            </div>
            <span className="font-headline-lg-mobile text-headline-lg-mobile font-semibold">
              {receiptAttached ? 'Receipt Attached' : 'Attach Receipt'}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant text-center opacity-80 text-sm">
              {receiptAttached
                ? 'Receipt auto-analyzed by AI. Tap to replace.'
                : 'Tap to snap or upload a receipt photo for AI scanning'}
            </span>
          </button>
        </div>
      )}

      {/* Numeric Keypad */}
      <div className="bg-surface pb-safe rounded-t-[32px] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] relative z-10 pt-stack-md mt-auto border-t border-outline-variant/30">
        <div className="w-12 h-1.5 bg-surface-variant rounded-full mx-auto mb-stack-md" />
        <div className="grid grid-cols-3 gap-2 px-container-margin mb-stack-md">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeypadPress(num)}
              className="keypad-btn h-14 bg-surface-container-lowest rounded-xl font-headline-lg-mobile text-headline-lg-mobile text-on-surface shadow-sm active:bg-surface-variant transition-colors hover:bg-surface-container-low font-semibold flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleKeypadPress('backspace')}
            className="keypad-btn h-14 bg-surface-container-lowest rounded-xl flex items-center justify-center text-outline shadow-sm active:bg-surface-variant transition-colors hover:bg-surface-container-low"
            aria-label="Backspace"
          >
            <span className="material-symbols-outlined text-[24px]">backspace</span>
          </button>
        </div>

        <div className="px-container-margin pb-stack-md">
          <button
            onClick={handleSave}
            disabled={numericValue <= 0 || isSaving}
            className={`w-full h-14 rounded-xl font-headline-lg-mobile text-headline-lg-mobile shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${
              entryType === 'expense'
                ? 'bg-primary text-on-primary hover:bg-surface-tint'
                : 'bg-primary text-on-primary hover:bg-surface-tint'
            }`}
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[24px] animate-spin">refresh</span>
                Saving...
              </>
            ) : isSuccess ? (
              <>
                <span className="material-symbols-outlined text-[24px]">done_all</span>
                Saved Successfully!
              </>
            ) : (
              <>
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                Save {entryType === 'expense' ? 'Expense' : 'Sale'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
