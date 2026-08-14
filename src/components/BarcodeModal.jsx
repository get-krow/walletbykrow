import React, { useEffect, useState } from 'react';
import { BarcodeRenderer } from './BarcodeRenderer';
import { ArrowLeft, Eye, Copy, Check, Trash2, Maximize2 } from 'lucide-react';
import { getCardColor } from '../utils/storage';

export const BarcodeModal = ({ card, onClose, onDeleteCard }) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    // Disable background scroll when modal open
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md text-slate-900 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-4 sm:px-6 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-all text-sm font-semibold"
        >
          <ArrowLeft className="w-5 h-5 text-krow-purple-light" />
          <span>Back to Cards</span>
        </button>

        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-800 p-1 rounded-xl">
              <span className="text-xs text-rose-200 px-2 font-medium">Delete?</span>
              <button
                onClick={() => onDeleteCard(card.id)}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete Card"
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Fullscreen Scan Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
        {/* Card Header Info */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-scan-modal flex flex-col items-center text-center">
          {/* Brand Badge */}
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-3 ${color.badge}`}>
            {card.name}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {card.name}
          </h2>

          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mt-1 mb-6">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-krow-purple" />
              Scanned {card.views || 1} {card.views === 1 ? 'time' : 'times'}
            </span>
          </div>

          {/* High Contrast Barcode Container for Easy Scanning */}
          <div className="w-full bg-white p-4 sm:p-6 rounded-2xl border-2 border-slate-900 shadow-inner flex flex-col items-center justify-center min-h-[180px]">
            <BarcodeRenderer
              codeNumber={card.codeNumber}
              image={card.image}
              name={card.name}
              isLarge={true}
              className="w-full"
            />
          </div>

          {/* Card Number display & Copy Button */}
          {card.codeNumber && (
            <div className="mt-6 flex flex-col items-center space-y-2 w-full">
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Card Number
              </div>
              <div className="flex items-center justify-center gap-2 bg-slate-100 px-4 py-2.5 rounded-2xl w-full border border-slate-200">
                <span className="font-mono text-base font-extrabold tracking-wider text-slate-800">
                  {card.codeNumber}
                </span>
                <button
                  onClick={handleCopyNumber}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-krow-purple active:scale-95 transition-all"
                  title="Copy number"
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

        {/* Scan Helper Tip */}
        <div className="mt-6 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
          <Maximize2 className="w-4 h-4 text-krow-purple-light" />
          <span>Hold phone screen up to store scanner</span>
        </div>
      </div>
    </div>
  );
};
