import React from 'react';
import { CreditCard, PlusCircle } from 'lucide-react';

export const LiquidGlassNav = ({ activeTab, onTabChange, onOpenAddModal }) => {
  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none pb-safe-bottom">
      <nav className="pointer-events-auto liquid-glass rounded-full px-3 py-2 flex items-center gap-2 max-w-xs w-full justify-around shadow-liquid-glass transition-all duration-300">
        {/* Tab 1: Membership Cards (Home) */}
        <button
          onClick={() => onTabChange('cards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all active:scale-95 ${
            activeTab === 'cards'
              ? 'bg-krow-purple text-white shadow-md shadow-krow-purple/30 ring-2 ring-krow-purple/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${activeTab === 'cards' ? 'text-white' : 'text-slate-500'}`} />
          <span>Membership Cards</span>
        </button>

        {/* Tab 2: Add Card */}
        <button
          onClick={() => {
            onTabChange('add');
            onOpenAddModal();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all active:scale-95 ${
            activeTab === 'add'
              ? 'bg-krow-purple text-white shadow-md shadow-krow-purple/30 ring-2 ring-krow-purple/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <PlusCircle className={`w-4 h-4 ${activeTab === 'add' ? 'text-white' : 'text-slate-500'}`} />
          <span>Add Card</span>
        </button>
      </nav>
    </div>
  );
};
