import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Image } from 'lucide-react';

export const BarcodeRenderer = ({ codeNumber, image, name, isLarge = false, className = '' }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (codeNumber && svgRef.current && !image) {
      try {
        JsBarcode(svgRef.current, codeNumber, {
          format: 'CODE128',
          lineColor: '#000000',
          background: '#FFFFFF',
          width: isLarge ? 3 : 2,
          height: isLarge ? 110 : 45,
          displayValue: true,
          font: 'Plus Jakarta Sans',
          fontSize: isLarge ? 20 : 13,
          fontOptions: 'bold',
          margin: isLarge ? 16 : 8,
        });
      } catch (err) {
        console.warn('Barcode render error:', err);
      }
    }
  }, [codeNumber, image, isLarge]);

  if (image) {
    return (
      <div className={`flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white ${className}`}>
        <img
          src={image}
          alt={`Membership card for ${name}`}
          className={`object-contain w-full ${isLarge ? 'max-h-[350px] shadow-sm' : 'max-h-[80px]'}`}
        />
      </div>
    );
  }

  if (codeNumber) {
    return (
      <div className={`flex flex-col items-center justify-center bg-white p-2 rounded-xl border border-slate-200/80 ${className}`}>
        <svg ref={svgRef} className="max-w-full h-auto" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 p-4 ${className}`}>
      <Image className="w-8 h-8 opacity-40" />
    </div>
  );
};
