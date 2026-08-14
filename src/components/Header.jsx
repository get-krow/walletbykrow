import React from 'react';
import logoSvg from '../assets/logo.svg';

export const Header = () => {
  return (
    <header className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 sm:px-6">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-krow-purple to-indigo-600 p-0.5 shadow-md shadow-krow-purple/20 flex items-center justify-center transform active:scale-95 transition-transform">
            <img src={logoSvg} alt="Wallet by Krow Logo" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
              wallet<span className="text-krow-purple font-semibold text-sm ml-1 px-1.5 py-0.5 rounded-full bg-krow-purple/10">by krow</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Membership Card Saver</p>
          </div>
        </div>
      </div>
    </header>
  );
};
