import React from 'react';
import { ArrowUpDown, Clock, Eye, SortAsc, SortDesc } from 'lucide-react';

export const SORT_OPTIONS = [
  { id: 'recently', label: 'Recent', fullLabel: 'Recently uploaded', icon: Clock },
  { id: 'mostViewed', label: 'Most Viewed', fullLabel: 'Most viewed', icon: Eye },
  { id: 'az', label: 'A–Z', fullLabel: 'Keyword A–Z', icon: SortAsc },
  { id: 'za', label: 'Z–A', fullLabel: 'Keyword Z–A', icon: SortDesc },
];

export const SortFilter = ({ activeSort, onSelectSort, cardCount = 0 }) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#6344F5]" />
          Sort Cards ({cardCount})
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {SORT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeSort === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelectSort(opt.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-[#6344F5] text-white shadow-md shadow-[#6344F5]/25 ring-2 ring-[#6344F5]/20'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
