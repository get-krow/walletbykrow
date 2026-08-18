import React, { useEffect, useState } from 'react';
import { BarcodeRenderer } from './BarcodeRenderer';
import { ArrowLeft, Eye, Copy, Check, Trash2, Maximize2, Sun, Sparkles, SlidersHorizontal } from 'lucide-react';
import { getCardColor } from '../utils/storage';

export const BarcodeModal = ({ card, onClose, onDeleteCard, onUpdateCardFormat }) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(card?.barcodeType || 'AUTO');
  const [showFormatPicker, setShowFormatPicker] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!card) return null;

  const color = getCardColor(card.name);

  const handleCopyNumber = () => {
    if (card.codeNumber) {
      navigator.clipboard.writeText(card.codeNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFormatChange = (fmt) => {
    setSelectedFormat(fmt);
    if (onUpdateCardFormat) {
      onUpdateCardFormat(card.id, fmt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl text-slate-900 animate-fadeIn overflow-y-auto">
      {/* Top Navigation Bar */}
      <div className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-all text-sm font-semibold border border-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          <span>Back to Wallet</span>
        </button>

        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-800/80 p-1 rounded-xl">
              <span className="text-xs text-rose-200 px-2 font-medium">Delete?</span>
              <button
                onClick={() => onDeleteCard(card.id)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete Card"
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-700/50 active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Fullscreen Scan View */}
      <div className="flex-1 px-4 py-6 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        {/* Brightness Tip Banner */}
        <div className="w-full mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl p-3 flex items-center gap-3 text-xs">
          <Sun className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
          <div>
            <span className="font-bold text-amber-200">Store Scanner Tip:</span> Turn up your phone screen brightness so the cashier laser scans instantly.
          </div>
        </div>

        {/* Card Header Info */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative border border-slate-100">
          {/* Brand Tag */}
          <div className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-2 ${color.badge}`}>
            {card.name}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {card.name}
          </h2>

          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mt-1 mb-5">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#6344F5]" />
              Scanned {card.views || 1} {card.views === 1 ? 'time' : 'times'}
            </span>
          </div>

          {/* High Contrast Pure-White Barcode Container */}
          <div className="w-full bg-white p-4 sm:p-6 rounded-2xl border-2 border-slate-900 shadow-inner flex flex-col items-center justify-center min-h-[200px]">
            <BarcodeRenderer
              codeNumber={card.codeNumber}
              image={card.image}
              name={card.name}
              barcodeType={selectedFormat}
              isLarge={true}
              className="w-full"
            />
          </div>

          {/* Format Switcher Toggle (For Store Compatibility) */}
          {card.codeNumber && !card.image && (
            <div className="w-full mt-4">
              <button
                onClick={() => setShowFormatPicker(!showFormatPicker)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#6344F5]" />
                  <span>Format: <strong className="text-slate-900">{selectedFormat}</strong></span>
                </span>
                <span className="text-[#6344F5] font-semibold text-[11px]">
                  {showFormatPicker ? 'Hide Options' : 'Change Format'}
                </span>
              </button>

              {showFormatPicker && (
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: 'AUTO', label: '⚡ Auto-Detect' },
                    { id: 'CODE128', label: 'Code 128 (Standard)' },
                    { id: 'UPC', label: 'UPC-A (12 Digits)' },
                    { id: 'EAN13', label: 'EAN-13 (13 Digits)' },
                    { id: 'CODE39', label: 'Code 39 (Gym/Loyalty)' },
                    { id: 'EAN8', label: 'EAN-8 (8 Digits)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => handleFormatChange(fmt.id)}
                      className={`px-2.5 py-1.5 rounded-lg font-medium text-left transition-all ${
                        selectedFormat === fmt.id
                          ? 'bg-[#6344F5] text-white shadow-sm font-bold'
                          : 'bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Card Number & Copy */}
          {card.codeNumber && (
            <div className="mt-5 flex flex-col items-center space-y-2 w-full">
              <div className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400">
                Card Number
              </div>
              <div className="flex items-center justify-center gap-2 bg-slate-50 px-4 py-3 rounded-2xl w-full border border-slate-200">
                <span className="font-mono text-base sm:text-lg font-extrabold tracking-wider text-slate-900">
                  {card.codeNumber}
                </span>
                <button
                  onClick={handleCopyNumber}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#6344F5] hover:bg-white active:scale-95 transition-all shadow-sm"
                  title="Copy card number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && (
                <span className="text-xs text-emerald-600 font-semibold animate-fadeIn">
                  Copied to clipboard!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Scan Helper Footer */}
        <div className="mt-5 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Hold phone screen directly toward the scanner lens</span>
        </div>
      </div>
    </div>
  );
};
