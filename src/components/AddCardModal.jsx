import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, X, Plus, Hash, SlidersHorizontal } from 'lucide-react';
import confetti from 'canvas-confetti';

const QUICK_SUGGESTIONS = [
  'Costco', 'Target', 'CVS', 'Walgreens', 'Kroger', 'Gym', 'Library', 'AAA', 'REI', 'Sephora'
];

export const AddCardModal = ({ isOpen, onClose, onSaveCard }) => {
  const [name, setName] = useState('');
  const [codeNumber, setCodeNumber] = useState('');
  const [barcodeType, setBarcodeType] = useState('AUTO');
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Image file is too large (max 8MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name for the card (e.g. Costco)');
      return;
    }

    if (!codeNumber.trim() && !imagePreview) {
      setError('Please either type the card number OR upload a photo of the barcode.');
      return;
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6344F5', '#8169F7', '#EC4899']
      });
    } catch (err) {
      // Ignore confetti errors
    }

    onSaveCard({
      name: name.trim(),
      codeNumber: codeNumber.trim(),
      barcodeType: barcodeType,
      image: imagePreview,
    });

    // Reset form
    setName('');
    setCodeNumber('');
    setBarcodeType('AUTO');
    setImagePreview(null);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6344F5]/10 flex items-center justify-center text-[#6344F5] font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Add Membership Card</h2>
              <p className="text-xs text-slate-500">Save a new barcode to your wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl animate-fadeIn">
              {error}
            </div>
          )}

          {/* Step 1: Card Name / Keyword */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              1. Card Name / Store Keyword <span className="text-[#6344F5]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Costco, Target, Gym..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6344F5]/30 focus:border-[#6344F5] text-base transition-all"
                autoFocus
              />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Quick picks:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setName(chip);
                      if (error) setError('');
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all active:scale-95 ${
                      name === chip
                        ? 'bg-[#6344F5] text-white border-[#6344F5]'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Barcode Number & Format */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              2. Add Barcode Number or Photo
            </label>

            {/* Option A: Type Barcode Number */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-[#6344F5]" />
                Option A: Type Card Barcode Number
              </span>
              <input
                type="text"
                value={codeNumber}
                onChange={(e) => {
                  setCodeNumber(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. 719283746102"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6344F5]/30 focus:border-[#6344F5] text-sm transition-all"
              />

              {/* Optional Barcode Format Selector */}
              {codeNumber.trim() && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <SlidersHorizontal className="w-3 h-3 text-[#6344F5]" /> Format:
                  </span>
                  <select
                    value={barcodeType}
                    onChange={(e) => setBarcodeType(e.target.value)}
                    className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6344F5]/20"
                  >
                    <option value="AUTO">⚡ Auto-Detect (Recommended)</option>
                    <option value="CODE128">Code 128 (Standard)</option>
                    <option value="UPC">UPC-A (12 Digits Retail)</option>
                    <option value="EAN13">EAN-13 (13 Digits Retail)</option>
                    <option value="CODE39">Code 39 (Gym/Loyalty)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[11px] font-bold text-slate-400 uppercase">or</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Option B: Photo Upload */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-[#6344F5]" />
                Option B: Upload Photo of Card
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#6344F5] p-2 bg-slate-50 flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Card preview"
                    className="max-h-36 object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="mt-2 text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Remove photo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-[#6344F5] rounded-2xl bg-slate-50/80 hover:bg-[#6344F5]/5 flex flex-col items-center justify-center text-slate-500 hover:text-[#6344F5] transition-all active:scale-[0.99]"
                >
                  <Upload className="w-6 h-6 mb-1 text-slate-400 group-hover:text-[#6344F5]" />
                  <span className="text-xs font-bold">Tap to select photo or snap with camera</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP</span>
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-[#6344F5] hover:bg-[#5233E0] text-white font-extrabold text-base rounded-2xl shadow-xl shadow-[#6344F5]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Done / Save Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
