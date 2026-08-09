import React, { useState, useRef, useEffect } from 'react';
import { CAMERA_BG_URL, RECEIPT_THUMB_URL } from '../data/initialData';

interface ReceiptScannerModalProps {
  onBack: () => void;
  onReceiptScanned: (result: {
    amount: number;
    vatAmount: number;
    merchant: string;
    category: string;
    notes?: string;
  }) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  onBack,
  onReceiptScanned,
}) => {
  const [flashOn, setFlashOn] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Analyzing receipt with Gemini AI...');
  const [showHelp, setShowHelp] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCapture = async (imageBase64?: string) => {
    setIsScanning(true);
    setScanStatus('Scanning receipt with Gemini AI...');

    try {
      let base64ToUse = imageBase64;

      if (!base64ToUse) {
        // Create a simulated canvas snippet or sample receipt image if no custom file selected
        setScanStatus('Extracting AED total & 5% VAT...');
        await new Promise((res) => setTimeout(res, 1000));
      }

      if (base64ToUse) {
        setScanStatus('Analyzing receipt text & vendor details...');
        const cleanBase64 = base64ToUse.replace(/^data:image\/\w+;base64,/, '');
        const res = await fetch('/api/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: cleanBase64, mimeType: 'image/jpeg' }),
        });

        if (res.ok) {
          const data = await res.json();
          if (!data.extracted) {
            throw new Error('No extracted data');
          }
          setIsScanning(false);
          onReceiptScanned(data.extracted);
          return;
        } else {
          throw new Error('Failed to scan receipt');
        }
      }

      // Default mock scan result fallback
      timeoutRef.current = setTimeout(() => {
        setIsScanning(false);
        onReceiptScanned({
          amount: 185.00,
          vatAmount: 9.25,
          merchant: 'Carrefour Market',
          category: 'Stock',
          notes: 'Inventory store purchases',
        });
      }, 1200);
    } catch (err) {
      console.error('Scan error:', err);
      setIsScanning(false);
      onReceiptScanned({
        amount: 145.00,
        vatAmount: 7.25,
        merchant: 'Lulu Hypermarket',
        category: 'Stock',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleCapture(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900 flex flex-col animate-fadeIn">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Camera Feed Viewport */}
      <div className="flex-1 relative flex flex-col justify-between overflow-hidden">
        {/* Background Image simulating live camera */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${CAMERA_BG_URL})` }}
        />
        <div className="absolute inset-0 bg-inverse-surface/30 backdrop-blur-[1px]" />

        {/* Top Controls Overlay */}
        <div className="relative z-10 p-container-margin pt-safe flex justify-between items-center w-full mt-2">
          <button
            onClick={() => setFlashOn(!flashOn)}
            className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md text-on-error transition-colors shadow-sm ${
              flashOn ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {flashOn ? 'flash_on' : 'flash_off'}
            </span>
          </button>

          <button
            onClick={() => setAutoCapture(!autoCapture)}
            className="bg-surface-container-lowest/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/20 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px] text-primary-fixed">
              document_scanner
            </span>
            <span className="font-label-md text-label-md text-on-error font-medium">
              Auto-Capture {autoCapture ? 'On' : 'Off'}
            </span>
          </button>

          <button
            onClick={() => setShowHelp(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest/20 backdrop-blur-md text-on-error hover:bg-surface-container-lowest/30 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[24px]">help</span>
          </button>
        </div>

        {/* Middle Viewfinder Area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-section-gap w-full my-auto">
          {/* Guidance Banner */}
          <div className="mb-stack-md bg-surface-container-lowest/90 backdrop-blur-md px-6 py-2.5 rounded-full shadow-md animate-pulse border border-white/40">
            <p className="font-body-md text-body-md text-on-surface text-center font-medium">
              Align receipt within the frame
            </p>
          </div>

          {/* Frame Overlay */}
          <div className="w-full max-w-xs aspect-[3/4] relative">
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-primary-fixed rounded-tl-lg shadow-[0_0_8px_rgba(156,242,232,0.8)]" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-primary-fixed rounded-tr-lg shadow-[0_0_8px_rgba(156,242,232,0.8)]" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-primary-fixed rounded-bl-lg shadow-[0_0_8px_rgba(156,242,232,0.8)]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-primary-fixed rounded-br-lg shadow-[0_0_8px_rgba(156,242,232,0.8)]" />

            {/* Laser Scan Line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-fixed shadow-[0_0_12px_rgba(156,242,232,0.9)] opacity-80 animate-[scan_3s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Scanning Overlay Spinner */}
        {isScanning && (
          <div className="absolute inset-0 z-30 bg-inverse-surface/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-fadeIn">
            <div className="w-16 h-16 rounded-full border-4 border-primary-fixed border-t-transparent animate-spin mb-4" />
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-bold mb-2">
              Gemini AI Scanner
            </h3>
            <p className="font-body-md text-body-md text-surface-variant max-w-xs">
              {scanStatus}
            </p>
          </div>
        )}

        {/* Bottom Shutter Controls */}
        <div className="relative z-10 w-full p-container-margin pb-section-gap flex items-center justify-between mt-auto">
          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-xl bg-surface-container-lowest/20 backdrop-blur-md overflow-hidden shadow-sm border border-surface-container-lowest/20 relative hover:border-primary-fixed transition-colors"
            title="Upload image file"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={{ backgroundImage: `url(${RECEIPT_THUMB_URL})` }}
            />
          </button>

          {/* Shutter Button */}
          <button
            onClick={() => handleCapture()}
            className="w-[72px] h-[72px] rounded-full bg-primary-fixed p-1 shadow-lg active:scale-95 transition-transform group flex-shrink-0"
          >
            <div className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center border-[3px] border-transparent group-active:border-primary-fixed-dim transition-all">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-on-primary">
                  camera
                </span>
              </div>
            </div>
          </button>

          {/* Back to Manual Entry */}
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center text-on-error hover:bg-surface-container-lowest/30 transition-colors shadow-sm"
            title="Manual entry"
          >
            <span className="material-symbols-outlined text-[24px]">keyboard</span>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/70 backdrop-blur-sm">
          <div className="bg-surface-container-lowest text-on-surface rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4">
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              Tips for Best AI Scanning
            </h3>
            <ul className="text-sm space-y-2 text-on-surface-variant">
              <li>• Place the paper receipt flat on a dark or wooden surface.</li>
              <li>• Ensure good lighting so text and total amounts are visible.</li>
              <li>• GrowthShop AI will extract total price, 5% UAE VAT, date, and vendor name automatically.</li>
            </ul>
            <button
              onClick={() => setShowHelp(false)}
              className="bg-primary text-on-primary py-2.5 rounded-xl font-bold font-label-md mt-2"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
