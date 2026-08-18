import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Image, AlertCircle } from 'lucide-react';

export const BarcodeRenderer = ({
  codeNumber,
  image,
  name,
  barcodeType = 'AUTO',
  isLarge = false,
  className = '',
}) => {
  const svgRef = useRef(null);
  const [renderError, setRenderError] = useState(false);
  const [usedFormat, setUsedFormat] = useState('CODE128');

  useEffect(() => {
    if (!codeNumber || !svgRef.current || image) return;

    setRenderError(false);
    const cleanNum = codeNumber.trim();
    const isDigitsOnly = /^\d+$/.test(cleanNum);

    // Determine target format
    let targetFormats = [];

    if (barcodeType && barcodeType !== 'AUTO') {
      targetFormats = [barcodeType, 'CODE128'];
    } else {
      // Auto-detect based on code length & characters
      if (isDigitsOnly && cleanNum.length === 12) {
        targetFormats = ['UPC', 'CODE128'];
      } else if (isDigitsOnly && cleanNum.length === 13) {
        targetFormats = ['EAN13', 'CODE128'];
      } else if (isDigitsOnly && cleanNum.length === 8) {
        targetFormats = ['EAN8', 'CODE39', 'CODE128'];
      } else {
        targetFormats = ['CODE128', 'CODE39'];
      }
    }

    let success = false;

    for (const fmt of targetFormats) {
      try {
        JsBarcode(svgRef.current, cleanNum, {
          format: fmt,
          lineColor: '#000000',
          background: '#FFFFFF',
          width: isLarge ? 3 : 2,
          height: isLarge ? 120 : 48,
          displayValue: true,
          font: 'Plus Jakarta Sans, sans-serif',
          fontSize: isLarge ? 22 : 13,
          fontOptions: 'bold',
          margin: isLarge ? 18 : 8,
          flat: true,
        });
        setUsedFormat(fmt);
        success = true;
        break;
      } catch (err) {
        // Try next fallback format
      }
    }

    if (!success) {
      setRenderError(true);
    }
  }, [codeNumber, image, barcodeType, isLarge]);

  if (image) {
    return (
      <div className={`flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white ${className}`}>
        <img
          src={image}
          alt={`Card photo for ${name}`}
          className={`object-contain w-full ${isLarge ? 'max-h-[360px] shadow-sm' : 'max-h-[85px]'}`}
        />
      </div>
    );
  }

  if (codeNumber) {
    return (
      <div className={`flex flex-col items-center justify-center bg-white p-2 rounded-xl border border-slate-200/80 ${className}`}>
        <svg ref={svgRef} className="max-w-full h-auto" />
        {renderError && (
          <div className="flex items-center gap-1.5 text-rose-500 text-xs mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Could not render barcode for format. Please check number.</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 p-4 ${className}`}>
      <Image className="w-8 h-8 opacity-40" />
    </div>
  );
};
