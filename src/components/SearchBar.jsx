import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({ value, onChange, onClear }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search cards by store name..."
        className="w-full pl-11 pr-11 py-3.5 bg-white text-slate-900 placeholder-slate-400 font-medium text-base rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6344F5]/30 focus:border-[#6344F5] transition-all"
        autoCapitalize="off"
        autoCorrect="off"
      />
      {value && (
        <button
          onClick={onClear}
          aria-label="Clear search query"
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 active:scale-95 transition-transform"
        >
          <div className="p-1 rounded-full bg-slate-100">
            <X className="w-4 h-4" />
          </div>
        </button>
      )}
    </div>
  );
};
