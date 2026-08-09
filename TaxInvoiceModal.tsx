import React from 'react';
import { BusinessProfile, Transaction } from '../types';

interface TaxInvoiceModalProps {
  transaction: Transaction;
  profile: BusinessProfile;
  onClose: () => void;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({
  transaction,
  profile,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isSale = transaction.type === 'sale';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn print:p-0 print:bg-white">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-[24px] shadow-2xl relative z-10 p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto border border-slate-200 print:shadow-none print:w-full print:max-w-none print:border-none print:rounded-none">
        
        {/* Top Controls (Hidden when printing) */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 print:hidden">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px] text-teal-700">verified</span>
            FTA Compliant Tax Invoice
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Invoice Header */}
        <div className="text-center border-b border-slate-200 pb-4">
          <h2 className="font-bold text-xl text-slate-900">{profile.shopName}</h2>
          {profile.shopNameArabic && (
            <p className="text-sm font-semibold text-slate-700 font-sans mt-0.5 dir-rtl">
              {profile.shopNameArabic}
            </p>
          )}
          <p className="text-xs text-slate-600 mt-1">{profile.address}</p>
          <p className="text-xs text-slate-600">Tel: {profile.phone}</p>

          <div className="mt-3 inline-block bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            <p className="text-xs font-bold text-teal-800 font-mono">
              TRN: {profile.trn}
            </p>
          </div>

          <h3 className="font-black text-lg text-slate-900 mt-3 uppercase tracking-wide">
            {isSale ? 'TAX INVOICE / فاتورة ضريبية' : 'EXPENSE RECEIPT'}
          </h3>
        </div>

        {/* Invoice Meta */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Invoice No:</span>
            <span className="font-bold font-mono text-slate-800">{transaction.invoiceNumber || transaction.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Date & Time:</span>
            <span className="font-semibold text-slate-800">{transaction.date}</span>
          </div>
          {transaction.customerName && (
            <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-0.5">
              <span className="text-slate-500 font-medium">Customer:</span>
              <span className="font-bold text-slate-900">{transaction.customerName}</span>
            </div>
          )}
          {transaction.customerPhone && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Phone:</span>
              <span className="font-mono text-slate-800">{transaction.customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-1.5">
            <span className="text-slate-500 font-medium">Payment Mode:</span>
            <span className="font-bold text-teal-700 uppercase">{transaction.paymentMethod}</span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
              <tr>
                <th className="p-2">Item</th>
                <th className="p-2 text-center">Qty</th>
                <th className="p-2 text-right">Price</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaction.items && transaction.items.length > 0 ? (
                transaction.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-medium text-slate-800">
                      {item.name}
                    </td>
                    <td className="p-2 text-center text-slate-600">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="p-2 text-right text-slate-600">
                      {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="p-2 text-right font-bold text-slate-900">
                      {item.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-slate-600 font-medium">
                    {transaction.title}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs flex flex-col gap-2">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal (Excl. VAT):</span>
            <span className="font-semibold text-slate-800">AED {transaction.subtotal.toFixed(2)}</span>
          </div>

          {transaction.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Discount Applied:</span>
              <span>- AED {transaction.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>UAE 5% VAT:</span>
            <span className="font-semibold text-slate-800">AED {transaction.vatAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>NET AMOUNT PAYABLE:</span>
            <span className="text-teal-700">AED {transaction.amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer info & QR Placeholder */}
        <div className="text-center pt-2 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-300 flex items-center justify-center p-1 mb-2">
            <span className="material-symbols-outlined text-[36px] text-slate-600">qr_code_2</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Thank you for shopping at {profile.shopName}!
          </p>
          <p className="text-[10px] text-slate-400">Powered by GrowthShop POS & VAT Engine</p>
        </div>

        {/* Print & Share Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-100 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:bg-slate-900"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print / Save PDF
          </button>

          <button
            onClick={() => {
              const shareText = `Tax Invoice ${transaction.invoiceNumber} from ${profile.shopName}\nTotal: AED ${transaction.amount.toFixed(2)} (Incl 5% VAT)\nThank you!`;
              window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
            }}
            className="bg-[#25D366] text-white px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-emerald-600"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
            WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
};
